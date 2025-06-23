from pathlib import Path
from dagster import BetaWarning

import warnings

warnings.filterwarnings("ignore", category=BetaWarning)

# This file is all noqa: E402 so that we can call warnings.filterwarnings
# above before doing the imports
# ruff: noqa: E402

from dagster import (
    AnchorBasedFilePathMapping,
    Definitions,
    EnvVar,
    link_code_references_to_git,
    load_assets_from_package_module,
    with_source_code_references,
)

from footballpace.resources.http import HTTPResource


from . import assets
from .resources.footballdata import FootballDataResource
from .resources.vercel import VercelPostgresResource
from .sensors import db_write_sensor
from .schedules import (
    current_season_refresh_schedule,
    fpl_refresh_schedule,
    pace_sheets_refresh_schedule,
)

http_resource = HTTPResource()
defs = Definitions(
    assets=link_code_references_to_git(
        with_source_code_references(load_assets_from_package_module(assets)),
        git_url="https://github.com/dschafer/footballpace-next",
        git_branch="main",
        file_path_mapping=AnchorBasedFilePathMapping(
            local_file_anchor=Path(__file__),
            file_anchor_path_in_repository="data/footballpace/__init__.py",
        ),
    ),
    resources={
        "football_data": FootballDataResource(http_resource=http_resource),
        "http_resource": http_resource,
        "vercel_postgres": VercelPostgresResource(
            host=EnvVar("VERCEL_POSTGRES_HOST"),
            dbname=EnvVar("VERCEL_POSTGRES_DATABASE"),
            user=EnvVar("VERCEL_POSTGRES_USER"),
            password=EnvVar("VERCEL_POSTGRES_PASSWORD"),
        ),
    },
    schedules=[
        current_season_refresh_schedule,
        fpl_refresh_schedule,
        pace_sheets_refresh_schedule,
    ],
    sensors=[db_write_sensor],
)
