    // statie electrica si linia din retea
    var sub = grp(root);
    box(sub, subW, 0.12, subD, SH.gravel, xSub, 0.26, zSub, false);
    var tr1 = transformer(sub, xSub + (big ? subW * 0.2 : 0), zSub - (big ? subD * 0.18 : 0), subS), tr2 = null;
    if (big) { tr2 = transformer(sub, xSub + subW * 0.2, zSub + subD * 0.24, subS); box(sub, 4.8 * subS, 3.4 * subS, 0.3, SH.concrete, xSub + subW * 0.2, 0.3 + 1.7 * subS, zSub + subD * 0.03); }     // zid antifoc intre transformatoare
    var cbx = xSub - subW * 0.22, cbz = zSub + subD * 0.2, cbw = 3 * subS, cbd = 2.4 * subS;                 // cladirea de comanda
    box(sub, cbw, 2.6, cbd, SH.paint, cbx, 1.6, cbz); box(sub, cbw + 0.3, 0.15, cbd + 0.3, SH.trim, cbx, 2.97, cbz);
    box(sub, 0.9, 2.0, 0.06, SH.contDark, cbx - cbw * 0.2, 1.3, cbz + cbd / 2 + 0.02, false); box(sub, 0.8, 0.5, 0.06, SH.louver, cbx + cbw * 0.22, 2.2, cbz + cbd / 2 + 0.02, false);
    var pylH = huge ? 30 : big ? 12 : 10, gx = xSub - subW / 2 + 1.2, gantH = big ? 8 * Math.sqrt(subS) : 0, prev, at;
    if (big) {
      for (sd = -1; sd <= 1; sd += 2) {
        var gz = zSub + sd * subD * 0.35;
        beam(sub, SH.steel, gx - 0.9, 0.3, gz, gx, gantH, gz, 0.2); beam(sub, SH.steel, gx + 0.9, 0.3, gz, gx, gantH, gz, 0.2); box(sub, 1.0, 0.12, 0.12, SH.steel, gx, gantH * 0.5, gz, false);
      }
      box(sub, 0.35, 0.35, subD * 0.75, SH.steel, gx, gantH, zSub);
      prev = [-1, 0, 1].map(function (q) { var zz = zSub + q * subD * 0.25; cyl(sub, 0.09, 0.09, 1.0, SH.ceramic, gx, gantH - 0.68, zz, 8, null, false); return new T.Vector3(gx, gantH - 1.2, zz); });
      [tr1, tr2].forEach(function (tr) { for (var q = 0; q < 3; q++) wire(sub, prev[q], tr[q], 0.5); });
    } else {
      prev = poleMV(sub, gx, zSub, 9);
      for (j = 0; j < 3; j++) wire(sub, prev[j], tr1[j], 0.4);
    }
    // descarcatoare langa transformatoare, canal de cabluri, paratrasnet
    [tr1, tr2].forEach(function (tr) {
      if (!tr) return;
      var trx = tr[1].x, trzc = tr[1].z + 0.35 * subS, ax = trx - 2.75 * subS;
      for (var q = -1; q <= 1; q++) {
        var az = trzc + q * 0.85 * subS;
        box(sub, 0.12, 2.0 * subS, 0.12, SH.steel, ax, 0.32 + subS, az, false); cyl(sub, 0.07 * subS, 0.11 * subS, 1.1 * subS, SH.ceramic, ax, 0.32 + 2.55 * subS, az, 8, null, false); cyl(sub, 0.13 * subS, 0.13 * subS, 0.06, SH.silver, ax, 0.32 + 3.12 * subS, az, 10, null, false);
      }
      box(sub, 0.1, 0.1, 2.0 * subS, SH.steel, ax, 0.32 + 2.0 * subS, trzc, false);
    });
    if (big) {
      var tcz = zSub + subD * 0.03, tcx1 = xSub + subW * 0.2 - 2.5 * subS;
      flat(sub, tcx1 - cbx, 0.6, SH.concrete, (tcx1 + cbx) / 2, 0.335, tcz); flat(sub, 0.6, cbz - cbd / 2 - tcz, SH.concrete, cbx, 0.335, (cbz - cbd / 2 + tcz) / 2);
    }
    var smh = 10 + 6 * subS;
    cyl(sub, 0.03, 0.13, smh, SH.steel, xSub + subW / 2 - 1.0, 0.32 + smh / 2, zSub - subD / 2 + 1.0, 8);
    var subF = grp(sub); subF.position.y = 0.2; fenceBox(subF, xSub - subW / 2, xSub + subW / 2, zSub - subD / 2, zSub + subD / 2, 2.2);
    for (j = -1; j <= 1; j++) { vpl(subF, 0.5, 0.5, SH.stripe, xSub + j * subW * 0.3, 1.45, zSub + subD / 2 + 0.03); vpl(subF, 0.1, 0.3, SH.dark, xSub + j * subW * 0.3, 1.45, zSub + subD / 2 + 0.045); }
    var span = huge ? 150 : big ? 70 : 55, lineG = grp(root);
    for (i = 1; i <= 5; i++) {
      var pyG = grp(lineG), tx0 = gx - i * span + (i === 1 ? span * 0.45 : 0);
      at = huge ? towerLattice(pyG, tx0, zSub, pylH) : poleMV(pyG, tx0, zSub, pylH);
      for (j = 0; j < 3; j++) wire(pyG, prev[j], at[j], span * 0.035);
      prev = at;
    }
    tag(sub, 'sub');
