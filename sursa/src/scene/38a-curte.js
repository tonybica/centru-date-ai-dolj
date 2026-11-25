    /* --- limite, gard, drum, copaci, camp --- */
    var x0 = Math.min(-fieldW / 2, platX0) - 10, x1 = Math.max(fieldW / 2, platX1) + 10, z0 = zPVend - 10, z1 = platZ1 + 2;
    var cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, spanX = x1 - x0, spanZ = z1 - z0, RR = Math.sqrt(spanX * spanX + spanZ * spanZ) / 2;
    var k = Math.max(0.7, Math.min(3.2, RR / 110));
    var xGate = xEnt + 9, fenceG = grp(root), fposts = [], fh = 2.4;
    fenceRun(fenceG, fposts, x0, z0, x1, z0, fh); fenceRun(fenceG, fposts, x0, z0, x0, z1, fh); fenceRun(fenceG, fposts, x1, z0, x1, z1, fh);
    fenceRun(fenceG, fposts, x0, z1, xGate - 4.5, z1, fh); fenceRun(fenceG, fposts, xGate + 4.5, z1, x1, z1, fh);
    fencePosts(fenceG, Q.lite ? fposts.filter(function (q, n) { return n % 2 === 0; }) : fposts);
    box(fenceG, 0.3, 2.8, 0.3, SH.dark, xGate - 4.5, 1.4, z1); box(fenceG, 0.3, 2.8, 0.3, SH.dark, xGate + 4.5, 1.4, z1);
    fenceRun(fenceG, [], xGate - 13, z1 - 0.4, xGate - 4.3, z1 - 0.4, 2.2); box(fenceG, 8.7, 0.12, 0.08, SH.dark, xGate - 8.65, 0.25, z1 - 0.4, false);     // poarta culisanta, deschisa
    box(fenceG, 0.1, 2.2, 0.1, SH.dark, xGate - 13, 1.15, z1 - 0.4, false); box(fenceG, 0.1, 2.2, 0.1, SH.dark, xGate - 4.3, 1.15, z1 - 0.4, false);

    var gr = new T.Mesh(new T.CircleGeometry(RR * 16, 64), SH.ground); gr.rotation.x = -Math.PI / 2; gr.position.set(cx, -0.05, cz); gr.receiveShadow = true; root.add(gr);
    TEX.grass.repeat.set(RR * 32 / 34, RR * 32 / 34);
