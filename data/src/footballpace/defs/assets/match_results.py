from io import StringIO

import dagster as dg
import polars as pl

from footballpace.canonical import canonical_name
from footballpace.dataversion import bytes_data_version, eager_respecting_data_version
from footballpace.defs.models import MatchDagsterType
from footballpace.defs.resources.footballdata import FootballDataResource
from footballpace.defs.resources.vercel import VercelPostgresResource
from footballpace.markdown import markdown_metadata
from footballpace.partitions import all_seasons_leagues_partition


@dg.asset(
    group_name="MatchResults",
    kinds={"CSV"},
    partitions_def=all_seasons_leagues_partition,
    code_version="v1",
)
def match_results_csv(
    context: dg.AssetExecutionContext, football_data: FootballDataResource
) -> dg.Output[bytes]:
    """Scrapes the latest CSV results from football-data.co.uk.

    Business logic here should be kept to an absolute minimum, so that the
    results of this stage of the pipeline can be cached.

    API Docs: https://www.football-data.co.uk/notes.txt
    """
    assert isinstance(context.partition_key, dg.MultiPartitionKey)
    season = int(context.partition_key.keys_by_dimension["season"])
    league = context.partition_key.keys_by_dimension["league"]

    results_data = football_data.request(season, league).content

    data_version = bytes_data_version(results_data)

    return dg.Output(
        results_data,
        metadata={
            "size": len(results_data),
            "dagster/uri": football_data.url(season, league),
        },
        data_version=dg.DataVersion(data_version),
    )


csv_dtypes = {
    "Div": pl.String,
    "Date": pl.String,  # This gets converted to Date later
    "HomeTeam": pl.String,
    "AwayTeam": pl.String,
    "FTHG": pl.UInt8,
    "FTAG": pl.UInt8,
    "FTR": pl.Enum(["H", "A", "D"]),
}


@dg.asset(
    group_name="MatchResults",
    kinds={"Polars"},
    partitions_def=all_seasons_leagues_partition,
    code_version="v3",
    dagster_type=MatchDagsterType,
    automation_condition=eager_respecting_data_version,
)
def match_results_df(
    context: dg.AssetExecutionContext, match_results_csv: bytes
) -> dg.Output[pl.DataFrame]:
    """Convert the CSV from football-data.co.uk into a Polars DataFrame.

    API Docs: https://www.football-data.co.uk/notes.txt
    """
    assert isinstance(context.partition_key, dg.MultiPartitionKey)
    season = int(context.partition_key.keys_by_dimension["season"])

    # The encoding here is weird. Most of them are Windows-1252, but some new ones
    # are utf-8-sig
    lines = [str(s, encoding="Windows-1252") for s in match_results_csv.splitlines()]
    if lines[0][0:3] != "Div":
        # Okay, this didn't parse. Must be a new file with utf-8-sig encoding
        context.log.info("Detected utf-8-sig encoding")
        lines = [str(s, encoding="utf-8-sig") for s in match_results_csv.splitlines()]
    else:
        context.log.info("Detected Windows-1252 encoding")

    if lines[0][0:3] != "Div":
        raise dg.Failure(
            description=f"CSV file was not valid: could not get first line to start with Div, found {lines[0][0:3]} instead"
        )

    parsable_string = "\n".join(lines)
    df = (
        pl.scan_csv(
            StringIO(parsable_string),
            schema_overrides=csv_dtypes,
        )
        .select(csv_dtypes.keys())
        .filter(~pl.all_horizontal(pl.all().is_null()))
        .with_columns(
            league=pl.col("Div"),
            year=pl.lit(season),
            date=pl.when(pl.col("Date").str.len_chars() == 8)
            .then(
                pl.col("Date").str.to_date("%d/%m/%y", strict=False)
            )  # Dates like 31/08/99
            .otherwise(
                pl.col("Date").str.to_date("%d/%m/%Y", strict=False)
            ),  # Dates like 31/08/2003
            home_team=pl.col("HomeTeam").map_elements(
                canonical_name, return_dtype=pl.String
            ),
            away_team=pl.col("AwayTeam").map_elements(
                canonical_name, return_dtype=pl.String
            ),
            ft_home_goals=pl.col("FTHG"),
            ft_away_goals=pl.col("FTAG"),
            ft_result=pl.col("FTR"),
        )
        .select(
            "league",
            "year",
            "date",
            "home_team",
            "away_team",
            "ft_home_goals",
            "ft_away_goals",
            "ft_result",
        )
    ).collect()

    # We need to use strict=False above, hence this check
    assert not df["date"].has_nulls()
    metadata_teams = (
        pl.concat([df["home_team"], df["away_team"]]).sort().unique().to_list()
    )

    return dg.Output(
        df,
        metadata={
            "dagster/partition_row_count": len(df),
            "preview": markdown_metadata(pl.concat([df.head(), df.tail()])),
            "most_recent_match_date": dg.MetadataValue.text(
                str(max(df["kickoff_time"])) if not df.is_empty else "N/A"
            ),
            "teams": metadata_teams,
        },
    )


@dg.asset(
    group_name="MatchResults",
    kinds={"Postgres"},
    partitions_def=all_seasons_leagues_partition,
    code_version="v1",
    ins={"match_results_df": dg.AssetIn(dagster_type=MatchDagsterType)},
    metadata={
        **MatchDagsterType.metadata,
        "dagster/table_name": "matches",
    },
    tags={"db_write": "true"},
    automation_condition=eager_respecting_data_version,
)
def match_results_postgres(
    match_results_df: pl.DataFrame, vercel_postgres: VercelPostgresResource
) -> dg.Output[None]:
    """Writes the match results from football-data.co.uk into Postgres."""
    rowcount = vercel_postgres.upsert_matches(match_results_df.to_dicts())
    return dg.Output(None, metadata={"dagster/partition_row_count": rowcount})
