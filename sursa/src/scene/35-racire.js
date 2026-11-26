    // racire (curtea de nord, dreptunghiul RZ.cool): racitoare uscate pe picioare, legate prin ramuri cu robinet la doua colectoare pe suporti;
    // apa racita (albastru) pleaca din colector prin statia de pompe (doua lucreaza, una asteapta) si vasul tampon, urca la yCW, trece peste culoarul
    // de serviciu si merge pe console de-a lungul peretelui de nord pana la trecerea de la xCW; apa calda (rosu) se intoarce pe acelasi drum,
    // de la xCW + 0.35 pana in capatul colectorului cald. Curentul pentru ventilatoare si pompe vine din caminul de la (RZ.cool[0], zCor), printr-un canal cu capace.
    // Totul se deseneaza direct in grupul `cool`, cu un singur fel de umbra pe material, ca racirea sa coste cam 12 desene.
    var cool = grp(root), coolO = [], coolZ = [RZ.cool[0], RZ.cool[1], RZ.cool[2], RZ.cool[3]], coolA = [(RZ.cool[0] + RZ.cool[1]) / 2 + 2, 5.4, (RZ.cool[2] + RZ.cool[3]) / 2];
    (function () {
      var Z = RZ.cool, yP = 0.2, rS = 0.11, rcR = 0.14, rcY = yP + 0.5 + rcR, c, k;      // yP = fata platformei, rS = raza tevilor spre hala, rcR si rcY = raza si axul colectoarelor
      // racitoarele: un sir de la nord la sud, cu 1,25 m de trecere intre ele; racordurile sunt la capatul de vest, cutia electrica la cel de est
      var pitch = 3.6, xDu = Z[1] - 0.4, cxC = Z[1] - 1.0 - coolLen / 2, xw = cxC - coolLen / 2, xr = xw - 0.75, xb = xw - 1.35, zc0 = Z[2] + 1.6, zcL = zc0 + (nCool - 1) * pitch;
      for (c = 0; c < nCool; c++) { rcCooler(cool, cxC, yP, zc0 + c * pitch, coolLen, rcY - yP, rcR, xDu - 0.2); coolO.push([cxC, 2.9, zc0 + c * pitch]); }

      // colectoarele: alb-argintiu = mantaua izolatiei, benzile arata ce apa trece (albastru rece, rosu cald); capetele libere au flansa oarba
      var zN = zc0 - 1.05, zBs = zcL + 0.15, zRe = Z[3] - 1.2;
      rcPipe(cool, SH.blue, rcR, xb, rcY, zN, xb, rcY, zBs); rcPipe(cool, SH.red, rcR, xr, rcY, zN, xr, rcY, zRe);
      [[xb, zN - 0.04], [xr, zN - 0.04], [xb, zBs + 0.04]].forEach(function (e) { rcFlange(cool, rcR, e[0], rcY, e[1], RCZ, undefined, 0.08); });
      for (c = 0; c < nCool; c++) rcSup(cool, xw - 1.05, yP, zc0 + c * pitch, rcY - yP, rcR, 0);
      rcSup(cool, xw - 1.05, yP, zRe - 0.9, rcY - yP, rcR, 1);

      // statia de pompe, vasul tampon si urcarea stau la vest de colectoare, in sir de la nord la sud
      var xl = xb - 3.35, pp = 0.9, rT = 0.65, yT = 2.6, zT = zRe - 0.5 - rT, zV = zT - rT - 1.65, zSuc = zV - 0.85, rp = 0.09, yD = rcY + 0.8, yLow = 1.05, yf = rcY - 0.36, xSe = xl - pp - 0.35;
      // aspiratia: ramura din colectorul rece, cu robinet general, apoi cate un robinet si un filtru pentru fiecare pompa
      rcPipe(cool, SH.blue, rcR, xb, rcY, zSuc, xSe, rcY, zSuc); rcFlange(cool, rcR, xSe - 0.04, rcY, zSuc, RCX, undefined, 0.08);
      rcFlange(cool, rcR, xb - rcR - 0.16, rcY, zSuc, RCX); rcValve(cool, rcR, xb - 0.95, rcY, zSuc, RCX); rcStand(cool, xb - 1.6, zSuc, rcY - rcR, yP);
      box(cool, 2 * pp + 0.9, yf - 0.08 - yP, 1.6, SH.concrete, xl, (yP + yf - 0.08) / 2, zV + 0.48);             // soclul si sasiul statiei
      box(cool, 2 * pp + 0.82, 0.08, 1.52, SH.dark, xl, yf - 0.04, zV + 0.48); ao(cool, 2 * pp + 0.9, 1.6, xl, yP + 0.01, zV + 0.48, 1.5);
      for (k = 0; k < 3; k++) {
        var px = xl + (k - 1) * pp;
        rcSeg(cool, SH.blue, rp, px, rcY, zSuc, px, rcY, zV - 0.12); rcValve(cool, rp, px, rcY, zSuc + rcR + 0.14, RCZ);
        cyl(cool, rp * 1.3, rp * 1.3, 0.2, SH.dark, px, rcY, zV - 0.3, 10, RCZ); beam(cool, SH.dark, px, rcY, zV - 0.3, px, rcY - rp - 0.17, zV - 0.4, rp * 1.3);   // filtru in Y
        rcPump(cool, px, rcY, zV, yf, k < 2);
        rcSeg(cool, SH.blue, rp, px, rcY + 0.15, zV, px, yD, zV); rcFlange(cool, rp, px, rcY + 0.26, zV, null, undefined, 0.06); rcValve(cool, rp, px, rcY + 0.56, zV, null, undefined, -1);
        if (!Q.lite) cyl(cool, rp * 1.35, rp * 1.35, 0.12, SH.dark, px, rcY + 0.37, zV, 10);                              // clapeta de sens
        if (!Q.lite) {                                                                                             // cablul motorului: tub pe sasiu, apoi in sus pana in cutia de borne
          rcSeg(cool, SH.dark, 0.02, px + 0.2, yf + 0.03, zV + 1.2, px + 0.2, yf + 0.03, zV + 0.7, 6); rcSeg(cool, SH.dark, 0.02, px + 0.2, yf + 0.03, zV + 0.7, px + 0.2, rcY + 0.19, zV + 0.7, 6);
          rcSeg(cool, SH.dark, 0.02, px + 0.2, rcY + 0.19, zV + 0.7, px + 0.06, rcY + 0.19, zV + 0.7, 6);
        }
      }
      // refularea: colector deasupra pompelor, apoi vasul tampon
      rcSeg(cool, SH.blue, rp * 1.15, xl - pp, yD, zV, xl + pp, yD, zV, 12); sph(cool, rp * 1.25, SH.blue, xl - pp, yD, zV, true, 1, 1); sph(cool, rp * 1.25, SH.blue, xl + pp, yD, zV, true, 1, 1);
      rcPipe(cool, SH.blue, rS, xl, yD, zV, xl, yD, zT - rT + 0.06); rcFlange(cool, rS, xl, yD, zT - rT - 0.07, RCZ);
      if (!Q.lite) { cyl(cool, 0.012, 0.012, 0.16, SH.dark, xl + 0.45, yD + 0.16, zV, 5); cyl(cool, 0.05, 0.05, 0.02, SH.silver, xl + 0.45, yD + 0.26, zV - 0.01, 8, RCZ); }   // manometru
      rcTank(cool, xl, zT, rT, yT);
      // vasul de expansiune, legat de capatul aspiratiei
      var rv = 0.35, xV = xSe - 0.6 - rv;
      rcVessel(cool, xV, zSuc, rv, 1.5); rcSeg(cool, SH.blue, 0.035, xV + rv - 0.03, rcY, zSuc, xSe - 0.06, rcY, zSuc, 6); rcValve(cool, 0.035, xV + rv + 0.3, rcY, zSuc, RCX);

      // apa racita: din vasul tampon pe jos, apoi in sus, peste culoar si pe perete pana la trecere
      var zWr = zNw - 0.45, zWb = zNw - 0.85, xRc = xl + 1.0, zIn = zNw + 0.42, yBr = yCW - rS - 0.03;
      rcRun(cool, SH.blue, rS, [[xl, yLow, zT + rT - 0.06], [xl, yLow, zRe], [xl, yCW, zRe], [xl, yCW, zWb], [xCW, yCW, zWb], [xCW, yCW, zIn]]);
      rcFlange(cool, rS, xl, yLow, zT + rT + 0.07, RCZ); rcValve(cool, rS, xl, 1.5, zRe, null, undefined, 1); rcStand(cool, xl, zRe, yLow - rS, yP);
      // apa calda: iese din perete, vine pe console, trece peste culoar si coboara in capatul colectorului cald (cu reductie la diametrul lui)
      rcRun(cool, SH.red, rS, [[xCW + 0.35, yCW, zIn], [xCW + 0.35, yCW, zWr], [xRc, yCW, zWr], [xRc, yCW, zRe], [xr, yCW, zRe], [xr, rcY + 0.4, zRe]]);
      cyl(cool, rS, rcR, 0.2, SH.silver, xr, rcY + 0.3, zRe, 12); cyl(cool, rcR, rcR, 0.2, SH.silver, xr, rcY + 0.1, zRe, 12); sph(cool, rcR * 1.12, SH.silver, xr, rcY, zRe, true, 1, 1);
      rcValve(cool, rS, xr, 1.75, zRe, null, undefined, 1);
      // stalpul in T de la marginea culoarului si consolele de pe perete
      rcTPost(cool, (xl + xRc) / 2, zRe + 0.4, yBr, [xl, xRc], rS, yP);
      [1.3, 3.3, 4.8, 6.9].forEach(function (d) { rcBracket(cool, xCW + d, zNw, yBr, 1.05, [[zWr, rS, 0], [zWb, rS, 0]]); });
      rcBracket(cool, xl, zNw, yBr, 1.4, [[zWr, rS, 0], [zWb - 0.35, rS, 1]]);
      rcBracket(cool, xRc, zNw, yBr, 1.05, [[zWr - 0.4, rS, 1]]);
      // trecerile prin perete: placa comuna, mansoane cu garnitura si guler
      box(cool, 0.8, 0.5, 0.1, SH.steel, xCW + 0.175, yCW, zNw - 0.05);
      [xCW, xCW + 0.35].forEach(function (x) { cyl(cool, 0.168, 0.168, 0.05, SH.dark, x, yCW, zNw - 0.125, 14, RCZ); cyl(cool, 0.14, 0.14, 0.035, SH.steel, x, yCW, zNw - 0.165, 14, RCZ); });

      // curentul: camin la capatul santului comun, canal cu capace pana la tablou, apoi spre pompe si pe la capatul de est al racitoarelor
      var zDu = Z[3] - 0.3, xDw = Z[0] + 0.25, xCab = Z[0] + 2.2, zCab = zDu - 1.0, xDp = xl - pp - 1.0, zPn = zV + 1.0;
      rcPit(cool, Z[0], zCor, 1.0, yP);
      rcDuct(cool, xDw, zCor - 0.8, xDw, zDu, yP); rcDuct(cool, xDw, zDu, xDu, zDu, yP); rcDuct(cool, xDu, zc0 - 0.55, xDu, zDu, yP);
      rcDuct(cool, xCab, zCab + 0.6, xCab, zDu, yP); rcDuct(cool, xDp, zPn + 0.5, xDp, zDu, yP);
      rcCab(cool, xCab, zCab, 1.6, 1.8, 0.5, yP);
      // cutia de comanda a pompelor, pe doi stalpi, cu tubul de cabluri pana la sasiu
      box(cool, 0.8, 0.1, 0.45, SH.concrete, xDp, yP + 0.05, zPn);
      box(cool, 0.05, 1.5, 0.05, SH.steel, xDp - 0.1, yP + 0.85, zPn - 0.15); box(cool, 0.05, 1.5, 0.05, SH.steel, xDp - 0.1, yP + 0.85, zPn + 0.15);
      box(cool, 0.22, 0.75, 0.6, SH.silver, xDp + 0.035, 1.35, zPn); box(cool, 0.012, 0.6, 0.012, SH.dark, xDp + 0.15, 1.35, zPn); box(cool, 0.012, 0.05, 0.16, SH.led, xDp + 0.15, 1.62, zPn + 0.17);
      cyl(cool, 0.025, 0.025, 0.675, SH.dark, xDp + 0.06, 0.6375, zPn - 0.15, 6);                                 // cablul urca din canal in cutie
      cyl(cool, 0.025, 0.025, 0.945 - yf, SH.dark, xDp + 0.06, (0.975 + yf + 0.03) / 2, zV + 1.2, 6);              // si coboara pe sasiul pompelor
      rcSeg(cool, SH.dark, 0.025, xDp + 0.06, yf + 0.03, zV + 1.2, xl + pp + 0.2, yf + 0.03, zV + 1.2, 6);
    })();
    tag(cool, 'cool');
