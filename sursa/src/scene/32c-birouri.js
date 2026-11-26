    /* --- birourile si dispeceratul (est). Peretele de est este plin: e zidul antifoc spre restul halei, deci fara ferestre acolo --- */
    // de la nord la sud: grup sanitar si chicineta + sala de sedinte, dispeceratul cu perete video, holul de la intrare cu vestiar
    var in_oa = xO + 0.125, in_ob = in_xb, in_zN = -5.2, in_zL = 4.6, in_xM = xO + 3.85, in_zW = -7.0, in_z0 = (in_zN + in_zL) / 2;
    var in_xG = Math.max(in_oa + 1.6, Math.min(in_ob - 1.6, xEnt)), in_xWd = in_xM - 0.75;
    function in_chair(x, z, bx, bz) {       // scaun; bx, bz = spre ce parte este spatarul
      box(elec, 0.46, 0.07, 0.46, SH.contDark, x, 0.78, z, false); box(elec, bx ? 0.06 : 0.44, 0.5, bx ? 0.44 : 0.06, SH.contDark, x + bx * 0.22, 1.1, z + bz * 0.22, false);
      cyl(elec, 0.03, 0.03, 0.42, SH.steel, x, 0.535, z, 6, null, false); cyl(elec, 0.25, 0.25, 0.025, SH.dark, x, 0.3125, z, 10, null, false);
    }
    function in_desk(x, z) {                // masa de dispecer cu doua ecrane, privita dinspre vest
      box(elec, 0.8, 0.04, 1.6, SH.wood, x, 1.02, z, false);
      box(elec, 0.7, 0.7, 0.04, SH.dark, x, 0.65, z - 0.74, false); box(elec, 0.7, 0.7, 0.04, SH.dark, x, 0.65, z + 0.74, false);
      for (var q = -1; q <= 1; q += 2) {
        box(elec, 0.035, 0.36, 0.6, SH.dark, x + 0.24, 1.37, z + q * 0.33, false); box(elec, 0.01, 0.31, 0.55, SH.screen, x + 0.218, 1.37, z + q * 0.33, false);
        box(elec, 0.05, 0.16, 0.05, SH.dark, x + 0.27, 1.12, z + q * 0.33, false); box(elec, 0.2, 0.015, 0.24, SH.dark, x + 0.27, 1.047, z + q * 0.33, false);
      }
      box(elec, 0.15, 0.02, 0.44, SH.dark, x - 0.12, 1.05, z, false);
      in_chair(x - 0.82, z, -1, 0);
    }
    function in_glassX(z, xa, xb) {         // perete de sticla pe x, cu rama sus si montanti
      var q, n = Math.max(1, Math.round((xb - xa) / 1.5));
      box(partG, xb - xa, 2.4, 0.03, SH.contain, (xa + xb) / 2, 1.5, z, false); box(partG, xb - xa, 0.06, 0.08, SH.trim, (xa + xb) / 2, 2.73, z, false);
      for (q = 0; q <= n; q++) box(partG, 0.05, 2.4, 0.07, SH.trim, xa + q * (xb - xa) / n, 1.5, z, false);
    }
    function in_plant(x, z) { cyl(elec, 0.22, 0.17, 0.45, SH.base, x, 0.525, z, 10, null, false); sph(elec, 0.4, SH.hedge, x, 1.15, z, false, 1.25); }

    // pereti interiori: sanitar | sala de sedinte, peretele sanitarului cu usa, sticla la sala de sedinte si intre dispecerat si hol
    box(partG, 0.12, 2.7, in_zN - in_za, SH.wallIn, in_xM, 1.65, (in_zN + in_za) / 2);
    box(partG, in_xWd - 0.5 - in_oa, 2.7, 0.12, SH.wallIn, (in_xWd - 0.5 + in_oa) / 2, 1.65, in_zW); box(partG, in_xM - 0.06 - in_xWd - 0.5, 2.7, 0.12, SH.wallIn, (in_xM - 0.06 + in_xWd + 0.5) / 2, 1.65, in_zW);
    box(partG, 1.0, 0.5, 0.12, SH.wallIn, in_xWd, 2.75, in_zW);
    box(partG, 0.9, 2.18, 0.05, SH.white, in_xWd, 1.4, in_zW, false); box(partG, 0.14, 0.03, 0.13, SH.trim, in_xWd + 0.32, 1.33, in_zW, false);
    for (sd = -1; sd <= 1; sd += 2) box(partG, 0.05, 2.2, 0.16, SH.trim, in_xWd + sd * 0.475, 1.4, in_zW, false);
    box(partG, 0.4, 2.7, 0.12, SH.wallIn, in_xM + 0.14, 1.65, in_zN);
    in_glassX(in_zN, in_xM + 1.4, in_ob);
    box(partG, 0.96, 2.3, 0.03, SH.contain, in_xM + 0.87, 1.45, in_zN, false); box(partG, 1.06, 0.06, 0.08, SH.trim, in_xM + 0.87, 2.73, in_zN, false); box(partG, 0.03, 0.4, 0.09, SH.trim, in_xM + 1.25, 1.35, in_zN, false);
    in_glassX(in_zL, in_oa, in_xG - 0.6); in_glassX(in_zL, in_xG + 0.6, in_ob);
    box(partG, 1.1, 2.3, 0.03, SH.contain, in_xG, 1.45, in_zL, false); box(partG, 1.2, 0.06, 0.08, SH.trim, in_xG, 2.73, in_zL, false); box(partG, 0.03, 0.4, 0.09, SH.trim, in_xG + 0.42, 1.35, in_zL, false);

    // grupul sanitar: doua cabine cu vas si rezervor, lavoar
    for (i = 0; i < 2; i++) {
      ux = in_oa + 0.6 + i * 1.2;
      box(partG, 0.04, 2.0, 1.45, SH.white, in_oa + 1.2 + i * 1.2, 1.3, in_za + 0.725, false);
      box(partG, 1.16, 2.0, 0.04, SH.white, ux, 1.3, in_za + 1.45, false); box(partG, 0.03, 0.12, 0.07, SH.trim, ux + 0.42, 1.35, in_za + 1.45, false);
      cyl(elec, 0.2, 0.15, 0.4, SH.white, ux, 0.5, in_za + 0.43, 10); box(elec, 0.4, 0.4, 0.22, SH.white, ux, 0.9, in_za + 0.12);
      box(elec, 0.36, 0.03, 0.38, SH.dark, ux, 0.715, in_za + 0.43, false);
    }
    box(elec, 0.9, 0.14, 0.45, SH.white, in_oa + 3.0, 1.13, in_za + 0.24); box(elec, 0.3, 0.76, 0.25, SH.white, in_oa + 3.0, 0.68, in_za + 0.15);
    cyl(elec, 0.015, 0.015, 0.18, SH.steel, in_oa + 3.0, 1.29, in_za + 0.08, 6, null, false); box(elec, 0.03, 0.03, 0.14, SH.steel, in_oa + 3.0, 1.37, in_za + 0.14, false);

    // chicineta, lipita de peretele sanitarului: frigider, blat cu chiuveta, espressor, masa inalta
    box(elec, 0.62, 1.85, 0.62, SH.silver, in_oa + 0.4, 1.225, in_zW + 0.39);
    box(elec, 1.6, 0.88, 0.6, SH.white, in_oa + 1.55, 0.74, in_zW + 0.37); box(elec, 1.66, 0.04, 0.64, SH.dark, in_oa + 1.55, 1.2, in_zW + 0.39, false);
    box(elec, 0.45, 0.012, 0.36, SH.steel, in_oa + 1.95, 1.226, in_zW + 0.4, false); cyl(elec, 0.015, 0.015, 0.2, SH.steel, in_oa + 1.95, 1.32, in_zW + 0.16, 6, null, false); box(elec, 0.03, 0.03, 0.14, SH.steel, in_oa + 1.95, 1.41, in_zW + 0.22, false);
    box(elec, 0.28, 0.36, 0.32, SH.dark, in_oa + 1.05, 1.4, in_zW + 0.32, false);
    cyl(elec, 0.38, 0.38, 0.04, SH.wood, in_oa + 1.1, 1.38, in_zN - 0.6, 14, null, false); cyl(elec, 0.035, 0.035, 1.05, SH.steel, in_oa + 1.1, 0.835, in_zN - 0.6, 6, null, false); cyl(elec, 0.24, 0.24, 0.025, SH.dark, in_oa + 1.1, 0.3125, in_zN - 0.6, 10, null, false);

    // sala de sedinte: masa de opt locuri si ecran pe perete
    var in_mx = (in_xM + in_ob) / 2 + 0.25, in_mz = (in_za + in_zN) / 2 - 0.15;
    box(elec, 2.8, 0.05, 1.1, SH.wood, in_mx, 1.035, in_mz, false); box(elec, 0.08, 0.71, 0.7, SH.dark, in_mx - 0.95, 0.655, in_mz, false); box(elec, 0.08, 0.71, 0.7, SH.dark, in_mx + 0.95, 0.655, in_mz, false);
    for (i = 0; i < 4; i++) for (sd = -1; sd <= 1; sd += 2) in_chair(in_mx + (i - 1.5) * 0.68, in_mz + sd * 0.88, 0, sd);
    box(elec, 0.05, 0.86, 1.5, SH.dark, in_ob - 0.03, 1.75, in_mz, false); box(elec, 0.012, 0.78, 1.42, SH.screen, in_ob - 0.061, 1.75, in_mz, false);

    // dispeceratul: perete video pe cadru propriu, in fata zidului de est, si doua randuri de mese cu fata spre el
    box(elec, 0.1, 1.72, 4.96, SH.dark, in_ob - 0.12, 1.86, in_z0, false); vpl(elec, 4.84, 1.6, SH.in_video, in_ob - 0.172, 1.86, in_z0, -Math.PI / 2);
    for (sd = -1; sd <= 1; sd += 2) { box(elec, 0.08, 0.72, 0.08, SH.steel, in_ob - 0.12, 0.65, in_z0 + sd * 1.8, false); box(elec, 0.4, 0.03, 0.3, SH.dark, in_ob - 0.24, 0.315, in_z0 + sd * 1.8, false); }
    for (j = 0; j < 2; j++) for (i = -1; i <= 1; i++) in_desk(in_ob - 3.0 - j * 2.5, in_z0 + i * 1.75);
    in_plant(in_oa + 0.5, in_zL - 0.5);

    // holul de la intrare: vestiar cu dulapuri si banca, canapea si masuta langa usa spre sala de date, plante
    var in_zK = in_zL + 2.2;
    box(elec, 0.5, 1.8, 3.2, SH.silver, in_ob - 0.27, 1.2, in_zK);
    for (i = 0; i <= 8; i++) box(elec, 0.012, 1.78, 0.02, SH.dark, in_ob - 0.524, 1.2, in_zK - 1.6 + i * 0.4, false);
    box(elec, 0.012, 0.02, 3.2, SH.dark, in_ob - 0.524, 1.2, in_zK, false);
    box(elec, 0.4, 0.05, 2.4, SH.wood, in_ob - 1.4, 0.765, in_zK, false); for (sd = -1; sd <= 1; sd += 2) box(elec, 0.34, 0.44, 0.05, SH.steel, in_ob - 1.4, 0.52, in_zK + sd * 0.9, false);
    box(elec, 0.75, 0.42, 1.8, SH.contDark, in_oa + 0.5, 0.51, in_zb - 1.5, false); box(elec, 0.2, 0.52, 1.8, SH.contDark, in_oa + 0.12, 0.98, in_zb - 1.5, false);
    box(elec, 0.5, 0.04, 0.9, SH.wood, in_oa + 1.45, 0.72, in_zb - 1.5, false); box(elec, 0.4, 0.4, 0.05, SH.steel, in_oa + 1.45, 0.5, in_zb - 1.85, false); box(elec, 0.4, 0.4, 0.05, SH.steel, in_oa + 1.45, 0.5, in_zb - 1.15, false);
    in_plant(in_xG - 2.3, in_zb - 0.6); in_plant(in_xG + 2.3, in_zb - 0.6);

    /* --- zona de despachetare, in sala de date, imediat dupa usa de incarcare: pereti de sticla, ca praful de carton sa nu ajunga la rackuri --- */
    (function () {
      var xl = Math.max(xE + 1.9, Math.min(xO - 3.3, xD)), sx0 = xE + 0.125, sx1 = xl + 3.0, sz0 = in_zCt + 0.75, zm = (in_zb + sz0) / 2, px, pz;
      [[sx0, xl - 1.5], [xl + 1.5, sx1]].forEach(function (s) {
        box(itx, s[1] - s[0], 2.4, 0.03, SH.contain, (s[0] + s[1]) / 2, 1.5, sz0, false); box(itx, s[1] - s[0], 0.06, 0.06, SH.steel, (s[0] + s[1]) / 2, 2.73, sz0, false);
        box(itx, 0.06, 2.46, 0.06, SH.steel, s[0] + 0.03, 1.53, sz0, false); box(itx, 0.06, 2.46, 0.06, SH.steel, s[1] - 0.03, 1.53, sz0, false);
      });
      box(itx, 0.03, 2.4, in_zb - sz0, SH.contain, sx1, 1.5, zm, false); box(itx, 0.06, 0.06, in_zb - sz0, SH.steel, sx1, 2.73, zm, false);
      box(itx, 0.06, 2.46, 0.06, SH.steel, sx1, 1.53, zm, false); box(itx, 0.06, 2.46, 0.06, SH.steel, sx1, 1.53, in_zb - 0.03, false);
      // culoarul de la usa, marcat cu galben
      flat(itx, 0.1, in_zb - sz0, SH.stripe, xl - 1.5, 0.306, zm); flat(itx, 0.1, in_zb - sz0, SH.stripe, xl + 1.5, 0.306, zm); flat(itx, 3.1, 0.1, SH.stripe, xl, 0.306, sz0);
      // paleti: cutii cu servere si un rack ambalat
      px = xl + 2.25; pz = in_zb - 0.85;
      box(itx, 1.0, 0.14, 1.3, SH.wood, px, 0.37, pz, false); box(itx, 0.75, 2.3, 1.25, SH.box, px, 1.59, pz);
      pz = in_zb - 2.4;
      box(itx, 1.0, 0.14, 1.2, SH.wood, px, 0.37, pz, false); box(itx, 0.9, 0.5, 1.1, SH.box, px, 0.69, pz); box(itx, 0.9, 0.5, 0.55, SH.box, px, 1.19, pz - 0.27);
      // masa de despachetare pe peretele salii electrice, cu un server scos din cutie
      px = sx0 + 0.45; pz = in_zb - 1.5;
      box(itx, 0.75, 0.04, 2.0, SH.wood, px, 1.2, pz, false);
      [[-0.32, -0.94], [0.32, -0.94], [-0.32, 0.94], [0.32, 0.94]].forEach(function (c) { box(itx, 0.05, 0.88, 0.05, SH.steel, px + c[0], 0.74, pz + c[1], false); });
      box(itx, 0.46, 0.09, 0.8, SH.rackAlt, px, 1.265, pz - 0.4); box(itx, 0.55, 0.3, 0.5, SH.box, px, 1.37, pz + 0.6);
      // transpalet (liza) lasat pe culoar
      px = xl - 0.7; pz = sz0 + 1.3;
      for (var q = -1; q <= 1; q += 2) { box(itx, 0.16, 0.05, 1.15, SH.stripe, px + q * 0.2, 0.385, pz, false); cyl(itx, 0.04, 0.04, 0.1, SH.dark, px + q * 0.2, 0.34, pz - 0.45, 8, [0, 0, Math.PI / 2], false); }
      box(itx, 0.56, 0.36, 0.22, SH.stripe, px, 0.56, pz + 0.68, false); cyl(itx, 0.09, 0.09, 0.14, SH.dark, px, 0.39, pz + 0.7, 10, [0, 0, Math.PI / 2], false);
      beam(itx, SH.steel, px, 0.72, pz + 0.72, px, 1.3, pz + 1.02, 0.04, false); box(itx, 0.3, 0.035, 0.035, SH.dark, px, 1.31, pz + 1.03, false);
    })();
