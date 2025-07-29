import dagster as dg
import polars as pl

from footballpace.defs.models import (
    MatchWithFinishDagsterType,
    PaceSheetEntryDagsterType,
)
from footballpace.defs.resources.vercel import VercelPostgresResource
from footballpace.markdown import markdown_metadata
from footballpace.partitions import (
    all_predicted_seasons_leagues_partition,
    predicted_seasons_of_league_mapping,
)

HOME_POINTS = {"H": 3, "D": 1, "A": 0}
AWAY_POINTS = {"A": 3, "D": 1, "H": 0}


@dg.asset(
    group_name="PaceSheet",
    kinds={"Polars"},
    partitions_def=all_predicted_seasons_leagues_partition,
    code_version="v2",
    dagster_type=PaceSheetEntryDagsterType,
    ins={
        "match_results_with_finish_df": dg.AssetIn(
            dagster_type=dg.Dict[str, MatchWithFinishDagsterType],
            partition_mapping=predicted_seasons_of_league_mapping,
        ),
    },
)
def pace_sheet_entries_df(
    context: dg.AssetExecutionContext,
    match_results_with_finish_df: dict[str, pl.DataFrame],
) -> dg.Output[pl.DataFrame]:
    """Determine the expected pace for each match in each league and season."""
    assert isinstance(context.partition_key, dg.MultiPartitionKey)
    season = int(context.partition_key.keys_by_dimension["predicted_season"])

    all_match_results_with_finish = pl.concat(match_results_with_finish_df.values())
    assert season not in all_match_results_with_finish["year"]

    home_results = (
        all_match_results_with_finish.clone()
        .rename({"home_finish": "team_finish", "away_finish": "opponent_finish"})
        .with_columns(
            home=pl.lit(True),
            expected_points=pl.col("ft_result").replace_strict(
                HOME_POINTS, return_dtype=pl.Float64
            ),
        )
    ).select(
        "league", "year", "team_finish", "opponent_finish", "home", "expected_points"
    )
    away_results = (
        all_match_results_with_finish.clone()
        .rename({"away_finish": "team_finish", "home_finish": "opponent_finish"})
        .with_columns(
            home=pl.lit(False),
            expected_points=pl.col("ft_result").replace_strict(
                AWAY_POINTS, return_dtype=pl.Float64
            ),
        )
    ).select(
        "league", "year", "team_finish", "opponent_finish", "home", "expected_points"
    )
    all_results = pl.concat([home_results, away_results])
    summarized_results = (
        all_results.group_by(["league", "team_finish", "opponent_finish", "home"])
        .agg(pl.col("expected_points").mean())
        .filter(pl.col("team_finish") == 1)
        .group_by("league", "home", "team_finish")
        .agg(
            pl.col("opponent_finish").sort(descending=False),
            pl.col("expected_points").sort(descending=False),
        )
        .explode("opponent_finish", "expected_points")
        .with_columns(year=season)
    )

    return dg.Output(
        summarized_results,
        metadata={
            "dagster/partition_row_count": len(summarized_results),
            "preview": markdown_metadata(summarized_results.head()),
        },
    )


@dg.asset(
    group_name="PaceSheet",
    kinds={"Postgres"},
    partitions_def=all_predicted_seasons_leagues_partition,
    code_version="v1",
    ins={"pace_sheet_entries_df": dg.AssetIn(dagster_type=PaceSheetEntryDagsterType)},
    metadata={
        **PaceSheetEntryDagsterType.metadata,
        "dagster/table_name": "pace_sheet_entries",
    },
    tags={"db_write": "true"},
)
def pace_sheet_entries_postgres(
    pace_sheet_entries_df: pl.DataFrame, vercel_postgres: VercelPostgresResource
) -> dg.Output[None]:
    """Writes the pace sheet entires into Postgres."""
    rowcount = vercel_postgres.upsert_pace_sheet_entries(
        pace_sheet_entries_df.to_dicts()
    )
    return dg.Output(None, metadata={"dagster/partition_row_count": rowcount})
