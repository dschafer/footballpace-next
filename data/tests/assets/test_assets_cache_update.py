import dagster as dg

from footballpace.defs.assets.cache_update import (
    fpl_fixtures_cache_update,
    fpl_fixtures_teams_cache_update,
    fpl_results_cache_update,
    match_results_cache_update,
    pace_sheet_entries_cache_update,
    teams_cache_update,
)


class FakeCacheUpdateResource:
    def __init__(self) -> None:
        self.calls: list[tuple[str, int, str]] = []

    def update_fixtures(self, league: str, year: int) -> str:
        self.calls.append((league, year, "fixtures"))
        return f"{league}:{year}:fixtures"

    def update_matches(self, league: str, year: int) -> str:
        self.calls.append((league, year, "matches"))
        return f"{league}:{year}:matches"

    def update_pace_sheets(self, league: str, year: int) -> str:
        self.calls.append((league, year, "pace-sheets"))
        return f"{league}:{year}:pace-sheets"

    def update_teams(self, league: str, year: int) -> str:
        self.calls.append((league, year, "teams"))
        return f"{league}:{year}:teams"


def test_match_results_cache_update_uses_partition_scope() -> None:
    cache_update_resource = FakeCacheUpdateResource()
    context = dg.build_asset_context(
        partition_key=dg.MultiPartitionKey({"league": "I1", "season": "2024"})
    )

    match_results_cache_update(context, cache_update_resource)

    assert cache_update_resource.calls == [("I1", 2024, "matches")]


def test_pace_sheet_entries_cache_update_uses_partition_scope() -> None:
    cache_update_resource = FakeCacheUpdateResource()
    context = dg.build_asset_context(
        partition_key=dg.MultiPartitionKey(
            {"league": "I1", "predicted_season": "2024"}
        )
    )

    pace_sheet_entries_cache_update(context, cache_update_resource)

    assert cache_update_resource.calls == [("I1", 2024, "pace-sheets")]


def test_fpl_fixtures_cache_update_uses_written_fixture_season() -> None:
    cache_update_resource = FakeCacheUpdateResource()

    fpl_fixtures_cache_update(dg.build_asset_context(), 2024, cache_update_resource)

    assert cache_update_resource.calls == [("E0", 2024, "fixtures")]


def test_fpl_results_cache_update_uses_written_result_season() -> None:
    cache_update_resource = FakeCacheUpdateResource()

    fpl_results_cache_update(dg.build_asset_context(), 2024, cache_update_resource)

    assert cache_update_resource.calls == [("E0", 2024, "matches")]


def test_teams_cache_update_uses_partition_scope() -> None:
    cache_update_resource = FakeCacheUpdateResource()
    context = dg.build_asset_context(
        partition_key=dg.MultiPartitionKey({"league": "I1", "season": "2024"})
    )

    teams_cache_update(context, cache_update_resource)

    assert cache_update_resource.calls == [("I1", 2024, "teams")]


def test_fpl_fixtures_teams_cache_update_uses_written_team_season() -> None:
    cache_update_resource = FakeCacheUpdateResource()

    fpl_fixtures_teams_cache_update(
        dg.build_asset_context(), 2024, cache_update_resource
    )

    assert cache_update_resource.calls == [("E0", 2024, "teams")]
