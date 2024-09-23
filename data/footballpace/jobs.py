from dagster import AssetSelection, define_asset_job

results_job = define_asset_job(
    name="results_job",
    selection=AssetSelection.keys(
        "match_results_csv",
        "match_results_df",
        "match_results_postgres",
        "standings_rows_df",
        "standings_rows_postgres",
    ),
)

pace_sheets_job = define_asset_job(
    name="pace_sheets_job",
    selection=AssetSelection.keys(
        "pace_sheet_entries_df",
        "pace_sheet_entries_postgres",
    ),
)
