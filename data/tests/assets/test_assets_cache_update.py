import dagster as dg

from footballpace.defs.assets.cache_update import (
    fpl_cache_update,
    match_results_cache_update,
    pace_sheet_entries_cache_update,
)
from footballpace.partitions import current_season


class FakeCacheUpdateResource:
    def __init__(self) -> None:
        self.league_year_calls: list[tuple[str, int]] = []

    def update_league_year(self, league: str, year: int) -> str:
        self.league_year_calls.append((league, year))
        return f"{league}:{year}"


def test_match_results_cache_update_uses_partition_scope() -> None:
    cache_update_resource = FakeCacheUpdateResource()
    context = dg.build_asset_context(
        partition_key=dg.MultiPartitionKey({"league": "I1", "season": "2024"})
    )

    match_results_cache_update(context, cache_update_resource)

    assert cache_update_resource.league_year_calls == [("I1", 2024)]


def test_pace_sheet_entries_cache_update_uses_partition_scope() -> None:
    cache_update_resource = FakeCacheUpdateResource()
    context = dg.build_asset_context(
        partition_key=dg.MultiPartitionKey(
            {"league": "I1", "predicted_season": "2024"}
        )
    )

    pace_sheet_entries_cache_update(context, cache_update_resource)

    assert cache_update_resource.league_year_calls == [("I1", 2024)]


def test_fpl_cache_update_uses_fixture_scope() -> None:
    cache_update_resource = FakeCacheUpdateResource()

    fpl_cache_update(dg.build_asset_context(), cache_update_resource)

    assert cache_update_resource.league_year_calls == [("E0", current_season)]
