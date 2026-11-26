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
    var sg = Q.lite ? 8 : 12;
    rcSeg(g, SH.silver, r, x0, y0, z0, x1, y1, z1, sg, cs);
    for (k = 0; k < n; k++) {
      t = (k + 0.5) / n * L;
      rcSeg(g, col, r + 0.007, x0 + ux * (t - bl), y0 + uy * (t - bl), z0 + uz * (t - bl), x0 + ux * (t + bl), y0 + uy * (t + bl), z0 + uz * (t + bl), sg, cs);
    }
  }
  function rcRun(g, col, r, pts, cs) {                            // traseu din bucati drepte, cu coturi
    for (var k = 0; k < pts.length - 1; k++) {
      rcPipe(g, col, r, pts[k][0], pts[k][1], pts[k][2], pts[k + 1][0], pts[k + 1][1], pts[k + 1][2], cs);
      if (k) sph(g, r * (Q.lite ? 1.3 : 1.12), SH.silver, pts[k][0], pts[k][1], pts[k][2], cs, 1, Q.lite ? 0 : 1);
    }
  }
  function rcFlange(g, r, x, y, z, rot, cs, L) { cyl(g, r * 1.5 + 0.03, r * 1.5 + 0.03, L || 0.07, SH.steel, x, y, z, Q.lite ? 8 : 12, rot, cs); }
  function rcValve(g, r, x, y, z, rot, cs, sd) {                  // robinet fluture intre flanse, cu reductor si roata de mana (sd: partea tijei la tevile verticale)
    var ax = rot === RCX ? 0 : rot === RCZ ? 2 : 1, o = [0, 0, 0], fr = r * 1.5 + 0.03, h = r * 1.3 + 0.26;
    o[ax] = 0.075;
    var lite = Q.lite, wr = Math.min(0.12, r + 0.06);
    if (lite) cyl(g, fr, fr, 0.185, SH.dark, x, y, z, 8, rot, cs);       // pe telefon: flansele si corpul sunt o singura bucata
    else {
      cyl(g, fr, fr, 0.035, SH.steel, x - o[0], y - o[1], z - o[2], 12, rot, cs); cyl(g, fr, fr, 0.035, SH.steel, x + o[0], y + o[1], z + o[2], 12, rot, cs);
      cyl(g, r * 1.28 + 0.015, r * 1.28 + 0.015, 0.115, SH.dark, x, y, z, 10, rot, cs);
    }
    if (ax === 1) {
      sd = sd || -1;
      cyl(g, 0.022, 0.022, h, SH.dark, x, y, z + sd * h / 2, lite ? 4 : 6, RCZ, cs); if (!lite) box(g, 0.1, 0.1, 0.1, SH.dark, x, y, z + sd * (h - 0.08), cs); cyl(g, wr, wr, 0.022, SH.stripe, x, y, z + sd * h, lite ? 8 : 12, RCZ, cs);
    } else {
      cyl(g, 0.022, 0.022, h, SH.dark, x, y + h / 2, z, lite ? 4 : 6, null, cs); if (!lite) box(g, 0.1, 0.1, 0.1, SH.dark, x, y + h - 0.08, z, cs); cyl(g, wr, wr, 0.022, SH.stripe, x, y + h, z, lite ? 8 : 12, null, cs);
    }
  }

  function rcDisc(g, r, m, x, y, z) {                              // disc culcat care arunca umbra (acelasi fel de umbra pe material = mai putine desene)
    addGeo(g, unit('disc', function () { var q = new T.CircleGeometry(1, 20); q.rotateX(-Math.PI / 2); return q; }), m, x, y, z, r, 1, r, null, true);
  }

  // racitor uscat de circa 450 kW: 9,0 x 2,35 x 2,5 m, doua randuri de ventilatoare de 0,9 m, picioare pe socluri de beton.
  // (X, Y, Z) = mijlocul lui, pe platforma. La capatul de vest are cele doua racorduri cu flansa; ramurile coboara cu robinet pe colectoare
  // (hl = inaltimea axului lor peste platforma, rH = raza). La capatul de est are cutia electrica, cu cablul coborat in canalul de cabluri (xd = marginea canalului).
  // Se deseneaza direct in grupul racirii, nu ca instanta: sunt doar cateva bucati, iar asa toata racirea ramane pe o duzina de materiale.
  function rcCooler(g, X, Y, Z, len, hl, rH, xd) {
    var i, j, f, nf = Math.max(3, Math.round(len / 1.8)), xw = X - len / 2, xe = X + len / 2, lx, lite = Q.lite;
    for (i = 0; i < 3; i++) {
      lx = xw + 0.35 + i * (len - 0.7) / 2;
      for (j = -1; j <= 1; j += 2) {
        box(g, 0.4, 0.2, 0.4, SH.concrete, lx, Y + 0.1, Z + j);                                          // soclu
        if (!lite) box(g, 0.26, 0.02, 0.26, SH.steel, lx, Y + 0.21, Z + j);                              // talpa
        box(g, 0.1, 0.8, 0.1, SH.steel, lx, Y + 0.6, Z + j);                                             // picior
        if (!lite) {
          if (i < 2) beam(g, SH.steel, lx, Y + 0.55, Z + j, lx + 0.5, Y + 1.0, Z + j, 0.045);            // contrafise scurte
          if (i > 0) beam(g, SH.steel, lx, Y + 0.55, Z + j, lx - 0.5, Y + 1.0, Z + j, 0.045);
        }
      }
      box(g, 0.05, 0.05, 2.0, SH.steel, lx, Y + 0.5, Z);                                                 // legatura intre picioarele pereche
    }
    box(g, len, 0.1, 2.3, SH.steel, X, Y + 1.05, Z);                                                     // cadrul de jos
    box(g, len - 0.12, 1.06, 2.24, SH.coil, X, Y + 1.63, Z);                                             // bateria cu lamele
    box(g, len, 0.08, 2.34, SH.silver, X, Y + 2.2, Z);                                                   // capacul cu ventilatoare
    box(g, 0.06, 1.1, 2.34, SH.silver, xw + 0.03, Y + 1.63, Z); box(g, 0.06, 1.1, 2.34, SH.silver, xe - 0.03, Y + 1.63, Z);
    for (j = -1; j <= 1; j += 2) {
      if (!lite) for (i = 1; i < nf; i++) box(g, 0.07, 1.08, 0.05, SH.silver, xw + i * len / nf, Y + 1.63, Z + j * 1.135);   // montantii dintre celule
      box(g, len, 0.07, 0.05, SH.silver, X, Y + 1.135, Z + j * 1.135);
    }
    for (f = 0; f < nf; f++) for (j = -1; j <= 1; j += 2) {
      var fx = xw + (f + 0.5) * len / nf, fz = Z + j * 0.58;
      cyl(g, 0.48, 0.52, 0.22, SH.silver, fx, Y + 2.35, fz, lite ? 8 : 14);                             // duza ventilatorului
      if (!lite) rcDisc(g, 0.455, SH.dark, fx, Y + 2.4, fz);
      disc(g, 0.45, SH.fan, fx, Y + 2.44, fz); disc(g, 0.48, SH.grille, fx, Y + 2.47, fz);
      if (!lite) cyl(g, 0.09, 0.11, 0.09, SH.dark, fx, Y + 2.49, fz, 8);                                 // motorul
    }
    // colectoarele bateriei si cele doua racorduri: sus intra apa calda (rosu), jos iese apa racita (albastru)
    var yr = Y + 1.95, yb = Y + 1.38, zr = Z + 0.45, zb = Z - 0.45, xr = xw - 0.75, xb = xw - 1.35, rb = 0.065, yh = Y + hl, sg = lite ? 6 : 8;
    cyl(g, 0.055, 0.055, 0.95, SH.red, xw - 0.055, Y + 1.63, zr, sg); cyl(g, 0.055, 0.055, 0.95, SH.blue, xw - 0.055, Y + 1.63, zb, sg);
    rcSeg(g, SH.red, rb, xw - 0.05, yr, zr, xr, yr, zr, sg); sph(g, rb * (lite ? 1.4 : 1.15), SH.red, xr, yr, zr, true, 1, lite ? 0 : 1); rcSeg(g, SH.red, rb, xr, yr, zr, xr, yh, zr, sg);
    rcSeg(g, SH.blue, rb, xw - 0.05, yb, zb, xb, yb, zb, sg); sph(g, rb * (lite ? 1.4 : 1.15), SH.blue, xb, yb, zb, true, 1, lite ? 0 : 1); rcSeg(g, SH.blue, rb, xb, yb, zb, xb, yh, zb, sg);
    rcFlange(g, rb, xw - 0.2, yr, zr, RCX); rcFlange(g, rb, xw - 0.2, yb, zb, RCX);                      // flansele racordurilor
    rcValve(g, rb, xw - 0.47, yr, zr, RCX); rcValve(g, rb, xw - 0.47, yb, zb, RCX);                      // robinet pe fiecare ramura
    if (!lite) { cyl(g, rb + 0.03, rb + 0.03, 0.05, SH.steel, xr, yh + rH + 0.02, zr, 10); cyl(g, rb + 0.03, rb + 0.03, 0.05, SH.steel, xb, yh + rH + 0.02, zb, 10); }   // gulerul de pe colector
    if (!lite) {
      cyl(g, 0.012, 0.012, 0.16, SH.dark, xw - 0.3, yr + 0.14, zr, 5); cyl(g, 0.045, 0.045, 0.02, SH.silver, xw - 0.3, yr + 0.22, zr + 0.01, 8, RCZ);    // termometru
      cyl(g, 0.012, 0.012, 0.12, SH.dark, xr, yr + 0.12, zr, 5); box(g, 0.04, 0.04, 0.04, SH.steel, xr, yr + 0.19, zr);                                  // aerisire in punctul cel mai de sus
    }
    // cutia electrica de la capatul de est: intrerupator de siguranta, cablu in teava pana la doza de langa canalul de cabluri
    var ez = Z - 0.55;
    box(g, 0.2, 0.7, 0.55, SH.silver, xe + 0.1, Y + 1.62, ez); box(g, 0.012, 0.6, 0.02, SH.dark, xe + 0.204, Y + 1.62, ez + 0.12);
    box(g, 0.02, 0.05, 0.14, SH.led, xe + 0.205, Y + 1.86, ez - 0.1); box(g, 0.05, 0.1, 0.1, SH.stripe, xe + 0.215, Y + 1.56, ez - 0.1);
    cyl(g, 0.025, 0.025, 1.19, SH.dark, xe + 0.1, Y + 0.675, ez, 6);
    box(g, 0.14, 0.03, 0.06, SH.dark, xe + 0.05, Y + 1.03, ez);                                          // colier pe cadrul de jos
    box(g, xd - xe + 0.02, 0.1, 0.22, SH.dark, (xe + xd) / 2 + 0.01, Y + 0.05, ez);                       // doza: de aici cablul intra in canal
    ao(g, len, 2.4, X, Y + 0.02, Z, 1.5);
  }

  // suport pentru cele doua colectoare: fundatie de beton, stalpi, traversa, papuci si bride. one = 1: doar teava dinspre est (capatul colectorului cald)
  function rcSup(g, X, Y, Z, hl, rH, one) {
    var yb = Y + hl - rH, j;
    if (one) box(g, 0.5, 0.15, 0.4, SH.concrete, X + 0.3, Y + 0.075, Z); else box(g, 1.2, 0.15, 0.4, SH.concrete, X, Y + 0.075, Z);
    for (j = one ? 1 : -1; j <= 1; j += 2) {
      if (!Q.lite) box(g, 0.2, 0.015, 0.2, SH.steel, X + j * 0.3, Y + 0.158, Z);
      box(g, 0.09, yb - 0.14 - Y - 0.15, 0.09, SH.steel, X + j * 0.3, (yb - 0.14 + Y + 0.15) / 2, Z);
      box(g, 0.16, 0.04, 0.3, SH.steel, X + j * 0.3, yb - 0.02, Z);                                      // papucul conductei
      if (!Q.lite) cyl(g, rH + 0.013, rH + 0.013, 0.04, SH.steel, X + j * 0.3, Y + hl, Z, 12, RCZ);      // brida
    }
    if (one) box(g, 0.3, 0.1, 0.12, SH.steel, X + 0.3, yb - 0.09, Z); else box(g, 1.0, 0.1, 0.12, SH.steel, X, yb - 0.09, Z);
  }
  // suport mic sub o teava joasa: soclu, talpa, stalp si papuc (yb = partea de jos a tevii)
  function rcStand(g, x, z, yb, Y) {
    box(g, 0.32, 0.12, 0.32, SH.concrete, x, Y + 0.06, z);
    if (!Q.lite) box(g, 0.18, 0.015, 0.18, SH.steel, x, Y + 0.128, z);
    box(g, 0.07, yb - 0.03 - Y - 0.12, 0.07, SH.steel, x, (yb - 0.03 + Y + 0.12) / 2, z); box(g, 0.2, 0.03, 0.2, SH.steel, x, yb - 0.015, z);
  }
  // consola de perete pentru tevi: placa prinsa in perete, brat, contrafisa, papuci si bride. y = fata de sus a bratului, zw = fata peretelui (bratul iese spre nord).
  // pp = [[z, raza, 1 daca teava merge de-a lungul bratului]]
  function rcBracket(g, x, zw, y, len, pp) {
    box(g, 0.14, 0.66, 0.016, SH.steel, x, y - 0.3, zw - 0.008);
    box(g, 0.07, 0.07, len, SH.steel, x, y - 0.035, zw - len / 2);
    beam(g, SH.steel, x, y - 0.56, zw - 0.04, x, y - 0.06, zw - len + 0.14, 0.05);
    pp.forEach(function (e) {
      if (e[2]) box(g, 0.2, 0.03, 0.16, SH.steel, x, y + 0.015, e[0]); else box(g, 0.16, 0.03, 0.2, SH.steel, x, y + 0.015, e[0]);
      if (!Q.lite) cyl(g, e[1] + 0.014, e[1] + 0.014, 0.05, SH.steel, x, y + 0.03 + e[1], e[0], 12, e[2] ? RCZ : RCX);
    });
  }
  // stalp in T pentru tevile care trec peste culoar: fundatie, stalp, traversa, contrafise, papuci si bride (tevile merg pe z, la x din xs)
  function rcTPost(g, x, z, y, xs, r, Y) {
    var a = Math.min.apply(null, xs) - 0.2, b = Math.max.apply(null, xs) + 0.2;
    box(g, 0.45, 0.15, 0.45, SH.concrete, x, Y + 0.075, z); box(g, 0.26, 0.016, 0.26, SH.steel, x, Y + 0.158, z);
    box(g, 0.12, y - 0.1 - Y - 0.15, 0.12, SH.steel, x, (y - 0.1 + Y + 0.15) / 2, z);
    box(g, b - a, 0.1, 0.1, SH.steel, (a + b) / 2, y - 0.05, z);
    beam(g, SH.steel, x, y - 0.75, z, a + 0.15, y - 0.1, z, 0.05); beam(g, SH.steel, x, y - 0.75, z, b - 0.15, y - 0.1, z, 0.05);
    xs.forEach(function (px) { box(g, 0.2, 0.03, 0.16, SH.steel, px, y + 0.015, z); if (!Q.lite) cyl(g, r + 0.014, r + 0.014, 0.05, SH.steel, px, y + 0.03 + r, z, 12, RCZ); });
  }
  // canal de cabluri in platforma, cu rama si capace de tabla striata de cate un metru (pe x sau pe z)
  function rcDuct(g, xa, za, xb, zb, Y) {
    var alongX = Math.abs(xb - xa) > Math.abs(zb - za), L = alongX ? Math.abs(xb - xa) : Math.abs(zb - za), cx = (xa + xb) / 2, cz = (za + zb) / 2, n = Q.lite ? 1 : Math.max(1, Math.round(L)), q, t;
    if (alongX) box(g, L + 0.5, 0.016, 0.5, SH.dark, cx, Y + 0.008, cz); else box(g, 0.5, 0.016, L + 0.5, SH.dark, cx, Y + 0.008, cz);
    for (q = 0; q < n; q++) {
      t = -L / 2 - 0.2 + (q + 0.5) * (L + 0.4) / n;
      if (alongX) box(g, (L + 0.4) / n - 0.02, 0.022, 0.4, SH.steel, cx + t, Y + 0.027, cz); else box(g, 0.4, 0.022, (L + 0.4) / n - 0.02, SH.steel, cx, Y + 0.027, cz + t);
    }
  }
  // camin de cabluri cu capac din doua bucati
  function rcPit(g, x, z, s, Y) {
    box(g, s + 0.2, 0.02, s + 0.2, SH.dark, x, Y + 0.01, z);
    box(g, s / 2 - 0.01, 0.03, s, SH.steel, x - s / 4, Y + 0.033, z); box(g, s / 2 - 0.01, 0.03, s, SH.steel, x + s / 4, Y + 0.033, z);
    if (!Q.lite) { box(g, 0.03, 0.012, 0.14, SH.dark, x - s / 4, Y + 0.052, z); box(g, 0.03, 0.012, 0.14, SH.dark, x + s / 4, Y + 0.052, z); }
  }
  // tablou electric de exterior pe soclu, cu doua usi spre sud (+z), streasina, maner, semn de avertizare si lampi
  function rcCab(g, x, z, w, h, d, Y) {
    var y0 = Y + 0.25, zf = z + d / 2, k;
    box(g, w + 0.24, 0.15, d + 0.24, SH.concrete, x, Y + 0.075, z); box(g, w - 0.04, 0.1, d - 0.04, SH.dark, x, Y + 0.2, z);
    box(g, w, h, d, SH.silver, x, y0 + h / 2, z); box(g, w + 0.12, 0.05, d + 0.2, SH.silver, x, y0 + h + 0.025, z + 0.04);
    box(g, 0.014, h - 0.08, 0.012, SH.dark, x, y0 + h / 2, zf + 0.004);
    for (k = -1; k <= 1; k += 2) {
      box(g, 0.03, 0.2, 0.035, SH.dark, x + k * 0.07, y0 + h * 0.52, zf + 0.018);
      if (!Q.lite) { for (var q = 0; q < 4; q++) box(g, 0.014, 0.025, 0.3, SH.dark, x + k * (w / 2 + 0.004), y0 + h * 0.86 - q * 0.06, z); box(g, 0.03, 0.08, 0.02, SH.dark, x + k * (w / 2 - 0.03), y0 + h * 0.25, zf + 0.01); box(g, 0.03, 0.08, 0.02, SH.dark, x + k * (w / 2 - 0.03), y0 + h * 0.78, zf + 0.01); }
    }
    box(g, 0.18, 0.18, 0.008, SH.stripe, x - w / 4, y0 + h * 0.7, zf + 0.005);
    box(g, 0.22, 0.05, 0.012, SH.led, x + w / 4, y0 + h * 0.86, zf + 0.006);
    ao(g, w + 0.24, d + 0.24, x, Y + 0.01, z, 1.6);
  }

  // pompa cu motor pe sasiu, cu axul de-a lungul lui z: aspiratia spre nord (z mic), refularea in sus. y = inaltimea axului, yf = fata de sus a sasiului.
  function rcPump(g, x, y, z, yf, on) {
    var s1 = Q.lite ? 8 : 14, s2 = Q.lite ? 6 : 10;
    cyl(g, 0.21, 0.21, 0.16, SH.dark, x, y, z, s1, RCZ); cyl(g, 0.1, 0.1, 0.1, SH.dark, x, y, z - 0.1, s2, RCZ);          // corpul pompei si gura de aspiratie
    cyl(g, 0.09, 0.09, 0.26, SH.dark, x, y, z + 0.21, s2, RCZ); box(g, 0.2, y - yf - 0.06, 0.2, SH.dark, x, (y + yf - 0.06) / 2, z + 0.2);   // lagarul pe piciorul lui
    box(g, 0.2, 0.2, 0.17, SH.stripe, x, y, z + 0.425);                                                 // aparatoarea cuplajului
    cyl(g, 0.16, 0.16, 0.5, SH.steel, x, y, z + 0.76, s1, RCZ); cyl(g, 0.168, 0.168, 0.1, SH.dark, x, y, z + 1.06, s1, RCZ);    // motorul si capacul ventilatorului
    box(g, 0.26, y - yf - 0.12, 0.38, SH.dark, x, (y + yf - 0.12) / 2, z + 0.76); box(g, 0.14, 0.09, 0.16, SH.dark, x, y + 0.19, z + 0.7);
    box(g, 0.05, 0.03, 0.02, on ? SH.led : SH.dark, x, y + 0.19, z + 0.79);
  }

  // vas tampon in picioare, pe fusta de otel si placa de beton, cu gura de vizitare, supapa si aerisire
  function rcTank(g, x, z, r, yTop) {
    var y0 = 0.35, ys = y0 + 0.3, yc = yTop - r * 0.32, s1 = Q.lite ? 12 : 24, s2 = Q.lite ? 8 : 14;
    box(g, r * 2 + 0.3, 0.15, r * 2 + 0.3, SH.concrete, x, 0.275, z);
    cyl(g, r * 0.93, r * 0.93, 0.3, SH.dark, x, y0 + 0.15, z, s1);
    cyl(g, r, r, yc - ys, SH.silver, x, (yc + ys) / 2, z, s1); sph(g, r, SH.silver, x, yc, z, true, 0.32, Q.lite ? 1 : 2);
    [ys + 0.04, (ys + yc) / 2, yc - 0.04].forEach(function (yy) { cyl(g, r + 0.012, r + 0.012, 0.05, SH.steel, x, yy, z, s1); });   // benzile mantalei
    cyl(g, 0.24, 0.24, 0.1, SH.steel, x + r, ys + 0.55, z, s2, RCX); cyl(g, 0.2, 0.2, 0.06, SH.dark, x + r + 0.07, ys + 0.55, z, s2, RCX);   // gura de vizitare
    cyl(g, 0.03, 0.03, 0.3, SH.steel, x, yTop + 0.12, z, 6); box(g, 0.09, 0.12, 0.09, SH.stripe, x, yTop + 0.3, z);                 // supapa de siguranta
    cyl(g, 0.02, 0.02, 0.2, SH.steel, x + r * 0.5, yTop - 0.02, z, 6); cyl(g, 0.04, 0.04, 0.06, SH.dark, x + r * 0.5, yTop + 0.1, z, 8);   // aerisire
    ao(g, r * 2 + 0.3, r * 2 + 0.3, x, 0.21, z, 1.6);
  }
  // vas de expansiune pe trei picioare
  function rcVessel(g, x, z, r, h) {
    var a;
    box(g, r * 2 + 0.3, 0.1, r * 2 + 0.3, SH.concrete, x, 0.25, z);
    for (a = 0; a < 3; a++) box(g, 0.05, 0.3, 0.05, SH.dark, x + Math.cos(a * 2.094) * r * 0.8, 0.45, z + Math.sin(a * 2.094) * r * 0.8);
    cyl(g, r, r, h - r * 0.9, SH.steel, x, 0.55 + (h - r * 0.9) / 2, z, Q.lite ? 10 : 16); sph(g, r, SH.steel, x, 0.55, z, true, 0.45, 1); sph(g, r, SH.steel, x, 0.55 + h - r * 0.9, z, true, 0.45, 1);
    cyl(g, 0.025, 0.025, 0.12, SH.dark, x, 0.55 + h - r * 0.45 + 0.05, z, 6);
  }
