  function pvTableTpl() {                     // o masa de panouri: 52 de module pe structura metalica, inclinata 25 de grade spre sud
    var a = 0.436, ca = Math.cos(a), sa = Math.sin(a), yc = 1.9, rot = [a, 0, 0], np = Q.lite ? 4 : 7;
    return tpl(function (g) {
      addGeo(g, unit('flat', function () { var gg = new T.PlaneGeometry(1, 1); gg.rotateX(-Math.PI / 2); return gg; }), SH.panel, 0, yc + 0.02 * ca, 0.02 * sa, 30, 1, 4.6, rot, true);                 // fata cu celule
      addGeo(g, unit('flatDown', function () { var gg = new T.PlaneGeometry(1, 1); gg.rotateX(Math.PI / 2); return gg; }), SH.panelBack, 0, yc - 0.02 * ca, -0.02 * sa, 30, 1, 4.6, rot, true);     // spatele alb
      [-2.3, 2.3].forEach(function (zl) { box(g, 30, 0.07, 0.05, SH.frame, 0, yc - zl * sa, zl * ca, false, rot); });
      [-1.25, 1.25].forEach(function (zl) { box(g, 30, 0.1, 0.07, SH.frame, 0, yc - 0.07 * ca - zl * sa, -0.07 * sa + zl * ca, false, rot); });
      for (var i = 0; i < np; i++) {
        var px = -13.5 + i * 27 / (np - 1);
        [-1.25, 1.25].forEach(function (zl) { var top = yc - 0.12 * ca - zl * sa; box(g, 0.1, top, 0.12, SH.steel, px, top / 2, zl * ca, true); });
        if (!Q.lite) beam(g, SH.steel, px, 0.25, 1.25 * ca, px, yc - 0.12 * ca + 1.25 * sa - 0.25, -1.25 * ca, 0.06, false);
      }
    });
  }
  function inverterStation(parent, x, z) {    // statie de invertoare cu transformator, pe placa de beton
    var i, sd;
    box(parent, 6.8, 0.3, 3.2, SH.concrete, x, 0.15, z, false);
    box(parent, 5.04, 0.14, 2.44, SH.dark, x - 0.6, 0.37, z, false);
    box(parent, 5.0, 2.4, 2.4, SH.cont, x - 0.6, 1.64, z);
    box(parent, 5.2, 0.1, 2.6, SH.trim, x - 0.6, 2.89, z);                                              // acoperis cu streasina
    box(parent, 1.6, 1.6, 0.04, SH.louver, x - 1.8, 1.55, z + 1.22, false); box(parent, 1.4, 0.9, 0.04, SH.louver, x - 1.6, 1.9, z - 1.22, false);
    box(parent, 0.9, 2.0, 0.04, SH.white, x + 0.4, 1.46, z + 1.22, false); box(parent, 1.0, 2.1, 0.02, SH.dark, x + 0.4, 1.48, z + 1.205, false);   // usa cu toc
    box(parent, 0.03, 0.5, 0.03, SH.steel, x + 0.7, 1.4, z + 1.25, false); box(parent, 0.22, 0.22, 0.012, SH.hazard, x + 0.3, 1.95, z + 1.245, false);
    box(parent, 0.3, 0.2, 0.012, SH.white, x + 1.3, 2.2, z + 1.21, false);
    box(parent, 0.7, 0.6, 0.3, SH.silver, x - 1.9, 1.1, z - 1.36, false); vdisc(parent, 0.22, SH.fan, x - 1.9, 1.1, z - 1.52, false);                // aer conditionat
    box(parent, 1.1, 1.5, 1.4, SH.trafo, x + 2.7, 1.05, z); box(parent, 1.2, 0.08, 1.5, SH.trafo, x + 2.7, 1.84, z, false);                        // transformatorul de ridicare
    for (sd = -1; sd <= 1; sd += 2) for (i = 0; i < 4; i++) box(parent, 0.06, 1.1, 0.26, SH.trafoFin, x + 2.3 + i * 0.26, 1.0, z + sd * 0.84);
    for (i = 0; i < 3; i++) { cyl(parent, 0.05, 0.08, 0.4, SH.ceramic, x + 2.7, 2.08, z - 0.4 + i * 0.4, 8, null, false); cyl(parent, 0.025, 0.025, 0.1, SH.silver, x + 2.7, 2.32, z - 0.4 + i * 0.4, 6, null, false); }
    box(parent, 0.5, 0.03, 0.8, SH.steel, x + 2.05, 0.315, z, false);                                   // capacul canalului de cabluri
    for (sd = -1; sd <= 1; sd += 2) cyl(parent, 0.07, 0.07, 0.9, SH.stripe, x + sd * 3.2, 0.75, z + 1.45, 8, null, false);     // stalpisori de protectie
    ao(parent, 6.8, 3.2, x, 0.03, z, 1.4);
  }
