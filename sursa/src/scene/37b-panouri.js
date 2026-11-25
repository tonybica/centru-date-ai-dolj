    /* --- parcul fotovoltaic --- */
    var nT = Math.ceil(p.pv * 1000 / 30), pitch = 9.2, colW = 32;
    var nc = Math.max(1, Math.round(Math.sqrt(nT * 0.42))), nr = Math.max(1, Math.ceil(nT / nc));
    function colX(c) { return c * colW + Math.floor(c / 4) * 6; }
    var fieldW = nT ? colX(nc - 1) + 30 : 0, fieldD = nT ? nr * pitch : 0, tables = null, inv = null, pvG = grp(root);
    if (nT > 0) {
      tables = inst(root, pvTableTpl(), nT);
      for (i = 0; i < nT; i++) { mtx.compose(pos.set(colX(i % nc) + 15 - fieldW / 2, 0, zPV0 - Math.floor(i / nc) * pitch - 2.3), q0, one); tables.setMatrixAt(i, mtx); }
      var nInv = Math.max(1, Math.round(p.pv / 2.5)); inv = grp(root);
      for (i = 0; i < nInv; i++) inverterStation(inv, -fieldW / 2 + (i + 0.5) * fieldW / nInv, zPV0 + 4.5);
      tag(inv, 'pv');
      // drumuri de intretinere din pietris si fasii batatorite intre randuri
      for (i = 4; i < nc; i += 4) flat(pvG, 4, fieldD + 4, SH.gravel, colX(i) - 4 - fieldW / 2, 0.075, zPV0 - fieldD / 2);
      flat(pvG, fieldW + 10, 3.5, SH.gravel, 0, 0.07, zPV0 - fieldD - 3.2); flat(pvG, 3.5, fieldD + 8, SH.gravel, -fieldW / 2 - 4, 0.07, zPV0 - fieldD / 2); flat(pvG, 3.5, fieldD + 8, SH.gravel, fieldW / 2 + 4, 0.07, zPV0 - fieldD / 2);
      for (i = 0; i < nr; i++) flat(pvG, fieldW, 1.6, SH.soil, 0, 0.065, zPV0 - i * pitch - 6.9);
      // cutii de jonctiune la capatul randurilor, statie meteo, container de piese de schimb
      for (i = 0; i < nr; i++) for (j = 0; j < nc; j += 4) {
        if (i * nc + j >= nT) continue;
        var jbx = colX(j) - fieldW / 2 - 0.9, jbz = zPV0 - i * pitch - 2.3;
        box(pvG, 0.08, 1.3, 0.08, SH.steel, jbx, 0.65, jbz, false); box(pvG, 0.5, 0.6, 0.22, SH.silver, jbx, 1.25, jbz, false);
      }
      var wmx = -fieldW / 2 - 1.2, wmz = zPV0 + 1.2;
      cyl(pvG, 0.04, 0.06, 5, SH.steel, wmx, 2.5, wmz, 8); box(pvG, 1.3, 0.05, 0.05, SH.steel, wmx, 4.6, wmz, false); sph(pvG, 0.11, SH.silver, wmx - 0.6, 4.75, wmz, false, 1, 0);
      box(pvG, 0.4, 0.03, 0.3, SH.panel, wmx + 0.55, 4.7, wmz, false, [0.436, 0, 0]); box(pvG, 0.35, 0.45, 0.2, SH.white, wmx, 1.5, wmz + 0.12, false);
      var spx = fieldW / 2 + 8.4, spz = zPV0 - 9;
      box(pvG, 2.44, 2.6, 6.06, SH.contDark, spx, 1.33, spz); box(pvG, 2.2, 2.3, 0.05, SH.cont, spx, 1.3, spz + 3.04, false); box(pvG, 0.04, 1.6, 0.04, SH.steel, spx - 0.3, 1.3, spz + 3.08, false); box(pvG, 0.04, 1.6, 0.04, SH.steel, spx + 0.3, 1.3, spz + 3.08, false);
      ao(pvG, 2.6, 6.2, spx, 0.08, spz, 1.4);
    }
    var zPVmid = zPV0 - fieldD / 2, zPVend = zPV0 - fieldD;
