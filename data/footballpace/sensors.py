from typing import Optional
from dagster import (
    AssetMaterialization,
    AssetSelection,
    DefaultSensorStatus,
    IntMetadataValue,
    MultiAssetSensorEvaluationContext,
    RunRequest,
    multi_asset_sensor,
)

from .jobs import cache_update_job


def metadata_int(m: AssetMaterialization, key: str) -> int:
    metadata = m.metadata
    val = metadata.get(key)
    if not val:
        return 0
    if not isinstance(val, IntMetadataValue):
        return 0
    if not val.value:
        return 0
    return val.value


def row_count(m: AssetMaterialization) -> int:
    return metadata_int(m, "dagster/partition_row_count") + metadata_int(
        m, "dagster/row_count"
    )


@multi_asset_sensor(
    monitored_assets=AssetSelection.tag("db_write", "true"),
    job=cache_update_job,
    default_status=DefaultSensorStatus.RUNNING,
)
def db_write_sensor(
    context: MultiAssetSensorEvaluationContext,
) -> Optional[RunRequest]:
    """
    This sensor listens to DB writes, and will invalidate the Vercel cache when they happen.

    For this to trigger, two things must be true for an asset:

    First, it must set the tag "db_write" to "true".
    Second, it must include either "dagster/partition_row_count" or "dagster/row_count" in
      its metadata, with the number of rows that is changed.

    The sensor will then only fire when it sees changed rows, to avoid invalidating the cache unnecessarily.
    """
    asset_events = context.latest_materialization_records_by_key()
    event_logs = [el for el in asset_events.values() if el is not None]
    if len(event_logs) == 0:
        return
    context.log.info("db_write_sensor saw %d events", len(event_logs))
    materializations = [el.asset_materialization for el in event_logs]
    context.log.info("db_write_sensor saw %d materializations", len(materializations))
    total_rows_written = sum([row_count(m) for m in materializations if m is not None])
    context.log.info("db_write_sensor saw %d rows written", total_rows_written)
    if total_rows_written > 0:
        context.advance_all_cursors()
        return RunRequest()
