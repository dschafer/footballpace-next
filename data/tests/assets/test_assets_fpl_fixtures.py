import dagster as dg
import polars as pl

from footballpace.defs.assets.fpl_fixtures import fpl_fixtures_df, fpl_results_df

from .read_file import read_fpl_bytes


def test_fpl_fixtures_df():
    bootstrap = read_fpl_bytes("bootstrap-static.json")
    fixtures = read_fpl_bytes("fixtures.json")

    df_output = fpl_fixtures_df(dg.build_asset_context(), bootstrap, fixtures)
    assert isinstance(df_output, dg.Output)
    df = df_output.value
    assert isinstance(df, pl.DataFrame)
    assert len(df) == (20 * 19)
    assert df["finished_provisional"][0]
    assert df["league"][0] == "E0"
    assert df["year"][0] == 2024


def test_fpl_results_df():
    bootstrap = read_fpl_bytes("bootstrap-static.json")
    fixtures = read_fpl_bytes("fixtures.json")
    fixtures_df_output = fpl_fixtures_df(dg.build_asset_context(), bootstrap, fixtures)
    assert isinstance(fixtures_df_output, dg.Output)
    fixtures_df = fixtures_df_output.value

    df_output = fpl_results_df(dg.build_asset_context(), fixtures_df)
    assert isinstance(df_output, dg.Output)
    df = df_output.value
    assert isinstance(df, pl.DataFrame)
    assert len(df) < (20 * 19)
    assert len(df) > 0
    assert df["league"][0] == "E0"
    assert df["year"][0] == 2024
