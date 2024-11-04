from contextlib import contextmanager
from pydantic import PrivateAttr
import httpx
from dagster import ConfigurableResource, InitResourceContext


class HTTPResource(ConfigurableResource):
    """Resource to fetch data from the internet."""

    _httpx_client: httpx.Client = PrivateAttr()

    @contextmanager
    def yield_for_execution(self, context: InitResourceContext):
        with httpx.Client() as c:
            self._httpx_client = c
            yield self

    def get(self, url) -> httpx.Response:
        """Get the provided URL."""
        return self._httpx_client.get(url).raise_for_status()
