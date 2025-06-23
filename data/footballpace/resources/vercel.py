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

    def upsert_fixtures(self, fixtures: list[dict[str, Any]]) -> int:
        """Given a list of team colors, upserts them into the DB."""
        with self._db_connection.cursor() as cur:
            cur.executemany(
                """INSERT INTO fixtures (league, year, home_team, away_team, kickoff_time)
    VALUES(%(Div)s, %(Season)s, %(TeamH)s, %(TeamA)s, %(KickoffTime)s)
    ON CONFLICT (league, year, home_team, away_team) DO UPDATE SET kickoff_time = EXCLUDED.kickoff_time;""",
                fixtures,
            )
            return cur.rowcount


MatchResultsTableSchema = dg.TableSchema(
    columns=[
        dg.TableColumn(
            "league", "string", constraints=dg.TableColumnConstraints(nullable=False)
        ),
        dg.TableColumn(
            "year", "int", constraints=dg.TableColumnConstraints(nullable=False)
        ),
        dg.TableColumn(
            "date",
            "datetime",
            description="The date of the match. This is a datetime with the appropriate date, no timezone and the time set to 00:00:00",
            constraints=dg.TableColumnConstraints(nullable=False),
        ),
        dg.TableColumn(
            "home_team", "string", constraints=dg.TableColumnConstraints(nullable=False)
        ),
        dg.TableColumn(
            "away_team", "string", constraints=dg.TableColumnConstraints(nullable=False)
        ),
        dg.TableColumn(
            "ft_home_goals",
            "int",
            constraints=dg.TableColumnConstraints(nullable=False, other=[">=0"]),
        ),
        dg.TableColumn(
            "ft_away_goals",
            "int",
            constraints=dg.TableColumnConstraints(nullable=False, other=[">=0"]),
        ),
        dg.TableColumn(
            "ft_result",
            "enum",
            constraints=dg.TableColumnConstraints(
                nullable=False, other=["One of 'H', 'A', 'D'"]
            ),
        ),
    ],
)

PaceSheetEntriesTableSchema = dg.TableSchema(
    columns=[
        dg.TableColumn(
            "league", "string", constraints=dg.TableColumnConstraints(nullable=False)
        ),
        dg.TableColumn(
            "year", "int", constraints=dg.TableColumnConstraints(nullable=False)
        ),
        dg.TableColumn(
            "team_finish",
            "int",
            constraints=dg.TableColumnConstraints(nullable=False, other=[">=1"]),
        ),
        dg.TableColumn(
            "opponent_finish",
            "int",
            constraints=dg.TableColumnConstraints(nullable=False, other=[">=1"]),
        ),
        dg.TableColumn(
            "home", "bool", constraints=dg.TableColumnConstraints(nullable=False)
        ),
        dg.TableColumn(
            "expected_points",
            "float",
            constraints=dg.TableColumnConstraints(nullable=False),
        ),
    ],
)

TeamColorsTableSchema = dg.TableSchema(
    columns=[
        dg.TableColumn(
            "team",
            "string",
            constraints=dg.TableColumnConstraints(nullable=False, unique=True),
        ),
        dg.TableColumn(
            "primary_color",
            "string",
            constraints=dg.TableColumnConstraints(nullable=False),
        ),
        dg.TableColumn(
            "secondary_color",
            "string",
            constraints=dg.TableColumnConstraints(nullable=True),
        ),
    ],
)

FixturesTableSchema = dg.TableSchema(
    columns=[
        dg.TableColumn(
            "league", "string", constraints=dg.TableColumnConstraints(nullable=False)
        ),
        dg.TableColumn(
            "year", "int", constraints=dg.TableColumnConstraints(nullable=False)
        ),
        dg.TableColumn(
            "kickoff_time",
            "datetime",
            description="The date and time of match kickoff with appropriate timezone",
            constraints=dg.TableColumnConstraints(nullable=False),
        ),
        dg.TableColumn(
            "home_team", "string", constraints=dg.TableColumnConstraints(nullable=False)
        ),
        dg.TableColumn(
            "away_team", "string", constraints=dg.TableColumnConstraints(nullable=False)
        ),
    ],
)
