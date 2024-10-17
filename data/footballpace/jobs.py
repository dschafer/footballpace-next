from dagster import (
    AssetSelection,
    define_asset_job,
)

pace_sheets_job = define_asset_job(
    name="pace_sheets_job",
    selection=AssetSelection.groups("PaceSheet"),
)

cache_update_job = define_asset_job(
    name="cache_update_job",
    selection=AssetSelection.groups("CacheUpdate"),
)
