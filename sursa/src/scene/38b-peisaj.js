    // pete mari, mai inchise si mai uscate, ca iarba si culturile sa nu arate uniform
    for (i = 0; i < 120; i++) {
      var pa = R() * 6.28, prd = RR * (i < 40 ? R() * 1.2 : 0.4 + R() * 4.2), psz = (i < 40 ? 14 + R() * 40 : 40 + R() * 110) * k;
      quad(root, R() > 0.45 ? SH.patchA : SH.patchB, cx + Math.cos(pa) * prd, 0.03 + i * 0.0004, cz + Math.sin(pa) * prd, psz, psz * (0.5 + R() * 0.8), 1, 1, false);
    }
    // parcele agricole in jur, la scara din campia Doljului: sole mari si fasii lungi de grau, porumb, floarea-soarelui si rapita.
    // Lanurile vin pana la 9 m de gard si se opresc la banda inierbata a drumului national.
    peisajMats();
    var cell = Math.max(260, Math.max(spanX, spanZ) * 0.62), gap = 3, pjCrops = SH.crops.concat([SH.maize, SH.sunfl, SH.maize, SH.sunfl, SH.crops[0]]);
    var pjRd0 = zRoad - 13.5, pjRd1 = zRoad + 11.5, pjEx = [x0 - 9, x1 + 9, z0 - 9, pjRd0];
    function pjField(m, xa, xb, za, zb, aX, lv) {
      if (xb - xa < 1.5 || zb - za < 1.5) return;
      if (!lv && zb > pjRd0 && za < pjRd1) { pjField(m, xa, xb, za, Math.min(zb, pjRd0), aX, 0); pjField(m, xa, xb, Math.max(za, pjRd1), zb, aX, 0); return; }      // banda drumului
      if (lv < 2 && xb > pjEx[0] && xa < pjEx[1] && zb > pjEx[2] && za < pjEx[3]) {                                                                                    // incinta
        pjField(m, xa, Math.min(xb, pjEx[0]), za, zb, aX, 2); pjField(m, Math.max(xa, pjEx[1]), xb, za, zb, aX, 2);
        var xc0 = Math.max(xa, pjEx[0]), xc1 = Math.min(xb, pjEx[1]);
        pjField(m, xc0, xc1, za, Math.min(zb, pjEx[2]), aX, 2); pjField(m, xc0, xc1, Math.max(za, pjEx[3]), zb, aX, 2);
        return;
      }
      var fw = xb - xa, fd = zb - za, rep = 26 * k;
      quad(root, m, (xa + xb) / 2, 0.02, (za + zb) / 2, fw, fd, aX ? fw / rep : fd / rep, aX ? fd / rep : fw / rep, !aX);
    }
    for (i = -7; i <= 7; i++) for (j = -7; j <= 7; j++) {
      var fx0 = cx + i * cell, fz0 = cz + j * cell;
      if ((fx0 - cx) * (fx0 - cx) + (fz0 - cz) * (fz0 - cz) > RR * RR * 200) continue;      // dincolo de ceata nu se mai vede nimic
      var ns = R() < 0.3 ? 1 : 3 + Math.floor(R() * 5), alongX = R() > 0.5, full = cell - gap, part = full / ns;
      for (var s = 0; s < ns; s++) {
        var off = -full / 2 + (s + 0.5) * part, hw2 = (part - gap * 0.5) / 2, pm = pjCrops[Math.floor(R() * pjCrops.length)];
        if (alongX) pjField(pm, fx0 - full / 2, fx0 + full / 2, fz0 + off - hw2, fz0 + off + hw2, true, 0);
        else pjField(pm, fx0 + off - hw2, fx0 + off + hw2, fz0 - full / 2, fz0 + full / 2, false, 0);
      }
    }
    // drum national la sud: carosabil de 7 m cu linie intrerupta de 3 m la 6 m, acostamente de pietris de 1,5 m, benzi inierbate
    var pjRdW = 8.64, pjRdL = RR * 30;
    quad(root, SH.road, cx, 0.13, zRoad, pjRdL, pjRdW, pjRdL / 9, 1, false);
    quad(root, SH.gravel, cx, 0.115, zRoad + pjRdW / 2 + 0.45, pjRdL, 1.1, pjRdL / 5, 0.22, false);
    quad(root, SH.gravel, (cx - pjRdL / 2 + xGate - 6.5) / 2, 0.115, zRoad - pjRdW / 2 - 0.45, xGate - 6.5 - (cx - pjRdL / 2), 1.1, (xGate - 6.5 - (cx - pjRdL / 2)) / 5, 0.22, false);
    quad(root, SH.gravel, (cx + pjRdL / 2 + xGate + 6.5) / 2, 0.115, zRoad - pjRdW / 2 - 0.45, cx + pjRdL / 2 - xGate - 6.5, 1.1, (cx + pjRdL / 2 - xGate - 6.5) / 5, 0.22, false);
    var siteG = grp(root), carsG = grp(root), peopleG = grp(root);
    var zA = platZ1 - 4, zB = zRoad - 4.2;
    box(siteG, 7, 0.22, zB - zA, SH.asphalt, xGate, 0.11, (zA + zB) / 2, false);
    flat(siteG, 0.14, zB - zA - 1, SH.paint, xGate - 3.2, 0.226, (zA + zB) / 2); flat(siteG, 0.14, zB - zA - 1, SH.paint, xGate + 3.2, 0.226, (zA + zB) / 2); flat(siteG, 3.0, 0.4, SH.paint, xGate - 1.6, 0.226, zB - 1.2);
    quad(siteG, SH.asphalt, xGate, 0.125, zRoad - pjRdW / 2 - 0.5, 13, 1.3, 13 / 8, 1.3 / 8, false);                                   // gura largita a accesului, pana in marginea carosabilului
