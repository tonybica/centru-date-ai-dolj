    // acoperisul (se ridica): membrana, atic, aparate
    roofGroup = grp(bld);
    box(roofGroup, W + 0.3, 0.3, D + 0.3, SH.roof, 0, H + 0.15, 0);
    for (sd = -1; sd <= 1; sd += 2) {
      box(roofGroup, W + 0.5, 0.7, 0.25, SH.roofUnit, 0, H + 0.35, sd * (D / 2 + 0.12)); box(roofGroup, W + 0.56, 0.08, 0.33, SH.roofTrim, 0, H + 0.74, sd * (D / 2 + 0.12), false);
      box(roofGroup, 0.25, 0.7, D + 0.5, SH.roofUnit, sd * (W / 2 + 0.12), H + 0.35, 0); box(roofGroup, 0.33, 0.08, D + 0.56, SH.roofTrim, sd * (W / 2 + 0.12), H + 0.74, 0, false);
    }
    var nU = Math.max(2, Math.round(W / 9));
    for (i = 0; i < nU; i++) {
      var rxU = -W / 2 + (i + 0.5) * W / nU, rzU = -D / 4;
      if (Math.abs(rxU - ldx) < 1.8) rxU = ldx + (rxU < ldx ? -1.9 : 1.9);                 // loc pentru poteca dinspre scara
      var rbx = rxU - (rxU > 0.5 ? 0.6 : rxU < -0.5 ? -0.6 : 0);
      box(roofGroup, 0.2, 0.06, 0.6 - rzU - 0.9, SH.roofTrim, rbx, H + 0.37, (0.6 + rzU + 0.9) / 2, false);     // ramura de cabluri pana la patul principal
      box(roofGroup, 2.6, 0.15, 2.0, SH.roofTrim, rxU, H + 0.38, rzU, false); box(roofGroup, 2.4, 1.3, 1.8, SH.roofUnit, rxU, H + 1.1, rzU);
      box(roofGroup, 1.7, 0.8, 0.04, SH.roofTrim, rxU, H + 1.1, rzU + 0.91, false); cyl(roofGroup, 0.6, 0.6, 0.14, SH.roofTrim, rxU, H + 1.8, rzU, 16, null, false);
    }
    for (i = 0; i <= nU; i++) { var vx = -W / 2 + (i + 0.5) * W / (nU + 1); box(roofGroup, 1.3, 0.28, 1.3, SH.roofTrim, vx, H + 0.44, D / 4, false); box(roofGroup, 1.1, 0.1, 1.1, SH.roofUnit, vx, H + 0.62, D / 4, false); }
    // patul principal de cabluri, pe traverse, legat de patul care urca pe fatada de vest
    var rtx0 = -W / 2 + 0.4, rtx1 = W * 0.4;
    box(roofGroup, rtx1 - rtx0, 0.12, 0.4, SH.roofTrim, (rtx0 + rtx1) / 2, H + 0.4, 0.6, false);
    for (i = 0; i <= Math.round((rtx1 - rtx0) / 3); i++) box(roofGroup, 0.1, 0.1, 0.6, SH.roofUnit, rtx0 + 0.3 + i * (rtx1 - rtx0 - 0.6) / Math.round((rtx1 - rtx0) / 3), H + 0.35, 0.6, false);
    box(roofGroup, 0.4, 0.12, Math.abs(0.6 - ctz) + 0.4, SH.roofTrim, -W / 2 + 0.6, H + 0.4, (0.6 + ctz) / 2, false);
    box(roofGroup, 0.9, 0.3, 0.62, SH.roofUnit, -W / 2 + 0.18, H + 0.86, ctz, false);                           // capacul prin care cablurile trec peste atic
    box(roofGroup, 0.4, 0.5, 0.4, SH.roofTrim, -W / 2 + 0.6, H + 0.55, ctz, false);
    // balustrada pe atic, poteci de intretinere, condensatoare, antena
    var nRp = Math.round(W / 2.4), nRd = Math.round(D / 2.4);
    for (sd = -1; sd <= 1; sd += 2) {
      var rzG = sd * (D / 2 + 0.02);
      (sd < 0 ? [[-W / 2, ldx - 0.4], [ldx + 0.4, W / 2]] : [[-W / 2, W / 2]]).forEach(function (sg) {       // la nord balustrada are un gol in dreptul scarii
        box(roofGroup, sg[1] - sg[0], 0.04, 0.04, SH.roofTrim, (sg[0] + sg[1]) / 2, H + 1.5, rzG, false); box(roofGroup, sg[1] - sg[0], 0.03, 0.03, SH.roofTrim, (sg[0] + sg[1]) / 2, H + 1.12, rzG, false);
      });
      box(roofGroup, 0.04, 0.04, D, SH.roofTrim, sd * (W / 2 + 0.02), H + 1.5, 0, false); box(roofGroup, 0.03, 0.03, D, SH.roofTrim, sd * (W / 2 + 0.02), H + 1.12, 0, false);
      for (i = 0; i <= nRp; i++) { var rpx = -W / 2 + i * W / nRp; if (sd < 0 && Math.abs(rpx - ldx) < 0.42) continue; box(roofGroup, 0.04, 0.8, 0.04, SH.roofTrim, rpx, H + 1.12, rzG, false); }
      for (i = 1; i < nRd; i++) box(roofGroup, 0.04, 0.8, 0.04, SH.roofTrim, sd * (W / 2 + 0.02), H + 1.12, -D / 2 + i * D / nRd, false);
    }
    // sosirea scarii: podet peste atic, o treapta spre acoperis, maini curente
    for (sd = -1; sd <= 1; sd += 2) {
      box(roofGroup, 0.04, 0.8, 0.04, SH.roofTrim, ldx + sd * 0.4, H + 1.12, -D / 2 - 0.02, false);
      box(roofGroup, 0.04, 1.07, 0.04, SH.roofTrim, ldx + sd * 0.27, H + 1.385, -D / 2 + 0.84, false);
      box(roofGroup, 0.04, 0.04, 1.3, SH.roofTrim, ldx + sd * 0.27, H + 1.9, -D / 2 + 0.21, false);
      box(roofGroup, 0.04, 0.04, 1.3, SH.roofTrim, ldx + sd * 0.27, H + 1.4, -D / 2 + 0.21, false);
      beam(roofGroup, SH.roofTrim, ldx + sd * 0.33, H + 0.81, -D / 2 + 0.86, ldx + sd * 0.33, H + 0.31, -D / 2 + 1.32, 0.05, false);
    }
    box(roofGroup, 0.7, 0.05, 1.3, SH.roofTrim, ldx, H + 0.83, -D / 2 + 0.23, false);
    box(roofGroup, 0.7, 0.04, 0.28, SH.roofTrim, ldx, H + 0.565, -D / 2 + 1.06, false);
    // palniile burlanelor, sub gurile de scurgere din atic
    for (i = 1; i < nBay; i++) if (i % 2) box(roofGroup, 0.34, 0.36, 0.26, SH.roofUnit, -W / 2 + i * W / nBay + 0.35, H + 0.2, -D / 2 - 0.375, false);
    // stalpii fatadei de est: lasa libera trecerea conductelor de racire prin perete
    for (i = 1; i < nBayD; i++) {
      var bzE = -D / 2 + i * D / nBayD;
      if (bzE < D / 2 - gl - 0.8 && !(hzz !== undefined && bzE > hzz - 0.75 && bzE < hzz + 1.1)) box(wg, 0.07, ph, 0.14, SH.trim, W / 2 + 0.03, py, bzE, false);
    }
    box(roofGroup, W * 0.84, 0.04, 0.7, SH.roofUnit, 0, H + 0.32, -D / 4 + 2.0, false);
    box(roofGroup, 0.7, 0.04, D / 4 + 0.7, SH.roofUnit, ldx, H + 0.32, (-D / 2 + 1.3 - D / 4 + 2) / 2, false);
    for (i = 0; i < Math.max(2, Math.round(offW / 2.5)); i++) {
      var cdx = xO + 1.2 + i * 1.6; if (cdx > W / 2 - 1) break;
      box(roofGroup, 1.1, 0.9, 0.8, SH.roofUnit, cdx, H + 0.85, D / 4 + 2.4); cyl(roofGroup, 0.3, 0.3, 0.05, SH.roofTrim, cdx, H + 1.32, D / 4 + 2.4, 12, null, false); box(roofGroup, 1.2, 0.1, 0.9, SH.roofTrim, cdx, H + 0.35, D / 4 + 2.4, false);
    }
    box(roofGroup, 0.5, 0.06, 0.5, SH.roofTrim, W / 2 - 1.5, H + 0.33, -D / 2 + 1.5, false);
    [[-1.3, 0.3], [0.6, 1.3], [0.7, -1.0]].forEach(function (a) { beam(roofGroup, SH.roofTrim, W / 2 - 1.5, H + 2.9, -D / 2 + 1.5, W / 2 - 1.5 + a[0], H + 0.32, -D / 2 + 1.5 + a[1], 0.02, false); box(roofGroup, 0.14, 0.05, 0.14, SH.roofTrim, W / 2 - 1.5 + a[0], H + 0.325, -D / 2 + 1.5 + a[1], false); });
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) { cyl(roofGroup, 0.012, 0.012, 0.9, SH.roofTrim, c[0] * (W / 2 + 0.12), H + 1.23, c[1] * (D / 2 + 0.12), 6, null, false); });     // tije de paratrasnet pe colturi
    cyl(roofGroup, 0.04, 0.06, 4, SH.roofTrim, W / 2 - 1.5, H + 2.3, -D / 2 + 1.5, 6); box(roofGroup, 0.5, 0.5, 0.08, SH.roofUnit, W / 2 - 1.5, H + 3.7, -D / 2 + 1.58, false);
    roofK = roofOpen ? 1 : 0;
    tag(bld, 'building');
