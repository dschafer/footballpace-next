from collections.abc import Callable, Iterator
from contextlib import closing
import re
import sqlite3
from typing import Any
from unittest.mock import MagicMock

import psycopg
import pytest

from footballpace.defs.resources.vercel import VercelPostgresResource


@pytest.fixture
def vercel_database(
    monkeypatch: pytest.MonkeyPatch,
) -> Iterator[tuple[VercelPostgresResource, sqlite3.Connection]]:
    """Exercise the SQL, adapting only psycopg placeholders for SQLite.

    Prisma keys/nullability are preserved; PostgreSQL type adaptation is excluded.
    """
    with closing(sqlite3.connect(":memory:")) as database:
        database.row_factory = sqlite3.Row
        database.executescript(
            """CREATE TABLE matches (
                league TEXT NOT NULL, year INTEGER NOT NULL, date TEXT NOT NULL,
                home_team TEXT NOT NULL, away_team TEXT NOT NULL,
                ft_home_goals INTEGER NOT NULL, ft_away_goals INTEGER NOT NULL,
                ft_result TEXT NOT NULL CHECK (ft_result IN ('H', 'A', 'D')),
                PRIMARY KEY (league, date, home_team, away_team)
            );
            CREATE TABLE fixtures (
                league TEXT NOT NULL, year INTEGER NOT NULL,
                home_team TEXT NOT NULL, away_team TEXT NOT NULL,
                kickoff_time TEXT,
                PRIMARY KEY (league, year, home_team, away_team)
            );
            CREATE TABLE pace_sheet_entries (
                league TEXT NOT NULL, year INTEGER NOT NULL,
                team_finish INTEGER NOT NULL, opponent_finish INTEGER NOT NULL,
                home INTEGER NOT NULL CHECK (home IN (0, 1)),
                expected_points REAL NOT NULL,
                PRIMARY KEY (league, year, team_finish, opponent_finish, home)
            );
            CREATE TABLE teams (
                league TEXT NOT NULL, year INTEGER NOT NULL, team TEXT NOT NULL,
                PRIMARY KEY (league, year, team)
            );
            CREATE TABLE team_colors (
                team TEXT NOT NULL PRIMARY KEY, primary_color TEXT NOT NULL,
                secondary_color TEXT
            );"""
        )
        connect = MagicMock()
        cursor = connect.return_value.__enter__.return_value.cursor.return_value
        cursor = cursor.__enter__.return_value

        def executemany(query: str, rows: list[dict[str, Any]]) -> None:
            query = re.sub(r"%\((\w+)\)s", r":\1", query)
            cursor.rowcount = database.executemany(query, rows).rowcount

        cursor.executemany.side_effect = executemany
        monkeypatch.setattr(psycopg, "connect", connect)
        resource = VercelPostgresResource(
            host="unused", dbname="unused", user="unused", password="unused"
        )
        with resource.process_config_and_initialize_cm() as initialized:
            yield initialized, database


@pytest.mark.parametrize(
    "upsert",
    [
        VercelPostgresResource.upsert_matches,
        VercelPostgresResource.upsert_pace_sheet_entries,
        VercelPostgresResource.upsert_team_colors,
        VercelPostgresResource.upsert_teams,
        VercelPostgresResource.upsert_fixtures,
    ],
)
def test_empty_upsert_affects_no_rows(
    vercel_database: tuple[VercelPostgresResource, sqlite3.Connection],
    upsert: Callable[[VercelPostgresResource, list[dict[str, Any]]], int],
) -> None:
    resource, _ = vercel_database
    assert upsert(resource, []) == 0


def test_upsert_matches_preserves_existing_results_and_conflict_key_scopes(
    vercel_database: tuple[VercelPostgresResource, sqlite3.Connection],
) -> None:
    resource, database = vercel_database
    match = {
        "league": "E0",
        "year": 2026,
        "date": "2026-10-24",
        "home_team": "Arsenal",
        "away_team": "Liverpool",
        "ft_home_goals": 2,
        "ft_away_goals": 1,
        "ft_result": "H",
    }
    assert resource.upsert_matches([match]) == 1
    assert resource.upsert_matches([match]) == 0

    conflicting_match = {
        **match,
        "year": 2027,
        "ft_home_goals": 0,
        "ft_away_goals": 3,
        "ft_result": "A",
    }
    assert resource.upsert_matches([conflicting_match]) == 0
    assert [dict(row) for row in database.execute("SELECT * FROM matches")] == [match]

    new_matches = [
        {**match, **key_change}
        for key_change in [
            {"league": "I1"},
            {"date": "2026-10-25"},
            {"home_team": "Chelsea"},
            {"away_team": "Chelsea"},
        ]
    ]
    assert resource.upsert_matches(new_matches) == 4
    stored_matches = [dict(row) for row in database.execute("SELECT * FROM matches")]
    assert len(stored_matches) == 5
    for expected_match in [match, *new_matches]:
        assert expected_match in stored_matches


def test_upsert_teams_ignores_duplicates_and_preserves_conflict_key_scopes(
    vercel_database: tuple[VercelPostgresResource, sqlite3.Connection],
) -> None:
    resource, database = vercel_database
    team = {"league": "E0", "year": 2026, "team": "Arsenal"}
    assert resource.upsert_teams([team]) == 1
    assert resource.upsert_teams([team]) == 0

    new_teams = [
        {**team, **key_change}
        for key_change in [
            {"league": "I1"},
            {"year": 2027},
            {"team": "Liverpool"},
        ]
    ]
    assert resource.upsert_teams(new_teams) == 3
    stored_teams = [dict(row) for row in database.execute("SELECT * FROM teams")]
    assert len(stored_teams) == 4
    for expected_team in [team, *new_teams]:
        assert expected_team in stored_teams


