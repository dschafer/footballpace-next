from typing import Any, cast

import dagster as dg
import polars as pl

from footballpace.partitions import all_seasons_leagues_partition


@dg.asset_check(
    asset="match_results_with_finish_df",
    additional_ins={
        "match_results_df": dg.AssetIn(
            key="match_results_df",
            partition_mapping=dg.IdentityPartitionMapping(),
        )
    },
    blocking=True,
    partitions_def=all_seasons_leagues_partition,
)
def match_results_with_finish_preserves_rows(
    match_results_with_finish_df: pl.DataFrame, match_results_df: pl.DataFrame
) -> dg.AssetCheckResult:
    """Checks that adding finish positions does not drop match rows.

    A mismatch usually means a team did not join to the standings table.
    """
    return dg.AssetCheckResult(
        passed=len(match_results_with_finish_df) == len(match_results_df),
        metadata={
            "output_row_count": len(match_results_with_finish_df),
            "input_row_count": len(match_results_df),
        },
    )


@dg.asset_check(
    asset="match_results_with_finish_df",
    blocking=True,
    partitions_def=all_seasons_leagues_partition,
)
def match_results_with_finish_contiguous_finishes(
    match_results_with_finish_df: pl.DataFrame,
) -> dg.AssetCheckResult:
    """Checks that finish positions form a contiguous 1 through N ranking."""
    team_finishes = pl.concat(
        [
            match_results_with_finish_df.select(
                pl.col("home_team").alias("team"),
                pl.col("home_finish").alias("finish"),
            ),
            match_results_with_finish_df.select(
                pl.col("away_team").alias("team"),
                pl.col("away_finish").alias("finish"),
            ),
        ]
    ).unique()
    finishes = sorted(team_finishes["finish"].unique().to_list())
    expected_finishes = list(range(1, len(team_finishes) + 1))
    return dg.AssetCheckResult(
        passed=finishes == expected_finishes,
        metadata={
            "finish_count": len(finishes),
            "team_count": len(team_finishes),
            "missing_finishes": sorted(set(expected_finishes) - set(finishes)),
            "extra_finishes": sorted(set(finishes) - set(expected_finishes)),
        },
    )


@dg.asset_check(
    asset="match_results_with_finish_df",
    blocking=True,
    partitions_def=all_seasons_leagues_partition,
)
def match_results_with_finish_stable_team_finish(
    match_results_with_finish_df: pl.DataFrame,
) -> dg.AssetCheckResult:
    """Checks that each team has one stable finish position."""
    team_finishes = pl.concat(
        [
            match_results_with_finish_df.select(
                pl.col("home_team").alias("team"),
                pl.col("home_finish").alias("finish"),
            ),
            match_results_with_finish_df.select(
                pl.col("away_team").alias("team"),
                pl.col("away_finish").alias("finish"),
            ),
        ]
    ).unique()
    invalid_rows = team_finishes.group_by("team").len().filter(pl.col("len") != 1)
    return dg.AssetCheckResult(
        passed=invalid_rows.is_empty(),
        metadata=cast(
            Any,
            {
                "invalid_team_count": len(invalid_rows),
                "invalid_samples": invalid_rows.head(5).to_dicts(),
            },
        ),
    )
