import json

import dagster as dg
import polars as pl

from footballpace.canonical import canonical_name
from footballpace.dataversion import bytes_data_version, eager_respecting_data_version
from footballpace.defs.models import TeamColors, TeamColorsDagsterType
from footballpace.defs.resources.http import HTTPResource
from footballpace.defs.resources.vercel import VercelPostgresResource
from footballpace.markdown import markdown_metadata


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


@dg.asset(
    group_name="TeamColors",
    kinds={"Polars"},
    code_version="v3",
    dagster_type=TeamColorsDagsterType,
    metadata=TeamColorsDagsterType.metadata,
    automation_condition=eager_respecting_data_version,
)
def team_colors_df(team_colors_json: bytes) -> dg.Output[pl.DataFrame]:
    """Convert the JSON from jimniels/teamcolors into a Polars DataFrame."""

    all_teams_obj = json.loads(team_colors_json)
    epl_teams_obj = [team for team in all_teams_obj if team["league"] == "epl"]
    epl_teams = pl.DataFrame([TeamColors.from_json(team) for team in epl_teams_obj])

    epl_teams = epl_teams.with_columns(
        pl.col("team").map_elements(canonical_name, return_dtype=pl.String)
    )
    metadata_teams = epl_teams.get_column("team").sort().unique().to_list()

    return dg.Output(
        epl_teams,
        metadata={
            "dagster/row_count": len(epl_teams),
            "preview": markdown_metadata(epl_teams.head()),
            "teams": metadata_teams,
        },
    )


@dg.asset(
    group_name="TeamColors",
    kinds={"Postgres"},
    code_version="v2",
    ins={"team_colors_df": dg.AssetIn(dagster_type=TeamColorsDagsterType)},
    metadata={
        **TeamColorsDagsterType.metadata,
        "dagster/table_name": "team_colors",
    },
    tags={"db_write": "true"},
    automation_condition=eager_respecting_data_version,
)
def team_colors_postgres(
    team_colors_df: pl.DataFrame, vercel_postgres: VercelPostgresResource
) -> dg.Output[None]:
    """Writes the team colors into Postgres."""
    rowcount = vercel_postgres.upsert_team_colors(team_colors_df.to_dicts())
    return dg.Output(None, metadata={"dagster/row_count": rowcount})
