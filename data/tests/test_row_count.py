import dagster as dg
import pytest

from footballpace.row_count import HasNonzeroRowCount


@pytest.mark.parametrize("partition_key", [None, "E0|2026"])
@pytest.mark.parametrize("initial_row_count", [0, 3])
def test_row_count_scans_materializations_across_pages(
    partition_key: str | None, initial_row_count: int
) -> None:
    @dg.asset(
        partitions_def=(
            dg.StaticPartitionsDefinition([partition_key])
            if partition_key is not None
            else None
        ),
        automation_condition=HasNonzeroRowCount(),
    )
    def paginated_asset() -> None:
        pass

    with dg.DagsterInstance.ephemeral() as instance:
        initial = dg.evaluate_automation_conditions([paginated_asset], instance)
        assert initial.total_requested == 0

        for count in [initial_row_count] + [0] * 100:
            instance.report_runless_asset_event(
                dg.AssetMaterialization(
                    asset_key=paginated_asset.key,
                    partition=partition_key,
                    metadata={"dagster/row_count": count},
                )
            )

        updated = dg.evaluate_automation_conditions(
            [paginated_asset], instance, cursor=initial.cursor
        )
        assert updated.get_requested_partitions(paginated_asset.key) == (
            {partition_key} if initial_row_count > 0 else set()
        )

        instance.report_runless_asset_event(
            dg.AssetMaterialization(
                asset_key=paginated_asset.key,
                partition=partition_key,
                metadata={"dagster/row_count": 0},
            )
        )
        zero_only = dg.evaluate_automation_conditions(
            [paginated_asset], instance, cursor=updated.cursor
        )
        assert zero_only.total_requested == 0


@pytest.mark.parametrize("partition_key", [None, "E0|2026"])
@pytest.mark.parametrize(
    "initial_row_count, later_row_count", [(3, 0), (0, 3), (3, 3), (None, 3)]
)
def test_row_count_uses_materializations_within_evaluation_snapshot(
    partition_key: str | None,
    initial_row_count: int | None,
    later_row_count: int,
) -> None:
    class MaterializeDuringEvaluation(HasNonzeroRowCount):
        def evaluate(
            self, context: dg.AutomationContext[dg.AssetKey]
        ) -> dg.AutomationResult[dg.AssetKey]:
            context.asset_graph_view.instance.report_runless_asset_event(
                dg.AssetMaterialization(
                    asset_key=context.key,
                    partition=partition_key,
                    metadata={"dagster/row_count": later_row_count},
                )
            )
            return super().evaluate(context)

    @dg.asset(
        partitions_def=(
            dg.StaticPartitionsDefinition([partition_key])
            if partition_key is not None
            else None
        ),
        automation_condition=MaterializeDuringEvaluation(),
    )
    def snapshot_asset() -> None:
        pass

    with dg.DagsterInstance.ephemeral() as instance:
        if initial_row_count is not None:
            instance.report_runless_asset_event(
                dg.AssetMaterialization(
                    asset_key=snapshot_asset.key,
                    partition=partition_key,
                    metadata={"dagster/row_count": initial_row_count},
                )
            )

        current = dg.evaluate_automation_conditions([snapshot_asset], instance)
        assert current.get_requested_partitions(snapshot_asset.key) == (
            {partition_key}
            if initial_row_count is not None and initial_row_count > 0
            else set()
        )

        following = dg.evaluate_automation_conditions(
            [snapshot_asset], instance, cursor=current.cursor
        )
        assert following.get_requested_partitions(snapshot_asset.key) == (
            {partition_key} if later_row_count > 0 else set()
        )
