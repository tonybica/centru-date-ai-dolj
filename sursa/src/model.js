/* ================= MODEL: energie si bani =================
   Totul aici sunt presupuneri de pornire, editabile. Unitati: MW, MWh, milioane EUR. */
var Model = (function () {
  'use strict';

  var MONTHS = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
  var MSHORT = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'noi', 'dec'];
  // kWh produsi de 1 kWp intr-o luna. Pornim de la zona Craiova, panouri fixe spre sud (aprox. 1.345 kWh/kWp/an)
  // si scadem 10%: la Ramnicu Valcea e ceva mai putin soare, iar panourile stau culcate pe acoperisuri,
  // jumatate pe panta dinspre nord. Rezulta aprox. 1.210 kWh/kWp/an.
  var YIELD_K = 0.90;
  var YIELD = [55, 75, 115, 135, 150, 155, 165, 160, 130, 100, 60, 45].map(function (v) { return v * YIELD_K; });
  var DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var DAYLEN = [9.2, 10.4, 11.9, 13.5, 14.8, 15.5, 15.1, 13.9, 12.4, 10.9, 9.6, 8.8];
  // ora la care soarele e cel mai sus, pe ceasul local (ora de vara din aprilie pana in octombrie)
  var NOON = [12.4, 12.4, 12.4, 13.4, 13.4, 13.4, 13.4, 13.4, 13.4, 13.4, 12.4, 12.4];
  var WEATHER = [
    { key: 'senin', label: 'Zi senină', f: 1.3, p: 0.50 },
    { key: 'nori', label: 'Zi cu nori', f: 0.9, p: 0.33 },
    { key: 'inchis', label: 'Zi închisă', f: 0.3, p: 0.17 }
  ];
  (function () { var m = 0; WEATHER.forEach(function (w) { m += w.f * w.p; }); WEATHER.forEach(function (w) { w.f /= m; }); })();

  // Site-ul prezinta o singura marime: Mediu, 1 MW, in hala libera 1 din baza. Pilot ramane doar pentru
  // comparatie (ar incapea in hala libera 2). Marimea Mare (5 MW) nu incape in baza si nu se calculeaza.
  var SCEN = {
    mediu: { key: 'mediu', name: 'Mediu', it: 1, pv: 1.2, bess: 0, hall: 'hala liberă 1', hallM2: 862 },
    pilot: { key: 'pilot', name: 'Pilot', it: 0.25, pv: 0.25, bess: 0, hall: 'hala liberă 2', hallM2: 594 }
  };
  // Baza: masuratori din satelit (eroare de circa 15%) si din harta retelei electrice. Nimic verificat pe teren.
  var BASE = {
    areaHa: 9.3, lenM: 456, widM: 200,     // perimetrul bazei
    buildings: 26, roofM2: 14700,          // cladiri si acoperisuri in total
    hallM2: 862, hallL: 46, hallW: 19,     // hala libera 1, unde intra centrul
    hall2M2: 594,                          // hala libera 2 (ar ajunge pentru Pilot)
    longHallM2: 3100,                      // toata hala lunga, din care hala 1 este un capat
    yardAHa: 0.7, yardBHa: 0.5,            // cele doua curti deschise de langa hala 1
    pvMaxMWp: 1.5, roofM2PerMWp: 6000,     // cat duc acoperisurile bune, cu tot cu cele mici
    pvDrawMWp: 1.2,                        // cat incape pe hala centrului si pe cele opt hale mari desenate cu panouri (cursorul nu trece de aici)
    gridReqMW: 1.5,                        // puterea de cerut la racordare, cu post propriu la 20 kV
    line110m: 185, st1: 'Râureni', st1km: 3.4, st2: 'Stupărei', st2km: 4.5,
    mareNeedM2: [3400, 4000]               // cat ar cere marimea Mare
  };

  // Presupuneri (valori de pornire)
  var A = {
    pue: 1.25,              // consum total / consum calculatoare
    loadFactor: 0.85,       // cat din puterea instalata se foloseste in medie
    gpuPerMW: 550,          // GPU-uri moderne la 1 MW de calculatoare
    gpuPerServer: 8,
    kwPerRack: 45,
    capexFacilityFixed: 0.5,   // mil EUR: proiectare, avize, racord minim
    capexFacilityPerMW: 7.65,  // mil EUR / MW IT: electrice, racire, UPS, generatoare si reamenajarea halei.
                               // Cu 15% sub o cladire noua (9,0), pentru ca hala exista.
    capexGpuPerMW: 30.0,       // mil EUR / MW IT: servere GPU, retea, stocare
    capexPvPerMWp: 0.60,       // mil EUR / MWp
    capexBessPerMWh: 0.25,     // mil EUR / MWh
    haPerMWp: 1.2,
    landDcHaBase: 0.4, landDcHaPerMW: 0.5,
    landDcPricePerHa: 0,       // terenul si hala sunt ale firmei: nu se cumpara nimic
    landPvPricePerHa: 0,       // panourile stau pe acoperisuri
    gridPrice: 170,            // EUR / MWh, tot inclus (energie + tarife de retea + taxe), fara TVA
    exportPrice: 40,           // EUR / MWh pentru surplusul vandut la pranz
    bessHours: 2,              // bateria se poate descarca complet in 2 ore
    bessEff: 0.88,             // randament dus-intors
    bessUsable: 0.9,
    gpuHourPrice: 3.5,         // EUR / GPU / ora, pe contract
    occupancy: 0.65,
    coloPrice: 150,            // EUR / kW / luna
    coloOccupancy: 0.85,
    gpuLifeYears: 5, facilityLifeYears: 20, pvLifeYears: 25, bessLifeYears: 15,
    householdMWh: 1.9,         // consumul anual al unei locuinte
    // planul pe 10 ani
    loanShare: 0.5,            // cat din investitie vine din credit
    interest: 0.07,            // dobanda anuala
    loanYears: 7,
    ramp: [0.5, 0.8],          // cat din ocuparea tinta se atinge in anul 1 si 2
    priceDecay: 0.08,          // cu cat scade pe an chiria unui GPU pe masura ce imbatraneste
    gpuRefreshCost: 0.8        // GPU-urile noi din anul 6 costa 80% din primele
  };

  function pvProfile(month, wx) {
    // productia orara a 1 MWp (MW), pentru 24 de ore, ora h = intervalul [h, h+1)
    var len = DAYLEN[month], noon = NOON[month], rise = noon - len / 2;
    var raw = [], sum = 0, h, t, s;
    for (h = 0; h < 24; h++) {
      t = h + 0.5; s = 0;
      if (t > rise && t < rise + len) s = Math.pow(Math.sin(Math.PI * (t - rise) / len), 1.5);
      raw.push(s); sum += s;
    }
    var daily = YIELD[month] / DAYS[month] * WEATHER[wx].f; // MWh / MWp / zi
    return raw.map(function (v) { return sum > 0 ? v / sum * daily : 0; });
  }

  function loadMW(it, a) { return it * a.pue * a.loadFactor; }

  function simulateDay(month, wx, it, pv, bess, a) {
    var prof = pvProfile(month, wx), L = loadMW(it, a);
    var cap = bess * a.bessUsable, pmax = bess / a.bessHours, eff = Math.sqrt(a.bessEff);
    var soc = cap * 0.3, d, h, out = null;
    for (d = 0; d < 4; d++) {       // cateva zile identice, ca bateria sa ajunga la un ritm stabil
      out = [];
      for (h = 0; h < 24; h++) {
        var p = prof[h] * pv, direct = Math.min(p, L), ch = 0, dis = 0, grid = 0, exp = 0;
        if (p > L) {
          ch = Math.min(p - L, pmax, (cap - soc) / eff); if (ch < 0) ch = 0;
          soc += ch * eff; exp = p - L - ch;
        } else {
          dis = Math.min(L - p, pmax, soc * eff); if (dis < 0) dis = 0;
          soc -= dis / eff; grid = L - p - dis;
        }
        out.push({ h: h, pv: p, load: L, direct: direct, charge: ch, discharge: dis, grid: grid, exp: exp, soc: cap > 0 ? soc / cap : 0 });
      }
    }
    return out;
  }

  function simulateYear(it, pv, bess, a) {
    var tot = { load: 0, pv: 0, direct: 0, batt: 0, grid: 0, exp: 0 }, months = [];
    for (var m = 0; m < 12; m++) {
      var mm = { load: 0, pv: 0, direct: 0, batt: 0, grid: 0, exp: 0 };
      for (var w = 0; w < WEATHER.length; w++) {
        var day = simulateDay(m, w, it, pv, bess, a), k = DAYS[m] * WEATHER[w].p;
        for (var h = 0; h < 24; h++) {
          var r = day[h];
          mm.load += r.load * k; mm.pv += r.pv * k; mm.direct += r.direct * k;
          mm.batt += r.discharge * k; mm.grid += r.grid * k; mm.exp += r.exp * k;
        }
      }
      months.push(mm);
      for (var key in tot) tot[key] += mm[key];
    }
    tot.months = months;
    tot.coverage = tot.load > 0 ? (tot.direct + tot.batt) / tot.load : 0;
    tot.directShare = tot.load > 0 ? tot.direct / tot.load : 0;
    tot.battShare = tot.load > 0 ? tot.batt / tot.load : 0;
    tot.gridShare = tot.load > 0 ? tot.grid / tot.load : 0;
    tot.wasteShare = tot.pv > 0 ? tot.exp / tot.pv : 0;
    return tot;
  }

  function physical(it, pv, bess, a) {
    var gpus = Math.round(it * a.gpuPerMW / 8) * 8;
    var L = loadMW(it, a);
    return {
      gpus: gpus,
      servers: Math.round(gpus / a.gpuPerServer),
      racks: Math.ceil(it * 1000 / a.kwPerRack),
      loadAvg: L, peak: it * a.pue,
      annualMWh: L * 8760,
      households: L * 8760 / a.householdMWh,
      buildingM2: 120 + 650 * it,          // suprafata de care are nevoie centrul, in hala
      roofM2: pv * BASE.roofM2PerMWp,      // acoperis bun de care au nevoie panourile
      landDcHa: 0, landPvHa: 0, landHa: 0  // nu se cumpara teren
    };
  }

  function finance(it, pv, bess, a, mode, year) {
    var ph = physical(it, pv, bess, a);
    year = year || simulateYear(it, pv, bess, a);
    var cap = {
      gpu: mode === 'cloud' ? a.capexGpuPerMW * it : 0,
      facility: a.capexFacilityFixed + a.capexFacilityPerMW * it,
      pv: a.capexPvPerMWp * pv,
      bess: a.capexBessPerMWh * bess,
      land: 0
    };
    cap.total = cap.gpu + cap.facility + cap.pv + cap.bess + cap.land;

    var rev = {}, opex = {};
    if (mode === 'cloud') {
      rev.main = ph.gpus * 8760 * a.occupancy * a.gpuHourPrice / 1e6;
      rev.energy = 0;
      opex.staff = 0.25 + 0.22 * it;
      opex.varRate = 0.08; opex.fixedOther = 0.03 * cap.gpu + (0.06 + 0.04 * it);
      opex.other = opex.fixedOther + opex.varRate * rev.main;
    } else {
      rev.main = it * 1000 * a.coloPrice * 12 * a.coloOccupancy / 1e6;
      rev.energy = year.load * a.gridPrice / 1e6;       // curentul se refactureaza clientului la pretul retelei
      opex.staff = 0.20 + 0.15 * it;
      opex.varRate = 0.06; opex.fixedOther = 0.06 + 0.04 * it;
      opex.other = opex.fixedOther + opex.varRate * rev.main;
    }
    opex.energy = (year.grid * a.gridPrice - year.exp * a.exportPrice) / 1e6;
    opex.maint = 0.025 * cap.facility + 0.015 * (cap.pv + cap.bess);
    rev.total = rev.main + rev.energy;
    opex.total = opex.energy + opex.staff + opex.maint + opex.other;
    var ebitda = rev.total - opex.total;
    var dep = cap.gpu / a.gpuLifeYears + cap.facility / a.facilityLifeYears + cap.pv / a.pvLifeYears + cap.bess / a.bessLifeYears;
    // cat economiseste soarele: energie care altfel venea din retea + surplus vandut - intretinere
    var solarSaving = ((year.direct + year.batt) * a.gridPrice + year.exp * a.exportPrice) / 1e6 - 0.015 * (cap.pv + cap.bess);
    return {
      capex: cap, rev: rev, opex: opex, ebitda: ebitda, dep: dep, profit: ebitda - dep,
      payback: ebitda > 0 ? cap.total / ebitda : Infinity,
      solarSaving: solarSaving,
      solarPayback: solarSaving > 0 ? (cap.pv + cap.bess) / solarSaving : Infinity,
      energyNoSolar: year.load * a.gridPrice / 1e6
    };
  }

  function irr(flows) {
    function npv(r) { var v = 0; for (var i = 0; i < flows.length; i++) v += flows[i] / Math.pow(1 + r, i); return v; }
    var lo = -0.95, hi = 1.5; if (npv(lo) < 0) return null; if (npv(hi) > 0) return hi;
    for (var i = 0; i < 60; i++) { var mid = (lo + hi) / 2; if (npv(mid) > 0) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }
  // Fonduri europene si ajutor de stat in judetul Valcea: stare din octombrie-noiembrie 2026, din pagini de consultanta si presa
  // (paginile oficiale nu au putut fi citite). Se confirma la sursa inainte de orice pas.
  // Concluzia cautarii: pentru proiectul asa cum este (cumparam GPU-uri si inchiriem calcul) niciun grant nu poate fi pus
  // cinstit in plan. Cifra de planificare este 0; grantul apare doar ca scenariu optimist.
  var FUNDS = {
    plan: 0,                // mil EUR: grantul pe care se sprijina planul
    intensity: 0.75,        // ajutor regional in Valcea pentru o firma mijlocie (70% pentru una mare): contributie proprie de cel putin 25%
    grantMin: 0.5, grantMax: 10,   // mil EUR: limitele apelului STEP din Programul Regional Sud-Vest Oltenia
    optimistic: [2, 6],     // mil EUR: scenariul optimist, doar cu cercetare proprie reala
    steps: [0, 3, 5, 10],   // treptele de grant aratate in pagina (aceleasi exemple ca in planul pentru banca)
    softYears: 12, softGrace: 3, softRate: 0.045   // pastrate pentru un eventual credit avantajos; acum nefolosite (soft = 0)
  };
  // lista programelor, afisata in capitolul "Fonduri europene". cls: 'open' deschis, 'wait' anuntat, 'no' nu se potriveste, 'help' ajuta fara sa fie grant
  var FUND_LIST = [
    { key: 'step', cls: 'open', name: 'Apelul STEP din Programul Regional Sud-Vest Oltenia',
      st: 'Deschis din 19 octombrie 2026 până pe 18 ianuarie 2027, ora 12. Se poate închide mai devreme dacă se strâng prea multe cereri.',
      sum: 'Grant între 0,5 și 10 milioane de euro pe proiect, dintr-un buget de 27,6 milioane pentru toată regiunea. Acoperă cel mult 75% din cheltuieli la o firmă mijlocie.',
      what: 'Se numește „Sprijin pentru dezvoltarea tehnologiilor strategice” și este gestionat de Agenția pentru Dezvoltare Regională Sud-Vest Oltenia. Vâlcea este eligibilă, iar firma îndeplinește condițiile de bază.',
      fit: 'Plătește dezvoltarea sau fabricarea unei tehnologii, nu folosirea ei. Un centru care cumpără GPU-uri și închiriază putere de calcul este folosire, deci așa cum este gândit proiectul nu se încadrează. Ar intra doar refăcut în jurul unei cercetări proprii reale, cu un partener de cercetare. Atunci suma realistă ar fi 2–6 milioane de euro.',
      href: 'https://bursafondurilor.ro/pr-sud-vest-oltenia-step/', src: 'Bursa Fondurilor' },
    { key: 'techup', cls: 'wait', name: 'TechUp România',
      st: 'Anunțat prin hotărâre de guvern în august 2026. Ghidul nu era publicat în noiembrie 2026 și nu are dată de pornire. Nu înainte de 2027.',
      sum: 'În cel mai bun caz, circa 5,9 milioane de euro.',
      what: 'Schemă națională de ajutor de stat pentru tehnologii avansate: calcul avansat, inteligență artificială, infrastructură digitală.',
      fit: 'Cere tot o cercetare proprie, dusă până la prototip. Clădirile sunt gândite ca noi, deci reamenajarea halei este îndoielnică.',
      href: 'https://rcgconsulting.ro/techup-romania-finantare-tehnologii-avansate/', src: 'RCG Consulting' },
    { key: 'pv', cls: 'no', name: 'Bani pentru panouri și baterii',
      st: 'Nicio linie deschisă pentru firme private. Apelul pentru autoconsum din Fondul pentru Modernizare s-a închis în septembrie 2025.',
      sum: 'Dacă apare un apel nou cu aceleași reguli: cel mult circa 0,5 milioane de euro pentru 1,2 MWp.',
      what: 'Fondul pentru Modernizare a plătit în trecut o parte din panourile puse de firme pentru consumul propriu.',
      fit: 'De urmărit. Suma este mică față de investiție.' },
    { key: 'fptj', cls: 'no', name: 'Fondul de Participare Tranziție Justă',
      st: 'Nu se aplică: este doar pentru Gorj, Hunedoara, Dolj, Galați, Prahova și Mureș.',
      sum: 'În planul pentru Dolj aducea un grant de 5 milioane de euro.',
      what: 'Credit și grant la un loc, pentru județele care renunță la cărbune.',
      fit: 'Pierdut prin mutarea în bază.' },
    { key: 'tax', cls: 'help', name: 'Scutirea impozitului pe profitul reinvestit',
      st: 'În vigoare.',
      sum: 'Economia este 16% din profitul reinvestit, cel mult cât impozitul datorat.',
      what: 'Profitul firmei folosit pentru echipamente noi nu se mai impozitează.',
      fit: 'Nu este grant, dar ajută în anul în care se pun calculatoarele în funcțiune. Se calculează cu contabilul.' },
    { key: 'guar', cls: 'help', name: 'Garanții pentru credit',
      st: 'Garanția Băncii de Investiții și Dezvoltare acoperă până la 70% din credit în Vâlcea. Garanția europeană InvestEU prin bănci partenere nu era încă pornită în septembrie 2026.',
      sum: 'Nu aduc bani nerambursabili.',
      what: 'Statul sau Uniunea Europeană garantează o parte din credit, iar banca cere mai puține garanții de la firmă.',
      fit: 'Ușurează creditul, nu micșorează investiția.' }
  ];
  // G = grantul ales, in mil EUR. Intoarce cat se poate lua de fapt.
  function funding(G, f) {
    var c = f.capex, F = FUNDS, elig = c.gpu + c.facility + c.pv + c.bess;
    var out = { key: G > 0 ? 'grant' : 'none', want: +G || 0, soft: 0, elig: elig };
    out.byIntensity = F.intensity * elig;                 // cat ar permite regula de ajutor regional
    out.max = Math.min(F.grantMax, out.byIntensity);      // cat permite apelul
    out.grant = Math.max(0, Math.min(out.want, out.max));
    out.share = elig > 0 ? out.grant / elig : 0;
    return out;
  }
  // Calculul facut pentru banca (alt model, mai strict: contracte ferme pe 3 ani pentru 70% din capacitate,
  // credit pentru echipamente pe 3 ani, credit pentru infrastructura pe 10 ani cu 1 an de gratie, dobanda 7%,
  // bani proprii 35% din ce ramane dupa grant). Cifre fixe, preluate din evaluarea bazei (2026-11-26), in mil EUR.
  // DSCR = de cate ori acopera banii castigati rata la banca, in anul cel mai greu (anul 2).
  var BANK = {
    need: 42.8, capex: 38.87, contingency: 1.94, dscrTarget: 1.30, grantForTarget: 6.5,
    rows: [
      { grant: 0, equity: 14.97, loan: 27.80, dscr: 1.12, irr: 0.090, back: 8.5 },
      { grant: 3, equity: 13.90, loan: 25.81, dscr: 1.20, irr: 0.123, back: 7.8 },
      { grant: 5, equity: 13.18, loan: 24.48, dscr: 1.25, irr: 0.148, back: 7.1 },
      { grant: 10, equity: 11.39, loan: 21.15, dscr: 1.43, irr: 0.228, back: 3.5 }
    ],
    // cum se ajunge la pragul de 1,30 fara grant
    levers: [
      { name: 'Bani proprii 43,9% în loc de 35%', equity: 18.72, loan: 23.92, dscr: '1,30' },
      { name: 'Contracte ferme pentru 80%, 90% sau 100% din capacitate, pe 3 ani', equity: 14.97, loan: 27.80, dscr: '1,19 · 1,25 · 1,31' },
      { name: 'Contracte pentru 70% pe 4 ani și creditul pentru echipamente tot pe 4 ani', equity: 14.97, loan: 27.80, dscr: '1,38' },
      { name: 'Contracte pentru 70% pe 5 ani și creditul pentru echipamente tot pe 5 ani', equity: 14.97, loan: 27.80, dscr: '1,60' }
    ],
    // ce se intampla cand merge mai prost sau mai bine, fara grant
    sens: [
      { name: 'Fără contracte ferme (cazul prudent)', dscr: 0.67 },
      { name: 'Preț de 3,0 € pe GPU pe oră', dscr: 0.95 },
      { name: 'Piața de azi: 4,5 € și 75% ocupare', dscr: 1.52 }
    ],
    firmContractsGpu: 386, firmContractsShare: 0.70, firmRevenue: 11.85, // contracte ferme pe 3 ani
    rev1: 13.83, rev3: 14.76, ebitda1: 9.89, ebitda3: 10.56,
    refreshYear: 6, refreshCost: 24.0, refreshFromCash: 8.4,
    dolj: { capex: 43.11, grant: 5, equity: 14.73, loan: 27.36, dscr: 1.23 }
  };
  function annuity(p, r, n) { return p > 0 && n > 0 ? (r > 0 ? p * r / (1 - Math.pow(1 + r, -n)) : p / n) : 0; }
  // zece ani: crestere treptata, credit, fonduri, GPU-uri inlocuite in anul 6
  function tenYear(it, pv, bess, a, mode, year, fund) {
    var f = finance(it, pv, bess, a, mode, year), c = f.capex, F = FUNDS;
    fund = fund || { grant: 0, soft: 0 };
    var grant = Math.min(fund.grant || 0, c.total), soft = Math.min(fund.soft || 0, c.total - grant);
    var rest = Math.max(0, c.total - grant - soft), loan = a.loanShare * rest, equity = rest - loan;
    var n = a.loanYears, ann = annuity(loan, a.interest, n);
    var sN = F.softYears - F.softGrace, sAnn = annuity(soft, F.softRate, sN);
    var refreshCost = mode === 'cloud' ? a.gpuRefreshCost * c.gpu : 0, rLoan = a.loanShare * refreshCost, rAnn = annuity(rLoan, a.interest, a.gpuLifeYears);
    var rows = [{ y: 0, cash: -equity, cum: -equity }], cum = -equity, fl = [-equity], pf2 = [-(c.total - grant)], be = null, low = -equity;
    for (var y = 1; y <= 10; y++) {
      var ramp = y <= a.ramp.length ? a.ramp[y - 1] : 1;
      var age = mode === 'cloud' ? (y - 1) % a.gpuLifeYears : 0, pf = mode === 'cloud' ? Math.pow(1 - a.priceDecay, age) : 1;
      var main = f.rev.main * ramp * pf, es = 0.35 + 0.65 * ramp, rev = main + f.rev.energy * es;
      var opex = f.opex.energy * es + f.opex.staff + f.opex.maint + f.opex.fixedOther + f.opex.varRate * main;
      var ebitda = rev - opex, debt = y <= n ? ann : 0;
      if (soft > 0) debt += y <= F.softGrace ? soft * F.softRate : (y <= F.softYears ? sAnn : 0);
      var isRefresh = refreshCost > 0 && y > 1 && (y - 1) % a.gpuLifeYears === 0;
      if (refreshCost > 0 && y > a.gpuLifeYears) debt += rAnn;
      var refresh = isRefresh ? refreshCost - rLoan : 0;
      var cash = ebitda - debt - refresh; cum += cash; if (cum < low) low = cum;
      if (cum < 0) be = null; else if (be === null) be = y;
      rows.push({ y: y, ramp: ramp, pf: pf, rev: rev, opex: opex, ebitda: ebitda, debt: debt, refresh: refresh, cash: cash, cum: cum });
      fl.push(cash); pf2.push(ebitda - (isRefresh ? refreshCost : 0));
    }
    // ce mai valoreaza activele dupa 10 ani, minus creditul ramas
    var softLeft = soft > 0 ? sAnn * (1 - Math.pow(1 + F.softRate, -(F.softYears - 10))) / F.softRate : 0;
    var gross = 0.5 * c.facility + 0.6 * c.pv + 0.3 * c.bess + c.land + 0.1 * refreshCost, residual = gross - softLeft;
    fl[10] += residual; pf2[10] += gross;
    return { rows: rows, equity: equity, loan: loan, grant: grant, soft: soft, annuity: ann, breakeven: be, low: low, residual: residual, irr: irr(fl), irrP: irr(pf2), fin: f, refreshCost: refreshCost };
  }
  function sensitivity(it, pv, bess, a, mode, year) {
    var rv = mode === 'cloud' ? [2.5, 3.5, 4.5, 6] : [100, 150, 200, 250], cv = mode === 'cloud' ? [0.5, 0.65, 0.8, 0.9] : [0.6, 0.75, 0.85, 0.95], cells = [];
    rv.forEach(function (pr) {
      var row = [];
      cv.forEach(function (oc) {
        var b = {}; for (var k in a) b[k] = a[k];
        if (mode === 'cloud') { b.gpuHourPrice = pr; b.occupancy = oc; } else { b.coloPrice = pr; b.coloOccupancy = oc; }
        row.push(finance(it, pv, bess, b, mode, year).profit);
      });
      cells.push(row);
    });
    return { rows: rv, cols: cv, cells: cells };
  }
  // cat costa o unitate vanduta: o ora de GPU (cloud) sau un kW pe luna (colocare)
  function unitCost(it, pv, bess, a, mode, year) {
    var f = finance(it, pv, bess, a, mode, year), ph = physical(it, pv, bess, a), c = f.capex;
    var sold = mode === 'cloud' ? ph.gpus * 8760 * a.occupancy : it * 1000 * 12 * a.coloOccupancy, k = 1e6 / sold;
    var energyNet = f.opex.energy - f.rev.energy;
    var parts = [];
    if (mode === 'cloud') parts.push(['Uzura calculatoarelor', c.gpu / a.gpuLifeYears * k]);
    parts.push(['Uzura halei, a instalațiilor și a panourilor', (f.dep - c.gpu / a.gpuLifeYears) * k]);
    parts.push([mode === 'cloud' ? 'Curent' : 'Curent, după ce plătește clientul', energyNet * k]);
    parts.push(['Oameni', f.opex.staff * k]);
    parts.push(['Mentenanță, licențe, vânzări', (f.opex.maint + f.opex.other) * k]);
    var total = 0; parts.forEach(function (p) { total += p[1]; });
    return { parts: parts, total: total, price: mode === 'cloud' ? a.gpuHourPrice : a.coloPrice, unit: mode === 'cloud' ? 'oră de GPU' : 'kW pe lună' };
  }

  // pozitia soarelui (Ramnicu Valcea, 45,05 grade nord): inaltime si azimut fata de sud, in radiani
  function sunPos(month, hour) {
    var doy = [15, 46, 75, 105, 135, 166, 196, 227, 258, 288, 319, 349][month];
    var dec = -23.44 * Math.PI / 180 * Math.cos(2 * Math.PI * (doy + 10) / 365);
    var lat = 45.05 * Math.PI / 180, H = (hour - NOON[month]) * 15 * Math.PI / 180;
    var sinEl = Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(H);
    var el = Math.asin(Math.max(-1, Math.min(1, sinEl)));
    var az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(lat) - Math.tan(dec) * Math.cos(lat));
    return { el: el, az: az };
  }

  return {
    MONTHS: MONTHS, MSHORT: MSHORT, YIELD: YIELD, DAYS: DAYS, WEATHER: WEATHER, SCEN: SCEN, A: A, BASE: BASE, BANK: BANK, FUND_LIST: FUND_LIST,
    pvProfile: pvProfile, loadMW: loadMW, simulateDay: simulateDay, simulateYear: simulateYear,
    physical: physical, finance: finance, sunPos: sunPos, tenYear: tenYear, sensitivity: sensitivity, unitCost: unitCost, funding: funding, FUNDS: FUNDS
  };
})();
if (typeof module !== 'undefined') module.exports = Model;
