    // birourile: mese cu ecrane, dulapuri
    var ocx = xO + offW / 2, dw = Math.max(2, Math.min(4.4, offW - 3)), nDesk = Math.max(1, Math.min(4, Math.floor(D / 9)));
    for (j = 0; j < nDesk; j++) {
      var dz0 = (j - (nDesk - 1) / 2) * 6;
      box(elec, dw, 0.06, 0.9, SH.wood, ocx, 1.05, dz0, false); box(elec, 0.08, 0.74, 0.8, SH.dark, ocx - dw / 2 + 0.1, 0.67, dz0, false); box(elec, 0.08, 0.74, 0.8, SH.dark, ocx + dw / 2 - 0.1, 0.67, dz0, false);
      for (i = -1; i <= 1; i++) {
        if (Math.abs(i) * 0.85 + 0.4 > dw / 2) continue;
        box(elec, 0.7, 0.42, 0.04, SH.dark, ocx + i * 0.85, 1.5, dz0 - 0.22, false); box(elec, 0.64, 0.36, 0.02, SH.screen, ocx + i * 0.85, 1.5, dz0 - 0.195, false); box(elec, 0.06, 0.22, 0.06, SH.dark, ocx + i * 0.85, 1.19, dz0 - 0.24, false);
      }
      box(elec, 0.5, 0.1, 0.5, SH.dark, ocx - 0.5, 0.75, dz0 + 0.8, false); box(elec, 0.5, 0.55, 0.08, SH.dark, ocx - 0.5, 1.1, dz0 + 1.05, false); cyl(elec, 0.04, 0.2, 0.42, SH.steel, ocx - 0.5, 0.5, dz0 + 0.8, 6, null, false);
    }
    box(elec, 0.5, 1.9, Math.min(3, D * 0.2), SH.white, W / 2 - 0.75, 1.25, -D / 4);
    // sala de sedinte, chicineta, canapea si plante la intrare
    var zM = -D / 2 + (D > 30 ? 5 : 2.9), mtw = Math.min(2.6, offW - 2.6);
    function meet(zc) {
      box(elec, mtw, 0.06, 1.1, SH.wood, ocx - 0.2, 1.05, zc, false); box(elec, 0.1, 0.74, 0.7, SH.dark, ocx - 0.2 - mtw * 0.3, 0.67, zc, false); box(elec, 0.1, 0.74, 0.7, SH.dark, ocx - 0.2 + mtw * 0.3, 0.67, zc, false);
      for (var q = 0; q < 3; q++) for (var s2 = -1; s2 <= 1; s2 += 2) {
        var chx = ocx - 0.2 + (q - 1) * mtw * 0.33;
        box(elec, 0.45, 0.08, 0.45, SH.contDark, chx, 0.76, zc + s2 * 0.85, false); box(elec, 0.45, 0.5, 0.07, SH.contDark, chx, 1.05, zc + s2 * 1.08, false); box(elec, 0.06, 0.42, 0.06, SH.steel, chx, 0.51, zc + s2 * 0.85, false);
      }
    }
    meet(zM); if (D > 30) meet(D / 2 - 6);
    box(elec, 2.2, 0.9, 0.6, SH.white, xO + 1.5, 0.75, -D / 2 + 0.75); box(elec, 2.26, 0.05, 0.66, SH.dark, xO + 1.5, 1.22, -D / 2 + 0.75, false); box(elec, 0.6, 1.8, 0.6, SH.silver, xO + 3.0, 1.2, -D / 2 + 0.75);
    box(elec, 0.75, 0.42, 1.8, SH.contDark, xO + 0.72, 0.52, D / 2 - 3.0, false); box(elec, 0.2, 0.5, 1.8, SH.contDark, xO + 0.45, 0.95, D / 2 - 3.0, false);
    [[xEnt - 2.1, D / 2 - 0.9], [xEnt + 2.1, D / 2 - 0.9], [ocx + mtw / 2 + 0.3, zM + 1.3]].forEach(function (c) {
      if (c[0] > W / 2 - 0.7) return;
      cyl(elec, 0.22, 0.17, 0.45, SH.base, c[0], 0.52, c[1], 10, null, false); sph(elec, 0.4, SH.hedge, c[0], 1.15, c[1], false, 1.25);
    });
    // sala electrica: dulapuri de baterii langa perete, linii galbene de siguranta, paturi de cabluri sus
    var nBat = Math.max(3, Math.min(8, Math.floor((D - 9) / 0.85)));
    for (i = 0; i < nBat; i++) { var bzz = -D / 2 + 1.4 + i * 0.85; box(elec, 0.6, 1.9, 0.8, SH.dark, xE - 0.55, 1.25, bzz); vpl(elec, 0.76, 1.84, SH.cabF, xE - 0.853, 1.25, bzz, -Math.PI / 2); }
    flat(elec, 0.08, D - 4, SH.stripe, -W / 2 + 2.6, 0.306, -0.6); flat(elec, nSw * 0.8 + 0.4, 0.08, SH.stripe, -W / 2 + 0.8 + nSw * 0.4, 0.306, D / 2 - 2.2);
    box(elec, xE + W / 2 - 1.6, 0.05, 0.4, SH.steel, (xE - W / 2) / 2, 2.86, -D / 4, false); box(elec, xE + W / 2 - 1.6, 0.05, 0.4, SH.steel, (xE - W / 2) / 2, 2.86, D / 4, false);
    // zona de receptie a marfii, marcata pe podea
    if (D / 2 - 2.4 > rowLen / 2 + 1.5) {
      var sx0 = xD - 1.1, sx1 = xD + 2.9, sz0 = D / 2 - 3.5, sz1 = D / 2 - 0.9;
      flat(itx, sx1 - sx0, 0.1, SH.stripe, (sx0 + sx1) / 2, 0.306, sz0); flat(itx, sx1 - sx0, 0.1, SH.stripe, (sx0 + sx1) / 2, 0.306, sz1); flat(itx, 0.1, sz1 - sz0, SH.stripe, sx0, 0.306, (sz0 + sz1) / 2); flat(itx, 0.1, sz1 - sz0, SH.stripe, sx1, 0.306, (sz0 + sz1) / 2);
    }
