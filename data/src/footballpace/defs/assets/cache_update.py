import dagster as dg

from footballpace.defs.resources.cache_update import CacheUpdateResource
from footballpace.partitions import (
    all_predicted_seasons_leagues_partition,
    all_seasons_leagues_partition,
    current_season,
)
from footballpace.row_count import has_nonzero_row_count


def db_write_updated_condition() -> dg.AutomationCondition:
    return dg.AutomationCondition.any_deps_match(
        dg.AutomationCondition.newly_updated() & has_nonzero_row_count()
    ).with_label("any_deps_updated_with_nonzero_row_count")


@dg.asset(
    group_name="CacheUpdate",
    kinds={"vercel"},
    partitions_def=all_seasons_leagues_partition,
    automation_condition=db_write_updated_condition(),
    deps=["match_results_postgres"],
)
def match_results_cache_update(
    context: dg.AssetExecutionContext, cache_update_resource: CacheUpdateResource
) -> None:
    """Make sure that Next.js updates match-result caches."""
    assert isinstance(context.partition_key, dg.MultiPartitionKey)
    season = int(context.partition_key.keys_by_dimension["season"])
    league = context.partition_key.keys_by_dimension["league"]

    response = cache_update_resource.update_league_year(league, season)
    context.log.info(response)


@dg.asset(
    group_name="CacheUpdate",
    kinds={"vercel"},
    partitions_def=all_predicted_seasons_leagues_partition,
    automation_condition=db_write_updated_condition(),
    deps=["pace_sheet_entries_postgres"],
)
def pace_sheet_entries_cache_update(
    context: dg.AssetExecutionContext, cache_update_resource: CacheUpdateResource
) -> None:
    """Make sure that Next.js updates pace-sheet caches."""
    assert isinstance(context.partition_key, dg.MultiPartitionKey)
    season = int(context.partition_key.keys_by_dimension["predicted_season"])
    league = context.partition_key.keys_by_dimension["league"]

    response = cache_update_resource.update_league_year(league, season)
    context.log.info(response)


@dg.asset(
    group_name="CacheUpdate",
    kinds={"vercel"},
    automation_condition=db_write_updated_condition(),
    deps=["fpl_fixtures_postgres", "fpl_results_postgres"],
)
def fpl_cache_update(
    context: dg.AssetExecutionContext,
    cache_update_resource: CacheUpdateResource,
) -> None:
    """Make sure that Next.js updates FPL-backed caches."""
    response = cache_update_resource.update_league_year("E0", current_season)
    context.log.info(response)
