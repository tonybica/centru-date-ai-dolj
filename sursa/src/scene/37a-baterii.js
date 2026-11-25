    // baterii (nord, intre cladire si panouri)
    var bess = grp(root), xB0 = -W / 2 - 4.4, bessI = null;      // mutat spre vest, ca santul de cabluri al panourilor (x = -W/2 + 3) sa treaca pe langa containere
    if (nB) {
      bessI = inst(bess, bessTpl(), nB);
      for (i = 0; i < nB; i++) { mtx.compose(pos.set(xB0 + (i % perRowB) * 8 + 3.05, 0.2, zB0 - Math.floor(i / perRowB) * 6), q0, one); bessI.setMatrixAt(i, mtx); }
      box(bess, 3.0, 0.14, 2.6, SH.concrete, xB0 - 2.6, 0.27, zB0, false); box(bess, 2.4, 2.3, 2.0, SH.cont, xB0 - 2.6, 1.5, zB0);        // statia de conversie
      box(bess, 0.05, 1.4, 1.4, SH.louver, xB0 - 3.83, 1.6, zB0, false); box(bess, 1.0, 1.9, 0.05, SH.white, xB0 - 2.6, 1.4, zB0 + 1.02, false);
      // pat de pietris, gard propriu, transformator auxiliar
      var bxa = xB0 - 5.0, bxb = xB0 + Math.min(nB, perRowB) * 8 + 0.9, bza = zB0 - (rowsB - 1) * 6 - 2.5, bzb = zB0 + 2.45;
      flat(bess, bxb - bxa, bzb - bza, SH.gravel, (bxa + bxb) / 2, 0.212, (bza + bzb) / 2);
      var bF = grp(bess); bF.position.y = 0.2; fenceBox(bF, bxa, bxb, bza, bzb, 2.0);
      if (rowsB > 1) {
        box(bess, 1.8, 0.14, 1.6, SH.concrete, xB0 - 2.6, 0.27, zB0 - 6, false); box(bess, 1.3, 1.3, 1.0, SH.trafo, xB0 - 2.6, 0.99, zB0 - 6);
        box(bess, 1.1, 1.0, 0.25, SH.trafoFin, xB0 - 2.6, 0.95, zB0 - 6.65, false); box(bess, 1.1, 1.0, 0.25, SH.trafoFin, xB0 - 2.6, 0.95, zB0 - 5.35, false);
        for (j = -1; j <= 1; j++) cyl(bess, 0.05, 0.08, 0.35, SH.ceramic, xB0 - 2.6 + j * 0.4, 1.8, zB0 - 6, 8, null, false);
      }
      // cablurile bateriilor: de la statia de conversie un canal cu capace merge pe latura de sud a containerelor
      // si se uneste, intr-un camin, cu santul panourilor (x = -W/2 + 3), care duce la dulapul de pe peretele de nord
      var bTx = -W / 2 + 3, bTz = zB0 + 1.9, bPx = xB0 - 1.75;
      box(bess, 0.5, 0.5, 0.2, SH.steel, bPx, 0.72, zB0 + 1.1, false);                                                      // cutia de iesire a cablurilor din statia de conversie
      for (j = -1; j <= 1; j++) cyl(bess, 0.04, 0.04, 0.16, SH.dark, bPx + j * 0.14, 0.41, zB0 + 1.13, 6, null, false);
      [[bPx, zB0 + 1.3, bPx, bTz + 0.3], [bPx - 0.3, bTz, bTx - 0.5, bTz]].forEach(function (e) {
        var ax = Math.abs(e[2] - e[0]) > Math.abs(e[3] - e[1]), len = ax ? Math.abs(e[2] - e[0]) : Math.abs(e[3] - e[1]), mx = (e[0] + e[2]) / 2, mz = (e[1] + e[3]) / 2, t, sd2;
        box(bess, ax ? len : 0.6, 0.05, ax ? 0.6 : len, SH.concrete, mx, 0.22, mz, false);
        for (sd2 = -1; sd2 <= 1; sd2 += 2) box(bess, ax ? len : 0.04, 0.062, ax ? 0.04 : len, SH.dark, mx + (ax ? 0 : sd2 * 0.32), 0.226, mz + (ax ? sd2 * 0.32 : 0), false);
        if (!Q.lite) for (t = 1; t < len; t += 2) box(bess, ax ? 0.025 : 0.6, 0.012, ax ? 0.6 : 0.025, SH.dark, ax ? Math.min(e[0], e[2]) + t : mx, 0.247, ax ? mz : Math.min(e[1], e[3]) + t, false);
      });
      box(bess, 1.1, 0.07, 1.1, SH.concrete, bTx, 0.235, bTz, false); box(bess, 0.76, 0.02, 0.76, SH.steel, bTx, 0.28, bTz, false);      // caminul de legatura
      tag(bess, 'bess');
    }
    // dulapul de cabluri de pe peretele de nord: aici ies din sant cablurile de la panouri si de la baterii si trec prin perete in sala electrica
    if (nB || nT) {
      var bCx = -W / 2 + 3, bCz = -D / 2 - 0.33, bCf = bCz - 0.25;
      box(bess, 1.9, 0.14, 0.75, SH.concrete, bCx, 0.27, -D / 2 - 0.42, false);                                              // soclu de beton, santul intra in el
      box(bess, 1.6, 1.55, 0.5, SH.silver, bCx, 1.115, bCz);                                                                 // dulapul, cu spatele la perete
      box(bess, 1.72, 0.04, 0.62, SH.dark, bCx, 1.91, bCz - 0.04, false);                                                    // copertina
      box(bess, 0.02, 1.45, 0.012, SH.dark, bCx, 1.115, bCf - 0.004, false);                                                 // rostul dintre cele doua usi
      for (j = -1; j <= 1; j += 2) {
        box(bess, 0.03, 0.2, 0.03, SH.steel, bCx + j * 0.1, 1.15, bCf - 0.015, false);                                       // manere
        box(bess, 0.2, 0.2, 0.012, SH.hazard, bCx + j * 0.42, 1.5, bCf - 0.006, false);                                      // semn de pericol electric
        box(bess, 0.5, 0.16, 0.014, SH.louver, bCx + j * 0.4, 0.52, bCf - 0.006, false);                                     // aerisiri jos
        box(bess, 0.035, 0.1, 0.02, SH.steel, bCx + j * 0.77, 1.6, bCf - 0.006, false); box(bess, 0.035, 0.1, 0.02, SH.steel, bCx + j * 0.77, 0.65, bCf - 0.006, false);     // balamale
      }
    }
    var bN = Math.min(nB, perRowB), xBc = xB0 + bN * 4, zBc = zB0 - (Math.max(1, rowsB) - 1) * 3;
