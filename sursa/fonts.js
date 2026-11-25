// Descarca o singura data fonturile (latin + latin-ext) si le scrie in src/fonts.css ca data: URL, pentru varianta care merge fara internet.
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const url = 'https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Semi+Condensed:wght@500;600;700&display=swap';
const get = (u, bin) => execFileSync('curl', ['-sS', '-m', '40', '-A', UA, u], { maxBuffer: 1 << 26, encoding: bin ? 'buffer' : 'utf8' });
const css = get(url);
let out = '', total = 0;
css.replace(/\/\* ([a-z-]+) \*\/\s*(@font-face \{[^}]+\})/g, (m, subset, block) => {
  if (subset !== 'latin' && subset !== 'latin-ext') return m;
  const u = /url\((https:[^)]+\.woff2)\)/.exec(block)[1];
  const buf = get(u, true); total += buf.length;
  out += block.replace(u, 'data:font/woff2;base64,' + buf.toString('base64')).replace(/\s*\n\s*/g, '') + '\n';
  return m;
});
fs.writeFileSync(path.join(__dirname, 'src/fonts.css'), out);
console.log('fonts.css', out.length, 'bytes; woff2 total', total, '; faces', (out.match(/@font-face/g) || []).length);
