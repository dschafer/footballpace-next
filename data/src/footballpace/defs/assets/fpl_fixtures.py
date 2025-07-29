import json

import dagster as dg
import polars as pl

from footballpace.canonical import canonical_name
from footballpace.dataversion import (
    bytes_data_version,
    df_data_version,
    eager_respecting_data_version,
)
from footballpace.defs.models import (
    FPLFixtureDagsterType,
    FixtureDagsterType,
    MatchDagsterType,
)
from footballpace.defs.resources.http import HTTPResource
from footballpace.defs.resources.vercel import VercelPostgresResource
from footballpace.markdown import markdown_metadata


@dg.asset(
    group_name="FPL",
    kinds={"json"},
    code_version="v1",
    metadata={"dagster/uri": "https://fantasy.premierleague.com/api/bootstrap-static/"},
)
def fpl_bootstrap_json(http_resource: HTTPResource) -> dg.Output[bytes]:
    """Pulls the bootstrap JSON from https://fantasy.premierleague.com/api/bootstrap-static/.

    Business logic here should be kept to an absolute minimum, so that the
    results of this stage of the pipeline can be cached.
    """
    bootstrap_json = http_resource.get(
        "https://fantasy.premierleague.com/api/bootstrap-static/"
    ).content

    data_version = bytes_data_version(bootstrap_json)

    return dg.Output(
        bootstrap_json,
        metadata={"size": len(bootstrap_json)},
        data_version=dg.DataVersion(data_version),
    )


@dg.asset(
    group_name="FPL",
    kinds={"json"},
    code_version="v1",
    metadata={"dagster/uri": "https://fantasy.premierleague.com/api/fixtures/"},
)
def fpl_fixtures_json(http_resource: HTTPResource) -> dg.Output[bytes]:
    """Pulls the bootstrap JSON from https://fantasy.premierleague.com/api/fixtures/.

    Business logic here should be kept to an absolute minimum, so that the
    results of this stage of the pipeline can be cached.
    """
    fixtures_json = http_resource.get(
        "https://fantasy.premierleague.com/api/fixtures/"
    ).content

    data_version = bytes_data_version(fixtures_json)

    return dg.Output(
        fixtures_json,
        metadata={"size": len(fixtures_json)},
        data_version=dg.DataVersion(data_version),
    )


def team_idents(bootstrap_obj) -> dict[int, str]:
    return dict([(team["id"], team["name"]) for team in bootstrap_obj["teams"]])


@dg.asset(
    group_name="FPL",
    kinds={"Polars"},
    code_version="v3",
    dagster_type=FPLFixtureDagsterType,
    automation_condition=eager_respecting_data_version,
)
def fpl_fixtures_df(
    fpl_bootstrap_json: bytes,
    fpl_fixtures_json: bytes,
) -> dg.Output[pl.DataFrame]:
    """
    Convert the JSON from https://fantasy.premierleague.com into a Polars DataFrame.

    This also uses DataVersions to detect if changes have been made (and will opt not
    to materialize if not). This is because the bootstrap_json changes constantly
    with additional fantasy-specific info, but we have to fetch it for the team IDs.

    So this asset is our primary "short-circuit" to prevent us from writing data over
    and over again from FPL.
    """

    fpl_fixtures_obj = json.loads(fpl_fixtures_json)
    fpl_bootstrap_obj = json.loads(fpl_bootstrap_json)

    team_idents_dict = team_idents(fpl_bootstrap_obj)

    df = pl.DataFrame(fpl_fixtures_obj)
    df = df.filter(
        pl.col("kickoff_time").is_not_null()
    )  # Filter null values, for fixtures that are postponed.
    df = (
        df.with_columns(
            league=pl.lit("E0"),
            finished_provisional=pl.col("finished_provisional").cast(bool),
            kickoff_time=pl.col("kickoff_time").str.to_datetime(
                format="%+"
            ),  # %+ is ISO8601
            away_team=pl.col("team_a").map_elements(
                lambda x: canonical_name(team_idents_dict[x]), return_dtype=pl.String
            ),
            home_team=pl.col("team_h").map_elements(
                lambda x: canonical_name(team_idents_dict[x]), return_dtype=pl.String
            ),
            ft_away_goals=pl.col("team_a_score").cast(int),
            ft_home_goals=pl.col("team_h_score").cast(int),
        )
        .with_columns(year=pl.col("kickoff_time").min().dt.year())
        .select(
            "league",
            "year",
            "kickoff_time",
            "home_team",
            "away_team",
            "finished_provisional",
            "ft_home_goals",
            "ft_away_goals",
        )
    )

    metadata_teams = (
        pl.concat([df["home_team"], df["away_team"]]).sort().unique().to_list()
    )
    return dg.Output(
        df,
        metadata={
            "dagster/row_count": len(df),
            "preview": markdown_metadata(pl.concat([df.head(), df.tail()])),
            "most_recent_match_date": dg.MetadataValue.text(
                str(max(df["kickoff_time"])) if not df.is_empty else "N/A"
            ),
            "teams": metadata_teams,
        },
        data_version=dg.DataVersion(df_data_version(df)),
    )


