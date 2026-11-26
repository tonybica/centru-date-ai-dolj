    // baterii mari de stocare: varianta de baza nu are (nB = 0) si atunci nu se deseneaza nimic. Daca se cer, stau in RZ.bess, cate doua containere pe rand,
    // cu statia de conversie la capatul de vest; cablurile merg prin canal pe marginea de vest a platformei pana la santul comun.
    var bess = grp(root), bessI = null, bessZ = RZ.bess, bessA = null, bessPath = null;
    if (nB) {
      var en_bx = RZ.bess[0] + 1.7, en_bz = RZ.bess[3] - 3.2, en_brow = Math.ceil(nB / 2), en_bza = Math.max(RZ.bess[2] + 0.2, en_bz - (en_brow - 1) * 5.6 - 2.3), en_bF = [RZ.bess[0] + 0.2, RZ.bess[1] - 0.2, en_bza, RZ.bess[3] - 0.2];
      bessI = inst(bess, bessTpl(), nB);
      for (i = 0; i < nB; i++) { mtx.compose(pos.set(en_bx + 6.7 + (i % 2) * 9.8, 0.2, en_bz - Math.floor(i / 2) * 5.6), q0, one); bessI.setMatrixAt(i, mtx); }
      box(bess, en_bF[1] - en_bF[0] - 0.16, 0.06, en_bF[3] - en_bF[2] - 0.16, SH.gravel, (en_bF[0] + en_bF[1]) / 2, 0.23, (en_bF[2] + en_bF[3]) / 2, false);
      box(bess, 3.0, 0.14, 2.6, SH.base, en_bx, 0.27, en_bz, false); box(bess, 2.4, 2.3, 2.0, SH.cont, en_bx, 1.49, en_bz);                  // statia de conversie
      box(bess, 0.05, 1.4, 1.4, SH.louver, en_bx - 1.23, 1.6, en_bz, false); box(bess, 1.0, 1.9, 0.05, SH.white, en_bx, 1.4, en_bz - 1.02, false);
      box(bess, 0.5, 0.5, 0.2, SH.steel, en_bx, 0.72, en_bz + 1.1, false);                                                                   // cutia de iesire a cablurilor
      for (j = -1; j <= 1; j++) cyl(bess, 0.04, 0.04, 0.2, SH.dark, en_bx + j * 0.14, 0.38, en_bz + 1.13, 6, null, false);
      ao(bess, 3.0, 2.6, en_bx, 0.265, en_bz, 1.3);
      enFence(bess, 0.2, en_bF[0], en_bF[2], en_bF[1], en_bF[2], 2.0); enFence(bess, 0.2, en_bF[0], en_bF[3], en_bF[1], en_bF[3], 2.0, 3.0, 5.0);
      enFence(bess, 0.2, en_bF[0], en_bF[2], en_bF[0], en_bF[3], 2.0); enFence(bess, 0.2, en_bF[1], en_bF[2], en_bF[1], en_bF[3], 2.0);
      gateLeaf(bess, en_bF[0] + 3.05, en_bF[0] + 4.95, en_bF[3], 0.3, 1.9); box(bess, 0.5, 0.36, 0.02, SH.hazard, en_bF[0] + 8, 1.6, en_bF[3] + 0.04, false);
      en_lid(bess, en_bx, en_bz + 1.3, en_bx, en_bF[3] - 0.08, 0.26);
      en_lid(bess, en_bx, en_bF[3] + 0.08, en_bx, zCor - 0.55, 0.2); en_pit(bess, en_bx, zCor, 0.2);
      bessA = [(RZ.bess[0] + RZ.bess[1]) / 2, 6, (RZ.bess[2] + RZ.bess[3]) / 2];
      bessPath = [[en_bx, en_bz + 1.2], [en_bx, zCor], [xInB, zCor], [xInB, zNw]];
      tag(bess, 'bess');
    }
    // patru stalpi noi de iluminat pe marginile platformei, cu bratul spre instalatii; noaptea lumineaza
    (function () {
      var lp = [[platX0 + 1.5, platZ0 + 0.8, 0], [(platX0 + platX1) / 2 + 4, platZ0 + 0.8, 0], [platX1 - 0.8, platZ0 + 0.8, 0], [platX1 - 0.8, (platZ0 + platZ1) / 2 + 6, -Math.PI / 2]];
      var li = inst(lampG, lampTpl(), lp.length), gl = new T.InstancedMesh(new T.PlaneGeometry(30, 30), SH.glow, lp.length), qF = new T.Quaternion().setFromAxisAngle(new T.Vector3(1, 0, 0), -Math.PI / 2), q;
      for (q = 0; q < lp.length; q++) {
        qq.setFromAxisAngle(yAx, lp[q][2]); mtx.compose(pos.set(lp[q][0], 0.2, lp[q][1]), qq, one); li.setMatrixAt(q, mtx);
        mtx.compose(pos.set(lp[q][0] + Math.sin(lp[q][2]) * 2.2, 0.27 + q * 0.004, lp[q][1] + Math.cos(lp[q][2]) * 2.2), qF, one); gl.setMatrixAt(q, mtx);
      }
      gl.frustumCulled = false; gl.renderOrder = 2; lampG.add(gl);
    })();
