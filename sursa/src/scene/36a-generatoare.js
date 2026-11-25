    // generatoare (vest)
    var gen = grp(root), zGen0 = -D / 2 + 3, genO = [], gStep = genS * 5.6 + 1.2;
    for (i = 0; i < nGen; i++) genO.push(genset(gen, xGen, zGen0 + i * gStep, genLen, genS));
    tag(gen, 'gen');
