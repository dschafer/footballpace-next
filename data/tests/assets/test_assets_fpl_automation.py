import dagster as dg
import pytest

from footballpace.defs.assets.fpl_fixtures import fpl_results_postgres


@pytest.fixture
def fpl_automation_defs() -> dg.Definitions:
    return dg.Definitions(
        assets=[
            dg.AssetSpec("fpl_fixtures_df"),
            dg.AssetSpec("fpl_results_df"),
            fpl_results_postgres.get_asset_spec(),
        ]
    )


def report_version(
    instance: dg.DagsterInstance, asset_key: str, version: str
) -> None:
    instance.report_runless_asset_event(
        dg.AssetMaterialization(
            asset_key=asset_key, tags={"dagster/data_version": version}
        )
    )


@pytest.mark.parametrize(
    ("fixture_version", "result_version", "expected_requests"),
    [
        pytest.param("fixtures-v2", None, 0, id="fixtures-only-change"),
        pytest.param("fixtures-v2", "results-v1", 0, id="unchanged-results"),
        pytest.param(None, "results-v1", 0, id="same-result-version"),
        pytest.param(None, "results-v2", 1, id="changed-results"),
        pytest.param("fixtures-v2", "results-v2", 1, id="both-change"),
    ],
)
def test_fpl_result_writes_require_changed_completed_results(
    fpl_automation_defs: dg.Definitions,
    fixture_version: str | None,
    result_version: str | None,
    expected_requests: int,
) -> None:
    with dg.DagsterInstance.ephemeral() as instance:
        report_version(instance, "fpl_fixtures_df", "fixtures-v1")
        report_version(instance, "fpl_results_df", "results-v1")
        report_version(instance, "fpl_results_postgres", "written-v1")
        initial = dg.evaluate_automation_conditions(fpl_automation_defs, instance)
        assert initial.total_requested == 0

        if fixture_version is not None:
            report_version(instance, "fpl_fixtures_df", fixture_version)
        if result_version is not None:
            report_version(instance, "fpl_results_df", result_version)

        updated = dg.evaluate_automation_conditions(
            fpl_automation_defs, instance, cursor=initial.cursor
        )
        assert updated.get_num_requested(fpl_results_postgres.key) == expected_requests

        unchanged = dg.evaluate_automation_conditions(
            fpl_automation_defs, instance, cursor=updated.cursor
        )
        assert unchanged.total_requested == 0


def test_initial_preseason_result_write_waits_for_results(
    fpl_automation_defs: dg.Definitions,
) -> None:
    with dg.DagsterInstance.ephemeral() as instance:
        initial = dg.evaluate_automation_conditions(fpl_automation_defs, instance)
        assert initial.total_requested == 0

        report_version(instance, "fpl_fixtures_df", "fixtures-v1")
        missing_results = dg.evaluate_automation_conditions(
            fpl_automation_defs, instance, cursor=initial.cursor
        )
        assert missing_results.total_requested == 0

        instance.report_runless_asset_event(
            dg.AssetMaterialization(
                asset_key="fpl_results_df",
                tags={"dagster/data_version": "empty-results"},
                metadata={"dagster/row_count": 0},
            )
        )
        ready = dg.evaluate_automation_conditions(
            fpl_automation_defs, instance, cursor=missing_results.cursor
        )
        assert ready.get_num_requested(fpl_results_postgres.key) == 1

        report_version(instance, "fpl_results_postgres", "empty-results-written")
        written = dg.evaluate_automation_conditions(
            fpl_automation_defs, instance, cursor=ready.cursor
        )
        assert written.total_requested == 0

        report_version(instance, "fpl_results_df", "first-completed-match")
        first_result = dg.evaluate_automation_conditions(
            fpl_automation_defs, instance, cursor=written.cursor
        )
        assert first_result.get_num_requested(fpl_results_postgres.key) == 1
