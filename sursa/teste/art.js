// verifica varianta pentru artifact: acelasi continut, three.js incarcat de pe CDN (aici servit local)
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.route('https://cdn.jsdelivr.net/**', r => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(path.join(__dirname, 'package/build/three.min.js')) }));
  await p.route('https://fonts.googleapis.com/**', r => r.abort());
  const html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><style>:root{color-scheme:light}body{margin:0;font:14px system-ui}[hidden]{display:none!important}</style></head><body>' + fs.readFileSync(path.join(__dirname, '..', 'out/artifact.html'), 'utf8') + '</body></html>';
  fs.writeFileSync(path.join(__dirname, '..', 'out/_wrapped.html'), html);
  await p.goto('file://' + path.join(__dirname, '..', 'out/_wrapped.html') + '#q=max'); await p.waitForTimeout(2500);
  console.log(JSON.stringify(await p.evaluate(() => ({ gl: !document.querySelector('.nogl'), three: typeof THREE, title: document.title, stat: document.querySelector('[data-v="capexCloud"]').textContent }))));
  await p.screenshot({ path: path.join(__dirname, 'shots/artifact.png') });
  console.log(errs.length ? errs.filter(e => !/fonts|ERR_FAILED/.test(e)).join('\n') || 'only font-blocked errors' : 'no errors');
  await b.close();
})();
