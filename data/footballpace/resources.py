from contextlib import contextmanager
from pydantic import PrivateAttr
import requests
import psycopg
from requests import Response
from dagster import (
    ConfigurableResource,
    InitResourceContext,
)
from typing import Any


class FootballDataResource(ConfigurableResource):
    """Resource to fetch data from https://www.football-data.co.uk."""

    def request(self, season: int, league: str) -> Response:
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
                """INSERT INTO matches ("League", "Season", "Date", "HomeTeam", "AwayTeam", "FTHG", "FTAG", "FTR")
    VALUES(%(Div)s, %(Season)s, %(Date)s, %(HomeTeam)s, %(AwayTeam)s, %(FTHG)s, %(FTAG)s, %(FTR)s)
    ON CONFLICT ("League", "Date", "HomeTeam", "AwayTeam") DO NOTHING;""",
                matches,
            )
            return cur.rowcount
