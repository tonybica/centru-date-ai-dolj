    /* --- panouri fotovoltaice pe acoperisurile halelor --- */
    // Baza nu are teren liber, deci modulele stau pe acoperisuri: 2,28 x 1,13 m, 580 Wp, culcate pe tabla pe ambele ape (panta de 5 grade, fara cadre inclinate),
    // cu latura lunga pe directia coamei. Raman libere: 1 m la streasina, la coama si la capete, plus o trecere de 0,7 m dupa fiecare bloc de 5 module (11,5 m).
    // Ordinea de umplere: hala centrului, apoi halele 1, 3, 4, 5, 6, 8, 9 si, cat mai lipseste pana la tinta, hala 2.
    // La tinta de 1,2 MWp: hala centrului 146 kWp (252 de module), 1: 244, 3: 209, 4: 116, 5: 87, 6: 70, 8: 35, 9: 52, 2: 244 (din 296 posibili) => 2 072 de module, 1 202 kWp.
    // Pe metrul patrat de acoperis: 159 W pe hala centrului, 153 pe hala 1, intre 84 si 133 pe halele inguste (blocurile intregi de 5 module lasa capete libere).
    // Toate cele noua acoperisuri pline ar da 1 254 kWp, deci tinta de 1,2 MWp le foloseste aproape in intregime.
    var pvG = grp(root), tables = null, inv = null, nT = 0, pvZs = [], pvA = [62.75, H + 6, 0], pvPath = null, pv_kw = {}, pv_hall = grp(roofGroup);
    (function () {
      var need = Math.ceil(p.pv * 1e6 / PV_WP - 1e-6);
      if (!(need > 0)) return;
      pvMats();
      var a = Math.atan(BZ_SLOPE), ca = Math.cos(a), rowP = PV_MD + PV_GAP, modP = PV_MW + PV_GAP, blkL = PV_NB * modP - PV_GAP, walk = 0.7, placed = 0, lay = {}, blocks = [];
      function nRows(b) { return Math.max(0, Math.floor((bzRoof(b).half / ca - 2 + PV_GAP) / rowP)); }
      function rowD(n) { return (1 + PV_MD / 2 + n * rowP) * ca; }                // distanta in plan de la coama la mijlocul randului n

      // 1. hala centrului: modulele stau in pv_hall, un grup din roofGroup, ca sa se ridice si sa se stinga odata cu acoperisul
      (function () {
        var r = bzRoof(HALL), nr = nRows(HALL), Lu = r.len - 2, n = Math.floor((Lu + PV_GAP) / modP), g = 1, gN = [], ord = [], q, sdd, row, x, tot, z;
        while (n > 0) { g = Math.ceil(n / PV_NB); if (n * modP - PV_GAP + (g - 1) * 0.8 <= Lu) break; n--; }      // grupuri de cel mult 5 module, cu treceri de 0,8 m
        if (n < 1 || nr < 1) return;
        for (q = 0; q < g; q++) gN.push(Math.floor(n / g) + (q < n % g ? 1 : 0));
        gN.forEach(function (v, q2) { if (q2 % 2) ord.push(v); else ord.unshift(v); });
        tot = n * modP - PV_GAP + (g - 1) * 0.8;
        for (sdd = -1; sdd <= 1; sdd += 2) for (row = 0; row < nr; row++) {
          x = -tot / 2; z = r.cz + sdd * rowD(row);
          for (q = 0; q < g; q++) {
            var gl2 = ord[q] * modP - PV_GAP;
            if (placed < need) { pvRow(pv_hall, SH.pvRoof, ord[q], r.cx + x + gl2 / 2, bzRoofY(HALL, r.cx, z), z, sdd * a, true); placed += ord[q]; }
            x += gl2 + 0.8;
          }
        }
        pv_kw[0] = placed * PV_WP / 1000; lay[0] = { nr: nr };
      })();

      // 2. celelalte hale: blocuri de 5 module, desenate ca instante (numarul lor creste in timpul santierului)
      [1, 3, 4, 5, 6, 8, 9, 2].forEach(function (id) {
        var b = bzGet(id); if (!b || placed >= need) return;
        var r = bzRoof(b), nr = nRows(b), nb = Math.floor((r.len - 2 + walk) / (blkL + walk)), tot = nb * blkL + (nb - 1) * walk, cnt = 0, sdd, row, q, al, d;
        if (nb < 1 || nr < 1) return;
        for (sdd = -1; sdd <= 1; sdd += 2) for (row = 0; row < nr; row++) for (q = 0; q < nb; q++) {
          if (placed >= need) break;
          al = -tot / 2 + blkL / 2 + q * (blkL + walk); d = sdd * rowD(row);
          blocks.push(r.alongX ? [r.cx + al, bzRoofY(b, r.cx + al, r.cz + d), r.cz + d, 0, sdd] : [r.cx + d, bzRoofY(b, r.cx + d, r.cz + al), r.cz + al, 1, sdd]);
          placed += PV_NB; cnt++;
        }
        lay[id] = { b: b, r: r, nr: nr, nb: nb, tot: tot, n: cnt };
        pv_kw[id] = cnt * PV_NB * PV_WP / 1000;
        pvZs.push([b.x0, b.x1, b.z0, b.z1, b.h + r.rise + 0.6]);
      });
      nT = blocks.length;
      if (nT) {
        var xAx = new T.Vector3(1, 0, 0), zAx = new T.Vector3(0, 0, 1), qYaw = new T.Quaternion().setFromAxisAngle(yAx, Math.PI / 2), qT = {};
        [-1, 1].forEach(function (s) {
          qT['0' + s] = new T.Quaternion().setFromAxisAngle(xAx, s * a);
          qT['1' + s] = new T.Quaternion().setFromAxisAngle(zAx, -s * a).multiply(qYaw);
        });
        tables = inst(root, pvBlockTpl(), nT, !Q.lite); tag(tables, 'pv');
        // modulele de pe hala centrului apar in santier odata cu primele blocuri de pe celelalte hale (etapa „panouri”)
        tables.onBeforeRender = function () { var v = this.count > 0; if (pv_hall.visible !== v) { pv_hall.visible = v; shadowDirty = true; } };
        blocks.forEach(function (e, q) { mtx.compose(pos.set(e[0], e[1], e[2]), qT['' + e[3] + e[4]], one); tables.setMatrixAt(q, mtx); });
        tables.instanceMatrix.needsUpdate = true;
      }

      // 3. invertoare pe pereti, jgheaburi de curent continuu pe acoperis si pe perete, trasee ingropate pana la caminul de la (15, zCor)
      inv = grp(pvG);
      var xS = 115, yTop = 0.05, sets = [], zMin = zCor, zMax = zCor, xTr = 15.55;
      // jgheab culcat pe tabla, de la randul cel mai de jos de pe apa opusa, peste coama, pana dincolo de streasina peretelui cu invertoare
      function roofTray(b, r, al, nearS, nr) {
        [[nearS, r.half + 0.53], [-nearS, (1 + nr * rowP) * ca + 0.15]].forEach(function (e) {
          var dm = e[1] / 2, y = b.h + r.rise * (1 - dm / r.half) + 0.04, len = e[1] / ca;
          if (r.alongX) box(inv, 0.2, 0.07, len, SH.steel, al, y, r.cz + e[0] * dm, false, [e[0] * a, 0, 0]);
          else box(inv, len, 0.07, 0.2, SH.steel, r.cx + e[0] * dm, y, al, false, [0, 0, -e[0] * a]);
        });
      }
      function gapNear(L, target) {             // trecerea dintre blocuri cea mai apropiata de locul dorit (masurat de la mijlocul coamei)
        var best = null, q, g2;
        if (L.nb < 2) return (target < 0 ? -1 : 1) * (L.tot / 2 + 0.5);
        for (q = 0; q < L.nb - 1; q++) { g2 = -L.tot / 2 + blkL + walk / 2 + q * (blkL + walk); if (best === null || Math.abs(g2 - target) < Math.abs(best - target)) best = g2; }
        return best;
      }
      // host = hala pe al carei perete stau invertoarele; side = peretele (N = -z, S = +z, W = -x, E = +x); at = locul dorit de-a lungul peretelui;
      // out = pana unde iese traseul de la perete inainte sa coteasca spre magistrala (null = merge drept pana la ea)
      function addSet(host, kw, side, at, fixed, y0, out) {
        var L = lay[host] || (fixed && lay[0] ? { b: bzGet(host), r: bzRoof(bzGet(host)), nr: 0, nb: 0, tot: 0, n: 1 } : null); if (!L || !L.n || !(kw > 0)) return;
        var b = L.b, r = L.r, ns = side === 'N' || side === 'W' ? -1 : 1, al = fixed ? at : (r.alongX ? r.cx : r.cz) + gapNear(L, at - (r.alongX ? r.cx : r.cz));
        var n = Math.max(1, Math.ceil(kw / 125)), o = { n: n, y0: y0, yE: b.h - r.rise * 0.53 / r.half + 0.075, side: 1 };
        if (r.alongX) { o.x = al; o.z = ns < 0 ? b.z0 : b.z1; o.ux = 1; o.uz = 0; o.nx = 0; o.nz = ns; } else { o.x = ns < 0 ? b.x0 : b.x1; o.z = al; o.ux = 0; o.uz = 1; o.nx = ns; o.nz = 0; }
        roofTray(b, r, al, ns, Math.max(L.nr, lay[0] && fixed ? lay[0].nr : 0));
        pvInvSet(inv, o);
        var uc = n * 0.625, ex = o.x + o.ux * uc + o.nx * 0.75, ez = o.z + o.uz * uc + o.nz * 0.75;      // iesirea din camin
        sets.push({ ex: ex, ez: ez, alongX: r.alongX, out: out, y0: y0 });
      }
      addSet(1, pv_kw[0], 'N', W / 2 + 0.6, true, 0.2, null);          // hala centrului: jgheabul ei coboara pe peretele halei vecine, imediat dupa rost (peretii centrului se coboara cand se ridica acoperisul)
      addSet(1, pv_kw[1], 'N', 62.75, false, 0, null);
      addSet(3, pv_kw[3], 'W', -43, false, 0, null);
      addSet(4, pv_kw[4], 'W', -98.7, false, 0, null);
      addSet(5, pv_kw[5], 'E', -118.9, false, 0, null);
      addSet(6, pv_kw[6], 'S', 81.7, false, 0, -99.3);
      addSet(8, pv_kw[8], 'E', 25.7, false, 0, null);
      addSet(9, pv_kw[9], 'N', 47, false, 0, 60.3);
      addSet(2, pv_kw[2], 'S', 115.6, false, 0, -231.6);

      // trasee: pe curtea veche o fasie de beton nou peste santul astupat, cu borne de marcaj; pe platforma noua un canal cu capace
      function seg(xa, za, xb, zb, onPlat) {
        var alongX = Math.abs(xb - xa) > Math.abs(zb - za), len = alongX ? Math.abs(xb - xa) : Math.abs(zb - za), mx = (xa + xb) / 2, mz = (za + zb) / 2, t, s2;
        if (len < 0.05) return;
        if (onPlat) {
          box(inv, alongX ? len : 0.6, 0.05, alongX ? 0.6 : len, SH.concrete, mx, 0.225, mz, false);
          for (s2 = -1; s2 <= 1; s2 += 2) box(inv, alongX ? len : 0.04, 0.062, alongX ? 0.04 : len, SH.dark, mx + (alongX ? 0 : s2 * 0.32), 0.231, mz + (alongX ? s2 * 0.32 : 0), false);
          if (!Q.lite) for (t = 1; t < len; t += 2) box(inv, alongX ? 0.025 : 0.6, 0.012, alongX ? 0.6 : 0.025, SH.dark, alongX ? Math.min(xa, xb) + t : mx, 0.252, alongX ? mz : Math.min(za, zb) + t, false);
          return;
        }
        box(inv, alongX ? len + 0.5 : 0.5, yTop, alongX ? 0.5 : len + 0.5, SH.concrete, mx, yTop / 2, mz, false);
        for (t = 12; t < len - 6; t += 24) marker(alongX ? Math.min(xa, xb) + t : mx + 0.42, alongX ? mz - 0.42 : Math.min(za, zb) + t);
      }
      function marker(x, z) { box(inv, 0.1, 0.5, 0.1, SH.concrete, x, 0.25, z, false); box(inv, 0.11, 0.09, 0.11, SH.stripe, x, 0.545, z, false); }
      function pit(x, z, y0) { box(inv, 1.0, 0.1, 1.0, SH.concrete, x, y0 + 0.05, z, false); box(inv, 0.7, 0.02, 0.7, SH.steel, x, y0 + 0.11, z, false); }
      sets.forEach(function (s) {
        var plat = s.y0 > 0.1;
        if (s.alongX) {                          // perete de nord sau de sud: traseul pleaca pe z
          var zo = s.out === null ? zCor : s.out;
          if (s.out === null) { seg(s.ex, s.ez, s.ex, zo + (s.ez > zo ? 0.3 : -0.3), plat); xTr = Math.max(xTr, s.ex); if (!plat) pit(s.ex, zo, 0); }
          else { seg(s.ex, s.ez, s.ex, zo, false); seg(s.ex, zo, xS, zo, false); zMin = Math.min(zMin, zo); zMax = Math.max(zMax, zo); pit(xS, zo, 0); }
        } else { seg(s.ex, s.ez, xS, s.ez, false); zMin = Math.min(zMin, s.ez); zMax = Math.max(zMax, s.ez); pit(xS, s.ez, 0); }
      });
      if (zMin < zCor || zMax > zCor) { seg(xS, zMin, xS, zMax, false); xTr = xS; pit(xS, zCor, 0); }       // magistrala dintre halele 4 si 5
      // colectorul de-a lungul peretelui de nord al halei lungi, pana la caminul de la capatul santului comun
      if (xTr > platX1 + 0.4) { seg(platX1 + 0.4, zCor, xTr, zCor, false); seg(15.55, zCor, platX1 - 0.15, zCor, true); } else seg(15.55, zCor, xTr + 0.3, zCor, true);
      tag(pvG, 'pv');
      pvPath = (zMin < zCor ? [[xS, zMin], [xS, zCor]] : [[xTr, zCor]]).concat([[15, zCor], [xInB, zCor], [xInB, zNw]]);
    })();
