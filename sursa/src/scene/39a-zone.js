    /* --- zone de apasare (dreptunghiurile vin din fisierele zonelor) --- */
    pvZs.forEach(function (e) { zone(root, 'pv', e[0], e[1], e[2], e[3], e[4] || 8); });
    if (nB && bessZ) zone(root, 'bess', bessZ[0], bessZ[1], bessZ[2], bessZ[3], 3.4);
    zone(root, 'cool', coolZ[0], coolZ[1], coolZ[2], coolZ[3], 3.4);
    zone(root, 'gen', genZ[0], genZ[1], genZ[2], genZ[3], 3.6);
    zone(root, 'sub', subZ[0], subZ[1], subZ[2], subZ[3], 4.2);
    zone(root, 'fiber', xF - 2.5, xF + 2.5, D / 2 + 0.4, D / 2 + 6.5, 0.8);
