import json

import pytest

from ifoknr_bot import config
from ifoknr_bot.catalog import summarize
from ifoknr_bot.handlers import tool_card

from .conftest import RELEASES, TOOLS_JSON


def tools():
    return {t["id"]: t for t in json.loads(TOOLS_JSON.read_text(encoding="utf-8"))}


def test_latest_stable_release_and_all_downloads_are_counted():
    rel = summarize(tools()["nextzygisk"], RELEASES["ifoknr/NexTZygisk"])
    assert rel.tag == "v1.0.5-601"  # the newer one is a pre-release
    assert rel.asset == "https://dl/release.zip"  # the release build, not debug
    assert rel.downloads == 5 + 10 + 4200
    assert summarize(tools()["nextzygisk"], []) is None


def test_card_shows_live_version_and_links():
    tool = tools()["nextzygisk"]
    text, keyboard = tool_card(tool, summarize(tool, RELEASES["ifoknr/NexTZygisk"]), "en")
    assert "<b>NextZygisk</b>" in text and "v1.0.5-601" in text and "4,215 downloads" in text
    assert "Based on ReZygisk by PerformanC." in text
    urls = [b.url for row in keyboard.inline_keyboard for b in row if b.url]
    assert urls[0] == "https://dl/release.zip"
    assert "https://github.com/ifoknr/NexTZygisk" in urls


def test_card_without_github_falls_back_to_the_known_version():
    text, keyboard = tool_card(tools()["fastbootstudio"], None, "ar")
    known = tools()["fastbootstudio"]["version"]  # whatever tools.json says, so a release needs no test change
    assert known in text and "winget install IFOKNR.FastbootStudio" in text
    assert keyboard.inline_keyboard[0][0].url == "https://github.com/ifoknr/FastbootStudio/releases/latest"


def test_coming_soon_has_no_download():
    text, keyboard = tool_card(dict(tools()["companion"], soon=True), None, "ar")
    assert "قريباً" in text
    assert all(b.url is None for row in keyboard.inline_keyboard for b in row)


def test_owner_ids_must_be_numbers():
    assert config.parse_owners("1, 2;3") == {1, 2, 3}
    assert config.parse_owners("") == frozenset()
    with pytest.raises(ValueError):
        config.parse_owners("@ifoknr")


def test_a_beta_says_so():
    tool = tools()["companion"]
    release = summarize(tool, [{"tag_name": "v2.4.0", "prerelease": True, "published_at": "2026-10-11T09:00:00Z",
                                "html_url": "https://r", "assets": [{"name": "FastbootStudio-Companion-v2.4.0.zip",
                                                                     "browser_download_url": "https://dl/c.zip", "download_count": 4}]}])
    assert release.pre and release.asset == "https://dl/c.zip"
    text, _ = tool_card(tool, release, "ar")
    assert "<code>v2.4.0</code> · تجريبي" in text


def test_a_tool_with_an_xda_thread_links_it():
    _, keyboard = tool_card(tools()["fastbootstudio"], None, "en")
    urls = [b.url for row in keyboard.inline_keyboard for b in row if b.url]
    assert any(u.startswith("https://xdaforums.com/t/") for u in urls)
