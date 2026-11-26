    /* --- acoperisul halei: doua ape cu panta bazei (9%), coama pe x; tabla noua, coama, jgheaburi. Se ridica si se stinge: doar materiale din ROOFM --- */
    // Fata de sus a tablei este exact bzRoofY(HALL, x, z). Raman ocupate: fasia coamei (|z| < 0,75), marginile de 0,3 m de la fronton si de la peretele antifoc.
    roofGroup = grp(bld);
    var ha_rx0 = -W / 2 - 0.12, ha_rx1 = W / 2 - wt, ha_zEv = D / 2 + 0.004, ha_rcx = (ha_rx0 + ha_rx1) / 2;
    for (sd = -1; sd <= 1; sd += 2) {
      fatSlope(roofGroup, SH.haRoof, ha_rx0, ha_rx1, 0, ha_zEv, sd, 0.12, 0, true);                              // panourile de acoperis
      fatSlope(roofGroup, SH.haRoof, ha_rx0, ha_rx1, ha_zEv, D / 2 + 0.1, sd, 0.015, 0, true);                   // picuratorul de peste jgheab
      fatSlope(roofGroup, SH.roofUnit, ha_rx0 - 0.02, ha_rx1, 0, 0.3, sd, 0.012, 0.014, false);                  // tabla de coama
      fatSlope(roofGroup, SH.roofTrim, ha_rx0 - 0.03, ha_rx0 + 0.09, 0, D / 2 + 0.1, sd, 0.2, 0.02, false);      // bordura de la frontonul de vest
      fatSlope(roofGroup, SH.roofUnit, ha_rx1 - 0.14, ha_rx1, 0.3, D / 2, sd, 0.012, 0.014, false);              // sortul de la piciorul peretelui antifoc
      // jgheabul, prins de perete sub picurator, inchis la capete
      box(roofGroup, ha_rx1 - ha_rx0, 0.12, 0.18, SH.roofUnit, ha_rcx, H - 0.105, sd * (D / 2 + 0.1), false);
      box(roofGroup, ha_rx1 - ha_rx0 - 0.04, 0.006, 0.13, SH.roofTrim, ha_rcx, H - 0.043, sd * (D / 2 + 0.1), false);
    }
    // pe coama: trei trape de fum peste sala de date si doua ventilatoare de evacuare peste sala electrica
    var ha_obs = [];
    [(xE + xO) / 2 - 6.9, (xE + xO) / 2, (xE + xO) / 2 + 6.9].forEach(function (x) {
      box(roofGroup, 1.5, 0.42, 1.2, SH.roofUnit, x, FAT_RDG + 0.11, 0, false);
      box(roofGroup, 1.6, 0.07, 1.3, SH.roofTrim, x, FAT_RDG + 0.355, 0, false);
      box(roofGroup, 1.36, 0.05, 1.06, SH.roofUnit, x, FAT_RDG + 0.415, 0, false);
      ha_obs.push([x - 0.75, x + 0.75]);
    });
    [-W / 2 + 3.5, xE - 3.2].forEach(function (x) {
      box(roofGroup, 0.9, 0.32, 0.9, SH.roofUnit, x, FAT_RDG + 0.07, 0, false);
      cyl(roofGroup, 0.36, 0.36, 0.4, SH.roofUnit, x, FAT_RDG + 0.43, 0, 14, null, false);
      cyl(roofGroup, 0.24, 0.47, 0.15, SH.roofTrim, x, FAT_RDG + 0.585, 0, 14, null, false);
      ha_obs.push([x - 0.45, x + 0.45]);
    });
    // paratrasnetul: conductor pe coama (legat la ramele de metal ale aparatelor), tije, coborari pe margini spre cele patru cutii de pe pereti
    ha_obs.sort(function (a, b) { return a[0] - b[0]; });
    (function () {
      var xs = ha_xLW, q, xe, n, r;
      for (q = 0; q <= ha_obs.length; q++) {
        xe = q < ha_obs.length ? ha_obs[q][0] : ha_xLE;
        if (xe - xs > 0.1) {
          box(roofGroup, xe - xs, 0.012, 0.012, SH.roofTrim, (xs + xe) / 2, FAT_RDG + 0.026, 0, false);
          n = Math.max(1, Math.round((xe - xs) / 6));
          for (r = 0; r < n; r++) { var rx = xs + (r + 0.5) * (xe - xs) / n; box(roofGroup, 0.1, 0.03, 0.1, SH.roofTrim, rx, FAT_RDG + 0.035, 0, false); cyl(roofGroup, 0.008, 0.012, 1.1, SH.roofTrim, rx, FAT_RDG + 0.6, 0, 5, null, false); }
        }
        if (q < ha_obs.length) xs = ha_obs[q][1];
      }
    })();
    fatSlope(roofGroup, SH.roofTrim, ha_xLW - 0.006, ha_xLW + 0.006, 0, D / 2 + 0.03, 1, 0.012, 0.016, false); fatSlope(roofGroup, SH.roofTrim, ha_xLW - 0.006, ha_xLW + 0.006, 0, D / 2 + 0.03, -1, 0.012, 0.016, false);
    fatSlope(roofGroup, SH.roofTrim, ha_xLE - 0.006, ha_xLE + 0.006, 0, D / 2 + 0.03, 1, 0.012, 0.016, false); fatSlope(roofGroup, SH.roofTrim, ha_xLE - 0.006, ha_xLE + 0.006, 0, D / 2 + 0.03, -1, 0.012, 0.016, false);
    box(roofGroup, ha_xLE - ha_xLN, 0.012, 0.012, SH.roofTrim, (ha_xLE + ha_xLN) / 2, H + 0.012, -D / 2 - 0.03, false);          // pe nord, conductorul merge pe streasina pana la coborarea de langa tevi
    roofK = roofOpen ? 1 : 0;
    tag(bld, 'building');
