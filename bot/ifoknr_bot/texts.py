"""Everything the bot says, in Arabic and English. Messages use Telegram HTML."""

from datetime import datetime

T = {
    "ar": {
        "start": "أهلاً {name} 👋\nهذا بوت <b>أدوات IFOKNR</b>: موديولات روت لإخفاء الروت والأداء، وتطبيق Fastboot Studio للويندوز.\n\nاختار أداة تشوف تفاصيلها وآخر إصدار:",
        "start_owner": "\n\n🔐 <b>أنت المالك.</b> أرسل لي أي ملف وأحفظه في السيرفر.\n/files ملفاتك · /status حالة السيرفر · /help كل الأوامر",
        "help": (
            "<b>الأوامر</b>\n"
            "/tools الأدوات\n"
            "/latest آخر الإصدارات\n"
            "/lang English\n"
            "/id رقمك في تيليجرام"
        ),
        "help_owner": (
            "\n\n<b>للمالك</b>\n"
            "أرسل أي ملف أو صورة أو فيديو ← ينحفظ في مجلد الرفع\n"
            "/files تصفّح الملفات (تنزيل، حذف، اختيار مجلد الرفع)\n"
            "/mkdir اسم ← مجلد جديد ويصير الرفع فيه\n"
            "/here مجلد الرفع الحالي\n"
            "/note نص ← يضيف ملاحظة في notes.md\n"
            "/status المساحة وحالة السيرفر"
        ),
        "tools": "اختار أداة:",
        "latest": "<b>آخر الإصدارات</b>",
        "version": "الإصدار",
        "downloads": "{n} تحميل",
        "needs": "يحتاج",
        "based_on": "مبني على {name} من {by}.",
        "uses": "يستخدم {name} من {by}.",
        "license": "الترخيص: {l}",
        "soon": "🚧 قريباً، تحت التطوير.",
        "beta": "تجريبي",
        "btn_download": "⬇️ تحميل {v}",
        "btn_download_plain": "⬇️ التحميل",
        "btn_source": "📦 المصدر",
        "btn_changes": "📝 التغييرات",
        "btn_back": "« كل الأدوات",
        "btn_site": "🌐 الموقع",
        "btn_channel": "📣 القناة",
        "lang_set": "صارت اللغة العربية.",
        "id": "رقمك في تيليجرام: <code>{id}</code>",
        "not_owner_file": "هذا البوت يعرض أدوات IFOKNR. اكتب /tools تشوفها.",
        "saved": "✅ انحفظ: <code>{path}</code> ({size})",
        "saving": "⏳ أحفظ الملف…",
        "too_big": "❌ الملف {size}، وتيليجرام يسمح للبوت ينزّل لين {limit} بس.\nارفعه من FileBrowser، أو شغّل خادم Bot API المحلي (يرفع الحد لـ 2 جيجا).",
        "save_failed": "❌ ما قدرت أحفظ الملف: {error}",
        "folder": "📂 <code>/{path}</code>\n{dirs} مجلد · {files} ملف · {size}",
        "folder_empty": "📂 <code>/{path}</code>\nالمجلد فاضي.",
        "upload_here_now": "📥 الرفع الحين في: <code>/{path}</code>",
        "btn_up": "⬆️ للأعلى",
        "btn_upload_here": "📥 ارفع هنا",
        "btn_prev": "‹ السابق",
        "btn_next": "التالي ›",
        "btn_send": "⬇️ أرسله لي",
        "btn_delete": "🗑 حذف",
        "btn_yes_delete": "نعم، احذف",
        "btn_cancel": "إلغاء",
        "btn_back_folder": "« المجلد",
        "file_info": "📄 <code>/{path}</code>\n{size} · {date}",
        "confirm_delete": "متأكد تحذف <code>/{path}</code>؟ ما يرجع.",
        "deleted": "🗑 انحذف <code>/{path}</code>",
        "send_too_big": "❌ الملف أكبر من {limit}، وتيليجرام ما يسمح للبوت يرسله. نزّله من FileBrowser.",
        "mkdir_usage": "اكتب: <code>/mkdir اسم المجلد</code>",
        "mkdir_ok": "📁 سويت <code>/{path}</code> وصار الرفع فيه.",
        "note_usage": "اكتب: <code>/note النص</code>",
        "note_ok": "📝 انحفظت في <code>{path}</code>",
        "status": (
            "<b>حالة السيرفر</b>\n"
            "💾 المساحة: {used} من {total} (الفاضي {free})\n"
            "📁 الملفات المحفوظة: {count} · {size}\n"
            "🧠 الرام: {mem}\n"
            "⚙️ الحمل: {load}\n"
            "⏱ البوت شغّال من: {uptime}"
        ),
        "err_bad_name": "❌ الاسم فيه حروف ممنوعة.",
        "err_exists": "❌ فيه ملف أو مجلد بنفس الاسم.",
        "err_not_found": "❌ ما لقيته، يمكن انحذف أو انتقل.",
        "err_outside": "❌ هذا المسار برا مجلد الملفات.",
        "err_expired": "القائمة قديمة، افتح /files من جديد.",
        "months": ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
        "days": "{n} يوم",
    },
    "en": {
        "start": "Hi {name} 👋\nThis is the <b>IFOKNR tools</b> bot: root modules for hiding and performance, and Fastboot Studio for Windows.\n\nPick a tool to see its details and latest release:",
        "start_owner": "\n\n🔐 <b>You are the owner.</b> Send me any file and I'll store it on the server.\n/files your files · /status server status · /help all commands",
        "help": (
            "<b>Commands</b>\n"
            "/tools The tools\n"
            "/latest Latest releases\n"
            "/lang العربية\n"
            "/id Your Telegram id"
        ),
        "help_owner": (
            "\n\n<b>Owner</b>\n"
            "Send any file, photo or video → stored in the upload folder\n"
            "/files Browse files (download, delete, pick the upload folder)\n"
            "/mkdir name → new folder, used for uploads\n"
            "/here Current upload folder\n"
            "/note text → adds a note to notes.md\n"
            "/status Disk space and server status"
        ),
        "tools": "Pick a tool:",
        "latest": "<b>Latest releases</b>",
        "version": "Version",
        "downloads": "{n} downloads",
        "needs": "Needs",
        "based_on": "Based on {name} by {by}.",
        "uses": "Uses {name} by {by}.",
        "license": "License: {l}",
        "soon": "🚧 Coming soon, in development.",
        "beta": "Beta",
        "btn_download": "⬇️ Download {v}",
        "btn_download_plain": "⬇️ Download",
        "btn_source": "📦 Source",
        "btn_changes": "📝 Changelog",
        "btn_back": "« All tools",
        "btn_site": "🌐 Website",
        "btn_channel": "📣 Channel",
        "lang_set": "Language set to English.",
        "id": "Your Telegram id: <code>{id}</code>",
        "not_owner_file": "This bot shows IFOKNR's tools. Type /tools to see them.",
        "saved": "✅ Saved: <code>{path}</code> ({size})",
        "saving": "⏳ Saving the file…",
        "too_big": "❌ The file is {size}, and Telegram lets bots download up to {limit} only.\nUpload it from FileBrowser, or run the local Bot API server (raises the limit to 2 GB).",
        "save_failed": "❌ Could not save the file: {error}",
        "folder": "📂 <code>/{path}</code>\n{dirs} folders · {files} files · {size}",
        "folder_empty": "📂 <code>/{path}</code>\nThis folder is empty.",
        "upload_here_now": "📥 Uploads now go to: <code>/{path}</code>",
        "btn_up": "⬆️ Up",
        "btn_upload_here": "📥 Upload here",
        "btn_prev": "‹ Prev",
        "btn_next": "Next ›",
        "btn_send": "⬇️ Send it to me",
        "btn_delete": "🗑 Delete",
        "btn_yes_delete": "Yes, delete",
        "btn_cancel": "Cancel",
        "btn_back_folder": "« Folder",
        "file_info": "📄 <code>/{path}</code>\n{size} · {date}",
        "confirm_delete": "Delete <code>/{path}</code>? This cannot be undone.",
        "deleted": "🗑 Deleted <code>/{path}</code>",
        "send_too_big": "❌ The file is larger than {limit}, which Telegram does not let bots send. Download it from FileBrowser.",
        "mkdir_usage": "Type: <code>/mkdir folder name</code>",
        "mkdir_ok": "📁 Created <code>/{path}</code>; uploads now go there.",
        "note_usage": "Type: <code>/note your text</code>",
        "note_ok": "📝 Saved to <code>{path}</code>",
        "status": (
            "<b>Server status</b>\n"
            "💾 Disk: {used} of {total} ({free} free)\n"
            "📁 Stored files: {count} · {size}\n"
            "🧠 RAM: {mem}\n"
            "⚙️ Load: {load}\n"
            "⏱ Bot up for: {uptime}"
        ),
        "err_bad_name": "❌ The name has characters that are not allowed.",
        "err_exists": "❌ A file or folder with that name already exists.",
        "err_not_found": "❌ Not found; it may have been moved or deleted.",
        "err_outside": "❌ That path is outside the files folder.",
        "err_expired": "This list is old; open /files again.",
        "months": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        "days": "{n} days",
    },
}


def lang_of(user, user_data=None) -> str:
    """The language a user chose with /lang, else Arabic for Arabic Telegram apps, else English."""
    chosen = (user_data or {}).get("lang")
    if chosen in T:
        return chosen
    code = (getattr(user, "language_code", None) or "").lower()
    return "ar" if code.startswith("ar") else "en"


def t(lang: str, key: str, **values) -> str:
    text = T[lang][key]
    return text.format(**values) if values else text


def date_text(lang: str, iso: str) -> str:
    try:
        d = datetime.fromisoformat(iso.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        return ""
    return f"{d.day} {T[lang]['months'][d.month - 1]} {d.year}"


def number(n: int) -> str:
    return f"{n:,}"
