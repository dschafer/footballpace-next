from hashlib import sha256

import dagster as dg
import polars as pl


def df_data_version(df: pl.DataFrame) -> str:
    """Helper function to compute the data version of a polars DataFrame."""
    return str(df.hash_rows().implode().hash().item())


def bytes_data_version(data: bytes) -> str:
    """Helper function to compute the data version of bytes."""
    return sha256(data).hexdigest()


eager_respecting_data_version = (
    dg.AutomationCondition.eager()
    .replace(
        "any_deps_updated",
        dg.AutomationCondition.any_deps_match(
            dg.AutomationCondition.data_version_changed()
        ).with_label("any_deps_updated_respecting_data_version"),
    )
    .with_label("eager_respecting_data_version")
)
