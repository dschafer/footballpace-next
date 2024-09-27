import pandas as pd

from dagster import (
    AssetIn,
    MetadataValue,
    Output,
    asset,
)
from dagster_pandas import PandasColumn, create_dagster_pandas_dataframe_type

from footballpace.assets.match_results import MatchResultsDataFrame
from footballpace.assets.standings_rows import StandingsRowsDataFrame
from footballpace.partitions import all_seasons_leagues_partition

MatchResultsWithFinishDataFrame = create_dagster_pandas_dataframe_type(
    name="MatchResultsWithFinishDataFrame",
    columns=[
        PandasColumn.string_column("Div"),
        PandasColumn.integer_column("Season"),
        PandasColumn.datetime_column("Date"),
        PandasColumn.string_column("HomeTeam"),
        PandasColumn.string_column("AwayTeam"),
        PandasColumn.integer_column("FTHG", min_value=0),
        PandasColumn.integer_column("FTAG", min_value=0),
        PandasColumn.categorical_column("FTR", categories={"H", "A", "D"}),
        PandasColumn.integer_column("HomeFinish", min_value=1),
        PandasColumn.integer_column("AwayFinish", min_value=1),
    ],
    metadata_fn=lambda df: {
        "dagster/partition_row_count": len(df),
        "preview": MetadataValue.md(df.head().to_markdown()),
    },
)


@asset(
    group_name="PaceSheet",
    compute_kind="Pandas",
    partitions_def=all_seasons_leagues_partition,
    code_version="v1",
    dagster_type=MatchResultsWithFinishDataFrame,
    ins={
        "standings_rows_df": AssetIn(dagster_type=StandingsRowsDataFrame),
        "match_results_df": AssetIn(dagster_type=MatchResultsDataFrame),
    },
)
def match_results_with_finish_df(
    match_results_df: pd.DataFrame,
    standings_rows_df: pd.DataFrame,
) -> Output[pd.DataFrame]:
    """Annotate match results with each team's finish."""

    standings_sorted_df = (
        standings_rows_df.assign(
            Points=2 * standings_rows_df["Wins"] + standings_rows_df["Draws"],
            GD=standings_rows_df["For"] - standings_rows_df["Against"],
        )
        .sort_values(by=["Points", "GD", "For"], ascending=False)
        .assign(Finish=standings_rows_df.reset_index().index + 1)[["Team", "Finish"]]
    )

    home_standings = standings_sorted_df.copy().rename(
        columns={"Team": "HomeTeam", "Finish": "HomeFinish"}
    )
    away_standings = standings_sorted_df.copy().rename(
        columns={"Team": "AwayTeam", "Finish": "AwayFinish"}
    )

    match_results_finish_df = match_results_df.merge(
        right=home_standings,
        on="HomeTeam",
    ).merge(
        right=away_standings,
        on="AwayTeam",
    )

    return Output(
        match_results_finish_df,
        metadata={
            "dagster/partition_row_count": len(match_results_finish_df),
            "preview": MetadataValue.md(match_results_finish_df.head().to_markdown()),
        },
    )
