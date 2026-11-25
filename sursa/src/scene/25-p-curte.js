  function person(parent, x, y, z) {
    var sd;
    for (sd = -1; sd <= 1; sd += 2) {
      box(parent, 0.13, 0.1, 0.25, SH.tire, x + sd * 0.09, y + 0.05, z + 0.03, false);                 // bocanci
      box(parent, 0.13, 0.78, 0.15, SH.pants, x + sd * 0.09, y + 0.47, z, false);                      // picioare
      box(parent, 0.1, 0.52, 0.12, SH.person, x + sd * 0.275, y + 1.17, z, false);                     // maneci
      box(parent, 0.085, 0.09, 0.1, SH.skin, x + sd * 0.275, y + 0.865, z, false);                     // maini
      box(parent, 0.045, 0.5, 0.235, SH.white, x + sd * 0.1, y + 1.18, z, false);                      // bretelele reflectorizante ale vestei
    }
    box(parent, 0.34, 0.14, 0.2, SH.pants, x, y + 0.9, z, false);
    taper(parent, 0.38, 0.5, 0.22, SH.person, x, y + 1.2, z, 1.14, 1, 0, true);                        // vesta, mai lata in umeri
    box(parent, 0.39, 0.05, 0.232, SH.white, x, y + 1.04, z, false);                                   // banda reflectorizanta
    cyl(parent, 0.05, 0.055, 0.09, SH.skin, x, y + 1.49, z, 6, null, false);
    sph(parent, 0.108, SH.skin, x, y + 1.62, z, false, 1.12);
    sph(parent, 0.132, SH.helmet, x, y + 1.685, z, false, 0.62); cyl(parent, 0.16, 0.16, 0.018, SH.helmet, x, y + 1.665, z + 0.03, 10, null, false);   // casca cu bor
  }
  function car(parent, x, z, ci) {            // lung pe z, cu botul spre sud; trei caroserii: berlina, SUV, break
    var p = SH.carPaint[ci % SH.carPaint.length], v = ci % 3, suv = v === 1, sd, e;
    var by = suv ? 0.52 : 0.47, bh = suv ? 0.62 : 0.52, bt = by + bh, wr = suv ? 0.37 : 0.33, wy = 0.23 + wr;
    var cl = v === 0 ? 2.4 : 3.0, czz = z - (v === 0 ? 0.25 : 0.52), ch = suv ? 0.5 : 0.45, ckx = 0.8, ckz = v === 0 ? 0.62 : 0.8, coz = v === 0 ? -0.03 : -0.045, cw = suv ? 1.7 : 1.64;
    box(parent, 1.72, 0.16, 4.1, SH.dark, x, by - 0.02, z, false);                                                  // praguri si podea
    taper(parent, 1.82, bh, 4.3, p, x, by + bh / 2, z, 0.93, 0.965, 0, true);                                       // caroseria
    taper(parent, cw, ch, cl, SH.carGlass, x, bt + ch / 2, czz, ckx, ckz, coz, true);                               // geamurile
    var tw = cw * ckx, tl = cl * ckz, tzc = czz + coz * cl;
    box(parent, tw + 0.04, 0.05, tl + 0.04, p, x, bt + ch + 0.02, tzc, false);                                      // plafonul
    for (sd = -1; sd <= 1; sd += 2) {
      [[cl / 2, tl / 2], [-cl / 2, -tl / 2], [v === 0 ? 0.05 : 0.35, v === 0 ? 0.02 : 0.3]].forEach(function (q, n) {     // stalpii dintre geamuri
        beam(parent, p, x + sd * cw / 2, bt, czz + q[0], x + sd * tw / 2, bt + ch, tzc + q[1], n === 2 ? 0.07 : 0.085, false);
      });
      wheel(parent, x + sd * 0.8, wy, z + 1.36, wr, 0.24, sd); wheel(parent, x + sd * 0.8, wy, z - 1.36, wr, 0.24, sd);
      cyl(parent, wr + 0.08, wr + 0.08, 0.05, SH.dark, x + sd * 0.888, wy, z + 1.36, 14, [0, 0, Math.PI / 2], false); cyl(parent, wr + 0.08, wr + 0.08, 0.05, SH.dark, x + sd * 0.888, wy, z - 1.36, 14, [0, 0, Math.PI / 2], false);   // pasajele rotilor
      box(parent, 0.34, 0.11, 0.06, SH.light, x + sd * 0.66, by + bh * 0.72, z + 2.085, false);                    // faruri
      box(parent, 0.3, 0.1, 0.06, SH.red, x + sd * 0.68, by + bh * 0.76, z - 2.085, false);                        // stopuri
      box(parent, 0.17, 0.1, 0.09, p, x + sd * 0.95, bt + 0.06, czz + cl / 2 - 0.2, false);                        // oglinzi
      box(parent, 0.012, 0.03, 0.16, SH.dark, x + sd * 0.895, bt - 0.12, z + 0.2, false); box(parent, 0.012, 0.03, 0.16, SH.dark, x + sd * 0.895, bt - 0.12, z - 0.75, false);   // manere
      if (suv) box(parent, 0.05, 0.05, tl * 0.9, SH.dark, x + sd * (tw / 2 - 0.08), bt + ch + 0.07, tzc, false);   // bare pe plafon
    }
    for (e = -1; e <= 1; e += 2) { box(parent, 1.76, 0.2, 0.14, SH.dark, x, by + 0.06, z + e * 2.1, false); box(parent, 0.44, 0.1, 0.02, SH.white, x, by + 0.08, z + e * 2.18, false); }   // bare de protectie si numere
    box(parent, 0.86, 0.13, 0.05, SH.dark, x, by + bh * 0.66, z + 2.1, false);                                      // grila
    ao(parent, 2.0, 4.5, x, 0.262, z, 1.35);
  }
  function truck(parent, x, z) {              // camion cu cutie, cu spatele spre nord
    var p = SH.carPaint[2], sd, e;
    box(parent, 1.0, 0.24, 8.1, SH.dark, x, 0.92, z, false);                                                         // sasiu
    box(parent, 2.46, 2.6, 6.2, SH.white, x, 2.34, z - 1.0);                                                         // cutia
    box(parent, 2.5, 0.1, 6.24, SH.steel, x, 1.06, z - 1.0, false); box(parent, 2.5, 0.07, 6.24, SH.steel, x, 3.65, z - 1.0, false);
    for (sd = -1; sd <= 1; sd += 2) {
      for (e = -1; e <= 1; e += 2) box(parent, 0.08, 2.6, 0.08, SH.steel, x + sd * 1.21, 2.34, z - 1.0 + e * 3.08, false);
      box(parent, 1.14, 2.4, 0.04, SH.white, x + sd * 0.59, 2.34, z - 4.115, false);                                 // usile din spate, cu bare de zavorare
      cyl(parent, 0.025, 0.025, 2.4, SH.steel, x + sd * 0.25, 2.34, z - 4.15, 6, null, false); cyl(parent, 0.025, 0.025, 2.4, SH.steel, x + sd * 0.92, 2.34, z - 4.15, 6, null, false);
      box(parent, 0.26, 0.12, 0.05, SH.red, x + sd * 1.0, 0.92, z - 4.07, false);
      wheel(parent, x + sd * 1.02, 0.74, z + 3.1, 0.5, 0.32, sd); wheel(parent, x + sd * 1.02, 0.74, z - 2.4, 0.5, 0.32, sd); wheel(parent, x + sd * 1.02, 0.74, z - 3.5, 0.5, 0.32, sd);
      box(parent, 0.4, 0.06, 2.4, SH.dark, x + sd * 1.02, 1.3, z - 2.95, false); box(parent, 0.38, 0.5, 0.03, SH.tire, x + sd * 1.02, 0.6, z - 4.06, false);       // aparatori de noroi
      cyl(parent, 0.62, 0.62, 0.05, SH.dark, x + sd * 1.135, 0.74, z + 3.1, 14, [0, 0, Math.PI / 2], false);          // pasajul rotii din fata
      box(parent, 0.04, 0.62, 1.0, SH.carGlass, x + sd * 1.135, 2.32, z + 3.35, false);                               // geamurile laterale
      box(parent, 0.1, 0.42, 0.18, SH.dark, x + sd * 1.3, 2.3, z + 4.0, false); box(parent, 0.2, 0.04, 0.04, SH.dark, x + sd * 1.2, 2.45, z + 4.0, false);       // oglinzi
      box(parent, 0.12, 0.08, 0.5, SH.steel, x + sd * 1.13, 0.6, z + 3.75, false);                                    // trepte
      box(parent, 0.32, 0.15, 0.06, SH.light, x + sd * 0.86, 0.86, z + 4.21, false);                                  // faruri
    }
    box(parent, 2.3, 0.14, 0.12, SH.dark, x, 0.62, z - 4.02, false);                                                 // bara anti-impanare
    box(parent, 2.3, 1.05, 1.9, p, x, 1.325, z + 3.2);                                                               // cabina: partea de jos
    taper(parent, 2.3, 0.95, 1.9, p, x, 2.325, z + 3.2, 0.97, 0.86, -0.06, true);                                    // cabina: partea cu geamuri
    box(parent, 2.02, 0.74, 0.04, SH.carGlass, x, 2.32, z + 4.062, false, [-0.22, 0, 0]);                            // parbrizul inclinat
    taper(parent, 2.1, 0.6, 1.3, p, x, 3.1, z + 2.95, 0.92, 0.3, -0.33, false);                                      // deflector pe cabina
    box(parent, 1.7, 0.5, 0.05, SH.dark, x, 1.32, z + 4.16, false); box(parent, 2.34, 0.3, 0.2, SH.dark, x, 0.84, z + 4.12, false); box(parent, 0.5, 0.11, 0.02, SH.white, x, 0.84, z + 4.225, false);
    cyl(parent, 0.28, 0.28, 1.1, SH.silver, x - 0.82, 0.86, z + 1.2, 12, [Math.PI / 2, 0, 0], false);               // rezervor
    ao(parent, 2.6, 8.4, x, 0.262, z, 1.3);
  }
  function lampTpl() {                        // stalp de iluminat de 9 m, pe fundatie de beton, cu brat si corp LED
    return tpl(function (g) {
      box(g, 0.6, 0.14, 0.6, SH.base, 0, 0.07, 0, false); box(g, 0.36, 0.03, 0.36, SH.dark, 0, 0.155, 0, false);
      [[-0.13, -0.13], [0.13, -0.13], [-0.13, 0.13], [0.13, 0.13]].forEach(function (c) { cyl(g, 0.02, 0.02, 0.05, SH.steel, c[0], 0.19, c[1], 6, null, false); });
      cyl(g, 0.1, 0.13, 0.55, SH.dark, 0, 0.44, 0, 8, null, false); box(g, 0.02, 0.3, 0.12, SH.steel, 0, 0.5, 0.125, false);
      cyl(g, 0.055, 0.1, 8.3, SH.steel, 0, 4.85, 0, 8);
      beam(g, SH.steel, 0, 8.9, 0, 0, 9.08, 0.95, 0.075, false);
      box(g, 0.3, 0.09, 0.72, SH.dark, 0, 9.08, 1.25, false); box(g, 0.24, 0.02, 0.56, SH.lampHead, 0, 9.025, 1.27, false);
    });
  }
  function fenceRun(parent, posts, x0, z0, x1, z1, hgt, base) {   // plasa intre doua puncte + stalpii ei; base = grinda de beton la sol si sarma ghimpata sus
    var dx = x1 - x0, dz = z1 - z0, len = Math.sqrt(dx * dx + dz * dz), n = Math.max(1, Math.round(len / 3)), ang = Math.atan2(-dz, dx);
    addGeo(parent, unit('vplane', function () { return new T.PlaneGeometry(1, 1); }), SH.fence, (x0 + x1) / 2, hgt / 2 + 0.05, (z0 + z1) / 2, len, hgt, 1, [0, ang, 0], false);
    box(parent, len, 0.05, 0.05, SH.steel, (x0 + x1) / 2, hgt + 0.05, (z0 + z1) / 2, false, [0, ang, 0]);
    if (base) {
      box(parent, len, 0.3, 0.2, SH.base, (x0 + x1) / 2, 0.1, (z0 + z1) / 2, false, [0, ang, 0]);
      box(parent, len, 0.015, 0.015, SH.steel, (x0 + x1) / 2, hgt + 0.16, (z0 + z1) / 2, false, [0, ang, 0]);
    }
    for (var i = 0; i <= n; i++) posts.push([x0 + dx * i / n, z0 + dz * i / n, hgt]);
  }
  function gateLeaf(parent, xa, xb, z, yb, h) {   // canat de poarta: rama de teava, montanti si plasa
    var len = xb - xa, xm = (xa + xb) / 2, n = Math.max(1, Math.round(len / 1.5)), i;
    box(parent, len, 0.14, 0.1, SH.dark, xm, yb + 0.07, z, false); box(parent, len, 0.08, 0.08, SH.dark, xm, yb + h - 0.04, z, false);
    for (i = 0; i <= n; i++) box(parent, i % n ? 0.05 : 0.09, h - 0.2, i % n ? 0.05 : 0.09, SH.dark, i === 0 ? xa + 0.045 : i === n ? xb - 0.045 : xa + len * i / n, yb + h / 2 + 0.02, z, false);
    vpl(parent, len - 0.1, h - 0.22, SH.fence, xm, yb + h / 2 + 0.02, z);
  }
  function footing(parent, x, z, s) {         // fundatie mica de beton pentru stalpi si catarge, pe platforma
    box(parent, s, 0.12, s, SH.base, x, 0.26, z, false); cyl(parent, s * 0.26, s * 0.3, 0.05, SH.dark, x, 0.345, z, 8, null, false);
  }
