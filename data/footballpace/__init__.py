from dagster import (
    Definitions,
    EnvVar,
    ExperimentalWarning,
    load_assets_from_package_module,
)

import warnings

warnings.filterwarnings("ignore", category=ExperimentalWarning)

# These are all noqa: E402 so that we can call warnings.filterwarnings
# above before doing the imports
from . import assets  # noqa: E402
from .resources import FootballDataResource, VercelPostgresResource  # noqa: E402
from .jobs import cache_update_job, pace_sheets_job  # noqa: E402
from .sensors import db_write_sensor  # noqa: E402
from .schedules import pace_sheets_daily_refresh_schedule  # noqa: E402


defs = Definitions(
    assets=load_assets_from_package_module(assets),
    jobs=[pace_sheets_job, cache_update_job],
    resources={
        "football_data": FootballDataResource(),
        "vercel_postgres": VercelPostgresResource(
            host=EnvVar("VERCEL_POSTGRES_HOST"),
            dbname=EnvVar("VERCEL_POSTGRES_DATABASE"),
            user=EnvVar("VERCEL_POSTGRES_USER"),
            password=EnvVar("VERCEL_POSTGRES_PASSWORD"),
        ),
    },
    schedules=[
        pace_sheets_daily_refresh_schedule,
    ],
    sensors=[db_write_sensor],
)
