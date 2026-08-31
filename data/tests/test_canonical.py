import pytest

from footballpace.canonical import canonical_name


@pytest.mark.parametrize(
    ("source_name", "expected_name"),
    [
        ("Brighton & Hove Albion", "Brighton"),
        ("Coventry", "Coventry"),
        ("Coventry City", "Coventry"),
        ("Hull", "Hull"),
        ("Hull City", "Hull"),
        ("Ipswich", "Ipswich"),
        ("Ipswich Town", "Ipswich"),
        ("Leicester City", "Leicester"),
        ("Man Utd", "Manchester United"),
        ("Newcastle United", "Newcastle"),
        ("Spurs", "Tottenham"),
        ("Tottenham Hotspur", "Tottenham"),
        ("West Ham United", "West Ham"),
    ],
)
def test_canonical_name_aliases(source_name: str, expected_name: str) -> None:
    assert canonical_name(source_name) == expected_name
