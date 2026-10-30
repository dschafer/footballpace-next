import dagster as dg

from footballpace.definitions import defs
from footballpace.defs.schedules import (
    current_season_refresh_schedules,
    pace_sheets_refresh_schedule,
)
from footballpace.partitions import ALL_SEASONS


def test_current_season_refresh_schedules():
    expected_minutes = {"E0": 1, "D1": 2, "SP1": 3, "I1": 4, "F1": 5}
    assert len(current_season_refresh_schedules) == len(expected_minutes)
    scheduled_leagues = set()
    for schedule in current_season_refresh_schedules:
        request = schedule()
        assert isinstance(request, dg.RunRequest)
        assert isinstance(request.partition_key, dg.MultiPartitionKey)
        league = request.partition_key.keys_by_dimension["league"]
        assert schedule.cron_schedule == f"{expected_minutes[league]} * * * *"
        assert request.partition_key.keys_by_dimension["season"] == str(ALL_SEASONS[-1])
        scheduled_leagues.add(league)
    assert scheduled_leagues == set(expected_minutes)


def test_definitions_register_refresh_schedules():
    repository = defs().get_repository_def()
    registered_names = {schedule.name for schedule in repository.schedule_defs}
    assert registered_names == {
        schedule.name for schedule in current_season_refresh_schedules
    } | {"fpl_refresh_schedule", "pace_sheets_refresh_schedule"}


def test_pace_sheets_refresh_schedule():
    schedule = pace_sheets_refresh_schedule()
    assert isinstance(schedule, list)
    scheduled_seasons = set()
    scheduled_leagues = set()
    for s in schedule:
        assert isinstance(s, dg.RunRequest)
        assert isinstance(s.partition_key, dg.MultiPartitionKey)
        scheduled_seasons.add(s.partition_key.keys_by_dimension["predicted_season"])
        scheduled_leagues.add(s.partition_key.keys_by_dimension["league"])
    assert len(scheduled_seasons) == 1
    assert len(scheduled_leagues) > 1
