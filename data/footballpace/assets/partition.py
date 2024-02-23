from dagster import (
    MultiPartitionsDefinition,
    StaticPartitionsDefinition,
)

all_seasons = [str(s) for s in range(1993, 2024)]
all_leagues = ["E0", "D1", "SP1", "I1", "F1"]

all_seasons_leagues_partition = MultiPartitionsDefinition(
    {
        "season": StaticPartitionsDefinition(all_seasons),
        "league": StaticPartitionsDefinition(all_leagues),
    }
)
