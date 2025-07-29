import dagster as dg
import polars as pl

from footballpace.defs.assets.team_colors import team_colors_df

from .read_file import read_teamcolors_bytes


def test_team_colors_df():
    df_output = team_colors_df(read_teamcolors_bytes("teams.json"))
    assert isinstance(df_output, dg.Output)
    df = df_output.value
    assert isinstance(df, pl.DataFrame)
    assert len(df) == 20
    assert df["team"][0] == "Bournemouth"
    assert df["primary_color"][0] == "E62333"
    assert df["secondary_color"][0] == "000000"
    assert df["team"][1] == "Arsenal"
    assert df["primary_color"][1] == "EF0107"
    assert df["secondary_color"][1] == "023474"
