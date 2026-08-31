_TEAM_NAME_ALIASES: dict[str, str] = {
    "Brighton & Hove Albion": "Brighton",
    "Coventry City": "Coventry",
    "Hull City": "Hull",
    "Ipswich Town": "Ipswich",
    "Leicester City": "Leicester",
    "Newcastle United": "Newcastle",
    "Spurs": "Tottenham",
    "Tottenham Hotspur": "Tottenham",
    "West Ham United": "West Ham",
}


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

    return _TEAM_NAME_ALIASES.get(team_name, team_name)
