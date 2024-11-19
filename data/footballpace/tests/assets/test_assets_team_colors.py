import pandas as pd

from dagster import Output

from footballpace.assets.team_colors import team_colors_df

from .read_file import read_teamcolors_bytes


def test_fpl_fixtures_df():
    df_output = team_colors_df(read_teamcolors_bytes("teams.json"))
    assert isinstance(df_output, Output)
    df = df_output.value
    assert isinstance(df, pd.DataFrame)
    assert len(df) == 20
    assert df["Team"][0] == "Bournemouth"
    assert df["PrimaryColor"][0] == "E62333"
    assert df["SecondaryColor"][0] == "000000"
    assert df["Team"][1] == "Arsenal"
    assert df["PrimaryColor"][1] == "EF0107"
    assert df["SecondaryColor"][1] == "023474"
