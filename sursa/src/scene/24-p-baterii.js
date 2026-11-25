  function bessTpl() {                        // container de baterii de 20 de picioare
    return tpl(function (g) {
      var i, sx, sz;
      box(g, 6.6, 0.3, 3.0, SH.concrete, 0, 0.15, 0, false);
      box(g, 6.1, 0.18, 2.46, SH.dark, 0, 0.39, 0, false);
      box(g, 6.06, 2.6, 2.44, SH.cont, 0, 1.78, 0);
      box(g, 6.1, 0.3, 2.48, SH.green, 0, 2.88, 0, false);
      for (sx = -1; sx <= 1; sx += 2) for (sz = -1; sz <= 1; sz += 2) {                                  // stalpii si colturile containerului
        box(g, 0.13, 2.62, 0.13, SH.white, sx * 3.0, 1.78, sz * 1.19, false);
        box(g, 0.19, 0.14, 0.19, SH.dark, sx * 3.0, 0.55, sz * 1.19, false); box(g, 0.19, 0.14, 0.19, SH.dark, sx * 3.0, 3.02, sz * 1.19, false);
      }
      for (i = 0; i < 6; i++) {                                                                          // usile modulelor: balamale, bare de inchidere, aerisiri
        var dx = -2.5 + i * 1.0;
        box(g, 0.94, 2.14, 0.04, SH.white, dx, 1.6, 1.235, false);
        cyl(g, 0.018, 0.018, 2.1, SH.steel, dx + 0.3, 1.6, 1.275, 5, null, false); box(g, 0.05, 0.16, 0.05, SH.dark, dx + 0.3, 1.5, 1.29, false);
        box(g, 0.04, 0.12, 0.03, SH.steel, dx - 0.44, 2.3, 1.262, false); box(g, 0.04, 0.12, 0.03, SH.steel, dx - 0.44, 0.9, 1.262, false);
        if (i % 2 === 0) box(g, 0.5, 0.3, 0.02, SH.louver, dx - 0.05, 0.85, 1.262, false); else box(g, 0.2, 0.2, 0.012, SH.hazard, dx - 0.1, 2.25, 1.262, false);
      }
      for (i = 0; i <= 6; i++) box(g, 0.035, 2.2, 0.05, SH.dark, -3.0 + i * 1.0, 1.6, 1.232, false);   // rosturile dintre usi
      box(g, 0.6, 0.16, 0.012, SH.white, -2.45, 2.5, 1.262, false); box(g, 0.3, 0.05, 0.02, SH.led, 2.3, 2.6, 1.262, false);     // eticheta si lumina de stare
      for (i = -1; i <= 1; i += 2) {                                                                     // aparatele de aer conditionat de la capete
        box(g, 0.45, 1.3, 1.5, SH.silver, i * 3.27, 1.5, 0); box(g, 0.02, 0.36, 1.2, SH.louver, i * 3.5, 1.0, 0, false);
        cyl(g, 0.4, 0.4, 0.03, SH.dark, i * 3.495, 1.72, 0, 16, [0, 0, Math.PI / 2], false); vdisc(g, 0.36, SH.fan, i * 3.515, 1.72, 0, true);
        box(g, 0.5, 0.06, 1.56, SH.steel, i * 3.27, 0.82, 0, false);
      }
      for (i = -1; i <= 1; i++) { box(g, 1.2, 0.12, 1.0, SH.white, i * 1.9, 3.12, 0, false); box(g, 1.3, 0.03, 1.1, SH.steel, i * 1.9, 3.045, 0, false); }      // clapete de siguranta pe acoperis
      box(g, 0.5, 0.5, 0.22, SH.steel, 2.3, 0.72, -1.33, false); for (i = -1; i <= 1; i++) cyl(g, 0.04, 0.04, 0.3, SH.dark, 2.3 + i * 0.14, 0.4, -1.36, 6, null, false);   // intrarea cablurilor
      box(g, 0.5, 0.7, 0.26, SH.red, -2.5, 1.3, -1.35, false); cyl(g, 0.03, 0.03, 1.2, SH.red, -2.5, 2.2, -1.3, 6, null, false);                                   // stingere a incendiilor
      ao(g, 6.8, 3.0, 0, 0.02, 0, 1.45);
    });
  }
