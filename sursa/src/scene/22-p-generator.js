  function genset(parent, x, z, len, s) {     // grup electrogen in container antifonic, lung pe axa x: radiatorul spre vest (drum), alternatorul si cablurile spre est (cladire), rezervorul pe partea de nord
    var h = 2.9 * s, w = 2.6 * s, P = 0.2, yp = P + 0.15, yb = yp + 0.35 * s, top = yb + h, nd = Math.max(2, Math.round(len / 3)), fine = !Q.lite, i, sd;
    box(parent, len + 0.8, 0.15, w + 0.6, SH.concrete, x, P + 0.075, z, false);                                  // fundatie de beton, 15 cm peste platforma
    box(parent, len + 0.04, 0.35 * s, w + 0.04, SH.dark, x, yp + 0.175 * s, z);                                  // sasiu cu rezervor de zi
    box(parent, len, h, w, SH.contDark, x, yb + h / 2, z);
    box(parent, len + 0.06, 0.1 * s, w + 0.06, SH.dark, x, top + 0.05 * s, z, false);                            // rama acoperisului
    box(parent, 0.06, h * 0.72, w * 0.8, SH.louver, x - len / 2 - 0.03, yb + h * 0.5, z, false);                 // jaluzele la capatul dinspre drum
    box(parent, 0.06, h * 0.34, w * 0.8, SH.louver, x + len / 2 + 0.03, yb + h * 0.74, z, false);                // aerisire sus, la capatul cu alternatorul
    for (sd = -1; sd <= 1; sd += 2) {
      box(parent, len * 0.2, h * 0.5, 0.05, SH.louver, x - len * 0.32, yb + h * 0.56, z + sd * (w / 2 + 0.02), false);   // prize de aer pe laterale
      if (fine) { box(parent, 0.2 * s, 0.14 * s, 0.1 * s, SH.steel, x - len * 0.42, top + 0.12 * s, z + sd * (w / 2 - 0.1 * s), false); box(parent, 0.2 * s, 0.14 * s, 0.1 * s, SH.steel, x + len * 0.42, top + 0.12 * s, z + sd * (w / 2 - 0.1 * s), false); }   // urechi de ridicare
      for (i = 0; i <= nd; i++) {
        box(parent, 0.05, h * 0.82, 0.03, SH.dark, x - len / 2 + i * len / nd, yb + h * 0.47, z + sd * (w / 2 + 0.015), false);          // usi de serviciu
        if (fine && i < nd) box(parent, 0.05, 0.28 * s, 0.05, SH.steel, x - len / 2 + (i + 0.85) * len / nd, yb + h * 0.45, z + sd * (w / 2 + 0.04), false);
      }
    }
    box(parent, 0.7 * s, 0.9 * s, 0.14 * s, SH.silver, x + len * 0.36, yb + h * 0.55, z + w / 2 + 0.07 * s, false);     // tablou de comanda cu afisaj, pe partea de sud
    box(parent, 0.34 * s, 0.2 * s, 0.02, SH.screen, x + len * 0.36, yb + h * 0.66, z + w / 2 + 0.15 * s, false); box(parent, 0.4 * s, 0.2 * s, 0.02, SH.hazard, x + len * 0.12, yb + h * 0.7, z + w / 2 + 0.03, false);
    // esapament: teava iese prin acoperis, intra in toba, iar cosul urca din capatul tobei
    cyl(parent, 0.11 * s, 0.11 * s, 0.3 * s, SH.silver, x + len * 0.03, top + 0.2 * s, z, 8, null, false);
    cyl(parent, 0.3 * s, 0.3 * s, len * 0.3, SH.silver, x + len * 0.16, top + 0.36 * s, z, 12, [0, 0, Math.PI / 2]);
    box(parent, 0.12 * s, 0.3 * s, 0.5 * s, SH.steel, x + len * 0.06, top + 0.2 * s, z, false); box(parent, 0.12 * s, 0.3 * s, 0.5 * s, SH.steel, x + len * 0.26, top + 0.2 * s, z, false);
    cyl(parent, 0.13 * s, 0.13 * s, 1.5 * s, SH.silver, x + len * 0.3, top + 1.1 * s, z, 10);                          // cosul, cu capac de ploaie
    cyl(parent, 0.2 * s, 0.2 * s, 0.03 * s, SH.steel, x + len * 0.3 + 0.08 * s, top + 1.92 * s, z, 10, [0, 0, 0.5], false);
    // radiator pe acoperis, cu ventilatoare
    var nf = len >= 10 ? 2 : 1, fr = Math.min(w * 0.3, len * 0.062);
    box(parent, len * 0.28, 0.25 * s, w * 0.8, SH.dark, x - len * 0.3, top + 0.125 * s, z, false);
    for (i = 0; i < nf; i++) { var fxx = x - len * 0.3 + (i - (nf - 1) / 2) * len * 0.135; disc(parent, fr, SH.fan, fxx, top + 0.26 * s, z); disc(parent, fr * 1.08, SH.grille, fxx, top + 0.275 * s, z); }
    // capatul dinspre cladire: cutia de borne cu intrerupatorul; cablurile coboara in fundatie si pleaca prin canal
    var bx = x + len / 2 + 0.15 * s;
    box(parent, 0.3 * s, 0.9 * s, 1.2 * s, SH.silver, bx, yb + 0.5 * s, z, false);
    box(parent, 0.02, 0.2 * s, 0.34 * s, SH.hazard, bx + 0.15 * s + 0.011, yb + 0.68 * s, z, false);
    for (i = -1; i <= 1; i++) cyl(parent, 0.05 * s, 0.05 * s, yb + 0.06 * s - yp, SH.dark, bx, (yb + 0.06 * s + yp) / 2, z + i * 0.35 * s, 8, null, false);
    // rezervor de motorina cu perete dublu, pe sei, in cuva de retentie cu patru pereti (la nord de grup, cu loc de trecere intre ele)
    var r = 0.65 * s, tl = len * 0.5, tz = z - (w / 2 + 0.9 * s + 0.1 + r + 0.3 * s), yt = P + 0.35 * s + r, bl = tl + 1.4 * s, bz = 2 * (r + 0.3 * s) + 0.2, bh = 0.45 * s, sh = 0.35 * s + 0.3 * r;
    box(parent, bl, bh, 0.1, SH.base, x, P + bh / 2, tz - bz / 2 + 0.05, false); box(parent, bl, bh, 0.1, SH.base, x, P + bh / 2, tz + bz / 2 - 0.05, false);
    box(parent, 0.1, bh, bz - 0.2, SH.base, x - bl / 2 + 0.05, P + bh / 2, tz, false); box(parent, 0.1, bh, bz - 0.2, SH.base, x + bl / 2 - 0.05, P + bh / 2, tz, false);
    cyl(parent, r, r, tl, SH.white, x, yt, tz, 16, [0, 0, Math.PI / 2]);
    blob(parent, SH.white, x - tl / 2, yt, tz, 0.22 * s, r, r, 0, false); blob(parent, SH.white, x + tl / 2, yt, tz, 0.22 * s, r, r, 0, false);
    box(parent, 0.25, sh, 1.5 * r, SH.steel, x - tl * 0.3, P + sh / 2, tz, false); box(parent, 0.25, sh, 1.5 * r, SH.steel, x + tl * 0.3, P + sh / 2, tz, false);
    cyl(parent, 0.3 * s, 0.3 * s, 0.08 * s, SH.steel, x, yt + r + 0.02 * s, tz, 12, null, false);                                      // gura de vizitare
    cyl(parent, 0.09 * s, 0.09 * s, 0.16 * s, SH.red, x - tl * 0.25, yt + r + 0.06 * s, tz, 8, null, false);                           // capac de umplere
    cyl(parent, 0.035 * s, 0.035 * s, 0.7 * s, SH.steel, x + tl * 0.3, yt + r + 0.33 * s, tz, 6, null, false); cyl(parent, 0.07 * s, 0.07 * s, 0.05 * s, SH.steel, x + tl * 0.3, yt + r + 0.69 * s, tz, 8, null, false);   // aerisire
    // punctul de umplere pentru cisterna, pe stalp, la capatul dinspre drum, legat de rezervor
    var cx0 = x - bl / 2 - 0.15 * s;
    box(parent, 0.08, 0.53 * s, 0.08, SH.steel, cx0, P + 0.265 * s, tz, false);
    box(parent, 0.3 * s, 0.55 * s, 0.6 * s, SH.silver, cx0, P + 0.8 * s, tz, false); box(parent, 0.02, 0.12 * s, 0.4 * s, SH.red, cx0 - 0.15 * s - 0.011, P + 0.92 * s, tz, false);
    cyl(parent, 0.04 * s, 0.04 * s, bl / 2 - tl / 2 - 0.18 * s, SH.steel, (cx0 + 0.15 * s + x - tl / 2 - 0.18 * s) / 2, yt, tz, 8, [0, 0, Math.PI / 2], false);
    // motorina spre motor si retur: doua tevi peste peretele cuvei, pe suport, cu robinet la rezervor
    var fy = P + 0.15 + 0.45 * s, za = tz + 0.45 * s, zb = z - w / 2 + 0.02, fx = x + tl * 0.1;
    for (sd = -1; sd <= 1; sd += 2) cyl(parent, 0.03 * s, 0.03 * s, zb - za, SH.steel, fx + sd * 0.08 * s, fy, (za + zb) / 2, 6, [Math.PI / 2, 0, 0], false);
    box(parent, 0.34 * s, fy - P - 0.03 * s, 0.06, SH.steel, fx, P + (fy - P - 0.03 * s) / 2, z - w / 2 - 0.3 - 0.3 * s, false);
    box(parent, 0.1 * s, 0.1 * s, 0.14 * s, SH.red, fx - 0.08 * s, fy, tz + r + 0.05 * s, false);
    ao(parent, len + 0.8, w + 0.6, x, 0.207, z, 1.5); ao(parent, bl, bz, x, 0.207, tz, 1.2);
    return [x + len * 0.3, top + 2.0 * s, z];
  }
