from contextlib import contextmanager

import dagster as dg
import httpx
from pydantic import PrivateAttr


class HTTPResource(dg.ConfigurableResource):
    """Resource to fetch data from the internet."""

    _httpx_client: httpx.Client = PrivateAttr()

    @contextmanager
    def yield_for_execution(self, context: dg.InitResourceContext):
        with httpx.Client() as c:
            self._httpx_client = c
            yield self

    def get(self, url) -> httpx.Response:
        """Get the provided URL."""
        return self._httpx_client.get(url).raise_for_status()
