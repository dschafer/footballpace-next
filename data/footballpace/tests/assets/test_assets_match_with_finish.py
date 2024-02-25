import pandas as pd

from dagster import MultiPartitionKey, Output, build_asset_context

from footballpace.assets.match_results import match_results_df
from footballpace.assets.match_with_finish import match_results_with_finish_df
from footballpace.assets.standings_rows import standings_rows_df

from .read_csv_bytes import read_csv_bytes


def test_match_results_with_finish():
    bytes = read_csv_bytes("E0_2022.csv")
    match_results_df_output = match_results_df(
        build_asset_context(partition_key=MultiPartitionKey({"season": "2022"})),
        bytes,
    )
    assert isinstance(match_results_df_output, Output)
    standings_rows_df_output = standings_rows_df(match_results_df_output.value)
    assert isinstance(standings_rows_df_output, Output)
    match_results_with_finish_df_output = match_results_with_finish_df(
        match_results_df_output.value, standings_rows_df_output.value
    )
    assert isinstance(match_results_with_finish_df_output, Output)
    df = match_results_with_finish_df_output.value
    assert isinstance(df, pd.DataFrame)
    assert len(df) == (20 * 19)
    assert df["Date"][0] == pd.Timestamp("2022-08-05")
    assert df["HomeTeam"][0] == "Crystal Palace"
    assert df["AwayTeam"][0] == "Arsenal"
    assert df["HomeFinish"][0] == 11
    assert df["AwayFinish"][0] == 2
