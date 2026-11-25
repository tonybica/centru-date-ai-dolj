  function treeTpl(kind) {                    // coroane cu denivelari, nu sfere netede; sub 450 de triunghiuri fiecare
    return tpl(function (g) {
      if (kind === 'poplar') {
        cyl(g, 0.16, 0.3, 3.4, SH.trunk, 0, 1.7, 0, 6);
        lump(g, SH.leaf, 0, 9.2, 0, 1.75, 6.9, 1.7, 0.4, 2, 1.3); lump(g, SH.leaf, 0.3, 5.2, 0.25, 1.45, 3.0, 1.4, 2.1, 1, 4.1);
      } else if (kind === 'conifer') {
        cyl(g, 0.18, 0.3, 2.2, SH.trunk, 0, 1.1, 0, 6);
        [[2.3, 2.6, 2.7, 0.1, 0], [2.0, 2.4, 4.0, -0.08, 0.08], [1.7, 2.3, 5.2, 0.06, -0.06], [1.35, 2.1, 6.4, -0.04, 0.03], [1.0, 2.0, 7.5, 0.03, 0.02], [0.6, 1.9, 8.6, 0, 0]].forEach(function (q, n) {
          cyl(g, 0.01, q[0], q[1], SH.leaf, q[3], q[2], q[4], 9, [0, n * 0.7, 0]);
        });
      } else {
        cyl(g, 0.22, 0.38, 3.4, SH.trunk, 0, 1.7, 0, 6);
        beam(g, SH.trunk, 0, 2.6, 0, 1.3, 4.2, 0.5, 0.2, false);
        lump(g, SH.leaf, 0, 5.9, 0, 3.0, 2.5, 2.8, 0.5, 2, 2.4); lump(g, SH.leaf, 1.5, 4.7, 0.9, 1.9, 1.5, 1.8, 1.4, 1, 5.2);
      }
    });
  }
