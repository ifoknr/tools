const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
(async () => {
  const [src, out, h] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage();
  const svg = fs.readFileSync(src, 'utf8').replace('<svg ', `<svg height="${h}" `);
  await p.setContent(`<html><body style="margin:0;background:transparent;display:inline-block">${svg}</body></html>`);
  const box = await (await p.$('svg')).boundingBox();
  await p.setViewportSize({ width: Math.ceil(box.width), height: Math.ceil(box.height) });
  await p.screenshot({ path: out, omitBackground: true, clip: { x: 0, y: 0, width: Math.ceil(box.width), height: Math.ceil(box.height) } });
  await b.close();
})();
