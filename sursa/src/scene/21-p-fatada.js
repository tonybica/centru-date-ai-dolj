
  /* ---------- piese de fatada: usi, burlane, scara, camere (zw = fata peretelui, s = +1 spre sud, -1 spre nord) ---------- */
  function fatDoor(g, x, zw, s, exit) {       // usa metalica de 1,0 x 2,1 m cu toc, maner, lampa, copertina si prag (podeaua e cu 10 cm peste platforma)
    box(g, 1.0, 2.1, 0.08, SH.white, x, 1.35, zw + s * 0.04, false);
    box(g, 0.08, 2.2, 0.12, SH.trim, x - 0.54, 1.4, zw + s * 0.05, false); box(g, 0.08, 2.2, 0.12, SH.trim, x + 0.54, 1.4, zw + s * 0.05, false);
    box(g, 1.16, 0.08, 0.12, SH.trim, x, 2.44, zw + s * 0.05, false);
    box(g, 0.04, 0.16, 0.07, SH.steel, x + 0.36, 1.32, zw + s * 0.1, false);
    box(g, 0.5, 0.1, 0.18, SH.light, x, 2.66, zw + s * 0.1, false);
    if (exit) box(g, 0.32, 0.13, 0.03, SH.led, x, 2.84, zw + s * 0.025, false);                        // indicatorul verde de iesire
    box(g, 1.5, 0.1, 1.1, SH.concrete, x, 0.25, zw + s * 0.55, false);
    box(g, 1.4, 0.05, 0.85, SH.trim, x, 2.98, zw + s * 0.42, false);
    for (var k = -1; k <= 1; k += 2) beam(g, SH.trim, x + k * 0.62, 2.96, zw + s * 0.8, x + k * 0.62, 2.6, zw + s * 0.02, 0.04, false);   // consolele copertinei
  }
  function fatDownpipe(g, x, zw, s, H) {      // burlan: cotul de sub palnia de pe atic, teava prinsa cu bratari, papuc si gura de scurgere in platforma
    var zp = zw + s * 0.2, y;
    beam(g, SH.silver, x, H + 0.03, zw + s * 0.375, x, H - 0.42, zp, 0.12, false);
    cyl(g, 0.06, 0.06, H - 0.72, SH.silver, x, (H - 0.42 + 0.3) / 2, zp, 8, null, false);
    for (y = 1.4; y < H - 0.6; y += 1.9) box(g, 0.2, 0.05, 0.2, SH.steel, x, y, zw + s * 0.12, false);
    beam(g, SH.silver, x, 0.34, zp, x, 0.24, zp + s * 0.12, 0.12, false);
    box(g, 0.42, 0.04, 0.42, SH.dark, x, 0.222, zp + s * 0.16, false);
  }
  function fatLadder(g, x, zw, s, H) {        // scara fixa cu colivie: lonjeroane prinse de perete, trepte la 30 cm, colivie de la 2,5 m, panou incuiat jos
    var z = zw + s * 0.42, top = H + 1.9, i, y;
    for (i = -1; i <= 1; i += 2) {
      box(g, 0.05, top - 0.2, 0.05, SH.steel, x + i * 0.25, (top + 0.2) / 2, z, false);
      for (y = 1.0; y < H - 0.1; y += 1.5) box(g, 0.05, 0.05, 0.42, SH.steel, x + i * 0.25, y, zw + s * 0.21, false);
      box(g, 0.14, 0.02, 0.14, SH.steel, x + i * 0.25, 0.21, z, false);
    }
    for (y = 0.5; y < H + 0.8; y += 0.3) box(g, 0.5, 0.03, 0.03, SH.steel, x, y, z, false);
    for (y = 2.5; y < top + 0.01; y += 0.85) {
      box(g, 0.03, 0.04, 0.66, SH.steel, x - 0.36, y, z + s * 0.33, false); box(g, 0.03, 0.04, 0.66, SH.steel, x + 0.36, y, z + s * 0.33, false);
      box(g, 0.75, 0.04, 0.03, SH.steel, x, y, z + s * 0.66, false);
    }
    for (i = -1; i <= 1; i++) box(g, 0.03, top - 2.5, 0.03, SH.steel, x + i * 0.36, (top + 2.5) / 2, z + s * 0.66, false);
    box(g, 0.62, 2.0, 0.03, SH.steel, x, 1.45, z + s * 0.05, false);
    box(g, 0.2, 0.26, 0.02, SH.hazard, x, 1.6, z + s * 0.07, false);
  }
  function fatCam(g, x, y, zw, s, dx) {       // camera video pe consola, prinsa de perete, intoarsa spre curte
    box(g, 0.1, 0.14, 0.03, SH.dark, x, y, zw + s * 0.015, false);
    box(g, 0.04, 0.04, 0.3, SH.dark, x, y, zw + s * 0.16, false);
    box(g, 0.11, 0.11, 0.26, SH.white, x + dx * 0.05, y - 0.11, zw + s * 0.3, false, [s * 0.35, -dx * s * 0.5, 0]);
    box(g, 0.13, 0.02, 0.3, SH.white, x + dx * 0.05, y - 0.045, zw + s * 0.31, false, [s * 0.35, -dx * s * 0.5, 0]);
  }
