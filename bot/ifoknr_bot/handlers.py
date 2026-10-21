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
from telegram import Update, WebAppInfo
from telegram.constants import ChatType, ParseMode
from telegram.error import BadRequest
from telegram.ext import ContextTypes

from .library import CATEGORIES, Library, category_name, clean_name
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


def _library(context) -> Library:
    lib = context.application.bot_data["library"]
    if not lib.bot:
        lib.bot = context.bot.username or ""
    return lib


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


def _library_button(context, lang: str, private: bool = True):
    """Opens the tools library: inside Telegram in a private chat, in the browser elsewhere
    (a group cannot show a Mini App button)."""
    url = _cfg(context).app_url
    if not url:
        return None
    if private:
        return Button(t(lang, "btn_library"), web_app=WebAppInfo(url=url))
    return Button(t(lang, "btn_library"), url=url)


def _tools_keyboard(context, lang: str, private: bool = True) -> Keyboard:
    catalog = _catalog(context)
    buttons = [Button(_tool_name(tool), callback_data="t:" + tool["id"]) for tool in catalog.tools]
    rows = [buttons[i:i + 2] for i in range(0, len(buttons), 2)]
    library = _library_button(context, lang, private)
    if library:
        rows.insert(0, [library])
    links = []
    cfg = _cfg(context)
    if cfg.site_url:
        links.append(Button(t(lang, "btn_site"), url=cfg.site_url))
    if cfg.channel_url:
        links.append(Button(t(lang, "btn_channel"), url=cfg.channel_url))
    if links:
        rows.append(links)
    return Keyboard(rows)


def _beta(tool: dict, release) -> bool:
    """A tool that has only pre-releases so far; without GitHub, what tools.json says."""
    return release.pre if release else bool(tool.get("beta"))


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
        if _beta(tool, release):
            meta.append(t(lang, "beta"))
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
        if tool.get("xda"):
            rows.append([Button("💬 XDA", url=tool["xda"])])
    rows.append([Button(t(lang, "btn_back"), callback_data="tl")])
    return "\n".join(lines), Keyboard(rows)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    lang = _lang(update, context)
    if context.args and context.args[0].startswith("get_"):
        await send_library_file(update, context, context.args[0][4:])
        return
    name = html.escape(update.effective_user.first_name or "") if update.effective_user else ""
    text = t(lang, "start", name=name)
    if _owner(update, context) and _private(update):
        text += t(lang, "start_owner")
    await _reply(update, text, _tools_keyboard(context, lang, _private(update)))


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    lang = _lang(update, context)
    text = t(lang, "help")
    if _owner(update, context) and _private(update):
        text += t(lang, "help_owner")
    await _reply(update, text)


async def tools_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    lang = _lang(update, context)
    await _catalog(context).refresh_tools()
    await _edit_or_reply(update, t(lang, "tools"), _tools_keyboard(context, lang, _private(update)))


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
        beta = f" · {t(lang, 'beta')}" if _beta(tool, rel) else ""
        lines.append(f"• <b>{name}</b>: <code>{version}</code>{beta}" + (f" · {when}" if when else ""))
    await _reply(update, "\n".join(lines), _tools_keyboard(context, lang, _private(update)))


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
    """Text that is not a command, in a private chat: an answer to a library question, or the tools."""
    lang = _lang(update, context)
    if _owner(update, context) and context.user_data.get("lib_wait"):
        await library_answer(update, context)
        return
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
    # A file sent as a file (not a photo or a video) can go into the tools library.
    pending = {"file_id": media.file_id, "file_name": name, "size": size, "path": ""}
    add = None
    if update.effective_message.document:
        context.user_data["lib_pending"] = pending
        context.user_data.pop("lib_wait", None)
        add = Keyboard([[Button(t(lang, "lib_btn_add"), callback_data="la")]])
    if size > cfg.download_limit:
        text = t(lang, "too_big", size=human_size(size), limit=human_size(cfg.download_limit))
        await _reply(update, text + (t(lang, "lib_not_saved") if add else ""), add)
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
        pending["path"] = str(target)
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
    await status.edit_text(text, parse_mode=ParseMode.HTML, reply_markup=add)


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


