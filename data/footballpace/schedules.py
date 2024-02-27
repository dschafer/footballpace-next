from dagster import MultiPartitionKey, RunRequest, schedule

from .jobs import all_assets_job
from .partitions import all_leagues, all_seasons


@schedule(cron_schedule="0 0 * * *", job=all_assets_job)
def current_season_daily_refresh_schedule():
    latest_season = all_seasons[-1]

    def run_request(league: str) -> RunRequest:
        return RunRequest(
            run_key=league,
            partition_key=MultiPartitionKey(
                {
                    "season": latest_season,
                    "league": league,
                }
            ),
        )

    return [run_request(league) for league in all_leagues]
