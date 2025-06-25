from hashlib import sha256
from typing import Optional

import dagster as dg
import pandas as pd


def previous_data_version(context: dg.AssetExecutionContext) -> Optional[str]:
    """
    Gives the previous materialization's data version, or None if there
    was no materialization or it doesn't have a data version.
    """

    if context.has_partition_key:
        materializations = context.instance.fetch_materializations(
            dg.AssetRecordsFilter(
                asset_key=context.asset_key, asset_partitions=[context.partition_key]
            ),
            limit=1,
        ).records
    else:
        materializations = context.instance.fetch_materializations(
            dg.AssetRecordsFilter(asset_key=context.asset_key),
            limit=1,
        ).records

    if (lm := next(iter(materializations), None)) is None:
        return
    if (am := lm.asset_materialization) is None:
        return
    if (tags := am.tags) is None:
        return
    return tags.get("dagster/data_version")


def df_data_version(df: pd.DataFrame) -> str:
    """Helper function to compute the data version of a pandas DataFrame."""
    return sha256(pd.util.hash_pandas_object(df).to_numpy()).hexdigest()


def bytes_data_version(bytes: bytes) -> str:
    """Helper function to compute the data version of a bytes."""
    return sha256(bytes).hexdigest()
