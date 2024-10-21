from dagster import ExperimentalWarning

import warnings

warnings.filterwarnings("ignore", category=ExperimentalWarning)

# This file is all noqa: E402 so that we can call warnings.filterwarnings
# above before doing the imports
# ruff: noqa: E402

from dagster import (
    Definitions,
    EnvVar,
    load_assets_from_package_module,
)

from footballpace.resources.http import HTTPResource


from . import assets
from .resources.footballdata import FootballDataResource
from .resources.vercel import VercelPostgresResource
from .jobs import cache_update_job, fpl_job, pace_sheets_job, results_job
from .sensors import db_write_sensor
from .schedules import (
    current_season_refresh_schedule,
    fpl_refresh_schedule,
    pace_sheets_refresh_schedule,
)

http_resource = HTTPResource()
defs = Definitions(
    assets=load_assets_from_package_module(assets),
    jobs=[
        cache_update_job,
        fpl_job,
        pace_sheets_job,
        results_job,
    ],
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
