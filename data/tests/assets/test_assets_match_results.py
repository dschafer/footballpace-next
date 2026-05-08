import datetime
import dagster as dg
import polars as pl

from footballpace.defs.assets.match_results import (
    match_results_df,
    match_results_postgres,
)

from .read_file import read_csv_bytes


def test_match_results_df_93():
    csv_bytes = read_csv_bytes("E0_1993.csv")
    df_output = match_results_df(
        dg.build_asset_context(partition_key=dg.MultiPartitionKey({"season": "1993"})),
        csv_bytes,
    )
    assert isinstance(df_output, dg.MaterializeResult)
    df = df_output.value
    assert isinstance(df, pl.DataFrame)
    assert len(df) == (22 * 21)
    assert df["date"][0] == datetime.date(1993, 8, 14)
    assert df["year"][0] == 1993


def test_match_results_df_22():
    csv_bytes = read_csv_bytes("E0_2022.csv")
    df_output = match_results_df(
        dg.build_asset_context(partition_key=dg.MultiPartitionKey({"season": "2022"})),
        csv_bytes,
    )
    assert isinstance(df_output, dg.MaterializeResult)
    df = df_output.value
    assert isinstance(df, pl.DataFrame)
    assert len(df) == (20 * 19)
    assert df["date"][0] == datetime.date(2022, 8, 5)
    assert df["year"][0] == 2022


def test_match_results_postgres():
    csv_bytes = read_csv_bytes("E0_2022.csv")
    df_output = match_results_df(
        dg.build_asset_context(partition_key=dg.MultiPartitionKey({"season": "2022"})),
        csv_bytes,
    )
    assert isinstance(df_output, dg.MaterializeResult)
    df = df_output.value

    class FakeVercelPostgresResource:
        def upsert_matches(self, matches) -> int:
            assert len(matches) == (20 * 19)
            return 20 * 19

    output = match_results_postgres(df, FakeVercelPostgresResource())
    assert isinstance(output, dg.MaterializeResult)
    assert output.metadata is not None
    assert output.metadata["dagster/partition_row_count"] == (20 * 19)
