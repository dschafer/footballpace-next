from typing import Optional

from dagster import AssetExecutionContext
import pandas as pd
from hashlib import sha256


def previous_data_version(context: AssetExecutionContext) -> Optional[str]:
    """
    Gives the previous materialization's data version, or None if there
    was no materialization or it doesn't have a data version.
    """

    lm = context.instance.get_latest_materialization_event(asset_key=context.asset_key)
    if lm is None:
        return
    am = lm.asset_materialization
    if am is None:
        return
    tags = am.tags
    if tags is None:
        return
    return tags.get("dagster/data_version")


def df_data_version(df: pd.DataFrame) -> str:
    """Helper function to compute the data version of a pandas DataFrame."""
    return sha256(pd.util.hash_pandas_object(df).to_numpy()).hexdigest()


def bytes_data_version(bytes: bytes) -> str:
    """Helper function to compute the data version of a bytes."""
    return sha256(bytes).hexdigest()
