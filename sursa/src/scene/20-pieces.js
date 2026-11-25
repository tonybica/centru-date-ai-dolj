
  /* ---------- piese: fiecare functie pune un obiect intreg la locul lui ---------- */
  function person(parent, x, y, z) {
    box(parent, 0.13, 0.82, 0.15, SH.pants, x - 0.09, y + 0.41, z, false); box(parent, 0.13, 0.82, 0.15, SH.pants, x + 0.09, y + 0.41, z, false);
    box(parent, 0.4, 0.58, 0.22, SH.person, x, y + 1.11, z);
    box(parent, 0.1, 0.55, 0.12, SH.person, x - 0.26, y + 1.1, z, false); box(parent, 0.1, 0.55, 0.12, SH.person, x + 0.26, y + 1.1, z, false);
    sph(parent, 0.115, SH.skin, x, y + 1.55, z, false, 1.1); sph(parent, 0.135, SH.helmet, x, y + 1.63, z, false, 0.6);
  }
  function rackDetail(parent, x, z) {       // un rack desenat in detaliu: usa se deschide, un server iese pe sine
    var g = new T.Group(); g.position.set(x, 0.3, z); parent.add(g);
    [[-0.57, -0.27], [-0.57, 0.27], [0.57, -0.27], [0.57, 0.27]].forEach(function (c) { box(g, 0.06, 2.2, 0.06, SH.rackBody, c[0], 1.1, c[1], false); });
    box(g, 1.2, 0.06, 0.6, SH.rackBody, 0, 2.17, 0); box(g, 1.2, 0.06, 0.6, SH.rackBody, 0, 0.03, 0, false);
    box(g, 1.14, 2.08, 0.02, SH.rackBody, 0, 1.1, -0.29, false); box(g, 0.02, 2.08, 0.56, SH.rackBody, -0.59, 1.1, 0, false);
    cyl(g, 0.028, 0.028, 2.0, SH.blue, -0.5, 1.1, -0.2, 8, null, false); cyl(g, 0.028, 0.028, 2.0, SH.red, -0.5, 1.1, 0.2, 8, null, false);     // colectoarele de lichid
    box(g, 0.05, 1.9, 0.05, SH.copper, -0.5, 1.1, 0, false);                                                                                   // bara de alimentare
    box(g, 0.04, 1.9, 0.07, SH.dark, 0.5, 1.1, -0.255, false); for (var q = 0; q < 12; q++) box(g, 0.012, 0.02, 0.02, SH.led, 0.522, 0.35 + q * 0.14, -0.255, false);   // priza verticala
    box(g, 1.0, 0.2, 0.5, SH.silver, 0.02, 0.17, 0, false); box(g, 0.012, 0.03, 0.4, SH.led, 0.53, 0.17, 0, false);
    box(g, 0.8, 0.09, 0.5, SH.rackAlt, 0.12, 2.06, 0, false); box(g, 0.012, 0.04, 0.44, SH.led, 0.525, 2.06, 0, false);
    var out = { g: g, door: null, server: null, cover: null }, m;
    for (var i = 0; i < 4; i++) {
      var s = new T.Group(); s.position.set(0.02, 0.32 + i * 0.42, 0); g.add(s);
      if (i !== 2) {
        box(s, 1.0, 0.36, 0.5, SH.dark, 0, 0.18, 0, false);
        box(s, 0.02, 0.32, 0.48, SH.rackAlt, 0.51, 0.18, 0, false); box(s, 0.012, 0.03, 0.3, SH.led, 0.522, 0.3, 0, false);
        for (m = 0; m < 6; m++) box(s, 0.014, 0.2, 0.05, SH.dark, 0.522, 0.15, -0.19 + m * 0.076, false);
        continue;
      }
      out.server = s;
      box(s, 1.0, 0.02, 0.5, SH.steel, 0, 0.01, 0, false);
      box(s, 1.0, 0.34, 0.012, SH.rackAlt, 0, 0.18, -0.244, false); box(s, 1.0, 0.34, 0.012, SH.rackAlt, 0, 0.18, 0.244, false);
      box(s, 0.02, 0.34, 0.5, SH.rackAlt, 0.5, 0.18, 0, false); box(s, 0.012, 0.03, 0.3, SH.led, 0.512, 0.3, 0, false);
      box(s, 0.4, 0.016, 0.44, SH.pcb, -0.16, 0.03, 0, false);                                                     // placa de baza
      box(s, 0.09, 0.07, 0.09, SH.silver, -0.12, 0.075, -0.1, false); box(s, 0.09, 0.07, 0.09, SH.silver, -0.12, 0.075, 0.1, false);   // procesoare
      for (m = 0; m < 8; m++) box(s, 0.13, 0.05, 0.008, SH.dark, -0.27, 0.065, -0.2 + m * 0.057, false);          // memorie
      for (m = 0; m < 4; m++) box(s, 0.16, 0.1, 0.1, SH.silver, -0.41, 0.07, -0.18 + m * 0.12, false);             // surse
      for (m = 0; m < 8; m++) {                                                                                      // cele 8 GPU-uri, fiecare cu placa de racire
        var gz = -0.203 + m * 0.058;
        box(s, 0.36, 0.24, 0.014, SH.pcb, 0.27, 0.15, gz, false);
        box(s, 0.16, 0.13, 0.022, SH.copper, 0.27, 0.17, gz + 0.018, false);
      }
      cyl(s, 0.011, 0.011, 0.46, SH.blue, 0.31, 0.295, 0, 6, [Math.PI / 2, 0, 0], false); cyl(s, 0.011, 0.011, 0.46, SH.red, 0.23, 0.295, 0, 6, [Math.PI / 2, 0, 0], false);
      cyl(s, 0.011, 0.011, 0.75, SH.blue, -0.07, 0.295, -0.22, 6, [0, 0, Math.PI / 2], false); cyl(s, 0.011, 0.011, 0.67, SH.red, -0.11, 0.295, 0.22, 6, [0, 0, Math.PI / 2], false);
      out.cover = mesh(s, new T.BoxGeometry(1.0, 0.016, 0.5), SH.rackAlt, 0, 0.352, 0, false);
    }
    var d = new T.Group(); d.position.set(0.61, 0, -0.3); g.add(d);
    box(d, 0.02, 2.1, 0.6, SH.rackFront, 0, 1.1, 0.3, false);
    out.door = d;
    return out;
  }
  function transformer(parent, x, z, s) {
    var y0 = 0.32, i, sd;
    box(parent, 3.6 * s, 0.25 * s, 2.6 * s, SH.dark, x, y0 + 0.125 * s, z);                                       // sasiu
    box(parent, 3 * s, 2.3 * s, 1.9 * s, SH.trafo, x, y0 + 1.4 * s, z);                                           // cuva cu ulei
    box(parent, 3.2 * s, 0.12 * s, 2.1 * s, SH.trafo, x, y0 + 2.6 * s, z, false);
    for (sd = -1; sd <= 1; sd += 2) {                                                                              // radiatoare, lamela cu lamela
      for (i = 0; i < 9; i++) box(parent, 0.07 * s, 1.75 * s, 0.62 * s, SH.trafoFin, x - 1.2 * s + i * 0.3 * s, y0 + 1.35 * s, z + sd * 1.32 * s);
      cyl(parent, 0.07 * s, 0.07 * s, 2.7 * s, SH.trafo, x, y0 + 2.2 * s, z + sd * 1.3 * s, 8, [0, 0, Math.PI / 2], false);
      cyl(parent, 0.07 * s, 0.07 * s, 2.7 * s, SH.trafo, x, y0 + 0.55 * s, z + sd * 1.3 * s, 8, [0, 0, Math.PI / 2], false);
    }
    for (i = -1; i <= 1; i++) {                                                                                    // izolatoare: inalta tensiune (mari) si joasa (mici)
      cyl(parent, 0.09 * s, 0.17 * s, 1.25 * s, SH.ceramic, x + i * 0.85 * s, y0 + 3.28 * s, z - 0.35 * s, 10);
      cyl(parent, 0.05 * s, 0.05 * s, 0.22 * s, SH.silver, x + i * 0.85 * s, y0 + 4.0 * s, z - 0.35 * s, 8, null, false);
      cyl(parent, 0.06 * s, 0.1 * s, 0.5 * s, SH.ceramic, x + i * 0.5 * s, y0 + 2.9 * s, z + 0.55 * s, 8, null, false);
    }
    cyl(parent, 0.36 * s, 0.36 * s, 2.3 * s, SH.trafo, x, y0 + 3.5 * s, z + 0.2 * s, 12, [0, 0, Math.PI / 2]);     // conservatorul de ulei
    box(parent, 0.1 * s, 0.6 * s, 0.1 * s, SH.trafo, x - 0.8 * s, y0 + 2.95 * s, z + 0.2 * s, false); box(parent, 0.1 * s, 0.6 * s, 0.1 * s, SH.trafo, x + 0.8 * s, y0 + 2.95 * s, z + 0.2 * s, false);
    box(parent, 0.3 * s, 0.9 * s, 0.6 * s, SH.silver, x + 1.65 * s, y0 + 1.3 * s, z, false);                       // dulap de comanda
    var bw = 4.6 * s, bd = 4.2 * s;                                                                                 // cuva de retentie din beton
    box(parent, bw, 0.35, 0.18, SH.base, x, 0.45, z - bd / 2, false); box(parent, bw, 0.35, 0.18, SH.base, x, 0.45, z + bd / 2, false);
    box(parent, 0.18, 0.35, bd, SH.base, x - bw / 2, 0.45, z, false); box(parent, 0.18, 0.35, bd, SH.base, x + bw / 2, 0.45, z, false);
    ao(parent, 3.4 * s, 3.3 * s, x, 0.34, z, 1.6);
    return [-1, 0, 1].map(function (k) { return new T.Vector3(x + k * 0.85 * s, y0 + 4.1 * s, z - 0.35 * s); });
  }
  function genset(parent, x, z, len, s) {     // grup electrogen in carcasa antifonica, lungimea pe axa x
    var h = 2.7 * s, w = 2.5 * s, yb = 0.22 + 0.3 * s, top = yb + h, nd = Math.max(2, Math.round(len / 3)), i;
    box(parent, len + 0.4, 0.3 * s, w + 0.2, SH.dark, x, 0.22 + 0.15 * s, z);                                    // sasiu cu rezervor
    box(parent, len, h, w, SH.contDark, x, yb + h / 2, z);
    box(parent, 0.06, h * 0.72, w * 0.8, SH.louver, x - len / 2 - 0.03, yb + h * 0.5, z, false); box(parent, 0.06, h * 0.72, w * 0.8, SH.louver, x + len / 2 + 0.03, yb + h * 0.5, z, false);
    for (i = 0; i <= nd; i++) for (var sd = -1; sd <= 1; sd += 2) {
      box(parent, 0.05, h * 0.82, 0.03, SH.dark, x - len / 2 + i * len / nd, yb + h * 0.47, z + sd * (w / 2 + 0.015), false);          // usi de serviciu
      if (i < nd) box(parent, 0.05, 0.28 * s, 0.05, SH.steel, x - len / 2 + (i + 0.85) * len / nd, yb + h * 0.45, z + sd * (w / 2 + 0.04), false);
    }
    cyl(parent, 0.3 * s, 0.3 * s, len * 0.3, SH.silver, x + len * 0.16, top + 0.36 * s, z, 12, [0, 0, Math.PI / 2]);  // toba de esapament
    cyl(parent, 0.13 * s, 0.13 * s, 1.5 * s, SH.silver, x + len * 0.3, top + 1.1 * s, z, 10);                          // cosul
    box(parent, len * 0.28, 0.25 * s, w * 0.8, SH.dark, x - len * 0.3, top + 0.125 * s, z, false);                    // radiator pe acoperis
    disc(parent, w * 0.3, SH.fan, x - len * 0.3, top + 0.26 * s, z);
    var tz = z + w / 2 + 1.5 * s;                                                                                      // rezervor de motorina
    cyl(parent, 0.6 * s, 0.6 * s, len * 0.5, SH.white, x, 0.22 + 1.0 * s, tz, 14, [0, 0, Math.PI / 2]);
    box(parent, 0.2, 0.5 * s, 1.0 * s, SH.steel, x - len * 0.17, 0.22 + 0.25 * s, tz, false); box(parent, 0.2, 0.5 * s, 1.0 * s, SH.steel, x + len * 0.17, 0.22 + 0.25 * s, tz, false);
    ao(parent, len, w, x, 0.235, z, 1.5);
    return [x + len * 0.3, top + 2.0 * s, z];
  }
  function coolerTpl(len) {                   // racitor uscat: baterie cu lamele, ventilatoare deasupra
    return tpl(function (g) {
      var i, j, nf = Math.max(2, Math.round(len / 2.3));
      for (i = 0; i < 3; i++) for (j = -1; j <= 1; j += 2) box(g, 0.12, 1.2, 0.12, SH.steel, -len / 2 + 0.3 + i * (len - 0.6) / 2, 0.6, j * 1.0, false);
      box(g, len, 0.12, 2.3, SH.steel, 0, 1.22, 0, false);
      box(g, len - 0.1, 1.25, 2.2, SH.coil, 0, 1.9, 0);
      box(g, len, 0.1, 2.3, SH.silver, 0, 2.57, 0, false);
      box(g, 0.1, 1.3, 2.3, SH.silver, -len / 2, 1.9, 0, false); box(g, 0.1, 1.3, 2.3, SH.silver, len / 2, 1.9, 0, false);
      for (var f = 0; f < nf; f++) {
        var fx = -len / 2 + (f + 0.5) * len / nf;
        cyl(g, 0.98, 0.98, 0.28, SH.silver, fx, 2.76, 0, 20, null, false);
        disc(g, 0.9, SH.dark, fx, 2.905, 0); disc(g, 0.88, SH.fan, fx, 2.915, 0); disc(g, 0.96, SH.grille, fx, 2.93, 0);
      }
      cyl(g, 0.1, 0.1, len, SH.blue, 0, 1.0, 1.25, 8, [0, 0, Math.PI / 2], false); cyl(g, 0.1, 0.1, len, SH.red, 0, 0.75, 1.25, 8, [0, 0, Math.PI / 2], false);
      ao(g, len, 2.4, 0, 0.02, 0, 1.5);
    });
  }
  function bessTpl() {                        // container de baterii de 20 de picioare
    return tpl(function (g) {
      var i;
      box(g, 6.6, 0.3, 3.0, SH.concrete, 0, 0.15, 0, false);
      box(g, 6.1, 0.18, 2.46, SH.dark, 0, 0.39, 0, false);
      box(g, 6.06, 2.6, 2.44, SH.cont, 0, 1.78, 0);
      box(g, 6.1, 0.34, 2.48, SH.green, 0, 2.86, 0, false);
      for (i = 0; i < 6; i++) {
        var dx = -2.5 + i * 1.0;
        box(g, 0.94, 2.2, 0.04, SH.white, dx, 1.62, 1.235, false);
        box(g, 0.03, 0.9, 0.03, SH.steel, dx + 0.36, 1.6, 1.27, false);
        if (i % 2 === 0) box(g, 0.5, 0.3, 0.02, SH.louver, dx, 0.85, 1.262, false);
      }
      box(g, 0.24, 0.24, 0.015, SH.hazard, 2.5, 2.3, 1.262, false);
      for (i = -1; i <= 1; i += 2) { box(g, 0.45, 1.3, 1.5, SH.silver, i * 3.27, 1.5, 0); box(g, 0.02, 1.0, 1.2, SH.louver, i * 3.5, 1.5, 0, false); }
      for (i = -1; i <= 1; i++) box(g, 1.2, 0.12, 1.0, SH.white, i * 1.9, 3.12, 0, false);
      ao(g, 6.8, 3.0, 0, 0.02, 0, 1.45);
    });
  }
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
    box(parent, 6.8, 0.3, 3.2, SH.concrete, x, 0.15, z, false);
    box(parent, 5.0, 2.5, 2.4, SH.cont, x - 0.6, 1.55, z);
    box(parent, 1.6, 1.6, 0.04, SH.louver, x - 1.8, 1.5, z + 1.22, false); box(parent, 0.9, 2.0, 0.04, SH.white, x + 0.4, 1.4, z + 1.22, false); box(parent, 0.03, 0.5, 0.03, SH.steel, x + 0.7, 1.4, z + 1.25, false);
    box(parent, 1.1, 1.5, 1.4, SH.trafo, x + 2.7, 1.05, z); for (var i = 0; i < 3; i++) cyl(parent, 0.05, 0.08, 0.4, SH.ceramic, x + 2.7, 2.0, z - 0.4 + i * 0.4, 8, null, false);
    ao(parent, 6.8, 3.2, x, 0.03, z, 1.4);
  }
  function towerLattice(parent, x, z, h) {    // stalp metalic cu zabrele, pentru linia de 110 kV
    var b = h * 0.1, t = h * 0.022 + 0.3, hb = h * 0.78, ns = 5, i, s, c = [[1, 1], [1, -1], [-1, -1], [-1, 1]], th = Math.max(0.14, h * 0.009);
    for (i = 0; i < 4; i++) {
      beam(parent, SH.steel, x + c[i][0] * b, 0, z + c[i][1] * b, x + c[i][0] * t, hb, z + c[i][1] * t, th * 1.3);
      beam(parent, SH.steel, x + c[i][0] * t, hb, z + c[i][1] * t, x + c[i][0] * t * 0.6, h, z + c[i][1] * t * 0.6, th * 1.1);
    }
    for (s = 0; s < ns; s++) {
      var yA = hb * s / ns, yB = hb * (s + 1) / ns, wA = b + (t - b) * s / ns, wB = b + (t - b) * (s + 1) / ns;
      for (i = 0; i < 4; i++) {
        var p = c[i], q = c[(i + 1) % 4];
        beam(parent, SH.steel, x + p[0] * wA, yA, z + p[1] * wA, x + q[0] * wB, yB, z + q[1] * wB, th, false);
        beam(parent, SH.steel, x + q[0] * wA, yA, z + q[1] * wA, x + p[0] * wB, yB, z + p[1] * wB, th, false);
        beam(parent, SH.steel, x + p[0] * wB, yB, z + p[1] * wB, x + q[0] * wB, yB, z + q[1] * wB, th, false);
      }
    }
    var a = h * 0.2, y1 = h * 0.8, y2 = h * 0.93, ins = Math.max(1.2, h * 0.05), arms = [[-a, y1], [a * 0.75, y2], [a, y1]];
    arms.forEach(function (e) {
      beam(parent, SH.steel, x, e[1] + h * 0.035, z, x, e[1], z + e[0], th); beam(parent, SH.steel, x, e[1] - h * 0.02, z, x, e[1], z + e[0], th, false);
      cyl(parent, 0.09, 0.09, ins, SH.ceramic, x, e[1] - ins / 2, z + e[0], 8, null, false);
    });
    return arms.map(function (e) { return new T.Vector3(x, e[1] - ins, z + e[0]); });
  }
  function poleMV(parent, x, z, h) {          // stalp de beton pentru linia de medie tensiune
    cyl(parent, 0.13, 0.22, h, SH.base, x, h / 2, z, 8);
    box(parent, 0.12, 0.12, 2.8, SH.steel, x, h * 0.93, z); box(parent, 0.1, 0.5, 0.1, SH.steel, x, h * 0.93 + 0.3, z, false);
    return [-1.25, 0, 1.25].map(function (dz, i) {
      var yy = h * 0.93 + (i === 1 ? 0.75 : 0.35);
      cyl(parent, 0.05, 0.08, 0.5, SH.ceramic, x, yy - 0.2, z + dz, 8, null, false);
      return new T.Vector3(x, yy + 0.05, z + dz);
    });
  }
  function wire(parent, a, b, sag) {
    var pts = [];
    for (var i = 0; i <= 12; i++) { var t = i / 12, p = a.clone().lerp(b, t); p.y -= Math.sin(Math.PI * t) * sag; pts.push(p); }
    parent.add(new T.Line(new T.BufferGeometry().setFromPoints(pts), SH.wire));
  }
  function car(parent, x, z, ci) {            // lung pe z
    var p = SH.carPaint[ci % SH.carPaint.length];
    box(parent, 1.82, 0.52, 4.3, p, x, 0.74, z); box(parent, 1.7, 0.12, 4.1, SH.dark, x, 0.44, z, false);
    box(parent, 1.62, 0.5, 2.3, SH.carGlass, x, 1.24, z - 0.15); box(parent, 1.5, 0.06, 1.9, p, x, 1.51, z - 0.15, false);
    [[-0.86, 1.35], [0.86, 1.35], [-0.86, -1.35], [0.86, -1.35]].forEach(function (w) { cyl(parent, 0.33, 0.33, 0.24, SH.tire, x + w[0], 0.56, z + w[1], 12, [0, 0, Math.PI / 2], false); });
    box(parent, 1.5, 0.12, 0.04, SH.light, x, 0.82, z + 2.16, false); box(parent, 1.5, 0.1, 0.04, SH.red, x, 0.84, z - 2.16, false);
    ao(parent, 2.0, 4.5, x, 0.262, z, 1.35);
  }
  function truck(parent, x, z) {              // camion cu cutie, cu spatele spre nord
    box(parent, 2.4, 2.6, 6.2, SH.white, x, 2.25, z - 1.0); box(parent, 2.3, 1.9, 1.9, SH.carPaint[2], x, 1.7, z + 3.2); box(parent, 2.1, 0.8, 0.05, SH.carGlass, x, 2.1, z + 4.16, false);
    box(parent, 2.2, 0.25, 8.0, SH.dark, x, 0.87, z, false);
    [[-1.05, 3.1], [1.05, 3.1], [-1.05, -2.4], [1.05, -2.4], [-1.05, -3.4], [1.05, -3.4]].forEach(function (w) { cyl(parent, 0.5, 0.5, 0.3, SH.tire, x + w[0], 0.76, z + w[1], 12, [0, 0, Math.PI / 2], false); });
    ao(parent, 2.6, 8.4, x, 0.262, z, 1.3);
  }
  function treeTpl(kind) {
    return tpl(function (g) {
      if (kind === 'poplar') { cyl(g, 0.18, 0.3, 4, SH.trunk, 0, 2, 0, 6); sph(g, 1.45, SH.leaf, 0, 9.4, 0, true, 4.4); sph(g, 1.2, SH.leaf, 0.35, 6.4, 0.2, true, 2.8); sph(g, 1.05, SH.leaf, -0.4, 8.2, -0.3, true, 3.2); sph(g, 0.8, SH.leaf, 0.25, 13.2, 0.3, true, 2.9); }
      else if (kind === 'conifer') { cyl(g, 0.2, 0.3, 2, SH.trunk, 0, 1, 0, 6); cyl(g, 0.01, 2.4, 4, SH.leaf, 0, 3.6, 0, 8); cyl(g, 0.01, 1.9, 3.4, SH.leaf, 0, 5.6, 0, 8); cyl(g, 0.01, 1.3, 2.8, SH.leaf, 0, 7.4, 0, 8); }
      else { cyl(g, 0.24, 0.36, 3.4, SH.trunk, 0, 1.7, 0, 6); sph(g, 2.5, SH.leaf, 0, 5.4, 0, true, 0.95); sph(g, 1.9, SH.leaf, 1.5, 4.6, 0.5, true, 0.9); sph(g, 1.8, SH.leaf, -1.3, 4.9, -0.7, true, 0.9); sph(g, 1.6, SH.leaf, 0.2, 6.6, -0.5, true, 0.9); }
    });
  }
  function lampTpl() { return tpl(function (g) { cyl(g, 0.07, 0.11, 7, SH.steel, 0, 3.5, 0, 8); box(g, 0.08, 0.08, 1.3, SH.steel, 0, 7.0, 0.6, false); box(g, 0.34, 0.1, 0.7, SH.lampHead, 0, 6.96, 1.25, false); }); }
  function fenceRun(parent, posts, x0, z0, x1, z1, hgt) {   // plasa intre doua puncte + stalpii ei
    var dx = x1 - x0, dz = z1 - z0, len = Math.sqrt(dx * dx + dz * dz), n = Math.max(1, Math.round(len / 3)), ang = Math.atan2(-dz, dx);
    addGeo(parent, unit('vplane', function () { return new T.PlaneGeometry(1, 1); }), SH.fence, (x0 + x1) / 2, hgt / 2 + 0.05, (z0 + z1) / 2, len, hgt, 1, [0, ang, 0], false);
    box(parent, len, 0.05, 0.05, SH.steel, (x0 + x1) / 2, hgt + 0.05, (z0 + z1) / 2, false, [0, ang, 0]);
    for (var i = 0; i <= n; i++) posts.push([x0 + dx * i / n, z0 + dz * i / n, hgt]);
  }
