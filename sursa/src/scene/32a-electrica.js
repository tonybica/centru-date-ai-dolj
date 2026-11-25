    // interior: sala electrica (vest), sala de date (mijloc), birouri (est)
    var partG = grp(bld), elec = grp(bld), itg = grp(bld), itx = grp(itg);
    box(partG, 0.25, 3.2, D - 1, SH.wallIn, xE, 1.75, 0); box(partG, 0.25, 3.2, D - 1, SH.wallIn, xO, 1.75, 0);
    // dulapuri electrice si UPS-uri
    var nUps = Math.min(18, Math.max(3, Math.ceil(p.it * 4))), perL = Math.max(2, Math.floor((D - 4) / 1.1)), col = 0, cnt = 0, ux, uz;
    while (cnt < nUps * 2) {
      for (i = 0; i < perL && cnt < nUps * 2; i++, cnt++) {
        ux = -W / 2 + 1.4 + col * 2.6; uz = -D / 2 + 2.2 + i * 1.1;
        if (ux > xE - 1) break;
        box(elec, 0.9, 2.0, 0.95, col % 2 ? SH.dark : SH.silver, ux, 1.3, uz);
        vpl(elec, 0.93, 1.96, SH.cabF, ux + 0.453, 1.3, uz, Math.PI / 2);
        box(elec, 0.05, 0.06, 0.5, SH.upsLed, ux + 0.46, 2.24, uz, false);
      }
      col++; if (-W / 2 + 1.4 + col * 2.6 > xE - 1) break;
    }
    for (j = 0; j < col; j++) { ux = -W / 2 + 1.4 + j * 2.6; if (ux > xE - 1) break; box(elec, 0.45, 0.07, D - 3.4, SH.steel, ux, 2.7, 0, false); }
    // tabloul general (pe peretele de sud) si transformatoarele uscate
    var nSw = Math.max(2, Math.min(9, Math.floor((xE + W / 2 - 2.2) / 0.8)));
    for (i = 0; i < nSw; i++) { box(elec, 0.78, 2.1, 0.7, SH.silver, -W / 2 + 1.2 + i * 0.8, 1.35, D / 2 - 1.0); vpl(elec, 0.74, 2.04, SH.cabF, -W / 2 + 1.2 + i * 0.8, 1.35, D / 2 - 1.36, Math.PI); }
    box(elec, nSw * 0.8, 0.07, 0.4, SH.steel, -W / 2 + 0.8 + nSw * 0.4, 2.7, D / 2 - 1.0, false);
    if (cnt <= perL - 4) for (i = 0; i < (D > 18 ? 2 : 1); i++) {
      var tzI = D / 2 - 3.6 - i * 3.0;
      box(elec, 1.5, 0.12, 2.0, SH.dark, xE - 1.5, 0.36, tzI, false); box(elec, 1.3, 1.9, 1.8, SH.trafo, xE - 1.5, 1.37, tzI); box(elec, 0.04, 1.3, 1.4, SH.louver, xE - 2.17, 1.4, tzI, false);
      for (j = -1; j <= 1; j++) cyl(elec, 0.05, 0.08, 0.3, SH.ceramic, xE - 1.5, 2.45, tzI + j * 0.5, 8, null, false);
    }
