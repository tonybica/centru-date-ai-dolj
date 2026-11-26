// apasa pe tot ce se poate apasa: treptele de grant, cursoarele de panouri si baterii, pana de curent, ziua de 24 de ore, santierul, caldura, rackul
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ args: process.env.NOGL ? ['--disable-gpu'] : ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: +(process.env.W || 1280), height: +(process.env.H || 800) }, deviceScaleFactor: 1 }); const errs = [], out = {};
  if (process.env.NOGL) await p.addInitScript(() => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t) { return /webgl/.test(t) ? null : g.apply(this, arguments); }; });      // --disable-gpu lasa WebGL pe procesor; aici il oprim de tot
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.join(__dirname, '..', 'out/centru-date-ai-dolj.html') + '#q=low'); await p.waitForTimeout(1500);
  const q = (f, a) => p.evaluate(f, a);
  const ch = t => q(t => { const i = [...document.querySelectorAll('.chapter')].findIndex(c => c.dataset.title === t); document.querySelectorAll('#toc button')[i].click(); return i; }, t);
  const txt = sel => q(sel => { const e = document.querySelector(sel); return e ? e.textContent.trim().replace(/\s+/g, ' ') : null; }, sel);
  const range = (id, v) => q(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, [id, v]);
  const until = async (f, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await q(f)) return Math.round((Date.now() - t0) / 100) / 10; await p.waitForTimeout(300); } return 'TIMEOUT'; };
  out.gl = await q(() => !document.querySelector('.nogl'));
  const want = (process.argv[2] || 'grant,pv,bess,play,outage,build,modes,place').split(','), say = k => { console.log(k, JSON.stringify(out, null, 1)); for (const x in out) delete out[x]; };
  if (want.includes('grant')) {
  // grantul: aceleasi butoane in doua capitole, schimba graficul si cele doua texte
  await ch('Zece ani'); await q(() => document.querySelector('#cases button[data-k="piata"]').click());
  out.grant = [];
  for (const g of [0, 3, 5, 10]) {
    await q(g => document.querySelector('#fund button[data-f="' + g + '"]').click(), g);
    out.grant.push({ g, pressed2: await q(g => document.querySelector('#fund2 button[data-f="' + g + '"]').getAttribute('aria-pressed'), g), stats: await txt('[data-v="tenEquity"]') + ' | ' + await txt('[data-v="tenGrant"]') + ' | ' + await txt('[data-v="tenBreak"]'),
      chart: (await q(() => document.querySelector('#c-ten svg').getAttribute('aria-label'))).slice(34), ten: await txt('[data-v="tenLine"]'), fund: await txt('[data-v="fundLine"]'), bank: await txt('[data-v="bankLine"]'), bankOn: await txt('#t-bank tr.on') });
  }
  await ch('Fonduri europene'); await q(() => document.querySelector('#fund2 button[data-f="0"]').click());
  out.fund0 = { pressed1: await q(() => document.querySelector('#fund button[data-f="0"]').getAttribute('aria-pressed')), cards: await q(() => [...document.querySelectorAll('#funds .prog')].map(c => c.querySelector('.tagc').textContent + ': ' + c.querySelector('h4').firstChild.textContent.trim())), links: await q(() => [...document.querySelectorAll('.chapter:not([hidden]) a')].length) };
  await q(() => document.querySelector('#cases button[data-k="prudent"]').click());
  say('grant'); }
  if (want.includes('pv')) {
  await ch('Soarele'); out.pv = [];
  for (const v of [0, 0.6, 1.2, 1.5]) { await range('s-pv', v); await p.waitForTimeout(350); out.pv.push([await txt('#o-pv'), await txt('[data-v="roofM2"]'), await txt('[data-v="coverage"]'), await txt('[data-v="wasteShare"]'), (await txt('[data-v="pvLine"]')).slice(86), await q(() => [...document.querySelectorAll('.lbl:not([hidden])')].map(l => l.textContent).filter(t => /Panouri/.test(t)).join())].join(' | ')); }
  await range('s-pv', 1.2); say('pv'); }
  if (want.includes('bess')) {
  await ch('Bateriile și rețeaua'); out.bess = [];
  for (const v of [0, 2, 4, 0]) { await range('s-bess', v); await p.waitForTimeout(700); out.bess.push([await txt('#o-bess'), await txt('[data-v="bessLine"]'), await txt('[data-v="yearLine"]'), 'chip ' + await q(() => !document.getElementById('chip-batt').hidden), 'legenda ' + await q(() => !document.getElementById('lg-batt').hidden), await txt('#day-now'), await q(() => [...document.querySelectorAll('.lbl:not([hidden])')].map(l => l.textContent).join(';'))].join(' | ')); }
  say('bess'); }
  if (want.includes('play')) {
  await ch('Bateriile și rețeaua');
  await q(() => { document.getElementById('speed').click(); document.getElementById('play2').click(); }); await p.waitForTimeout(1200);
  out.play = { mid: await txt('#play') + ' / ' + await txt('#play-left'), end: await until(() => document.getElementById('play').textContent.indexOf('Rulează') >= 0, 90000), clock: await txt('#clock') };
  say('play'); }
  if (want.includes('outage')) {
  await ch('Curentul'); await q(() => document.getElementById('b-outage').click()); await p.waitForTimeout(3000);
  out.outage = { mid: await txt('#out-now'), chips: await q(() => [...document.querySelectorAll('.dock .chip')].filter(e => !e.hidden).map(e => e.textContent.trim().replace(/\s+/g, ' ')).join(' ; ')), end: await until(() => /Gata/.test(document.getElementById('out-now').textContent), 60000), btn: await txt('#b-outage'), panels: await txt('[data-v="outPanels"]') };
  for (let i = 0; i < 6; i++) await q(() => document.getElementById('out-next').click());
  out.outage.manual = await txt('#out-now');
  say('outage'); }
  if (want.includes('build')) {
  await ch('Calendarul'); out.build = { rows: await q(() => [...document.querySelectorAll('#c-gantt .grow[data-i] span')].map(s => s.textContent).length), start: await txt('#o-build') };
  await q(() => document.getElementById('b-build').click()); await p.waitForTimeout(2500); out.build.mid = await txt('#o-build');
  out.build.end = await until(() => /funcționează/.test(document.getElementById('o-build').textContent), 150000); out.build.endTxt = await txt('#o-build') + ' / ' + await txt('#b-build');
  say('build'); }
  if (want.includes('modes')) {
  await ch('Răcirea'); await q(() => document.getElementById('b-thermal').click()); await p.waitForTimeout(900); out.thermal = await txt('#b-thermal'); await q(() => document.getElementById('b-thermal').click());
  await ch('Calculatoarele'); await q(() => document.getElementById('b-rack').click()); await p.waitForTimeout(2500); out.rack = await txt('#b-rack') + ' / info ' + await q(() => !document.getElementById('rack-info').hidden) + ' / ' + await q(() => [...document.querySelectorAll('.lbl.part:not([hidden])')].length) + ' etichete de piese';
  await q(() => document.getElementById('b-rack').click()); await q(() => document.getElementById('b-roof').click()); out.roof = await txt('#b-roof');
  say('modes'); }
  if (want.includes('place')) {
  await ch('Locul'); await p.waitForTimeout(3500);
  out.place = await q(() => [...document.querySelectorAll('.lbl:not([hidden])')].map(l => l.textContent + (l.classList.contains('edge') ? ' (margine)' : '')));
  await q(() => document.getElementById('b-over').click()); await ch('Ideea'); await p.waitForTimeout(1500);
  out.afterPlace = await q(() => [...document.querySelectorAll('.lbl.place:not([hidden])')].length + ' etichete de loc ramase; ' + [...document.querySelectorAll('.lbl:not([hidden])')].map(l => l.textContent).join(';'));
  out.ox = await q(() => document.documentElement.scrollWidth - innerWidth);
  say('place'); }
  console.log(errs.filter(e => !/GL Driver/.test(e) && !(process.env.NOGL && /Error creating WebGL context/.test(e))).join('\n') || 'no console errors');
  await b.close();
})();
