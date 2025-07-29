from footballpace.defs.resources.footballdata import FootballDataResource
from footballpace.defs.resources.http import HTTPResource

fd = FootballDataResource(http_resource=HTTPResource())


def test_simple_url():
    assert fd.url(2023, "E0") == "https://www.football-data.co.uk/mmz4281/2324/E0.csv"


def test_millenium_url():
    assert fd.url(1999, "E0") == "https://www.football-data.co.uk/mmz4281/9900/E0.csv"


def test_zero_padded_url():
    assert fd.url(2000, "E0") == "https://www.football-data.co.uk/mmz4281/0001/E0.csv"
