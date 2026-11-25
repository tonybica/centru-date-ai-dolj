/* ================= SCENA 3D: macheta campusului =================
   Axe: x = est, z = sud, y = sus. Panourile privesc spre sud (+z), drumul trece pe la sud. Unitati: metri. */
var Scene3D = (function () {
  'use strict';
  var T = window.THREE;
  var host, canvas, labelHost, renderer, scene, camera, root = null, sunLight, moonLight, hemi;
  var L = null;
  var cam = { tx: 0, ty: 0, tz: 0, dist: 300, az: 0.6, pol: 1.0 }, goal = null;
  var flows = {}, fans = [], labelEls = {}, pickObjs = [];
  var roofGroup = null, wallGroup = null, roofOpen = false, roofK = 0;
  var handlers = { pick: null, hover: null, north: null, touched: null };
  var auto = false, lastT = 0, ok = false, nightK = 0, running = true;
  var parts = null, buildK = [1, 1, 1, 1, 1, 1, 1, 1], outage = 0, rackOpen = false, rackK = 0, thermal = false, labelOn = {}, clouds = [], puffGen = null, puffHeat = null, THERM = [];
  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var SH = null;
  var COL = { sun: 0xf2a600, batt: 0x00b894, grid: 0x257de0, fiber: 0x7a5cf0, gen: 0xe4572e };

  function M(c, o) {
    o = o || {}; o.color = c;
    if (o.roughness === undefined) o.roughness = 0.85;
    if (o.metalness === undefined) o.metalness = 0.02;
    return new T.MeshStandardMaterial(o);
  }
  function canvasTex(w, h, draw) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 8; return t;
  }
  function rng(seed) {
    var a = seed >>> 0;
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }

  function initShared() {
    SH = {};
    SH.wall = M(0xf3f4f0); SH.wallIn = M(0xe3e6e1); SH.base = M(0x2b3430); SH.stripe = M(0xf2a600, { roughness: 0.6 });
    SH.roof = new T.MeshStandardMaterial({ color: 0xdde1da, roughness: 0.9, transparent: true, opacity: 1 });
    SH.floor = M(0xb9beb8); SH.concrete = M(0xcdd1ca); SH.gravel = M(0xa9aca4); SH.asphalt = M(0x383e41);
    SH.ground = M(0x9aad68, { roughness: 1 }); SH.white = M(0xfafafa); SH.steel = M(0x8d969b, { metalness: 0.5, roughness: 0.5 });
    SH.dark = M(0x23282c); SH.silver = M(0xcfd5d8, { metalness: 0.45, roughness: 0.45 }); SH.trafo = M(0x5f6f66); SH.trafoFin = M(0x4a5750);
    SH.ceramic = M(0xb8693f); SH.frame = M(0xb4bcc4, { metalness: 0.5, roughness: 0.5 }); SH.panelBack = M(0x9aa3ab);
    SH.green = M(0x00b894, { roughness: 0.6 }); SH.blue = M(0x2f7fe0); SH.red = M(0xd9534a);
    SH.tree = M(0x4f7a3a, { roughness: 1 }); SH.tree2 = M(0x6a9148, { roughness: 1 }); SH.trunk = M(0x6b4f3a);
    SH.glass = new T.MeshStandardMaterial({ color: 0x9cc3d8, roughness: 0.2, metalness: 0.1, emissive: 0xffd28a, emissiveIntensity: 0 });
    SH.windowGlow = new T.MeshStandardMaterial({ color: 0x35424a, roughness: 0.3, emissive: 0xffd9a0, emissiveIntensity: 0 });
    SH.wire = new T.LineBasicMaterial({ color: 0x3a4246 });
    SH.lattice = new T.MeshBasicMaterial({ color: 0x69747a, wireframe: true });
    SH.fence = new T.MeshStandardMaterial({ color: 0x3d4a44, transparent: true, opacity: 0.32, roughness: 1 });
    SH.hot = new T.MeshBasicMaterial({ color: 0xe8573f, transparent: true, opacity: 0.28 });
    SH.cold = new T.MeshBasicMaterial({ color: 0x3f8fe8, transparent: true, opacity: 0.22 });
    SH.screen = new T.MeshBasicMaterial({ color: 0x7fd6ff });
    SH.led = new T.MeshBasicMaterial({ color: 0x35e08a });
    SH.zone = new T.MeshBasicMaterial({ colorWrite: false, depthWrite: false, transparent: true, opacity: 0 });

    SH.copper = M(0xc8793a, { metalness: 0.6, roughness: 0.35 }); SH.pcb = M(0x1f6b45, { roughness: 0.6 }); SH.person = M(0xf2a600, { roughness: 0.7 }); SH.skin = M(0xd9a47a);
    SH.upsLed = new T.MeshBasicMaterial({ color: 0x35e08a });
    var shadeTex = canvasTex(128, 128, function (g, w, h) {
      var gr = g.createRadialGradient(64, 64, 6, 64, 64, 64); gr.addColorStop(0, 'rgba(20,30,40,1)'); gr.addColorStop(0.55, 'rgba(20,30,40,.75)'); gr.addColorStop(1, 'rgba(20,30,40,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });
    SH.cloud = new T.MeshBasicMaterial({ map: shadeTex, transparent: true, opacity: 0.3, depthWrite: false, fog: false });
    SH.lampHead = new T.MeshBasicMaterial({ color: 0x8a8f8c });
    SH.smoke = new T.MeshBasicMaterial({ color: 0x6f6f6f, transparent: true, opacity: 0.34, depthWrite: false });
    SH.heat = new T.MeshBasicMaterial({ color: 0xff9a3c, transparent: true, opacity: 0.3, depthWrite: false });
    var glowTex = canvasTex(64, 64, function (g, w, h) {
      var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,226,160,1)'); gr.addColorStop(0.5, 'rgba(255,214,140,.35)'); gr.addColorStop(1, 'rgba(255,214,140,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });
    SH.glow = new T.MeshBasicMaterial({ map: glowTex, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending });

    var panelTex = canvasTex(520, 92, function (g, w, h) {
      g.fillStyle = '#aab4bf'; g.fillRect(0, 0, w, h);
      for (var i = 0; i < 26; i++) for (var j = 0; j < 2; j++) {
        var gr = g.createLinearGradient(0, j * 46, 0, j * 46 + 46);
        gr.addColorStop(0, '#1f447d'); gr.addColorStop(1, '#142d57');
        g.fillStyle = gr; g.fillRect(i * 20 + 1, j * 46 + 1, 18, 44);
        g.strokeStyle = 'rgba(160,190,235,.22)'; g.lineWidth = 0.6;
        g.beginPath(); g.moveTo(i * 20 + 10, j * 46 + 1); g.lineTo(i * 20 + 10, j * 46 + 45); g.moveTo(i * 20 + 1, j * 46 + 23); g.lineTo(i * 20 + 19, j * 46 + 23); g.stroke();
      }
    });
    SH.panel = new T.MeshStandardMaterial({ map: panelTex, roughness: 0.32, metalness: 0.35 });

    var rackTex = canvasTex(48, 160, function (g, w, h) {
      g.fillStyle = '#14181c'; g.fillRect(0, 0, w, h);
      var r = rng(7), cols = ['#35e08a', '#35e08a', '#35e08a', '#58b7ff', '#ffb53c'];
      for (var y = 8; y < h - 6; y += 9) {
        g.fillStyle = '#20262b'; g.fillRect(4, y, w - 8, 6);
        for (var x = 7; x < w - 8; x += 6) { if (r() > 0.35) { g.fillStyle = cols[Math.floor(r() * cols.length)]; g.fillRect(x, y + 2, 2, 2); } }
      }
    });
    SH.rackFront = new T.MeshStandardMaterial({ map: rackTex, emissiveMap: rackTex, emissive: 0xffffff, emissiveIntensity: 1.1, roughness: 0.6 });
    SH.rackBody = M(0x1b2024, { roughness: 0.6 });
    SH.rackAlt = M(0x39424a, { roughness: 0.6 });

    var stripes = canvasTex(64, 64, function (g, w, h) {
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#dcdcdc'; for (var y = 0; y < h; y += 16) g.fillRect(0, y, w, 8);
    });
    stripes.wrapS = stripes.wrapT = T.RepeatWrapping;
    SH.stripesTex = stripes;
    SH.crops = [0xc8b45c, 0x8faa55, 0xa9b867, 0xd6c268, 0x7b9a50, 0xb39b5e, 0x9db56a, 0xc2ad62].map(function (c) {
      return new T.MeshStandardMaterial({ color: c, map: stripes, roughness: 1 });
    });
    // vedere termica: ce culoare ia fiecare material cand aratam "temperatura"
    function disp(hex) { return new T.Color(hex).convertSRGBToLinear().getHex(); }     // culoarea tinta de pe ecran -> valoarea materialului
    THERM = [[SH.wall, 0x2c3484], [SH.wallIn, 0x3a3a96], [SH.base, 0x20245f], [SH.stripe, 0x2c3484], [SH.roof, 0x2a3080], [SH.floor, 0x3b3a9a], [SH.concrete, 0x1e2462], [SH.gravel, 0x1e2462], [SH.asphalt, 0x262a6e], [SH.ground, 0x141a4a],
      [SH.white, 0x4a3da6], [SH.steel, 0x343a8c], [SH.dark, 0x46389e], [SH.silver, 0xf0823a], [SH.trafo, 0xe2603c], [SH.trafoFin, 0xee7440], [SH.ceramic, 0x6a48ae], [SH.frame, 0x6a48ae], [SH.panelBack, 0x6a48ae],
      [SH.green, 0x5a40a8], [SH.blue, 0x2fb4ff], [SH.red, 0xff6a2a], [SH.tree, 0x162058], [SH.tree2, 0x1a2460], [SH.trunk, 0x162058], [SH.glass, 0x3a3a96], [SH.windowGlow, 0x5a40a8], [SH.rackBody, 0xffb040], [SH.rackAlt, 0xf2883a], [SH.rackFront, 0xffe070],
      [SH.copper, 0xfff2a8], [SH.pcb, 0xff9a3c], [SH.person, 0xf29a3c], [SH.skin, 0xf29a3c]].map(function (e) { return { m: e[0], hot: disp(e[1]), base: e[0].color.getHex() }; });
    THERM.push({ m: SH.panel, hot: 0xb070d8, base: SH.panel.color.getHex() });
    SH.crops.forEach(function (m) { THERM.push({ m: m, hot: disp(0x161c50), base: m.color.getHex() }); });
  }

  function box(parent, w, h, d, m, x, y, z, cast) {
    var me = new T.Mesh(new T.BoxGeometry(w, h, d), m);
    me.position.set(x, y, z); me.castShadow = cast !== false; me.receiveShadow = true; parent.add(me); return me;
  }
  function cyl(parent, rt, rb, h, m, x, y, z, seg) {
    var me = new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg || 12), m);
    me.position.set(x, y, z); me.castShadow = true; me.receiveShadow = true; parent.add(me); return me;
  }
  function tag(obj, id) { obj.traverse(function (o) { if (o.isMesh) { o.userData.pick = id; pickObjs.push(o); } }); }
  function zone(parent, id, xa, xb, za, zb, h) {     // zona invizibila, ca obiectele mici sa fie usor de apasat
    var me = new T.Mesh(new T.BoxGeometry(Math.abs(xb - xa), h, Math.abs(zb - za)), SH.zone);
    me.position.set((xa + xb) / 2, h / 2, (za + zb) / 2); me.userData.pick = id; me.renderOrder = -1; parent.add(me); pickObjs.push(me);
  }
  function disposeTree(o) { o.traverse(function (c) { if (c.geometry) c.geometry.dispose(); }); }

  /* ---------- fluxuri de energie: cablu pe sol + puncte care curg ---------- */
  function Flow(parent, pts, color, k, n) {
    this.pts = pts.map(function (p) { return new T.Vector3(p[0], 0.35 * k, p[1]); });
    this.seg = []; this.len = 0;
    for (var i = 1; i < this.pts.length; i++) { var d = this.pts[i].distanceTo(this.pts[i - 1]); this.seg.push(d); this.len += d; }
    this.k = k; this.n = n || 10; this.phase = 0; this.dir = 1; this.power = 0; this.active = 0;
    var cm = new T.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.35 });
    this.cableMat = cm; this.group = new T.Group(); parent.add(this.group);
    for (i = 1; i < this.pts.length; i++) {
      var a = this.pts[i - 1], b = this.pts[i], mid = a.clone().add(b).multiplyScalar(0.5);
      var me = new T.Mesh(new T.BoxGeometry(0.55 * k, 0.12 * k, this.seg[i - 1] + 0.55 * k), cm);
      me.position.copy(mid); me.lookAt(b); this.group.add(me);
    }
    this.dotMat = new T.MeshBasicMaterial({ color: color });
    this.dots = [];
    var sg = new T.SphereGeometry(1, 12, 8);
    for (i = 0; i < this.n; i++) { var s = new T.Mesh(sg, this.dotMat); s.visible = false; this.group.add(s); this.dots.push(s); }
  }
  Flow.prototype.at = function (u, out) {
    var d = u * this.len;
    for (var i = 0; i < this.seg.length; i++) {
      if (d <= this.seg[i] || i === this.seg.length - 1) { return out.copy(this.pts[i]).lerp(this.pts[i + 1], Math.min(1, d / this.seg[i])); }
      d -= this.seg[i];
    }
    return out;
  };
  Flow.prototype.set = function (frac, dir, color) {   // frac 0..1 = cat de mult curge
    this.power = Math.max(0, Math.min(1, frac)); this.dir = dir || 1;
    if (color !== undefined) { this.dotMat.color.setHex(color); this.cableMat.color.setHex(color); }
    this.active = this.power > 0.004 ? Math.max(2, Math.round(this.n * (0.25 + 0.75 * this.power))) : 0;
    this.cableMat.opacity = this.active ? 0.6 : 0.18;
  };
  Flow.prototype.update = function (dt, camPos) {
    var speed = (16 + 26 * this.power) * this.k / this.len;
    if (!reduced) this.phase = (this.phase + dt * speed) % 1;
    for (var i = 0; i < this.n; i++) {
      var s = this.dots[i];
      if (i >= this.active) { s.visible = false; continue; }
      var u = (i / this.active + this.phase) % 1; if (this.dir < 0) u = 1 - u;
      this.at(u, s.position); s.position.y += 0.5 * this.k; s.visible = true;
      s.scale.setScalar(Math.max(0.12, s.position.distanceTo(camPos) * 0.0052));
    }
  };

  /* ---------- pufuri care urca: fum la generatoare, caldura la racitoare ---------- */
  function Puffs(parent, origins, mat, size, rise, n) {
    this.items = []; this.on = 0; this.rise = rise; this.size = size;
    var g = new T.SphereGeometry(1, 8, 6);
    for (var i = 0; i < origins.length; i++) for (var j = 0; j < n; j++) {
      var m = new T.Mesh(g, mat); m.visible = false; parent.add(m);
      this.items.push({ m: m, o: origins[i], ph: ((j + i * 0.37) / n) % 1 });
    }
  }
  Puffs.prototype.update = function (dt) {
    for (var i = 0; i < this.items.length; i++) {
      var it = this.items[i];
      if (this.on <= 0.01) { it.m.visible = false; continue; }
      if (!reduced) it.ph = (it.ph + dt * 0.32) % 1;
      var p = it.ph; it.m.visible = true;
      it.m.position.set(it.o[0] + Math.sin(p * 9 + i) * 0.4 * this.size, it.o[1] + p * this.rise, it.o[2] + Math.cos(p * 7 + i) * 0.4 * this.size);
      it.m.scale.setScalar(this.size * (0.45 + p * 1.3) * (p > 0.8 ? (1 - p) * 5 : 1) * this.on);
    }
  };

  /* ---------- piese ---------- */
  function person(parent, x, y, z) {
    cyl(parent, 0.17, 0.2, 1.3, SH.person, x, y + 0.65, z, 8);
    var h = new T.Mesh(new T.SphereGeometry(0.15, 10, 8), SH.skin); h.position.set(x, y + 1.5, z); h.castShadow = true; parent.add(h);
  }
  function rackDetail(parent, x, z) {       // un rack desenat in detaliu: usa se deschide, un server iese pe sine
    var g = new T.Group(); g.position.set(x, 0.3, z); parent.add(g);
    [[-0.57, -0.27], [-0.57, 0.27], [0.57, -0.27], [0.57, 0.27]].forEach(function (c) { box(g, 0.06, 2.2, 0.06, SH.rackBody, c[0], 1.1, c[1], false); });
    box(g, 1.2, 0.06, 0.6, SH.rackBody, 0, 2.17, 0); box(g, 1.2, 0.06, 0.6, SH.rackBody, 0, 0.03, 0, false);
    box(g, 1.14, 2.08, 0.02, SH.rackBody, 0, 1.1, -0.29, false); box(g, 0.02, 2.08, 0.56, SH.rackBody, -0.59, 1.1, 0, false);
    cyl(g, 0.028, 0.028, 2.0, SH.blue, -0.5, 1.1, -0.2, 8).castShadow = false; cyl(g, 0.028, 0.028, 2.0, SH.red, -0.5, 1.1, 0.2, 8).castShadow = false;
    box(g, 0.05, 1.9, 0.05, SH.copper, -0.5, 1.1, 0, false);
    box(g, 1.0, 0.2, 0.5, SH.silver, 0.02, 0.17, 0, false); box(g, 0.012, 0.03, 0.4, SH.led, 0.53, 0.17, 0, false);
    box(g, 0.8, 0.09, 0.5, SH.rackAlt, 0.12, 2.06, 0, false); box(g, 0.012, 0.04, 0.44, SH.led, 0.525, 2.06, 0, false);
    var out = { g: g, door: null, server: null, cover: null }, m;
    for (var i = 0; i < 4; i++) {
      var s = new T.Group(); s.position.set(0.02, 0.32 + i * 0.42, 0); g.add(s);
      if (i !== 2) {
        box(s, 1.0, 0.36, 0.5, SH.dark, 0, 0.18, 0, false);
        box(s, 0.02, 0.32, 0.48, SH.rackAlt, 0.51, 0.18, 0, false); box(s, 0.012, 0.03, 0.3, SH.led, 0.522, 0.3, 0, false);
        continue;
      }
      out.server = s;
      box(s, 1.0, 0.02, 0.5, SH.steel, 0, 0.01, 0, false);
      box(s, 1.0, 0.34, 0.012, SH.rackAlt, 0, 0.18, -0.244, false); box(s, 1.0, 0.34, 0.012, SH.rackAlt, 0, 0.18, 0.244, false);
      box(s, 0.02, 0.34, 0.5, SH.rackAlt, 0.5, 0.18, 0, false); box(s, 0.012, 0.03, 0.3, SH.led, 0.512, 0.3, 0, false);
      box(s, 0.4, 0.016, 0.44, SH.pcb, -0.16, 0.03, 0, false);                                                     // placa de baza
      box(s, 0.09, 0.07, 0.09, SH.silver, -0.12, 0.075, -0.1, false); box(s, 0.09, 0.07, 0.09, SH.silver, -0.12, 0.075, 0.1, false);   // procesoare
      for (m = 0; m < 8; m++) box(s, 0.13, 0.05, 0.008, SH.dark, -0.27, 0.065, -0.2 + m * 0.057, false);          // memorie
      for (m = 0; m < 4; m++) box(s, 0.16, 0.1, 0.1, SH.silver, -0.41, 0.07, -0.18 + m * 0.12, false);             // surse
      for (m = 0; m < 8; m++) {                                                                                      // cele 8 GPU-uri, fiecare cu placa de racire
        var gz = -0.203 + m * 0.058;
        box(s, 0.36, 0.24, 0.014, SH.pcb, 0.27, 0.15, gz, false);
        box(s, 0.16, 0.13, 0.022, SH.copper, 0.27, 0.17, gz + 0.018, false);
      }
      var t1 = cyl(s, 0.011, 0.011, 0.46, SH.blue, 0.31, 0.295, 0, 6); t1.rotation.x = Math.PI / 2; t1.castShadow = false;
      var t2 = cyl(s, 0.011, 0.011, 0.46, SH.red, 0.23, 0.295, 0, 6); t2.rotation.x = Math.PI / 2; t2.castShadow = false;
      var t3 = cyl(s, 0.011, 0.011, 0.75, SH.blue, -0.07, 0.295, -0.22, 6); t3.rotation.z = Math.PI / 2; t3.castShadow = false;
      var t4 = cyl(s, 0.011, 0.011, 0.67, SH.red, -0.11, 0.295, 0.22, 6); t4.rotation.z = Math.PI / 2; t4.castShadow = false;
      out.cover = box(s, 1.0, 0.016, 0.5, SH.rackAlt, 0, 0.352, 0, false);
    }
    var d = new T.Group(); d.position.set(0.61, 0, -0.3); g.add(d);
    box(d, 0.02, 2.1, 0.6, SH.rackFront, 0, 1.1, 0.3, false);
    out.door = d;
    return out;
  }
  function transformer(parent, x, z, s) {
    box(parent, 3 * s, 2.4 * s, 2 * s, SH.trafo, x, 1.2 * s + 0.3, z);
    box(parent, 2.6 * s, 1.8 * s, 0.5 * s, SH.trafoFin, x, 1.1 * s + 0.3, z + 1.3 * s);
    box(parent, 2.6 * s, 1.8 * s, 0.5 * s, SH.trafoFin, x, 1.1 * s + 0.3, z - 1.3 * s);
    for (var i = -1; i <= 1; i++) cyl(parent, 0.1 * s, 0.17 * s, 1.1 * s, SH.ceramic, x + i * 0.8 * s, 2.4 * s + 0.3 + 0.55 * s, z, 8);
    var c = cyl(parent, 0.35 * s, 0.35 * s, 2.2 * s, SH.trafo, x, 3.1 * s + 0.3, z - 0.55 * s, 10); c.rotation.z = Math.PI / 2;
  }
  function genset(parent, x, z, len, s) {     // lungimea pe axa x
    box(parent, len, 2.9 * s, 2.6 * s, SH.dark, x, 1.45 * s + 0.2, z);
    box(parent, 0.15, 2.0 * s, 2.0 * s, SH.steel, x - len / 2 - 0.08, 1.4 * s + 0.2, z);
    cyl(parent, 0.22 * s, 0.22 * s, 1.6 * s, SH.steel, x + len * 0.3, 2.9 * s + 0.8 * s, z, 8);
    var t = cyl(parent, 0.7 * s, 0.7 * s, len * 0.5, SH.white, x, 0.9 * s, z + 2.4 * s, 10); t.rotation.z = Math.PI / 2;
  }
  function cooler(parent, x, z, len) {         // racitor uscat, lungimea pe x
    box(parent, len, 1.5, 2.3, SH.silver, x, 2.15, z);
    for (var i = -1; i <= 1; i += 2) for (var j = -1; j <= 1; j += 2) box(parent, 0.14, 1.4, 0.14, SH.steel, x + i * (len / 2 - 0.3), 0.7, z + j * 1.0, false);
    var nf = Math.max(2, Math.round(len / 2.3));
    for (var f = 0; f < nf; f++) {
      var fx = x - len / 2 + (f + 0.5) * len / nf;
      cyl(parent, 0.95, 0.95, 0.1, SH.dark, fx, 2.95, z, 16).castShadow = false;
      var g = new T.Group(); g.position.set(fx, 3.03, z); parent.add(g);
      box(g, 1.7, 0.04, 0.26, SH.silver, 0, 0, 0, false); box(g, 0.26, 0.04, 1.7, SH.silver, 0, 0, 0, false);
      fans.push(g);
    }
  }
  function pylon(parent, x, z, h, big) {
    var g = new T.Group(); g.position.set(x, 0, z); parent.add(g);
    var a = big ? h * 0.2 : 1.4;
    if (big) {
      var body = new T.Mesh(new T.CylinderGeometry(0.5, h * 0.11, h, 4, 5, true), SH.lattice); body.position.y = h / 2; body.rotation.y = Math.PI / 4; g.add(body);
      box(g, 0.35, 0.35, a * 2, SH.steel, 0, h * 0.8, 0); box(g, 0.3, 0.3, a * 1.2, SH.steel, 0, h * 0.93, 0);
    } else {
      cyl(g, 0.16, 0.24, h, SH.trunk, 0, h / 2, 0, 8); box(g, 0.2, 0.2, a * 2, SH.steel, 0, h * 0.92, 0);
    }
    var yy = big ? h * 0.8 : h * 0.92;
    return [new T.Vector3(x, yy, z - a), new T.Vector3(x, yy + (big ? h * 0.13 : 0.25), z), new T.Vector3(x, yy, z + a)];
  }
  function wire(parent, a, b, sag) {
    var pts = [];
    for (var i = 0; i <= 12; i++) { var t = i / 12, p = a.clone().lerp(b, t); p.y -= Math.sin(Math.PI * t) * sag; pts.push(p); }
    parent.add(new T.Line(new T.BufferGeometry().setFromPoints(pts), SH.wire));
  }
  function car(parent, x, z, color) {
    box(parent, 1.8, 0.7, 4.2, M(color, { roughness: 0.4 }), x, 0.65, z);
    box(parent, 1.6, 0.6, 2.2, SH.dark, x, 1.25, z - 0.2);
  }

  /* ---------- constructia campusului pentru un scenariu ---------- */
  function build(p) {
    if (!ok) return null;
    if (root) { scene.remove(root); disposeTree(root); }
    root = new T.Group(); scene.add(root);
    fans = []; pickObjs = []; flows = {}; clouds = []; puffGen = puffHeat = null;
    var R = rng(11), i, j;

    var area = 120 + 650 * p.it, W = Math.sqrt(area * 1.5), D = area / W, H = p.it >= 3 ? 9 : 7;
    var big = p.it >= 0.8, huge = p.it >= 3;
    var zRoad = D / 2 + 34;

    /* --- cladirea --- */
    var bld = new T.Group(); root.add(bld);
    var floorM = box(bld, W, 0.3, D, SH.floor, 0, 0.15, 0, false);
    wallGroup = new T.Group(); bld.add(wallGroup);
    var wt = 0.4, bldReal = bld; bld = wallGroup;
    box(bld, W, H, wt, SH.wall, 0, H / 2, -D / 2 + wt / 2); box(bld, W, H, wt, SH.wall, 0, H / 2, D / 2 - wt / 2);
    box(bld, wt, H, D - 2 * wt, SH.wall, -W / 2 + wt / 2, H / 2, 0); box(bld, wt, H, D - 2 * wt, SH.wall, W / 2 - wt / 2, H / 2, 0);
    // soclu inchis si dunga galbena sus
    [[W + 0.1, 0.9, 0.12, 0, 0.45, D / 2 + 0.03], [W + 0.1, 0.9, 0.12, 0, 0.45, -D / 2 - 0.03], [0.12, 0.9, D + 0.1, W / 2 + 0.03, 0.45, 0], [0.12, 0.9, D + 0.1, -W / 2 - 0.03, 0.45, 0]].forEach(function (a) { box(bld, a[0], a[1], a[2], SH.base, a[3], a[4], a[5], false); });
    [[W + 0.14, 0.45, 0.14, 0, H - 0.5, D / 2 + 0.04], [W + 0.14, 0.45, 0.14, 0, H - 0.5, -D / 2 - 0.04], [0.14, 0.45, D + 0.14, W / 2 + 0.04, H - 0.5, 0], [0.14, 0.45, D + 0.14, -W / 2 - 0.04, H - 0.5, 0]].forEach(function (a) { box(bld, a[0], a[1], a[2], SH.stripe, a[3], a[4], a[5], false); });
    // intrare si ferestrele birourilor (colt sud-est)
    var offW = Math.max(5, W * 0.22);
    box(bld, Math.min(5, offW - 1), 3, 2.2, SH.glass, W / 2 - offW / 2, 1.5, D / 2 + 1.1);
    box(bld, offW - 1.2, 1.4, 0.1, SH.windowGlow, W / 2 - offW / 2, 4.6, D / 2 + 0.06, false);
    box(bld, 0.1, 1.4, Math.min(D * 0.5, 9), SH.windowGlow, W / 2 + 0.06, 4.6, D / 2 - Math.min(D * 0.5, 9) / 2 - 1, false);
    // usa de incarcare pe peretele sudic
    box(bld, 3.6, 3.6, 0.12, SH.steel, -W / 2 + W * 0.28 + 3, 1.8, D / 2 + 0.06, false);

    bld = bldReal;
    // interior: zona electrica (vest), sala de date (mijloc), birouri (est)
    var partG = new T.Group(), elec = new T.Group(), itg = new T.Group(), itx = new T.Group(); bld.add(partG); bld.add(elec); bld.add(itg); itg.add(itx);
    var xE = -W / 2 + W * 0.28, xO = W / 2 - offW;
    box(partG, 0.25, 3.2, D - 1, SH.wallIn, xE, 1.75, 0, false); box(partG, 0.25, 3.2, D - 1, SH.wallIn, xO, 1.75, 0, false);
    // tablouri si UPS-uri
    var nUps = Math.min(18, Math.max(3, Math.ceil(p.it * 4)));
    var perL = Math.max(2, Math.floor((D - 4) / 1.1)), col = 0, cnt = 0;
    while (cnt < nUps * 2) {
      for (i = 0; i < perL && cnt < nUps * 2; i++, cnt++) {
        var ux = -W / 2 + 1.4 + col * 2.6, uz = -D / 2 + 2.2 + i * 1.1;
        if (ux > xE - 1) break;
        box(elec, 0.9, 2.0, 0.95, col % 2 ? SH.dark : SH.silver, ux, 1.3, uz);
        box(elec, 0.05, 0.12, 0.5, SH.upsLed, ux + 0.48, 1.9, uz, false);
      }
      col++; if (-W / 2 + 1.4 + col * 2.6 > xE - 1) break;
    }
    // rackuri: perechi de randuri spate in spate (culoar cald la mijloc)
    var nGpu = Math.ceil(p.it * 1000 / 45), nAll = nGpu + Math.ceil(nGpu * 0.3);
    var hallW = xO - xE - 3, hallD = D - 5, perRowMax = Math.max(2, Math.min(24, Math.floor(hallD / 0.62)));
    var pairs = Math.max(1, Math.ceil(nAll / (2 * perRowMax))); while (pairs * 5.4 > hallW && pairs > 1) pairs--;
    var perRow = Math.ceil(nAll / (pairs * 2));
    var rackGeo = new T.BoxGeometry(1.2, 2.2, 0.6);
    var rk = new T.InstancedMesh(rackGeo, [SH.rackFront, SH.rackBody, SH.rackBody, SH.rackBody, SH.rackBody, SH.rackBody], nGpu);
    var rk2 = new T.InstancedMesh(rackGeo, [SH.rackAlt, SH.rackAlt, SH.rackAlt, SH.rackAlt, SH.rackAlt, SH.rackAlt], Math.max(1, nAll - nGpu));
    rk.castShadow = rk2.castShadow = true; rk.frustumCulled = rk2.frustumCulled = false;
    var mtx = new T.Matrix4(), q0 = new T.Quaternion(), qPi = new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 1, 0), Math.PI), one = new T.Vector3(1, 1, 1);
    var hallCx = (xE + xO) / 2, n1 = 0, n2 = 0, rowLen = perRow * 0.62, rackPos = [hallCx + (pairs - 1) * 2.7 + 1.2, rowLen / 2 - 0.31];
    for (var pr = 0; pr < pairs; pr++) {
      var px = hallCx + (pr - (pairs - 1) / 2) * 5.4;
      for (var side = 0; side < 2; side++) {
        var rx = px + (side ? 1.2 : -1.2), lastRow = pr === pairs - 1 && side === 1;
        for (i = 0; i < perRow; i++) {
          var ix = lastRow ? perRow - 1 - i : i;       // ultimul rand se umple dinspre sud, unde sta rackul desenat in detaliu
          if (lastRow && i === 0) continue;
          if (n1 + n2 >= nAll - 1) break;
          var rz = -rowLen / 2 + (ix + 0.5) * 0.62;
          mtx.compose(new T.Vector3(rx, 1.4, rz), side ? q0 : qPi, one);
          if ((ix === 0 || ix === perRow - 1) && n2 < nAll - nGpu) rk2.setMatrixAt(n2++, mtx); else if (n1 < nGpu - 1) rk.setMatrixAt(n1++, mtx); else rk2.setMatrixAt(n2++, mtx);
        }
      }
      var hotP = new T.Mesh(new T.PlaneGeometry(1.2, rowLen + 1), SH.hot); hotP.rotation.x = -Math.PI / 2; hotP.position.set(px, 0.33, 0); itx.add(hotP);
      for (side = -1; side <= 1; side += 2) { var cp = new T.Mesh(new T.PlaneGeometry(1.5, rowLen + 1), SH.cold); cp.rotation.x = -Math.PI / 2; cp.position.set(px + side * 2.55, 0.33, 0); itx.add(cp); }
      // tevi de racire deasupra randurilor, spre est
      var pb = cyl(itx, 0.09, 0.09, rowLen + 1.5, SH.blue, px - 0.25, 2.9, 0, 8); pb.rotation.x = Math.PI / 2; pb.castShadow = false;
      var prd = cyl(itx, 0.09, 0.09, rowLen + 1.5, SH.red, px + 0.25, 2.9, 0, 8); prd.rotation.x = Math.PI / 2; prd.castShadow = false;
      // unitatea care imparte lichidul de racire (CDU) si jgheaburile de cabluri
      box(itx, 0.9, 1.9, 1.0, SH.white, px, 1.25, -rowLen / 2 - 1.0); box(itx, 0.92, 0.25, 1.02, SH.blue, px, 1.9, -rowLen / 2 - 1.0, false);
      box(itx, 0.45, 0.07, rowLen, SH.steel, px - 1.2, 2.62, 0, false); box(itx, 0.45, 0.07, rowLen, SH.steel, px + 1.2, 2.62, 0, false);
    }
    rk.count = n1; rk2.count = n2; rk.instanceMatrix.needsUpdate = true; rk2.instanceMatrix.needsUpdate = true;
    itg.add(rk); itg.add(rk2);
    var rackD = rackDetail(itg, rackPos[0], rackPos[1]);
    var hz = rowLen / 2 + 1.2, hx0 = hallCx - (pairs - 1) * 2.7 - 0.5, hx1 = W / 2 - 0.3;
    var h1 = cyl(itx, 0.11, 0.11, hx1 - hx0, SH.blue, (hx0 + hx1) / 2, 2.9, -Math.min(hz + 0.9, D / 2 - 0.8), 8); h1.rotation.z = Math.PI / 2; h1.castShadow = false;
    var h2 = cyl(itx, 0.11, 0.11, hx1 - hx0, SH.red, (hx0 + hx1) / 2, 2.9, -Math.min(hz + 0.9, D / 2 - 0.8) + 0.35, 8); h2.rotation.z = Math.PI / 2; h2.castShadow = false;
    // camera de control
    box(elec, Math.max(2, offW - 3), 0.8, 1, SH.wallIn, xO + offW / 2, 0.7, 0);
    for (i = -1; i <= 1; i++) box(elec, 0.7, 0.45, 0.05, SH.screen, xO + offW / 2 + i * 0.85, 1.45, -0.2, false);

    // acoperis (se ridica)
    roofGroup = new T.Group(); bld.add(roofGroup);
    box(roofGroup, W + 0.6, 0.5, D + 0.6, SH.roof, 0, H + 0.25, 0);
    for (i = 0; i < Math.max(2, Math.round(W / 9)); i++) box(roofGroup, 1.6, 0.9, 1.6, SH.roof, -W / 2 + 4 + i * 8, H + 0.95, -D / 4);
    roofK = roofOpen ? 1 : 0;
    tag(bld, 'building');

    /* --- platforma tehnica --- */
    var perCol = Math.max(1, Math.floor((D - 2) / 4)), nCool = Math.max(2, Math.ceil(p.it * 1.25 / 0.45) + 1), coolCols = Math.ceil(nCool / perCol);
    var coolLen = 9, coolX0 = W / 2 + 4 + coolLen / 2, coolW = coolCols * (coolLen + 2);
    var nGen = huge ? Math.ceil(p.it * 1.25 / 2) + 1 : 2, genLen = big ? 12 : 6, genS = big ? 1 : 0.7;
    var subS = huge ? 2.2 : big ? 1.3 : 0.8, subW = 14 * subS, subD = 12 * subS;
    var xGen = -W / 2 - 4 - genLen / 2, xSub = -W / 2 - 4 - genLen - 12 - subW / 2, zSub = D / 2 - subD / 2 + 2;
    var nB = p.bess > 0 ? Math.max(1, Math.ceil(p.bess / 2.5)) : 0, perRowB = Math.max(2, Math.floor((W * 0.75 + 10) / 8)), rowsB = Math.ceil(nB / perRowB);
    var zB0 = -D / 2 - 11, zPV0 = zB0 - Math.max(1, rowsB) * 6 - 12;
    var platX0 = xSub - subW / 2 - 6, platX1 = W / 2 + 4 + coolW + 8, platZ0 = zPV0 + 5, platZ1 = D / 2 + 24;
    var plat = box(root, platX1 - platX0, 0.2, platZ1 - platZ0, SH.concrete, (platX0 + platX1) / 2, 0.1, (platZ0 + platZ1) / 2, false);

    // racire (est)
    var cool = new T.Group(), coolO = []; root.add(cool);
    for (i = 0; i < nCool; i++) {
      var cc = Math.floor(i / perCol), cr = i % perCol, rowsHere = Math.min(perCol, nCool - cc * perCol);
      cooler(cool, coolX0 + cc * (coolLen + 2), (cr - (rowsHere - 1) / 2) * 4, coolLen);
      coolO.push([coolX0 + cc * (coolLen + 2), 3.4, (cr - (rowsHere - 1) / 2) * 4]);
    }
    var pz = Math.min(D / 2 - 1.2, ((Math.min(perCol, nCool) - 1) / 2) * 4 + 2.2);
    var cpb = cyl(cool, 0.22, 0.22, coolW + 3, SH.blue, W / 2 + (coolW + 3) / 2, 0.9, pz, 8); cpb.rotation.z = Math.PI / 2;
    var cpr = cyl(cool, 0.22, 0.22, coolW + 3, SH.red, W / 2 + (coolW + 3) / 2, 0.9, pz + 0.6, 8); cpr.rotation.z = Math.PI / 2;
    tag(cool, 'cool');

    // generatoare (vest)
    var gen = new T.Group(); root.add(gen);
    var zGen0 = -D / 2 + 3;
    var genO = [];
    for (i = 0; i < nGen; i++) { genset(gen, xGen, zGen0 + i * (genS * 5.6 + 1.2), genLen, genS); genO.push([xGen + genLen * 0.3, 4.6 * genS, zGen0 + i * (genS * 5.6 + 1.2)]); }
    tag(gen, 'gen');

    // statie electrica si linia din retea
    var sub = new T.Group(); root.add(sub);
    box(sub, subW, 0.12, subD, SH.gravel, xSub, 0.26, zSub, false);
    transformer(sub, xSub + (big ? subW * 0.2 : 0), zSub - (big ? subD * 0.18 : 0), subS);
    if (big) transformer(sub, xSub + subW * 0.2, zSub + subD * 0.24, subS);
    box(sub, 3 * subS, 2.6, 2.4 * subS, SH.white, xSub - subW * 0.22, 1.5, zSub + subD * 0.2);
    var pylH = huge ? 30 : big ? 16 : 10, gx = xSub - subW / 2 + 1.2, gantH = big ? 8 * Math.sqrt(subS) : 0;
    var prev = null, at;
    if (big) {
      cyl(sub, 0.2, 0.25, gantH, SH.steel, gx, gantH / 2, zSub - subD * 0.35, 8); cyl(sub, 0.2, 0.25, gantH, SH.steel, gx, gantH / 2, zSub + subD * 0.35, 8);
      box(sub, 0.3, 0.3, subD * 0.75, SH.steel, gx, gantH, zSub);
      prev = [new T.Vector3(gx, gantH, zSub - subD * 0.25), new T.Vector3(gx, gantH, zSub), new T.Vector3(gx, gantH, zSub + subD * 0.25)];
    } else {
      prev = pylon(sub, gx, zSub, 9, false);
    }
    var span = huge ? 150 : big ? 90 : 55, lineG = new T.Group(); root.add(lineG);
    for (i = 1; i <= 5; i++) {
      var pyG = new T.Group(); lineG.add(pyG);
      at = pylon(pyG, gx - i * span + (i === 1 ? span * 0.45 : 0), zSub, pylH, big);
      for (j = 0; j < 3; j++) wire(pyG, prev[j], at[j], span * 0.035);
      prev = at;
    }
    tag(sub, 'sub');

    // baterii (nord, intre cladire si panouri)
    var bess = new T.Group(); root.add(bess);
    var xB0 = -W / 2 - 3;
    for (i = 0; i < nB; i++) {
      var bx = xB0 + (i % perRowB) * 8 + 3.05, bz = zB0 - Math.floor(i / perRowB) * 6;
      var bc = new T.Group(); bess.add(bc);
      box(bc, 6.1, 2.9, 2.44, SH.white, bx, 1.65, bz);
      box(bc, 6.14, 0.5, 2.48, SH.green, bx, 2.5, bz, false);
      box(bc, 0.9, 1.6, 0.08, SH.steel, bx - 1.8, 1.2, bz + 1.25, false); box(bc, 0.9, 1.6, 0.08, SH.steel, bx + 1.8, 1.2, bz + 1.25, false);
    }
    if (nB) { box(bess, 2.4, 2.4, 2.2, SH.silver, xB0 - 2.5, 1.4, zB0); tag(bess, 'bess'); }
    var bN = Math.min(nB, perRowB), xBc = xB0 + bN * 4, zBc = zB0 - (Math.max(1, rowsB) - 1) * 3;

    /* --- parcul fotovoltaic --- */
    var nT = Math.ceil(p.pv * 1000 / 30), pitch = 9.2, colW = 32;
    var nc = Math.max(1, Math.round(Math.sqrt(nT * 0.42))), nr = Math.max(1, Math.ceil(nT / nc));
    function colX(c) { return c * colW + Math.floor(c / 4) * 6; }
    var fieldW = nT ? colX(nc - 1) + 30 : 0, fieldD = nT ? nr * pitch : 0;
    if (nT > 0) {
      var tg = new T.BoxGeometry(30, 0.14, 4.6);
      var tables = new T.InstancedMesh(tg, [SH.frame, SH.frame, SH.panel, SH.panelBack, SH.frame, SH.frame], nT);
      var legs = new T.InstancedMesh(new T.BoxGeometry(0.2, 1.8, 0.2), SH.steel, nT * 4);
      var qt = new T.Quaternion().setFromAxisAngle(new T.Vector3(1, 0, 0), 0.436), k4 = 0;
      for (i = 0; i < nT; i++) {
        var c = i % nc, r = Math.floor(i / nc);
        var tx = colX(c) + 15 - fieldW / 2, tz = zPV0 - r * pitch - 2.3;
        mtx.compose(new T.Vector3(tx, 1.85, tz), qt, one); tables.setMatrixAt(i, mtx);
        for (j = 0; j < 4; j++) { mtx.compose(new T.Vector3(tx - 11.25 + j * 7.5, 0.9, tz), q0, one); legs.setMatrixAt(k4++, mtx); }
      }
      tables.castShadow = tables.receiveShadow = true; legs.castShadow = true;
      tables.frustumCulled = legs.frustumCulled = false;
      tables.userData.pick = 'pv'; pickObjs.push(tables);
      root.add(tables); root.add(legs);
      var nInv = Math.max(1, Math.round(p.pv / 2.5)), inv = new T.Group(); root.add(inv);
      for (i = 0; i < nInv; i++) box(inv, 5, 2.6, 2.4, SH.white, -fieldW / 2 + (i + 0.5) * fieldW / nInv, 1.4, zPV0 + 4.5);
      tag(inv, 'pv');
    }
    var zPVmid = zPV0 - fieldD / 2, zPVend = zPV0 - fieldD;

    /* --- limite, gard, drum, copaci, camp --- */
    var x0 = Math.min(-fieldW / 2, platX0) - 10, x1 = Math.max(fieldW / 2, platX1) + 10, z0 = zPVend - 10, z1 = platZ1 + 2;
    var cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, spanX = x1 - x0, spanZ = z1 - z0, RR = Math.sqrt(spanX * spanX + spanZ * spanZ) / 2;
    var k = Math.max(0.7, Math.min(3.2, RR / 110));
    var fenceG = new T.Group(); root.add(fenceG);
    box(fenceG, spanX, 2, 0.15 * k, SH.fence, cx, 1, z0, false); box(fenceG, spanX, 2, 0.15 * k, SH.fence, cx, 1, z1, false);
    box(fenceG, 0.15 * k, 2, spanZ, SH.fence, x0, 1, cz, false); box(fenceG, 0.15 * k, 2, spanZ, SH.fence, x1, 1, cz, false);

    var gr = new T.Mesh(new T.CircleGeometry(RR * 16, 48), SH.ground); gr.rotation.x = -Math.PI / 2; gr.position.set(cx, -0.05, cz); gr.receiveShadow = true; root.add(gr);
    // parcele agricole in jur
    var cell = Math.max(spanX, spanZ) * 0.62;
    for (i = -7; i <= 7; i++) for (j = -7; j <= 7; j++) {
      var fx0 = cx + i * cell, fz0 = cz + j * cell;
      if (fx0 + cell / 2 > x0 - 6 && fx0 - cell / 2 < x1 + 6 && fz0 + cell / 2 > z0 - 6 && fz0 - cell / 2 < z1 + 20) continue;
      var fw = cell - 5 * k, fd = cell - 5 * k, pg = new T.PlaneGeometry(fw, fd), uv = pg.attributes.uv, rot = R() > 0.5, rep = fw / (7 * k);
      for (var u = 0; u < uv.count; u++) { if (rot) uv.setXY(u, uv.getY(u) * rep, uv.getX(u) * rep); else uv.setXY(u, uv.getX(u) * rep, uv.getY(u) * rep); }
      var pm = new T.Mesh(pg, SH.crops[Math.floor(R() * SH.crops.length)]); pm.rotation.x = -Math.PI / 2; pm.position.set(fx0, 0.02, fz0); pm.receiveShadow = true; root.add(pm);
    }
    // drum national la sud + acces
    box(root, RR * 30, 0.12, 8, SH.asphalt, cx, 0.1, zRoad, false);
    var dash = new T.InstancedMesh(new T.BoxGeometry(3, 0.02, 0.22), SH.white, 160); dash.frustumCulled = false;
    for (i = 0; i < 160; i++) { mtx.compose(new T.Vector3(cx + (i - 80) * 9 * k, 0.18, zRoad), q0, new T.Vector3(k, 1, k)); dash.setMatrixAt(i, mtx); }
    root.add(dash);
    var xGate = W / 2 - offW / 2 + 9;
    var siteG = new T.Group(), carsG = new T.Group(), peopleG = new T.Group(); root.add(siteG); root.add(carsG); root.add(peopleG);
    box(siteG, 7, 0.12, zRoad - platZ1 + 6, SH.asphalt, xGate, 0.12, (zRoad + platZ1) / 2 - 1, false);
    box(siteG, 3, 2.6, 3, SH.white, xGate + 6, 1.5, platZ1 - 3); box(siteG, 3.4, 0.2, 3.4, SH.base, xGate + 6, 2.9, platZ1 - 3);
    var carCols = [0xc9463d, 0xf2f2f2, 0x2f5fa8, 0x3a3f44, 0xd8d2c4];
    for (i = 0; i < Math.min(5, Math.max(2, Math.round(W / 8))); i++) car(carsG, W / 2 - offW / 2 - 6 - i * 2.9, D / 2 + 9, carCols[i % 5]);
    // oameni, ca sa se vada scara
    person(peopleG, rackPos[0] + 1.45, 0.3, rackPos[1] - 1.9); person(peopleG, xGate + 3.6, 0.2, platZ1 - 3.4); person(peopleG, W / 2 - offW / 2 + 3.4, 0.2, D / 2 + 3.2);
    // stalpi de iluminat pe marginea platformei: noaptea lumineaza
    var lampG = new T.Group(); root.add(lampG);
    var lp = [], nl = Math.max(3, Math.round((platX1 - platX0) / 26));
    for (i = 0; i <= nl; i++) { var lx = platX0 + 3 + i * (platX1 - platX0 - 6) / nl; lp.push([lx, platZ1 - 2.5]); lp.push([lx, platZ0 + 2.5]); }
    var poles = new T.InstancedMesh(new T.CylinderGeometry(0.09, 0.12, 7, 6), SH.steel, lp.length), heads = new T.InstancedMesh(new T.BoxGeometry(1.1, 0.14, 0.4), SH.lampHead, lp.length), glows = new T.InstancedMesh(new T.PlaneGeometry(24, 24), SH.glow, lp.length);
    var qFlat = new T.Quaternion().setFromAxisAngle(new T.Vector3(1, 0, 0), -Math.PI / 2);
    for (i = 0; i < lp.length; i++) {
      mtx.compose(new T.Vector3(lp[i][0], 3.7, lp[i][1]), q0, one); poles.setMatrixAt(i, mtx);
      mtx.compose(new T.Vector3(lp[i][0], 7.2, lp[i][1] + (i % 2 ? 0.4 : -0.4)), q0, one); heads.setMatrixAt(i, mtx);
      mtx.compose(new T.Vector3(lp[i][0], 0.27 + (i % 7) * 0.004, lp[i][1] + (i % 2 ? 2 : -2)), qFlat, one); glows.setMatrixAt(i, mtx);
    }
    poles.frustumCulled = heads.frustumCulled = glows.frustumCulled = false; poles.castShadow = true; glows.renderOrder = 2;
    lampG.add(poles); lampG.add(heads); lampG.add(glows);
    // copaci de-a lungul drumului
    var nTree = 46, cone = new T.InstancedMesh(new T.ConeGeometry(2.6, 7, 7), SH.tree, nTree), ball = new T.InstancedMesh(new T.IcosahedronGeometry(3, 0), SH.tree2, nTree), trunk = new T.InstancedMesh(new T.CylinderGeometry(0.3, 0.4, 3, 6), SH.trunk, nTree * 2);
    cone.frustumCulled = ball.frustumCulled = trunk.frustumCulled = false; cone.castShadow = ball.castShadow = true;
    var sc = new T.Vector3(), tk = 0;
    for (i = 0; i < nTree; i++) {
      var txx = cx + (i - nTree / 2) * 13 * k + (R() - 0.5) * 6, s = (0.8 + R() * 0.5) * Math.sqrt(k);
      if (Math.abs(txx - xGate) < 8) txx += 16;
      sc.set(s, s, s);
      mtx.compose(new T.Vector3(txx, 3 * s + 3.4 * s, zRoad + 9), q0, sc); cone.setMatrixAt(i, mtx);
      mtx.compose(new T.Vector3(txx, 1.5 * s, zRoad + 9), q0, sc); trunk.setMatrixAt(tk++, mtx);
      var bxx = txx + 6.5 * k;
      mtx.compose(new T.Vector3(bxx, 5 * s, zRoad - 8.5), q0, sc); ball.setMatrixAt(i, mtx);
      mtx.compose(new T.Vector3(bxx, 1.5 * s, zRoad - 8.5), q0, sc); trunk.setMatrixAt(tk++, mtx);
    }
    root.add(cone); root.add(ball); root.add(trunk);
    // nori nevazuti care lasa umbre miscatoare in zilele cu nori
    var cloudG = new T.Group(), cgeo = new T.PlaneGeometry(2, 2); root.add(cloudG); cgeo.rotateX(-Math.PI / 2);
    for (i = 0; i < 7; i++) {      // umbre moi de nori: pete intunecate care plutesc deasupra campusului
      var cm = new T.Group(), cr2 = RR * (0.2 + R() * 0.2), c1 = new T.Mesh(cgeo, SH.cloud), c2 = new T.Mesh(cgeo, SH.cloud);
      c1.scale.set(cr2, 1, cr2 * (0.55 + R() * 0.3)); c2.scale.set(cr2 * 0.7, 1, cr2 * 0.5); c2.position.set(cr2 * (0.3 + R() * 0.4), 0.05, cr2 * (R() - 0.5) * 0.6);
      c1.renderOrder = c2.renderOrder = 3; cm.add(c1); cm.add(c2);
      cm.position.set(cx + (R() * 2 - 1) * RR * 1.5, H + 4 + i * 0.12, cz + (R() * 2 - 1) * RR * 1.0);
      cm.userData.v = (5 + R() * 5) * k; cloudG.add(cm); clouds.push(cm);
    }

    /* --- zone de apasare --- */
    if (nT) zone(root, 'pv', -fieldW / 2 - 2, fieldW / 2 + 2, zPVend - 2, zPV0 + 6.5, 3.2);
    if (nB) zone(root, 'bess', xB0 - 5, xB0 + bN * 8 + 1, zB0 - (Math.max(1, rowsB) - 1) * 6 - 2.5, zB0 + 2.5, 3.4);
    zone(root, 'cool', W / 2 + 1.5, W / 2 + 4 + coolW, -Math.min(perCol, nCool) * 2 - 1, Math.min(D / 2, Math.min(perCol, nCool) * 2 + 3.5), 3.4);
    zone(root, 'gen', xGen - genLen / 2 - 1, -W / 2 - 1, zGen0 - 2.5, zGen0 + (nGen - 1) * (genS * 5.6 + 1.2) + 4.5, 3.6);
    zone(root, 'sub', xSub - subW / 2, xSub + subW / 2, zSub - subD / 2, zSub + subD / 2, 4 * subS + 2);
    zone(root, 'fiber', W / 2 - offW - 7, W / 2 - offW + 2, D / 2 + 0.6, zRoad - 4.5, 0.8);
    zone(root, 'fiber', x0 - 30, x1 + 30, zRoad - 10.5, zRoad - 4.5, 0.8);

    /* --- fluxuri --- */
    var fg = new T.Group(); root.add(fg);
    var xPvIn = W / 2 - 3;
    if (nT) flows.pv = new Flow(fg, [[0, zPVmid], [0, zPV0 + 8], [xPvIn, zPV0 + 8], [xPvIn, -D / 2]], COL.sun, k, 14);
    if (nB) flows.bess = new Flow(fg, [[xBc, zB0 + 1.4], [xBc, -D / 2]], COL.batt, k, 6);
    flows.grid = new Flow(fg, [[xSub - subW / 2 - 30 * k, zSub + subD / 2 + 2], [xSub, zSub + subD / 2 + 2], [xSub + subW / 2 + 3, zSub + subD / 2 + 2], [xSub + subW / 2 + 3, D / 2 - 2.5], [-W / 2, D / 2 - 2.5]], COL.grid, k, 12);
    var xF = W / 2 - offW - 4;
    flows.fiberA = new Flow(fg, [[xF, D / 2], [xF, zRoad - 6], [x0 - 60 * k, zRoad - 6]], COL.fiber, k * 0.7, 8);
    flows.fiberB = new Flow(fg, [[xF + 3, D / 2], [xF + 3, zRoad - 9], [x1 + 60 * k, zRoad - 9]], COL.fiber, k * 0.7, 8);
    flows.fiberA.set(0.5, 1); flows.fiberB.set(0.5, -1);
    var zGm = zGen0 + (nGen - 1) * (genS * 5.6 + 1.2) / 2;
    flows.gen = new Flow(fg, [[xGen, zGm], [-W / 2, zGm]], COL.gen, k, 6);
    puffGen = new Puffs(root, genO, SH.smoke, 0.8 * genS, 9, 4); puffGen.on = outage === 2 ? 1 : 0;
    puffHeat = new Puffs(root, coolO, SH.heat, 1.5, 11, 3); puffHeat.on = thermal ? 1 : 0;

    L = {
      W: W, D: D, H: H, k: k, R: RR, cx: cx, cz: cz, spanX: spanX, spanZ: spanZ,
      anchors: {
        building: [0, H + 3, 0], pv: nT ? [0, 7 * k, zPVmid] : null, bess: nB ? [xBc, 6, zBc] : null,
        sub: [xSub, 4 * subS + 5, zSub], gen: [xGen, 6, zGen0 + (nGen - 1) * (genS * 5.6 + 1.2) / 2],
        cool: [coolX0 + (coolCols - 1) * (coolLen + 2) / 2, 6, 0], fiber: [xF + 1.5, 2.5, zRoad - 7],
        f_pv: nT ? [xPvIn / 2, 1.3 * k, zPV0 + 8] : null, f_bess: nB ? [xBc, 1.3 * k, (zB0 + 1.4 - D / 2) / 2] : null,
        f_grid: [xSub + subW / 2 + 3, 1.3 * k, (zSub + subD / 2 + 2 + D / 2 - 2.5) / 2], f_gen: [(xGen - W / 2) / 2, 1.3 * k, zGm],
        r_gpu: [rackPos[0] + 1.21, 1.95, rackPos[1] - 0.1], r_cool: [rackPos[0] - 0.5, 2.42, rackPos[1] + 0.2], r_net: [rackPos[0] + 0.35, 2.5, rackPos[1]],
        r_srv: [rackPos[0] + 0.62, 0.95, rackPos[1] + 0.25], r_pow: [rackPos[0] + 0.55, 0.47, rackPos[1] + 0.28]
      },
      views: {
        overview: { t: [cx, 0, cz + spanZ * 0.02], dist: fit(RR * 0.86), az: 0.62, pol: 1.0 },
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
    scene.fog.near = RR * 5; scene.fog.far = RR * 17;
    var sc2 = sunLight.shadow.camera; sc2.left = -RR * 1.1; sc2.right = RR * 1.1; sc2.top = RR * 1.1; sc2.bottom = -RR * 1.1; sc2.near = RR * 0.5; sc2.far = RR * 6; sc2.updateProjectionMatrix();
    sunLight.shadow.normalBias = 0.25 * k; sunLight.target.position.set(cx, 0, cz); sunLight.target.updateMatrixWorld();
    parts = { plat: plat, fenceG: fenceG, siteG: siteG, carsG: carsG, peopleG: peopleG, lampG: lampG, sub: sub, lineG: lineG, floorM: floorM, wallGroup: wallGroup, partG: partG, elec: elec, itg: itg, itx: itx,
      cool: cool, gen: gen, rk: rk, rk2: rk2, n1: n1, n2: n2, rack: rackD, tables: nT ? tables : null, legs: nT ? legs : null, inv: nT ? inv : null, nT: nT, bess: bess, fg: fg, cloudG: cloudG, shell: 1 };
    applyBuild();
    applySun();
    return L;
  }

  /* ---------- constructia pe etape: 0 platforma, 1 racord, 2 cladire, 3 instalatii, 4 calculatoare, 5 panouri, 6 baterii, 7 pornire ---------- */
  function applyBuild() {
    if (!parts) return;
    var p = parts, b = buildK, f, i, n;
    f = b[0]; p.plat.visible = f > 0.01; p.plat.scale.set(Math.max(0.02, f), 1, Math.max(0.02, f)); p.siteG.visible = f >= 0.5; p.fenceG.visible = f >= 0.8;
    f = b[1]; p.sub.visible = f > 0.01; p.sub.scale.y = Math.max(0.02, Math.min(1, f * 1.5)); n = p.lineG.children.length;
    for (i = 0; i < n; i++) p.lineG.children[i].visible = f > 0.01 && (n - i) <= Math.ceil(f * n);
    f = b[2]; p.floorM.visible = f > 0.01; p.wallGroup.visible = f > 0.04; p.shell = Math.min(1, f / 0.85);
    f = b[3]; [p.cool, p.gen, p.elec, p.partG, p.lampG].forEach(function (g) { g.visible = f > 0.01; g.scale.y = Math.max(0.02, f); });
    f = b[4]; p.itg.visible = f > 0.01; p.rk.count = Math.round(p.n1 * f); p.rk2.count = Math.round(p.n2 * f); p.itx.visible = f > 0.5; p.rack.g.visible = f > 0.9;
    f = b[5]; if (p.tables) { p.tables.count = Math.round(p.nT * f); p.legs.count = p.tables.count * 4; p.inv.visible = f > 0.2; }
    f = b[6]; n = p.bess.children.length; for (i = 0; i < n; i++) p.bess.children[i].visible = f > 0.01 && i < Math.ceil(f * n);
    f = b[7]; p.fg.visible = f > 0.5; p.carsG.visible = f > 0.5; p.peopleG.visible = f > 0.5;
  }
  function disp2(hex) { return new T.Color(hex).convertSRGBToLinear().getHex(); }
  function setThermal(on) {
    thermal = !!on; if (!ok) return;
    THERM.forEach(function (e) { e.m.color.setHex(thermal ? e.hot : e.base); });
    SH.rackFront.emissive.setHex(thermal ? 0xffa030 : 0xffffff); SH.rackFront.emissiveIntensity = thermal ? 0.9 : 1.1;
    SH.hot.opacity = thermal ? 0.62 : 0.28; SH.cold.opacity = thermal ? 0.5 : 0.22;
    if (puffHeat) puffHeat.on = thermal ? 1 : 0;
    applySun();
  }

  function fit(r) {
    var vf = camera.fov * Math.PI / 180, a = Math.min(1.25, camera.aspect || 1.5);
    return r / Math.sin(vf / 2) / Math.max(0.55, Math.min(1, a)) * 0.82;
  }

  /* ---------- soare, cer, noapte ---------- */
  var sunState = { el: 1.0, az: 0, wx: 0 };
  var cTop = null, cBot = null, cTmp = null;
  function applySun() {
    if (!ok || !L) return;
    var s = sunState, sinEl = Math.sin(s.el), day = Math.max(0, Math.min(1, (sinEl + 0.06) / 0.3));
    day = day * day * (3 - 2 * day);
    var direct = [1, 0.62, 0.22][s.wx], amb = [1, 1.05, 0.95][s.wx];
    var el = Math.max(s.el, 0.05), dx = -Math.sin(s.az) * Math.cos(el), dz = Math.cos(s.az) * Math.cos(el), dy = Math.sin(el);
    sunLight.position.set(L.cx + dx * L.R * 3, dy * L.R * 3, L.cz + dz * L.R * 3);
    sunLight.intensity = 1.05 * day * direct * Math.min(1, 0.4 + sinEl * 1.5);
    sunLight.castShadow = sinEl > 0.02;
    var warm = Math.max(0, Math.min(1, sinEl / 0.45));
    sunLight.color.setRGB(1, 0.72 + 0.26 * warm, 0.5 + 0.44 * warm);
    hemi.intensity = 0.26 + 0.36 * day * amb;
    moonLight.intensity = 0.3 * (1 - day);
    nightK = 1 - day;
    SH.glass.emissiveIntensity = 0.9 * nightK; SH.windowGlow.emissiveIntensity = 1.3 * nightK;
    SH.lampHead.color.setHex(0x8a8f8c).lerp(cTmp.setHex(0xfff0c0), nightK); SH.glow.opacity = 0.6 * nightK;
    if (parts) parts.cloudG.visible = s.wx === 1 && day > 0.3 && !thermal; SH.cloud.opacity = 0.3 * day;
    hemi.color.setHex(thermal ? 0xffffff : 0xdfeeff); hemi.groundColor.setHex(thermal ? 0xd0d0ea : 0x8a8f6a);
    if (thermal) {      // imagine "termica": lumina plata, cer inchis
      sunLight.intensity = 0.2; sunLight.color.setRGB(1, 1, 1); hemi.intensity = 0.92; moonLight.intensity = 0;
      SH.glass.emissiveIntensity = 0; SH.windowGlow.emissiveIntensity = 0; SH.glow.opacity = 0;
      host.style.background = 'linear-gradient(#070920 0%, #121640 62%)'; scene.fog.color.setHex(disp2(0x121640));
      return;
    }
    // cerul: un gradient CSS in spatele canvasului transparent
    var topD = [[0x4f9fe6, 0x8cb2d2, 0x97a4ae][s.wx]], botD = [[0xd4e9f7, 0xe0e9ef, 0xd3d8db][s.wx]];
    cTop.setHex(0x091220).lerp(cTmp.setHex(topD[0]), day);
    cBot.setHex(0x1a2944).lerp(cTmp.setHex(botD[0]), day);
    var dusk = Math.max(0, 1 - Math.abs(sinEl - 0.06) / 0.2) * (s.wx === 2 ? 0.2 : 0.75);
    cBot.lerp(cTmp.setHex(0xf2a86b), dusk);
    host.style.background = 'linear-gradient(' + '#' + cTop.getHexString() + ' 0%, #' + cBot.getHexString() + ' 62%)';
    scene.fog.color.copy(cBot);
  }
  function setSun(el, az, wx) { sunState.el = el; sunState.az = az; sunState.wx = wx; applySun(); }

  /* ---------- camera ---------- */
  function placeCamera() {
    var sp = Math.sin(cam.pol), cp = Math.cos(cam.pol);
    camera.position.set(cam.tx + cam.dist * sp * Math.sin(cam.az), cam.ty + cam.dist * cp, cam.tz + cam.dist * sp * Math.cos(cam.az));
    camera.lookAt(cam.tx, cam.ty, cam.tz);
    if (L) { var nr = Math.max(0.1, Math.min(0.6 * L.k, cam.dist * 0.03)); if (Math.abs(nr - camera.near) > camera.near * 0.15) { camera.near = nr; camera.updateProjectionMatrix(); } }
  }
  function go(name, instant) {
    if (!ok || !L) return;
    var v = L.views[name] || L.views.overview;
    goal = { tx: v.t[0], ty: v.t[1], tz: v.t[2], dist: v.dist, az: v.az, pol: v.pol };
    var d = goal.az - cam.az; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; goal.az = cam.az + d;
    if (instant || reduced) { for (var kx in goal) cam[kx] = goal[kx]; goal = null; }
  }
  function stepCamera(dt) {
    if (goal) {
      var a = 1 - Math.exp(-dt * 3.4), done = true;
      for (var kx in goal) { var dd = goal[kx] - cam[kx]; cam[kx] += dd * a; if (Math.abs(dd) > Math.max(0.002, Math.abs(goal[kx]) * 0.0015)) done = false; }
      if (done) goal = null;
    } else if (auto && !reduced) { cam.az += dt * 0.035; }
    placeCamera();
  }

  function bindControls() {
    var ptrs = {}, n = 0, last = null, moved = 0, pinch0 = 0, downAt = null;
    function touched() { goal = null; auto = false; if (handlers.touched) handlers.touched(); }
    canvas.addEventListener('pointerdown', function (e) {
      canvas.setPointerCapture(e.pointerId); ptrs[e.pointerId] = { x: e.clientX, y: e.clientY }; n = Object.keys(ptrs).length;
      last = { x: e.clientX, y: e.clientY }; moved = 0; downAt = { x: e.clientX, y: e.clientY, b: e.button, shift: e.shiftKey }; pinch0 = 0;
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!ptrs[e.pointerId]) { hover(e); return; }
      ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(ptrs);
      if (ids.length >= 2) {
        var a = ptrs[ids[0]], b = ptrs[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch0) { cam.dist = clampDist(cam.dist * pinch0 / d); touched(); }
        pinch0 = d; moved = 99; return;
      }
      var dx = e.clientX - last.x, dy = e.clientY - last.y; last = { x: e.clientX, y: e.clientY };
      moved += Math.abs(dx) + Math.abs(dy);
      if (moved < 4) return;
      touched();
      if (downAt && (downAt.b === 2 || downAt.shift)) {
        var s = cam.dist * 0.0016, ca = Math.cos(cam.az), sa = Math.sin(cam.az);
        cam.tx += (-dx * ca - dy * sa) * s; cam.tz += (dx * sa - dy * ca) * s;
      } else {
        cam.az -= dx * 0.0055; cam.pol = Math.max(0.05, Math.min(1.5, cam.pol - dy * 0.0045));
      }
    });
    function up(e) {
      if (!ptrs[e.pointerId]) return;
      delete ptrs[e.pointerId]; pinch0 = 0;
      if (moved < 5 && downAt && downAt.b === 0) { var id = pickAt(e.clientX, e.clientY); if (id && handlers.pick) handlers.pick(id); }
    }
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('pointerleave', function () { if (handlers.hover) handlers.hover(null); });
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    canvas.addEventListener('wheel', function (e) {
      e.preventDefault(); cam.dist = clampDist(cam.dist * Math.exp(e.deltaY * 0.0011)); touched();
    }, { passive: false });
  }
  function clampDist(d) { return L ? Math.max(rackOpen ? 2.2 : 6, Math.min(L.R * 7, d)) : d; }
  function zoom(f) { cam.dist = clampDist(cam.dist * f); goal = null; }

  var ray = null, v2 = null, hoverT = 0;
  function pickAt(x, y) {
    var r = canvas.getBoundingClientRect();
    v2.set((x - r.left) / r.width * 2 - 1, -(y - r.top) / r.height * 2 + 1);
    ray.setFromCamera(v2, camera);
    var hit = ray.intersectObjects(pickObjs, false);
    for (var i = 0; i < hit.length; i++) {
      var o = hit[i].object;
      if (roofGroup && o.parent === roofGroup && roofK > 0.5) continue;
      if (!shown(o)) continue;
      return o.userData.pick;
    }
    return null;
  }
  function shown(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }
  function hover(e) {
    var now = performance.now(); if (now - hoverT < 60) return; hoverT = now;
    var id = pickAt(e.clientX, e.clientY);
    canvas.style.cursor = id ? 'pointer' : 'grab';
    if (handlers.hover) handlers.hover(id, e.clientX, e.clientY);
  }

  /* ---------- etichete HTML ancorate in scena ---------- */
  var pv3 = null;
  function makeLabels(defs) {
    labelHost.innerHTML = ''; labelEls = {};
    defs.forEach(function (d) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'lbl' + (d.cls ? ' ' + d.cls : ''); b.dataset.id = d.id; b.textContent = d.text; b.hidden = true;
      if (d.cls) b.tabIndex = -1;
      b.addEventListener('click', function () { if (handlers.pick) handlers.pick(d.id); });
      labelHost.appendChild(b); labelEls[d.id] = b;
    });
  }
  function setLabelText(id, text) { if (labelEls[id]) labelEls[id].textContent = text; }
  var LORDER = ['building', 'pv', 'bess', 'sub', 'cool', 'gen', 'fiber', 'f_pv', 'f_bess', 'f_grid', 'f_gen', 'r_gpu', 'r_cool', 'r_net', 'r_srv', 'r_pow'], lsize = {}, lframe = 0;
  var LPHASE = { building: 2, pv: 5, bess: 6, sub: 1, gen: 3, cool: 3, fiber: 7, f_pv: 7, f_bess: 7, f_grid: 7, f_gen: 7, r_gpu: 4, r_cool: 4, r_net: 4, r_srv: 4, r_pow: 4 };
  function stepLabels() {
    if (!L) return;
    var w = host.clientWidth, h = host.clientHeight, refresh = (lframe++ % 45) === 0;
    var placed = [{ x: w - 58, y: 0, w: 58, h: 132 }];      // coltul cu busola si butoanele de apropiere ramane liber
    for (var n = 0; n < LORDER.length; n++) {
      var id = LORDER[n], elx = labelEls[id]; if (!elx) continue;
      var a = L.anchors[id];
      var isRack = id.charAt(0) === 'r' && id.charAt(1) === '_';
      if (!a || (id === 'building' && roofOpen) || labelOn[id] === false || isRack !== (rackK > 0.6) || buildK[LPHASE[id]] < 0.5) { elx.hidden = true; continue; }
      pv3.set(a[0], a[1], a[2]).project(camera);
      var x = (pv3.x + 1) / 2 * w, y = (1 - pv3.y) / 2 * h;
      var vis = pv3.z < 1 && x > 30 && x < w - 30 && y > 40 && y < h - 8;
      if (!vis) { elx.hidden = true; continue; }
      if (elx.hidden) { elx.hidden = false; lsize[id] = null; }
      if (!lsize[id] || refresh) lsize[id] = { w: elx.offsetWidth || 90, h: elx.offsetHeight || 22 };
      var sz = lsize[id], rx = x - sz.w / 2, ry = y - sz.h - 10, shift = 0, okp = false;
      for (var t = 0; t < 5 && !okp; t++) {
        okp = true;
        for (var q = 0; q < placed.length; q++) {
          var o = placed[q];
          if (rx < o.x + o.w + 4 && rx + sz.w + 4 > o.x && ry - shift < o.y + o.h + 3 && ry - shift + sz.h + 3 > o.y) { okp = false; break; }
        }
        if (!okp) shift += sz.h + 5;
      }
      if (!okp || ry - shift < 44) { elx.hidden = true; continue; }
      placed.push({ x: rx, y: ry - shift, w: sz.w, h: sz.h });
      elx.style.transform = 'translate(' + x.toFixed(1) + 'px,' + (y - shift).toFixed(1) + 'px) translate(-50%,-100%) translateY(-10px)';
      elx.style.setProperty('--stem', (10 + shift) + 'px');
    }
  }

  /* ---------- bucla ---------- */
  function frame(t) {
    if (!running) return;
    requestAnimationFrame(frame);
    var dt = Math.min(0.05, (t - lastT) / 1000 || 0.016); lastT = t;
    stepCamera(dt);
    for (var id in flows) flows[id].update(dt, camera.position);
    var i;
    if (!reduced && outage !== 1) for (i = 0; i < fans.length; i++) fans[i].rotation.y += dt * 7;
    if (puffGen) puffGen.update(dt); if (puffHeat) puffHeat.update(dt);
    if (!reduced && parts && parts.cloudG.visible) for (i = 0; i < clouds.length; i++) { var cl = clouds[i]; cl.position.x += cl.userData.v * dt; if (cl.position.x > L.cx + L.R * 1.7) cl.position.x = L.cx - L.R * 1.7; }
    var rt = rackOpen ? 1 : 0;
    if (Math.abs(rackK - rt) > 0.001) rackK += (rt - rackK) * (reduced ? 1 : Math.min(1, dt * 2.6)); else rackK = rt;
    if (parts) {
      var e = rackK * rackK * (3 - 2 * rackK), rd = parts.rack, e2 = Math.max(0, (e - 0.25) / 0.75), e3 = Math.max(0, (e - 0.7) / 0.3);
      rd.door.rotation.y = e * 1.95; rd.server.position.x = 0.02 + 0.92 * e2; rd.cover.position.set(-0.55 * e3, 0.352 + 0.42 * e3, 0);
      parts.partG.scale.y = Math.max(0.02, buildK[3]) * (1 - 0.85 * rackK);
    }
    if (roofGroup) {
      var target = roofOpen ? 1 : 0;
      if (Math.abs(roofK - target) > 0.001) roofK += (target - roofK) * (reduced ? 1 : Math.min(1, dt * 4)); else roofK = target;
      roofGroup.position.y = roofK * (L.H * 1.2 + 3); SH.roof.opacity = 1 - roofK; roofGroup.visible = roofK < 0.97 && buildK[2] >= 0.92;
      if (wallGroup) wallGroup.scale.y = Math.max(0.02, (1 - 0.6 * roofK - 0.25 * rackK) * (parts ? parts.shell : 1));
      var shade = roofK < 0.04;
      if (roofGroup.userData.shade !== shade) { roofGroup.userData.shade = shade; roofGroup.traverse(function (o) { if (o.isMesh) o.castShadow = shade; }); }
    }
    renderer.render(scene, camera);
    stepLabels();
    if (handlers.north) handlers.north(cam.az);
  }
  function resize() {
    if (!ok) return;
    var w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, w < 700 ? 1.6 : 2));
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }

  function init(opts) {
    host = opts.host; canvas = opts.canvas; labelHost = opts.labels;
    handlers.pick = opts.onPick; handlers.hover = opts.onHover; handlers.north = opts.onNorth; handlers.touched = opts.onTouched;
    if (!T) return false;
    try {
      renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    } catch (e) { return false; }
    renderer.outputEncoding = T.sRGBEncoding; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);
    scene = new T.Scene(); scene.fog = new T.Fog(0xd4e9f7, 500, 3000);
    camera = new T.PerspectiveCamera(38, 1.5, 1, 9000);
    hemi = new T.HemisphereLight(0xdfeeff, 0x8a8f6a, 0.9); scene.add(hemi);
    sunLight = new T.DirectionalLight(0xffffff, 1.8); sunLight.castShadow = true; var lite = Math.min(window.innerWidth, window.innerHeight) < 700; sunLight.shadow.mapSize.set(lite ? 1024 : 2048, lite ? 1024 : 2048); sunLight.shadow.bias = -0.0004;
    scene.add(sunLight); scene.add(sunLight.target);
    moonLight = new T.DirectionalLight(0x8fa8d8, 0); moonLight.position.set(-300, 500, 400); scene.add(moonLight);
    ray = new T.Raycaster(); v2 = new T.Vector2(); pv3 = new T.Vector3(); cTop = new T.Color(); cBot = new T.Color(); cTmp = new T.Color();
    initShared(); ok = true;
    resize(); bindControls();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(host); else window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function () { if (!document.hidden && !running) { running = true; lastT = performance.now(); requestAnimationFrame(frame); } else if (document.hidden) running = false; });
    requestAnimationFrame(frame);
    return true;
  }

  return {
    init: init, build: build, go: go, setSun: setSun, zoom: zoom, makeLabels: makeLabels, setLabelText: setLabelText,
    setRoof: function (o) { roofOpen = !!o; },
    setRack: function (o) { rackOpen = !!o; },
    setBuild: function (arr) { buildK = arr ? arr.slice(0, 8) : [1, 1, 1, 1, 1, 1, 1, 1]; applyBuild(); },
    setOutage: function (st) { outage = st || 0; if (!ok) return; SH.upsLed.color.setHex(outage ? 0xffb53c : 0x35e08a); if (puffGen) puffGen.on = outage === 2 ? 1 : 0; },
    setThermal: setThermal,
    setLabelOn: function (id, on) { labelOn[id] = !!on; },
    setAuto: function (a) { auto = !!a; },
    flow: function (id) { return flows[id] || null; },
    layout: function () { return L; },
    isReady: function () { return ok; }, _pick: function (x, y) { return pickAt(x, y); },
    COL: COL
  };
})();
