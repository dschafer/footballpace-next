import dagster as dg
import polars as pl

from footballpace.defs.assets.match_results import match_results_df
from footballpace.defs.assets.standings_rows import standings_rows_df

from .read_file import read_csv_bytes


def test_standingsrows_df():
    bytes = read_csv_bytes("E0_2022.csv")
    match_results_df_output = match_results_df(
        dg.build_asset_context(partition_key=dg.MultiPartitionKey({"season": "2022"})),
        bytes,
    )
    assert isinstance(match_results_df_output, dg.Output)
    standings_row_df_output = standings_rows_df(match_results_df_output.value)
    assert isinstance(standings_row_df_output, dg.Output)
    df = standings_row_df_output.value
    assert isinstance(df, pl.DataFrame)
    assert len(df) == 20
    lpool = df.filter(pl.col("team") == "Liverpool")
    assert lpool["wins"][0] == 19
    assert lpool["losses"][0] == 9
    assert lpool["draws"][0] == 10
    assert lpool["goals_for"][0] == 75
    assert lpool["goals_against"][0] == 47
