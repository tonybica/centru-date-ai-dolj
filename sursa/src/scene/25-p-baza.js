  /* ---------- piese pentru baza existenta: materiale vechi, acoperisuri in doua ape, camioane ---------- */
  function bazaMats() {
    if (SH.bzConc) return;
    var R = rng(41);
    TEX.bzSheet = canvasTex(256, 256, function (g, w, h) {        // tabla cutata veche: 8 m pe repetare, cute la 25 cm, foi de 1 m
      g.fillStyle = '#efefeb'; g.fillRect(0, 0, w, h);
      var x; for (x = 0; x < w; x += 8) { g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(x, 0, 2, h); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(x + 3, 0, 2, h); }
      for (x = 0; x < w; x += 32) { g.fillStyle = 'rgba(0,0,0,' + (0.02 + R() * 0.09).toFixed(2) + ')'; g.fillRect(x, 0, 32, h); }      // foi de nuante diferite
      g.fillStyle = 'rgba(40,40,36,.22)'; g.fillRect(0, 126, w, 2);                                                                     // petrecerea foilor
      blotch(g, w, h, R, 14, '70,62,50', 20, 70, 0.2); blotch(g, w, h, R, 8, '150,90,50', 8, 30, 0.18);                                  // murdarie si rugina
      speckle(g, w, h, R, 900, ['#8a8478', '#ffffff'], 1, 2, 0.1, 0.3);
    });
    TEX.bzPlaster = canvasTex(256, 256, function (g, w, h) {      // zid vopsit si patat: 6 m pe repetare, rosturi la 3 m pe lungime si 1,5 m pe inaltime
      g.fillStyle = '#e6e0d0'; g.fillRect(0, 0, w, h);
      blotch(g, w, h, R, 14, '120,110,92', 20, 80, 0.2); blotch(g, w, h, R, 8, '250,248,240', 20, 70, 0.3);
      g.fillStyle = 'rgba(70,66,58,.38)'; g.fillRect(0, 0, 1.5, h); g.fillRect(128, 0, 1.5, h);
      var q; for (q = 0; q < 4; q++) g.fillRect(0, q * 64, w, 1.2);
      for (q = 0; q < 26; q++) { g.fillStyle = 'rgba(80,72,60,' + (0.05 + R() * 0.12).toFixed(2) + ')'; g.fillRect(R() * w, R() * h, 2 + R() * 4, 20 + R() * 60); }     // scurgeri de la ploaie
      speckle(g, w, h, R, 1200, ['#c9c2b0', '#f6f3ea'], 1, 2, 0.15, 0.4);
    });
    var ro = function (c) { return M(c, { map: TEX.bzSheet, roughness: 0.6, metalness: 0.3, uv: 8, env: 0.7 }); };
    SH.bzRoofL = ro(0xf6f3ea); SH.bzRoofM = ro(0x90959a); SH.bzRoofD = ro(0x50555a); SH.bzRoofG = ro(0x5f9a6a);
    TEX.bzGround = canvasTex(512, 512, function (g, w, h) {       // pietris batut si pamant, 26 m pe repetare: pete mari umede si prafuite, fara model care sa se vada repetat
      g.fillStyle = '#a9a394'; g.fillRect(0, 0, w, h);
      blotch(g, w, h, R, 16, '92,88,78', 60, 190, 0.2); blotch(g, w, h, R, 14, '196,188,168', 50, 170, 0.22); blotch(g, w, h, R, 40, '84,80,72', 10, 50, 0.16); blotch(g, w, h, R, 30, '205,198,180', 10, 44, 0.16);
      speckle(g, w, h, R, 16000, ['#8d887c', '#bab4a6', '#7b766b', '#c9c4b6', '#6b665c'], 1, 2.4, 0.3, 0.75);
    });
    SH.bzGround = M(0xffffff, { map: TEX.bzGround, roughness: 1, env: 0.3 });                                     // solul curtilor
    SH.bzWallB = M(0xffffff, { map: TEX.bzPlaster, roughness: 0.95, uv: 6, env: 0.4 });                           // zidarie vopsita, panouri de beton
    SH.bzConc = M(0xf2ece0, { map: TEX.concrete, roughness: 1, uv: 12, env: 0.3, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });        // beton vechi de drum
    SH.bzStain = M(0x2d2b27, { map: TEX.patch, transparent: true, opacity: 0.27, depthWrite: false, roughness: 1, env: 0.2, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });   // urme de roti, balti, ulei
    [[SH.bzRoofL, 0x283082, 1], [SH.bzRoofM, 0x283082, 1], [SH.bzRoofD, 0x2c348a, 1], [SH.bzRoofG, 0x283082, 1], [SH.bzGround, 0x161d58, 1], [SH.bzWallB, 0x25307e, 1], [SH.bzConc, 0x161d58, 1], [SH.bzStain, 0x10163e, 0]].forEach(function (e) {
      THERM.push({ m: e[0], hot: e[1], base: e[0].color.getHex(), map: e[2] ? e[0].map : null });
    });
  }
  // fete desenate direct, cu orientarea aleasa dupa directia `up` (ca sa nu depinda de ordinea punctelor)
  function bzQuad(a, P, up, U) {
    var e1 = [P[1][0] - P[0][0], P[1][1] - P[0][1], P[1][2] - P[0][2]], e2 = [P[3][0] - P[0][0], P[3][1] - P[0][1], P[3][2] - P[0][2]];
    var n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]], l = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]) || 1, i, n0 = a.n;
    n[0] /= l; n[1] /= l; n[2] /= l;
    if (n[0] * up[0] + n[1] * up[1] + n[2] * up[2] < 0) { P = [P[0], P[3], P[2], P[1]]; U = [U[0], U[3], U[2], U[1]]; n[0] = -n[0]; n[1] = -n[1]; n[2] = -n[2]; }
    for (i = 0; i < 4; i++) { a.pos.push(P[i][0], P[i][1], P[i][2]); a.nor.push(n[0], n[1], n[2]); a.uv.push(U[i][0], U[i][1]); }
    a.idx.push(n0, n0 + 1, n0 + 2, n0, n0 + 2, n0 + 3); a.n += 4;
  }
  function bzTri(a, P, up, U) {
    var e1 = [P[1][0] - P[0][0], P[1][1] - P[0][1], P[1][2] - P[0][2]], e2 = [P[2][0] - P[0][0], P[2][1] - P[0][1], P[2][2] - P[0][2]];
    var n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]], l = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]) || 1, i, n0 = a.n;
    n[0] /= l; n[1] /= l; n[2] /= l;
    if (n[0] * up[0] + n[1] * up[1] + n[2] * up[2] < 0) { P = [P[0], P[2], P[1]]; U = [U[0], U[2], U[1]]; n[0] = -n[0]; n[1] = -n[1]; n[2] = -n[2]; }
    for (i = 0; i < 3; i++) { a.pos.push(P[i][0], P[i][1], P[i][2]); a.nor.push(n[0], n[1], n[2]); a.uv.push(U[i][0], U[i][1]); }
    a.idx.push(n0, n0 + 1, n0 + 2); a.n += 3;
  }
  // o bucata de acoperis in doua ape, intre a0 si a1 de-a lungul coamei. Fata de sus este exact bzRoofY; o = cat iese streasina, th = grosimea
  function bzRoofPart(g, mat, b, r, a0, a1, o, th, capA, capB) {
    var a = batch.acc(g, mat, true), s = r.rise / r.half, yr = b.h + r.rise, ye = b.h - o * s, e = r.half + o, cc = r.alongX ? r.cz : r.cx, uvS = 8, L = Math.sqrt(e * e + (yr - ye) * (yr - ye)), sg;
    function P(al, c, y) { return r.alongX ? [al, y, c] : [c, y, al]; }
    for (sg = -1; sg <= 1; sg += 2) {
      var up = r.alongX ? [0, 1, sg * s] : [sg * s, 1, 0], out = r.alongX ? [0, 0, sg] : [sg, 0, 0], ce = cc + sg * e, uv = [[a0 / uvS, 0], [a1 / uvS, 0], [a1 / uvS, L / uvS], [a0 / uvS, L / uvS]];
      bzQuad(a, [P(a0, cc, yr), P(a1, cc, yr), P(a1, ce, ye), P(a0, ce, ye)], up, uv);
      bzQuad(a, [P(a0, cc, yr - th), P(a1, cc, yr - th), P(a1, ce, ye - th), P(a0, ce, ye - th)], [-up[0], -1, -up[2]], uv);
      bzQuad(a, [P(a0, ce, ye), P(a1, ce, ye), P(a1, ce, ye - th), P(a0, ce, ye - th)], out, [[a0 / uvS, 0], [a1 / uvS, 0], [a1 / uvS, th / uvS], [a0 / uvS, th / uvS]]);
      [[capA, a0, -1], [capB, a1, 1]].forEach(function (c) {
        if (!c[0]) return;
        bzQuad(a, [P(c[1], cc, yr), P(c[1], ce, ye), P(c[1], ce, ye - th), P(c[1], cc, yr - th)], r.alongX ? [c[2], 0, 0] : [0, 0, c[2]], [[0, 0], [L / uvS, 0], [L / uvS, th / uvS], [0, th / uvS]]);
      });
    }
  }
  // camioanele bazei: vopseaua este alba si primeste culoarea de la fiecare exemplar (instanceColor). Originea este mijlocul semiremorcii, botul spre +z
  function bzTractorTpl() {       // cap tractor cu doua osii, circa 6 x 2,5 x 3,9 m
    return tpl(function (g) {
      var s = Q.lite ? 6 : 10, sd, P = SH.white, K = SH.tire, rx = [0, 0, Math.PI / 2];
      box(g, 0.9, 0.26, 5.5, K, 0, 0.95, 6.6, false);                                    // sasiu
      box(g, 2.46, 3.05, 2.25, P, 0, 2.075, 8.675);                                      // cabina
      taper(g, 2.36, 0.5, 2.1, P, 0, 3.85, 8.6, 0.9, 0.55, -0.2, true);                  // deflectorul de pe cabina
      box(g, 2.2, 0.9, 0.05, SH.carGlass, 0, 2.6, 9.79, false);                          // parbriz
      for (sd = -1; sd <= 1; sd += 2) {
        box(g, 0.05, 0.75, 0.95, SH.carGlass, sd * 1.215, 2.6, 9.15, false);             // geamuri laterale
        cyl(g, 0.52, 0.52, 0.32, K, sd * 1.1, 0.52, 8.5, s, rx, false);                  // roata din fata
        cyl(g, 0.52, 0.52, 0.62, K, sd * 0.92, 0.52, 5.0, s, rx, false);                 // rotile duble din spate
        if (Q.lite) continue;                                                            // pe telefon raman doar formele mari
        box(g, 0.8, 0.05, 1.5, K, sd * 0.85, 1.105, 5.0, false);                         // aparatoare
        box(g, 0.34, 0.14, 0.05, SH.carGlass, sd * 0.9, 0.9, 9.81, false);               // faruri
        box(g, 0.1, 0.4, 0.2, K, sd * 1.28, 2.7, 9.7, false);                            // oglinzi
      }
      box(g, 1.9, 0.16, 0.16, K, 0, 0.52, 5.0, false); box(g, 0.9, 0.3, 0.6, K, 0, 0.7, 5.0, false);     // osia din spate si suspensia
      if (Q.lite) return;
      box(g, 2.48, 0.42, 0.16, K, 0, 0.6, 9.76, false);                                  // bara din fata
      box(g, 1.7, 0.7, 0.05, K, 0, 1.5, 9.79, false);                                    // grila
      cyl(g, 0.3, 0.3, 1.3, K, -0.76, 0.72, 6.75, 8, [Math.PI / 2, 0, 0], false);        // rezervor
      cyl(g, 0.5, 0.5, 0.1, K, 0, 1.13, 5.1, 8, null, false);                            // saua de cuplare
    });
  }
  function bzTrailerTpl() {       // semiremorca cu prelata, 13,6 x 2,55 x 4 m, pe trei osii, cuplata la cap
    return tpl(function (g) {
      var s = Q.lite ? 6 : 10, sd, q, K = SH.tire, rx = [0, 0, Math.PI / 2];
      box(g, 2.55, 2.7, 13.6, SH.white, 0, 2.65, 0);                                     // prelata
      box(g, 2.57, 0.14, 13.62, K, 0, 1.25, 0, false);                                   // rama platformei
      box(g, 1.0, 0.3, 9.0, K, 0, 1.03, -2.2, false);                                    // lonjeroane
      box(g, 0.9, 0.4, 3.4, K, 0, 0.7, -3.78, false);                                    // suspensia celor trei osii
      if (!Q.lite) for (q = 0; q < 3; q++) box(g, 2.0, 0.14, 0.14, K, 0, 0.5, -5.1 + q * 1.32, false);
      for (sd = -1; sd <= 1; sd += 2) {
        for (q = 0; q < 3; q++) cyl(g, 0.5, 0.5, 0.4, K, sd * 1.03, 0.5, -5.1 + q * 1.32, s, rx, false);
        if (Q.lite) continue;
        box(g, 0.05, 0.6, 5.2, K, sd * 1.25, 0.88, 0.6, false);                          // bare laterale de protectie
        box(g, 0.12, 0.85, 0.12, K, sd * 0.65, 0.76, 4.0, false); box(g, 0.3, 0.04, 0.3, K, sd * 0.65, 0.33, 4.0, false);      // picioarele de sprijin, ridicate
        box(g, 0.1, 0.66, 0.1, K, sd * 0.8, 0.85, -6.72, false);
      }
      if (!Q.lite) box(g, 2.4, 0.14, 0.12, K, 0, 0.55, -6.72, false);                    // bara din spate
    });
  }
  function bzCarTpl() {           // autoturism simplu, lung pe z, cu botul spre +z
    return tpl(function (g) {
      var s = Q.lite ? 6 : 10, sd, e, rx = [0, 0, Math.PI / 2];
      box(g, 1.76, 0.2, 4.36, SH.tire, 0, 0.36, 0, false);                               // praguri si bare
      taper(g, 1.8, 0.62, 4.3, SH.white, 0, 0.61, 0, 0.94, 0.97, 0, true);               // caroserie
      taper(g, 1.62, 0.5, 2.6, SH.carGlass, 0, 1.17, -0.3, 0.82, 0.7, -0.03, true);      // geamuri
      box(g, 1.36, 0.05, 1.84, SH.white, 0, 1.44, -0.38);                                // plafon
      for (sd = -1; sd <= 1; sd += 2) for (e = -1; e <= 1; e += 2) cyl(g, 0.33, 0.33, 0.24, SH.tire, sd * 0.8, 0.33, e * 1.36, s, rx, false);
    });
  }
