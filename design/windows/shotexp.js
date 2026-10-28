const { chromium } = require('playwright');
const path = require('path');
const schemes = require('./schemes.json');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1300, height: 860 }, deviceScaleFactor: 1.5 });
  const s = Buffer.from(JSON.stringify(schemes['xgram-dark'])).toString('base64');
  const pages = ['device', 'phone', 'flash', 'payload', 'layers', 'bricks', 'samsung', 'backup', 'root', 'terminal', 'logs', 'settings', 'about'];
  const jobs = pages.map((pg, i) => [String(i + 1).padStart(2, '0') + '-' + pg, pg, 'en', 1]);
  jobs.push(['14-about-ar', 'about', 'ar', 1], ['15-settings-ar', 'settings', 'ar', 1], ['16-settings-large', 'settings', 'en', 1.12], ['17-samsung-larger', 'samsung', 'en', 1.25], ['18-device-ar', 'device', 'ar', 1]);
  for (const [name, page, lang, k] of jobs) {
    await p.goto('file://' + path.resolve(__dirname, 'expressive.html') + `?page=${page}&lang=${lang}&k=${k}&s=${encodeURIComponent(s)}`);
    await p.evaluate(() => window.ready);
    await p.screenshot({ path: `exp/${name}.png` });
  }
  await b.close();
})();
