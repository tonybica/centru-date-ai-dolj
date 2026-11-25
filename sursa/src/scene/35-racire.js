    // racire (est): racitoare uscate legate prin ramuri cu robinet la doua colectoare pe suporti, statie de pompe, vas tampon, urcare la trecerile prin perete
    var rcR = huge ? 0.2 : big ? 0.14 : 0.1, rcY = 0.7 + rcR;      // raza vizibila a colectoarelor (cu izolatie) si inaltimea axului lor
    var cool = grp(root), coolO = [], coolI = inst(cool, coolerTpl(coolLen, rcY - 0.2, rcR), nCool);
    for (i = 0; i < nCool; i++) {
      var cc = Math.floor(i / perCol), cr = i % perCol, rowsHere = Math.min(perCol, nCool - cc * perCol), ccx = coolX0 + cc * (coolLen + 2), ccz = (cr - (rowsHere - 1) / 2) * 4;
      mtx.compose(pos.set(ccx, 0.2, ccz), q0, one); coolI.setMatrixAt(i, mtx); coolO.push([ccx, 3.25, ccz]);
    }
    (function () {
      var w0 = W / 2, zs = hzz, zr = hzz + 0.35, rS = 0.12, k, c, cols = [], sups = [];
      for (c = 0; c < coolCols; c++) {       // coloanele de racitoare: capatul dinspre cladire, pozitia colectoarelor, primul si ultimul rand
        var rows = Math.min(perCol, nCool - c * perCol), xw = coolX0 + c * (coolLen + 2) - coolLen / 2;
        cols.push({ rows: rows, xw: xw, xr: xw - 0.75, xb: xw - 1.35, z0: -(rows - 1) * 2, z1: (rows - 1) * 2, zc: [], no: [] });
      }
      var C0 = cols[0], xl = w0 + 1.3;
      // statia de pompe sta in culoarul dintre perete si colectoare, la nord de trecerile prin perete
      var rT = huge ? 0.9 : big ? 0.65 : 0.5, yT = huge ? 3.4 : big ? 2.6 : 2.1, zT = zs - 0.4 - rT, zV = zT - rT - 1.65, zSuc = zV - 0.85;
      var yD = rcY + 0.8, rp = rcR * 0.7, yLow = 1.05, yf = rcY - 0.36;
      // locul unde coboara apa calda pe colectorul rosu: cat mai aproape de trecere, dar nu peste ramura unui racitor
      var zd = zr, freeZ = function (z) { for (var q = 0; q < C0.rows; q++) { var zc = C0.z0 + q * 4; if (Math.abs(z - (zc - 0.45)) < 0.34 || Math.abs(z - (zc + 0.45)) < 0.34) return false; } return true; };
      for (k = 0; k < 60 && !freeZ(zd); k++) zd += 0.05;
      C0.zc.push(zSuc, zd); C0.no.push(zSuc);

      // coloanele urmatoare se leaga de cea dinainte cu doua tevi joase care trec printre doua racitoare, pe sub colectoare
      for (c = 1; c < coolCols; c++) {
        var o = cols[c], P = cols[c - 1], gz = (Math.floor((P.rows - 1) / 2) + 0.5) * 4 + P.z0, rl = Math.min(rcR, 0.15), yl = 0.33 + rl, zlb = gz - 0.25, zlr = gz + 0.25;
        o.zc.push(zlb, zlr); P.zc.push(zlb, zlr); o.no.push(gz); P.no.push(gz);
        rcRun(cool, SH.blue, rl, [[o.xb, rcY, zlb], [o.xb, yl, zlb], [P.xb, yl, zlb], [P.xb, rcY, zlb]]);
        rcRun(cool, SH.red, rl, [[o.xr, rcY, zlr], [o.xr, yl, zlr], [P.xr, yl, zlr], [P.xr, rcY, zlr]]);
        rcValve(cool, rl, o.xw - 1.8, yl, zlb, RCX); rcValve(cool, rl, o.xw - 1.8, yl, zlr, RCX);
        for (k = 0; k < 4; k++) box(cool, 0.3, 0.13, 1.1, SH.concrete, P.xw + 1 + k * 2.6, 0.265, gz);       // traverse de beton sub tevile joase
      }

      // colectoarele: alb-argintiu = mantaua izolatiei, benzile arata ce apa trece (albastru rece, rosu cald); capete cu flansa oarba
      cols.forEach(function (o) {
        var za = Math.min.apply(null, [o.z0 - 0.45].concat(o.zc)) - 0.6, zb = Math.max.apply(null, [o.z1 + 0.45].concat(o.zc)) + 0.6, L = zb - za;
        rcPipe(cool, SH.blue, rcR, o.xb, rcY, za, o.xb, rcY, zb); rcPipe(cool, SH.red, rcR, o.xr, rcY, za, o.xr, rcY, zb);
        [za - 0.03, zb + 0.03].forEach(function (z) { rcFlange(cool, rcR, o.xb, rcY, z, RCZ, undefined, 0.08); rcFlange(cool, rcR, o.xr, rcY, z, RCZ, undefined, 0.08); });
        var n = Math.max(2, Math.ceil((L - 1) / 3.2) + 1);
        for (var s = 0; s < n; s++) {
          var z = za + 0.5 + s * (L - 1) / (n - 1);
          o.no.forEach(function (nz) { if (Math.abs(z - nz) < 0.75) z = nz + (z >= nz ? 0.85 : -0.85); });
          sups.push([o.xw - 1.05, z]);
        }
        // cablurile racitoarelor: canal cu capace in platforma, pana la tabloul de la capatul coloanei
        var xs = o.xw + coolLen - 0.75, zA = o.z0 - 1.4, zB = o.z1 + 2.3;
        box(cool, 0.3, 0.03, zB - zA, SH.dark, xs, 0.215, (zA + zB) / 2);
        box(cool, 1.0, 0.12, 0.6, SH.concrete, xs, 0.26, zB); box(cool, 0.8, 1.5, 0.4, SH.silver, xs, 1.07, zB);
        box(cool, 0.02, 1.3, 0.02, SH.dark, xs, 1.07, zB - 0.205); box(cool, 0.04, 0.12, 0.03, SH.dark, xs + 0.08, 1.1, zB - 0.21); box(cool, 0.16, 0.06, 0.02, SH.led, xs - 0.2, 1.6, zB - 0.205);
      });
      var supI = inst(cool, rcSupTpl(rcY - 0.2, rcR), sups.length);
      sups.forEach(function (s, k) { mtx.compose(pos.set(s[0], 0.2, s[1]), q0, one); supI.setMatrixAt(k, mtx); });

      // aspiratia: din colectorul albastru in cele trei pompe (doua lucreaza, una asteapta), fiecare cu robinet si filtru
      rcPipe(cool, SH.blue, rcR, C0.xb, rcY, zSuc, w0 + 0.42, rcY, zSuc); rcFlange(cool, rcR, w0 + 0.39, rcY, zSuc, RCX, undefined, 0.08);
      box(cool, 1.94, yf - 0.08 - 0.2, 1.6, SH.concrete, xl, (0.2 + yf - 0.08) / 2, zV + 0.48);             // soclul si sasiul statiei
      box(cool, 1.86, 0.08, 1.52, SH.dark, xl, yf - 0.04, zV + 0.48);
      for (k = 0; k < 3; k++) {
        var px = xl + (k - 1) * 0.6;
        rcSeg(cool, SH.blue, rp, px, rcY, zSuc, px, rcY, zV - 0.12); rcValve(cool, rp, px, rcY, zSuc + rcR + 0.14, RCZ);
        cyl(cool, rp * 1.3, rp * 1.3, 0.2, SH.dark, px, rcY, zV - 0.3, 10, RCZ); beam(cool, SH.dark, px, rcY, zV - 0.3, px, rcY - rp - 0.17, zV - 0.4, rp * 1.3);   // filtru in Y
        rcPump(cool, px, rcY, zV, yf, k < 2);
        rcSeg(cool, SH.blue, rp, px, rcY + 0.15, zV, px, yD, zV); rcFlange(cool, rp, px, rcY + 0.26, zV, null, undefined, 0.06); rcValve(cool, rp, px, rcY + 0.5, zV, null, undefined, -1);
      }
      // refularea: colector deasupra pompelor, apoi vasul tampon
      rcSeg(cool, SH.blue, rp * 1.15, xl - 0.6, yD, zV, xl + 0.6, yD, zV, 12); sph(cool, rp * 1.25, SH.blue, xl - 0.6, yD, zV, true, 1, 1); sph(cool, rp * 1.25, SH.blue, xl + 0.6, yD, zV, true, 1, 1);
      rcPipe(cool, SH.blue, rS, xl, yD, zV, xl, yD, zT - rT + 0.06); rcFlange(cool, rS, xl, yD, zT - rT - 0.07, RCZ);
      rcTank(cool, xl, zT, rT, yT);
      // din vasul tampon la trecerea prin perete: pe jos pana la perete, apoi in sus, prins in console
      rcRun(cool, SH.blue, rS, [[xl, yLow, zT + rT - 0.06], [xl, yLow, zs], [w0 + 0.42, yLow, zs], [w0 + 0.42, 2.9, zs], [w0 - 0.38, 2.9, zs]]);
      rcFlange(cool, rS, xl, yLow, zT + rT + 0.07, RCZ); rcValve(cool, rS, w0 + 0.9, yLow, zs, RCX);
      box(cool, 0.3, 0.12, 0.3, SH.concrete, xl, 0.26, zs); box(cool, 0.07, yLow - rS - 0.32, 0.07, SH.steel, xl, (yLow - rS + 0.32) / 2, zs);
      [1.75, 2.45].forEach(function (y) { box(cool, 0.42 - rS, 0.04, 0.06, SH.steel, w0 + (0.42 - rS) / 2, y, zs); cyl(cool, rS + 0.014, rS + 0.014, 0.05, SH.steel, w0 + 0.42, y, zs, 12); });
      // apa calda iese din perete sus, trece peste culoar pe un stalp si coboara pe colectorul rosu
      var pts = [[w0 - 0.38, 2.9, zr]];
      if (zd !== zr) pts.push([w0 + 0.42, 2.9, zr], [w0 + 0.42, 2.9, zd]);
      pts.push([C0.xr, 2.9, zd], [C0.xr, rcY, zd]);
      rcRun(cool, SH.red, rS, pts); rcValve(cool, rS, w0 + 1.25, 2.9, zd, RCX);
      box(cool, 0.4, 0.15, 0.4, SH.concrete, w0 + 2.0, 0.275, zd); box(cool, 0.1, 2.9 - rS - 0.38, 0.1, SH.steel, w0 + 2.0, (2.9 - rS - 0.03 + 0.35) / 2, zd);
      box(cool, 0.22, 0.03, 0.2, SH.steel, w0 + 2.0, 2.9 - rS - 0.015, zd); cyl(cool, rS + 0.014, rS + 0.014, 0.05, SH.steel, w0 + 2.0, 2.9, zd, 12, RCX);
      beam(cool, SH.steel, w0 + 2.0, 2.1, zd, w0 + 2.5, 2.9 - rS - 0.03, zd, 0.05); beam(cool, SH.steel, w0 + 2.0, 2.1, zd, w0 + 1.5, 2.9 - rS - 0.03, zd, 0.05);
      // gulerele de etansare de la perete
      cyl(cool, 0.168, 0.168, 0.06, SH.steel, w0 + 0.03, 2.9, zs, 14, RCX); cyl(cool, 0.168, 0.168, 0.06, SH.steel, w0 + 0.03, 2.9, zr, 14, RCX);
      // vasul de expansiune, legat de aspiratie, si tabloul pompelor de pe perete
      var rv = huge ? 0.4 : 0.3, zv = zSuc - 0.5 - rv;
      rcVessel(cool, w0 + 0.75, zv, rv, huge ? 1.5 : 1.1); rcSeg(cool, SH.blue, 0.035, w0 + 0.75, rcY, zv, w0 + 0.75, rcY, zSuc, 6);
      box(cool, 0.2, 0.9, 0.7, SH.silver, w0 + 0.1, 1.65, zV + 0.5); box(cool, 0.02, 0.06, 0.16, SH.led, w0 + 0.205, 1.95, zV + 0.5);
      cyl(cool, 0.02, 0.02, 1.0, SH.dark, w0 + 0.1, 0.7, zV + 0.5, 6);
    })();
    var pz = Math.min(D / 2 - 1.2, ((Math.min(perCol, nCool) - 1) / 2) * 4 + 2.2);
    tag(cool, 'cool');
