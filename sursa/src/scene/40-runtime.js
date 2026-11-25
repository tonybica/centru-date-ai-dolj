
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
    f = b[5]; if (p.tables) { p.tables.count = Math.round(p.nT * f); p.inv.visible = f > 0.2; p.pvG.visible = f > 0.05; }
    f = b[6]; p.bess.visible = f > 0.01; if (p.bessI) p.bessI.count = Math.ceil(f * p.nB);
    f = b[7]; p.fg.visible = f > 0.5; p.carsG.visible = f > 0.5; p.peopleG.visible = f > 0.5;
    shadowDirty = true;
  }
  function setThermal(on) {
    thermal = !!on; if (!ok) return;
    THERM.forEach(function (e) { e.m.color.setHex(thermal ? e.hot : e.base); if (e.map) e.m.map = thermal ? TEX.white : e.map; if (e.metal !== undefined) e.m.metalness = thermal ? 0 : e.metal; });
    SH.rackFront.emissive.setHex(thermal ? 0xffa030 : 0xffffff); SH.rackFront.emissiveIntensity = thermal ? 0.8 : 1.6; SH.cabF.emissiveIntensity = thermal ? 0 : 1;
    SH.hot.opacity = thermal ? 0.5 : 0.16; SH.cold.opacity = thermal ? 0.42 : 0.12; SH.ao.opacity = thermal ? 0 : 0.5; SH.patchA.opacity = thermal ? 0 : 0.4; SH.patchB.opacity = thermal ? 0 : 0.4;
    if (puffHeat) puffHeat.on = thermal ? 1 : 0;
    applySun();
  }

  function fit(r) {
    var vf = camera.fov * Math.PI / 180, a = Math.min(1.25, camera.aspect || 1.5);
    return r / Math.sin(vf / 2) / Math.max(0.55, Math.min(1, a)) * 0.82;
  }

  /* ---------- cerul: gradient, soare, nori, stele, totul calculat pe placa video ---------- */
  var SKY_V = 'varying vec3 vDir; void main() { vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
  var SKY_FAR = 'varying vec3 vDir; void main() { vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position.z = gl_Position.w; }';   // la adancimea maxima: se deseneaza doar pixelii de cer care chiar se vad
  function makeSky() {
    var mat = new T.ShaderMaterial({
      side: T.BackSide, depthWrite: false, fog: false, toneMapped: false,
      uniforms: { uSun: { value: new T.Vector3(0, 1, 0) }, uTop: { value: new T.Color() }, uHor: { value: new T.Color() }, uSunCol: { value: new T.Color() }, uCloudCol: { value: new T.Color() }, uCloudSh: { value: new T.Color() },
        uCloud: { value: 0.2 }, uTime: { value: 0 }, uNight: { value: 0 }, uSunVis: { value: 1 } },
      vertexShader: SKY_FAR,
      fragmentShader: [
        'uniform vec3 uSun; uniform vec3 uTop; uniform vec3 uHor; uniform vec3 uSunCol; uniform vec3 uCloudCol; uniform vec3 uCloudSh;',
        'uniform float uCloud; uniform float uTime; uniform float uNight; uniform float uSunVis; varying vec3 vDir;',
        'float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
        'float noise(vec2 p) { vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);',
        '  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y); }',
        'float fbm(vec2 p) { float a = 0.5; float s = 0.0; for (int i = 0; i < 5; i++) { s += a * noise(p); p = p * 2.03 + vec2(17.0, 9.0); a *= 0.5; } return s; }',
        'void main() {',
        '  vec3 d = normalize(vDir); float h = clamp(d.y, 0.0, 1.0);',
        '  vec3 col = mix(uHor, uTop, pow(h, 0.42));',
        '  float sd = max(dot(d, uSun), 0.0);',
        '  col += uSunCol * (pow(sd, 6.0) * 0.12 + pow(sd, 48.0) * 0.25) * uSunVis * (1.0 - 0.6 * uCloud);',
        '  float cl = 0.0;',
        '  if (d.y > 0.0) {',
        '    vec2 uv = d.xz / (d.y + 0.1) * 0.9 + vec2(uTime * 0.012, uTime * 0.004);',
        '    float n = fbm(uv); float th = mix(0.72, 0.22, uCloud);',
        '    cl = smoothstep(th, th + 0.26, n) * smoothstep(0.0, 0.1, d.y);',
        '    float lit = clamp(0.55 + 0.9 * (n - th) + 0.35 * pow(sd, 3.0), 0.0, 1.0);',
        '    col = mix(col, mix(uCloudCol, uCloudSh, clamp(lit * (0.35 + 0.65 * uCloud), 0.0, 1.0) * 0.8), cl * (0.82 + 0.18 * uCloud));',
        '    float st = step(0.9965, hash(floor(d.xz / (d.y + 0.25) * 150.0))) * uNight * smoothstep(0.04, 0.3, d.y) * (1.0 - cl);',
        '    col += vec3(st) * 0.8;',
        '  }',
        '  col += uSunCol * smoothstep(0.99955, 0.99985, sd) * 4.0 * uSunVis * (1.0 - cl) * step(0.0, d.y);',
        '  gl_FragColor = vec4(col, 1.0);',
        '  #include <encodings_fragment>',
        '}'].join('\n')
    });
    sky = new T.Mesh(new T.SphereGeometry(1, 40, 20), mat); sky.renderOrder = 1000; sky.frustumCulled = false; sky.matrixAutoUpdate = true; scene.add(sky);
  }
  var envRT = null;
  function makeEnv() {      // cerul pe care il oglindesc sticla, panourile si tabla
    try {
      if (envRT) { envRT.dispose(); envRT = null; }
      var pm = new T.PMREMGenerator(renderer), es = new T.Scene();
      var m = new T.ShaderMaterial({ side: T.BackSide, depthWrite: false, depthTest: false, vertexShader: SKY_V,
        fragmentShader: 'varying vec3 vDir; void main() { vec3 d = normalize(vDir); float h = d.y; vec3 sk = mix(vec3(0.95, 0.98, 1.02), vec3(0.3, 0.5, 0.92), pow(clamp(h, 0.0, 1.0), 0.5)); vec3 gd = mix(vec3(0.5, 0.48, 0.4), vec3(0.2, 0.21, 0.15), clamp(-h * 2.5, 0.0, 1.0)); gl_FragColor = vec4(h > 0.0 ? sk : gd, 1.0); }' });
      es.add(new T.Mesh(new T.SphereGeometry(40, 32, 16), m));
      envRT = pm.fromScene(es, 0.02); scene.environment = envRT.texture; pm.dispose(); m.dispose();
    } catch (e) { scene.environment = null; }
  }

  /* ---------- soare, cer, noapte ---------- */
  var sunState = { el: 1.0, az: 0, wx: 0 }, sunDir = null, cA = null, cB = null, cTmp = null, sunOk = false;
  var EXPO = 1.0, SUN_I = 1.65, HEMI_D = 0.36, HEMI_N = 0.09, ENV_I = 0.3;
  function srgbOf(c, hex) { return c.setHex(hex).convertLinearToSRGB(); }
  function applySun() {
    if (!ok || !L) return;
    var s = sunState, sinEl = Math.sin(s.el), day = Math.max(0, Math.min(1, (sinEl + 0.08) / 0.24));
    day = day * day * (3 - 2 * day);
    var direct = [1, 0.8, 0.1][s.wx], amb = [1, 1.15, 1.75][s.wx];
    var el = Math.max(s.el, 0.07);
    sunDir.set(-Math.sin(s.az) * Math.cos(el), Math.sin(el), Math.cos(s.az) * Math.cos(el));
    var warm = Math.max(0, Math.min(1, sinEl / 0.5)), u = sky.material.uniforms;
    nightK = 1 - day; shF.x = 1e9; shadowDirty = true; sunOk = true;
    u.uSun.value.copy(sunDir); if (s.el < 0.07) u.uSun.value.set(-Math.sin(s.az) * Math.cos(s.el), sinEl, Math.cos(s.az) * Math.cos(s.el));
    SH.lampHead.color.setHex(0x8a8f8c).lerp(cTmp.setHex(0xfff0c0), nightK); SH.glow.opacity = 0.5 * nightK;
    if (parts) parts.cloudG.visible = s.wx === 1 && day > 0.3 && !thermal; SH.cloud.opacity = 0.26 * day;
    var envK;
    if (thermal) {      // imagine "termica": lumina plata, cer inchis, fara umbre tari
      sunLight.intensity = 0.45; sunLight.color.setRGB(1, 1, 1); hemi.intensity = 1.45; hemi.color.setHex(0xffffff); hemi.groundColor.setHex(0xc8c8e6); moonLight.intensity = 0; envK = 0;
      SH.glass.emissiveIntensity = 0; SH.glow.opacity = 0;
      u.uTop.value.setHex(0x05071c); u.uHor.value.setHex(0x161a48); u.uSunVis.value = 0; u.uCloud.value = 0; u.uNight.value = 0; u.uSunCol.value.setRGB(0, 0, 0);
      scene.fog.color.copy(srgbOf(cTmp, 0x161a48));
    } else {
      sunLight.color.setRGB(1, 0.56 + 0.41 * warm, 0.28 + 0.64 * warm);
      sunLight.intensity = SUN_I * day * direct * Math.min(1, 0.55 + sinEl * 1.3);
      hemi.color.setHex(0x16233f).lerp(cTmp.setHex([0xbfd6f2, 0xd0dae6, 0xc6ccd2][s.wx]), day); hemi.groundColor.setHex(0x0c0f14).lerp(cTmp.setHex(0x8f8a6c), day);
      hemi.intensity = HEMI_N + HEMI_D * day * amb;
      moonLight.intensity = 0.2 * nightK;
      envK = (0.05 + 0.95 * day) * [1, 0.9, 0.75][s.wx] * ENV_I;
      SH.glass.emissiveIntensity = 1.5 * nightK;
      // culorile cerului: zi dupa vreme, amurg portocaliu la orizont, noapte albastru inchis
      cA.setHex(0x050914).lerp(cTmp.setHex([0x2e73c9, 0x5b8cc0, 0x8b97a1][s.wx]), day);
      cB.setHex(0x101a30).lerp(cTmp.setHex([0xbdd8ee, 0xc8d6e0, 0xb7bdc2][s.wx]), day);
      var dusk = Math.max(0, 1 - Math.abs(sinEl - 0.05) / 0.22) * (s.wx === 2 ? 0.15 : 0.7);
      cB.lerp(cTmp.setHex(0xf0a56a), dusk); cA.lerp(cTmp.setHex(0x6a6fa8), dusk * 0.35);
      u.uTop.value.copy(cA); u.uHor.value.copy(cB);
      u.uSunCol.value.setRGB(1, 0.75 + 0.22 * warm, 0.5 + 0.42 * warm); u.uSunVis.value = [1, 0.75, 0][s.wx] * (sinEl > -0.03 ? 1 : 0);
      u.uCloud.value = [0.2, 0.52, 1][s.wx]; u.uNight.value = nightK * (s.wx === 2 ? 0 : 1);
      u.uCloudCol.value.setHex(0x1a2236).lerp(cTmp.setHex([0xffffff, 0xf6f6f4, 0xc9cdd0][s.wx]), day).lerp(cTmp.setHex(0xffc38f), dusk * 0.6);
      u.uCloudSh.value.setHex(0x0c111e).lerp(cTmp.setHex([0xaab6c6, 0x97a1ad, 0x8b9299][s.wx]), day);
      cTmp.copy(cB).convertLinearToSRGB(); scene.fog.color.copy(cTmp);     // ceata se amesteca dupa ce culorile au fost pregatite pentru ecran
    }
    for (var i = 0; i < MATS.length; i++) MATS[i].envMapIntensity = MATS[i].userData.env * envK;
  }
  function setSun(el, az, wx) {
    if (sunOk && el === sunState.el && az === sunState.az && wx === sunState.wx) return;      // pagina il cheama des; umbrele se refac doar cand soarele chiar s-a miscat
    sunState.el = el; sunState.az = az; sunState.wx = wx; applySun();
  }

  /* ---------- umbre: harta de umbre urmareste zona la care te uiti, ca sa fie clare si de aproape ---------- */
  function focusShadow() {
    if (!L || Q.noShadow) return;
    var ext = Math.max(26, Math.min(L.R * 1.15, cam.dist * 0.95)), fx = cam.tx, fz = cam.tz;
    if (Math.abs(fx - shF.x) < shF.ext * 0.07 && Math.abs(fz - shF.z) < shF.ext * 0.07 && Math.abs(ext - shF.ext) < shF.ext * 0.1) return;
    shF.x = fx; shF.z = fz; shF.ext = ext;
    var c = sunLight.shadow.camera, far = L.R * 3;
    c.left = -ext; c.right = ext; c.top = ext; c.bottom = -ext; c.near = Math.max(1, far - ext * 2.6 - 90); c.far = far + ext * 2.6 + 90; c.updateProjectionMatrix();
    sunLight.target.position.set(fx, 0, fz); sunLight.position.set(fx + sunDir.x * far, sunDir.y * far, fz + sunDir.z * far); sunLight.target.updateMatrixWorld();
    sunLight.shadow.normalBias = Math.max(0.03, ext * 2 / Q.shadow * 1.1); sunLight.shadow.bias = -0.0002;
    shadowDirty = true;
  }

  /* ---------- camera ---------- */
  function placeCamera() {
    var sp = Math.sin(cam.pol), cp = Math.cos(cam.pol);
    camera.position.set(cam.tx + cam.dist * sp * Math.sin(cam.az), cam.ty + cam.dist * cp, cam.tz + cam.dist * sp * Math.cos(cam.az));
    camera.lookAt(cam.tx, cam.ty, cam.tz);
    if (L) { var nr = Math.max(0.1, cam.dist * 0.02); if (Math.abs(nr - camera.near) > camera.near * 0.15) { camera.near = nr; camera.updateProjectionMatrix(); } }
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
    function touched() { goal = null; auto = false; lastInput = performance.now(); if (handlers.touched) handlers.touched(); }
    canvas.addEventListener('pointerdown', function (e) {
      canvas.setPointerCapture(e.pointerId); ptrs[e.pointerId] = { x: e.clientX, y: e.clientY }; n = Object.keys(ptrs).length; touching = n; lastInput = performance.now(); wake();
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
      delete ptrs[e.pointerId]; pinch0 = 0; touching = Object.keys(ptrs).length; lastInput = performance.now();
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
  function zoom(f) { cam.dist = clampDist(cam.dist * f); goal = null; lastInput = performance.now(); }

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
    var now = performance.now(); if (now - hoverT < 70) return; hoverT = now;
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

  /* ---------- calitatea se regleaza singura: daca aparatul nu tine 27 de cadre pe secunda, coboram o treapta ---------- */
  var QSTEPS = [[2, 1], [1.5, 1], [1.25, 0.5], [1, 0.5], [0.8, 0]], gov = { t: 0, n: 0, wait: 3, bad: 0 }, inView = true;
  var scheduled = false, lost = false, drew = false, prevT = 0, lastInput = 0, touching = 0;
  function pickQuality() {
    var touch = (navigator.maxTouchPoints || 0) > 0, small = Math.min(window.screen.width || 9999, window.screen.height || 9999);
    Q.lite = (touch && small < 820) || Math.min(window.innerWidth, window.innerHeight) < 480;
    Q.shadow0 = Q.lite ? 1024 : 2048; Q.shadow = Q.shadow0;
    Q.fixed = /q=max/.test(String(window.location.hash));
    if (/q=low/.test(String(window.location.hash))) Q.step = 4;
  }
  function applyQuality() {
    var st = QSTEPS[Q.step], dpr = window.devicePixelRatio || 1, sh = Math.round(Q.shadow0 * st[1]);
    Q.pr = Q.step === 4 ? Math.min(dpr, 1) * 0.85 : Math.min(dpr, st[0]);
    if (sh !== Q.shadow || (sh === 0) !== Q.noShadow) {
      Q.noShadow = sh === 0; sunLight.castShadow = !Q.noShadow;
      if (sh) { Q.shadow = sh; sunLight.shadow.mapSize.set(sh, sh); if (sunLight.shadow.map) { sunLight.shadow.map.dispose(); sunLight.shadow.map = null; } }
      shF.x = 1e9; shadowDirty = true;
    }
    resize();
  }
  function govern(dt) {      // dt = cat a trecut pana la cadrul urmator, masurat doar dupa un cadru desenat (deci cat costa desenul)
    if (Q.fixed) return;
    if (gov.wait > 0) { gov.wait -= dt; gov.t = 0; gov.n = 0; return; }
    gov.t += Math.min(dt, 2); gov.n++;                       // si cadrele foarte lente conteaza: un aparat care face un cadru pe secunda trebuie ajutat primul
    if (gov.t < 1.2 && gov.n < 40) return;
    var slow = gov.t / gov.n > 1 / 27; gov.t = 0; gov.n = 0;
    gov.bad = slow ? gov.bad + 1 : 0;                        // doua ferestre lente la rand, ca o poticnire singura sa nu coboare calitatea
    if (gov.bad >= 2 && Q.step < QSTEPS.length - 1) { Q.step++; gov.bad = 0; applyQuality(); gov.wait = 1.2; }
  }
  function wake() {          // porneste bucla daca macheta se vede; cand nu se vede, bucla sta de tot
    if (scheduled || !ok || lost || document.hidden || !inView) return;
    scheduled = true; running = true; drew = false; lastT = prevT = performance.now(); requestAnimationFrame(frame);
  }

  /* ---------- bucla ---------- */
  function frame(t) {
    scheduled = false;
    if (lost || document.hidden || !inView) { running = false; return; }      // macheta nu se vede (alta fila sau ai derulat mai jos): nu consumam bateria
    scheduled = true; requestAnimationFrame(frame);
    if (drew) govern((t - prevT) / 1000);
    prevT = t; drew = false;
    var busy = goal || touching > 0 || t - lastInput < 700 || shadowDirty || Math.abs(roofK - (roofOpen ? 1 : 0)) > 0.001 || Math.abs(rackK - (rackOpen ? 1 : 0)) > 0.001;
    if (Q.lite && !busy && t - lastT < 24) return;      // pe telefon, cat timp nimic nu se misca repede, ajung 30 de cadre pe secunda
    var dt = Math.min(0.05, (t - lastT) / 1000 || 0.016); lastT = t; drew = true;
    stepCamera(dt);
    for (var id in flows) flows[id].update(dt, camera.position);
    var i;
    if (!reduced && outage !== 1) TEX.fan.rotation += dt * 7;
    if (puffGen) puffGen.update(dt); if (puffHeat) puffHeat.update(dt);
    if (!reduced && parts && parts.cloudG.visible) for (i = 0; i < clouds.length; i++) { var cl = clouds[i]; cl.position.x += cl.userData.v * dt; if (cl.position.x > L.cx + L.R * 1.7) cl.position.x = L.cx - L.R * 1.7; }
    var rt = rackOpen ? 1 : 0;
    if (Math.abs(rackK - rt) > 0.001) { rackK += (rt - rackK) * (reduced ? 1 : Math.min(1, dt * 2.6)); shadowDirty = true; } else rackK = rt;
    if (parts) {
      var e = rackK * rackK * (3 - 2 * rackK), rd = parts.rack, e2 = Math.max(0, (e - 0.25) / 0.75), e3 = Math.max(0, (e - 0.7) / 0.3);
      rd.door.rotation.y = e * 1.95; rd.server.position.x = 0.02 + 0.92 * e2; rd.cover.position.set(-0.55 * e3, 0.352 + 0.42 * e3, 0);
      parts.partG.scale.y = Math.max(0.02, buildK[3]) * (1 - 0.85 * rackK);
    }
    if (roofGroup) {
      var target = roofOpen ? 1 : 0;
      if (Math.abs(roofK - target) > 0.001) { roofK += (target - roofK) * (reduced ? 1 : Math.min(1, dt * 4)); shadowDirty = true; } else roofK = target;
      var op = 1 - roofK; for (i = 0; i < ROOFM.length; i++) ROOFM[i].opacity = op;
      roofGroup.position.y = roofK * (L.H * 1.2 + 3); roofGroup.visible = roofK < 0.97 && buildK[2] >= 0.92;
      if (wallGroup) wallGroup.scale.y = Math.max(0.02, (1 - 0.6 * roofK - 0.25 * rackK) * (parts ? parts.shell : 1));
      if (parts) {             // sub acoperisul inchis nu se vede nimic: nu desenam interiorul
        var showIn = roofK > 0.01 || rackK > 0.01 || !roofGroup.visible;
        parts.elec.visible = parts.partG.visible = showIn && buildK[3] > 0.01; parts.itg.visible = showIn && buildK[4] > 0.01;
      }
      var shade = roofK < 0.04;
      if (roofGroup.userData.shade !== shade) { roofGroup.userData.shade = shade; roofGroup.traverse(function (o) { if (o.isMesh) o.castShadow = shade; }); shadowDirty = true; }
    }
    if (sky) { sky.position.copy(camera.position); if (!reduced) sky.material.uniforms.uTime.value += dt; }
    focusShadow();
    if (shadowDirty) { renderer.shadowMap.needsUpdate = true; shadowDirty = false; }
    renderer.render(scene, camera);
    stepLabels();
    if (handlers.north) handlers.north(cam.az);
  }
  function resize() {
    if (!ok) return;
    var w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
    renderer.setPixelRatio(Q.pr); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }

  function init(opts) {
    host = opts.host; canvas = opts.canvas; labelHost = opts.labels;
    handlers.pick = opts.onPick; handlers.hover = opts.onHover; handlers.north = opts.onNorth; handlers.touched = opts.onTouched;
    if (!T) return false;
    pickQuality();
    try {
      renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    } catch (e) { return false; }
    renderer.outputEncoding = T.sRGBEncoding; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = EXPO;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false;
    renderer.setClearColor(0xbdd8ee, 1);
    _m4 = new T.Matrix4(); _n3 = new T.Matrix3(); _v = new T.Vector3(); _q = new T.Quaternion(); _e = new T.Euler(); _s = new T.Vector3(); _a = new T.Vector3(); _b = new T.Vector3(); _up = new T.Vector3(0, 1, 0);
    scene = new T.Scene(); scene.fog = new T.Fog(0xd4e9f7, 500, 3000);
    camera = new T.PerspectiveCamera(38, 1.5, 1, 9000);
    hemi = new T.HemisphereLight(0xbfd6f2, 0x8f8a6c, 0.7); scene.add(hemi);
    sunLight = new T.DirectionalLight(0xffffff, 3); sunLight.castShadow = true; sunLight.shadow.mapSize.set(Q.shadow, Q.shadow); sunLight.shadow.bias = -0.0002;
    scene.add(sunLight); scene.add(sunLight.target);
    moonLight = new T.DirectionalLight(0x9db4e6, 0); moonLight.position.set(-300, 500, 400); scene.add(moonLight);
    ray = new T.Raycaster(); v2 = new T.Vector2(); pv3 = new T.Vector3(); cA = new T.Color(); cB = new T.Color(); cTmp = new T.Color(); sunDir = new T.Vector3(0, 1, 0);
    initShared(); makeSky(); makeEnv(); ok = true;
    applyQuality(); bindControls();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(host); else window.addEventListener('resize', resize);
    if (window.IntersectionObserver) new IntersectionObserver(function (es) { inView = es[es.length - 1].isIntersecting; if (inView) { gov.wait = Math.max(gov.wait, 0.8); wake(); } }).observe(host);
    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); lost = true; });
    canvas.addEventListener('webglcontextrestored', function () { lost = false; makeEnv(); shF.x = 1e9; shadowDirty = true; applySun(); gov.wait = 2; wake(); });      // telefonul a luat memoria video: refacem ce se pierde
    document.addEventListener('visibilitychange', function () { if (!document.hidden) { gov.wait = Math.max(gov.wait, 1.5); wake(); } });
    wake();
    return true;
  }

  return {
    init: init, build: function (p) { var r = build(p); gov.wait = Math.max(gov.wait, 1.5); wake(); return r; }, go: go, setSun: setSun, zoom: zoom, makeLabels: makeLabels, setLabelText: setLabelText,
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
    _info: function () { return ok ? { calls: renderer.info.render.calls, tris: renderer.info.render.triangles, geos: renderer.info.memory.geometries, tex: renderer.info.memory.textures, progs: renderer.info.programs.length, q: { lite: Q.lite, step: Q.step, pr: Q.pr, shadow: Q.shadow, noShadow: Q.noShadow } } : null; },
    _cam: cam,
    COL: COL
  };
})();
