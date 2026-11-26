    // postul de transformare 20/0,4 kV, in dreptunghiul RZ.sub: cladire prefabricata cu celulele de 20 kV (usile spre vest), doua transformatoare
    // de 1600 kVA in cuve, cu zid antifoc intre ele, gard cu poarta spre platforma libera. Joasa tensiune pleaca prin canal pe x = xInG, drept spre hala.
    var sub = grp(root), lineG = grp(root);
    var en_x0 = xInG - 2.2, en_x1 = RZ.sub[1] - 0.3, en_z0 = RZ.sub[2] + 0.4, en_z1 = RZ.sub[3] - 0.4, en_zc = (en_z0 + en_z1) / 2;
    var en_xT = xInG + 3.0, en_zT = [en_zc - 3.0, en_zc + 3.0], en_kw = 2.6, en_kd = 7.2, en_xK = en_x1 - 1.2 - en_kw / 2, en_zP = en_zc - en_kd / 2 - 0.62, en_xGt = (en_xT + 2.2 + en_xK - en_kw / 2 - 0.85) / 2, en_gw = 1.8;
    var subZ = [en_x0, en_x1, en_z0, en_z1], subA = [(en_x0 + en_x1) / 2, 7, en_zc];
    box(sub, en_x1 - en_x0 - 0.16, 0.12, en_z1 - en_z0 - 0.16, SH.gravel, (en_x0 + en_x1) / 2, 0.26, en_zc, false);       // pat de pietris (fata de sus la 0,32)
    stKiosk(sub, en_xK, en_zc, en_kw, en_kd, 2.9, 4, -1);
    box(sub, 0.5, 0.04, 0.006, SH.steel, en_xK, 1.0, en_zc + en_kd / 2 + 0.004, false); box(sub, 0.04, 0.7, 0.006, SH.steel, en_xK + 0.25, 0.66, en_zc + en_kd / 2 + 0.004, false);   // bara de impamantare a cladirii
    box(sub, 4.0, 0.2, 0.6, SH.base, en_xT, 0.42, en_zc, false); box(sub, 3.8, 3.4, 0.25, SH.paint, en_xT, 2.2, en_zc);    // zid antifoc intre transformatoare, mai inalt decat conservatoarele
    en_zT.forEach(function (zt) {
      var tr = trafoMV(sub, en_xT, zt, 1, -1), fx = tr[1].x + 1.675, fz = tr[1].z, fy = Math.max(2.3, tr[1].y - 0.3), q, zz;
      // cadru cu capete de cablu: cablul de 20 kV urca din canal si trece pe bare la izolatoarele transformatorului
      for (q = -1; q <= 1; q += 2) { box(sub, 0.4, 0.25, 0.4, SH.base, fx, 0.43, fz + q * 0.75, false); box(sub, 0.1, fy - 0.55, 0.1, SH.steel, fx, 0.55 + (fy - 0.55) / 2, fz + q * 0.75, false); }
      box(sub, 0.1, 0.1, 1.7, SH.steel, fx, fy, fz, false);
      for (q = -1; q <= 1; q++) {
        zz = fz + q * 0.5;
        stIns(sub, fx, fy + 0.05, zz, 0.4, 0.05, 4);
        cyl(sub, 0.045, 0.045, fy - 0.3, SH.dark, fx, 0.3 + (fy - 0.3) / 2, zz, 6, null, false);
        cyl(sub, 0.02, 0.02, 0.08, SH.steel, fx, fy + 0.49, zz, 6, null, false);
        beam(sub, SH.steel, fx, fy + 0.5, zz, tr[q + 1].x, tr[q + 1].y - 0.02, tr[q + 1].z, 0.03, false);
      }
      box(sub, 0.5, 0.07, 1.5, SH.base, fx, 0.335, fz, false);
      en_lid(sub, en_xK - en_kw / 2 - 0.85, fz, fx + 0.25, fz, 0.31);                                                    // 20 kV: de la celule la cadru
      en_lid(sub, en_xT - 1.58, zt, xInG + 0.38, zt, 0.31);                                                              // 0,4 kV: de la cuva la canalul colector
    });
    en_lid(sub, xInG, en_zT[0] - 0.38, xInG, en_z1 - 0.08, 0.31);                                                        // canalul colector de joasa tensiune
    en_lid(platG, xInG, en_z1 + 0.08, xInG, zCor - 0.55, 0.2, pcx, pcz); en_lid(platG, xInG, zCor + 0.55, xInG, zNw - 0.9, 0.2, pcx, pcz);
    // cutia de trecere prin peretele de nord, spre tabloul general (xInG), si dulapul de cabluri al generatoarelor si panourilor (xInB)
    (function () {
      var zb = zNw - 0.12, q;
      box(sub, 1.7, 0.14, 0.8, SH.base, xInG, 0.27, zNw - 0.5, false);
      box(sub, 1.3, 0.85, 0.4, SH.paint, xInG, 0.765, zb - 0.2); box(sub, 1.4, 0.04, 0.5, SH.dark, xInG, 1.21, zb - 0.23, false);
      box(sub, 0.3, 0.2, 0.012, SH.hazard, xInG, 0.9, zb - 0.407, false);
      for (q = -1; q <= 1; q += 2) box(sub, 0.04, 0.1, 0.02, SH.steel, xInG + q * 0.6, 0.8, zb - 0.41, false);
      box(sub, 1.9, 0.14, 0.8, SH.base, xInB, 0.27, zNw - 0.5, false);
      box(sub, 1.6, 1.55, 0.5, SH.paint, xInB, 1.115, zb - 0.25); box(sub, 1.72, 0.04, 0.62, SH.dark, xInB, 1.91, zb - 0.29, false);
      box(sub, 0.02, 1.45, 0.012, SH.dark, xInB, 1.115, zb - 0.504, false);
      for (q = -1; q <= 1; q += 2) {
        box(sub, 0.03, 0.2, 0.03, SH.steel, xInB + q * 0.1, 1.15, zb - 0.515, false);
        box(sub, 0.2, 0.2, 0.012, SH.hazard, xInB + q * 0.42, 1.5, zb - 0.506, false);
        box(sub, 0.5, 0.16, 0.014, SH.louver, xInB + q * 0.4, 0.52, zb - 0.506, false);
        box(sub, 0.035, 0.1, 0.02, SH.steel, xInB + q * 0.77, 1.6, zb - 0.506, false); box(sub, 0.035, 0.1, 0.02, SH.steel, xInB + q * 0.77, 0.65, zb - 0.506, false);
      }
      ao(sub, 1.7, 0.8, xInG, 0.207, zNw - 0.5, 1.3); ao(sub, 1.9, 0.8, xInB, 0.207, zNw - 0.5, 1.3);
    })();
    // gard cu poarta in doua canate spre nord (pe acolo intra macaraua la schimbarea unui transformator), indicatoare si prize de pamant
    enFence(sub, 0.2, en_x0, en_z0, en_x1, en_z0, 2.3, en_xGt - en_gw - en_x0, en_xGt + en_gw - en_x0);
    enFence(sub, 0.2, en_x0, en_z1, en_x1, en_z1, 2.3); enFence(sub, 0.2, en_x0, en_z0, en_x0, en_z1, 2.3); enFence(sub, 0.2, en_x1, en_z0, en_x1, en_z1, 2.3);
    for (sd = -1; sd <= 1; sd += 2) {
      box(sub, 0.12, 2.5, 0.12, SH.steel, en_xGt + sd * (en_gw + 0.06), 1.45, en_z0, false);
      gateLeaf(sub, en_xGt + (sd < 0 ? -en_gw : 0.02), en_xGt + (sd < 0 ? -0.02 : en_gw), en_z0, 0.3, 2.2);
      box(sub, 0.5, 0.36, 0.02, SH.hazard, en_xGt + sd * 0.9, 1.7, en_z0 - 0.07, false);
      box(sub, 0.5, 0.36, 0.02, SH.hazard, en_xGt + sd * 5, 1.7, en_z1 + 0.04, false);
      box(sub, 0.02, 0.36, 0.5, SH.hazard, en_x0 - 0.04, 1.7, en_zc + sd * 4, false); box(sub, 0.02, 0.36, 0.5, SH.hazard, en_x1 + 0.04, 1.7, en_zc + sd * 4, false);
      // priza de pamant: camin de vizitare si platbanda pana la stalpul gardului
      cyl(sub, 0.22, 0.22, 0.05, SH.base, en_x0 + 0.7, 0.345, en_zc + sd * (en_z1 - en_zc - 0.7), 10, null, false); cyl(sub, 0.15, 0.15, 0.02, SH.dark, en_x0 + 0.7, 0.38, en_zc + sd * (en_z1 - en_zc - 0.7), 10, null, false);
      box(sub, 0.03, 0.5, 0.006, SH.steel, en_x0 + 0.05, 0.55, en_zc + sd * (en_z1 - en_zc - 0.04), false);
    }
    box(sub, 0.3, 0.14, 0.08, SH.dark, en_xGt, 1.35, en_z0 - 0.07, false);                                                // incuietoarea portii
    // racordul de 20 kV: cablu ingropat. Caminul de langa cladirea celulelor, canal cu capace pe platforma, apoi borne de traseu prin curte pana la stalpul terminal.
    // Daca exista baterii, canalul ocoleste zona lor pe la est.
    var en_zm = (RZ.bess[3] + RZ.sub[2]) / 2, en_xd = nB ? RZ.bess[1] + 1.5 : en_xK, en_zY = platZ0 - 5, en_xY = 140, en_pz = -101, en_px = 195;
    en_pit(sub, en_xK, en_zP, 0.31);
    en_lid(sub, en_xK, en_zP - 0.55, en_xK, en_z0 + 0.08, 0.31);
    if (nB) { en_lid(platG, en_xK, en_z0 - 0.08, en_xK, en_zm + 0.55, 0.2, pcx, pcz); en_pit(platG, en_xK, en_zm, 0.2, pcx, pcz); en_lid(platG, en_xK + 0.55, en_zm, en_xd - 0.55, en_zm, 0.2, pcx, pcz); en_pit(platG, en_xd, en_zm, 0.2, pcx, pcz); en_lid(platG, en_xd, en_zm - 0.55, en_xd, platZ0 + 0.2, 0.2, pcx, pcz); }
    else en_lid(platG, en_xK, en_z0 - 0.08, en_xK, platZ0 + 0.2, 0.2, pcx, pcz);
    // bornele de traseu (galbene, la cel mult 22 m) si linia aeriana: bucatile apar pe rand in timpul santierului, dinspre stalp spre post
    [[[en_xd, platZ0 - 1.2], [en_xd, en_zY], [en_xY, en_zY]], [[en_xY, en_zY], [en_xY, en_pz]], [[en_xY, en_pz], [en_px - 10.5, en_pz]]].forEach(function (leg, li) {
      var g2 = grp(lineG), q, t, n, a, b, d;
      for (q = 1; q < leg.length; q++) {
        a = leg[q - 1]; b = leg[q]; d = Math.hypot(b[0] - a[0], b[1] - a[1]); n = Math.max(1, Math.ceil(d / 22));
        for (t = 0; t <= n; t++) { if (t === n && (q < leg.length - 1 || li < 2)) continue; box(g2, 0.14, 0.75, 0.14, SH.stripe, a[0] + (b[0] - a[0]) * t / n, 0.375, a[1] + (b[1] - a[1]) * t / n, false); }
      }
    });
    (function () {
      var g2 = grp(lineG), acc = [], prev, at, q, s2;
      g2.position.set(en_px, 0, en_pz); g2.rotation.y = Math.PI;                                                      // piesele stalpilor au linia spre -x; aici linia pleaca spre +x
      prev = poleTerm(g2, 0, 0, 12, acc);
      for (q = 1; q <= 3; q++) { at = poleMV(g2, -q * 65, 0, 12); for (s2 = 0; s2 < 3; s2++) wireTo(acc, prev[s2], at[s2], 1.1, 12); prev = at; }
      wireFlush(g2, acc);
    })();
    var gridPath = [[en_px, en_pz - 0.27], [en_xY, en_pz], [en_xY, en_zY], [en_xd, en_zY]].concat(nB ? [[en_xd, en_zm], [en_xK, en_zm]] : [], [[en_xK, en_zP], [en_xK, en_zT[1]], [xInG, en_zT[1]], [xInG, zNw]]);
    tag(sub, 'sub');
