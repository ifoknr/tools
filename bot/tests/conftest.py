"""A bot wired to a fake Telegram and a fake GitHub, so handlers run end to end offline."""

import json
from itertools import count
from pathlib import Path

import httpx
import pytest_asyncio
from telegram import Update
from telegram.request import BaseRequest

from ifoknr_bot import config, main
from ifoknr_bot.catalog import Catalog

OWNER = 1001
STRANGER = 2002
TOOLS_JSON = Path(__file__).resolve().parents[2] / "site" / "assets" / "tools.json"


class FakeTelegram(BaseRequest):
    """Answers Bot API calls and records them. Files to download are put in .files."""

    def __init__(self):
        self.calls = []  # (method, parameters)
        self.files = {}  # file_path -> bytes
        self._ids = count(500)

    async def initialize(self):
        pass

    async def shutdown(self):
        pass

    @property
    def read_timeout(self):
        return 5

    def _message(self, chat_id, text=None, **extra):
        msg = {"message_id": next(self._ids), "date": 0, "chat": {"id": int(chat_id), "type": "private"}}
        if text is not None:
            msg["text"] = text
        msg.update(extra)
        return msg

    async def do_request(self, url, method, request_data=None, read_timeout=None, write_timeout=None, connect_timeout=None, pool_timeout=None):
        if "/file/bot" in url:
            path = url.split("/file/bot", 1)[1].split("/", 1)[1]
            return 200, self.files[path]
        name = url.rsplit("/", 1)[1]
        params = dict(request_data.parameters) if request_data is not None else {}
        self.calls.append((name, params))
        if name == "getMe":
            result = {"id": 1, "is_bot": True, "first_name": "IFOKNR Tools", "username": "ifoknr_tools_bot"}
        elif name in ("sendMessage", "editMessageText"):
            result = self._message(params.get("chat_id", OWNER), params.get("text"))
        elif name == "sendDocument":
            result = self._message(params.get("chat_id", OWNER), document={"file_id": "x", "file_unique_id": "x"})
        elif name == "getFile":
            file_id = params["file_id"]
            path = f"documents/{file_id}"
            result = {"file_id": file_id, "file_unique_id": file_id, "file_size": len(self.files.get(path, b"")), "file_path": path}
        else:
            result = True
        return 200, json.dumps({"ok": True, "result": result}).encode()

    def last(self, method):
        return next((p for m, p in reversed(self.calls) if m == method), None)

    def methods(self):
        return [m for m, _ in self.calls]


def github_transport(releases):
    def handler(request: httpx.Request):
        if request.url.host == "api.github.com":
            repo = request.url.path.split("/repos/", 1)[1].rsplit("/releases", 1)[0]
            return httpx.Response(200, json=releases.get(repo, []))
        return httpx.Response(404)
    return httpx.MockTransport(handler)


RELEASES = {
    "ifoknr/NexTZygisk": [
        {"tag_name": "v1.0.6-650", "published_at": "2026-10-09T10:00:00Z", "html_url": "https://github.com/ifoknr/NexTZygisk/releases/tag/v1.0.6-650",
         "draft": False, "prerelease": True, "assets": [{"name": "NextZygisk-v1.0.6-650-release.zip", "browser_download_url": "https://dl/pre.zip", "download_count": 5}]},
        {"tag_name": "v1.0.5-601", "published_at": "2026-10-08T15:00:00Z", "html_url": "https://github.com/ifoknr/NexTZygisk/releases/tag/v1.0.5-601",
         "draft": False, "prerelease": False, "assets": [
             {"name": "NextZygisk-v1.0.5-601-debug.zip", "browser_download_url": "https://dl/debug.zip", "download_count": 10},
             {"name": "NextZygisk-v1.0.5-601-release.zip", "browser_download_url": "https://dl/release.zip", "download_count": 4200}]},
    ],
}


class Harness:
    def __init__(self, app, telegram, files_dir):
        self.app = app
        self.tg = telegram
        self.files_dir = files_dir
        self._ids = count(1)

    def _user(self, user_id, lang):
        return {"id": user_id, "is_bot": False, "first_name": "Turki" if user_id == OWNER else "Guest", "language_code": lang}

    async def send(self, user_id, text=None, lang="ar", **message):
        msg = {"message_id": next(self._ids), "date": 0, "chat": {"id": user_id, "type": "private"}, "from": self._user(user_id, lang)}
        if text is not None:
            msg["text"] = text
            if text.startswith("/"):
                msg["entities"] = [{"type": "bot_command", "offset": 0, "length": len(text.split()[0])}]
        msg.update(message)
        await self.app.process_update(Update.de_json({"update_id": next(self._ids), "message": msg}, self.app.bot))

    async def press(self, user_id, data, lang="ar"):
        query = {
            "id": str(next(self._ids)), "chat_instance": "c", "data": data, "from": self._user(user_id, lang),
            "message": {"message_id": 99, "date": 0, "chat": {"id": user_id, "type": "private"}, "text": "x"},
        }
        await self.app.process_update(Update.de_json({"update_id": next(self._ids), "callback_query": query}, self.app.bot))


@pytest_asyncio.fixture
async def bot(tmp_path):
    cfg = config.load({"BOT_TOKEN": "123:TEST", "OWNER_IDS": str(OWNER), "DATA_DIR": str(tmp_path), "TOOLS_FILE": str(TOOLS_JSON), "TOOLS_URL": ""})
    tg = FakeTelegram()
    app = main.build(cfg)
    # Swap in the fakes: Telegram for the bot, GitHub for the catalog.
    app.bot._request = (tg, tg)
    app.bot_data["catalog"] = Catalog(TOOLS_JSON, "", "", client=httpx.AsyncClient(transport=github_transport(RELEASES)))
    await app.initialize()
    yield Harness(app, tg, cfg.files_dir)
    await app.shutdown()


def buttons(markup):
    return [b for row in (markup or {}).get("inline_keyboard", []) for b in row]
