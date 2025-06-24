import dagster as dg

from .http import HTTPResource
from .footballdata import FootballDataResource
from .vercel import VercelPostgresResource

http_resource = HTTPResource()


@dg.definitions
def resources() -> dg.Definitions:
    return dg.Definitions(
        resources={
            "football_data": FootballDataResource(http_resource=http_resource),
            "http_resource": http_resource,
            "vercel_postgres": VercelPostgresResource(
                host=dg.EnvVar("VERCEL_POSTGRES_HOST"),
                dbname=dg.EnvVar("VERCEL_POSTGRES_DATABASE"),
                user=dg.EnvVar("VERCEL_POSTGRES_USER"),
                password=dg.EnvVar("VERCEL_POSTGRES_PASSWORD"),
            ),
        }
    )
