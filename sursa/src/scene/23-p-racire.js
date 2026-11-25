  /* ---------- racirea din curte: piese ---------- */
  var RCX = [0, 0, Math.PI / 2], RCZ = [Math.PI / 2, 0, 0];
  function rcSeg(g, m, r, x0, y0, z0, x1, y1, z1, sg, cs) {       // teava dreapta intre doua puncte, pe una din axe
    var L = Math.abs(x1 - x0) + Math.abs(y1 - y0) + Math.abs(z1 - z0);
    if (L < 0.001) return;
    cyl(g, r, r, L, m, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, sg || 10, x1 !== x0 ? RCX : z1 !== z0 ? RCZ : null, cs);
  }
  function rcPipe(g, col, r, x0, y0, z0, x1, y1, z1, cs) {        // teava izolata: manta de aluminiu si benzi colorate (albastru = apa rece, rosu = apa calda)
    var L = Math.abs(x1 - x0) + Math.abs(y1 - y0) + Math.abs(z1 - z0);
    if (L < 0.001) return;
    var n = Math.max(1, Math.round(L / 1.6)), bl = Math.min(0.55, L * 0.45) / 2, ux = (x1 - x0) / L, uy = (y1 - y0) / L, uz = (z1 - z0) / L, k, t;
    rcSeg(g, SH.silver, r, x0, y0, z0, x1, y1, z1, 12, cs);
    for (k = 0; k < n; k++) {
      t = (k + 0.5) / n * L;
      rcSeg(g, col, r + 0.007, x0 + ux * (t - bl), y0 + uy * (t - bl), z0 + uz * (t - bl), x0 + ux * (t + bl), y0 + uy * (t + bl), z0 + uz * (t + bl), 12, cs);
    }
  }
  function rcRun(g, col, r, pts, cs) {                            // traseu din bucati drepte, cu coturi
    for (var k = 0; k < pts.length - 1; k++) {
      rcPipe(g, col, r, pts[k][0], pts[k][1], pts[k][2], pts[k + 1][0], pts[k + 1][1], pts[k + 1][2], cs);
      if (k) sph(g, r * 1.12, SH.silver, pts[k][0], pts[k][1], pts[k][2], cs, 1, 1);
    }
  }
  function rcFlange(g, r, x, y, z, rot, cs, L) { cyl(g, r * 1.5 + 0.03, r * 1.5 + 0.03, L || 0.07, SH.steel, x, y, z, 12, rot, cs); }
  function rcValve(g, r, x, y, z, rot, cs, sd) {                  // robinet fluture intre flanse, cu reductor si roata de mana (sd: partea tijei la tevile verticale)
    var ax = rot === RCX ? 0 : rot === RCZ ? 2 : 1, o = [0, 0, 0], fr = r * 1.5 + 0.03, h = r * 1.3 + 0.26;
    o[ax] = 0.075;
    cyl(g, fr, fr, 0.035, SH.steel, x - o[0], y - o[1], z - o[2], 12, rot, cs); cyl(g, fr, fr, 0.035, SH.steel, x + o[0], y + o[1], z + o[2], 12, rot, cs);
    cyl(g, r * 1.28 + 0.015, r * 1.28 + 0.015, 0.115, SH.dark, x, y, z, 10, rot, cs);
    if (ax === 1) {
      sd = sd || -1;
      cyl(g, 0.022, 0.022, h, SH.dark, x, y, z + sd * h / 2, 6, RCZ, cs); box(g, 0.1, 0.1, 0.1, SH.dark, x, y, z + sd * (h - 0.08), cs); cyl(g, 0.12, 0.12, 0.022, SH.stripe, x, y, z + sd * h, 12, RCZ, cs);
    } else {
      cyl(g, 0.022, 0.022, h, SH.dark, x, y + h / 2, z, 6, null, cs); box(g, 0.1, 0.1, 0.1, SH.dark, x, y + h - 0.08, z, cs); cyl(g, 0.12, 0.12, 0.022, SH.stripe, x, y + h, z, 12, null, cs);
    }
  }

  // racitor uscat de circa 450 kW: 9,0 x 2,35 x 2,5 m, doua randuri de ventilatoare de 0,9 m, picioare pe socluri de beton.
  // La capatul dinspre cladire are cele doua racorduri cu flansa; ramurile coboara cu robinet pe colectoare (hl = inaltimea axului lor, rH = raza).
  function coolerTpl(len, hl, rH) {
    return tpl(function (g) {
      var i, j, f, nf = Math.max(3, Math.round(len / 1.8)), xw = -len / 2, lx, F = false;
      for (i = 0; i < 3; i++) for (j = -1; j <= 1; j += 2) {
        lx = xw + 0.35 + i * (len - 0.7) / 2;
        box(g, 0.4, 0.2, 0.4, SH.concrete, lx, 0.1, j * 1.0, F);                                        // soclu
        box(g, 0.26, 0.02, 0.26, SH.steel, lx, 0.21, j * 1.0, F); box(g, 0.1, 0.8, 0.1, SH.steel, lx, 0.6, j * 1.0, F);   // talpa si picior
        if (!Q.lite) {
          if (i < 2) beam(g, SH.steel, lx, 0.55, j * 1.0, lx + 0.5, 1.0, j * 1.0, 0.045, F);            // contrafise scurte
          if (i > 0) beam(g, SH.steel, lx, 0.55, j * 1.0, lx - 0.5, 1.0, j * 1.0, 0.045, F);
        }
      }
      for (i = 0; i < 3; i++) box(g, 0.05, 0.05, 2.0, SH.steel, xw + 0.35 + i * (len - 0.7) / 2, 0.5, 0, F);   // legatura intre picioarele pereche
      box(g, len, 0.1, 2.3, SH.steel, 0, 1.05, 0, F);                                                   // cadrul de jos
      box(g, len - 0.12, 1.06, 2.24, SH.coil, 0, 1.63, 0, F);                                           // bateria cu lamele
      box(g, len, 0.08, 2.34, SH.silver, 0, 2.2, 0, F);                                                 // capacul cu ventilatoare
      box(g, 0.06, 1.1, 2.34, SH.silver, xw + 0.03, 1.63, 0, F); box(g, 0.06, 1.1, 2.34, SH.silver, -xw - 0.03, 1.63, 0, F);
      for (j = -1; j <= 1; j += 2) {
        for (i = 1; i < nf; i++) box(g, 0.07, 1.08, 0.05, SH.silver, xw + i * len / nf, 1.63, j * 1.135, F);   // montantii dintre celule
        box(g, len, 0.07, 0.05, SH.silver, 0, 1.135, j * 1.135, F);
      }
      for (f = 0; f < nf; f++) for (j = -1; j <= 1; j += 2) {
        var fx = xw + (f + 0.5) * len / nf, fz = j * 0.58;
        cyl(g, 0.48, 0.52, 0.22, SH.silver, fx, 2.35, fz, Q.lite ? 10 : 14, null, F);                                 // duza ventilatorului
        if (!Q.lite) disc(g, 0.455, SH.dark, fx, 2.4, fz);
        disc(g, 0.45, SH.fan, fx, 2.44, fz); disc(g, 0.48, SH.grille, fx, 2.47, fz);
        if (!Q.lite) cyl(g, 0.09, 0.11, 0.09, SH.dark, fx, 2.49, fz, 8, null, F);                        // motorul
      }
      // colectoarele bateriei si cele doua racorduri: sus intra apa calda (rosu), jos iese apa racita (albastru)
      var yr = 1.95, yb = 1.38, zr = 0.45, zb = -0.45, xr = xw - 0.75, xb = xw - 1.35, rb = 0.065;
      cyl(g, 0.055, 0.055, 0.95, SH.red, xw - 0.055, 1.63, zr, 8, null, F); cyl(g, 0.055, 0.055, 0.95, SH.blue, xw - 0.055, 1.63, zb, 8, null, F);
      rcSeg(g, SH.red, rb, xw - 0.05, yr, zr, xr, yr, zr, 8, F); sph(g, rb * 1.15, SH.red, xr, yr, zr, F, 1, Q.lite ? 0 : 1); rcSeg(g, SH.red, rb, xr, yr, zr, xr, hl, zr, 8, F);
      rcSeg(g, SH.blue, rb, xw - 0.05, yb, zb, xb, yb, zb, 8, F); sph(g, rb * 1.15, SH.blue, xb, yb, zb, F, 1, Q.lite ? 0 : 1); rcSeg(g, SH.blue, rb, xb, yb, zb, xb, hl, zb, 8, F);
      rcFlange(g, rb, xw - 0.2, yr, zr, RCX, F); rcFlange(g, rb, xw - 0.2, yb, zb, RCX, F);              // flansele racordurilor
      rcValve(g, rb, xw - 0.47, yr, zr, RCX, F); rcValve(g, rb, xw - 0.47, yb, zb, RCX, F);              // robinet pe fiecare ramura
      cyl(g, rb + 0.03, rb + 0.03, 0.05, SH.steel, xr, hl + rH + 0.02, zr, 10, null, F); cyl(g, rb + 0.03, rb + 0.03, 0.05, SH.steel, xb, hl + rH + 0.02, zb, 10, null, F);   // gulerul de pe colector
      if (!Q.lite) { cyl(g, 0.012, 0.012, 0.16, SH.dark, xw - 0.3, yr + 0.14, zr, 5, null, F); cyl(g, 0.045, 0.045, 0.02, SH.silver, xw - 0.3, yr + 0.22, zr + 0.01, 8, RCZ, F); }   // termometru
      // cutia electrica, cu cablul in teava prinsa de picior pana la doza de pe platforma
      var ex = -xw - 0.35;
      box(g, 0.5, 0.7, 0.2, SH.silver, ex, 1.62, -1.26, F); box(g, 0.2, 0.1, 0.02, SH.led, ex, 1.82, -1.365, F);
      cyl(g, 0.025, 0.025, 1.17, SH.dark, ex, 0.685, -1.23, 6, null, F);
      box(g, 0.06, 0.03, 0.2, SH.dark, ex, 0.45, -1.14, F); box(g, 0.06, 0.03, 0.2, SH.dark, ex, 0.9, -1.14, F);
      box(g, 0.62, 0.12, 0.22, SH.dark, ex - 0.2, 0.06, -1.33, F);                                       // doza: de aici cablul merge prin canalul din platforma
      ao(g, len, 2.4, 0, 0.02, 0, 1.5);
    });
  }

  // suport pentru cele doua colectoare: fundatie de beton, doi stalpi, traversa, papuci si bride
  function rcSupTpl(hl, rH) {
    return tpl(function (g) {
      var F = false, yb = hl - rH, j;
      box(g, 1.2, 0.15, 0.4, SH.concrete, 0, 0.075, 0, F);
      for (j = -1; j <= 1; j += 2) {
        if (!Q.lite) box(g, 0.2, 0.015, 0.2, SH.steel, j * 0.3, 0.158, 0, F);
        box(g, 0.09, yb - 0.14 - 0.15, 0.09, SH.steel, j * 0.3, (yb - 0.14 + 0.15) / 2, 0, F);
        box(g, 0.16, 0.04, 0.3, SH.steel, j * 0.3, yb - 0.02, 0, F);                                     // papucul conductei
        if (!Q.lite) cyl(g, rH + 0.013, rH + 0.013, 0.04, SH.steel, j * 0.3, hl, 0, 12, RCZ, F);        // brida
      }
      box(g, 1.0, 0.1, 0.12, SH.steel, 0, yb - 0.09, 0, F);
    });
  }

  // pompa cu motor pe sasiu, cu axul de-a lungul lui z: aspiratia spre nord (z mic), refularea in sus. y = inaltimea axului, yf = fata de sus a sasiului.
  function rcPump(g, x, y, z, yf, on) {
    cyl(g, 0.21, 0.21, 0.16, SH.dark, x, y, z, 14, RCZ); cyl(g, 0.1, 0.1, 0.1, SH.dark, x, y, z - 0.1, 10, RCZ);          // corpul pompei si gura de aspiratie
    cyl(g, 0.09, 0.09, 0.26, SH.dark, x, y, z + 0.21, 10, RCZ); box(g, 0.2, y - yf - 0.06, 0.2, SH.dark, x, (y + yf - 0.06) / 2, z + 0.2);   // lagarul pe piciorul lui
    box(g, 0.2, 0.2, 0.17, SH.stripe, x, y, z + 0.425);                                                 // aparatoarea cuplajului
    cyl(g, 0.16, 0.16, 0.5, SH.steel, x, y, z + 0.76, 14, RCZ); cyl(g, 0.168, 0.168, 0.1, SH.dark, x, y, z + 1.06, 14, RCZ);    // motorul si capacul ventilatorului
    box(g, 0.26, y - yf - 0.12, 0.38, SH.dark, x, (y + yf - 0.12) / 2, z + 0.76); box(g, 0.14, 0.09, 0.16, SH.dark, x, y + 0.19, z + 0.7);
    box(g, 0.05, 0.03, 0.02, on ? SH.led : SH.dark, x, y + 0.19, z + 0.79);
  }

  // vas tampon in picioare, pe fusta de otel si placa de beton, cu gura de vizitare, supapa si aerisire
  function rcTank(g, x, z, r, yTop) {
    var y0 = 0.35, ys = y0 + 0.3, yc = yTop - r * 0.32;
    box(g, r * 2 + 0.3, 0.15, r * 2 + 0.3, SH.concrete, x, 0.275, z);
    cyl(g, r * 0.93, r * 0.93, 0.3, SH.dark, x, y0 + 0.15, z, 20);
    cyl(g, r, r, yc - ys, SH.silver, x, (yc + ys) / 2, z, 24); sph(g, r, SH.silver, x, yc, z, true, 0.32, 2);
    [ys + 0.04, (ys + yc) / 2, yc - 0.04].forEach(function (yy) { cyl(g, r + 0.012, r + 0.012, 0.05, SH.steel, x, yy, z, 24); });   // benzile mantalei
    cyl(g, 0.24, 0.24, 0.1, SH.steel, x + r, ys + 0.55, z, 14, RCX); cyl(g, 0.2, 0.2, 0.06, SH.dark, x + r + 0.07, ys + 0.55, z, 14, RCX);   // gura de vizitare
    cyl(g, 0.03, 0.03, 0.3, SH.steel, x, yTop + 0.12, z, 6); box(g, 0.09, 0.12, 0.09, SH.stripe, x, yTop + 0.3, z);                 // supapa de siguranta
    cyl(g, 0.02, 0.02, 0.2, SH.steel, x + r * 0.5, yTop - 0.02, z, 6); cyl(g, 0.04, 0.04, 0.06, SH.dark, x + r * 0.5, yTop + 0.1, z, 8);   // aerisire
    ao(g, r * 2 + 0.3, r * 2 + 0.3, x, 0.21, z, 1.6);
  }
  // vas de expansiune pe trei picioare
  function rcVessel(g, x, z, r, h) {
    var a;
    box(g, r * 2 + 0.3, 0.1, r * 2 + 0.3, SH.concrete, x, 0.25, z);
    for (a = 0; a < 3; a++) box(g, 0.05, 0.3, 0.05, SH.dark, x + Math.cos(a * 2.094) * r * 0.8, 0.45, z + Math.sin(a * 2.094) * r * 0.8);
    cyl(g, r, r, h - r * 0.9, SH.steel, x, 0.55 + (h - r * 0.9) / 2, z, 16); sph(g, r, SH.steel, x, 0.55, z, true, 0.45, 1); sph(g, r, SH.steel, x, 0.55 + h - r * 0.9, z, true, 0.45, 1);
    cyl(g, 0.025, 0.025, 0.12, SH.dark, x, 0.55 + h - r * 0.45 + 0.05, z, 6);
  }
