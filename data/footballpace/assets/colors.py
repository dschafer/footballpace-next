from typing import Optional
import pandas as pd

from dagster import (
    MetadataValue,
    Output,
    asset,
)

import json
from dagster_pandas import PandasColumn, create_dagster_pandas_dataframe_type
import requests


@asset(
    group_name="Colors",
    compute_kind="API",
    code_version="v1",
)
def colors_json() -> Output[bytes]:
    """Scrapes the latest JSON colors from jimniels/teamcolors.

    Business logic here should be kept to an absolute minimum, so that the
    results of this stage of the pipeline can be cached.
    """
    teams_json = requests.get(
        "https://raw.githubusercontent.com/jimniels/teamcolors/refs/heads/main/src/teams.json"
    ).content

    return Output(teams_json, metadata={"size": len(teams_json)})


ColorsDataFrame = create_dagster_pandas_dataframe_type(
    name="ColorsDataFrame",
    columns=[
        PandasColumn.string_column("Team", non_nullable=True, unique=True),
        PandasColumn.string_column("Primary", non_nullable=True),
        PandasColumn.string_column("Secondary"),
    ],
    metadata_fn=lambda df: {
        "dagster/row_count": len(df),
        "preview": MetadataValue.md(df.head().to_markdown()),
    },
)


def colors_dict(team) -> dict[str, Optional[str]]:
    colors = team["colors"]["hex"]
    return {
        "Team": team["name"],
        "Primary": colors[0],
        "Secondary": colors[1] if len(colors) > 1 else None,
    }


@asset(
    group_name="Colors",
    compute_kind="Pandas",
    code_version="v1",
    dagster_type=ColorsDataFrame,
)
def colors_df(colors_json: bytes) -> Output[pd.DataFrame]:
    """Convert the JSON from jimniels/teamcolors into a Pandas DataFrame."""

    all_teams_obj = json.loads(colors_json)
    epl_teams_obj = [team for team in all_teams_obj if team["league"] == "epl"]
    epl_teams = pd.DataFrame.from_records([colors_dict(team) for team in epl_teams_obj])

    return Output(
        epl_teams,
        metadata={
            "dagster/row_count": len(epl_teams),
            "preview": MetadataValue.md(epl_teams.head().to_markdown()),
        },
    )
