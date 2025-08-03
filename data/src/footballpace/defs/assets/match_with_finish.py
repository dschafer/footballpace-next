import dagster as dg
import dagster_pandas as dg_pd
import pandas as pd

from footballpace.dataversion import eager_respecting_data_version
from footballpace.defs.assets.match_results import MatchResultsDataFrame
from footballpace.defs.assets.standings_rows import StandingsRowsDataFrame
from footballpace.partitions import all_seasons_leagues_partition

MatchResultsWithFinishDataFrame = dg_pd.create_dagster_pandas_dataframe_type(
    name="MatchResultsWithFinishDataFrame",
    columns=[
        dg_pd.PandasColumn.string_column("Div"),
        dg_pd.PandasColumn.integer_column("Season"),
        dg_pd.PandasColumn.datetime_column("Date"),
        dg_pd.PandasColumn.string_column("HomeTeam"),
        dg_pd.PandasColumn.string_column("AwayTeam"),
        dg_pd.PandasColumn.integer_column("FTHG", min_value=0),
        dg_pd.PandasColumn.integer_column("FTAG", min_value=0),
        dg_pd.PandasColumn.categorical_column("FTR", categories={"H", "A", "D"}),
        dg_pd.PandasColumn.integer_column("HomeFinish", min_value=1),
        dg_pd.PandasColumn.integer_column("AwayFinish", min_value=1),
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
    code_version="v1",
    dagster_type=MatchResultsWithFinishDataFrame,
    ins={
        "standings_rows_df": dg.AssetIn(dagster_type=StandingsRowsDataFrame),
        "match_results_df": dg.AssetIn(dagster_type=MatchResultsDataFrame),
    },
    automation_condition=eager_respecting_data_version,
)
def match_results_with_finish_df(
    match_results_df: pd.DataFrame,
    standings_rows_df: pd.DataFrame,
) -> dg.Output[pd.DataFrame]:
    """Annotate match results with each team's finish. Note that this isn't needed
    for match results themselves, only for pace sheets, but it needs to live in the
    match results group because it shares a partition structure with that group and
    not the pace sheet group"""

    standings_sorted_df = (
        standings_rows_df.assign(
            Points=3 * standings_rows_df["Wins"] + standings_rows_df["Draws"],
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

    return dg.Output(
        match_results_finish_df,
        metadata={
            "dagster/partition_row_count": len(match_results_finish_df),
            "preview": dg.MetadataValue.md(
                match_results_finish_df.head().to_markdown()
            ),
        },
    )
