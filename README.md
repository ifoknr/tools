# IFOKNR Tools

The website for IFOKNR's Android tools: NextZygisk, NextWheel, NextSUSFS, NextCore, Fastboot Studio and Fastboot Studio Companion.

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
كل ما يتعدّل المستودع تنبني نسخة جديدة من الموقع لحالها. على السيرفر:
```bash
docker pull ghcr.io/ifoknr/tools:latest && docker rm -f ifoknr-tools && docker run -d --name ifoknr-tools -p 8090:80 --restart unless-stopped ghcr.io/ifoknr/tools:latest
```
الإصدارات الجديدة للأدوات ما تحتاج تحديث: الموقع يجيبها من GitHub مباشرة.

### بدون Docker
انسخ مجلد `site` لأي سيرفر ويب (nginx، Apache، Caddy) وخلاص.

## إضافة أداة أو تعديلها
كل الأدوات في ملف واحد: [`site/assets/tools.js`](site/assets/tools.js). أضف عنصر جديد بنفس الشكل: الاسم، المستودع، اللون، والنص بالعربي والإنجليزي.

</div>

## Run it

- **CasaOS:** App Store → Custom Install → image `ghcr.io/ifoknr/tools:latest`, host port `8090` → container port `80`.
- **Docker:** `docker run -d --name ifoknr-tools -p 8090:80 --restart unless-stopped ghcr.io/ifoknr/tools:latest`
- **Anything else:** serve the `site` folder with any web server.

To add or change a tool, edit [`site/assets/tools.js`](site/assets/tools.js).

## License

MIT for the site. Roboto and Noto Kufi Arabic are under the SIL Open Font License (see `site/assets/fonts`).
