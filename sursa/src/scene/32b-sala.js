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
