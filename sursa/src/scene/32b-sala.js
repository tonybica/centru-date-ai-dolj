    // rackuri: perechi de randuri spate in spate (culoar cald la mijloc)
    var nGpu = Math.ceil(p.it * 1000 / 45), nAll = nGpu + Math.ceil(nGpu * 0.3);
    var hallW = xO - xE - 3, hallD = D - 5, perRowMax = Math.max(2, Math.min(24, Math.floor(hallD / 0.62)));
    var pairs = Math.max(1, Math.ceil(nAll / (2 * perRowMax))); while (pairs * 5.4 > hallW && pairs > 1) pairs--;
    var perRow = Math.ceil(nAll / (pairs * 2));
    // rackul GPU are sus doua furtunuri care urca la colectoarele de rand (albastru = rece, rosu = cald)
    var rackT = tpl(function (g) {
        box(g, 1.2, 2.2, 0.6, SH.rackBody, 0, 0, 0); vpl(g, 0.58, 2.16, SH.rackFront, 0.603, 0, 0, Math.PI / 2);
        cyl(g, 0.02, 0.02, 0.28, SH.blue, -0.44, 1.24, -0.2, 6, null, false); cyl(g, 0.02, 0.02, 0.28, SH.red, -0.56, 1.24, 0.2, 6, null, false);
      }),
      rackT2 = tpl(function (g) { box(g, 1.2, 2.2, 0.6, SH.rackAlt, 0, 0, 0); vpl(g, 0.58, 2.16, SH.rackFront, 0.603, 0, 0, Math.PI / 2); });
    var rk = inst(itg, rackT, nGpu), rk2 = inst(itg, rackT2, Math.max(1, nAll - nGpu));
    var hallCx = (xE + xO) / 2, n1 = 0, n2 = 0, rowLen = perRow * 0.62, rackPos = [hallCx + (pairs - 1) * 2.7 + 1.2, rowLen / 2 - 0.31];
    var hz = rowLen / 2 + 1.2, hx0 = hallCx - (pairs - 1) * 2.7 - 2.1, hx1 = W / 2, hzz = -Math.min(hz + 0.9, D / 2 - 0.8);

    // unelte mici pentru sala: tevi pe cele trei axe, cot, stalp cu talpa, jgheab de cabluri cu margini
    function salaPX(m, r, z, y, xa, xb) { cyl(itx, r, r, Math.abs(xb - xa), m, (xa + xb) / 2, y, z, 10, [0, 0, Math.PI / 2], false); }
    function salaPY(m, r, x, z, ya, yb) { cyl(itx, r, r, Math.abs(yb - ya), m, x, (ya + yb) / 2, z, 8, null, false); }
    function salaPZ(m, r, x, y, za, zb) { cyl(itx, r, r, Math.abs(zb - za), m, x, y, (za + zb) / 2, 8, [Math.PI / 2, 0, 0], false); }
    function salaCot(m, r, x, y, z) { sph(itx, r * 1.06, m, x, y, z, false, 1, 0); }
    function salaPost(x, z, yTop) { box(itx, 0.08, yTop - 0.3, 0.08, SH.steel, x, (yTop + 0.3) / 2, z, false); box(itx, 0.22, 0.02, 0.22, SH.dark, x, 0.31, z, false); }
    function salaTray(alongX, a, b, c, w) {       // a..b pe axa lunga, c = pozitia pe cealalta axa; fundul sta la 2,72 pe grinzi
      var len = b - a, mid = (a + b) / 2;
      if (alongX) {
        box(itx, len, 0.015, w, SH.steel, mid, 2.7275, c, false); box(itx, len, 0.07, 0.02, SH.steel, mid, 2.755, c - w / 2, false); box(itx, len, 0.07, 0.02, SH.steel, mid, 2.755, c + w / 2, false);
        box(itx, len, 0.035, w * 0.6, SH.dark, mid, 2.752, c, false);
      } else {
        box(itx, w, 0.015, len, SH.steel, c, 2.7275, mid, false); box(itx, 0.02, 0.07, len, SH.steel, c - w / 2, 2.755, mid, false); box(itx, 0.02, 0.07, len, SH.steel, c + w / 2, 2.755, mid, false);
        box(itx, w * 0.6, 0.035, len, SH.dark, c, 2.752, mid, false);
      }
    }

    // grila de sustinere: cadre din stalpi si grinzi, asezate pe podea, care duc tot ce trece pe deasupra rackurilor
    var zCt = rowLen / 2 + 1.0, sZ = [-rowLen / 2 - 0.035], sN = Math.max(2, Math.ceil((rowLen + 1.035) / 3.2));
    for (i = 1; i < sN; i++) sZ.push(-rowLen / 2 + Math.min(perRow - 2, Math.max(1, Math.round(i * (rowLen + 1.035) / sN / 0.62))) * 0.62);
    sZ.push(zCt);
    var gxa = hallCx - (pairs - 1) * 2.7 - 2.9, gxb = hallCx + (pairs - 1) * 2.7 + 2.9;
    sZ.forEach(function (z) { box(itx, gxb - gxa, 0.08, 0.07, SH.steel, (gxa + gxb) / 2, 2.68, z, false); });

    for (var pr = 0; pr < pairs; pr++) {
      var px = hallCx + (pr - (pairs - 1) / 2) * 5.4;
      for (var side = 0; side < 2; side++) {
        var sg = side ? 1 : -1, rx = px + sg * 1.2, lastRow = pr === pairs - 1 && side === 1;
        for (i = 0; i < perRow; i++) {
          var ix = lastRow ? perRow - 1 - i : i, zr = -rowLen / 2 + (ix + 0.5) * 0.62;       // ultimul rand se umple dinspre sud, unde sta rackul desenat in detaliu
          if (!(lastRow && i === 0)) {
            if (n1 + n2 >= nAll - 1) break;
            mtx.compose(pos.set(rx, 1.4, zr), side ? q0 : qPi, one);
            if ((ix === 0 || ix === perRow - 1) && n2 < nAll - nGpu) rk2.setMatrixAt(n2++, mtx); else if (n1 < nGpu - 1) rk.setMatrixAt(n1++, mtx); else rk2.setMatrixAt(n2++, mtx);
          }
          // cutia de derivatie de pe bara de curent si cablul ei care intra in rack
          box(itx, 0.16, 0.14, 0.26, SH.dark, rx + sg * 0.4, 2.65, zr, false); box(itx, 0.035, 0.09, 0.035, SH.dark, rx + sg * 0.4, 2.54, zr, false);
        }
        // stalpii cadrelor, la linia din fata rackurilor, si legatura lor pe lungime
        sZ.forEach(function (z) { salaPost(px + sg * 1.86, z, 2.64); });
        box(itx, 0.06, 0.06, zCt - sZ[0], SH.steel, px + sg * 1.86, 2.67, (zCt + sZ[0]) / 2, false);
        // deasupra randului, pe grinzi: jgheab de cabluri, canal galben de fibra, bara de curent
        salaTray(false, -rowLen / 2 - 0.07, zCt - 0.235, rx - sg * 0.12, 0.3);
        box(itx, 0.1, 0.1, zCt + 0.02 + rowLen / 2, SH.stripe, rx + sg * 0.14, 2.84, (zCt - 0.12 - rowLen / 2) / 2, false);
        sZ.forEach(function (z) { if (z < zCt) box(itx, 0.06, 0.07, 0.07, SH.steel, rx + sg * 0.14, 2.755, z, false); });
        box(itx, 0.1, 0.1, 0.1, SH.stripe, rx + sg * 0.14, 2.8, zCt - 0.1, false);
        box(itx, 0.18, 0.13, zCt - 0.43 + rowLen / 2, SH.white, rx + sg * 0.4, 2.785, (zCt - 0.57 - rowLen / 2) / 2);
        box(itx, 0.24, 0.2, 0.3, SH.dark, rx + sg * 0.4, 2.8, zCt - 0.385, false);
        // unitatea care imparte lichidul de racire (CDU), la capatul de nord al randului
        var zc = -rowLen / 2 - 0.47, cf = rx + sg * 0.6;
        box(itx, 1.2, 2.2, 0.8, SH.white, rx, 1.4, zc); box(itx, 1.24, 0.16, 0.84, SH.blue, rx, 2.16, zc, false);
        box(itx, 0.02, 0.2, 0.3, SH.screen, cf + sg * 0.012, 1.7, zc, false); box(itx, 0.02, 1.2, 0.03, SH.dark, cf + sg * 0.012, 1.0, zc + 0.3, false);
        box(itx, 0.02, 0.5, 0.6, SH.dark, cf + sg * 0.012, 0.7, zc - 0.02, false);
        // circuitul rackurilor: din CDU urca doua tevi si merg de-a lungul randului, pe grinzi
        [[SH.blue, rx - sg * 0.44], [SH.red, rx - sg * 0.56]].forEach(function (e) {
          salaPY(e[0], 0.04, e[1], zc + 0.15, 2.5, 2.76); salaCot(e[0], 0.04, e[1], 2.76, zc + 0.15);
          salaPZ(e[0], 0.04, e[1], 2.76, zc + 0.15, rowLen / 2 - 0.08);
          cyl(itx, 0.05, 0.05, 0.03, SH.steel, e[1], 2.76, rowLen / 2 - 0.07, 8, [Math.PI / 2, 0, 0], false);
          cyl(itx, 0.06, 0.06, 0.025, SH.steel, e[1], 2.512, zc + 0.15, 8, null, false);
        });
        // circuitul cladirii: ramuri cu robinet din colectoarele de la nord pana in CDU
        [[SH.blue, rx + sg * 0.15, hzz], [SH.red, rx + sg * 0.38, hzz + 0.35]].forEach(function (e) {
          salaPY(e[0], 0.055, e[1], e[2], 2.6, 2.9); salaCot(e[0], 0.055, e[1], 2.6, e[2]);
          salaPZ(e[0], 0.055, e[1], 2.6, e[2], zc - 0.18); salaCot(e[0], 0.055, e[1], 2.6, zc - 0.18);
          salaPY(e[0], 0.055, e[1], zc - 0.18, 2.5, 2.6);
          cyl(itx, 0.075, 0.075, 0.025, SH.steel, e[1], 2.512, zc - 0.18, 8, null, false);
          var vz = zc - 0.68;                                                                    // robinet cu maneta
          cyl(itx, 0.08, 0.08, 0.14, SH.steel, e[1], 2.6, vz, 10, [Math.PI / 2, 0, 0], false); box(itx, 0.025, 0.1, 0.025, SH.steel, e[1], 2.72, vz, false); box(itx, 0.03, 0.025, 0.22, SH.stripe, e[1], 2.775, vz + 0.07, false);
        });
      }
      // culoarul cald inchis: podea marcata, usi la capete, tavan
      flat(itx, 1.2, rowLen + 0.9, SH.hot, px, 0.33, -0.45);
      flat(itx, 1.8, zCt - sZ[0], SH.cold, px - 2.7, 0.33, (zCt + sZ[0]) / 2);
      [-rowLen / 2 - 0.9, rowLen / 2 + 0.03].forEach(function (z) { box(itx, 1.2, 2.2, 0.05, SH.contain, px, 1.4, z, false); box(itx, 1.3, 0.08, 0.1, SH.steel, px, 2.54, z, false); box(itx, 0.04, 2.2, 0.06, SH.steel, px - 0.62, 1.4, z, false); box(itx, 0.04, 2.2, 0.06, SH.steel, px + 0.62, 1.4, z, false); });
      box(itx, 1.2, 0.05, rowLen + 0.93, SH.contain, px, 2.53, -0.435, false);
      // linii galbene pe podea in fata rackurilor, detectoare de fum sub grinzi, cablu de detectie a scurgerilor in jurul CDU-urilor
      for (sd = -1; sd <= 1; sd += 2) {
        flat(itx, 0.06, zCt - sZ[0], SH.stripe, px + sd * 2.02, 0.306, (zCt + sZ[0]) / 2);
        flat(itx, 1.3, 0.025, SH.stripe, px + sd * 1.2, 0.306, -rowLen / 2 - 0.95); flat(itx, 0.025, 0.9, SH.stripe, px + sd * 1.86, 0.306, -rowLen / 2 - 0.5);
        box(itx, 0.1, 0.14, 0.04, SH.dark, px + sd * 1.6, 0.5, -rowLen / 2 - 0.89, false);
      }
      sZ.forEach(function (z, n) { if (n > 0 && z < zCt) { cyl(itx, 0.06, 0.06, 0.045, SH.white, px, 2.617, z, 10); } });
      // benzi de lumina prinse sub grinzi, deasupra culoarelor reci
      box(itx, 0.12, 0.05, zCt - sZ[0], SH.light, px - 2.7, 2.615, (zCt + sZ[0]) / 2, false);
    }
    box(itx, 0.12, 0.05, zCt - sZ[0], SH.light, gxb - 0.2, 2.615, (zCt + sZ[0]) / 2, false);
    flat(itx, 1.8, zCt - sZ[0], SH.cold, gxb - 0.2, 0.33, (zCt + sZ[0]) / 2);
    rk.count = n1; rk2.count = n2; rk.instanceMatrix.needsUpdate = true; rk2.instanceMatrix.needsUpdate = true;
    var rackD = rackDetail(itg, rackPos[0], rackPos[1]);

    // jgheabul transversal de la sala electrica (peretele xE) pana la ultimul rand, pe cadrul de la sud
    (function () {
      var xw = xE + 0.125, xl = rackPos[0] + 0.35, tp = [], gap = gxa - xw;
      salaTray(true, xw, xl, zCt, 0.45);
      box(itx, 0.22, 0.06, 0.5, SH.steel, xw + 0.11, 2.69, zCt, false); box(itx, 0.05, 0.4, 0.5, SH.steel, xw + 0.025, 2.5, zCt, false);      // consola de perete
      if (gap > 3.6) {       // stalpi in T pe portiunea fara cadre, feriti de drumul de la usa de incarcare
        if (xD - 1.9 > xw + 0.8) tp.push(xD - 1.9);
        if (xD + 1.9 < gxa - 0.8) tp.push(xD + 1.9);
        if (!tp.length) tp.push(xw + gap / 2);
      }
      tp.forEach(function (x) { salaPost(x, zCt, 2.64); box(itx, 0.08, 0.08, 0.6, SH.steel, x, 2.68, zCt, false); });
    })();

    // colectoarele cladirii (apa rece albastru, apa calda rosu): vin prin peretele de est si stau pe stalpi in T
    cyl(itx, 0.11, 0.11, hx1 - hx0, SH.blue, (hx0 + hx1) / 2, 2.9, hzz, 12, [0, 0, Math.PI / 2], false); cyl(itx, 0.11, 0.11, hx1 - hx0, SH.red, (hx0 + hx1) / 2, 2.9, hzz + 0.35, 12, [0, 0, Math.PI / 2], false);
    (function () {
      var ts = [], x, n, k2;
      for (pr = 0; pr < pairs; pr++) { x = hallCx + (pr - (pairs - 1) / 2) * 5.4; ts.push(x - 0.9, x + 0.9); }
      x = ts[ts.length - 1]; n = Math.ceil((xO - x) / 3.6);
      for (k2 = 1; k2 < n; k2++) ts.push(x + (xO - x) * k2 / n);
      n = Math.ceil((W / 2 - 0.4 - xO) / 5.2);                                                   // in zona birourilor, cat mai putini stalpi
      for (k2 = 1; k2 < n; k2++) ts.push(xO + (W / 2 - 0.4 - xO) * k2 / n);
      ts.forEach(function (tx) {
        salaPost(tx, hzz + 0.175, 2.71); box(itx, 0.08, 0.08, 0.8, SH.steel, tx, 2.75, hzz + 0.175, false);
        cyl(itx, 0.125, 0.125, 0.04, SH.dark, tx, 2.9, hzz, 10, [0, 0, Math.PI / 2], false); cyl(itx, 0.125, 0.125, 0.04, SH.dark, tx, 2.9, hzz + 0.35, 10, [0, 0, Math.PI / 2], false);
      });
      [hzz, hzz + 0.35].forEach(function (z) {
        cyl(itx, 0.16, 0.16, 0.04, SH.steel, hx0, 2.9, z, 12, [0, 0, Math.PI / 2], false);                                                   // flansa oarba la capat
        cyl(itx, 0.15, 0.15, 0.03, SH.steel, xO - 0.14, 2.9, z, 12, [0, 0, Math.PI / 2], false); cyl(itx, 0.15, 0.15, 0.03, SH.steel, xO + 0.14, 2.9, z, 12, [0, 0, Math.PI / 2], false);   // trecerea prin peretele birourilor
        cyl(itx, 0.17, 0.17, 0.04, SH.steel, W / 2 - 0.42, 2.9, z, 12, [0, 0, Math.PI / 2], false);                                          // rozeta la peretele de est
      });
    })();

    // butelii de stingere cu gaz, prinse de perete, cu teava lor comuna
    for (i = 0; i < 4; i++) { cyl(itx, 0.16, 0.16, 1.6, SH.red, xE + 0.4, 1.1, D / 2 - 1.2 - i * 0.45, 10, null, false); sph(itx, 0.16, SH.red, xE + 0.4, 1.9, D / 2 - 1.2 - i * 0.45, false, 0.5, 0); cyl(itx, 0.04, 0.04, 0.22, SH.steel, xE + 0.4, 2.06, D / 2 - 1.2 - i * 0.45, 6, null, false); }
    box(itx, 0.05, 0.05, 1.9, SH.steel, xE + 0.21, 1.5, D / 2 - 1.875, false); box(itx, 0.1, 0.05, 0.05, SH.steel, xE + 0.17, 1.5, D / 2 - 1.0, false); box(itx, 0.1, 0.05, 0.05, SH.steel, xE + 0.17, 1.5, D / 2 - 2.75, false);
    salaPZ(SH.red, 0.03, xE + 0.4, 2.17, D / 2 - 1.2, D / 2 - 2.9); salaCot(SH.red, 0.03, xE + 0.4, 2.17, D / 2 - 2.9);
    cyl(itx, 0.03, 0.03, 0.26, SH.red, xE + 0.27, 2.17, D / 2 - 2.9, 8, [0, 0, Math.PI / 2], false); cyl(itx, 0.05, 0.03, 0.08, SH.steel, xE + 0.5, 2.17, D / 2 - 2.9, 8, [0, 0, Math.PI / 2], false);
    if (D / 2 - 2.4 > rowLen / 2 + 1.5) {
      box(itx, 1.2, 0.14, 1.0, SH.wood, xD, 0.37, D / 2 - 2.2, false); box(itx, 1.05, 0.9, 0.9, SH.box, xD, 0.89, D / 2 - 2.2);
      box(itx, 1.2, 0.14, 1.0, SH.wood, xD + 1.6, 0.37, D / 2 - 2.0, false); box(itx, 0.7, 2.0, 0.85, SH.rackAlt, xD + 1.6, 1.44, D / 2 - 2.0);
    }
