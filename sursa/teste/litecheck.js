// numara triunghiurile si apelurile pe treapta de telefon, in cateva vederi
const { chromium, devices } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const d = Object.assign({}, devices['iPhone 13']); delete d.defaultBrowserType; d.deviceScaleFactor = 1;
  const ctx = await b.newContext(d); const p = await ctx.newPage(); p.setDefaultTimeout(180000); const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.join(__dirname, '..', 'out/centru-date-ai-dolj.html') + '#q=max'); await p.waitForTimeout(2500);
  for (const v of ['overview', 'hero', 'building', 'top', 'pv']) {
    await p.evaluate(v => { Scene3D.go(v, true); }, v); await p.waitForTimeout(3500);
    console.log(v, JSON.stringify(await p.evaluate(() => Scene3D._info())));
    if (v === 'hero') await p.screenshot({ path: path.join(__dirname, '..', 'shots', 'lite-hero.png') });
  }
  console.log(errs.length ? errs.join('\n') : 'no console errors');
  await b.close();
})();
