from dagster import (
    AssetSelection,
    DefaultScheduleStatus,
    MultiPartitionKey,
    RunRequest,
    ScheduleDefinition,
    schedule,
)

from .partitions import ALL_LEAGUES, ALL_SEASONS


@schedule(
    name="current_season_refresh_schedule",
    cron_schedule="0 * * * *",
    target=AssetSelection.assets("match_results_csv"),
    default_status=DefaultScheduleStatus.RUNNING,
)
def current_season_refresh_schedule():
    latest_season = ALL_SEASONS[-1]

    def run_request(league: str) -> RunRequest:
        return RunRequest(
            run_key=league,
            partition_key=MultiPartitionKey(
                {
                    "season": str(latest_season),
                    "league": league,
                }
            ),
        )

    return [run_request(league) for league in ALL_LEAGUES]


fpl_refresh_schedule = ScheduleDefinition(
    name="fpl_refresh_schedule",
    cron_schedule="0 * * * *",
    target=AssetSelection.assets(
        "fpl_bootstrap_json", "fpl_fixtures_json", "fpl_fixtures_df", "fpl_results_df"
    ),
    default_status=DefaultScheduleStatus.RUNNING,
)


@schedule(
    name="pace_sheets_refresh_schedule",
    cron_schedule="0 3 1 8 *",
    target=AssetSelection.groups("PaceSheet"),
    default_status=DefaultScheduleStatus.RUNNING,
)
def pace_sheets_refresh_schedule():
    latest_season = ALL_SEASONS[-1]

    def run_request(league: str) -> RunRequest:
        return RunRequest(
            run_key=league,
            partition_key=MultiPartitionKey(
                {
                    "predicted_season": str(latest_season),
                    "league": league,
                }
            ),
        )

    return [run_request(league) for league in ALL_LEAGUES]
