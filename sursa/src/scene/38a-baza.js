    /* --- baza existenta: curti, drumuri interioare, cele 26 de cladiri, depozite, camioane, stalpi vechi, gard si poarta --- */
    bazaMats();
    var siteG = grp(root), fenceG = grp(root);
    var bz_R = rng(2611), bz_occ = [], bz_o = 0.3, bz_og = 0.25, bz_ph = 0.5, bz_cy = 0.025, bz_sy = 0.04, bz_q, bz_t;
    function bz_ov(a, xa, xb, za, zb) { return xa < a[1] && xb > a[0] && za < a[3] && zb > a[2]; }
    function bz_hit(xa, xb, za, zb) { for (var q = 0; q < bz_occ.length; q++) if (bz_ov(bz_occ[q], xa, xb, za, zb)) return true; return false; }
    function bz_in(x, z, m) {                            // punct in interiorul perimetrului, la cel putin m metri de gard
      for (var q = 0; q < PER.length; q++) { var A = PER[q], B2 = PER[(q + 1) % PER.length], ex = B2[0] - A[0], ez = B2[1] - A[1]; if (-((x - A[0]) * ez - (z - A[1]) * ex) / Math.hypot(ex, ez) < (m || 0)) return false; }
      return true;
    }
    function bz_put(xa, xb, za, zb, m) { m = m === undefined ? 1 : m; if (bz_hit(xa, xb, za, zb) || !bz_in(xa, za, m) || !bz_in(xb, zb, m) || !bz_in(xa, zb, m) || !bz_in(xb, za, m)) return false; bz_occ.push([xa, xb, za, zb]); return true; }
    // locuri ocupate: cladirile, hala centrului, platforma noua cu banda libera de 6 m, trotuarul de la sud cu drumul pana la el
    BZ.forEach(function (b) { bz_occ.push([b.x0 - 0.8, b.x1 + 0.8, b.z0 - 0.8, b.z1 + 0.8]); });
    bz_occ.push([HALL.x0 - 0.8, HALL.x1 + 0.8, HALL.z0 - 0.8, HALL.z1 + 0.8]);
    bz_occ.push([platX0 - 1, platX1 + 6.5, platZ0 - 6.5, platZ1 + 0.5]);
    bz_occ.push([-W / 2 - 1, W / 2 + 7, D / 2 - 0.5, D / 2 + 13]);
    var bz_nB = bz_occ.length;

    /* solul: pietris batut pe tot perimetrul, drumuri vechi de beton intre sirurile de cladiri */
    (function () {
      var a = batch.acc(siteG, SH.bzGround, false), q, co = Math.cos(0.6) / 26, si = Math.sin(0.6) / 26;
      function uv(p) { return [p[0] * co + p[1] * si, p[1] * co - p[0] * si]; }                 // textura este rotita fata de cladiri, ca repetarea sa nu se vada
      for (q = 1; q < PER.length - 1; q++) bzTri(a, [[PER[0][0], 0, PER[0][1]], [PER[q][0], 0, PER[q][1]], [PER[q + 1][0], 0, PER[q + 1][1]]], [0, 1, 0], [uv(PER[0]), uv(PER[q]), uv(PER[q + 1])]);
    })();
    var bz_gA = [177.27, -377.34], bz_gB = [182.73, -372.66];                           // stalpii portii, pe latura tesita din colt
    var bz_roads = [[139, 148, -357, 4], [143, 182.5, -357, -349], [174.5, 182.5, -371, -357], [-8, 139, -161.5, -152.5], [78, 86.5, -309, -161.5], [12, 139, -317, -309]];
    bz_roads.forEach(function (r, n) {
      var w = r[1] - r[0], d = r[3] - r[2], lz = d > w, len = Math.max(w, d), q, m;
      flat(siteG, w, d, SH.bzConc, (r[0] + r[1]) / 2, bz_cy, (r[2] + r[3]) / 2);
      for (q = 0; q < Math.ceil(len / 45); q++) for (m = -1; m <= 1; m += 2) {          // urme de roti, cate doua pe sens
        var c = (lz ? r[2] : r[0]) + (q + 0.5) * len / Math.ceil(len / 45) + (bz_R() - 0.5) * 8, o = m * (Math.min(w, d) * 0.24 + (bz_R() - 0.5));
        if (lz) flat(siteG, 2.2, 52, SH.bzStain, (r[0] + r[1]) / 2 + o, bz_sy, c); else flat(siteG, 52, 2.2, SH.bzStain, c, bz_sy, (r[2] + r[3]) / 2 + o);
      }
    });
    bzQuad(batch.acc(siteG, SH.bzConc, false), [[174.5, bz_cy, -371], [182.5, bz_cy, -371], [bz_gB[0], bz_cy, bz_gB[1]], [bz_gA[0], bz_cy, bz_gA[1]]], [0, 1, 0], [[14.5, -30.9], [15.2, -30.9], [15.2, -31.1], [14.8, -31.4]]);
    // pete: zone umede si inchise la culoare, ulei, urmele din curtea A unde intorc camioanele
    for (i = 0; i < (Q.lite ? 30 : 56); i++) {
      var bz_px = x0 + bz_R() * spanX, bz_pz = z0 + bz_R() * spanZ, bz_pw = 5 + bz_R() * 16;
      if (bz_in(bz_px, bz_pz, 4)) flat(siteG, bz_pw, bz_pw * (0.25 + bz_R() * 0.5), SH.bzStain, bz_px, bz_sy + (i % 5) * 0.002, bz_pz, bz_R() * 3);
    }
    [[40, -62, 80, 24, 0.08], [66, -48, 46, 22, -0.5], [8, -64, 40, 14, 0.15], [52, -66, 9, 64, 1.35], [44, -58, 9, 60, 1.8], [30, 40, 60, 20, 0.1], [62, 50, 50, 12, -0.1], [-10, 36, 18, 34, 0]].forEach(function (e, n) {
      flat(siteG, e[2], e[3], SH.bzStain, e[0], bz_sy + 0.012 + n * 0.002, e[1], e[4]);
    });

    /* cladirile: pereti dupa fel, soclu, usi spre curte, ferestre, acoperis exact dupa bzRoof, jgheaburi si burlane */
    var bz_side = { 1: [1, 0], 2: [1, 3], 3: [2], 4: [3, 2], 5: [2], 6: [0], 7: [2], 8: [2], 9: [0], 11: [1], 13: [2], 14: [2, 3], 15: [2], 16: [1], 18: [2], 20: [2], 21: [2], 22: [3], 23: [1], 24: [2], 25: [0] };   // laturile cu usi: 0 nord, 1 sud, 2 vest, 3 est
    var bz_mas = { 1: 1, 6: 1, 8: 1, 9: 1, 11: 1, 12: 1, 14: 1, 15: 1, 20: 1, 25: 1, 26: 1, 99: 1 };                 // cladiri de zidarie; restul au pereti de tabla
    function bz_roofM(c) { var r = c >> 16 & 255, g = c >> 8 & 255, bl = c & 255, l = (r + g + bl) / 3; return g > r + 25 && g > bl + 25 ? SH.bzRoofG : l > 175 ? SH.bzRoofL : l > 110 ? SH.bzRoofM : SH.bzRoofD; }
    function bz_el(m, b, side, t, y, w, h, th, cast) {   // piesa lipita de un perete, la pozitia t de-a lungul lui
      var pr = th / 2 - 0.02;
      if (side < 2) box(siteG, w, h, th, m, t, y, side ? b.z1 + pr : b.z0 - pr, cast); else box(siteG, th, h, w, m, side === 3 ? b.x1 + pr : b.x0 - pr, y, t, cast);
    }
    function bz_front(b, side, t, w, dep) {              // este loc liber in fata peretelui, cat sa intre un camion?
      var r = side === 0 ? [t - w / 2, t + w / 2, b.z0 - dep, b.z0 - 0.9] : side === 1 ? [t - w / 2, t + w / 2, b.z1 + 0.9, b.z1 + dep] : side === 2 ? [b.x0 - dep, b.x0 - 0.9, t - w / 2, t + w / 2] : [b.x1 + 0.9, b.x1 + dep, t - w / 2, t + w / 2], q;
      if (!bz_in((r[0] + r[1]) / 2, (r[2] + r[3]) / 2, 1)) return false;
      for (q = 0; q < bz_nB; q++) if (bz_ov(bz_occ[q], r[0], r[1], r[2], r[3])) return false;
      return true;
    }
    function bz_roof(b, open) {                          // acoperisul din bucati de circa 12 m; cateva sunt carpite cu alta tabla
      var r = bzRoof(b), a0 = (r.alongX ? b.x0 : b.z0) - (open ? 0 : bz_og), a1 = (r.alongX ? b.x1 : b.z1) + bz_og, n = Math.max(1, Math.round((a1 - a0) / 12)), q, m0 = bz_roofM(b.roof), m1 = m0 === SH.bzRoofM ? SH.bzRoofL : SH.bzRoofM;
      for (q = 0; q < n; q++) bzRoofPart(siteG, n > 2 && q > 0 && bz_R() < 0.16 ? m1 : m0, b, r, a0 + (a1 - a0) * q / n, a0 + (a1 - a0) * (q + 1) / n, bz_o, 0.12, q === 0 && !open, q === n - 1);
    }
    function bz_ped(b, m, open) {                        // triunghiul de perete de sub coama, la cele doua capete
      var r = bzRoof(b), uvS = m.userData.uv || 4, a = batch.acc(siteG, m, true), c0 = r.alongX ? r.cz : r.cx;
      [[r.alongX ? b.x0 : b.z0, -1], [r.alongX ? b.x1 : b.z1, 1]].forEach(function (c, qi) {
        var ce = c[0] + (open && qi === 0 ? 0.02 : 0);                                  // la hala lunga, capatul dinspre centru ramane inchis si cand acoperisul centrului este ridicat
        var P = function (cc, y) { return r.alongX ? [ce, y, cc] : [cc, y, ce]; };
        bzTri(a, [P(c0 - r.half, b.h), P(c0 + r.half, b.h), P(c0, b.h + r.rise)], r.alongX ? [c[1], 0, 0] : [0, 0, c[1]], [[(c0 - r.half) / uvS, b.h / uvS], [(c0 + r.half) / uvS, b.h / uvS], [c0 / uvS, (b.h + r.rise) / uvS]]);
      });
    }
    function bz_gut(b, r, open) {                        // jgheab pe fiecare streasina, burlan cu cot la capete
      var ye = b.h - bz_o * BZ_SLOPE, a0 = (r.alongX ? b.x0 : b.z0) - (open ? 0 : bz_og), a1 = (r.alongX ? b.x1 : b.z1) + bz_og, c0 = r.alongX ? r.cz : r.cx, sg, e;
      for (sg = -1; sg <= 1; sg += 2) {
        var ce = c0 + sg * (r.half + bz_o + 0.05), cw = c0 + sg * (r.half + 0.09), cm = c0 + sg * (r.half + bz_o / 2 + 0.05), hh = ye - 0.16;
        if (r.alongX) box(siteG, a1 - a0, 0.1, 0.12, SH.dark, (a0 + a1) / 2, ye - 0.11, ce, false); else box(siteG, 0.12, 0.1, a1 - a0, SH.dark, ce, ye - 0.11, (a0 + a1) / 2, false);
        if (Q.lite) continue;
        for (e = open ? 1 : 0; e < 2; e++) {
          var al = e ? a1 - bz_og - 0.7 : a0 + bz_og + 0.7;
          if (r.alongX) { box(siteG, 0.09, hh, 0.09, SH.dark, al, hh / 2, cw, false); box(siteG, 0.09, 0.09, bz_o + 0.1, SH.dark, al, ye - 0.2, cm, false); }
          else { box(siteG, 0.09, hh, 0.09, SH.dark, cw, hh / 2, al, false); box(siteG, bz_o + 0.1, 0.09, 0.09, SH.dark, cm, ye - 0.2, al, false); }
        }
      }
    }
    function bz_shed(b, r) {                             // sopron deschis: stalpi, grinzi, acoperis; cel de langa calea ferata are zid in spate
      var along = r.alongX, lo = along ? b.x0 : b.z0, hi = along ? b.x1 : b.z1, n = Math.max(2, Math.round((hi - lo) / 5.5)), c0 = along ? r.cz : r.cx, q, sg, t, c, ph = b.h - 0.34;
      for (sg = -1; sg <= 1; sg += 2) {
        c = c0 + sg * (r.half - 0.15);
        if (b.id === 17 && sg < 0) { box(siteG, 0.25, b.h - 0.1, hi - lo, SH.bzWallB, b.x0 + 0.125, (b.h - 0.1) / 2, (lo + hi) / 2); continue; }
        for (q = 0; q <= n; q++) { t = lo + 0.15 + (hi - lo - 0.3) * q / n; if (along) box(siteG, 0.22, ph, 0.22, SH.base, t, ph / 2, c); else box(siteG, 0.22, ph, 0.22, SH.base, c, ph / 2, t); }
        if (along) box(siteG, hi - lo, 0.24, 0.24, SH.base, (lo + hi) / 2, b.h - 0.22, c); else box(siteG, 0.24, 0.24, hi - lo, SH.base, c, b.h - 0.22, (lo + hi) / 2);
      }
      for (q = 0; q <= n; q++) { t = lo + 0.15 + (hi - lo - 0.3) * q / n; if (along) box(siteG, 0.16, 0.2, r.half * 2 - 0.3, SH.base, t, b.h - 0.22, c0); else box(siteG, r.half * 2 - 0.3, 0.2, 0.16, SH.base, c0, b.h - 0.22, t); }
      for (q = 0; q < n; q++) if (bz_R() < 0.7) {                                        // ce se tine sub sopron: lazi si paleti
        t = lo + (hi - lo) * (q + 0.3 + bz_R() * 0.4) / n; var cw = 1 + bz_R() * 1.6, ch = 0.6 + bz_R() * 1.4, cc = c0 + (bz_R() - 0.5) * (r.half - 1.6);
        if (along) box(siteG, cw, ch, 1.2, SH.wood, t, ch / 2, cc); else box(siteG, 1.2, ch, cw, SH.wood, cc, ch / 2, t);
      }
      bz_roof(b, false);
    }
    function bz_bld(b) {
      var r = bzRoof(b), open = b.id === 1, wm = bz_mas[b.id] ? SH.bzWallB : b.id % 2 ? SH.bzRoofL : SH.bzRoofM, dm = wm === SH.bzRoofM ? SH.bzRoofL : SH.bzRoofM, wx0 = b.x0 + (open ? 0.02 : 0), sides = bz_side[b.id] || [], q, t, f;
      if (b.kind === 'sopron') { bz_shed(b, r); return; }
      box(siteG, b.x1 - wx0, b.h - bz_ph, b.z1 - b.z0, wm, (wx0 + b.x1) / 2, (b.h + bz_ph) / 2, r.cz);
      box(siteG, b.x1 + 0.04 - (wx0 - (open ? 0 : 0.04)), bz_ph, b.z1 - b.z0 + 0.08, SH.base, (wx0 - (open ? 0 : 0.04) + b.x1 + 0.04) / 2, bz_ph / 2, r.cz);
      bz_ped(b, wm, open); bz_roof(b, open); bz_gut(b, r, open);
      if (b.kind === 'birou') {                          // birouri: ferestre pe toate laturile, pe fiecare etaj, si intrarea pe sud
        var nF = Math.max(1, Math.floor(b.h / 3.2));
        [0, 1, 2, 3].forEach(function (s2) {
          var lo = s2 < 2 ? b.x0 : b.z0, hi = s2 < 2 ? b.x1 : b.z1, nW = Math.max(1, Math.floor((hi - lo - 1.6) / 2.8));
          for (q = 0; q < nW; q++) for (f = 0; f < nF; f++) {
            t = (lo + hi) / 2 + (q - (nW - 1) / 2) * 2.8;
            if (s2 === 1 && f === 0 && Math.abs(t - r.cx) < 2.3) continue;
            bz_el(SH.glass, b, s2, t, 1.9 + f * 3.2, 1.4, 1.4, 0.08, false); bz_el(SH.dark, b, s2, t, 1.16 + f * 3.2, 1.56, 0.07, 0.14, false);
          }
        });
        bz_el(SH.dark, b, 1, r.cx, 1.31, 1.8, 2.3, 0.12, false); box(siteG, 3, 0.12, 1.3, SH.bzRoofD, r.cx, 2.62, b.z1 + 0.63); box(siteG, 3, 0.16, 1.4, SH.base, r.cx, 0.08, b.z1 + 0.74);
        return;
      }
      if (b.kind === 'garaj') {                          // sir de usi de garaj spre curte
        var gs = sides[0], glo = gs < 2 ? b.x0 : b.z0, ghi = gs < 2 ? b.x1 : b.z1, gn = Math.max(1, Math.floor((ghi - glo - 0.8) / 4.2));
        for (q = 0; q < gn; q++) { t = (glo + ghi) / 2 + (q - (gn - 1) / 2) * 4.2; bz_el(SH.bzRoofM, b, gs, t, 1.47, 3.2, 2.7, 0.12); bz_el(SH.dark, b, gs, t, 2.89, 3.44, 0.14, 0.16, false); }
        return;
      }
      var dH = Math.min(4.5, b.h - 1.2);
      sides.forEach(function (s2) {                      // usi sectionale pentru camioane, o usa de om langa prima, ferestre sus
        var lo = s2 < 2 ? b.x0 : b.z0, hi = s2 < 2 ? b.x1 : b.z1, n = Math.max(1, Math.round((hi - lo) / 16)), got = [], w, sg = s2 === 0 || s2 === 2 ? -1 : 1;
        for (q = 0; q < n; q++) {
          t = lo + (hi - lo) * (q + 0.5) / n;
          if (!bz_front(b, s2, t, 5, 9)) continue;
          bz_el(dm, b, s2, t, dH / 2 + 0.12, 4, dH, 0.14); bz_el(SH.dark, b, s2, t, dH + 0.2, 4.32, 0.16, 0.18, false);
          bz_el(SH.dark, b, s2, t - 2.08, dH / 2 + 0.06, 0.16, dH + 0.12, 0.18, false); bz_el(SH.dark, b, s2, t + 2.08, dH / 2 + 0.06, 0.16, dH + 0.12, 0.18, false);
          if (s2 < 2) flat(siteG, 5.4, 6, SH.bzConc, t, bz_cy, (s2 ? b.z1 : b.z0) + sg * 3.05); else flat(siteG, 6, 5.4, SH.bzConc, (s2 === 3 ? b.x1 : b.x0) + sg * 3.05, bz_cy, t);
          if (!got.length && t + 4.2 < hi) bz_el(SH.dark, b, s2, t + 3.4, 1.2, 1.0, 2.1, 0.1, false);
          got.push(t);
        }
        if (b.h >= 5 && !(Q.lite && s2 !== sides[0])) for (w = lo + 3; w < hi - 2; w += 6) {
          if (got.some(function (g2) { return Math.abs(g2 - w) < 3.7; }) || (open && s2 === 0 && w < platX1 + 3)) continue;
          bz_el(SH.glass, b, s2, w, b.h - 1.3, 2.4, 0.9, 0.08, false);
        }
      });
    }
    BZ.forEach(bz_bld);
    // cabina portarului, langa poarta
    var bz_gh = { id: 99, x0: 168.5, x1: 172.5, z0: -375.6, z1: -372.6, h: 2.8, roof: 0x8d9193, kind: 'birou' };
    bz_bld(bz_gh); bz_occ.push([bz_gh.x0 - 0.5, bz_gh.x1 + 0.5, bz_gh.z0 - 0.5, bz_gh.z1 + 1.6]);
    bz_roads.forEach(function (r) { bz_occ.push(r); });
    bz_occ.push([174, 183, -378, -357]);
    var bz_nR = bz_occ.length;
    bz_occ.push([YA.x0, YA.x1, YA.z0, YA.z1]);           // curtea A ramane libera: acolo intorc camioanele

    /* gramada de nisip din curtea A, fier vechi si materiale stivuite, punctul de alimentare cu motorina */
    [[80, -30, 13, 3.3, 8, 0.3], [71, -27, 8, 2.2, 6, 1.1], [88, -33, 7, 2.7, 5.5, 2.0], [77, -36, 6, 1.6, 4, 0.5]].forEach(function (e) { blob(siteG, SH.soil, e[0], -0.25, e[1], e[2], e[3], e[4], e[5], true); });
    function bz_heap(xa, xb, za, zb, n) {                // gramada de fier vechi: movile joase si, pe ele, table si bucati aruncate de-a valma
      if (!bz_put(xa, xb, za, zb)) return;
      var hx = (xa + xb) / 2, hz = (za + zb) / 2, ha = (xb - xa) / 2, hb = (zb - za) / 2, q, k2, cores = [[0, 0, 0.62, 0.9, 3.6], [-0.42, 0.25, 0.5, 0.6, 2.9], [0.45, -0.2, 0.48, 0.66, 3.2], [0.1, 0.5, 0.4, 0.42, 2.4]];
      cores.forEach(function (c, ci) { blob(siteG, ci % 2 ? SH.bzRoofL : SH.bzRoofM, hx + c[0] * ha, -c[4] * 0.5, hz + c[1] * hb, c[2] * ha, c[4], c[3] * hb, 0, true); });
      for (q = 0; q < n; q++) {
        var u = bz_R() * 2 - 1, v = bz_R() * 2 - 1, top = -1;
        for (k2 = 0; k2 < cores.length; k2++) { var c = cores[k2], du = (u - c[0]) / c[2], dv = (v - c[1]) / c[3], d2 = du * du + dv * dv; if (d2 < 1) top = Math.max(top, c[4] * (Math.sqrt(1 - d2) - 0.5)); }
        if (top < 0.1) continue;
        box(siteG, 0.8 + bz_R() * 2.4, 0.05 + bz_R() * 0.3, 0.5 + bz_R() * 1.5, [SH.bzRoofM, SH.bzRoofL, SH.bzRoofD, SH.bzRoofL][q % 4], hx + u * ha, top + 0.02, hz + v * hb, true, [(bz_R() - 0.5) * 0.9, bz_R() * 3, (bz_R() - 0.5) * 0.9]);
      }
    }
    bz_heap(92, 124, -305, -284, Q.lite ? 70 : 170); bz_heap(28, 68, -349, -327, Q.lite ? 80 : 200); bz_heap(35, 54, -296, -274, Q.lite ? 40 : 100);
    function bz_stack(x, z, kind, ry) {                  // materiale stivuite: 0 paleti cu lemn, 1 container vechi, 2 tevi, 3 profile de otel
      var q, m;
      if (kind === 1) { if (!(ry ? bz_put(x - 3.3, x + 3.3, z - 1.5, z + 1.5) : bz_put(x - 1.5, x + 1.5, z - 3.3, z + 3.3))) return; box(siteG, 2.44, 2.6, 6.06, [SH.bzRoofG, SH.bzRoofM, SH.bzRoofD][Math.floor(bz_R() * 3)], x, 1.3, z, true, [0, ry, 0]); return; }
      if (!bz_put(x - 1.6, x + 1.6, z - 3.2, z + 3.2)) return;
      if (kind === 0) for (q = 0; q < 3; q++) { m = 0.5 + Math.floor(bz_R() * 3) * 0.5; box(siteG, 1.2, m, 1.1, SH.wood, x + (bz_R() - 0.5) * 0.3, m / 2, z - 2 + q * 2); }
      else if (kind === 2) { for (q = 0; q < 3; q++) cyl(siteG, 0.4, 0.4, 6, SH.bzWallB, x - 0.82 + q * 0.82, 0.4, z, 10, [Math.PI / 2, 0, 0]); for (q = 0; q < 2; q++) cyl(siteG, 0.4, 0.4, 6, SH.bzWallB, x - 0.41 + q * 0.82, 1.11, z, 10, [Math.PI / 2, 0, 0]); }
      else { box(siteG, 2.4, 0.12, 0.14, SH.wood, x, 0.06, z - 2); box(siteG, 2.4, 0.12, 0.14, SH.wood, x, 0.06, z + 2); for (q = 0; q < 5; q++) box(siteG, 0.3, 0.3, 6, SH.bzRoofD, x - 0.9 + q * 0.45, 0.27, z); for (q = 0; q < 4; q++) box(siteG, 0.3, 0.3, 6, SH.bzRoofD, x - 0.68 + q * 0.45, 0.57, z); }
    }
    for (i = 0; i < 7; i++) bz_stack(90 + i * 3.8, -347, i % 4 === 1 ? 2 : i % 4 === 3 ? 3 : 0, 0);                    // langa garajele 11
    for (i = 0; i < 6; i++) bz_stack(152 + i * 3.6, -340, i % 3 === 0 ? 3 : i % 3 === 1 ? 0 : 2, 0);                    // langa cladirea 23
    for (i = 0; i < 4; i++) bz_stack(20 + i * 3.6, -318.5 - 2, 0, 0);                                                  // langa sopronul 19
    [[152, -326, 0], [158.6, -326, 0], [135.2, -250, 0], [36, -246, 0], [60, -124, Math.PI / 2], [67, -124, Math.PI / 2], [114, 30, 0]].forEach(function (e) { bz_stack(e[0], e[1], 1, e[2]); });
    (function () {                                       // punct de alimentare: copertina pe patru stalpi, doua pompe pe insula, rezervor culcat in cuva de beton
      var fx = 127, fz = -209.5, q;
      if (!bz_put(fx - 4.5, fx + 4.5, fz - 4.5, fz + 4.5)) return;
      [[-3, -2.4], [3, -2.4], [-3, 2.4], [3, 2.4]].forEach(function (c) { box(siteG, 0.2, 4.4, 0.2, SH.base, fx + c[0], 2.2, fz + c[1]); });
      box(siteG, 7.2, 0.3, 6, SH.bzRoofL, fx, 4.55, fz);
      box(siteG, 3.4, 0.16, 1, SH.base, fx - 1, 0.08, fz); box(siteG, 0.5, 1.5, 0.4, SH.bzRoofD, fx - 1.9, 0.91, fz); box(siteG, 0.5, 1.5, 0.4, SH.bzRoofD, fx - 0.1, 0.91, fz);
      flat(siteG, 9, 9, SH.bzConc, fx, bz_cy, fz);
      if (bz_put(fx - 4, fx + 4, fz - 9.4, fz - 5)) {
        var tz = fz - 7.2;
        flat(siteG, 7.4, 4, SH.bzConc, fx, bz_cy, tz);
        box(siteG, 7.2, 0.6, 0.2, SH.bzWallB, fx, 0.3, tz - 1.8); box(siteG, 7.2, 0.6, 0.2, SH.bzWallB, fx, 0.3, tz + 1.8); box(siteG, 0.2, 0.6, 3.4, SH.bzWallB, fx - 3.5, 0.3, tz); box(siteG, 0.2, 0.6, 3.4, SH.bzWallB, fx + 3.5, 0.3, tz);
        box(siteG, 0.4, 0.5, 2, SH.base, fx - 1.6, 0.25, tz); box(siteG, 0.4, 0.5, 2, SH.base, fx + 1.6, 0.25, tz);
        cyl(siteG, 1.05, 1.05, 5.6, SH.bzRoofL, fx, 1.5, tz, 14, [0, 0, Math.PI / 2]);
      }
    })();

    /* camioanele firmei: randuri de capete tractor cu semiremorca, cateva pe drum */
    var bz_rigs = [];
    function bz_rig(xn, zn, ang, solo, force) {          // xn, zn = bara din fata; ang = incotro priveste botul (0 = +z, PI / 2 = +x)
      var sx = Math.sin(ang), cz2 = Math.cos(ang), ln = solo ? 6.2 : 16.7, bx = xn - sx * ln, bzz = zn - cz2 * ln, hw = 1.45;
      var xa = Math.min(xn, bx) - Math.abs(cz2) * hw, xb = Math.max(xn, bx) + Math.abs(cz2) * hw, za = Math.min(zn, bzz) - Math.abs(sx) * hw, zb = Math.max(zn, bzz) + Math.abs(sx) * hw;
      if (!force && (bz_hit(xa, xb, za, zb) || !bz_in(xa, za, 0.8) || !bz_in(xb, zb, 0.8))) return false;
      bz_occ.push([xa, xb, za, zb]); bz_rigs.push([xn - sx * 9.8, zn - cz2 * 9.8, ang, solo ? 0 : 1]); return true;
    }
    for (i = 0, bz_t = -308; bz_t <= -84; bz_t += 3.7, i++) {                            // de-a lungul gardului dinspre calea ferata, cu botul spre curte
      if (bz_R() < 0.2 || (Q.lite && i % 4 === 3)) continue;
      bz_rig(-5 + (bz_R() - 0.5) * 0.9, bz_t, Math.PI / 2, i % 9 === 4);
    }
    for (i = 0; i < 4; i++) bz_rig(101.5 + i * 3.7, -188, 0, false);                     // intre cladirile 16, 21 si 2
    bz_rig(113.6, -164.6, 0, false); bz_rig(117.4, -164.6, 0, true);                     // langa 16
    for (i = 0; i < 4; i++) bz_rig(74 - (bz_R() * 0.8), -305.5 + i * 3.7, Math.PI / 2, i === 2);
    for (i = 0; i < 3; i++) bz_rig(70 + i * 3.7, 43.5, Math.PI, false);                  // in curtea B
    bz_rig(96, 20, 0, true); bz_rig(-15, 48, Math.PI / 2, false);
    bz_rig(141.4, -246, 0, false, true); bz_rig(145.8, -74, Math.PI, false, true); bz_rig(44, -155, -Math.PI / 2, false, true);          // in mers, pe drumurile dintre cladiri
    var bz_cabC = [0xe9e9e4, 0xa8382e, 0x2f5288, 0xe9e9e4, 0xc9a02c, 0x3d4349, 0xe9e9e4, 0x9aa0a4, 0xb9bdc0], bz_tarpC = [0xd9dbd6, 0x3b5f8f, 0xd3cdbb, 0xd9dbd6, 0x8a9196, 0xa5473d, 0xc9ccc8, 0x3f6b54, 0x4a525b, 0xd9dbd6];
    var bz_nTl = bz_rigs.filter(function (e) { return e[3]; }).length, bz_trk = inst(siteG, bzTractorTpl(), bz_rigs.length), bz_trl = inst(siteG, bzTrailerTpl(), bz_nTl);
    j = 0;
    bz_rigs.forEach(function (e, n) {
      qq.setFromAxisAngle(yAx, e[2]); mtx.compose(pos.set(e[0], 0, e[1]), qq, one);
      bz_trk.setMatrixAt(n, mtx); bz_trk.setColorAt(n, tc.setHex(bz_cabC[Math.floor(bz_R() * bz_cabC.length)]));
      if (e[3]) { bz_trl.setMatrixAt(j, mtx); bz_trl.setColorAt(j, tc.setHex(bz_tarpC[Math.floor(bz_R() * bz_tarpC.length)])); j++; }
    });
    // autoturisme langa birouri si la poarta
    var bz_cars = [];
    for (i = 0; i < 7; i++) if (i !== 3) bz_cars.push([-3 + i * 2.7, -130.1, i % 3 ? Math.PI : 0]);
    for (i = 0; i < 4; i++) bz_cars.push([20 + i * 2.7, -139.1, i === 2 ? 0 : Math.PI]);
    bz_cars.push([166.6, -373.6, 0], [33.5, -128, Math.PI / 2], [38, -136, Math.PI / 2], [118, 16, 0], [120.8, 16, Math.PI], [88, -120.5, Math.PI / 2], [152.6, -21, 0]);
    bz_cars = bz_cars.filter(function (e) { var a = Math.abs(Math.sin(e[2])) > 0.5, hx = a ? 2.3 : 1.0, hz = a ? 1.0 : 2.3; return bz_put(e[0] - hx, e[0] + hx, e[1] - hz, e[1] + hz); });
    var bz_carI = inst(siteG, bzCarTpl(), bz_cars.length), bz_carC = [0x8d9499, 0xeceeed, 0x2b4f86, 0x30353a, 0xa3322a, 0xcfc9bb, 0x55606a];
    bz_cars.forEach(function (e, n) { qq.setFromAxisAngle(yAx, e[2]); bz_t = 0.96 + bz_R() * 0.1; mtx.compose(pos.set(e[0], 0, e[1]), qq, sc.set(bz_t, bz_t, bz_t)); bz_carI.setMatrixAt(n, mtx); bz_carI.setColorAt(n, tc.setHex(bz_carC[n % bz_carC.length])); });

    /* stalpii vechi de iluminat ai curtii, cu pata lor de lumina noaptea */
    var bz_lp = [[136.6, -330, 1], [136.6, -268, 1], [136.6, -206, 1], [136.6, -144, 1], [136.6, -84, 1], [136.6, -24, 1], [-22.6, -290, 1], [-22.6, -238, 1], [-22.6, -186, 1], [-22.6, -104, 1],
      [20, -80, 0], [72, -80, 0], [40, 60.8, 2], [86, 60.8, 2], [60, -190, 0], [160, -346.8, 2], [112, 6, 0]].filter(function (e) { return bz_put(e[0] - 0.4, e[0] + 0.4, e[1] - 0.4, e[1] + 0.4, 0.3); });
    var bz_lampI = inst(siteG, lampTpl(), bz_lp.length), bz_glow = new T.InstancedMesh(new T.PlaneGeometry(30, 30), SH.glow, Math.max(1, bz_lp.length)), bz_qF = new T.Quaternion().setFromAxisAngle(new T.Vector3(1, 0, 0), -Math.PI / 2);
    bz_lp.forEach(function (e, n) {
      var an = e[2] * Math.PI / 2;
      qq.setFromAxisAngle(yAx, an); mtx.compose(pos.set(e[0], 0, e[1]), qq, one); bz_lampI.setMatrixAt(n, mtx);
      mtx.compose(pos.set(e[0] + Math.sin(an) * 2.2, 0.075 + (n % 7) * 0.004, e[1] + Math.cos(an) * 2.2), bz_qF, one); bz_glow.setMatrixAt(n, mtx);
    });
    bz_glow.count = bz_lp.length; bz_glow.frustumCulled = false; bz_glow.renderOrder = 2; siteG.add(bz_glow);

    /* gardul din panouri de beton pe tot perimetrul; se opreste unde un perete de cladire tine loc de gard; poarta este pe latura tesita din colt */
    (function () {
      var fh = 2.3, q, s2, u, cell = 0.25;
      function near(x, z) { for (var n = 0; n <= BZ.length; n++) { var b = n < BZ.length ? BZ[n] : HALL; if (x > b.x0 - 0.6 && x < b.x1 + 0.6 && z > b.z0 - 0.05 && z < b.z1 + 0.05) return true; } return false; }
      function run(ax, az, bx, bz2, last) {
        var dx = bx - ax, dz = bz2 - az, len = Math.hypot(dx, dz), ang = Math.atan2(-dz, dx), np = Math.max(1, Math.round(len / 3)) * (Q.lite ? 0.5 : 1);
        box(fenceG, len, fh, 0.07, SH.bzWallB, (ax + bx) / 2, fh / 2, (az + bz2) / 2, true, [0, ang, 0]);
        np = Math.max(1, Math.round(np));
        for (u = 0; u < np + (last ? 1 : 0); u++) box(fenceG, 0.18, fh + 0.18, 0.18, SH.bzWallB, ax + dx * u / np, (fh + 0.18) / 2, az + dz * u / np, true, [0, ang, 0]);
      }
      for (q = 0; q < PER.length; q++) {
        var A = PER[q], B2 = PER[(q + 1) % PER.length], dx = B2[0] - A[0], dz = B2[1] - A[1], len = Math.hypot(dx, dz), n = Math.round(len / cell), st = -1;
        if (q === 2) { run(A[0], A[1], bz_gA[0], bz_gA[1], true); run(bz_gB[0], bz_gB[1], B2[0], B2[1], false); continue; }
        for (s2 = 0; s2 <= n; s2++) {
          var blocked = s2 === n || near(A[0] + dx * (s2 + 0.5) / n, A[1] + dz * (s2 + 0.5) / n);
          if (!blocked && st < 0) st = s2;
          if (blocked && st >= 0) { if (s2 - st > 2) run(A[0] + dx * st / n, A[1] + dz * st / n, A[0] + dx * s2 / n, A[1] + dz * s2 / n, s2 < n); st = -1; }
        }
      }
      // poarta: doi stalpi de zidarie si doua canaturi de teava deschise spre interior
      var gx = bz_gB[0] - bz_gA[0], gz = bz_gB[1] - bz_gA[1], gl = Math.hypot(gx, gz), nx = -gz / gl, nz = gx / gl;
      [[bz_gA, 1], [bz_gB, -1]].forEach(function (e) {
        var p = e[0], hx = p[0] + e[1] * gx / gl * 0.35, hz = p[1] + e[1] * gz / gl * 0.35, ex = hx + nx * 3.4, ez = hz + nz * 3.4;
        box(fenceG, 0.5, 2.7, 0.5, SH.bzWallB, p[0], 1.35, p[1], true, [0, Math.atan2(-gz, gx), 0]);
        beam(fenceG, SH.dark, hx, 0.25, hz, ex, 0.25, ez, 0.08, false); beam(fenceG, SH.dark, hx, 2.1, hz, ex, 2.1, ez, 0.08, false); beam(fenceG, SH.dark, hx, 0.25, hz, ex, 2.1, ez, 0.05, false);
        for (u = 0; u <= 8; u++) box(fenceG, u % 8 ? 0.04 : 0.08, 1.85, u % 8 ? 0.04 : 0.08, SH.dark, hx + (ex - hx) * u / 8, 1.175, hz + (ez - hz) * u / 8, false);
        box(fenceG, 0.1, 0.25, 0.1, SH.dark, ex, 0.125, ez, false);                      // opritorul din pamant care tine canatul deschis
      });
    })();
