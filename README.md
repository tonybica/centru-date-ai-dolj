# Centrul de date AI Dolj

Site de prezentare pentru un centru de date AI în județul Dolj, cu parc fotovoltaic și baterii: machetă 3D interactivă, plan pe 10 ani, fonduri europene, calendar și riscuri.

**Deschide site-ul:** https://tonybica.github.io/centru-date-ai-dolj/

Merge pe calculator și pe telefon, fără nimic de instalat. Toate cifrele sunt estimări de pornire, făcute în noiembrie 2026; presupunerile sunt listate în ultimul capitol.

## Ce este în acest depozit

- `index.html`: site-ul întreg, într-un singur fișier. Se poate descărca și deschide și fără internet.
- `preview.jpg`, `icon-180.png`: imaginea care apare când trimiți linkul și iconița pentru ecranul telefonului.
- `sursa/`: piesele din care se construiește site-ul. Vezi `sursa/CITESTE.md`.
- `CLAUDE.md`: ce trebuie să știe Claude Code ca să continue lucrul la proiect.

## Cum se actualizează

```
cd sursa
node build.js          # scrie out/web/index.html
node preview.js        # reface preview.jpg și icon-180.png (are nevoie de Playwright)
cp out/web/* ..        # pune varianta nouă la rădăcina depozitului
```

GitHub Pages publică singur ce se află pe ramura `main`.
