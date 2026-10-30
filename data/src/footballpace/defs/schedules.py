import dagster as dg

from footballpace.partitions import ALL_LEAGUES, ALL_SEASONS


def _current_season_refresh_schedule(league: str, minute: int) -> dg.ScheduleDefinition:
    @dg.schedule(
        name=f"current_season_refresh_{league.lower()}_schedule",
        cron_schedule=f"{minute} * * * *",
        target=dg.AssetSelection.assets("match_results_csv"),
        default_status=dg.DefaultScheduleStatus.RUNNING,
    )
    def refresh_schedule() -> dg.RunRequest:
        return dg.RunRequest(
            run_key=league,
            partition_key=dg.MultiPartitionKey(
                {
                    "season": str(ALL_SEASONS[-1]),
                    "league": league,
                }
            ),
        )

    return refresh_schedule


current_season_refresh_schedules = [
    _current_season_refresh_schedule(league, minute)
    for minute, league in enumerate(ALL_LEAGUES, start=1)
]


fpl_refresh_schedule = dg.ScheduleDefinition(
    name="fpl_refresh_schedule",
    cron_schedule="0 * * * *",
    target=dg.AssetSelection.assets("fpl_bootstrap_json", "fpl_fixtures_json"),
    default_status=dg.DefaultScheduleStatus.RUNNING,
)


@dg.schedule(
    name="pace_sheets_refresh_schedule",
    cron_schedule="0 3 2 8 *",
    target=dg.AssetSelection.groups("PaceSheet"),
    default_status=dg.DefaultScheduleStatus.RUNNING,
)
def pace_sheets_refresh_schedule():
    latest_season = ALL_SEASONS[-1]

    def run_request(league: str) -> dg.RunRequest:
        return dg.RunRequest(
            run_key=league,
            partition_key=dg.MultiPartitionKey(
                {
                    "predicted_season": str(latest_season),
                    "league": league,
                }
            ),
        )

    return [run_request(league) for league in ALL_LEAGUES]
