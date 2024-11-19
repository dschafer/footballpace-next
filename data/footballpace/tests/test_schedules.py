from dagster import MultiPartitionKey, RunRequest
from footballpace.schedules import (
    current_season_refresh_schedule,
    pace_sheets_refresh_schedule,
)


def test_current_season_refresh_schedule():
    schedule = current_season_refresh_schedule()
    assert isinstance(schedule, list)
    scheduled_seasons = set()
    scheduled_leagues = set()
    for s in schedule:
        assert isinstance(s, RunRequest)
        assert isinstance(s.partition_key, MultiPartitionKey)
        scheduled_seasons.add(s.partition_key.keys_by_dimension["season"])
        scheduled_leagues.add(s.partition_key.keys_by_dimension["league"])
    assert len(scheduled_seasons) == 1
    assert len(scheduled_leagues) > 1


def test_pace_sheets_refresh_schedule():
    schedule = pace_sheets_refresh_schedule()
    assert isinstance(schedule, list)
    scheduled_seasons = set()
    scheduled_leagues = set()
    for s in schedule:
        assert isinstance(s, RunRequest)
        assert isinstance(s.partition_key, MultiPartitionKey)
        scheduled_seasons.add(s.partition_key.keys_by_dimension["predicted_season"])
        scheduled_leagues.add(s.partition_key.keys_by_dimension["league"])
    assert len(scheduled_seasons) == 1
    assert len(scheduled_leagues) > 1
