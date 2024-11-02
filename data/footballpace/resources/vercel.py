from contextlib import contextmanager
from pydantic import PrivateAttr
import psycopg
from dagster import (
    ConfigurableResource,
    InitResourceContext,
    TableColumn,
    TableColumnConstraints,
    TableSchema,
)
from typing import Any


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

    def upsert_pace_sheet_entries(
        self, pace_sheet_entries: list[dict[str, Any]]
    ) -> int:
        """Given a list of pace sheet entries, upserts them into the DB."""
        with self._db_connection.cursor() as cur:
            cur.executemany(
                """INSERT INTO pace_sheet_entries (league, year, team_finish, opponent_finish, home, expected_points)
    VALUES(%(Div)s, %(Season)s, %(TeamFinish)s, %(OpponentFinish)s, %(Home)s, %(ExpectedPoints)s)
    ON CONFLICT (league, year, team_finish, opponent_finish, home) DO UPDATE SET expected_points = EXCLUDED.expected_points;""",
                pace_sheet_entries,
            )
            return cur.rowcount

    def upsert_team_colors(self, team_colors: list[dict[str, Any]]) -> int:
        """Given a list of team colors, upserts them into the DB."""
        with self._db_connection.cursor() as cur:
            cur.executemany(
                """INSERT INTO team_colors (team, primary_color, secondary_color)
    VALUES(%(Team)s, %(PrimaryColor)s, %(SecondaryColor)s)
    ON CONFLICT (team) DO UPDATE SET (primary_color, secondary_color) = (EXCLUDED.primary_color, EXCLUDED.secondary_color);""",
                team_colors,
            )
            return cur.rowcount


MatchResultsTableSchema = TableSchema(
    columns=[
        TableColumn(
            "league", "string", constraints=TableColumnConstraints(nullable=False)
        ),
        TableColumn("year", "int", constraints=TableColumnConstraints(nullable=False)),
        TableColumn(
            "date", "datetime", constraints=TableColumnConstraints(nullable=False)
        ),
        TableColumn(
            "home_team", "string", constraints=TableColumnConstraints(nullable=False)
        ),
        TableColumn(
            "away_team", "string", constraints=TableColumnConstraints(nullable=False)
        ),
        TableColumn(
            "ft_home_goals",
            "int",
            constraints=TableColumnConstraints(nullable=False, other=[">=0"]),
        ),
        TableColumn(
            "ft_away_goals",
            "int",
            constraints=TableColumnConstraints(nullable=False, other=[">=0"]),
        ),
        TableColumn(
            "ft_result",
            "enum",
            constraints=TableColumnConstraints(
                nullable=False, other=["One of 'H', 'A', 'D'"]
            ),
        ),
    ],
)

PaceSheetEntriesTableSchema = TableSchema(
    columns=[
        TableColumn(
            "league", "string", constraints=TableColumnConstraints(nullable=False)
        ),
        TableColumn("year", "int", constraints=TableColumnConstraints(nullable=False)),
        TableColumn(
            "team_finish",
            "int",
            constraints=TableColumnConstraints(nullable=False, other=[">=1"]),
        ),
        TableColumn(
            "opponent_finish",
            "int",
            constraints=TableColumnConstraints(nullable=False, other=[">=1"]),
        ),
        TableColumn("home", "bool", constraints=TableColumnConstraints(nullable=False)),
        TableColumn(
            "expected_points",
            "float",
            constraints=TableColumnConstraints(nullable=False),
        ),
    ],
)

TeamColorsTableSchema = TableSchema(
    columns=[
        TableColumn(
            "team",
            "string",
            constraints=TableColumnConstraints(nullable=False, unique=True),
        ),
        TableColumn(
            "primary_color",
            "string",
            constraints=TableColumnConstraints(nullable=False),
        ),
        TableColumn(
            "secondary_color",
            "string",
            constraints=TableColumnConstraints(nullable=True),
        ),
    ],
)