# ---------- tools library (the owner's files, sent by the bot) ----------

def _get_link(context, entry_id: str) -> str:
    return f"https://t.me/{context.bot.username}?start=get_{entry_id}"


def _sha256(path: str) -> str:
    import hashlib
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def _category_keyboard(lang: str) -> Keyboard:
    buttons = [Button(category_name(cid, lang), callback_data=f"lc:{cid}") for cid, *_ in CATEGORIES]
    rows = [buttons[i:i + 2] for i in range(0, len(buttons), 2)]
    rows.append([Button(t(lang, "lib_btn_nocat"), callback_data="lc:"), Button(t(lang, "btn_cancel"), callback_data="lx")])
    return Keyboard(rows)


def _entry_view(context, lang: str, entry):
    v = f" <code>{html.escape(entry.v)}</code>" if entry.v else ""
    cat = category_name(entry.c, lang)
    note = "\n" + html.escape(entry.note) if entry.note else ""
    text = t(lang, "lib_item", name=html.escape(entry.name), v=v, cat=(html.escape(cat) + " · ") if cat else "",
             size=human_size(entry.size) if entry.size else "-", date=date_text(lang, entry.t) or entry.t, note=note,
             link=html.escape(_get_link(context, entry.id)))
    keyboard = Keyboard([
        [Button(t(lang, "lib_btn_rename"), callback_data=f"lm:{entry.id}"), Button(t(lang, "lib_btn_note"), callback_data=f"ln:{entry.id}"),
         Button(t(lang, "lib_btn_version"), callback_data=f"lv:{entry.id}")],
        [Button(t(lang, "lib_btn_remove"), callback_data=f"lr:{entry.id}")],
        [Button(t(lang, "lib_btn_back"), callback_data="ll")],
    ])
    return text, keyboard


def _library_list(context, lang: str):
    entries = _library(context).entries
    if not entries:
        return t(lang, "lib_empty"), None
    rows = [[Button(("📦 " + e.name)[:60], callback_data=f"lo:{e.id}")] for e in entries[:90]]
    return t(lang, "lib_list", n=len(entries)), Keyboard(rows)


async def library_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    lang = _lang(update, context)
    if not _owner(update, context):
        await _reply(update, t(lang, "tools"), _tools_keyboard(context, lang, _private(update)))
        return
    text, keyboard = _library_list(context, lang)
    await _reply(update, text, keyboard)


