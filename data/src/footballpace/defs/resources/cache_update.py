import dagster as dg
import httpx


API_UPDATE_URL = "https://footballpace.com/api/update"


class CacheUpdateResource(dg.ConfigurableResource):
    """Resource to trigger the Next.js cache update endpoint."""

    bearer_token: str

    def _update(self, params: dict[str, str | int] | None = None) -> str:
        response = httpx.post(
            API_UPDATE_URL,
            headers={"Authorization": f"Bearer {self.bearer_token}"},
            params=params,
        ).raise_for_status()
        return response.text

    def update_league_year(self, league: str, year: int) -> str:
        return self._update({"league": league, "year": year})
