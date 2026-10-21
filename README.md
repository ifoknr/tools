# IFOKNR Tools

The website and Telegram bot for IFOKNR's Android tools: NextZygisk, NextWheel, NextSUSFS, NextCore, Fastboot Studio and Fastboot Studio Companion.

- Arabic and English, dark and light, works on phones.
- The latest version, release date, download link and download count of each tool come live from GitHub, so a new release shows up on the site by itself.
- Plain HTML, CSS and JavaScript: no build step, no database. It runs from any web server.

<div dir="rtl">

## التشغيل على سيرفرك

### من CasaOS
1. افتح CasaOS ← App Store ← **Custom Install** (علامة + فوق).
2. **Docker Image:** `ghcr.io/ifoknr/tools:latest`
3. **Port:** المنفذ في السيرفر `8090`، وداخل الحاوية `80`.
4. اضغط Install، وافتح `http://عنوان-السيرفر:8090`

### بالطرفية (Docker)
```bash
docker run -d --name ifoknr-tools -p 8090:80 --restart unless-stopped ghcr.io/ifoknr/tools:latest
```
أو بملف docker-compose.yml اللي في المستودع:
```bash
docker compose up -d
```

### التحديث
كل ما يتعدّل المستودع تنبني نسخة جديدة من الموقع لحالها. ركّب أمر التحديث مرة وحدة على السيرفر:
```bash
curl -fsSL https://raw.githubusercontent.com/ifoknr/tools/main/update-site.sh -o /usr/local/bin/update-site && chmod +x /usr/local/bin/update-site && update-site
```
وبعدها `update-site` يحدّث الموقع، ويربط معه ملفاتك اللي في مكتبة البوت (مجلد `public` حق البوت). أو بدونه:
```bash
docker pull ghcr.io/ifoknr/tools:latest && docker rm -f ifoknr-tools && docker run -d --name ifoknr-tools -p 8090:80 --restart unless-stopped ghcr.io/ifoknr/tools:latest
```
الإصدارات الجديدة للأدوات ما تحتاج تحديث: الموقع يجيبها من GitHub مباشرة.

### بدون Docker (مثل Droidspaces)
لو Docker ما يقدر يشغّل حاويات على سيرفرك، هذا الأمر يركّب الموقع على nginx مباشرة على المنفذ 8090، ويحدّثه لحاله كل ساعة:
```bash
curl -fsSL https://raw.githubusercontent.com/ifoknr/tools/main/install.sh | bash
```
ومعه نفق Cloudflare لدومينك:
```bash
curl -fsSL https://raw.githubusercontent.com/ifoknr/tools/main/install.sh | bash -s -- --tunnel التوكن
```

