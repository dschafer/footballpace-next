from typing import Any, cast

import dagster as dg
import polars as pl

from footballpace.defs.asset_checks.helpers import (
    duplicate_count,
    duplicate_key_samples,
)
from footballpace.partitions import (
    all_predicted_seasons_leagues_partition,
    predicted_seasons_of_league_mapping,
)


PACE_SHEET_KEY = ["league", "year", "team_finish", "opponent_finish", "home"]
VALID_LEAGUE_TEAM_FINISH_DF = pl.DataFrame(
    [
        {"league": "E0", "team_finish": 1},
        {"league": "E0", "team_finish": 4},
        {"league": "E0", "team_finish": 17},
        {"league": "SP1", "team_finish": 1},
        {"league": "SP1", "team_finish": 4},
        {"league": "SP1", "team_finish": 17},
        {"league": "I1", "team_finish": 1},
        {"league": "I1", "team_finish": 4},
        {"league": "I1", "team_finish": 17},
        {"league": "F1", "team_finish": 1},
        {"league": "F1", "team_finish": 4},
        {"league": "F1", "team_finish": 15},
        {"league": "D1", "team_finish": 1},
        {"league": "D1", "team_finish": 4},
        {"league": "D1", "team_finish": 15},
    ],
    schema={"league": pl.String, "team_finish": pl.UInt32},
)


@dg.asset_check(
    asset="pace_sheet_entries_df",
    blocking=True,
    partitions_def=all_predicted_seasons_leagues_partition,
)
def pace_sheet_entries_match_partition(
    context: dg.AssetCheckExecutionContext, pace_sheet_entries_df: pl.DataFrame
) -> dg.AssetCheckResult:
    """Checks that pace sheet rows match the predicted-season partition."""
    assert isinstance(context.partition_key, dg.MultiPartitionKey)
    season = int(context.partition_key.keys_by_dimension["predicted_season"])
    league = context.partition_key.keys_by_dimension["league"]
    passed = bool(
        pace_sheet_entries_df.select(
            (pl.col("year").eq(season) & pl.col("league").eq(league)).all()
        ).item()
    )
    return dg.AssetCheckResult(
        passed=passed,
        metadata={"partition_key": str(context.partition_key)},
    )


@dg.asset_check(
    asset="pace_sheet_entries_df",
    blocking=True,
    partitions_def=all_predicted_seasons_leagues_partition,
)
def pace_sheet_entries_unique_key(
    pace_sheet_entries_df: pl.DataFrame,
) -> dg.AssetCheckResult:
    """Checks that each pace sheet entry has a unique database identity."""
    duplicate_keys = duplicate_count(pace_sheet_entries_df, PACE_SHEET_KEY)
    return dg.AssetCheckResult(
        passed=duplicate_keys == 0,
        metadata={
            "duplicate_key_count": duplicate_keys,
            "duplicate_samples": duplicate_key_samples(
                pace_sheet_entries_df, PACE_SHEET_KEY
            ),
        },
    )


@dg.asset_check(
    asset="pace_sheet_entries_df",
    blocking=True,
    partitions_def=all_predicted_seasons_leagues_partition,
)
def pace_sheet_entries_configured_target_finishes(
    pace_sheet_entries_df: pl.DataFrame,
) -> dg.AssetCheckResult:
    """Checks that pace sheets only contain configured target finishes.

    The configured finishes are champion, UCL, and safety targets for each league.
    """
    valid_rows = VALID_LEAGUE_TEAM_FINISH_DF.rename(
        {"team_finish": "valid_team_finish"}
    )
    invalid_rows = pace_sheet_entries_df.join(
        valid_rows,
        left_on=["league", "team_finish"],
        right_on=["league", "valid_team_finish"],
        how="anti",
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
    asset="pace_sheet_entries_df",
    blocking=True,
    partitions_def=all_predicted_seasons_leagues_partition,
)
def pace_sheet_entries_opponent_finish_coverage(
    pace_sheet_entries_df: pl.DataFrame,
) -> dg.AssetCheckResult:
    """Checks that each target finish has entries for every other finish.

    A team cannot be its own opponent, so the target finish itself is excluded.
    """
    team_count = cast(int, pace_sheet_entries_df["opponent_finish"].max())
    grouped = pace_sheet_entries_df.group_by(
        ["league", "year", "team_finish", "home"]
    ).agg(pl.col("opponent_finish").sort())
    invalid_groups = grouped.filter(
        pl.col("opponent_finish")
        != pl.struct("team_finish").map_elements(
            lambda row: [
                finish
                for finish in range(1, team_count + 1)
                if finish != row["team_finish"]
            ],
            return_dtype=pl.List(pl.Int64),
        )
    )
    return dg.AssetCheckResult(
        passed=invalid_groups.is_empty(),
        metadata=cast(
            Any,
            {
                "invalid_group_count": len(invalid_groups),
                "invalid_samples": invalid_groups.head(5).to_dicts(),
            },
        ),
    )


@dg.asset_check(
    asset="pace_sheet_entries_df",
    additional_ins={
        "match_results_with_finish_df": dg.AssetIn(
            key="match_results_with_finish_df",
            partition_mapping=predicted_seasons_of_league_mapping,
        )
    },
    blocking=True,
    partitions_def=all_predicted_seasons_leagues_partition,
)
def pace_sheet_entries_exclude_predicted_season(
    context: dg.AssetCheckExecutionContext,
    pace_sheet_entries_df: pl.DataFrame,
    match_results_with_finish_df: dict[str, pl.DataFrame],
) -> dg.AssetCheckResult:
    """Checks that pace sheets do not use their predicted season as input."""
    assert isinstance(context.partition_key, dg.MultiPartitionKey)
    season = int(context.partition_key.keys_by_dimension["predicted_season"])
    input_years = sorted(
        {
            int(year)
            for df in match_results_with_finish_df.values()
            for year in df["year"].unique().to_list()
        }
    )
    return dg.AssetCheckResult(
        passed=season not in input_years,
        metadata={
            "predicted_season": season,
            "input_years": input_years,
        },
    )
