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
            "/status المساحة وحالة السيرفر\n"
            "/library ملفاتك في مكتبة الأدوات (تعدّلها أو تشيلها)"
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
        "btn_library": "📚 مكتبة الأدوات",
        "lib_btn_add": "📚 أضف للمكتبة",
        "lib_ask_name": "📚 وش اسم البرنامج؟ اكتبه في رسالة.\nالملف: <code>{file}</code>",
        "lib_ask_cat": "📂 اختار التصنيف لـ <b>{name}</b>:",
        "lib_btn_nocat": "بدون تصنيف",
        "lib_added": "✅ <b>{name}</b> صار في المكتبة.\nالناس ياخذونه من المكتبة، أو من هذا الرابط:\n<code>{link}</code>",
        "lib_btn_note": "📝 وصف",
        "lib_btn_version": "🏷 النسخة",
        "lib_btn_rename": "✏️ الاسم",
        "lib_ask_note": "📝 اكتب وصف قصير لـ <b>{name}</b>:",
        "lib_ask_version": "🏷 اكتب رقم النسخة لـ <b>{name}</b>:",
        "lib_ask_rename": "✏️ اكتب الاسم الجديد لـ <b>{name}</b>:",
        "lib_expired": "انتهت العملية. أرسل الملف من جديد.",
        "lib_list": "📚 <b>ملفاتك في المكتبة</b> ({n})\nاختار ملف تعدّله أو تشيله:",
        "lib_empty": "📚 المكتبة فاضية. أرسل لي ملف واضغط «أضف للمكتبة».",
        "lib_item": "📦 <b>{name}</b>{v}\n{cat}{size} · {date}{note}\n<code>{link}</code>",
        "lib_btn_remove": "🗑 شيله من المكتبة",
        "lib_confirm_remove": "متأكد تشيل <b>{name}</b> من المكتبة؟ الملف المحفوظ في السيرفر يبقى.",
        "lib_removed": "🗑 انشال <b>{name}</b> من المكتبة.",
        "lib_btn_back": "« المكتبة",
        "lib_missing": "❌ هذا الملف ما عاد موجود في المكتبة.",
        "lib_caption": "📦 <b>{name}</b>{v}\nمن مكتبة IFOKNR",
        "lib_not_saved": "\n\nالملف ما انحفظ في السيرفر، بس تقدر تضيفه للمكتبة: تيليجرام يحفظه.",
        "lib_cancelled": "تم الإلغاء.",
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
            "/status Disk space and server status\n"
            "/library Your files in the tools library (edit or remove them)"
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
        "btn_library": "📚 Tools library",
        "lib_btn_add": "📚 Add to the library",
        "lib_ask_name": "📚 What is it called? Send the name in a message.\nFile: <code>{file}</code>",
        "lib_ask_cat": "📂 Pick a category for <b>{name}</b>:",
        "lib_btn_nocat": "No category",
        "lib_added": "✅ <b>{name}</b> is in the library.\nPeople get it from the library, or with this link:\n<code>{link}</code>",
        "lib_btn_note": "📝 Description",
        "lib_btn_version": "🏷 Version",
        "lib_btn_rename": "✏️ Name",
        "lib_ask_note": "📝 Send a short description of <b>{name}</b>:",
        "lib_ask_version": "🏷 Send the version of <b>{name}</b>:",
        "lib_ask_rename": "✏️ Send the new name of <b>{name}</b>:",
        "lib_expired": "That has expired. Send the file again.",
        "lib_list": "📚 <b>Your files in the library</b> ({n})\nPick one to edit or remove:",
        "lib_empty": "📚 The library is empty. Send me a file and press “Add to the library”.",
        "lib_item": "📦 <b>{name}</b>{v}\n{cat}{size} · {date}{note}\n<code>{link}</code>",
        "lib_btn_remove": "🗑 Remove from the library",
        "lib_confirm_remove": "Remove <b>{name}</b> from the library? A copy saved on the server stays.",
        "lib_removed": "🗑 <b>{name}</b> was removed from the library.",
        "lib_btn_back": "« Library",
        "lib_missing": "❌ That file is no longer in the library.",
        "lib_caption": "📦 <b>{name}</b>{v}\nFrom the IFOKNR library",
        "lib_not_saved": "\n\nThe file was not saved on the server, but you can still add it to the library: Telegram keeps it.",
        "lib_cancelled": "Cancelled.",
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
