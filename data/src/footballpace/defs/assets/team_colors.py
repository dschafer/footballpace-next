import json
from typing import Optional

import dagster as dg
import dagster_pandas as dg_pd
import pandas as pd

from footballpace.canonical import canonical_name
from footballpace.dataversion import bytes_data_version, eager_respecting_data_version
from footballpace.defs.resources.http import HTTPResource
from footballpace.defs.resources.vercel import (
    TeamColorsTableSchema,
    VercelPostgresResource,
)


@dg.asset(
    group_name="TeamColors",
    kinds={"json"},
    code_version="v1",
    metadata={
        "dagster/uri": "https://raw.githubusercontent.com/jimniels/teamcolors/refs/heads/main/src/teams.json"
    },
)
def team_colors_json(http_resource: HTTPResource) -> dg.Output[bytes]:
    """Scrapes the latest JSON colors from jimniels/teamcolors.

    Business logic here should be kept to an absolute minimum, so that the
    results of this stage of the pipeline can be cached.
    """
    teams_json = http_resource.get(
        "https://raw.githubusercontent.com/jimniels/teamcolors/refs/heads/main/src/teams.json"
    ).content

    data_version = bytes_data_version(teams_json)

    return dg.Output(
        teams_json,
        metadata={"size": len(teams_json)},
        data_version=dg.DataVersion(data_version),
    )


TeamColorsDataFrame = dg_pd.create_dagster_pandas_dataframe_type(
    name="TeamColorsDataFrame",
    columns=[
        dg_pd.PandasColumn.string_column("Team", non_nullable=True, unique=True),
        dg_pd.PandasColumn.string_column("PrimaryColor", non_nullable=True),
        dg_pd.PandasColumn.string_column("SecondaryColor"),
    ],
    metadata_fn=lambda df: {
        "dagster/row_count": len(df),
        "preview": dg.MetadataValue.md(df.head().to_markdown()),
    },
)


def team_colors_dict(team) -> dict[str, Optional[str]]:
    colors = team["colors"]["hex"]
    return {
        "Team": team["name"],
        "PrimaryColor": colors[0],
        "SecondaryColor": colors[1] if len(colors) > 1 else None,
    }


@dg.asset(
    group_name="TeamColors",
    kinds={"Pandas"},
    code_version="v2",
    dagster_type=TeamColorsDataFrame,
    automation_condition=eager_respecting_data_version,
)
def team_colors_df(team_colors_json: bytes) -> dg.Output[pd.DataFrame]:
    """Convert the JSON from jimniels/teamcolors into a Pandas DataFrame."""

    all_teams_obj = json.loads(team_colors_json)
    epl_teams_obj = [team for team in all_teams_obj if team["league"] == "epl"]
    epl_teams = pd.DataFrame.from_records(
        [team_colors_dict(team) for team in epl_teams_obj]
    )

    epl_teams["Team"] = epl_teams["Team"].map(canonical_name)
    metadata_teams = epl_teams["Team"].sort_values().unique().tolist()

    return dg.Output(
        epl_teams,
        metadata={
            "dagster/row_count": len(epl_teams),
            "preview": dg.MetadataValue.md(epl_teams.head().to_markdown()),
            "teams": metadata_teams,
        },
    )


@dg.asset(
    group_name="TeamColors",
    kinds={"Postgres"},
    code_version="v1",
    ins={"team_colors_df": dg.AssetIn(dagster_type=TeamColorsDataFrame)},
    metadata={
        "dagster/column_schema": TeamColorsTableSchema,
        "dagster/table_name": "team_colors",
    },
    tags={"db_write": "true"},
    automation_condition=eager_respecting_data_version,
)
def team_colors_postgres(
    team_colors_df: pd.DataFrame, vercel_postgres: VercelPostgresResource
) -> dg.Output[None]:
    """Writes the team colors into Postgres."""
    rows = [
        {str(col): val for col, val in row.items()}
        for row in team_colors_df.to_dict("records")
    ]
    rowcount = vercel_postgres.upsert_team_colors(rows)
    return dg.Output(None, metadata={"dagster/row_count": rowcount})
