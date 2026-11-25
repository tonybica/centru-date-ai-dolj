    // copaci la marimea reala: aliniament de plopi pe drumul national, palcuri de salcami prin camp, cativa langa curte
    var trees = [[], [], []], pjNo = [];                                  // pjNo = dreptunghiuri in care nu creste nimic: drumuri, curti, case, culoarul liniei electrice
    function pjKeep(xa, xb, za, zb) { pjNo.push([Math.min(xa, xb), Math.max(xa, xb), Math.min(za, zb), Math.max(za, zb)]); }
    function addTree(kind, x, z, s, force) {
      if (x > x0 - 6 && x < x1 + 6 && z > z0 - 6 && z < z1 + 3) return;
      if (!force) for (var q = 0; q < pjNo.length; q++) if (x > pjNo[q][0] && x < pjNo[q][1] && z > pjNo[q][2] && z < pjNo[q][3]) return;
      trees[kind].push([x, z, s, R() * 6.28, R()]);
    }
    var tkz2 = z0 - 26, fmx = cx - RR * 0.95 - 30, fmz = z0 - RR * 0.8 - 30, vx0 = cx + RR * 1.05, vz0 = z0 - RR * 1.3 - 40, wallMs = [SH.paint, SH.wallIn, SH.box, SH.white];
    var pjTkW = x0 - 16, pjTkF = fmx + 42, pjTkV = vx0 - 88;
    pjKeep(-1e6, 1e6, zRoad - 10.8, zRoad + 7.4);                         // drumul national, acostamentele si traseul fibrei
    pjKeep(-1e6, 1e6, tkz2 - 3.2, tkz2 + 3.2); pjKeep(pjTkW - 3.2, pjTkW + 3.2, tkz2, zRoad); pjKeep(pjTkF - 3.2, pjTkF + 3.2, fmz, tkz2); pjKeep(pjTkV - 3.2, pjTkV + 3.2, vz0, tkz2);
    pjKeep(fmx - 43, fmx + 80, fmz - 31, fmz + 31); pjKeep(vx0 - 94, vx0 + 94, vz0 - 50, vz0 + 20);
    pjKeep(-1e6, x0, zSub - 16, zSub + 16);                               // sub linia electrica nu cresc copaci
    var pjStep = huge ? 16 : 12, pjN = Math.min(Q.lite ? 44 : 72, Math.ceil(Math.min(RR * 5, 1400) / pjStep));
    for (i = 0; i < pjN; i++) {
      var txx = cx + (i - (pjN - 1) / 2) * pjStep + (R() - 0.5) * 1.2;
      addTree(0, txx, zRoad + 8.8, 0.85 + R() * 0.3, true); addTree(0, txx + pjStep / 2, zRoad - 12.2, 0.85 + R() * 0.3, true);
    }
    for (i = 0; i < (Q.lite ? 18 : 26); i++) {
      var ang = R() * 6.28, rad = RR * (1.25 + R() * 3.2), gxx = cx + Math.cos(ang) * rad, gzz = cz + Math.sin(ang) * rad, nn = 3 + Math.floor(R() * 5);
      for (j = 0; j < nn; j++) addTree(1, gxx + (R() - 0.5) * 30, gzz + (R() - 0.5) * 30, 0.75 + R() * 0.5);
    }
    for (i = 0; i < 5; i++) addTree(2, x1 + 8 + (R() - 0.5) * 3, z1 - 6 - i * 7, 0.8 + R() * 0.3, true);
    // gard viu in spatele gardului dinspre drum
    function hedgeRun(xa, xb) { for (var hx = xa; hx < xb - 2; hx += 9) { var hl = Math.min(8.4, xb - hx), hh = 1.1 + R() * 0.4; box(fenceG, hl, hh, 0.9 + R() * 0.2, SH.hedge, hx + hl / 2, hh / 2, z1 - 1.0); } }
    hedgeRun(x0 + 2, xGate - 14); hedgeRun(xGate + 6, x1 - 2);
    // drumuri de pamant printre parcele, o perdea de plopi, o ferma si un sat in departare
    quad(root, SH.soil, cx, 0.085, tkz2, RR * 5, 3.5, RR * 5 / 6, 0.6, false);
    quad(root, SH.soil, pjTkW, 0.085, (tkz2 + zRoad - 5.2) / 2, 3.5, zRoad - 5.2 - tkz2, 0.6, (zRoad - 5.2 - tkz2) / 6, false);
    quad(root, SH.soil, pjTkF, 0.085, (tkz2 + fmz) / 2, 3.5, tkz2 - fmz, 0.6, (tkz2 - fmz) / 6, false);
    quad(root, SH.soil, pjTkV, 0.085, (tkz2 + vz0) / 2, 3.5, tkz2 - vz0, 0.6, (tkz2 - vz0) / 6, false);
    var pjWb = Math.max(9, RR * 1.55 / (Q.lite ? 26 : 50));
    for (var tlx = cx - RR * 1.2; tlx < cx + RR * 0.35; tlx += pjWb) addTree(0, tlx + (R() - 0.5) * 2, tkz2 - 6, 0.8 + R() * 0.3, true);
    // ferma: curte de pamant, grajd, hala de utilaje, casa, doua silozuri pe placa de beton, baloti pe miriste
    quad(root, SH.soil, fmx, 0.085, fmz, 80, 56, 80 / 6, 56 / 6, false);
    casa(root, fmx - 12, fmz - 12, 30, 12, 5, SH.cont, SH.tileRoof, false, true); casa(root, fmx + 22, fmz + 2, 22, 10, 4.5, SH.contDark, SH.trim, true, true); casa(root, fmx - 22, fmz + 16, 10, 7.5, 3, SH.paint, SH.tileRoof, false);
    box(root, 13, 0.25, 7, SH.concrete, fmx + 6.8, 0.125, fmz + 18, false);
    for (i = 0; i < 2; i++) {
      var slx = fmx + 4 + i * 5.6;
      cyl(root, 2.3, 2.3, 9, SH.silver, slx, 4.75, fmz + 18, 16); cyl(root, 0.2, 2.35, 1.6, SH.silver, slx, 10.05, fmz + 18, 16);
      if (!Q.lite) { box(root, 0.45, 9.4, 0.06, SH.steel, slx, 4.95, fmz + 20.33, false); cyl(root, 0.12, 0.12, 2.6, SH.steel, slx, 1.5, fmz + 21.2, 6, [0.9, 0, 0], false); }     // scara si snecul de descarcare
    }
    beam(root, SH.steel, fmx + 4, 10.7, fmz + 18, fmx + 9.6, 10.7, fmz + 18, 0.14, false);                                                                                          // conducta de umplere dintre silozuri
    var pjHx = fmx + 62, pjHz = fmz - 4;
    quad(root, SH.crops[0], pjHx, 0.05, pjHz, 34, 50, 34 / (26 * k), 50 / (26 * k), false);
    for (i = 0; i < (Q.lite ? 6 : 12); i++) cyl(root, 0.65, 0.65, 1.25, SH.crops[0], pjHx - 11 + (i % 3) * 11 + (R() - 0.5) * 3, 0.7, pjHz - 18 + Math.floor(i / 3) * 12 + (R() - 0.5) * 3, 10, [0, R() * 0.5, Math.PI / 2]);
    for (i = 0; i < 6; i++) addTree(1, fmx - 36 + R() * 72, fmz + (R() > 0.5 ? 31.5 : -31.5) + R() * 3, 0.7 + R() * 0.35, true);
    // satul: o ulita asfaltata, case cu ferestre, usi si hornuri, curti, biserica
    quad(root, SH.asphalt, vx0, 0.09, vz0, 176, 5, 176 / 8, 5 / 8, false);
    for (i = 0; i < 16; i++) {
      var hsx = vx0 - 75 + i * 10 + (R() - 0.5) * 2, hsz = vz0 + (i % 2 ? 11 : -11) + (R() - 0.5) * 2, hsl = 8 + R() * 3, hsd = 6 + R() * 1.6, hsZ = R() > 0.5;
      casa(root, hsx, hsz, hsl, hsd, 2.9 + R() * 0.5, wallMs[Math.floor(R() * 4)], R() > 0.3 ? SH.tileRoof : SH.trim, hsZ);
      if (R() > 0.4) addTree(1, hsx + (hsZ ? hsd : hsl) / 2 + 3.5 + R() * 1.5, hsz + (i % 2 ? 9 : -9), 0.55 + R() * 0.25, true);
    }
    box(root, 5, 11, 5, SH.paint, vx0 + 12, 5.5, vz0 - 28); cyl(root, 0.1, 3.4, 6, SH.trim, vx0 + 12, 14, vz0 - 28, 4, [0, Math.PI / 4, 0]);
    box(root, 0.12, 1.5, 0.12, SH.silver, vx0 + 12, 17.6, vz0 - 28); box(root, 0.8, 0.12, 0.12, SH.silver, vx0 + 12, 17.85, vz0 - 28);                               // crucea
    casa(root, vx0 + 12, vz0 - 39, 16, 8, 6, SH.paint, SH.tileRoof, true);
    // drumul national: borne, stalpisori albi de dirijare, indicatoare inaintea accesului
    if (!Q.lite) for (i = -14; i <= 14; i++) for (sd = -1; sd <= 1; sd += 2) {
      var dlx = cx + i * 50 + 25; if (sd < 0 && Math.abs(dlx - xGate) < 9) continue;
      box(root, 0.12, 1.0, 0.05, SH.white, dlx, 0.5, zRoad + sd * 5.15); box(root, 0.125, 0.16, 0.055, SH.trim, dlx, 0.78, zRoad + sd * 5.15);
    }
    borna(root, xGate + 60, zRoad + 5.6); borna(root, xGate - 940, zRoad + 5.6);
    semn(root, xGate - 150, zRoad + 5.7, 0, -1); semn(root, xGate + 150, zRoad - 5.7, 0, 1);
    semn(root, xGate - 260, zRoad + 5.7, 1, -1); semn(root, xGate + 260, zRoad - 5.7, 1, 1);
    // masini pe drumul national, fiecare pe banda ei: spre est pe banda din sud, spre vest pe banda din nord
    var roadG = grp(root); roadG.rotation.y = Math.PI / 2; roadG.position.y = -0.1;
    car(roadG, -(zRoad + 1.75), cx - RR * 0.7, 4); car(roadG, -(zRoad + 1.75), cx + RR * 0.38, 1); truck(roadG, -(zRoad + 1.75), cx + RR * 0.95);
    ['poplar', 'broad', 'conifer'].forEach(function (name, kd) {
      var list = trees[kd]; if (!list.length) return;
      var im = inst(root, treeTpl(name), list.length);
      list.forEach(function (t, n) {
        qq.setFromAxisAngle(yAx, t[3]); mtx.compose(pos.set(t[0], 0, t[1]), qq, sc.set(t[2], t[2] * (0.92 + t[4] * 0.16), t[2])); im.setMatrixAt(n, mtx);
        im.setColorAt(n, tc.setHSL(0.24 + t[4] * 0.07 - (kd === 2 ? 0.02 : 0), 0.42 + t[4] * 0.14, (kd === 2 ? 0.2 : kd === 0 ? 0.3 : 0.27) + t[4] * 0.08));
      });
      im.instanceColor.needsUpdate = true;
    });
    // umbre moi de nori: pete intunecate care plutesc deasupra campusului (o singura plasa pe nor)
    var cloudG = grp(root);
    for (i = 0; i < 7; i++) {
      var cr2 = RR * (0.2 + R() * 0.2), cgA = new T.PlaneGeometry(2, 2), cgB = new T.PlaneGeometry(2, 2), cd1 = cr2 * (0.55 + R() * 0.3), cox = cr2 * (0.3 + R() * 0.4), coz = cr2 * (R() - 0.5) * 0.6;
      cgA.rotateX(-Math.PI / 2); cgA.scale(cr2, 1, cd1); cgB.rotateX(-Math.PI / 2); cgB.scale(cr2 * 0.7, 1, cr2 * 0.5); cgB.translate(cox, 0.05, coz);
      var cgeo = new T.BufferGeometry(), cpa = cgA.attributes, cpb = cgB.attributes;
      cgeo.setAttribute('position', new T.BufferAttribute(new Float32Array(Array.prototype.slice.call(cpa.position.array).concat(Array.prototype.slice.call(cpb.position.array))), 3));
      cgeo.setAttribute('normal', new T.BufferAttribute(new Float32Array(Array.prototype.slice.call(cpa.normal.array).concat(Array.prototype.slice.call(cpb.normal.array))), 3));
      cgeo.setAttribute('uv', new T.BufferAttribute(new Float32Array(Array.prototype.slice.call(cpa.uv.array).concat(Array.prototype.slice.call(cpb.uv.array))), 2));
      cgeo.setIndex(Array.prototype.slice.call(cgA.index.array).concat(Array.prototype.slice.call(cgB.index.array).map(function (v) { return v + 4; })));
      cgA.dispose(); cgB.dispose();
      var cm = new T.Mesh(cgeo, SH.cloud); cm.renderOrder = 3; cm.frustumCulled = false;
      cm.position.set(cx + (R() * 2 - 1) * RR * 1.5, H + 4 + i * 0.12, cz + (R() * 2 - 1) * RR * 1.0);
      cm.userData.v = (5 + R() * 5) * k; cloudG.add(cm); clouds.push(cm);
    }
