from dagster import MultiPartitionKey, RunRequest, schedule

from .jobs import results_job
from .partitions import ALL_LEAGUES, ALL_SEASONS


@schedule(cron_schedule="0 0 * * *", job=results_job)
def current_season_daily_refresh_schedule():
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
