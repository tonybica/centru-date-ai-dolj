const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const args = process.argv.slice(2);
  const w = +(args[0] || 1440), h = +(args[1] || 900), steps = (args[2] || 'ch0').split(','), scheme = args[3] || 'light';
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, colorScheme: scheme });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 4).join('\n')));
  await page.goto('file://' + path.join(__dirname, '..', 'out/centru-date-ai-dolj.html') + '#q=max');
  await page.waitForTimeout(1500);
  for (const s of steps) {
    const [name, ...acts] = s.split(':');
    for (const a of acts) {
      if (a.startsWith('ch')) { await page.evaluate(i => document.querySelectorAll('#toc button')[i].click(), +a.slice(2)); }
      else if (a.startsWith('scen=')) { await page.click(`#scen button[data-s="${a.slice(5)}"]`); }
      else if (a.startsWith('hour=')) { await page.evaluate(v => { const e = document.getElementById('hour'); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, a.slice(5)); }
      else if (a.startsWith('month=')) { await page.evaluate(v => { const e = document.getElementById('month'); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); }, a.slice(6)); }
      else if (a.startsWith('wx=')) { await page.click(`#wx button[data-w="${a.slice(3)}"]`); }
      else if (a.startsWith('mode=')) { await page.click(`#mode button[data-m="${a.slice(5)}"]`); }
      else if (a.startsWith('click=')) { await page.click(a.slice(6)); }
      else if (a.startsWith('eclick=')) { await page.evaluate(sel => document.querySelector(sel).click(), a.slice(7)); }
      else if (a.startsWith('wait=')) { await page.waitForTimeout(+a.slice(5)); }
      else if (a.startsWith('range=')) { const [id, v] = a.slice(6).split('@'); await page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, v]); }
      else if (a.startsWith('wscroll=')) { await page.evaluate(v => window.scrollTo(0, +v), a.slice(8)); }
      else if (a === 'scrollend') { await page.evaluate(() => { const s = document.getElementById('scroll'); s.scrollTop = s.scrollHeight; }); }
      else if (a.startsWith('scroll=')) { await page.evaluate(v => { const s = document.getElementById('scroll'); s.scrollTop = +v; }, a.slice(7)); }
    }
    await page.waitForTimeout(2600);
    await page.screenshot({ path: path.join(__dirname, '..', 'shots', name + '.png'), fullPage: w < 900 && !process.env.VIEWPORT_ONLY });
  }
  const info = await page.evaluate(() => ({ hasGL: !document.querySelector('.nogl'), overflowX: document.documentElement.scrollWidth - window.innerWidth, labels: [...document.querySelectorAll('.lbl')].map(l => l.textContent + (l.hidden ? ' (h)' : '')) }));
  console.log(JSON.stringify(info));
  console.log(errs.length ? errs.join('\n') : 'no console errors');
  await browser.close();
})();
