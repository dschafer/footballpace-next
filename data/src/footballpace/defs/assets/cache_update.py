import os

import dagster as dg
import httpx

from footballpace.row_count import has_nonzero_row_count

API_UPDATE_URL = "https://footballpace.com/api/update"


@dg.asset(
    group_name="CacheUpdate",
    kinds={"vercel"},
    automation_condition=dg.AutomationCondition.any_deps_match(
        dg.AutomationCondition.newly_updated() & has_nonzero_row_count()
    ),
    deps=[
        "fpl_fixtures_postgres",
        "fpl_results_postgres",
        "match_results_postgres",
        "pace_sheet_entries_postgres",
        "team_colors_postgres",
    ],
)
def cache_update(context: dg.AssetExecutionContext) -> None:
    """
    Make sure that Next.js updates its caches.

    All of the inputs are deliberately unused; they just indicate the assets that
    write to a DB and hence require a downstream effect.
    """

    bearer_token = os.getenv("UPDATE_BEARER_TOKEN")
    headers = {"Authorization": f"Bearer {bearer_token}"}

    response = httpx.post(API_UPDATE_URL, headers=headers).raise_for_status()
    context.log.info(response.text)
