import pandas as pd

from dagster import (
    AssetExecutionContext,
    AssetIn,
    Dict,
    MetadataValue,
    MultiPartitionKey,
    Output,
    asset,
)
from dagster_pandas import PandasColumn, create_dagster_pandas_dataframe_type

from footballpace.assets.match_with_finish import MatchResultsWithFinishDataFrame
from footballpace.resources import VercelPostgresResource
from footballpace.partitions import (
    all_predicted_seasons_leagues_partition,
    predicted_seasons_of_league_mapping,
)

PaceSheetEntryDataFrame = create_dagster_pandas_dataframe_type(
    name="PaceSheetEntry",
    columns=[
        PandasColumn.string_column("Div"),
        PandasColumn.integer_column("Season"),
        PandasColumn.integer_column("TeamFinish", min_value=1),
        PandasColumn.integer_column("OpponentFinish", min_value=1),
        PandasColumn.boolean_column("Home"),
        PandasColumn.float_column("ExpectedPoints", min_value=0, max_value=3),
    ],
    metadata_fn=lambda df: {
        "num_rows": len(df),
        "preview": MetadataValue.md(df.head().to_markdown()),
    },
)

HOME_POINTS = {"H": 3, "D": 1, "A": 0}
AWAY_POINTS = {"A": 3, "D": 1, "H": 0}


@asset(
    group_name="Transform",
    compute_kind="Pandas",
    partitions_def=all_predicted_seasons_leagues_partition,
    code_version="v1",
    dagster_type=PaceSheetEntryDataFrame,
    ins={
        "match_results_with_finish_df": AssetIn(
            dagster_type=Dict[str, MatchResultsWithFinishDataFrame],
            partition_mapping=predicted_seasons_of_league_mapping,
        ),
    },
)
def pace_sheet_entries_df(
    context: AssetExecutionContext,
    match_results_with_finish_df: dict[str, pd.DataFrame],
) -> Output[pd.DataFrame]:
    """Determine the expected pace for each match in each league and season."""
    assert isinstance(context.partition_key, MultiPartitionKey)
    season = int(context.partition_key.keys_by_dimension["predicted_season"])

    all_match_results_with_finish = pd.concat(match_results_with_finish_df.values())
    assert season not in all_match_results_with_finish["Season"].values

    home_results = (
        all_match_results_with_finish.copy()
        .rename(columns={"HomeFinish": "TeamFinish", "AwayFinish": "OpponentFinish"})
        .assign(
            Home=True,
            ExpectedPoints=lambda x: pd.to_numeric(
                x["FTR"].map(HOME_POINTS), downcast="float"
            ),
        )
    )[["Div", "Season", "TeamFinish", "OpponentFinish", "Home", "ExpectedPoints"]]
    away_results = (
        all_match_results_with_finish.copy()
        .rename(columns={"AwayFinish": "TeamFinish", "HomeFinish": "OpponentFinish"})
        .assign(
            Home=False,
            ExpectedPoints=lambda x: pd.to_numeric(
                x["FTR"].map(AWAY_POINTS), downcast="float"
            ),
        )
    )[["Div", "Season", "TeamFinish", "OpponentFinish", "Home", "ExpectedPoints"]]
    all_results = pd.concat([home_results, away_results])
    summarized_results = (
        all_results.groupby(["Div", "TeamFinish", "OpponentFinish", "Home"])
        .ExpectedPoints.agg("mean")
        .reset_index()
        .query("TeamFinish == 1")
        .sort_values(by=["TeamFinish", "Home", "OpponentFinish"])
        .reset_index(drop=True)
    )
    summarized_results["Season"] = season

    summarized_results["ExpectedPoints"] = (
        summarized_results.groupby("Home")
        .ExpectedPoints.apply(lambda x: x.sort_values(ignore_index=True))
        .reset_index(drop=True)
    )

    return Output(
        summarized_results,
        metadata={
            "num_rows": len(summarized_results),
            "preview": MetadataValue.md(summarized_results.head().to_markdown()),
        },
    )


@asset(
    group_name="Load",
    compute_kind="Postgres",
    partitions_def=all_predicted_seasons_leagues_partition,
    code_version="v1",
    ins={"pace_sheet_entries_df": AssetIn(dagster_type=PaceSheetEntryDataFrame)},
)
def pace_sheet_entries_postgres(
    pace_sheet_entries_df: pd.DataFrame, vercel_postgres: VercelPostgresResource
) -> Output[None]:
    """Ensure all rows from the standings DataFrame are in Postgres."""
    rows = [
        {str(col): val for col, val in row.items()}
        for row in pace_sheet_entries_df.to_dict("records")
    ]
    rowcount = vercel_postgres.upsert_pace_sheet_entries(rows)
    return Output(None, metadata={"rowcount": rowcount})
