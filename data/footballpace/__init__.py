from dagster import Definitions, EnvVar

from .assets import all_assets
from .resources import FootballDataResource, VercelPostgresResource
from .jobs import all_assets_job, current_season_daily_refresh_schedule

defs = Definitions(
    assets=all_assets,
    jobs=[all_assets_job],
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
)
