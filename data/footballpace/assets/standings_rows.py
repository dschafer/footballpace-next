import pandas as pd

from dagster import (
    AssetIn,
    AutomationCondition,
    MetadataValue,
    Output,
    asset,
)

from dagster_pandas import PandasColumn, create_dagster_pandas_dataframe_type

from footballpace.assets.match_results import MatchResultsDataFrame
from footballpace.partitions import all_seasons_leagues_partition


StandingsRowsDataFrame = create_dagster_pandas_dataframe_type(
    name="StandingsRows",
    columns=[
        PandasColumn.string_column("Div"),
        PandasColumn.integer_column("Season"),
        PandasColumn.string_column("Team"),
        PandasColumn.integer_column("Wins", min_value=0),
        PandasColumn.integer_column("Losses", min_value=0),
        PandasColumn.integer_column("Draws", min_value=0),
        PandasColumn.integer_column("For", min_value=0),
        PandasColumn.integer_column("Against", min_value=0),
    ],
    metadata_fn=lambda df: {
        "dagster/partition_row_count": len(df),
        "preview": MetadataValue.md(df.head().to_markdown()),
    },
)


@asset(
    group_name="MatchResults",
    kinds={"Pandas"},
    partitions_def=all_seasons_leagues_partition,
    code_version="v1",
    dagster_type=StandingsRowsDataFrame,
    ins={"match_results_df": AssetIn(dagster_type=MatchResultsDataFrame)},
    automation_condition=AutomationCondition.eager(),
)
def standings_rows_df(match_results_df: pd.DataFrame) -> Output[pd.DataFrame]:
    """Transform the Match Results data frame into a Standings Table."""

    home_df = match_results_df.copy().rename(
        columns={"HomeTeam": "Team", "FTHG": "For", "FTAG": "Against"}
    )[["Div", "Season", "Team", "For", "Against"]]
    away_df = match_results_df.copy().rename(
        columns={"AwayTeam": "Team", "FTAG": "For", "FTHG": "Against"}
    )[["Div", "Season", "Team", "For", "Against"]]

    results_df = pd.concat([home_df, away_df])
    results_df["Wins"] = results_df["For"] > results_df["Against"]
    results_df["Losses"] = results_df["For"] < results_df["Against"]
    results_df["Draws"] = results_df["For"] == results_df["Against"]

    standings_df = (
        results_df.groupby(["Div", "Season", "Team"]).agg("sum").reset_index()
    )

    return Output(
        standings_df,
        metadata={
            "dagster/partition_row_count": len(standings_df),
            "preview": MetadataValue.md(standings_df.head().to_markdown()),
        },
    )
