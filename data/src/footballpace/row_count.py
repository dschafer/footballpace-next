from typing import Mapping

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


def row_count_from_context(context: dg.AutomationContext) -> int:
    """
    Returns the row_count metadata for the provided AutomationContext.
    """
    instance = context.asset_graph_view.instance

    if len(records := instance.get_asset_records([context.key])) != 1:
        context.log.debug(
            f"HasNonzeroRowCount for {context.key} did not find an asset record."
        )
        return 0

    if (elr := records[0].asset_entry.last_materialization_record) is None:
        context.log.debug(
            f"HasNonzeroRowCount for {context.key} did not find a materialization record."
        )
        return 0

    if (am := elr.asset_materialization) is None:
        context.log.debug(
            f"HasNonzeroRowCount for {context.key} did not find an asset materialization."
        )
        return 0

    return row_count(am.metadata)


class HasNonzeroRowCount(dg.AutomationCondition):
    """
    An Automation Condition that determines if the given asset
    has non-zero row count in the metadata for the previous materialization.
    """

    @property
    def name(self) -> str:
        return "has_nonzero_row_count"

    def evaluate(self, context: dg.AutomationContext) -> dg.AutomationResult:
        row_count = row_count_from_context(context)
        context.log.debug(
            f"HasNonzeroRowCount for {context.key} saw {row_count} new rows."
        )
        if row_count > 0:
            true_subset = context.candidate_subset
        else:
            true_subset = context.get_empty_subset()
        return dg.AutomationResult(true_subset=true_subset, context=context)


def has_nonzero_row_count() -> dg.AutomationCondition:
    """
    An Automation Condition that determines if the given asset
    has non-zero row count in the metadata for the previous materialization.
    """
    return HasNonzeroRowCount()
