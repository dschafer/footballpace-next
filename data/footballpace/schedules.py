from dagster import DefaultScheduleStatus, MultiPartitionKey, RunRequest, schedule

from .jobs import pace_sheets_job, results_job
from .partitions import ALL_LEAGUES, ALL_SEASONS


@schedule(
    cron_schedule="0 * * * *",
    job=results_job,
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


@schedule(
    cron_schedule="0 3 1 8 *",
    job=pace_sheets_job,
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
