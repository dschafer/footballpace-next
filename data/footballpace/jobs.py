from dagster import (
    AssetSelection,
    define_asset_job,
)

results_job = define_asset_job(
    name="results_job",
    selection=AssetSelection.assets("match_results_csv"),
)

fpl_job = define_asset_job(
    name="fpl_job",
    selection=AssetSelection.assets(
        "fpl_bootstrap_json", "fpl_fixtures_json", "fpl_fixtures_df"
    ),
)

pace_sheets_job = define_asset_job(
    name="pace_sheets_job",
    selection=AssetSelection.groups("PaceSheet"),
)

cache_update_job = define_asset_job(
    name="cache_update_job",
    selection=AssetSelection.groups("CacheUpdate"),
)
