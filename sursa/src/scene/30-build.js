
  /* ---------- campusul pentru un scenariu ---------- */
  function grp(parent) { var g = new T.Group(); parent.add(g); return g; }
  function vpl(parent, w, h, m, x, y, z, rotY) {       // placa subtire in picioare; fara rotatie priveste spre sud
    addGeo(parent, unit('vplane', function () { return new T.PlaneGeometry(1, 1); }), m, x, y, z, w, h, 1, rotY ? [0, rotY, 0] : null, false);
  }
  function quad(parent, m, x, y, z, w, d, ur, vr, swap) {   // dreptunghi pe sol, cu textura repetata de ur x vr ori
    var a = batch.acc(parent, m, false), n0 = a.n, hx = w / 2, hz = d / 2;
    a.pos.push(x - hx, y, z - hz, x + hx, y, z - hz, x + hx, y, z + hz, x - hx, y, z + hz);
    a.nor.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
    if (swap) a.uv.push(0, 0, 0, ur, vr, ur, vr, 0); else a.uv.push(0, 0, ur, 0, ur, vr, 0, vr);
    a.idx.push(n0, n0 + 2, n0 + 1, n0, n0 + 3, n0 + 2); a.n += 4;
  }
  function fenceBox(parent, xa, xb, za, zb, hgt) {
    var posts = [];
    fenceRun(parent, posts, xa, za, xb, za, hgt); fenceRun(parent, posts, xa, zb, xb, zb, hgt); fenceRun(parent, posts, xa, za, xa, zb, hgt); fenceRun(parent, posts, xb, za, xb, zb, hgt);
    fencePosts(parent, posts);
  }
  function fencePosts(parent, posts) { posts.forEach(function (q) { cyl(parent, 0.04, 0.04, q[2] + 0.12, SH.steel, q[0], (q[2] + 0.12) / 2 + 0.03, q[1], 5, null, false); }); }

  function build(p) {
    if (!ok) return null;
    if (root) { scene.remove(root); disposeTree(root); }
    root = new T.Group(); scene.add(root);
    pickObjs = []; tags = []; flows = {}; clouds = []; puffGen = puffHeat = null; batch = new Batch();
    var R = rng(11), i, j, sd;
    var mtx = new T.Matrix4(), q0 = new T.Quaternion(), yAx = new T.Vector3(0, 1, 0), qPi = new T.Quaternion().setFromAxisAngle(yAx, Math.PI), one = new T.Vector3(1, 1, 1), pos = new T.Vector3(), qq = new T.Quaternion(), sc = new T.Vector3(), tc = new T.Color();

    var area = 120 + 650 * p.it, W = Math.sqrt(area * 1.5), D = area / W, H = p.it >= 3 ? 9 : 7;
    var big = p.it >= 0.8, huge = p.it >= 3;
    var zRoad = D / 2 + 34;

    /* --- cladirea --- */
    var bld = grp(root), floorG = grp(bld);
    box(floorG, W, 0.3, D, SH.floor, 0, 0.15, 0, false);
    ao(floorG, W, D, 0, 0.215, 0, 1.2);
    wallGroup = grp(bld);
    var wg = wallGroup, wt = 0.4, offW = Math.max(5, W * 0.22), xE = -W / 2 + W * 0.28, xO = W / 2 - offW, xEnt = W / 2 - offW / 2, xD = xE + 3;
    box(wg, W, H, wt, SH.wall, 0, H / 2, -D / 2 + wt / 2); box(wg, W, H, wt, SH.wall, 0, H / 2, D / 2 - wt / 2);
    box(wg, wt, H, D - 2 * wt, SH.wall, -W / 2 + wt / 2, H / 2, 0); box(wg, wt, H, D - 2 * wt, SH.wall, W / 2 - wt / 2, H / 2, 0);
    // soclu de beton, dunga galbena, cornisa inchisa si colturi
    [[W + 0.12, D / 2 + 0.03, 0], [W + 0.12, -D / 2 - 0.03, 0], [D + 0.12, W / 2 + 0.03, 1], [D + 0.12, -W / 2 - 0.03, 1]].forEach(function (a) {
      function strip(h, t, y, m) { if (a[2]) box(wg, t, h, a[0], m, a[1], y, 0, false); else box(wg, a[0], h, t, m, 0, y, a[1], false); }
      strip(0.9, 0.14, 0.45, SH.base); strip(0.36, 0.1, H - 1.05, SH.stripe); strip(0.3, 0.2, H - 0.15, SH.trim);
    });
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) { box(wg, 0.5, H - 0.3, 0.5, SH.trim, c[0] * (W / 2 - 0.2), (H - 0.3) / 2, c[1] * (D / 2 - 0.2), false); });
    // stalpii structurii, vizibili pe fatade, si burlane
    var nBay = Math.max(2, Math.round(W / 6)), ph = H - 2.13, py = 0.9 + ph / 2;
    for (i = 1; i < nBay; i++) {
      var bx0 = -W / 2 + i * W / nBay;
      box(wg, 0.14, ph, 0.07, SH.trim, bx0, py, -D / 2 - 0.03, false);
      if (bx0 < xO - 0.4 && Math.abs(bx0 - xD) > 2.6) box(wg, 0.14, ph, 0.07, SH.trim, bx0, py, D / 2 + 0.03, false);
      if (i % 2) cyl(wg, 0.07, 0.07, H - 1.2, SH.silver, bx0 + 0.35, (H - 1.2) / 2 + 0.6, -D / 2 - 0.11, 8, null, false);
    }
    var nBayD = Math.max(2, Math.round(D / 6));
    for (i = 1; i < nBayD; i++) { var bz0 = -D / 2 + i * D / nBayD; box(wg, 0.07, ph, 0.14, SH.trim, -W / 2 - 0.03, py, bz0, false); if (bz0 < D / 2 - Math.min(D * 0.5, 9) - 0.8) box(wg, 0.07, ph, 0.14, SH.trim, W / 2 + 0.03, py, bz0, false); }
    // birourile: colt vitrat spre sud-est
    var gh = H - 2.4, gy = 1.05 + gh / 2, gl = Math.min(D * 0.5, 9);
    box(wg, offW - 1.0, gh, 0.16, SH.glass, xEnt, gy, D / 2 + 0.04, false);
    box(wg, 0.16, gh, gl, SH.glass, W / 2 + 0.04, gy, D / 2 - gl / 2 - 0.5, false);
    // intrarea: windfang de sticla, copertina, usi
    box(wg, 3.2, 2.7, 1.8, SH.glass, xEnt, 1.55, D / 2 + 0.9); box(wg, 3.5, 0.14, 2.1, SH.trim, xEnt, 2.97, D / 2 + 1.0, false);
    box(wg, 1.8, 2.25, 0.06, SH.trim, xEnt, 1.33, D / 2 + 1.82, false);
    box(wg, 0.8, 2.05, 0.04, SH.carGlass, xEnt - 0.42, 1.28, D / 2 + 1.85, false); box(wg, 0.8, 2.05, 0.04, SH.carGlass, xEnt + 0.42, 1.28, D / 2 + 1.85, false);
    box(wg, 5.4, 0.16, 3.6, SH.trim, xEnt, 3.3, D / 2 + 1.9);
    cyl(wg, 0.07, 0.07, 3.0, SH.steel, xEnt - 2.5, 1.7, D / 2 + 3.5, 8); cyl(wg, 0.07, 0.07, 3.0, SH.steel, xEnt + 2.5, 1.7, D / 2 + 3.5, 8);
    box(wg, 5.0, 0.04, 0.5, SH.light, xEnt, 3.2, D / 2 + 2.6, false);
    // firma
    var sw = Math.max(5, Math.min(9, W * 0.22)), xSign = Math.max(-W / 2 + sw / 2 + 1, xO - sw / 2 - 1.2);
    box(wg, sw + 0.3, sw / 4 + 0.3, 0.08, SH.trim, xSign, H - 2.25, D / 2 + 0.05, false); vpl(wg, sw, sw / 4, SH.sign, xSign, H - 2.25, D / 2 + 0.1);
    // usa de incarcare, cu copertina si usa de serviciu
    box(wg, 3.6, 3.6, 0.1, SH.door, xD, 2.1, D / 2 + 0.04, false);
    box(wg, 0.2, 3.8, 0.16, SH.trim, xD - 1.9, 2.2, D / 2 + 0.06, false); box(wg, 0.2, 3.8, 0.16, SH.trim, xD + 1.9, 2.2, D / 2 + 0.06, false); box(wg, 4.0, 0.2, 0.16, SH.trim, xD, 4.0, D / 2 + 0.06, false);
    box(wg, 0.24, 1.0, 0.2, SH.hazard, xD - 1.9, 0.8, D / 2 + 0.08, false); box(wg, 0.24, 1.0, 0.2, SH.hazard, xD + 1.9, 0.8, D / 2 + 0.08, false);
    box(wg, 4.6, 0.12, 1.6, SH.trim, xD, 4.3, D / 2 + 0.8);
    if (xD - 3.4 > -W / 2 + 1) { box(wg, 1.0, 2.1, 0.08, SH.white, xD - 3.4, 1.35, D / 2 + 0.04, false); box(wg, 0.5, 0.1, 0.18, SH.light, xD - 3.4, 2.6, D / 2 + 0.1, false); }
    // aerisirile salii electrice (vest) si ale salii de date (nord), iesiri de urgenta
    for (i = 0; i < nBayD; i++) box(wg, 0.1, 1.6, Math.min(2.4, D / nBayD - 1), SH.louver, -W / 2 - 0.04, H - 2.7, -D / 2 + (i + 0.5) * D / nBayD, false);
    for (i = 0; i < nBay; i++) if (i % 2) box(wg, 1.8, 1.2, 0.1, SH.louver, -W / 2 + (i + 0.5) * W / nBay, 2.6, -D / 2 - 0.04, false);
    box(wg, 1.0, 2.1, 0.08, SH.white, xE - 1.6, 1.35, -D / 2 - 0.04, false); box(wg, 0.5, 0.1, 0.18, SH.light, xE - 1.6, 2.6, -D / 2 - 0.1, false);

    // interior: sala electrica (vest), sala de date (mijloc), birouri (est)
    var partG = grp(bld), elec = grp(bld), itg = grp(bld), itx = grp(itg);
    box(partG, 0.25, 3.2, D - 1, SH.wallIn, xE, 1.75, 0); box(partG, 0.25, 3.2, D - 1, SH.wallIn, xO, 1.75, 0);
    // dulapuri electrice si UPS-uri
    var nUps = Math.min(18, Math.max(3, Math.ceil(p.it * 4))), perL = Math.max(2, Math.floor((D - 4) / 1.1)), col = 0, cnt = 0, ux, uz;
    while (cnt < nUps * 2) {
      for (i = 0; i < perL && cnt < nUps * 2; i++, cnt++) {
        ux = -W / 2 + 1.4 + col * 2.6; uz = -D / 2 + 2.2 + i * 1.1;
        if (ux > xE - 1) break;
        box(elec, 0.9, 2.0, 0.95, col % 2 ? SH.dark : SH.silver, ux, 1.3, uz);
        vpl(elec, 0.93, 1.96, SH.cabF, ux + 0.453, 1.3, uz, Math.PI / 2);
        box(elec, 0.05, 0.06, 0.5, SH.upsLed, ux + 0.46, 2.24, uz, false);
      }
      col++; if (-W / 2 + 1.4 + col * 2.6 > xE - 1) break;
    }
    for (j = 0; j < col; j++) { ux = -W / 2 + 1.4 + j * 2.6; if (ux > xE - 1) break; box(elec, 0.45, 0.07, D - 3.4, SH.steel, ux, 2.7, 0, false); }
    // tabloul general (pe peretele de sud) si transformatoarele uscate
    var nSw = Math.max(2, Math.min(9, Math.floor((xE + W / 2 - 2.2) / 0.8)));
    for (i = 0; i < nSw; i++) { box(elec, 0.78, 2.1, 0.7, SH.silver, -W / 2 + 1.2 + i * 0.8, 1.35, D / 2 - 1.0); vpl(elec, 0.74, 2.04, SH.cabF, -W / 2 + 1.2 + i * 0.8, 1.35, D / 2 - 1.36, Math.PI); }
    box(elec, nSw * 0.8, 0.07, 0.4, SH.steel, -W / 2 + 0.8 + nSw * 0.4, 2.7, D / 2 - 1.0, false);
    if (cnt <= perL - 4) for (i = 0; i < (D > 18 ? 2 : 1); i++) {
      var tzI = D / 2 - 3.6 - i * 3.0;
      box(elec, 1.5, 0.12, 2.0, SH.dark, xE - 1.5, 0.36, tzI, false); box(elec, 1.3, 1.9, 1.8, SH.trafo, xE - 1.5, 1.37, tzI); box(elec, 0.04, 1.3, 1.4, SH.louver, xE - 2.17, 1.4, tzI, false);
      for (j = -1; j <= 1; j++) cyl(elec, 0.05, 0.08, 0.3, SH.ceramic, xE - 1.5, 2.45, tzI + j * 0.5, 8, null, false);
    }
    // rackuri: perechi de randuri spate in spate (culoar cald la mijloc)
    var nGpu = Math.ceil(p.it * 1000 / 45), nAll = nGpu + Math.ceil(nGpu * 0.3);
    var hallW = xO - xE - 3, hallD = D - 5, perRowMax = Math.max(2, Math.min(24, Math.floor(hallD / 0.62)));
    var pairs = Math.max(1, Math.ceil(nAll / (2 * perRowMax))); while (pairs * 5.4 > hallW && pairs > 1) pairs--;
    var perRow = Math.ceil(nAll / (pairs * 2));
    var rackT = tpl(function (g) { box(g, 1.2, 2.2, 0.6, SH.rackBody, 0, 0, 0); vpl(g, 0.58, 2.16, SH.rackFront, 0.603, 0, 0, Math.PI / 2); }),
      rackT2 = tpl(function (g) { box(g, 1.2, 2.2, 0.6, SH.rackAlt, 0, 0, 0); vpl(g, 0.58, 2.16, SH.rackFront, 0.603, 0, 0, Math.PI / 2); });
    var rk = inst(itg, rackT, nGpu), rk2 = inst(itg, rackT2, Math.max(1, nAll - nGpu));
    var hallCx = (xE + xO) / 2, n1 = 0, n2 = 0, rowLen = perRow * 0.62, rackPos = [hallCx + (pairs - 1) * 2.7 + 1.2, rowLen / 2 - 0.31];
    for (var pr = 0; pr < pairs; pr++) {
      var px = hallCx + (pr - (pairs - 1) / 2) * 5.4;
      for (var side = 0; side < 2; side++) {
        var rx = px + (side ? 1.2 : -1.2), lastRow = pr === pairs - 1 && side === 1;
        for (i = 0; i < perRow; i++) {
          var ix = lastRow ? perRow - 1 - i : i;       // ultimul rand se umple dinspre sud, unde sta rackul desenat in detaliu
          if (lastRow && i === 0) continue;
          if (n1 + n2 >= nAll - 1) break;
          mtx.compose(pos.set(rx, 1.4, -rowLen / 2 + (ix + 0.5) * 0.62), side ? q0 : qPi, one);
          if ((ix === 0 || ix === perRow - 1) && n2 < nAll - nGpu) rk2.setMatrixAt(n2++, mtx); else if (n1 < nGpu - 1) rk.setMatrixAt(n1++, mtx); else rk2.setMatrixAt(n2++, mtx);
        }
      }
      flat(itx, 1.2, rowLen + 1, SH.hot, px, 0.33, 0);
      for (sd = -1; sd <= 1; sd += 2) {
        flat(itx, 1.5, rowLen + 1, SH.cold, px + sd * 2.55, 0.33, 0);
        box(itx, 1.2, 2.2, 0.05, SH.contain, px, 1.4, sd * (rowLen / 2 + 0.03), false); box(itx, 1.3, 0.08, 0.1, SH.steel, px, 2.54, sd * (rowLen / 2 + 0.03), false);   // usile culoarului cald
        box(itx, 0.45, 0.07, rowLen, SH.steel, px + sd * 1.2, 2.62, 0, false);                                                                                         // jgheaburi de cabluri
        box(itx, 0.12, 0.05, rowLen, SH.light, px + sd * 2.55, 3.05, 0, false);                                                                                        // benzi de lumina
      }
      box(itx, 1.2, 0.05, rowLen, SH.contain, px, 2.53, 0, false);                                                    // tavanul culoarului cald
      cyl(itx, 0.09, 0.09, rowLen + 1.5, SH.blue, px - 0.25, 2.9, 0, 8, [Math.PI / 2, 0, 0], false); cyl(itx, 0.09, 0.09, rowLen + 1.5, SH.red, px + 0.25, 2.9, 0, 8, [Math.PI / 2, 0, 0], false);
      // unitatea care imparte lichidul de racire (CDU)
      box(itx, 0.9, 1.9, 1.0, SH.white, px, 1.25, -rowLen / 2 - 1.0); box(itx, 0.92, 0.25, 1.02, SH.blue, px, 1.9, -rowLen / 2 - 1.0, false); box(itx, 0.3, 0.2, 0.02, SH.screen, px, 1.5, -rowLen / 2 - 0.49, false);
    }
    rk.count = n1; rk2.count = n2; rk.instanceMatrix.needsUpdate = true; rk2.instanceMatrix.needsUpdate = true;
    var rackD = rackDetail(itg, rackPos[0], rackPos[1]);
    var hz = rowLen / 2 + 1.2, hx0 = hallCx - (pairs - 1) * 2.7 - 0.5, hx1 = W / 2 - 0.3, hzz = -Math.min(hz + 0.9, D / 2 - 0.8);
    cyl(itx, 0.11, 0.11, hx1 - hx0, SH.blue, (hx0 + hx1) / 2, 2.9, hzz, 8, [0, 0, Math.PI / 2], false); cyl(itx, 0.11, 0.11, hx1 - hx0, SH.red, (hx0 + hx1) / 2, 2.9, hzz + 0.35, 8, [0, 0, Math.PI / 2], false);
    // butelii de stingere, paleti cu echipamente langa usa de incarcare
    for (i = 0; i < 4; i++) { cyl(itx, 0.16, 0.16, 1.5, SH.red, xE + 0.6, 1.05, D / 2 - 1.2 - i * 0.45, 10, null, false); cyl(itx, 0.05, 0.05, 0.2, SH.steel, xE + 0.6, 1.9, D / 2 - 1.2 - i * 0.45, 6, null, false); }
    if (D / 2 - 2.4 > rowLen / 2 + 1.5) {
      box(itx, 1.2, 0.14, 1.0, SH.wood, xD, 0.37, D / 2 - 2.2, false); box(itx, 1.05, 0.9, 0.9, SH.box, xD, 0.89, D / 2 - 2.2);
      box(itx, 1.2, 0.14, 1.0, SH.wood, xD + 1.6, 0.37, D / 2 - 2.0, false); box(itx, 0.7, 2.0, 0.85, SH.rackAlt, xD + 1.6, 1.44, D / 2 - 2.0);
    }
    // birourile: mese cu ecrane, dulapuri
    var ocx = xO + offW / 2, dw = Math.max(2, Math.min(4.4, offW - 3)), nDesk = Math.max(1, Math.min(4, Math.floor(D / 9)));
    for (j = 0; j < nDesk; j++) {
      var dz0 = (j - (nDesk - 1) / 2) * 6;
      box(elec, dw, 0.06, 0.9, SH.wood, ocx, 1.05, dz0, false); box(elec, 0.08, 0.74, 0.8, SH.dark, ocx - dw / 2 + 0.1, 0.67, dz0, false); box(elec, 0.08, 0.74, 0.8, SH.dark, ocx + dw / 2 - 0.1, 0.67, dz0, false);
      for (i = -1; i <= 1; i++) {
        if (Math.abs(i) * 0.85 + 0.4 > dw / 2) continue;
        box(elec, 0.7, 0.42, 0.04, SH.dark, ocx + i * 0.85, 1.5, dz0 - 0.22, false); box(elec, 0.64, 0.36, 0.02, SH.screen, ocx + i * 0.85, 1.5, dz0 - 0.195, false); box(elec, 0.06, 0.22, 0.06, SH.dark, ocx + i * 0.85, 1.19, dz0 - 0.24, false);
      }
      box(elec, 0.5, 0.1, 0.5, SH.dark, ocx - 0.5, 0.75, dz0 + 0.8, false); box(elec, 0.5, 0.55, 0.08, SH.dark, ocx - 0.5, 1.1, dz0 + 1.05, false); cyl(elec, 0.04, 0.2, 0.42, SH.steel, ocx - 0.5, 0.5, dz0 + 0.8, 6, null, false);
    }
    box(elec, 0.5, 1.9, Math.min(3, D * 0.2), SH.white, W / 2 - 0.75, 1.25, -D / 4);

    // acoperisul (se ridica): membrana, atic, aparate
    roofGroup = grp(bld);
    box(roofGroup, W + 0.3, 0.3, D + 0.3, SH.roof, 0, H + 0.15, 0);
    for (sd = -1; sd <= 1; sd += 2) {
      box(roofGroup, W + 0.5, 0.7, 0.25, SH.roofUnit, 0, H + 0.35, sd * (D / 2 + 0.12)); box(roofGroup, W + 0.56, 0.08, 0.33, SH.roofTrim, 0, H + 0.74, sd * (D / 2 + 0.12), false);
      box(roofGroup, 0.25, 0.7, D + 0.5, SH.roofUnit, sd * (W / 2 + 0.12), H + 0.35, 0); box(roofGroup, 0.33, 0.08, D + 0.56, SH.roofTrim, sd * (W / 2 + 0.12), H + 0.74, 0, false);
    }
    var nU = Math.max(2, Math.round(W / 9));
    for (i = 0; i < nU; i++) {
      var rxU = -W / 2 + (i + 0.5) * W / nU, rzU = -D / 4;
      box(roofGroup, 2.6, 0.15, 2.0, SH.roofTrim, rxU, H + 0.38, rzU, false); box(roofGroup, 2.4, 1.3, 1.8, SH.roofUnit, rxU, H + 1.1, rzU);
      box(roofGroup, 1.7, 0.8, 0.04, SH.roofTrim, rxU, H + 1.1, rzU + 0.91, false); cyl(roofGroup, 0.6, 0.6, 0.14, SH.roofTrim, rxU, H + 1.8, rzU, 16, null, false);
    }
    for (i = 0; i <= nU; i++) { var vx = -W / 2 + (i + 0.5) * W / (nU + 1); box(roofGroup, 1.3, 0.28, 1.3, SH.roofTrim, vx, H + 0.44, D / 4, false); box(roofGroup, 1.1, 0.1, 1.1, SH.roofUnit, vx, H + 0.62, D / 4, false); }
    box(roofGroup, W * 0.8, 0.12, 0.4, SH.roofTrim, 0, H + 0.4, 0.6, false);
    roofK = roofOpen ? 1 : 0;
    tag(bld, 'building');

    /* --- platforma tehnica --- */
    var perCol = Math.max(1, Math.floor((D - 2) / 4)), nCool = Math.max(2, Math.ceil(p.it * 1.25 / 0.45) + 1), coolCols = Math.ceil(nCool / perCol);
    var coolLen = 9, coolX0 = W / 2 + 4 + coolLen / 2, coolW = coolCols * (coolLen + 2);
    var nGen = huge ? Math.ceil(p.it * 1.25 / 2) + 1 : 2, genLen = big ? 12 : 6, genS = big ? 1 : 0.7;
    var subS = huge ? 2.2 : big ? 1.3 : 0.8, subW = 14 * subS, subD = 12 * subS;
    var xGen = -W / 2 - 4 - genLen / 2, xSub = -W / 2 - 4 - genLen - 12 - subW / 2, zSub = D / 2 - subD / 2 + 2;
    var nB = p.bess > 0 ? Math.max(1, Math.ceil(p.bess / 2.5)) : 0, perRowB = Math.max(2, Math.floor((W * 0.75 + 10) / 8)), rowsB = Math.ceil(nB / perRowB);
    var zB0 = -D / 2 - 11, zPV0 = zB0 - Math.max(1, rowsB) * 6 - 12;
    var platX0 = xSub - subW / 2 - 6, platX1 = W / 2 + 4 + coolW + 8, platZ0 = zPV0 + 5, platZ1 = D / 2 + 24;
    var pw = platX1 - platX0, pd = platZ1 - platZ0, platG = grp(root); platG.position.set((platX0 + platX1) / 2, 0, (platZ0 + platZ1) / 2);
    box(platG, pw, 0.2, pd, SH.concrete, 0, 0.1, 0, false);
    box(platG, pw + 0.3, 0.3, 0.3, SH.base, 0, 0.15, -pd / 2, false); box(platG, 0.3, 0.3, pd, SH.base, -pw / 2, 0.15, 0, false); box(platG, 0.3, 0.3, pd, SH.base, pw / 2, 0.15, 0, false);

    // racire (est)
    var cool = grp(root), coolO = [], coolI = inst(cool, coolerTpl(coolLen), nCool);
    for (i = 0; i < nCool; i++) {
      var cc = Math.floor(i / perCol), cr = i % perCol, rowsHere = Math.min(perCol, nCool - cc * perCol), ccx = coolX0 + cc * (coolLen + 2), ccz = (cr - (rowsHere - 1) / 2) * 4;
      mtx.compose(pos.set(ccx, 0.2, ccz), q0, one); coolI.setMatrixAt(i, mtx); coolO.push([ccx, 3.6, ccz]);
    }
    var pz = Math.min(D / 2 - 1.2, ((Math.min(perCol, nCool) - 1) / 2) * 4 + 2.2);
    cyl(cool, 0.22, 0.22, coolW + 3, SH.blue, W / 2 + (coolW + 3) / 2, 0.9, pz, 10, [0, 0, Math.PI / 2]); cyl(cool, 0.22, 0.22, coolW + 3, SH.red, W / 2 + (coolW + 3) / 2, 0.9, pz + 0.6, 10, [0, 0, Math.PI / 2]);
    for (i = 0; i < Math.round((coolW + 3) / 4); i++) box(cool, 0.12, 0.6, 1.2, SH.steel, W / 2 + 1 + i * 4, 0.5, pz + 0.3, false);
    cyl(cool, 0.8, 0.8, 2.6, SH.silver, W / 2 + 1.7, 1.5, -pz, 16); sph(cool, 0.8, SH.silver, W / 2 + 1.7, 2.8, -pz, false, 0.45);      // vas tampon
    box(cool, 2.2, 0.16, 1.2, SH.dark, W / 2 + 1.9, 0.28, -pz + 2.2, false); cyl(cool, 0.3, 0.3, 1.0, SH.blue, W / 2 + 1.6, 0.72, -pz + 2.2, 12, [0, 0, Math.PI / 2], false); cyl(cool, 0.24, 0.24, 0.7, SH.steel, W / 2 + 2.5, 0.72, -pz + 2.2, 12, [0, 0, Math.PI / 2], false);   // pompe
    tag(cool, 'cool');

    // generatoare (vest)
    var gen = grp(root), zGen0 = -D / 2 + 3, genO = [], gStep = genS * 5.6 + 1.2;
    for (i = 0; i < nGen; i++) genO.push(genset(gen, xGen, zGen0 + i * gStep, genLen, genS));
    tag(gen, 'gen');

    // statie electrica si linia din retea
    var sub = grp(root);
    box(sub, subW, 0.12, subD, SH.gravel, xSub, 0.26, zSub, false);
    var tr1 = transformer(sub, xSub + (big ? subW * 0.2 : 0), zSub - (big ? subD * 0.18 : 0), subS), tr2 = null;
    if (big) { tr2 = transformer(sub, xSub + subW * 0.2, zSub + subD * 0.24, subS); box(sub, 4.8 * subS, 3.4 * subS, 0.3, SH.concrete, xSub + subW * 0.2, 0.3 + 1.7 * subS, zSub + subD * 0.03); }     // zid antifoc intre transformatoare
    var cbx = xSub - subW * 0.22, cbz = zSub + subD * 0.2, cbw = 3 * subS, cbd = 2.4 * subS;                 // cladirea de comanda
    box(sub, cbw, 2.6, cbd, SH.paint, cbx, 1.6, cbz); box(sub, cbw + 0.3, 0.15, cbd + 0.3, SH.trim, cbx, 2.97, cbz);
    box(sub, 0.9, 2.0, 0.06, SH.contDark, cbx - cbw * 0.2, 1.3, cbz + cbd / 2 + 0.02, false); box(sub, 0.8, 0.5, 0.06, SH.louver, cbx + cbw * 0.22, 2.2, cbz + cbd / 2 + 0.02, false);
    var pylH = huge ? 30 : big ? 12 : 10, gx = xSub - subW / 2 + 1.2, gantH = big ? 8 * Math.sqrt(subS) : 0, prev, at;
    if (big) {
      for (sd = -1; sd <= 1; sd += 2) {
        var gz = zSub + sd * subD * 0.35;
        beam(sub, SH.steel, gx - 0.9, 0.3, gz, gx, gantH, gz, 0.2); beam(sub, SH.steel, gx + 0.9, 0.3, gz, gx, gantH, gz, 0.2); box(sub, 1.0, 0.12, 0.12, SH.steel, gx, gantH * 0.5, gz, false);
      }
      box(sub, 0.35, 0.35, subD * 0.75, SH.steel, gx, gantH, zSub);
      prev = [-1, 0, 1].map(function (q) { var zz = zSub + q * subD * 0.25; cyl(sub, 0.09, 0.09, 1.0, SH.ceramic, gx, gantH - 0.68, zz, 8, null, false); return new T.Vector3(gx, gantH - 1.2, zz); });
      [tr1, tr2].forEach(function (tr) { for (var q = 0; q < 3; q++) wire(sub, prev[q], tr[q], 0.5); });
    } else {
      prev = poleMV(sub, gx, zSub, 9);
      for (j = 0; j < 3; j++) wire(sub, prev[j], tr1[j], 0.4);
    }
    var subF = grp(sub); subF.position.y = 0.2; fenceBox(subF, xSub - subW / 2, xSub + subW / 2, zSub - subD / 2, zSub + subD / 2, 2.2);
    var span = huge ? 150 : big ? 70 : 55, lineG = grp(root);
    for (i = 1; i <= 5; i++) {
      var pyG = grp(lineG), tx0 = gx - i * span + (i === 1 ? span * 0.45 : 0);
      at = huge ? towerLattice(pyG, tx0, zSub, pylH) : poleMV(pyG, tx0, zSub, pylH);
      for (j = 0; j < 3; j++) wire(pyG, prev[j], at[j], span * 0.035);
      prev = at;
    }
    tag(sub, 'sub');

    // baterii (nord, intre cladire si panouri)
    var bess = grp(root), xB0 = -W / 2 - 3, bessI = null;
    if (nB) {
      bessI = inst(bess, bessTpl(), nB);
      for (i = 0; i < nB; i++) { mtx.compose(pos.set(xB0 + (i % perRowB) * 8 + 3.05, 0.2, zB0 - Math.floor(i / perRowB) * 6), q0, one); bessI.setMatrixAt(i, mtx); }
      box(bess, 3.0, 0.14, 2.6, SH.concrete, xB0 - 2.6, 0.27, zB0, false); box(bess, 2.4, 2.3, 2.0, SH.cont, xB0 - 2.6, 1.5, zB0);        // statia de conversie
      box(bess, 0.05, 1.4, 1.4, SH.louver, xB0 - 3.83, 1.6, zB0, false); box(bess, 1.0, 1.9, 0.05, SH.white, xB0 - 2.6, 1.4, zB0 + 1.02, false);
      tag(bess, 'bess');
    }
    var bN = Math.min(nB, perRowB), xBc = xB0 + bN * 4, zBc = zB0 - (Math.max(1, rowsB) - 1) * 3;

    /* --- parcul fotovoltaic --- */
    var nT = Math.ceil(p.pv * 1000 / 30), pitch = 9.2, colW = 32;
    var nc = Math.max(1, Math.round(Math.sqrt(nT * 0.42))), nr = Math.max(1, Math.ceil(nT / nc));
    function colX(c) { return c * colW + Math.floor(c / 4) * 6; }
    var fieldW = nT ? colX(nc - 1) + 30 : 0, fieldD = nT ? nr * pitch : 0, tables = null, inv = null, pvG = grp(root);
    if (nT > 0) {
      tables = inst(root, pvTableTpl(), nT);
      for (i = 0; i < nT; i++) { mtx.compose(pos.set(colX(i % nc) + 15 - fieldW / 2, 0, zPV0 - Math.floor(i / nc) * pitch - 2.3), q0, one); tables.setMatrixAt(i, mtx); }
      var nInv = Math.max(1, Math.round(p.pv / 2.5)); inv = grp(root);
      for (i = 0; i < nInv; i++) inverterStation(inv, -fieldW / 2 + (i + 0.5) * fieldW / nInv, zPV0 + 4.5);
      tag(inv, 'pv');
      // drumuri de intretinere din pietris si fasii batatorite intre randuri
      for (i = 4; i < nc; i += 4) flat(pvG, 4, fieldD + 4, SH.gravel, colX(i) - 4 - fieldW / 2, 0.075, zPV0 - fieldD / 2);
      flat(pvG, fieldW + 10, 3.5, SH.gravel, 0, 0.07, zPV0 - fieldD - 3.2); flat(pvG, 3.5, fieldD + 8, SH.gravel, -fieldW / 2 - 4, 0.07, zPV0 - fieldD / 2); flat(pvG, 3.5, fieldD + 8, SH.gravel, fieldW / 2 + 4, 0.07, zPV0 - fieldD / 2);
      for (i = 0; i < nr; i++) flat(pvG, fieldW, 1.6, SH.soil, 0, 0.065, zPV0 - i * pitch - 6.9);
    }
    var zPVmid = zPV0 - fieldD / 2, zPVend = zPV0 - fieldD;

    /* --- limite, gard, drum, copaci, camp --- */
    var x0 = Math.min(-fieldW / 2, platX0) - 10, x1 = Math.max(fieldW / 2, platX1) + 10, z0 = zPVend - 10, z1 = platZ1 + 2;
    var cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, spanX = x1 - x0, spanZ = z1 - z0, RR = Math.sqrt(spanX * spanX + spanZ * spanZ) / 2;
    var k = Math.max(0.7, Math.min(3.2, RR / 110));
    var xGate = xEnt + 9, fenceG = grp(root), fposts = [], fh = 2.4;
    fenceRun(fenceG, fposts, x0, z0, x1, z0, fh); fenceRun(fenceG, fposts, x0, z0, x0, z1, fh); fenceRun(fenceG, fposts, x1, z0, x1, z1, fh);
    fenceRun(fenceG, fposts, x0, z1, xGate - 4.5, z1, fh); fenceRun(fenceG, fposts, xGate + 4.5, z1, x1, z1, fh);
    fencePosts(fenceG, Q.lite ? fposts.filter(function (q, n) { return n % 2 === 0; }) : fposts);
    box(fenceG, 0.3, 2.8, 0.3, SH.dark, xGate - 4.5, 1.4, z1); box(fenceG, 0.3, 2.8, 0.3, SH.dark, xGate + 4.5, 1.4, z1);
    fenceRun(fenceG, [], xGate - 13, z1 - 0.4, xGate - 4.3, z1 - 0.4, 2.2); box(fenceG, 8.7, 0.12, 0.08, SH.dark, xGate - 8.65, 0.25, z1 - 0.4, false);     // poarta culisanta, deschisa
    box(fenceG, 0.1, 2.2, 0.1, SH.dark, xGate - 13, 1.15, z1 - 0.4, false); box(fenceG, 0.1, 2.2, 0.1, SH.dark, xGate - 4.3, 1.15, z1 - 0.4, false);

    var gr = new T.Mesh(new T.CircleGeometry(RR * 16, 64), SH.ground); gr.rotation.x = -Math.PI / 2; gr.position.set(cx, -0.05, cz); gr.receiveShadow = true; root.add(gr);
    TEX.grass.repeat.set(RR * 32 / 34, RR * 32 / 34);
    // pete mari, mai inchise si mai uscate, ca iarba si culturile sa nu arate uniform
    for (i = 0; i < 120; i++) {
      var pa = R() * 6.28, prd = RR * (i < 40 ? R() * 1.2 : 0.4 + R() * 4.2), psz = (i < 40 ? 14 + R() * 40 : 40 + R() * 110) * k;
      quad(root, R() > 0.45 ? SH.patchA : SH.patchB, cx + Math.cos(pa) * prd, 0.03 + i * 0.0004, cz + Math.sin(pa) * prd, psz, psz * (0.5 + R() * 0.8), 1, 1, false);
    }
    // parcele agricole in jur: fasii lungi, cum sunt in Dolj
    var cell = Math.max(spanX, spanZ) * 0.62, gap = 4 * k;
    for (i = -7; i <= 7; i++) for (j = -7; j <= 7; j++) {
      var fx0 = cx + i * cell, fz0 = cz + j * cell;
      if (fx0 + cell / 2 > x0 - 6 && fx0 - cell / 2 < x1 + 6 && fz0 + cell / 2 > z0 - 6 && fz0 - cell / 2 < z1 + 20) continue;
      var ns = 1 + Math.floor(R() * 3.4), alongX = R() > 0.5, full = cell - gap, part = full / ns;
      for (var s = 0; s < ns; s++) {
        var off = -full / 2 + (s + 0.5) * part, fw = alongX ? full : part - gap * 0.35, fd = alongX ? part - gap * 0.35 : full, rep = 26 * k;
        quad(root, SH.crops[Math.floor(R() * SH.crops.length)], fx0 + (alongX ? 0 : off), 0.02, fz0 + (alongX ? off : 0), fw, fd, alongX ? fw / rep : fd / rep, alongX ? fd / rep : fw / rep, !alongX);
      }
    }
    // drum national la sud + acces
    quad(root, SH.road, cx, 0.13, zRoad, RR * 30, 10, RR * 30 / 12, 1, false);
    var siteG = grp(root), carsG = grp(root), peopleG = grp(root);
    var zA = platZ1 - 4, zB = zRoad - 4.2;
    box(siteG, 7, 0.22, zB - zA, SH.asphalt, xGate, 0.11, (zA + zB) / 2, false);
    flat(siteG, 0.14, zB - zA - 1, SH.paint, xGate - 3.2, 0.226, (zA + zB) / 2); flat(siteG, 0.14, zB - zA - 1, SH.paint, xGate + 3.2, 0.226, (zA + zB) / 2); flat(siteG, 3.0, 0.4, SH.paint, xGate + 1.6, 0.226, zB - 1.2);
    // cabina de paza si bariera
    box(siteG, 3, 2.5, 3, SH.paint, xGate + 6, 1.45, platZ1 - 3); box(siteG, 3.6, 0.16, 3.6, SH.trim, xGate + 6, 2.78, platZ1 - 3); box(siteG, 3.04, 0.9, 3.04, SH.carGlass, xGate + 6, 1.75, platZ1 - 3, false);
    box(siteG, 0.3, 1.1, 0.3, SH.white, xGate + 3.9, 0.75, platZ1 + 0.8); box(siteG, 6.6, 0.1, 0.1, SH.red, xGate + 0.6, 1.2, platZ1 + 0.8, false);
    for (i = 0; i < 3; i++) box(siteG, 0.7, 0.11, 0.11, SH.white, xGate + 2.4 - i * 2, 1.2, platZ1 + 0.8, false);
    // curtea: banda de circulatie, parcare, rampa de incarcare
    var xF = xO - 4, nCar = Math.min(5, Math.max(2, Math.round(W / 8))), nBay2 = nCar + 2, xP1 = xF - 1.6, xP0 = xP1 - nBay2 * 2.9, zP = D / 2 + 17.5, xR = -W / 2 - 4 - genLen - 6, zN = -D / 2 - 5.4, xL0 = xR - 2.75, xL1 = xGate + 3.5;
    box(siteG, xL1 - xL0, 0.03, 6, SH.asphalt, (xL0 + xL1) / 2, 0.215, D / 2 + 11.6, false);
    box(siteG, 5.5, 0.03, D / 2 + 8.6 - (zN - 2.75), SH.asphalt, xR, 0.215, (D / 2 + 8.6 + zN - 2.75) / 2, false);                       // drumul din vest, intre generatoare si statie
    box(siteG, W / 2 + 2 - (xR + 2.75), 0.03, 5.5, SH.asphalt, (W / 2 + 2 + xR + 2.75) / 2, 0.215, zN, false);                           // drumul din nord, spre baterii
    box(siteG, xP1 - xP0, 0.03, 5.8, SH.asphalt, (xP0 + xP1) / 2, 0.215, zP, false);
    for (i = 0; i <= nBay2; i++) flat(siteG, 0.12, 5.2, SH.paint, xP1 - i * 2.9, 0.236, zP);
    box(siteG, 7, 0.03, 8.2, SH.asphalt, xD, 0.215, D / 2 + 4.5, false);
    flat(siteG, 0.2, 7.6, SH.stripe, xD - 2.6, 0.236, D / 2 + 4.5); flat(siteG, 0.2, 7.6, SH.stripe, xD + 2.6, 0.236, D / 2 + 4.5);
    box(siteG, 0.2, 0.9, 0.2, SH.stripe, xD - 2.6, 0.65, D / 2 + 0.9); box(siteG, 0.2, 0.9, 0.2, SH.stripe, xD + 2.6, 0.65, D / 2 + 0.9);
    box(siteG, 4.2, 0.02, 3.6, SH.concrete, xEnt, 0.215, D / 2 + 2.4, false);
    for (i = 0; i < nCar; i++) car(carsG, xP1 - 1.45 - (i + (i > 1 ? 1 : 0)) * 2.9, zP, i);
    if (xD + 1.5 < xP0 - 0.6 || D / 2 + 11.8 < zP - 3.2) truck(carsG, xD, D / 2 + 7.4);
    // oameni, ca sa se vada scara
    person(peopleG, rackPos[0] + 1.45, 0.3, rackPos[1] - 1.9); person(peopleG, xGate + 3.9, 0.2, platZ1 - 3.6); person(peopleG, xEnt + 0.9, 0.22, D / 2 + 4.6); person(peopleG, xD + 2.2, 0.22, D / 2 + 2.6);
    // stalpi de iluminat pe marginea platformei: noaptea lumineaza
    var lampG = grp(root), lp = [], nl = Math.max(3, Math.round((platX1 - platX0) / 26));
    for (i = 0; i <= nl; i++) { var lx = platX0 + 3 + i * (platX1 - platX0 - 6) / nl; lp.push([lx, platZ1 - 2.5]); lp.push([lx, platZ0 + 2.5]); }
    var lampI = inst(lampG, lampTpl(), lp.length), glows = new T.InstancedMesh(new T.PlaneGeometry(26, 26), SH.glow, lp.length), qFlat = new T.Quaternion().setFromAxisAngle(new T.Vector3(1, 0, 0), -Math.PI / 2);
    for (i = 0; i < lp.length; i++) {
      mtx.compose(pos.set(lp[i][0], 0.2, lp[i][1]), i % 2 ? q0 : qPi, one); lampI.setMatrixAt(i, mtx);
      mtx.compose(pos.set(lp[i][0], 0.27 + (i % 7) * 0.004, lp[i][1] + (i % 2 ? 2.2 : -2.2)), qFlat, one); glows.setMatrixAt(i, mtx);
    }
    glows.frustumCulled = false; glows.renderOrder = 2; lampG.add(glows);
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

    /* --- zone de apasare --- */
    if (nT) zone(root, 'pv', -fieldW / 2 - 2, fieldW / 2 + 2, zPVend - 2, zPV0 + 6.5, 3.2);
    if (nB) zone(root, 'bess', xB0 - 5, xB0 + bN * 8 + 1, zB0 - (Math.max(1, rowsB) - 1) * 6 - 2.5, zB0 + 2.5, 3.4);
    zone(root, 'cool', W / 2 + 1.5, W / 2 + 4 + coolW, -Math.min(perCol, nCool) * 2 - 1, Math.min(D / 2, Math.min(perCol, nCool) * 2 + 3.5), 3.4);
    zone(root, 'gen', xGen - genLen / 2 - 1, -W / 2 - 1, zGen0 - 2.5, zGen0 + (nGen - 1) * gStep + 4.5, 3.6);
    zone(root, 'sub', xSub - subW / 2, xSub + subW / 2, zSub - subD / 2, zSub + subD / 2, 4 * subS + 2);
    zone(root, 'fiber', xF - 3, xF + 6, D / 2 + 0.6, zRoad - 4.5, 0.8);
    zone(root, 'fiber', x0 - 30, x1 + 30, zRoad - 10.5, zRoad - 5.2, 0.8);

    /* --- fluxuri --- */
    var fg = grp(root), xPvIn = W / 2 - 3;
    if (nT) flows.pv = new Flow(fg, [[0, zPVmid], [0, zPV0 + 8], [xPvIn, zPV0 + 8], [xPvIn, -D / 2]], COL.sun, k, 14);
    if (nB) flows.bess = new Flow(fg, [[xBc, zB0 + 1.4], [xBc, -D / 2]], COL.batt, k, 6);
    flows.grid = new Flow(fg, [[xSub - subW / 2 - 30 * k, zSub + subD / 2 + 2], [xSub, zSub + subD / 2 + 2], [xSub + subW / 2 + 3, zSub + subD / 2 + 2], [xSub + subW / 2 + 3, D / 2 - 2.5], [-W / 2, D / 2 - 2.5]], COL.grid, k, 12);
    flows.fiberA = new Flow(fg, [[xF, D / 2], [xF, zRoad - 6.2], [x0 - 60 * k, zRoad - 6.2]], COL.fiber, k * 0.7, 8);
    flows.fiberB = new Flow(fg, [[xF + 3, D / 2], [xF + 3, zRoad - 9], [x1 + 60 * k, zRoad - 9]], COL.fiber, k * 0.7, 8);
    flows.fiberA.set(0.5, 1); flows.fiberB.set(0.5, -1);
    var zGm = zGen0 + (nGen - 1) * gStep / 2;
    flows.gen = new Flow(fg, [[xGen, zGm], [-W / 2, zGm]], COL.gen, k, 6);
    puffGen = new Puffs(root, genO, SH.smoke, 0.8 * genS, 9, 4); puffGen.on = outage === 2 ? 1 : 0;
    puffHeat = new Puffs(root, coolO, SH.heat, 1.5, 11, 3); puffHeat.on = thermal ? 1 : 0;

    L = {
      W: W, D: D, H: H, k: k, R: RR, cx: cx, cz: cz, spanX: spanX, spanZ: spanZ,
      anchors: {
        building: [0, H + 3, 0], pv: nT ? [0, 7 * k, zPVmid] : null, bess: nB ? [xBc, 6, zBc] : null,
        sub: [xSub, 4 * subS + 5, zSub], gen: [xGen, 6, zGm],
        cool: [coolX0 + (coolCols - 1) * (coolLen + 2) / 2, 6, 0], fiber: [xF + 1.5, 2.5, zRoad - 7],
        f_pv: nT ? [xPvIn / 2, 1.3 * k, zPV0 + 8] : null, f_bess: nB ? [xBc, 1.3 * k, (zB0 + 1.4 - D / 2) / 2] : null,
        f_grid: [xSub + subW / 2 + 3, 1.3 * k, (zSub + subD / 2 + 2 + D / 2 - 2.5) / 2], f_gen: [(xGen - W / 2) / 2, 1.3 * k, zGm],
        r_gpu: [rackPos[0] + 1.21, 1.95, rackPos[1] - 0.1], r_cool: [rackPos[0] - 0.5, 2.42, rackPos[1] + 0.2], r_net: [rackPos[0] + 0.35, 2.5, rackPos[1]],
        r_srv: [rackPos[0] + 0.62, 0.95, rackPos[1] + 0.25], r_pow: [rackPos[0] + 0.55, 0.47, rackPos[1] + 0.28]
      },
      views: {
        overview: { t: [cx, 0, cz + spanZ * 0.02], dist: fit(RR * 0.86), az: 0.62, pol: 1.0 },
        hero: { t: [cx, 0, cz - spanZ * 0.06], dist: fit(RR * 0.74), az: 0.5, pol: 1.3 },          // privire joasa, cu orizont si cer, pentru primul capitol
        building: { t: [0, 2, 0], dist: fit(Math.max(W, D) * 0.95), az: 0.55, pol: 1.0 },
        inside: { t: [(xE + xO) / 2 - W * 0.08, 1, 0], dist: fit(Math.max(W * 0.46, D * 0.6)), az: 0.5, pol: 0.66 },
        power: { t: [(xSub + -W / 2) / 2, 2, D / 4], dist: fit(Math.max(-xSub - W / 2 + subW, D) * 0.85), az: -0.75, pol: 1.02 },
        cooling: { t: [W / 2 + coolW / 2, 2, 0], dist: fit(Math.max(coolW + 14, D) * 0.85), az: 1.05, pol: 0.98 },
        pv: { t: [0, 0, zPVmid + fieldD * 0.1], dist: fit(Math.max(fieldW, fieldD) * 0.62), az: 0.38, pol: 1.0 },
        bess: { t: [xBc, 1, zB0 - 3], dist: fit(Math.max(bN * 8, 26) * 0.9), az: 2.55, pol: 1.0 },
        fiber: { t: [xF, 0, D / 2 + 16], dist: fit(Math.max(W * 0.7, 44)), az: 0.2, pol: 0.95 },
        top: { t: [cx, 0, cz], dist: fit(RR * 0.9), az: 0, pol: 0.06 },
        rack: { t: [rackPos[0] + 0.7, 1.4, rackPos[1] - 0.1], dist: fit(1.55), az: 1.02, pol: 0.98 },
        thermal: { t: [W / 4 + coolW / 4, 1, 0], dist: fit(Math.max(W + coolW + 10, D) * 0.62), az: 0.5, pol: 0.72 }
      },
      land: { w: spanX, d: spanZ }
    };
    camera.near = 0.6 * k; camera.far = RR * 40; camera.updateProjectionMatrix();
    scene.fog.near = RR * 3.5; scene.fog.far = RR * 15;
    if (sky) sky.scale.setScalar(RR * 20);
    parts = { plat: platG, fenceG: fenceG, siteG: siteG, carsG: carsG, peopleG: peopleG, lampG: lampG, sub: sub, lineG: lineG, floorM: floorG, wallGroup: wallGroup, partG: partG, elec: elec, itg: itg, itx: itx,
      cool: cool, gen: gen, rk: rk, rk2: rk2, n1: n1, n2: n2, rack: rackD, tables: tables, inv: inv, pvG: pvG, nT: nT, bess: bess, bessI: bessI, nB: nB, fg: fg, cloudG: cloudG, shell: 1 };
    batch.flush(); applyTags();
    shF.x = 1e9;
    applyBuild();
    applySun();
    return L;
  }
