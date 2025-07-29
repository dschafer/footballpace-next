import json

import dagster as dg
import dagster_pandas as dg_pd
import pandas as pd

from footballpace.canonical import canonical_name
from footballpace.dataversion import (
    bytes_data_version,
    df_data_version,
    eager_respecting_data_version,
)
from footballpace.defs.resources.http import HTTPResource
from footballpace.defs.resources.vercel import (
    FixturesTableSchema,
    MatchResultsTableSchema,
    VercelPostgresResource,
)


@dg.asset(
    group_name="FPL",
    kinds={"API"},
    code_version="v1",
    output_required=False,
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
    kinds={"API"},
    code_version="v1",
    output_required=False,
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


FPLFixturesDataFrame = dg_pd.create_dagster_pandas_dataframe_type(
    name="FPLFixturesDataFrame",
    columns=[
        dg_pd.PandasColumn.boolean_column("FinishedProvisional"),
        dg_pd.PandasColumn.datetime_column("KickoffTime", tz="UTC"),
        dg_pd.PandasColumn.string_column("TeamA"),
        dg_pd.PandasColumn.integer_column("TeamAScore", min_value=0),
        dg_pd.PandasColumn.string_column("TeamH"),
        dg_pd.PandasColumn.integer_column("TeamHScore", min_value=0),
        dg_pd.PandasColumn.string_column("Div"),
        dg_pd.PandasColumn.integer_column("Season"),
    ],
    metadata_fn=lambda df: {
        "dagster/row_count": len(df),
        "preview": dg.MetadataValue.md(pd.concat([df.head(), df.tail()]).to_markdown()),
    },
)


def fixture_dict(fixture) -> dict:
    return {
        "FinishedProvisional": fixture["finished_provisional"],
        "KickoffTime": fixture["kickoff_time"],
        "TeamA": fixture["team_a"],
        "TeamAScore": fixture["team_a_score"],
        "TeamH": fixture["team_h"],
        "TeamHScore": fixture["team_h_score"],
    }


def team_idents(bootstrap_obj) -> dict[int, str]:
    return dict([(team["id"], team["name"]) for team in bootstrap_obj["teams"]])


@dg.asset(
    group_name="FPL",
    kinds={"Pandas"},
    code_version="v2",
    dagster_type=FPLFixturesDataFrame,
    output_required=False,
)
def fpl_fixtures_df(
    fpl_bootstrap_json: bytes,
    fpl_fixtures_json: bytes,
) -> dg.Output[pd.DataFrame]:
    """
    Convert the JSON from https://fantasy.premierleague.com into a Pandas DataFrame.

    This also uses DataVersions to detect if changes have been made (and will opt not
    to materialize if not). This is because the bootstrap_json changes constantly
    with additional fantasy-specific info, but we have to fetch it for the team IDs.

    So this asset is our primary "short-circuit" to prevent us from writing data over
    and over again from FPL.
    """

    fpl_fixtures_obj = json.loads(fpl_fixtures_json)

    df = pd.DataFrame.from_records(
        [fixture_dict(fixture) for fixture in fpl_fixtures_obj]
    )

    fpl_bootstrap_obj = json.loads(fpl_bootstrap_json)
    team_idents_dict = team_idents(fpl_bootstrap_obj)
    df = df[
        df["KickoffTime"].notnull()
    ]  # Filter null values, for fixtures that are postponed.
    df["FinishedProvisional"] = df["FinishedProvisional"].astype(bool)
    df["KickoffTime"] = pd.to_datetime(df["KickoffTime"], format="ISO8601")
    df["TeamA"] = df["TeamA"].map(team_idents_dict).map(canonical_name)
    df["TeamAScore"] = df["TeamAScore"].astype("Int64")
    df["TeamH"] = df["TeamH"].map(team_idents_dict).map(canonical_name)
    df["TeamHScore"] = df["TeamHScore"].astype("Int64")
    df["Div"] = "E0"
    df["Season"] = min(df["KickoffTime"]).year

    data_version = df_data_version(df)

    metadata_teams = (
        pd.concat([df["TeamH"], df["TeamA"]]).sort_values().unique().tolist()
    )
    return dg.Output(
        df,
        metadata={
            "dagster/row_count": len(df),
            "preview": dg.MetadataValue.md(
                pd.concat([df.head(), df.tail()]).to_markdown()
            ),
            "most_recent_match_date": dg.MetadataValue.text(
                str(max(df["KickoffTime"])) if not df.empty else "N/A"
            ),
            "teams": metadata_teams,
        },
        data_version=dg.DataVersion(data_version),
    )


@dg.asset(
    group_name="FPL",
    kinds={"Postgres"},
    code_version="v1",
    ins={"fpl_fixtures_df": dg.AssetIn(dagster_type=FPLFixturesDataFrame)},
    metadata={
        "dagster/column_schema": FixturesTableSchema,
        "dagster/table_name": "fixtures",
    },
    tags={"db_write": "true"},
    automation_condition=eager_respecting_data_version,
)
def fpl_fixtures_postgres(
    fpl_fixtures_df: pd.DataFrame, vercel_postgres: VercelPostgresResource
) -> dg.Output[None]:
    """Writes the fixtures from FPL into Postgres."""
    rows = [
        {str(col): val for col, val in row.items()}
        for row in fpl_fixtures_df.to_dict("records")
    ]
    rowcount = vercel_postgres.upsert_fixtures(rows)
    return dg.Output(None, metadata={"dagster/row_count": rowcount})


FPLResultsDataFrame = dg_pd.create_dagster_pandas_dataframe_type(
    name="FPLResultsDataFrame",
    columns=[
        dg_pd.PandasColumn.string_column("Div"),
        dg_pd.PandasColumn.integer_column("Season"),
        dg_pd.PandasColumn.datetime_column("Date", tz=None),
        dg_pd.PandasColumn.string_column("HomeTeam"),
        dg_pd.PandasColumn.string_column("AwayTeam"),
        dg_pd.PandasColumn.integer_column("FTHG", min_value=0),
        dg_pd.PandasColumn.integer_column("FTAG", min_value=0),
        dg_pd.PandasColumn.categorical_column("FTR", categories={"H", "A", "D"}),
    ],
    metadata_fn=lambda df: {
        "dagster/row_count": len(df),
        "preview": dg.MetadataValue.md(df.head().to_markdown()),
    },
)


def result_from_row(fixture) -> str:
    if fixture["FTAG"] > fixture["FTHG"]:
        return "A"
    if fixture["FTHG"] > fixture["FTAG"]:
        return "H"
    return "D"


@dg.asset(
    group_name="FPL",
    kinds={"Pandas"},
    ins={"fpl_fixtures_df": dg.AssetIn(dagster_type=FPLFixturesDataFrame)},
    code_version="v2",
    dagster_type=FPLResultsDataFrame,
    output_required=False,
)
def fpl_results_df(fpl_fixtures_df: pd.DataFrame) -> dg.Output[pd.DataFrame]:
    """
    Convert the JSON from https://fantasy.premierleague.com into completed matches,
    then convert them to our standard results format for eventual DB writes.
    """

    df = (
        fpl_fixtures_df[fpl_fixtures_df["FinishedProvisional"]]
        .drop(["FinishedProvisional"], axis=1)
        .rename(
            columns={
                "KickoffTime": "Date",
                "TeamA": "AwayTeam",
                "TeamAScore": "FTAG",
                "TeamH": "HomeTeam",
                "TeamHScore": "FTHG",
            }
        )
    )
    df["Date"] = df["Date"].dt.tz_convert(None).dt.normalize()
    df["FTR"] = df.apply(result_from_row, axis=1).astype(str)

    data_version = df_data_version(df)

    metadata_teams = (
        pd.concat([df["HomeTeam"], df["AwayTeam"]]).sort_values().unique().tolist()
    )
    return dg.Output(
        df,
        metadata={
            "dagster/row_count": len(df),
            "preview": dg.MetadataValue.md(df.head().to_markdown()),
            "most_recent_match_date": dg.MetadataValue.text(
                str(max(df["Date"])) if not df.empty else "N/A"
            ),
            "teams": metadata_teams,
        },
        data_version=dg.DataVersion(data_version),
    )


@dg.asset(
    group_name="FPL",
    kinds={"Postgres"},
    code_version="v1",
    ins={"fpl_results_df": dg.AssetIn(dagster_type=FPLResultsDataFrame)},
    metadata={
        "dagster/column_schema": MatchResultsTableSchema,
        "dagster/table_name": "matches",
    },
    tags={"db_write": "true"},
    automation_condition=eager_respecting_data_version,
)
def fpl_results_postgres(
    fpl_results_df: pd.DataFrame, vercel_postgres: VercelPostgresResource
) -> dg.Output[None]:
    """Writes the results from FPL into Postgres."""
    rows = [
        {str(col): val for col, val in row.items()}
        for row in fpl_results_df.to_dict("records")
    ]
    rowcount = vercel_postgres.upsert_matches(rows)
    return dg.Output(None, metadata={"dagster/row_count": rowcount})
