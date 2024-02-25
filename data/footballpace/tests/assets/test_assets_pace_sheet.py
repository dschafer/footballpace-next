import pandas as pd

from dagster import MultiPartitionKey, Output, build_asset_context

from footballpace.assets.match_results import match_results_df
from footballpace.assets.match_with_finish import match_results_with_finish_df
from footballpace.assets.pace_sheet import pace_sheet_entries_df
from footballpace.assets.standings_rows import standings_rows_df

from .read_csv_bytes import read_csv_bytes


def helper_get_match_results_with_finish(year: str, filename: str) -> pd.DataFrame:
    bytes = read_csv_bytes(filename)
    context_22 = build_asset_context(partition_key=MultiPartitionKey({"season": year}))
    match_results_df_output = match_results_df(context_22, bytes)
    assert isinstance(match_results_df_output, Output)
    standings_rows_df_output = standings_rows_df(match_results_df_output.value)
    assert isinstance(standings_rows_df_output, Output)
    match_results_with_finish_df_output = match_results_with_finish_df(
        match_results_df_output.value, standings_rows_df_output.value
    )
    assert isinstance(match_results_with_finish_df_output, Output)
    return match_results_with_finish_df_output.value


def test_pace_sheet_entries():
    match_results_with_finish_21 = helper_get_match_results_with_finish(
        "2021", "E0_2021.csv"
    )
    match_results_with_finish_22 = helper_get_match_results_with_finish(
        "2022", "E0_2022.csv"
    )

    context_23 = build_asset_context(
        partition_key=MultiPartitionKey({"predicted_season": "2023"})
    )
    pace_sheet_entries_df_output = pace_sheet_entries_df(
        context_23,
        {"2021": match_results_with_finish_21, "2022": match_results_with_finish_22},
    )
    assert isinstance(pace_sheet_entries_df_output, Output)
    pace_sheet_entries = pace_sheet_entries_df_output.value
    assert len(pace_sheet_entries) == (19 * 2)
    assert pace_sheet_entries["TeamFinish"][0] == 1
    assert pace_sheet_entries["OpponentFinish"][0] == 2
    assert pace_sheet_entries["Home"][0] == False  # noqa: E712
    assert pace_sheet_entries["ExpectedPoints"][0] == 2.0
