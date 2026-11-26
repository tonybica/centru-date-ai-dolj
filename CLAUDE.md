# Centrul de date AI de la Râureni: site cu planul de afacere

Site interactiv în limba română care prezintă planul unui centru de date AI de 1 MW, pus într-o hală existentă din baza firmei proprietarului, la Râureni, Râmnicu Vâlcea, cu panouri pe acoperișurile halelor. Are o machetă 3D a bazei și 17 capitole cu calcule vii. Este făcut pentru a fi arătat unor oameni care nu sunt specialiști. Până pe 25 noiembrie 2026 site-ul prezenta un teren nou în Dolj, în trei mărimi; de aceea depozitul și fișierul construit au încă „dolj” în nume.

## Reguli de lucru
- Textele rămân în română simplă, fără jargon. Orice termen tehnic se explică la prima folosire.
- Cifrele sunt estimări de pornire, nu oferte. Se spune asta deschis, iar concluziile incomode rămân în site: la prețuri prudente proiectul nu își scoate banii în 10 ani; niciun grant nu se potrivește proiectului așa cum este; locul are un risc adevărat (platforma chimică de alături).
- O singură mărime: Mediu, 1 MW, în hala liberă 1 din bază. Pilot apare doar ca termen de comparație. Mărimea Mare (5 MW) nu încape în bază.
- Un singur fel de venit: ore de GPU pe calculatoare proprii. Colocarea a fost scoasă la cererea proprietarului și nu se pune înapoi fără să fie întrebat.
- Planul se sprijină pe grant 0 (alegerea proprietarului, noiembrie 2026). Apelul STEP apare doar ca șansă în plus. Fondurile europene se verifică la sursă înainte de a schimba ceva: apelurile se deschid și se închid des.
- Tabelele „calculul pentru bancă” (`BANK` în `model.js`) sunt cifre fixe, luate din planul formal pentru bancă. Nu se recalculează aici; se schimbă doar odată cu planul.
- Măsurătorile bazei vin din imagini din satelit (eroare de circa 15%). Ce este dincolo de gard este desenat orientativ, iar pagina spune asta.
- Nu se publică nimic într-un loc nou fără acordul proprietarului proiectului.

## Structură
Site-ul public este `index.html` de la rădăcina depozitului, servit de GitHub Pages la https://tonybica.github.io/centru-date-ai-dolj/. Sursa este în `sursa/`; căile de mai jos sunt relative la acel folder.
- `src/model.js`: presupunerile (`A`), baza (`BASE`), fondurile (`FUNDS`, `FUND_LIST`), cifrele pentru bancă (`BANK`), scenariile (`SCEN`) și calculele: energie pe ore, `finance` (un an obișnuit), `tenYear` (zece ani), `funding(G, f)` (un grant de G milioane de euro), `sensitivity`. `node teste/mcheck.js` tipărește cifrele principale.
- `src/scene/`: macheta three.js r149, la scară reală. `build.js` lipește toate fișierele `*.js` din folder, în ordinea numelui, într-o singură funcție. API: `Scene3D.init/build/go/setSun/setRoof/setRack/setBuild/setOutage/setThermal/...`.
  - `10-core.js`: materialele (`SH`), texturile desenate în cod (`TEX`), uneltele de geometrie (`box`, `cyl`, `flat`, `beam`, `tpl` + `inst`). `15-fx.js`: fluxurile de energie și fumul.
  - `20-pieces.js` și `2x-p-*.js`: piesele, câte un fișier pe zonă (fațadă, rack, generator, post de transformare, răcire, baterii, panouri, clădirile și camioanele bazei, peisaj).
  - `30-build.js` deschide funcția `build(p)`, iar `30b-plan.js` până la `39c-final.js` sunt bucăți consecutive din corpul ei: planul bazei, hala (fațadă, sala electrică, sala de date, birouri, acoperiș), răcirea, generatoarele, postul de transformare, bateriile, panourile, baza existentă, împrejurimile, zonele de apăsare, fluxurile, ancorele și vederile. Nu sunt fișiere de sine stătătoare: împart aceleași variabile și rulează de sus în jos. Înainte de a șterge sau redenumi o variabilă se caută în tot folderul cine o mai citește.
  - `40-runtime.js`: cerul, lumina, umbrele, camera, etichetele, reglajul automat de calitate și bucla de desen.
- `src/app.js`: starea paginii, capitolele, graficele SVG, tabelele, legătura cu macheta.
- `src/body.html`: cele 17 capitole (`<article class="chapter" data-title data-view>`). `data-dock` marchează capitolele care folosesc ora, luna și vremea.
- `src/style.css`: aspectul. Sub 900 px lățime macheta rămâne lipită sus, iar textul curge sub ea.

