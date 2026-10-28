// Every page of the mobile UI with the stand-in phone (demo.js): node shots.js OUTDIR [lang] [theme] [pages]
const { chromium } = require('playwright'); const path = require('path');
const UI = process.env.UI || '/home/user/fastbootstudio-mobile/src/FastbootStudio.Mobile/ui';
(async () => {
  const [out, lang = 'ar', theme = 'dark', only] = process.argv.slice(2);
  const pages = (only || 'device,flash,backup,otg,more,more/settings,more/logs,more/about').split(',');
  const b = await chromium.launch();
  for (const pg of pages) {
    const p = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
    p.on('pageerror', e => console.log('err', pg, e.message));
    await p.goto('file://' + path.join(UI, 'index.html') + `?lang=${lang}&theme=${theme}`);
    await p.addScriptTag({ url: 'file://' + path.join(UI, 'demo.js') });
    await p.waitForTimeout(700);
    const [tab, page] = pg.split('/');
    await p.evaluate(([t, pg, th, lg]) => { st.s.theme = th; st.s.lang = lg; applyLook(); st.tab = t; st.page = pg || null; render(); }, [tab, page, theme, lang]);
    await p.waitForTimeout(400);
    await p.screenshot({ path: `${out}/${lang}-${theme}-${pg.replace('/', '-')}.png` });
    await p.close();
  }
  await b.close();
})();
