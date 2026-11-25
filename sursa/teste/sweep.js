const { chromium, devices } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ args: process.env.NOGL ? ['--disable-gpu'] : ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const d = Object.assign({}, devices['Galaxy S8']); delete d.defaultBrowserType; d.deviceScaleFactor = 1;
  const ctx = await b.newContext(d); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.join(__dirname, '..', 'out/centru-date-ai-dolj.html') + '#q=max'); await p.waitForTimeout(1500);
  const bad = [];
  for (const scen of ['pilot', 'mediu', 'mare']) {
    await p.evaluate(s => document.querySelector(`#scen button[data-s="${s}"]`).click(), scen);
    for (const mode of ['gpu']) {   // un singur fel de venit: ore de GPU (colocarea a fost scoasa)
      if (await p.evaluate(() => !!document.querySelector('#mode'))) bad.push({ scen, err: 'comutatorul de venit inca exista' });
      for (let i = 0; i < 16; i++) {
        await p.evaluate(i => document.querySelectorAll('#toc button')[i].click(), i); await p.waitForTimeout(120);
        const r = await p.evaluate(() => { [...document.querySelectorAll('.chapter:not([hidden]) details')].forEach(x => x.open = true);
          return { ox: document.documentElement.scrollWidth - innerWidth, wide: [...document.querySelectorAll('.chapter:not([hidden]) *')].filter(e => { const r = e.getBoundingClientRect(); if (r.right <= innerWidth + 1) return false; let a = e.parentElement; while (a) { if (/auto|scroll/.test(getComputedStyle(a).overflowX)) return false; a = a.parentElement; } return true; }).slice(0, 3).map(e => e.tagName + '.' + e.className + '#' + e.id),
            empty: [...document.querySelectorAll('.chapter:not([hidden]) [data-v]')].filter(e => !e.textContent.trim()).map(e => e.getAttribute('data-v')),
            nan: /NaN|undefined|Infinity/.test(document.querySelector('.chapter:not([hidden])').innerText),
            scrollers: [...document.querySelectorAll('.chapter:not([hidden]) .tblwrap')].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => (e.querySelector('table') || e).id + ':' + (e.scrollWidth - e.clientWidth)) }; });
        if (r.ox > 0 || r.wide.length || r.empty.length || r.nan || r.scrollers.length) bad.push({ scen, mode, ch: i, ...r });
      }
    }
  }
  console.log(JSON.stringify(bad, null, 0)); console.log(errs.filter(e => !/GL Driver/.test(e)).join('\n') || 'no console errors');
  await b.close();
})();
