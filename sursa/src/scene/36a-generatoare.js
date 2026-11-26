    /* --- energie: canale de cabluri, generatoare, post de transformare, racord de 20 kV, baterii (optional), stalpi de iluminat --- */
    // canal de cabluri cu capace de beton, drept, pe x sau pe z; y = suprafata pe care sta; (ox, oz) = originea grupului in care se deseneaza
    function en_lid(g, xa, za, xb, zb, y, ox, oz) {
      var ax = Math.abs(xb - xa) > Math.abs(zb - za), len = ax ? Math.abs(xb - xa) : Math.abs(zb - za), n = Math.max(1, Math.round(len / 0.8)), q;
      ox = ox || 0; oz = oz || 0; if (len < 0.05) return;
      box(g, ax ? len : 0.76, 0.03, ax ? 0.76 : len, SH.dark, (xa + xb) / 2 - ox, y + 0.015, (za + zb) / 2 - oz, false);     // marginea canalului
      box(g, ax ? len : 0.6, 0.05, ax ? 0.6 : len, SH.base, (xa + xb) / 2 - ox, y + 0.025, (za + zb) / 2 - oz, false);        // capacele
      if (!Q.lite) for (q = 1; q < n; q++) flat(g, ax ? 0.025 : 0.6, ax ? 0.6 : 0.025, SH.dark, xa + (xb - xa) * q / n - ox, y + 0.054, za + (zb - za) * q / n - oz);
    }
    function en_pit(g, x, z, y, ox, oz) {                // camin de tragere: rama de beton si capac de fonta
      ox = ox || 0; oz = oz || 0;
      box(g, 1.1, 0.07, 1.1, SH.base, x - ox, y + 0.035, z - oz, false); box(g, 0.78, 0.02, 0.78, SH.dark, x - ox, y + 0.08, z - oz, false);
    }
    // santul comun de cabluri de pe culoarul de serviciu (z = zCor), cu camine la fiecare ramificatie. Tine de platforma: apare odata cu ea.
    var en_tx0 = platX0 + 1, en_tx1 = 15;
    en_lid(platG, en_tx0, zCor, en_tx1, zCor, 0.2, pcx, pcz);
    en_pit(platG, en_tx0, zCor, 0.2, pcx, pcz); en_pit(platG, xInG, zCor, 0.2, pcx, pcz); en_pit(platG, xInB, zCor, 0.2, pcx, pcz); en_pit(platG, en_tx1, zCor, 0.2, pcx, pcz);
    en_lid(platG, xInB, zCor + 0.55, xInB, zNw - 0.9, 0.2, pcx, pcz);                                              // ramura spre dulapul de cabluri de pe perete
    // generatoare: grupuri in containere de 12 m, lungi pe z, cu radiatorul spre nord (platforma libera, pe unde vine cisterna) si capatul cu cabluri spre hala.
    // Piesa `genset` este lunga pe x, asa ca grupul `gen` este rotit o data: x local = z al bazei (masurat de la mijlocul zonei), z local = -x al bazei.
    var gen = grp(root), genO = [], genZ = RZ.gen, en_gz = (RZ.gen[2] + RZ.gen[3]) / 2, en_gst = (RZ.gen[1] - RZ.gen[0]) / nGen, en_gx = [], en_gze = en_gz + genLen / 2 + 0.4;
    gen.position.set(0, 0, en_gz); gen.rotation.y = -Math.PI / 2;
    for (i = 0; i < nGen; i++) {
      var en_x = RZ.gen[0] + i * en_gst + (en_gst - 6.1 * genS) / 2 + 1.3 * genS + 0.3, en_o = genset(gen, 0, -en_x, genLen, genS), en_tz = -en_x - 3.35 * genS - 0.1;
      en_gx.push(en_x); genO.push([-en_o[2], en_o[1], en_gz + en_o[0]]);
      // stalpisori de protectie: la capatul cu radiatorul si la punctul de umplere
      bollard(gen, -genLen / 2 - 0.9, -en_x - 1.0 * genS); bollard(gen, -genLen / 2 - 0.9, -en_x + 1.0 * genS); bollard(gen, -genLen * 0.25 - 1.6 * genS, en_tz);
      // canalul de cabluri al grupului: din fundatie pana la caminul de pe santul comun
      en_lid(platG, en_x, en_gze, en_x, zCor - 0.55, 0.2, pcx, pcz); en_pit(platG, en_x, zCor, 0.2, pcx, pcz);
    }
    var genA = [(RZ.gen[0] + RZ.gen[1]) / 2, 6.5, en_gz];
    var genPath = [[en_gx[nGen - 1], en_gze - 0.4], [en_gx[nGen - 1], zCor], [xInB, zCor], [xInB, zNw]];
    tag(gen, 'gen');
