    // cabina de paza (pe soclu, cu usa spre drum) si doua bariere, cate una pe sens, pe platforma
    var cu_ghx = xGate + 6, cu_ghz = platZ1 - 3, cu_zBr = platZ1 - 0.9;
    box(siteG, 3.3, 0.1, 3.3, SH.base, cu_ghx, 0.25, cu_ghz, false);
    box(siteG, 3, 2.5, 3, SH.paint, cu_ghx, 1.45, cu_ghz); box(siteG, 3.6, 0.16, 3.6, SH.trim, cu_ghx, 2.78, cu_ghz); box(siteG, 3.04, 0.9, 3.04, SH.carGlass, cu_ghx, 1.75, cu_ghz, false);
    box(siteG, 0.07, 2.0, 0.9, SH.trim, cu_ghx - 1.5, 1.3, cu_ghz + 0.8, false); box(siteG, 0.05, 0.6, 0.5, SH.carGlass, cu_ghx - 1.53, 1.75, cu_ghz + 0.8, false); box(siteG, 0.9, 0.08, 1.1, SH.base, cu_ghx - 1.95, 0.24, cu_ghz + 0.8, false);
    for (sd = -1; sd <= 1; sd += 2) {
      var cu_brx = xGate + sd * 3.95;
      box(siteG, 0.7, 0.1, 0.7, SH.base, cu_brx, 0.25, cu_zBr, false); box(siteG, 0.36, 1.05, 0.36, SH.white, cu_brx, 0.825, cu_zBr); box(siteG, 0.38, 0.06, 0.38, SH.red, cu_brx, 1.38, cu_zBr, false);
      box(siteG, 3.75, 0.1, 0.06, SH.white, cu_brx - sd * 1.875, 1.15, cu_zBr + 0.21, false);
      for (i = 0; i < 4; i++) box(siteG, 0.45, 0.105, 0.065, SH.red, cu_brx - sd * (0.6 + i * 0.9), 1.15, cu_zBr + 0.21, false);
    }
    // curtea: banda de circulatie de 6 m, parcare cu locuri de 2,5 x 5 m, rampa de incarcare
    var xF = xO - 4, cu_nBay = huge ? 26 : big ? 12 : 6, nCar = huge ? 11 : big ? 6 : 3, cu_bw = 2.5, cu_bl = 5, xP1 = xF - 1.6, cu_xPa = xP1 - 1.2, xP0 = cu_xPa - cu_nBay * cu_bw;
    var cu_zLn = D / 2 + 11.6, cu_zP0 = D / 2 + 14.6, zP = cu_zP0 + cu_bl / 2, cu_zSw = cu_zP0 + cu_bl + 0.15, cu_zStop = cu_zP0 + cu_bl - 0.75, cu_ySw = 0.38;
    var xR = -W / 2 - 4 - genLen - 6, zN = -D / 2 - 5.4, xL0 = xR - 2.75, xL1 = xGate + 3.5;
    box(siteG, xL1 - xL0, 0.03, 6, SH.asphalt, (xL0 + xL1) / 2, 0.215, cu_zLn, false);
    box(siteG, 5.5, 0.03, D / 2 + 8.6 - (zN - 2.75), SH.asphalt, xR, 0.215, (D / 2 + 8.6 + zN - 2.75) / 2, false);                       // drumul din vest, intre generatoare si statie
    box(siteG, W / 2 + 2 - (xR + 2.75), 0.03, 5.5, SH.asphalt, (W / 2 + 2 + xR + 2.75) / 2, 0.215, zN, false);                           // drumul din nord, spre baterii
    box(siteG, xP1 - xP0, 0.03, cu_bl, SH.asphalt, (xP0 + xP1) / 2, 0.215, zP, false);
    for (i = 0; i <= cu_nBay; i++) flat(siteG, 0.1, cu_bl, SH.paint, cu_xPa - i * cu_bw, 0.236, zP);
    flat(siteG, 0.1, cu_bl, SH.paint, xP1 - 0.05, 0.236, zP);
    for (i = 0; i < 5; i++) flat(siteG, 0.1, 1.5, SH.paint, xP1 - 0.6, 0.236, cu_zP0 + 0.6 + i * 0.95, 0.8);                                // culoarul hasurat de langa locul pentru persoane cu dizabilitati
    flat(siteG, 1.1, 1.1, SH.blue, cu_xPa - cu_bw / 2, 0.236, cu_zP0 + 1.3); flat(siteG, 0.5, 0.5, SH.paint, cu_xPa - cu_bw / 2, 0.238, cu_zP0 + 1.3);
    // bordura de 15 cm si trotuar in spatele parcarii, legat de trecerea de pietoni
    box(siteG, xEnt + 1.1 - xP0 + 0.15, 0.18, 0.15, SH.concrete, (xEnt + 1.1 + xP0 - 0.15) / 2, 0.29, cu_zSw - 0.075, false);
    box(siteG, xEnt + 1.1 - xP0, 0.18, 1.5, SH.floor, (xEnt + 1.1 + xP0) / 2, 0.29, cu_zSw + 0.75, false);
    box(siteG, 0.15, 0.18, cu_bl, SH.concrete, xP0 - 0.075, 0.29, zP, false); box(siteG, 0.15, 0.18, cu_bl, SH.concrete, xP1 + 0.075, 0.29, zP, false);
    box(siteG, 2.2, 0.18, cu_zSw - 0.15 - cu_zP0, SH.floor, xEnt, 0.29, (cu_zSw - 0.15 + cu_zP0) / 2, false);
    // rampa de incarcare
    box(siteG, 7, 0.03, 8.2, SH.asphalt, xD, 0.215, D / 2 + 4.5, false);
    flat(siteG, 0.2, 7.6, SH.stripe, xD - 2.6, 0.236, D / 2 + 4.5); flat(siteG, 0.2, 7.6, SH.stripe, xD + 2.6, 0.236, D / 2 + 4.5);
    box(siteG, 0.2, 0.9, 0.2, SH.stripe, xD - 2.6, 0.65, D / 2 + 0.9); box(siteG, 0.2, 0.9, 0.2, SH.stripe, xD + 2.6, 0.65, D / 2 + 0.9);
    box(siteG, 4.2, 0.02, 3.6, SH.concrete, xEnt, 0.215, D / 2 + 2.4, false);
    // masinile stau in locuri, cu rotile din fata la opritor; primul loc (dizabilitati) ramane liber
    for (i = 1, j = 0; i < cu_nBay && j < nCar; i++) if (i % 5 !== 0 && i % 5 !== 3) { car(carsG, cu_xPa - (i + 0.5) * cu_bw, cu_zStop - 1.81, j); j++; }
    truck(carsG, xD, D / 2 + 4.62);                                                                                                        // camionul, cu spatele la usa de marfa
    // oameni, ca sa se vada scara
    person(peopleG, rackPos[0] + 1.45, 0.3, rackPos[1] - 1.9); person(peopleG, xGate + 3.95, 0.2, platZ1 - 3.6); person(peopleG, xEnt + 0.7, 0.22, D / 2 + 4.6); person(peopleG, xD + 2.3, 0.23, D / 2 + 2.6);
    // stalpi de iluminat pe marginea platformei: noaptea lumineaza. Se feresc de drumul de acces, de cabina si de santul de cabluri
    var lampG = grp(root), lp = [], nl = Math.max(3, Math.round((platX1 - platX0) / 26));
    for (i = 0; i <= nl; i++) {
      var lx = platX0 + 3 + i * (platX1 - platX0 - 6) / nl, cu_lxS = lx, cu_lxN = lx;
      if (cu_lxS > xGate - 5.6 && cu_lxS < xGate + 8.6) cu_lxS = cu_lxS < xGate + 1.5 ? xGate - 6.4 : xGate + 9.2;
      if (Math.abs(cu_lxN - (-W / 2 + 3)) < 1.8) cu_lxN = -W / 2 + 1;
      lp.push([cu_lxS, platZ1 - 2.3]); lp.push([cu_lxN, platZ0 + 2.5]);
    }
    var lampI = inst(lampG, lampTpl(), lp.length), glows = new T.InstancedMesh(new T.PlaneGeometry(30, 30), SH.glow, lp.length), qFlat = new T.Quaternion().setFromAxisAngle(new T.Vector3(1, 0, 0), -Math.PI / 2);
    for (i = 0; i < lp.length; i++) {
      mtx.compose(pos.set(lp[i][0], 0.2, lp[i][1]), i % 2 ? q0 : qPi, one); lampI.setMatrixAt(i, mtx);
      mtx.compose(pos.set(lp[i][0], 0.27 + (i % 7) * 0.004, lp[i][1] + (i % 2 ? 2.2 : -2.2)), qFlat, one); glows.setMatrixAt(i, mtx);
    }
    glows.frustumCulled = false; glows.renderOrder = 2; lampG.add(glows);
    /* --- detalii de curte --- */
    // legatura cu drumul de acces, linia din mijloc, trecere de pietoni, alee spre intrare
    box(siteG, 7, 0.03, 5.6, SH.asphalt, xGate, 0.215, D / 2 + 17.3, false);
    for (var dxl = xL0 + 3; dxl < xL1 - 5; dxl += 5) if (Math.abs(dxl + 1 - xEnt) > 3 && Math.abs(dxl + 1 - xD) > 3.4 && Math.abs(dxl + 1 - xR) > 4) flat(siteG, 2, 0.12, SH.paint, dxl + 1, 0.237, cu_zLn);
    for (i = 0; i < 6; i++) flat(siteG, 3, 0.5, SH.paint, xEnt, 0.238, D / 2 + 9.1 + i * 1.0);
    flat(siteG, 2.2, 4.4, SH.floor, xEnt, 0.218, D / 2 + 6.4);
    [[-1.35, 8.3], [1.35, 8.3], [-1.35, 14.95], [1.35, 14.95]].forEach(function (c) { bollard(siteG, xEnt + c[0], D / 2 + c[1]); });
    var zcB = Math.min(perCol, nCool) * 2 + 1.2, bxE = W / 2 + 4 + coolW - 0.9;
    [-1, -0.5, 0, 0.5, 1].forEach(function (f) { bollard(siteG, bxE, f * zcB); });
    // guri de scurgere pe marginea benzii
    for (var cu_dgx = xL0 + 8; cu_dgx < xL1 - 4; cu_dgx += 24) if (Math.abs(cu_dgx - xEnt) > 2.5 && Math.abs(cu_dgx - xD) > 4) { flat(siteG, 0.62, 0.42, SH.dark, cu_dgx, 0.2365, D / 2 + 8.95); for (i = -2; i <= 2; i++) flat(siteG, 0.05, 0.34, SH.steel, cu_dgx + i * 0.11, 0.238, D / 2 + 8.95); }
    // parcare: opritoare de roti, doua statii de incarcare pentru masini electrice pe trotuar, indicator
    for (i = 0; i < cu_nBay; i++) box(siteG, 1.8, 0.1, 0.16, SH.stripe, cu_xPa - (i + 0.5) * cu_bw, 0.28, cu_zStop, false);
    for (i = 1; i <= 2; i++) {
      var evx = cu_xPa - (i + 0.5) * cu_bw;
      box(siteG, 0.28, 1.35, 0.2, SH.white, evx, cu_ySw + 0.675, cu_zSw + 0.45); box(siteG, 0.3, 0.12, 0.22, SH.green, evx, cu_ySw + 1.4, cu_zSw + 0.45, false); box(siteG, 0.16, 0.2, 0.02, SH.screen, evx, cu_ySw + 1.08, cu_zSw + 0.34, false);
      flat(siteG, 0.9, 0.5, SH.green, evx, 0.236, cu_zP0 + 0.7);
    }
    box(siteG, 0.06, 2.4, 0.06, SH.steel, xP1 + 0.6, cu_ySw + 1.2, cu_zSw + 0.4, false); box(siteG, 0.6, 0.6, 0.04, SH.blue, xP1 + 0.6, cu_ySw + 2.3, cu_zSw + 0.4, false);
    // rampa: placa de nivel, containere de deseuri pe roti
    box(siteG, 2.6, 0.03, 1.6, SH.steel, xD, 0.245, D / 2 + 1.0, false);
    if (xD - 7.6 > -W / 2 + 0.6) [[xD - 5.3, SH.green], [xD - 6.9, SH.contDark]].forEach(function (c) {
      box(siteG, 1.3, 1.05, 1.0, c[1], c[0], 0.855, D / 2 + 1.1); box(siteG, 1.36, 0.08, 1.06, SH.dark, c[0], 1.42, D / 2 + 1.1, false);
      for (sd = -1; sd <= 1; sd += 2) for (j = -1; j <= 1; j += 2) cyl(siteG, 0.065, 0.065, 0.05, SH.tire, c[0] + sd * 0.5, 0.265, D / 2 + 1.1 + j * 0.36, 8, [0, 0, Math.PI / 2], false);
    });
    // trei steaguri langa intrare, pe fundatii
    for (i = 0; i < 3; i++) {
      var fpx = xEnt + 4.2 + i * 1.7, fpz = D / 2 + 5.6;
      footing(siteG, fpx, fpz, 0.5);
      cyl(siteG, 0.035, 0.055, 8, SH.steel, fpx, 4.2, fpz, 8); sph(siteG, 0.08, SH.silver, fpx, 8.25, fpz, false, 1, 0);
      if (i === 0) { box(siteG, 0.5, 0.9, 0.02, SH.blue, fpx + 0.3, 7.55, fpz, false); box(siteG, 0.5, 0.9, 0.02, SH.stripe, fpx + 0.8, 7.55, fpz, false); box(siteG, 0.5, 0.9, 0.02, SH.red, fpx + 1.3, 7.55, fpz, false); }
      else if (i === 1) {
        box(siteG, 1.5, 0.9, 0.02, SH.flagEU, fpx + 0.8, 7.55, fpz, false);
        for (j = 0; j < 12; j++) for (sd = -1; sd <= 1; sd += 2) box(siteG, 0.06, 0.06, 0.004, SH.stripe, fpx + 0.8 + Math.cos(j * 0.5236) * 0.28, 7.55 + Math.sin(j * 0.5236) * 0.28, fpz + sd * 0.013, false);
      } else { box(siteG, 1.5, 0.9, 0.02, SH.white, fpx + 0.8, 7.55, fpz, false); box(siteG, 1.5, 0.2, 0.024, SH.stripe, fpx + 0.8, 7.25, fpz, false); }
    }
    // totem cu numele intre gard si drumul national; indicatorul de oprire sta pe dreapta celui care iese (vest), cu fata spre el
    var cu_zTt = z1 + 1.0;
    [xGate - 9.3, xGate - 6.7].forEach(function (tx) { box(siteG, 0.5, 0.2, 0.5, SH.base, tx, 0.1, cu_zTt, false); box(siteG, 0.12, 2.3, 0.12, SH.steel, tx, 1.15, cu_zTt, false); });
    box(siteG, 3.3, 0.95, 0.12, SH.trim, xGate - 8, 2.55, cu_zTt); vpl(siteG, 3.1, 0.78, SH.sign, xGate - 8, 2.55, cu_zTt + 0.07);
    cyl(siteG, 0.035, 0.035, 2.5, SH.steel, xGate - 4.1, 1.25, z1 + 2.3, 6, null, false); cyl(siteG, 0.38, 0.38, 0.04, SH.red, xGate - 4.1, 2.3, z1 + 2.26, 8, [Math.PI / 2, Math.PI / 8, 0], false); box(siteG, 0.5, 0.12, 0.01, SH.white, xGate - 4.1, 2.3, z1 + 2.235, false);
    // aleea de la poarta pentru pietoni la cabina de paza
    box(siteG, 1.3, 0.2, z1 - platZ1 + 0.4, SH.floor, xGate + cu_gw + 0.9, 0.1, (z1 + platZ1 + 0.4) / 2, false);
    // instalatii in curte (apar odata cu etapa "instalatii"): rezerva de apa pentru incendiu (100-250 m3) cu casa pompelor, hidrant, camere video, paratrasnete
    var tkR = huge ? 3.4 : big ? 3.0 : 2.5, tkH = huge ? 7 : big ? 6 : 5.2, tkx = platX1 - tkR - 0.9, tkz = -D / 2 + 1, cu_phW = big ? 4 : 3, cu_phD = big ? 6 : 4, cu_phH = big ? 3 : 2.8, phz = tkz + tkR + 1.1 + cu_phD / 2, cu_phs = phz + cu_phD / 2;
    cyl(lampG, tkR, tkR, tkH, SH.cont, tkx, 0.2 + tkH / 2, tkz, 28); cyl(lampG, 0.25, tkR + 0.08, 0.7, SH.steel, tkx, 0.2 + tkH + 0.35, tkz, 28, null, false);
    cyl(lampG, tkR + 0.15, tkR + 0.15, 0.25, SH.base, tkx, 0.32, tkz, 28, null, false);
    for (i = 1; i < 4; i++) cyl(lampG, tkR + 0.03, tkR + 0.03, 0.06, SH.steel, tkx, 0.2 + i * tkH / 4, tkz, 28, null, false);
    for (sd = -1; sd <= 1; sd += 2) box(lampG, 0.05, tkH + 0.9, 0.05, SH.steel, tkx - tkR - 0.14, 0.2 + (tkH + 0.9) / 2, tkz + sd * 0.22, false);         // scara: lonjeroane si trepte
    for (i = 1; i < tkH / 0.3; i++) box(lampG, 0.03, 0.03, 0.44, SH.steel, tkx - tkR - 0.14, 0.2 + i * 0.3, tkz, false);
    for (i = 0; i < 3; i++) box(lampG, 0.16, 0.04, 0.04, SH.steel, tkx - tkR - 0.07, 0.6 + i * (tkH - 0.6) / 2, tkz + 0.22, false);
    ao(lampG, tkR * 2, tkR * 2, tkx, 0.215, tkz, 1.5);
    box(lampG, cu_phW + 0.3, 0.1, cu_phD + 0.3, SH.base, tkx, 0.25, phz, false);
    box(lampG, cu_phW, cu_phH, cu_phD, SH.paint, tkx, 0.2 + cu_phH / 2, phz); box(lampG, cu_phW + 0.4, 0.14, cu_phD + 0.4, SH.trim, tkx, 0.27 + cu_phH, phz);
    box(lampG, 0.9, 2.0, 0.05, SH.red, tkx - 0.6, 1.3, cu_phs + 0.01, false); box(lampG, 0.7, 0.5, 0.05, SH.louver, tkx + 0.8, 2.1, cu_phs + 0.01, false);
    cyl(lampG, 0.1, 0.1, 1.5, SH.red, tkx, 0.6, tkz + tkR + 0.55, 8, [Math.PI / 2, 0, 0], false);                                                    // conducta rezervor - pompe, cu flanse
    cyl(lampG, 0.17, 0.17, 0.06, SH.red, tkx, 0.6, tkz + tkR + 0.05, 10, [Math.PI / 2, 0, 0], false); cyl(lampG, 0.17, 0.17, 0.06, SH.red, tkx, 0.6, tkz + tkR + 1.07, 10, [Math.PI / 2, 0, 0], false);
    cyl(lampG, 0.06, 0.06, 0.5, SH.red, tkx + 1.0, 0.75, cu_phs + 0.2, 8, [Math.PI / 2, 0, 0], false); cyl(lampG, 0.1, 0.1, 0.1, SH.silver, tkx + 1.0, 0.75, cu_phs + 0.48, 8, [Math.PI / 2, 0, 0], false);   // racord pentru pompieri
    var cu_hyx = tkx - cu_phW / 2 + 0.3, cu_hyz = cu_phs + 1.6;                                                                                                   // hidrant suprateran, alimentat ingropat
    cyl(lampG, 0.2, 0.2, 0.05, SH.base, cu_hyx, 0.225, cu_hyz, 10, null, false); cyl(lampG, 0.09, 0.1, 0.75, SH.red, cu_hyx, 0.6, cu_hyz, 8, null, false); sph(lampG, 0.11, SH.red, cu_hyx, 0.98, cu_hyz, false, 0.7, 0);
    cyl(lampG, 0.05, 0.05, 0.36, SH.red, cu_hyx, 0.72, cu_hyz, 6, [0, 0, Math.PI / 2], false); cyl(lampG, 0.06, 0.06, 0.04, SH.silver, cu_hyx - 0.19, 0.72, cu_hyz, 6, [0, 0, Math.PI / 2], false); cyl(lampG, 0.06, 0.06, 0.04, SH.silver, cu_hyx + 0.19, 0.72, cu_hyz, 6, [0, 0, Math.PI / 2], false);
    [[platX0 + 1.5, platZ0 + 1.5], [platX1 - 1.5, platZ0 + 1.5], [platX0 + 1.5, platZ1 - 1.5], [platX1 - 1.5, platZ1 - 1.5], [xGate - 5.2, platZ1 - 1.2]].forEach(function (c) {
      var dir = c[0] > (platX0 + platX1) / 2 ? -1 : 1;
      footing(lampG, c[0], c[1], 0.45);
      cyl(lampG, 0.05, 0.07, 5, SH.steel, c[0], 2.7, c[1], 8); box(lampG, 0.5, 0.05, 0.05, SH.steel, c[0] + dir * 0.2, 5.1, c[1], false); box(lampG, 0.34, 0.14, 0.14, SH.white, c[0] + dir * 0.4, 5.0, c[1], false);
      box(lampG, 0.22, 0.3, 0.14, SH.paint, c[0], 1.5, c[1] + 0.12, false);
    });
    var lmH = huge ? 26 : big ? 20 : 14;
    [[platX0 + 2.2, platZ0 + 7], [platX1 - 2.2, platZ0 + 7]].forEach(function (c) { footing(lampG, c[0], c[1], 0.8); cyl(lampG, 0.03, 0.14, lmH, SH.steel, c[0], 0.2 + lmH / 2, c[1], 8); });
