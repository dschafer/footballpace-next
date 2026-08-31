import dagster as dg
import polars as pl

from footballpace.defs.asset_checks.teams_checks import (
    fpl_fixtures_teams_match_fixture_season,
)
from footballpace.defs.assets.fpl_fixtures import fpl_fixtures_df
from footballpace.defs.assets.match_results import match_results_df
from footballpace.defs.assets.teams import (
    fpl_fixtures_teams_df,
    fpl_fixtures_teams_postgres,
    teams_df,
)

from .read_file import read_csv_bytes, read_fpl_bytes


def test_teams_df_from_match_results() -> None:
    csv_bytes = read_csv_bytes("E0_2022.csv")
    match_results_output = match_results_df(
        dg.build_asset_context(partition_key=dg.MultiPartitionKey({"season": "2022"})),
        csv_bytes,
    )
    assert isinstance(match_results_output, dg.MaterializeResult)

    teams_output = teams_df(
        dg.build_asset_context(
            partition_key=dg.MultiPartitionKey({"league": "E0", "season": "2022"})
        ),
        match_results_output.value,
    )

    assert isinstance(teams_output, dg.MaterializeResult)
    df = teams_output.value
    assert isinstance(df, pl.DataFrame)
    assert len(df) == 20
    assert df["league"].unique().to_list() == ["E0"]
    assert df["year"].unique().to_list() == [2022]
    assert "Liverpool" in df["team"].to_list()


def test_fpl_fixtures_teams_df_uses_fixture_season() -> None:
    bootstrap = read_fpl_bytes("bootstrap-static.json")
    fixtures = read_fpl_bytes("fixtures.json")
    fixtures_output = fpl_fixtures_df(dg.build_asset_context(), bootstrap, fixtures)
    assert isinstance(fixtures_output, dg.MaterializeResult)
    fixtures_df = fixtures_output.value
    assert isinstance(fixtures_df, pl.DataFrame)

    teams_output = fpl_fixtures_teams_df(fixtures_df)

    assert isinstance(teams_output, dg.MaterializeResult)
    df = teams_output.value
    assert isinstance(df, pl.DataFrame)
    assert len(df) == 20
    assert df["league"].unique().to_list() == ["E0"]
    assert df["year"].unique().to_list() == [2024]

    check_result = fpl_fixtures_teams_match_fixture_season(df, fixtures_df)
    assert isinstance(check_result, dg.AssetCheckResult)
    assert check_result.passed

    class FakeVercelPostgresResource:
        def upsert_teams(self, rows) -> int:
            return len(rows)

    postgres_output = fpl_fixtures_teams_postgres(
        df, FakeVercelPostgresResource()
    )
    assert isinstance(postgres_output, dg.MaterializeResult)
    assert postgres_output.value == 2024
