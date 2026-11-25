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
      if (i % 2) fatDownpipe(wg, bx0 + 0.35, -D / 2, -1, H);
    }
    var nBayD = Math.max(2, Math.round(D / 6));
    for (i = 1; i < nBayD; i++) { var bz0 = -D / 2 + i * D / nBayD; box(wg, 0.07, ph, 0.14, SH.trim, -W / 2 - 0.03, py, bz0, false); }      // stalpii fatadei de est se pun in 33-acoperis.js, dupa ce se stie pe unde ies conductele de racire
    // birourile: colt vitrat spre sud-est
    var gh = H - 2.4, gy = 1.05 + gh / 2, gl = Math.min(D * 0.5, 9);
    box(wg, offW - 1.0, gh, 0.16, SH.glass, xEnt, gy, D / 2 + 0.04, false);
    box(wg, 0.16, gh, gl, SH.glass, W / 2 + 0.04, gy, D / 2 - gl / 2 - 0.5, false);
    // montantii si traversele peretelui cortina
    var gwS = offW - 1.0, nMs = Math.max(2, Math.round(gwS / 1.5)), nMe = Math.max(2, Math.round(gl / 1.5));
    for (i = 0; i <= nMs; i++) box(wg, 0.06, gh, 0.05, SH.trim, xEnt - gwS / 2 + i * gwS / nMs, gy, D / 2 + 0.135, false);
    for (i = 0; i <= nMe; i++) box(wg, 0.05, gh, 0.06, SH.trim, W / 2 + 0.135, gy, D / 2 - 0.5 - i * gl / nMe, false);
    [gy - gh / 2 + 0.03, gy - gh / 2 + 1.15, gy + gh / 2 - 0.03].forEach(function (yy) { box(wg, gwS, 0.06, 0.05, SH.trim, xEnt, yy, D / 2 + 0.135, false); box(wg, 0.05, 0.06, gl, SH.trim, W / 2 + 0.135, yy, D / 2 - gl / 2 - 0.5, false); });
    // intrarea: windfang de sticla, copertina, usi
    box(wg, 3.2, 2.7, 1.8, SH.glass, xEnt, 1.55, D / 2 + 0.9); box(wg, 3.5, 0.14, 2.1, SH.trim, xEnt, 2.97, D / 2 + 1.0, false);
    box(wg, 1.8, 2.25, 0.06, SH.trim, xEnt, 1.33, D / 2 + 1.82, false);
    box(wg, 0.8, 2.05, 0.04, SH.carGlass, xEnt - 0.42, 1.28, D / 2 + 1.85, false); box(wg, 0.8, 2.05, 0.04, SH.carGlass, xEnt + 0.42, 1.28, D / 2 + 1.85, false);
    box(wg, 5.4, 0.16, 3.6, SH.trim, xEnt, 3.3, D / 2 + 1.9);
    cyl(wg, 0.07, 0.07, 3.02, SH.steel, xEnt - 2.5, 1.71, D / 2 + 3.5, 8); cyl(wg, 0.07, 0.07, 3.02, SH.steel, xEnt + 2.5, 1.71, D / 2 + 3.5, 8);
    box(wg, 0.3, 0.03, 0.3, SH.steel, xEnt - 2.5, 0.215, D / 2 + 3.5, false); box(wg, 0.3, 0.03, 0.3, SH.steel, xEnt + 2.5, 0.215, D / 2 + 3.5, false);
    box(wg, 0.03, 0.5, 0.05, SH.steel, xEnt - 0.1, 1.3, D / 2 + 1.89, false); box(wg, 0.03, 0.5, 0.05, SH.steel, xEnt + 0.1, 1.3, D / 2 + 1.89, false);
    box(wg, 5.0, 0.04, 0.5, SH.light, xEnt, 3.2, D / 2 + 2.6, false);
    // firma
    var sw = Math.max(5, Math.min(9, W * 0.22)), xSign = Math.max(-W / 2 + sw / 2 + 1, xO - sw / 2 - 1.2);
    box(wg, sw + 0.3, sw / 4 + 0.3, 0.08, SH.trim, xSign, H - 2.25, D / 2 + 0.05, false); vpl(wg, sw, sw / 4, SH.sign, xSign, H - 2.25, D / 2 + 0.1);
    // usa de incarcare, cu copertina si usa de serviciu
    box(wg, 3.6, 3.6, 0.1, SH.door, xD, 2.1, D / 2 + 0.04, false);
    box(wg, 0.2, 3.8, 0.16, SH.trim, xD - 1.9, 2.2, D / 2 + 0.06, false); box(wg, 0.2, 3.8, 0.16, SH.trim, xD + 1.9, 2.2, D / 2 + 0.06, false); box(wg, 4.0, 0.2, 0.16, SH.trim, xD, 4.0, D / 2 + 0.06, false);
    box(wg, 0.24, 1.0, 0.2, SH.hazard, xD - 1.9, 0.8, D / 2 + 0.08, false); box(wg, 0.24, 1.0, 0.2, SH.hazard, xD + 1.9, 0.8, D / 2 + 0.08, false);
    box(wg, 4.6, 0.12, 1.6, SH.trim, xD, 4.3, D / 2 + 0.8);
    for (sd = -1; sd <= 1; sd += 2) beam(wg, SH.steel, xD + sd * 2.1, 4.36, D / 2 + 1.5, xD + sd * 2.1, 5.25, D / 2 + 0.04, 0.04, false);      // tirantii copertinei
    if (xD - 3.4 > -W / 2 + 1) fatDoor(wg, xD - 3.4, D / 2, 1, false);
    // aerisirile salii electrice (vest) si ale salii de date (nord), iesiri de urgenta
    for (i = 0; i < nBayD; i++) box(wg, 0.1, 1.6, Math.min(2.4, D / nBayD - 1), SH.louver, -W / 2 - 0.04, H - 2.7, -D / 2 + (i + 0.5) * D / nBayD, false);
    // usile de iesire stau departe de stalpi si de fasia libera pentru cablurile de la baterii si panouri (x = -W/2 + 1,75 ... 4,25)
    var fatClr = function (x) { for (var q = 1; q < nBay; q++) { var b = -W / 2 + q * W / nBay; if (x > b - 0.85 && x < b + 1.25) x = b - 0.9; } return x; };
    var xDn = fatClr(Math.max(xE - 1.6, -W / 2 + 5.05)), xDn2 = big ? fatClr(xO - 2.2) : null;
    for (i = 0; i < nBay; i++) if (i % 2) {
      var lvx = -W / 2 + (i + 0.5) * W / nBay;
      if (Math.abs(lvx - xDn) < 1.75 || (xDn2 !== null && Math.abs(lvx - xDn2) < 1.75)) continue;       // nicio aerisire peste o usa
      box(wg, 1.8, 1.2, 0.1, SH.louver, lvx, 2.6, -D / 2 - 0.04, false); box(wg, 1.92, 0.05, 0.16, SH.trim, lvx, 3.23, -D / 2 - 0.07, false);
    }
    fatDoor(wg, xDn, -D / 2, -1, true); if (xDn2 !== null) fatDoor(wg, xDn2, -D / 2, -1, true);
    // lumini de perete, scara cu colivie spre acoperis, pat de cabluri pe fatada de vest, tampoane la rampa, firma si pe est
    for (i = 0; i < nBay; i++) {
      var wlx = -W / 2 + (i + 0.5) * W / nBay;
      box(wg, 0.3, 0.09, 0.14, SH.light, wlx, 3.5, -D / 2 - 0.1, false);
      if (wlx < xO - 1 && Math.abs(wlx - xD) > 3) box(wg, 0.3, 0.09, 0.14, SH.light, wlx, 3.5, D / 2 + 0.1, false);
    }
    var ldx = -W / 2 + 5.0; if (Math.abs(ldx - xDn) < 1.25) ldx = xDn + 1.3;
    var ldz = -D / 2 - 0.42;
    fatLadder(wg, ldx, -D / 2, -1, H);
    // cablurile spre aparatele de pe acoperis ies din sala electrica printr-o cutie de trecere si urca pe un pat de cabluri
    var ctz = -D / 2 + D / nBayD + 0.55;
    box(wg, 0.22, 0.45, 0.7, SH.steel, -W / 2 - 0.11, 2.7, ctz, false);
    box(wg, 0.09, H - 3.0, 0.5, SH.steel, -W / 2 - 0.09, (H - 0.1 + 2.9) / 2, ctz, false);
    for (i = 0; i < 5; i++) box(wg, 0.13, 0.05, 0.58, SH.dark, -W / 2 - 0.1, 3.3 + i * (H - 4.0) / 4, ctz, false);
    // camere video pe colturi
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) { fatCam(wg, c[0] * (W / 2 - 0.2), H - 1.62, c[1] * (D / 2 + 0.05), c[1], -c[0]); });
    var esz = D / 2 - gl - 1.5 - sw / 2;
    if (esz - sw / 2 > -D / 2 + 0.6) { box(wg, 0.08, sw / 4 + 0.3, sw + 0.3, SH.trim, W / 2 + 0.05, H - 2.25, esz, false); vpl(wg, sw, sw / 4, SH.sign, W / 2 + 0.1, H - 2.25, esz, Math.PI / 2); }
