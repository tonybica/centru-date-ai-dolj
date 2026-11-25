    /* --- fluxuri --- */
    var fg = grp(root), xPvIn = -W / 2 + 3;      // panourile si bateriile intra in sala electrica prin peretele de nord, la dulapul de cabluri
    if (nT) flows.pv = new Flow(fg, [[0, zPVmid], [0, zPV0 + 8], [xPvIn, zPV0 + 8], [xPvIn, -D / 2]], COL.sun, k, 14);
    if (nB) flows.bess = new Flow(fg, [[xB0 - 1.75, zB0 + 1.3], [xB0 - 1.75, zB0 + 1.9], [xPvIn - 0.8, zB0 + 1.9], [xPvIn - 0.8, -D / 2]], COL.batt, k, 6);      // pe canalul de cabluri al bateriilor, apoi pe langa santul panourilor
    var xGr = xSub - subW / 2 + (huge ? 28.7 : big ? subW - 1.3 : 6.3);      // unde coteste curentul in statie: pe canalul de cabluri de dupa transformator
    flows.grid = new Flow(fg, [[xSub - subW / 2 - 30 * k, stLz], [xGr, stLz], [xGr, D / 2 - 2.5], [-W / 2, D / 2 - 2.5]], COL.grid, k, 12);      // pe sub linie, prin statie, apoi pe canalul de cabluri pana la peretele de vest
    flows.fiberA = new Flow(fg, [[xF, D / 2], [xF, zRoad - 6.2], [x0 - 60 * k, zRoad - 6.2]], COL.fiber, k * 0.7, 8);
    flows.fiberB = new Flow(fg, [[xF + 3, D / 2], [xF + 3, zRoad - 9], [x1 + 60 * k, zRoad - 9]], COL.fiber, k * 0.7, 8);
    flows.fiberA.set(0.5, 1); flows.fiberB.set(0.5, -1);
    var zGm = zGen0 + (nGen - 1) * gStep / 2;
    flows.gen = new Flow(fg, [[xGen + genLen / 2 + 0.4, zGen0], [-W / 2 - 1.6, zGen0], [-W / 2 - 1.6, zGm], [-W / 2, zGm]], COL.gen, k, 6);      // pe canalul de cabluri, nu pe sub rezervoare
    puffGen = new Puffs(root, genO, SH.smoke, 1.4 * genS, 9, 4); puffGen.on = outage === 2 ? 1 : 0;
    puffHeat = new Puffs(root, coolO, SH.heat, 1.5, 11, 3); puffHeat.on = thermal ? 1 : 0;
