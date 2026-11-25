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
      box(roofGroup, 2.6, 0.15, 2.0, SH.roofTrim, rxU, H + 0.38, rzU, false); box(roofGroup, 2.4, 1.3, 1.8, SH.roofUnit, rxU, H + 1.1, rzU);
      box(roofGroup, 1.7, 0.8, 0.04, SH.roofTrim, rxU, H + 1.1, rzU + 0.91, false); cyl(roofGroup, 0.6, 0.6, 0.14, SH.roofTrim, rxU, H + 1.8, rzU, 16, null, false);
    }
    for (i = 0; i <= nU; i++) { var vx = -W / 2 + (i + 0.5) * W / (nU + 1); box(roofGroup, 1.3, 0.28, 1.3, SH.roofTrim, vx, H + 0.44, D / 4, false); box(roofGroup, 1.1, 0.1, 1.1, SH.roofUnit, vx, H + 0.62, D / 4, false); }
    box(roofGroup, W * 0.8, 0.12, 0.4, SH.roofTrim, 0, H + 0.4, 0.6, false);
    // balustrada pe atic, poteci de intretinere, condensatoare, antena
    var nRp = Math.round(W / 2.4), nRd = Math.round(D / 2.4);
    for (sd = -1; sd <= 1; sd += 2) {
      box(roofGroup, W, 0.04, 0.04, SH.roofTrim, 0, H + 1.5, sd * (D / 2 + 0.02), false); box(roofGroup, W, 0.03, 0.03, SH.roofTrim, 0, H + 1.12, sd * (D / 2 + 0.02), false);
      box(roofGroup, 0.04, 0.04, D, SH.roofTrim, sd * (W / 2 + 0.02), H + 1.5, 0, false); box(roofGroup, 0.03, 0.03, D, SH.roofTrim, sd * (W / 2 + 0.02), H + 1.12, 0, false);
      for (i = 0; i <= nRp; i++) box(roofGroup, 0.04, 0.8, 0.04, SH.roofTrim, -W / 2 + i * W / nRp, H + 1.12, sd * (D / 2 + 0.02), false);
      for (i = 1; i < nRd; i++) box(roofGroup, 0.04, 0.8, 0.04, SH.roofTrim, sd * (W / 2 + 0.02), H + 1.12, -D / 2 + i * D / nRd, false);
    }
    box(roofGroup, W * 0.84, 0.04, 0.7, SH.roofUnit, 0, H + 0.32, -D / 4 + 2.0, false);
    box(roofGroup, 0.7, 0.04, D / 4 + 1.6, SH.roofUnit, -W / 2 + 2.2, H + 0.32, (-D / 2 + 0.4 - D / 4 + 2) / 2, false);
    for (i = 0; i < Math.max(2, Math.round(offW / 2.5)); i++) {
      var cdx = xO + 1.2 + i * 1.6; if (cdx > W / 2 - 1) break;
      box(roofGroup, 1.1, 0.9, 0.8, SH.roofUnit, cdx, H + 0.85, D / 4 + 2.4); cyl(roofGroup, 0.3, 0.3, 0.05, SH.roofTrim, cdx, H + 1.32, D / 4 + 2.4, 12, null, false); box(roofGroup, 1.2, 0.1, 0.9, SH.roofTrim, cdx, H + 0.35, D / 4 + 2.4, false);
    }
    cyl(roofGroup, 0.04, 0.06, 4, SH.roofTrim, W / 2 - 1.5, H + 2.3, -D / 2 + 1.5, 6); box(roofGroup, 0.5, 0.5, 0.08, SH.roofUnit, W / 2 - 1.5, H + 3.7, -D / 2 + 1.58, false);
    roofK = roofOpen ? 1 : 0;
    tag(bld, 'building');
