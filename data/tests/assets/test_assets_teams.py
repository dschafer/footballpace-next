import dagster as dg
import polars as pl

from footballpace.defs.assets.match_results import match_results_df
from footballpace.defs.assets.teams import teams_df

from .read_file import read_csv_bytes


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
