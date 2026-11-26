// trece prin toate capitolele la 360 px, in tema deschisa si inchisa, cu si fara baterii, si spune ce nu incape sau a ramas gol
const { chromium, devices } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ args: process.env.NOGL ? ['--disable-gpu'] : ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const bad = [], errs = [];
  for (const scheme of ['light', 'dark']) {
    const d = Object.assign({}, devices['Galaxy S8']); delete d.defaultBrowserType; d.deviceScaleFactor = 1; d.colorScheme = scheme;
    const ctx = await b.newContext(d); const p = await ctx.newPage();
    if (process.env.NOGL) await p.addInitScript(() => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t) { return /webgl/.test(t) ? null : g.apply(this, arguments); }; });      // --disable-gpu lasa WebGL pe procesor; aici il oprim de tot
    p.on('pageerror', e => errs.push(scheme + ' PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(scheme + ' ' + m.text()); });
    await p.goto('file://' + path.join(__dirname, '..', 'out/centru-date-ai-dolj.html') + '#q=max'); await p.waitForTimeout(1500);
    const n = await p.evaluate(() => document.querySelectorAll('#toc button').length);
    if (!n) bad.push({ scheme, err: 'pagina nu a pornit: cuprinsul este gol' });
    if (process.env.NOGL && !(await p.evaluate(() => !!document.querySelector('.nogl')))) bad.push({ scheme, err: 'mesajul pentru lipsa WebGL nu apare' });
    if (await p.evaluate(() => !!document.querySelector('#scen, #mode'))) bad.push({ scheme, err: 'comutatorul de marime sau de venit inca exista' });
    for (const bess of [0, 2]) {      // planul nu are baterii; a doua trecere verifica textele cu baterii
      await p.evaluate(v => { const e = document.getElementById('s-bess'); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, bess);
      for (let i = 0; i < n; i++) {
        await p.evaluate(i => document.querySelectorAll('#toc button')[i].click(), i); await p.waitForTimeout(120);
        const r = await p.evaluate(() => { [...document.querySelectorAll('.chapter:not([hidden]) details')].forEach(x => x.open = true);
          const ch = document.querySelector('.chapter:not([hidden])');
          return { ox: document.documentElement.scrollWidth - innerWidth, wide: [...ch.querySelectorAll('*')].filter(e => { const r = e.getBoundingClientRect(); if (r.right <= innerWidth + 1) return false; let a = e.parentElement; while (a) { if (/auto|scroll/.test(getComputedStyle(a).overflowX)) return false; a = a.parentElement; } return true; }).slice(0, 3).map(e => e.tagName + '.' + e.className + '#' + e.id),
            empty: [...ch.querySelectorAll('[data-v]')].filter(e => !e.textContent.trim()).map(e => e.getAttribute('data-v')),
            hollow: [...ch.querySelectorAll('table, .bars, .progs, .gantt, .cases, .seg, ul, ol')].filter(e => !e.children.length).map(e => e.tagName + '#' + e.id),
            nan: /NaN|undefined|Infinity|\[object/.test(ch.innerText),
            old: (ch.innerText.match(/campus|parc fotovoltaic|Fond Tranziție|terenul se alege|Alege sus mărimea|credit avantajos|grant pentru IMM/gi) || []).join(','),
            scrollers: [...ch.querySelectorAll('.tblwrap')].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => (e.querySelector('table') || e).id + ':' + (e.scrollWidth - e.clientWidth)) }; });
        if (r.ox > 0 || r.wide.length || r.empty.length || r.hollow.length || r.nan || r.old || r.scrollers.length) bad.push({ scheme, bess, ch: i, ...r });
      }
      if (bess === 0) {       // fara baterii nu apare nimic despre incarcare, nici in bara de sub macheta, nici sub grafic, nici in etichete
        const t = await p.evaluate(() => [document.getElementById('dock').innerText, document.getElementById('day-now').textContent, document.getElementById('outage-steps').textContent, ...[...document.querySelectorAll('.lbl:not([hidden])')].map(l => l.textContent)].join(' | '));
        if (/bateri(i|ile) (mari|se|dau)|încarc|fără baterii/i.test(t) || /Baterii/.test(t)) bad.push({ scheme, err: 'cu 0 baterii apare un text despre baterii', t: t.slice(0, 300) });
      }
    }
    await ctx.close();
  }
  console.log(JSON.stringify(bad, null, 0)); console.log(errs.filter(e => !/GL Driver/.test(e) && !(process.env.NOGL && /Error creating WebGL context/.test(e))).join('\n') || 'no console errors');
  await b.close();
})();
