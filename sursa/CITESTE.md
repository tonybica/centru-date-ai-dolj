# Sursa site-ului „Centrul de date AI de la Râureni”

Site-ul este un singur fișier HTML, făcut din piesele de mai jos. Tot proiectul este lucrat cu Claude Code, iar `CLAUDE.md` îi spune ce trebuie să știe ca să continue de aici.

- `src/model.js`: presupunerile și calculele (consum, soare, bani, planul pe 10 ani, fonduri europene), măsurătorile bazei și cifrele din calculul pentru bancă. Aici se schimbă cifrele.
- `src/scene/`: macheta 3D (three.js r149), împărțită pe zone și lipită la construire în ordinea numelui: materiale și texturi (`10`), fluxuri (`15`), piese pe zone (`2x-p-*`), planul bazei (`30b`), hala, instalațiile, baza și împrejurimile (`31`–`39`), apoi cerul, lumina și camera (`40`). Regulile sunt în `CLAUDE.md`. Cuprinde rackul deschis, pana de curent, vederea de căldură și construcția pe etape.
- `src/app.js`: capitolele, graficele și legătura dintre cifre și machetă.
- `src/body.html`, `src/style.css`: textele și aspectul, inclusiv așezarea pentru telefon.
- `src/fonts.css`: fonturile Barlow puse în fișier, ca site-ul să arate la fel și fără internet. Se refac cu `node fonts.js`.
- `package/build/three.min.js`: biblioteca 3D, pusă și ea în fișier.
- `teste/`: scripturi Playwright care deschid site-ul pe calculator și pe telefon, fac capturi, trec prin toate capitolele și apasă pe toate butoanele. `teste/mcheck.js` tipărește cifrele modelului.

`node build.js` scrie în `out/`:
- `centru-date-ai-dolj.html`: un singur fișier, merge fără internet, se deschide cu dublu-click. Numele a rămas de la prima variantă, pentru terenul din Dolj.
- `artifact.html`: varianta publicată ca pagină, cu three.js și fonturile de pe internet.
- `web/index.html`: varianta pentru linkul public, cu imagine de previzualizare.

Fonturile Barlow au licența SIL Open Font License, iar three.js licența MIT.
