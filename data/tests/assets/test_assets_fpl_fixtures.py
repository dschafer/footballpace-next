import dagster as dg
import polars as pl
import pytest

from footballpace.defs.assets.fpl_fixtures import (
    fpl_fixture_season,
    fpl_fixtures_df,
    fpl_fixtures_postgres,
    fpl_results_df,
    fpl_results_postgres,
)

from .read_file import read_fpl_bytes


def test_fpl_fixtures_df():
    bootstrap = read_fpl_bytes("bootstrap-static.json")
    fixtures = read_fpl_bytes("fixtures.json")

    df_output = fpl_fixtures_df(dg.build_asset_context(), bootstrap, fixtures)
    assert isinstance(df_output, dg.MaterializeResult)
    df = df_output.value
    assert isinstance(df, pl.DataFrame)
    assert len(df) == (20 * 19)
    assert df["finished_provisional"][0]
    assert df["league"][0] == "E0"
    assert df["year"][0] == 2024
    assert df["kickoff_time"][0] is not None


def test_fpl_fixtures_rescheduled_df():
    bootstrap = read_fpl_bytes("bootstrap-static.json")
    fixtures = read_fpl_bytes("fixtures-rescheduled.json")

    df_output = fpl_fixtures_df(dg.build_asset_context(), bootstrap, fixtures)
    assert isinstance(df_output, dg.MaterializeResult)
    df = df_output.value
    assert isinstance(df, pl.DataFrame)
    assert len(df) == (20 * 19)
    assert df["finished_provisional"][0]
    assert df["league"][0] == "E0"
    assert df["year"][0] == 2024
    assert df["kickoff_time"][0] is None


def test_fpl_results_df():
    bootstrap = read_fpl_bytes("bootstrap-static.json")
    fixtures = read_fpl_bytes("fixtures.json")
    fixtures_df_output = fpl_fixtures_df(dg.build_asset_context(), bootstrap, fixtures)
    assert isinstance(fixtures_df_output, dg.MaterializeResult)
    fixtures_df = fixtures_df_output.value

    df_output = fpl_results_df(dg.build_asset_context(), fixtures_df)
    assert isinstance(df_output, dg.MaterializeResult)
    df = df_output.value
    assert isinstance(df, pl.DataFrame)
    assert len(df) < (20 * 19)
    assert len(df) > 0
    assert df["league"][0] == "E0"
    assert df["year"][0] == 2024


def test_fpl_fixture_season_rejects_multiple_years() -> None:
    years = pl.Series("year", [2025, 2026])

    with pytest.raises(dg.Failure) as error:
        fpl_fixture_season(years)

    assert error.value.description == (
        "FPL fixtures must contain exactly one season year."
    )


def test_fpl_postgres_assets_carry_fixture_season() -> None:
    bootstrap = read_fpl_bytes("bootstrap-static.json")
    fixtures = read_fpl_bytes("fixtures.json")
    fixtures_output = fpl_fixtures_df(dg.build_asset_context(), bootstrap, fixtures)
    assert isinstance(fixtures_output, dg.MaterializeResult)
    fixtures_df = fixtures_output.value
    assert isinstance(fixtures_df, pl.DataFrame)

    results_output = fpl_results_df(
        dg.build_asset_context(),
        fixtures_df.with_columns(pl.lit(False).alias("finished_provisional")),
    )
    assert isinstance(results_output, dg.MaterializeResult)
    results_df = results_output.value
    assert isinstance(results_df, pl.DataFrame)
    assert results_df.is_empty()

    class FakeVercelPostgresResource:
        def upsert_fixtures(self, rows) -> int:
            return len(rows)

        def upsert_matches(self, rows) -> int:
            return len(rows)

    fixtures_postgres_output = fpl_fixtures_postgres(
        fixtures_df, FakeVercelPostgresResource()
    )
    results_postgres_output = fpl_results_postgres(
        fixtures_df, results_df, FakeVercelPostgresResource()
    )

    assert isinstance(fixtures_postgres_output, dg.MaterializeResult)
    assert fixtures_postgres_output.value == 2024
    assert isinstance(results_postgres_output, dg.MaterializeResult)
    assert results_postgres_output.value == 2024
