const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  await p.goto('file://' + path.join(__dirname, '..', 'out/centru-date-ai-dolj.html') + '#q=max'); await p.waitForTimeout(1200);
  const out = [];
  for (const scen of ['pilot', 'mediu', 'mare']) for (const mode of ['cloud', 'colo']) for (let c = 0; c < 2; c++) for (const f of ['none', 'imm', 'fptj']) {
    const r = await p.evaluate(([scen, mode, c, f]) => {
      document.querySelector(`#scen button[data-s="${scen}"]`).click(); document.querySelector(`#mode button[data-m="${mode}"]`).click();
      document.querySelectorAll('#toc button')[9].click(); document.querySelectorAll('#cases button')[c].click(); document.querySelector(`#fund button[data-f="${f}"]`).click();
      const g = k => document.querySelector(`[data-v="${k}"]`).textContent.trim();
      return [g('tenEquity'), g('tenGrant'), g('tenBreak'), g('tenCum')].join(' | ');
    }, [scen, mode, c, f]);
    out.push([scen, mode, c ? 'piata' : 'prudent', f, r].join(' · '));
  }
  console.log(out.join('\n')); await b.close();
})();
