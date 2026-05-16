import dagster as dg

from footballpace.defs.assets.cache_update import (
    fpl_fixtures_cache_update,
    fpl_results_cache_update,
    match_results_cache_update,
    pace_sheet_entries_cache_update,
)
from footballpace.partitions import current_season


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


def test_fpl_fixtures_cache_update_uses_fixture_scope() -> None:
    cache_update_resource = FakeCacheUpdateResource()

    fpl_fixtures_cache_update(dg.build_asset_context(), cache_update_resource)

    assert cache_update_resource.calls == [("E0", current_season, "fixtures")]


def test_fpl_results_cache_update_uses_match_scope() -> None:
    cache_update_resource = FakeCacheUpdateResource()

    fpl_results_cache_update(dg.build_asset_context(), cache_update_resource)

    assert cache_update_resource.calls == [("E0", current_season, "matches")]
