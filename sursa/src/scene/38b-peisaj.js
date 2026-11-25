    // pete mari, mai inchise si mai uscate, ca iarba si culturile sa nu arate uniform
    for (i = 0; i < 120; i++) {
      var pa = R() * 6.28, prd = RR * (i < 40 ? R() * 1.2 : 0.4 + R() * 4.2), psz = (i < 40 ? 14 + R() * 40 : 40 + R() * 110) * k;
      quad(root, R() > 0.45 ? SH.patchA : SH.patchB, cx + Math.cos(pa) * prd, 0.03 + i * 0.0004, cz + Math.sin(pa) * prd, psz, psz * (0.5 + R() * 0.8), 1, 1, false);
    }
    // parcele agricole in jur: fasii lungi, cum sunt in Dolj
    var cell = Math.max(spanX, spanZ) * 0.62, gap = 4 * k;
    for (i = -7; i <= 7; i++) for (j = -7; j <= 7; j++) {
      var fx0 = cx + i * cell, fz0 = cz + j * cell;
      if (fx0 + cell / 2 > x0 - 6 && fx0 - cell / 2 < x1 + 6 && fz0 + cell / 2 > z0 - 6 && fz0 - cell / 2 < z1 + 20) continue;
      var ns = 1 + Math.floor(R() * 3.4), alongX = R() > 0.5, full = cell - gap, part = full / ns;
      for (var s = 0; s < ns; s++) {
        var off = -full / 2 + (s + 0.5) * part, fw = alongX ? full : part - gap * 0.35, fd = alongX ? part - gap * 0.35 : full, rep = 26 * k;
        quad(root, SH.crops[Math.floor(R() * SH.crops.length)], fx0 + (alongX ? 0 : off), 0.02, fz0 + (alongX ? off : 0), fw, fd, alongX ? fw / rep : fd / rep, alongX ? fd / rep : fw / rep, !alongX);
      }
    }
    // drum national la sud + acces
    quad(root, SH.road, cx, 0.13, zRoad, RR * 30, 10, RR * 30 / 12, 1, false);
    var siteG = grp(root), carsG = grp(root), peopleG = grp(root);
    var zA = platZ1 - 4, zB = zRoad - 4.2;
    box(siteG, 7, 0.22, zB - zA, SH.asphalt, xGate, 0.11, (zA + zB) / 2, false);
    flat(siteG, 0.14, zB - zA - 1, SH.paint, xGate - 3.2, 0.226, (zA + zB) / 2); flat(siteG, 0.14, zB - zA - 1, SH.paint, xGate + 3.2, 0.226, (zA + zB) / 2); flat(siteG, 3.0, 0.4, SH.paint, xGate + 1.6, 0.226, zB - 1.2);
