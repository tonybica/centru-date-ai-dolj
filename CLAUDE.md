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
- `src/scene/`: macheta three.js r149, la scară reală, împărțită în patru bucăți pe care `build.js` le lipește în ordinea numelui într-o singură funcție. API: `Scene3D.init/build/go/setSun/setRoof/setRack/setBuild/setOutage/setThermal/...`.
  - `10-core.js`: materialele (`SH`), texturile desenate în cod (`TEX`), uneltele de geometrie (`box`, `cyl`, `flat`, `beam`, `tpl` + `inst`), fluxurile și fumul.
  - `20-pieces.js`: obiectele (transformator, generator, răcitor, container de baterii, masă de panouri, stâlpi, mașini, copaci, gard, rack).
  - `30-build.js`: `build(p)` așază campusul pentru o mărime și întoarce ancorele etichetelor și vederile camerei.
  - `40-runtime.js`: cerul, lumina, umbrele, camera, etichetele, reglajul automat de calitate și bucla de desen.
- `src/app.js`: starea paginii, capitolele, graficele SVG, tabelele, legătura cu macheta.
- `src/body.html`: cele 16 capitole (`<article class="chapter" data-title data-view>`). `data-dock` marchează capitolele care folosesc ora, luna și vremea.
- `src/style.css`: aspectul. Sub 900 px lățime macheta rămâne lipită sus, iar textul curge sub ea.

## Construire și verificare
- `node build.js` scrie `out/centru-date-ai-dolj.html` (totul înăuntru, merge fără internet), `out/artifact.html` (varianta pentru Claude) și `out/web/index.html` (varianta pentru GitHub Pages, cu previzualizare de link și fără indexare în motoarele de căutare). După build, `out/web/*` se copiază la rădăcina depozitului.
- `node teste/shot.js 1440 900 "nume:ch0,nume2:ch9"` face capturi pe calculator; `node teste/phone.js "iPhone 13" "nume:ch0"` pe telefon; `node teste/view.js 1500 900 "nume|ch11;hour=8"` fotografiază doar macheta; `node teste/sweep.js` trece prin toate capitolele, mărimile și felurile de venit la 360 px. Au nevoie de Playwright.
- Testele deschid pagina cu `#q=max`, care oprește reglajul automat de calitate. Fără el, pe un calculator fără placă video macheta coboară singură la calitatea cea mai mică și capturile nu mai arată ce vede un om.
- După orice schimbare se verifică: fără erori în consolă, fără derulare pe orizontală la 360 px, tema închisă, cele trei mărimi și ambele feluri de venit (Cloud GPU și Colocare).

## Atenție la machetă (three.js r149)
- Proprietarul vrea grafică realistă, nu stilizată: lumină de zi cu umbre, materiale cu textură, cer și orizont. Nu se simplifică aspectul fără să fie întrebat.
- `ColorManagement.legacyMode = false`: culorile hex din cod apar pe ecran așa cum sunt scrise. Imaginea trece prin tone mapping ACES, deci lumina se reglează din constantele `EXPO`, `SUN_I`, `HEMI_D`, `ENV_I` din `40-runtime.js`, nu din culori.
- Ceața se amestecă după tone mapping. De aceea culoarea ei se scrie direct în valori de ecran (vezi `applySun`), altfel orizontul nu se leagă cu cerul.
- Piesele mici nu sunt obiecte separate: `box`, `cyl` și celelalte le lipesc într-o singură plasă pe grup și material, iar ce se repetă (mese de panouri, rackuri, copaci) se desenează ca instanțe. Un obiect care trebuie să se miște singur se face cu `mesh()`.
- Tot ce stă pe acoperiș folosește materialele din `ROOFM`, ca să dispară odată cu acoperișul.
- Umbrele se redesenează doar când se schimbă ceva (`shadowDirty = true`), iar harta lor urmărește zona la care se uită camera.
- Calitatea coboară singură în trepte dacă aparatul nu ține 27 de cadre pe secundă, iar macheta nu se mai desenează când nu se vede pe ecran. Pe telefon texturile sunt la jumătate.
- Macheta trebuie să pornească și fără WebGL: pagina arată atunci un mesaj, iar calculele merg mai departe.
