/* ================= APLICATIA: capitole, cifre, grafice, legatura cu macheta ================= */
(function () {
  'use strict';
  var M = Model, A = M.A, FU = M.FUNDS;
  function $(id) { return document.getElementById(id); }
  var st = { scen: 'mediu', it: 1, pv: 4, bess: 4, hour: 13, month: 6, wx: 1, mode: 'cloud', ch: 0, playing: false, fund: 'fptj', outage: 0, rack: false, thermal: false, buildM: null, building: false };
  var cache = { key: '', days: {} };
  var chapters = [].slice.call(document.querySelectorAll('.chapter'));
  var has3d = false;
  function chIndex(title) { for (var i = 0; i < chapters.length; i++) if (chapters[i].getAttribute('data-title') === title) return i; return 0; }

  /* ---------- formatare romaneasca ---------- */
  function num(x, d) {
    var s = Math.abs(x).toFixed(d || 0).split('.');
    s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (x < 0 && +Math.abs(x).toFixed(d || 0) !== 0 ? '−' : '') + s.join(',');
  }
  function trim(s) { return s.indexOf(',') < 0 ? s : s.replace(/0+$/, '').replace(/,$/, ''); }
  function mw(x) { return x < 0.9995 ? num(x * 1000, 0) + ' kW' : trim(num(x, x < 10 ? 2 : 1)) + ' MW'; }
  function mil(x) { var a = Math.abs(x); return trim(num(x, a >= 100 ? 0 : a >= 10 ? 1 : 2)) + ' mil. €'; }
  function pct(x) { return num(x * 100, 0) + '%'; }
  function years(x) { return isFinite(x) ? trim(num(x, x < 10 ? 1 : 0)) + ' ani' : 'niciodată'; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function eur(x) { return trim(num(x, Math.abs(x) < 10 ? 2 : 0)) + ' €'; }

  /* ---------- trei feluri in care poate merge piata ---------- */
  var CASES = {
    cloud: [{ k: 'prudent', name: 'Prudent', p: 3.5, o: 0.65 }, { k: 'piata', name: 'Piața de azi', p: 4.5, o: 0.75 }, { k: 'bun', name: 'Bun', p: 5.5, o: 0.85 }],
    colo: [{ k: 'prudent', name: 'Prudent', p: 130, o: 0.75 }, { k: 'piata', name: 'Piața de azi', p: 150, o: 0.85 }, { k: 'bun', name: 'Bun', p: 180, o: 0.95 }]
  };
  var FUND_NAME = { none: 'fără fonduri', imm: 'grantul pentru IMM', fptj: 'Fondul de Participare Tranziție Justă' };
  function getPO(mode) { return mode === 'cloud' ? { p: A.gpuHourPrice, o: A.occupancy } : { p: A.coloPrice, o: A.coloOccupancy }; }
  function setPO(mode, p, o) { if (mode === 'cloud') { A.gpuHourPrice = p; A.occupancy = o; } else { A.coloPrice = p; A.coloOccupancy = o; } }
  function withPO(mode, p, o, fn) { var old = getPO(mode); setPO(mode, p, o); try { return fn(); } finally { setPO(mode, old.p, old.o); } }
  function curCase() { var c = getPO(st.mode), L = CASES[st.mode]; for (var i = 0; i < L.length; i++) if (Math.abs(L[i].p - c.p) < 1e-6 && Math.abs(L[i].o - c.o) < 1e-6) return L[i].k; return null; }
  function caseText(mode, c) { return mode === 'cloud' ? trim(num(c.p, 1)) + ' € pe oră, ' + pct(c.o) + ' ocupare' : num(c.p) + ' € pe kW, ' + pct(c.o) + ' ocupare'; }
  var scenYears = {};
  function scenYear(k) { var s = M.SCEN[k]; if (!scenYears[k]) scenYears[k] = M.simulateYear(s.it, s.pv, s.bess, A); return scenYears[k]; }
  function tenOf(it, pv, bess, mode, year, fundKey) {
    var f = M.finance(it, pv, bess, A, mode, year), fu = M.funding(fundKey, f, bess, A);
    var t = M.tenYear(it, pv, bess, A, mode, year, fu); t.fund = fu; return t;
  }
  function breakTxt(t) { return t.breakeven ? 'în anul ' + t.breakeven : 'nu în 10 ani'; }
  function backCell(t) { return t.breakeven ? 'în anul ' + t.breakeven : 'nu'; }
  function backSent(t) { return t.breakeven ? 'banii se întorc în anul ' + t.breakeven : 'banii nu se întorc în 10 ani'; }

  /* ---------- calcule ---------- */
  function calc() {
    var key = [st.it, st.pv, st.bess].join('|');
    if (cache.key !== key) {
      cache.key = key; cache.days = {};
      cache.year = M.simulateYear(st.it, st.pv, st.bess, A);
      cache.ph = M.physical(st.it, st.pv, st.bess, A);
    }
    var dk = st.month + '|' + st.wx;
    if (!cache.days[dk]) cache.days[dk] = M.simulateDay(st.month, st.wx, st.it, st.pv, st.bess, A);
    cache.day = cache.days[dk];
    cache.cloud = M.finance(st.it, st.pv, st.bess, A, 'cloud', cache.year);
    cache.colo = M.finance(st.it, st.pv, st.bess, A, 'colo', cache.year);
    cache.fin = st.mode === 'cloud' ? cache.cloud : cache.colo;
    cache.ten = tenOf(st.it, st.pv, st.bess, st.mode, cache.year, st.fund);
    cache.ten0 = st.fund === 'none' ? cache.ten : tenOf(st.it, st.pv, st.bess, st.mode, cache.year, 'none');
    cache.unit = M.unitCost(st.it, st.pv, st.bess, A, st.mode, cache.year);
  }

  var GRID_NOTE = {
    pilot: 'La mărimea Pilot ajunge un racord de medie tensiune (20 kV), ca la o fabrică mică.',
    mediu: 'La 1 MW este nevoie de un racord de medie tensiune (20 kV) cu post de transformare propriu.',
    mare: 'La 5 MW se discută un racord dedicat de medie tensiune sau o stație proprie de 110 kV, în funcție de ce capacitate are rețeaua din zonă.'
  };
  var MODE_DESC = {
    cloud: '<b>Cloud GPU.</b> Cumpărăm noi calculatoarele și le închiriem cu ora sau pe contract. Investiție mare, venit mare, risc mare: GPU-urile se demodează în 4–6 ani.',
    colo: '<b>Colocare.</b> Clientul vine cu calculatoarele lui. Noi îi închiriem spațiu, curent și răcire. Investiția este de peste trei ori mai mică, venitul este stabil, iar câștigul mai mic.'
  };
  var CAL_TOTAL = { pilot: 22, mediu: 27, mare: 34 };

  function values() {
    var ph = cache.ph, y = cache.year, f = cache.fin, v = {}, cloud = st.mode === 'cloud';
    v.it = mw(st.it); v.gpus = num(ph.gpus); v.servers = num(ph.servers); v.racks = num(ph.racks);
    v.buildingM2 = num(Math.round(ph.buildingM2 / 10) * 10); v.scenName = M.SCEN[st.scen].name;
    v.loadAvg = mw(ph.loadAvg); v.annualMWh = num(Math.round(ph.annualMWh / 100) * 100); v.households = num(Math.round(ph.households / 100) * 100);
    v.gridNote = GRID_NOTE[st.scen]; v.heat = mw(st.it); v.overhead = mw(st.it * (A.pue - 1));
    v.landHa = trim(num(ph.landHa, 1)); v.pvHa = trim(num(ph.landPvHa, 1));
    v.coverage = pct(y.coverage); v.wasteShare = pct(y.wasteShare); v.pvGen = num(Math.round(y.pv / 10) * 10);
    v.pvFull = trim(num(ph.annualMWh / 1345, 1)) + ' MW de panouri';
    v.directShare = pct(y.directShare); v.battShare = pct(y.battShare); v.gridShare = pct(1 - y.directShare - y.battShare);
    v.nightMWh = num(Math.round(ph.loadAvg * 15.2 * 2) / 2, ph.loadAvg < 0.5 ? 1 : 0);
    v.monthName = M.MONTHS[st.month]; v.wxName = M.WEATHER[st.wx].label.toLowerCase();
    v.capexCloud = mil(cache.cloud.capex.total); v.capexColo = mil(cache.colo.capex.total); v.capexTotal = mil(f.capex.total);
    v.modeDesc = MODE_DESC[st.mode]; v.modeName = cloud ? 'Cloud GPU' : 'Colocare'; v.calTotal = CAL_TOTAL[st.scen];
    if (f.ebitda <= 0) v.paybackLine = 'La aceste cifre, veniturile nu acoperă nici cheltuielile de funcționare.';
    else if (f.profit <= 0) v.paybackLine = 'La aceste cifre, banii rămași nu acoperă uzura echipamentelor. Proiectul ar pierde aproximativ <b>' + mil(-f.profit) + ' pe an</b>.';
    else v.paybackLine = 'La aceste cifre proiectul rămâne pe plus și după ce punem deoparte bani pentru înlocuirea echipamentelor. Capitolul „Zece ani” arată când se întorc banii, cu tot cu credit și fonduri.';
    if (st.pv > 0) v.solarLine = 'Panourile și bateriile reduc costul curentului cu aproximativ <b>' + mil(f.solarSaving) + ' pe an</b>. Fără ele, curentul ar costa ' + mil(f.energyNoSolar) + ' pe an. Investiția în ele (' + mil(f.capex.pv + f.capex.bess) + ') se plătește singură în circa ' + years(f.solarPayback) + '.';
    else v.solarLine = 'Fără panouri, tot curentul vine din rețea și costă aproximativ <b>' + mil(f.energyNoSolar) + ' pe an</b>.';
    // cat costa o unitate vanduta
    var u = cache.unit, left = u.price - u.total;
    v.unitTitle = cloud ? 'Cât ne costă o oră de GPU' : 'Cât ne costă un kW închiriat, pe lună';
    v.unitLine = (cloud ? 'O oră de GPU vândută ne costă' : 'Un kW închiriat ne costă pe lună') + ' aproximativ <b>' + eur(u.total) + '</b> și se vinde cu <b>' + eur(u.price) + '</b>. ' +
      (left >= 0 ? 'Rămân ' + eur(left) + ' la fiecare ' + u.unit + '.' : 'Pierdem ' + eur(-left) + ' la fiecare ' + u.unit + '.');
    // zece ani
    var t = cache.ten, t0 = cache.ten0, last = t.rows[10].cum;
    v.tenIntro = cloud ? 'GPU-urile se înlocuiesc după cinci ani.' : 'spațiul se umple cu clienți abia din al treilea an.';
    v.tenEquity = mil(t.equity); v.tenGrant = t.grant > 0.0005 ? mil(t.grant) : 'nimic';
    v.tenGrantSub = st.fund === 'none' ? 'nicio cerere depusă' : st.fund === 'imm' ? 'grant, cel mult ' + mil(FU.immCap) : 'plus ' + mil(t.soft) + ' credit avantajos';
    v.tenBreak = breakTxt(t); v.tenCum = mil(last);
    var po = getPO(st.mode), at = (cloud ? trim(num(po.p, 1)) + ' € pe oră' : num(po.p) + ' € pe kW') + ' și ' + pct(po.o) + ' ocupare';
    v.caseNow = 'Calcul la valorile alese acum: ' + at + '.';
    if (st.fund === 'none') v.tenLine = 'La ' + at + ', fără fonduri: sunt necesari <b>' + mil(t.equity) + '</b> bani proprii și un credit de ' + mil(t.loan) + '. ' + cap(backSent(t)) + '.';
    else v.tenLine = 'La ' + at + ', cu ' + FUND_NAME[st.fund] + ': sunt necesari <b>' + mil(t.equity) + '</b> bani proprii, în loc de ' + mil(t0.equity) + '. ' +
      (!t.breakeven ? 'La aceste prețuri banii nu se întorc în 10 ani, cu sau fără fonduri.' : !t0.breakeven ? '<b>Banii se întorc în anul ' + t.breakeven + '.</b> Fără fonduri nu s-ar întoarce în 10 ani.'
        : t0.breakeven === t.breakeven ? '<b>Banii se întorc în anul ' + t.breakeven + '</b>, la fel ca fără fonduri, dar cu mai puțini bani proprii puși în joc.' : '<b>Banii se întorc în anul ' + t.breakeven + '</b>, față de anul ' + t0.breakeven + ' fără fonduri.');
    var res = CASES[st.mode].map(function (c) { return withPO(st.mode, c.p, c.o, function () { return { c: c, t: tenOf(st.it, st.pv, st.bess, st.mode, cache.year, st.fund) }; }); });
    v.tenNote = (cloud ? '<b>GPU-uri proprii, mărimea ' : '<b>Colocare, mărimea ') + M.SCEN[st.scen].name + '.</b> ' + res.map(function (r) { return r.c.name + ': ' + backSent(r.t) + '.'; }).join(' ') +
      (cloud ? ' Totul atârnă de preț și de cât de pline sunt calculatoarele. De aceea primul contract semnat valorează mai mult decât orice grant.' : ' Colocarea aduce mai puțin, dar depinde mai puțin de prețul GPU-urilor.');
    v.fundLine = st.fund === 'none' ? 'Fără fonduri, la mărimea ' + M.SCEN[st.scen].name + ' trebuie aduși <b>' + mil(t.equity) + '</b> bani proprii și un credit de ' + mil(t.loan) + '.'
      : 'Cu ' + FUND_NAME[st.fund] + ', la mărimea ' + M.SCEN[st.scen].name + ': grant de <b>' + mil(t.grant) + '</b>' + (t.soft > 0 ? ' și credit avantajos de ' + mil(t.soft) : '') + '. Banii proprii scad de la ' + mil(t0.equity) + ' la <b>' + mil(t.equity) + '</b>, iar creditul obișnuit de la ' + mil(t0.loan) + ' la ' + mil(t.loan) + '.';
    return v;
  }
  var HTML_KEYS = { modeDesc: 1, paybackLine: 1, solarLine: 1, unitLine: 1, tenLine: 1, tenNote: 1, fundLine: 1 };
  function fill() {
    var v = values();
    [].forEach.call(document.querySelectorAll('[data-v]'), function (el) {
      var k = el.getAttribute('data-v'); if (v[k] === undefined) return;
      if (HTML_KEYS[k]) el.innerHTML = v[k]; else el.textContent = v[k];
    });
  }

  /* ---------- grafice ---------- */
  var tip = $('tip');
  function showTip(html, x, y) {
    tip.innerHTML = html; tip.hidden = false;
    var w = tip.offsetWidth, h = tip.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
    tip.style.left = Math.max(8, Math.min(vw - w - 8, x + 14)) + 'px';
    tip.style.top = Math.max(8, Math.min(vh - h - 8, y + 14)) + 'px';
  }
  function hideTip() { tip.hidden = true; }
  function niceStep(max) {
    var raw = max / 4, p = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10)), n = raw / p;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
  }
  function topRound(x, y, w, h, r) {
    r = Math.min(r, w / 2, h);
    return 'M' + x + ' ' + (y + h) + 'V' + (y + r) + 'Q' + x + ' ' + y + ' ' + (x + r) + ' ' + y + 'H' + (x + w - r) + 'Q' + (x + w) + ' ' + y + ' ' + (x + w) + ' ' + (y + r) + 'V' + (y + h) + 'Z';
  }
  function stackCol(x, w, base, scale, segs) {       // coloana stivuita cu spatiu de 2px intre segmente
    var out = '', y0 = base, live = segs.filter(function (s) { return s.v * scale >= 1.5; });
    live.forEach(function (s, i) {
      var h = s.v * scale, top = y0 - h + (i < live.length - 1 ? 1 : 0), bot = y0 - (i > 0 ? 1 : 0), last = i === live.length - 1;
      if (bot - top > 0.5) out += last ? '<path d="' + topRound(x, top, w, bot - top, 4) + '" fill="var(--' + s.c + ')"/>' : '<rect x="' + x + '" y="' + top.toFixed(1) + '" width="' + w + '" height="' + (bot - top).toFixed(1) + '" fill="var(--' + s.c + ')"/>';
      y0 -= h;
    });
    return out;
  }

  function drawDay() {
    var day = cache.day, host = $('c-day');
    var W = 420, H = 222, ml = 34, mr = 6, mt = 26, mb = 22, pw = W - ml - mr, ph = H - mt - mb, base = mt + ph;
    var maxv = 0; day.forEach(function (r) { maxv = Math.max(maxv, r.pv, r.load); });
    var u = maxv < 1 ? 1000 : 1, un = maxv < 1 ? 'kW' : 'MW', step = niceStep(maxv * u * 1.08), top = Math.ceil(maxv * u * 1.08 / step) * step, sc = ph / top;
    var slot = pw / 24, bw = Math.min(24, slot - 4), cur = Math.floor(st.hour) % 24, s = '';
    s += '<rect x="' + (ml + cur * slot).toFixed(1) + '" y="' + mt + '" width="' + slot.toFixed(1) + '" height="' + ph + '" fill="var(--surface-2)"/>';
    for (var t = 0; t <= top + 1e-9; t += step) {
      var gy = base - t * sc;
      s += '<line class="gridl" x1="' + ml + '" x2="' + (W - mr) + '" y1="' + gy.toFixed(1) + '" y2="' + gy.toFixed(1) + '"/><text x="' + (ml - 6) + '" y="' + (gy + 3.5).toFixed(1) + '" text-anchor="end">' + trim(num(t, step < 1 ? 1 : 0)) + '</text>';
    }
    s += '<text x="' + (ml - 6) + '" y="' + (mt - 14) + '" text-anchor="end">' + un + '</text>';
    var pts = [], peak = { v: 0, x: 0, y: 0 };
    day.forEach(function (r, h) {
      var x = ml + h * slot + (slot - bw) / 2;
      s += stackCol(+x.toFixed(1), +bw.toFixed(1), base, sc * u, [{ v: r.direct, c: 'sun' }, { v: r.discharge, c: 'batt' }, { v: r.grid, c: 'grid' }]);
      var px = ml + (h + 0.5) * slot, py = base - r.pv * u * sc; pts.push(px.toFixed(1) + ',' + py.toFixed(1));
      if (r.pv > peak.v) peak = { v: r.pv, x: px, y: py };
    });
    s += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="var(--surface)" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>';
    s += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="var(--ink)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    if (peak.v > day[0].load * 1.12) s += '<circle cx="' + peak.x.toFixed(1) + '" cy="' + peak.y.toFixed(1) + '" r="4" fill="var(--ink)" stroke="var(--surface)" stroke-width="2"/><text class="val" x="' + peak.x.toFixed(1) + '" y="' + (peak.y - 9).toFixed(1) + '" text-anchor="middle">' + mw(peak.v) + '</text>';
    if (day[0].pv < 0.001 && day[1].pv < 0.001) s += '<text x="' + (ml + 3) + '" y="' + (base - day[0].load * u * sc - 6).toFixed(1) + '">Consum: ' + mw(day[0].load) + '</text>';
    [0, 6, 12, 18, 24].forEach(function (h) { s += '<text x="' + (ml + h * slot).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle">' + (h < 10 ? '0' : '') + h + ':00</text>'; });
    for (var h2 = 0; h2 < 24; h2++) s += '<rect class="hit" data-h="' + h2 + '" x="' + (ml + h2 * slot).toFixed(1) + '" y="' + mt + '" width="' + slot.toFixed(1) + '" height="' + ph + '" fill="transparent" style="cursor:pointer"/>';
    var desc = 'Grafic pe ore: consumul este constant, ' + mw(day[0].load) + '. Panourile ating ' + mw(peak.v) + ' la prânz.';
    host.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + desc + '">' + s + '</svg>';
  }
  function dayTip(h) {
    var r = cache.day[h], rows = '';
    function row(c, name, v) { rows += '<div class="row"><i>' + (c ? '<span class="key" style="background:var(--' + c + ')"></span>' : '') + name + '</i><b>' + mw(v) + '</b></div>'; }
    row('ink', 'Panourile produc', r.pv); row('sun', 'Direct din panouri', r.direct); row('batt', 'Din baterii', r.discharge); row('grid', 'Din rețea', r.grid);
    if (r.charge > 0.0005) row('', 'Intră în baterii', r.charge);
    if (r.exp > 0.0005) row('', 'Surplus în rețea', r.exp);
    return '<b>' + (h < 10 ? '0' : '') + h + ':00–' + (h + 1 < 10 ? '0' : '') + (h + 1) + ':00</b>' + rows;
  }

  function drawMonths() {
    var y = cache.year, host = $('c-months');
    var W = 420, H = 156, ml = 34, mr = 6, mt = 10, mb = 22, pw = W - ml - mr, ph = H - mt - mb, base = mt + ph, slot = pw / 12, bw = Math.min(24, slot - 8), s = '';
    s += '<rect x="' + (ml + st.month * slot).toFixed(1) + '" y="' + mt + '" width="' + slot.toFixed(1) + '" height="' + ph + '" fill="var(--surface-2)"/>';
    [0, 50, 100].forEach(function (t) { var gy = base - t / 100 * ph; s += '<line class="gridl" x1="' + ml + '" x2="' + (W - mr) + '" y1="' + gy + '" y2="' + gy + '"/><text x="' + (ml - 6) + '" y="' + (gy + 3.5) + '" text-anchor="end">' + t + '%</text>'; });
    y.months.forEach(function (m, i) {
      var x = ml + i * slot + (slot - bw) / 2;
      s += stackCol(+x.toFixed(1), +bw.toFixed(1), base, ph, [{ v: m.direct / m.load, c: 'sun' }, { v: m.batt / m.load, c: 'batt' }, { v: m.grid / m.load, c: 'grid' }]);
      s += '<text x="' + (ml + (i + 0.5) * slot).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle"' + (i === st.month ? ' class="val"' : '') + '>' + M.MSHORT[i] + '</text>';
      s += '<rect class="hit" data-m="' + i + '" x="' + (ml + i * slot).toFixed(1) + '" y="' + mt + '" width="' + slot.toFixed(1) + '" height="' + (ph + mb) + '" fill="transparent" style="cursor:pointer"/>';
    });
    var cov = y.months.map(function (m) { return (m.direct + m.batt) / m.load; }), hi = cov.indexOf(Math.max.apply(null, cov)), lo = cov.indexOf(Math.min.apply(null, cov));
    host.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Acoperirea din soare și baterii pe luni: cel mai mult în ' + M.MONTHS[hi] + ', ' + pct(cov[hi]) + '; cel mai puțin în ' + M.MONTHS[lo] + ', ' + pct(cov[lo]) + '.">' + s + '</svg>' +
      '<p class="fine">În ' + M.MONTHS[hi] + ' soarele și bateriile acoperă ' + pct(cov[hi]) + ' din consum. În ' + M.MONTHS[lo] + ', doar ' + pct(cov[lo]) + '. Apasă pe o lună ca să o vezi în machetă.</p>';
    var t = '<table><thead><tr><th>Luna</th><th>Panouri</th><th>Baterii</th><th>Rețea</th></tr></thead><tbody>';
    y.months.forEach(function (m, i) { t += '<tr><td>' + cap(M.MONTHS[i]) + '</td><td>' + pct(m.direct / m.load) + '</td><td>' + pct(m.batt / m.load) + '</td><td>' + pct(1 - (m.direct + m.batt) / m.load) + '</td></tr>'; });
    $('t-months-body').innerHTML = t + '</tbody></table>';
  }
  function monthTip(i) {
    var m = cache.year.months[i];
    return '<b>' + cap(M.MONTHS[i]) + '</b>' +
      '<div class="row"><i><span class="key" style="background:var(--sun)"></span>Direct din panouri</i><b>' + pct(m.direct / m.load) + '</b></div>' +
      '<div class="row"><i><span class="key" style="background:var(--batt)"></span>Din baterii</i><b>' + pct(m.batt / m.load) + '</b></div>' +
      '<div class="row"><i><span class="key" style="background:var(--grid)"></span>Din rețea</i><b>' + pct(1 - (m.direct + m.batt) / m.load) + '</b></div>';
  }

  function barsHtml(rows, fmt) {
    var max = Math.max.apply(null, rows.map(function (r) { return Math.max(0, r[1]); })) || 1;
    return rows.map(function (r) {
      return '<div class="bar"><span>' + r[0] + '</span><span>' + fmt(r[1]) + '</span><i><u style="width:' + (Math.max(0, r[1]) / max * 100).toFixed(1) + '%"></u></i></div>';
    }).join('');
  }
  function drawMoney() {
    var f = cache.fin, c = f.capex, rows = [
      ['Calculatoare: servere GPU, rețea, stocare', c.gpu], ['Clădire, instalații electrice, răcire, generatoare', c.facility],
      ['Panouri fotovoltaice', c.pv], ['Baterii', c.bess], ['Teren', c.land]
    ].filter(function (r) { return r[1] > 0.0005; });
    $('c-capex').innerHTML = barsHtml(rows, mil);
    function tr(name, v, cls, sign) { return '<tr' + (cls ? ' class="' + cls + '"' : '') + '><td>' + name + '</td><td' + (sign ? ' class="' + (v < 0 ? 'neg' : 'pos') + '"' : '') + '>' + num(v, 2) + '</td></tr>'; }
    var cloud = st.mode === 'cloud', h = '<thead><tr><th>Într-un an</th><th>mil. €</th></tr></thead><tbody>';
    h += tr(cloud ? 'Venituri din închirierea GPU-urilor' : 'Chirie pentru spațiu și putere', f.rev.main);
    if (!cloud) h += tr('Curent refacturat clienților', f.rev.energy);
    h += tr('Curent din rețea, după ce scădem soarele', -f.opex.energy);
    h += tr('Oameni', -f.opex.staff) + tr('Mentenanță', -f.opex.maint);
    h += tr(cloud ? 'Licențe, asigurări, vânzări, internet' : 'Asigurări, vânzări, internet', -f.opex.other);
    h += tr('Rămâne înainte de uzură', f.ebitda, 'sum') + tr('Uzura echipamentelor', -f.dep);
    h += tr('Profit estimat pe an', f.profit, 'total', true);
    $('t-pl').innerHTML = h + '</tbody>';
    $('grp-cloud').hidden = !cloud; $('grp-colo').hidden = cloud;
    $('s-price').value = A.gpuHourPrice; $('s-occ').value = A.occupancy * 100; $('s-colo').value = A.coloPrice; $('s-cocc').value = A.coloOccupancy * 100;
    $('o-price').textContent = trim(num(A.gpuHourPrice, 2)) + ' € pe oră'; $('o-occ').textContent = pct(A.occupancy);
    $('o-colo').textContent = num(A.coloPrice) + ' € pe kW pe lună'; $('o-cocc').textContent = pct(A.coloOccupancy);
    $('c-unit').innerHTML = barsHtml(cache.unit.parts, eur);
  }

  /* ---------- zece ani ---------- */
  function drawTen() {
    var cs = CASES[st.mode], cur = curCase(), sel = cache.ten, cloud = st.mode === 'cloud';
    var series = cs.map(function (c) {
      var t = c.k === cur ? sel : withPO(st.mode, c.p, c.o, function () { return tenOf(st.it, st.pv, st.bess, st.mode, cache.year, st.fund); });
      return { name: c.name, t: t, sel: c.k === cur };
    });
    if (!cur) series.push({ name: 'Alegerea ta', t: sel, sel: true });
    var base0 = st.fund !== 'none' ? { name: 'fără fonduri', t: cache.ten0, dash: true } : null;
    var all = series.concat(base0 ? [base0] : []), lo = 0, hi = 0;
    all.forEach(function (s) { s.t.rows.forEach(function (r) { lo = Math.min(lo, r.cum); hi = Math.max(hi, r.cum); }); });
    var W = 420, H = 250, ml = 40, mr = 78, mt = 22, mb = 24, pw = W - ml - mr, ph = H - mt - mb;
    var step = niceStep((hi - lo) || 1), y0 = Math.floor(lo / step) * step, y1 = Math.ceil(hi / step) * step; if (y1 === y0) y1 = y0 + step;
    function X(y) { return ml + y / 10 * pw; } function Y(v) { return mt + (y1 - v) / (y1 - y0) * ph; }
    var s = '', dec = step < 1 ? (step < 0.1 ? 2 : 1) : 0;
    for (var v = y0; v <= y1 + 1e-9; v += step) s += '<line class="gridl" x1="' + ml + '" x2="' + (W - mr) + '" y1="' + Y(v).toFixed(1) + '" y2="' + Y(v).toFixed(1) + '"/><text x="' + (ml - 6) + '" y="' + (Y(v) + 3.5).toFixed(1) + '" text-anchor="end">' + trim(num(v, dec)) + '</text>';
    s += '<line x1="' + ml + '" x2="' + (W - mr) + '" y1="' + Y(0).toFixed(1) + '" y2="' + Y(0).toFixed(1) + '" stroke="var(--ink)" stroke-width="1"/>';
    if (cloud) s += '<line x1="' + X(6).toFixed(1) + '" x2="' + X(6).toFixed(1) + '" y1="' + (mt - 4) + '" y2="' + (mt + ph) + '" stroke="var(--muted)" stroke-width="1" stroke-dasharray="2 3"/><text x="' + X(6).toFixed(1) + '" y="' + (mt - 9) + '" text-anchor="middle">GPU-uri noi</text>';
    [0, 2, 4, 6, 8, 10].forEach(function (y) { s += '<text x="' + X(y).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle">' + (y === 0 ? 'start' : 'anul ' + y) + '</text>'; });
    function path(t) { return t.rows.map(function (r, i) { return (i ? 'L' : 'M') + X(r.y).toFixed(1) + ' ' + Y(r.cum).toFixed(1); }).join(''); }
    var labels = [];
    all.sort(function (a, b) { return (a.sel ? 1 : 0) - (b.sel ? 1 : 0); }).forEach(function (se) {
      var d = path(se.t);
      if (se.sel) s += '<path d="' + d + '" fill="none" stroke="var(--surface)" stroke-width="6" stroke-linejoin="round"/><path d="' + d + '" fill="none" stroke="var(--ink)" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>';
      else s += '<path d="' + d + '" fill="none" stroke="var(--muted)" stroke-width="1.6" stroke-linejoin="round"' + (se.dash ? ' stroke-dasharray="5 4"' : '') + '/>';
      labels.push({ y: Y(se.t.rows[10].cum), name: se.name, sel: se.sel });
    });
    if (sel.breakeven) { var br = sel.rows[sel.breakeven]; s += '<circle cx="' + X(br.y).toFixed(1) + '" cy="' + Y(br.cum).toFixed(1) + '" r="4.5" fill="var(--good)" stroke="var(--surface)" stroke-width="2"/>'; }
    labels.sort(function (a, b) { return a.y - b.y; });
    for (var i = 1; i < labels.length; i++) if (labels[i].y - labels[i - 1].y < 12) labels[i].y = labels[i - 1].y + 12;
    var over = labels.length ? labels[labels.length - 1].y - (mt + ph + 2) : 0; if (over > 0) labels.forEach(function (l) { l.y -= over; });
    labels.forEach(function (l) { s += '<text x="' + (W - mr + 7) + '" y="' + (l.y + 3.5).toFixed(1) + '"' + (l.sel ? ' class="val"' : '') + '>' + l.name + '</text>'; });
    for (var yy = 0; yy <= 10; yy++) s += '<rect class="hit" data-y="' + yy + '" x="' + (X(yy) - pw / 20).toFixed(1) + '" y="' + mt + '" width="' + (pw / 10).toFixed(1) + '" height="' + ph + '" fill="transparent"/>';
    $('c-ten').innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Banii adunați în zece ani. Varianta aleasă: ' + backSent(sel) + ', iar după zece ani rămân ' + mil(sel.rows[10].cum) + '.">' + s + '</svg>';
    // butoanele cu cele trei cazuri
    $('cases').innerHTML = cs.map(function (c) { return '<button type="button" data-k="' + c.k + '" aria-pressed="' + (c.k === cur) + '">' + c.name + '<small>' + caseText(st.mode, c) + '</small></button>'; }).join('');
    // tabel pe ani
    var h = '<thead><tr><th>Anul</th><th>Venituri</th><th>Cheltuieli</th><th>Rate</th>' + (cloud ? '<th>GPU noi</th>' : '') + '<th>Rămâne</th><th>Adunat</th></tr></thead><tbody>';
    sel.rows.forEach(function (r) {
      if (r.y === 0) { h += '<tr><td>start</td><td></td><td></td><td></td>' + (cloud ? '<td></td>' : '') + '<td class="neg">' + num(r.cash, 2) + '</td><td class="neg">' + num(r.cum, 2) + '</td></tr>'; return; }
      h += '<tr><td>' + r.y + '</td><td>' + num(r.rev, 2) + '</td><td>' + num(-r.opex, 2) + '</td><td>' + num(-r.debt, 2) + '</td>' + (cloud ? '<td>' + (r.refresh ? num(-r.refresh, 2) : '') + '</td>' : '') +
        '<td class="' + (r.cash < 0 ? 'neg' : 'pos') + '">' + num(r.cash, 2) + '</td><td class="' + (r.cum < 0 ? 'neg' : 'pos') + '">' + num(r.cum, 2) + '</td></tr>';
    });
    $('t-ten').innerHTML = h + '</tbody>';
    $('o-loan').textContent = pct(A.loanShare); $('o-int').textContent = trim(num(A.interest * 100, 1)) + '%';
  }
  function tenTip(y) {
    var r = cache.ten.rows[y];
    function row(n, v) { return '<div class="row"><i>' + n + '</i><b>' + num(v, 2) + '</b></div>'; }
    if (y === 0) return '<b>La pornire</b>' + row('Bani proprii puși', r.cash) + '<div class="row"><i>milioane de euro</i></div>';
    return '<b>Anul ' + y + '</b>' + row('Venituri', r.rev) + row('Cheltuieli', -r.opex) + row('Rate la credite', -r.debt) + (r.refresh ? row('GPU-uri noi, bani proprii', -r.refresh) : '') + row('Rămâne în an', r.cash) + row('Adunat de la început', r.cum);
  }
  function drawSens() {
    var cloud = st.mode === 'cloud', P = cloud ? [2.5, 3.5, 4.5, 5.5, 6.5] : [110, 130, 150, 180, 220], O = cloud ? [0.5, 0.65, 0.75, 0.85, 0.95] : [0.65, 0.75, 0.85, 0.95], c0 = getPO(st.mode);
    var h = '<thead><tr><th><span>' + (cloud ? '€ pe oră' : '€ pe kW') + ' ↓</span> <span>ocupare →</span></th>' + O.map(function (o) { return '<th>' + pct(o) + '</th>'; }).join('') + '</tr></thead><tbody>';
    P.forEach(function (p) {
      h += '<tr><td>' + (cloud ? trim(num(p, 1)) : num(p)) + '</td>' + O.map(function (o) {
        var t = withPO(st.mode, p, o, function () { return tenOf(st.it, st.pv, st.bess, st.mode, cache.year, st.fund); });
        var cls = (t.breakeven ? (t.breakeven <= 5 ? 'g' : '') : 'b') + (Math.abs(p - c0.p) < 1e-6 && Math.abs(o - c0.o) < 1e-6 ? ' cur' : '');
        return '<td class="' + cls + '"><button type="button" data-p="' + p + '" data-o="' + o + '" aria-label="' + (cloud ? p + ' euro pe oră' : p + ' euro pe kW') + ', ocupare ' + pct(o) + ': ' + backSent(t) + '">' + (t.breakeven ? 'anul ' + t.breakeven : 'nu') + '</button></td>';
      }).join('') + '</tr>';
    });
    $('t-sens').innerHTML = h + '</tbody>';
  }

  /* ---------- fonduri europene ---------- */
  function scenCols() {
    return ['pilot', 'mediu', 'mare'].map(function (k) {
      var s = M.SCEN[k], y = scenYear(k);
      return { s: s, y: y, ph: M.physical(s.it, s.pv, s.bess, A), cl: M.finance(s.it, s.pv, s.bess, A, 'cloud', y), co: M.finance(s.it, s.pv, s.bess, A, 'colo', y) };
    });
  }
  function cmpHead(cols) { return '<thead><tr><th></th>' + cols.map(function (c) { return '<th' + (c.s.key === st.scen ? ' class="on"' : '') + '><button type="button" data-s="' + c.s.key + '" aria-pressed="' + (c.s.key === st.scen) + '">' + c.s.name + '</button></th>'; }).join('') + '</tr></thead><tbody>'; }
  function cmpRow(cols, name, fn, cls) { return '<tr' + (cls ? ' class="' + cls + '"' : '') + '><td>' + name + '</td>' + cols.map(function (c) { return '<td' + (c.s.key === st.scen ? ' class="on"' : '') + '>' + fn(c) + '</td>'; }).join('') + '</tr>'; }
  function drawFund() {
    var cols = scenCols(), mode = st.mode;
    cols.forEach(function (c) {
      c.f = mode === 'cloud' ? c.cl : c.co;
      c.fu = M.funding('none', c.f, c.s.bess, A);
      c.t0 = tenOf(c.s.it, c.s.pv, c.s.bess, mode, c.y, 'none'); c.t1 = tenOf(c.s.it, c.s.pv, c.s.bess, mode, c.y, 'imm'); c.t2 = tenOf(c.s.it, c.s.pv, c.s.bess, mode, c.y, 'fptj');
    });
    var h = cmpHead(cols);
    h += cmpRow(cols, 'Investiție', function (c) { return mil(c.f.capex.total); });
    h += cmpRow(cols, '<b>Grant pentru IMM</b><small>până la 70%, cel mult 1,5 mil. €</small>', function (c) { return mil(c.fu.immPossible); }, 'sum');
    h += cmpRow(cols, 'bani proprii necesari', function (c) { return mil(c.t1.equity); });
    h += cmpRow(cols, 'banii se întorc în 10 ani', function (c) { return backCell(c.t1); });
    h += cmpRow(cols, '<b>Fond Tranziție Justă</b><small>grant, cel mult jumătate din finanțare</small>', function (c) { return mil(c.fu.fptjPossible); }, 'sum');
    h += cmpRow(cols, 'credit avantajos, pe 12 ani', function (c) { return mil(c.fu.fptjFin - c.fu.fptjPossible); });
    h += cmpRow(cols, 'bani proprii necesari', function (c) { return mil(c.t2.equity); });
    h += cmpRow(cols, 'banii se întorc în 10 ani', function (c) { return backCell(c.t2); });
    h += cmpRow(cols, '<b>Fără fonduri</b><small>bani proprii necesari</small>', function (c) { return mil(c.t0.equity); }, 'sum');
    h += cmpRow(cols, 'banii se întorc în 10 ani', function (c) { return backCell(c.t0); });
    h += cmpRow(cols, '<b>Cât acoperă grantul cel mai mare</b>', function (c) { return pct(Math.max(c.fu.immPossible, c.fu.fptjPossible) / c.f.capex.total); }, 'sum');
    h += cmpRow(cols, 'Baterii, proiect separat<small>Fondul pentru Modernizare</small>', function (c) { return c.fu.bessPossible > 0 ? mil(c.fu.bessPossible) : 'prea mici'; });
    $('t-fund').innerHTML = h + '</tbody>';
  }

  function drawTeam() {
    var cols = scenCols(), R = [['Conducere', 1, 1, 1], ['Tehnicieni în ture, zi și noapte', 2, 4, 12], ['Electric și răcire', 1, 2, 4], ['Rețea și sisteme', 1, 1, 3], ['Vânzări și clienți', 1, 1, 3], ['Financiar și administrativ', 0, 1, 2]];
    var h = cmpHead(cols);
    R.forEach(function (r) { h += cmpRow(cols, r[0], function (c) { var n = r[['pilot', 'mediu', 'mare'].indexOf(c.s.key) + 1]; return n ? n : 'din afară'; }); });
    h += cmpRow(cols, 'Total oameni', function (c) { return { pilot: 6, mediu: 10, mare: 25 }[c.s.key]; }, 'sum');
    h += cmpRow(cols, 'Salarii pe an, Cloud GPU', function (c) { return mil(c.cl.opex.staff); });
    h += cmpRow(cols, 'Salarii pe an, Colocare', function (c) { return mil(c.co.opex.staff); });
    $('t-team').innerHTML = h + '</tbody>';
  }

  function drawCompare() {
    var cols = scenCols();
    cols.forEach(function (c) { c.tc = tenOf(c.s.it, c.s.pv, c.s.bess, 'cloud', c.y, st.fund); c.to = tenOf(c.s.it, c.s.pv, c.s.bess, 'colo', c.y, st.fund); });
    function sg(v) { return '<span style="color:var(--' + (v < 0 ? 'bad' : 'good') + ')">' + mil(v) + '</span>'; }
    var h = cmpHead(cols), fn = st.fund === 'none' ? 'fără fonduri' : st.fund === 'imm' ? 'cu grant IMM' : 'cu Fondul Tranziție Justă';
    h += cmpRow(cols, 'Puterea calculatoarelor', function (c) { return mw(c.s.it); });
    h += cmpRow(cols, 'GPU-uri', function (c) { return num(c.ph.gpus); });
    h += cmpRow(cols, 'Clădire', function (c) { return num(Math.round(c.ph.buildingM2 / 10) * 10) + ' m²'; });
    h += cmpRow(cols, 'Panouri', function (c) { return trim(num(c.s.pv, 1)) + ' MW'; });
    h += cmpRow(cols, 'Baterii', function (c) { return trim(num(c.s.bess, 1)) + ' MWh'; });
    h += cmpRow(cols, 'Teren', function (c) { return trim(num(c.ph.landHa, 1)) + ' ha'; });
    h += cmpRow(cols, 'Curent din soare și baterii', function (c) { return pct(c.y.coverage); });
    h += cmpRow(cols, 'Oameni', function (c) { return { pilot: 6, mediu: 10, mare: 25 }[c.s.key]; });
    h += cmpRow(cols, 'Durată până la pornire', function (c) { return CAL_TOTAL[c.s.key] + ' luni'; });
    h += cmpRow(cols, '<b>Cloud GPU</b>: investiție', function (c) { return mil(c.cl.capex.total); }, 'sum');
    h += cmpRow(cols, 'venituri pe an', function (c) { return mil(c.cl.rev.total); });
    h += cmpRow(cols, 'profit pe an', function (c) { return sg(c.cl.profit); });
    h += cmpRow(cols, 'grant posibil', function (c) { return mil(c.tc.grant); });
    h += cmpRow(cols, 'bani proprii, ' + fn, function (c) { return mil(c.tc.equity); });
    h += cmpRow(cols, 'banii se întorc în 10 ani', function (c) { return backCell(c.tc); });
    h += cmpRow(cols, '<b>Colocare</b>: investiție', function (c) { return mil(c.co.capex.total); }, 'sum');
    h += cmpRow(cols, 'venituri pe an', function (c) { return mil(c.co.rev.total); });
    h += cmpRow(cols, 'profit pe an', function (c) { return sg(c.co.profit); });
    h += cmpRow(cols, 'grant posibil', function (c) { return mil(c.to.grant); });
    h += cmpRow(cols, 'bani proprii, ' + fn, function (c) { return mil(c.to.equity); });
    h += cmpRow(cols, 'banii se întorc în 10 ani', function (c) { return backCell(c.to); });
    $('t-cmp').innerHTML = h + '</tbody>';
  }

  function drawAssumptions() {
    var L = [
      'Consum total = puterea calculatoarelor × ' + trim(num(A.pue, 2)) + ' (PUE), la o încărcare medie de ' + pct(A.loadFactor) + '.',
      num(A.gpuPerMW) + ' GPU-uri de generație nouă la 1 MW; ' + A.kwPerRack + ' kW pe rack.',
      'Clădire și instalații: ' + mil(A.capexFacilityFixed) + ' fix, plus ' + mil(A.capexFacilityPerMW) + ' pentru fiecare MW.',
      'Calculatoare (servere GPU, rețea, stocare): ' + mil(A.capexGpuPerMW) + ' pentru fiecare MW.',
      'Panouri: ' + mil(A.capexPvPerMWp) + ' pe MW instalat, ' + trim(num(A.haPerMWp, 1)) + ' ha pe MW, 1.345 kWh pe an din fiecare kW (zona Craiova, panouri fixe spre sud).',
      'Baterii: ' + mil(A.capexBessPerMWh) + ' pe MWh, descărcare completă în ' + A.bessHours + ' ore, randament ' + pct(A.bessEff) + '.',
      'Curent din rețea: ' + A.gridPrice + ' €/MWh cu tarife și taxe, fără TVA. Energia singură era ofertată la 620–700 lei/MWh în august 2026.',
      'Surplusul de la prânz se vinde cu ' + A.exportPrice + ' €/MWh.',
      'Teren: 15 €/m² pentru platforma clădirii, 1,5 €/m² pentru parcul de panouri.',
      'Cloud GPU. Prudent: 3,5 € pe GPU pe oră și 65% ocupare. Piața de azi: 4,5 € și 75%. Bun: 5,5 € și 85%.',
      'Colocare. Prudent: 130 € pe kW pe lună și 75% ocupare. Piața de azi: 150 € și 85%. Bun: 180 € și 95%. Curentul se refacturează clientului la prețul rețelei.',
      'Vremea: jumătate din zile senine, o treime cu nori, restul închise, cu producția lunară păstrată.',
      'Durată de folosire: GPU-uri ' + A.gpuLifeYears + ' ani, clădire ' + A.facilityLifeYears + ', panouri ' + A.pvLifeYears + ', baterii ' + A.bessLifeYears + '.',
      'Oameni: 6, 10 sau 25 de angajați, în funcție de mărime. Mentenanță: 2,5% pe an din valoarea clădirii și 1,5% din panouri și baterii.',
      'Zece ani: anul 1 la 50% din clienții țintă, anul 2 la 80%. Chiria unui GPU scade cu 8% pe an de vechime. GPU-uri noi în anul 6, la 80% din prețul primelor.',
      'Credit obișnuit: plătit în ' + A.loanYears + ' ani, în rate egale. Dobânda și partea de credit se aleg în capitolul „Zece ani”.',
      'Fonduri: grant IMM de 70% din costurile eligibile, cel mult ' + mil(FU.immCap) + '. Fondul de Participare: cel mult ' + mil(FU.fptjMaxInv) + ' și trei sferturi din investiție, jumătate grant, restul credit cu 4,5% pe 12 ani, din care 3 ani doar dobândă.',
      'După 10 ani am socotit că rămân jumătate din valoarea clădirii, 60% din panouri și 30% din baterii.',
      'O locuință consumă ' + trim(num(A.householdMWh, 1)) + ' MWh pe an.',
      'Nu sunt incluse: impozit pe profit, TVA, inflație.'
    ];
    $('assume').innerHTML = L.map(function (t) { return '<li>' + t + '</li>'; }).join('');
  }

  /* ---------- calendar si constructie pe etape ---------- */
  var PH = [
    { n: 'Studiu, clienți, alegerea terenului', a: 0, b: 6 }, { n: 'Aviz de racordare și autorizații', a: 3, b: 15 }, { n: 'Finanțare: bancă și fonduri europene', a: 4, b: 15 },
    { n: 'Proiectare și comenzi de echipamente', a: 9, b: 16 }, { n: 'Teren și platformă', a: 15, b: 18, ph: 0 }, { n: 'Racord și stație electrică', a: 16, b: 22, ph: 1 },
    { n: 'Clădirea', a: 17, b: 23, ph: 2 }, { n: 'Parcul fotovoltaic', a: 19, b: 24, ph: 5 }, { n: 'Răcire, generatoare, tablouri', a: 21, b: 25, ph: 3 },
    { n: 'Baterii', a: 23, b: 25, ph: 6 }, { n: 'Calculatoare', a: 24, b: 26.5, ph: 4 }, { n: 'Probe și primul client', a: 26, b: 27, ph: 7 }
  ];
  function calT() { return CAL_TOTAL[st.scen]; }
  function phases() { var k = calT() / 27; return PH.map(function (p) { return { n: p.n, a: Math.round(p.a * k * 2) / 2, b: Math.round(p.b * k * 2) / 2, ph: p.ph }; }); }
  function drawGantt() {
    var T = calT(), P = phases(), h = '';
    P.forEach(function (p, i) {
      h += '<div class="grow" data-i="' + i + '"><span>' + p.n + '</span><div class="gtrack"><i class="gbar' + (p.ph !== undefined ? ' b' : '') + '" style="left:' + (p.a / T * 100).toFixed(2) + '%;width:' + ((p.b - p.a) / T * 100).toFixed(2) + '%"></i></div></div>';
    });
    var ax = ''; for (var m = 0; m <= T; m += 6) ax += '<b style="left:' + (m / T * 100).toFixed(2) + '%">' + (m === 0 ? 'start' : 'luna ' + m) + '</b>';
    $('c-gantt').innerHTML = h + '<div class="grow gaxis"><span></span><div class="gtrack">' + ax + '</div></div>';
    var sl = $('s-build'); sl.max = T; if (st.buildM === null) sl.value = T;
    markBuild();
  }
  function markBuild() {
    var T = calT(), m = st.buildM === null ? T : st.buildM, P = phases(), g = $('c-gantt');
    g.style.setProperty('--now', (m / T * 100).toFixed(2) + '%');
    [].forEach.call(g.querySelectorAll('.grow[data-i]'), function (r) { var p = P[+r.getAttribute('data-i')]; r.classList.toggle('done', m >= p.b); r.classList.toggle('live', m >= p.a && m < p.b); });
    var live = P.filter(function (p) { return m >= p.a && m < p.b; }).map(function (p) { return p.n.toLowerCase(); });
    $('o-build').textContent = m >= T ? 'Luna ' + T + ': centrul funcționează' : 'Luna ' + Math.floor(m) + ' din ' + T;
  }
  function setBuildMonth(m) {
    var T = calT(); m = Math.max(0, Math.min(T, m)); st.buildM = m >= T ? null : m; $('s-build').value = m; markBuild();
    if (!has3d) return;
    if (st.buildM === null) { Scene3D.setBuild(null); return; }
    var arr = [0, 0, 0, 0, 0, 0, 0, 0];
    phases().forEach(function (p) { if (p.ph !== undefined) arr[p.ph] = Math.max(0, Math.min(1, (m - p.a) / (p.b - p.a))); });
    Scene3D.setBuild(arr);
  }
  var buildRaf = 0;
  function stopBuild() { if (!st.building) return; st.building = false; cancelAnimationFrame(buildRaf); $('b-build').setAttribute('aria-pressed', false); $('b-build').textContent = '▶ Construiește'; }
  function startBuild() {
    var T = calT(), m = st.buildM === null ? 0 : st.buildM, last = performance.now();
    st.building = true; $('b-build').setAttribute('aria-pressed', true); $('b-build').textContent = '❚❚ Oprește';
    if (has3d) { Scene3D.setRoof(false); roofUi(false); }
    (function loop(t) {
      if (!st.building) return;
      var dt = Math.min(0.1, (t - last) / 1000 || 0); last = t; m += dt * T / 18;
      setBuildMonth(m);
      if (m >= T) { stopBuild(); return; }
      buildRaf = requestAnimationFrame(loop);
    })(last);
  }

  /* ---------- macheta: etichete, soare, fluxuri ---------- */
  var PICK_CH = { building: chIndex('Calculatoarele'), sub: chIndex('Curentul'), gen: chIndex('Curentul'), cool: chIndex('Răcirea'), pv: chIndex('Soarele'), bess: chIndex('Bateriile și rețeaua'), fiber: chIndex('Internetul') };
  var PICK_NAME = { building: 'Clădirea cu calculatoare', sub: 'Stația electrică', gen: 'Generatoare de rezervă', cool: 'Răcitoare', pv: 'Parcul fotovoltaic', bess: 'Baterii', fiber: 'Fibră optică' };
  var PART_NAME = { r_gpu: 'GPU cu placă de răcire', r_cool: 'Lichid rece și cald', r_net: 'Switch de rețea', r_srv: 'Server cu 8 GPU-uri', r_pow: 'Alimentare' };
  function labelTexts() {
    return {
      building: 'Clădire · ' + num(cache.ph.gpus) + ' GPU-uri', pv: 'Panouri · ' + trim(num(st.pv, 2)) + ' MW',
      sub: 'Stație electrică', gen: 'Generatoare', cool: 'Răcire', fiber: 'Fibră optică'
    };
  }
  function rebuild(viewInstant) {
    if (!has3d) return;
    Scene3D.build({ it: st.it, pv: st.pv, bess: st.bess });
    var t = labelTexts(); for (var id in t) Scene3D.setLabelText(id, t[id]);
    Scene3D.go(st.rack ? 'rack' : st.thermal ? 'thermal' : chapters[st.ch].getAttribute('data-view'), viewInstant);
    tick();
  }
  function clock(h) { var hh = Math.floor(h), mm = Math.round((h - hh) * 60); if (mm === 60) { hh++; mm = 0; } return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm; }
  function lab(id, on, text) { Scene3D.setLabelOn(id, on); if (on) Scene3D.setLabelText(id, text); }
  function tick() {     // tot ce depinde de ora
    var r = cache.day[Math.floor(st.hour) % 24], out = st.outage;
    $('clock').textContent = clock(st.hour);
    $('f-load').textContent = mw(r.load);
    $('f-pv').textContent = st.pv === 0 ? 'fără' : out ? 'oprite' : r.pv > 0.0005 ? mw(r.pv) : 'nu produc';
    $('f-batt').textContent = st.bess === 0 ? 'fără' : out ? 'așteaptă' : r.charge > 0.0005 ? 'se încarcă, ' + mw(r.charge) : r.discharge > 0.0005 ? 'dau ' + mw(r.discharge) : r.soc > 0.9 ? 'pline' : r.soc < 0.08 ? 'goale' : 'așteaptă';
    $('f-grid').textContent = out ? 'pană de curent' : r.exp > 0.0005 ? 'primește ' + mw(r.exp) : r.grid > 0.0005 ? 'dă ' + mw(r.grid) : 'nimic';
    $('chip-gen').hidden = !out; $('f-gen').textContent = out === 2 ? mw(r.load) : 'pornesc';
    if (!has3d) return;
    var s = M.sunPos(st.month, st.hour); Scene3D.setSun(s.el, s.az, st.wx);
    var ref = Math.max(cache.ph.loadAvg * 1.5, 1e-6), f;
    if ((f = Scene3D.flow('pv'))) f.set(out ? 0 : r.pv / Math.max(st.pv * 0.8, ref), 1);
    if ((f = Scene3D.flow('bess'))) { if (out) f.set(0, 1); else if (r.charge > 0.0005) f.set(r.charge / ref, -1); else f.set(r.discharge / ref, 1); }
    if ((f = Scene3D.flow('grid'))) { if (out) f.set(0, 1, Scene3D.COL.grid); else if (r.exp > 0.0005) f.set(r.exp / (ref * 1.6), -1, Scene3D.COL.sun); else f.set(r.grid / ref, 1, Scene3D.COL.grid); }
    if ((f = Scene3D.flow('gen'))) f.set(out === 2 ? 0.85 : 0, 1);
    lab('f_pv', !out && r.pv > 0.0005, mw(r.pv));
    lab('f_bess', !out && (r.charge > 0.0005 || r.discharge > 0.0005), r.charge > 0.0005 ? 'încarcă ' + mw(r.charge) : 'dă ' + mw(r.discharge));
    lab('f_grid', out > 0 || r.grid > 0.0005 || r.exp > 0.0005, out ? 'pană' : r.exp > 0.0005 ? 'în rețea ' + mw(r.exp) : mw(r.grid));
    lab('f_gen', out === 2, mw(r.load));
    if (st.bess > 0) Scene3D.setLabelText('bess', 'Baterii · ' + trim(num(st.bess, 2)) + ' MWh · ' + pct(r.soc) + ' pline');
  }

  function render() { calc(); fill(); drawDay(); drawMonths(); drawMoney(); drawTen(); drawSens(); drawFund(); drawTeam(); drawCompare(); drawGantt(); tick(); syncUi(); }
  function syncUi() {
    [].forEach.call($('scen').children, function (b) { b.setAttribute('aria-pressed', b.dataset.s === st.scen); });
    [].forEach.call($('wx').children, function (b) { b.setAttribute('aria-pressed', +b.dataset.w === st.wx); });
    [].forEach.call($('mode').children, function (b) { b.setAttribute('aria-pressed', b.dataset.m === st.mode); });
    ['fund', 'fund2'].forEach(function (id) { [].forEach.call($(id).children, function (b) { b.setAttribute('aria-pressed', b.dataset.f === st.fund); }); });
    $('month').value = st.month; $('hour').value = st.hour;
    $('o-pv').textContent = trim(num(st.pv, 2)) + ' MW'; $('o-bess').textContent = trim(num(st.bess, 2)) + ' MWh';
  }

  /* ---------- moduri speciale ale machetei ---------- */
  function roofUi(on) { $('b-roof').setAttribute('aria-pressed', on); $('b-roof').textContent = on ? 'Pune acoperișul' : 'Ridică acoperișul'; }
  function setRack(on, quiet) {
    st.rack = on; $('b-rack').setAttribute('aria-pressed', on); $('b-rack').textContent = on ? 'Închide rackul' : 'Deschide un rack'; $('rack-info').hidden = !on;
    if (!has3d) return;
    Scene3D.setRack(on);
    if (on) { Scene3D.setRoof(true); roofUi(true); Scene3D.setAuto(false); Scene3D.go('rack'); } else if (!quiet) Scene3D.go('inside');
  }
  function setThermal(on, quiet) {
    st.thermal = on; $('b-thermal').setAttribute('aria-pressed', on); $('b-thermal').textContent = on ? 'Înapoi la culorile normale' : 'Vezi căldura';
    if (!has3d) return;
    Scene3D.setThermal(on);
    if (on) { Scene3D.setRoof(true); roofUi(true); Scene3D.setAuto(false); Scene3D.go('thermal'); } else if (!quiet) { Scene3D.setRoof(false); roofUi(false); Scene3D.go('cooling'); }
  }
  var outTimers = [];
  function outStage(stage, step) {
    st.outage = stage; if (has3d) Scene3D.setOutage(stage);
    [].forEach.call($('outage-steps').children, function (li) { var s = +li.getAttribute('data-s'); li.classList.toggle('on', s === step); li.classList.toggle('done', step > 0 && s < step); });
    tick();
  }
  function stopOutage() {
    outTimers.forEach(clearTimeout); outTimers = [];
    if ($('b-outage').getAttribute('aria-pressed') !== 'true' && !st.outage) return;
    $('b-outage').setAttribute('aria-pressed', false); $('b-outage').textContent = 'Simulează o pană de curent'; outStage(0, 0);
  }
  function startOutage() {
    stopOutage(); $('b-outage').setAttribute('aria-pressed', true); $('b-outage').textContent = 'Oprește simularea';
    if (has3d) { Scene3D.setAuto(false); Scene3D.go('power'); }
    outStage(1, 1);
    outTimers.push(setTimeout(function () { outStage(1, 2); }, 2600));
    outTimers.push(setTimeout(function () { outStage(2, 3); }, 6200));
    outTimers.push(setTimeout(function () { outStage(0, 4); }, 14500));
    outTimers.push(setTimeout(function () { $('b-outage').setAttribute('aria-pressed', false); $('b-outage').textContent = 'Simulează din nou'; [].forEach.call($('outage-steps').children, function (li) { li.classList.remove('on'); li.classList.add('done'); }); }, 18500));
  }
  function resetModes() {
    stopOutage(); stopBuild();
    if (st.rack) setRack(false, true);
    if (st.thermal) setThermal(false, true);
    if (st.buildM !== null) setBuildMonth(calT());
  }

  /* ---------- capitole ---------- */
  function isPhone() { return window.matchMedia && window.matchMedia('(max-width: 900px)').matches; }
  function goChapter(i, instant) {
    i = Math.max(0, Math.min(chapters.length - 1, i));
    resetModes(); st.ch = i;
    chapters.forEach(function (c, k) { c.hidden = k !== i; });
    [].forEach.call($('toc').children, function (b, k) { b.setAttribute('aria-current', k === i); if (k === i) { var t = $('toc'); t.scrollLeft = Math.max(0, b.offsetLeft - t.clientWidth / 2 + b.clientWidth / 2); } });
    $('pos').textContent = (i + 1) + ' din ' + chapters.length; $('prev').disabled = i === 0; $('next').disabled = i === chapters.length - 1;
    $('scroll').scrollTop = 0;
    if (!instant && isPhone()) {      // pe telefon macheta ramane sus; aducem inceputul capitolului sub ea
      var main = document.querySelector('.main'), view = $('view'), story = document.querySelector('.story');
      var top0 = main.getBoundingClientRect().top + window.pageYOffset, stuck = getComputedStyle(view).position === 'sticky';
      // capitolele care folosesc ora, luna si vremea raman cu bara la vedere; la celelalte textul incepe imediat sub macheta
      var y = chapters[i].hasAttribute('data-dock') ? top0 : story.getBoundingClientRect().top + window.pageYOffset - (stuck ? view.offsetHeight + 8 : 0);
      if (window.pageYOffset > y) window.scrollTo(0, y);
    }
    var view = chapters[i].getAttribute('data-view'), roof = view === 'inside';
    roofUi(roof);
    if (has3d) { Scene3D.setRoof(roof); Scene3D.go(view, instant); Scene3D.setAuto(view === 'overview'); }
    [].forEach.call(document.querySelectorAll('.lbl'), function (l) { l.classList.toggle('hot', PICK_CH[l.dataset.id] === i); });
  }

  function setScenario(k) {
    var s = M.SCEN[k]; resetModes(); st.scen = k; st.it = s.it; st.pv = s.pv; st.bess = s.bess;
    var a = $('s-pv'), b = $('s-bess');
    a.max = 8 * s.it; a.step = s.it < 0.5 ? 0.05 : s.it < 2 ? 0.25 : 1; a.value = s.pv;
    b.max = 12 * s.it; b.step = s.it < 0.5 ? 0.25 : s.it < 2 ? 0.5 : 2.5; b.value = s.bess;
    render(); rebuild(false);
  }

  /* ---------- pornire ---------- */
  function init() {
    // cuprins si antete
    chapters.forEach(function (c, i) {
      c.querySelector('.eyebrow').textContent = 'Capitolul ' + (i + 1) + ' din ' + chapters.length;
      var b = document.createElement('button'); b.type = 'button'; b.textContent = (i + 1) + '. ' + c.getAttribute('data-title');
      b.addEventListener('click', function () { goChapter(i); }); $('toc').appendChild(b);
    });
    M.MONTHS.forEach(function (m, i) { var o = document.createElement('option'); o.value = i; o.textContent = cap(m); $('month').appendChild(o); });
    $('money-ctrls').innerHTML =
      '<div id="grp-cloud"><div class="ctrl"><label for="s-price">Preț pe GPU</label><output id="o-price" for="s-price"></output><input type="range" id="s-price" min="1.5" max="8" step="0.1" value="' + A.gpuHourPrice + '"></div>' +
      '<div class="ctrl"><label for="s-occ">Cât timp sunt închiriate GPU-urile</label><output id="o-occ" for="s-occ"></output><input type="range" id="s-occ" min="30" max="95" step="1" value="' + A.occupancy * 100 + '"></div></div>' +
      '<div id="grp-colo" hidden><div class="ctrl"><label for="s-colo">Chirie</label><output id="o-colo" for="s-colo"></output><input type="range" id="s-colo" min="80" max="250" step="5" value="' + A.coloPrice + '"></div>' +
      '<div class="ctrl"><label for="s-cocc">Cât din spațiu este închiriat</label><output id="o-cocc" for="s-cocc"></output><input type="range" id="s-cocc" min="40" max="100" step="1" value="' + A.coloOccupancy * 100 + '"></div></div>';
    drawAssumptions();

    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) $('hint').textContent = 'Trage cu degetul ca să rotești · două degete apropie';
    has3d = Scene3D.init({
      host: $('view'), canvas: $('gl'), labels: $('labels'),
      onPick: function (id) { hideTip(); if (PICK_CH[id] !== undefined && !st.rack) goChapter(PICK_CH[id]); },
      onHover: function (id, x, y) { if (id && !st.rack) showTip('<b>' + PICK_NAME[id] + '</b><br>Apasă pentru explicații', x, y); else hideTip(); },
      onNorth: (function () { var last = 9; return function (az) { if (Math.abs(az - last) > 0.01) { last = az; $('north').style.transform = 'rotate(' + az.toFixed(3) + 'rad)'; } }; })(),
      onTouched: function () { $('hint').classList.add('gone'); }
    });
    setTimeout(function () { $('hint').classList.add('gone'); }, 9000);
    if (!has3d) {
      var d = document.createElement('div'); d.className = 'nogl'; d.textContent = 'Macheta 3D nu poate porni în acest browser. Explicațiile și calculele funcționează normal.';
      $('view').appendChild(d); $('gl').hidden = true;
    } else {
      Scene3D.makeLabels(['building', 'pv', 'bess', 'sub', 'gen', 'cool', 'fiber'].map(function (id) { return { id: id, text: PICK_NAME[id] }; })
        .concat(['f_pv', 'f_bess', 'f_grid', 'f_gen'].map(function (id) { return { id: id, text: '', cls: 'flow' }; }))
        .concat(Object.keys(PART_NAME).map(function (id) { return { id: id, text: PART_NAME[id], cls: 'part' }; })));
    }
    calc(); render();
    if (has3d) { Scene3D.build({ it: st.it, pv: st.pv, bess: st.bess }); var t = labelTexts(); for (var id in t) Scene3D.setLabelText(id, t[id]); }
    goChapter(0, true); tick();

    // controale
    function scenClick(e) { var b = e.target.closest('button'); if (b && b.dataset.s) setScenario(b.dataset.s); }
    $('scen').addEventListener('click', scenClick);
    ['t-cmp', 't-fund', 't-team'].forEach(function (id) { $(id).addEventListener('click', scenClick); });
    $('wx').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { st.wx = +b.dataset.w; render(); } });
    $('mode').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { st.mode = b.dataset.m; render(); } });
    function fundClick(e) { var b = e.target.closest('button'); if (b) { st.fund = b.dataset.f; render(); } }
    $('fund').addEventListener('click', fundClick); $('fund2').addEventListener('click', fundClick);
    $('cases').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var c = CASES[st.mode].filter(function (x) { return x.k === b.dataset.k; })[0]; if (c) { setPO(st.mode, c.p, c.o); render(); }
    });
    $('t-sens').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { setPO(st.mode, +b.dataset.p, +b.dataset.o); render(); } });
    $('s-loan').addEventListener('input', function () { A.loanShare = +this.value / 100; render(); });
    $('s-int').addEventListener('input', function () { A.interest = +this.value / 100; render(); });
    $('month').addEventListener('change', function () { st.month = +this.value; render(); });
    $('hour').addEventListener('input', function () { st.hour = +this.value; stopPlay(); drawDay(); tick(); });
    var deb = null;
    function sized() { render(); clearTimeout(deb); deb = setTimeout(function () { rebuild(false); }, 140); }
    $('s-pv').addEventListener('input', function () { st.pv = +this.value; sized(); });
    $('s-bess').addEventListener('input', function () { st.bess = +this.value; sized(); });
    $('money-ctrls').addEventListener('input', function (e) {
      var v = +e.target.value;
      if (e.target.id === 's-price') A.gpuHourPrice = v; else if (e.target.id === 's-occ') A.occupancy = v / 100;
      else if (e.target.id === 's-colo') A.coloPrice = v; else if (e.target.id === 's-cocc') A.coloOccupancy = v / 100;
      render();
    });
    $('prev').addEventListener('click', function () { goChapter(st.ch - 1); });
    $('next').addEventListener('click', function () { goChapter(st.ch + 1); });
    document.addEventListener('keydown', function (e) {
      var tg = e.target && e.target.tagName; if (tg === 'INPUT' || tg === 'SELECT' || tg === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') goChapter(st.ch + 1); else if (e.key === 'ArrowLeft') goChapter(st.ch - 1);
    });
    $('b-roof').addEventListener('click', function () {
      var on = this.getAttribute('aria-pressed') !== 'true'; roofUi(on);
      if (st.rack) setRack(false, true);
      if (has3d) { Scene3D.setRoof(on); Scene3D.setAuto(false); Scene3D.go(on ? 'inside' : 'building'); }
    });
    $('b-over').addEventListener('click', function () { if (st.rack) setRack(false, true); if (has3d) { Scene3D.go('overview'); } });
    $('b-top').addEventListener('click', function () { if (st.rack) setRack(false, true); if (has3d) { Scene3D.setAuto(false); Scene3D.go('top'); } });
    $('b-in').addEventListener('click', function () { if (has3d) Scene3D.zoom(0.8); });
    $('b-out').addEventListener('click', function () { if (has3d) Scene3D.zoom(1.25); });
    $('play').addEventListener('click', function () { if (st.playing) stopPlay(); else startPlay(); });
    $('b-rack').addEventListener('click', function () { setRack(!st.rack); });
    $('b-thermal').addEventListener('click', function () { setThermal(!st.thermal); });
    $('b-outage').addEventListener('click', function () { if (this.getAttribute('aria-pressed') === 'true') stopOutage(); else startOutage(); });
    $('b-build').addEventListener('click', function () { if (st.building) stopBuild(); else { if (st.buildM === null) setBuildMonth(0); startBuild(); } });
    $('s-build').addEventListener('input', function () { stopBuild(); setBuildMonth(+this.value); });

    // tooltip-uri pe grafice
    function chartHover(host, attr, tipFn, clickFn) {
      host.addEventListener('pointermove', function (e) { var t = e.target; if (t.classList && t.classList.contains('hit')) showTip(tipFn(+t.getAttribute(attr)), e.clientX, e.clientY); else hideTip(); });
      host.addEventListener('pointerleave', hideTip);
      host.addEventListener('click', function (e) { var t = e.target; if (t.classList && t.classList.contains('hit')) { if (clickFn) clickFn(+t.getAttribute(attr)); else showTip(tipFn(+t.getAttribute(attr)), e.clientX, e.clientY); } });
    }
    chartHover($('c-day'), 'data-h', dayTip, function (h) { st.hour = h + 0.5; stopPlay(); syncUi(); drawDay(); tick(); });
    chartHover($('c-months'), 'data-m', monthTip, function (m) { st.month = m; render(); });
    chartHover($('c-ten'), 'data-y', tenTip, null);
  }

  var playRaf = 0, playLast = 0;
  function startPlay() {
    st.playing = true; $('play').setAttribute('aria-pressed', true); $('play').textContent = '❚❚ Oprește';
    playLast = performance.now(); var bin = Math.floor(st.hour);
    (function loop(t) {
      if (!st.playing) return;
      var dt = Math.min(0.1, (t - playLast) / 1000 || 0); playLast = t;
      st.hour = (st.hour + dt * 1.1) % 24; $('hour').value = st.hour; tick();
      if (Math.floor(st.hour) !== bin) { bin = Math.floor(st.hour); drawDay(); }
      playRaf = requestAnimationFrame(loop);
    })(playLast);
  }
  function stopPlay() { if (!st.playing) return; st.playing = false; cancelAnimationFrame(playRaf); $('play').setAttribute('aria-pressed', false); $('play').textContent = '▶ O zi întreagă'; }

  init();
})();
