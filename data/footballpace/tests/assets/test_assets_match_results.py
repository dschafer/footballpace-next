import pandas as pd

from dagster import MultiPartitionKey, Output, build_asset_context

from footballpace.assets.match_results import match_results_df, match_results_postgres

from .read_csv_bytes import read_csv_bytes


def test_match_results_df_93():
    bytes = read_csv_bytes("E0_1993.csv")
    df_output = match_results_df(
        build_asset_context(partition_key=MultiPartitionKey({"season": "1993"})),
        bytes,
    )
    assert isinstance(df_output, Output)
    df = df_output.value
    assert isinstance(df, pd.DataFrame)
    assert len(df) == (22 * 21)
    assert df["Date"][0] == pd.Timestamp("1993-08-14")
    assert df["Season"][0] == 1993


def test_match_results_df_22():
    bytes = read_csv_bytes("E0_2022.csv")
    df_output = match_results_df(
        build_asset_context(partition_key=MultiPartitionKey({"season": "2022"})),
        bytes,
    )
    assert isinstance(df_output, Output)
    df = df_output.value
    assert isinstance(df, pd.DataFrame)
    assert len(df) == (20 * 19)
    assert df["Date"][0] == pd.Timestamp("2022-08-05")
    assert df["Season"][0] == 2022


def test_match_results_postgres():
    bytes = read_csv_bytes("E0_2022.csv")
    df_output = match_results_df(
        build_asset_context(partition_key=MultiPartitionKey({"season": "2022"})),
        bytes,
    )
    assert isinstance(df_output, Output)
    df = df_output.value

    class FakeVercelPostgresResource:
        def upsert_matches(self, matches) -> int:
            assert len(matches) == (20 * 19)
            return 20 * 19

    output = match_results_postgres(df, FakeVercelPostgresResource())
    assert isinstance(output, Output)
    assert output.metadata["dagster/partition_row_count"].value == (20 * 19)
