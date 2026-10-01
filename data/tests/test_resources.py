from functools import partial

import httpx
import pytest

from footballpace.defs.resources.footballdata import FootballDataResource
from footballpace.defs.resources.http import HTTPResource

fd = FootballDataResource(http_resource=HTTPResource())


def test_simple_url():
    assert fd.url(2023, "E0") == "https://www.football-data.co.uk/mmz4281/2324/E0.csv"


def test_millenium_url():
    assert fd.url(1999, "E0") == "https://www.football-data.co.uk/mmz4281/9900/E0.csv"


def test_zero_padded_url():
    assert fd.url(2000, "E0") == "https://www.football-data.co.uk/mmz4281/0001/E0.csv"


def test_http_resource_follows_redirects(monkeypatch: pytest.MonkeyPatch) -> None:
    original_url = fd.url(2026, "F1")
    redirected_url = "https://football-data.co.uk/mmz4281/2627/F1.csv"
    csv_bytes = b"Div,Date,HomeTeam,AwayTeam,FTHG,FTAG,FTR\nF1,01/10/26,A,B,1,0,H\n"
    requested_urls: list[str] = []

    def handle_request(request: httpx.Request) -> httpx.Response:
        requested_urls.append(str(request.url))
        if str(request.url) == original_url:
            return httpx.Response(302, headers={"Location": redirected_url})
        assert str(request.url) == redirected_url
        return httpx.Response(200, content=csv_bytes)

    monkeypatch.setattr(
        httpx,
        "Client",
        partial(httpx.Client, transport=httpx.MockTransport(handle_request)),
    )

    with HTTPResource().process_config_and_initialize_cm() as resource:
        response = resource.get(original_url)

    assert response.content == csv_bytes
    assert requested_urls == [original_url, redirected_url]


@pytest.mark.parametrize("status_code", [404, 500])
def test_http_resource_raises_for_redirected_errors(
    monkeypatch: pytest.MonkeyPatch, status_code: int
) -> None:
    original_url = fd.url(2026, "F1")
    redirected_url = "https://football-data.co.uk/mmz4281/2627/F1.csv"

    def handle_request(request: httpx.Request) -> httpx.Response:
        if str(request.url) == original_url:
            return httpx.Response(302, headers={"Location": redirected_url})
        assert str(request.url) == redirected_url
        return httpx.Response(status_code)

    monkeypatch.setattr(
        httpx,
        "Client",
        partial(httpx.Client, transport=httpx.MockTransport(handle_request)),
    )

    with HTTPResource().process_config_and_initialize_cm() as resource:
        with pytest.raises(httpx.HTTPStatusError) as exc_info:
            resource.get(original_url)

    assert exc_info.value.response.status_code == status_code
    assert str(exc_info.value.request.url) == redirected_url
