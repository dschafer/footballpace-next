import dagster as dg

from footballpace.partitions import ALL_LEAGUES, ALL_SEASONS


@dg.schedule(
    name="current_season_refresh_schedule",
    cron_schedule="0 * * * *",
    target=dg.AssetSelection.assets("match_results_csv"),
    default_status=dg.DefaultScheduleStatus.RUNNING,
)
def current_season_refresh_schedule():
    latest_season = ALL_SEASONS[-1]

    def run_request(league: str) -> dg.RunRequest:
        return dg.RunRequest(
            run_key=league,
            partition_key=dg.MultiPartitionKey(
                {
                    "season": str(latest_season),
                    "league": league,
                }
            ),
        )

    return [run_request(league) for league in ALL_LEAGUES]


fpl_refresh_schedule = dg.ScheduleDefinition(
    name="fpl_refresh_schedule",
    cron_schedule="0 * * * *",
    target=dg.AssetSelection.assets("fpl_bootstrap_json", "fpl_fixtures_json"),
    default_status=dg.DefaultScheduleStatus.RUNNING,
)


@dg.schedule(
    name="pace_sheets_refresh_schedule",
    cron_schedule="0 3 1 8 *",
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
