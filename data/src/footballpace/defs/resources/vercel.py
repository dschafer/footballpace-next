from contextlib import contextmanager
from typing import Any

import dagster as dg
import psycopg
from pydantic import PrivateAttr


class VercelPostgresResource(dg.ConfigurableResource):
    """Resource to write data to the Postgres DB"""

    host: str
    dbname: str
    user: str
    password: str

    _db_connection: psycopg.Connection = PrivateAttr()

    @contextmanager
    def yield_for_execution(self, context: dg.InitResourceContext):
        with psycopg.connect(
            host=self.host,
            dbname=self.dbname,
            user=self.user,
            password=self.password,
        ) as conn:
            self._db_connection = conn
            yield self

    def upsert_matches(self, matches: list[dict[str, Any]]) -> int:
        """Given a list of matches, upserts them into the DB."""
        with self._db_connection.cursor() as cur:
            cur.executemany(
                """INSERT INTO matches (league, year, date, home_team, away_team, ft_home_goals, ft_away_goals, ft_result)
    VALUES(%(league)s, %(year)s, %(date)s, %(home_team)s, %(away_team)s, %(ft_home_goals)s, %(ft_away_goals)s, %(ft_result)s)
    ON CONFLICT (league, date, home_team, away_team) DO NOTHING;""",
                matches,
            )
            return cur.rowcount

    def upsert_pace_sheet_entries(
        self, pace_sheet_entries: list[dict[str, Any]]
    ) -> int:
        """Given a list of pace sheet entries, upserts them into the DB."""
        with self._db_connection.cursor() as cur:
            cur.executemany(
                """INSERT INTO pace_sheet_entries (league, year, team_finish, opponent_finish, home, expected_points)
    VALUES(%(league)s, %(year)s, %(team_finish)s, %(opponent_finish)s, %(home)s, %(expected_points)s)
    ON CONFLICT (league, year, team_finish, opponent_finish, home) DO UPDATE SET expected_points = EXCLUDED.expected_points;""",
                pace_sheet_entries,
            )
            return cur.rowcount

    def upsert_team_colors(self, team_colors: list[dict[str, Any]]) -> int:
        """Given a list of team colors, upserts them into the DB."""
        with self._db_connection.cursor() as cur:
            cur.executemany(
                """INSERT INTO team_colors (team, primary_color, secondary_color)
    VALUES(%(team)s, %(primary_color)s, %(secondary_color)s)
    ON CONFLICT (team) DO UPDATE SET (primary_color, secondary_color) = (EXCLUDED.primary_color, EXCLUDED.secondary_color);""",
                team_colors,
            )
            return cur.rowcount

    def upsert_fixtures(self, fixtures: list[dict[str, Any]]) -> int:
        """Given a list of team colors, upserts them into the DB."""
        with self._db_connection.cursor() as cur:
            cur.executemany(
                """INSERT INTO fixtures (league, year, home_team, away_team, kickoff_time)
    VALUES(%(league)s, %(year)s, %(home_team)s, %(away_team)s, %(kickoff_time)s)
    ON CONFLICT (league, year, home_team, away_team) DO UPDATE SET kickoff_time = EXCLUDED.kickoff_time;""",
                fixtures,
            )
            return cur.rowcount