## مكتبة الأدوات (Telegram Mini App)
صفحة `ifoknr.com/app/` تنفتح داخل تيليجرام من زر البوت، وتنفع كصفحة عادية في المتصفح. بالعربي والإنقليزي، وفيها:
- **أدوات IFOKNR** بآخر إصداراتها.
- **ملفاتك:** أي ملف ترسله للبوت كملف، اضغط «📚 أضف للمكتبة» واكتب اسمه واختار التصنيف. البوت يرسله لأي أحد يطلبه من المكتبة. `/library` تعدّل الاسم والوصف والنسخة أو تشيله.
- **أكثر من 700 برنامج وموديول للروت** من قائمة [Awesome Android Root](https://github.com/awesome-android-root/awesome-android-root) (رخصة MIT)، بتصنيفات وبحث يفهم العربي، وآخر نسخة من GitHub. القائمة تتحدّث كل يوم لحالها ([`library.yml`](.github/workflows/library.yml)).

يحتاج `SITE_URL=https://ifoknr.com` في إعدادات البوت (تيليجرام يفتح صفحات https بس)، وتحديث الموقع بأمر `update-site` اللي فوق عشان يشوف ملفاتك.

## إضافة أداة أو تعديلها
كل الأدوات في ملف واحد: [`site/assets/tools.json`](site/assets/tools.json). أضف عنصر جديد بنفس الشكل: الاسم، المستودع، اللون، والنص بالعربي والإنجليزي. الموقع والبوت الاثنين يقرون منه.

## بوت التيليجرام

**للناس:** يعرض الأدوات بأزرار، وكل أداة ببطاقة فيها آخر إصدار وتاريخه وعدد التحميلات وزر تحميل مباشر. الأوامر: `/tools` و`/latest` و`/lang` (عربي/English) و`/id`.

**لك أنت بس (المالك):**
- أرسل أي ملف أو صورة أو فيديو أو صوت، وينحفظ على السيرفر.
- `/files` تتصفح الملفات بأزرار: تفتح المجلدات، يرسل لك أي ملف، تحذف (بعد تأكيد)، وتختار مجلد الرفع.
- `/mkdir اسم` مجلد جديد ويصير الرفع فيه، `/here` وين ينحفظ الرفع الحين.
- `/note نص` يضيف ملاحظة في `notes.md`.
- `/status` المساحة والرام والحمل.
- `/library` ملفاتك في مكتبة الأدوات.
- أي أحد غيرك يرسل ملف، البوت ما يحفظه ولا يقدر يتصفح شي.

### التجهيز
1. في تيليجرام افتح [@BotFather](https://t.me/BotFather) واكتب `/newbot`، واختار اسم ويوزر للبوت. يعطيك **توكن** شكله `123456:ABC...`. لا تعطيه لأحد.
2. شغّل البوت (الخطوة الجاية) مرة بدون `OWNER_IDS`، وأرسل له `/id`، يرد عليك برقمك.
3. حط رقمك في `OWNER_IDS` وأعد تشغيله.

### بدون Docker (مثل Droidspaces) — الأسهل
```bash
curl -fsSL https://raw.githubusercontent.com/ifoknr/tools/main/install-bot.sh | bash
```
يسألك عن التوكن (ما يطلع على الشاشة) ورقمك في تيليجرام، ويركّب البوت كخدمة تشتغل لحالها مع الجهاز. لو ما تعرف رقمك خلّه فاضي، وأرسل للبوت `/id`، وبعدها شغّل نفس الأمر مرة ثانية وحط الرقم. نفس الأمر يحدّث البوت بعدين بدون ما يضيع إعداداتك.
- الإعدادات في `/etc/ifoknr-bot.env`، والملفات في `/DATA/Telegram` (لو عندك CasaOS) أو `/var/lib/ifoknr-bot/files`.
- حالة البوت: `systemctl status ifoknr-bot`، وسجله: `journalctl -u ifoknr-bot -n 50`.

### من CasaOS (Docker)
App Store ← **Custom Install**:
- **Docker Image:** `ghcr.io/ifoknr/tools-bot:latest`
- **Environment variables:**
  - `BOT_TOKEN` = التوكن من BotFather
  - `OWNER_IDS` = رقمك (لأكثر من شخص: افصل بفاصلة)
  - `SITE_URL` = رابط موقعك (اختياري، يطلع زر في البوت)
- **Volumes:**
  - `/DATA/AppData/ifoknr-bot` ← `/data`
  - `/DATA/Telegram` ← `/data/files` (هنا تنحفظ ملفاتك، وتشوفها من Files في CasaOS)
- ما يحتاج منافذ.

### بالطرفية
```bash
docker run -d --name ifoknr-tools-bot --restart unless-stopped \
  -e BOT_TOKEN="التوكن" -e OWNER_IDS="رقمك" \
  -v /DATA/AppData/ifoknr-bot:/data -v /DATA/Telegram:/data/files \
  ghcr.io/ifoknr/tools-bot:latest
```

### حد حجم الملفات
تيليجرام يسمح للبوتات تنزّل ملفات لين **20 ميجا** وترسل لين **50 ميجا**. للملفات الكبيرة (لين 2 جيجا) شغّل خادم Bot API المحلي: خذ `api_id` و`api_hash` من [my.telegram.org](https://my.telegram.org)، عبّها في خدمة `bot-api` في `docker-compose.yml`، وفعّل `BOT_API_URL` في البوت، وشغّل `docker compose --profile bigfiles up -d`.

</div>

## Run it

- **CasaOS:** App Store → Custom Install → image `ghcr.io/ifoknr/tools:latest`, host port `8090` → container port `80`.
- **Docker:** `docker run -d --name ifoknr-tools -p 8090:80 --restart unless-stopped ghcr.io/ifoknr/tools:latest`
- **Without Docker** (Debian/Ubuntu, e.g. Droidspaces): `curl -fsSL https://raw.githubusercontent.com/ifoknr/tools/main/install.sh | bash` sets up nginx on port 8090 with hourly updates; add `-s -- --tunnel TOKEN` to connect a Cloudflare Tunnel.
- **Anything else:** serve the `site` folder with any web server.

To add or change a tool, edit [`site/assets/tools.json`](site/assets/tools.json); the site and the bot both read it.

Updating: `update-site.sh` (install it as `/usr/local/bin/update-site`) pulls the newest image and mounts the bot's `public/` folder at `/app/live/`.

## Tools library (Telegram Mini App)

`/app/` opens inside Telegram from the bot's menu button, and works as a plain page too. Arabic and English.
- IFOKNR's tools with their latest releases.
- The owner's files: send the bot a file, press "Add to the library", name it and pick a category; the bot sends it to whoever asks (`t.me/<bot>?start=get_<id>`). `/library` edits or removes them. Only names reach the site (`public/private.json`); the file ids stay in the bot's `library.json`.
- 700+ root apps and modules from [Awesome Android Root](https://github.com/awesome-android-root/awesome-android-root) (MIT), rebuilt every day by `.github/workflows/library.yml` with `scripts/library.py`, with stars and latest releases from GitHub.
- The bot needs `SITE_URL` to be https for the Mini App button.

## Telegram bot

- Everyone: `/tools`, `/latest`, `/lang`, `/id`; one card per tool with the live version and a download button.
- The owner (`OWNER_IDS`): send any file to store it on the server; `/files` to browse, download, delete and pick the upload folder; `/mkdir`, `/here`, `/note`, `/status`.
- Without Docker: `curl -fsSL https://raw.githubusercontent.com/ifoknr/tools/main/install-bot.sh | bash` (asks for the token and your id; runs as the `ifoknr-bot` systemd service; run again to update).
- Image `ghcr.io/ifoknr/tools-bot:latest`. Environment: `BOT_TOKEN` (from @BotFather), `OWNER_IDS`, optional `SITE_URL`, `CHANNEL_URL`, `GITHUB_TOKEN`, `BOT_API_URL`. Volumes: `/data` (settings, `library.json`, `public/`) and `/data/files` (stored files).
- Telegram limits bots to 20 MB downloads and 50 MB uploads; the optional `bot-api` service in `docker-compose.yml` raises both to 2 GB.
- Tests: `cd bot && pip install -r requirements-dev.txt && cp ../site/assets/tools.json ifoknr_bot/ && pytest`

## License

MIT for the site and the bot. Roboto and Noto Kufi Arabic are under the SIL Open Font License (see `site/assets/fonts`).
