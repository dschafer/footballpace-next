import pandas as pd

from dagster import (
    AssetExecutionContext,
    AssetIn,
    MetadataValue,
    MultiPartitionKey,
    Output,
    asset,
)
from dagster_pandas import PandasColumn, create_dagster_pandas_dataframe_type
from io import StringIO

from ..resources import FootballDataResource, VercelPostgresResource
from ..partitions import all_seasons_leagues_partition


@asset(
    group_name="football_data_co_uk",
    compute_kind="API",
    partitions_def=all_seasons_leagues_partition,
    code_version="v1",
)
def match_results_csv(
    context: AssetExecutionContext, football_data: FootballDataResource
) -> Output[bytes]:
    """Scrapes the latest CSV results from football-data.co.uk.

    Business logic here should be kept to an absolute minimum, so that the
    results of this stage of the pipeline can be cached.

    API Docs: https://www.football-data.co.uk/notes.txt
    """
    assert isinstance(context.partition_key, MultiPartitionKey)
    season = int(context.partition_key.keys_by_dimension["season"])
    league = context.partition_key.keys_by_dimension["league"]

    results_data = football_data.request(season, league).content

    return Output(results_data, metadata={"size": len(results_data)})


csv_dtypes = {
    "Div": "string",
    "Date": "string",  # This gets converted to Date later
    "HomeTeam": "string",
    "AwayTeam": "string",
    "FTHG": "UInt8",
    "FTAG": "UInt8",
    "FTR": "category",
}

MatchResultsDataFrame = create_dagster_pandas_dataframe_type(
    name="MatchResultsDataFrame",
    columns=[
        PandasColumn.string_column("Div"),
        PandasColumn.integer_column("Season"),
        PandasColumn.datetime_column("Date"),
        PandasColumn.string_column("HomeTeam"),
        PandasColumn.string_column("AwayTeam"),
        PandasColumn.integer_column("FTHG", min_value=0),
        PandasColumn.integer_column("FTAG", min_value=0),
        PandasColumn.categorical_column("FTR", categories={"H", "A", "D"}),
    ],
    metadata_fn=lambda df: {
        "num_rows": len(df),
        "preview": MetadataValue.md(df.head().to_markdown()),
    },
)


@asset(
    group_name="football_data_co_uk",
    compute_kind="Pandas",
    partitions_def=all_seasons_leagues_partition,
    code_version="v1",
    dagster_type=MatchResultsDataFrame,
)
def match_results_df(
    context: AssetExecutionContext, match_results_csv: bytes
) -> Output[pd.DataFrame]:
    """Convert the CSV from football-data.co.uk into a Pandas DataFrame.

    API Docs: https://www.football-data.co.uk/notes.txt
    """
    assert isinstance(context.partition_key, MultiPartitionKey)
    season = int(context.partition_key.keys_by_dimension["season"])

    parsable_string = "\n".join(
        [str(s, encoding="utf-8") for s in match_results_csv.splitlines()]
    )
    df = pd.read_csv(
        StringIO(parsable_string),
        header=0,
        usecols=list(csv_dtypes.keys()),
        dtype=csv_dtypes,
    ).dropna(how="all")

    if len(df["Date"][0]) == 8:
        # Dates like 31/08/99
        df["Date"] = pd.to_datetime(df["Date"], format="%d/%m/%y")
    else:
        # Dates like 31/08/2003
        df["Date"] = pd.to_datetime(df["Date"], format="%d/%m/%Y")

    df["Season"] = season

    return Output(
        df,
        metadata={
            "num_rows": len(df),
            "preview": MetadataValue.md(df.head().to_markdown()),
        },
    )


@asset(
    group_name="football_data_co_uk",
    compute_kind="Postgres",
    partitions_def=all_seasons_leagues_partition,
    code_version="v1",
    ins={"match_results_df": AssetIn(dagster_type=MatchResultsDataFrame)},
)
def match_results_postgres(
    match_results_df: pd.DataFrame, vercel_postgres: VercelPostgresResource
) -> Output[None]:
    """Ensure all rows from the football-data.co.uk DataFrame are in Postgres."""
    rows = [
        {str(col): val for col, val in row.items()}
        for row in match_results_df.to_dict("records")
    ]
    rowcount = vercel_postgres.upsert_matches(rows)
    return Output(None, metadata={"rowcount": rowcount})
