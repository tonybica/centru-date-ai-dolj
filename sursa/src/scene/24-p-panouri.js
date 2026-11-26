  /* ---------- panouri pe acoperis: module culcate pe tabla, invertoare de perete, trasee de cabluri ---------- */
  var PV_MW = 2.28, PV_MD = 1.13, PV_GAP = 0.02, PV_WP = 580, PV_NB = 5;       // modulul (m, Wp) si cate module are un bloc desenat ca instanta
  function pvFrameGeo(key, cut0, cutN) {      // cutie in culoarea ramei de aluminiu (un singur punct din textura modulelor), fara fetele scoase din index
    return unit('pvF' + key, function () {
      var b = new T.BoxGeometry(1, 1, 1), U = b.attributes.uv, i, ix = Array.prototype.slice.call(b.index.array);
      for (i = 0; i < U.count; i++) U.setXY(i, 0.0003, 0.002);
      if (cutN) { ix.splice(cut0, cutN); b.setIndex(ix); }
      return b;
    });
  }
  function pvCell(U, i) { var u = U.getX(i), v = U.getY(i); U.setXY(i, (1 - v) / 26, u * 0.5); }      // o celula din textura: latura lunga a modulului pe x
  function pvModGeo() {                       // un modul intreg: fata de sus cu celule, restul in culoarea ramei
    return unit('pvMod', function () {
      var b = new T.BoxGeometry(1, 1, 1), U = b.attributes.uv, i;
      for (i = 0; i < U.count; i++) { if (i >= 8 && i < 12) pvCell(U, i); else U.setXY(i, 0.0003, 0.002); }
      return b;
    });
  }
  function pvTopGeo() {                       // doar fata de sus a unui modul (pe telefon)
    return unit('pvTop', function () { var g = new T.PlaneGeometry(1, 1), U = g.attributes.uv, i; g.rotateX(-Math.PI / 2); for (i = 0; i < U.count; i++) pvCell(U, i); return g; });
  }
  // un sir de n module culcate, cu latura lunga pe x, pe doua sine de aluminiu prinse de tabla. (cx, cy, cz) = punctul de pe tabla de sub mijlocul sirului,
  // t = inclinarea in jurul axei x (panta acoperisului). Modulele stau la 10 cm deasupra tablei, ca aerul sa treaca pe sub ele.
  function pvRow(g, mat, n, cx, cy, cz, t, cast) {
    var c = Math.cos(t), s = Math.sin(t), rot = t ? [t, 0, 0] : null, P = PV_MW + PV_GAP, L = n * P - PV_GAP, m;
    function put(geo, w, h, d, lx, ly, lz) { addGeo(g, geo, mat, cx + lx, cy + ly * c - lz * s, cz + ly * s + lz * c, w, h, d, rot, cast); }
    if (Q.lite) {
      for (m = 0; m < n; m++) put(pvTopGeo(), PV_MW, 1, PV_MD, (m - (n - 1) / 2) * P, 0.135, 0);
      put(pvFrameGeo('ring', 12, 12), L, 0.135, PV_MD, 0, 0.0675, 0);       // pe telefon marginea coboara pana la tabla, fara sine separate
    } else {
      for (m = 0; m < n; m++) put(pvModGeo(), PV_MW, 0.035, PV_MD, (m - (n - 1) / 2) * P, 0.1175, 0);
      put(pvFrameGeo('bar', 0, 12), L - 0.3, 0.1, 0.04, 0, 0.05, -0.3); put(pvFrameGeo('bar', 0, 12), L - 0.3, 0.1, 0.04, 0, 0.05, 0.3);
    }
  }
  function pvBlockTpl() { return tpl(function (g) { pvRow(g, SH.panel, PV_NB, 0, 0, 0, 0, true); }); }
  function pvMats() {                         // modulele de pe hala centrului se ridica si se sting odata cu acoperisul
    if (SH.pvRoof) return;
    SH.pvRoof = M(0xffffff, { map: TEX.pv, roughness: 0.16, metalness: 0.2, env: 2.6, transparent: true, opacity: 1 });
    ROOFM.push(SH.pvRoof);
    THERM.push({ m: SH.pvRoof, hot: 0xa868d0, base: SH.pvRoof.color.getHex(), map: SH.pvRoof.map, metal: SH.pvRoof.metalness });
  }
  // Un grup de invertoare de sir (circa 100 kW, 1,0 x 0,7 x 0,4 m) pe un perete, sub streasina.
  // o = { x, z = punctul de pe perete in dreptul jgheabului; ux, uz = directia de-a lungul peretelui; nx, nz = directia dinspre perete spre curte;
  //       n = cate invertoare; y0 = cota solului la perete; yE = cota streasinii; side = pe ce parte a jgheabului stau invertoarele (+1 / -1) }
  // Jgheabul de curent continuu coboara la 0,5 m de perete (ocoleste streasina) pe console, pana la jgheabul orizontal de sub invertoare.
  // Cablurile de curent alternativ coboara prin tuburi in caminul de la piciorul peretelui.
  function pvInvSet(g, o) {
    var j, y, y0 = o.y0, sd = o.side || 1, uA = sd > 0 ? -0.35 : -(0.35 + o.n * 1.25), uB = sd > 0 ? 0.35 + o.n * 1.25 : 0.35, alongX = Math.abs(o.ux) > 0.5;
    function P(u, n) { return [o.x + o.ux * u + o.nx * n, o.z + o.uz * u + o.nz * n]; }
    function bx(su, sy, sn, m, u, yy, n, cast) { var q = P(u, n); if (alongX) box(g, su, sy, sn, m, q[0], yy, q[1], cast); else box(g, sn, sy, su, m, q[0], yy, q[1], cast); }
    // jgheabul vertical si consolele lui
    bx(0.2, o.yE - (y0 + 1.0), 0.06, SH.steel, 0, (o.yE + y0 + 1.0) / 2, 0.5, false);
    for (y = y0 + 1.6; y < o.yE - 0.25; y += 1.3) bx(0.04, 0.04, 0.47, SH.steel, 0, y, 0.235, false);
    // jgheabul orizontal de sub invertoare, pe console
    bx(uB - uA, 0.07, 0.2, SH.steel, (uA + uB) / 2, y0 + 1.0, 0.5, false);
    bx(0.04, 0.04, 0.4, SH.steel, uA + 0.15, y0 + 0.945, 0.2, false); bx(0.04, 0.04, 0.4, SH.steel, uB - 0.15, y0 + 0.945, 0.2, false);
    for (j = 0; j < o.n; j++) {
      var u = sd * (0.95 + j * 1.25);
      bx(1.2, 0.04, 0.04, SH.steel, u, y0 + 1.4, 0.02, false); bx(1.2, 0.04, 0.04, SH.steel, u, y0 + 1.82, 0.02, false);       // sinele de prindere de pe perete
      bx(1.0, 0.7, 0.36, SH.white, u, y0 + 1.6, 0.22, true);                                                                  // invertorul
      bx(1.2, 0.025, 0.62, SH.steel, u, y0 + 2.12, 0.31, false);                                                               // copertina
      if (!Q.lite) {
        bx(0.92, 0.18, 0.012, SH.dark, u, y0 + 1.36, 0.406, false);                                                            // capacul bornelor, jos
        bx(0.14, 0.09, 0.014, SH.dark, u + 0.32, y0 + 1.8, 0.407, false);                                                     // afisajul
        bx(0.3, 0.22, 0.05, SH.steel, u + 0.15, y0 + 1.145, 0.42, false);                                                        // sirurile urca din jgheab in invertor
      }
      bx(0.07, 1.25, 0.07, SH.dark, u - 0.32, y0 + 0.625, 0.2, false);                                                        // tubul cablului de curent alternativ
    }
    // caminul de la piciorul peretelui: bordura de beton cu capac de tabla striata
    bx(uB - uA + 0.3, 0.14, 0.75, SH.concrete, (uA + uB) / 2, y0 + 0.07, 0.375, false);
    bx(uB - uA - 0.1, 0.02, 0.36, SH.steel, (uA + uB) / 2, y0 + 0.15, 0.53, false);
  }
