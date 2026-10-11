"""The tools (from the site's tools.json) and their latest releases on GitHub."""

import json
import logging
import re
import time
from dataclasses import dataclass
from pathlib import Path

import httpx

log = logging.getLogger(__name__)

RELEASES_TTL = 30 * 60  # GitHub allows 60 requests an hour without a token
TOOLS_TTL = 60 * 60


@dataclass(frozen=True)
class Release:
    tag: str
    date: str
    url: str
    asset: str  # direct download of the main file, or "" when none matched
    downloads: int
    pre: bool = False  # only pre-releases so far (a beta)


def summarize(tool: dict, releases: list):
    """The latest stable release of a repo and the downloads of all its releases."""
    total = 0
    latest = None
    for r in releases:
        for a in r.get("assets") or []:
            total += a.get("download_count") or 0
        if latest is None and not r.get("draft") and not r.get("prerelease"):
            latest = r
    latest = latest or (releases[0] if releases else None)
    if not latest:
        return None
    pattern = re.compile(tool.get("asset") or r"\.zip$", re.I)
    asset = next((a["browser_download_url"] for a in latest.get("assets") or [] if pattern.search(a.get("name", ""))), "")
    return Release(latest.get("tag_name", ""), latest.get("published_at") or "", latest.get("html_url", ""), asset, total,
                   bool(latest.get("prerelease")))


class Catalog:
    def __init__(self, tools_file: Path, tools_url: str = "", github_token: str = "", client: httpx.AsyncClient = None):
        self.tools = json.loads(Path(tools_file).read_text(encoding="utf-8"))
        self.tools_url = tools_url
        self._client = client or httpx.AsyncClient(timeout=15, follow_redirects=True)
        self._headers = {"Accept": "application/vnd.github+json", "User-Agent": "ifoknr-tools-bot"}
        if github_token:
            self._headers["Authorization"] = f"Bearer {github_token}"
        self._tools_at = time.monotonic()
        self._releases = {}  # repo -> Release
        self._releases_at = 0.0

    def get(self, tool_id: str):
        return next((t for t in self.tools if t.get("id") == tool_id), None)

    def release(self, tool: dict):
        return self._releases.get(tool.get("repo"))

    async def refresh_tools(self, force: bool = False) -> None:
        """Picks up tools added to the site without rebuilding the bot."""
        if not self.tools_url or (not force and time.monotonic() - self._tools_at < TOOLS_TTL):
            return
        self._tools_at = time.monotonic()
        try:
            r = await self._client.get(self.tools_url)
            r.raise_for_status()
            tools = r.json()
            if isinstance(tools, list) and all(isinstance(t, dict) and t.get("id") for t in tools):
                self.tools = tools
        except Exception as e:  # keep the tools we have
            log.warning("tools.json refresh failed: %s", e)

    async def refresh_releases(self, force: bool = False) -> None:
        if not force and self._releases and time.monotonic() - self._releases_at < RELEASES_TTL:
            return
        self._releases_at = time.monotonic()
        for tool in self.tools:
            repo = tool.get("repo")
            if not repo:
                continue
            try:
                r = await self._client.get(f"https://api.github.com/repos/{repo}/releases", params={"per_page": 100}, headers=self._headers)
                r.raise_for_status()
                summary = summarize(tool, r.json())
                if summary:
                    self._releases[repo] = summary
            except Exception as e:  # keep the last answer
                log.warning("releases of %s: %s", repo, e)

    async def refresh(self) -> None:
        await self.refresh_tools()
        await self.refresh_releases()

    async def close(self) -> None:
        await self._client.aclose()
