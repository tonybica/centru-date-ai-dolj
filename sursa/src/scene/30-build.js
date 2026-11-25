
  /* ---------- campusul pentru un scenariu ---------- */
  function grp(parent) { var g = new T.Group(); parent.add(g); return g; }
  function vpl(parent, w, h, m, x, y, z, rotY) {       // placa subtire in picioare; fara rotatie priveste spre sud
    addGeo(parent, unit('vplane', function () { return new T.PlaneGeometry(1, 1); }), m, x, y, z, w, h, 1, rotY ? [0, rotY, 0] : null, false);
  }
  function quad(parent, m, x, y, z, w, d, ur, vr, swap) {   // dreptunghi pe sol, cu textura repetata de ur x vr ori
    var a = batch.acc(parent, m, false), n0 = a.n, hx = w / 2, hz = d / 2;
    a.pos.push(x - hx, y, z - hz, x + hx, y, z - hz, x + hx, y, z + hz, x - hx, y, z + hz);
    a.nor.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
    if (swap) a.uv.push(0, 0, 0, ur, vr, ur, vr, 0); else a.uv.push(0, 0, ur, 0, ur, vr, 0, vr);
    a.idx.push(n0, n0 + 2, n0 + 1, n0, n0 + 3, n0 + 2); a.n += 4;
  }
  function fenceBox(parent, xa, xb, za, zb, hgt) {
    var posts = [];
    fenceRun(parent, posts, xa, za, xb, za, hgt); fenceRun(parent, posts, xa, zb, xb, zb, hgt); fenceRun(parent, posts, xa, za, xa, zb, hgt); fenceRun(parent, posts, xb, za, xb, zb, hgt);
    fencePosts(parent, posts);
  }
  function fencePosts(parent, posts) { posts.forEach(function (q) { cyl(parent, 0.04, 0.04, q[2] + 0.12, SH.steel, q[0], (q[2] + 0.12) / 2 + 0.03, q[1], 5, null, false); }); }

  /* materiale si piese mici folosite doar de campus (gard viu, tigla, steag, stalpisori, case) */
  function campusMats() {
    if (SH.hedge) return;
    SH.hedge = M(0x4f6a2e, { map: TEX.leaf, roughness: 1, uv: 2.5, env: 0.3 });
    SH.tileRoof = M(0x9a4c38, { roughness: 0.9, env: 0.6 });
    SH.flagEU = M(0x1c3f94, { roughness: 0.8 });
    [[SH.hedge, 0x141c50], [SH.tileRoof, 0x283082], [SH.flagEU, 0x2a3080]].forEach(function (e) { THERM.push({ m: e[0], hot: e[1], base: e[0].color.getHex(), map: e[0].map || null }); });
  }
  function bollard(g, x, z) { cyl(g, 0.08, 0.08, 0.9, SH.stripe, x, 0.65, z, 8, null, false); cyl(g, 0.086, 0.086, 0.14, SH.dark, x, 0.92, z, 8, null, false); }
  var _qGx = null, _qGz = null;
  function gable(g, m, x, yb, z, len, dep, rise, alongZ) {      // acoperis in doua ape: prisma triunghiulara culcata
    if (!_qGx) { _qGx = new T.Quaternion().setFromEuler(new T.Euler(-Math.PI / 2, 0, Math.PI / 2)); _qGz = new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 1, 0), Math.PI / 2).multiply(_qGx); }
    addGeo(g, unit('cyl|1|3', function () { return new T.CylinderGeometry(1, 1, 1, 3); }), m, x, yb + rise / 3, z, dep / 1.732, len, rise / 1.5, alongZ ? _qGz : _qGx, true);
  }
  function house(g, x, z, len, dep, hw, wallM, roofM, alongZ) {
    if (alongZ) box(g, dep, hw, len, wallM, x, hw / 2, z); else box(g, len, hw, dep, wallM, x, hw / 2, z);
    gable(g, roofM, x, hw, z, len + 0.6, dep + 0.7, dep * 0.32, alongZ);
  }

  function build(p) {
    if (!ok) return null;
    if (root) { scene.remove(root); disposeTree(root); }
    campusMats();
    root = new T.Group(); scene.add(root);
    pickObjs = []; tags = []; flows = {}; clouds = []; puffGen = puffHeat = null; batch = new Batch();
    var R = rng(11), i, j, sd;
    var mtx = new T.Matrix4(), q0 = new T.Quaternion(), yAx = new T.Vector3(0, 1, 0), qPi = new T.Quaternion().setFromAxisAngle(yAx, Math.PI), one = new T.Vector3(1, 1, 1), pos = new T.Vector3(), qq = new T.Quaternion(), sc = new T.Vector3(), tc = new T.Color();

    var area = 120 + 650 * p.it, W = Math.sqrt(area * 1.5), D = area / W, H = p.it >= 3 ? 9 : 7;
    var big = p.it >= 0.8, huge = p.it >= 3;
    var zRoad = D / 2 + 34;
