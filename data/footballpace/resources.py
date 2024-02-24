from contextlib import contextmanager
from pydantic import PrivateAttr
import requests
import psycopg
from dagster import (
    ConfigurableResource,
    InitResourceContext,
)
from typing import Any


class FootballDataResource(ConfigurableResource):
    """Resource to fetch data from https://www.football-data.co.uk."""

    def request(self, season: int, league: str) -> requests.Response:
        """Get the CSV for a given season (as an int representing the starting
        year, so for the the 2023-2024, one would pass 2023) and league."""
        return requests.get(self._url(season, league))

    def _url(self, season: int, league: str) -> str:
        """Helper method to construct the correct URL."""
        season_str = "{0:02d}{1:02d}".format(season % 100, (season + 1) % 100)
        return f"https://www.football-data.co.uk/mmz4281/{season_str}/{league}.csv"


class VercelPostgresResource(ConfigurableResource):
    """Resource to write data to the Postgres DB"""

    host: str
    dbname: str
    user: str
    password: str

    _db_connection: psycopg.Connection = PrivateAttr()

    @contextmanager
    def yield_for_execution(self, context: InitResourceContext):
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
    VALUES(%(Div)s, %(Season)s, %(Date)s, %(HomeTeam)s, %(AwayTeam)s, %(FTHG)s, %(FTAG)s, %(FTR)s)
    ON CONFLICT (league, date, home_team, away_team) DO NOTHING;""",
                matches,
            )
            return cur.rowcount

    def upsert_standings_rows(self, standings_rows: list[dict[str, Any]]) -> int:
        """Given a list of standings_row, upserts them into the DB."""
        with self._db_connection.cursor() as cur:
            cur.executemany(
                """INSERT INTO standings_rows (league, year, team, wins, losses, draws, goals_for, goals_against)
    VALUES(%(Div)s, %(Season)s, %(Team)s, %(Wins)s, %(Losses)s, %(Draws)s, %(For)s, %(Against)s)
    ON CONFLICT (league, year, team) DO UPDATE SET (wins, losses, draws, goals_for, goals_against) = (EXCLUDED.wins, EXCLUDED.losses, EXCLUDED.draws, EXCLUDED.goals_for, EXCLUDED.goals_against);""",
                standings_rows,
            )
            return cur.rowcount
