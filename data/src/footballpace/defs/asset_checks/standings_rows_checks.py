from typing import Any, cast

import dagster as dg
import polars as pl

from footballpace.partitions import all_seasons_leagues_partition


@dg.asset_check(
    asset="standings_rows_df",
    additional_ins={
        "match_results_df": dg.AssetIn(
            key="match_results_df",
            partition_mapping=dg.IdentityPartitionMapping(),
        )
    },
    blocking=True,
    partitions_def=all_seasons_leagues_partition,
)
def standings_one_row_per_team(
    standings_rows_df: pl.DataFrame, match_results_df: pl.DataFrame
) -> dg.AssetCheckResult:
    """Checks that standings contain exactly one row for each team in results."""
    teams = pl.concat([match_results_df["home_team"], match_results_df["away_team"]])
    expected_teams = set(teams.unique().to_list())
    actual_teams = set(standings_rows_df["team"].unique().to_list())
    return dg.AssetCheckResult(
        passed=expected_teams == actual_teams
        and len(standings_rows_df) == len(actual_teams),
        metadata={
            "expected_team_count": len(expected_teams),
            "actual_team_count": len(actual_teams),
            "row_count": len(standings_rows_df),
            "missing_teams": sorted(expected_teams - actual_teams),
            "extra_teams": sorted(actual_teams - expected_teams),
        },
    )


@dg.asset_check(
    asset="standings_rows_df",
    additional_ins={
        "match_results_df": dg.AssetIn(
            key="match_results_df",
            partition_mapping=dg.IdentityPartitionMapping(),
        )
    },
    blocking=True,
    partitions_def=all_seasons_leagues_partition,
)
def standings_record_counts_match_results(
    standings_rows_df: pl.DataFrame, match_results_df: pl.DataFrame
) -> dg.AssetCheckResult:
    """Checks that each standings record total matches its played matches."""
    home_counts = match_results_df.group_by("home_team").len().rename(
        {"home_team": "team", "len": "home_matches"}
    )
    away_counts = match_results_df.group_by("away_team").len().rename(
        {"away_team": "team", "len": "away_matches"}
    )
    played_counts = home_counts.join(away_counts, on="team", how="full", coalesce=True)
    invalid_rows = (
        standings_rows_df.join(played_counts, on="team")
        .with_columns(
            matches_played=pl.col("home_matches").fill_null(0)
            + pl.col("away_matches").fill_null(0),
            record_total=pl.col("wins") + pl.col("losses") + pl.col("draws"),
        )
        .filter(pl.col("matches_played") != pl.col("record_total"))
    )
    return dg.AssetCheckResult(
        passed=invalid_rows.is_empty(),
        metadata=cast(
            Any,
            {
                "invalid_row_count": len(invalid_rows),
                "invalid_samples": invalid_rows.head(5).to_dicts(),
            },
        ),
    )


@dg.asset_check(
    asset="standings_rows_df",
    blocking=True,
    partitions_def=all_seasons_leagues_partition,
)
def standings_points_formula(standings_rows_df: pl.DataFrame) -> dg.AssetCheckResult:
    """Checks that standings points equal three per win plus one per draw."""
    invalid_rows = standings_rows_df.filter(
        pl.col("points") != (3 * pl.col("wins") + pl.col("draws"))
    )
    return dg.AssetCheckResult(
        passed=len(invalid_rows) == 0,
        metadata={"invalid_row_count": len(invalid_rows)},
    )


@dg.asset_check(
    asset="standings_rows_df",
    blocking=True,
    partitions_def=all_seasons_leagues_partition,
)
def standings_goal_difference_formula(
    standings_rows_df: pl.DataFrame,
) -> dg.AssetCheckResult:
    """Checks that goal difference equals goals for minus goals against."""
    invalid_rows = standings_rows_df.filter(
        pl.col("goal_difference") != (pl.col("goals_for") - pl.col("goals_against"))
    )
    return dg.AssetCheckResult(
        passed=len(invalid_rows) == 0,
        metadata={"invalid_row_count": len(invalid_rows)},
    )


@dg.asset_check(
    asset="standings_rows_df",
    blocking=True,
    partitions_def=all_seasons_leagues_partition,
)
def standings_goals_balance(standings_rows_df: pl.DataFrame) -> dg.AssetCheckResult:
    """Checks that league-wide goals for equal league-wide goals against."""
    goals_for = int(standings_rows_df["goals_for"].sum())
    goals_against = int(standings_rows_df["goals_against"].sum())
    return dg.AssetCheckResult(
        passed=goals_for == goals_against,
        metadata={
            "goals_for": goals_for,
            "goals_against": goals_against,
        },
    )
