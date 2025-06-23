import dagster as dg
import dagster_pandas as dg_pd
import pandas as pd

from footballpace.assets.match_with_finish import MatchResultsWithFinishDataFrame
from footballpace.partitions import (
    all_predicted_seasons_leagues_partition,
    predicted_seasons_of_league_mapping,
)
from footballpace.resources.vercel import (
    PaceSheetEntriesTableSchema,
    VercelPostgresResource,
)

PaceSheetEntryDataFrame = dg_pd.create_dagster_pandas_dataframe_type(
    name="PaceSheetEntry",
    columns=[
        dg_pd.PandasColumn.string_column("Div"),
        dg_pd.PandasColumn.integer_column("Season"),
        dg_pd.PandasColumn.integer_column("TeamFinish", min_value=1),
        dg_pd.PandasColumn.integer_column("OpponentFinish", min_value=1),
        dg_pd.PandasColumn.boolean_column("Home"),
        dg_pd.PandasColumn.float_column("ExpectedPoints", min_value=0, max_value=3),
    ],
    metadata_fn=lambda df: {
        "dagster/partition_row_count": len(df),
        "preview": dg.MetadataValue.md(df.head().to_markdown()),
    },
)

HOME_POINTS = {"H": 3, "D": 1, "A": 0}
AWAY_POINTS = {"A": 3, "D": 1, "H": 0}


@dg.asset(
    group_name="PaceSheet",
    kinds={"Pandas"},
    partitions_def=all_predicted_seasons_leagues_partition,
    code_version="v1",
    dagster_type=PaceSheetEntryDataFrame,
    ins={
        "match_results_with_finish_df": dg.AssetIn(
            dagster_type=dg.Dict[str, MatchResultsWithFinishDataFrame],
            partition_mapping=predicted_seasons_of_league_mapping,
        ),
    },
)
def pace_sheet_entries_df(
    context: dg.AssetExecutionContext,
    match_results_with_finish_df: dict[str, pd.DataFrame],
) -> dg.Output[pd.DataFrame]:
    """Determine the expected pace for each match in each league and season."""
    assert isinstance(context.partition_key, dg.MultiPartitionKey)
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

    return dg.Output(
        summarized_results,
        metadata={
            "dagster/partition_row_count": len(summarized_results),
            "preview": dg.MetadataValue.md(summarized_results.head().to_markdown()),
        },
    )


@dg.asset(
    group_name="PaceSheet",
    kinds={"Postgres"},
    partitions_def=all_predicted_seasons_leagues_partition,
    code_version="v1",
    ins={"pace_sheet_entries_df": dg.AssetIn(dagster_type=PaceSheetEntryDataFrame)},
    metadata={
        "dagster/column_schema": PaceSheetEntriesTableSchema,
        "dagster/table_name": "pace_sheet_entries",
    },
    tags={"db_write": "true"},
)
def pace_sheet_entries_postgres(
    pace_sheet_entries_df: pd.DataFrame, vercel_postgres: VercelPostgresResource
) -> dg.Output[None]:
    """Writes the pace sheet entires into Postgres."""
    rows = [
        {str(col): val for col, val in row.items()}
        for row in pace_sheet_entries_df.to_dict("records")
    ]
    rowcount = vercel_postgres.upsert_pace_sheet_entries(rows)
    return dg.Output(None, metadata={"dagster/partition_row_count": rowcount})
