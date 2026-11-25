// capturi doar cu macheta: node view.js 1200 760 "nume|ch1;wait=500" "nume2|eval=Scene3D._cam.pol=1.3"
const { chromium, devices } = require('playwright');
const path = require('path');
(async () => {
  const args = process.argv.slice(2), w = +args[0], h = +args[1];
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: +(process.env.DPR || 1), colorScheme: process.env.SCHEME || 'light' });
  const errs = [];
  page.on('console', m => { if ((m.type() === 'error' || m.type() === 'warning') && !/ReadPixels/.test(m.text())) errs.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 4).join('\n')));
  await page.goto('file://' + path.join(__dirname, '..', 'out/centru-date-ai-dolj.html') + '#q=max');
  await page.waitForTimeout(1500);
  for (const s of args.slice(2)) {
    const [name, acts] = s.split('|');
    for (const a of (acts || '').split(';').filter(Boolean)) {
      if (/^ch\d+$/.test(a)) await page.evaluate(i => document.querySelectorAll('#toc button')[i].click(), +a.slice(2));
      else if (a.startsWith('scen=')) await page.click(`#scen button[data-s="${a.slice(5)}"]`);
      else if (a.startsWith('hour=')) await page.evaluate(v => { const e = document.getElementById('hour'); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, a.slice(5));
      else if (a.startsWith('month=')) await page.evaluate(v => { const e = document.getElementById('month'); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); }, a.slice(6));
      else if (a.startsWith('wx=')) await page.evaluate(v => document.querySelector(`#wx button[data-w="${v}"]`).click(), a.slice(3));
      else if (a.startsWith('click=')) await page.evaluate(sel => document.querySelector(sel).click(), a.slice(6));
      else if (a.startsWith('range=')) { const [id, v] = a.slice(6).split('@'); await page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, v]); }
      else if (a.startsWith('eval=')) await page.evaluate(a.slice(5));
      else if (a.startsWith('wait=')) await page.waitForTimeout(+a.slice(5));
    }
    await page.waitForTimeout(+(process.env.WAIT || 2200));
    const el = await page.$('#view');
    await el.screenshot({ path: path.join(__dirname, '..', 'shots', name + '.png') });
  }
  console.log(JSON.stringify(await page.evaluate(() => Scene3D._info())));
  console.log(errs.length ? errs.join('\n') : 'no console errors');
  await browser.close();
})();
