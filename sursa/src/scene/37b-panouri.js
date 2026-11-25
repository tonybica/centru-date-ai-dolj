    /* --- parcul fotovoltaic --- */
    // mese de 30 kWp (52 de module), pas intre randuri 9,8 m (la 44 de grade nord randurile nu se umbresc iarna la pranz): circa 1,1 ha pe MWp
    var nT = Math.ceil(p.pv * 1000 / 30), pitch = 9.8, colW = 32;
    var nc = Math.max(1, Math.round(Math.sqrt(nT * 0.42))), nr = Math.max(1, Math.ceil(nT / nc));
    function colX(c) { return c * colW + Math.floor(c / 4) * 6; }
    var fieldW = nT ? colX(nc - 1) + 30 : 0, fieldD = nT ? nr * pitch : 0, tables = null, inv = null, pvG = grp(root);
    if (nT > 0) {
      tables = inst(root, pvTableTpl(), nT);
      for (i = 0; i < nT; i++) { mtx.compose(pos.set(colX(i % nc) + 15 - fieldW / 2, 0, zPV0 - Math.floor(i / nc) * pitch - 2.3), q0, one); tables.setMatrixAt(i, mtx); }
      inv = grp(root);
      (function () {
        var hw = fieldW / 2, zT = zPV0 + 0.55, zs = zPV0 + 2.9, xR = -W / 2 + 3, a, b, c, r, n, x, z, st = [], si = [], lines = {}, xa, xb;
        // santuri: pe pamant capace de beton la 0,10, pe platforma la 0,245; rame de otel pe margini si rosturi la 2 m
        function trench(x0, z0, x1, z1, top, h) {
          var alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0), len = alongX ? Math.abs(x1 - x0) : Math.abs(z1 - z0), mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, t, sdd;
          if (len < 0.05) return;
          box(pvG, alongX ? len : 0.6, h, alongX ? 0.6 : len, SH.concrete, mx, top - h / 2, mz, false);
          for (sdd = -1; sdd <= 1; sdd += 2) box(pvG, alongX ? len : 0.04, h + 0.012, alongX ? 0.04 : len, SH.dark, mx + (alongX ? 0 : sdd * 0.32), top - h / 2 + 0.006, mz + (alongX ? sdd * 0.32 : 0), false);
          if (!Q.lite) for (t = 1; t < len; t += 2) box(pvG, alongX ? 0.025 : 0.6, 0.012, alongX ? 0.6 : 0.025, SH.dark, alongX ? Math.min(x0, x1) + t : mx, top + 0.002, alongX ? mz : Math.min(z0, z1) + t, false);
        }
        function pit(x, z, top) { box(pvG, 1.1, top, 1.1, SH.concrete, x, top / 2, z, false); box(pvG, 0.76, 0.02, 0.76, SH.steel, x, top + 0.01, z, false); }
        function marker(x, z) { box(pvG, 0.1, 0.5, 0.1, SH.concrete, x, 0.25, z, false); box(pvG, 0.11, 0.09, 0.11, SH.stripe, x, 0.545, z, false); }

        // statii de transformare: una la cel mult 5 MWp, langa un drum, niciodata pe el
        n = Math.max(1, Math.ceil(p.pv / 5));
        for (a = 0; a < n; a++) {
          x = -hw + (a + 0.5) * fieldW / n;
          for (c = 4; c < nc; c += 4) { b = colX(c) - 4 - hw; if (Math.abs(x - b) < 6.5) x = b + 7.5; }
          st.push(x); inverterStation(inv, x, zs);
          trench(x + 2.05, zT + 0.3, x + 2.05, zs - 1.6, 0.1, 0.1); trench(x + 3.4, zT + 0.3, x + 3.4, zs - 1.6, 0.1, 0.1);      // intrarea de joasa tensiune si iesirea de medie tensiune
        }
        tag(inv, 'pv');

        // invertoare de sir: unul la 8 mese (2 randuri x 4 coloane), la capatul vestic al mesei din fata
        for (c = 0; c < nc; c += 4) for (r = 0; r < nr; r += 2) {
          n = 0;
          for (a = r; a < Math.min(nr, r + 2); a++) for (b = c; b < Math.min(nc, c + 4); b++) if (a * nc + b < nT) n++;
          if (n >= 4) { si.push([colX(c) - 0.3 - hw, zPV0 - r * pitch - 2.871]); lines[c] = zPV0 - r * pitch - 2.871; }
        }
        var siI = inst(inv, pvStringInvTpl(), si.length);
        si.forEach(function (q, k) { mtx.compose(pos.set(q[0], 0, q[1]), q0, one); siI.setMatrixAt(k, mtx); });

        // santuri ingropate de joasa tensiune: fasie de pamant proaspat astupat si borne de marcaj, de la invertoare pana la coridorul din sud
        xa = xb = st[0];
        for (c = 0; c < nc; c += 4) if (lines[c] !== undefined) {
          x = colX(c) - 1.2 - hw; xa = Math.min(xa, x); xb = Math.max(xb, x);
          flat(pvG, 0.5, zT - lines[c], SH.soil, x, 0.068, (zT + lines[c]) / 2);
        }
        si.forEach(function (q, k) { flat(pvG, 0.9, 0.35, SH.soil, q[0] - 0.55, 0.069, q[1]); if (!Q.lite && k % 2 === 0) marker(q[0] - 1.25, q[1] + 0.6); });
        st.forEach(function (x) { xa = Math.min(xa, x + 2.05); xb = Math.max(xb, x + 3.4); });
        flat(pvG, xb - xa + 0.6, 0.7, SH.soil, (xa + xb) / 2, 0.068, zT);
        if (!Q.lite) for (x = xa + 15; x < xb - 5; x += 30) marker(x, zT - 0.55);

        // sant de medie tensiune cu capace: de la statii pe coridorul din sud, apoi spre sud pe x = -W/2 + 3 pana la dulapul de pe peretele nordic
        xa = Math.min(xR, st[0] + 3.4); xb = Math.max(xR, st[st.length - 1] + 3.4);
        trench(xa - 0.3, zT, xb + 0.3, zT, 0.1, 0.1);
        pit(xR, zT, 0.16);
        trench(xR, zT + 0.55, xR, platZ0 - 0.15, 0.1, 0.1);
        trench(xR, platZ0 + 0.15, xR, -D / 2 - 0.3, 0.245, 0.05);

        // drumuri de intretinere din pietris, late de 4 m, legate de platforma; fasii batatorite intre randuri
        for (c = 4; c < nc; c += 4) flat(pvG, 4, fieldD + 6.85, SH.gravel, colX(c) - 4 - hw, 0.075, zPV0 - fieldD / 2 + 1.425);
        flat(pvG, fieldW + 12, 4, SH.gravel, 0, 0.07, zPV0 - fieldD - 3.2);
        for (sd = -1; sd <= 1; sd += 2) flat(pvG, 4, fieldD + 10.05, SH.gravel, sd * (hw + 4), 0.072, zPV0 - fieldD / 2 - 0.175);
        for (r = 0; r < nr; r++) flat(pvG, fieldW, 1.6, SH.soil, 0, 0.065, zPV0 - r * pitch - 2.3 - pitch / 2);

        // statie meteo pe fundatie, in coltul de sud-vest
        var wmx = -hw + 2, wmz = zPV0 + 2.4;
        box(pvG, 0.6, 0.25, 0.6, SH.concrete, wmx, 0.125, wmz, false);
        cyl(pvG, 0.04, 0.06, 5, SH.steel, wmx, 2.7, wmz, 8); box(pvG, 1.3, 0.05, 0.05, SH.steel, wmx, 4.8, wmz, false); sph(pvG, 0.11, SH.silver, wmx - 0.6, 4.95, wmz, false, 1, 0);
        box(pvG, 0.03, 0.1, 0.03, SH.steel, wmx + 0.55, 4.86, wmz, false); box(pvG, 0.4, 0.03, 0.3, SH.panel, wmx + 0.55, 4.92, wmz, false, [0.436, 0, 0]); box(pvG, 0.35, 0.45, 0.2, SH.white, wmx, 1.5, wmz + 0.12, false);
        cyl(pvG, 0.02, 0.02, 1.3, SH.dark, wmx + 0.07, 0.65, wmz + 0.12, 6, null, false);
        // container de piese de schimb, pe traverse de beton
        var spx = hw + 7.6, spz = zPV0 - 9;
        for (a = -1; a <= 1; a++) box(pvG, 2.7, 0.15, 0.3, SH.concrete, spx, 0.075, spz + a * 2.7, false);
        box(pvG, 2.44, 2.6, 6.06, SH.contDark, spx, 1.45, spz); box(pvG, 2.2, 2.3, 0.05, SH.cont, spx, 1.42, spz + 3.04, false); box(pvG, 0.04, 1.6, 0.04, SH.steel, spx - 0.3, 1.42, spz + 3.08, false); box(pvG, 0.04, 1.6, 0.04, SH.steel, spx + 0.3, 1.42, spz + 3.08, false);
        ao(pvG, 2.6, 6.2, spx, 0.08, spz, 1.4);
      })();
    }
    var zPVmid = zPV0 - fieldD / 2, zPVend = zPV0 - fieldD;
