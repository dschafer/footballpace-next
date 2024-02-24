import pandas as pd

from dagster import MultiPartitionKey, Output, build_asset_context

from footballpace.assets.match_results import match_results_df
from footballpace.assets.standings_rows import standings_rows_df

from .read_csv_bytes import read_csv_bytes


def test_standingsrows_df():
    bytes = read_csv_bytes("E0_2022.csv")
    match_results_df_output = match_results_df(
        build_asset_context(partition_key=MultiPartitionKey({"season": "2022"})),
        bytes,
    )
    assert isinstance(match_results_df_output, Output)
    standings_row_df_output = standings_rows_df(match_results_df_output.value)
    assert isinstance(standings_row_df_output, Output)
    df = standings_row_df_output.value
    assert isinstance(df, pd.DataFrame)
    assert len(df) == 20
    assert df.set_index("Team").at["Liverpool", "Wins"] == 19
    assert df.set_index("Team").at["Liverpool", "Losses"] == 9
    assert df.set_index("Team").at["Liverpool", "Draws"] == 10
    assert df.set_index("Team").at["Liverpool", "For"] == 75
    assert df.set_index("Team").at["Liverpool", "Against"] == 47
