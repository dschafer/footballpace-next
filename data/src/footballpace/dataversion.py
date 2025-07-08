from hashlib import sha256

import dagster as dg
import pandas as pd


def df_data_version(df: pd.DataFrame) -> str:
    """Helper function to compute the data version of a pandas DataFrame."""
    return sha256(pd.util.hash_pandas_object(df).to_numpy()).hexdigest()


def bytes_data_version(bytes: bytes) -> str:
    """Helper function to compute the data version of a bytes."""
    return sha256(bytes).hexdigest()


eager_respecting_data_version = (
    dg.AutomationCondition.eager()
    .replace("newly_updated", dg.AutomationCondition.data_version_changed())
    .with_label("eager_respecting_data_version")
)
