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
  function trafoMV(parent, x, z, s, dir) {    // transformator 20/0,4 kV in ulei (s = 1: 1600 kVA, circa 2,0 x 1,3 x 2,1 m), in cuva de retentie; dir = partea (pe x) pe care iese joasa tensiune
    dir = dir || 1;
    var hw = 0.5 * s, hl = 0.95 * s, th = 1.45 * s, yb = 0.82, yt = yb + th, i, sd, out = [];
    var bw = hw + 1.0, bl = hl + 0.95, n = Q.lite ? 6 : 12, n2 = Q.lite ? 3 : 6;
    box(parent, bw * 2, 0.4, 0.15, SH.base, x, 0.5, z - bl, false); box(parent, bw * 2, 0.4, 0.15, SH.base, x, 0.5, z + bl, false);
    box(parent, 0.15, 0.4, bl * 2, SH.base, x - bw, 0.5, z, false); box(parent, 0.15, 0.4, bl * 2, SH.base, x + bw, 0.5, z, false);
    box(parent, bw * 2 - 0.15, 0.08, bl * 2 - 0.15, SH.gravel, x, 0.5, z, false);
    for (sd = -1; sd <= 1; sd += 2) {
      box(parent, 0.3, 0.44, hl * 2 + 0.3, SH.base, x + sd * hw * 0.7, 0.52, z, false);
      box(parent, 0.1, 0.08, hl * 2 + 0.1, SH.steel, x + sd * hw * 0.7, 0.78, z, false);
    }
    box(parent, hw * 2, th, hl * 2, SH.trafo, x, yb + th / 2, z);
    box(parent, hw * 2 + 0.12, 0.06, hl * 2 + 0.12, SH.trafo, x, yt + 0.03, z);
    for (sd = -1; sd <= 1; sd += 2) {                                                                               // pereti ondulati de racire
      for (i = 0; i < n; i++) box(parent, 0.16 * s, th * 0.8, 0.03, SH.trafoFin, x + sd * (hw + 0.08 * s), yb + th * 0.5, z - hl * 0.9 + i * hl * 1.8 / (n - 1), false);
      for (i = 0; i < n2; i++) box(parent, 0.03, th * 0.8, 0.16 * s, SH.trafoFin, x - hw * 0.85 + i * hw * 1.7 / (n2 - 1), yb + th * 0.5, z + sd * (hl + 0.08 * s), false);
    }
    for (i = -1; i <= 1; i++) {                                                                                     // izolatoare de 20 kV
      var bz = z - 0.12 * s + i * 0.5 * s, bx = x - dir * hw * 0.55;
      stIns(parent, bx, yt + 0.06, bz, 0.4 * s, 0.055 * s, 4);
      cyl(parent, 0.02, 0.02, 0.08, SH.steel, bx, yt + 0.1 + 0.4 * s, bz, 6, null, false);
      out.push(stV(bx, yt + 0.14 + 0.4 * s, bz));
    }
    var cw = hw * 0.85 + 0.16 * s + 0.24;                                                                           // cutia de joasa tensiune si coborarea ei in canal
    box(parent, cw, 0.28 * s, 0.9 * s, SH.steel, x + dir * (hw * 0.15 + cw / 2), yt + 0.06 + 0.14 * s, z, false);
    box(parent, 0.24, yt + 0.06 - 0.54, 0.7 * s, SH.steel, x + dir * (hw + 0.16 * s + 0.12), (yt + 0.06 + 0.54) / 2, z, false);
    cyl(parent, 0.2 * s, 0.2 * s, hw * 1.8, SH.trafo, x, yt + 0.5 * s, z + hl - 0.1 * s, 10, [0, 0, Math.PI / 2]);   // conservator
    for (sd = -1; sd <= 1; sd += 2) box(parent, 0.06, 0.3 * s, 0.06, SH.trafo, x + sd * hw * 0.6, yt + 0.06 + 0.13 * s, z + hl - 0.1 * s);
    box(parent, 0.02, 0.2, 0.26, SH.hazard, x - dir * (hw + 0.17 * s), yb + th * 0.55, z + hl * 0.4, false);
    box(parent, 0.03, 0.5, 0.005, SH.steel, x - dir * hw * 0.8, yb - 0.07, z - hl - 0.01, false);                   // platbanda de impamantare a cuvei
    ao(parent, hw * 2 + 0.8, hl * 2 + 0.8, x, 0.55, z, 1.4);
    return out;
  }
  function stKiosk(parent, x, z, w, d, h, nd, dir, da, db) {   // cladire prefabricata din beton pentru celulele de medie tensiune; usile sunt pe fata dir (1 = +x, -1 = -x)
    var y0 = 0.62, i, fx = x + dir * (w / 2 + 0.02);
    if (da == null) { da = z - d / 2; db = z + d / 2; }
    box(parent, w + 0.1, 0.3, d + 0.1, SH.base, x, 0.47, z, false);
    box(parent, w, h, d, SH.paint, x, y0 + h / 2, z);
    box(parent, w + 0.4, 0.14, d + 0.4, SH.dark, x, y0 + h + 0.07, z, false);
    for (i = 0; i < nd; i++) {
      var dz = da + (i + 0.5) * (db - da) / nd, dw = Math.min(1.3, (db - da) / nd * 0.7);
      box(parent, 0.06, 2.05, dw, SH.louver, fx, y0 + 1.025, dz, false);                                           // usi metalice cu jaluzele
      box(parent, 0.065, 2.05, 0.03, SH.dark, fx, y0 + 1.025, dz, false);                                          // rostul dintre canate
      box(parent, 0.075, 0.22, 0.22, SH.hazard, fx, y0 + 1.5, dz, false);
      box(parent, 0.1, 0.12, 0.04, SH.steel, fx, y0 + 1.0, dz + dw * 0.38, false);
    }
    box(parent, 0.05, 0.5, 0.9, SH.louver, x - dir * (w / 2 + 0.01), y0 + 0.45, z, false);                           // aerisire jos, pe spate
    box(parent, 0.8, 0.3, (db - da) * 0.8, SH.base, x + dir * (w / 2 + 0.45), 0.47, (da + db) / 2, false);          // treapta din fata usilor
    ao(parent, w + 0.6, d + 0.6, x, 0.33, z, 1.4);
  }
  function poleMV(parent, x, z, h) {          // stalp de beton pentru linia de medie tensiune
    cyl(parent, 0.1, 0.17, h, SH.concrete, x, h / 2, z, 8); cyl(parent, 0.28, 0.32, 0.25, SH.concrete, x, 0.125, z, 8);
    box(parent, 0.12, 0.12, 2.8, SH.steel, x, h * 0.93, z, false); box(parent, 0.1, 0.5, 0.1, SH.steel, x, h * 0.93 + 0.3, z, false);
    beam(parent, SH.steel, x, h * 0.93 - 0.9, z, x, h * 0.93, z - 1.0, 0.05, false); beam(parent, SH.steel, x, h * 0.93 - 0.9, z, x, h * 0.93, z + 1.0, 0.05, false);   // contrafise
    return [-1.25, 0, 1.25].map(function (dz, i) {
      var yy = h * 0.93 + (i === 1 ? 0.75 : 0.35);
      stIns(parent, x, yy - 0.3, z + dz, 0.32, 0.05, 3);
      cyl(parent, 0.025, 0.025, 0.06, SH.steel, x, yy + 0.04, z + dz, 6, null, false);
      return stV(x, yy + 0.05, z + dz);
    });
  }
  function poleTerm(parent, x, z, h, acc) {   // stalp terminal: linia aeriana (care pleaca spre -x local) se termina aici si coboara in cablu ingropat
    var yA = h - 0.5, yB = h - 3.4, i, out = [], yJ = yB - 1.4, zc = z + 0.27;
    cyl(parent, 0.11, 0.18, h, SH.concrete, x, h / 2, z, 8); cyl(parent, 0.3, 0.34, 0.5, SH.concrete, x, 0.25, z, 8);
    box(parent, 0.12, 0.12, 2.9, SH.steel, x - 0.19, yA, z, false);                                                 // consola liniei
    box(parent, 0.1, 0.1, 2.5, SH.steel, x - 0.3, yB, z, false); box(parent, 0.3, 0.14, 0.34, SH.steel, x - 0.14, yB, z, false);   // consola cu capete de cablu si descarcatoare
    for (i = -1; i <= 1; i += 2) {
      beam(parent, SH.steel, x - 0.15, yA - 0.9, z, x - 0.19, yA, z + i * 1.1, 0.05, false);
      beam(parent, SH.steel, x - 0.16, yB - 0.8, z, x - 0.3, yB, z + i * 0.95, 0.05, false);
    }
    for (i = -1; i <= 1; i++) {
      var zl = z + i * 1.25, zt = z + i * 0.8, a = stV(x - 0.8, yA, zl), b = stV(x - 0.3, yB + 0.5, zt);
      stIns(parent, x - 0.52, yA, zl, 0.5, 0.055, 4, true);                                                         // izolator de intindere
      out.push(a);
      stIns(parent, x - 0.3, yB + 0.05, zt, 0.42, 0.05, 4);                                                         // cap terminal de cablu
      cyl(parent, 0.04, 0.05, 0.36, SH.steel, x - 0.3, yB + 0.23, zt + 0.3, 6, null, false);                        // descarcator
      wireTo(acc, a, b, 0.05, 3); wireTo(acc, b, stV(x - 0.3, yB + 0.42, zt + 0.3), 0, 1);
      beam(parent, SH.steel, x - 0.3, yB, zt, x - 0.3, yB - 0.45, zt, 0.06, false);
      beam(parent, SH.steel, x - 0.3, yB - 0.45, zt, x, yJ, zc, 0.06, false);
    }
    cyl(parent, 0.06, 0.06, yJ - 0.3, SH.steel, x, (yJ + 0.3) / 2, zc, 8, null, false);                                           // cablul coboara pe stalp, in teava de protectie jos
    cyl(parent, 0.085, 0.085, 2.6, SH.steel, x, 1.6, zc, 8, null, false);
    for (i = 0; i < 3; i++) box(parent, 0.3, 0.04, 0.42, SH.steel, x, 3.4 + i * 1.6, z + 0.12, false);
    return out;
  }
  function enFence(g, y0, xa, za, xb, zb, hgt, gA, gB) {   // gard de plasa pe platforma (y0 = fata platformei): bordura, teava sus, stalpi la cel mult 2,5 m; intre gA si gB (masurate de la primul capat) ramane golul portii
    var dx = xb - xa, dz = zb - za, len = Math.sqrt(dx * dx + dz * dz), ang = Math.atan2(-dz, dx), ux = dx / len, uz = dz / len, n = Math.max(1, Math.round(len / 2.5)), i, t;
    function run(a, b) {
      var m = (a + b) / 2, l = b - a; if (l < 0.05) return;
      addGeo(g, unit('vplane', function () { return new T.PlaneGeometry(1, 1); }), SH.fence, xa + ux * m, y0 + hgt / 2 + 0.1, za + uz * m, l, hgt - 0.08, 1, [0, ang, 0], false);
      box(g, l, 0.05, 0.05, SH.steel, xa + ux * m, y0 + hgt + 0.06, za + uz * m, false, [0, ang, 0]);
      box(g, l, 0.12, 0.16, SH.base, xa + ux * m, y0 + 0.06, za + uz * m, false, [0, ang, 0]);
    }
    if (gA == null) run(0, len); else { run(0, gA); run(gB, len); }
    for (i = 0; i <= n; i++) { t = len * i / n; if (gA != null && t > gA - 0.3 && t < gB + 0.3) continue; cyl(g, 0.04, 0.04, hgt + 0.02, SH.steel, xa + ux * t, y0 + 0.1 + (hgt + 0.02) / 2, za + uz * t, 6, null, false); }
  }
  function wireTo(acc, a, b, sag, n) {        // conductor cu sageata, adunat intr-o lista: toate firele unui grup se deseneaza dintr-o data
    var p0 = a, i, t, p; n = n || 12;
    for (i = 1; i <= n; i++) { t = i / n; p = a.clone().lerp(b, t); p.y -= 4 * t * (1 - t) * sag; acc.push(p0, p); p0 = p; }
  }
  function wireFlush(parent, acc) {
    if (acc.length) parent.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(acc), SH.wire));
    acc.length = 0;
  }
