  function genset(parent, x, z, len, s) {     // grup electrogen in carcasa antifonica, lungimea pe axa x
    var h = 2.7 * s, w = 2.5 * s, yb = 0.22 + 0.3 * s, top = yb + h, nd = Math.max(2, Math.round(len / 3)), i, sd;
    box(parent, len + 0.4, 0.3 * s, w + 0.2, SH.dark, x, 0.22 + 0.15 * s, z);                                    // sasiu cu rezervor
    box(parent, len, h, w, SH.contDark, x, yb + h / 2, z);
    box(parent, len + 0.06, 0.1 * s, w + 0.06, SH.dark, x, top + 0.05 * s, z, false);                            // rama acoperisului
    for (sd = -1; sd <= 1; sd += 2) {
      box(parent, 0.06, h * 0.72, w * 0.8, SH.louver, x + sd * (len / 2 + 0.03), yb + h * 0.5, z, false);       // jaluzele la capete
      box(parent, len * 0.2, h * 0.5, 0.05, SH.louver, x - len * 0.32, yb + h * 0.56, z + sd * (w / 2 + 0.02), false);   // prize de aer pe laterale
      box(parent, 0.2 * s, 0.14 * s, 0.1 * s, SH.steel, x - len * 0.42, top + 0.12 * s, z + sd * (w / 2 - 0.1 * s), false); box(parent, 0.2 * s, 0.14 * s, 0.1 * s, SH.steel, x + len * 0.42, top + 0.12 * s, z + sd * (w / 2 - 0.1 * s), false);   // urechi de ridicare
      for (i = 0; i <= nd; i++) {
        box(parent, 0.05, h * 0.82, 0.03, SH.dark, x - len / 2 + i * len / nd, yb + h * 0.47, z + sd * (w / 2 + 0.015), false);          // usi de serviciu
        if (i < nd) box(parent, 0.05, 0.28 * s, 0.05, SH.steel, x - len / 2 + (i + 0.85) * len / nd, yb + h * 0.45, z + sd * (w / 2 + 0.04), false);
      }
    }
    box(parent, 0.7 * s, 0.9 * s, 0.14 * s, SH.silver, x + len * 0.38, yb + h * 0.55, z + w / 2 + 0.07 * s, false);     // tablou de comanda cu afisaj
    box(parent, 0.34 * s, 0.2 * s, 0.02, SH.screen, x + len * 0.38, yb + h * 0.66, z + w / 2 + 0.15 * s, false); box(parent, 0.4 * s, 0.2 * s, 0.02, SH.hazard, x + len * 0.12, yb + h * 0.7, z + w / 2 + 0.03, false);
    cyl(parent, 0.3 * s, 0.3 * s, len * 0.3, SH.silver, x + len * 0.16, top + 0.36 * s, z, 12, [0, 0, Math.PI / 2]);  // toba de esapament
    box(parent, 0.12 * s, 0.3 * s, 0.5 * s, SH.steel, x + len * 0.06, top + 0.2 * s, z, false); box(parent, 0.12 * s, 0.3 * s, 0.5 * s, SH.steel, x + len * 0.26, top + 0.2 * s, z, false);
    cyl(parent, 0.13 * s, 0.13 * s, 1.5 * s, SH.silver, x + len * 0.3, top + 1.1 * s, z, 10);                          // cosul, cu capac de ploaie
    cyl(parent, 0.2 * s, 0.2 * s, 0.03 * s, SH.steel, x + len * 0.3 + 0.08 * s, top + 1.92 * s, z, 10, [0, 0, 0.5], false);
    box(parent, len * 0.28, 0.25 * s, w * 0.8, SH.dark, x - len * 0.3, top + 0.125 * s, z, false);                    // radiator pe acoperis
    disc(parent, w * 0.3, SH.fan, x - len * 0.3, top + 0.26 * s, z); disc(parent, w * 0.33, SH.grille, x - len * 0.3, top + 0.275 * s, z);
    var tz = z + w / 2 + 1.5 * s, tl = len * 0.5;                                                                      // rezervor de motorina in cuva
    cyl(parent, 0.6 * s, 0.6 * s, tl, SH.white, x, 0.22 + 1.0 * s, tz, 14, [0, 0, Math.PI / 2]);
    blob(parent, SH.white, x - tl / 2, 0.22 + 1.0 * s, tz, 0.2 * s, 0.6 * s, 0.6 * s, 0, false); blob(parent, SH.white, x + tl / 2, 0.22 + 1.0 * s, tz, 0.2 * s, 0.6 * s, 0.6 * s, 0, false);
    box(parent, 0.2, 0.5 * s, 1.0 * s, SH.steel, x - len * 0.17, 0.22 + 0.25 * s, tz, false); box(parent, 0.2, 0.5 * s, 1.0 * s, SH.steel, x + len * 0.17, 0.22 + 0.25 * s, tz, false);
    cyl(parent, 0.09 * s, 0.09 * s, 0.16 * s, SH.red, x - tl * 0.25, 0.22 + 1.66 * s, tz, 8, null, false); cyl(parent, 0.035 * s, 0.035 * s, 0.6 * s, SH.steel, x + tl * 0.3, 0.22 + 1.85 * s, tz, 6, null, false);
    cyl(parent, 0.04 * s, 0.04 * s, 1.5 * s, SH.steel, x + tl * 0.1, 0.22 + 0.5 * s, z + w / 2 + 0.75 * s, 6, [Math.PI / 2, 0, 0], false);      // teava de motorina spre motor
    var bl = tl + 1.2 * s, bz = 1.7 * s;
    box(parent, bl, 0.3 * s, 0.1, SH.base, x, 0.22 + 0.15 * s, tz + bz / 2, false); box(parent, 0.1, 0.3 * s, bz, SH.base, x - bl / 2, 0.22 + 0.15 * s, tz, false); box(parent, 0.1, 0.3 * s, bz, SH.base, x + bl / 2, 0.22 + 0.15 * s, tz, false);
    ao(parent, len, w, x, 0.235, z, 1.5);
    return [x + len * 0.3, top + 2.0 * s, z];
  }
