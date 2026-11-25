    // copaci: plopi de-a lungul drumului, palcuri prin camp, cativa langa curte
    var trees = [[], [], []];
    function addTree(kind, x, z, s) { if (x > x0 - 4 && x < x1 + 4 && z > z0 - 4 && z < z1 + 3) return; trees[kind].push([x, z, s, R() * 6.28, R()]); }
    var nTree = 46;
    for (i = 0; i < nTree; i++) {
      var txx = cx + (i - nTree / 2) * 13 * k + (R() - 0.5) * 6, ts = (0.8 + R() * 0.5) * Math.sqrt(k);
      if (Math.abs(txx - xGate) < 9) txx += 18;
      addTree(0, txx, zRoad + 9, ts); addTree(1, txx + 6.5 * k, zRoad - 8.5, ts);
    }
    for (i = 0; i < 26; i++) {
      var ang = R() * 6.28, rad = RR * (1.25 + R() * 3.2), gxx = cx + Math.cos(ang) * rad, gzz = cz + Math.sin(ang) * rad, nn = 2 + Math.floor(R() * 5), kind = R() > 0.75 ? 2 : 1;
      if (Math.abs(gzz - zRoad) < 14) continue;
      for (j = 0; j < nn; j++) addTree(kind, gxx + (R() - 0.5) * 22 * k, gzz + (R() - 0.5) * 22 * k, (0.8 + R() * 0.6) * Math.sqrt(k));
    }
    for (i = 0; i < 5; i++) addTree(2, x1 + 7 + (R() - 0.5) * 3, z1 - 6 - i * 7, 0.8 + R() * 0.3);
    // gard viu in spatele gardului dinspre drum
    function hedgeRun(xa, xb) { for (var hx = xa; hx < xb - 2; hx += 9) { var hl = Math.min(8.4, xb - hx), hh = 1.1 + R() * 0.4; box(fenceG, hl, hh, 0.9 + R() * 0.2, SH.hedge, hx + hl / 2, hh / 2, z1 - 1.0); } }
    hedgeRun(x0 + 2, xGate - 14); hedgeRun(xGate + 6, x1 - 2);
    // drumuri de pamant printre parcele, o perdea de plopi, o ferma si un sat in departare
    var tkz2 = z0 - 26, fmx = cx - RR * 0.95 - 30, fmz = z0 - RR * 0.8 - 30, vx0 = cx + RR * 1.05, vz0 = z0 - RR * 1.3 - 40, wallMs = [SH.paint, SH.wallIn, SH.box, SH.white];
    quad(root, SH.soil, cx, 0.085, tkz2, RR * 5, 3.5, RR * 5 / 6, 0.6, false);
    quad(root, SH.soil, x0 - 16, 0.085, (tkz2 + zRoad - 5) / 2, 3.5, zRoad - 5 - tkz2, 0.6, (zRoad - 5 - tkz2) / 6, false);
    quad(root, SH.soil, fmx + 42, 0.085, (tkz2 + fmz) / 2, 3.5, tkz2 - fmz, 0.6, (tkz2 - fmz) / 6, false);
    quad(root, SH.soil, vx0 - 88, 0.085, (tkz2 + vz0) / 2, 3.5, tkz2 - vz0, 0.6, (tkz2 - vz0) / 6, false);
    for (var tlx = cx - RR * 1.2; tlx < cx + RR * 0.35; tlx += 11 * Math.sqrt(k)) addTree(0, tlx + (R() - 0.5) * 2, tkz2 - 5, (0.85 + R() * 0.4) * Math.sqrt(k));
    quad(root, SH.soil, fmx, 0.085, fmz, 80, 56, 80 / 6, 56 / 6, false);
    house(root, fmx - 12, fmz - 12, 30, 12, 5, SH.cont, SH.tileRoof, false); house(root, fmx + 22, fmz + 2, 22, 10, 4.5, SH.contDark, SH.trim, true); house(root, fmx - 22, fmz + 16, 10, 7.5, 3, SH.paint, SH.tileRoof, false);
    for (i = 0; i < 2; i++) { cyl(root, 2.3, 2.3, 9, SH.silver, fmx + 4 + i * 5.6, 4.5, fmz + 18, 16); cyl(root, 0.2, 2.35, 1.6, SH.silver, fmx + 4 + i * 5.6, 9.8, fmz + 18, 16, null, false); }
    for (i = 0; i < 6; i++) addTree(1, fmx - 36 + R() * 72, fmz + (R() > 0.5 ? 31 : -31) + R() * 4, 0.8 + R() * 0.4);
    quad(root, SH.soil, vx0, 0.085, vz0, 176, 5, 176 / 6, 0.8, false);
    for (i = 0; i < 16; i++) {
      var hsx = vx0 - 75 + i * 10 + (R() - 0.5) * 3, hsz = vz0 + (i % 2 ? 10 : -10) + (R() - 0.5) * 3;
      house(root, hsx, hsz, 8 + R() * 3, 6 + R() * 2, 2.8 + R() * 0.6, wallMs[Math.floor(R() * 4)], R() > 0.3 ? SH.tileRoof : SH.trim, R() > 0.5);
      if (R() > 0.4) addTree(1, hsx + 5 + R() * 3, hsz + (i % 2 ? 8 : -8), 0.7 + R() * 0.4);
    }
    box(root, 5, 11, 5, SH.paint, vx0 + 12, 5.5, vz0 - 28); cyl(root, 0.1, 3.4, 6, SH.trim, vx0 + 12, 14, vz0 - 28, 4, [0, Math.PI / 4, 0]); house(root, vx0 + 12, vz0 - 39, 16, 8, 6, SH.paint, SH.tileRoof, true);
    // masini pe drumul national (merg spre est)
    var roadG = grp(root); roadG.rotation.y = Math.PI / 2; roadG.position.y = -0.1;
    car(roadG, -(zRoad + 2.4), cx - RR * 0.7, 4); car(roadG, -(zRoad + 2.4), cx + RR * 0.38, 1); truck(roadG, -(zRoad + 2.4), cx + RR * 0.95);
    ['poplar', 'broad', 'conifer'].forEach(function (name, kd) {
      var list = trees[kd]; if (!list.length) return;
      var im = inst(root, treeTpl(name), list.length);
      list.forEach(function (t, n) {
        qq.setFromAxisAngle(yAx, t[3]); mtx.compose(pos.set(t[0], 0, t[1]), qq, sc.set(t[2], t[2] * (0.9 + t[4] * 0.25), t[2])); im.setMatrixAt(n, mtx);
        im.setColorAt(n, tc.setHSL(0.24 + t[4] * 0.07 - (kd === 2 ? 0.02 : 0), 0.42 + t[4] * 0.14, (kd === 2 ? 0.2 : kd === 0 ? 0.3 : 0.27) + t[4] * 0.08));
      });
      im.instanceColor.needsUpdate = true;
    });
    // umbre moi de nori: pete intunecate care plutesc deasupra campusului
    var cloudG = grp(root), cgeo = new T.PlaneGeometry(2, 2); cgeo.rotateX(-Math.PI / 2);
    for (i = 0; i < 7; i++) {
      var cm = new T.Group(), cr2 = RR * (0.2 + R() * 0.2), c1 = new T.Mesh(cgeo, SH.cloud), c2 = new T.Mesh(cgeo, SH.cloud);
      c1.scale.set(cr2, 1, cr2 * (0.55 + R() * 0.3)); c2.scale.set(cr2 * 0.7, 1, cr2 * 0.5); c2.position.set(cr2 * (0.3 + R() * 0.4), 0.05, cr2 * (R() - 0.5) * 0.6);
      c1.renderOrder = c2.renderOrder = 3; cm.add(c1); cm.add(c2);
      cm.position.set(cx + (R() * 2 - 1) * RR * 1.5, H + 4 + i * 0.12, cz + (R() * 2 - 1) * RR * 1.0);
      cm.userData.v = (5 + R() * 5) * k; cloudG.add(cm); clouds.push(cm);
    }
