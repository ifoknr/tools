"""What the bot does with each command, button and file."""

import asyncio
import html
import logging
import os
import re
import time
from datetime import datetime

from telegram import InlineKeyboardButton as Button
from telegram import InlineKeyboardMarkup as Keyboard
from telegram import Update
from telegram.constants import ChatType, ParseMode
from telegram.error import BadRequest
from telegram.ext import ContextTypes

from .storage import Store, StoreError, human_size
from .texts import T, date_text, lang_of, number, t

log = logging.getLogger(__name__)

PAGE = 8  # entries per page in /files


# ---------- shared ----------

def _cfg(context):
    return context.application.bot_data["config"]


def _catalog(context):
    return context.application.bot_data["catalog"]


def _store(context) -> Store:
    return context.application.bot_data["store"]


def _lang(update: Update, context) -> str:
    return lang_of(update.effective_user, context.user_data)


def _owner(update: Update, context) -> bool:
    user = update.effective_user
    return _cfg(context).is_owner(user.id if user else None)


def _private(update: Update) -> bool:
    return update.effective_chat is not None and update.effective_chat.type == ChatType.PRIVATE


async def _reply(update: Update, text: str, keyboard=None):
    return await update.effective_message.reply_text(text, parse_mode=ParseMode.HTML, reply_markup=keyboard, disable_web_page_preview=True)


async def _edit_or_reply(update: Update, text: str, keyboard=None):
    """Edits the message a button belongs to, or answers a command with a new one."""
    query = update.callback_query
    if query is not None:
        try:
            await query.edit_message_text(text, parse_mode=ParseMode.HTML, reply_markup=keyboard, disable_web_page_preview=True)
        except BadRequest as e:
            if "not modified" not in str(e).lower():
                raise
        return
    await _reply(update, text, keyboard)


def _error_text(lang: str, e: StoreError) -> str:
    key = "err_" + e.key
    return t(lang, key) if key in T[lang] else str(e)


def _plain(text: str) -> str:
    """Message HTML as plain text, for button pop-ups."""
    return html.unescape(re.sub(r"<[^>]+>", "", text))


# ---------- tools (everyone) ----------

def _tool_name(tool) -> str:
    return "".join(tool.get("name") or [tool.get("id", "?")])


def _tools_keyboard(context, lang: str) -> Keyboard:
    catalog = _catalog(context)
    buttons = [Button(_tool_name(tool), callback_data="t:" + tool["id"]) for tool in catalog.tools]
    rows = [buttons[i:i + 2] for i in range(0, len(buttons), 2)]
    links = []
    cfg = _cfg(context)
    if cfg.site_url:
        links.append(Button(t(lang, "btn_site"), url=cfg.site_url))
    if cfg.channel_url:
        links.append(Button(t(lang, "btn_channel"), url=cfg.channel_url))
    if links:
        rows.append(links)
    return Keyboard(rows)


def tool_card(tool: dict, release, lang: str):
    """The text and buttons of one tool's card."""
    text = tool.get(lang) or tool.get("en") or {}
    e = html.escape
    lines = [f"<b>{e(_tool_name(tool))}</b>", f"<i>{e(text.get('tagline', ''))}</i>", "", e(text.get("about", ""))]
    points = text.get("points") or []
    if points:
        lines.append("")
        lines.extend("• " + e(p) for p in points)
    lines.append("")
    if tool.get("soon"):
        lines.append(t(lang, "soon"))
    else:
        version = release.tag if release else tool.get("version", "")
        meta = [f"<b>{t(lang, 'version')}:</b> <code>{e(version)}</code>"]
        if release and release.date:
            meta.append(date_text(lang, release.date))
        if release and release.downloads:
            meta.append(t(lang, "downloads", n=number(release.downloads)))
        lines.append(" · ".join(meta))
    if tool.get("needs"):
        lines.append(f"<b>{t(lang, 'needs')}:</b> " + e(", ".join(tool["needs"])))
    credit = []
    if tool.get("base"):
        credit.append(t(lang, "based_on", name=e(tool["base"]["name"]), by=e(tool["base"]["by"])))
    if tool.get("uses"):
        credit.append(t(lang, "uses", name=e(tool["uses"]["name"]), by=e(tool["uses"]["by"])))
    if tool.get("license"):
        credit.append(t(lang, "license", l=e(tool["license"])))
    if credit:
        lines.append("")
        lines.append("<i>" + " ".join(credit) + "</i>")
    if tool.get("winget"):
        lines.append("")
        lines.append(f"<code>{e(tool['winget'])}</code>")

    rows = []
    if tool.get("repo") and not tool.get("soon"):
        repo_url = "https://github.com/" + tool["repo"]
        download = (release.asset if release and release.asset else repo_url + "/releases/latest")
        label = t(lang, "btn_download", v=release.tag) if release else t(lang, "btn_download_plain")
        rows.append([Button(label, url=download)])
        rows.append([
            Button(t(lang, "btn_source"), url=repo_url),
            Button(t(lang, "btn_changes"), url=release.url if release and release.url else repo_url + "/releases"),
        ])
    rows.append([Button(t(lang, "btn_back"), callback_data="tl")])
    return "\n".join(lines), Keyboard(rows)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    lang = _lang(update, context)
    name = html.escape(update.effective_user.first_name or "") if update.effective_user else ""
    text = t(lang, "start", name=name)
    if _owner(update, context) and _private(update):
        text += t(lang, "start_owner")
    await _reply(update, text, _tools_keyboard(context, lang))


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    lang = _lang(update, context)
    text = t(lang, "help")
    if _owner(update, context) and _private(update):
        text += t(lang, "help_owner")
    await _reply(update, text)


