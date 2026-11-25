    /* --- cladirea --- */
    var bld = grp(root), floorG = grp(bld);
    box(floorG, W, 0.3, D, SH.floor, 0, 0.15, 0, false);
    ao(floorG, W, D, 0, 0.215, 0, 1.2);
    wallGroup = grp(bld);
    var wg = wallGroup, wt = 0.4, offW = Math.max(5, W * 0.22), xE = -W / 2 + W * 0.28, xO = W / 2 - offW, xEnt = W / 2 - offW / 2, xD = xE + 3;
    box(wg, W, H, wt, SH.wall, 0, H / 2, -D / 2 + wt / 2); box(wg, W, H, wt, SH.wall, 0, H / 2, D / 2 - wt / 2);
    box(wg, wt, H, D - 2 * wt, SH.wall, -W / 2 + wt / 2, H / 2, 0); box(wg, wt, H, D - 2 * wt, SH.wall, W / 2 - wt / 2, H / 2, 0);
    // soclu de beton, dunga galbena, cornisa inchisa si colturi
    [[W + 0.12, D / 2 + 0.03, 0], [W + 0.12, -D / 2 - 0.03, 0], [D + 0.12, W / 2 + 0.03, 1], [D + 0.12, -W / 2 - 0.03, 1]].forEach(function (a) {
      function strip(h, t, y, m) { if (a[2]) box(wg, t, h, a[0], m, a[1], y, 0, false); else box(wg, a[0], h, t, m, 0, y, a[1], false); }
      strip(0.9, 0.14, 0.45, SH.base); strip(0.36, 0.1, H - 1.05, SH.stripe); strip(0.3, 0.2, H - 0.15, SH.trim);
    });
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) { box(wg, 0.5, H - 0.3, 0.5, SH.trim, c[0] * (W / 2 - 0.2), (H - 0.3) / 2, c[1] * (D / 2 - 0.2), false); });
    // stalpii structurii, vizibili pe fatade, si burlane
    var nBay = Math.max(2, Math.round(W / 6)), ph = H - 2.13, py = 0.9 + ph / 2;
    for (i = 1; i < nBay; i++) {
      var bx0 = -W / 2 + i * W / nBay;
      box(wg, 0.14, ph, 0.07, SH.trim, bx0, py, -D / 2 - 0.03, false);
      if (bx0 < xO - 0.4 && Math.abs(bx0 - xD) > 2.6) box(wg, 0.14, ph, 0.07, SH.trim, bx0, py, D / 2 + 0.03, false);
      if (i % 2) cyl(wg, 0.07, 0.07, H - 1.2, SH.silver, bx0 + 0.35, (H - 1.2) / 2 + 0.6, -D / 2 - 0.11, 8, null, false);
    }
    var nBayD = Math.max(2, Math.round(D / 6));
    for (i = 1; i < nBayD; i++) { var bz0 = -D / 2 + i * D / nBayD; box(wg, 0.07, ph, 0.14, SH.trim, -W / 2 - 0.03, py, bz0, false); if (bz0 < D / 2 - Math.min(D * 0.5, 9) - 0.8) box(wg, 0.07, ph, 0.14, SH.trim, W / 2 + 0.03, py, bz0, false); }
    // birourile: colt vitrat spre sud-est
    var gh = H - 2.4, gy = 1.05 + gh / 2, gl = Math.min(D * 0.5, 9);
    box(wg, offW - 1.0, gh, 0.16, SH.glass, xEnt, gy, D / 2 + 0.04, false);
    box(wg, 0.16, gh, gl, SH.glass, W / 2 + 0.04, gy, D / 2 - gl / 2 - 0.5, false);
    // intrarea: windfang de sticla, copertina, usi
    box(wg, 3.2, 2.7, 1.8, SH.glass, xEnt, 1.55, D / 2 + 0.9); box(wg, 3.5, 0.14, 2.1, SH.trim, xEnt, 2.97, D / 2 + 1.0, false);
    box(wg, 1.8, 2.25, 0.06, SH.trim, xEnt, 1.33, D / 2 + 1.82, false);
    box(wg, 0.8, 2.05, 0.04, SH.carGlass, xEnt - 0.42, 1.28, D / 2 + 1.85, false); box(wg, 0.8, 2.05, 0.04, SH.carGlass, xEnt + 0.42, 1.28, D / 2 + 1.85, false);
    box(wg, 5.4, 0.16, 3.6, SH.trim, xEnt, 3.3, D / 2 + 1.9);
    cyl(wg, 0.07, 0.07, 3.0, SH.steel, xEnt - 2.5, 1.7, D / 2 + 3.5, 8); cyl(wg, 0.07, 0.07, 3.0, SH.steel, xEnt + 2.5, 1.7, D / 2 + 3.5, 8);
    box(wg, 5.0, 0.04, 0.5, SH.light, xEnt, 3.2, D / 2 + 2.6, false);
    // firma
    var sw = Math.max(5, Math.min(9, W * 0.22)), xSign = Math.max(-W / 2 + sw / 2 + 1, xO - sw / 2 - 1.2);
    box(wg, sw + 0.3, sw / 4 + 0.3, 0.08, SH.trim, xSign, H - 2.25, D / 2 + 0.05, false); vpl(wg, sw, sw / 4, SH.sign, xSign, H - 2.25, D / 2 + 0.1);
    // usa de incarcare, cu copertina si usa de serviciu
    box(wg, 3.6, 3.6, 0.1, SH.door, xD, 2.1, D / 2 + 0.04, false);
    box(wg, 0.2, 3.8, 0.16, SH.trim, xD - 1.9, 2.2, D / 2 + 0.06, false); box(wg, 0.2, 3.8, 0.16, SH.trim, xD + 1.9, 2.2, D / 2 + 0.06, false); box(wg, 4.0, 0.2, 0.16, SH.trim, xD, 4.0, D / 2 + 0.06, false);
    box(wg, 0.24, 1.0, 0.2, SH.hazard, xD - 1.9, 0.8, D / 2 + 0.08, false); box(wg, 0.24, 1.0, 0.2, SH.hazard, xD + 1.9, 0.8, D / 2 + 0.08, false);
    box(wg, 4.6, 0.12, 1.6, SH.trim, xD, 4.3, D / 2 + 0.8);
    if (xD - 3.4 > -W / 2 + 1) { box(wg, 1.0, 2.1, 0.08, SH.white, xD - 3.4, 1.35, D / 2 + 0.04, false); box(wg, 0.5, 0.1, 0.18, SH.light, xD - 3.4, 2.6, D / 2 + 0.1, false); }
    // aerisirile salii electrice (vest) si ale salii de date (nord), iesiri de urgenta
    for (i = 0; i < nBayD; i++) box(wg, 0.1, 1.6, Math.min(2.4, D / nBayD - 1), SH.louver, -W / 2 - 0.04, H - 2.7, -D / 2 + (i + 0.5) * D / nBayD, false);
    for (i = 0; i < nBay; i++) if (i % 2) box(wg, 1.8, 1.2, 0.1, SH.louver, -W / 2 + (i + 0.5) * W / nBay, 2.6, -D / 2 - 0.04, false);
    box(wg, 1.0, 2.1, 0.08, SH.white, xE - 1.6, 1.35, -D / 2 - 0.04, false); box(wg, 0.5, 0.1, 0.18, SH.light, xE - 1.6, 2.6, -D / 2 - 0.1, false);
    // lumini de perete, scara cu colivie spre acoperis, pat de cabluri pe fatada de vest, tampoane la rampa, firma si pe est
    for (i = 0; i < nBay; i++) {
      var wlx = -W / 2 + (i + 0.5) * W / nBay;
      box(wg, 0.3, 0.09, 0.14, SH.light, wlx, 3.5, -D / 2 - 0.1, false);
      if (wlx < xO - 1 && Math.abs(wlx - xD) > 3) box(wg, 0.3, 0.09, 0.14, SH.light, wlx, 3.5, D / 2 + 0.1, false);
    }
    var ldx = -W / 2 + 2.2, ldz = -D / 2 - 0.28;
    box(wg, 0.05, H + 0.9, 0.05, SH.steel, ldx - 0.25, (H + 0.9) / 2 + 0.3, ldz, false); box(wg, 0.05, H + 0.9, 0.05, SH.steel, ldx + 0.25, (H + 0.9) / 2 + 0.3, ldz, false);
    for (i = 0; i < Math.floor((H + 0.5) / 0.32); i++) box(wg, 0.5, 0.03, 0.03, SH.steel, ldx, 0.6 + i * 0.32, ldz, false);
    for (i = 0; i < Math.floor((H - 2.2) / 0.9) + 1; i++) {
      var hy = 2.6 + i * 0.9;
      box(wg, 0.03, 0.04, 0.6, SH.steel, ldx - 0.33, hy, ldz - 0.3, false); box(wg, 0.03, 0.04, 0.6, SH.steel, ldx + 0.33, hy, ldz - 0.3, false); box(wg, 0.69, 0.04, 0.03, SH.steel, ldx, hy, ldz - 0.6, false);
    }
    for (j = -1; j <= 1; j++) box(wg, 0.03, H - 1.9, 0.03, SH.steel, ldx + j * 0.33, 2.6 + (H - 1.9) / 2, ldz - 0.6, false);
    var ctz = -D / 2 + D / nBayD + 0.55;
    box(wg, 0.09, H - 1.0, 0.5, SH.steel, -W / 2 - 0.09, 0.9 + (H - 1.0) / 2, ctz, false);
    for (i = 0; i < 6; i++) box(wg, 0.13, 0.05, 0.58, SH.dark, -W / 2 - 0.1, 1.4 + i * (H - 1.9) / 5, ctz, false);
    box(wg, 0.3, 0.5, 0.16, SH.tire, xD - 1.3, 0.75, D / 2 + 0.14, false); box(wg, 0.3, 0.5, 0.16, SH.tire, xD + 1.3, 0.75, D / 2 + 0.14, false);
    var esz = D / 2 - gl - 1.5 - sw / 2;
    if (esz - sw / 2 > -D / 2 + 0.6) { box(wg, 0.08, sw / 4 + 0.3, sw + 0.3, SH.trim, W / 2 + 0.05, H - 2.25, esz, false); vpl(wg, sw, sw / 4, SH.sign, W / 2 + 0.1, H - 2.25, esz, Math.PI / 2); }
