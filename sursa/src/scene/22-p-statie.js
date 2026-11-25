  function stV(x, y, z) { return new T.Vector3(x, y, z); }
  function stIns(parent, x, y, z, h, r, n, alongX) {      // izolator cu fuste; in picioare y = baza, culcat pe x y = axa
    var i, rot = alongX ? [0, 0, Math.PI / 2] : null;
    if (alongX) {
      cyl(parent, r * 0.8, r * 0.8, h, SH.ceramic, x, y, z, 8, rot, false);
      if (!Q.lite) for (i = 0; i < n; i++) cyl(parent, r * 1.7, r * 1.7, h / n * 0.3, SH.ceramic, x - h / 2 + (i + 0.5) * h / n, y, z, 8, rot, false);
      return;
    }
    cyl(parent, r * 0.75, r, h, SH.ceramic, x, y + h / 2, z, 8, null, false);
    if (!Q.lite) for (i = 0; i < n; i++) cyl(parent, r * 1.2, r * 1.75, h / n * 0.4, SH.ceramic, x, y + (i + 0.5) * h / n, z, 8, null, false);
  }
  function stCol(parent, x, z, top, t) {                  // suport de otel pe fundatie de beton (pietrisul statiei e la 0.32)
    box(parent, 0.7, 0.3, 0.7, SH.base, x, 0.45, z, false);
    box(parent, t * 2.2, 0.04, t * 2.2, SH.steel, x, 0.62, z, false);
    box(parent, t, top - 0.62, t, SH.steel, x, (top + 0.62) / 2, z);
    box(parent, t * 2, 0.05, t * 2, SH.steel, x, top - 0.025, z, false);
  }
  function transformer(parent, x, z, s) {     // transformator 110/20 kV (s = 1: circa 25 MVA); izolatoarele de 110 kV stau in rand pe z, spre vest
    s = s || 1;
    var yb = 0.95, th = 3.3 * s, yt = yb + th, i, sd, hw = 1.5 * s, hl = 3.0 * s, out = [];
    var bw = hw + 1.7, bl = hl + 2.2 * s + 0.9;                                                                     // cuva de retentie cu pietris
    box(parent, bw * 2, 0.5, 0.2, SH.base, x, 0.55, z - bl, false); box(parent, bw * 2, 0.5, 0.2, SH.base, x, 0.55, z + bl, false);
    box(parent, 0.2, 0.5, bl * 2, SH.base, x - bw, 0.55, z, false); box(parent, 0.2, 0.5, bl * 2, SH.base, x + bw, 0.55, z, false);
    box(parent, bw * 2 - 0.2, 0.1, bl * 2 - 0.2, SH.gravel, x, 0.62, z, false);
    for (sd = -1; sd <= 1; sd += 2) {                                                                               // grinzi de beton cu sine
      box(parent, 0.5, 0.55, hl * 2 + 0.6, SH.concrete, x + sd * hw * 0.6, 0.575, z, false);
      box(parent, 0.08, 0.1, hl * 2 + 0.4, SH.steel, x + sd * hw * 0.6, 0.9, z, false);
    }
    box(parent, hw * 2, th, hl * 2, SH.trafo, x, yb + th / 2, z);                                                   // cuva cu ulei
    box(parent, hw * 2 + 0.1, 0.18, hl * 2 + 0.1, SH.dark, x, yb + 0.09, z, false);
    box(parent, hw * 2 + 0.16, 0.12, hl * 2 + 0.16, SH.trafo, x, yt + 0.06, z, false);                              // capac
    for (i = -2; i <= 2; i++) for (sd = -1; sd <= 1; sd += 2) box(parent, 0.1, th - 0.4, 0.12, SH.trafo, x + sd * (hw + 0.05), yb + th / 2 + 0.05, z + i * hl * 0.42, false);   // nervuri
    var nf = Q.lite ? 5 : 9, rh = th * 0.8, rd = 1.15 * s, ry = yb + 0.4, zh;
    for (sd = -1; sd <= 1; sd += 2) {                                                                               // radiatoare la cele doua capete, cu ventilatoare
      for (i = 0; i < nf; i++) box(parent, 0.07, rh, rd, SH.trafoFin, x - hw * 0.85 + i * hw * 1.7 / (nf - 1), ry + rh / 2, z + sd * (hl + 0.3 + rd / 2));
      zh = z + sd * (hl + 0.3 + rd * 0.3);
      cyl(parent, 0.09, 0.09, hw * 1.85, SH.trafo, x, ry + rh - 0.14, zh, 8, [0, 0, Math.PI / 2], false);
      cyl(parent, 0.09, 0.09, hw * 1.85, SH.trafo, x, ry + 0.14, zh, 8, [0, 0, Math.PI / 2], false);
      for (i = -1; i <= 1; i += 2) {
        cyl(parent, 0.08, 0.08, 0.3 + rd * 0.3, SH.trafo, x + i * hw * 0.5, ry + rh - 0.14, z + sd * (hl + (0.3 + rd * 0.3) / 2), 8, [Math.PI / 2, 0, 0], false);
        cyl(parent, 0.08, 0.08, 0.3 + rd * 0.3, SH.trafo, x + i * hw * 0.5, ry + 0.14, z + sd * (hl + (0.3 + rd * 0.3) / 2), 8, [Math.PI / 2, 0, 0], false);
        cyl(parent, 0.46 * s, 0.46 * s, 0.1, SH.dark, x + i * hw * 0.45, ry + rh * 0.5, z + sd * (hl + 0.3 + rd + 0.05), 14, [Math.PI / 2, 0, 0], false);
        vdisc(parent, 0.42 * s, SH.fan, x + i * hw * 0.45, ry + rh * 0.5, z + sd * (hl + 0.3 + rd + 0.11), false);
      }
    }
    for (i = -1; i <= 1; i++) {                                                                                     // izolatoare de 110 kV
      var bz = z + i * 1.55 * s, bx = x - hw * 0.55, by = yt + 0.12;
      cyl(parent, 0.2 * s, 0.26 * s, 0.4 * s, SH.trafo, bx, by + 0.2 * s, bz, 10, null, false);
      stIns(parent, bx, by + 0.4 * s, bz, 1.5 * s, 0.13 * s, 7);
      cyl(parent, 0.05, 0.05, 0.25, SH.silver, bx, by + 1.9 * s + 0.125, bz, 6, null, false);
      out.push(stV(bx, by + 1.9 * s + 0.22, bz));
    }
    box(parent, 0.7, 1.2, 2.6 * s, SH.trafo, x + hw + 0.35, yt - 0.75, z);                                          // cutia de cabluri de 20 kV; cablurile coboara in pietris
    for (i = -1; i <= 1; i++) cyl(parent, 0.07, 0.07, yt - 1.35 - 0.6, SH.dark, x + hw + 0.4, (yt - 1.35 + 0.6) / 2, z + i * 0.5 * s, 6, null, false);
    box(parent, 0.5, 0.06, 1.6 * s, SH.steel, x + hw + 0.3, yb + 1.0, z, false);
    var cx = x + hw * 0.6, cy = yt + 1.6 * s;                                                                       // conservatorul de ulei
    cyl(parent, 0.5 * s, 0.5 * s, 3.6 * s, SH.trafo, cx, cy, z, 14, [Math.PI / 2, 0, 0]);
    blob(parent, SH.trafo, cx, cy, z - 1.8 * s, 0.5 * s, 0.5 * s, 0.16 * s, 0, false); blob(parent, SH.trafo, cx, cy, z + 1.8 * s, 0.5 * s, 0.5 * s, 0.16 * s, 0, false);
    for (sd = -1; sd <= 1; sd += 2) box(parent, 0.12, cy - 0.42 * s - yt - 0.1, 0.12, SH.trafo, cx, (cy - 0.42 * s + yt + 0.1) / 2, z + sd * 1.2 * s, false);
    beam(parent, SH.steel, x - hw * 0.1, yt + 0.12, z + 0.5 * s, cx - 0.3 * s, cy - 0.3 * s, z + 0.5 * s, 0.07, false);        // teava de ulei cu releu
    box(parent, 0.2, 0.18, 0.18, SH.dark, (x - hw * 0.1 + cx - 0.3 * s) / 2, (yt + 0.12 + cy - 0.3 * s) / 2, z + 0.5 * s, false);
    box(parent, 0.3, 0.3, 0.03, SH.white, cx, cy, z + 1.97 * s, false);                                             // indicator de nivel
    box(parent, 0.36, 1.1, 0.7, SH.silver, x - hw - 0.18, yb + 1.3, z + hl * 0.55, false);                          // comutatorul de ploturi
    box(parent, 0.36, 1.0, 0.8, SH.silver, x + hw + 0.18, yb + 1.2, z - hl * 0.75, false);                          // dulap de comanda
    box(parent, 0.02, 0.25, 0.3, SH.hazard, x - hw - 0.37, yb + 1.5, z + hl * 0.55, false);
    ao(parent, hw * 2 + 1, hl * 2 + 3, x, 0.68, z, 1.6);
    return out;
  }
  function trafoMV(parent, x, z, s) {         // transformator 20/0,4 kV in ulei (s = 1: 1600 kVA, circa 2,0 x 1,3 x 2,1 m), in cuva de retentie
    var hw = 0.5 * s, hl = 0.95 * s, th = 1.45 * s, yb = 0.82, yt = yb + th, i, sd, out = [];
    var bw = hw + 1.0, bl = hl + 0.95, n = Q.lite ? 6 : 12, n2 = Q.lite ? 3 : 6;
    box(parent, bw * 2, 0.4, 0.15, SH.base, x, 0.5, z - bl, false); box(parent, bw * 2, 0.4, 0.15, SH.base, x, 0.5, z + bl, false);
    box(parent, 0.15, 0.4, bl * 2, SH.base, x - bw, 0.5, z, false); box(parent, 0.15, 0.4, bl * 2, SH.base, x + bw, 0.5, z, false);
    box(parent, bw * 2 - 0.15, 0.08, bl * 2 - 0.15, SH.gravel, x, 0.5, z, false);
    for (sd = -1; sd <= 1; sd += 2) {
      box(parent, 0.3, 0.44, hl * 2 + 0.3, SH.concrete, x + sd * hw * 0.7, 0.52, z, false);
      box(parent, 0.1, 0.08, hl * 2 + 0.1, SH.steel, x + sd * hw * 0.7, 0.78, z, false);
    }
    box(parent, hw * 2, th, hl * 2, SH.trafo, x, yb + th / 2, z);
    box(parent, hw * 2 + 0.12, 0.06, hl * 2 + 0.12, SH.trafo, x, yt + 0.03, z, false);
    for (sd = -1; sd <= 1; sd += 2) {                                                                               // pereti ondulati de racire
      for (i = 0; i < n; i++) box(parent, 0.16 * s, th * 0.8, 0.03, SH.trafoFin, x + sd * (hw + 0.08 * s), yb + th * 0.5, z - hl * 0.9 + i * hl * 1.8 / (n - 1), false);
      for (i = 0; i < n2; i++) box(parent, 0.03, th * 0.8, 0.16 * s, SH.trafoFin, x - hw * 0.85 + i * hw * 1.7 / (n2 - 1), yb + th * 0.5, z + sd * (hl + 0.08 * s), false);
    }
    for (i = -1; i <= 1; i++) {                                                                                     // izolatoare de 20 kV
      var bz = z - 0.12 * s + i * 0.5 * s;
      stIns(parent, x - hw * 0.55, yt + 0.06, bz, 0.4 * s, 0.055 * s, 4);
      cyl(parent, 0.02, 0.02, 0.08, SH.silver, x - hw * 0.55, yt + 0.1 + 0.4 * s, bz, 6, null, false);
      out.push(stV(x - hw * 0.55, yt + 0.14 + 0.4 * s, bz));
    }
    var cw = hw * 0.85 + 0.16 * s + 0.24;                                                                           // cutia de joasa tensiune si coborarea ei in canal
    box(parent, cw, 0.28 * s, 0.9 * s, SH.silver, x + hw * 0.15 + cw / 2, yt + 0.06 + 0.14 * s, z, false);
    box(parent, 0.24, yt + 0.06 - 0.54, 0.7 * s, SH.silver, x + hw + 0.16 * s + 0.12, (yt + 0.06 + 0.54) / 2, z, false);
    cyl(parent, 0.2 * s, 0.2 * s, hw * 1.8, SH.trafo, x, yt + 0.5 * s, z + hl - 0.1 * s, 10, [0, 0, Math.PI / 2], false);   // conservator
    for (sd = -1; sd <= 1; sd += 2) box(parent, 0.06, 0.3 * s, 0.06, SH.trafo, x + sd * hw * 0.6, yt + 0.06 + 0.13 * s, z + hl - 0.1 * s, false);
    box(parent, 0.02, 0.2, 0.26, SH.hazard, x - hw - 0.17 * s, yb + th * 0.55, z + hl * 0.4, false);
    ao(parent, hw * 2 + 0.8, hl * 2 + 0.8, x, 0.55, z, 1.4);
    return out;
  }
  function stKiosk(parent, x, z, w, d, h, nd, dir, da, db) {   // cladire prefabricata din beton pentru celulele de medie tensiune; usile sunt pe fata dir (1 = est, -1 = vest)
    var y0 = 0.62, i, fx = x + dir * (w / 2 + 0.02);
    if (da == null) { da = z - d / 2; db = z + d / 2; }
    box(parent, w + 0.1, 0.3, d + 0.1, SH.base, x, 0.47, z, false);
    box(parent, w, h, d, SH.paint, x, y0 + h / 2, z);
    box(parent, w + 0.4, 0.14, d + 0.4, SH.trim, x, y0 + h + 0.07, z);
    for (i = 0; i < nd; i++) {
      var dz = da + (i + 0.5) * (db - da) / nd, dw = Math.min(1.3, (db - da) / nd * 0.7);
      box(parent, 0.06, 2.05, dw, SH.contDark, fx, y0 + 1.025, dz, false);
      box(parent, 0.07, 0.3, dw * 0.8, SH.louver, fx, y0 + h - 0.3, dz, false);
      box(parent, 0.075, 0.22, 0.22, SH.hazard, fx, y0 + 1.5, dz, false);
      box(parent, 0.1, 0.12, 0.04, SH.silver, fx, y0 + 1.0, dz + dw * 0.38, false);
    }
    box(parent, 0.8, 0.3, db - da - (da === z - d / 2 ? d * 0.2 : -0.6), SH.concrete, x + dir * (w / 2 + 0.45), 0.47, (da + db) / 2, false);     // treapta din fata usilor
    ao(parent, w + 0.6, d + 0.6, x, 0.33, z, 1.4);
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
    var a = 3.8, y1 = h * 0.8, y2 = h * 0.93, ins = 1.4, arms = [[-a, y1], [a * 0.8, y2], [a, y1]];                   // console de 3-4 m, lanturi de izolatoare de 1,4 m
    arms.forEach(function (e) {
      beam(parent, SH.steel, x, e[1] + h * 0.035, z, x, e[1], z + e[0], th); beam(parent, SH.steel, x, e[1] - h * 0.02, z, x, e[1], z + e[0], th, false);
      stIns(parent, x, e[1] - ins, z + e[0], ins, 0.09, 6);
      box(parent, 0.5, 0.08, 0.12, SH.silver, x, e[1] - ins - 0.02, z + e[0], false); box(parent, th * 1.6, th * 1.6, th * 1.6, SH.steel, x, e[1], z + e[0], false);    // clema conductorului
    });
    cyl(parent, 0.03, 0.05, h * 0.06, SH.steel, x, h * 1.03, z, 6, null, false);                                    // varful cu conductorul de garda
    var r = arms.map(function (e) { return stV(x, e[1] - ins, z + e[0]); });
    r.push(stV(x, h * 1.06, z));
    return r;
  }
  function poleMV(parent, x, z, h) {          // stalp de beton pentru linia de medie tensiune
    cyl(parent, 0.1, 0.17, h, SH.base, x, h / 2, z, 8); cyl(parent, 0.28, 0.32, 0.25, SH.concrete, x, 0.125, z, 8, null, false);
    box(parent, 0.12, 0.12, 2.8, SH.steel, x, h * 0.93, z); box(parent, 0.1, 0.5, 0.1, SH.steel, x, h * 0.93 + 0.3, z, false);
    beam(parent, SH.steel, x, h * 0.93 - 0.9, z, x, h * 0.93, z - 1.0, 0.05, false); beam(parent, SH.steel, x, h * 0.93 - 0.9, z, x, h * 0.93, z + 1.0, 0.05, false);   // contrafise
    box(parent, 0.26, 0.2, 0.012, SH.hazard, x, 2.2, z + 0.16, false);
    return [-1.25, 0, 1.25].map(function (dz, i) {
      var yy = h * 0.93 + (i === 1 ? 0.75 : 0.35);
      stIns(parent, x, yy - 0.3, z + dz, 0.32, 0.05, 3);
      cyl(parent, 0.025, 0.025, 0.06, SH.silver, x, yy + 0.04, z + dz, 6, null, false);
      return stV(x, yy + 0.05, z + dz);
    });
  }
  function poleTerm(parent, x, z, h, acc) {   // stalp terminal: linia aeriana se termina aici si coboara in cablu ingropat
    var yA = h - 0.5, yB = h - 3.4, i, out = [], yJ = yB - 1.4, zc = z + 0.27;
    cyl(parent, 0.11, 0.18, h, SH.base, x, h / 2, z, 8); cyl(parent, 0.3, 0.34, 0.5, SH.concrete, x, 0.25, z, 8, null, false);
    box(parent, 0.12, 0.12, 2.9, SH.steel, x - 0.19, yA, z);                                                        // consola liniei
    box(parent, 0.1, 0.1, 2.5, SH.steel, x - 0.3, yB, z); box(parent, 0.3, 0.14, 0.34, SH.steel, x - 0.14, yB, z, false);   // consola cu capete de cablu si descarcatoare
    for (i = -1; i <= 1; i += 2) {
      beam(parent, SH.steel, x - 0.15, yA - 0.9, z, x - 0.19, yA, z + i * 1.1, 0.05, false);
      beam(parent, SH.steel, x - 0.16, yB - 0.8, z, x - 0.3, yB, z + i * 0.95, 0.05, false);
    }
    for (i = -1; i <= 1; i++) {
      var zl = z + i * 1.25, zt = z + i * 0.8, a = stV(x - 0.8, yA, zl), b = stV(x - 0.3, yB + 0.5, zt);
      stIns(parent, x - 0.52, yA, zl, 0.5, 0.055, 4, true);                                                         // izolator de intindere
      out.push(a);
      stIns(parent, x - 0.3, yB + 0.05, zt, 0.42, 0.05, 4);                                                         // cap terminal de cablu
      cyl(parent, 0.04, 0.05, 0.36, SH.silver, x - 0.3, yB + 0.23, zt + 0.3, 6, null, false);                       // descarcator
      wireTo(acc, a, b, 0.05, 3); wireTo(acc, b, stV(x - 0.3, yB + 0.42, zt + 0.3), 0, 1);
      beam(parent, SH.dark, x - 0.3, yB, zt, x - 0.3, yB - 0.45, zt, 0.07, false);
      beam(parent, SH.dark, x - 0.3, yB - 0.45, zt, x, yJ, zc, 0.07, false);
    }
    cyl(parent, 0.06, 0.06, yJ - 0.3, SH.dark, x, (yJ + 0.3) / 2, zc, 8, null, false);                              // cablul coboara pe stalp, in teava de protectie jos
    cyl(parent, 0.085, 0.085, 2.6, SH.steel, x, 1.6, zc, 8, null, false);
    for (i = 0; i < 3; i++) box(parent, 0.3, 0.04, 0.42, SH.steel, x, 3.4 + i * 1.6, z + 0.12, false);
    box(parent, 0.26, 0.2, 0.012, SH.hazard, x, 2.2, z - 0.19, false);
    return out;
  }
  function wire(parent, a, b, sag) {
    var pts = [];
    for (var i = 0; i <= 12; i++) { var t = i / 12, p = a.clone().lerp(b, t); p.y -= Math.sin(Math.PI * t) * sag; pts.push(p); }
    parent.add(new T.Line(new T.BufferGeometry().setFromPoints(pts), SH.wire));
  }
  function wireTo(acc, a, b, sag, n) {        // conductor cu sageata, adunat intr-o lista: toate firele unui grup se deseneaza dintr-o data
    var p0 = a, i, t, p; n = n || 12;
    for (i = 1; i <= n; i++) { t = i / n; p = a.clone().lerp(b, t); p.y -= 4 * t * (1 - t) * sag; acc.push(p0, p); p0 = p; }
  }
  function wireFlush(parent, acc) {
    if (acc.length) parent.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(acc), SH.wire));
    acc.length = 0;
  }
