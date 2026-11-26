    /* --- hala centrului: capatul renovat al halei lungi. Pereti cu panouri noi pe structura veche, soclu, usi, ferestre doar la birouri, trotuarul de la sud --- */
    fatMats(); FAT_SL = BZ_SLOPE; FAT_RDG = bzRoofY(HALL, 0, 0);
    var bld = grp(root), floorG = grp(bld);
    box(floorG, W - 0.1, 0.3, D - 0.1, SH.floor, 0, 0.15, 0, false);
    wallGroup = grp(bld);
    var wg = wallGroup, wt = 0.4, offW = Math.max(5, W * 0.22), xE = -W / 2 + W * 0.28, xO = W / 2 - offW, xEnt = W / 2 - offW / 2, xD = xE + 3;
    var ha_rise = FAT_RDG - H, ha_px = -pcx, ha_pz = -pcz, ha_xT = 3;                                   // ha_xT = usa tehnicienilor, pe peretele de nord
    box(wg, W, H, wt, SH.wall, 0, H / 2, -D / 2 + wt / 2); box(wg, W, H, wt, SH.wall, 0, H / 2, D / 2 - wt / 2);
    box(wg, wt, H, D - 2 * wt, SH.wall, -W / 2 + wt / 2, H / 2, 0);
    fatTri(wg, SH.wall, -W / 2, H, D / 2, ha_rise, -1); fatTri(wg, SH.wall, -W / 2 + wt, H, D / 2, ha_rise, 1);
    // peretele antifoc dinspre restul halei (est): plin, fara goluri, urca 35 cm peste tabla si iese 30 cm in afara fatadelor
    box(wg, wt - 0.02, H, D - 2 * wt, SH.wallIn, W / 2 - wt / 2 - 0.01, H / 2, 0);
    fatTri(wg, SH.wallIn, W / 2 - wt, H, D / 2, ha_rise, -1);
    for (sd = -1; sd <= 1; sd += 2) {
      fatSlope(wg, SH.wallIn, W / 2 - wt, W / 2 - 0.02, 0, D / 2 + 0.3, sd, 0.6, 0.35, true);
      fatSlope(wg, SH.trim, W / 2 - wt - 0.04, W / 2 - 0.005, 0, D / 2 + 0.33, sd, 0.035, 0.385, false);       // sortul de tabla de pe coronament
    }
    // soclul vechi de beton, cu sort nou de tabla deasupra; se intrerupe la usi si la locurile lasate pentru dulapurile de cabluri
    function ha_run(gaps, fn) {
      var xs = -W / 2, q, xe; gaps.sort(function (a, b) { return a[0] - b[0]; });
      for (q = 0; q <= gaps.length; q++) { xe = q < gaps.length ? gaps[q][0] : W / 2; if (xe - xs > 0.05) fn(xs, xe); if (q < gaps.length) xs = gaps[q][1]; }
    }
    function ha_plinth(zw, s, gaps) {
      ha_run(gaps, function (xa, xb) {
        box(wg, xb - xa, 0.6, 0.07, SH.base, (xa + xb) / 2, 0.5, zw + s * 0.035, false);
        box(wg, xb - xa, 0.045, 0.1, SH.trim, (xa + xb) / 2, 0.822, zw + s * 0.05, false);
      });
    }
    ha_plinth(D / 2, 1, [[xD - 1.66, xD + 1.66], [xEnt - 1.0, xEnt + 1.0]]);
    ha_plinth(-D / 2, -1, [[xInG - 1.25, xInG + 1.25], [xInB - 1.25, xInB + 1.25], [ha_xT - 0.57, ha_xT + 0.57]]);
    box(wg, 0.07, 0.8, D + 0.14, SH.base, -W / 2 - 0.035, 0.4, 0, false); box(wg, 0.1, 0.045, D + 0.2, SH.trim, -W / 2 - 0.05, 0.822, 0, false);
    // coltare noi la capatul dinspre calea ferata si profil de imbinare cu restul halei (pe nord lasa libera banda tevilor de apa racita)
    for (sd = -1; sd <= 1; sd += 2) {
      box(wg, 0.16, H - 0.845, 0.16, SH.trim, -W / 2 + 0.05, (H + 0.845) / 2, sd * (D / 2 - 0.05), false);
      if (sd > 0) box(wg, 0.12, H - 0.845, 0.03, SH.trim, W / 2 - 0.06, (H + 0.845) / 2, D / 2 + 0.015, false);
      else { box(wg, 0.12, 1.35, 0.03, SH.trim, W / 2 - 0.06, 1.52, -D / 2 - 0.015, false); box(wg, 0.12, H - 3.6, 0.03, SH.trim, W / 2 - 0.06, (H + 3.6) / 2, -D / 2 - 0.015, false); }
    }

    /* --- peretele de sud: intrarea birourilor, ferestre, usa de incarcare, firma --- */
    // usa sectionala de incarcare de 3 x 3,5 m, cu toc, copertina pe tiranti si lampa
    vpl(wg, 3.0, 3.5, SH.haDoor, xD, 2.05, D / 2 + 0.03);
    box(wg, 3.0, 0.09, 0.075, SH.trim, xD, 0.345, D / 2 + 0.04, false);
    for (sd = -1; sd <= 1; sd += 2) {
      box(wg, 0.16, 3.66, 0.14, SH.trim, xD + sd * 1.58, 2.13, D / 2 + 0.07, false);
      beam(wg, SH.steel, xD + sd * 1.75, 4.22, D / 2 + 0.95, xD + sd * 1.75, 4.95, D / 2 + 0.01, 0.03, false);
    }
    box(wg, 3.32, 0.16, 0.14, SH.trim, xD, 3.88, D / 2 + 0.07, false);
    box(wg, 3.7, 0.06, 1.0, SH.trim, xD, 4.2, D / 2 + 0.5, false);
    box(wg, 0.6, 0.06, 0.14, SH.light, xD, 4.14, D / 2 + 0.3, false);
    // intrarea birourilor: usa dubla vitrata, copertina pe tiranti, lumina, cititor de cartele
    box(wg, 1.8, 2.3, 0.05, SH.glass, xEnt, 1.45, D / 2 + 0.03, false);
    for (sd = -1; sd <= 1; sd += 2) {
      box(wg, 0.08, 2.42, 0.1, SH.trim, xEnt + sd * 0.94, 1.51, D / 2 + 0.05, false);
      box(wg, 0.03, 0.42, 0.04, SH.steel, xEnt + sd * 0.09, 1.4, D / 2 + 0.085, false);
      beam(wg, SH.steel, xEnt + sd * 1.42, 2.96, D / 2 + 1.32, xEnt + sd * 1.42, 3.85, D / 2 + 0.01, 0.03, false);
    }
    box(wg, 1.96, 0.08, 0.1, SH.trim, xEnt, 2.64, D / 2 + 0.05, false); box(wg, 0.06, 2.3, 0.08, SH.trim, xEnt, 1.45, D / 2 + 0.045, false);
    box(wg, 1.8, 0.05, 0.08, SH.trim, xEnt, 2.2, D / 2 + 0.045, false);
    box(wg, 3.0, 0.07, 1.4, SH.trim, xEnt, 2.95, D / 2 + 0.7, false);
    box(wg, 1.6, 0.025, 0.24, SH.light, xEnt, 2.905, D / 2 + 0.7, false);
    box(wg, 0.1, 0.16, 0.04, SH.trim, xEnt + 1.22, 1.45, D / 2 + 0.02, false); box(wg, 0.05, 0.03, 0.012, SH.light, xEnt + 1.22, 1.49, D / 2 + 0.045, false);
    // ferestre doar in dreptul birourilor
    [xO + 1.02, xO + 2.62, W / 2 - 2.9, W / 2 - 1.45].forEach(function (x) { fatWin(wg, x, 2.0, 1.3, 1.5, D / 2, 1); });
    // firma, intre usa de incarcare si birouri, vizibila din curtea de sud
    var ha_xS = 1.5;
    box(wg, 8.3, 2.3, 0.06, SH.trim, ha_xS, 4.9, D / 2 + 0.03, false); vpl(wg, 8, 2, SH.sign, ha_xS, 4.9, D / 2 + 0.07);
    // intrarile fibrei: doua tuburi care ies din trotuar si urca in cate o cutie de perete
    [xF, xF + 1.2].forEach(function (x) {
      box(wg, 0.3, 0.42, 0.15, SH.trim, x, 1.2, D / 2 + 0.075, false);
      cyl(wg, 0.03, 0.03, 0.8, SH.steel, x, 0.6, D / 2 + 0.135, 6, null, false);
    });

    /* --- peretele de nord (spre instalatii): o usa pentru tehnicieni, grile sus; locurile dulapurilor de cabluri si banda tevilor raman libere --- */
    fatDoor(wg, ha_xT, -D / 2, -1, true);
    // semne ale instalatiei noi de incendiu: sirene rosii la usi si buton de alarma la intrare
    [[ha_xT + 0.95, 2.3, -1], [xEnt - 1.22, 2.35, 1], [xD - 2.15, 2.6, 1]].forEach(function (c) { box(wg, 0.13, 0.13, 0.07, SH.red, c[0], c[1], c[2] * (D / 2 + 0.035), false); });
    box(wg, 0.09, 0.09, 0.04, SH.red, xEnt - 1.22, 1.45, D / 2 + 0.02, false);
    box(wg, 0.3, 0.12, 0.025, SH.light, xEnt, 2.76, D / 2 + 0.0125, false);
    [-3.5, 7.2].forEach(function (x) { fatLouver(wg, x, 5.3, 1.6, 0.9, -D / 2, -1, false); });
    // frontonul dinspre calea ferata: plin, cu doua grile sus pentru sala electrica
    [-5, 5].forEach(function (z) { fatLouver(wg, z, 5.2, 2.0, 1.1, -W / 2, -1, true); });

    /* --- burlane, lumini, camere, paratrasnet --- */
    var ha_dpS = [-22.4, -11.0, 6.4, 12.3], ha_dpN = [-22.4, -9.6, 0.4, 9.8];
    ha_dpS.forEach(function (x) { fatDownpipe(wg, x, D / 2, 1, H - 0.165, 0.2); flat(platG, 0.3, 0.3, SH.dark, x + ha_px, 0.204, D / 2 + 0.37 + ha_pz); });
    ha_dpN.forEach(function (x) { fatDownpipe(wg, x, -D / 2, -1, H - 0.165, 0.2); flat(platG, 0.3, 0.3, SH.dark, x + ha_px, 0.204, -D / 2 - 0.37 + ha_pz); });
    [-17, 8.9].forEach(function (x) { fatLamp(wg, x, 4.4, D / 2, 1); });
    [-20, -14.75, -5.5, 6, 14, 20].forEach(function (x) { fatLamp(wg, x, 4.4, -D / 2, -1); });
    fatCam(wg, -W / 2 + 0.5, 5.6, D / 2, 1, 1); fatCam(wg, W / 2 - 0.8, 5.6, D / 2, 1, -1); fatCam(wg, xD + 2.5, 4.7, D / 2, 1, -1);
    fatCam(wg, -W / 2 + 0.5, 5.6, -D / 2, -1, 1); fatCam(wg, W / 2 - 0.8, 5.6, -D / 2, -1, -1);
    // coborarile paratrasnetului la cele patru colturi: conductor pe perete, cutie de masura, teava de protectie pana in pamant
    // (pe nord, coborarea dinspre est sta la x = ha_xLN, inainte de banda tevilor de apa racita)
    var ha_xLW = -W / 2 + 0.2, ha_xLE = W / 2 - 0.55, ha_xLN = xCW - 1.1;
    [[ha_xLW, 1], [ha_xLE, 1], [ha_xLW, -1], [ha_xLN, -1]].forEach(function (c) {
      var x = c[0], s = c[1], y;
      box(wg, 0.014, H - 0.17 - 1.49, 0.014, SH.steel, x, (H - 0.17 + 1.49) / 2, s * (D / 2 + 0.03), false);
      for (y = 2.4; y < H - 0.5; y += 1.4) box(wg, 0.03, 0.03, 0.03, SH.steel, x, y, s * (D / 2 + 0.015), false);
      box(wg, 0.12, 0.18, 0.15, SH.steel, x, 1.4, s * (D / 2 + 0.075), false);
      box(wg, 0.05, 1.11, 0.05, SH.steel, x, 0.755, s * (D / 2 + 0.125), false);
    });
    // banda de impamantare pe frontonul de vest, pe distantieri, legata la cele doua coborari
    box(wg, 0.012, 0.04, D + 0.1, SH.steel, -W / 2 - 0.041, 1.02, 0, false);
    for (i = 0; i < 9; i++) box(wg, 0.035, 0.05, 0.03, SH.steel, -W / 2 - 0.0175, 1.02, -D / 2 + 1 + i * (D - 2) / 8, false);
    for (sd = -1; sd <= 1; sd += 2) {
      box(wg, 0.26, 0.04, 0.012, SH.steel, -W / 2 + 0.085, 1.02, sd * (D / 2 + 0.041), false);
      box(wg, 0.04, 0.04, 0.1, SH.steel, -W / 2 + 0.2, 1.02, sd * (D / 2 + 0.085), false);
    }

    /* --- trotuarul de la sud si pragurile (stau pe platforma, deci in platG; coordonatele se muta cu ha_px, ha_pz) --- */
    var ha_th = Math.atan(0.1 / 1.2), ha_kb = Math.atan(0.2 / 0.8);
    // rampa usii de incarcare: de la podea (0,3) la trotuar (0,2)
    box(platG, 3.4, 0.1, 1.2 / Math.cos(ha_th), SH.concrete, xD + ha_px, 0.25 - 0.05 * Math.cos(ha_th), D / 2 + 0.6 - 0.05 * Math.sin(ha_th) + ha_pz, false, [ha_th, 0, 0]);
    // podestul intrarii, cu rampa spre parcare si pres
    box(platG, 3.2, 0.1, 1.5, SH.concrete, xEnt + ha_px, 0.25, D / 2 + 0.75 + ha_pz, false);
    box(platG, 1.2 / Math.cos(ha_th), 0.1, 1.5, SH.concrete, xEnt - 2.2 + 0.05 * Math.sin(ha_th) + ha_px, 0.25 - 0.05 * Math.cos(ha_th), D / 2 + 0.75 + ha_pz, false, [0, 0, ha_th]);
    flat(platG, 1.6, 0.7, SH.dark, xEnt + ha_px, 0.304, D / 2 + 0.55 + ha_pz);
    // pragul usii tehnicienilor, pe platforma de la nord
    box(platG, 1.5, 0.1, 1.0, SH.concrete, ha_xT + ha_px, 0.25, -D / 2 - 0.5 + ha_pz, false);
    // bordura coborata spre curtea de sud, pe unde urca masinile pe trotuar
    box(platG, 27, 0.1, 0.8 / Math.cos(ha_kb), SH.concrete, -9.5 + ha_px, 0.1 - 0.05 * Math.cos(ha_kb), D / 2 + 6.9 - 0.05 * Math.sin(ha_kb) + ha_pz, false, [ha_kb, 0, 0]);
    // trei locuri de parcare in lung, la marginea trotuarului
    var ha_zP = D / 2 + 5.25;
    [[-22.6, 2], [-3.2, 1]].forEach(function (b) {
      flat(platG, b[1] * 6, 0.1, SH.white, b[0] + b[1] * 3 + ha_px, 0.204, ha_zP - 1.25 + ha_pz);
      for (var q = 0; q <= b[1]; q++) flat(platG, 0.1, 2.4, SH.white, b[0] + q * 6 + ha_px, 0.204, ha_zP - 0.05 + ha_pz);
    });
    var ha_cg = grp(carsG); ha_cg.rotation.y = Math.PI / 2; ha_cg.position.y = -0.03;                  // masinile sunt desenate cu botul spre +z si cu rotile la 0,23: le intoarcem pe lungul trotuarului si le asezam pe beton
    car(ha_cg, -ha_zP, -19.7, 1); car(ha_cg, -ha_zP, -13.5, 3); car(ha_cg, -ha_zP, -0.3, 5);
    // stalpisori: la usa de incarcare, la coltul halei, la intrare si langa tuburile de fibra
    [[xD - 1.95, 0.5], [xD + 1.95, 0.5], [-W / 2 + 0.5, 0.8], [xEnt - 1.3, 1.85], [xEnt + 1.3, 1.85], [xF - 0.6, 0.5], [xF + 1.8, 0.5]].forEach(function (c) { bollard(platG, c[0] + ha_px, D / 2 + c[1] + ha_pz); });
    // caminele de fibra din trotuar, in dreptul celor doua intrari
    [[xF, 4], [xF + 1.2, 5.2]].forEach(function (c) { flat(platG, 0.8, 0.8, SH.base, c[0] + ha_px, 0.203, D / 2 + c[1] + ha_pz); flat(platG, 0.64, 0.64, SH.dark, c[0] + ha_px, 0.206, D / 2 + c[1] + ha_pz); });
    // suport de biciclete langa intrare
    for (i = 0; i < 3; i++) fatHoop(platG, xO + 0.3 + i * 0.7 + ha_px, 0.2, D / 2 + 1.25 + ha_pz);
    fatBike(platG, xO + 1.12 + ha_px, 0.2, D / 2 + 1.2 + ha_pz);
    // umbra de contact de la piciorul peretilor lungi
    ao(platG, W, 3.2, ha_px, 0.207, D / 2 + ha_pz, 1); ao(platG, W, 3.2, ha_px, 0.207, -D / 2 + ha_pz, 1);
    // doi oameni: unul vine de la parcare spre intrare, altul langa usa de incarcare
    person(peopleG, xEnt - 3.4, 0.2, D / 2 + 2.3); person(peopleG, xD + 2.9, 0.2, D / 2 + 1.7);
