from typing import Optional
from dagster import (
    AssetSelection,
    DefaultSensorStatus,
    MultiAssetSensorEvaluationContext,
    RunRequest,
    multi_asset_sensor,
)

from .jobs import cache_update_job


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

    For this to trigger, an asset must set the tag "db_write" to "true".

    The sensor will then only fire when it sees those assets materialize, to avoid invalidating
    the cache unnecessarily.
    """
    asset_events = context.latest_materialization_records_by_key()
    if any(asset_events.values()):
        context.advance_all_cursors()
        return RunRequest()