## Construire și verificare
- `node build.js` scrie `out/centru-date-ai-dolj.html` (totul înăuntru, merge fără internet), `out/artifact.html` (varianta pentru Claude) și `out/web/index.html` (varianta pentru GitHub Pages, cu previzualizare de link și fără indexare în motoarele de căutare). După build, `out/web/*` se copiază la rădăcina depozitului.
- `node teste/shot.js 1440 900 "nume:ch0,nume2:ch9"` face capturi pe calculator; `node teste/phone.js "iPhone 13" "nume:ch0"` pe telefon; `node teste/view.js 1500 900 "nume|ch11;hour=8"` fotografiază doar macheta; `NOGL=1 node teste/sweep.js` trece prin toate capitolele la 360 px, în tema deschisă și închisă; `node teste/clicktest.js` apasă pe toate butoanele; `node teste/litecheck.js` numără triunghiurile pe treapta de telefon. În `view.js`, `lookb=tx,ty,tz,dist,az,pol` pune camera oriunde, în coordonatele bazei. Au nevoie de Playwright.
- Testele deschid pagina cu `#q=max`, care oprește reglajul automat de calitate. Fără el, pe un calculator fără placă video macheta coboară singură la calitatea cea mai mică și capturile nu mai arată ce vede un om.
- După orice schimbare se verifică: fără erori în consolă, fără derulare pe orizontală la 360 px, tema închisă, acoperișul ridicat, vederea termică, noaptea, șantierul.

## Atenție la machetă (three.js r149)
- Proprietarul vrea grafică realistă, nu stilizată: lumină de zi cu umbre, materiale cu textură, cer și orizont. Nu se simplifică aspectul fără să fie întrebat.
- Proprietarul vrea macheta cât mai fidelă realității. Nimic nu plutește: tot ce e greu stă pe fundație sau pe picioare, iar țevile, cablurile și jgheaburile stau pe suporți și încep și se termină în ceva (flanșă, trecere prin perete, dulap, canal). Nimic nu trece prin altceva. Totul e legat logic (apa: răcitor, colector, pompe, perete, sala de date; curentul: cablu de 20 kV, post de transformare, șanț de cabluri, sala electrică).
- Coordonatele bazei: totul se construiește sub `root` în metri, cu x de la calea ferată spre interiorul bazei, z de-a lungul căii ferate și originea în centrul halei centrului. „Nord” în cod înseamnă −z (curtea cu instalațiile), „sud” +z (intrarea), „vest” −x (calea ferată), „est” +x (restul halei lungi). `root` este rotit o singură dată cu `NORTH_ROT`, ca nordul adevărat să fie nordul scenei: soarele și busola sunt reale. Ancorele și vederile se scriu în coordonatele bazei și se trec în ale scenei în `39c-final.js`.
- `30b-plan.js` este planul: cele 26 de clădiri (`BZ`), hala (`HALL`), perimetrul (`PER`), curțile, dreptunghiul fiecărei instalații de pe platforma nouă (`RZ`) și intrările prin peretele de nord (`xInG` cabluri de la transformatoare, `xInB` dulapul pentru generatoare și panouri, `xCW` și `yCW` țevile de apă răcită). Zonele se leagă între ele doar prin aceste valori.
- Toate acoperișurile din bază sunt în două ape, cu coama pe latura lungă și panta de 9%: `bzRoof(b)` și `bzRoofY(b, x, z)`. Cine desenează un acoperiș și cine pune panouri pe el folosesc aceleași două funcții.
- Fiecare zonă lasă variabile citite de `39a-zone.js`, `39b-fluxuri.js`, `39c-final.js` și `40-runtime.js` (de exemplu `coolZ`, `coolA`, `gridPath`, `genO`, `pvZs`, `tables`). Numele și sensul lor nu se schimbă.
- `ColorManagement.legacyMode = false`: culorile hex din cod apar pe ecran așa cum sunt scrise. Imaginea trece prin tone mapping ACES, deci lumina se reglează din constantele `EXPO`, `SUN_I`, `HEMI_D`, `ENV_I` din `40-runtime.js`, nu din culori.
- Ceața se amestecă după tone mapping. De aceea culoarea ei se scrie direct în valori de ecran (vezi `applySun`), altfel orizontul nu se leagă cu cerul.
- Piesele mici nu sunt obiecte separate: `box`, `cyl` și celelalte le lipesc într-o singură plasă pe grup și material, iar ce se repetă (module de panouri, rackuri, camioane, vagoane, copaci) se desenează ca instanțe. Un obiect care trebuie să se miște singur se face cu `mesh()`.
- Tot ce stă pe acoperișul halei centrului folosește materialele din `ROOFM`, ca să dispară odată cu acoperișul.
- Umbrele se redesenează doar când se schimbă ceva (`shadowDirty = true`), iar harta lor urmărește zona la care se uită camera.
- Calitatea coboară singură în trepte dacă aparatul nu ține 27 de cadre pe secundă, iar macheta nu se mai desenează când nu se vede pe ecran. Pe telefon texturile sunt la jumătate. Limita pentru telefon: 350.000 de triunghiuri și 350 de desene pe cadru.
- Macheta trebuie să pornească și fără WebGL: pagina arată atunci un mesaj, iar calculele merg mai departe.
