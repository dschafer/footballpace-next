import dagster as dg
import polars as pl

from footballpace.dataversion import df_data_version, eager_respecting_data_version
from footballpace.defs.assets.fpl_fixtures import fpl_fixture_season
from footballpace.defs.models import (
    FPLFixtureDagsterType,
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
    """Derive a league-season team list from match results."""
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
    kinds={"Polars"},
    code_version="v2",
    dagster_type=TeamDagsterType,
    ins={"fpl_fixtures_df": dg.AssetIn(dagster_type=FPLFixtureDagsterType)},
    automation_condition=eager_respecting_data_version,
)
def fpl_fixtures_teams_df(
    fpl_fixtures_df: pl.DataFrame,
) -> dg.MaterializeResult[pl.DataFrame]:
    """Derive the current EPL team list from the complete FPL fixture feed."""
    teams = teams_from_matches(
        "E0",
        fpl_fixture_season(fpl_fixtures_df.get_column("year")),
        fpl_fixtures_df,
    )
    return dg.MaterializeResult(
        value=teams,
        metadata={
            "dagster/row_count": len(teams),
            "preview": markdown_metadata(teams.head()),
            "source": "fpl_fixtures_df",
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


@dg.asset(
    group_name="Teams",
    kinds={"Postgres"},
    code_version="v2",
    ins={"fpl_fixtures_teams_df": dg.AssetIn(dagster_type=TeamDagsterType)},
    metadata={
        **TeamDagsterType.metadata,
        "dagster/table_name": "teams",
    },
    tags={"db_write": "true"},
    automation_condition=eager_respecting_data_version,
)
def fpl_fixtures_teams_postgres(
    fpl_fixtures_teams_df: pl.DataFrame, vercel_postgres: VercelPostgresResource
) -> dg.MaterializeResult[int]:
    """Writes FPL-derived EPL teams to Postgres and returns the updated season."""
    season = fpl_fixture_season(fpl_fixtures_teams_df.get_column("year"))
    rowcount = vercel_postgres.upsert_teams(fpl_fixtures_teams_df.to_dicts())
    return dg.MaterializeResult(
        value=season,
        metadata={"dagster/row_count": rowcount, "season": season},
    )
