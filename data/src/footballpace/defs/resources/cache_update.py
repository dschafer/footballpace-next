import dagster as dg
import httpx


API_UPDATE_URL = "https://footballpace.com/api/update"


class CacheUpdateResource(dg.ConfigurableResource):
    """Resource to trigger the Next.js cache update endpoint."""

    bearer_token: str

    def update(self) -> str:
        response = httpx.post(
            API_UPDATE_URL,
            headers={"Authorization": f"Bearer {self.bearer_token}"},
        ).raise_for_status()
        return response.text
