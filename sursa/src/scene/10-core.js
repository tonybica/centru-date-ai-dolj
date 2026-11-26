/* ================= SCENA 3D: macheta campusului =================
   Axe: x = est, z = sud, y = sus. Panourile privesc spre sud (+z), drumul trece pe la sud. Unitati: metri.
   Fisierele din src/scene/ se lipesc in ordine intr-o singura functie (vezi build.js): 10 baza si materiale,
   20 piese (transformator, container, copac...), 30 campusul, 40 lumina, camera si bucla de desen. */
var Scene3D = (function () {
  'use strict';
  var T = window.THREE;
  if (T && T.ColorManagement) T.ColorManagement.legacyMode = false;      // culorile scrise in cod apar pe ecran exact asa
  var host, canvas, labelHost, renderer, scene, camera, root = null, sunLight, moonLight, hemi, sky = null;
  var L = null;
  var cam = { tx: 0, ty: 0, tz: 0, dist: 300, az: 0.6, pol: 1.0 }, goal = null;
  var flows = {}, labelEls = {}, pickObjs = [], tags = [];
  var roofGroup = null, wallGroup = null, roofOpen = false, roofK = 0;
  // Macheta se construieste in coordonatele bazei (x = dinspre calea ferata spre interiorul bazei, z = de-a lungul caii ferate) si se roteste o data,
  // ca nordul real sa fie nordul scenei: asa soarele si busola raman corecte. 140,5 grade = 180 - 39,5 (directia caii ferate fata de nord).
  var NORTH_ROT = 140.5 * Math.PI / 180;
  var camLoc = new T.Vector3();
  var handlers = { pick: null, hover: null, north: null, touched: null };
  var auto = false, lastT = 0, ok = false, nightK = 0, running = true;
  var parts = null, buildK = [1, 1, 1, 1, 1, 1, 1, 1], outage = 0, rackOpen = false, rackK = 0, thermal = false, labelOn = {}, clouds = [], puffGen = null, puffHeat = null, THERM = [];
  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var SH = null, MATS = [], TEX = {}, ROOFM = [];
  var COL = { sun: 0xf2a600, batt: 0x00b894, grid: 0x257de0, fiber: 0x7a5cf0, gen: 0xe4572e };
  // calitatea: se alege la pornire dupa ecran si scade singura, in trepte, daca aparatul nu tine pasul
  var Q = { lite: false, step: 0, prMax: 2, pr: 1, shadow: 2048, fixed: false, noShadow: false };
  var shadowDirty = true, shF = { x: 1e9, z: 0, ext: 0 };

  function M(c, o) {
    o = o || {}; o.color = c;
    if (o.roughness === undefined) o.roughness = 0.85;
    if (o.metalness === undefined) o.metalness = 0;
    var uv = o.uv, env = o.env; delete o.uv; delete o.env;
    var m = new T.MeshStandardMaterial(o);
    if (uv) m.userData.uv = uv;                      // metri pe o repetare a texturii: fetele primesc coordonate dupa marimea reala
    m.userData.env = env === undefined ? 1 : env;    // cat de tare oglindeste cerul
    MATS.push(m); return m;
  }
  function B(c, o) { o = o || {}; o.color = c; o.toneMapped = false; return new T.MeshBasicMaterial(o); }   // culoare care nu depinde de lumina (LED-uri, cabluri colorate)
  function canvasTex(w, h, draw, o) {
    o = o || {};
    var s = Q.lite && !o.keep ? 0.5 : 1, c = document.createElement('canvas');
    c.width = Math.max(4, Math.round(w * s)); c.height = Math.max(4, Math.round(h * s));
    var g = c.getContext('2d'); g.scale(c.width / w, c.height / h); draw(g, w, h);
    var t = new T.CanvasTexture(c); t.encoding = o.data ? T.LinearEncoding : T.sRGBEncoding; t.anisotropy = Q.lite ? 4 : 8;
    if (o.repeat !== false) t.wrapS = t.wrapT = T.RepeatWrapping;
    return t;
  }
  function rng(seed) {
    var a = seed >>> 0;
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  // puncte marunte si pete moi, desenate asa incat textura sa se lege la margini
  function speckle(g, w, h, R, n, cols, smin, smax, amin, amax) {
    for (var i = 0; i < n; i++) {
      g.globalAlpha = amin + R() * (amax - amin); g.fillStyle = cols[Math.floor(R() * cols.length)];
      var s = smin + R() * (smax - smin), x = R() * w, y = R() * h;
      g.fillRect(x, y, s, s); if (x + s > w) g.fillRect(x - w, y, s, s); if (y + s > h) g.fillRect(x, y - h, s, s);
    }
    g.globalAlpha = 1;
  }
  function blotch(g, w, h, R, n, rgb, rmin, rmax, a) {
    for (var i = 0; i < n; i++) {
      var x = R() * w, y = R() * h, r = rmin + R() * (rmax - rmin);
      for (var ox = -1; ox <= 1; ox++) for (var oy = -1; oy <= 1; oy++) {
        var cx = x + ox * w, cy = y + oy * h; if (cx + r < 0 || cx - r > w || cy + r < 0 || cy - r > h) continue;
        var gr = g.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); gr.addColorStop(1, 'rgba(' + rgb + ',0)');
        g.fillStyle = gr; g.fillRect(cx - r, cy - r, 2 * r, 2 * r);
      }
    }
  }

  /* ---------- texturi desenate in cod: nimic de descarcat ---------- */
  function initTextures() {
    var R = rng(5);
    TEX.white = canvasTex(4, 4, function (g, w, h) { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); }, { keep: true });
    TEX.grass = canvasTex(1024, 1024, function (g, w, h) {
      g.fillStyle = '#687c40'; g.fillRect(0, 0, w, h);
      blotch(g, w, h, R, 60, '86,106,50', 30, 110, 0.3); blotch(g, w, h, R, 50, '134,140,78', 24, 90, 0.26); blotch(g, w, h, R, 30, '126,112,72', 14, 50, 0.22);
      speckle(g, w, h, R, 30000, ['#536a2e', '#788c4c', '#8a9a58', '#4a602c', '#98a062', '#5e743a'], 1.2, 3.6, 0.25, 0.65);
      speckle(g, w, h, R, 2600, ['#b3ad6e', '#3f5a26'], 1, 2.4, 0.3, 0.7);
    });
    TEX.patch = canvasTex(64, 64, function (g, w, h) {
      var gr = g.createRadialGradient(32, 32, 2, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    }, { repeat: false, keep: true });
    function fieldTex(base, row, gap, cols) {
      return canvasTex(256, 256, function (g, w, h) {
        g.fillStyle = base; g.fillRect(0, 0, w, h);
        blotch(g, w, h, R, 8, '0,0,0', 30, 90, 0.1); blotch(g, w, h, R, 8, '255,255,220', 30, 90, 0.1);
        g.fillStyle = row; for (var y = 0; y < h; y += gap) g.fillRect(0, y, w, gap * 0.45);
        speckle(g, w, h, R, 2600, cols, 1, 3, 0.2, 0.5);
      });
    }
    TEX.fields = [
      fieldTex('#c7b171', '#b39a59', 16, ['#d8c588', '#a88f50', '#bfa767']),      // miriste de grau
      fieldTex('#7d9a49', '#6a883c', 16, ['#8fab58', '#5f7c36', '#9ab463']),      // cultura verde
      fieldTex('#7a6348', '#644f37', 8, ['#8b7356', '#5a4631', '#937c5f']),       // aratura
      fieldTex('#bdb64d', '#98a647', 16, ['#d2c958', '#a9a843', '#8c9c40']),      // rapita
      fieldTex('#5f8440', '#557a3a', 32, ['#6f9549', '#4c6f33', '#7aa052']),      // lucerna
      fieldTex('#a8a36b', '#97925d', 16, ['#b8b47c', '#8d8856', '#c2bd86'])       // parloaga uscata
    ];
    function asph(g, w, h, base) {
      g.fillStyle = base || '#3b3f42'; g.fillRect(0, 0, w, h);
      blotch(g, w, h, R, 10, '20,22,24', 30, 90, 0.35); blotch(g, w, h, R, 8, '92,94,96', 20, 80, 0.2);
      speckle(g, w, h, R, 6500, ['#2c3033', '#4b5054', '#5a5f63', '#24272a'], 1, 2.2, 0.3, 0.7);
    }
    TEX.asphalt = canvasTex(256, 256, function (g, w, h) { asph(g, w, h); });
    TEX.road = canvasTex(256, 256, function (g, w, h) {            // 12 m in lung, 10 m in lat: benzi, linie intrerupta, acostamente
      asph(g, w, h, '#404447');
      g.fillStyle = 'rgba(25,27,29,.22)'; g.fillRect(0, 62, w, 30); g.fillRect(0, 164, w, 30);
      g.fillStyle = '#8f8a7c'; g.fillRect(0, 0, w, 20); g.fillRect(0, h - 20, w, 20); speckle(g, w, 20, R, 500, ['#7b766b', '#a8a294', '#6c675d'], 1, 3, 0.4, 0.8);
      g.save(); g.translate(0, h - 20); speckle(g, w, 20, R, 500, ['#7b766b', '#a8a294', '#6c675d'], 1, 3, 0.4, 0.8); g.restore();
      g.fillStyle = 'rgba(238,238,228,.92)'; g.fillRect(0, 24, w, 3.5); g.fillRect(0, h - 27.5, w, 3.5); g.fillRect(0, h / 2 - 1.8, 86, 3.6);
    });
    TEX.concrete = canvasTex(512, 512, function (g, w, h) {        // 12 m pe repetare, rosturi la 6 m
      g.fillStyle = '#a3a59e'; g.fillRect(0, 0, w, h);
      blotch(g, w, h, R, 16, '108,108,100', 40, 140, 0.3); blotch(g, w, h, R, 10, '200,200,190', 40, 120, 0.28);
      speckle(g, w, h, R, 7000, ['#8f918a', '#b5b7af', '#85877f'], 1, 2, 0.2, 0.5);
      g.strokeStyle = 'rgba(70,72,68,.6)'; g.lineWidth = 2.5; g.strokeRect(0, 0, w, h);
      g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
    });
    TEX.gravel = canvasTex(256, 256, function (g, w, h) {
      g.fillStyle = '#a19c90'; g.fillRect(0, 0, w, h); blotch(g, w, h, R, 8, '90,86,78', 30, 80, 0.25);
      speckle(g, w, h, R, 5200, ['#8d887c', '#b8b3a6', '#7b766b', '#c9c4b6', '#6b665c'], 1.5, 3.5, 0.5, 0.9);
    });
    TEX.soil = canvasTex(256, 256, function (g, w, h) {
      g.fillStyle = '#9a8a6c'; g.fillRect(0, 0, w, h); blotch(g, w, h, R, 10, '110,96,70', 30, 90, 0.35); blotch(g, w, h, R, 8, '170,158,128', 20, 70, 0.3);
      speckle(g, w, h, R, 4200, ['#8b7b5e', '#ad9d7f', '#7d6e53', '#6f8a45'], 1, 3, 0.3, 0.7);
    });
    TEX.panel = canvasTex(256, 256, function (g, w, h) {           // panouri sandwich: 4 m pe repetare, imbinari la 1 m
      g.fillStyle = '#ecede8'; g.fillRect(0, 0, w, h);
      var x; for (x = 0; x < w; x += 8) { g.fillStyle = 'rgba(0,0,0,.04)'; g.fillRect(x, 0, 1, h); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(x + 1, 0, 1, h); }
      for (x = 0; x < w; x += 64) { g.fillStyle = 'rgba(40,46,44,.55)'; g.fillRect(x, 0, 1.6, h); g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(x + 1.6, 0, 1, h); }
      g.fillStyle = 'rgba(40,46,44,.3)'; g.fillRect(0, 0, w, 1.5); blotch(g, w, h, R, 6, '120,120,110', 40, 110, 0.07);
    });
    TEX.roof = canvasTex(256, 256, function (g, w, h) {            // membrana de acoperis, fasii de 2 m
      g.fillStyle = '#b3b6b0'; g.fillRect(0, 0, w, h); blotch(g, w, h, R, 12, '136,138,132', 30, 100, 0.3); blotch(g, w, h, R, 8, '206,208,202', 30, 90, 0.3);
      g.fillStyle = 'rgba(80,84,80,.35)'; for (var x = 0; x < w; x += 64) g.fillRect(x, 0, 1.5, h);
      speckle(g, w, h, R, 1500, ['#b3b6b0', '#d4d6d0'], 1, 2, 0.2, 0.5);
    });
    TEX.corr = canvasTex(64, 64, function (g, w, h) {              // tabla cutata (containere): 1,2 m pe repetare
      for (var x = 0; x < w; x++) { var v = Math.round(212 + 43 * Math.sin(x / 16 * Math.PI * 2)); g.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')'; g.fillRect(x, 0, 1, h); }
    });
    TEX.louver = canvasTex(64, 64, function (g, w, h) {            // jaluzele de aerisire
      for (var y = 0; y < h; y += 8) { var gr = g.createLinearGradient(0, y, 0, y + 8); gr.addColorStop(0, '#f2f2f2'); gr.addColorStop(0.6, '#a9a9a9'); gr.addColorStop(0.62, '#2a2a2a'); gr.addColorStop(1, '#3a3a3a'); g.fillStyle = gr; g.fillRect(0, y, w, 8); }
    });
    TEX.coil = canvasTex(64, 64, function (g, w, h) {              // lamelele dese ale racitoarelor
      g.fillStyle = '#8d9498'; g.fillRect(0, 0, w, h); g.fillStyle = '#c3c9cc'; for (var x = 0; x < w; x += 4) g.fillRect(x, 0, 1.6, h);
      g.fillStyle = 'rgba(40,44,48,.5)'; g.fillRect(0, 0, w, 2); g.fillRect(0, h / 2, w, 1.5);
    });
    TEX.fins = canvasTex(64, 64, function (g, w, h) {              // radiatoarele transformatorului
      for (var x = 0; x < w; x += 8) { var gr = g.createLinearGradient(x, 0, x + 8, 0); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.55, '#b9b9b9'); gr.addColorStop(0.6, '#3c3c3c'); gr.addColorStop(1, '#5a5a5a'); g.fillStyle = gr; g.fillRect(x, 0, 8, h); }
    });
    TEX.insul = canvasTex(32, 64, function (g, w, h) {             // izolator ceramic cu fuste
      for (var y = 0; y < h; y += 8) { var gr = g.createLinearGradient(0, y, 0, y + 8); gr.addColorStop(0, '#a85f38'); gr.addColorStop(0.7, '#8a4a2a'); gr.addColorStop(1, '#4d2614'); g.fillStyle = gr; g.fillRect(0, y, w, 8); }
    }, { repeat: false });
    TEX.chain = canvasTex(64, 64, function (g, w, h) {             // plasa de gard
      g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(58,66,62,.95)'; g.lineWidth = 2;
      for (var i = -64; i < 128; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 64, 64); g.stroke(); g.beginPath(); g.moveTo(i + 64, 0); g.lineTo(i, 64); g.stroke(); }
    });
    TEX.pv = canvasTex(2048, 512, function (g, w, h) {             // o masa: 26 x 2 module, fiecare cu rama, celule si bare subtiri
      g.fillStyle = '#c9cfd4'; g.fillRect(0, 0, w, h);
      var mw = w / 26, mh = h / 2;
      for (var i = 0; i < 26; i++) for (var j = 0; j < 2; j++) {
        var x0 = i * mw + 2.5, y0 = j * mh + 3, ww = mw - 5, hh = mh - 6;
        g.fillStyle = '#0a1120'; g.fillRect(x0, y0, ww, hh);
        var cw = (ww - 4) / 6, ch = (hh - 8) / 24;
        for (var a = 0; a < 6; a++) for (var b = 0; b < 24; b++) {
          var cx = x0 + 2 + a * cw, cy = y0 + 2 + b * ch + (b >= 12 ? 4 : 0);
          g.fillStyle = (a + b) % 2 ? '#13264c' : '#102144'; g.fillRect(cx + 0.4, cy + 0.4, cw - 0.8, ch - 0.8);
        }
        g.fillStyle = 'rgba(190,205,230,.2)'; for (a = 0; a < 6; a++) for (var q = 1; q < 4; q++) g.fillRect(x0 + 2 + a * cw + q * cw / 4, y0 + 2, 0.5, hh - 4);
      }
    }, { repeat: false });
    function rackDraw(emis) {
      return function (g, w, h) {
        g.fillStyle = emis ? '#000' : '#15191d'; g.fillRect(0, 0, w, h);
        var r = rng(7), cols = ['#35e08a', '#35e08a', '#35e08a', '#58b7ff', '#ffb53c'], x, y;
        if (!emis) {
          g.fillStyle = '#0b0e11'; for (y = 6; y < h - 6; y += 4) for (x = 6 + (y % 8 ? 2 : 0); x < w - 6; x += 4) g.fillRect(x, y, 2, 2);      // usa perforata
          g.strokeStyle = '#2b3238'; g.lineWidth = 3; g.strokeRect(3, 3, w - 6, h - 6); g.fillStyle = '#4a535b'; g.fillRect(w - 16, h / 2 - 22, 6, 44);
        }
        for (y = 22; y < h - 20; y += 20) {
          if (!emis) { g.fillStyle = 'rgba(42,50,56,.85)'; g.fillRect(12, y, w - 32, 14); }
          for (x = 16; x < w - 26; x += 7) if (r() > 0.4) { g.fillStyle = cols[Math.floor(r() * cols.length)]; g.fillRect(x, y + 5, 3, 3); }
        }
      };
    }
    TEX.rack = canvasTex(128, 512, rackDraw(false), { repeat: false, keep: true }); TEX.rackE = canvasTex(128, 512, rackDraw(true), { repeat: false, keep: true });
    TEX.tile = canvasTex(128, 128, function (g, w, h) {            // podea tehnica: placi de 60 cm
      g.fillStyle = '#c3c6c1'; g.fillRect(0, 0, w, h); speckle(g, w, h, R, 900, ['#b4b7b2', '#d2d4cf', '#a9aca7'], 1, 2, 0.3, 0.6);
      g.fillStyle = 'rgba(70,74,72,.7)'; g.fillRect(0, 0, w, 1.2); g.fillRect(0, 64, w, 1.2); g.fillRect(0, 0, 1.2, h); g.fillRect(64, 0, 1.2, h);
    });
    function cabDraw(emis) {
      return function (g, w, h) {      // usa de dulap electric: afisaj, aparate, maner, aerisire
        g.fillStyle = emis ? '#000' : '#c9cdce'; g.fillRect(0, 0, w, h);
        if (!emis) { g.strokeStyle = '#8b9194'; g.lineWidth = 2; g.strokeRect(2, 2, w - 4, h - 4); g.fillStyle = '#5c6367'; g.fillRect(w - 10, h * 0.45, 4, 18); g.fillStyle = '#9aa0a3'; for (var y = h - 26; y < h - 8; y += 4) g.fillRect(10, y, w - 20, 2); g.fillStyle = '#1b2126'; g.fillRect(12, 14, 26, 16); }
        g.fillStyle = emis ? '#2fd6ff' : '#1d6f8a'; g.fillRect(14, 16, 22, 12);
        g.fillStyle = '#35e08a'; g.fillRect(44, 18, 4, 4); g.fillStyle = emis ? '#000' : '#e0b030'; g.fillRect(44, 26, 4, 4);
      };
    }
    TEX.cab = canvasTex(64, 128, cabDraw(false), { repeat: false, keep: true }); TEX.cabE = canvasTex(64, 128, cabDraw(true), { repeat: false, keep: true });
    function glassDraw(emis) {
      return function (g, w, h) {      // perete cortina: 4 m pe repetare, montanti la 1,33 m, o banda opaca la planseu
        var r = rng(31), x, y;
        if (emis) { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); } else { var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5f7f96'); gr.addColorStop(1, '#3a5468'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
        for (x = 0; x < 3; x++) for (y = 0; y < 2; y++) {
          var lit = r() > 0.45;
          if (emis) { if (lit) { g.fillStyle = r() > 0.5 ? '#ffd9a0' : '#e8f0ff'; g.globalAlpha = 0.55 + r() * 0.45; g.fillRect(x * 85.33 + 4, y * 128 + 30, 78, 92); g.globalAlpha = 1; } }
          else if (r() > 0.5) { g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(x * 85.33 + 4, y * 128 + 30, 78, 92); }
        }
        g.fillStyle = emis ? '#000' : '#2a3035';
        for (x = 0; x <= w; x += 85.33) g.fillRect(x - 1.5, 0, 3, h);
        for (y = 0; y <= h; y += 128) { g.fillRect(0, y - 2, w, 4); g.fillStyle = emis ? '#000' : '#39424a'; g.fillRect(0, y + 2, w, 22); g.fillStyle = emis ? '#000' : '#2a3035'; }
      };
    }
    TEX.glass = canvasTex(256, 256, glassDraw(false)); TEX.glassE = canvasTex(256, 256, glassDraw(true));
    TEX.leaf = canvasTex(128, 128, function (g, w, h) {            // frunzis: alb cu pete, culoarea vine de la fiecare copac
      g.fillStyle = '#c9c9c9'; g.fillRect(0, 0, w, h); blotch(g, w, h, R, 14, '70,70,70', 10, 34, 0.5); blotch(g, w, h, R, 12, '255,255,255', 8, 26, 0.55);
      speckle(g, w, h, R, 1400, ['#8a8a8a', '#ffffff', '#6f6f6f', '#e6e6e6'], 2, 5, 0.25, 0.6);
    });
    TEX.fan = canvasTex(128, 128, function (g, w, h) {             // elicea unui ventilator, vazuta de sus
      g.clearRect(0, 0, w, h); g.translate(w / 2, h / 2);
      g.fillStyle = 'rgba(18,20,22,.55)'; g.beginPath(); g.arc(0, 0, 60, 0, 7); g.fill();
      g.fillStyle = '#c8ced2';
      for (var i = 0; i < 6; i++) { g.rotate(Math.PI / 3); g.beginPath(); g.moveTo(6, -4); g.quadraticCurveTo(38, -26, 58, -8); g.lineTo(56, 8); g.quadraticCurveTo(34, 2, 6, 6); g.closePath(); g.fill(); }
      g.fillStyle = '#5a6166'; g.beginPath(); g.arc(0, 0, 11, 0, 7); g.fill();
    }, { repeat: false }); TEX.fan.center.set(0.5, 0.5);
    TEX.grille = canvasTex(64, 64, function (g, w, h) {            // grila de protectie peste ventilator
      g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(70,76,80,.9)'; g.lineWidth = 1.4; g.translate(w / 2, h / 2);
      for (var r = 6; r < 32; r += 5) { g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke(); }
      for (var i = 0; i < 8; i++) { g.rotate(Math.PI / 4); g.beginPath(); g.moveTo(0, 0); g.lineTo(31, 0); g.stroke(); }
    }, { repeat: false });
    TEX.ao = canvasTex(128, 128, function (g, w, h) {              // umbra moale de sub obiecte
      g.clearRect(0, 0, w, h); var gr = g.createRadialGradient(64, 64, 18, 64, 64, 62); gr.addColorStop(0, 'rgba(0,0,0,.85)'); gr.addColorStop(0.55, 'rgba(0,0,0,.45)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    }, { repeat: false });
    TEX.hazard = canvasTex(64, 16, function (g, w, h) {            // dungi galben cu negru
      g.fillStyle = '#f2b705'; g.fillRect(0, 0, w, h); g.fillStyle = '#17191b';
      for (var x = -16; x < w; x += 16) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + 8, h); g.lineTo(x + 24, 0); g.lineTo(x + 16, 0); g.closePath(); g.fill(); }
    });
    TEX.sign = canvasTex(512, 128, function (g, w, h) {
      g.fillStyle = '#20262a'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2a600'; g.fillRect(22, 30, 14, 68);
      var fam = 'px "Barlow Semi Condensed", "Arial Narrow", Arial, sans-serif', txt = 'CENTRU DE DATE AI'; g.font = '600 62' + fam; var fs = Math.min(62, 62 * (w - 78) / g.measureText(txt).width);
      g.fillStyle = '#f4f5f2'; g.font = '600 ' + fs.toFixed(1) + fam; g.textBaseline = 'middle'; g.fillText(txt, 54, 66);
    }, { repeat: false, keep: true });
    TEX.shade = canvasTex(128, 128, function (g, w, h) {
      var gr = g.createRadialGradient(64, 64, 6, 64, 64, 64); gr.addColorStop(0, 'rgba(20,30,40,1)'); gr.addColorStop(0.55, 'rgba(20,30,40,.75)'); gr.addColorStop(1, 'rgba(20,30,40,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    }, { repeat: false });
    TEX.glow = canvasTex(64, 64, function (g, w, h) {
      var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,226,160,1)'); gr.addColorStop(0.5, 'rgba(255,214,140,.35)'); gr.addColorStop(1, 'rgba(255,214,140,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    }, { repeat: false });
  }

  /* ---------- materiale ---------- */
  function initShared() {
    SH = {}; MATS = []; initTextures();
    SH.ground = M(0xffffff, { map: TEX.grass, roughness: 1, env: 0.3 });
    SH.crops = TEX.fields.map(function (t) { return M(0xffffff, { map: t, roughness: 1, env: 0.25 }); });
    SH.soil = M(0xffffff, { map: TEX.soil, roughness: 1, uv: 6, env: 0.3 });
    SH.asphalt = M(0xffffff, { map: TEX.asphalt, roughness: 0.92, uv: 8, env: 0.5 });
    SH.road = M(0xffffff, { map: TEX.road, roughness: 0.92, env: 0.5 });
    SH.concrete = M(0xffffff, { map: TEX.concrete, roughness: 0.95, uv: 12, env: 0.5 });
    SH.gravel = M(0xffffff, { map: TEX.gravel, roughness: 1, uv: 5, env: 0.3 });
    SH.wall = M(0xffffff, { map: TEX.panel, roughness: 0.5, metalness: 0.15, uv: 4, env: 0.8 });
    SH.wallIn = M(0xe4e6e1, { roughness: 0.9 });
    SH.base = M(0x4a504d, { roughness: 0.95 });
    SH.trim = M(0x2b3134, { roughness: 0.45, metalness: 0.5 });
    SH.stripe = M(0xf2a600, { roughness: 0.5 });
    SH.roof = M(0xffffff, { map: TEX.roof, roughness: 0.9, uv: 8, transparent: true, opacity: 1, env: 0.5 });
    SH.floor = M(0xffffff, { map: TEX.tile, roughness: 0.4, uv: 1.2, env: 0.7 });
    SH.roofTrim = M(0x2b3134, { roughness: 0.5, metalness: 0.4, transparent: true });
    SH.roofUnit = M(0xd0d5d7, { roughness: 0.45, metalness: 0.6, transparent: true });
    ROOFM = [SH.roof, SH.roofTrim, SH.roofUnit];
    SH.white = M(0xf1f2ee, { roughness: 0.55 });
    SH.paint = M(0xf2f2ea, { roughness: 0.8 });
    SH.steel = M(0x9aa2a6, { metalness: 0.85, roughness: 0.45, env: 2 });
    SH.dark = M(0x23282c, { roughness: 0.55, metalness: 0.25 });
    SH.silver = M(0xd3d8db, { metalness: 0.9, roughness: 0.32, env: 2 });
    SH.cont = M(0xf3f4f0, { map: TEX.corr, roughness: 0.45, metalness: 0.25, uv: 1.2 });
    SH.contDark = M(0x56635d, { map: TEX.corr, roughness: 0.5, metalness: 0.3, uv: 1.2 });
    SH.louver = M(0xc4c9cb, { map: TEX.louver, roughness: 0.55, metalness: 0.5, uv: 0.8 });
    SH.door = M(0xdfe2e0, { map: TEX.louver, roughness: 0.6, metalness: 0.3, uv: 3.2 });
    SH.coil = M(0xffffff, { map: TEX.coil, roughness: 0.4, metalness: 0.7, uv: 0.5, env: 2 });
    SH.trafo = M(0x74837a, { roughness: 0.5, metalness: 0.35 });
    SH.trafoFin = M(0x7f8e85, { map: TEX.fins, roughness: 0.5, metalness: 0.4, uv: 0.6 });
    SH.ceramic = M(0xffffff, { map: TEX.insul, roughness: 0.3, env: 1.2 });
    SH.frame = M(0xbcc3c8, { metalness: 0.85, roughness: 0.4, env: 2 });
    SH.panelBack = M(0xdfe2e2, { roughness: 0.7 });
    SH.panel = M(0xffffff, { map: TEX.pv, roughness: 0.16, metalness: 0.2, env: 2.6 });
    SH.green = M(0x00a887, { roughness: 0.45, metalness: 0.2 });
    SH.blue = M(0x2f7fe0, { roughness: 0.4, metalness: 0.3 }); SH.red = M(0xd9534a, { roughness: 0.4, metalness: 0.3 });
    SH.leaf = M(0xffffff, { map: TEX.leaf, roughness: 1, env: 0.35 });
    SH.trunk = M(0x5b4636, { roughness: 1 });
    SH.glass = M(0xffffff, { map: TEX.glass, roughness: 0.06, metalness: 0.65, uv: 6, env: 3.2, emissive: 0xffe2b8, emissiveMap: TEX.glassE, emissiveIntensity: 0 });
    SH.carGlass = M(0x1b2830, { roughness: 0.08, metalness: 0.75, env: 3 });
    SH.tire = M(0x15171a, { roughness: 0.95 });
    SH.wood = M(0xb08a5a, { roughness: 0.8 });
    SH.box = M(0xb89a6a, { roughness: 0.95 });
    SH.contain = M(0xcfe6f0, { roughness: 0.08, metalness: 0, transparent: true, opacity: 0.2, depthWrite: false, env: 1.2 });
    SH.cabF = M(0xffffff, { map: TEX.cab, roughness: 0.5, metalness: 0.4, emissive: 0xffffff, emissiveMap: TEX.cabE, emissiveIntensity: 1 });
    SH.rackFront = M(0xffffff, { map: TEX.rack, roughness: 0.55, metalness: 0.4, emissive: 0xffffff, emissiveMap: TEX.rackE, emissiveIntensity: 1.6 });
    SH.rackBody = M(0x1b2024, { roughness: 0.5, metalness: 0.5 });
    SH.rackAlt = M(0x3d464e, { roughness: 0.5, metalness: 0.5 });
    SH.copper = M(0xc8793a, { metalness: 0.9, roughness: 0.3 }); SH.pcb = M(0x1f6b45, { roughness: 0.55 });
    SH.person = M(0xf2a600, { roughness: 0.75 }); SH.pants = M(0x27374d, { roughness: 0.9 }); SH.skin = M(0xd9a47a, { roughness: 0.8 }); SH.helmet = M(0xf4f4f0, { roughness: 0.4 });
    SH.hazard = M(0xffffff, { map: TEX.hazard, roughness: 0.7, uv: 1.2 });
    SH.sign = M(0xffffff, { map: TEX.sign, roughness: 0.6 });
    SH.light = B(0xfff6e0);
    SH.fan = new T.MeshStandardMaterial({ map: TEX.fan, transparent: true, alphaTest: 0.3, roughness: 0.5, metalness: 0.6, side: T.DoubleSide }); MATS.push(SH.fan); SH.fan.userData.env = 1;
    SH.grille = new T.MeshBasicMaterial({ map: TEX.grille, transparent: true, depthWrite: false, side: T.DoubleSide });
    SH.fence = new T.MeshStandardMaterial({ map: TEX.chain, transparent: true, depthWrite: false, side: T.DoubleSide, roughness: 0.6, metalness: 0.6 }); SH.fence.userData.uv = 0.7; SH.fence.userData.env = 1; MATS.push(SH.fence);
    SH.patchA = M(0x3a5222, { map: TEX.patch, transparent: true, opacity: 0.4, depthWrite: false, roughness: 1, env: 0.2 }); SH.patchB = M(0xbcae70, { map: TEX.patch, transparent: true, opacity: 0.4, depthWrite: false, roughness: 1, env: 0.2 });
    SH.ao = new T.MeshBasicMaterial({ map: TEX.ao, color: 0x000000, transparent: true, opacity: 0.5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    SH.wire = new T.LineBasicMaterial({ color: 0x2c3236 });
    SH.hot = B(0xe8573f, { transparent: true, opacity: 0.16, depthWrite: false }); SH.cold = B(0x3f8fe8, { transparent: true, opacity: 0.12, depthWrite: false });
    SH.screen = B(0x7fd6ff); SH.led = B(0x35e08a); SH.upsLed = B(0x35e08a);
    SH.zone = new T.MeshBasicMaterial({ colorWrite: false, depthWrite: false, transparent: true, opacity: 0, visible: false });
    SH.cloud = new T.MeshBasicMaterial({ map: TEX.shade, transparent: true, opacity: 0.3, depthWrite: false, fog: false });
    SH.lampHead = B(0x8a8f8c);
    SH.smoke = new T.MeshBasicMaterial({ color: 0x6f6f6f, transparent: true, opacity: 0.5, depthWrite: false, toneMapped: false });
    SH.heat = B(0xff9a3c, { transparent: true, opacity: 0.3, depthWrite: false });
    SH.glow = new T.MeshBasicMaterial({ map: TEX.glow, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false });
    SH.carPaint = [0xb5332b, 0xeef0f0, 0x2b5596, 0x30353a, 0xcfc9bb, 0x7d868c].map(function (c) { return M(c, { roughness: 0.28, metalness: 0.55, env: 2.2 }); });

    // vedere termica: ce culoare ia fiecare material cand aratam "temperatura"
    var cool = 0x25307e, cold = 0x161d58, warm = 0x6a48ae, hot = 0xf0823a, vhot = 0xffb040;
    THERM = [[SH.ground, 0x10163e], [SH.soil, 0x141a48], [SH.asphalt, 0x1c2260], [SH.road, 0x1c2260], [SH.concrete, cold], [SH.gravel, cold], [SH.wall, cool], [SH.wallIn, 0x34389a], [SH.base, 0x1e2360], [SH.trim, 0x222868],
      [SH.stripe, cool], [SH.roof, 0x283082], [SH.roofTrim, 0x222868], [SH.roofUnit, warm], [SH.floor, 0x3b3a9a], [SH.white, 0x4a3da6], [SH.paint, 0x2a3080], [SH.steel, 0x343a8c], [SH.dark, 0x46389e], [SH.silver, hot], [SH.cont, 0x4a3da6], [SH.contDark, 0x46389e],
      [SH.louver, warm], [SH.door, cool], [SH.coil, 0xf2883a], [SH.trafo, 0xe2603c], [SH.trafoFin, 0xee7440], [SH.ceramic, warm], [SH.frame, warm], [SH.panelBack, warm], [SH.panel, 0xa868d0], [SH.green, 0x5a40a8],
      [SH.blue, 0x2fb4ff], [SH.red, 0xff6a2a], [SH.leaf, 0x141c50], [SH.trunk, 0x141c50], [SH.glass, 0x34389a], [SH.carGlass, 0x34389a], [SH.tire, 0x2a2a70], [SH.wood, 0x3a3a96], [SH.box, 0x3a3a96], [SH.contain, 0xf2a060],
      [SH.cabF, 0xe07038], [SH.rackFront, 0xffe070], [SH.rackBody, vhot], [SH.rackAlt, 0xf2883a], [SH.copper, 0xfff2a8], [SH.pcb, 0xff9a3c], [SH.person, 0xf29a3c], [SH.pants, 0xe08a3c], [SH.skin, 0xf2a03c], [SH.helmet, 0xf29a3c],
      [SH.hazard, cool], [SH.sign, cool], [SH.fan, 0xf2883a]].map(function (e) { return { m: e[0], hot: e[1], base: e[0].color.getHex(), map: e[0].map || null, metal: e[0].metalness }; });
    SH.crops.forEach(function (m) { THERM.push({ m: m, hot: 0x121844, base: m.color.getHex(), map: m.map }); });
    SH.carPaint.forEach(function (m) { THERM.push({ m: m, hot: 0x3a3a96, base: m.color.getHex(), map: null }); });
  }

  /* ---------- geometrie lipita: piesele mici devin o singura plasa pe material, ca aparatul sa deseneze putine obiecte ---------- */
  var UNIT = {}, batch = null, _m4, _n3, _v, _q, _e, _s;
  function unit(key, make) { return UNIT[key] || (UNIT[key] = make()); }
  function Batch() { this.items = {}; this.list = []; }
  Batch.prototype.acc = function (parent, mat, cast) {
    var key = parent.id + '|' + mat.id + '|' + (cast ? 1 : 0), a = this.items[key];
    if (!a) { a = this.items[key] = { parent: parent, mat: mat, cast: cast, pos: [], nor: [], uv: [], idx: [], n: 0 }; this.list.push(a); }
    return a;
  };
  Batch.prototype.flush = function () {
    for (var i = 0; i < this.list.length; i++) {
      var a = this.list[i]; if (!a.n) continue;
      var g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(a.pos, 3)); g.setAttribute('normal', new T.Float32BufferAttribute(a.nor, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(a.uv, 2));
      g.setIndex(a.n > 65535 ? new T.Uint32BufferAttribute(a.idx, 1) : new T.Uint16BufferAttribute(a.idx, 1));
      var me = new T.Mesh(g, a.mat); me.castShadow = a.cast; me.receiveShadow = true; a.parent.add(me);
    }
    this.items = {}; this.list = [];
  };
  function addGeo(parent, geo, mat, x, y, z, sx, sy, sz, rot, cast) {
    var a = batch.acc(parent, mat, cast !== false);
    if (rot && rot.isQuaternion) _q.copy(rot); else { _e.set(rot ? rot[0] : 0, rot ? rot[1] : 0, rot ? rot[2] : 0); _q.setFromEuler(_e); }
    _m4.compose(_v.set(x, y, z), _q, _s.set(sx, sy, sz)); _n3.getNormalMatrix(_m4);
    var P = geo.attributes.position, N = geo.attributes.normal, U = geo.attributes.uv, I = geo.index, n0 = a.n, uvS = mat.userData.uv, i;
    for (i = 0; i < P.count; i++) {
      var px = P.getX(i), py = P.getY(i), pz = P.getZ(i), nx = N.getX(i), ny = N.getY(i), nz = N.getZ(i);
      _v.set(px, py, pz).applyMatrix4(_m4); a.pos.push(_v.x, _v.y, _v.z);
      if (uvS) {       // textura curge dupa metri reali, pe fata pe care sta
        var lx = px * sx + x, ly = py * sy + y, lz = pz * sz + z, ax = Math.abs(nx), ay = Math.abs(ny), az = Math.abs(nz);
        if (ay >= ax && ay >= az) a.uv.push(lx / uvS, lz / uvS); else if (ax >= az) a.uv.push(lz / uvS, ly / uvS); else a.uv.push(lx / uvS, ly / uvS);
      } else a.uv.push(U.getX(i), U.getY(i));
      _v.set(nx, ny, nz).applyMatrix3(_n3).normalize(); a.nor.push(_v.x, _v.y, _v.z);
    }
    if (I) for (i = 0; i < I.count; i++) a.idx.push(I.getX(i) + n0); else for (i = 0; i < P.count; i++) a.idx.push(n0 + i);
    a.n += P.count;
  }
  function tpl(fn) {         // o piesa repetata: se construieste o data si se deseneaza de multe ori (instante)
    var saved = batch, g = new T.Group(); batch = new Batch(); fn(g);
    var list = batch.list.filter(function (a) { return a.n; }), pos = [], nor = [], uv = [], idx = [], mats = [], n = 0, geo = new T.BufferGeometry();
    list.forEach(function (a, k) {
      var start = idx.length, i;
      for (i = 0; i < a.pos.length; i++) { pos.push(a.pos[i]); nor.push(a.nor[i]); }
      for (i = 0; i < a.uv.length; i++) uv.push(a.uv[i]);
      for (i = 0; i < a.idx.length; i++) idx.push(a.idx[i] + n);
      geo.addGroup(start, a.idx.length, k); mats.push(a.mat); n += a.n;
    });
    geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setAttribute('normal', new T.Float32BufferAttribute(nor, 3)); geo.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
    geo.setIndex(n > 65535 ? new T.Uint32BufferAttribute(idx, 1) : new T.Uint16BufferAttribute(idx, 1));
    batch = saved; return { geo: geo, mats: mats.length === 1 ? mats[0] : mats };
  }
  function inst(parent, t, n, cast) {
    var me = new T.InstancedMesh(t.geo, t.mats, Math.max(1, n)); me.count = n; me.frustumCulled = false; me.castShadow = cast !== false; me.receiveShadow = true; parent.add(me); return me;
  }

  function box(parent, w, h, d, m, x, y, z, cast, rot) { addGeo(parent, unit('box', function () { return new T.BoxGeometry(1, 1, 1); }), m, x, y, z, w, h, d, rot, cast); }
  function cyl(parent, rt, rb, h, m, x, y, z, seg, rot, cast) {
    seg = seg || 12; var ratio = Math.round(rt / rb * 100) / 100;
    addGeo(parent, unit('cyl|' + ratio + '|' + seg, function () { return new T.CylinderGeometry(ratio, 1, 1, seg); }), m, x, y, z, rb, h, rb, rot, cast);
  }
  function sph(parent, r, m, x, y, z, cast, sy, det) {
    det = det === undefined ? 1 : det;
    addGeo(parent, unit('ico' + det, function () { return new T.IcosahedronGeometry(1, det); }), m, x, y, z, r, r * (sy || 1), r, null, cast);
  }
  function flat(parent, w, d, m, x, y, z, rotY) {      // placa subtire culcata pe sol: marcaje, umbre, pete
    addGeo(parent, unit('flat', function () { var g = new T.PlaneGeometry(1, 1); g.rotateX(-Math.PI / 2); return g; }), m, x, y, z, w, 1, d, rotY ? [0, rotY, 0] : null, false);
  }
  function disc(parent, r, m, x, y, z) {
    addGeo(parent, unit('disc', function () { var g = new T.CircleGeometry(1, 20); g.rotateX(-Math.PI / 2); return g; }), m, x, y, z, r, 1, r, null, false);
  }
  var _a = null, _b = null, _up = null;
  function beam(parent, m, x0, y0, z0, x1, y1, z1, t, cast) {      // bara intre doua puncte
    _a.set(x0, y0, z0); _b.set(x1, y1, z1); var len = _a.distanceTo(_b), qq = new T.Quaternion().setFromUnitVectors(_up, _b.clone().sub(_a).normalize());
    box(parent, t, len, t, m, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, cast, qq);
  }
  function ao(parent, w, d, x, y, z, k) {              // umbra de contact: leaga obiectul de sol si pe vreme inchisa
    flat(parent, w * (k || 1.9), d * (k || 1.9), SH.ao, x, y, z);
  }
  function mesh(parent, geo, m, x, y, z, cast) {       // obiect separat, pentru piesele care se misca singure
    var me = new T.Mesh(geo, m); me.position.set(x, y, z); me.castShadow = cast !== false; me.receiveShadow = true; parent.add(me); return me;
  }
  function tag(obj, id) { tags.push([obj, id]); }
  function applyTags() {
    tags.forEach(function (e) { e[0].traverse(function (o) { if (o.isMesh && o.material !== SH.ao && o.material !== SH.grille) { o.userData.pick = e[1]; pickObjs.push(o); } }); });
    tags = [];
  }
  function zone(parent, id, xa, xb, za, zb, h) {       // zona invizibila, ca obiectele mici sa fie usor de apasat
    var me = new T.Mesh(new T.BoxGeometry(Math.abs(xb - xa), h, Math.abs(zb - za)), SH.zone);
    me.position.set((xa + xb) / 2, h / 2, (za + zb) / 2); me.userData.pick = id; me.renderOrder = -1; parent.add(me); pickObjs.push(me);
  }
  function disposeTree(o) { o.traverse(function (c) { if (c.geometry) c.geometry.dispose(); }); }
