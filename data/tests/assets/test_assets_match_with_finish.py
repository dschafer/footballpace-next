import dagster as dg
import datetime
import polars as pl

from footballpace.defs.assets.match_results import match_results_df
from footballpace.defs.assets.match_with_finish import match_results_with_finish_df
from footballpace.defs.assets.standings_rows import standings_rows_df

from .read_file import read_csv_bytes


def test_match_results_with_finish():
    bytes = read_csv_bytes("E0_2022.csv")
    match_results_df_output = match_results_df(
        dg.build_asset_context(partition_key=dg.MultiPartitionKey({"season": "2022"})),
        bytes,
    )
    assert isinstance(match_results_df_output, dg.Output)
    standings_rows_df_output = standings_rows_df(match_results_df_output.value)
    assert isinstance(standings_rows_df_output, dg.Output)
    match_results_with_finish_df_output = match_results_with_finish_df(
        match_results_df_output.value, standings_rows_df_output.value
    )
    assert isinstance(match_results_with_finish_df_output, dg.Output)
    df = match_results_with_finish_df_output.value
    assert isinstance(df, pl.DataFrame)
    assert len(df) == (20 * 19)
    assert df["date"][0] == datetime.date(2022, 8, 5)
    assert df["home_team"][0] == "Crystal Palace"
    assert df["away_team"][0] == "Arsenal"
    assert df["home_finish"][0] == 11
    assert df["away_finish"][0] == 2
