// lookb=tx,ty,tz,dist,az,pol pune camera oriunde, in coordonatele bazei (x spre interiorul bazei, z de-a lungul caii ferate; az 0 = privit dinspre +z)
// look=tx,ty,tz,dist,az,pol pune camera oriunde, in coordonatele scenei (rotite spre nordul real) (tinta, distanta, unghi in jurul axei verticale, unghi fata de verticala: 1.5 = aproape de sol)
// ANCH=1 tipareste si ancorele etichetelor, ca sa stii unde sunt obiectele
// capturi doar cu macheta: node view.js 1200 760 "nume|ch1;wait=500" "nume2|eval=Scene3D._cam.pol=1.3"
const { chromium, devices } = require('playwright');
const path = require('path');
(async () => {
  const args = process.argv.slice(2), w = +args[0], h = +args[1];
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: +(process.env.DPR || 1), colorScheme: process.env.SCHEME || 'light' });
  page.setDefaultTimeout(180000);
  const errs = [];
  page.on('console', m => { if ((m.type() === 'error' || m.type() === 'warning') && !/ReadPixels/.test(m.text())) errs.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 4).join('\n')));
  await page.goto('file://' + path.join(__dirname, '..', 'out/centru-date-ai-dolj.html') + '#q=max');
  await page.waitForTimeout(1500);
  for (const s of args.slice(2)) {
    const [name, acts] = s.split('|');
    for (const a of (acts || '').split(';').filter(Boolean)) {
      if (/^ch\d+$/.test(a)) await page.evaluate(i => document.querySelectorAll('#toc button')[i].click(), +a.slice(2));
      else if (a.startsWith('scen=')) await page.evaluate(v => document.querySelector(`#scen button[data-s="${v}"]`).click(), a.slice(5));
      else if (a.startsWith('hour=')) await page.evaluate(v => { const e = document.getElementById('hour'); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, a.slice(5));
      else if (a.startsWith('month=')) await page.evaluate(v => { const e = document.getElementById('month'); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); }, a.slice(6));
      else if (a.startsWith('wx=')) await page.evaluate(v => document.querySelector(`#wx button[data-w="${v}"]`).click(), a.slice(3));
      else if (a.startsWith('click=')) await page.evaluate(sel => document.querySelector(sel).click(), a.slice(6));
      else if (a.startsWith('range=')) { const [id, v] = a.slice(6).split('@'); await page.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, v]); }
      else if (a.startsWith('look=')) await page.evaluate(v => { Scene3D.setAuto(false); Scene3D.zoom(1); const c = Scene3D._cam; c.tx = v[0]; c.ty = v[1]; c.tz = v[2]; c.dist = v[3]; c.az = v[4]; c.pol = v[5]; }, a.slice(5).split(',').map(Number));
      else if (a.startsWith('lookb=')) await page.evaluate(v => { Scene3D.setAuto(false); Scene3D.zoom(1); const c = Scene3D._cam, r = Scene3D.layout().north || 0, co = Math.cos(r), si = Math.sin(r); c.tx = v[0] * co + v[2] * si; c.ty = v[1]; c.tz = -v[0] * si + v[2] * co; c.dist = v[3]; c.az = v[4] + r; c.pol = v[5]; }, a.slice(6).split(',').map(Number));
      else if (a.startsWith('eval=')) await page.evaluate(a.slice(5));
      else if (a.startsWith('wait=')) await page.waitForTimeout(+a.slice(5));
    }
    await page.waitForTimeout(+(process.env.WAIT || 2200));
    const el = await page.$('#view');
    await el.screenshot({ path: path.join(__dirname, '..', 'shots', name + '.png'), timeout: 180000 });
  }
  console.log(JSON.stringify(await page.evaluate(() => Scene3D._info())));
  if (process.env.ANCH) console.log(JSON.stringify(await page.evaluate(() => { const l = Scene3D.layout(); return l && (l.anchors || l); })));
  console.log(errs.length ? errs.join('\n') : 'no console errors');
  await browser.close();
})();
