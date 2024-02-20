from footballpace.resources import FootballDataResource

fd = FootballDataResource()


def test_simple_url():
    assert fd._url(2023, "E0") == "https://www.football-data.co.uk/mmz4281/2324/E0.csv"


def test_millenium_url():
    assert fd._url(1999, "E0") == "https://www.football-data.co.uk/mmz4281/9900/E0.csv"


def test_zero_padded_url():
    assert fd._url(2000, "E0") == "https://www.football-data.co.uk/mmz4281/0001/E0.csv"
