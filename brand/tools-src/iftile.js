// The IF tile from the About mockup (Swamp Ninja IF on a soft tile), in violet; letters centred on their ink.
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const src = fs.readFileSync('ifsn.svg', 'utf8'); const d = src.match(/ d="([^"]+)"/)[1];
  const b = await chromium.launch(); const p = await b.newPage();
  await p.setContent(`<svg xmlns="http://www.w3.org/2000/svg"><path id="t" d="${d}"/></svg>`);
  const bb = await p.evaluate(() => { const r = document.getElementById('t').getBBox(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  await b.close();
  const H = 0.50 * 512, k = H / bb.h, tx = 256 - (bb.x + bb.w / 2) * k, ty = 256 - (bb.y + bb.h / 2) * k + 4;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs>
<linearGradient id="tb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#483f77"/><stop offset="1" stop-color="#2a2346"/></linearGradient>
<linearGradient id="tl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3eeff"/><stop offset=".55" stop-color="#cabeff"/><stop offset="1" stop-color="#edb8cc"/></linearGradient></defs>
<rect width="512" height="512" rx="158" fill="url(#tb)"/>
<rect x="5" y="5" width="502" height="502" rx="153" fill="none" stroke="#cabeff" stroke-opacity=".35" stroke-width="10"/>
<path d="${d}" transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${k.toFixed(4)})" fill="url(#tl)" stroke="#f3eeff" stroke-opacity=".6" stroke-width="${(8 / k).toFixed(2)}" stroke-linejoin="round" paint-order="stroke"/></svg>`;
  fs.writeFileSync('iftile.svg', svg); console.log(bb, k);
})();
