# Centrul de date AI Dolj: site cu planul de afacere

Site interactiv în limba română care prezintă planul unui centru de date AI în județul Dolj, cu parc fotovoltaic și baterii. Are o machetă 3D și 16 capitole cu calcule vii. Este făcut pentru a fi arătat unor oameni care nu sunt specialiști.

## Reguli de lucru
- Textele rămân în română simplă, fără jargon. Orice termen tehnic se explică la prima folosire.
- Cifrele sunt estimări de pornire, nu oferte. Se spune asta deschis, iar concluziile incomode rămân în site (de exemplu: la prețuri prudente, varianta cu GPU-uri proprii nu își scoate banii în 10 ani).
- Proiectul are trei mărimi: Pilot 0,25 MW, Mediu 1 MW, Mare 5 MW. Nu există încă teren și nici buget hotărât.
- Site-ul prezintă un singur fel de venit: ore de GPU pe calculatoare proprii. Colocarea a fost scoasă la cererea proprietarului (noiembrie 2026) și nu se pune înapoi fără să fie întrebat.
- Fondurile europene se verifică la sursă înainte de a schimba ceva: apelurile se deschid și se închid des. Capitolul „Fonduri europene” arată starea din noiembrie 2026.
- Nu se publică nimic într-un loc nou fără acordul proprietarului proiectului.

## Structură
Site-ul public este `index.html` de la rădăcina depozitului, servit de GitHub Pages la https://tonybica.github.io/centru-date-ai-dolj/. Sursa este în `sursa/`; căile de mai jos sunt relative la acel folder.
- `src/model.js`: toate presupunerile (`A`, `FUNDS`, scenariile) și calculele: energie pe ore, `finance` (un an obișnuit), `tenYear` (zece ani), `funding` (pachete de fonduri), `sensitivity`.
- `src/scene/`: macheta three.js r149, la scară reală. `build.js` lipește toate fișierele `*.js` din folder, în ordinea numelui, într-o singură funcție. API: `Scene3D.init/build/go/setSun/setRoof/setRack/setBuild/setOutage/setThermal/...`.
  - `10-core.js`: materialele (`SH`), texturile desenate în cod (`TEX`), uneltele de geometrie (`box`, `cyl`, `flat`, `beam`, `tpl` + `inst`). `15-fx.js`: fluxurile de energie și fumul.
  - `20-pieces.js` și `2x-p-*.js`: piesele, câte un fișier pe zonă (rack, stație, generator, răcire, baterii, panouri, curte, peisaj, fațadă).
  - `30-build.js` deschide funcția `build(p)`, iar `31-*.js` până la `39c-final.js` sunt bucăți consecutive din corpul ei, câte una pe zonă: fațadă, sala electrică, sala de date, birouri, acoperiș, platformă (aici sunt mărimile și pozițiile comune), răcire, generatoare, stație, baterii, panouri, curte, peisaj, zonele de apăsare, fluxurile, ancorele și vederile. Nu sunt fișiere de sine stătătoare: împart aceleași variabile și rulează de sus în jos. Înainte de a șterge sau redenumi o variabilă se caută în tot folderul cine o mai citește.
  - `40-runtime.js`: cerul, lumina, umbrele, camera, etichetele, reglajul automat de calitate și bucla de desen.
- `src/app.js`: starea paginii, capitolele, graficele SVG, tabelele, legătura cu macheta.
- `src/body.html`: cele 16 capitole (`<article class="chapter" data-title data-view>`). `data-dock` marchează capitolele care folosesc ora, luna și vremea.
- `src/style.css`: aspectul. Sub 900 px lățime macheta rămâne lipită sus, iar textul curge sub ea.

## Construire și verificare
- `node build.js` scrie `out/centru-date-ai-dolj.html` (totul înăuntru, merge fără internet), `out/artifact.html` (varianta pentru Claude) și `out/web/index.html` (varianta pentru GitHub Pages, cu previzualizare de link și fără indexare în motoarele de căutare). După build, `out/web/*` se copiază la rădăcina depozitului.
- `node teste/shot.js 1440 900 "nume:ch0,nume2:ch9"` face capturi pe calculator; `node teste/phone.js "iPhone 13" "nume:ch0"` pe telefon; `node teste/view.js 1500 900 "nume|ch11;hour=8"` fotografiază doar macheta; `node teste/sweep.js` trece prin toate capitolele și mărimile la 360 px (`NOGL=1` îl rulează fără machetă, mult mai repede, când s-a schimbat doar pagina). În `view.js`, `look=tx,ty,tz,dist,az,pol` pune camera oriunde, pentru verificări de aproape. Au nevoie de Playwright.
- Testele deschid pagina cu `#q=max`, care oprește reglajul automat de calitate. Fără el, pe un calculator fără placă video macheta coboară singură la calitatea cea mai mică și capturile nu mai arată ce vede un om.
- După orice schimbare se verifică: fără erori în consolă, fără derulare pe orizontală la 360 px, tema închisă și cele trei mărimi.

## Atenție la machetă (three.js r149)
- Proprietarul vrea grafică realistă, nu stilizată: lumină de zi cu umbre, materiale cu textură, cer și orizont. Nu se simplifică aspectul fără să fie întrebat.
- Proprietarul vrea macheta cât mai fidelă realității. Nimic nu plutește: tot ce e greu stă pe fundație sau pe picioare, iar țevile, cablurile și jgheaburile stau pe suporți și încep și se termină în ceva (flanșă, trecere prin perete, dulap, canal). Nimic nu trece prin altceva. Totul e legat logic (apa: răcitor, colector, pompe, perete, sala de date; curentul: linie, stație, canal de cabluri, sala electrică). Dimensiunile și numărul de echipamente sunt cele reale pentru fiecare mărime.
- Legături fixe între zone: țevile de răcire trec prin peretele de est la 2,9 m înălțime (`hzz` din `32b-sala.js`); cablurile din rețea și de la generatoare intră prin peretele de vest; cablurile de la panouri și baterii ajung la peretele de nord, la x = −W/2 + 3.
- `ColorManagement.legacyMode = false`: culorile hex din cod apar pe ecran așa cum sunt scrise. Imaginea trece prin tone mapping ACES, deci lumina se reglează din constantele `EXPO`, `SUN_I`, `HEMI_D`, `ENV_I` din `40-runtime.js`, nu din culori.
- Ceața se amestecă după tone mapping. De aceea culoarea ei se scrie direct în valori de ecran (vezi `applySun`), altfel orizontul nu se leagă cu cerul.
- Piesele mici nu sunt obiecte separate: `box`, `cyl` și celelalte le lipesc într-o singură plasă pe grup și material, iar ce se repetă (mese de panouri, rackuri, copaci) se desenează ca instanțe. Un obiect care trebuie să se miște singur se face cu `mesh()`.
- Tot ce stă pe acoperiș folosește materialele din `ROOFM`, ca să dispară odată cu acoperișul.
- Umbrele se redesenează doar când se schimbă ceva (`shadowDirty = true`), iar harta lor urmărește zona la care se uită camera.
- Calitatea coboară singură în trepte dacă aparatul nu ține 27 de cadre pe secundă, iar macheta nu se mai desenează când nu se vede pe ecran. Pe telefon texturile sunt la jumătate.
- Macheta trebuie să pornească și fără WebGL: pagina arată atunci un mesaj, iar calculele merg mai departe.
