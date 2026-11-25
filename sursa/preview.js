// face imaginea de previzualizare a linkului (1200x630) si iconita pentru ecranul telefonului
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1716, height: 800 }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.join(__dirname, 'out/centru-date-ai-dolj.html')); await p.waitForTimeout(2500);
  await p.evaluate(() => { document.getElementById('hint').style.display = 'none'; document.querySelector('.hud').style.display = 'none'; document.querySelector('.zoom').style.display = 'none'; document.querySelector('.north').style.display = 'none'; });
  await p.waitForTimeout(1200);
  const r = await p.evaluate(() => { const v = document.getElementById('view').getBoundingClientRect(); return { x: v.x, y: v.y, w: v.width, h: v.height }; });
  const w = 1200, h = 630; console.log(JSON.stringify(r));
  await p.screenshot({ path: path.join(__dirname, 'out/web/preview.jpg'), type: 'jpeg', quality: 84, clip: { x: r.x + Math.max(0, (r.w - w) / 2), y: r.y + Math.max(0, (r.h - h) / 2), width: Math.min(w, r.w), height: Math.min(h, r.h) } });
  const q = await b.newPage({ viewport: { width: 180, height: 180 }, deviceScaleFactor: 1 });
  await q.setContent('<body style="margin:0;background:#15211c"><svg width="180" height="180" viewBox="-3 -3 40 40"><rect x="1" y="1" width="32" height="32" rx="8" fill="#15211c"/><circle cx="23" cy="11" r="4.5" fill="#f2a600"/><rect x="7" y="17" width="12" height="10" rx="1.5" fill="#fff"/><path d="M21 27l3-8h5l-3 8z" fill="#257de0"/></svg></body>');
  await q.screenshot({ path: path.join(__dirname, 'out/web/icon-180.png') });
  await b.close();
})();
