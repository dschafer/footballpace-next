import dagster as dg
import pytest

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


@pytest.mark.parametrize(
    ("cache_asset", "season_dimension"),
    [
        pytest.param(match_results_cache_update, "season", id="match-results"),
        pytest.param(
            pace_sheet_entries_cache_update, "predicted_season", id="pace-sheets"
        ),
        pytest.param(teams_cache_update, "season", id="teams"),
    ],
)
@pytest.mark.parametrize("reverse_order", [False, True])
def test_partitioned_cache_updates_require_positive_writes_in_each_interval(
    cache_asset: dg.AssetsDefinition, season_dimension: str, reverse_order: bool
) -> None:
    upstream_key = next(iter(cache_asset.dependency_keys))
    defs = dg.Definitions(
        assets=[
            dg.AssetSpec(upstream_key, partitions_def=cache_asset.partitions_def),
            cache_asset,
        ],
        resources={"cache_update_resource": FakeCacheUpdateResource()},
    )
    partitions = {
        (league, season): dg.MultiPartitionKey(
            {"league": league, season_dimension: season}
        )
        for league in ["E0", "SP1"]
        for season in ["2025", "2026"]
    }

    with dg.DagsterInstance.ephemeral() as instance:
        initial = dg.evaluate_automation_conditions(defs, instance)
        assert initial.total_requested == 0

        writes = [
            ("E0", "2026", 3),
            ("SP1", "2026", 0),
            ("SP1", "2025", 7),
            ("E0", "2025", 0),
        ]
        for league, season, row_count in reversed(writes) if reverse_order else writes:
            instance.report_runless_asset_event(
                dg.AssetMaterialization(
                    asset_key=upstream_key,
                    partition=partitions[league, season],
                    metadata={"dagster/partition_row_count": row_count},
                )
            )

        updated = dg.evaluate_automation_conditions(
            defs, instance, cursor=initial.cursor
        )
        assert updated.get_requested_partitions(cache_asset.key) == {
            partitions["E0", "2026"],
            partitions["SP1", "2025"],
        }

        unchanged = dg.evaluate_automation_conditions(
            defs, instance, cursor=updated.cursor
        )
        assert unchanged.total_requested == 0

        for league, season, row_count in [
            ("E0", "2026", 0),
            ("SP1", "2026", 0),
            ("E0", "2025", 5),
            ("SP1", "2025", 0),
            ("E0", "2025", 0),
            ("SP1", "2026", 4),
        ]:
            instance.report_runless_asset_event(
                dg.AssetMaterialization(
                    asset_key=upstream_key,
                    partition=partitions[league, season],
                    metadata={"dagster/row_count": row_count},
                )
            )

        rewritten = dg.evaluate_automation_conditions(
            defs, instance, cursor=unchanged.cursor
        )
        assert rewritten.get_requested_partitions(cache_asset.key) == {
            partitions["E0", "2025"],
            partitions["SP1", "2026"],
        }

        for partition in partitions.values():
            instance.report_runless_asset_event(
                dg.AssetMaterialization(
                    asset_key=upstream_key,
                    partition=partition,
                    metadata={"dagster/partition_row_count": 0},
                )
            )
        zero_only = dg.evaluate_automation_conditions(
            defs, instance, cursor=rewritten.cursor
        )
        assert zero_only.total_requested == 0

        instance.report_runless_asset_event(
            dg.AssetMaterialization(
                asset_key=upstream_key,
                partition=partitions["E0", "2025"],
                metadata={"dagster/row_count": 2},
            )
        )
        next_partition = dg.evaluate_automation_conditions(
            defs, instance, cursor=zero_only.cursor
        )
        assert next_partition.get_requested_partitions(cache_asset.key) == {
            partitions["E0", "2025"]
        }

        unchanged = dg.evaluate_automation_conditions(
            defs, instance, cursor=next_partition.cursor
        )
        assert unchanged.total_requested == 0


@pytest.mark.parametrize("fixture_row_count", [0, 1, 380])
@pytest.mark.parametrize("result_row_count", [0, 1, 12])
@pytest.mark.parametrize("team_row_count", [0, 20])
@pytest.mark.parametrize("zero_after_write", [False, True])
def test_fpl_cache_updates_require_their_own_positive_writes_in_each_interval(
    fixture_row_count: int,
    result_row_count: int,
    team_row_count: int,
    zero_after_write: bool,
) -> None:
    defs = dg.Definitions(
        assets=[
            dg.AssetSpec("fpl_fixtures_postgres"),
            dg.AssetSpec("fpl_results_postgres"),
            dg.AssetSpec("fpl_fixtures_teams_postgres"),
            fpl_fixtures_cache_update,
            fpl_results_cache_update,
            fpl_fixtures_teams_cache_update,
        ],
        resources={"cache_update_resource": FakeCacheUpdateResource()},
    )
    with dg.DagsterInstance.ephemeral() as instance:
        initial = dg.evaluate_automation_conditions(defs, instance)
        assert initial.total_requested == 0

        writes = [
            ("fpl_fixtures_postgres", fixture_row_count),
            ("fpl_results_postgres", result_row_count),
            ("fpl_fixtures_teams_postgres", team_row_count),
        ]
        for asset_key, row_count in writes:
            row_counts = (row_count, 0) if zero_after_write else (0, row_count)
            for count in row_counts:
                instance.report_runless_asset_event(
                    dg.AssetMaterialization(
                        asset_key=asset_key, metadata={"dagster/row_count": count}
                    )
                )

        updated = dg.evaluate_automation_conditions(
            defs, instance, cursor=initial.cursor
        )
        assert (
            updated.get_num_requested(fpl_fixtures_cache_update.key)
            == int(fixture_row_count > 0)
        )
        assert (
            updated.get_num_requested(fpl_results_cache_update.key)
            == int(result_row_count > 0)
        )
        assert (
            updated.get_num_requested(fpl_fixtures_teams_cache_update.key)
            == int(team_row_count > 0)
        )

        unchanged = dg.evaluate_automation_conditions(
            defs, instance, cursor=updated.cursor
        )
        assert unchanged.total_requested == 0

        for asset_key, _ in writes:
            instance.report_runless_asset_event(
                dg.AssetMaterialization(
                    asset_key=asset_key, metadata={"dagster/row_count": 0}
                )
            )
        zero_only = dg.evaluate_automation_conditions(
            defs, instance, cursor=unchanged.cursor
        )
        assert zero_only.total_requested == 0

        unchanged = dg.evaluate_automation_conditions(
            defs, instance, cursor=zero_only.cursor
        )
        assert unchanged.total_requested == 0


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
