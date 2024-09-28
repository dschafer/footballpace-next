from dagster import (
    Definitions,
    EnvVar,
    load_assets_from_package_module,
)

from . import assets
from .resources import FootballDataResource, VercelPostgresResource
from .jobs import cache_update_job, pace_sheets_job, results_job
from .sensors import db_write_sensor
from .schedules import current_season_daily_refresh_schedule

defs = Definitions(
    assets=load_assets_from_package_module(assets),
    jobs=[results_job, pace_sheets_job, cache_update_job],
    resources={
        "football_data": FootballDataResource(),
        "vercel_postgres": VercelPostgresResource(
            host=EnvVar("POSTGRES_HOST"),
            dbname=EnvVar("POSTGRES_DATABASE"),
            user=EnvVar("POSTGRES_USER"),
            password=EnvVar("POSTGRES_PASSWORD"),
        ),
    },
    schedules=[current_season_daily_refresh_schedule],
    sensors=[db_write_sensor],
)
