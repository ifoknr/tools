"""Starts the bot: python -m ifoknr_bot"""

import asyncio
import logging
import time

from telegram import BotCommand, BotCommandScopeChat, BotCommandScopeDefault, MenuButtonWebApp, WebAppInfo
from telegram.error import TelegramError
from telegram.ext import (
    Application,
    ApplicationBuilder,
    CallbackQueryHandler,
    CommandHandler,
    MessageHandler,
    PersistenceInput,
    PicklePersistence,
    filters,
)

from . import config, handlers
from .catalog import Catalog
from .library import Library
from .storage import Store

log = logging.getLogger("ifoknr_bot")

PUBLIC_COMMANDS = {
    "ar": [("tools", "الأدوات"), ("latest", "آخر الإصدارات"), ("lang", "English"), ("help", "المساعدة")],
    "en": [("tools", "The tools"), ("latest", "Latest releases"), ("lang", "العربية"), ("help", "Help")],
}
OWNER_COMMANDS = {
    "ar": [("files", "ملفاتي"), ("library", "مكتبة الأدوات"), ("status", "حالة السيرفر"), ("mkdir", "مجلد جديد"), ("here", "مجلد الرفع"), ("note", "ملاحظة")],
    "en": [("files", "My files"), ("library", "Tools library"), ("status", "Server status"), ("mkdir", "New folder"), ("here", "Upload folder"), ("note", "Add a note")],
}

MEDIA = (
    filters.Document.ALL | filters.PHOTO | filters.VIDEO | filters.AUDIO
    | filters.VOICE | filters.VIDEO_NOTE | filters.ANIMATION
)


def register(app: Application) -> None:
    private = filters.ChatType.PRIVATE
    app.add_handler(CommandHandler("start", handlers.start))
    app.add_handler(CommandHandler("help", handlers.help_command))
    app.add_handler(CommandHandler("tools", handlers.tools_command))
    app.add_handler(CommandHandler("latest", handlers.latest))
    app.add_handler(CommandHandler("lang", handlers.lang_command))
    app.add_handler(CommandHandler("id", handlers.my_id))
    app.add_handler(CommandHandler("files", handlers.files_command, filters=private))
    app.add_handler(CommandHandler("mkdir", handlers.mkdir_command, filters=private))
    app.add_handler(CommandHandler("here", handlers.here_command, filters=private))
    app.add_handler(CommandHandler("note", handlers.note_command, filters=private))
    app.add_handler(CommandHandler("status", handlers.status_command, filters=private))
    app.add_handler(CommandHandler("library", handlers.library_command, filters=private))
    app.add_handler(CallbackQueryHandler(handlers.show_tool, pattern=r"^t:"))
    app.add_handler(CallbackQueryHandler(handlers.tools_back, pattern=r"^tl$"))
    app.add_handler(CallbackQueryHandler(handlers.files_button, pattern=r"^f"))
    app.add_handler(CallbackQueryHandler(handlers.library_button, pattern=r"^l[a-z]"))
    app.add_handler(MessageHandler(private & MEDIA, handlers.receive_file))
    app.add_handler(MessageHandler(private & filters.TEXT & ~filters.COMMAND, handlers.other_message))
    app.add_error_handler(handlers.on_error)


async def _post_init(app: Application) -> None:
    cfg = app.bot_data["config"]
    app.bot_data["started"] = time.time()
    try:
        for lang, commands in PUBLIC_COMMANDS.items():
            await app.bot.set_my_commands([BotCommand(*c) for c in commands], scope=BotCommandScopeDefault(),
                                          language_code=None if lang == "en" else lang)
        for owner in cfg.owners:
            # The owner's menu also lists the file commands. Fails until the owner has opened the bot once.
            try:
                await app.bot.set_my_commands([BotCommand(*c) for c in OWNER_COMMANDS["ar"] + PUBLIC_COMMANDS["ar"]],
                                              scope=BotCommandScopeChat(owner))
            except TelegramError as e:
                log.info("owner menu for %s not set yet: %s", owner, e)
    except TelegramError as e:
        log.warning("could not set the command menu: %s", e)
    library = app.bot_data["library"]
    library.bot = app.bot.username or ""
    library.save()
    # The button next to the message box opens the tools library.
    if cfg.app_url:
        try:
            await app.bot.set_chat_menu_button(menu_button=MenuButtonWebApp("📚 الأدوات", WebAppInfo(url=cfg.app_url)))
        except TelegramError as e:
            log.warning("could not set the library menu button: %s", e)
    # Warm the release cache so the first /tools is quick.
    app.bot_data["warmup"] = asyncio.create_task(app.bot_data["catalog"].refresh())


async def _post_shutdown(app: Application) -> None:
    await app.bot_data["catalog"].close()


def build(cfg: config.Config) -> Application:
    builder = (
        ApplicationBuilder()
        .token(cfg.token)
        # Only per-user settings (language, upload folder) are kept across restarts; bot_data holds
        # live objects (config, store, catalog) and must not be replaced by a saved copy.
        .persistence(PicklePersistence(filepath=cfg.state_file,
                                       store_data=PersistenceInput(bot_data=False, chat_data=False, callback_data=False)))
        .post_init(_post_init)
        .post_shutdown(_post_shutdown)
        .concurrent_updates(True)
    )
    if cfg.local_api:
        builder = builder.base_url(f"{cfg.bot_api_url}/bot").base_file_url(f"{cfg.bot_api_url}/file/bot").local_mode(True)
    app = builder.build()
    app.bot_data["config"] = cfg
    app.bot_data["store"] = Store(cfg.files_dir)
    library = Library(cfg.library_file, cfg.public_dir)
    library.save()  # the site shows public/private.json; write it even while the library is empty
    app.bot_data["library"] = library
    app.bot_data["catalog"] = Catalog(cfg.tools_file, cfg.tools_url, cfg.github_token)
    register(app)
    return app


def run() -> None:
    logging.basicConfig(format="%(asctime)s %(levelname)s %(name)s: %(message)s", level=logging.INFO)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    cfg = config.load()
    cfg.state_file.parent.mkdir(parents=True, exist_ok=True)
    if not cfg.owners:
        log.warning("OWNER_IDS is empty: the bot shows the tools but stores no files. Send /id to the bot to get your id.")
    log.info("files are stored in %s", cfg.files_dir)
    build(cfg).run_polling(allowed_updates=["message", "callback_query"])


if __name__ == "__main__":
    run()
