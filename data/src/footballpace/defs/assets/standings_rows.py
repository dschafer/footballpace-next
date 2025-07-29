import dagster as dg
import polars as pl

from footballpace.dataversion import eager_respecting_data_version
from footballpace.defs.models import (
    MatchDagsterType,
    StandingsRowDagsterType,
)
from footballpace.markdown import markdown_metadata
from footballpace.partitions import all_seasons_leagues_partition


@dg.asset(
    group_name="MatchResults",
    kinds={"Polars"},
    partitions_def=all_seasons_leagues_partition,
    code_version="v2",
    dagster_type=StandingsRowDagsterType,
    ins={"match_results_df": dg.AssetIn(dagster_type=MatchDagsterType)},
    automation_condition=eager_respecting_data_version,
)
def standings_rows_df(match_results_df: pl.DataFrame) -> dg.Output[pl.DataFrame]:
    """Transform the Match Results data frame into a Standings Table."""

    home_df = match_results_df.rename(
        {
            "home_team": "team",
            "ft_home_goals": "goals_for",
            "ft_away_goals": "goals_against",
        }
    ).select("league", "year", "team", "goals_for", "goals_against")
    away_df = match_results_df.rename(
        {
            "away_team": "team",
            "ft_away_goals": "goals_for",
            "ft_home_goals": "goals_against",
        }
    ).select("league", "year", "team", "goals_for", "goals_against")

    results_df = pl.concat([home_df, away_df], how="vertical").with_columns(
        wins=pl.col("goals_for") > pl.col("goals_against"),
        losses=pl.col("goals_for") < pl.col("goals_against"),
        draws=pl.col("goals_for") == pl.col("goals_against"),
    )

    standings_df = (
        results_df.group_by(["league", "year", "team"])
        .agg(
            pl.col("wins", "losses", "draws", "goals_for", "goals_against")
            .cast(int)
            .sum()
        )
        .with_columns(
            points=3 * pl.col("wins") + pl.col("draws"),
            goal_difference=pl.col("goals_for") - pl.col("goals_against"),
        )
        .sort(by=["points", "goal_difference", "goals_for"], descending=True)
    )

    return dg.Output(
        standings_df,
        metadata={
            "dagster/partition_row_count": len(standings_df),
            "preview": markdown_metadata(standings_df.head()),
        },
    )
