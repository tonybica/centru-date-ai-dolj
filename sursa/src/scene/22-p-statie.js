  function transformer(parent, x, z, s) {
    var y0 = 0.32, i, sd;
    box(parent, 3.6 * s, 0.25 * s, 2.6 * s, SH.dark, x, y0 + 0.125 * s, z);                                       // sasiu
    box(parent, 3.9 * s, 0.1 * s, 0.22 * s, SH.steel, x, y0 + 0.03 * s, z - 0.8 * s, false); box(parent, 3.9 * s, 0.1 * s, 0.22 * s, SH.steel, x, y0 + 0.03 * s, z + 0.8 * s, false);   // sine
    box(parent, 3 * s, 2.3 * s, 1.9 * s, SH.trafo, x, y0 + 1.4 * s, z);                                           // cuva cu ulei
    box(parent, 3.2 * s, 0.12 * s, 2.1 * s, SH.trafo, x, y0 + 2.6 * s, z, false);
    for (i = -1; i <= 1; i++) box(parent, 0.06 * s, 2.2 * s, 1.96 * s, SH.trafo, x + i * 0.75 * s, y0 + 1.4 * s, z, false);                        // nervuri de rigidizare
    for (sd = -1; sd <= 1; sd += 2) {                                                                              // radiatoare, lamela cu lamela, cu ventilatoare
      for (i = 0; i < 9; i++) box(parent, 0.07 * s, 1.75 * s, 0.62 * s, SH.trafoFin, x - 1.2 * s + i * 0.3 * s, y0 + 1.35 * s, z + sd * 1.32 * s);
      cyl(parent, 0.07 * s, 0.07 * s, 2.7 * s, SH.trafo, x, y0 + 2.2 * s, z + sd * 1.3 * s, 8, [0, 0, Math.PI / 2], false);
      cyl(parent, 0.07 * s, 0.07 * s, 2.7 * s, SH.trafo, x, y0 + 0.55 * s, z + sd * 1.3 * s, 8, [0, 0, Math.PI / 2], false);
      for (i = -1; i <= 1; i += 2) {
        cyl(parent, 0.34 * s, 0.34 * s, 0.07 * s, SH.dark, x + i * 0.62 * s, y0 + 1.35 * s, z + sd * 1.66 * s, 14, [Math.PI / 2, 0, 0], false);
        vdisc(parent, 0.3 * s, SH.fan, x + i * 0.62 * s, y0 + 1.35 * s, z + sd * 1.7 * s, false);
      }
    }
    for (i = -1; i <= 1; i++) {                                                                                    // izolatoare: inalta tensiune (mari) si joasa (mici)
      cyl(parent, 0.13 * s, 0.2 * s, 0.14 * s, SH.trafo, x + i * 0.85 * s, y0 + 2.72 * s, z - 0.35 * s, 10, null, false);
      cyl(parent, 0.09 * s, 0.17 * s, 1.25 * s, SH.ceramic, x + i * 0.85 * s, y0 + 3.28 * s, z - 0.35 * s, 10);
      cyl(parent, 0.05 * s, 0.05 * s, 0.22 * s, SH.silver, x + i * 0.85 * s, y0 + 4.0 * s, z - 0.35 * s, 8, null, false);
      cyl(parent, 0.06 * s, 0.1 * s, 0.5 * s, SH.ceramic, x + i * 0.5 * s, y0 + 2.9 * s, z + 0.55 * s, 8, null, false);
      cyl(parent, 0.035 * s, 0.035 * s, 0.12 * s, SH.copper, x + i * 0.5 * s, y0 + 3.2 * s, z + 0.55 * s, 6, null, false);
    }
    cyl(parent, 0.36 * s, 0.36 * s, 2.3 * s, SH.trafo, x, y0 + 3.5 * s, z + 0.2 * s, 12, [0, 0, Math.PI / 2]);     // conservatorul de ulei, cu capace bombate
    blob(parent, SH.trafo, x - 1.15 * s, y0 + 3.5 * s, z + 0.2 * s, 0.14 * s, 0.36 * s, 0.36 * s, 0, false); blob(parent, SH.trafo, x + 1.15 * s, y0 + 3.5 * s, z + 0.2 * s, 0.14 * s, 0.36 * s, 0.36 * s, 0, false);
    box(parent, 0.1 * s, 0.6 * s, 0.1 * s, SH.trafo, x - 0.8 * s, y0 + 2.95 * s, z + 0.2 * s, false); box(parent, 0.1 * s, 0.6 * s, 0.1 * s, SH.trafo, x + 0.8 * s, y0 + 2.95 * s, z + 0.2 * s, false);
    cyl(parent, 0.045 * s, 0.045 * s, 0.75 * s, SH.steel, x + 0.35 * s, y0 + 2.98 * s, z + 0.02 * s, 6, [0.5, 0, 0], false); box(parent, 0.16 * s, 0.14 * s, 0.14 * s, SH.dark, x + 0.35 * s, y0 + 2.98 * s, z + 0.02 * s, false);   // teava de ulei cu releu
    box(parent, 0.18 * s, 0.18 * s, 0.03 * s, SH.white, x + 1.0 * s, y0 + 3.5 * s, z + 0.57 * s, false);            // indicator de nivel
    box(parent, 0.3 * s, 0.9 * s, 0.6 * s, SH.silver, x + 1.65 * s, y0 + 1.3 * s, z, false);                       // dulap de comanda
    box(parent, 0.02 * s, 0.2 * s, 0.3 * s, SH.hazard, x + 1.81 * s, y0 + 1.5 * s, z, false);
    box(parent, 0.5 * s, 1.5 * s, 1.0 * s, SH.trafo, x - 1.75 * s, y0 + 1.5 * s, z);                               // comutatorul de ploturi
    box(parent, 0.26 * s, 0.5 * s, 0.4 * s, SH.silver, x - 2.12 * s, y0 + 1.0 * s, z + 0.2 * s, false); cyl(parent, 0.04 * s, 0.04 * s, 0.9 * s, SH.steel, x - 2.05 * s, y0 + 1.7 * s, z + 0.2 * s, 6, null, false);
    var bw = 4.6 * s, bd = 4.2 * s;                                                                                 // cuva de retentie din beton, cu pietris
    box(parent, bw, 0.35, 0.18, SH.base, x, 0.45, z - bd / 2, false); box(parent, bw, 0.35, 0.18, SH.base, x, 0.45, z + bd / 2, false);
    box(parent, 0.18, 0.35, bd, SH.base, x - bw / 2, 0.45, z, false); box(parent, 0.18, 0.35, bd, SH.base, x + bw / 2, 0.45, z, false);
    ao(parent, 3.4 * s, 3.3 * s, x, 0.34, z, 1.6);
    return [-1, 0, 1].map(function (k) { return new T.Vector3(x + k * 0.85 * s, y0 + 4.1 * s, z - 0.35 * s); });
  }
  function towerLattice(parent, x, z, h) {    // stalp metalic cu zabrele, pentru linia de 110 kV
    var b = h * 0.1, t = h * 0.022 + 0.3, hb = h * 0.78, ns = 5, i, s, c = [[1, 1], [1, -1], [-1, -1], [-1, 1]], th = Math.max(0.14, h * 0.009);
    for (i = 0; i < 4; i++) {
      box(parent, th * 5, 0.5, th * 5, SH.concrete, x + c[i][0] * b, 0.25, z + c[i][1] * b, false);                 // fundatii
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
      cyl(parent, 0.11, 0.11, ins, SH.ceramic, x, e[1] - ins / 2, z + e[0], 8, null, false);
      box(parent, 0.5, 0.08, 0.12, SH.silver, x, e[1] - ins - 0.02, z + e[0], false); box(parent, th * 1.6, th * 1.6, th * 1.6, SH.steel, x, e[1], z + e[0], false);    // clema conductorului
    });
    cyl(parent, 0.03, 0.05, h * 0.06, SH.steel, x, h * 1.03, z, 6, null, false);                                    // paratrasnet
    return arms.map(function (e) { return new T.Vector3(x, e[1] - ins, z + e[0]); });
  }
  function poleMV(parent, x, z, h) {          // stalp de beton pentru linia de medie tensiune
    cyl(parent, 0.13, 0.22, h, SH.base, x, h / 2, z, 8); cyl(parent, 0.3, 0.34, 0.25, SH.concrete, x, 0.125, z, 8, null, false);
    box(parent, 0.12, 0.12, 2.8, SH.steel, x, h * 0.93, z); box(parent, 0.1, 0.5, 0.1, SH.steel, x, h * 0.93 + 0.3, z, false);
    beam(parent, SH.steel, x, h * 0.93 - 0.9, z, x, h * 0.93, z - 1.0, 0.05, false); beam(parent, SH.steel, x, h * 0.93 - 0.9, z, x, h * 0.93, z + 1.0, 0.05, false);   // contrafise
    box(parent, 0.26, 0.2, 0.012, SH.hazard, x, 2.2, z + 0.2, false);
    return [-1.25, 0, 1.25].map(function (dz, i) {
      var yy = h * 0.93 + (i === 1 ? 0.75 : 0.35);
      cyl(parent, 0.05, 0.08, 0.5, SH.ceramic, x, yy - 0.2, z + dz, 8, null, false);
      cyl(parent, 0.025, 0.025, 0.06, SH.silver, x, yy + 0.07, z + dz, 6, null, false);
      return new T.Vector3(x, yy + 0.05, z + dz);
    });
  }
  function wire(parent, a, b, sag) {
    var pts = [];
    for (var i = 0; i <= 12; i++) { var t = i / 12, p = a.clone().lerp(b, t); p.y -= Math.sin(Math.PI * t) * sag; pts.push(p); }
    parent.add(new T.Line(new T.BufferGeometry().setFromPoints(pts), SH.wire));
  }
