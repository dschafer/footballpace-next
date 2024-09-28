from typing import Optional
import pandas as pd

from dagster import (
    AssetIn,
    MetadataValue,
    Output,
    asset,
)

import json
from dagster_pandas import PandasColumn, create_dagster_pandas_dataframe_type
import requests

from footballpace.resources import VercelPostgresResource
from footballpace.resources import TeamColorsTableSchema


@asset(
    group_name="TeamColors",
    compute_kind="API",
    code_version="v1",
)
def team_colors_json() -> Output[bytes]:
    """Scrapes the latest JSON colors from jimniels/teamcolors.

    Business logic here should be kept to an absolute minimum, so that the
    results of this stage of the pipeline can be cached.
    """
    teams_json = requests.get(
        "https://raw.githubusercontent.com/jimniels/teamcolors/refs/heads/main/src/teams.json"
    ).content

    return Output(teams_json, metadata={"size": len(teams_json)})


TeamColorsDataFrame = create_dagster_pandas_dataframe_type(
    name="TeamColorsDataFrame",
    columns=[
        PandasColumn.string_column("Team", non_nullable=True, unique=True),
        PandasColumn.string_column("PrimaryColor", non_nullable=True),
        PandasColumn.string_column("SecondaryColor"),
    ],
    metadata_fn=lambda df: {
        "dagster/row_count": len(df),
        "preview": MetadataValue.md(df.head().to_markdown()),
    },
)


def team_colors_dict(team) -> dict[str, Optional[str]]:
    colors = team["colors"]["hex"]
    return {
        "Team": team["name"],
        "PrimaryColor": colors[0],
        "SecondaryColor": colors[1] if len(colors) > 1 else None,
    }


@asset(
    group_name="TeamColors",
    compute_kind="Pandas",
    code_version="v1",
    dagster_type=TeamColorsDataFrame,
)
def team_colors_df(team_colors_json: bytes) -> Output[pd.DataFrame]:
    """Convert the JSON from jimniels/teamcolors into a Pandas DataFrame."""

    all_teams_obj = json.loads(team_colors_json)
    epl_teams_obj = [team for team in all_teams_obj if team["league"] == "epl"]
    epl_teams = pd.DataFrame.from_records(
        [team_colors_dict(team) for team in epl_teams_obj]
    )

    return Output(
        epl_teams,
        metadata={
            "dagster/row_count": len(epl_teams),
            "preview": MetadataValue.md(epl_teams.head().to_markdown()),
        },
    )


@asset(
    group_name="TeamColors",
    compute_kind="Postgres",
    code_version="v1",
    ins={"team_colors_df": AssetIn(dagster_type=TeamColorsDataFrame)},
    metadata={"dagster/column_schema": TeamColorsTableSchema},
    tags={"db_write": "true"},
)
def team_colors_postgres(
    team_colors_df: pd.DataFrame, vercel_postgres: VercelPostgresResource
) -> Output[None]:
    """Ensure all rows from the standings DataFrame are in Postgres."""
    rows = [
        {str(col): val for col, val in row.items()}
        for row in team_colors_df.to_dict("records")
    ]
    rowcount = vercel_postgres.upsert_team_colors(rows)
    return Output(None, metadata={"dagster/partition_row_count": rowcount})
