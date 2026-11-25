    // statie electrica si linia din retea
    // mare: celula de 110 kV (portal, transformator de tensiune, separator, intrerupator, transformator de curent, descarcatoare, transformator 110/20 kV)
    // mediu si pilot: linie de 20 kV pe stalpi de beton, stalp terminal, post de celule, transformatoare 20/0,4 kV
    var sub = grp(root), lineG = grp(root), tr1, tr2 = null, prev, at;
    var stX0 = xSub - subW / 2, stX1 = xSub + subW / 2, stZ0 = zSub - subD / 2, stZ1 = zSub + subD / 2, stZe = D / 2 - 2.5, stXe = -W / 2, stW = [], stLz = zSub;
    var gx = stX0 + (huge ? 3 : 1.4), pylH = huge ? 28 : 12, span = huge ? 180 : 70;
    box(sub, subW, 0.12, subD, SH.gravel, xSub, 0.26, zSub, false);
    function stLid(xa, za, xb, zb, y) {             // canal de cabluri cu capace de beton, drept, pe x sau pe z
      var ax = Math.abs(xb - xa) > Math.abs(zb - za), len = ax ? Math.abs(xb - xa) : Math.abs(zb - za), n = Math.max(1, Math.round(len)), q, s;
      if (len < 0.05) return;
      box(sub, ax ? len : 0.7, 0.06, ax ? 0.7 : len, SH.base, (xa + xb) / 2, y + 0.03, (za + zb) / 2, false);
      for (s = -1; s <= 1; s += 2) box(sub, ax ? len : 0.08, 0.05, ax ? 0.08 : len, SH.concrete, (xa + xb) / 2 + (ax ? 0 : s * 0.39), y + 0.025, (za + zb) / 2 + (ax ? s * 0.39 : 0), false);
      if (!Q.lite) for (q = 1; q < n; q++) flat(sub, ax ? 0.03 : 0.7, ax ? 0.7 : 0.03, SH.dark, xa + (xb - xa) * q / n, y + 0.064, za + (zb - za) * q / n);
    }
    function stFeed(tr, s) {                        // cadru cu capete de cablu langa transformator: cablul urca din canal si sare la izolatoare
      var fx = tr[1].x - 0.225 * s - 1.45, fz = tr[1].z, fy = Math.max(2.3, tr[1].y - 0.3), q, zz;
      for (q = -1; q <= 1; q += 2) { box(sub, 0.4, 0.25, 0.4, SH.base, fx, 0.43, fz + q * 0.75, false); box(sub, 0.1, fy - 0.5, 0.1, SH.steel, fx, 0.5 + (fy - 0.5) / 2, fz + q * 0.75); }
      box(sub, 0.1, 0.1, 1.7, SH.steel, fx, fy, fz, false);
      for (q = -1; q <= 1; q++) {
        zz = fz + q * 0.5;
        stIns(sub, fx, fy + 0.05, zz, 0.4, 0.05, 4);
        cyl(sub, 0.045, 0.045, fy - 0.3, SH.dark, fx, 0.3 + (fy - 0.3) / 2, zz, 6, null, false);
        wireTo(stW, stV(fx, fy + 0.46, zz), tr[q + 1], 0.1, 4);
      }
      box(sub, 0.5, 0.07, 1.5, SH.base, fx, 0.335, fz, false);
      return fx;
    }
    if (huge) {
      var stZb = zSub - 3.5, stTx = stX0 + 23, stBx = stX0 + 28.7;
      stLz = stZb;
      tr1 = transformer(sub, stTx, stZb, 1);
      for (sd = -1; sd <= 1; sd += 2) {                                                                              // portalul de 110 kV
        for (j = -1; j <= 1; j += 2) { box(sub, 0.8, 0.4, 0.8, SH.base, gx + j * 1.2, 0.5, stZb + sd * 5.6, false); beam(sub, SH.steel, gx + j * 1.2, 0.7, stZb + sd * 5.6, gx, 10.2, stZb + sd * 5.6, 0.22); }
        box(sub, 1.45, 0.12, 0.12, SH.steel, gx, 4.6, stZb + sd * 5.6, false); box(sub, 0.8, 0.12, 0.12, SH.steel, gx, 7.2, stZb + sd * 5.6, false);
        cyl(sub, 0.03, 0.07, 2.6, SH.steel, gx, 11.7, stZb + sd * 5.6, 6, null, false);
      }
      box(sub, 0.5, 0.5, 12.0, SH.steel, gx, 10.2, stZb);
      stCol(sub, stX0 + 13.6, stZb - 3.2, 2.5, 0.22); stCol(sub, stX0 + 13.6, stZb + 3.2, 2.5, 0.22);               // cadrul intrerupatorului
      box(sub, 0.3, 0.25, 7.0, SH.steel, stX0 + 13.6, 2.625, stZb);
      box(sub, 0.7, 1.2, 0.9, SH.silver, stX0 + 13.6, 1.9, stZb + 1.1, false); box(sub, 0.02, 0.25, 0.3, SH.hazard, stX0 + 13.24, 2.0, stZb + 1.1, false);
      box(sub, 0.05, 0.05, 4.4, SH.steel, stX0 + 10.2, 2.55, stZb, false); box(sub, 0.3, 0.5, 0.3, SH.silver, stX0 + 10.25, 1.5, stZb, false); box(sub, 0.04, 0.9, 0.04, SH.steel, stX0 + 10.2, 2.1, stZb, false);   // actionarea separatorului
      prev = [];
      [-2.2, 0, 2.2].forEach(function (dz, q) {
        var zq = stZb + dz, xv = stX0 + 6.4, xd = stX0 + 10, xk = stX0 + 13.6, xc = stX0 + 16.6, xa = stX0 + 19.2, hv = tr1[q];
        stIns(sub, gx - 1.05, 10.2, zq, 1.5, 0.1, 8, true);                                                          // lant de intindere pe portal
        prev.push(stV(gx - 1.85, 10.2, zq));
        stCol(sub, xv, zq, 2.6, 0.2); box(sub, 0.5, 0.45, 0.5, SH.trafo, xv, 2.825, zq, false); stIns(sub, xv, 3.05, zq, 1.6, 0.12, 7); cyl(sub, 0.14, 0.14, 0.14, SH.silver, xv, 4.72, zq, 10, null, false);   // transformator de tensiune
        stCol(sub, xd, zq, 2.7, 0.22); box(sub, 2.0, 0.14, 0.22, SH.steel, xd, 2.77, zq, false);                     // separator
        stIns(sub, xd - 0.8, 2.84, zq, 1.3, 0.1, 6); stIns(sub, xd + 0.8, 2.84, zq, 1.3, 0.1, 6);
        box(sub, 1.75, 0.05, 0.07, SH.silver, xd, 4.17, zq, false);
        stIns(sub, xk, 2.75, zq, 1.25, 0.12, 6); box(sub, 0.34, 0.2, 0.34, SH.silver, xk, 4.1, zq, false); stIns(sub, xk, 4.2, zq, 1.3, 0.13, 6); cyl(sub, 0.15, 0.15, 0.12, SH.silver, xk, 5.56, zq, 10, null, false);   // intrerupator
        box(sub, 0.5, 0.05, 0.1, SH.silver, xk - 0.3, 5.56, zq, false); box(sub, 0.5, 0.05, 0.1, SH.silver, xk + 0.3, 4.1, zq, false);
        stCol(sub, xc, zq, 2.6, 0.2); box(sub, 0.45, 0.4, 0.45, SH.trafo, xc, 2.8, zq, false); stIns(sub, xc, 3.0, zq, 1.4, 0.12, 6);   // transformator de curent
        cyl(sub, 0.27, 0.27, 0.7, SH.trafo, xc, 4.66, zq, 12, [0, 0, Math.PI / 2], false); box(sub, 1.0, 0.05, 0.08, SH.silver, xc, 4.66, zq, false);
        stCol(sub, xa, zq, 2.6, 0.2); stIns(sub, xa, 2.6, zq, 1.5, 0.1, 7); cyl(sub, 0.3, 0.3, 0.03, SH.silver, xa, 4.0, zq, 12, null, false); cyl(sub, 0.06, 0.06, 0.16, SH.silver, xa, 4.18, zq, 6, null, false);   // descarcator
        beam(sub, SH.silver, gx - 1.85, 10.2, zq, xv, 4.8, zq, 0.05, false); beam(sub, SH.silver, xv, 4.8, zq, xd - 0.85, 4.18, zq, 0.05, false);   // conductoarele celulei
        beam(sub, SH.silver, xd + 0.85, 4.18, zq, xk - 0.5, 5.56, zq, 0.05, false);
        beam(sub, SH.silver, xk + 0.5, 4.1, zq, xc - 0.5, 4.66, zq, 0.05, false);
        beam(sub, SH.silver, xc + 0.5, 4.66, zq, xa, 4.25, zq, 0.05, false);
        beam(sub, SH.silver, xa, 4.25, zq, hv.x, hv.y, hv.z, 0.05, false);
      });
      box(sub, 0.3, 7.2, 11.5, SH.concrete, stTx + 3.6, 3.92, stZb);                                                 // zid antifoc intre transformator si cladire
      stKiosk(sub, stBx, zSub + 3, 3.0, 10, 3.3, 2, -1, zSub + 4.4, zSub + 7.4);                                     // cladirea de comanda, cu celulele de 20 kV
      tr2 = trafoMV(sub, stX0 + 21.5, zSub + 7.2, 0.6);                                                              // transformatorul de servicii proprii
      stFeed(tr2, 0.6);
      stLid(stX0 + 21.5 + 0.3 + 1.08, zSub + 7.2, stBx - 1.55, zSub + 7.2, 0.3);
      stLid(stTx + 1.9, zSub + 3.1, stBx - 1.55, zSub + 3.1, 0.3);                                                   // cablurile de 20 kV: de la cuva transformatorului la cladire
      stLid(stBx, zSub + 8.05, stBx, stZe + 0.35, 0.3);
      stLid(stBx - 0.35, stZe, stX1, stZe, 0.3);
    } else {
      var stS = big ? 1 : 0.75, stKx = stX0 + (big ? 5.9 : 4.1), stKw = big ? 2.6 : 2.2, stKd = big ? 7.2 : 3.4, stTx2 = stX0 + (big ? 12.6 : 8.6), stXc = stX1 - 1.3;
      prev = poleTerm(sub, gx, zSub, pylH, stW);
      box(sub, 0.7, 0.07, 0.7, SH.base, gx, 0.335, zSub + 0.6, false);                                               // caminul de la piciorul stalpului
      stLid(gx + 0.35, zSub + 0.6, stKx - stKw / 2 - 0.05, zSub + 0.6, 0.3);
      stKiosk(sub, stKx, zSub, stKw, stKd, big ? 2.9 : 2.6, big ? 4 : 2, 1);
      tr1 = trafoMV(sub, stTx2, big ? 2 * zSub - stZe : stZe, stS);
      if (big) { tr2 = trafoMV(sub, stTx2, stZe, stS); box(sub, 3.8, 3.4, 0.25, SH.concrete, stTx2 - 0.1, 2.02, zSub); }     // zid antifoc intre transformatoare
      [tr1, tr2].forEach(function (tr) {
        if (!tr) return;
        var fx = stFeed(tr, stS), tz = tr[1].z + 0.12 * stS, last = Math.abs(tz - stZe) < 0.01;
        stLid(stKx + stKw / 2 + (big ? 0.05 : 0.87), tz, fx - 0.25, tz, 0.3);
        stLid(stTx2 + 0.5 * stS + 1.08, tz, last ? stX1 : stXc + 0.35, tz, 0.3);
      });
      if (big) stLid(stXc, 2 * zSub - stZe - 0.35, stXc, stZe - 0.35, 0.3);
    }
    // canalul de cabluri spre sala electrica: iese prin gardul de est si ajunge la peretele de vest al cladirii, la z = D/2 - 2.5
    stLid(stX1, stZe, stXe - 0.02, stZe, 0.2);
    box(sub, 0.06, 0.7, 1.0, SH.silver, stXe - 0.05, 0.56, stZe, false); box(sub, 0.5, 0.1, 1.1, SH.base, stXe - 0.27, 0.25, stZe, false);
    // paratrasnete pe catarg, gard cu poarta si indicatoare
    var smh = huge ? 22 : 14;
    [[stX1 - 1.0, stZ0 + 1.0], [stX0 + 1.0, stZ1 - 1.0]].forEach(function (e, q) {
      if (q && !huge) return;
      box(sub, 0.7, 0.35, 0.7, SH.base, e[0], 0.45, e[1], false); cyl(sub, 0.03, 0.14, smh, SH.steel, e[0], 0.6 + smh / 2, e[1], 8);
    });
    var subF = grp(sub), stGx = xSub - (huge ? 1 : 0.5), stGw = huge ? 2.5 : big ? 2.0 : 1.5; subF.position.y = 0.2;
    fenceBox(subF, stX0, stX1, stZ0, stZ1, 2.4);
    for (j = -1; j <= 1; j++) box(subF, 0.12, 2.55, 0.12, SH.steel, stGx + j * stGw, 1.3, stZ1, false);            // poarta in doua canate, pe latura de sud
    box(subF, stGw * 2, 0.08, 0.08, SH.steel, stGx, 2.5, stZ1, false); box(subF, stGw * 2, 0.08, 0.08, SH.steel, stGx, 0.2, stZ1, false);
    box(subF, 0.25, 0.14, 0.1, SH.dark, stGx, 1.2, stZ1 + 0.06, false);
    box(subF, stGw * 2 + 1, 0.06, 1.6, SH.concrete, stGx, 0.03, stZ1 + 0.9, false);
    for (j = -1; j <= 1; j += 2) {
      vpl(subF, 0.5, 0.5, SH.stripe, stGx + j * (stGw + 1.2), 1.5, stZ1 + 0.04); vpl(subF, 0.1, 0.3, SH.dark, stGx + j * (stGw + 1.2), 1.5, stZ1 + 0.05);
      vpl(subF, 0.5, 0.5, SH.stripe, stX1 + 0.04, 1.5, zSub + j * subD * 0.3, Math.PI / 2); vpl(subF, 0.1, 0.3, SH.dark, stX1 + 0.05, 1.5, zSub + j * subD * 0.3, Math.PI / 2);
    }
    wireFlush(sub, stW);
    // linia: pleaca spre vest, catre orizont
    var stE = huge ? [stV(gx, 13.0, stZb - 5.6), stV(gx, 13.0, stZb + 5.6)] : null;
    for (i = 1; i <= 5; i++) {
      var pyG = grp(lineG), tx0 = gx - (huge ? 55 : 32) - (i - 1) * span, stSag = (i === 1 ? (huge ? 55 : 32) : span) * (huge ? 0.022 : 0.017);
      at = huge ? towerLattice(pyG, tx0, stLz, pylH) : poleMV(pyG, tx0, stLz, pylH);
      for (j = 0; j < 3; j++) wireTo(stW, prev[j], at[j], stSag, 14);
      if (huge) { wireTo(stW, stE[0], at[3], stSag * 0.7, 14); if (i === 1) wireTo(stW, stE[1], at[3], stSag * 0.7, 14); stE[0] = at[3]; }
      wireFlush(pyG, stW);
      prev = at;
    }
    tag(sub, 'sub');