def test_upsert_pace_sheet_entries_updates_points_and_preserves_conflict_key_scopes(
    vercel_database: tuple[VercelPostgresResource, sqlite3.Connection],
) -> None:
    resource, database = vercel_database
    entry = {
        "league": "E0",
        "year": 2026,
        "team_finish": 1,
        "opponent_finish": 2,
        "home": True,
        "expected_points": 1.5,
    }
    assert resource.upsert_pace_sheet_entries([entry]) == 1
    assert resource.upsert_pace_sheet_entries([entry]) == 0

    updated_entry = {**entry, "expected_points": 2.5}
    assert resource.upsert_pace_sheet_entries([updated_entry]) == 1
    assert resource.upsert_pace_sheet_entries([updated_entry]) == 0

    new_entries = [
        {**entry, **key_change}
        for key_change in [
            {"league": "I1"},
            {"year": 2027},
            {"team_finish": 3},
            {"opponent_finish": 3},
            {"home": False},
        ]
    ]
    assert resource.upsert_pace_sheet_entries(new_entries) == 5
    stored_entries = [
        dict(row) for row in database.execute("SELECT * FROM pace_sheet_entries")
    ]
    assert len(stored_entries) == 6
    for expected_entry in [updated_entry, *new_entries]:
        assert expected_entry in stored_entries


@pytest.mark.parametrize(
    ("previous_secondary", "next_secondary"),
    [(None, None), (None, "#ffffff"), ("#ffffff", None), ("#ffffff", "#000000")],
)
def test_upsert_team_colors_updates_both_colors(
    vercel_database: tuple[VercelPostgresResource, sqlite3.Connection],
    previous_secondary: str | None,
    next_secondary: str | None,
) -> None:
    resource, database = vercel_database
    colors = {
        "team": "Arsenal",
        "primary_color": "#ff0000",
        "secondary_color": previous_secondary,
    }
    assert resource.upsert_team_colors([colors]) == 1
    assert resource.upsert_team_colors([colors]) == 1

    updated_colors = {
        **colors,
        "primary_color": "#dd0000",
        "secondary_color": next_secondary,
    }
    assert resource.upsert_team_colors([updated_colors]) == 1

    new_colors = {**colors, "team": "Liverpool"}
    assert resource.upsert_team_colors([new_colors]) == 1
    stored_colors = [
        dict(row) for row in database.execute("SELECT * FROM team_colors ORDER BY team")
    ]
    assert stored_colors == [updated_colors, new_colors]


@pytest.mark.parametrize(
    ("previous_kickoff", "next_kickoff", "affected_rows"),
    [
        ("2026-10-24T14:00:00Z", "2026-10-24T14:00:00Z", 0),
        (None, None, 0),
        ("2026-10-24T14:00:00Z", "2026-10-25T15:00:00Z", 1),
        (None, "2026-10-24T14:00:00Z", 1),
        ("2026-10-24T14:00:00Z", None, 1),
    ],
    ids=["unchanged", "still-unknown", "rescheduled", "scheduled", "postponed"],
)
def test_upsert_fixtures_only_updates_changed_kickoff_times(
    vercel_database: tuple[VercelPostgresResource, sqlite3.Connection],
    previous_kickoff: str | None,
    next_kickoff: str | None,
    affected_rows: int,
) -> None:
    resource, database = vercel_database
    fixture = {
        "league": "E0",
        "year": 2026,
        "home_team": "Arsenal",
        "away_team": "Liverpool",
        "kickoff_time": previous_kickoff,
    }
    assert resource.upsert_fixtures([fixture]) == 1

    updated_fixture = {
        **fixture,
        "kickoff_time": next_kickoff,
        "finished_provisional": True,
        "ft_home_goals": 2,
        "ft_away_goals": 1,
    }
    assert resource.upsert_fixtures([updated_fixture]) == affected_rows
    assert [dict(row) for row in database.execute("SELECT * FROM fixtures")] == [
        {**fixture, "kickoff_time": next_kickoff}
    ]
    assert resource.upsert_fixtures([updated_fixture]) == 0


def test_upsert_fixtures_preserves_conflict_key_scopes(
    vercel_database: tuple[VercelPostgresResource, sqlite3.Connection],
) -> None:
    resource, database = vercel_database
    fixture = {
        "league": "E0",
        "year": 2026,
        "home_team": "Arsenal",
        "away_team": "Liverpool",
        "kickoff_time": None,
    }
    assert resource.upsert_fixtures([fixture]) == 1
    assert resource.upsert_fixtures([fixture]) == 0

    new_fixtures = [
        {**fixture, **key_change}
        for key_change in [
            {"league": "I1"},
            {"year": 2027},
            {"home_team": "Chelsea"},
            {"away_team": "Everton"},
        ]
    ]
    assert resource.upsert_fixtures(new_fixtures) == 4
    stored_fixtures = [dict(row) for row in database.execute("SELECT * FROM fixtures")]
    assert len(stored_fixtures) == 5
    for expected_fixture in [fixture, *new_fixtures]:
        assert expected_fixture in stored_fixtures
