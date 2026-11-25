  /* ---------- peisaj: copaci, case de sat, semne de drum ---------- */
  function peisajMats() {                     // materiale folosite doar de peisaj: lan de porumb si lan de floarea-soarelui
    if (SH.maize) return;
    var Rm = rng(77);
    TEX.maize = canvasTex(256, 256, function (g, w, h) {
      g.fillStyle = '#44692d'; g.fillRect(0, 0, w, h);
      blotch(g, w, h, Rm, 8, '0,0,0', 30, 90, 0.12); blotch(g, w, h, Rm, 8, '225,255,170', 30, 90, 0.08);
      g.fillStyle = '#31541f'; for (var y = 0; y < h; y += 16) g.fillRect(0, y, w, 6);
      speckle(g, w, h, Rm, 3000, ['#557f35', '#2c4c1e', '#6c9440', '#b5a35c'], 1, 3, 0.25, 0.6);
    });
    TEX.sunfl = canvasTex(256, 256, function (g, w, h) {
      g.fillStyle = '#5c782f'; g.fillRect(0, 0, w, h);
      blotch(g, w, h, Rm, 8, '0,0,0', 30, 90, 0.1); blotch(g, w, h, Rm, 8, '255,240,150', 30, 90, 0.1);
      g.fillStyle = '#496426'; for (var y = 0; y < h; y += 16) g.fillRect(0, y, w, 6.5);
      speckle(g, w, h, Rm, 5200, ['#e6c021', '#f0d132', '#d8a818', '#718f39'], 1.5, 3.2, 0.5, 0.95);
    });
    SH.maize = M(0xffffff, { map: TEX.maize, roughness: 1, env: 0.25 }); SH.sunfl = M(0xffffff, { map: TEX.sunfl, roughness: 1, env: 0.25 });
    [SH.maize, SH.sunfl].forEach(function (m) { THERM.push({ m: m, hot: 0x121844, base: m.color.getHex(), map: m.map }); });
  }
  function treeTpl(kind) {                    // la inaltimea reala: plop de aliniament 22 m, salcam sau nuc 11 m, brad 9 m; coroane cu denivelari
    var d2 = Q.lite ? 1 : 2;
    return tpl(function (g) {
      if (kind === 'poplar') {
        cyl(g, 0.2, 0.36, 5.2, SH.trunk, 0, 2.6, 0, 6);
        lump(g, SH.leaf, 0, 13.2, 0, 2.3, 9.2, 2.2, 0.4, d2, 1.3); lump(g, SH.leaf, 0.35, 7.0, 0.3, 1.9, 4.0, 1.85, 2.1, 1, 4.1);
      } else if (kind === 'conifer') {
        cyl(g, 0.18, 0.3, 2.2, SH.trunk, 0, 1.1, 0, 6);
        [[2.3, 2.6, 2.7, 0.1, 0], [2.0, 2.4, 4.0, -0.08, 0.08], [1.7, 2.3, 5.2, 0.06, -0.06], [1.35, 2.1, 6.4, -0.04, 0.03], [1.0, 2.0, 7.5, 0.03, 0.02], [0.6, 1.9, 8.6, 0, 0]].forEach(function (q, n) {
          cyl(g, 0.01, q[0], q[1], SH.leaf, q[3], q[2], q[4], Q.lite ? 7 : 9, [0, n * 0.7, 0]);
        });
      } else {
        cyl(g, 0.24, 0.42, 4.2, SH.trunk, 0, 2.1, 0, 6);
        beam(g, SH.trunk, 0, 3.0, 0, 1.6, 5.4, 0.6, 0.22, false);
        lump(g, SH.leaf, 0, 7.6, 0, 3.9, 3.3, 3.7, 0.5, d2, 2.4); lump(g, SH.leaf, 1.9, 6.0, 1.1, 2.5, 2.0, 2.4, 1.4, 1, 5.2);
      }
    });
  }
  // casa de sat sau hala de ferma: pereti pe soclu, acoperis in doua ape, usa, ferestre si horn; fata e latura lunga dinspre sud (sau est, cand e lunga pe z)
  function casa(g, x, z, len, dep, hw, wallM, roofM, alongZ, barn) {
    house(g, x, z, len, dep, hw, wallM, roofM, alongZ);
    function at(u, y, w, h, m, off) {         // placa subtire pe fata: u = pozitia de-a lungul casei
      if (alongZ) box(g, 0.06, h, w, m, x + dep / 2 + (off || 0.02), y, z + u); else box(g, w, h, 0.06, m, x + u, y, z + dep / 2 + (off || 0.02));
    }
    if (alongZ) box(g, dep + 0.16, 0.35, len + 0.16, SH.base, x, 0.175, z); else box(g, len + 0.16, 0.35, dep + 0.16, SH.base, x, 0.175, z);
    if (barn) {                               // hala: doua porti mari si un sir de ferestre inguste sus
      at(-len * 0.22, 1.75, 3.6, 3.5, SH.trim); at(len * 0.22, 1.75, 3.6, 3.5, SH.trim);
      for (var b = -2; b <= 2; b++) at(b * len / 5.5, hw - 0.6, 1.6, 0.5, SH.glass, 0.03);
      return;
    }
    var n = Math.max(3, Math.round(len / 2.8)), u0 = -len / 2, st = len / n, dj = Math.floor(n / 2);
    for (var q = 0; q < n; q++) {
      var u = u0 + (q + 0.5) * st;
      if (q === dj) { at(u, 1.37, 0.95, 2.05, SH.trim); at(u, 0.26, 1.5, 0.18, SH.base, 0.3); }      // usa si treapta
      else { at(u, 1.72, 0.95, 1.15, SH.glass); at(u, 1.1, 1.1, 0.08, SH.white, 0.05); }               // fereastra si pervaz
    }
    var hy = hw + dep * 0.32 * 0.55 + 0.45;                                                              // hornul iese prin acoperis
    if (alongZ) box(g, 0.5, 1.5, 0.5, SH.tileRoof, x - dep * 0.14, hy, z + len * 0.22); else box(g, 0.5, 1.5, 0.5, SH.tileRoof, x + len * 0.22, hy, z - dep * 0.14);
  }
  // indicator rutier pe stalp, la marginea drumului national; face = +1 priveste spre est (pentru cei care vin dinspre est), -1 spre vest
  function semn(g, x, z, kind, face) {
    cyl(g, 0.035, 0.035, 2.75, SH.silver, x, 1.375, z, 6);
    box(g, 0.3, 0.25, 0.3, SH.base, x, 0.125, z);                                                 // fundatia de beton
    var fx = x + face * 0.04;
    if (kind === 0) {                         // triunghi de avertizare: intersectie cu drum fara prioritate
      cyl(g, 0.56, 0.56, 0.02, SH.red, fx, 2.2, z, 3, [-Math.PI / 2, 0, Math.PI / 2]); cyl(g, 0.4, 0.4, 0.024, SH.white, fx + face * 0.012, 2.2, z, 3, [-Math.PI / 2, 0, Math.PI / 2]);
    } else {                                  // rotund: limita de viteza
      cyl(g, 0.36, 0.36, 0.02, SH.red, fx, 2.3, z, 18, [0, 0, Math.PI / 2]); cyl(g, 0.27, 0.27, 0.024, SH.white, fx + face * 0.012, 2.3, z, 18, [0, 0, Math.PI / 2]);
    }
  }
  function borna(g, x, z) {                   // borna kilometrica de drum national: alba, cu capul rosu
    box(g, 0.3, 0.55, 0.22, SH.white, x, 0.275, z); box(g, 0.31, 0.2, 0.23, SH.red, x, 0.65, z);
  }
