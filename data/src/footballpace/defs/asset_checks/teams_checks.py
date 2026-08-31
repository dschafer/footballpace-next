import dagster as dg
import polars as pl

from footballpace.defs.asset_checks.helpers import (
    duplicate_count,
    duplicate_key_samples,
    partition_values_match,
)
from footballpace.defs.assets.fpl_fixtures import fpl_fixture_season
from footballpace.partitions import all_seasons_leagues_partition

TEAM_KEY = ["league", "year", "team"]


@dg.asset_check(
    asset="teams_df",
    blocking=True,
    partitions_def=all_seasons_leagues_partition,
)
def teams_non_empty(teams_df: pl.DataFrame) -> dg.AssetCheckResult:
    """Checks that each team list contains at least one team."""
    return dg.AssetCheckResult(
        passed=len(teams_df) > 0,
        metadata={"team_count": len(teams_df)},
    )


@dg.asset_check(asset="fpl_fixtures_teams_df", blocking=True)
def fpl_fixtures_teams_non_empty(
    fpl_fixtures_teams_df: pl.DataFrame,
) -> dg.AssetCheckResult:
    """Checks that the FPL-derived team list contains at least one team."""
    return dg.AssetCheckResult(
        passed=len(fpl_fixtures_teams_df) > 0,
        metadata={"team_count": len(fpl_fixtures_teams_df)},
    )


@dg.asset_check(
    asset="teams_df",
    blocking=True,
    partitions_def=all_seasons_leagues_partition,
)
def teams_unique_key(teams_df: pl.DataFrame) -> dg.AssetCheckResult:
    """Checks that each team has a unique league-season identity."""
    duplicate_keys = duplicate_count(teams_df, TEAM_KEY)
    return dg.AssetCheckResult(
        passed=duplicate_keys == 0,
        metadata={
            "duplicate_key_count": duplicate_keys,
            "duplicate_samples": duplicate_key_samples(teams_df, TEAM_KEY),
        },
    )


@dg.asset_check(asset="fpl_fixtures_teams_df", blocking=True)
def fpl_fixtures_teams_unique_key(
    fpl_fixtures_teams_df: pl.DataFrame,
) -> dg.AssetCheckResult:
    """Checks that each FPL-derived team has a unique league-season identity."""
    duplicate_keys = duplicate_count(fpl_fixtures_teams_df, TEAM_KEY)
    return dg.AssetCheckResult(
        passed=duplicate_keys == 0,
        metadata={
            "duplicate_key_count": duplicate_keys,
            "duplicate_samples": duplicate_key_samples(
                fpl_fixtures_teams_df, TEAM_KEY
            ),
        },
    )


@dg.asset_check(
    asset="teams_df",
    blocking=True,
    partitions_def=all_seasons_leagues_partition,
)
def teams_match_partition(
    context: dg.AssetCheckExecutionContext, teams_df: pl.DataFrame
) -> dg.AssetCheckResult:
    """Checks that team rows match the materialized partition."""
    assert isinstance(context.partition_key, dg.MultiPartitionKey)
    passed = partition_values_match(teams_df, context.partition_key, "season")
    return dg.AssetCheckResult(passed=passed)


@dg.asset_check(
    asset="fpl_fixtures_teams_df",
    additional_ins={"fpl_fixtures_df": dg.AssetIn(key="fpl_fixtures_df")},
    blocking=True,
)
def fpl_fixtures_teams_match_fixture_season(
    fpl_fixtures_teams_df: pl.DataFrame,
    fpl_fixtures_df: pl.DataFrame,
) -> dg.AssetCheckResult:
    """Checks that FPL-derived team rows target the fixture feed's EPL season."""
    season = fpl_fixture_season(fpl_fixtures_df.get_column("year"))
    invalid_rows = fpl_fixtures_teams_df.filter(
        (pl.col("league") != "E0") | (pl.col("year") != season)
    )
    return dg.AssetCheckResult(
        passed=invalid_rows.is_empty(),
        metadata={
            "invalid_row_count": len(invalid_rows),
            "expected_league": "E0",
            "expected_year": season,
        },
    )
