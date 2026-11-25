    /* --- zone de apasare --- */
    if (nT) zone(root, 'pv', -fieldW / 2 - 2, fieldW / 2 + 2, zPVend - 2, zPV0 + 6.5, 3.2);
    if (nB) zone(root, 'bess', xB0 - 5, xB0 + bN * 8 + 1, zB0 - (Math.max(1, rowsB) - 1) * 6 - 2.5, zB0 + 2.5, 3.4);
    zone(root, 'cool', W / 2 + 0.3, W / 2 + 4 + coolW, Math.min(-Math.min(perCol, nCool) * 2 - 1, hzz - 6), Math.min(D / 2, Math.max(Math.min(perCol, nCool) * 2 + 3.5, hzz + 1.5)), 3.4);      // cuprinde si statia de pompe de langa perete
    zone(root, 'gen', xGen - genLen / 2 - 1, -W / 2 - 1, zGen0 - 4.4 * genS - 0.3, zGen0 + (nGen - 1) * gStep + 4.5, 3.6);
    zone(root, 'sub', xSub - subW / 2, xSub + subW / 2, zSub - subD / 2, zSub + subD / 2, 4 * subS + 2);
    zone(root, 'fiber', xF - 3, xF + 6, D / 2 + 0.6, zRoad - 4.5, 0.8);
    zone(root, 'fiber', x0 - 30, x1 + 30, zRoad - 10.5, zRoad - 5.2, 0.8);
