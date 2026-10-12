"""Whole conversations against the fake Telegram in conftest."""

import json

import pytest

from .conftest import OWNER, STRANGER, TOOLS_JSON, buttons

pytestmark = pytest.mark.asyncio


def document(file_id, name, size):
    return {"document": {"file_id": file_id, "file_unique_id": file_id, "file_name": name, "file_size": size}}


async def test_everyone_sees_the_tools(bot):
    await bot.send(STRANGER, "/start", lang="en")
    msg = bot.tg.last("sendMessage")
    assert "IFOKNR tools" in msg["text"] and "owner" not in msg["text"]
    labels = [b["text"] for b in buttons(msg["reply_markup"])]
    assert labels[:6] == ["NextZygisk", "NextWheel", "NextSUSFS", "NEXTCORE", "Fastboot Studio", "Fastboot Studio Companion"]

    await bot.press(STRANGER, "t:nextzygisk", lang="en")
    card = bot.tg.last("editMessageText")
    assert "v1.0.5-601" in card["text"]
    assert buttons(card["reply_markup"])[0]["url"] == "https://dl/release.zip"


async def test_the_owner_is_told_about_file_storage(bot):
    await bot.send(OWNER, "/start")
    assert "أنت المالك" in bot.tg.last("sendMessage")["text"]


async def test_lang_switches_and_is_remembered(bot):
    await bot.send(STRANGER, "/lang", lang="ar")
    assert bot.tg.last("sendMessage")["text"] == "Language set to English."
    await bot.send(STRANGER, "/help", lang="ar")
    assert "Commands" in bot.tg.last("sendMessage")["text"]


async def test_a_stranger_cannot_store_or_browse(bot):
    bot.tg.files["documents/f1"] = b"data"
    await bot.send(STRANGER, **document("f1", "x.txt", 4))
    assert "getFile" not in bot.tg.methods()
    assert list(bot.files_dir.iterdir()) == []
    before = len(bot.tg.calls)
    await bot.send(STRANGER, "/files")
    await bot.send(STRANGER, "/status")
    await bot.press(STRANGER, "fo:0")
    assert [m for m in bot.tg.methods()[before:] if m != "answerCallbackQuery"] == []


async def test_the_owner_stores_a_file(bot):
    bot.tg.files["documents/f1"] = b"hello world"
    await bot.send(OWNER, **document("f1", "report.pdf", 11))
    assert (bot.files_dir / "report.pdf").read_bytes() == b"hello world"
    assert "report.pdf" in bot.tg.last("editMessageText")["text"]
    # Same name again: kept apart, nothing overwritten; no partial files left behind.
    bot.tg.files["documents/f2"] = b"second"
    await bot.send(OWNER, **document("f2", "report.pdf", 6))
    assert (bot.files_dir / "report (2).pdf").read_bytes() == b"second"
    assert sorted(p.name for p in bot.files_dir.iterdir()) == ["report (2).pdf", "report.pdf"]


async def test_a_photo_gets_a_name(bot):
    bot.tg.files["documents/p1"] = b"jpeg"
    photo = [{"file_id": "p0", "file_unique_id": "p0", "width": 90, "height": 90, "file_size": 2},
             {"file_id": "p1", "file_unique_id": "p1", "width": 1280, "height": 960, "file_size": 4}]
    await bot.send(OWNER, photo=photo)
    stored = list(bot.files_dir.iterdir())
    assert len(stored) == 1 and stored[0].name.startswith("photo_") and stored[0].read_bytes() == b"jpeg"


async def test_a_file_too_big_for_telegram_is_refused(bot):
    await bot.send(OWNER, **document("big", "rom.zip", 900 * 1024 * 1024))
    assert "getFile" not in bot.tg.methods()
    assert "20.0 MB" in bot.tg.last("sendMessage")["text"]


async def test_folders_upload_target_send_and_delete(bot):
    await bot.send(OWNER, "/mkdir Papers")
    assert "Papers" in bot.tg.last("sendMessage")["text"]
    bot.tg.files["documents/f1"] = b"paper"
    await bot.send(OWNER, **document("f1", "id card.jpg", 5))
    assert (bot.files_dir / "Papers" / "id card.jpg").exists()

    await bot.send(OWNER, "/files")  # opens the upload folder
    listing = bot.tg.last("sendMessage")
    assert "/Papers" in listing["text"]
    assert buttons(listing["reply_markup"])[0]["callback_data"] == "fo:0"

    await bot.press(OWNER, "fo:0")
    assert "id card.jpg" in bot.tg.last("editMessageText")["text"]
    await bot.press(OWNER, "fs:0")
    assert bot.tg.last("sendDocument")["caption"] == "/Papers/id card.jpg"
    await bot.press(OWNER, "fd:0")
    assert "Papers/id card.jpg" in bot.tg.last("editMessageText")["text"]
    assert (bot.files_dir / "Papers" / "id card.jpg").exists()  # only asked
    await bot.press(OWNER, "fy:0")
    assert not (bot.files_dir / "Papers" / "id card.jpg").exists()

    await bot.press(OWNER, "fu")
    root = bot.tg.last("editMessageText")
    assert "📁 Papers" in [b["text"] for b in buttons(root["reply_markup"])]
    await bot.press(OWNER, "fh")  # uploads go back to the root
    bot.tg.files["documents/f2"] = b"r"
    await bot.send(OWNER, **document("f2", "root.txt", 1))
    assert (bot.files_dir / "root.txt").exists()


async def test_a_stale_button_does_not_act_on_another_file(bot):
    (bot.files_dir / "a.txt").write_text("a")
    await bot.send(OWNER, "/files")
    (bot.files_dir / "a.txt").unlink()
    await bot.press(OWNER, "fy:0")
    await bot.press(OWNER, "fy:7")
    assert bot.tg.last("answerCallbackQuery")["show_alert"] is True


async def test_files_outside_the_store_cannot_be_reached(bot):
    await bot.send(OWNER, "/files ../../etc")
    assert "❌" in bot.tg.last("sendMessage")["text"]
    await bot.send(OWNER, "/mkdir ../evil")
    assert not (bot.files_dir.parent / "evil").exists()


async def test_notes_and_status(bot):
    await bot.send(OWNER, "/note buy a new cable")
    assert "buy a new cable" in (bot.files_dir / "notes.md").read_text(encoding="utf-8")
    await bot.send(OWNER, "/status")
    text = bot.tg.last("sendMessage")["text"]
    assert "حالة السيرفر" in text and "notes" not in text


async def test_latest_lists_every_tool(bot):
    await bot.send(STRANGER, "/latest", lang="en")
    text = bot.tg.last("sendMessage")["text"]
    assert "NextZygisk</b>: <code>v1.0.5-601</code>" in text
    known = {t["id"]: t for t in json.loads(TOOLS_JSON.read_text(encoding="utf-8"))}
    assert f"NextWheel</b>: <code>{known['nextwheel']['version']}</code>" in text  # GitHub had nothing: the known version
    companion = known["companion"]
    assert f"Companion</b>: <code>{companion['version']}</code> · Beta" in text  # a beta says so


async def test_two_files_with_one_name_at_once_are_both_kept(bot):
    import asyncio
    bot.tg.files["documents/f1"] = b"one"
    bot.tg.files["documents/f2"] = b"two"
    await asyncio.gather(bot.send(OWNER, **document("f1", "same.txt", 3)), bot.send(OWNER, **document("f2", "same.txt", 3)))
    assert sorted(p.read_bytes() for p in bot.files_dir.iterdir()) == [b"one", b"two"]
