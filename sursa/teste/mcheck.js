var M = require(process.argv[2] || '../src/model.js'), A = M.A;
function r(x, n) { return +x.toFixed(n == null ? 2 : n); }
function run(k, P, O, G) {
  var s = M.SCEN[k], a = {}; for (var q in A) a[q] = A[q]; if (P) a.gpuHourPrice = P; if (O) a.occupancy = O;
  var y = M.simulateYear(s.it, s.pv, s.bess, a), f = M.finance(s.it, s.pv, s.bess, a, 'cloud', y), fu = M.funding(G || 0, f), t = M.tenYear(s.it, s.pv, s.bess, a, 'cloud', y, fu);
  return { k: k, P: a.gpuHourPrice, O: a.occupancy, G: fu.grant, cov: r(y.coverage * 100, 1), load: r(y.load, 0), grid: r(y.grid, 0), pv: r(y.pv, 0), exp: r(y.exp, 0), capex: r(f.capex.total), fac: r(f.capex.facility), rev: r(f.rev.total), opexE: r(f.opex.energy), ebitda: r(f.ebitda), profit: r(f.profit), eq: r(t.equity), loan: r(t.loan), be: t.breakeven, cum10: r(t.rows[10].cum), low: r(t.low), irr: t.irr == null ? null : r(t.irr * 100, 1), solarSave: r(f.solarSaving), solarPb: r(f.solarPayback, 1) };
}
console.log(JSON.stringify(M.physical(1, 1.2, 0, A)));
[['mediu'], ['mediu', 0, 0, 5], ['mediu', 0, 0, 10], ['mediu', 4.5, 0.75], ['mediu', 4.5, 0.75, 5], ['mediu', 4.5, 0.75, 10], ['mediu', 6, 0.9], ['pilot'], ['pilot', 4.5, 0.75]].forEach(function (c) { console.log(JSON.stringify(run.apply(null, c))); });
var s4 = M.simulateYear(1, 1.2, 4, A); console.log('cu 4 MWh baterii: acoperire', r(s4.coverage * 100, 1), 'exp', r(s4.exp, 0));
var s15 = M.simulateYear(1, 1.5, 0, A); console.log('1,5 MWp: acoperire', r(s15.coverage * 100, 1), 'exp', r(s15.exp, 0));
console.log('yield an', r(M.YIELD.reduce(function (x, y) { return x + y; }, 0), 0));
