  /* ---------- piese pentru hala renovata: acoperis in doua ape, usi, ferestre, burlane, camere (zw = fata peretelui, s = +1 spre sud, -1 spre nord) ---------- */
  var FAT_SL = 0.09, FAT_RDG = 7.9;           // panta si inaltimea coamei halei centrului; se iau din planul bazei la fiecare constructie (vezi 31-fatada.js)
  function fatMats() {                        // tabla noua de acoperis: se ridica si se stinge odata cu acoperisul, deci intra in ROOFM
    if (SH.haRoof) return;
    TEX.haRoof = canvasTex(128, 128, function (g, w, h) {       // tabla cutata noua: 2 m pe repetare, cute la 25 cm, care curg de la coama spre streasina
      g.fillStyle = '#f3f2ec'; g.fillRect(0, 0, w, h);
      for (var x = 0; x < w; x += 16) { g.fillStyle = 'rgba(255,255,255,.8)'; g.fillRect(x + 5, 0, 2, h); g.fillStyle = 'rgba(70,74,72,.36)'; g.fillRect(x + 7, 0, 2, h); g.fillStyle = 'rgba(70,74,72,.12)'; g.fillRect(x + 9, 0, 2, h); }
      g.fillStyle = 'rgba(60,64,62,.22)'; g.fillRect(0, 0, 1, h);                                    // imbinarea dintre doua panouri
    });
    TEX.haDoor = canvasTex(32, 64, function (g, w, h) {         // usa sectionala: un panou cu nervuri fine si rostul de jos (se repeta de 6 ori pe inaltimea usii)
      g.fillStyle = '#eceeee'; g.fillRect(0, 0, w, h);
      for (var y = 4; y < h - 4; y += 8) { g.fillStyle = 'rgba(255,255,255,.65)'; g.fillRect(0, y, w, 1); g.fillStyle = 'rgba(60,66,70,.16)'; g.fillRect(0, y + 1, w, 1); }
      g.fillStyle = 'rgba(40,46,50,.65)'; g.fillRect(0, h - 2, w, 2); g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(0, 0, w, 1);
    });
    TEX.haDoor.repeat.set(1, 6);
    SH.haDoor = M(0xc4c9cc, { map: TEX.haDoor, roughness: 0.5, metalness: 0.4, env: 1 });
    THERM.push({ m: SH.haDoor, hot: 0x25307e, base: SH.haDoor.color.getHex(), map: SH.haDoor.map, metal: SH.haDoor.metalness });
    SH.haRoof = M(0xdbd8ce, { map: TEX.haRoof, roughness: 0.5, metalness: 0.3, uv: 2, transparent: true, opacity: 1, env: 0.8 });
    ROOFM.push(SH.haRoof);
    THERM.push({ m: SH.haRoof, hot: 0x283082, base: SH.haRoof.color.getHex(), map: SH.haRoof.map, metal: SH.haRoof.metalness });
  }
  function fatSlope(g, m, xa, xb, za, zb, sg, t, lift, cast) {   // fasie culcata pe panta acoperisului: intre distantele za si zb fata de coama, pe apa sg (+1 sud, -1 nord); fata de sus sta cu `lift` peste tabla
    var a = Math.atan(FAT_SL), c = Math.cos(a), s = Math.sin(a), zm = (za + zb) / 2, ys = FAT_RDG - FAT_SL * zm + lift;
    box(g, xb - xa, t, (zb - za) / c, m, (xa + xb) / 2, ys - t / 2 * c, sg * (zm - t / 2 * s), cast, [sg * a, 0, 0]);
  }
  function fatTri(g, m, x, y0, half, rise, nx) {                 // fronton: triunghiul de perete dintre streasina si coama; nx = incotro priveste (-1 vest, +1 est)
    var a = batch.acc(g, m, true), n0 = a.n, u = m.userData.uv || 1;
    a.pos.push(x, y0, -half, x, y0, half, x, y0 + rise, 0);
    a.nor.push(nx, 0, 0, nx, 0, 0, nx, 0, 0);
    a.uv.push(-half / u, y0 / u, half / u, y0 / u, 0, (y0 + rise) / u);
    if (nx < 0) a.idx.push(n0, n0 + 1, n0 + 2); else a.idx.push(n0, n0 + 2, n0 + 1);
    a.n += 3;
  }
  function fatDoor(g, x, zw, s, exit) {             // usa metalica noua de 1,0 x 2,1 m (podeaua e la 0,3): toc zincat, foaie inchisa, maner, tabla de protectie, lampa de siguranta, copertina pe console
    box(g, 1.0, 2.1, 0.06, SH.trim, x, 1.35, zw + s * 0.03, false);
    box(g, 0.07, 2.17, 0.1, SH.steel, x - 0.535, 1.385, zw + s * 0.05, false); box(g, 0.07, 2.17, 0.1, SH.steel, x + 0.535, 1.385, zw + s * 0.05, false);
    box(g, 1.14, 0.07, 0.1, SH.steel, x, 2.435, zw + s * 0.05, false);
    box(g, 0.03, 0.14, 0.05, SH.steel, x + 0.38, 1.33, zw + s * 0.085, false);
    box(g, 0.9, 0.24, 0.012, SH.steel, x, 0.46, zw + s * 0.066, false);
    box(g, 0.36, 0.1, 0.1, SH.light, x, 2.62, zw + s * 0.05, false);
    if (exit) box(g, 0.3, 0.12, 0.025, SH.light, x, 2.755, zw + s * 0.0125, false);                      // indicatorul luminos de iesire
    box(g, 1.4, 0.04, 0.8, SH.trim, x, 2.86, zw + s * 0.4, false);
    for (var k = -1; k <= 1; k += 2) beam(g, SH.steel, x + k * 0.64, 2.84, zw + s * 0.76, x + k * 0.64, 2.52, zw + s * 0.02, 0.035, false);
  }
  function fatDownpipe(g, x, zw, s, yG, yB) { // burlan nou: palnie sub jgheab, teava prinsa cu bratari de perete, cot la baza spre gura de scurgere (yG = fundul jgheabului, yB = betonul)
    var zp = zw + s * 0.17, y;
    box(g, 0.2, 0.2, 0.17, SH.steel, x, yG - 0.1, zw + s * 0.105, false);
    cyl(g, 0.05, 0.05, yG - 0.2 - yB - 0.2, SH.steel, x, (yG - 0.2 + yB + 0.2) / 2, zp, 8, null, false);
    for (y = yB + 1.3; y < yG - 0.6; y += 1.75) box(g, 0.13, 0.035, 0.235, SH.steel, x, y, zw + s * 0.1175, false);
    beam(g, SH.steel, x, yB + 0.24, zp, x, yB + 0.1, zp + s * 0.15, 0.1, false);
  }
  function fatCam(g, x, y, zw, s, dx) {       // camera video pe consola, prinsa de perete, intoarsa de-a lungul peretelui (dx = incotro priveste pe x)
    box(g, 0.1, 0.14, 0.03, SH.trim, x, y, zw + s * 0.015, false);
    box(g, 0.04, 0.04, 0.3, SH.trim, x, y, zw + s * 0.16, false);
    box(g, 0.11, 0.11, 0.26, SH.steel, x + dx * 0.05, y - 0.11, zw + s * 0.3, false, [s * 0.35, -dx * s * 0.5, 0]);
    box(g, 0.13, 0.02, 0.3, SH.trim, x + dx * 0.05, y - 0.045, zw + s * 0.31, false, [s * 0.35, -dx * s * 0.5, 0]);
  }
  function fatWin(g, x, y, w, h, zw, s) {     // fereastra noua de birou: geam, rama, montant la mijloc si glaf
    var e;
    box(g, w, h, 0.04, SH.glass, x, y, zw + s * 0.012, false);
    for (e = -1; e <= 1; e += 2) { box(g, 0.06, h + 0.12, 0.07, SH.trim, x + e * (w / 2 + 0.03), y, zw + s * 0.035, false); box(g, w, 0.06, 0.07, SH.trim, x, y + e * (h / 2 + 0.03), zw + s * 0.035, false); }
    box(g, 0.045, h, 0.06, SH.trim, x, y, zw + s * 0.035, false);
    box(g, w + 0.2, 0.03, 0.13, SH.trim, x, y - h / 2 - 0.075, zw + s * 0.065, false);
  }
  function fatLouver(g, a, y, w, h, wall, s, alongZ) {   // grila noua de aerisire cu rama; pe peretii lungi a = x, pe fronton (alongZ) a = z, iar wall = fata peretelui
    var e;
    if (alongZ) {
      box(g, 0.05, h, w, SH.louver, wall + s * 0.025, y, a, false);
      for (e = -1; e <= 1; e += 2) { box(g, 0.08, 0.06, w + 0.12, SH.trim, wall + s * 0.04, y + e * (h / 2 + 0.03), a, false); box(g, 0.08, h, 0.06, SH.trim, wall + s * 0.04, y, a + e * (w / 2 + 0.03), false); }
    } else {
      box(g, w, h, 0.05, SH.louver, a, y, wall + s * 0.025, false);
      for (e = -1; e <= 1; e += 2) { box(g, w + 0.12, 0.06, 0.08, SH.trim, a, y + e * (h / 2 + 0.03), wall + s * 0.04, false); box(g, 0.06, h, 0.08, SH.trim, a + e * (w / 2 + 0.03), y, wall + s * 0.04, false); }
    }
  }
  function fatLamp(g, x, y, zw, s) {          // proiector de perete cu LED, aplecat spre curte
    box(g, 0.08, 0.1, 0.06, SH.trim, x, y + 0.02, zw + s * 0.03, false);
    box(g, 0.3, 0.07, 0.2, SH.trim, x, y, zw + s * 0.15, false, [s * 0.3, 0, 0]);
    box(g, 0.26, 0.012, 0.16, SH.light, x, y - 0.042, zw + s * 0.14, false, [s * 0.3, 0, 0]);
  }
  function fatHoop(g, x, y, z) {              // suport de biciclete: teava in U intors, cu talpi prinse in beton; lung pe z
    for (var e = -1; e <= 1; e += 2) { cyl(g, 0.024, 0.024, 0.78, SH.steel, x, y + 0.39, z + e * 0.36, 8, null, false); box(g, 0.14, 0.012, 0.14, SH.steel, x, y + 0.006, z + e * 0.36, false); }
    cyl(g, 0.024, 0.024, 0.768, SH.steel, x, y + 0.78, z, 8, [Math.PI / 2, 0, 0], false);
  }
  function fatBike(g, x, y, z) {              // bicicleta lasata in suport, lunga pe z: roti, cadru, sa si ghidon
    var r = 0.34, e, yh = y + r;
    for (e = -1; e <= 1; e += 2) {
      addGeo(g, unit('torus', function () { return new T.TorusGeometry(1, 0.07, 5, 16); }), SH.dark, x, yh, z + e * 0.52, r, r, r, [0, Math.PI / 2, 0], false);
      cyl(g, 0.03, 0.03, 0.08, SH.steel, x, yh, z + e * 0.52, 6, [0, 0, Math.PI / 2], false);
    }
    beam(g, SH.dark, x, yh, z - 0.52, x, yh - 0.04, z - 0.1, 0.028, false);                // furca din spate
    beam(g, SH.dark, x, yh - 0.04, z - 0.1, x, y + 0.9, z - 0.26, 0.03, false);            // teava seii
    beam(g, SH.dark, x, yh, z - 0.52, x, y + 0.8, z - 0.235, 0.022, false);
    beam(g, SH.dark, x, y + 0.8, z - 0.235, x, y + 0.86, z + 0.34, 0.03, false);           // teava de sus
    beam(g, SH.dark, x, yh - 0.04, z - 0.1, x, y + 0.82, z + 0.35, 0.034, false);          // teava de jos
    beam(g, SH.dark, x, y + 0.98, z + 0.31, x, yh, z + 0.52, 0.03, false);                 // furca din fata si tija ghidonului
    box(g, 0.13, 0.04, 0.26, SH.dark, x, y + 0.93, z - 0.27, false);                       // saua
    box(g, 0.52, 0.03, 0.03, SH.dark, x, y + 0.99, z + 0.3, false);                        // ghidonul
  }