@dg.asset(
    group_name="FPL",
    kinds={"Postgres"},
    code_version="v1",
    ins={"fpl_fixtures_df": dg.AssetIn(dagster_type=FPLFixtureDagsterType)},
    metadata={
        **FixtureDagsterType.metadata,
        "dagster/table_name": "fixtures",
    },
    tags={"db_write": "true"},
    automation_condition=eager_respecting_data_version,
)
def fpl_fixtures_postgres(
    fpl_fixtures_df: pl.DataFrame, vercel_postgres: VercelPostgresResource
) -> dg.Output[None]:
    """Writes the fixtures from FPL into Postgres."""
    rowcount = vercel_postgres.upsert_fixtures(fpl_fixtures_df.to_dicts())
    return dg.Output(None, metadata={"dagster/row_count": rowcount})


@dg.asset(
    group_name="FPL",
    kinds={"Polars"},
    ins={"fpl_fixtures_df": dg.AssetIn(dagster_type=FPLFixtureDagsterType)},
    code_version="v3",
    dagster_type=MatchDagsterType,
    automation_condition=eager_respecting_data_version,
)
def fpl_results_df(fpl_fixtures_df: pl.DataFrame) -> dg.Output[pl.DataFrame]:
    """
    Convert the JSON from https://fantasy.premierleague.com into completed matches,
    then convert them to our standard results format for eventual DB writes.
    """

    df = (
        fpl_fixtures_df.filter(pl.col("finished_provisional"))
        .drop("finished_provisional")
        .with_columns(
            date=pl.col("kickoff_time").dt.replace_time_zone(None).dt.date(),
            ft_result=pl.when(pl.col("ft_home_goals") > pl.col("ft_away_goals"))
            .then(pl.lit("H"))
            .when(pl.col("ft_away_goals") > pl.col("ft_home_goals"))
            .then(pl.lit("A"))
            .otherwise(pl.lit("D")),
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
    )

    metadata_teams = (
        pl.concat([df["home_team"], df["away_team"]]).sort().unique().to_list()
    )
    return dg.Output(
        df,
        metadata={
            "dagster/row_count": len(df),
            "preview": markdown_metadata(df.head()),
            "most_recent_match_date": dg.MetadataValue.text(
                str(max(df["date"])) if not df.is_empty else "N/A"
            ),
            "teams": metadata_teams,
        },
        data_version=dg.DataVersion(df_data_version(df)),
    )


@dg.asset(
    group_name="FPL",
    kinds={"Postgres"},
    code_version="v1",
    ins={"fpl_results_df": dg.AssetIn(dagster_type=MatchDagsterType)},
    metadata={
        **MatchDagsterType.metadata,
        "dagster/table_name": "matches",
    },
    tags={"db_write": "true"},
    automation_condition=eager_respecting_data_version,
)
def fpl_results_postgres(
    fpl_results_df: pl.DataFrame, vercel_postgres: VercelPostgresResource
) -> dg.Output[None]:
    """Writes the results from FPL into Postgres."""
    rowcount = vercel_postgres.upsert_matches(fpl_results_df.to_dicts())
    return dg.Output(None, metadata={"dagster/row_count": rowcount})
