import datetime
from typing import cast

import dagster as dg
import polars as pl

from footballpace.definitions import defs
from footballpace.defs.asset_checks.helpers import (
    bad_score_result_count,
    dates_in_season_window,
    duplicate_count,
    partition_values_match,
    valid_csv_bytes,
    valid_fpl_bootstrap_json,
    valid_fpl_fixtures_json,
    valid_hex_color_count,
    valid_team_colors_json,
)

from .read_file import read_csv_bytes, read_fpl_bytes, read_teamcolors_bytes


def test_definitions_register_asset_checks():
    definitions = defs()
    assert definitions.asset_checks is not None
    assert list(definitions.asset_checks)


def test_valid_csv_bytes_accepts_fixture_csv():
    passed, metadata = valid_csv_bytes(read_csv_bytes("E0_2022.csv"))
    assert passed
    assert metadata["encoding"] == "Windows-1252"


def test_valid_csv_bytes_rejects_empty_payload():
    passed, metadata = valid_csv_bytes(b"")
    assert not passed
    assert metadata["reason"] == "empty bytes"


def test_raw_json_shapes_accept_fixtures():
    passed, metadata = valid_fpl_bootstrap_json(read_fpl_bytes("bootstrap-static.json"))
    assert passed
    assert cast(int, metadata["team_count"]) > 0

    passed, metadata = valid_fpl_fixtures_json(read_fpl_bytes("fixtures.json"))
    assert passed
    assert cast(int, metadata["fixture_count"]) > 0

    passed, metadata = valid_team_colors_json(read_teamcolors_bytes("teams.json"))
    assert passed
    assert cast(int, metadata["epl_team_count"]) > 0


def test_raw_json_shapes_reject_bad_payloads():
    passed, metadata = valid_fpl_bootstrap_json(b"[]")
    assert not passed
    assert metadata["reason"] == "expected top-level object"

    passed, metadata = valid_fpl_fixtures_json(b"{}")
    assert not passed
    assert metadata["reason"] == "expected non-empty top-level list"

    passed, metadata = valid_team_colors_json(b'[{"league": "epl"}]')
    assert not passed
    assert metadata["invalid_epl_team_count"] == 1


def test_duplicate_count_detects_duplicate_keys():
    df = pl.DataFrame(
        {
            "league": ["E0", "E0", "E0"],
            "year": [2024, 2024, 2024],
            "home_team": ["Arsenal", "Arsenal", "Chelsea"],
            "away_team": ["Chelsea", "Chelsea", "Arsenal"],
        }
    )
    assert duplicate_count(df, ["league", "year", "home_team", "away_team"]) == 1


def test_score_result_consistency():
    df = pl.DataFrame(
        {
            "ft_home_goals": [2, 0, 1, 1],
            "ft_away_goals": [1, 3, 1, 0],
            "ft_result": ["H", "A", "D", "A"],
        }
    )
    assert bad_score_result_count(df) == 1


def test_partition_values_match_multi_partition_key():
    df = pl.DataFrame({"league": ["E0"], "year": [2024]})
    partition_key = dg.MultiPartitionKey({"league": "E0", "season": "2024"})
    assert partition_values_match(df, partition_key, "season")

    wrong_partition_key = dg.MultiPartitionKey({"league": "D1", "season": "2024"})
    assert not partition_values_match(df, wrong_partition_key, "season")


def test_dates_in_season_window():
    df = pl.DataFrame(
        {
            "year": [2024, 2024, 2024],
            "date": [
                datetime.date(2024, 8, 1),
                datetime.date(2025, 7, 31),
                datetime.date(2025, 8, 1),
            ],
        }
    )
    assert not dates_in_season_window(df)


def test_valid_hex_color_count():
    df = pl.DataFrame(
        {
            "primary_color": ["EF0107", "nothex"],
            "secondary_color": ["023474", None],
        }
    )
    assert valid_hex_color_count(df) == 1