async def tools_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    lang = _lang(update, context)
    await _catalog(context).refresh_tools()
    await _edit_or_reply(update, t(lang, "tools"), _tools_keyboard(context, lang))


async def latest(update: Update, context: ContextTypes.DEFAULT_TYPE):
    lang = _lang(update, context)
    catalog = _catalog(context)
    await catalog.refresh()
    lines = [t(lang, "latest"), ""]
    for tool in catalog.tools:
        name = html.escape(_tool_name(tool))
        if tool.get("soon") or not tool.get("repo"):
            lines.append(f"• <b>{name}</b>: {t(lang, 'soon')}")
            continue
        rel = catalog.release(tool)
        version = html.escape(rel.tag if rel else tool.get("version", ""))
        when = date_text(lang, rel.date) if rel and rel.date else ""
        lines.append(f"• <b>{name}</b>: <code>{version}</code>" + (f" · {when}" if when else ""))
    await _reply(update, "\n".join(lines), _tools_keyboard(context, lang))


async def show_tool(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    lang = _lang(update, context)
    catalog = _catalog(context)
    tool = catalog.get(query.data[2:])
    if tool is None:
        await _edit_or_reply(update, t(lang, "tools"), _tools_keyboard(context, lang))
        return
    await catalog.refresh()
    text, keyboard = tool_card(tool, catalog.release(tool), lang)
    await _edit_or_reply(update, text, keyboard)


async def tools_back(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.callback_query.answer()
    await tools_command(update, context)


async def lang_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    current = _lang(update, context)
    context.user_data["lang"] = "en" if current == "ar" else "ar"
    lang = context.user_data["lang"]
    await _reply(update, t(lang, "lang_set"), _tools_keyboard(context, lang))


async def my_id(update: Update, context: ContextTypes.DEFAULT_TYPE):
    lang = _lang(update, context)
    await _reply(update, t(lang, "id", id=update.effective_user.id))


async def other_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Text that is not a command, in a private chat: show the tools."""
    lang = _lang(update, context)
    if _owner(update, context):
        await _reply(update, t(lang, "help") + t(lang, "help_owner"))
    else:
        await _reply(update, t(lang, "tools"), _tools_keyboard(context, lang))


# ---------- files (owner only) ----------

def _upload_folder(context) -> str:
    folder = context.user_data.get("folder", "")
    try:
        entry = _store(context).entry(folder)
        return entry.rel if entry.is_dir else ""
    except StoreError:
        return ""


def _media(message):
    """(file object, file name) of whatever the message carries, or (None, None)."""
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    if message.document:
        return message.document, message.document.file_name or f"file_{stamp}"
    if message.photo:
        return message.photo[-1], f"photo_{stamp}.jpg"
    if message.video:
        return message.video, message.video.file_name or f"video_{stamp}.mp4"
    if message.audio:
        a = message.audio
        name = a.file_name or (" - ".join(x for x in (a.performer, a.title) if x) + ".mp3" if (a.performer or a.title) else f"audio_{stamp}.mp3")
        return a, name
    if message.voice:
        return message.voice, f"voice_{stamp}.ogg"
    if message.video_note:
        return message.video_note, f"videonote_{stamp}.mp4"
    if message.animation:
        return message.animation, message.animation.file_name or f"animation_{stamp}.mp4"
    return None, None


async def receive_file(update: Update, context: ContextTypes.DEFAULT_TYPE):
    lang = _lang(update, context)
    if not _owner(update, context):
        await _reply(update, t(lang, "not_owner_file"), _tools_keyboard(context, lang))
        return
    cfg = _cfg(context)
    store = _store(context)
    media, name = _media(update.effective_message)
    if media is None:
        return
    size = media.file_size or 0
    if size > cfg.download_limit:
        await _reply(update, t(lang, "too_big", size=human_size(size), limit=human_size(cfg.download_limit)))
        return

    folder = _upload_folder(context)
    status = await _reply(update, t(lang, "saving"))
    part = target = None
    try:
        target = store.reserve(folder, name)
        part = target.with_name("." + target.name + ".part")  # hidden from /files until complete
        tg_file = await context.bot.get_file(media.file_id)
        await tg_file.download_to_drive(part)
        os.replace(part, target)
        rel = store.rel(target)
        text = t(lang, "saved", path=html.escape("/" + rel), size=human_size(target.stat().st_size))
    except StoreError as e:
        text = _error_text(lang, e)
    except Exception as e:
        log.exception("saving %s failed", name)
        text = t(lang, "save_failed", error=html.escape(str(e)))
    finally:
        if part is not None and part.exists():
            part.unlink(missing_ok=True)
        if target is not None:
            store.release(target)
    await status.edit_text(text, parse_mode=ParseMode.HTML)


def _folder_view(context, lang: str, folder: str, page: int = 0):
    store = _store(context)
    entries = store.list(folder)
    context.user_data["listing"] = {"folder": folder, "entries": [e.rel for e in entries], "page": page}
    dirs = sum(1 for e in entries if e.is_dir)
    files = len(entries) - dirs
    size = sum(e.size for e in entries if not e.is_dir)
    shown = html.escape(folder)
    if entries:
        text = t(lang, "folder", path=shown, dirs=dirs, files=files, size=human_size(size))
    else:
        text = t(lang, "folder_empty", path=shown)
    if _upload_folder(context) == folder:
        text += "\n" + t(lang, "upload_here_now", path=shown)

    pages = max(1, (len(entries) + PAGE - 1) // PAGE)
    page = min(max(page, 0), pages - 1)
    context.user_data["listing"]["page"] = page
    rows = []
    for i in range(page * PAGE, min(len(entries), (page + 1) * PAGE)):
        e = entries[i]
        name = e.name if len(e.name) <= 40 else e.name[:37] + "…"
        label = f"📁 {name}" if e.is_dir else f"📄 {name} · {human_size(e.size)}"
        rows.append([Button(label, callback_data=f"fo:{i}")])
    nav = []
    if page > 0:
        nav.append(Button(t(lang, "btn_prev"), callback_data=f"fp:{page - 1}"))
    if page < pages - 1:
        nav.append(Button(t(lang, "btn_next"), callback_data=f"fp:{page + 1}"))
    if nav:
        rows.append(nav)
    actions = []
    if folder:
        actions.append(Button(t(lang, "btn_up"), callback_data="fu"))
    if _upload_folder(context) != folder:
        actions.append(Button(t(lang, "btn_upload_here"), callback_data="fh"))
    if actions:
        rows.append(actions)
    return text, Keyboard(rows)


async def files_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not _owner(update, context):
        return
    lang = _lang(update, context)
    folder = " ".join(context.args).strip().strip("/") if context.args else _upload_folder(context)
    try:
        entry = _store(context).entry(folder)
        folder = entry.rel if entry.is_dir else ""
        text, keyboard = _folder_view(context, lang, folder)
    except StoreError as e:
        await _reply(update, _error_text(lang, e))
        return
    await _reply(update, text, keyboard)


def _listing_entry(context, data: str):
    """The path a button points to, from the listing it was shown in; None if gone."""
    listing = context.user_data.get("listing") or {}
    try:
        return listing["entries"][int(data.split(":", 1)[1])]
    except (KeyError, IndexError, ValueError):
        return None


async def files_button(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    lang = _lang(update, context)
    if not _owner(update, context):
        await query.answer()
        return
    store = _store(context)
    listing = context.user_data.get("listing") or {}
    folder = listing.get("folder", "")
    data = query.data
    try:
        if data == "fu":
            await query.answer()
            parent = folder.rsplit("/", 1)[0] if "/" in folder else ""
            await _edit_or_reply(update, *_folder_view(context, lang, parent))
        elif data == "fb":
            await query.answer()
            await _edit_or_reply(update, *_folder_view(context, lang, folder, listing.get("page", 0)))
        elif data == "fh":
            context.user_data["folder"] = folder
            await query.answer(_plain(t(lang, "upload_here_now", path=folder)))
            await _edit_or_reply(update, *_folder_view(context, lang, folder, listing.get("page", 0)))
        elif data.startswith("fp:"):
            await query.answer()
            await _edit_or_reply(update, *_folder_view(context, lang, folder, int(data[3:])))
        else:
            rel = _listing_entry(context, data)
            if rel is None:
                await query.answer(t(lang, "err_expired"), show_alert=True)
                return
            index = data.split(":", 1)[1]
            entry = store.entry(rel)
            if data.startswith("fo:"):
                await query.answer()
                if entry.is_dir:
                    await _edit_or_reply(update, *_folder_view(context, lang, entry.rel))
                else:
                    when = datetime.fromtimestamp(entry.modified).strftime("%Y-%m-%d %H:%M")
                    text = t(lang, "file_info", path=html.escape(entry.rel), size=human_size(entry.size), date=when)
                    keyboard = Keyboard([
                        [Button(t(lang, "btn_send"), callback_data=f"fs:{index}"), Button(t(lang, "btn_delete"), callback_data=f"fd:{index}")],
                        [Button(t(lang, "btn_back_folder"), callback_data="fb")],
                    ])
                    await _edit_or_reply(update, text, keyboard)
            elif data.startswith("fs:"):
                limit = _cfg(context).upload_limit
                if entry.size > limit:
                    await query.answer(_plain(t(lang, "send_too_big", limit=human_size(limit))), show_alert=True)
                    return
                await query.answer()
                with open(store.resolve(entry.rel), "rb") as f:
                    await context.bot.send_document(update.effective_chat.id, document=f, filename=entry.name, caption="/" + entry.rel)
            elif data.startswith("fd:"):
                await query.answer()
                keyboard = Keyboard([[Button(t(lang, "btn_yes_delete"), callback_data=f"fy:{index}"), Button(t(lang, "btn_cancel"), callback_data="fb")]])
                await _edit_or_reply(update, t(lang, "confirm_delete", path=html.escape(entry.rel)), keyboard)
            elif data.startswith("fy:"):
                store.delete(entry.rel)
                await query.answer()
                text, keyboard = _folder_view(context, lang, folder, listing.get("page", 0))
                await _edit_or_reply(update, t(lang, "deleted", path=html.escape(entry.rel)) + "\n\n" + text, keyboard)
            else:
                await query.answer()
    except StoreError as e:
        await query.answer(_plain(_error_text(lang, e)), show_alert=True)


async def mkdir_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not _owner(update, context):
        return
    lang = _lang(update, context)
    name = " ".join(context.args or []).strip()
    if not name:
        await _reply(update, t(lang, "mkdir_usage"))
        return
    try:
        listing = context.user_data.get("listing") or {}
        parent = listing.get("folder", _upload_folder(context))
        rel = _store(context).mkdir(parent, name)
    except StoreError as e:
        await _reply(update, _error_text(lang, e))
        return
    context.user_data["folder"] = rel
    await _reply(update, t(lang, "mkdir_ok", path=html.escape(rel)))


async def here_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not _owner(update, context):
        return
    lang = _lang(update, context)
    await _reply(update, t(lang, "upload_here_now", path=html.escape(_upload_folder(context))))


async def note_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not _owner(update, context):
        return
    lang = _lang(update, context)
    text = update.effective_message.text or ""
    body = text.split(maxsplit=1)[1] if len(text.split(maxsplit=1)) > 1 else ""
    if not body.strip():
        await _reply(update, t(lang, "note_usage"))
        return
    rel = _store(context).append_note(body, datetime.now())
    await _reply(update, t(lang, "note_ok", path=html.escape("/" + rel)))


def _memory() -> str:
    try:
        info = {}
        with open("/proc/meminfo") as f:
            for line in f:
                key, value = line.split(":", 1)
                info[key] = int(value.split()[0]) * 1024
        total, available = info["MemTotal"], info.get("MemAvailable", info.get("MemFree", 0))
        return f"{human_size(total - available)} / {human_size(total)}"
    except Exception:
        return "?"


def _uptime(lang: str, seconds: float) -> str:
    seconds = int(seconds)
    days, rest = divmod(seconds, 86400)
    hours, rest = divmod(rest, 3600)
    minutes = rest // 60
    clock = f"{hours:02d}:{minutes:02d}"
    return (t(lang, "days", n=days) + " " + clock) if days else clock


async def status_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not _owner(update, context):
        return
    lang = _lang(update, context)
    count, size, disk = await asyncio.to_thread(_store(context).usage)
    try:
        load = " ".join(f"{x:.2f}" for x in os.getloadavg())
    except OSError:
        load = "?"
    started = context.application.bot_data.get("started", time.time())
    await _reply(update, t(
        lang, "status",
        used=human_size(disk.used), total=human_size(disk.total), free=human_size(disk.free),
        count=number(count), size=human_size(size), mem=_memory(), load=load,
        uptime=_uptime(lang, time.time() - started),
    ))


async def on_error(update: object, context: ContextTypes.DEFAULT_TYPE):
    log.error("update failed", exc_info=context.error)
