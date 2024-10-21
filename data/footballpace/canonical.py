def canonical_name(team_name: str) -> str:
    """
    This function is ugly.

    There's simply no consistency in how team names are represented.
    "Manchester United FC" and "Man Utd" are both completely reasonable ways
    to describe that team, and so we need to find some way to make them the
    same.

    There are some attempts here to be rigorous... but there's also just a lot
    of one-off logic.
    """
    team_name = team_name.removesuffix(" FC")
    team_name = team_name.removesuffix(" AFC")
    team_name = team_name.removeprefix("AFC ")
    team_name = team_name.removesuffix("FC ")
    team_name = team_name.replace(" Utd", " United")
    team_name = team_name.replace("Man ", "Manchester ")
    if team_name == "Spurs" or team_name == "Tottenham Hotspur":
        team_name = "Tottenham"
    if team_name == "Brighton & Hove Albion":
        team_name = "Brighton"
    if team_name == "Leicester City":
        team_name = "Leicester"
    if team_name == "West Ham United":
        team_name = "West Ham"
    if team_name == "Newcastle United":
        team_name = "Newcastle"

    return team_name
