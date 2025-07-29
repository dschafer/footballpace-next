import dagster as dg
import polars as pl

from footballpace.dataversion import eager_respecting_data_version
from footballpace.defs.models import (
    MatchDagsterType,
    MatchWithFinishDagsterType,
    StandingsRowDagsterType,
)
from footballpace.partitions import all_seasons_leagues_partition
from footballpace.markdown import markdown_metadata


@dg.asset(
    group_name="MatchResults",
    kinds={"Polars"},
    partitions_def=all_seasons_leagues_partition,
    code_version="v2",
    dagster_type=MatchWithFinishDagsterType,
    ins={
        "standings_rows_df": dg.AssetIn(dagster_type=StandingsRowDagsterType),
        "match_results_df": dg.AssetIn(dagster_type=MatchDagsterType),
    },
    automation_condition=eager_respecting_data_version,
)
def match_results_with_finish_df(
    match_results_df: pl.DataFrame,
    standings_rows_df: pl.DataFrame,
) -> dg.Output[pl.DataFrame]:
    """Annotate match results with each team's finish. Note that this isn't needed
    for match results themselves, only for pace sheets, but it needs to live in the
    match results group because it shares a partition structure with that group and
    not the pace sheet group"""

    standings_rows_df = standings_rows_df.with_row_index(
        name="finish", offset=1
    ).select("team", "finish")

    home_standings = standings_rows_df.rename(
        {"team": "home_team", "finish": "home_finish"}
    )
    away_standings = standings_rows_df.rename(
        {"team": "away_team", "finish": "away_finish"}
    )

    match_results_finish_df = match_results_df.join(
        other=home_standings,
        on="home_team",
    ).join(
        other=away_standings,
        on="away_team",
    )

    return dg.Output(
        match_results_finish_df,
        metadata={
            "dagster/partition_row_count": len(match_results_finish_df),
            "preview": markdown_metadata(match_results_finish_df.head()),
        },
    )
