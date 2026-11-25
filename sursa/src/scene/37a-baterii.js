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
      tag(bess, 'bess');
    }
    var bN = Math.min(nB, perRowB), xBc = xB0 + bN * 4, zBc = zB0 - (Math.max(1, rowsB) - 1) * 3;
