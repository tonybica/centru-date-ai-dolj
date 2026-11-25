const { chromium, devices } = require('playwright');
const path = require('path');
(async () => {
  const args = process.argv.slice(2);
  const dev = args[0] || 'iPhone 13', file = args[2] || 'out/centru-date-ai-dolj.html';
  const steps = (args[1] || 'p0:ch0').split(',');
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const d = Object.assign({}, devices[dev]); delete d.defaultBrowserType; d.deviceScaleFactor = 2;
  if (process.env.LAND) { const v = d.viewport; d.viewport = { width: v.height, height: v.width }; }
  if (process.env.SCHEME) d.colorScheme = process.env.SCHEME;
  const ctx = await browser.newContext(d);
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  await page.goto('file://' + path.join(__dirname, file));
  await page.waitForTimeout(1800);
  for (const s of steps) {
    const [name, ...acts] = s.split(':');
    for (const a of acts) {
      if (a.startsWith('ch')) await page.evaluate(i => document.querySelectorAll('#toc button')[i].click(), +a.slice(2));
      else if (a.startsWith('tap=')) await page.tap(a.slice(4));
      else if (a.startsWith('eclick=')) await page.evaluate(sel => document.querySelector(sel).click(), a.slice(7));
      else if (a.startsWith('wait=')) await page.waitForTimeout(+a.slice(5));
      else if (a.startsWith('wscroll=')) await page.evaluate(v => window.scrollTo(0, +v), a.slice(8));
      else if (a.startsWith('wby=')) await page.evaluate(v => window.scrollBy(0, +v), a.slice(4));
      else if (a.startsWith('into=')) await page.evaluate(sel => document.querySelector(sel).scrollIntoView({ block: 'center' }), a.slice(5));
      else if (a.startsWith('range=')) { const [id, v] = a.slice(6).split('@'); await page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, v]); }
    }
    await page.waitForTimeout(2200);
    await page.screenshot({ path: path.join(__dirname, 'shots', name + '.png') });
  }
  const info = await page.evaluate(() => ({ w: innerWidth, h: innerHeight, hasGL: !document.querySelector('.nogl'), overflowX: document.documentElement.scrollWidth - window.innerWidth,
    wide: [...document.querySelectorAll('.chapter:not([hidden]) *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1).slice(0, 6).map(e => e.tagName + '.' + e.className) }));
  console.log(JSON.stringify(info));
  console.log(errs.length ? errs.join('\n') : 'no console errors');
  await browser.close();
})();
