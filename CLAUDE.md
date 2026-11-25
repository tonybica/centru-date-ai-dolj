# Centrul de date AI Dolj: site cu planul de afacere

Site interactiv în limba română care prezintă planul unui centru de date AI în județul Dolj, cu parc fotovoltaic și baterii. Are o machetă 3D și 16 capitole cu calcule vii. Este făcut pentru a fi arătat unor oameni care nu sunt specialiști.

## Reguli de lucru
- Textele rămân în română simplă, fără jargon. Orice termen tehnic se explică la prima folosire.
- Cifrele sunt estimări de pornire, nu oferte. Se spune asta deschis, iar concluziile incomode rămân în site (de exemplu: la prețuri prudente, varianta cu GPU-uri proprii nu își scoate banii în 10 ani).
- Proiectul are trei mărimi: Pilot 0,25 MW, Mediu 1 MW, Mare 5 MW. Nu există încă teren și nici buget hotărât.
- Fondurile europene se verifică la sursă înainte de a schimba ceva: apelurile se deschid și se închid des. Capitolul „Fonduri europene” arată starea din noiembrie 2026.
- Nu se publică nimic într-un loc nou fără acordul proprietarului proiectului.

## Structură
Site-ul public este `index.html` de la rădăcina depozitului, servit de GitHub Pages la https://tonybica.github.io/centru-date-ai-dolj/. Sursa este în `sursa/`; căile de mai jos sunt relative la acel folder.
- `src/model.js`: toate presupunerile (`A`, `FUNDS`, scenariile) și calculele: energie pe ore, `finance` (un an obișnuit), `tenYear` (zece ani), `funding` (pachete de fonduri), `sensitivity`.
- `src/scene.js`: macheta three.js r149, la scară reală. API: `Scene3D.init/build/go/setSun/setRoof/setRack/setBuild/setOutage/setThermal/...`.
- `src/app.js`: starea paginii, capitolele, graficele SVG, tabelele, legătura cu macheta.
- `src/body.html`: cele 16 capitole (`<article class="chapter" data-title data-view>`). `data-dock` marchează capitolele care folosesc ora, luna și vremea.
- `src/style.css`: aspectul. Sub 900 px lățime macheta rămâne lipită sus, iar textul curge sub ea.

## Construire și verificare
- `node build.js` scrie `out/centru-date-ai-dolj.html` (totul înăuntru, merge fără internet), `out/artifact.html` (varianta pentru Claude) și `out/web/index.html` (varianta pentru GitHub Pages, cu previzualizare de link și fără indexare în motoarele de căutare). După build, `out/web/*` se copiază la rădăcina depozitului.
- `node teste/shot.js 1440 900 "nume:ch0,nume2:ch9"` face capturi pe calculator; `node teste/phone.js "iPhone 13" "nume:ch0"` pe telefon. Scripturile așteaptă să fie rulate din acest folder, cu Playwright instalat.
- După orice schimbare se verifică: fără erori în consolă, fără derulare pe orizontală la 360 px, tema închisă, cele trei mărimi și ambele feluri de venit (Cloud GPU și Colocare).

## Atenție la three.js r149
- Culorile hex sunt tratate ca liniare și apar mai deschise pe ecran. Paleta de căldură trece prin `disp()`.
- Macheta trebuie să pornească și fără WebGL: pagina arată atunci un mesaj, iar calculele merg mai departe.
