from io import StringIO

import dagster as dg
import dagster_pandas as dg_pd
import pandas as pd

from footballpace.canonical import canonical_name
from footballpace.dataversion import bytes_data_version, eager_respecting_data_version
from footballpace.partitions import all_seasons_leagues_partition
from footballpace.defs.resources.footballdata import FootballDataResource
from footballpace.defs.resources.vercel import (
    MatchResultsTableSchema,
    VercelPostgresResource,
)


@dg.asset(
    group_name="MatchResults",
    kinds={"CSV"},
    partitions_def=all_seasons_leagues_partition,
    code_version="v1",
    output_required=False,
)
def match_results_csv(
    context: dg.AssetExecutionContext, football_data: FootballDataResource
) -> dg.Output[bytes]:
    """Scrapes the latest CSV results from football-data.co.uk.

    Business logic here should be kept to an absolute minimum, so that the
    results of this stage of the pipeline can be cached.

    API Docs: https://www.football-data.co.uk/notes.txt
    """
    assert isinstance(context.partition_key, dg.MultiPartitionKey)
    season = int(context.partition_key.keys_by_dimension["season"])
    league = context.partition_key.keys_by_dimension["league"]

    results_data = football_data.request(season, league).content

    data_version = bytes_data_version(results_data)

    return dg.Output(
        results_data,
        metadata={
            "size": len(results_data),
            "dagster/uri": football_data.url(season, league),
        },
        data_version=dg.DataVersion(data_version),
    )


csv_dtypes = {
    "Div": "string",
    "Date": "string",  # This gets converted to Date later
    "HomeTeam": "string",
    "AwayTeam": "string",
    "FTHG": "UInt8",
    "FTAG": "UInt8",
    "FTR": "category",
}

MatchResultsDataFrame = dg_pd.create_dagster_pandas_dataframe_type(
    name="MatchResultsDataFrame",
    columns=[
        dg_pd.PandasColumn.string_column("Div"),
        dg_pd.PandasColumn.integer_column("Season"),
        dg_pd.PandasColumn.datetime_column("Date"),
        dg_pd.PandasColumn.string_column("HomeTeam"),
        dg_pd.PandasColumn.string_column("AwayTeam"),
        dg_pd.PandasColumn.integer_column("FTHG", min_value=0),
        dg_pd.PandasColumn.integer_column("FTAG", min_value=0),
        dg_pd.PandasColumn.categorical_column("FTR", categories={"H", "A", "D"}),
    ],
    metadata_fn=lambda df: {
        "dagster/partition_row_count": len(df),
        "preview": dg.MetadataValue.md(df.head().to_markdown()),
    },
)


@dg.asset(
    group_name="MatchResults",
    kinds={"Pandas"},
    partitions_def=all_seasons_leagues_partition,
    code_version="v2",
    dagster_type=MatchResultsDataFrame,
    automation_condition=eager_respecting_data_version,
)
def match_results_df(
    context: dg.AssetExecutionContext, match_results_csv: bytes
) -> dg.Output[pd.DataFrame]:
    """Convert the CSV from football-data.co.uk into a Pandas DataFrame.

    API Docs: https://www.football-data.co.uk/notes.txt
    """
    assert isinstance(context.partition_key, dg.MultiPartitionKey)
    season = int(context.partition_key.keys_by_dimension["season"])

    # The encoding here is weird. Most of them are Windows-1252, but some new ones
    # are utf-8-sig
    lines = [str(s, encoding="Windows-1252") for s in match_results_csv.splitlines()]
    if lines[0][0:3] != "Div":
        # Okay, this didn't parse. Must be a new file with utf-8-sig encoding
        context.log.info("Detected utf-8-sig encoding")
        lines = [str(s, encoding="utf-8-sig") for s in match_results_csv.splitlines()]
    else:
        context.log.info("Detected Windows-1252 encoding")

    if lines[0][0:3] != "Div":
        raise dg.Failure(
            description=f"CSV file was not valid: could not get first line to start with Div, found {lines[0][0:3]} instead"
        )

    parsable_string = "\n".join(lines)
    df = pd.read_csv(
        StringIO(parsable_string),
        header=0,
        usecols=list(csv_dtypes.keys()),
        dtype=csv_dtypes,  # type: ignore This appears to be a false positive
    ).dropna(how="all")

    df["HomeTeam"] = df["HomeTeam"].map(canonical_name)
    df["AwayTeam"] = df["AwayTeam"].map(canonical_name)

    if len(df["Date"][0]) == 8:
        # Dates like 31/08/99
        df["Date"] = pd.to_datetime(df["Date"], format="%d/%m/%y")
    else:
        # Dates like 31/08/2003
        df["Date"] = pd.to_datetime(df["Date"], format="%d/%m/%Y")

    df["Season"] = season
    metadata_teams = (
        pd.concat([df["HomeTeam"], df["AwayTeam"]]).sort_values().unique().tolist()
    )

    return dg.Output(
        df,
        metadata={
            "dagster/partition_row_count": len(df),
            "preview": dg.MetadataValue.md(df.head().to_markdown()),
            "most_recent_match_date": dg.MetadataValue.text(str(max(df["Date"]))),
            "teams": metadata_teams,
        },
    )


@dg.asset(
    group_name="MatchResults",
    kinds={"Postgres"},
    partitions_def=all_seasons_leagues_partition,
    code_version="v1",
    ins={"match_results_df": dg.AssetIn(dagster_type=MatchResultsDataFrame)},
    metadata={
        "dagster/column_schema": MatchResultsTableSchema,
        "dagster/table_name": "matches",
    },
    tags={"db_write": "true"},
    automation_condition=eager_respecting_data_version,
)
def match_results_postgres(
    match_results_df: pd.DataFrame, vercel_postgres: VercelPostgresResource
) -> dg.Output[None]:
    """Writes the match results from football-data.co.uk into Postgres."""
    rows = [
        {str(col): val for col, val in row.items()}
        for row in match_results_df.to_dict("records")
    ]
    rowcount = vercel_postgres.upsert_matches(rows)
    return dg.Output(None, metadata={"dagster/partition_row_count": rowcount})
