import os
from dagster import asset

import requests

API_UPDATE_URL = "https://footballpace.com/api/update"


@asset(
    group_name="CacheUpdate",
    compute_kind="vercel",
)
def cache_update() -> None:
    """
    Make sure that Next.js updates its caches.

    All of the inputs are deliberately unused; they just indicate the assets that
    write to a DB and hence require a downstream effect.
    """

    bearer_token = os.getenv("UPDATE_BEARER_TOKEN")
    headers = {"Authorization": f"Bearer {bearer_token}"}

    requests.post(API_UPDATE_URL, headers=headers).raise_for_status()
