import requests
from dagster import ConfigurableResource


class HTTPResource(ConfigurableResource):
    """Resource to fetch data from the internet."""

    def get(self, url) -> requests.Response:
        """Get the provided URL."""
        response = requests.get(url)
        response.raise_for_status()
        return response
