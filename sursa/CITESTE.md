# Sursa site-ului „Centrul de date AI Dolj”

Site-ul este un singur fișier HTML, făcut din piesele de mai jos. Tot proiectul este lucrat cu Claude Code, iar `CLAUDE.md` îi spune ce trebuie să știe ca să continue de aici.

- `src/model.js`: presupunerile și calculele (consum, soare, baterii, bani, planul pe 10 ani, fonduri europene). Aici se schimbă cifrele.
- `src/scene.js`: macheta 3D (three.js r149): campusul, rackul deschis, pana de curent, vederea de căldură, construcția pe etape.
- `src/app.js`: capitolele, graficele și legătura dintre cifre și machetă.
- `src/body.html`, `src/style.css`: textele și aspectul, inclusiv așezarea pentru telefon.
- `src/fonts.css`: fonturile Barlow puse în fișier, ca site-ul să arate la fel și fără internet. Se refac cu `node fonts.js`.
- `package/build/three.min.js`: biblioteca 3D, pusă și ea în fișier.
- `teste/`: scripturi Playwright care deschid site-ul pe calculator și pe telefon și fac capturi.

`node build.js` scrie în `out/`:
- `centru-date-ai-dolj.html`: un singur fișier, merge fără internet, se deschide cu dublu-click.
- `artifact.html`: varianta publicată ca pagină, cu three.js și fonturile de pe internet.

Fonturile Barlow au licența SIL Open Font License, iar three.js licența MIT.
