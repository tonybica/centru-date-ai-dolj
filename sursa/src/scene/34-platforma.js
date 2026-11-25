    /* --- platforma tehnica --- */
    var perCol = Math.max(1, Math.floor((D - 2) / 4)), nCool = Math.max(2, Math.ceil(p.it * 1.25 / 0.45) + 1), coolCols = Math.ceil(nCool / perCol);
    var coolLen = 9, coolX0 = W / 2 + 4 + coolLen / 2, coolW = coolCols * (coolLen + 2);
    var nGen = huge ? Math.ceil(p.it * 1.25 / 2) + 1 : 2, genLen = big ? 12 : 6, genS = big ? 1 : 0.7;
    var subS = huge ? 2.2 : big ? 1.3 : 0.8, subW = 14 * subS, subD = 12 * subS;
    var xGen = -W / 2 - 4 - genLen / 2, xSub = -W / 2 - 4 - genLen - 12 - subW / 2, zSub = D / 2 - subD / 2 + 2;
    var nB = p.bess > 0 ? Math.max(1, Math.ceil(p.bess / 2.5)) : 0, perRowB = Math.max(2, Math.floor((W * 0.75 + 10) / 8)), rowsB = Math.ceil(nB / perRowB);
    var zB0 = -D / 2 - 11, zPV0 = zB0 - Math.max(1, rowsB) * 6 - 12;
    var platX0 = xSub - subW / 2 - 6, platX1 = W / 2 + 4 + coolW + 8, platZ0 = zPV0 + 5, platZ1 = D / 2 + 24;
    var pw = platX1 - platX0, pd = platZ1 - platZ0, platG = grp(root); platG.position.set((platX0 + platX1) / 2, 0, (platZ0 + platZ1) / 2);
    box(platG, pw, 0.2, pd, SH.concrete, 0, 0.1, 0, false);
    box(platG, pw + 0.3, 0.3, 0.3, SH.base, 0, 0.15, -pd / 2, false); box(platG, 0.3, 0.3, pd, SH.base, -pw / 2, 0.15, 0, false); box(platG, 0.3, 0.3, pd, SH.base, pw / 2, 0.15, 0, false);
