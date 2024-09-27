from dagster import AssetSelection, define_asset_job

results_job = define_asset_job(
    name="results_job",
    selection=AssetSelection.groups("MatchResults"),
)

pace_sheets_job = define_asset_job(
    name="pace_sheets_job",
    selection=AssetSelection.groups("PaceSheet"),
)
