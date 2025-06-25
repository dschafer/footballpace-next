import os

import dagster as dg
import httpx

API_UPDATE_URL = "https://footballpace.com/api/update"


@dg.asset(
    group_name="CacheUpdate",
    kinds={"vercel"},
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
