    /* --- fluxuri (traseele vin din fisierele zonelor, ca punctele sa mearga pe santurile desenate acolo) --- */
    var fg = grp(root);
    if (nT && pvPath) flows.pv = new Flow(fg, pvPath, COL.sun, k, 14);
    if (nB && bessPath) flows.bess = new Flow(fg, bessPath, COL.batt, k, 6);
    flows.grid = new Flow(fg, gridPath, COL.grid, k, 14);
    // fibra: un traseu vine pe langa calea ferata, celalalt prin curtea de sud, dinspre strada; intra amandoua prin peretele de sud
    var fiberPathA = [[xF, D / 2], [xF, D / 2 + 4], [x0 - 1.6, D / 2 + 4], [x0 - 1.6, z0 - 80]];
    var fiberPathB = [[xF + 1.2, D / 2], [xF + 1.2, D / 2 + 5.2], [0, D / 2 + 5.2], [0, 58], [150, 58], [190, 58]];
    flows.fiberA = new Flow(fg, fiberPathA, COL.fiber, k * 0.7, 10);
    flows.fiberB = new Flow(fg, fiberPathB, COL.fiber, k * 0.7, 10);
    flows.fiberA.set(0.5, 1); flows.fiberB.set(0.5, -1);
    flows.gen = new Flow(fg, genPath, COL.gen, k, 6);
    puffGen = new Puffs(root, genO, SH.smoke, 1.4 * genS, 9, 4); puffGen.on = outage === 2 ? 1 : 0;
    puffHeat = new Puffs(root, coolO, SH.heat, 1.5, 11, 3); puffHeat.on = thermal ? 1 : 0;
