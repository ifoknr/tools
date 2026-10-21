"""The tools library: the owner adds a file, anyone gets it by its link, the site sees only names."""

import hashlib
import json

import pytest

from ifoknr_bot import config
from ifoknr_bot.library import Library

from .conftest import OWNER, STRANGER, buttons

pytestmark = pytest.mark.asyncio


def document(file_id, name, size):
    return {"document": {"file_id": file_id, "file_unique_id": file_id, "file_name": name, "file_size": size}}


def public(bot):
    return json.loads((bot.files_dir.parent / "public" / "private.json").read_text(encoding="utf-8"))


async def add(bot, file_id="f1", name="drivers.zip", data=b"driver bytes", title="USB Drivers Pack", cat="lc:utilities"):
    bot.tg.files[f"documents/{file_id}"] = data
    await bot.send(OWNER, **document(file_id, name, len(data)))
    assert [b["callback_data"] for b in buttons(bot.tg.last("editMessageText")["reply_markup"])] == ["la"]
    await bot.press(OWNER, "la")
    assert "وش اسم البرنامج" in bot.tg.last("editMessageText")["text"]
    await bot.send(OWNER, title)
    assert "lc:utilities" in [b["callback_data"] for b in buttons(bot.tg.last("sendMessage")["reply_markup"])]
    await bot.press(OWNER, cat)
    return bot.tg.last("editMessageText")["text"]


async def test_the_owner_adds_a_file_and_anyone_gets_it(bot):
    done = await add(bot)
    assert "USB Drivers Pack" in done
    lib = bot.app.bot_data["library"]
    entry = lib.entries[0]
    assert entry.file_id == "f1" and entry.c == "utilities" and entry.size == 12
    assert entry.sha256 == hashlib.sha256(b"driver bytes").hexdigest()
    assert f"start=get_{entry.id}" in done

    # The site's list: names, never the file id.
    items = public(bot)["items"]
    assert public(bot)["bot"] == "ifoknr_tools_bot"
    assert items == [{"id": entry.id, "name": "USB Drivers Pack", "t": entry.t, "c": "utilities",
                      "sha256": entry.sha256, "size": 12, "ext": "zip"}]
    assert "f1" not in json.dumps(public(bot))

    # Anyone, from the Mini App's link.
    await bot.send(STRANGER, f"/start get_{entry.id}", lang="en")
    sent = bot.tg.last("sendDocument")
    assert sent["document"] == "f1" and sent["chat_id"] == STRANGER
    assert "USB Drivers Pack" in sent["caption"] and entry.sha256 in sent["caption"]


async def test_an_unknown_or_forged_link_sends_nothing(bot):
    for arg in ("get_abcdef", "get_../../x", "get_"):
        await bot.send(STRANGER, f"/start {arg}", lang="en")
        assert "no longer in the library" in bot.tg.last("sendMessage")["text"]
    assert "sendDocument" not in bot.tg.methods()


async def test_a_file_too_big_to_save_can_still_be_added(bot):
    await bot.send(OWNER, **document("big", "rom.zip", 900 * 1024 * 1024))
    msg = bot.tg.last("sendMessage")
    assert "getFile" not in bot.tg.methods()
    assert "تيليجرام يحفظه" in msg["text"] and buttons(msg["reply_markup"])[0]["callback_data"] == "la"
    await bot.press(OWNER, "la")
    await bot.send(OWNER, "Stock ROM")
    await bot.press(OWNER, "lc:")
    entry = bot.app.bot_data["library"].entries[0]
    assert entry.file_id == "big" and entry.c == "" and entry.sha256 == "" and entry.size == 900 * 1024 * 1024


async def test_edit_and_remove(bot):
    await add(bot)
    entry = bot.app.bot_data["library"].entries[0]
    await bot.send(OWNER, "/library")
    assert buttons(bot.tg.last("sendMessage")["reply_markup"])[0]["callback_data"] == f"lo:{entry.id}"

    await bot.press(OWNER, f"ln:{entry.id}")
    await bot.send(OWNER, "تعريفات USB للويندوز")
    await bot.press(OWNER, f"lv:{entry.id}")
    await bot.send(OWNER, "2026")
    await bot.press(OWNER, f"lm:{entry.id}")
    await bot.send(OWNER, "USB Drivers")
    item = public(bot)["items"][0]
    assert item["note"] == "تعريفات USB للويندوز" and item["v"] == "2026" and item["name"] == "USB Drivers"

    await bot.press(OWNER, f"lr:{entry.id}")
    assert "متأكد" in bot.tg.last("editMessageText")["text"]
    await bot.press(OWNER, f"ly:{entry.id}")
    assert public(bot)["items"] == [] and bot.app.bot_data["library"].entries == []
    # The copy saved on the server stays.
    assert (bot.files_dir / "drivers.zip").exists()


async def test_a_stranger_cannot_add_or_edit(bot):
    await add(bot)
    entry = bot.app.bot_data["library"].entries[0]
    before = len(bot.tg.calls)
    for data in ("la", "lc:utilities", f"lr:{entry.id}", f"ly:{entry.id}", f"ln:{entry.id}", "ll"):
        await bot.press(STRANGER, data)
    await bot.send(STRANGER, "/library")
    assert [m for m in bot.tg.methods()[before:] if m != "answerCallbackQuery"] == ["sendMessage"]  # the tools list
    assert len(bot.app.bot_data["library"].entries) == 1


async def test_photos_are_not_offered(bot):
    bot.tg.files["documents/p1"] = b"jpeg"
    photo = [{"file_id": "p1", "file_unique_id": "p1", "width": 9, "height": 9, "file_size": 4}]
    await bot.send(OWNER, photo=photo)
    assert bot.tg.last("editMessageText").get("reply_markup") is None


async def test_the_library_survives_a_restart(tmp_path):
    lib = Library(tmp_path / "library.json", tmp_path / "public")
    e = lib.add("Tool <b>", "fid", "a.apk", 10, "system")
    again = Library(tmp_path / "library.json", tmp_path / "public")
    assert again.get(e.id).file_id == "fid" and again.get(e.id).name == "Tool <b>"
    assert oct((tmp_path / "library.json").stat().st_mode)[-3:] == "600"
    assert oct((tmp_path / "public" / "private.json").stat().st_mode)[-3:] == "644"
    with pytest.raises(ValueError):
        lib.add("x", "fid", c="nope")
    with pytest.raises(ValueError):
        lib.add("   ", "fid")


async def test_the_mini_app_needs_https():
    base = {"BOT_TOKEN": "1:x"}
    assert config.load({**base, "SITE_URL": "https://ifoknr.com"}).app_url == "https://ifoknr.com/app/"
    assert config.load({**base, "SITE_URL": "https://ifoknr.com/"}).app_url == "https://ifoknr.com/app/"
    assert config.load({**base, "SITE_URL": "http://192.168.1.5:8090"}).app_url == ""
