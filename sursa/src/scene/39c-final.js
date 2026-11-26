
    // ancorele si vederile se scriu in coordonatele bazei si se trec apoi in ale scenei (root este rotit cu NORTH_ROT)
    var cRt = Math.cos(NORTH_ROT), sRt = Math.sin(NORTH_ROT);
    function wP(a) { return a ? [a[0] * cRt + a[2] * sRt, a[1], -a[0] * sRt + a[2] * cRt] : null; }
    function wV(v) { return { t: wP(v.t), dist: v.dist, az: v.az + NORTH_ROT, pol: v.pol }; }
    function onPath(pt, f, y) {                          // punctul aflat la fractiunea f din lungimea unui traseu
      var q, d, tot = 0, acc = 0; for (q = 1; q < pt.length; q++) tot += Math.hypot(pt[q][0] - pt[q - 1][0], pt[q][1] - pt[q - 1][1]);
      for (q = 1; q < pt.length; q++) { d = Math.hypot(pt[q][0] - pt[q - 1][0], pt[q][1] - pt[q - 1][1]); if (acc + d >= tot * f || q === pt.length - 1) { var u = d ? Math.min(1, (tot * f - acc) / d) : 0; return [pt[q - 1][0] + (pt[q][0] - pt[q - 1][0]) * u, y, pt[q - 1][1] + (pt[q][1] - pt[q - 1][1]) * u]; } acc += d; }
      return null;
    }
    function rc(zr) { return [(zr[0] + zr[1]) / 2, (zr[2] + zr[3]) / 2, Math.max(zr[1] - zr[0], zr[3] - zr[2])]; }     // centrul si latura mare a unui dreptunghi
    var b7 = bzGet(7);
    var cS = rc(subZ), cG = rc(genZ), cC = rc(coolZ), cB = nB && bessZ ? rc(bessZ) : null, AN = {}, VW = {}, key;
    var anchors = {
      building: [0, H + 4, 0], pv: nT ? pvA : null, bess: nB ? bessA : null, sub: subA, gen: genA, cool: coolA, fiber: [xF, 2.5, D / 2 + 3],
      f_pv: nT && pvPath ? onPath(pvPath, 0.8, 1.3 * k) : null, f_bess: nB && bessPath ? onPath(bessPath, 0.5, 1.3 * k) : null,
      f_grid: onPath(gridPath, 0.86, 1.3 * k), f_gen: onPath(genPath, 0.5, 1.3 * k),
      r_gpu: [rackPos[0] + 1.21, 1.95, rackPos[1] - 0.1], r_cool: [rackPos[0] - 0.53, 2.42, rackPos[1] + 0.2], r_net: [rackPos[0] + 0.35, 2.5, rackPos[1]],
      r_srv: [rackPos[0] + 0.62, 0.95, rackPos[1] + 0.25], r_pow: [rackPos[0] + 0.55, 0.47, rackPos[1] + 0.28],
      // etichetele locului (capitolul "Locul"): ce este in baza si in jurul ei
      p_long: [62, 11, 0], p_hall2: [(b7.x0 + b7.x1) / 2, b7.h + 5, (b7.z0 + b7.z1) / 2],
      p_yardA: [66, 3, -52], p_yardB: [40, 3, 36], p_rail: [(RAIL.x0 + RAIL.x1) / 2, 7, -90],
      p_gate: [181, 6, -372], p_line: [372, 30, -150], p_chem: [-250, 40, -140]
    };
    var views = {
      overview: { t: [cx, 0, cz + 20], dist: fit(RR * 0.84), az: -1.15, pol: 0.95 },                                     // toata baza, vazuta dinspre calea ferata
      hero: { t: [14, 0, -22], dist: fit(74), az: -0.95, pol: 1.36 },                                                    // privire joasa spre hala si curtea instalatiilor, cu baza si dealurile in spate
      building: { t: [6, 2, -12], dist: fit(52), az: -2.45, pol: 1.0 },
      inside: { t: [(xE + xO) / 2 - W * 0.08, 1, 0], dist: fit(Math.max(W * 0.46, D * 0.9)), az: 0.5, pol: 0.66 },
      power: { t: [(cS[0] + cG[0]) / 2, 2, (cS[1] + zNw) / 2], dist: fit(Math.max(cG[0] - cS[0] + 20, 30) * 0.8), az: -2.6, pol: 1.0 },
      cooling: { t: [cC[0] - 1, 1.5, (cC[1] + zNw) / 2 + 1], dist: fit(Math.max(cC[2] + 6, 24)), az: -2.45, pol: 1.12 },
      pv: { t: [pvA[0], 0, pvA[2]], dist: fit(120), az: -1.3, pol: 0.9 },
      bess: cB ? { t: [cB[0], 1, cB[1]], dist: fit(Math.max(cB[2], 26) * 0.9), az: -2.6, pol: 1.0 } : null,
      fiber: { t: [xF - 6, 0, D / 2 + 10], dist: fit(44), az: 0.35, pol: 0.95 },
      top: { t: [cx, 0, cz], dist: fit(RR * 0.92), az: -NORTH_ROT, pol: 0.06 },
      place: { t: [cx - 6, 0, cz + 6], dist: fit(spanZ * 0.56), az: -Math.PI / 2, pol: 0.07 },                       // capitolul „Locul”: de sus, cu calea ferata jos, ca pe harta din satelit
      rack: { t: [rackPos[0] + 0.7, 1.3, rackPos[1] - 0.1], dist: fit(1.55), az: 1.02, pol: 1.3 },
      thermal: { t: [10, 1, -10], dist: fit(48), az: -2.5, pol: 0.72 }
    };
    if (!views.bess) views.bess = views.power;
    for (key in anchors) AN[key] = wP(anchors[key]);
    for (key in views) VW[key] = wV(views[key]);
    var wc = wP([cx, 0, cz]);
    L = { W: W, D: D, H: H, k: k, R: RR, cx: wc[0], cz: wc[2], lcx: cx, spanX: spanX, spanZ: spanZ, anchors: AN, views: VW, land: { w: spanX, d: spanZ }, north: NORTH_ROT };
    camera.near = 0.6 * k; camera.far = RR * 40; camera.updateProjectionMatrix();
    scene.fog.near = RR * 3.5; scene.fog.far = RR * 15;
    if (sky) sky.scale.setScalar(RR * 20);
    parts = { plat: platG, fenceG: fenceG, siteG: siteG, carsG: carsG, peopleG: peopleG, lampG: lampG, sub: sub, lineG: lineG, floorM: floorG, wallGroup: wallGroup, partG: partG, elec: elec, itg: itg, itx: itx,
      cool: cool, gen: gen, rk: rk, rk2: rk2, n1: n1, n2: n2, rack: rackD, tables: tables, inv: inv, pvG: pvG, nT: nT, bess: bess, bessI: bessI, nB: nB, fg: fg, cloudG: cloudG, shell: 1 };
    batch.flush(); applyTags();
    shF.x = 1e9;
    applyBuild();
    applySun();
    return L;
  }
