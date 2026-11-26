    // interior: sala electrica (vest), sala de date (mijloc), birouri si dispecerat (est)
    var partG = grp(bld), elec = grp(bld), itg = grp(bld), itx = grp(itg);
    var in_za = -D / 2 + wt, in_zb = D / 2 - wt, in_xa = -W / 2 + wt, in_xb = W / 2 - wt;      // fetele dinauntru ale peretilor halei
    // cate rackuri cere puterea: perechi de randuri spate in spate (culoar cald la mijloc)
    var nGpu = Math.ceil(p.it * 1000 / 45), nAll = nGpu + Math.ceil(nGpu * 0.3);
    var hallW = xO - xE - 3, hallD = D - 5, perRowMax = Math.max(2, Math.min(24, Math.floor(hallD / 0.62)));
    var pairs = Math.max(1, Math.ceil(nAll / (2 * perRowMax))); while (pairs * 5.4 > hallW && pairs > 1) pairs--;
    var perRow = Math.ceil(nAll / (pairs * 2));
    var in_zCt = perRow * 0.31 + 1.0, in_dEl = 3.2, in_dOf = 5.6;                              // z-ul jgheabului care leaga sala electrica de randuri; usile din peretii despartitori
    /* --- unelte comune pentru cele trei incaperi --- */
    function in_mats() {                    // materialele proprii: inscriptia de pe podea si imaginea peretelui video
      if (SH.in_grow) return;
      var fam = 'px "Barlow Semi Condensed", "Arial Narrow", Arial, sans-serif';
      SH.in_grow = M(0xffffff, { map: canvasTex(512, 256, function (g, w, h) {
        g.clearRect(0, 0, w, h); g.fillStyle = '#00826a'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.font = '600 100' + fam; var fs = Math.min(100, 100 * (w - 30) / g.measureText('LOC PENTRU').width);
        g.font = '600 ' + fs.toFixed(1) + fam; g.fillText('LOC PENTRU', w / 2, 128 - fs * 0.56); g.fillText('EXTINDERE', w / 2, 128 + fs * 0.56);
      }, { repeat: false, keep: true }), transparent: true, depthWrite: false, roughness: 0.9, env: 0.4 });
      THERM.push({ m: SH.in_grow, hot: 0x3b3a9a, base: 0xffffff, map: SH.in_grow.map });
      SH.in_video = new T.MeshBasicMaterial({ toneMapped: false, map: canvasTex(1024, 340, function (g, w, h) {      // 4 x 2 ecrane: grafice, harta rackurilor, stari
        var cw = w / 4, ch = h / 2, R2 = rng(5), a, b, q, x, y, cols = ['#35e08a', '#7fd6ff', '#f2a600', '#ff6a4a'];
        g.fillStyle = '#05080a'; g.fillRect(0, 0, w, h);
        for (a = 0; a < 4; a++) for (b = 0; b < 2; b++) {
          x = a * cw + 5; y = b * ch + 5; var tw = cw - 10, th = ch - 10, kind = (a + b * 2) % 4;
          g.fillStyle = '#0f1b24'; g.fillRect(x, y, tw, th); g.fillStyle = '#1c3040'; g.fillRect(x, y, tw, 16);
          g.fillStyle = cols[(a + b) % 3]; g.fillRect(x + 8, y + 5, 46, 6);
          if (kind === 0) { for (q = 0; q < 14; q++) { var bh = (0.3 + R2() * 0.6) * (th - 46); g.fillStyle = q === 9 ? cols[2] : cols[1]; g.fillRect(x + 14 + q * (tw - 28) / 14, y + th - 12 - bh, (tw - 28) / 14 - 4, bh); } }
          else if (kind === 1) { g.strokeStyle = cols[0]; g.lineWidth = 3; g.beginPath(); for (q = 0; q <= 24; q++) { var ly = y + th * 0.62 - Math.sin(q * 0.5 + a) * th * 0.16 - R2() * th * 0.1; if (q) g.lineTo(x + 12 + q * (tw - 24) / 24, ly); else g.moveTo(x + 12, ly); } g.stroke(); g.fillStyle = 'rgba(53,224,138,.12)'; g.fillRect(x + 12, y + th * 0.72, tw - 24, th * 0.2); }
          else if (kind === 2) { for (q = 0; q < 30; q++) { g.fillStyle = q === 17 ? cols[2] : q === 4 ? cols[1] : cols[0]; g.fillRect(x + 16 + (q % 15) * (tw - 32) / 15, y + 40 + Math.floor(q / 15) * (th - 60) / 2, (tw - 32) / 15 - 3, (th - 60) / 2 - 10); } }
          else { for (q = 0; q < 3; q++) { g.strokeStyle = '#1c3040'; g.lineWidth = 9; g.beginPath(); g.arc(x + tw * (0.2 + q * 0.3), y + th * 0.58, th * 0.24, 0, Math.PI * 2); g.stroke(); g.strokeStyle = cols[q]; g.beginPath(); g.arc(x + tw * (0.2 + q * 0.3), y + th * 0.58, th * 0.24, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (0.45 + R2() * 0.45)); g.stroke(); } }
        }
      }, { repeat: false }) });
    }
    in_mats();
    function in_wall(x, ops) {              // perete despartitor pe z, cu goluri [z0, z1, y0, y1] pentru usi, geamuri si treceri de cabluri
      var yb = 0.15, yt = 3.35, z = in_za;
      ops.sort(function (a, b) { return a[0] - b[0]; }).forEach(function (o) {
        if (o[0] > z) box(partG, 0.25, yt - yb, o[0] - z, SH.wallIn, x, (yt + yb) / 2, (z + o[0]) / 2);
        if (o[2] > 0.4) box(partG, 0.25, o[2] - yb, o[1] - o[0], SH.wallIn, x, (o[2] + yb) / 2, (o[0] + o[1]) / 2);
        if (o[3] < yt) box(partG, 0.25, yt - o[3], o[1] - o[0], SH.wallIn, x, (yt + o[3]) / 2, (o[0] + o[1]) / 2);
        z = o[1];
      });
      if (in_zb > z) box(partG, 0.25, yt - yb, in_zb - z, SH.wallIn, x, (yt + yb) / 2, (z + in_zb) / 2);
    }
    function in_door(x, z, w) {             // usa plina cu toc, intr-un perete pe z; peste 1,5 m latime are doua foi
      var q, n = w > 1.5 ? 2 : 1, lw = w / n;
      for (q = -1; q <= 1; q += 2) box(partG, 0.31, 2.2, 0.07, SH.trim, x, 1.4, z + q * (w / 2 + 0.035), false);
      box(partG, 0.31, 0.07, w + 0.14, SH.trim, x, 2.535, z, false);
      for (q = 0; q < n; q++) {
        var lz = z - w / 2 + (q + 0.5) * lw, hs = n === 2 ? (q ? -1 : 1) : 1;
        box(partG, 0.05, 2.19, lw - 0.012, SH.white, x, 1.4, lz, false);
        box(partG, 0.07, 0.55, 0.22, SH.trim, x, 1.85, lz, false);                             // vizor
        box(partG, 0.13, 0.03, 0.14, SH.trim, x, 1.33, lz + hs * (lw / 2 - 0.14), false);      // clanta, pe amandoua fetele
      }
    }
    function in_tray(g, alongX, a, b, c, w) {       // jgheab de cabluri cu margini, fundul la 2,72 (ca in sala de date)
      var len = b - a, mid = (a + b) / 2;
      if (alongX) {
        box(g, len, 0.015, w, SH.steel, mid, 2.7275, c, false); box(g, len, 0.07, 0.02, SH.steel, mid, 2.755, c - w / 2, false); box(g, len, 0.07, 0.02, SH.steel, mid, 2.755, c + w / 2, false);
        box(g, len - 0.04, 0.04, w * 0.6, SH.dark, mid, 2.755, c, false);
      } else {
        box(g, w, 0.015, len, SH.steel, c, 2.7275, mid, false); box(g, 0.02, 0.07, len, SH.steel, c - w / 2, 2.755, mid, false); box(g, 0.02, 0.07, len, SH.steel, c + w / 2, 2.755, mid, false);
        box(g, w * 0.6, 0.04, len - 0.04, SH.dark, c, 2.755, mid, false);
      }
    }
    function in_tpost(g, x, z, armX, w) {           // stalp in T cu talpa prinsa in podea; bratul duce jgheabul
      box(g, 0.08, 2.34, 0.08, SH.steel, x, 1.47, z, false); box(g, 0.24, 0.02, 0.24, SH.dark, x, 0.31, z, false);
      if (armX) box(g, w, 0.08, 0.08, SH.steel, x, 2.68, z, false); else box(g, 0.08, 0.08, w, SH.steel, x, 2.68, z, false);
    }
    function in_dash(g, xa, xb, za, zb, m) {        // contur punctat vopsit pe podea
      var q, n = Math.max(1, Math.round((xb - xa) / 0.8)), s = (xb - xa) / n;
      for (q = 0; q < n; q++) { flat(g, s * 0.6, 0.07, m, xa + (q + 0.5) * s, 0.306, za); flat(g, s * 0.6, 0.07, m, xa + (q + 0.5) * s, 0.306, zb); }
      n = Math.max(1, Math.round((zb - za) / 0.8)); s = (zb - za) / n;
      for (q = 0; q < n; q++) { flat(g, 0.07, s * 0.6, m, xa, 0.306, za + (q + 0.5) * s); flat(g, 0.07, s * 0.6, m, xb, 0.306, za + (q + 0.5) * s); }
    }
    function in_cab(x, z, w, d, h, m, east) {       // dulap pe soclu, cu fata spre sud sau spre est
      if (east) { box(elec, d - 0.06, 0.1, w - 0.04, SH.dark, x, 0.35, z, false); box(elec, d, h, w, m, x, 0.4 + h / 2, z); vpl(elec, w - 0.05, h - 0.06, SH.cabF, x + d / 2 + 0.004, 0.4 + h / 2, z, Math.PI / 2); }
      else { box(elec, w - 0.04, 0.1, d - 0.06, SH.dark, x, 0.35, z, false); box(elec, w, h, d, m, x, 0.4 + h / 2, z); vpl(elec, w - 0.05, h - 0.06, SH.cabF, x, 0.4 + h / 2, z + d / 2 + 0.004); }
    }

    /* --- sala electrica: curentul vine prin peretele de nord in tabloul general, trece prin UPS-uri si pleaca pe jgheab spre sala de date --- */
    // tabloul general de joasa tensiune, lipit de peretele de nord: primele doua sectiuni primesc cablurile de la transformatoare (x = xInG),
    // ultimele doua pe cele de la generatoare si de la panouri (x = xInB); intre ele, cupla si plecarile
    var in_nSec = Math.max(6, Math.round((xInB - xInG + 1.6) / 0.8)), in_xs = xInG - 0.8, in_sw = (xInB + 0.8 - in_xs) / in_nSec, in_zT = in_za + 0.45, ux, uz;
    for (i = 0; i < in_nSec; i++) {
      ux = in_xs + (i + 0.5) * in_sw;
      in_cab(ux, in_zT, in_sw - 0.015, 0.8, 2.1, SH.silver, false);
      if (i < 2 || i >= in_nSec - 2) {
        box(elec, in_sw - 0.12, 0.09, 0.02, i < 2 ? SH.green : SH.stripe, ux, 2.4, in_zT + 0.412, false);                 // banda colorata: verde = retea, galben = surse proprii
        // cablurile groase intra prin perete la 2,68 m si coboara in sectiune printr-o cutie cu presetupe
        box(elec, 0.5, 0.26, 0.03, SH.steel, ux, 2.68, in_za + 0.015, false); box(elec, 0.46, 0.1, 0.3, SH.steel, ux, 2.55, in_zT - 0.2, false);
        for (j = -1; j <= 1; j++) {
          cyl(elec, 0.04, 0.04, in_zT - 0.2 + D / 2 - 0.02, SH.dark, ux + j * 0.13, 2.68, (in_zT - 0.2 - D / 2 + 0.02) / 2, 8, [Math.PI / 2, 0, 0], false);
          sph(elec, 0.042, SH.dark, ux + j * 0.13, 2.68, in_zT - 0.2, false, 1, 0); cyl(elec, 0.04, 0.04, 0.1, SH.dark, ux + j * 0.13, 2.64, in_zT - 0.2, 8, null, false);
        }
      }
    }
    flat(elec, in_nSec * in_sw + 0.4, 1.0, SH.tire, in_xs + in_nSec * in_sw / 2, 0.304, in_zT + 0.4 + 0.55);                // covor electroizolant in fata tabloului
    flat(elec, in_nSec * in_sw + 0.8, 0.08, SH.stripe, in_xs + in_nSec * in_sw / 2, 0.306, in_zT + 0.4 + 1.25);

    // UPS-urile (N+1, cate 500 kVA) si dulapul lor de ocolire, in rand, cu fata spre sud; jgheabul trece prin spatele lor
    var in_nU = Math.min(3, Math.ceil(p.it / 0.5) + 1), in_zU = -4.2, in_xU = in_xa + 1.85, in_xUe = in_xU + in_nU * 1.55 + 0.85;
    for (i = 0; i < in_nU; i++) {
      ux = in_xU + 0.75 + i * 1.55;
      box(elec, 1.44, 0.1, 0.84, SH.dark, ux, 0.35, in_zU, false); box(elec, 1.5, 2.0, 0.9, SH.rackBody, ux, 1.4, in_zU);
      vpl(elec, 0.72, 1.94, SH.cabF, ux - 0.37, 1.4, in_zU + 0.454); vpl(elec, 0.72, 1.94, SH.cabF, ux + 0.37, 1.4, in_zU + 0.454);
      box(elec, 1.3, 0.05, 0.03, SH.upsLed, ux, 2.32, in_zU + 0.46, false);                                               // banda de stare: verde in mod normal, galbena la pana
      box(elec, 1.1, 0.03, 0.5, SH.louver, ux, 2.415, in_zU + 0.05, false);                                               // grila de aer cald de sus
      beam(elec, SH.dark, ux - 0.3, 2.74, in_zU - 0.75, ux - 0.3, 2.4, in_zU - 0.3, 0.1, false); beam(elec, SH.dark, ux + 0.3, 2.74, in_zU - 0.75, ux + 0.3, 2.4, in_zU - 0.3, 0.1, false);   // intrarea si iesirea de curent
    }
    ux = in_xU + in_nU * 1.55 + 0.4;
    in_cab(ux, in_zU, 0.8, 0.9, 2.0, SH.silver, false); beam(elec, SH.dark, ux, 2.74, in_zU - 0.75, ux, 2.4, in_zU - 0.3, 0.12, false);
    flat(elec, in_xUe - in_xU, 0.08, SH.stripe, (in_xU + in_xUe) / 2, 0.306, in_zU + 1.55);

    // dulapurile de baterii ale UPS-urilor (trei pentru fiecare), pe peretele de vest, cu fata spre est; jgheabul lor sta pe console de perete
    var in_nBat = in_nU * 3, in_zB = in_zU + 1.9, in_xB = in_xa + 0.45;
    for (i = 0; i < in_nBat; i++) {
      uz = in_zB + i * 0.6;
      in_cab(in_xB, uz, 0.585, 0.8, 2.0, SH.white, true);
      box(elec, 0.07, 0.34, 0.07, SH.dark, in_xB, 2.56, uz, false);                                                       // cablul urca in jgheab
    }
    in_tray(elec, false, in_zU - 0.75 + 0.2, in_zB + (in_nBat - 0.5) * 0.6, in_xB, 0.3);
    box(elec, 0.3, 0.07, 0.02, SH.steel, in_xB, 2.755, in_zB + (in_nBat - 0.5) * 0.6, false);                              // capac de capat
    for (uz = in_zU - 0.2; uz < in_zB + in_nBat * 0.6; uz += 1.5) { box(elec, 0.72, 0.05, 0.05, SH.steel, in_xa + 0.36, 2.695, uz, false); beam(elec, SH.steel, in_xa + 0.02, 2.46, uz, in_xa + 0.34, 2.68, uz, 0.035, false); }
    flat(elec, 0.08, in_nBat * 0.6 + 0.3, SH.stripe, in_xB + 1.5, 0.306, in_zB + (in_nBat - 1) * 0.3);

    // tablourile de distributie A si B (iesirile UPS-urilor spre barele din sala de date), in sud, cu fata spre sud
    var in_zD = in_zCt + 0.7, in_xD = in_xa + 2.2, in_xT = in_xs + 4.5 * in_sw;
    for (i = 0; i < 6; i++) {
      ux = in_xD + 0.4 + i * 0.8 + (i > 2 ? 0.3 : 0);
      in_cab(ux, in_zD, 0.785, 0.8, 2.1, SH.silver, false);
      beam(elec, SH.dark, ux, 2.74, in_zCt, ux, 2.5, in_zD - 0.2, 0.09, false);
    }
    flat(elec, 5.5, 0.08, SH.stripe, in_xD + 2.55, 0.306, in_zD + 0.4 + 1.2);

    // jgheaburile de sus, pe stalpi in T: in spatele UPS-urilor, coloana nord-sud de la tabloul general, si cel din sud care trece prin perete in sala de date
    in_tray(elec, true, in_xB - 0.15, in_xT + 0.2, in_zU - 0.75, 0.4);
    box(elec, 0.02, 0.07, 0.4, SH.steel, in_xB - 0.15, 2.755, in_zU - 0.75, false);
    in_tray(elec, false, in_za + 0.02, in_zCt + 0.225, in_xT, 0.4);
    in_tray(elec, true, in_xD - 0.1, xE + 0.125, in_zCt, 0.45);
    box(elec, 0.02, 0.07, 0.45, SH.steel, in_xD - 0.1, 2.755, in_zCt, false);
    box(elec, 0.3, 0.2, 0.3, SH.dark, in_xT, 2.62, in_zT, false);                                                          // plecarea din tabloul general urca in jgheab
    box(elec, 0.3, 0.06, 0.3, SH.dark, in_xT, 2.79, in_zU - 0.75, false); box(elec, 0.3, 0.06, 0.34, SH.dark, in_xT, 2.79, in_zCt, false);   // cablurile trec dintr-un jgheab in altul
    box(elec, 0.2, 0.06, 0.3, SH.dark, in_xB, 2.79, in_zU - 0.75, false);
    for (ux = in_xU + 0.775; ux < in_xUe; ux += 3.1) in_tpost(elec, ux, in_zU - 0.75, false, 0.6);
    in_tpost(elec, in_xU - 0.5, in_zU - 0.75, false, 0.6);
    [in_zT + 1.9, in_zU - 0.75, in_zU + 2.3, in_zU + 5.2, in_zCt - 2.3].forEach(function (z) { in_tpost(elec, in_xT, z, true, 0.6); });
    [in_xD + 0.05, in_xD + 2.55, in_xT, (in_xT + xE) / 2].forEach(function (x) { in_tpost(elec, x, in_zCt, false, 0.65); });
    // benzi de lumina prinse sub jgheaburi
    box(elec, 0.1, 0.04, in_zCt - in_zT - 1.9, SH.light, in_xT + 0.17, 2.62, (in_zCt + in_zT + 1.9) / 2, false);
    box(elec, in_xT - in_xU + 0.5, 0.04, 0.1, SH.light, (in_xT + in_xU - 0.5) / 2, 2.62, in_zU - 0.75 - 0.17, false);
    box(elec, (in_xT + xE) / 2 - in_xD - 0.05, 0.04, 0.1, SH.light, ((in_xT + xE) / 2 + in_xD + 0.05) / 2, 2.62, in_zCt - 0.17, false);
    // loc pastrat pentru un al doilea rand de UPS-uri, daca centrul creste
    in_dash(elec, in_xU, in_xUe, in_zU + 3.4, in_zU + 4.3, SH.green);

    // peretii despartitori: usa dubla intre sala electrica si sala de date, trecerea jgheabului (rama rosie = etansare la foc), usa si geamul dispeceratului
    in_wall(xE, [[in_dEl - 1.04, in_dEl + 1.04, 0, 2.57], [in_zCt - 0.33, in_zCt + 0.33, 2.62, 2.9]]);
    in_door(xE, in_dEl, 1.94);
    [[2.6, 0.04, 0.74, 0], [2.92, 0.04, 0.74, 0], [2.76, 0.36, 0.04, -0.35], [2.76, 0.36, 0.04, 0.35]].forEach(function (e) { box(partG, 0.29, e[1], e[2], SH.red, xE, e[0], in_zCt + e[3], false); });
    in_wall(xO, [[in_dOf - 0.57, in_dOf + 0.57, 0, 2.57], [-4.2, 3.2, 1.2, 2.45]]);
    in_door(xO, in_dOf, 1.0);
    box(partG, 0.04, 1.25, 7.4, SH.contain, xO, 1.825, -0.5, false);
    [[1.2, 0.05, 7.4, 0], [2.45, 0.05, 7.4, 0], [1.825, 1.25, 0.05, -3.7], [1.825, 1.25, 0.05, 0], [1.825, 1.25, 0.05, 3.7]].forEach(function (e) { box(partG, 0.29, e[1], e[2], SH.trim, xO, e[0], -0.5 + e[3], false); });
