from typing import Any, cast

import dagster as dg
import polars as pl

from footballpace.defs.asset_checks.helpers import (
    bad_score_result_count,
    dates_in_season_window,
    duplicate_count,
    duplicate_key_samples,
    partition_values_match,
    valid_csv_bytes,
)
from footballpace.partitions import all_seasons_leagues_partition


MATCH_KEY = ["league", "date", "home_team", "away_team"]


@dg.asset_check(
    asset="match_results_csv",
    blocking=True,
    partitions_def=all_seasons_leagues_partition,
)
def match_results_csv_valid_csv(match_results_csv: bytes) -> dg.AssetCheckResult:
    """Checks that the downloaded match results payload is valid CSV.

    The file must decode with one of the supported source encodings and parse as
    CSV.
    """
    passed, metadata = valid_csv_bytes(match_results_csv)
    return dg.AssetCheckResult(passed=passed, metadata=cast(Any, metadata))


@dg.asset_check(
    asset="match_results_df",
    blocking=True,
    partitions_def=all_seasons_leagues_partition,
)
def match_results_unique_key(match_results_df: pl.DataFrame) -> dg.AssetCheckResult:
    """Checks that each match result has a unique database identity.

    Duplicate match keys would make match upserts ambiguous.
    """
    duplicate_keys = duplicate_count(match_results_df, MATCH_KEY)
    return dg.AssetCheckResult(
        passed=duplicate_keys == 0,
        metadata={
            "duplicate_key_count": duplicate_keys,
            "duplicate_samples": duplicate_key_samples(match_results_df, MATCH_KEY),
        },
    )


@dg.asset_check(
    asset="match_results_df",
    blocking=True,
    partitions_def=all_seasons_leagues_partition,
)
def match_results_distinct_teams(
    match_results_df: pl.DataFrame,
) -> dg.AssetCheckResult:
    """Checks that no match has a team playing itself."""
    invalid_rows = len(match_results_df.filter(pl.col("home_team") == pl.col("away_team")))
    return dg.AssetCheckResult(
        passed=invalid_rows == 0,
        metadata={"invalid_row_count": invalid_rows},
    )


@dg.asset_check(
    asset="match_results_df",
    blocking=True,
    partitions_def=all_seasons_leagues_partition,
)
def match_results_score_result_consistent(
    match_results_df: pl.DataFrame,
) -> dg.AssetCheckResult:
    """Checks that each result code agrees with the full-time score."""
    invalid_rows = bad_score_result_count(match_results_df)
    return dg.AssetCheckResult(
        passed=invalid_rows == 0,
        metadata={"invalid_row_count": invalid_rows},
    )


@dg.asset_check(
    asset="match_results_df",
    blocking=True,
    partitions_def=all_seasons_leagues_partition,
)
def match_results_match_partition(
    context: dg.AssetCheckExecutionContext, match_results_df: pl.DataFrame
) -> dg.AssetCheckResult:
    """Checks that match result rows match the materialized partition."""
    assert isinstance(context.partition_key, dg.MultiPartitionKey)
    passed = partition_values_match(match_results_df, context.partition_key, "season")
    return dg.AssetCheckResult(
        passed=passed,
        metadata={"partition_key": str(context.partition_key)},
    )


@dg.asset_check(
    asset="match_results_df",
    blocking=True,
    partitions_def=all_seasons_leagues_partition,
)
def match_results_dates_in_season_window(
    match_results_df: pl.DataFrame,
) -> dg.AssetCheckResult:
    """Checks that match dates fall within the expected league-season window.

    A season runs from August 1 of the season year through July 31 of the next
    year.
    """
    return dg.AssetCheckResult(passed=dates_in_season_window(match_results_df))
