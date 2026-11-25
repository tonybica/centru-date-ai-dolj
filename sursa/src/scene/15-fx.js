  /* ---------- fluxuri de energie: cablu pe sol + puncte care curg ---------- */
  function Flow(parent, pts, color, k, n) {
    this.pts = pts.map(function (p) { return new T.Vector3(p[0], 0.35 * k, p[1]); });
    this.seg = []; this.len = 0;
    for (var i = 1; i < this.pts.length; i++) { var d = this.pts[i].distanceTo(this.pts[i - 1]); this.seg.push(d); this.len += d; }
    this.k = k; this.n = n || 10; this.phase = 0; this.dir = 1; this.power = 0; this.active = 0;
    var cm = B(color, { transparent: true, opacity: 0.35 });
    this.cableMat = cm; this.group = new T.Group(); parent.add(this.group);
    for (i = 1; i < this.pts.length; i++) {
      var a = this.pts[i - 1], b = this.pts[i], mid = a.clone().add(b).multiplyScalar(0.5);
      var me = new T.Mesh(new T.BoxGeometry(0.45 * k, 0.1 * k, this.seg[i - 1] + 0.45 * k), cm);
      me.position.copy(mid); me.lookAt(b); this.group.add(me);
    }
    this.dotMat = B(color);
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
    this.cableMat.opacity = this.active ? 0.62 : 0.2;
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
