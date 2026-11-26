const fs = require('fs'), path = require('path');
const src = f => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
const three = fs.readFileSync(path.join(__dirname, 'package/build/three.min.js'), 'utf8').replace(/<\/script/gi, '<\\/script');
const css = src('style.css'), body = src('body.html');
// macheta 3D este impartita in bucati (src/scene/10-..., 20-...), lipite aici in ordinea numelui
const sceneJs = fs.readdirSync(path.join(__dirname, 'src/scene')).filter(f => f.endsWith('.js')).sort().map(f => src('scene/' + f)).join('\n');
const js = [src('model.js'), sceneJs, src('app.js')].join('\n').replace(/<\/script/gi, '<\\/script');
const fonts = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Semi+Condensed:wght@500;600;700&display=swap">';
const title = '<title>Centrul de date AI de la Râureni</title>';
// varianta locala are fonturile inauntru (src/fonts.css, facut cu node fonts.js), ca sa arate la fel si fara internet
const fontsFile = path.join(__dirname, 'src/fonts.css');
const localFonts = fs.existsSync(fontsFile) ? '<style>' + fs.readFileSync(fontsFile, 'utf8') + '</style>' : fonts;
const artifact = `<meta name="claude:viewport-fit-sides" content="cover">\n${title}\n${fonts}\n<style>\n${css}</style>\n${body}\n<script src="https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js"></script>\n<script>\n${js}\n</script>\n`;
const reset = ':root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);box-sizing:border-box}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}';
const local = `<!doctype html>\n<html lang="ro">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${title}\n<meta name="theme-color" content="#eef1ec">\n${localFonts}\n<style>${reset}</style>\n<style>\n${css}</style>\n</head>\n<body>\n${body}\n<script>\n${three}\n</script>\n<script>\n${js}\n</script>\n</body>\n</html>\n`;
// varianta de pus pe internet (GitHub Pages): acelasi fisier, plus ce ajuta la trimis linkul: previzualizare, iconita, fara indexare in motoare de cautare
const SITE = (process.env.SITE_URL || 'https://tonybica.github.io/centru-date-ai-dolj/').replace(/\/?$/, '/');
const desc = 'Plan de afacere interactiv pentru un centru de date AI de 1 MW într-o hală existentă din Râmnicu Vâlcea: machetă 3D, panouri pe acoperișuri, plan pe 10 ani și fonduri europene.';
const icon = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34"><rect x="1" y="1" width="32" height="32" rx="8" fill="#15211c"/><circle cx="23" cy="11" r="4.5" fill="#f2a600"/><rect x="7" y="17" width="12" height="10" rx="1.5" fill="#fff"/><path d="M21 27l3-8h5l-3 8z" fill="#257de0"/></svg>');
const webHead = `<meta name="description" content="${desc}">\n<meta name="robots" content="noindex">\n<link rel="icon" href="${icon}">\n<link rel="apple-touch-icon" href="${SITE}icon-180.png">\n<meta name="apple-mobile-web-app-title" content="Centru AI Râureni">\n<meta property="og:type" content="website">\n<meta property="og:locale" content="ro_RO">\n<meta property="og:title" content="Centrul de date AI Dolj">\n<meta property="og:description" content="${desc}">\n<meta property="og:url" content="${SITE}">\n<meta property="og:image" content="${SITE}preview.jpg">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta name="twitter:card" content="summary_large_image">`;
const web = local.replace(title, title + '\n' + webHead);
fs.mkdirSync(path.join(__dirname, 'out/web'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'out/web/index.html'), web);
fs.writeFileSync(path.join(__dirname, 'out/web/.nojekyll'), '');
fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'out/artifact.html'), artifact);
fs.writeFileSync(path.join(__dirname, 'out/centru-date-ai-dolj.html'), local);
console.log('artifact', artifact.length, 'local', local.length);
