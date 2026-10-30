from collections.abc import Mapping

import dagster as dg


def metadata_int(m: Mapping[str, dg.MetadataValue], key: str) -> int:
    """
    Gets the int value for the given key out of the MetadataMapping, or 0
    if it does not exist or is not an int.
    """
    val = m.get(key)
    if not val:
        return 0
    if not isinstance(val, dg.IntMetadataValue):
        return 0
    if not val.value:
        return 0
    return val.value


def row_count(m: Mapping[str, dg.MetadataValue] | None) -> int:
    """
    Returns the sum of the metadata values for partition_row_count and row_count.
    """
    if m is None:
        return 0
    return metadata_int(m, "dagster/partition_row_count") + metadata_int(
        m, "dagster/row_count"
    )


def has_nonzero_row_count_from_context(
    context: dg.AutomationContext[dg.AssetKey], partition_key: str | None
) -> bool:
    """Return whether this partition wrote rows within the evaluation interval."""
    if (max_storage_id := context.max_storage_id) is None:
        return False

    records_filter = dg.AssetRecordsFilter(
        asset_key=context.key,
        asset_partitions=[partition_key] if partition_key is not None else None,
        after_storage_id=context.previous_max_storage_id,
        before_storage_id=max_storage_id + 1,
    )
    cursor: str | None = None
    has_more = True
    while has_more:
        result = context.asset_graph_view.instance.fetch_materializations(
            records_filter,
            limit=100,
            cursor=cursor,
            ascending=False,
        )
        for record in result.records:
            if (materialization := record.asset_materialization) is None:
                continue
            if (count := row_count(materialization.metadata)) > 0:
                context.log.debug(
                    f"HasNonzeroRowCount for {context.key}, partition {partition_key} "
                    f"saw {count} new rows."
                )
                return True
        cursor = result.cursor
        has_more = result.has_more
    return False


class HasNonzeroRowCount(dg.AutomationCondition[dg.AssetKey]):
    """Match asset partitions with a positive write since the previous evaluation."""

    @property
    def name(self) -> str:
        return "has_nonzero_row_count"

    def evaluate(
        self, context: dg.AutomationContext[dg.AssetKey]
    ) -> dg.AutomationResult[dg.AssetKey]:
        candidate_subset = context.candidate_subset
        if candidate_subset.is_empty:
            true_subset = context.get_empty_subset()
        elif candidate_subset.is_partitioned:
            partition_keys = {
                partition_key
                for partition_key in candidate_subset.expensively_compute_partition_keys()
                if has_nonzero_row_count_from_context(context, partition_key)
            }
            true_subset = candidate_subset.compute_intersection_with_partition_keys(
                partition_keys
            )
        elif has_nonzero_row_count_from_context(context, None):
            true_subset = candidate_subset
        else:
            true_subset = context.get_empty_subset()
        return dg.AutomationResult(true_subset=true_subset, context=context)


def has_nonzero_row_count() -> dg.AutomationCondition[dg.AssetKey]:
    """Match asset partitions with a positive write since the previous evaluation."""
    return HasNonzeroRowCount()
