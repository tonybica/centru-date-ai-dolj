    /* --- limite, gard, drum, copaci, camp --- */
    var x0 = Math.min(-fieldW / 2, platX0) - 10, x1 = Math.max(fieldW / 2, platX1) + 10, z0 = zPVend - 10, z1 = platZ1 + 2;
    var cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, spanX = x1 - x0, spanZ = z1 - z0, RR = Math.sqrt(spanX * spanX + spanZ * spanZ) / 2;
    var k = Math.max(0.7, Math.min(3.2, RR / 110));
    var xGate = xEnt + 9, fenceG = grp(root), fposts = [], fh = 2.4, cu_gw = 4, cu_xPg = xGate + cu_gw + 1.55;   // poarta auto: gol de 8 m pentru drumul de 7 m; alaturi poarta pentru pietoni
    fenceRun(fenceG, fposts, x0, z0, x1, z0, fh, 1); fenceRun(fenceG, fposts, x0, z0, x0, z1, fh, 1); fenceRun(fenceG, fposts, x1, z0, x1, z1, fh, 1);
    fenceRun(fenceG, fposts, x0, z1, xGate - cu_gw - 0.15, z1, fh, 1); fenceRun(fenceG, fposts, cu_xPg, z1, x1, z1, fh, 1);
    fencePosts(fenceG, Q.lite ? fposts.filter(function (q, n) { return n % 2 === 0; }) : fposts);
    [xGate - cu_gw - 0.15, xGate + cu_gw + 0.15, cu_xPg].forEach(function (gx, n) {                       // stalpii portii, pe fundatii
      box(fenceG, n < 2 ? 0.3 : 0.16, 2.8, n < 2 ? 0.3 : 0.16, SH.dark, gx, 1.4, z1); box(fenceG, n < 2 ? 0.6 : 0.4, 0.12, n < 2 ? 0.6 : 0.4, SH.base, gx, 0.06, z1, false);
    });
    // poarta culisanta, deschisa spre vest: grinda de beton cu sina, canat pe role, portal de ghidare, motor
    var cu_zGt = z1 - 0.45, cu_xLf = xGate - cu_gw - 0.35;
    box(fenceG, 2 * cu_gw + 9.6, 0.25, 0.5, SH.base, xGate - 4.5, 0.118, cu_zGt, false); box(fenceG, 2 * cu_gw + 9.4, 0.035, 0.05, SH.steel, xGate - 4.5, 0.26, cu_zGt, false);
    gateLeaf(fenceG, cu_xLf - 9.1, cu_xLf, cu_zGt, 0.36, 2.1);
    [cu_xLf - 8.6, cu_xLf - 4.6, cu_xLf - 0.6].forEach(function (gx) { cyl(fenceG, 0.07, 0.07, 0.05, SH.steel, gx, 0.345, cu_zGt, 10, [Math.PI / 2, 0, 0], false); });
    [cu_xLf - 0.25, cu_xLf - 4.4].forEach(function (gx) {
      for (sd = -1; sd <= 1; sd += 2) box(fenceG, 0.1, 2.75, 0.1, SH.dark, gx, 1.37, cu_zGt + sd * 0.19);
      box(fenceG, 0.1, 0.1, 0.48, SH.dark, gx, 2.7, cu_zGt, false);
    });
    box(fenceG, 0.3, 0.55, 0.26, SH.paint, cu_xLf - 0.9, 0.275, cu_zGt - 0.4, false); box(fenceG, 0.34, 0.03, 0.3, SH.dark, cu_xLf - 0.9, 0.565, cu_zGt - 0.4, false);
    box(fenceG, 0.14, 0.9, 0.14, SH.dark, xGate + cu_gw + 0.15, 0.7, cu_zGt, false);                 // opritorul in care se inchide canatul
    gateLeaf(fenceG, xGate + cu_gw + 0.32, cu_xPg - 0.1, z1, 0.12, 2.2);                              // poarta pentru pietoni, cu cititor de cartele
    box(fenceG, 0.12, 0.2, 0.06, SH.steel, xGate + cu_gw + 0.15, 1.25, z1 + 0.18, false);
    box(fenceG, 0.6, 0.4, 0.02, SH.stripe, xGate - cu_gw - 1.2, 1.6, z1 + 0.03, false); box(fenceG, 0.6, 0.4, 0.02, SH.stripe, cu_xPg + 1.0, 1.6, z1 + 0.03, false);
    box(fenceG, 0.3, 0.08, 0.025, SH.dark, xGate - cu_gw - 1.2, 1.52, z1 + 0.03, false); box(fenceG, 0.3, 0.08, 0.025, SH.dark, cu_xPg + 1.0, 1.52, z1 + 0.03, false);

    var gr = new T.Mesh(new T.CircleGeometry(RR * 16, 64), SH.ground); gr.rotation.x = -Math.PI / 2; gr.position.set(cx, -0.05, cz); gr.receiveShadow = true; root.add(gr);
    TEX.grass.repeat.set(RR * 32 / 34, RR * 32 / 34);
