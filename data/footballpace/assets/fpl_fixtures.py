from datetime import datetime
from hashlib import sha256
import pandas as pd

from dagster import (
    AutomationCondition,
    DataVersion,
    MetadataValue,
    Output,
    asset,
)

import json
from dagster_pandas import PandasColumn, create_dagster_pandas_dataframe_type

from footballpace.canonical import canonical_name
from footballpace.resources.http import HTTPResource


@asset(
    group_name="FPL",
    compute_kind="API",
    code_version="v1",
)
def fpl_bootstrap_json(http_resource: HTTPResource) -> Output[bytes]:
    """Pulls the bootstrap JSON from https://fantasy.premierleague.com/api/bootstrap-static/.

    Business logic here should be kept to an absolute minimum, so that the
    results of this stage of the pipeline can be cached.
    """
    bootstrap_json = http_resource.get(
        "https://fantasy.premierleague.com/api/bootstrap-static/"
    ).content

    return Output(
        bootstrap_json,
        metadata={"size": len(bootstrap_json)},
        data_version=DataVersion(sha256(bootstrap_json).hexdigest()),
    )


@asset(
    group_name="FPL",
    compute_kind="API",
    code_version="v1",
)
def fpl_fixtures_json(http_resource: HTTPResource) -> Output[bytes]:
    """Pulls the bootstrap JSON from https://fantasy.premierleague.com/api/fixtures/.

    Business logic here should be kept to an absolute minimum, so that the
    results of this stage of the pipeline can be cached.
    """
    fixtures_json = http_resource.get(
        "https://fantasy.premierleague.com/api/fixtures/"
    ).content

    return Output(
        fixtures_json,
        metadata={"size": len(fixtures_json)},
        data_version=DataVersion(sha256(fixtures_json).hexdigest()),
    )


FPLFixturesDataFrame = create_dagster_pandas_dataframe_type(
    name="FPLFixturesDataFrame",
    columns=[
        PandasColumn.string_column("Div"),
        PandasColumn.integer_column("Season"),
        PandasColumn.datetime_column("Date"),
        PandasColumn.string_column("HomeTeam"),
        PandasColumn.string_column("AwayTeam"),
        PandasColumn.integer_column("FTHG", min_value=0),
        PandasColumn.integer_column("FTAG", min_value=0),
        PandasColumn.categorical_column("FTR", categories={"H", "A", "D"}),
    ],
    metadata_fn=lambda df: {
        "dagster/partition_row_count": len(df),
        "preview": MetadataValue.md(df.head().to_markdown()),
    },
)


def result(fixture) -> str:
    if fixture["team_a_score"] > fixture["team_h_score"]:
        return "A"
    if fixture["team_h_score"] > fixture["team_a_score"]:
        return "H"
    return "D"


def fixture_dict(team_idents_dict: dict[int, str], fixture) -> dict:
    season = datetime.now().year
    if datetime.now().month < 8:
        season -= 1
    return {
        "Div": "E0",
        "Season": season,
        "Date": fixture["kickoff_time"],
        "HomeTeam": team_idents_dict[fixture["team_h"]],
        "AwayTeam": team_idents_dict[fixture["team_a"]],
        "FTHG": fixture["team_h_score"],
        "FTAG": fixture["team_a_score"],
        "FTR": result(fixture),
    }


def team_idents(bootstrap_obj) -> dict[int, str]:
    return dict([(team["id"], team["name"]) for team in bootstrap_obj["teams"]])


@asset(
    group_name="FPL",
    compute_kind="Pandas",
    code_version="v2",
    automation_condition=AutomationCondition.on_missing(),
)
def fpl_match_results_df(
    fpl_bootstrap_json: bytes, fpl_fixtures_json: bytes
) -> Output[pd.DataFrame]:
    """Convert the JSON from https://fantasy.premierleague.com into a Pandas DataFrame."""

    fpl_bootstrap_obj = json.loads(fpl_bootstrap_json)
    fpl_fixtures_obj = json.loads(fpl_fixtures_json)

    team_idents_dict = team_idents(fpl_bootstrap_obj)

    df = pd.DataFrame.from_records(
        [
            fixture_dict(team_idents_dict, fixture)
            for fixture in fpl_fixtures_obj
            if fixture["finished"]
        ]
    )
    df["HomeTeam"] = df["HomeTeam"].map(canonical_name)
    df["AwayTeam"] = df["AwayTeam"].map(canonical_name)
    df["Date"] = pd.to_datetime(df["Date"], format="ISO8601")

    metadata_teams = (
        pd.concat([df["HomeTeam"], df["AwayTeam"]]).sort_values().unique().tolist()
    )
    return Output(
        df,
        metadata={
            "dagster/row_count": len(df),
            "preview": MetadataValue.md(df.head().to_markdown()),
            "most_recent_match_date": MetadataValue.text(str(max(df["Date"]))),
            "teams": metadata_teams,
        },
    )
