from contextlib import contextmanager
from pydantic import PrivateAttr
import requests
from dagster import ConfigurableResource, InitResourceContext


class HTTPResource(ConfigurableResource):
    """Resource to fetch data from the internet."""

    _request_session: requests.Session = PrivateAttr()

    @contextmanager
    def yield_for_execution(self, context: InitResourceContext):
        with requests.Session() as s:
            self._request_session = s
            yield self

    def get(self, url) -> requests.Response:
        """Get the provided URL."""
        response = self._request_session.get(url)
        response.raise_for_status()
        return response
