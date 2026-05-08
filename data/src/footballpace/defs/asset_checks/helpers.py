import json
import re
from collections.abc import Iterable
from io import StringIO
from typing import Any

import dagster as dg
import polars as pl


HEX_COLOR_RE = re.compile(r"^[0-9A-Fa-f]{6}$")


def text_metadata(values: Iterable[object], limit: int = 5) -> str:
    return ", ".join(str(value) for value in list(values)[:limit])


def duplicate_count(df: pl.DataFrame, keys: list[str]) -> int:
    if df.is_empty():
        return 0
    return len(df.group_by(keys).len().filter(pl.col("len") > 1))


def duplicate_key_samples(df: pl.DataFrame, keys: list[str], limit: int = 5) -> str:
    if df.is_empty():
        return ""
    duplicates = df.group_by(keys).len().filter(pl.col("len") > 1).select(keys)
    return text_metadata(duplicates.head(limit).to_dicts(), limit=limit)


def bad_score_result_count(df: pl.DataFrame) -> int:
    return len(
        df.filter(
            (
                (pl.col("ft_home_goals") > pl.col("ft_away_goals"))
                & (pl.col("ft_result") != "H")
            )
            | (
                (pl.col("ft_away_goals") > pl.col("ft_home_goals"))
                & (pl.col("ft_result") != "A")
            )
            | (
                (pl.col("ft_home_goals") == pl.col("ft_away_goals"))
                & (pl.col("ft_result") != "D")
            )
        )
    )


def partition_values_match(
    df: pl.DataFrame, partition_key: dg.MultiPartitionKey, year_dimension: str
) -> bool:
    season = int(partition_key.keys_by_dimension[year_dimension])
    league = partition_key.keys_by_dimension["league"]
    return bool(
        df.select((pl.col("year").eq(season) & pl.col("league").eq(league)).all())
        .item()
    )


def dates_in_season_window(df: pl.DataFrame) -> bool:
    if df.is_empty():
        return True

    invalid_rows = df.filter(
        (pl.col("date") < pl.date(pl.col("year"), 8, 1))
        | (pl.col("date") > pl.date(pl.col("year") + 1, 7, 31))
    )
    return invalid_rows.is_empty()


def valid_csv_bytes(csv_bytes: bytes) -> tuple[bool, dict[str, object]]:
    metadata: dict[str, object] = {"size": len(csv_bytes)}
    if len(csv_bytes) == 0:
        metadata["reason"] = "empty bytes"
        return False, metadata

    for encoding in ["Windows-1252", "utf-8-sig"]:
        try:
            decoded = csv_bytes.decode(encoding)
            pl.read_csv(StringIO(decoded), n_rows=1)
        except Exception:
            continue

        metadata["encoding"] = encoding
        return True, metadata

    metadata["reason"] = "could not decode and parse CSV"
    return False, metadata


def parse_json_bytes(json_bytes: bytes) -> tuple[Any | None, dict[str, object]]:
    metadata: dict[str, object] = {"size": len(json_bytes)}
    if len(json_bytes) == 0:
        metadata["reason"] = "empty bytes"
        return None, metadata
    try:
        return json.loads(json_bytes), metadata
    except json.JSONDecodeError as error:
        metadata["reason"] = str(error)
        return None, metadata


def valid_fpl_bootstrap_json(json_bytes: bytes) -> tuple[bool, dict[str, object]]:
    obj, metadata = parse_json_bytes(json_bytes)
    if not isinstance(obj, dict):
        metadata["reason"] = "expected top-level object"
        return False, metadata

    teams = obj.get("teams")
    if not isinstance(teams, list) or len(teams) == 0:
        metadata["reason"] = "missing non-empty teams list"
        return False, metadata

    invalid_count = sum(
        not isinstance(team, dict) or "id" not in team or "name" not in team
        for team in teams
    )
    metadata["team_count"] = len(teams)
    metadata["invalid_team_count"] = invalid_count
    return invalid_count == 0, metadata


def valid_fpl_fixtures_json(json_bytes: bytes) -> tuple[bool, dict[str, object]]:
    obj, metadata = parse_json_bytes(json_bytes)
    if not isinstance(obj, list) or len(obj) == 0:
        metadata["reason"] = "expected non-empty top-level list"
        return False, metadata

    metadata["fixture_count"] = len(obj)
    return True, metadata


def valid_team_colors_json(json_bytes: bytes) -> tuple[bool, dict[str, object]]:
    obj, metadata = parse_json_bytes(json_bytes)
    if not isinstance(obj, list) or len(obj) == 0:
        metadata["reason"] = "expected non-empty top-level list"
        return False, metadata

    epl_entries = [
        team
        for team in obj
        if isinstance(team, dict) and team.get("league") == "epl"
    ]
    invalid_count = sum(
        not isinstance(team.get("colors"), dict)
        or not isinstance(team["colors"].get("hex"), list)
        or len(team["colors"]["hex"]) == 0
        for team in epl_entries
    )
    metadata["epl_team_count"] = len(epl_entries)
    metadata["invalid_epl_team_count"] = invalid_count
    return len(epl_entries) > 0 and invalid_count == 0, metadata


def valid_hex_color_count(df: pl.DataFrame) -> int:
    return len(
        df.filter(
            ~pl.col("primary_color").str.contains(HEX_COLOR_RE.pattern)
            | (
                pl.col("secondary_color").is_not_null()
                & ~pl.col("secondary_color").str.contains(HEX_COLOR_RE.pattern)
            )
        )
    )
