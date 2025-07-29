import dagster as dg
import polars as pl


def markdown_metadata(df: pl.DataFrame) -> dg.MarkdownMetadataValue:
    """
    Takes the given data frame, converts it to a markdown string, and returns a
    Dagster MetadataValue for that markdown string.
    """
    with pl.Config(
        tbl_cols=-1,
        tbl_formatting="MARKDOWN",
        tbl_hide_column_data_types=True,
        tbl_hide_dataframe_shape=True,
        tbl_width_chars=-1,
    ):
        return dg.MetadataValue.md(str(df))
