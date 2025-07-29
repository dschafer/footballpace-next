import datetime
from typing import Literal, Optional

from dagster_polars.patito import patito_model_to_dagster_type
import patito as pt


class Match(pt.Model):
    league: str
    year: int
    date: datetime.date
    home_team: str
    away_team: str
    ft_home_goals: int = pt.Field(ge=0)
    ft_away_goals: int = pt.Field(ge=0)
    ft_result: Literal["H", "A", "D"]


MatchDagsterType = patito_model_to_dagster_type(Match)


class Fixture(pt.Model):
    league: str
    year: int
    kickoff_time: datetime.datetime
    home_team: str
    away_team: str


FixtureDagsterType = patito_model_to_dagster_type(Fixture)


class FPLFixture(Fixture):
    finished_provisional: bool
    ft_home_goals: Optional[int] = pt.Field(ge=0)
    ft_away_goals: Optional[int] = pt.Field(ge=0)


FPLFixtureDagsterType = patito_model_to_dagster_type(FPLFixture)


class PaceSheetEntry(pt.Model):
    league: str
    year: int
    team_finish: int = pt.Field(ge=1)
    opponent_finish: int = pt.Field(ge=1)
    home: bool
    expected_points: float = pt.Field(ge=0, le=3)


PaceSheetEntryDagsterType = patito_model_to_dagster_type(PaceSheetEntry)


class TeamColors(pt.Model):
    team: str = pt.Field(unique=True)
    primary_color: str = pt.Field(min_length=6, max_length=6)
    secondary_color: Optional[str] = pt.Field(min_length=6, max_length=6)

    @staticmethod
    def from_json(team_json) -> "TeamColors":
        colors = team_json["colors"]["hex"]
        return TeamColors(
            team=team_json["name"],
            primary_color=colors[0],
            secondary_color=colors[1] if len(colors) > 1 else None,
        )


TeamColorsDagsterType = patito_model_to_dagster_type(TeamColors)


class MatchWithFinish(pt.Model):
    league: str
    year: int
    date: datetime.date
    home_team: str
    away_team: str
    ft_home_goals: int = pt.Field(ge=0)
    ft_away_goals: int = pt.Field(ge=0)
    ft_result: Literal["H", "A", "D"]
    home_finish: int = pt.Field(ge=1)
    away_finish: int = pt.Field(ge=1)


MatchWithFinishDagsterType = patito_model_to_dagster_type(MatchWithFinish)


class StandingsRow(pt.Model):
    league: str
    year: int
    team: str
    wins: int = pt.Field(ge=0)
    losses: int = pt.Field(ge=0)
    draws: int = pt.Field(ge=0)
    points: int = pt.Field(ge=0)
    goals_for: int = pt.Field(ge=0)
    goals_against: int = pt.Field(ge=0)
    goal_difference: int = pt.Field()


StandingsRowDagsterType = patito_model_to_dagster_type(StandingsRow)
