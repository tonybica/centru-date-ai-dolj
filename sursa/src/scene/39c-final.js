
    L = {
      W: W, D: D, H: H, k: k, R: RR, cx: cx, cz: cz, spanX: spanX, spanZ: spanZ,
      anchors: {
        building: [0, H + 3, 0], pv: nT ? [0, 7 * k, zPVmid] : null, bess: nB ? [xBc, 6, zBc] : null,
        sub: [xSub, 4 * subS + 5, zSub], gen: [xGen, 6, zGm],
        cool: [coolX0 + (coolCols - 1) * (coolLen + 2) / 2, 6, 0], fiber: [xF + 1.5, 2.5, zRoad - 7],
        f_pv: nT ? [xPvIn / 2, 1.3 * k, zPV0 + 8] : null, f_bess: nB ? [xBc, 1.3 * k, (zB0 + 1.4 - D / 2) / 2] : null,
        f_grid: [xSub + subW / 2 + 3, 1.3 * k, (zSub + subD / 2 + 2 + D / 2 - 2.5) / 2], f_gen: [-W / 2 - 1.6, 1.3 * k, (zGen0 + zGm) / 2],
        r_gpu: [rackPos[0] + 1.21, 1.95, rackPos[1] - 0.1], r_cool: [rackPos[0] - 0.5, 2.42, rackPos[1] + 0.2], r_net: [rackPos[0] + 0.35, 2.5, rackPos[1]],
        r_srv: [rackPos[0] + 0.62, 0.95, rackPos[1] + 0.25], r_pow: [rackPos[0] + 0.55, 0.47, rackPos[1] + 0.28]
      },
      views: {
        overview: { t: [cx, 0, cz + spanZ * 0.02], dist: fit(RR * 0.86), az: 0.62, pol: 1.0 },
        hero: { t: [cx, 0, cz - spanZ * 0.06], dist: fit(RR * 0.74), az: 0.5, pol: 1.3 },          // privire joasa, cu orizont si cer, pentru primul capitol
        building: { t: [0, 2, 0], dist: fit(Math.max(W, D) * 0.95), az: 0.55, pol: 1.0 },
        inside: { t: [(xE + xO) / 2 - W * 0.08, 1, 0], dist: fit(Math.max(W * 0.46, D * 0.6)), az: 0.5, pol: 0.66 },
        power: { t: [(xSub + -W / 2) / 2, 2, D / 4], dist: fit(Math.max(-xSub - W / 2 + subW, D) * 0.85), az: -0.75, pol: 1.02 },
        cooling: { t: [W / 2 + coolW / 2, 2, 0], dist: fit(Math.max(coolW + 14, D) * 0.85), az: 1.05, pol: 0.98 },
        pv: { t: [0, 0, zPVmid + fieldD * 0.1], dist: fit(Math.max(fieldW, fieldD) * 0.62), az: 0.38, pol: 1.0 },
        bess: { t: [xBc, 1, zB0 - 3], dist: fit(Math.max(bN * 8, 26) * 0.9), az: 2.55, pol: 1.0 },
        fiber: { t: [xF, 0, D / 2 + 16], dist: fit(Math.max(W * 0.7, 44)), az: 0.2, pol: 0.95 },
        top: { t: [cx, 0, cz], dist: fit(RR * 0.9), az: 0, pol: 0.06 },
        rack: { t: [rackPos[0] + 0.7, 1.4, rackPos[1] - 0.1], dist: fit(1.55), az: 1.02, pol: 0.98 },
        thermal: { t: [W / 4 + coolW / 4, 1, 0], dist: fit(Math.max(W + coolW + 10, D) * 0.62), az: 0.5, pol: 0.72 }
      },
      land: { w: spanX, d: spanZ }
    };
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
