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
    /* --- detalii de curte --- */
    // legatura cu drumul de acces, linia din mijloc, trecere de pietoni, alee spre intrare
    box(siteG, 7, 0.03, 5.6, SH.asphalt, xGate, 0.215, D / 2 + 17.3, false);
    for (var dxl = xL0 + 3; dxl < xL1 - 5; dxl += 5) if (Math.abs(dxl + 1 - xEnt) > 3 && Math.abs(dxl + 1 - xD) > 3.4 && Math.abs(dxl + 1 - xR) > 4) flat(siteG, 2, 0.12, SH.paint, dxl + 1, 0.237, D / 2 + 11.6);
    for (i = 0; i < 6; i++) flat(siteG, 3, 0.5, SH.paint, xEnt, 0.238, D / 2 + 9.1 + i * 1.0);
    flat(siteG, 2.2, 4.4, SH.floor, xEnt, 0.218, D / 2 + 6.4); flat(siteG, 2.2, 1.7, SH.floor, xEnt, 0.218, D / 2 + 15.45);
    if (xEnt - 1.1 > xP1 + 0.2) flat(siteG, xEnt - 1.1 - xP1, 1.4, SH.floor, (xEnt - 1.1 + xP1) / 2, 0.218, D / 2 + 15.6);
    [[-1.35, 8.3], [1.35, 8.3], [-1.35, 14.9], [1.35, 14.9]].forEach(function (c) { bollard(siteG, xEnt + c[0], D / 2 + c[1]); });
    var zcB = Math.min(perCol, nCool) * 2 + 1.2, bxE = W / 2 + 4 + coolW - 0.9;
    [-1, -0.5, 0, 0.5, 1].forEach(function (f) { bollard(siteG, bxE, f * zcB); });
    // parcare: opritoare de roti, doua statii de incarcare pentru masini electrice, indicator
    for (i = 0; i < nBay2; i++) box(siteG, 1.7, 0.12, 0.18, SH.base, xP1 - (i + 0.5) * 2.9, 0.29, zP + 2.65, false);
    for (i = 0; i < 2; i++) {
      var evx = xP1 - (i + 1) * 2.9;
      box(siteG, 0.28, 1.35, 0.2, SH.white, evx, 0.9, zP + 3.2); box(siteG, 0.3, 0.12, 0.22, SH.green, evx, 1.62, zP + 3.2, false); box(siteG, 0.16, 0.2, 0.02, SH.screen, evx, 1.3, zP + 3.09, false);
    }
    box(siteG, 0.06, 2.6, 0.06, SH.steel, xP1 + 0.4, 1.5, D / 2 + 16.7, false); box(siteG, 0.6, 0.6, 0.04, SH.blue, xP1 + 0.4, 2.6, D / 2 + 16.7, false);
    // rampa: placa de nivel, containere de deseuri
    box(siteG, 2.6, 0.03, 1.6, SH.steel, xD, 0.245, D / 2 + 1.0, false);
    if (xD - 7.6 > -W / 2 + 0.6) {
      box(siteG, 1.3, 1.1, 1.0, SH.green, xD - 5.3, 0.8, D / 2 + 1.1); box(siteG, 1.36, 0.08, 1.06, SH.dark, xD - 5.3, 1.38, D / 2 + 1.1, false);
      box(siteG, 1.3, 1.1, 1.0, SH.contDark, xD - 6.9, 0.8, D / 2 + 1.1); box(siteG, 1.36, 0.08, 1.06, SH.dark, xD - 6.9, 1.38, D / 2 + 1.1, false);
    }
    // trei steaguri langa intrare
    for (i = 0; i < 3; i++) {
      var fpx = xEnt + 4.2 + i * 1.7, fpz = D / 2 + 5.6;
      cyl(siteG, 0.035, 0.055, 8, SH.steel, fpx, 4.2, fpz, 8); sph(siteG, 0.08, SH.silver, fpx, 8.25, fpz, false, 1, 0);
      if (i === 0) { box(siteG, 0.5, 0.9, 0.02, SH.blue, fpx + 0.3, 7.55, fpz, false); box(siteG, 0.5, 0.9, 0.02, SH.stripe, fpx + 0.8, 7.55, fpz, false); box(siteG, 0.5, 0.9, 0.02, SH.red, fpx + 1.3, 7.55, fpz, false); }
      else if (i === 1) {
        box(siteG, 1.5, 0.9, 0.02, SH.flagEU, fpx + 0.8, 7.55, fpz, false);
        for (j = 0; j < 12; j++) for (sd = -1; sd <= 1; sd += 2) box(siteG, 0.06, 0.06, 0.004, SH.stripe, fpx + 0.8 + Math.cos(j * 0.5236) * 0.28, 7.55 + Math.sin(j * 0.5236) * 0.28, fpz + sd * 0.013, false);
      } else { box(siteG, 1.5, 0.9, 0.02, SH.white, fpx + 0.8, 7.55, fpz, false); box(siteG, 1.5, 0.2, 0.024, SH.stripe, fpx + 0.8, 7.25, fpz, false); }
    }
    // totem cu numele la iesirea in drumul national, indicator de oprire
    box(siteG, 0.12, 2.2, 0.12, SH.steel, xGate - 8.3, 1.1, zB - 1.5, false); box(siteG, 0.12, 2.2, 0.12, SH.steel, xGate - 5.7, 1.1, zB - 1.5, false);
    box(siteG, 3.3, 0.95, 0.12, SH.trim, xGate - 7, 2.55, zB - 1.5); vpl(siteG, 3.1, 0.78, SH.sign, xGate - 7, 2.55, zB - 1.43);
    cyl(siteG, 0.035, 0.035, 2.4, SH.steel, xGate + 4.4, 1.3, zB - 2.2, 6, null, false); cyl(siteG, 0.38, 0.38, 0.04, SH.red, xGate + 4.4, 2.3, zB - 2.2, 8, [Math.PI / 2, 0, 0], false);
    // instalatii in curte (apar odata cu etapa "instalatii"): rezerva de apa pentru incendiu cu casa pompelor, camere video, paratrasnete
    var tkR = huge ? 3.4 : big ? 2.6 : 1.8, tkH = huge ? 7 : big ? 5.5 : 4.2, tkx = platX1 - 4.2, tkz = -D / 2 + 1, phz = tkz + tkR + 2.4;
    cyl(lampG, tkR, tkR, tkH, SH.cont, tkx, 0.2 + tkH / 2, tkz, 28); cyl(lampG, 0.25, tkR + 0.08, 0.7, SH.steel, tkx, 0.2 + tkH + 0.35, tkz, 28, null, false);
    cyl(lampG, tkR + 0.15, tkR + 0.15, 0.25, SH.base, tkx, 0.32, tkz, 28, null, false);
    for (i = 1; i < 4; i++) cyl(lampG, tkR + 0.03, tkR + 0.03, 0.06, SH.steel, tkx, 0.2 + i * tkH / 4, tkz, 28, null, false);
    box(lampG, 0.06, tkH, 0.4, SH.steel, tkx - tkR - 0.05, 0.2 + tkH / 2, tkz, false); ao(lampG, tkR * 2, tkR * 2, tkx, 0.215, tkz, 1.5);
    box(lampG, 3.0, 2.5, 2.6, SH.paint, tkx, 1.45, phz); box(lampG, 3.3, 0.14, 2.9, SH.trim, tkx, 2.77, phz); box(lampG, 0.9, 1.9, 0.05, SH.red, tkx - 0.6, 1.2, phz + 1.31, false); box(lampG, 0.7, 0.5, 0.05, SH.louver, tkx + 0.8, 2.0, phz + 1.31, false);
    cyl(lampG, 0.1, 0.1, 2.0, SH.red, tkx, 0.6, tkz + tkR + 0.3, 8, [Math.PI / 2, 0, 0], false);
    cyl(lampG, 0.09, 0.09, 0.7, SH.red, tkx + 2.0, 0.55, phz + 1.0, 8, null, false); cyl(lampG, 0.12, 0.12, 0.12, SH.red, tkx + 2.0, 0.93, phz + 1.0, 8, null, false);
    [[platX0 + 1.5, platZ0 + 1.5], [platX1 - 1.5, platZ0 + 1.5], [platX0 + 1.5, platZ1 - 1.5], [platX1 - 1.5, platZ1 - 1.5], [xGate - 5.2, platZ1 - 1.2]].forEach(function (c) {
      var dir = c[0] > (platX0 + platX1) / 2 ? -1 : 1;
      cyl(lampG, 0.05, 0.07, 5, SH.steel, c[0], 2.7, c[1], 8); box(lampG, 0.5, 0.05, 0.05, SH.steel, c[0] + dir * 0.2, 5.1, c[1], false); box(lampG, 0.34, 0.14, 0.14, SH.white, c[0] + dir * 0.4, 4.98, c[1], false);
    });
    var lmH = huge ? 26 : big ? 20 : 14;
    [[platX0 + 2.2, platZ0 + 7], [platX1 - 2.2, platZ0 + 7]].forEach(function (c) { cyl(lampG, 0.03, 0.14, lmH, SH.steel, c[0], 0.2 + lmH / 2, c[1], 8); });
