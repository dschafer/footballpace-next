from typing import Iterator
import pandas as pd

from dagster import Output, build_asset_context

from footballpace.assets.fpl_fixtures import fpl_fixtures_df, fpl_results_df

from .read_file import read_fpl_bytes


def test_fpl_fixtures_df():
    bootstrap = read_fpl_bytes("bootstrap-static.json")
    fixtures = read_fpl_bytes("fixtures.json")

    df_output_iterator = fpl_fixtures_df(build_asset_context(), bootstrap, fixtures)
    assert isinstance(df_output_iterator, Iterator)
    df_output = next(df_output_iterator)
    assert isinstance(df_output, Output)
    df = df_output.value
    assert isinstance(df, pd.DataFrame)
    assert len(df) == (20 * 19)
    assert df["FinishedProvisional"][0]
    assert df["Div"][0] == "E0"
    assert df["Season"][0] == 2024


def test_fpl_results_df():
    bootstrap = read_fpl_bytes("bootstrap-static.json")
    fixtures = read_fpl_bytes("fixtures.json")
    df_output_iterator = fpl_fixtures_df(build_asset_context(), bootstrap, fixtures)
    assert isinstance(df_output_iterator, Iterator)
    fixtures_df = next(df_output_iterator).value

    df_output_iterator = fpl_results_df(build_asset_context(), fixtures_df)
    assert isinstance(df_output_iterator, Iterator)
    df_output = next(df_output_iterator)
    assert isinstance(df_output, Output)
    df = df_output.value
    assert isinstance(df, pd.DataFrame)
    assert len(df) < (20 * 19)
    assert len(df) > 0
    assert df["Div"][0] == "E0"
    assert df["Season"][0] == 2024
