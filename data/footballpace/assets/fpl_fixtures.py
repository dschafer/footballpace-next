from datetime import datetime
from typing import Iterator
import pandas as pd

from dagster import (
    AssetExecutionContext,
    AssetIn,
    AutomationCondition,
    DataVersion,
    MetadataValue,
    Output,
    asset,
)

import json
from dagster_pandas import PandasColumn, create_dagster_pandas_dataframe_type

from footballpace.canonical import canonical_name
from footballpace.dataversion import (
    bytes_data_version,
    df_data_version,
    previous_data_version,
)
from footballpace.resources.http import HTTPResource
from footballpace.resources.vercel import (
    MatchResultsTableSchema,
    VercelPostgresResource,
)


@asset(group_name="FPL", kinds={"API"}, code_version="v1", output_required=False)
def fpl_bootstrap_json(
    context: AssetExecutionContext, http_resource: HTTPResource
) -> Iterator[Output[bytes]]:
    """Pulls the bootstrap JSON from https://fantasy.premierleague.com/api/bootstrap-static/.

    Business logic here should be kept to an absolute minimum, so that the
    results of this stage of the pipeline can be cached.
    """
    bootstrap_json = http_resource.get(
        "https://fantasy.premierleague.com/api/bootstrap-static/"
    ).content

    data_version = bytes_data_version(bootstrap_json)

    if data_version == previous_data_version(context):
        context.log.debug("Skipping materializations; data versions match")
        return

    yield Output(
        bootstrap_json,
        metadata={"size": len(bootstrap_json)},
        data_version=DataVersion(data_version),
    )


@asset(group_name="FPL", kinds={"API"}, code_version="v1", output_required=False)
def fpl_fixtures_json(
    context: AssetExecutionContext, http_resource: HTTPResource
) -> Iterator[Output[bytes]]:
    """Pulls the bootstrap JSON from https://fantasy.premierleague.com/api/fixtures/.

    Business logic here should be kept to an absolute minimum, so that the
    results of this stage of the pipeline can be cached.
    """
    fixtures_json = http_resource.get(
        "https://fantasy.premierleague.com/api/fixtures/"
    ).content

    data_version = bytes_data_version(fixtures_json)

    if data_version == previous_data_version(context):
        context.log.debug("Skipping materializations; data versions match")
        return

    yield Output(
        fixtures_json,
        metadata={"size": len(fixtures_json)},
        data_version=DataVersion(data_version),
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


@asset(group_name="FPL", kinds={"Pandas"}, code_version="v2", output_required=False)
def fpl_fixtures_df(
    context: AssetExecutionContext, fpl_bootstrap_json: bytes, fpl_fixtures_json: bytes
) -> Iterator[Output[pd.DataFrame]]:
    """
    Convert the JSON from https://fantasy.premierleague.com into a Pandas DataFrame.

    This also uses DataVersions to detect if changes have been made (and will opt not
    to materialize if not). This is because the bootstrap_json changes constantly
    with additional fantasy-specific info, but we have to fetch it for the team IDs.

    So this asset is our primary "short-circuit" to prevent us from writing data over
    and over again from FPL.
    """

    fpl_bootstrap_obj = json.loads(fpl_bootstrap_json)
    fpl_fixtures_obj = json.loads(fpl_fixtures_json)

    team_idents_dict = team_idents(fpl_bootstrap_obj)

    df = pd.DataFrame.from_records(
        [
            fixture_dict(team_idents_dict, fixture)
            for fixture in fpl_fixtures_obj
            if fixture["finished_provisional"]
        ]
    )
    df["HomeTeam"] = df["HomeTeam"].map(canonical_name)
    df["AwayTeam"] = df["AwayTeam"].map(canonical_name)
    df["Date"] = (
        pd.to_datetime(df["Date"], format="ISO8601").dt.tz_convert(None).dt.normalize()
    )

    data_version = df_data_version(df)

    if data_version == previous_data_version(context):
        context.log.debug("Skipping materializations; data versions match")
        return

    metadata_teams = (
        pd.concat([df["HomeTeam"], df["AwayTeam"]]).sort_values().unique().tolist()
    )
    yield Output(
        df,
        metadata={
            "dagster/row_count": len(df),
            "preview": MetadataValue.md(df.head().to_markdown()),
            "most_recent_match_date": MetadataValue.text(str(max(df["Date"]))),
            "teams": metadata_teams,
        },
        data_version=DataVersion(data_version),
    )


@asset(
    group_name="FPL",
    kinds={"Postgres"},
    code_version="v1",
    ins={"fpl_fixtures_df": AssetIn(dagster_type=FPLFixturesDataFrame)},
    metadata={"dagster/column_schema": MatchResultsTableSchema},
    tags={"db_write": "true"},
    automation_condition=AutomationCondition.eager(),
)
def fpl_fixtures_postgres(
    fpl_fixtures_df: pd.DataFrame, vercel_postgres: VercelPostgresResource
) -> Output[None]:
    """Writes the fixtures from FPL into Postgres."""
    rows = [
        {str(col): val for col, val in row.items()}
        for row in fpl_fixtures_df.to_dict("records")
    ]
    rowcount = vercel_postgres.upsert_matches(rows)
    return Output(None, metadata={"dagster/partition_row_count": rowcount})
