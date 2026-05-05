from typing import Any, cast

import dagster as dg
import polars as pl

from footballpace.defs.asset_checks.helpers import (
    bad_score_result_count,
    duplicate_count,
    duplicate_key_samples,
    valid_fpl_bootstrap_json,
    valid_fpl_fixtures_json,
)


FIXTURE_KEY = ["league", "year", "home_team", "away_team"]


@dg.asset_check(asset="fpl_bootstrap_json", blocking=True)
def fpl_bootstrap_json_shape(fpl_bootstrap_json: bytes) -> dg.AssetCheckResult:
    """Checks that the FPL bootstrap payload is valid JSON with usable team IDs.

    The fixture transform needs this team list to translate FPL team IDs into team
    names.
    """
    passed, metadata = valid_fpl_bootstrap_json(fpl_bootstrap_json)
    return dg.AssetCheckResult(passed=passed, metadata=cast(Any, metadata))


@dg.asset_check(asset="fpl_fixtures_json", blocking=True)
def fpl_fixtures_json_shape(fpl_fixtures_json: bytes) -> dg.AssetCheckResult:
    """Checks that the FPL fixtures payload is valid JSON.

    It must parse as a non-empty top-level list, but this check deliberately does
    not duplicate the downstream DataFrame materialization.
    """
    passed, metadata = valid_fpl_fixtures_json(fpl_fixtures_json)
    return dg.AssetCheckResult(passed=passed, metadata=cast(Any, metadata))


@dg.asset_check(asset="fpl_fixtures_df", blocking=True)
def fpl_fixtures_unique_key(fpl_fixtures_df: pl.DataFrame) -> dg.AssetCheckResult:
    """Checks that each FPL fixture has a unique database identity.

    Duplicate fixture keys would make fixture upserts ambiguous.
    """
    duplicate_keys = duplicate_count(fpl_fixtures_df, FIXTURE_KEY)
    return dg.AssetCheckResult(
        passed=duplicate_keys == 0,
        metadata={
            "duplicate_key_count": duplicate_keys,
            "duplicate_samples": duplicate_key_samples(fpl_fixtures_df, FIXTURE_KEY),
        },
    )


@dg.asset_check(asset="fpl_fixtures_df", blocking=True)
def fpl_fixtures_distinct_teams(
    fpl_fixtures_df: pl.DataFrame,
) -> dg.AssetCheckResult:
    """Checks that no FPL fixture has a team playing itself."""
    invalid_rows = len(fpl_fixtures_df.filter(pl.col("home_team") == pl.col("away_team")))
    return dg.AssetCheckResult(
        passed=invalid_rows == 0,
        metadata={"invalid_row_count": invalid_rows},
    )


@dg.asset_check(asset="fpl_fixtures_df", blocking=True)
def fpl_finished_fixtures_have_scores(
    fpl_fixtures_df: pl.DataFrame,
) -> dg.AssetCheckResult:
    """Checks that finished FPL fixtures include both full-time scores."""
    invalid_rows = fpl_fixtures_df.filter(
        pl.col("finished_provisional")
        & (pl.col("ft_home_goals").is_null() | pl.col("ft_away_goals").is_null())
    )
    return dg.AssetCheckResult(
        passed=len(invalid_rows) == 0,
        metadata={"invalid_row_count": len(invalid_rows)},
    )


@dg.asset_check(asset="fpl_results_df", blocking=True)
def fpl_results_have_scores(fpl_results_df: pl.DataFrame) -> dg.AssetCheckResult:
    """Checks that every FPL result row has both full-time scores."""
    invalid_rows = fpl_results_df.filter(
        pl.col("ft_home_goals").is_null() | pl.col("ft_away_goals").is_null()
    )
    return dg.AssetCheckResult(
        passed=len(invalid_rows) == 0,
        metadata={"invalid_row_count": len(invalid_rows)},
    )


@dg.asset_check(asset="fpl_results_df", blocking=True)
def fpl_results_score_result_consistent(
    fpl_results_df: pl.DataFrame,
) -> dg.AssetCheckResult:
    """Checks that each FPL result code agrees with the full-time score."""
    invalid_rows = bad_score_result_count(fpl_results_df)
    return dg.AssetCheckResult(
        passed=invalid_rows == 0,
        metadata={"invalid_row_count": invalid_rows},
    )


@dg.asset_check(
    asset="fpl_results_df",
    additional_ins={"fpl_fixtures_df": dg.AssetIn(key="fpl_fixtures_df")},
    blocking=True,
)
def fpl_results_subset_of_fixtures(
    fpl_results_df: pl.DataFrame, fpl_fixtures_df: pl.DataFrame
) -> dg.AssetCheckResult:
    """Checks that every FPL result corresponds to a known FPL fixture."""
    unmatched_rows = fpl_results_df.join(
        fpl_fixtures_df.select(FIXTURE_KEY),
        on=FIXTURE_KEY,
        how="anti",
    )
    return dg.AssetCheckResult(
        passed=unmatched_rows.is_empty(),
        metadata=cast(
            Any,
            {
                "unmatched_row_count": len(unmatched_rows),
                "unmatched_samples": unmatched_rows.head(5).to_dicts(),
            },
        ),
    )
