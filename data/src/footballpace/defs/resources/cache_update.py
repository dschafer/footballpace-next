from typing import Literal

import dagster as dg
import httpx


API_UPDATE_URL = "https://footballpace.com/api/update"
CacheUpdateScope = Literal["fixtures", "matches", "pace-sheets", "teams"]


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

    def _update_league_year(
        self, league: str, year: int, scope: CacheUpdateScope
    ) -> str:
        return self._update({"league": league, "year": year, "scope": scope})

    def update_fixtures(self, league: str, year: int) -> str:
        return self._update_league_year(league, year, "fixtures")

    def update_matches(self, league: str, year: int) -> str:
        return self._update_league_year(league, year, "matches")

    def update_pace_sheets(self, league: str, year: int) -> str:
        return self._update_league_year(league, year, "pace-sheets")

    def update_teams(self, league: str, year: int) -> str:
        return self._update_league_year(league, year, "teams")
