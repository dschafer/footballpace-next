from typing import Any, cast

import dagster as dg
import polars as pl

from footballpace.defs.asset_checks.helpers import (
    valid_hex_color_count,
    valid_team_colors_json,
)


@dg.asset_check(asset="team_colors_json", blocking=True)
def team_colors_json_shape(team_colors_json: bytes) -> dg.AssetCheckResult:
    """Checks that the team colors payload is valid JSON with EPL color entries."""
    passed, metadata = valid_team_colors_json(team_colors_json)
    return dg.AssetCheckResult(passed=passed, metadata=cast(Any, metadata))


@dg.asset_check(asset="team_colors_df", blocking=True)
def team_colors_valid_hex_colors(team_colors_df: pl.DataFrame) -> dg.AssetCheckResult:
    """Checks that every team color is a six-character hex color."""
    invalid_rows = valid_hex_color_count(team_colors_df)
    return dg.AssetCheckResult(
        passed=invalid_rows == 0,
        metadata={"invalid_row_count": invalid_rows},
    )
