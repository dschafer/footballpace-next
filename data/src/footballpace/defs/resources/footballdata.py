import dagster as dg
import httpx

from .http import HTTPResource


class FootballDataResource(dg.ConfigurableResource):
    """Resource to fetch data from https://www.football-data.co.uk."""

    http_resource: HTTPResource

    def request(self, season: int, league: str) -> httpx.Response:
        """Get the CSV for a given season (as an int representing the starting
        year, so for the the 2023-2024, one would pass 2023) and league.

        Raises an exception on failure."""
        return self.http_resource.get(self.url(season, league))

    def url(self, season: int, league: str) -> str:
        """Helper method to construct the correct URL."""
        season_str = "{0:02d}{1:02d}".format(season % 100, (season + 1) % 100)
        return f"https://www.football-data.co.uk/mmz4281/{season_str}/{league}.csv"
