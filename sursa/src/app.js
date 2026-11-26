/* ================= APLICATIA: capitole, cifre, grafice, legatura cu macheta ================= */
(function () {
  'use strict';
  var M = Model, A = M.A, FU = M.FUNDS, BZ = M.BASE, BK = M.BANK, S0 = M.SCEN.mediu;
  function $(id) { return document.getElementById(id); }
  // o singura marime: Mediu, 1 MW, in hala libera 1. Panourile si bateriile se pot muta din cursoare; grantul este o suma aleasa de cititor (0 = planul).
  var st = { it: S0.it, pv: S0.pv, bess: S0.bess, hour: 13, month: 6, wx: 1, ch: 0, playing: false, fund: FU.plan, outage: 0, rack: false, thermal: false, buildM: null, building: false };
  var cache = { key: '', days: {}, fines: {} };
  var chapters = [].slice.call(document.querySelectorAll('.chapter'));
  var has3d = false;
  function chIndex(title) { for (var i = 0; i < chapters.length; i++) if (chapters[i].getAttribute('data-title') === title) return i; return -1; }
  var CH_PLACE = chIndex('Locul');
  // doua cifre care nu sunt in model: cat loc liber cere centrul in hala si cat iese daca locul nu ajunge (din evaluarea bazei)
  var HALL_MIN_M2 = 800, IT_IF_SMALL = 0.9;
  // planul dinainte, pe teren nou: 4 MWp de panouri si 4 MWh de baterii. Folosit doar ca sa aratam de unde vine diferenta de investitie.
  var OLD_PLAN = { pv: 4, bess: 4 };

  /* ---------- formatare romaneasca ---------- */
  function num(x, d) {
    var s = Math.abs(x).toFixed(d || 0).split('.');
    s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (x < 0 && +Math.abs(x).toFixed(d || 0) !== 0 ? '−' : '') + s.join(',');
  }
  function trim(s) { return s.indexOf(',') < 0 ? s : s.replace(/0+$/, '').replace(/,$/, ''); }
  function mw(x) { return x < 0.9995 ? num(x * 1000, 0) + ' kW' : trim(num(x, x < 10 ? 2 : 1)) + ' MW'; }
  function mwp(x) { return trim(num(x, 2)) + ' MWp'; }
  function mil(x) { var a = Math.abs(x); return trim(num(x, a >= 100 ? 0 : a >= 10 ? 1 : 2)) + ' mil. €'; }
  function pct(x) { return num(x * 100, 0) + '%'; }
  function years(x) { return isFinite(x) ? trim(num(x, x < 10 ? 1 : 0)) + ' ani' : 'niciodată'; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function eur(x) { return trim(num(x, Math.abs(x) < 10 ? 2 : 0)) + ' €'; }
  function dscr(x) { return typeof x === 'number' ? num(x, 2) : String(x); }
  function grantName(g) { return g > 0 ? 'grant de ' + mil(g) : 'fără grant'; }

  /* ---------- trei feluri in care poate merge piata ---------- */
  var CASES = [{ k: 'prudent', name: 'Prudent', p: 3.5, o: 0.65 }, { k: 'piata', name: 'Piața de azi', p: 4.5, o: 0.75 }, { k: 'bun', name: 'Bun', p: 5.5, o: 0.85 }];
  var SELL = 'cloud';   // se vand doar ore de GPU (GPU-uri proprii); modelul primeste inca acest cuvant
  function getPO() { return { p: A.gpuHourPrice, o: A.occupancy }; }
  function setPO(p, o) { A.gpuHourPrice = p; A.occupancy = o; }
  function withPO(p, o, fn) { var old = getPO(); setPO(p, o); try { return fn(); } finally { setPO(old.p, old.o); } }
  function curCase() { var c = getPO(), L = CASES; for (var i = 0; i < L.length; i++) if (Math.abs(L[i].p - c.p) < 1e-6 && Math.abs(L[i].o - c.o) < 1e-6) return L[i].k; return null; }
  function caseText(c) { return trim(num(c.p, 1)) + ' € pe oră, ' + pct(c.o) + ' ocupare'; }
  var scenYears = {};
  function scenYear(k) { var s = M.SCEN[k]; if (!scenYears[k]) scenYears[k] = M.simulateYear(s.it, s.pv, s.bess, A); return scenYears[k]; }
  function tenOf(it, pv, bess, year, grant) {       // grant = suma ceruta, in mil. EUR; modelul o taie la cat permite apelul
    var f = M.finance(it, pv, bess, A, SELL, year), fu = M.funding(grant || 0, f);
    var t = M.tenYear(it, pv, bess, A, SELL, year, fu); t.fund = fu; return t;
  }
  function breakTxt(t) { return t.breakeven ? 'în anul ' + t.breakeven : 'nu în 10 ani'; }
  function backCell(t) { return t.breakeven ? 'în anul ' + t.breakeven : 'nu'; }
  function backSent(t) { return t.breakeven ? 'banii se întorc în anul ' + t.breakeven : 'banii nu se întorc în 10 ani'; }
  function bankRow(g) { for (var i = 0; i < BK.rows.length; i++) if (BK.rows[i].grant === g) return BK.rows[i]; return null; }

  /* ---------- calcule ---------- */
  function calc() {
    var key = [st.it, st.pv, st.bess].join('|');
    if (cache.key !== key) {
      cache.key = key; cache.days = {}; cache.fines = {};
      cache.year = M.simulateYear(st.it, st.pv, st.bess, A);
      cache.year0 = st.bess > 0 ? M.simulateYear(st.it, st.pv, 0, A) : cache.year;      // acelasi an fara baterii, ca sa aratam cat schimba ele
      cache.ph = M.physical(st.it, st.pv, st.bess, A);
    }
    var dk = st.month + '|' + st.wx;
    if (!cache.days[dk]) cache.days[dk] = M.simulateDay(st.month, st.wx, st.it, st.pv, st.bess, A);
    cache.day = cache.days[dk];
    // pas de un sfert de ora pentru citiri line, daca modelul il are; altfel raman cele 24 de randuri
    cache.fine = null;
    if (M.simulateDayFine) { try { cache.fine = cache.fines[dk] || (cache.fines[dk] = M.simulateDayFine(st.month, st.wx, st.it, st.pv, st.bess, A, 4)); } catch (e) { cache.fine = null; } }
    var mx = 0; cache.day.forEach(function (r) { mx = Math.max(mx, r.pv, r.load); }); cache.dayRef = mx;
    cache.fin = M.finance(st.it, st.pv, st.bess, A, SELL, cache.year);
    cache.ten = tenOf(st.it, st.pv, st.bess, cache.year, st.fund);
    cache.ten0 = st.fund === 0 ? cache.ten : tenOf(st.it, st.pv, st.bess, cache.year, 0);
    cache.unit = M.unitCost(st.it, st.pv, st.bess, A, SELL, cache.year);
  }

  // la preturi prudente: se intorc banii in 10 ani, fara grant si cu grantul cel mai mare? (calculat pe loc, nu scris de mana)
  function prudent() {
    var c = CASES[0];
    return withPO(c.p, c.o, function () { return { c: c, t0: tenOf(st.it, st.pv, st.bess, cache.year, 0), tm: tenOf(st.it, st.pv, st.bess, cache.year, FU.grantMax) }; });
  }
  function prudentLine(pr) {
    var c = pr.c, head = 'La prețuri prudente (' + trim(num(c.p, 1)) + ' € pe GPU pe oră și ' + pct(c.o) + ' ocupare), ';
    var s = !pr.t0.breakeven && !pr.tm.breakeven ? '<b>banii nu se întorc în 10 ani</b>, nici fără grant, nici cu un grant de ' + mil(pr.tm.grant) + '.'
      : !pr.t0.breakeven ? '<b>banii nu se întorc în 10 ani fără grant</b>. Cu un grant de ' + mil(pr.tm.grant) + ' s-ar întoarce în anul ' + pr.tm.breakeven + '.'
        : 'banii se întorc în anul ' + pr.t0.breakeven + ', fără grant.';
    return head + s + ' Planul are sens doar cu prețuri mai bune decât cele prudente sau cu contracte ferme semnate dinainte.';
  }
  var CAL_TOTAL = 23;

  function values() {
    var ph = cache.ph, y = cache.year, f = cache.fin, v = {};
    function rnd(x) { var q = x < 5000 ? 10 : 100; return Math.round(x / q) * q; }
    v.it = mw(st.it); v.gpus = num(ph.gpus); v.servers = num(ph.servers); v.racks = num(ph.racks);
    v.buildingM2 = num(Math.round(ph.buildingM2 / 10) * 10);
    v.loadAvg = mw(ph.loadAvg); v.annualMWh = num(rnd(ph.annualMWh)); v.households = num(rnd(ph.households));
    v.pueRange = ph.pueMin && ph.pueMax ? 'Este o medie pe an: de la ' + trim(num(ph.pueMin, 2)) + ' în nopțile reci până la ' + trim(num(ph.pueMax, 2)) + ' în după-amiezile de vară, când răcirea muncește cel mai mult.' : 'Este o medie pe an: noaptea și iarna răcirea consumă mai puțin, vara la prânz mai mult.';
    v.heat = mw(st.it); v.overhead = mw(st.it * (A.pue - 1));
    // baza: tot ce se stie despre loc vine din model
    v.baseHa = trim(num(BZ.areaHa, 1)); v.baseLen = num(BZ.lenM); v.baseWid = num(BZ.widM); v.baseBuildings = num(BZ.buildings); v.baseRoofM2 = num(BZ.roofM2);
    v.hallL = num(BZ.hallL); v.hallW = num(BZ.hallW); v.hallM2 = num(BZ.hallM2);
    v.needM2 = num(Math.round(ph.buildingM2 / 10) * 10) + '–' + num(HALL_MIN_M2); v.hallMinM2 = num(HALL_MIN_M2); v.itSmall = trim(num(IT_IF_SMALL, 2)) + ' MW';
    v.yardAHa = trim(num(BZ.yardAHa, 1)); v.yardBHa = trim(num(BZ.yardBHa, 1)); v.freeHa = trim(num(BZ.yardAHa + BZ.yardBHa, 1));
    v.gridReq = mw(BZ.gridReqMW); v.line110m = num(BZ.line110m); v.st1 = BZ.st1; v.st1km = trim(num(BZ.st1km, 1)); v.st2 = BZ.st2; v.st2km = trim(num(BZ.st2km, 1));
    v.outPanels = 'Panourile obișnuite se opresc singure când cade rețeaua, din motive de siguranță.' + (st.bess > 0 ? ' Bateriile mari din curte pot ajuta la o pană doar dacă invertorul lor este făcut să lucreze și fără rețea. Este o opțiune care se cere din proiectare.' : '');
    // soarele
    var yieldYear = 0; M.YIELD.forEach(function (k) { yieldYear += k; });
    v.pvPlan = mwp(S0.pv); v.pvMax = mwp(BZ.pvMaxMWp); v.roofPerMWp = num(BZ.roofM2PerMWp); v.roofM2 = num(Math.round(ph.roofM2 / 100) * 100);
    v.yieldKwh = num(Math.round(yieldYear / 10) * 10);
    v.coverage = pct(y.coverage); v.wasteShare = pct(y.wasteShare); v.pvGen = num(Math.round(y.pv / 10) * 10);
    var full = ph.annualMWh / yieldYear; v.pvFull = trim(num(full, 1)) + ' MWp'; v.pvFullTimes = num(full / BZ.pvMaxMWp, 0);
    v.pvLine = 'Centrul consumă aproape la fel zi și noapte, iar soarele produce doar ziua, mai ales vara. ' +
      (st.pv === 0 ? 'Fără panouri, tot curentul vine din rețea.' : y.exp < 0.5 ? 'La ' + mwp(st.pv) + ', panourile nu produc niciodată mai mult decât consumă centrul. Deci nu se vinde nimic și nu se pierde nimic.'
        : 'La ' + mwp(st.pv) + ', în zilele senine de vară panourile dau la prânz puțin peste consum. Pleacă în rețea ' + (y.wasteShare < 0.005 ? 'sub 1%' : pct(y.wasteShare)) + ' din ce produc.');
    // bateriile
    v.bessCost = mil(A.capexBessPerMWh);
    var same = Math.round(y.coverage * 100) === Math.round(cache.year0.coverage * 100);
    v.bessLine = st.bess === 0 ? '<b>Fără baterii mari:</b> soarele acoperă ' + pct(y.coverage) + ' din consum. Acesta este planul.'
      : '<b>Cu ' + trim(num(st.bess, 1)) + ' MWh de baterii:</b> soarele acoperă ' + (same ? 'tot ' + pct(y.coverage) + ' din consum, la fel ca fără ele' : pct(y.coverage) + ' din consum, față de ' + pct(cache.year0.coverage) + ' fără ele') + '. Investiția crește cu <b>' + mil(f.capex.bess) + '</b>.';
    v.yearLine = 'Pe tot anul: <b>' + pct(y.directShare) + '</b> direct din panouri, ' + (st.bess > 0 ? '<b>' + pct(y.battShare) + '</b> din baterii, ' : '') + '<b>' + pct(1 - y.directShare - y.battShare) + '</b> din rețea.';
    v.monthsTitle = st.bess > 0 ? 'Cât din consum acoperă soarele și bateriile, pe luni' : 'Cât din consum acoperă soarele, pe luni';
    v.nightMWh = num(Math.round(ph.loadAvg * 15.2 * 2) / 2, ph.loadAvg < 0.5 ? 1 : 0);
    v.monthName = M.MONTHS[st.month]; v.wxName = M.WEATHER[st.wx].label.toLowerCase();
    // banii
    v.capexTotal = mil(f.capex.total); v.capexGpu = mil(f.capex.gpu);
    v.calTotal = CAL_TOTAL;
    var pr = prudent(); v.prudentLine = prudentLine(pr);
    v.prudentShort = pr.t0.breakeven ? 'la prețuri prudente, banii se întorc abia în anul ' + pr.t0.breakeven + '.' : 'la prețuri prudente, investiția nu își scoate banii în 10 ani.';
    // cat scuteste faptul ca hala si terenul sunt ale firmei: diferenta fata de planul dinainte, minus ce vine din panouri mai putine si din lipsa bateriilor
    var f0 = M.finance(S0.it, S0.pv, S0.bess, A, SELL, scenYear('mediu')), gap = BK.dolj.capex - f0.capex.total;
    var gapPv = (OLD_PLAN.pv - S0.pv) * A.capexPvPerMWp + (OLD_PLAN.bess - S0.bess) * A.capexBessPerMWh, own = gap - gapPv;
    v.saveLine = 'Faptul că hala și terenul sunt ale firmei scutește doar circa <b>' + mil(Math.round(own * 10) / 10) + '</b> din circa ' + mil(Math.round(BK.dolj.capex)) + ', cât costa același centru pe un teren nou. Cea mai mare parte din diferența până la ' + mil(f0.capex.total) + ' vine din panouri mai puține și din lipsa bateriilor. Calculatoarele sunt ' + (Math.abs(f.capex.gpu / f.capex.total - 0.75) < 0.04 ? 'circa trei sferturi' : pct(f.capex.gpu / f.capex.total)) + ' din bani.';
    if (f.ebitda <= 0) v.paybackLine = 'La aceste cifre, veniturile nu acoperă nici cheltuielile de funcționare.';
    else if (f.profit <= 0) v.paybackLine = 'La aceste cifre, banii rămași nu acoperă uzura echipamentelor. Proiectul ar pierde aproximativ <b>' + mil(-f.profit) + ' pe an</b>.';
    else v.paybackLine = 'La aceste cifre, un an obișnuit rămâne pe plus și după ce punem deoparte bani pentru înlocuirea echipamentelor. ' + (cache.ten.breakeven ? 'Capitolul „Zece ani” arată când se întorc banii, cu tot cu credit.' : '<b>Asta nu înseamnă că banii se întorc.</b> Cu clienți care vin treptat, rate la credit și GPU-uri noi în anul 6, capitolul „Zece ani” arată că la aceste prețuri banii nu se întorc în 10 ani.');
    var gear = st.bess > 0 ? 'Panourile și bateriile' : 'Panourile';
    if (st.pv > 0) v.solarLine = gear + ' aduc aproximativ <b>' + mil(f.solarSaving) + ' pe an</b>: curent pe care nu îl mai cumpărăm, minus întreținerea lor. Fără ele, curentul ar costa ' + mil(f.energyNoSolar) + ' pe an. Investiția în ele (' + mil(f.capex.pv + f.capex.bess) + ') se plătește singură în circa <b>' + years(f.solarPayback) + '</b>.';
    else v.solarLine = 'Fără panouri, tot curentul vine din rețea și costă aproximativ <b>' + mil(f.energyNoSolar) + ' pe an</b>.';
    // cat costa o unitate vanduta
    var u = cache.unit, left = u.price - u.total;
    v.unitLine = 'O oră de GPU vândută ne costă aproximativ <b>' + eur(u.total) + '</b> și se vinde cu <b>' + eur(u.price) + '</b>. ' +
      (left >= 0 ? 'Rămân ' + eur(left) + ' la fiecare oră de GPU.' : 'Pierdem ' + eur(-left) + ' la fiecare oră de GPU.');
    // zece ani
    var t = cache.ten, t0 = cache.ten0, last = t.rows[10].cum;
    v.tenEquity = mil(t.equity); v.tenGrant = t.grant > 0.0005 ? mil(t.grant) : '0';
    v.tenGrantSub = st.fund === 0 ? 'pe atât se sprijină planul' : st.fund >= FU.grantMax ? 'plafonul apelului, scenariu optimist' : 'scenariu optimist, nu promisiune';
    v.tenBreak = breakTxt(t); v.tenCum = mil(last);
    var po = getPO(), at = trim(num(po.p, 1)) + ' € pe oră și ' + pct(po.o) + ' ocupare';
    v.caseNow = 'Calcul la valorile alese acum: ' + at + '.';
    if (st.fund === 0) v.tenLine = 'La ' + at + ', fără grant: sunt necesari <b>' + mil(t.equity) + '</b> bani proprii și un credit de ' + mil(t.loan) + '. ' + cap(backSent(t)) + '.';
    else v.tenLine = 'La ' + at + ', cu un grant de ' + mil(t.grant) + ': sunt necesari <b>' + mil(t.equity) + '</b> bani proprii, în loc de ' + mil(t0.equity) + '. ' +
      (!t.breakeven ? 'La aceste prețuri banii nu se întorc în 10 ani, cu sau fără grant.' : !t0.breakeven ? '<b>Banii se întorc în anul ' + t.breakeven + '.</b> Fără grant nu s-ar întoarce în 10 ani.'
        : t0.breakeven === t.breakeven ? '<b>Banii se întorc în anul ' + t.breakeven + '</b>, la fel ca fără grant, dar cu mai puțini bani proprii puși în joc.' : '<b>Banii se întorc în anul ' + t.breakeven + '</b>, față de anul ' + t0.breakeven + ' fără grant.');
    var res = CASES.map(function (c) { return withPO(c.p, c.o, function () { return { c: c, t: tenOf(st.it, st.pv, st.bess, cache.year, st.fund) }; }); });
    v.tenNote = '<b>' + cap(grantName(t.grant)) + '.</b> ' + res.map(function (r) { return r.c.name + ': ' + backSent(r.t) + '.'; }).join(' ') +
      ' Totul atârnă de preț și de cât de pline sunt calculatoarele. De aceea primul contract semnat valorează mai mult decât orice grant.';
    v.fundLine = st.fund === 0 ? '<b>Fără grant</b>, cum este planul: trebuie aduși <b>' + mil(t.equity) + '</b> bani proprii și un credit de ' + mil(t.loan) + '. ' + cap(backSent(t)) + '.'
      : '<b>Cu un grant de ' + mil(t.grant) + '</b>: banii proprii scad de la ' + mil(t0.equity) + ' la <b>' + mil(t.equity) + '</b>, iar creditul de la ' + mil(t0.loan) + ' la ' + mil(t.loan) + '. ' + cap(backSent(t)) + (t0.breakeven && t.breakeven ? (t0.breakeven === t.breakeven ? ', la fel ca fără grant.' : ', față de anul ' + t0.breakeven + ' fără grant.') : t.breakeven ? '. Fără grant nu s-ar întoarce.' : ', cu sau fără grant.');
    // calculul pentru banca: cifre fixe din model
    var b0 = bankRow(0), bg = bankRow(st.fund);
    v.dscrTarget = dscr(BK.dscrTarget); v.dscr0 = b0 ? dscr(b0.dscr) : ''; v.bankNeed = mil(BK.need);
    v.firmGpu = num(BK.firmContractsGpu); v.firmShare = pct(BK.firmContractsShare);
    v.refreshYear = BK.refreshYear; v.refreshCost = mil(BK.refreshCost); v.refreshCash = mil(BK.refreshFromCash);
    v.bankLine = bg ? 'În calculul mai aspru făcut pentru bancă, ' + (st.fund === 0 ? 'fără grant' : 'cu același grant') + ': bani proprii ' + num(bg.equity, 2) + ' mil. €, credit ' + num(bg.loan, 2) + ' mil. €, iar acoperirea ratelor (DSCR) este <b>' + dscr(bg.dscr) + '</b>, ' + (bg.dscr >= BK.dscrTarget ? 'peste' : 'sub') + ' pragul de ' + dscr(BK.dscrTarget) + ' cerut de bănci.' : 'Calculul pentru bancă este făcut doar pentru treptele de grant de mai sus.';
    var lv4 = BK.levers[2], b6 = bankRow(6);
    v.leverLine = '<b>Grantul nu este pârghia principală.</b> Un an în plus de contracte ferme, cu creditul pentru echipamente întins tot pe patru ani, aduce mai mult decât un grant de ' + mil(b6 ? b6.grant : 6) + (lv4 && b6 ? ': ' + dscr(lv4.dscr) + ' față de ' + dscr(b6.dscr) : '') + '.';
    v.noContractLine = 'Fără contracte ferme, acoperirea este ' + dscr(BK.sens[0].dscr) + '. Deci <b>proiectul nu poate fi finanțat fără contracte ferme</b>.';
    // fonduri
    v.fundPlan = num(FU.plan); v.fundOpt = trim(num(FU.optimistic[0], 1)) + '–' + trim(num(FU.optimistic[1], 1)); v.fundCap = trim(num(FU.grantMax, 1));
    return v;
  }
  var HTML_KEYS = { prudentLine: 1, paybackLine: 1, solarLine: 1, unitLine: 1, tenLine: 1, tenNote: 1, fundLine: 1, bessLine: 1, yearLine: 1, saveLine: 1, bankLine: 1, leverLine: 1, noContractLine: 1 };
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
    var slot = pw / 24, bw = Math.min(24, slot - 4), s = '';
    dayGeo = { ml: ml, slot: slot, mt: mt, base: base, k: sc * u, W: W, mr: mr };
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
    var lmin = Infinity, lmax = 0; day.forEach(function (r) { lmin = Math.min(lmin, r.load); lmax = Math.max(lmax, r.load); });
    if (peak.v > lmax * 1.12) s += '<circle cx="' + peak.x.toFixed(1) + '" cy="' + peak.y.toFixed(1) + '" r="4" fill="var(--ink)" stroke="var(--surface)" stroke-width="2"/><text class="val" x="' + peak.x.toFixed(1) + '" y="' + (peak.y - 9).toFixed(1) + '" text-anchor="middle">' + mw(peak.v) + '</text>';
    if (day[0].pv < 0.001 && day[1].pv < 0.001) s += '<text x="' + (ml + 3) + '" y="' + (base - day[0].load * u * sc - 6).toFixed(1) + '">Consum: ' + mw(day[0].load) + '</text>';
    [0, 6, 12, 18, 24].forEach(function (h) { s += '<text x="' + (ml + h * slot).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle">' + (h < 10 ? '0' : '') + h + ':00</text>'; });
    for (var h2 = 0; h2 < 24; h2++) s += '<rect class="hit" data-h="' + h2 + '" x="' + (ml + h2 * slot).toFixed(1) + '" y="' + mt + '" width="' + slot.toFixed(1) + '" height="' + ph + '" fill="transparent" style="cursor:pointer"/>';
    // cursorul orei: o linie, un punct pe curba panourilor si ceasul deasupra; se muta fara sa redesenam graficul
    s += '<g id="day-cur" pointer-events="none"><line x1="0" x2="0" y1="' + (mt - 6) + '" y2="' + base + '" stroke="var(--ink)" stroke-width="1.5"/>' +
      '<circle id="day-dot" cx="0" cy="' + base + '" r="4.5" fill="var(--sun)" stroke="var(--ink)" stroke-width="1.5"/>' +
      '<g id="day-tag"><rect x="-19" y="' + (mt - 23) + '" width="38" height="16" rx="8" fill="var(--ink)"/><text id="day-clk" class="cur" x="0" y="' + (mt - 11.5) + '" text-anchor="middle">00:00</text></g></g>';
    var desc = 'Grafic pe ore: consumul ' + (lmax - lmin < 0.02 * lmax ? 'este aproape constant, ' + mw(lmax) : 'merge de la ' + mw(lmin) + ' noaptea la ' + mw(lmax) + ' în orele calde') + '. Panourile ating ' + mw(peak.v) + ' la prânz.';
    host.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + desc + '">' + s + '</svg>';
    moveCursor();
  }
  var dayGeo = null;
  function moveCursor() {
    var g = $('day-cur'); if (!g || !dayGeo) return;
    var x = dayGeo.ml + (st.hour % 24) * dayGeo.slot, r = rowAt(st.hour);
    g.setAttribute('transform', 'translate(' + x.toFixed(1) + ',0)');
    $('day-dot').setAttribute('cy', (dayGeo.base - (r.pv || 0) * dayGeo.k).toFixed(1));
    $('day-tag').setAttribute('transform', 'translate(' + (Math.max(dayGeo.ml + 19, Math.min(dayGeo.W - dayGeo.mr - 19, x)) - x).toFixed(1) + ',0)');
    $('day-clk').textContent = clock(st.hour);
  }
  function dayTip(h) {
    var r = cache.day[h], rows = '';
    function row(c, name, v) { rows += '<div class="row"><i>' + (c ? '<span class="key" style="background:var(--' + c + ')"></span>' : '') + name + '</i><b>' + mw(v) + '</b></div>'; }
    row('ink', 'Panourile produc', r.pv); row('sun', 'Direct din panouri', r.direct); if (st.bess > 0) row('batt', 'Din baterii', r.discharge); row('grid', 'Din rețea', r.grid);
    if (st.bess > 0 && r.charge > 0.0005) row('', 'Intră în baterii', r.charge);
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
    var hasB = st.bess > 0, who = hasB ? 'soarele și bateriile acoperă ' : 'soarele acoperă ';
    host.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Acoperirea din soare' + (hasB ? ' și baterii' : '') + ' pe luni: cel mai mult în ' + M.MONTHS[hi] + ', ' + pct(cov[hi]) + '; cel mai puțin în ' + M.MONTHS[lo] + ', ' + pct(cov[lo]) + '.">' + s + '</svg>' +
      '<p class="fine">În ' + M.MONTHS[hi] + ' ' + who + pct(cov[hi]) + ' din consum. În ' + M.MONTHS[lo] + ', doar ' + pct(cov[lo]) + '. Apasă pe o lună ca să o vezi în machetă.</p>';
    var t = '<table><thead><tr><th>Luna</th><th>Panouri</th>' + (hasB ? '<th>Baterii</th>' : '') + '<th>Rețea</th></tr></thead><tbody>';
    y.months.forEach(function (m, i) { t += '<tr><td>' + cap(M.MONTHS[i]) + '</td><td>' + pct(m.direct / m.load) + '</td>' + (hasB ? '<td>' + pct(m.batt / m.load) + '</td>' : '') + '<td>' + pct(1 - (m.direct + m.batt) / m.load) + '</td></tr>'; });
    $('t-months-body').innerHTML = t + '</tbody></table>';
  }
  function monthTip(i) {
    var m = cache.year.months[i];
    return '<b>' + cap(M.MONTHS[i]) + '</b>' +
      '<div class="row"><i><span class="key" style="background:var(--sun)"></span>Direct din panouri</i><b>' + pct(m.direct / m.load) + '</b></div>' +
      (st.bess > 0 ? '<div class="row"><i><span class="key" style="background:var(--batt)"></span>Din baterii</i><b>' + pct(m.batt / m.load) + '</b></div>' : '') +
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
      ['Calculatoare: servere GPU, rețea, stocare', c.gpu], ['Reamenajarea halei, instalații electrice, răcire, generatoare', c.facility],
      ['Panouri pe acoperișuri', c.pv], ['Baterii', c.bess]
    ].filter(function (r) { return r[1] > 0.0005; });
    $('c-capex').innerHTML = barsHtml(rows, mil) + '<div class="bar"><span>Teren și hală: sunt ale firmei</span><span>0</span><i></i></div>';
    function tr(name, v, cls, sign) { return '<tr' + (cls ? ' class="' + cls + '"' : '') + '><td>' + name + '</td><td' + (sign ? ' class="' + (v < 0 ? 'neg' : 'pos') + '"' : '') + '>' + num(v, 2) + '</td></tr>'; }
    var h = '<thead><tr><th>Într-un an</th><th>mil. €</th></tr></thead><tbody>';
    h += tr('Venituri din închirierea GPU-urilor', f.rev.main);
    h += tr('Curent din rețea, după ce scădem soarele', -f.opex.energy);
    h += tr('Oameni', -f.opex.staff) + tr('Mentenanță', -f.opex.maint);
    h += tr('Licențe, asigurări, vânzări, internet', -f.opex.other);
    h += tr('Rămâne înainte de uzură', f.ebitda, 'sum') + tr('Uzura echipamentelor', -f.dep);
    h += tr('Profit estimat pe an', f.profit, 'total', true);
    $('t-pl').innerHTML = h + '</tbody>';
    $('s-price').value = A.gpuHourPrice; $('s-occ').value = A.occupancy * 100;
    $('o-price').textContent = trim(num(A.gpuHourPrice, 2)) + ' € pe oră'; $('o-occ').textContent = pct(A.occupancy);
    // modelul numeste randul al doilea „uzura cladirii, panourilor si bateriilor”; aici nu este cladire noua, iar bateriile lipsesc de obicei
    var parts = cache.unit.parts.map(function (p) { return /^Uzura (cl|halei)/.test(p[0]) ? [st.bess > 0 ? 'Uzura instalațiilor din hală, a panourilor și a bateriilor' : 'Uzura instalațiilor din hală și a panourilor', p[1]] : p; });
    $('c-unit').innerHTML = barsHtml(parts, eur);
  }

  /* ---------- zece ani ---------- */
  function drawTen() {
    var cs = CASES, cur = curCase(), sel = cache.ten;
    var series = cs.map(function (c) {
      var t = c.k === cur ? sel : withPO(c.p, c.o, function () { return tenOf(st.it, st.pv, st.bess, cache.year, st.fund); });
      return { name: c.name, t: t, sel: c.k === cur };
    });
    if (!cur) series.push({ name: 'Alegerea ta', t: sel, sel: true });
    var base0 = st.fund !== 0 ? { name: 'fără grant', t: cache.ten0, dash: true } : null;
    var all = series.concat(base0 ? [base0] : []), lo = 0, hi = 0;
    all.forEach(function (s) { s.t.rows.forEach(function (r) { lo = Math.min(lo, r.cum); hi = Math.max(hi, r.cum); }); });
    var W = 420, H = 250, ml = 40, mr = 78, mt = 22, mb = 24, pw = W - ml - mr, ph = H - mt - mb;
    var step = niceStep((hi - lo) || 1), y0 = Math.floor(lo / step) * step, y1 = Math.ceil(hi / step) * step; if (y1 === y0) y1 = y0 + step;
    function X(y) { return ml + y / 10 * pw; } function Y(v) { return mt + (y1 - v) / (y1 - y0) * ph; }
    var s = '', dec = step < 1 ? (step < 0.1 ? 2 : 1) : 0;
    for (var v = y0; v <= y1 + 1e-9; v += step) s += '<line class="gridl" x1="' + ml + '" x2="' + (W - mr) + '" y1="' + Y(v).toFixed(1) + '" y2="' + Y(v).toFixed(1) + '"/><text x="' + (ml - 6) + '" y="' + (Y(v) + 3.5).toFixed(1) + '" text-anchor="end">' + trim(num(v, dec)) + '</text>';
    s += '<line x1="' + ml + '" x2="' + (W - mr) + '" y1="' + Y(0).toFixed(1) + '" y2="' + Y(0).toFixed(1) + '" stroke="var(--ink)" stroke-width="1"/>';
    s += '<line x1="' + X(6).toFixed(1) + '" x2="' + X(6).toFixed(1) + '" y1="' + (mt - 4) + '" y2="' + (mt + ph) + '" stroke="var(--muted)" stroke-width="1" stroke-dasharray="2 3"/><text x="' + X(6).toFixed(1) + '" y="' + (mt - 9) + '" text-anchor="middle">GPU-uri noi</text>';
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
    $('cases').innerHTML = cs.map(function (c) { return '<button type="button" data-k="' + c.k + '" aria-pressed="' + (c.k === cur) + '">' + c.name + '<small>' + caseText(c) + '</small></button>'; }).join('');
    // tabel pe ani
    var h = '<thead><tr><th>Anul</th><th>Venituri</th><th>Cheltuieli</th><th>Rate</th><th>GPU noi</th><th>Rămâne</th><th>Adunat</th></tr></thead><tbody>';
    sel.rows.forEach(function (r) {
      if (r.y === 0) { h += '<tr><td>start</td><td></td><td></td><td></td><td></td><td class="neg">' + num(r.cash, 2) + '</td><td class="neg">' + num(r.cum, 2) + '</td></tr>'; return; }
      h += '<tr><td>' + r.y + '</td><td>' + num(r.rev, 2) + '</td><td>' + num(-r.opex, 2) + '</td><td>' + num(-r.debt, 2) + '</td><td>' + (r.refresh ? num(-r.refresh, 2) : '') + '</td>' +
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
    var P = [2.5, 3.5, 4.5, 5.5, 6.5], O = [0.5, 0.65, 0.75, 0.85, 0.95], c0 = getPO();
    var h = '<thead><tr><th><span>€ pe oră</span></th>' + O.map(function (o) { return '<th>' + pct(o) + '</th>'; }).join('') + '</tr></thead><tbody>';
    P.forEach(function (p) {
      h += '<tr><td>' + trim(num(p, 1)) + '</td>' + O.map(function (o) {
        var t = withPO(p, o, function () { return tenOf(st.it, st.pv, st.bess, cache.year, st.fund); });
        var cls = (t.breakeven ? (t.breakeven <= 5 ? 'g' : '') : 'b') + (Math.abs(p - c0.p) < 1e-6 && Math.abs(o - c0.o) < 1e-6 ? ' cur' : '');
        return '<td class="' + cls + '"><button type="button" data-p="' + p + '" data-o="' + o + '" aria-label="' + trim(num(p, 1)) + ' euro pe oră, ocupare ' + pct(o) + ': ' + backSent(t) + '">' + (t.breakeven ? 'anul ' + t.breakeven : 'nu') + '</button></td>';
      }).join('') + '</tr>';
    });
    $('t-sens').innerHTML = h + '</tbody>';
  }

  /* ---------- fonduri europene: lista vine din model, aici doar se deseneaza ---------- */
  var FUND_BADGE = { open: 'Apel deschis', wait: 'Anunțat', no: 'Nu se aplică', help: 'Ajută, nu este grant' };
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function drawFund() {
    $('funds').innerHTML = M.FUND_LIST.map(function (p) {
      return '<div class="prog ' + esc(p.cls) + '"><h4>' + esc(p.name) + ' <span class="tagc ' + esc(p.cls) + '">' + (FUND_BADGE[p.cls] || '') + '</span></h4>' +
        '<p class="status"><b>Starea:</b> ' + esc(p.st) + '</p>' +
        '<p><b>Cât:</b> ' + esc(p.sum) + '</p>' +
        '<p><b>Ce este:</b> ' + esc(p.what) + '</p>' +
        '<p><b>Se potrivește?</b> ' + esc(p.fit) + '</p>' +
        (p.href ? '<p class="status">Sursa: <a href="' + esc(p.href) + '" target="_blank" rel="noopener">' + esc(p.src || 'pagina sursă') + '</a></p>' : '') + '</div>';
    }).join('');
  }
  // butoanele cu treptele de grant, aceleasi in „Zece ani” si in „Fonduri europene”
  function fundBtns() {
    return FU.steps.map(function (g) {
      return '<button type="button" data-f="' + g + '" aria-pressed="' + (g === st.fund) + '">' + (g === 0 ? 'Fără grant' : mil(g)) + (g > 0 && g >= FU.grantMax ? '<small>plafonul apelului</small>' : '') + '</button>';
    }).join('');
  }

  /* ---------- calculul pentru banca: cifre fixe din model ---------- */
  function drawBank() {
    var h = '<thead><tr><th>Grant</th><th>Bani proprii</th><th>Credit</th><th>DSCR minim</th><th>Banii proprii se întorc în</th></tr></thead><tbody>';
    BK.rows.forEach(function (r) {
      h += '<tr' + (r.grant === st.fund ? ' class="on"' : '') + '><td>' + (r.grant ? num(r.grant) : 'fără') + '</td><td>' + num(r.equity, 2) + '</td><td>' + num(r.loan, 2) + '</td><td class="' + (r.dscr >= BK.dscrTarget ? 'pos' : 'neg') + '">' + dscr(r.dscr) + '</td><td>' + trim(num(r.back, 1)) + ' ani</td></tr>';
    });
    $('t-bank').innerHTML = h + '</tbody>';
    h = '<thead><tr><th>Ce se schimbă</th><th>Bani proprii</th><th>Credit</th><th>DSCR</th></tr></thead><tbody>';
    BK.levers.forEach(function (l) { h += '<tr><td>' + esc(l.name) + '</td><td>' + num(l.equity, 2) + '</td><td>' + num(l.loan, 2) + '</td><td><b>' + esc(String(l.dscr).replace(/ · /g, ', ')) + '</b></td></tr>'; });
    $('t-levers').innerHTML = h + '</tbody>';
    $('l-sens').innerHTML = BK.sens.map(function (s) { return '<li>' + esc(s.name) + ': acoperirea este <b>' + dscr(s.dscr) + '</b>, ' + (s.dscr >= BK.dscrTarget ? 'peste prag' : 'sub prag') + '.</li>'; }).join('');
  }

  /* ---------- locul: ce incape in baza ---------- */
  function drawPlace() {
    var pil = M.SCEN.pilot, need = function (it) { return M.physical(it, 0, 0, A).buildingM2; };
    var h = '<thead><tr><th>Mărime</th><th>Loc necesar</th><th>Unde ar sta</th></tr></thead><tbody>';
    h += '<tr><td><b>' + pil.name + '</b>, ' + mw(pil.it) + '</td><td>circa ' + num(Math.round(need(pil.it) / 10) * 10) + ' m²</td><td>Încape ușor în ' + pil.hall + ' (' + num(pil.hallM2) + ' m²).</td></tr>';
    h += '<tr class="on"><td><b>' + S0.name + '</b>, ' + mw(S0.it) + '</td><td>' + num(Math.round(need(S0.it) / 10) * 10) + '–' + num(HALL_MIN_M2) + ' m²</td><td><b>La limită</b> în ' + S0.hall + ' (' + num(S0.hallM2) + ' m²).</td></tr>';
    h += '<tr><td><b>Mare</b>, 5 MW</td><td>' + num(BZ.mareNeedM2[0]) + '–' + num(BZ.mareNeedM2[1]) + ' m²</td><td><b>Nu încape.</b> Toată hala lungă are circa ' + num(BZ.longHallM2) + ' m².</td></tr>';
    $('t-fit').innerHTML = h + '</tbody>';
  }

  /* ---------- echipa: o singura marime ---------- */
  var TEAM = [['Conducere', 1], ['Tehnicieni în ture, zi și noapte', 4], ['Electric și răcire', 2], ['Rețea și sisteme', 1], ['Vânzări și clienți', 1], ['Financiar și administrativ', 1]];
  function teamTotal() { var n = 0; TEAM.forEach(function (r) { n += r[1]; }); return n; }
  function drawTeam() {
    var h = '<thead><tr><th>Rol</th><th>Oameni</th></tr></thead><tbody>';
    TEAM.forEach(function (r) { h += '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; });
    h += '<tr class="sum"><td>Total oameni</td><td>' + teamTotal() + '</td></tr>';
    h += '<tr><td>Salarii pe an</td><td>' + mil(cache.fin.opex.staff) + '</td></tr>';
    $('t-team').innerHTML = h + '</tbody>';
  }

  /* ---------- de ce marimea Medie: Pilot si Mediu calculate, Mare in cuvinte ---------- */
  function drawCompare() {
    var cols = ['pilot', 'mediu'].map(function (k) {
      var s = M.SCEN[k], y = scenYear(k), c = { s: s, y: y, ph: M.physical(s.it, s.pv, s.bess, A), cl: M.finance(s.it, s.pv, s.bess, A, SELL, y) };
      c.back = CASES.slice(0, 2).map(function (cs) { return withPO(cs.p, cs.o, function () { return tenOf(s.it, s.pv, s.bess, y, 0); }); });
      return c;
    });
    function sg(v) { return '<span style="color:var(--' + (v < 0 ? 'bad' : 'good') + ')">' + num(v, 2) + '</span>'; }
    var rest = 0, h = '<thead><tr><th></th>' + cols.map(function (c) { return '<th' + (c.s.key === 'mediu' ? ' class="on"' : '') + '>' + c.s.name + '</th>'; }).join('') + '<th>Mare</th></tr></thead><tbody>';
    function row(name, fn, mare, cls, wrap) {       // mare: textul din coloana a treia; null = randul intra in casuta „nu se calculeaza”
      var third = mare != null ? '<td>' + mare + '</td>' : rest++ === 0 ? '<td class="nofit" rowspan="@@RS@@">Nu se calculează: nu are unde sta.</td>' : '';
      h += '<tr' + (cls ? ' class="' + cls + '"' : '') + '><td>' + name + '</td>' + cols.map(function (c) { return '<td class="' + (c.s.key === 'mediu' ? 'on' : '') + (wrap ? '' : ' n') + '">' + fn(c) + '</td>'; }).join('') + third + '</tr>';
    }
    row('Puterea calculatoarelor', function (c) { return mw(c.s.it); }, '5 MW');
    row('Loc necesar în hală', function (c) { return num(Math.round(c.ph.buildingM2 / 10) * 10) + ' m²'; }, num(BZ.mareNeedM2[0]) + '–' + num(BZ.mareNeedM2[1]) + ' m²');
    row('Unde ar sta', function (c) { return c.s.hall + '<small>' + num(c.s.hallM2) + ' m²</small>'; }, '<b>nu încape</b><small>hala lungă: ' + num(BZ.longHallM2) + ' m²</small>', '', true);
    row('GPU-uri', function (c) { return num(c.ph.gpus); });
    row('Panouri pe acoperișuri', function (c) { return mwp(c.s.pv); });
    row('Curent din soare', function (c) { return pct(c.y.coverage); });
    row('<b>Investiție</b><small>milioane de euro</small>', function (c) { return '<b>' + num(c.cl.capex.total, 2) + '</b>'; }, null, 'sum');
    row('din care calculatoarele', function (c) { return num(c.cl.capex.gpu, 2); });
    row('venituri pe an', function (c) { return num(c.cl.rev.total, 2); });
    row('profit pe an', function (c) { return sg(c.cl.profit); });
    row('<b>Banii se întorc în 10 ani</b><small>fără grant, ' + CASES[0].name.toLowerCase() + '</small>', function (c) { return backCell(c.back[0]); }, null, 'sum');
    row('<small>fără grant, ' + CASES[1].name.toLowerCase() + '</small>', function (c) { return backCell(c.back[1]); });
    $('t-cmp').innerHTML = h.replace('@@RS@@', rest) + '</tbody>';
  }

  function drawAssumptions() {
    var yieldYear = 0; M.YIELD.forEach(function (k) { yieldYear += k; });
    var L = [
      'Consum total = puterea calculatoarelor × ' + trim(num(A.pue, 2)) + ' (PUE), la o încărcare medie de ' + pct(A.loadFactor) + '.',
      num(A.gpuPerMW) + ' GPU-uri de generație nouă la 1 MW; ' + A.kwPerRack + ' kW pe rack.',
      'Reamenajarea halei și instalațiile (electrice, răcire, UPS, generatoare): ' + mil(A.capexFacilityFixed) + ' fix, plus ' + mil(A.capexFacilityPerMW) + ' pentru fiecare MW. Este cu 15% sub o clădire nouă, pentru că hala există.',
      'Teren și hală: 0. Sunt ale firmei și nu se cumpără nimic.',
      'Calculatoare (servere GPU, rețea, stocare): ' + mil(A.capexGpuPerMW) + ' pentru fiecare MW.',
      'Panouri: ' + mil(A.capexPvPerMWp) + ' pe MWp, circa ' + num(BZ.roofM2PerMWp) + ' m² de acoperiș bun pentru 1 MWp, cel mult ' + mwp(BZ.pvMaxMWp) + ' în toată baza.',
      'Producția panourilor: circa ' + num(Math.round(yieldYear / 10) * 10) + ' kWh pe an din fiecare kW. Este cu 10% sub zona Craiovei, pentru că la Râmnicu Vâlcea este ceva mai puțin soare, iar panourile stau culcate pe acoperișuri, jumătate pe panta dinspre nord.',
      'Baterii: planul nu are baterii mari. Dacă se pun, costă ' + mil(A.capexBessPerMWh) + ' pe MWh, se descarcă complet în ' + A.bessHours + ' ore și au un randament de ' + pct(A.bessEff) + '.',
      'Curent din rețea: ' + A.gridPrice + ' € pe MWh cu tarife și taxe, fără TVA. Energia singură era ofertată la 620–700 lei pe MWh în august 2026.',
      'Dacă apare surplus la prânz, se vinde cu ' + A.exportPrice + ' € pe MWh.',
      'Vindem doar ore de GPU, pe calculatoarele noastre. ' + CASES.map(function (c) { return c.name + ': ' + trim(num(c.p, 1)) + ' € pe GPU pe oră și ' + pct(c.o) + ' ocupare'; }).join('. ') + '.',
      'Vremea: jumătate din zile senine, o treime cu nori, restul închise, cu producția lunară păstrată.',
      'Durată de folosire: GPU-uri ' + A.gpuLifeYears + ' ani, instalațiile din hală ' + A.facilityLifeYears + ', panouri ' + A.pvLifeYears + ', baterii ' + A.bessLifeYears + '.',
      'Oameni: ' + teamTotal() + ' angajați. Mentenanță: 2,5% pe an din valoarea instalațiilor și 1,5% din panouri și baterii.',
      'Zece ani: anul 1 la 50% din clienții țintă, anul 2 la 80%. Chiria unui GPU scade cu 8% pe an de vechime. GPU-uri noi în anul 6, la 80% din prețul primelor.',
      'Credit obișnuit: plătit în ' + A.loanYears + ' ani, în rate egale. Dobânda și partea de credit se aleg în capitolul „Zece ani”.',
      'Grant: planul se sprijină pe ' + num(FU.plan) + '. Treptele arătate (' + FU.steps.filter(function (g) { return g > 0; }).join(', ') + ' milioane de euro) sunt scenarii. Apelul deschis dă între ' + trim(num(FU.grantMin, 1)) + ' și ' + trim(num(FU.grantMax, 1)) + ' milioane de euro și cel mult ' + pct(FU.intensity) + ' din cheltuieli la o firmă mijlocie.',
      'Calculul pentru bancă: contracte ferme pe 3 ani pentru ' + pct(BK.firmContractsShare) + ' din capacitate, credit pentru echipamente pe 3 ani, credit pentru instalații pe 10 ani cu un an în care se plătește doar dobânda, dobândă 7%, bani proprii 35% din ce rămâne după grant.',
      'Baza: măsurători din imagini din satelit, cu eroare de circa 15%, și din harta rețelei electrice. Nimic nu este verificat la fața locului.',
      'După 10 ani am socotit că rămân jumătate din valoarea instalațiilor, 60% din panouri și 30% din baterii.',
      'O locuință consumă ' + trim(num(A.householdMWh, 1)) + ' MWh pe an.',
      'Nu sunt incluse: impozit pe profit, TVA, inflație.'
    ];
    $('assume').innerHTML = L.map(function (t) { return '<li>' + t + '</li>'; }).join('');
  }

  /* ---------- calendar si constructie pe etape ---------- */
  // ph = etapa din macheta: 0 platforma, 1 racord, 2 hala, 3 instalatii, 4 calculatoare, 5 panouri, 6 baterii, 7 pornire
  var PH = [
    { n: 'Teste de loc: coroziune, vibrații, măsurarea halei', a: 0, b: 3 }, { n: 'Studiu și discuții cu clienți', a: 0, b: 5 },
    { n: 'Aviz de racordare și autorizații', a: 2, b: 13 }, { n: 'Finanțare: bancă și fonduri europene', a: 3, b: 13 },
    { n: 'Proiectare și comenzi de echipamente', a: 7, b: 14 }, { n: 'Platforma din curte', a: 13, b: 15, ph: 0 },
    { n: 'Reamenajarea halei', a: 13, b: 18, ph: 2 }, { n: 'Racord la 20 kV și post de transformare', a: 14, b: 19, ph: 1 },
    { n: 'Panouri pe acoperișuri', a: 16, b: 20, ph: 5 }, { n: 'Răcire, generatoare, tablouri', a: 17, b: 21, ph: 3 },
    { n: 'Baterii', a: 19, b: 21, ph: 6, bess: true }, { n: 'Calculatoare', a: 20, b: 22.5, ph: 4 }, { n: 'Probe și primul client', a: 22, b: 23, ph: 7 }
  ];
  function calT() { return CAL_TOTAL; }
  function phases() { return PH.filter(function (p) { return !p.bess || st.bess > 0; }); }
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
  var PICK_NAME = { building: 'Hala centrului de date', sub: 'Post de transformare', gen: 'Generatoare de rezervă', cool: 'Răcitoare', pv: 'Panouri pe acoperișuri', bess: 'Baterii', fiber: 'Fibră optică' };
  var PART_NAME = { r_gpu: 'GPU cu placă de răcire', r_cool: 'Lichid rece și cald', r_net: 'Comutator de rețea', r_srv: 'Server cu 8 GPU-uri', r_pow: 'Alimentare' };
  // etichetele locului: se vad doar in capitolul „Locul”
  var PLACE_NAME = { p_long: 'Restul halei lungi', p_hall2: 'Hala liberă 2', p_yardA: 'Curtea A: aici stau instalațiile', p_yardB: 'Curtea B', p_rail: 'Triajul de cale ferată', p_gate: 'Poarta', p_line: 'Linie de 110 kV', p_chem: 'Spre platforma chimică' };
  var PLACE_IDS = Object.keys(PLACE_NAME), OBJ_IDS = Object.keys(PICK_NAME);
  function inPlace() { return st.ch === CH_PLACE; }
  function labelTexts() {
    return {
      building: PICK_NAME.building + ' · ' + num(cache.ph.gpus) + ' GPU-uri', pv: PICK_NAME.pv + ' · ' + mwp(st.pv),
      sub: PICK_NAME.sub, gen: PICK_NAME.gen, cool: PICK_NAME.cool, fiber: PICK_NAME.fiber
    };
  }
  // ce etichete sunt aprinse in capitolul de acum: in „Locul” raman hala centrului si etichetele locului, ca sa nu se calce intre ele
  function applyLabels() {
    if (!has3d) return;
    var place = inPlace();
    OBJ_IDS.forEach(function (id) { Scene3D.setLabelOn(id, id === 'building' ? true : id === 'bess' ? st.bess > 0 && !place : !place); });
    PLACE_IDS.forEach(function (id) { Scene3D.setLabelOn(id, place); });
    placeLoop();
  }
  // Macheta asaza singura etichetele pe care le cunoaste. Cat timp nu le cunoaste pe cele ale locului, le asezam aici, cu aceeasi camera
  // (Scene3D._cam, unghi de 38 de grade) si aceleasi ancore (Scene3D.layout().anchors). Cum scrie macheta ceva in ele, ne retragem definitiv.
  var plc = { raf: 0, own: true, last: {}, size: {}, n: 0 }, CAM_FOV = 38, PLACE_EDGE = { p_chem: 1, p_line: 1 };
  function placeEls() { return [].slice.call($('labels').querySelectorAll('.lbl.place')); }
  function placeWrite(el, hidden, tr) { el.hidden = hidden; if (tr !== null) el.style.transform = tr; plc.last[el.dataset.id] = { h: hidden, t: el.style.transform }; }
  function placeLoop() {
    cancelAnimationFrame(plc.raf); plc.raf = 0;
    if (!has3d || !plc.own) return;
    if (!inPlace()) { placeEls().forEach(function (el) { var k = plc.last[el.dataset.id]; if (k && !k.h) placeWrite(el, true, null); }); return; }
    plc.raf = requestAnimationFrame(placeStep);
  }
  function placeStep() {
    plc.raf = 0;
    if (!plc.own || !inPlace()) return;
    var els = placeEls(), i, el, k;
    for (i = 0; i < els.length; i++) {       // a scris altcineva in etichete de la ultimul nostru cadru? atunci macheta le stie si le asaza ea
      el = els[i]; k = plc.last[el.dataset.id] || { h: true, t: '' };
      if (el.hidden !== k.h || el.style.transform !== k.t) { plc.own = false; els.forEach(function (e) { e.classList.remove('edge'); }); return; }
    }
    plc.raf = requestAnimationFrame(placeStep);
    var L = Scene3D.layout && Scene3D.layout(), c = Scene3D._cam, host = $('view'), w = host.clientWidth, h = host.clientHeight;
    if (!L || !L.anchors || !c || !w || !h) { els.forEach(function (e) { placeWrite(e, true, null); }); return; }
    var hr = host.getBoundingClientRect(); if (hr.bottom < 0 || hr.top > window.innerHeight) return;       // macheta nu se vede (pe telefon, cand ai derulat la text): nu calculam nimic
    var sp = Math.sin(c.pol), cp = Math.cos(c.pol), px = c.tx + c.dist * sp * Math.sin(c.az), py = c.ty + c.dist * cp, pz = c.tz + c.dist * sp * Math.cos(c.az);
    var fx = c.tx - px, fy = c.ty - py, fz = c.tz - pz, fl = Math.sqrt(fx * fx + fy * fy + fz * fz) || 1; fx /= fl; fy /= fl; fz /= fl;
    var rx = -fz, rz = fx, rl = Math.sqrt(rx * rx + rz * rz) || 1; rx /= rl; rz /= rl;
    var ux = -rz * fy, uy = rz * fx - rx * fz, uz = rx * fy, th = Math.tan(CAM_FOV * Math.PI / 360), asp = w / h;
    var placed = [{ x: w - 58, y: 0, w: 58, h: 132 }], refresh = (plc.n++ % 45) === 0;
    [].forEach.call($('labels').querySelectorAll('.lbl:not(.place)'), function (o) { if (o.hidden) return; var r = o.getBoundingClientRect(); placed.push({ x: r.left - hr.left, y: r.top - hr.top, w: r.width, h: r.height }); });
    els.forEach(function (el) {
      var id = el.dataset.id, a = L.anchors[id];
      if (!a) { placeWrite(el, true, null); return; }
      var dx = a[0] - px, dy = a[1] - py, dz = a[2] - pz, zc = dx * fx + dy * fy + dz * fz;
      if (zc <= 0.5) { placeWrite(el, true, null); return; }
      var x = (dx * rx + dz * rz) / (zc * th * asp), y = (dx * ux + dy * uy + dz * uz) / (zc * th);
      x = (x + 1) / 2 * w; y = (1 - y) / 2 * h;
      if (el.hidden) { el.hidden = false; plc.size[id] = null; }
      if (!plc.size[id] || refresh) plc.size[id] = { w: el.offsetWidth || 90, h: el.offsetHeight || 22 };
      var sz = plc.size[id], edge = false, mx = sz.w / 2 + 8;
      if (x < 30 || x > w - 30 || y < 48 || y > h - 8) {
        if (!PLACE_EDGE[id]) { placeWrite(el, true, null); return; }
        edge = true; x = Math.max(mx, Math.min(w - mx, x)); y = Math.max(52 + sz.h, Math.min(h - 10, y));       // ce este in afara bazei ramane lipit de margine, ca un indicator de directie
      }
      var bx = x - sz.w / 2, by = y - sz.h - (edge ? 0 : 10), shift = 0, ok = false, t, q, o;
      for (t = 0; t < 6 && !ok; t++) {
        ok = true;
        for (q = 0; q < placed.length; q++) { o = placed[q]; if (bx < o.x + o.w + 4 && bx + sz.w + 4 > o.x && by - shift < o.y + o.h + 3 && by - shift + sz.h + 3 > o.y) { ok = false; break; } }
        if (!ok) shift += sz.h + 5;
      }
      if (!ok || by - shift < 44) { placeWrite(el, true, null); return; }
      placed.push({ x: bx, y: by - shift, w: sz.w, h: sz.h });
      el.classList.toggle('edge', edge); el.style.setProperty('--stem', (10 + shift) + 'px');
      placeWrite(el, false, 'translate3d(' + x.toFixed(1) + 'px,' + (y - shift).toFixed(1) + 'px,0) translate(-50%,-100%)' + (edge ? '' : ' translateY(-10px)'));
    });
  }
  function rebuild(viewInstant) {
    if (!has3d) return;
    Scene3D.build({ it: st.it, pv: st.pv, bess: st.bess });
    var t = labelTexts(); for (var id in t) Scene3D.setLabelText(id, t[id]);
    applyLabels();
    Scene3D.go(st.rack ? 'rack' : st.thermal ? 'thermal' : chapters[st.ch].getAttribute('data-view'), viewInstant);
    tick();
  }
  function clock(h) { var hh = Math.floor(h), mm = Math.round((h - hh) * 60); if (mm === 60) { hh++; mm = 0; } return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm; }
  function lab(id, on, text) { on = on && !inPlace(); Scene3D.setLabelOn(id, on); if (on) Scene3D.setLabelText(id, text); }
  // randul de calcul pentru o ora cu zecimale (pas de un sfert de ora daca modelul il da)
  function rowAt(h) {
    var d = cache.fine; h = ((h % 24) + 24) % 24;
    if (d && d.length >= 24) return d[Math.min(d.length - 1, Math.floor(h * d.length / 24))];
    return cache.day[Math.floor(h) % 24];
  }
  function simNow() {       // starea din clipa aleasa, in cuvinte simple; aceleasi texte in bara, sub grafic si in macheta
    var r = rowAt(st.hour), so = st.outage, out = so === 1 || so === 2, eps = 0.0005;
    var ch = r.charge || 0, dis = r.discharge || 0, gr = r.grid || 0, ex = r.exp || 0, soc = Math.max(0, Math.min(1, r.soc || 0));
    var night = M.sunPos(st.month, st.hour).el <= 0;
    var o = { r: r, out: out, ch: ch, dis: dis, gr: gr, ex: ex, soc: soc, eps: eps };
    o.load = mw(r.load);
    o.pv = st.pv === 0 ? 'fără panouri' : out ? 'oprite' : r.pv > eps ? 'produc ' + mw(r.pv) : night ? 'noapte, nu produc' : 'nu produc';
    // procentul este cel de la sfarsitul orei: cand se incarca sau dau curent spunem unde ajung, ca sa nu apara „100% pline, se incarca”
    o.batt = st.bess === 0 ? 'fără baterii' : out ? pct(soc) + ' pline, așteaptă' : ch > eps ? 'se încarcă cu ' + mw(ch) + ', ajung la ' + pct(soc) : dis > eps ? 'dau ' + mw(dis) + ', coboară la ' + pct(soc) : pct(soc) + ' pline, așteaptă';
    o.gridLbl = out ? 'Rețea' : ex > eps ? 'Dăm în rețea' : 'Luăm din rețea';
    o.grid = out ? 'pană de curent' : ex > eps ? mw(ex) : gr > eps ? mw(gr) : 'nimic';
    o.temp = typeof r.temp === 'number' && isFinite(r.temp) ? num(r.temp, 0) + ' °C' : '';
    return o;
  }
  function tick() {     // tot ce depinde de ora
    var o = simNow(), r = o.r, so = st.outage, out = o.out, eps = o.eps;
    $('clock').textContent = clock(st.hour);
    $('f-load').textContent = o.load; $('f-pv').textContent = o.pv; $('f-batt').textContent = o.batt; $('chip-batt').hidden = st.bess === 0;
    $('l-grid').textContent = o.gridLbl; $('f-grid').textContent = o.grid;
    $('chip-temp').hidden = !o.temp; $('f-temp').textContent = o.temp;
    $('chip-gen').hidden = !so; $('f-gen').textContent = so === 2 ? 'dau ' + mw(r.load) : so === 3 ? 'se răcesc' : outStep >= 3 ? 'pornesc' : 'gata de pornire';
    var dn = $('day-now');
    if (dn) dn.innerHTML = '<b>Ora ' + clock(st.hour) + '.</b> Consum: ' + o.load + '. Panourile: ' + o.pv + '. ' + (st.bess > 0 ? 'Bateriile: ' + o.batt + '. ' : '') + (out ? 'Rețea: pană de curent.' : o.gridLbl + ': ' + o.grid + '.') + (o.temp ? ' Afară: ' + o.temp + '.' : '');
    moveCursor();
    if (!has3d) return;
    var s = M.sunPos(st.month, st.hour); Scene3D.setSun(s.el, s.az, st.wx);
    var ref = Math.max(cache.ph.loadAvg * 1.5, 1e-6), f;
    if (Scene3D.setState) {     // macheta noua: primeste megawatii si isi regleaza singura fluxurile, bateriile si ventilatoarele
      var stt = { pvMW: out ? 0 : r.pv, loadMW: r.load, battMW: out ? 0 : o.dis - o.ch, soc: o.soc, gridMW: out ? 0 : o.gr - o.ex, genMW: so === 2 ? r.load : 0, refMW: Math.max(cache.dayRef || 0, ref) };
      if (typeof r.fan === 'number') stt.fanK = r.fan;
      if (typeof r.temp === 'number') stt.tempC = r.temp;
      Scene3D.setState(stt);
    } else {
      if ((f = Scene3D.flow('pv'))) f.set(out ? 0 : r.pv / Math.max(st.pv * 0.8, ref), 1);
      if ((f = Scene3D.flow('bess'))) { if (out) f.set(0, 1); else if (o.ch > eps) f.set(o.ch / ref, -1); else f.set(o.dis / ref, 1); }
      if ((f = Scene3D.flow('grid'))) { if (out) f.set(0, 1, Scene3D.COL.grid); else if (o.ex > eps) f.set(o.ex / (ref * 1.6), -1, Scene3D.COL.sun); else f.set(o.gr / ref, 1, Scene3D.COL.grid); }
      if ((f = Scene3D.flow('gen'))) f.set(so === 2 ? 0.85 : 0, 1);
    }
    lab('f_pv', !out && r.pv > eps, mw(r.pv));
    lab('f_bess', st.bess > 0 && !out && (o.ch > eps || o.dis > eps), o.ch > eps ? 'se încarcă ' + mw(o.ch) : 'dau ' + mw(o.dis));
    lab('f_grid', out || o.gr > eps || o.ex > eps, out ? 'pană' : o.ex > eps ? 'dăm în rețea ' + mw(o.ex) : 'luăm din rețea ' + mw(o.gr));
    lab('f_gen', so === 2, mw(r.load));
    if (st.bess > 0) Scene3D.setLabelText('bess', 'Baterii · ' + trim(num(st.bess, 2)) + ' MWh · ' + (out ? pct(o.soc) + ' pline' : o.ch > eps ? 'ajung la ' + pct(o.soc) : o.dis > eps ? 'coboară la ' + pct(o.soc) : pct(o.soc) + ' pline'));
  }

  function render() { calc(); fill(); drawOutage(); drawDay(); drawMonths(); drawMoney(); drawTen(); drawSens(); drawBank(); drawTeam(); drawCompare(); drawGantt(); tick(); syncUi(); }
  function syncUi() {
    [].forEach.call($('wx').children, function (b) { b.setAttribute('aria-pressed', +b.dataset.w === st.wx); });
    ['fund', 'fund2'].forEach(function (id) { [].forEach.call($(id).children, function (b) { b.setAttribute('aria-pressed', +b.dataset.f === st.fund); }); });
    $('month').value = st.month; $('hour').value = st.hour;
    var dk = $('dock'); if (dk) dk.classList.toggle('live', st.playing || playLeft > 0 || st.outage > 0 || chapters[st.ch].hasAttribute('data-dock') || chapters[st.ch].getAttribute('data-view') === 'power');
    $('o-pv').textContent = st.pv > 0 ? mwp(st.pv) : 'fără panouri'; $('o-bess').textContent = st.bess > 0 ? trim(num(st.bess, 2)) + ' MWh' : 'fără baterii';
    $('lg-batt').hidden = st.bess === 0;
    if (has3d) Scene3D.setLabelOn('bess', st.bess > 0 && !inPlace());
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
  /* ---------- pana de curent, pas cu pas ---------- */
  var outTimers = [], outStep = 0, OUT_AT = [0, 2200, 4600, 8200, 15500, 20500];     // clipa reala (ms) la care incepe fiecare pas cand merge singura
  function outPlan() { if (!M.outagePlan) return null; try { return M.outagePlan(st.it, st.pv, st.bess, A); } catch (e) { return null; } }
  function outSteps() {
    var p = outPlan() || {}, gs = p.genStartS || 15, gl = p.genLoadS || 45, um = p.upsMinutes || 10, rm = p.retransferMin || 5, fuel = '';
    if (p.genCount && p.genMW) fuel += ' Sunt ' + p.genCount + ' generatoare de câte ' + mw(p.genMW) + (p.genNeeded && p.genNeeded < p.genCount ? '; ajung ' + p.genNeeded + ', restul sunt rezervă' : '') + '.';
    if (p.fuelLph && p.fuelHours) fuel += ' Ard cam ' + num(Math.round(p.fuelLph / 5) * 5) + ' de litri de motorină pe oră, iar rezervorul' + (p.tankLiters ? ' de ' + num(Math.round(p.tankLiters / 100) * 100) + ' de litri' : '') + ' ajunge ' + trim(num(p.fuelHours, 0)) + ' de ore.';
    return [
      { t: 'Secunda 0', k: '0 s', h: 'Rețeaua cade.', d: 'Punctele albastre de pe cablul dinspre postul de transformare se opresc.', sc: 1, src: 'UPS-urile (bateriile mici din hală)' },
      { t: 'Aceeași clipă', k: 'UPS', h: 'UPS-urile țin calculatoarele pornite.', d: 'Preiau tot consumul fără nicio pauză și îl pot duce singure cam ' + um + ' minute. Luminițele lor devin portocalii.', sc: 1, src: 'UPS-urile (bateriile mici din hală)' },
      { t: 'Secunda ' + gs, k: gs + ' s', h: 'Generatoarele diesel pornesc.', d: 'Motoarele se turează. Până ajung la turație, UPS-urile duc în continuare tot consumul.', sc: 1, src: 'UPS-urile, generatoarele pornesc' },
      { t: 'Secunda ' + gl, k: gl + ' s', h: 'Generatoarele duc tot consumul.', d: 'Se vede fumul la coșuri și curentul portocaliu dinspre ele.' + fuel, sc: 2, src: 'generatoarele' },
      { t: 'Când revine rețeaua', k: 'revine', h: 'Centrul trece înapoi pe rețea.', d: 'Așteptăm ' + rm + ' minute ca rețeaua să fie stabilă, apoi generatoarele se răcesc și se opresc. Clienții nu au simțit nimic.', sc: 3, src: 'rețeaua; generatoarele se răcesc' }
    ];
  }
  function drawOutage() {
    var L = outSteps();
    $('outage-steps').innerHTML = L.map(function (x, i) { return '<li data-s="' + (i + 1) + '"><b>' + x.t + '.</b> ' + x.h + ' <span>' + x.d + '</span></li>'; }).join('');
    $('out-bar').innerHTML = L.map(function (x, i) { return '<button type="button" data-s="' + (i + 1) + '" aria-label="Pasul ' + (i + 1) + ': ' + x.h + '"><i></i><span>' + x.k + '</span></button>'; }).join('');
    markOutage();
  }
  function markOutage() {
    var L = outSteps(), n = L.length, step = outStep, cur = step >= 1 && step <= n ? L[step - 1] : null;
    [$('outage-steps'), $('out-bar')].forEach(function (host) {
      [].forEach.call(host.children, function (el) { var k = +el.getAttribute('data-s'); el.classList.toggle('on', k === step); el.classList.toggle('done', step > 0 && k < step); });
    });
    $('out-now').innerHTML = cur ? '<b>Pasul ' + step + ' din ' + n + '.</b> Acum centrul este ținut de: ' + cur.src + '.' : step > n ? '<b>Gata.</b> Centrul merge din nou pe rețea.' : 'Apasă butonul sau mergi pas cu pas. Centrul merge acum pe rețea.';
    $('out-prev').disabled = step < 1; $('out-next').disabled = step > n;
    $('out-prev').textContent = step === 1 ? '◀ Înapoi la normal' : '◀ Pasul dinainte';
    $('out-next').textContent = step === 0 ? 'Primul pas ▶' : step >= n ? 'Încheie ▶' : 'Pasul următor ▶';
  }
  function outSet(step) {     // 0 = normal, 1..5 = pasii, 6 = incheiat
    var L = outSteps(), n = L.length, sc = step >= 1 && step <= n ? L[step - 1].sc : 0;
    if (sc === 3 && !(has3d && Scene3D.outageInfo)) sc = 0;       // macheta veche nu are treapta de racire
    st.outage = sc; if (has3d) Scene3D.setOutage(sc);
    outStep = step; markOutage();
    if (step > n) { outStep = 0; $('out-next').disabled = false; $('out-next').textContent = 'De la început ▶'; $('out-prev').disabled = true; }
    tick(); syncUi();
  }
  function outRunning(on) { $('b-outage').setAttribute('aria-pressed', on); $('b-outage').textContent = on ? '❚❚ Pauză' : outStep > 0 ? '▶ Continuă' : 'Simulează o pană de curent'; }
  function outClear() { outTimers.forEach(clearTimeout); outTimers = []; }
  function stopOutage() {
    outClear();
    if ($('b-outage').getAttribute('aria-pressed') !== 'true' && !st.outage && !outStep) return;
    outSet(0); outRunning(false);
  }
  function outAuto(from) {     // merge singura de la pasul dat pana la capat
    outClear(); outRunning(true);
    if (has3d) { Scene3D.setAuto(false); Scene3D.go('power'); }
    var n = outSteps().length, t0 = OUT_AT[from - 1];
    outSet(from);
    for (var k = from + 1; k <= n + 1; k++) (function (k) {
      outTimers.push(setTimeout(function () { outSet(k); if (k > n) { outClear(); $('b-outage').setAttribute('aria-pressed', false); $('b-outage').textContent = 'Simulează din nou'; } }, OUT_AT[k - 1] - t0));
    })(k);
  }
  function startOutage() { outAuto(outStep >= 1 && outStep <= outSteps().length ? outStep : 1); }
  function outManual(step) {     // pas cu pas, cu mana: opreste mersul automat
    var n = outSteps().length; outClear(); if (step < 1) { stopOutage(); return; } step = Math.min(n + 1, step);
    if (has3d && step <= n) { Scene3D.setAuto(false); Scene3D.go('power'); }
    outSet(step); outRunning(false);
    if (step > n) $('b-outage').textContent = 'Simulează din nou';
  }
  function resetModes() {
    stopOutage(); stopBuild();
    if (st.rack) setRack(false, true);
    if (st.thermal) setThermal(false, true);
    if (st.buildM !== null) setBuildMonth(calT());
  }

  /* ---------- capitole ---------- */
  function isPhone() { return window.matchMedia && window.matchMedia('(max-width: 900px)').matches; }
  var REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function viewTop() { return document.querySelector('.main').getBoundingClientRect().top + window.pageYOffset - 6; }
  function toView(always) {       // pe telefon: aduce macheta in ecran cand apesi ceva care o schimba
    if (!isPhone()) return;
    var r = $('view').getBoundingClientRect();
    if (!always && r.top > -r.height * 0.35) return;
    var y = viewTop(); if (window.pageYOffset <= y) return;
    try { window.scrollTo({ top: y, behavior: REDUCED ? 'auto' : 'smooth' }); } catch (e) { window.scrollTo(0, y); }
  }
  function goChapter(i, instant) {
    i = Math.max(0, Math.min(chapters.length - 1, i));
    resetModes(); st.ch = i;
    chapters.forEach(function (c, k) { c.hidden = k !== i; });
    [].forEach.call($('toc').children, function (b, k) { b.setAttribute('aria-current', k === i); if (k === i) { var t = $('toc'); t.scrollLeft = Math.max(0, b.offsetLeft - t.clientWidth / 2 + b.clientWidth / 2); } });
    $('pos').textContent = (i + 1) + ' din ' + chapters.length; $('prev').disabled = i === 0; $('next').disabled = i === chapters.length - 1;
    $('scroll').scrollTop = 0;
    if (!instant) toView(true);      // pe telefon macheta sta in capul paginii: la capitol nou ne intoarcem la ea
    var view = chapters[i].getAttribute('data-view'), roof = view === 'inside';
    roofUi(roof);
    if (has3d) { Scene3D.setRoof(roof); Scene3D.go(view, instant); Scene3D.setAuto(view === 'overview' || view === 'hero'); }
    [].forEach.call(document.querySelectorAll('.lbl'), function (l) { l.classList.toggle('hot', PICK_CH[l.dataset.id] === i); });
    applyLabels(); if (has3d) tick();
    playUi();
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
      '<div class="ctrl"><label for="s-occ">Cât timp sunt închiriate GPU-urile</label><output id="o-occ" for="s-occ"></output><input type="range" id="s-occ" min="30" max="95" step="1" value="' + A.occupancy * 100 + '"></div></div>';
    $('fund').innerHTML = fundBtns(); $('fund2').innerHTML = fundBtns();
    $('s-pv').max = BZ.pvDrawMWp; $('s-pv').value = st.pv; $('s-bess').value = st.bess;
    drawAssumptions(); drawFund(); drawPlace();

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
      ['.hud', '.zoom', '.north', '#hint'].forEach(function (q) { var el = document.querySelector(q); if (el) el.style.display = 'none'; });
    } else {
      Scene3D.makeLabels(['building', 'pv', 'bess', 'sub', 'gen', 'cool', 'fiber'].map(function (id) { return { id: id, text: PICK_NAME[id] }; })
        .concat(['f_pv', 'f_bess', 'f_grid', 'f_gen'].map(function (id) { return { id: id, text: '', cls: 'flow' }; }))
        .concat(Object.keys(PART_NAME).map(function (id) { return { id: id, text: PART_NAME[id], cls: 'part' }; }))
        .concat(PLACE_IDS.map(function (id) { return { id: id, text: PLACE_NAME[id], cls: 'place' }; })));
      PLACE_IDS.forEach(function (id) { Scene3D.setLabelOn(id, false); });
    }
    calc(); render();
    if (has3d) { Scene3D.build({ it: st.it, pv: st.pv, bess: st.bess }); var t = labelTexts(); for (var id in t) Scene3D.setLabelText(id, t[id]); }
    goChapter(0, true); tick();

    // controale
    $('wx').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { st.wx = +b.dataset.w; render(); } });
    function fundClick(e) { var b = e.target.closest('button'); if (b) { st.fund = +b.dataset.f; render(); } }
    $('fund').addEventListener('click', fundClick); $('fund2').addEventListener('click', fundClick);
    $('cases').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var c = CASES.filter(function (x) { return x.k === b.dataset.k; })[0]; if (c) { setPO(c.p, c.o); render(); }
    });
    $('t-sens').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { setPO(+b.dataset.p, +b.dataset.o); render(); } });
    $('s-loan').addEventListener('input', function () { A.loanShare = +this.value / 100; render(); });
    $('s-int').addEventListener('input', function () { A.interest = +this.value / 100; render(); });
    $('month').addEventListener('change', function () { st.month = +this.value; render(); });
    $('hour').addEventListener('input', function () { st.hour = +this.value; stopPlay(true); tick(); });
    var deb = null;
    function sized() { render(); clearTimeout(deb); deb = setTimeout(function () { rebuild(false); }, 140); }
    $('s-pv').addEventListener('input', function () { st.pv = +this.value; sized(); });
    $('s-bess').addEventListener('input', function () { st.bess = +this.value; sized(); });
    $('money-ctrls').addEventListener('input', function (e) {
      var v = +e.target.value;
      if (e.target.id === 's-price') A.gpuHourPrice = v; else if (e.target.id === 's-occ') A.occupancy = v / 100;
      render();
    });
    $('prev').addEventListener('click', function () { goChapter(st.ch - 1); });
    $('next').addEventListener('click', function () { goChapter(st.ch + 1); });
    $('to-view').addEventListener('click', function () { toView(true); });
    if (window.IntersectionObserver) new IntersectionObserver(function (en) { var away = !en[0].isIntersecting && isPhone(); $('to-view').hidden = !away; document.querySelector('.pager').classList.toggle('away', away); }, { threshold: 0.05 }).observe($('view'));
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
    function playClick() { if (st.playing) stopPlay(); else startPlay(); }
    $('play').addEventListener('click', playClick); if ($('play2')) $('play2').addEventListener('click', playClick);
    $('speed').addEventListener('click', function () { speedI = (speedI + 1) % SPEEDS.length; playUi(); });
    $('out-prev').addEventListener('click', function () { outManual(outStep - 1); });
    $('out-next').addEventListener('click', function () { outManual((outStep || 0) + 1); toView(); });
    $('out-bar').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { outManual(+b.getAttribute('data-s')); toView(); } });
    playUi();
    $('b-rack').addEventListener('click', function () { setRack(!st.rack); toView(); });
    $('b-thermal').addEventListener('click', function () { setThermal(!st.thermal); toView(); });
    $('b-outage').addEventListener('click', function () { if (this.getAttribute('aria-pressed') === 'true') { outClear(); outRunning(false); } else { if (outStep > outSteps().length) outStep = 0; startOutage(); toView(); } });
    $('b-build').addEventListener('click', function () { if (st.building) stopBuild(); else { if (st.buildM === null) setBuildMonth(0); startBuild(); toView(); } });
    $('s-build').addEventListener('input', function () { stopBuild(); setBuildMonth(+this.value); });

    // tooltip-uri pe grafice
    function chartHover(host, attr, tipFn, clickFn) {
      host.addEventListener('pointermove', function (e) { var t = e.target; if (t.classList && t.classList.contains('hit')) showTip(tipFn(+t.getAttribute(attr)), e.clientX, e.clientY); else hideTip(); });
      host.addEventListener('pointerleave', hideTip);
      host.addEventListener('click', function (e) { var t = e.target; if (t.classList && t.classList.contains('hit')) { if (clickFn) clickFn(+t.getAttribute(attr)); else showTip(tipFn(+t.getAttribute(attr)), e.clientX, e.clientY); } });
    }
    chartHover($('c-day'), 'data-h', dayTip, function (h) { st.hour = h + 0.5; stopPlay(true); syncUi(); tick(); });
    chartHover($('c-months'), 'data-m', monthTip, function (m) { st.month = m; render(); });
    chartHover($('c-ten'), 'data-y', tenTip, null);
  }

  /* ---------- "Ruleaza 24 de ore": o zi intreaga de la ora aleasa, cu pauza, reluare si trei viteze ---------- */
  var playRaf = 0, playLast = 0, playLeft = 0, speedI = 0;
  var SPEEDS = [{ k: 1, n: 'normală' }, { k: 3, n: 'repede' }, { k: 0.4, n: 'încet' }];
  function playUi() {
    var t = st.playing ? '❚❚ Pauză' : playLeft > 0 ? '▶ Continuă' : '▶ Rulează 24 de ore';
    ['play', 'play2'].forEach(function (id) { var b = $(id); if (b) { b.setAttribute('aria-pressed', st.playing); b.textContent = t; } });
    var sp = $('speed'); if (sp) sp.textContent = 'Viteză: ' + SPEEDS[speedI].n;
    var pl = $('play-left'); if (pl) pl.textContent = st.playing || playLeft > 0 ? (playLeft > 1 ? 'Mai sunt ' + (function (n) { return n + (n >= 20 ? ' de ore' : ' ore'); })(Math.ceil(playLeft - 0.01)) + ' din 24.' : 'Ultima oră.') : '';
    var dk = $('dock'); if (dk) dk.classList.toggle('live', st.playing || playLeft > 0 || st.outage > 0 || chapters[st.ch].hasAttribute('data-dock') || chapters[st.ch].getAttribute('data-view') === 'power');
  }
  function startPlay() {
    if (playLeft <= 0) playLeft = 24;
    st.playing = true; playLast = performance.now(); var shown = Math.ceil(playLeft); playUi();
    (function loop(t) {
      if (!st.playing) return;
      var dt = Math.min(0.1, (t - playLast) / 1000 || 0), dh = dt * 1.1 * SPEEDS[speedI].k, end = dh >= playLeft; playLast = t;
      if (end) dh = playLeft;
      st.hour = (st.hour + dh) % 24; playLeft -= dh; $('hour').value = st.hour; tick();
      if (end) { playLeft = 0; st.hour = Math.round(st.hour * 4) / 4 % 24; stopPlay(true); tick(); return; }
      if (Math.ceil(playLeft) !== shown) { shown = Math.ceil(playLeft); playUi(); }
      playRaf = requestAnimationFrame(loop);
    })(playLast);
  }
  function stopPlay(reset) {     // fara argument = pauza (se poate relua); cu true = gata, urmatoarea apasare porneste o zi noua
    if (reset) playLeft = 0;
    if (st.playing) { st.playing = false; cancelAnimationFrame(playRaf); }
    playUi();
  }

  init();
})();
