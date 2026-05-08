import dagster as dg

from .cache_update import CacheUpdateResource
from .footballdata import FootballDataResource
from .http import HTTPResource
from .vercel import VercelPostgresResource

http_resource = HTTPResource()


@dg.definitions
def resources() -> dg.Definitions:
    return dg.Definitions(
        resources={
            "cache_update_resource": CacheUpdateResource(
                bearer_token=dg.EnvVar("UPDATE_BEARER_TOKEN"),
            ),
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
