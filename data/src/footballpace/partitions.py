from collections import defaultdict
from typing import Mapping, Sequence

import dagster as dg

ALL_SEASONS = range(1993, 2026)
all_seasons_partition = dg.StaticPartitionsDefinition([str(s) for s in ALL_SEASONS])

ALL_LEAGUES = ["E0", "D1", "SP1", "I1", "F1"]
all_leagues_partition = dg.StaticPartitionsDefinition(ALL_LEAGUES)

all_seasons_leagues_partition = dg.MultiPartitionsDefinition(
    {
        "season": all_seasons_partition,
        "league": all_leagues_partition,
    }
)

all_predicted_seasons_leagues_partition = dg.MultiPartitionsDefinition(
    {
        "predicted_season": all_seasons_partition,
        "league": all_leagues_partition,
    }
)


def seasons_to_predicted_seasons(
    all_seasons: range, window_size: int
) -> Mapping[int, Sequence[int]]:
    """Given a range of seasons and a window_size, create the mapping of what
    seasons are used to predict other seasons.

    In theory, we would just like to use the window_size previous
    seasons in all cases. But early on in the range, we don't have
    enough previous seasons. So we will instead use future seasons to
    fill out the window (but never the season itself!).

    The associated tests for this method should illustrate the case clearly.
    """
    assert len(all_seasons) > window_size
    mapping = defaultdict(set)
    for dest_season in all_seasons:
        possible_source_seasons = list(
            range(dest_season - window_size, dest_season)
        ) + list(range(dest_season + 1, dest_season + window_size + 1))
        valid_source_seasons = [s for s in possible_source_seasons if s in all_seasons][
            :window_size
        ]
        for source_season in valid_source_seasons:
            mapping[source_season].add(dest_season)

    return {k: list(v) for k, v in mapping.items()}


predicted_seasons_of_league_mapping = dg.MultiPartitionMapping(
    {
        "season": dg.DimensionPartitionMapping(
            dimension_name="predicted_season",
            partition_mapping=dg.StaticPartitionMapping(
                {
                    str(k): list(map(str, v))
                    for k, v in seasons_to_predicted_seasons(ALL_SEASONS, 10).items()
                }
            ),
        ),
        "league": dg.DimensionPartitionMapping(
            dimension_name="league",
            partition_mapping=dg.IdentityPartitionMapping(),
        ),
    }
)
