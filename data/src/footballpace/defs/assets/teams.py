import dagster as dg
import polars as pl

from footballpace.dataversion import df_data_version, eager_respecting_data_version
from footballpace.defs.models import (
    MatchDagsterType,
    TeamDagsterType,
)
from footballpace.defs.resources.vercel import VercelPostgresResource
from footballpace.markdown import markdown_metadata
from footballpace.partitions import all_seasons_leagues_partition


def teams_from_matches(
    league: str,
    year: int,
    match_like_df: pl.DataFrame,
) -> pl.DataFrame:
    return (
        pl.concat(
            [
                match_like_df.select(pl.col("home_team").alias("team")),
                match_like_df.select(pl.col("away_team").alias("team")),
            ]
        )
        .unique()
        .sort("team")
        .with_columns(
            pl.lit(league).alias("league"),
            pl.lit(year, dtype=pl.Int64).alias("year"),
        )
        .select("league", "year", "team")
    )


@dg.asset(
    group_name="Teams",
    kinds={"Polars"},
    partitions_def=all_seasons_leagues_partition,
    code_version="v1",
    dagster_type=TeamDagsterType,
    ins={
        "match_results_df": dg.AssetIn(dagster_type=MatchDagsterType),
    },
    automation_condition=eager_respecting_data_version,
)
def teams_df(
    context: dg.AssetExecutionContext,
    match_results_df: pl.DataFrame,
) -> dg.MaterializeResult[pl.DataFrame]:
    """Derive the canonical team list for a league season."""
    assert isinstance(context.partition_key, dg.MultiPartitionKey)
    season = int(context.partition_key.keys_by_dimension["season"])
    league = context.partition_key.keys_by_dimension["league"]

    teams = teams_from_matches(league, season, match_results_df)
    return dg.MaterializeResult(
        value=teams,
        metadata={
            "dagster/partition_row_count": len(teams),
            "preview": markdown_metadata(teams.head()),
            "source": "match_results_df",
            "teams": teams["team"].to_list(),
        },
        data_version=dg.DataVersion(df_data_version(teams)),
    )


@dg.asset(
    group_name="Teams",
    kinds={"Postgres"},
    partitions_def=all_seasons_leagues_partition,
    code_version="v1",
    ins={"teams_df": dg.AssetIn(dagster_type=TeamDagsterType)},
    metadata={
        **TeamDagsterType.metadata,
        "dagster/table_name": "teams",
    },
    tags={"db_write": "true"},
    automation_condition=eager_respecting_data_version,
)
def teams_postgres(
    teams_df: pl.DataFrame, vercel_postgres: VercelPostgresResource
) -> dg.MaterializeResult:
    """Writes team membership into Postgres."""
    rowcount = vercel_postgres.upsert_teams(teams_df.to_dicts())
    return dg.MaterializeResult(metadata={"dagster/partition_row_count": rowcount})
