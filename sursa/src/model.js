/* ================= MODEL: energie si bani =================
   Totul aici sunt presupuneri de pornire, editabile. Unitati: MW, MWh, milioane EUR. */
var Model = (function () {
  'use strict';

  var MONTHS = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
  var MSHORT = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'noi', 'dec'];
  // kWh produsi de 1 kWp intr-o luna, zona Craiova, panouri fixe orientate sud (aprox. 1.345 kWh/kWp/an)
  var YIELD = [55, 75, 115, 135, 150, 155, 165, 160, 130, 100, 60, 45];
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

  var SCEN = {
    pilot: { key: 'pilot', name: 'Pilot', it: 0.25, pv: 1, bess: 1 },
    mediu: { key: 'mediu', name: 'Mediu', it: 1, pv: 4, bess: 4 },
    mare: { key: 'mare', name: 'Mare', it: 5, pv: 20, bess: 20 }
  };

  // Presupuneri (valori de pornire)
  var A = {
    pue: 1.25,              // consum total / consum calculatoare
    loadFactor: 0.85,       // cat din puterea instalata se foloseste in medie
    gpuPerMW: 550,          // GPU-uri moderne la 1 MW de calculatoare
    gpuPerServer: 8,
    kwPerRack: 45,
    capexFacilityFixed: 0.5,   // mil EUR: proiectare, avize, racord minim
    capexFacilityPerMW: 9.0,   // mil EUR / MW IT: cladire, electrice, racire, UPS, generatoare
    capexGpuPerMW: 30.0,       // mil EUR / MW IT: servere GPU, retea, stocare
    capexPvPerMWp: 0.60,       // mil EUR / MWp
    capexBessPerMWh: 0.25,     // mil EUR / MWh
    haPerMWp: 1.2,
    landDcHaBase: 0.4, landDcHaPerMW: 0.5,
    landDcPricePerHa: 0.15,    // mil EUR / ha (teren industrial, ~15 EUR/mp)
    landPvPricePerHa: 0.015,   // mil EUR / ha (teren pentru panouri, ~1,5 EUR/mp)
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
      buildingM2: 120 + 650 * it,
      landDcHa: a.landDcHaBase + a.landDcHaPerMW * it,
      landPvHa: pv * a.haPerMWp,
      landHa: a.landDcHaBase + a.landDcHaPerMW * it + pv * a.haPerMWp
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
      land: ph.landDcHa * a.landDcPricePerHa + ph.landPvHa * a.landPvPricePerHa
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
  // fonduri europene si ajutor de stat: valori orientative, noiembrie 2026 (de verificat in ghidul fiecarui apel)
  var FUNDS = {
    immIntensity: 0.70,   // ajutor regional pentru IMM in Dolj: pana la 70% (mijlocii) sau 75% (mici) din costurile eligibile
    immCap: 1.5,          // mil EUR pe proiect in apelul regional pentru IMM (0,2 - 1,5 mil.)
    fptjMaxInv: 10,       // mil EUR: investitia maxima pentru IMM in Fondul de Participare Tranzitie Justa (50 la firme mari)
    fptjShare: 0.75,      // presupunere: fondul finanteaza cel mult 75% din investitie, restul sunt bani proprii sau credit obisnuit
    fptjGrant: 0.5,       // pana la 50% din finantare se transforma in grant
    fptjYears: 12, fptjGrace: 3, fptjRate: 0.045,
    bessPerMWh: 0.069, bessCap: 15, bessMinMW: 1
  };
  function funding(key, f, bess, a) {
    var c = f.capex, F = FUNDS, elig = c.gpu + c.facility + c.pv + c.bess;
    var out = { key: key, grant: 0, soft: 0, elig: elig };
    out.immPossible = Math.min(F.immCap, F.immIntensity * elig);
    out.fptjFin = Math.min(F.fptjMaxInv, F.fptjShare * elig);
    out.fptjPossible = F.fptjGrant * out.fptjFin;
    out.bessPossible = (bess > 0 && bess / a.bessHours >= F.bessMinMW - 1e-9) ? Math.min(F.bessCap, F.bessPerMWh * bess, c.bess) : 0;
    if (key === 'imm') out.grant = out.immPossible;
    else if (key === 'fptj') { out.grant = out.fptjPossible; out.soft = out.fptjFin - out.grant; }
    return out;
  }
  function annuity(p, r, n) { return p > 0 && n > 0 ? (r > 0 ? p * r / (1 - Math.pow(1 + r, -n)) : p / n) : 0; }
  // zece ani: crestere treptata, credit, fonduri, GPU-uri inlocuite in anul 6
  function tenYear(it, pv, bess, a, mode, year, fund) {
    var f = finance(it, pv, bess, a, mode, year), c = f.capex, F = FUNDS;
    fund = fund || { grant: 0, soft: 0 };
    var grant = Math.min(fund.grant || 0, c.total), soft = Math.min(fund.soft || 0, c.total - grant);
    var rest = Math.max(0, c.total - grant - soft), loan = a.loanShare * rest, equity = rest - loan;
    var n = a.loanYears, ann = annuity(loan, a.interest, n);
    var sN = F.fptjYears - F.fptjGrace, sAnn = annuity(soft, F.fptjRate, sN);
    var refreshCost = mode === 'cloud' ? a.gpuRefreshCost * c.gpu : 0, rLoan = a.loanShare * refreshCost, rAnn = annuity(rLoan, a.interest, a.gpuLifeYears);
    var rows = [{ y: 0, cash: -equity, cum: -equity }], cum = -equity, fl = [-equity], pf2 = [-(c.total - grant)], be = null, low = -equity;
    for (var y = 1; y <= 10; y++) {
      var ramp = y <= a.ramp.length ? a.ramp[y - 1] : 1;
      var age = mode === 'cloud' ? (y - 1) % a.gpuLifeYears : 0, pf = mode === 'cloud' ? Math.pow(1 - a.priceDecay, age) : 1;
      var main = f.rev.main * ramp * pf, es = 0.35 + 0.65 * ramp, rev = main + f.rev.energy * es;
      var opex = f.opex.energy * es + f.opex.staff + f.opex.maint + f.opex.fixedOther + f.opex.varRate * main;
      var ebitda = rev - opex, debt = y <= n ? ann : 0;
      if (soft > 0) debt += y <= F.fptjGrace ? soft * F.fptjRate : (y <= F.fptjYears ? sAnn : 0);
      var isRefresh = refreshCost > 0 && y > 1 && (y - 1) % a.gpuLifeYears === 0;
      if (refreshCost > 0 && y > a.gpuLifeYears) debt += rAnn;
      var refresh = isRefresh ? refreshCost - rLoan : 0;
      var cash = ebitda - debt - refresh; cum += cash; if (cum < low) low = cum;
      if (cum < 0) be = null; else if (be === null) be = y;
      rows.push({ y: y, ramp: ramp, pf: pf, rev: rev, opex: opex, ebitda: ebitda, debt: debt, refresh: refresh, cash: cash, cum: cum });
      fl.push(cash); pf2.push(ebitda - (isRefresh ? refreshCost : 0));
    }
    // ce mai valoreaza activele dupa 10 ani, minus creditul ramas
    var softLeft = soft > 0 ? sAnn * (1 - Math.pow(1 + F.fptjRate, -(F.fptjYears - 10))) / F.fptjRate : 0;
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
    parts.push(['Uzura clădirii, panourilor și bateriilor', (f.dep - c.gpu / a.gpuLifeYears) * k]);
    parts.push([mode === 'cloud' ? 'Curent' : 'Curent, după ce plătește clientul', energyNet * k]);
    parts.push(['Oameni', f.opex.staff * k]);
    parts.push(['Mentenanță, licențe, vânzări', (f.opex.maint + f.opex.other) * k]);
    var total = 0; parts.forEach(function (p) { total += p[1]; });
    return { parts: parts, total: total, price: mode === 'cloud' ? a.gpuHourPrice : a.coloPrice, unit: mode === 'cloud' ? 'oră de GPU' : 'kW pe lună' };
  }

  // pozitia soarelui (Craiova, 44,3 grade nord): inaltime si azimut fata de sud, in radiani
  function sunPos(month, hour) {
    var doy = [15, 46, 75, 105, 135, 166, 196, 227, 258, 288, 319, 349][month];
    var dec = -23.44 * Math.PI / 180 * Math.cos(2 * Math.PI * (doy + 10) / 365);
    var lat = 44.3 * Math.PI / 180, H = (hour - NOON[month]) * 15 * Math.PI / 180;
    var sinEl = Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(H);
    var el = Math.asin(Math.max(-1, Math.min(1, sinEl)));
    var az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(lat) - Math.tan(dec) * Math.cos(lat));
    return { el: el, az: az };
  }

  return {
    MONTHS: MONTHS, MSHORT: MSHORT, YIELD: YIELD, DAYS: DAYS, WEATHER: WEATHER, SCEN: SCEN, A: A,
    pvProfile: pvProfile, loadMW: loadMW, simulateDay: simulateDay, simulateYear: simulateYear,
    physical: physical, finance: finance, sunPos: sunPos, tenYear: tenYear, sensitivity: sensitivity, unitCost: unitCost, funding: funding, FUNDS: FUNDS
  };
})();
if (typeof module !== 'undefined') module.exports = Model;
