    // generatoare (vest): rezervoarele stau la nord de fiecare grup, cablurile ies pe la capatul dinspre cladire
    var gen = grp(root), zGen0 = -D / 2 + 3, genO = [], gStep = genS * 5.6 + 1.2;
    for (i = 0; i < nGen; i++) genO.push(genset(gen, xGen, zGen0 + i * gStep, genLen, genS));
    (function () {
      var gx1 = xGen + genLen / 2 + 0.4, gxc = -W / 2 - 1.6, gz0 = zGen0, gz1 = zGen0 + (nGen - 1) * gStep, gzm = (gz0 + gz1) / 2, tw = 0.6, ty = 0.2175, q, t, gw = 2.6 * genS;
      // canal de cabluri cu capace de beton: o ramura de la fiecare grup, un colector de-a lungul randului, intrarea in peretele de vest la mijlocul randului
      for (q = 0; q < nGen; q++) box(gen, gxc - tw / 2 - gx1, 0.035, tw, SH.base, (gx1 + gxc - tw / 2) / 2, ty, gz0 + q * gStep, false);
      box(gen, tw, 0.035, gz1 - gz0 + tw, SH.base, gxc, ty, gzm, false);
      box(gen, -W / 2 - (gxc + tw / 2), 0.035, tw, SH.base, (-W / 2 + gxc + tw / 2) / 2, ty, gzm, false);
      if (!Q.lite) {                                                                    // rosturile dintre capace
        for (t = gz0; t <= gz1 + 0.01; t += 1) flat(gen, tw, 0.03, SH.dark, gxc, 0.237, t + 0.5 > gz1 + tw / 2 ? t : t + 0.5);
        for (q = 0; q < nGen; q++) for (t = gx1 + 0.5; t < gxc - tw / 2; t += 1) flat(gen, 0.03, tw, SH.dark, t, 0.237, gz0 + q * gStep);
      }
      // trecerea prin perete: cutie etansa cu semn de pericol
      box(gen, 0.25, 0.55, 0.9, SH.silver, -W / 2 - 0.125, 0.2 + 0.275, gzm, false); box(gen, 0.02, 0.2, 0.3, SH.hazard, -W / 2 - 0.261, 0.55, gzm, false);
      // stalpi de protectie spre drum, la fiecare grup si la punctul de umplere
      for (q = 0; q < nGen; q++) {
        var gzq = gz0 + q * gStep, gxw = xGen - genLen / 2 - 1.1;
        bollard(gen, gxw, gzq - gw / 2 - 0.2); bollard(gen, gxw, gzq + gw / 2 + 0.2);
        bollard(gen, xGen - genLen * 0.25 - 0.7 * genS - 0.15 * genS - 0.7, gzq - (gw / 2 + 0.9 * genS + 0.1 + 0.95 * genS) + 0.7 * genS);
      }
    })();
    tag(gen, 'gen');
