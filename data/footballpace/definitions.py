from pathlib import Path
import warnings

import dagster as dg

warnings.filterwarnings("ignore", category=dg.BetaWarning)

# This file is all noqa: E402 so that we can call warnings.filterwarnings
# above before doing the imports
# ruff: noqa: E402

from . import assets
from .resources.http import HTTPResource
from .resources.footballdata import FootballDataResource
from .resources.vercel import VercelPostgresResource
from .sensors import db_write_sensor
from .schedules import (
    current_season_refresh_schedule,
    fpl_refresh_schedule,
    pace_sheets_refresh_schedule,
)

http_resource = HTTPResource()
defs = dg.Definitions(
    assets=dg.link_code_references_to_git(
        dg.with_source_code_references(dg.load_assets_from_package_module(assets)),
        git_url="https://github.com/dschafer/footballpace-next",
        git_branch="main",
        file_path_mapping=dg.AnchorBasedFilePathMapping(
            local_file_anchor=Path(__file__),
            file_anchor_path_in_repository="data/footballpace/__init__.py",
        ),
    ),
    resources={
        "football_data": FootballDataResource(http_resource=http_resource),
        "http_resource": http_resource,
        "vercel_postgres": VercelPostgresResource(
            host=dg.EnvVar("VERCEL_POSTGRES_HOST"),
            dbname=dg.EnvVar("VERCEL_POSTGRES_DATABASE"),
            user=dg.EnvVar("VERCEL_POSTGRES_USER"),
            password=dg.EnvVar("VERCEL_POSTGRES_PASSWORD"),
        ),
    },
    schedules=[
        current_season_refresh_schedule,
        fpl_refresh_schedule,
        pace_sheets_refresh_schedule,
    ],
    sensors=[db_write_sensor],
)