async def library_button(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    lang = _lang(update, context)
    if not _owner(update, context):
        await query.answer()
        return
    await query.answer()
    data = query.data
    lib = _library(context)
    if data == "la":
        pending = context.user_data.get("lib_pending")
        if not pending:
            await _edit_or_reply(update, t(lang, "lib_expired"))
            return
        context.user_data["lib_wait"] = {"what": "name"}
        await _edit_or_reply(update, t(lang, "lib_ask_name", file=html.escape(pending["file_name"])),
                             Keyboard([[Button(t(lang, "btn_cancel"), callback_data="lx")]]))
    elif data.startswith("lc:"):
        pending = context.user_data.get("lib_pending")
        if not pending or not pending.get("name"):
            await _edit_or_reply(update, t(lang, "lib_expired"))
            return
        sha = ""
        if pending.get("path") and os.path.isfile(pending["path"]):
            try:
                sha = await asyncio.to_thread(_sha256, pending["path"])
            except OSError:
                log.warning("could not hash %s", pending["path"])
        entry = lib.add(pending["name"], pending["file_id"], pending["file_name"], pending["size"], data[3:], sha)
        context.user_data.pop("lib_pending", None)
        context.user_data.pop("lib_wait", None)
        rows = [[Button(t(lang, "lib_btn_note"), callback_data=f"ln:{entry.id}"), Button(t(lang, "lib_btn_version"), callback_data=f"lv:{entry.id}")]]
        library = _library_button(context, lang)
        if library:
            rows.append([library])
        await _edit_or_reply(update, t(lang, "lib_added", name=html.escape(entry.name), link=html.escape(_get_link(context, entry.id))), Keyboard(rows))
    elif data == "lx":
        context.user_data.pop("lib_wait", None)
        await _edit_or_reply(update, t(lang, "lib_cancelled"))
    elif data == "ll":
        text, keyboard = _library_list(context, lang)
        await _edit_or_reply(update, text, keyboard)
    else:
        kind, _, entry_id = data.partition(":")
        entry = lib.get(entry_id)
        if entry is None:
            await _edit_or_reply(update, t(lang, "lib_missing"))
            return
        if kind == "lo":
            await _edit_or_reply(update, *_entry_view(context, lang, entry))
        elif kind in ("ln", "lv", "lm"):
            what = {"ln": "note", "lv": "v", "lm": "name"}[kind]
            context.user_data["lib_wait"] = {"what": what, "id": entry.id}
            key = {"note": "lib_ask_note", "v": "lib_ask_version", "name": "lib_ask_rename"}[what]
            await _edit_or_reply(update, t(lang, key, name=html.escape(entry.name)),
                                 Keyboard([[Button(t(lang, "btn_cancel"), callback_data="lx")]]))
        elif kind == "lr":
            await _edit_or_reply(update, t(lang, "lib_confirm_remove", name=html.escape(entry.name)),
                                 Keyboard([[Button(t(lang, "btn_yes_delete"), callback_data=f"ly:{entry.id}"),
                                            Button(t(lang, "btn_cancel"), callback_data=f"lo:{entry.id}")]]))
        elif kind == "ly":
            lib.remove(entry.id)
            text, keyboard = _library_list(context, lang)
            await _edit_or_reply(update, t(lang, "lib_removed", name=html.escape(entry.name)) + "\n\n" + text, keyboard)


async def library_answer(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """The owner's reply to "what is it called?", or a new description, version or name."""
    lang = _lang(update, context)
    wait = context.user_data.get("lib_wait") or {}
    text = update.effective_message.text or ""
    if wait.get("what") == "name" and "id" not in wait:
        pending = context.user_data.get("lib_pending")
        name = clean_name(text)
        if not pending or not name:
            context.user_data.pop("lib_wait", None)
            await _reply(update, t(lang, "lib_expired"))
            return
        pending["name"] = name
        context.user_data["lib_wait"] = {"what": "category"}
        await _reply(update, t(lang, "lib_ask_cat", name=html.escape(name)), _category_keyboard(lang))
        return
    if wait.get("id"):
        context.user_data.pop("lib_wait", None)
        try:
            entry = _library(context).update(wait["id"], **{wait["what"]: text})
        except KeyError:
            await _reply(update, t(lang, "lib_missing"))
            return
        await _reply(update, *_entry_view(context, lang, entry))
        return
    context.user_data.pop("lib_wait", None)
    await _reply(update, t(lang, "help") + t(lang, "help_owner"))


async def send_library_file(update: Update, context: ContextTypes.DEFAULT_TYPE, entry_id: str):
    """t.me/<bot>?start=get_<id>, from the Mini App or a shared link: anyone gets the file."""
    lang = _lang(update, context)
    entry = _library(context).get(entry_id)
    if entry is None:
        await _reply(update, t(lang, "lib_missing"), _tools_keyboard(context, lang, _private(update)))
        return
    v = f" <code>{html.escape(entry.v)}</code>" if entry.v else ""
    caption = t(lang, "lib_caption", name=html.escape(entry.name), v=v)
    if entry.sha256:
        caption += f"\nSHA-256: <code>{entry.sha256}</code>"
    await context.bot.send_document(update.effective_chat.id, document=entry.file_id, caption=caption, parse_mode=ParseMode.HTML)


async def on_error(update: object, context: ContextTypes.DEFAULT_TYPE):
    log.error("update failed", exc_info=context.error)
