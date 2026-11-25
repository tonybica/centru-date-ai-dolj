  function coolerTpl(len) {                   // racitor uscat: baterie cu lamele, ventilatoare deasupra
    return tpl(function (g) {
      var i, j, nf = Math.max(2, Math.round(len / 2.3));
      for (i = 0; i < 3; i++) for (j = -1; j <= 1; j += 2) { box(g, 0.12, 1.2, 0.12, SH.steel, -len / 2 + 0.3 + i * (len - 0.6) / 2, 0.6, j * 1.0, false); box(g, 0.3, 0.03, 0.3, SH.steel, -len / 2 + 0.3 + i * (len - 0.6) / 2, 0.015, j * 1.0, false); }
      for (j = -1; j <= 1; j += 2) for (i = 0; i < 2; i++) beam(g, SH.steel, -len / 2 + 0.3 + i * (len - 0.6) / 2, 0.15, j * 1.0, -len / 2 + 0.3 + (i + 1) * (len - 0.6) / 2, 1.1, j * 1.0, 0.05, false);    // contravantuiri
      box(g, len, 0.12, 2.3, SH.steel, 0, 1.22, 0, false);
      box(g, len - 0.1, 1.25, 2.2, SH.coil, 0, 1.9, 0);
      box(g, len, 0.1, 2.3, SH.silver, 0, 2.57, 0, false);
      box(g, 0.1, 1.3, 2.3, SH.silver, -len / 2, 1.9, 0, false); box(g, 0.1, 1.3, 2.3, SH.silver, len / 2, 1.9, 0, false);
      for (i = 1; i < nf; i++) for (j = -1; j <= 1; j += 2) box(g, 0.08, 1.26, 0.04, SH.silver, -len / 2 + i * len / nf, 1.9, j * 1.12, false);      // montantii dintre celule
      for (var f = 0; f < nf; f++) {
        var fx = -len / 2 + (f + 0.5) * len / nf;
        cyl(g, 0.98, 1.04, 0.3, SH.silver, fx, 2.77, 0, 20, null, false);
        disc(g, 0.92, SH.dark, fx, 2.86, 0); disc(g, 0.9, SH.fan, fx, 2.9, 0); disc(g, 0.97, SH.grille, fx, 2.93, 0);
        cyl(g, 0.16, 0.2, 0.14, SH.dark, fx, 2.95, 0, 10, null, false);                                 // motorul ventilatorului
      }
      cyl(g, 0.1, 0.1, len, SH.blue, 0, 1.0, 1.25, 8, [0, 0, Math.PI / 2], false); cyl(g, 0.1, 0.1, len, SH.red, 0, 0.75, 1.25, 8, [0, 0, Math.PI / 2], false);
      for (i = -1; i <= 1; i += 2) {                                                                    // colectoarele care leaga bateria de tevi
        cyl(g, 0.07, 0.07, 1.5, SH.blue, i * (len / 2 - 0.5), 1.72, 1.2, 8, null, false); cyl(g, 0.07, 0.07, 1.3, SH.red, i * (len / 2 - 0.9), 1.38, 1.2, 8, null, false);
      }
      box(g, 0.5, 0.7, 0.22, SH.silver, len / 2 - 0.45, 1.75, -1.26, false); box(g, 0.2, 0.12, 0.02, SH.led, len / 2 - 0.45, 1.95, -1.375, false);   // cutia electrica
      cyl(g, 0.03, 0.03, 1.2, SH.dark, len / 2 - 0.45, 0.8, -1.26, 6, null, false);
      ao(g, len, 2.4, 0, 0.02, 0, 1.5);
    });
  }
