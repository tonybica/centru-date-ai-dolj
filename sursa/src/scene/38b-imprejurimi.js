    /* --- imprejurimile bazei: relief, triaj, platforma chimica, strada, vecini, linia de 110 kV, orasul, nori --- */
    // Tot ce e aici sta in afara perimetrului. Obiectele vopsite simplu intra in doua plase colorate pe varfuri (im_vc aproape, cu umbra; im_vf departe),
    // ca sa coste doua desene oricate ar fi. Solul mare e o singura plasa, impinsa putin in adancime, ca nimic asezat pe el sa nu palpaie.
    peisajMats();
    var envG = grp(root);
    (function () {
      var iR = rng(4242), vc = new ImVC(), vf = new ImVC(), n, glow = [], lamps = [], noT = [];
      var yT = 0.18, yR = 0.35;                                           // fata de sus a pietrei sparte si a sinei
      function inPer(x, z, m) {                                            // punct in interiorul perimetrului, cu o margine de m metri
        var a, b, c = false, k2, d;
        for (a = 0, b = PER.length - 1; a < PER.length; b = a++) {
          if ((PER[a][1] > z) !== (PER[b][1] > z) && x < (PER[b][0] - PER[a][0]) * (z - PER[a][1]) / (PER[b][1] - PER[a][1]) + PER[a][0]) c = !c;
          var ex = PER[b][0] - PER[a][0], ez = PER[b][1] - PER[a][1]; k2 = Math.max(0, Math.min(1, ((x - PER[a][0]) * ex + (z - PER[a][1]) * ez) / (ex * ex + ez * ez)));
          d = Math.hypot(x - PER[a][0] - ex * k2, z - PER[a][1] - ez * k2); if (d < m) return true;
        }
        return c;
      }
      function keep(xa, xb, za, zb) { noT.push([xa, xb, za, zb]); }
      function gl(x, y, z, size, flatOn, col) { glow.push([x, y, z, size, flatOn, col || 0xffffff]); }

      /* relieful si petele de culoare ale solului */
      imTerrain(envG);
      for (n = 0; n < (Q.lite ? 70 : 170); n++) {
        var pa = iR() * 6.28, prd = 120 + iR() * (n % 2 ? 500 : 1300), psz = 18 + iR() * (n % 2 ? 50 : 100), ppx = cx + Math.cos(pa) * prd, ppz = cz + Math.sin(pa) * prd * 1.4;
        quad(envG, iR() > 0.5 ? SH.patchA : SH.patchB, ppx, -0.03 + n * 0.0002, ppz, psz, psz * (0.5 + iR() * 0.8), 1, 1, false);
      }

      /* triajul: 8 linii pe piatra sparta, la 4,6 m una de alta; liniile 6 si 7 sunt linia curenta si merg mai departe in ambele parti */
      var tx = [], zYa = -1290, zYb = 480, zMa = -2600, zMb = 2300, xm = (RAIL.x0 + RAIL.x1) / 2, zS0 = 212, zN0 = -1010, lad = 41.4, xml;
      for (n = 0; n < 8; n++) tx.push(RAIL.x1 - 3.5 - n * 4.6);
      xml = (tx[6] + tx[7]) / 2;
      box(envG, RAIL.x1 - RAIL.x0, 0.24, zYb - zYa, SH.gravel, xm, yT - 0.12, (zYa + zYb) / 2, false);
      box(envG, 9.4, 0.24, zYa - zMa, SH.gravel, xml, yT - 0.12, (zMa + zYa) / 2, false); box(envG, 9.4, 0.24, zMb - zYb, SH.gravel, xml, yT - 0.12, (zYb + zMb) / 2, false);
      function trk(x, za, zb) {
        quad(envG, SH.imTrk, x, yT + 0.012, (za + zb) / 2, 3.2, zb - za, 1, (zb - za) / 2.4, false);
        box(envG, 0.07, 0.15, zb - za, SH.imRail, x - 0.7175, yT + 0.095, (za + zb) / 2, false); box(envG, 0.07, 0.15, zb - za, SH.imRail, x + 0.7175, yT + 0.095, (za + zb) / 2, false);
      }
      function dia(xa, za, xb, zb) {                                       // linie oblica (diagonala macazurilor), de la z mic la z mare
        var dx = xb - xa, dz = zb - za, len = Math.sqrt(dx * dx + dz * dz), ux = dz / len, uz = -dx / len, a = batch.acc(envG, SH.imTrk, false), n0 = a.n, hw = 1.6, y = yT + 0.022, sd2;
        a.pos.push(xa - ux * hw, y, za - uz * hw, xa + ux * hw, y, za + uz * hw, xb + ux * hw, y, zb + uz * hw, xb - ux * hw, y, zb - uz * hw);
        a.nor.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0); a.uv.push(0, 0, 1, 0, 1, len / 2.4, 0, len / 2.4);
        a.idx.push(n0, n0 + 2, n0 + 1, n0, n0 + 3, n0 + 2); a.n += 4;
        for (sd2 = -1; sd2 <= 1; sd2 += 2) beam(envG, SH.imRail, xa + sd2 * ux * 0.7175, yT + 0.1, za + sd2 * uz * 0.7175, xb + sd2 * ux * 0.7175, yT + 0.1, zb + sd2 * uz * 0.7175, 0.11, false);
      }
      for (n = 0; n < 6; n++) trk(tx[n], zN0 - n * lad, zS0 + n * lad);
      trk(tx[6], zMa, zMb); trk(tx[7], zMa, zMb);
      dia(tx[0], zS0, tx[6], zS0 + 6 * lad); dia(tx[6], zN0 - 6 * lad, tx[0], zN0);
      dia(tx[6], zS0 + 6 * lad + 30, tx[7], zS0 + 7 * lad + 30); dia(tx[7], zN0 - 7 * lad - 30, tx[6], zN0 - 6 * lad - 30);            // legatura dintre cele doua linii curente
      for (n = 0; n < 6; n++) [zS0 + n * lad, zN0 - n * lad].forEach(function (zz, w) {                                              // la fiecare macaz: aparatul de manevra cu felinar
        var sx2 = tx[n] + 2.1, sz2 = zz + (w ? 6 : -6);
        vc.box(0.5, 0.25, 1.1, 0x2c2f31, sx2, yT + 0.12, sz2); vc.box(0.12, 0.9, 0.12, 0x2c2f31, sx2, yT + 0.6, sz2); vc.box(0.32, 0.36, 0.1, 0xe9e7df, sx2, yT + 1.2, sz2); vc.box(0.2, 0.2, 0.3, 0xd8b21e, sx2 + 0.3, yT + 0.3, sz2);
      });
      // semnale de iesire la capatul dinspre hala al liniilor si semnale de intrare pe linia curenta
      function semnal(x, z, face) {
        vc.box(0.6, 0.3, 0.6, 0x9a988f, x, 0.15, z); vc.cyl(0.07, 0.09, 5.2, 0x8f979b, x, 2.9, z, 6);
        vc.box(0.55, 1.5, 0.28, 0x1c1e20, x, 5.6, z); vc.box(0.8, 1.8, 0.05, 0x1c1e20, x, 5.6, z - face * 0.14);
        vc.box(0.18, 0.18, 0.06, 0xd23a2e, x, 5.95, z + face * 0.15); vc.box(0.18, 0.18, 0.06, 0x2f8f4a, x, 5.25, z + face * 0.15);
        vc.box(0.05, 4.4, 0.3, 0x8f979b, x + 0.2, 2.5, z);                                                                             // scara
      }
      for (n = 0; n < 6; n += 1) { semnal(tx[n] + 2.3, zS0 + n * lad - 22, -1); if (!Q.lite) semnal(tx[n] + 2.3, zN0 - n * lad + 22, 1); }
      semnal(tx[7] - 2.4, zS0 + 7 * lad + 60, 1); semnal(tx[7] - 2.4, zN0 - 7 * lad - 60, -1);
      // stalpi inalti de iluminat ai triajului, de o parte si de alta
      for (n = 0; n < (Q.lite ? 6 : 10); n++) {
        var mz = -900 + n * 144, mx2 = n % 2 ? RAIL.x0 - 1.6 : RAIL.x1 + 0.9, md = n % 2 ? 1 : -1;
        vc.box(1.0, 0.5, 1.0, 0x9a988f, mx2, 0.25, mz); vc.cyl(0.14, 0.26, 21.5, 0x8f979b, mx2, 11.25, mz, 8);
        vc.box(2.6, 0.12, 1.2, 0x6f7578, mx2, 22.06, mz); vc.box(2.4, 0.5, 0.25, 0x3a3f42, mx2 + md * 0.4, 22.4, mz);
        vc.box(0.5, 0.36, 0.16, 0xe8e6da, mx2 + md * 0.5, 22.4, mz - 0.7, [0.5 * md, 0, 0]); vc.box(0.5, 0.36, 0.16, 0xe8e6da, mx2 + md * 0.5, 22.4, mz + 0.7, [-0.5 * md, 0, 0]);
        gl(mx2 + md * 12, yR + 0.04, mz, 46, true); gl(mx2, 22.4, mz, 5, false);
      }
      // vagoane stationate: cisterne si vagoane acoperite, in siruri
      var wl = [[], []];
      function sir(t, z, cnt, kind) { cnt = Q.lite ? Math.ceil(cnt * 0.5) : cnt; for (var w = 0; w < cnt; w++) wl[kind].push([tx[t], z + w * 12.6, t * 7 + kind]); }
      sir(0, -262, 14, 0); sir(1, -210, 8, 1); sir(1, -40, 6, 0); sir(2, -330, 15, 0); sir(3, 33.5, 7, 1); sir(4, -520, 12, 0); sir(4, -110, 8, 1); sir(5, -240, 10, 1); sir(5, 70, 5, 0);
      [imTankTpl, imHopTpl].forEach(function (mk, kd) {
        var list = wl[kd], im, pal = kd ? [0x8a6248, 0x9a9488, 0x767d82, 0xa06c44, 0x6f6a60] : [0x9a9d9c, 0x6c7174, 0x4a4d4f, 0xc6c2b6, 0xa58464, 0xd8d5ca, 0x55606a];
        if (!list.length) return;
        im = inst(envG, mk(), list.length);
        list.forEach(function (w, m) {
          mtx.compose(pos.set(w[0], yR, w[1]), q0, one); im.setMatrixAt(m, mtx);
          im.setColorAt(m, tc.setHex(pal[iR() < 0.6 ? w[2] % pal.length : Math.floor(iR() * pal.length)]));
        });
        im.instanceColor.needsUpdate = true;
      });
      // locomotiva de manevra (diesel hidraulica, 13,7 m), cuplata la sirul de pe linia 3
      (function (lx, lz) {
        var e, s, cb = 0x2d5f9a, dk = 0x24282b;
        vc.box(2.9, 0.34, 13.1, dk, lx, yR + 1.2, lz); vc.box(2.96, 0.1, 13.0, 0xe6e4da, lx, yR + 1.42, lz);
        vc.box(2.3, 1.85, 6.6, cb, lx, yR + 2.39, lz - 3.0); vc.box(2.3, 1.55, 3.0, cb, lx, yR + 2.24, lz + 4.6);
        vc.box(2.9, 2.6, 2.7, cb, lx, yR + 2.77, lz + 1.7); vc.box(2.94, 0.75, 1.9, 0x18232b, lx, yR + 3.45, lz + 1.7); vc.box(2.1, 0.75, 2.74, 0x18232b, lx, yR + 3.45, lz + 1.7);
        vc.box(3.0, 0.14, 3.0, 0xb9bcbc, lx, yR + 4.14, lz + 1.7); vc.cyl(0.14, 0.14, 0.5, dk, lx, yR + 3.55, lz - 4.6, 6);
        for (e = -1; e <= 1; e += 2) {
          vc.box(2.9, 0.62, 0.22, 0xe0b020, lx, yR + 1.1, lz + e * 6.6); vc.box(2.4, 0.5, 3.4, dk, lx, yR + 0.68, lz + e * 4.0);
          for (s = -1; s <= 1; s += 2) { vc.cyl(0.5, 0.5, 1.56, dk, lx, yR + 0.5, lz + e * 4.0 + s * 1.1, 8, [0, 0, Math.PI / 2]); vc.box(0.3, 0.3, 0.5, dk, lx + s * 0.87, yR + 1.06, lz + e * 6.92); }
        }
      })(tx[3], 20);

      /* fasia dintre linii si gard: buruieni si santul de scurgere */
      var zd0 = z0 - 240, zd1 = z1 + 150;
      vf.box(1.7, 0.04, zd1 - zd0, 0x7a6c54, -25.8, -0.02, (zd0 + zd1) / 2);
      vf.box(0.5, 0.02, zd1 - zd0, 0x2c3026, -25.8, 0.004, (zd0 + zd1) / 2);
      for (n = 0; n < 5; n++) { var cz2 = -330 + n * 96; vf.box(1.9, 0.3, 0.4, 0x9a988f, -25.8, 0.1, cz2); vf.cyl(0.3, 0.3, 0.42, 0x1b1d1c, -25.8, 0.05, cz2, 8, [Math.PI / 2, 0, 0]); }      // podete cu tub de beton
      for (n = 0; n < (Q.lite ? 60 : 170); n++) {
        var wz = zd0 + iR() * (zd1 - zd0), wx = -27.7 + iR() * 3.4, wr = 0.35 + iR() * 0.6 + (iR() > 0.9 ? 0.8 : 0), wc = [0x5c7038, 0x6e7a3c, 0x7f8446, 0x4a5f2c, 0x8a8a52][Math.floor(iR() * 5)];
        if (Math.abs(wx + 25.8) < 0.5) wx -= 1;
        vf.sph(wr, wc, wx, wr * 0.4, wz, 0.7, 0, 0x93a05a);
      }

      /* drumul de acces de la capatul bazei si strada industriala din nord-vest */
      var xs = 232, zAc = -388, zsa = -1500, zsb = 900;
      quad(envG, SH.road, xs, 0.045, (zsa + zsb) / 2, 10, zsb - zsa, 1, (zsb - zsa) / 12, true);
      flat(envG, xs - 5 + 20, 7, SH.asphalt, (xs - 5 - 20) / 2, 0.035, zAc);
      flat(envG, 9.2, 10, SH.asphalt, 183.25, 0.03, -378.8, -0.708); flat(envG, 14, 6.5, SH.asphalt, 188, 0.032, -381.6);                    // gura portii
      flat(envG, 10, 9, SH.gravel, -22, 0.03, zAc);                                                                                           // capatul dinspre triaj: loc de intors
      keep(xs - 9, xs + 9, zsa, zsb); keep(-30, xs, zAc - 6, zAc + 6); keep(RAIL.x0 - 4, RAIL.x1 + 5, zMa, zMb); keep(358, 386, -3000, 3000);
      for (n = 0; n < 3; n++) { vc.box(0.5, 0.8, 2.0, 0xb9b6ad, -27.4, 0.4, zAc - 2.6 + n * 2.6); }                                           // parapeti de beton spre linii
      for (n = 0; n < (Q.lite ? 14 : 26); n++) lamps.push([xs - 5.6, -640 + n * (Q.lite ? 72 : 36), 0]);
      for (n = 0; n < 5; n++) lamps.push([10 + n * 38, zAc + 4.3, Math.PI / 2]);
      var lampI = inst(envG, imLampTpl(), lamps.length);
      lamps.forEach(function (l, m) {
        qq.setFromAxisAngle(yAx, l[2]); mtx.compose(pos.set(l[0], 0, l[1]), qq, one); lampI.setMatrixAt(m, mtx);
        gl(l[0] + (l[2] ? 0 : 2.4), 0.07 + (m % 5) * 0.004, l[1] - (l[2] ? 2.4 : 0), 28, true);
      });
      // cateva vehicule pe strada, fiecare pe banda ei (spre +z pe banda dinspre baza)
      function veh(x, z, kind, col, dir) {
        var w, s;
        if (kind === 0) {
          vc.box(1.8, 0.62, 4.3, col, x, 0.72, z); vc.box(1.6, 0.55, 2.3, 0x1c262e, x, 1.3, z - dir * 0.2); vc.box(1.5, 0.05, 2.0, col, x, 1.6, z - dir * 0.2);
          for (w = -1; w <= 1; w += 2) for (s = -1; s <= 1; s += 2) vc.cyl(0.33, 0.33, 0.24, 0x141618, x + s * 0.8, 0.38, z + w * 1.35, 8, [0, 0, Math.PI / 2]);
        } else {
          vc.box(2.5, 2.9, 2.3, col, x, 2.45, z + dir * 6.9); vc.box(2.3, 0.9, 0.1, 0x1c262e, x, 3.0, z + dir * 8.06); vc.box(1.0, 0.3, 15.5, 0x24282b, x, 0.95, z);
          vc.box(2.55, 2.75, 13.6, kind === 1 ? 0xe9e8e2 : 0x3d5f8a, x, 2.6, z - dir * 1.6);
          [7.0, 3.6, -5.6, -6.9, -8.2].forEach(function (o) { for (s = -1; s <= 1; s += 2) vc.cyl(0.52, 0.52, 0.34, 0x141618, x + s * 1.05, 0.57, z + dir * o, 8, [0, 0, Math.PI / 2]); });
        }
      }
      veh(xs - 1.8, -470, 0, 0xb5332b, 1); veh(xs - 1.8, -180, 1, 0x2b5596, 1); veh(xs + 1.8, -60, 0, 0xeef0f0, -1); veh(xs + 1.8, 150, 2, 0xcfc9bb, -1); veh(xs - 1.8, 230, 0, 0x30353a, 1); veh(xs + 1.8, -320, 0, 0x7d868c, -1);

      /* vecinii: curti si hale intre baza si strada, hale mai mari dincolo de strada, cateva la cele doua capete */
      function plot(m, xa, xb, za, zb) {                                   // curte: pietris (textura) sau pamant / beton (culoare simpla)
        if (m === SH.gravel || m === SH.asphalt) flat(envG, xb - xa, zb - za, m, (xa + xb) / 2, m === SH.asphalt ? 0.03 : 0.012, (za + zb) / 2); else vf.box(xb - xa, 0.06, zb - za, m, (xa + xb) / 2, -0.016, (za + zb) / 2);
      }
      function hala(x, z, len, dep, h, cw, cr, alongZ, doors) {
        var lx = alongZ ? dep : len, lz = alongZ ? len : dep;
        vc.hall(x, z, len, dep, h, cw, cr, alongZ, doors); keep(x - lx / 2 - 5, x + lx / 2 + 5, z - lz / 2 - 5, z + lz / 2 + 5);
      }
      plot(SH.gravel, 193, 226, -190, -95); plot(0x8a7b60, 193, 226, -78, 2); plot(0xb3b0a6, 193, 226, -350, -236); plot(SH.gravel, 240, 352, -560, -340); plot(0xb3b0a6, 240, 352, -290, -110);
      plot(SH.gravel, 240, 340, -70, 120); plot(0x8a7b60, 244, 330, 170, 370); plot(SH.gravel, 20, 150, -470, -400); plot(SH.gravel, 0, 130, 100, 160);
      hala(203, -150, 22, 11, 4.5, 0xd8d2c0, 0x9a4c38, true, 2); hala(213, -116, 14, 9, 3.5, 0xe4dfd0, 0x8a4434, false, 0); hala(204, -45, 26, 12, 5, 0xbfc3c4, 0x7a3f33, true, 3); hala(207, -10, 12, 9, 3.2, 0xdcd6c6, 0x9a4c38, false, 0);
      hala(205, -262, 40, 14, 6, 0xb3b8ba, 0x6f7477, true, 3); hala(207, -330, 18, 12, 4.5, 0xcfcabc, 0x7d8286, false, 2); hala(190, 66, 50, 14, 5.5, 0xcfd3cf, 0x3f7a55, true, 3);
      hala(275, -500, 60, 24, 8, 0xc4c8c9, 0x8a8f92, true, 4); hala(296, -385, 44, 20, 7, 0xd6d2c6, 0x5d6266, false, 3); hala(268, -250, 36, 18, 6.5, 0xb9bdbb, 0x9aa0a2, true, 3); hala(308, -150, 70, 26, 9, 0xd9dbd8, 0x767b7e, false, 4);
      hala(270, -20, 48, 20, 7, 0xbcc0c2, 0x8d9193, true, 3); hala(300, 80, 54, 22, 8, 0xcbc7ba, 0x4f5459, false, 3); hala(266, 215, 30, 16, 6, 0xd5d7d4, 0x9a4c38, true, 2); hala(292, 320, 60, 25, 8, 0xc2c6c7, 0x80858a, false, 4);
      hala(60, -432, 40, 16, 6, 0xcfd1ce, 0x82878a, false, 3); hala(128, -445, 30, 14, 5, 0xc9c4b6, 0x8a4434, true, 2); hala(42, 128, 50, 18, 7, 0xbfc3c4, 0x70757a, false, 3); hala(112, 138, 28, 14, 5, 0xd8d2c0, 0x8d9193, true, 2);

      /* linia de 110 kV, la 185 m de perimetru: stalpi cu zabrele de 28 m la 280 m, console pe latime, trei faze si conductor de garda */
      function stalp(b, x, z, h, ns) {
        var bw = h * 0.1, tw = h * 0.022 + 0.3, hb = h * 0.78, th = Math.max(0.14, h * 0.009), c4 = [[1, 1], [1, -1], [-1, -1], [-1, 1]], col = 0x8f979b, q, s, u, v2;
        for (q = 0; q < 4; q++) {
          b.box(th * 5, 0.5, th * 5, 0x9a988f, x + c4[q][0] * bw, 0.2, z + c4[q][1] * bw);
          b.beam(col, x + c4[q][0] * bw, 0, z + c4[q][1] * bw, x + c4[q][0] * tw, hb, z + c4[q][1] * tw, th * 1.3);
          b.beam(col, x + c4[q][0] * tw, hb, z + c4[q][1] * tw, x + c4[q][0] * tw * 0.6, h, z + c4[q][1] * tw * 0.6, th * 1.1);
        }
        for (s = 0; s < ns; s++) {
          var yA = hb * s / ns, yB = hb * (s + 1) / ns, wA = bw + (tw - bw) * s / ns, wB = bw + (tw - bw) * (s + 1) / ns;
          for (q = 0; q < 4; q++) {
            u = c4[q]; v2 = c4[(q + 1) % 4];
            b.beam(col, x + u[0] * wA, yA, z + u[1] * wA, x + v2[0] * wB, yB, z + v2[1] * wB, th);
            if (ns > 1) b.beam(col, x + v2[0] * wA, yA, z + v2[1] * wA, x + u[0] * wB, yB, z + u[1] * wB, th);
            b.beam(col, x + u[0] * wB, yB, z + u[1] * wB, x + v2[0] * wB, yB, z + v2[1] * wB, th);
          }
        }
        var arms = [[-3.8, h * 0.8], [3.0, h * 0.93], [3.8, h * 0.8]];
        arms.forEach(function (e) {
          b.beam(col, x, e[1] + h * 0.035, z, x + e[0], e[1], z, th); b.beam(col, x, e[1] - h * 0.02, z, x + e[0], e[1], z, th);
          b.cyl(0.1, 0.1, 1.4, 0x6d4a3c, x + e[0], e[1] - 0.7, z, 6);
        });
        b.cyl(0.03, 0.05, h * 0.06, col, x, h * 1.03, z, 5);
        return [[x - 3.8, h * 0.8 - 1.4], [x + 3.0, h * 0.93 - 1.4], [x + 3.8, h * 0.8 - 1.4], [x, h * 1.06]];
      }
      var xL = 372, wires = [], prev = null, zt, at;
      for (n = (Q.lite ? -4 : -5); n <= (Q.lite ? 4 : 5); n++) {
        zt = -145 + n * 280; at = stalp(Math.abs(n) <= 2 ? vc : vf, xL, zt, 28, Math.abs(n) <= 1 ? (Q.lite ? 3 : 5) : Math.abs(n) <= 2 ? 3 : 1);
        if (prev) at.forEach(function (a, m) { wireTo(wires, new T.Vector3(prev.a[m][0], prev.a[m][1], prev.z), new T.Vector3(a[0], a[1], zt), m === 3 ? 5 : 7.5, Math.abs(n) <= 3 ? 12 : 6); });
        prev = { a: at, z: zt };
      }
      wireFlush(envG, wires);

      /* platforma chimica de dincolo de calea ferata: drum de uzina, gard, magazii, rezervoare, coloane, estacade, termocentrala */
      flat(envG, 7, 2500, SH.asphalt, -76, 0.03, -150);
      [-1400, -572, -564, -255, -247, 100, 108, 250, 258, 1100].forEach(function (zf, m, all) {                                                // gard de placi de beton, intrerupt la porti
        if (m % 2 === 0) { vf.box(0.2, 2.4, all[m + 1] - zf, 0xa7a49a, -84, 1.2, (zf + all[m + 1]) / 2); if (m) vf.box(0.4, 2.7, 0.4, 0x8f8c84, -84, 1.35, zf); if (m < 8) vf.box(0.4, 2.7, 0.4, 0x8f8c84, -84, 1.35, all[m + 1]); }
      });
      plot(SH.gravel, -345, -150, -562, -300); plot(SH.gravel, -685, -495, 35, 165); plot(SH.gravel, -300, -170, 880, 975); plot(0xb3b0a6, -190, -140, -790, -745);
      plot(0xb3b0a6, -350, -165, -250, 60); plot(0xb3b0a6, -380, -215, 130, 340); plot(0xb3b0a6, -500, -390, -310, -240); plot(0xb3b0a6, -500, -420, 370, 440); plot(0xb3b0a6, -370, -300, 930, 1000);
      plot(0xa9a69c, -1000, -720, -920, -600); plot(SH.gravel, -720, -680, -660, -620);
      plot(SH.asphalt, -400, -79.5, 100, 108); plot(SH.asphalt, -900, -79.5, -572, -564); plot(SH.asphalt, -136, -128, -1000, 700); plot(SH.asphalt, -400, -392, -564, 100); plot(SH.asphalt, -640, -632, -564, 20);
      plot(SH.asphalt, -128, -79.5, -255, -247); plot(SH.asphalt, -128, -79.5, 250, 258);                                                     // drumuri interioare si portile spre drumul de uzina
      function coloana(x, z, h, r) {
        var q, sg = Q.lite ? 8 : 10;
        vf.cyl(r * 1.25, r * 1.3, 1.2, 0x8d8f8a, x, 0.6, z, 8); vf.cyl(r, r, h, 0xb9bdbb, x, h / 2 + 1.2, z, sg, null, 0xdcdfdd); vf.sph(r, 0xdcdfdd, x, h + 1.2, z, 0.55, 0);
        for (q = 1; q <= Math.floor(h / 10); q++) vf.cyl(r + 1.0, r + 1.0, 0.22, 0x666c6a, x, q * 10, z, 8);
        vf.cyl(0.28, 0.28, h, 0x9a9d98, x + r + 0.45, h / 2 + 1.2, z, 5);
        gl(x + r + 1.2, h * 0.92, z, 9, false); if (h > 44) gl(x + r + 1.2, h * 0.5, z, 7, false);
      }
      function rezervor(x, z, r, h, c) {
        vf.cyl(r, r, h, c, x, h / 2, z, Q.lite ? 12 : 16, null, 0xe9eae6); vf.cyl(r * 0.08, r, r * 0.14, 0xcfd2cf, x, h + r * 0.07, z, Q.lite ? 12 : 16);
        vf.box(0.9, 0.12, r * 0.9, 0x70767a, x + r + 0.45, h * 0.6, z, [0.6, 0, 0]);
      }
      function sfera(x, z, r) {
        var q; vf.sph(r, 0xd9dcd8, x, r + 2.6, z, 1, 1, 0xf3f4f1);
        for (q = 0; q < 6; q++) vf.cyl(0.32, 0.32, r + 2.6, 0x7f8588, x + Math.cos(q * 1.047) * r * 0.86, (r + 2.6) / 2, z + Math.sin(q * 1.047) * r * 0.86, 5);
      }
      function estacada(xa, za, xb, zb) {                                  // estacada de conducte pe portaluri de otel, la 6,5 m
        var len = Math.hypot(xb - xa, zb - za), np = Math.max(2, Math.round(len / (Q.lite ? 32 : 24))), q, ux = (xb - xa) / len, uz = (zb - za) / len, px, pz;
        for (q = 0; q <= np; q++) {
          px = xa + (xb - xa) * q / np; pz = za + (zb - za) * q / np;
          vf.box(0.3, 7, 0.3, 0x6f7578, px - uz * 2.2, 3.5, pz + ux * 2.2); vf.box(0.3, 7, 0.3, 0x6f7578, px + uz * 2.2, 3.5, pz - ux * 2.2);
          vf.beam(0x6f7578, px - uz * 2.5, 6.4, pz + ux * 2.5, px + uz * 2.5, 6.4, pz - ux * 2.5, 0.3);
        }
        [[xa, za], [xb, zb]].forEach(function (pe) { vf.box(Math.abs(ux) > 0.5 ? 0.7 : 3.9, 6.9, Math.abs(ux) > 0.5 ? 3.9 : 0.7, 0xbfc2bf, pe[0], 3.45, pe[1]); });      // la capete conductele coboara in canal
        [[-1.5, 0.5, 0xc9ccca], [-0.4, 0.38, 0xb0a48a], [0.6, 0.6, 0xd6d8d5], [1.6, 0.32, 0x8f8f86]].forEach(function (pp) {
          vf.beam(pp[2], xa + uz * pp[0], 6.55 + pp[1] / 2, za - ux * pp[0], xb + uz * pp[0], 6.55 + pp[1] / 2, zb - ux * pp[0], pp[1]);
        });
      }
      function cos2(x, z, h, r0) {                                         // cos inalt de beton, cu benzi rosii si albe sus
        var q, nb = 8, hb = h * 0.45 / nb, r1 = r0 * 0.5, rr = function (y) { return r0 + (r1 - r0) * y / h; };
        vf.cyl(rr(h * 0.55), r0, h * 0.55, 0x9c9a92, x, h * 0.275, z, 12, null, 0xb7b5ac);
        for (q = 0; q < nb; q++) vf.cyl(rr(h * 0.55 + (q + 1) * hb), rr(h * 0.55 + q * hb), hb, q % 2 ? 0xe8e6de : 0xb8423a, x, h * 0.55 + (q + 0.5) * hb, z, 12);
        gl(x + r1 + 1, h - 2, z, 12, false, 0xff4030); gl(x + rr(h * 0.6) + 1, h * 0.6, z, 10, false, 0xff4030);
      }
      function turn(x, z, h, r) {                                          // turn de racire hiperbolic
        vf.add(unit('imHyp', function () {
          var pts = [], q, t; for (q = 0; q <= 12; q++) { t = q / 12; pts.push(new T.Vector2(0.58 * Math.sqrt(1 + Math.pow((t - 0.75) / 0.534, 2)), t - 0.5)); }
          return new T.LatheGeometry(pts, Q.lite ? 16 : 24);
        }), 0x97958d, x, h / 2, z, r, h, r, null, 0xc6c4bb);
        vf.cyl(r * 1.005, r * 1.02, 7, 0x4c4e4b, x, 3.5, z, 24); vf.cyl(r * 0.6, r * 0.6, 0.6, 0x35383a, x, h - 4, z, 24);
        gl(x + r * 0.75, h * 0.5, z, 16, false);
        var q2; for (q2 = 0; q2 < 5; q2++) sph(envG, r * (0.5 + q2 * 0.2), SH.imSteam, x + q2 * 4, h + 4 + q2 * r * 0.42, z + q2 * q2 * 6, false, 0.8, 2);
      }
      // magazii mari langa linii
      vf.hall(-108, -40, 84, 24, 9, 0xb9bdbb, 0x7c8286, true, 4); vf.hall(-112, 150, 60, 28, 10, 0xcac6b8, 0x8a8f92, true, 3); vf.hall(-110, -320, 110, 26, 9, 0xc4c8c9, 0x6f7477, true, 5);
      vf.hall(-190, 400, 70, 30, 11, 0xd0d2cf, 0x80858a, false, 3); vf.hall(-112, -625, 90, 26, 9, 0xbfc3c4, 0x8d9193, true, 4); vf.hall(-110, 600, 100, 30, 10, 0xc9c4b6, 0x767b7e, true, 4);
      vf.hall(-300, 760, 80, 34, 12, 0xcfd1ce, 0x82878a, false, 3); vf.hall(-260, -900, 120, 36, 12, 0xbcc0c2, 0x70757a, true, 4);
      // parc de rezervoare si sfere
      for (n = 0; n < 16; n++) rezervor(-175 - (n % 4) * 46, -545 + Math.floor(n / 4) * 46, 11 + (n * 7 % 3), 11 + (n * 5 % 4), n % 5 === 2 ? 0xb9b4a6 : 0xd6d8d4);
      for (n = 0; n < 4; n++) sfera(-178 - n * 40, -330, 8.5);
      for (n = 0; n < 6; n++) rezervor(-520 - (n % 3) * 70, 60 + Math.floor(n / 3) * 80, 20, 14, 0xd0d2ce);
      for (n = 0; n < 6; n++) rezervor(-190 - (n % 3) * 44, 900 + Math.floor(n / 3) * 50, 12, 12, 0xcfd1cc);
      // instalatii: grupuri de coloane cu schele, cuptoare cu cos, cladiri de proces
      [[-200, -200], [-300, -110], [-240, 20], [-330, 180], [-250, 300], [-420, -260], [-460, 420], [-330, 980]].forEach(function (u, g) {
        var q, hh;
        for (q = 0; q < (g < 5 ? 3 : 2); q++) { hh = 30 + ((g * 13 + q * 17) % 31); coloana(u[0] - q * 13, u[1] + (q % 2) * 9, hh, 1.5 + (hh > 48 ? 0.9 : hh > 38 ? 0.4 : 0)); }
        vf.box(22, 18, 12, 0x7b8184, u[0] - 12, 9, u[1] - 18); vf.box(22.6, 0.3, 12.6, 0x5a6063, u[0] - 12, 6, u[1] - 18); vf.box(22.6, 0.3, 12.6, 0x5a6063, u[0] - 12, 12, u[1] - 18);     // structura cu aparate, pe trei niveluri
        vf.box(10, 12, 8, 0xa9a69c, u[0] + 14, 6, u[1] - 16); vf.cyl(0.9, 1.3, 34, 0xb0b3b1, u[0] + 14, 29, u[1] - 16, 8);                                                                // cuptor cu cos
        gl(u[0] - 0.8, 13, u[1] - 18, 10, false); gl(u[0] + 15.5, 44, u[1] - 16, 6, false);
      });
      vf.cyl(0.5, 0.8, 70, 0x8f9496, -560, 35, -120, 8); vf.cyl(1.2, 0.5, 3, 0x5a5d5c, -560, 71.5, -120, 8); gl(-558, 72, -120, 10, false, 0xff9a40);                                      // facla
      // silozuri de soda si estacade
      for (n = 0; n < 6; n++) { vf.cyl(6, 6, 30, 0xcfd0ca, -150 - (n % 3) * 13.5, 15, -760 - Math.floor(n / 3) * 13.5, 12, null, 0xe4e5e0); }
      vf.box(42, 4, 30, 0x9a9d98, -163.5, 32, -766.7);
      estacada(-146, -600, -146, 520); estacada(-146, -240, -420, -240); estacada(-146, 90, -500, 90); estacada(-146, 330, -440, 330); estacada(-430, -240, -430, 90);
      // termocentrala platformei, la circa 1 km: doua turnuri de racire, sala cazanelor, sala turbinelor, doua cosuri
      turn(-930, -860, 92, 36); turn(-930, -735, 92, 36);
      vf.box(60, 48, 90, 0xa9aca8, -800, 24, -770, null, 0xbfc2be); vf.box(30, 26, 100, 0xb9bcb8, -755, 13, -770); vf.box(20, 62, 30, 0x9da09c, -812, 31, -800);
      vf.beam(0x7f8588, -700, 3, -640, -790, 44, -740, 4);                                                                                                                                // banda de carbune
      vf.box(10, 8, 10, 0x9da09c, -700, 4, -640); cos2(-835, -650, 190, 8); cos2(-800, -612, 150, 6.5);
      gl(-770, 30, -770, 22, false); gl(-737, 20, -800, 14, false); gl(-737, 20, -740, 14, false);

      /* marginea orasului: blocuri cu 4 si 10 etaje, in siruri, dincolo de linia electrica */
      for (n = 0; n < (Q.lite ? 14 : 24); n++) {
        var bx = 560 + (n % 4) * 118 + (iR() - 0.5) * 20, bz = -1180 + Math.floor(n / 4) * 370 + (n % 2) * 90 + (iR() - 0.5) * 40, bl = 48 + Math.floor(iR() * 3) * 12, bh = iR() > 0.6 ? 30 : 15, bzz = n % 3 === 0;
        var bw = bzz ? 12 : bl, bd = bzz ? bl : 12, bq = [imHill(bx - bw / 2, bz - bd / 2), imHill(bx + bw / 2, bz - bd / 2), imHill(bx - bw / 2, bz + bd / 2), imHill(bx + bw / 2, bz + bd / 2)];
        var bLo = Math.min.apply(null, bq) - 1, bTop = Math.max.apply(null, bq) + bh;                                                          // pe panta, soclul coboara pana sub teren
        box(envG, bw, bTop - bLo, bd, SH.imBlk, bx, (bTop + bLo) / 2, bz, false);
        vf.box(bw + 0.5, 0.7, bd + 0.5, 0x6a6d6c, bx, bTop + 0.35, bz); vf.box(3, 2.4, 3, 0x8a8c88, bx, bTop + 1.6, bz);
        if (n % 3 === 1) gl(bx - bw / 2 - 0.2, bTop - bh * 0.4, bz, 9, false);
      }

      /* copaci si tufisuri: salcami si nuci langa curti si la capete (instante), palcuri simple mai departe */
      var trees = [], tries = 0, nt = Q.lite ? 30 : 84;
      while (trees.length < nt && tries++ < 4000) {
        var tX = -20 + iR() * 370, tZ = -640 + iR() * 990, okT = !inPer(tX, tZ, 7), q3;
        if (tX < RAIL.x1 + 6) okT = false;
        for (q3 = 0; okT && q3 < noT.length; q3++) if (tX > noT[q3][0] && tX < noT[q3][1] && tZ > noT[q3][2] && tZ < noT[q3][3]) okT = false;
        if (okT && tZ > z0 - 4 && tZ < z1 + 4 && tX < 240 && iR() < 0.6) okT = false;                                                         // mai rari chiar langa gard
        if (okT) trees.push([tX, tZ, 0.6 + iR() * 0.55, iR() * 6.28, iR()]);
      }
      var treeI = inst(envG, treeTpl('broad', 1), trees.length);
      trees.forEach(function (t, m) {
        qq.setFromAxisAngle(yAx, t[3]); mtx.compose(pos.set(t[0], 0, t[1]), qq, sc.set(t[2], t[2] * (0.9 + t[4] * 0.2), t[2])); treeI.setMatrixAt(m, mtx);
        treeI.setColorAt(m, tc.setHSL(0.23 + t[4] * 0.07, 0.4 + t[4] * 0.14, 0.26 + t[4] * 0.08));
      });
      treeI.instanceColor.needsUpdate = true;
      for (n = 0; n < (Q.lite ? 140 : 380); n++) {
        var fa = iR() * 6.28, fd = 430 + iR() * 1700, fx = cx + Math.cos(fa) * fd * 0.75, fz = cz + Math.sin(fa) * fd, fr = 3.5 + iR() * 4, q4, okF = fx > -60 || fx < -1500;
        for (q4 = 0; okF && q4 < noT.length; q4++) if (fx > noT[q4][0] && fx < noT[q4][1] && fz > noT[q4][2] && fz < noT[q4][3]) okF = false;
        if (fx > 520 && fx < 980 && Math.abs(fz + 145) < 1400) okF = false;
        if (!okF) continue;
        if (imHill(fx, fz) > 0) continue;                                                                                                       // dealurile raman curate: padurea lor e in culoarea terenului
        vf.sph(fr, [0x3f5a2a, 0x4a6a30, 0x55702f, 0x38522a][n % 4], fx, fr * 1.0, fz, 1.15, fd < 760 && !Q.lite ? 1 : 0, 0x6f8a40);
      }

      vc.flush(envG, SH.imVC, true); vf.flush(envG, SH.imVC, false);
      /* luminile de noapte: pete calde sub stalpi si puncte aprinse pe platforma chimica (se vad doar noaptea) */
      var glI = new T.InstancedMesh(new T.PlaneGeometry(1, 1), SH.glow, glow.length), qFl = new T.Quaternion().setFromAxisAngle(new T.Vector3(1, 0, 0), -Math.PI / 2), qUp = new T.Quaternion().setFromAxisAngle(yAx, Math.PI / 2);
      glow.forEach(function (g2, m) { mtx.compose(pos.set(g2[0], g2[1], g2[2]), g2[4] ? qFl : qUp, sc.set(g2[3], g2[3], 1)); glI.setMatrixAt(m, mtx); glI.setColorAt(m, tc.setHex(g2[5])); });
      glI.instanceColor.needsUpdate = true; glI.frustumCulled = false; glI.renderOrder = 2; envG.add(glI);
    })();
    // umbre moi de nori: pete intunecate care plutesc deasupra bazei (o singura plasa pe nor)
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
