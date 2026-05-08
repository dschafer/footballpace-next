import dagster as dg

from footballpace.defs.resources.cache_update import CacheUpdateResource
from footballpace.row_count import has_nonzero_row_count


@dg.asset(
    group_name="CacheUpdate",
    kinds={"vercel"},
    automation_condition=dg.AutomationCondition.any_deps_match(
        dg.AutomationCondition.newly_updated() & has_nonzero_row_count()
    ).with_label("any_deps_updated_with_nonzero_row_count"),
    deps=[
        "fpl_fixtures_postgres",
        "fpl_results_postgres",
        "match_results_postgres",
        "pace_sheet_entries_postgres",
        "team_colors_postgres",
    ],
)
def cache_update(
    context: dg.AssetExecutionContext, cache_update_resource: CacheUpdateResource
) -> None:
    """
    Make sure that Next.js updates its caches.

    All of the inputs are deliberately unused; they just indicate the assets that
    write to a DB and hence require a downstream effect.
    """

    response = cache_update_resource.update()
    context.log.info(response)
