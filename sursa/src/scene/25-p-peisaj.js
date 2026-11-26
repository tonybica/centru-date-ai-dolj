  /* ---------- peisaj: copaci, case de sat, semne de drum ---------- */
  function peisajMats() {                     // materiale folosite doar de imprejurimi: relief, linie de cale ferata, sina, obiecte vopsite pe varfuri, abur, blocuri
    if (SH.imTer) return;
    var Rm = rng(77);
    TEX.imTrk = canvasTex(128, 128, function (g, w, h) {            // o linie: 3,2 m in lat, 2,4 m in lung (4 traverse de lemn pe piatra sparta)
      g.fillStyle = '#7f786c'; g.fillRect(0, 0, w, h);
      speckle(g, w, h, Rm, 2200, ['#6a655b', '#958e80', '#57534b', '#a59e8f', '#74695a'], 1.5, 3.5, 0.5, 0.9);
      g.fillStyle = 'rgba(52,40,30,.3)'; g.fillRect(w * 0.36, 0, w * 0.28, h);                                        // dara de ulei dintre sine
      for (var q = 0; q < 4; q++) {
        g.fillStyle = q % 2 ? '#54483c' : '#5f5244'; g.fillRect(w * 0.094, q * 32 + 9, w * 0.812, 14);
        g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(w * 0.094, q * 32 + 21, w * 0.812, 2);
        g.fillStyle = '#3b3530'; g.fillRect(w * 0.245, q * 32 + 8, w * 0.06, 16); g.fillRect(w * 0.695, q * 32 + 8, w * 0.06, 16);   // placile de sub sine
      }
    });
    TEX.imBlk = canvasTex(128, 128, function (g, w, h) {            // fatada de bloc: 12 m pe repetare, 4 etaje si 4 travee
      g.fillStyle = '#c9c4b6'; g.fillRect(0, 0, w, h);
      blotch(g, w, h, Rm, 6, '120,112,100', 20, 60, 0.18);
      for (var a = 0; a < 4; a++) for (var b = 0; b < 4; b++) {
        g.fillStyle = (a + b) % 3 ? '#3f4a55' : '#56616a'; g.fillRect(a * 32 + 7, b * 32 + 8, 18, 15);
        g.fillStyle = '#a9a394'; g.fillRect(a * 32 + 5, b * 32 + 24, 22, 3);
      }
      g.fillStyle = 'rgba(70,66,60,.5)'; for (var c = 0; c < 4; c++) g.fillRect(0, c * 32 + 30, w, 2);
    });
    SH.imTer = M(0xffffff, { map: TEX.grass, roughness: 1, env: 0.3, vertexColors: true, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 6 });
    SH.imTrk = M(0xffffff, { map: TEX.imTrk, roughness: 1, env: 0.3 });
    SH.imRail = M(0x5b4a3e, { roughness: 0.55, metalness: 0.6, env: 1.2 });
    SH.imVC = M(0xffffff, { roughness: 0.82, metalness: 0.05, vertexColors: true, env: 0.6 });
    SH.imSteam = M(0xffffff, { roughness: 1, transparent: true, opacity: 0.2, depthWrite: false, env: 0.8 });
    SH.imBlk = M(0xffffff, { map: TEX.imBlk, roughness: 0.9, uv: 12, env: 0.5 });
    [[SH.imTer, 0x10163e], [SH.imTrk, 0x161d58], [SH.imRail, 0x25307e], [SH.imVC, 0x2a3080], [SH.imSteam, 0x8a5ac0], [SH.imBlk, 0x34389a]].forEach(function (e) { THERM.push({ m: e[0], hot: e[1], base: e[0].color.getHex(), map: e[0].map || null }); });
  }
  // zgomot neted (0..1) pentru relief si pentru petele de culoare ale solului
  function imHash(i, j) { var s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return s - Math.floor(s); }
  function imVal(x, z) {
    var i = Math.floor(x), j = Math.floor(z), u = x - i, v = z - j; u = u * u * (3 - 2 * u); v = v * v * (3 - 2 * v);
    return imHash(i, j) * (1 - u) * (1 - v) + imHash(i + 1, j) * u * (1 - v) + imHash(i, j + 1) * (1 - u) * v + imHash(i + 1, j + 1) * u * v;
  }
  function imFbm(x, z) { return imVal(x, z) * 0.55 + imVal(x * 2.1 + 7.3, z * 2.1 + 1.7) * 0.3 + imVal(x * 4.3 + 3.1, z * 4.3 + 9.2) * 0.15; }
  function imStep(a, b, v) { v = Math.max(0, Math.min(1, (v - a) / (b - a))); return v * v * (3 - 2 * v); }
  // inaltimea terenului: fund de vale plat (oval, lung pe z), pinteni josi pe margini, apoi dealuri de 150-350 m la 1,8-3,5 km
  function imHill(x, z) {
    var dx = (x + 300) / (x > -300 ? 1300 : 1400), dz = (z + 145) / 3300, e = Math.sqrt(dx * dx + dz * dz);
    var n2 = imFbm(x / 2600 + 5, z / 2600 + 3), t = e - 1 - (n2 - 0.5) * 0.3;
    if (t <= 0) return 0;
    var n = imFbm(x / 850, z / 850), rise = t / (t + 0.5);
    return imStep(0, 0.4, t) * (30 + rise * (230 + 240 * n2) * (0.45 + 1.1 * n)) * (0.9 + 0.2 * imVal(x / 260 + 3, z / 260 + 8));
  }
  function imTerrain(parent) {                // o singura plasa: vale + dealuri impadurite, colorata pe varfuri
    var nx = Q.lite ? 60 : 88, nz = Q.lite ? 66 : 98, xa = -5600, xb = 5000, za = -5800, zb = 5500, P = [], C = [], U = [], I = [], i, j;
    for (j = 0; j <= nz; j++) for (i = 0; i <= nx; i++) {
      var x = xa + (xb - xa) * i / nx, z = za + (zb - za) * j / nz, h = imHill(x, z), m = imFbm(x / 330 + 2, z / 330 + 4), r, g, b;
      var dry = imStep(0.42, 0.78, m), ind = x < -70 && x > -1500 && z > -1700 && z < 1500 ? 0.4 : 0;     // platforma chimica: mai mult pamant gol si pietris
      dry = Math.min(1, dry + ind);
      r = 0.92 + dry * 0.75; g = 0.94 + dry * 0.2; b = 0.9 + dry * 0.8;
      if (h > 0) {
        var f = imStep(2, 34, h), sh = 0.72 + 0.5 * imFbm(x / 380 + 1, z / 380 + 6), cl = h < 170 && imFbm(x / 620 + 9, z / 620 + 2) > 0.63 ? 1 : 0;
        var fr = cl ? 1.15 : 0.26 * sh, fg = cl ? 1.04 : 0.38 * sh, fb = cl ? 0.92 : 0.5 * sh;                 // padure inchisa, cu poieni si pasuni pe coastele joase
        r += (fr - r) * f; g += (fg - g) * f; b += (fb - b) * f;
      }
      P.push(x, h - 0.05, z); C.push(r, g, b); U.push(x / 150, z / 150);
    }
    for (j = 0; j < nz; j++) for (i = 0; i < nx; i++) { var a = j * (nx + 1) + i, c = a + nx + 1; I.push(a, c, a + 1, a + 1, c, c + 1); }
    var geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.Float32BufferAttribute(P, 3)); geo.setAttribute('color', new T.Float32BufferAttribute(C, 3)); geo.setAttribute('uv', new T.Float32BufferAttribute(U, 2));
    geo.setIndex(I); geo.computeVertexNormals();
    var me = new T.Mesh(geo, SH.imTer); me.receiveShadow = true; me.frustumCulled = false; parent.add(me); return me;
  }
  // obiecte vopsite pe varfuri: tot ce e departe sau marunt in jurul bazei intra in doua plase (cu umbra si fara), oricate culori ar avea
  function ImVC() { this.pos = []; this.nor = []; this.col = []; this.idx = []; this.n = 0; }
  var _imC = null, _imQx = null, _imQz = null;
  ImVC.prototype.add = function (geo, c, x, y, z, sx, sy, sz, rot, cTop) {
    if (!_imC) _imC = [new T.Color(), new T.Color()];
    var P = geo.attributes.position, N = geo.attributes.normal, I = geo.index, n0 = this.n, i, k, ca = _imC[0].set(c), cb = cTop === undefined ? ca : _imC[1].set(cTop);
    if (rot && rot.isQuaternion) _q.copy(rot); else { _e.set(rot ? rot[0] : 0, rot ? rot[1] : 0, rot ? rot[2] : 0); _q.setFromEuler(_e); }
    _m4.compose(_v.set(x, y, z), _q, _s.set(sx, sy, sz)); _n3.getNormalMatrix(_m4);
    for (i = 0; i < P.count; i++) {
      k = cTop === undefined ? 0 : Math.max(0, Math.min(1, P.getY(i) + 0.5));
      this.col.push(ca.r + (cb.r - ca.r) * k, ca.g + (cb.g - ca.g) * k, ca.b + (cb.b - ca.b) * k);
      _v.set(P.getX(i), P.getY(i), P.getZ(i)).applyMatrix4(_m4); this.pos.push(_v.x, _v.y, _v.z);
      _v.set(N.getX(i), N.getY(i), N.getZ(i)).applyMatrix3(_n3).normalize(); this.nor.push(_v.x, _v.y, _v.z);
    }
    if (I) for (i = 0; i < I.count; i++) this.idx.push(I.getX(i) + n0); else for (i = 0; i < P.count; i++) this.idx.push(n0 + i);
    this.n += P.count;
  };
  ImVC.prototype.box = function (w, h, d, c, x, y, z, rot, cTop) { this.add(unit('box', function () { return new T.BoxGeometry(1, 1, 1); }), c, x, y, z, w, h, d, rot, cTop); };
  ImVC.prototype.cyl = function (rt, rb, h, c, x, y, z, seg, rot, cTop) {
    seg = seg || 10; var ratio = Math.round(rt / rb * 100) / 100;
    this.add(unit('cyl|' + ratio + '|' + seg, function () { return new T.CylinderGeometry(ratio, 1, 1, seg); }), c, x, y, z, rb, h, rb, rot, cTop);
  };
  ImVC.prototype.sph = function (r, c, x, y, z, sy, det, cTop) {           // sfera cu umbrire neteda (normala = directia din centru)
    det = det === undefined ? 1 : det;
    this.add(unit('icoS' + det, function () { var g = new T.IcosahedronGeometry(1, det); g.setAttribute('normal', g.attributes.position.clone()); return g; }), c, x, y, z, r, r * (sy || 1), r, null, cTop);
  };
  ImVC.prototype.beam = function (c, x0, y0, z0, x1, y1, z1, t) {
    _a.set(x0, y0, z0); _b.set(x1, y1, z1); var len = _a.distanceTo(_b), qb = new T.Quaternion().setFromUnitVectors(_up, _b.clone().sub(_a).normalize());
    this.box(t, len, t, c, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, qb);
  };
  ImVC.prototype.gable = function (c, x, yb, z, len, dep, rise, alongZ) {      // acoperis in doua ape, ca `gable`
    if (!_imQx) { _imQx = new T.Quaternion().setFromEuler(new T.Euler(-Math.PI / 2, 0, Math.PI / 2)); _imQz = new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 1, 0), Math.PI / 2).multiply(_imQx); }
    this.add(unit('cyl|1|3', function () { return new T.CylinderGeometry(1, 1, 1, 3); }), c, x, yb + rise / 3, z, dep / 1.732, len, rise / 1.5, alongZ ? _imQz : _imQx);
  };
  ImVC.prototype.hall = function (x, z, len, dep, h, cw, cr, alongZ, doors) {   // hala sau casa vecina: soclu, pereti, acoperis in doua ape, porti pe latura lunga dinspre baza
    var lx = alongZ ? dep : len, lz = alongZ ? len : dep, q;
    this.box(lx + 0.2, 0.4, lz + 0.2, 0x5a5d5c, x, 0.2, z); this.box(lx, h - 0.4, lz, cw, x, 0.4 + (h - 0.4) / 2, z);
    this.gable(cr, x, h, z, len + 0.6, dep + 0.7, dep * 0.11 + 0.3, alongZ);
    for (q = 0; q < (doors || 0); q++) {
      var u = (q + 0.5) / doors * len - len / 2, dh = Math.min(4.2, h - 1);
      if (alongZ) this.box(0.1, dh, 3.6, 0x3a4046, x - lx / 2 - 0.03, 0.4 + dh / 2, z + u); else this.box(3.6, dh, 0.1, 0x3a4046, x + u, 0.4 + dh / 2, z + lz / 2 + 0.03);
    }
  };
  ImVC.prototype.flush = function (parent, mat, cast) {
    if (!this.n) return null;
    var g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new T.Float32BufferAttribute(this.nor, 3)); g.setAttribute('color', new T.Float32BufferAttribute(this.col, 3));
    g.setIndex(this.n > 65535 ? new T.Uint32BufferAttribute(this.idx, 1) : new T.Uint16BufferAttribute(this.idx, 1));
    var me = new T.Mesh(g, mat); me.castShadow = !!cast; me.receiveShadow = true; me.frustumCulled = false; parent.add(me);
    this.pos = []; this.nor = []; this.col = []; this.idx = []; this.n = 0; return me;
  };
  // vagoane de marfa pe 4 osii, 12,6 m peste tampoane; y = 0 este fata de sus a sinei, vagonul e lung pe z. Culoarea vine de la fiecare vagon.
  function imUnder(g) {                       // sasiu, doua boghiuri, osii cu roti, tampoane
    var e, s, ws = 6;
    box(g, 2.5, 0.28, 11.4, SH.dark, 0, 1.12, 0);
    for (e = -1; e <= 1; e += 2) for (s = -1; s <= 1; s += 2) {
      cyl(g, 0.46, 0.46, 1.56, SH.dark, 0, 0.46, e * 4.1 + s * 0.9, ws, [0, 0, Math.PI / 2], false);
      box(g, 0.3, 0.3, 0.6, SH.dark, s * 0.87, 1.06, e * 5.99, false);
      if (!Q.lite) box(g, 0.14, 0.32, 2.7, SH.dark, s * 1.0, 0.52, e * 4.1, false);
    }
  }
  function imTankTpl() {                      // cisterna: rezervor de 2,9 m diametru pe sei, dom de incarcare, podet si scara
    var sg = Q.lite ? 8 : 12;
    return tpl(function (g) {
      imUnder(g);
      cyl(g, 1.45, 1.45, 10.3, SH.paint, 0, 2.86, 0, sg, [Math.PI / 2, 0, 0]);
      cyl(g, 1.22, 1.22, 10.66, SH.paint, 0, 2.86, 0, sg, [Math.PI / 2, 0, 0], false);      // fundurile bombate
      box(g, 2.3, 0.5, 0.35, SH.dark, 0, 1.5, 3.5, false); box(g, 2.3, 0.5, 0.35, SH.dark, 0, 1.5, -3.5, false);
      if (!Q.lite) { cyl(g, 0.42, 0.42, 0.4, SH.paint, 0, 4.45, 0, 8, null, false); box(g, 0.7, 0.05, 2.6, SH.dark, 0, 4.36, 0, false); box(g, 0.06, 3.0, 0.5, SH.dark, 1.42, 2.75, 1.2, false); }
    });
  }
  function imHopTpl() {                       // vagon acoperit cu descarcare pe jos (soda, ingrasaminte): pereti inclinati la capete, guri de golire
    return tpl(function (g) {
      imUnder(g);
      taper(g, 2.9, 1.3, 8.6, SH.paint, 0, 1.91, 0, 1, 1.3, 0, true);
      box(g, 2.9, 1.5, 11.2, SH.paint, 0, 3.31, 0);
      box(g, 2.3, 0.22, 10.8, SH.paint, 0, 4.17, 0, false);
      if (!Q.lite) { taper(g, 1.6, 0.5, 1.6, SH.dark, 0, 0.9, 1.6, 1.5, 1.5, 0, false); taper(g, 1.6, 0.5, 1.6, SH.dark, 0, 0.9, -1.6, 1.5, 1.5, 0, false); box(g, 0.06, 2.8, 0.5, SH.dark, 1.47, 2.7, 5.2, false); }
    });
  }
  function imLampTpl() {                      // stalp de strada de 9 m, cu brat spre drum (+x) si corp de iluminat
    return tpl(function (g) {
      cyl(g, 0.06, 0.11, 8.8, SH.steel, 0, 4.4, 0, 6);
      box(g, 0.5, 0.12, 0.5, SH.steel, 0, 0.06, 0, false);
      beam(g, SH.steel, 0, 8.7, 0, 1.6, 9.0, 0, 0.08, false);
      box(g, 0.7, 0.1, 0.3, SH.lampHead, 1.75, 8.98, 0, false);
    });
  }
  function treeTpl(kind, det) {                    // la inaltimea reala: plop de aliniament 22 m, salcam sau nuc 11 m, brad 9 m; coroane cu denivelari
    var d2 = det !== undefined ? det : Q.lite ? 1 : 2;
    return tpl(function (g) {
      if (kind === 'poplar') {
        cyl(g, 0.2, 0.36, 5.2, SH.trunk, 0, 2.6, 0, 6);
        lump(g, SH.leaf, 0, 13.2, 0, 2.3, 9.2, 2.2, 0.4, d2, 1.3); lump(g, SH.leaf, 0.35, 7.0, 0.3, 1.9, 4.0, 1.85, 2.1, 1, 4.1);
      } else if (kind === 'conifer') {
        cyl(g, 0.18, 0.3, 2.2, SH.trunk, 0, 1.1, 0, 6);
        [[2.3, 2.6, 2.7, 0.1, 0], [2.0, 2.4, 4.0, -0.08, 0.08], [1.7, 2.3, 5.2, 0.06, -0.06], [1.35, 2.1, 6.4, -0.04, 0.03], [1.0, 2.0, 7.5, 0.03, 0.02], [0.6, 1.9, 8.6, 0, 0]].forEach(function (q, n) {
          cyl(g, 0.01, q[0], q[1], SH.leaf, q[3], q[2], q[4], Q.lite ? 7 : 9, [0, n * 0.7, 0]);
        });
      } else {
        cyl(g, 0.24, 0.42, 4.2, SH.trunk, 0, 2.1, 0, 6);
        beam(g, SH.trunk, 0, 3.0, 0, 1.6, 5.4, 0.6, 0.22, false);
        lump(g, SH.leaf, 0, 7.6, 0, 3.9, 3.3, 3.7, 0.5, d2, 2.4); lump(g, SH.leaf, 1.9, 6.0, 1.1, 2.5, 2.0, 2.4, 1.4, 1, 5.2);
      }
    });
  }
  // casa de sat sau hala de ferma: pereti pe soclu, acoperis in doua ape, usa, ferestre si horn; fata e latura lunga dinspre sud (sau est, cand e lunga pe z)
  function casa(g, x, z, len, dep, hw, wallM, roofM, alongZ, barn) {
    house(g, x, z, len, dep, hw, wallM, roofM, alongZ);
    function at(u, y, w, h, m, off) {         // placa subtire pe fata: u = pozitia de-a lungul casei
      if (alongZ) box(g, 0.06, h, w, m, x + dep / 2 + (off || 0.02), y, z + u); else box(g, w, h, 0.06, m, x + u, y, z + dep / 2 + (off || 0.02));
    }
    if (alongZ) box(g, dep + 0.16, 0.35, len + 0.16, SH.base, x, 0.175, z); else box(g, len + 0.16, 0.35, dep + 0.16, SH.base, x, 0.175, z);
    if (barn) {                               // hala: doua porti mari si un sir de ferestre inguste sus
      at(-len * 0.22, 1.75, 3.6, 3.5, SH.trim); at(len * 0.22, 1.75, 3.6, 3.5, SH.trim);
      for (var b = -2; b <= 2; b++) at(b * len / 5.5, hw - 0.6, 1.6, 0.5, SH.glass, 0.03);
      return;
    }
    var n = Math.max(3, Math.round(len / 2.8)), u0 = -len / 2, st = len / n, dj = Math.floor(n / 2);
    for (var q = 0; q < n; q++) {
      var u = u0 + (q + 0.5) * st;
      if (q === dj) { at(u, 1.37, 0.95, 2.05, SH.trim); at(u, 0.26, 1.5, 0.18, SH.base, 0.3); }      // usa si treapta
      else { at(u, 1.72, 0.95, 1.15, SH.glass); at(u, 1.1, 1.1, 0.08, SH.white, 0.05); }               // fereastra si pervaz
    }
    var hy = hw + dep * 0.32 * 0.55 + 0.45;                                                              // hornul iese prin acoperis
    if (alongZ) box(g, 0.5, 1.5, 0.5, SH.tileRoof, x - dep * 0.14, hy, z + len * 0.22); else box(g, 0.5, 1.5, 0.5, SH.tileRoof, x + len * 0.22, hy, z - dep * 0.14);
  }
  // indicator rutier pe stalp, la marginea drumului national; face = +1 priveste spre est (pentru cei care vin dinspre est), -1 spre vest
  function semn(g, x, z, kind, face) {
    cyl(g, 0.035, 0.035, 2.75, SH.silver, x, 1.375, z, 6);
    box(g, 0.3, 0.25, 0.3, SH.base, x, 0.125, z);                                                 // fundatia de beton
    var fx = x + face * 0.04;
    if (kind === 0) {                         // triunghi de avertizare: intersectie cu drum fara prioritate
      cyl(g, 0.56, 0.56, 0.02, SH.red, fx, 2.2, z, 3, [-Math.PI / 2, 0, Math.PI / 2]); cyl(g, 0.4, 0.4, 0.024, SH.white, fx + face * 0.012, 2.2, z, 3, [-Math.PI / 2, 0, Math.PI / 2]);
    } else {                                  // rotund: limita de viteza
      cyl(g, 0.36, 0.36, 0.02, SH.red, fx, 2.3, z, 18, [0, 0, Math.PI / 2]); cyl(g, 0.27, 0.27, 0.024, SH.white, fx + face * 0.012, 2.3, z, 18, [0, 0, Math.PI / 2]);
    }
  }
  function borna(g, x, z) {                   // borna kilometrica de drum national: alba, cu capul rosu
    box(g, 0.3, 0.55, 0.22, SH.white, x, 0.275, z); box(g, 0.31, 0.2, 0.23, SH.red, x, 0.65, z);
  }
