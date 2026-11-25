  function pvOpen(ax) {                       // cutie fara capetele de pe axa lunga (0 = x, 1 = y, 2 = z): 8 triunghiuri in loc de 12 pentru profilele metalice
    return unit('pvOpen' + ax, function () { var b = new T.BoxGeometry(1, 1, 1), ix = Array.prototype.slice.call(b.index.array); ix.splice(ax * 12, 12); b.setIndex(ix); return b; });
  }
  function pvBar(g, ax, w, h, d, m, x, y, z, rot) { addGeo(g, pvOpen(ax), m, x, y, z, w, h, d, rot, false); }
  function pvTableTpl() {                     // o masa reala: 2 randuri x 26 de module de 2,28 x 1,13 m (29,6 x 4,58 m, circa 30 kWp), inclinata 25 de grade spre sud
    var a = 0.436, ca = Math.cos(a), sa = Math.sin(a), yc = 1.7, rot = [a, 0, 0], L = 29.6, S = 4.58, ns = Q.lite ? 6 : 9, e = Q.lite ? 0.006 : 0.02;
    function py(s, d) { return yc - s * sa - d * ca; }      // s = metri pe panta spre sud, d = metri sub fata modulelor
    function pz(s, d) { return s * ca - d * sa; }
    return tpl(function (g) {
      addGeo(g, unit('flat', function () { var gg = new T.PlaneGeometry(1, 1); gg.rotateX(-Math.PI / 2); return gg; }), SH.panel, 0, py(0, -e), pz(0, -e), L, 1, S, rot, true);                 // fata cu celule
      addGeo(g, unit('flatDown', function () { var gg = new T.PlaneGeometry(1, 1); gg.rotateX(Math.PI / 2); return gg; }), SH.panelBack, 0, py(0, e), pz(0, e), L, 1, S, rot, true);     // spatele alb
      if (!Q.lite) {                                                                                     // rama de aluminiu pe contur
        [-1, 1].forEach(function (k) { pvBar(g, 0, L + 0.05, 0.05, 0.025, SH.frame, 0, py(k * (S / 2 + 0.0125), 0), pz(k * (S / 2 + 0.0125), 0), rot); pvBar(g, 2, 0.025, 0.05, S, SH.frame, k * (L / 2 + 0.0125), yc, 0, rot); });
      }
      (Q.lite ? [-1.2, 1.2] : [-1.75, -0.6, 0.6, 1.75]).forEach(function (s) { pvBar(g, 0, L, 0.08, 0.05, SH.steel, 0, py(s, 0.065), pz(s, 0.065), rot); });      // pane: profilele lungi pe care stau modulele
      for (var i = 0; i < ns; i++) {
        var px = -14 + i * 28 / (ns - 1);
        pvBar(g, 2, 0.06, 0.1, 4.1, SH.steel, px, py(0, 0.155), pz(0, 0.155), rot);                       // capriorul inclinat
        [-1.35, 1.35].forEach(function (s) { var top = py(s, 0.155) + 0.04; pvBar(g, 1, 0.1, top, 0.08, SH.steel, px + 0.08, top / 2, pz(s, 0.155)); });     // doi stalpi batuti in pamant
        if (!Q.lite) {                                                                                   // contravantuire de la stalpul din spate la caprior
          var y0 = 0.95, z0 = pz(-1.35, 0.155), y1 = py(0.3, 0.155), z1 = pz(0.3, 0.155), len = Math.sqrt((y1 - y0) * (y1 - y0) + (z1 - z0) * (z1 - z0));
          pvBar(g, 1, 0.05, len, 0.05, SH.steel, px + 0.055, (y0 + y1) / 2, (z0 + z1) / 2, [Math.atan2(z1 - z0, y1 - y0), 0, 0]);
        }
      }
    });
  }
  function pvStringInvTpl() {                 // invertor de sir de circa 250 kW pe cadru propriu, la capatul vestic al unei mese (capatul mesei este la x = +0,5)
    return tpl(function (g) {
      [-0.42, 0.42].forEach(function (dz) { box(g, 0.06, 1.75, 0.06, SH.steel, 0, 0.875, dz, false); });
      box(g, 0.62, 0.03, 1.25, SH.steel, -0.2, 1.765, 0, false);                                         // copertina de umbra
      box(g, 0.36, 0.7, 1.05, SH.white, -0.21, 1.15, 0, false);                                          // invertorul
      if (!Q.lite) {
        box(g, 0.04, 0.05, 0.9, SH.steel, 0, 0.9, 0, false); box(g, 0.04, 0.05, 0.9, SH.steel, 0, 1.4, 0, false);
        box(g, 0.012, 0.14, 0.3, SH.dark, -0.395, 1.3, 0.2, false); box(g, 0.05, 0.16, 0.12, SH.dark, -0.21, 0.76, -0.3, false);       // afisaj si separator
        [-0.12, 0.2].forEach(function (dz) { cyl(g, 0.035, 0.035, 0.8, SH.dark, -0.21, 0.4, dz, 6, null, false); });                       // tuburile prin care cablurile coboara in pamant
      } else box(g, 0.08, 0.8, 0.5, SH.dark, -0.21, 0.4, 0, false);
      beam(g, SH.dark, -0.05, 1.42, 0, 0.62, 1.86, 0, 0.05, false);                                       // cablurile de curent continuu vin de sub masa
    });
  }
  function inverterStation(parent, x, z) {    // statia de transformare a parcului: tablou de joasa tensiune in container si transformator ridicator, pe placa de beton
    var i, sd;
    box(parent, 7.4, 0.3, 3.2, SH.concrete, x + 0.2, 0.15, z, false);
    box(parent, 5.04, 0.14, 2.44, SH.dark, x - 0.6, 0.37, z, false);
    box(parent, 5.0, 2.4, 2.4, SH.cont, x - 0.6, 1.64, z);
    box(parent, 5.2, 0.1, 2.6, SH.trim, x - 0.6, 2.89, z);                                              // acoperis cu streasina
    box(parent, 1.6, 1.6, 0.04, SH.louver, x - 1.8, 1.55, z + 1.22, false); box(parent, 1.4, 0.9, 0.04, SH.louver, x - 1.6, 1.9, z - 1.22, false);
    box(parent, 0.9, 2.0, 0.04, SH.white, x + 0.4, 1.46, z + 1.22, false); box(parent, 1.0, 2.1, 0.02, SH.dark, x + 0.4, 1.48, z + 1.205, false);   // usa cu toc
    box(parent, 0.03, 0.5, 0.03, SH.steel, x + 0.7, 1.4, z + 1.25, false); box(parent, 0.22, 0.22, 0.012, SH.hazard, x + 0.3, 1.95, z + 1.245, false);
    box(parent, 0.3, 0.2, 0.012, SH.white, x + 1.3, 2.2, z + 1.21, false);
    box(parent, 0.7, 0.6, 0.3, SH.silver, x - 1.9, 1.1, z - 1.36, false); vdisc(parent, 0.22, SH.fan, x - 1.9, 1.1, z - 1.52, false);                // aer conditionat
    box(parent, 1.1, 1.5, 1.4, SH.trafo, x + 2.7, 1.05, z); box(parent, 1.2, 0.08, 1.5, SH.trafo, x + 2.7, 1.84, z, false);                        // transformatorul de ridicare
    for (sd = -1; sd <= 1; sd += 2) for (i = 0; i < 4; i++) box(parent, 0.06, 1.1, 0.26, SH.trafoFin, x + 2.3 + i * 0.26, 1.0, z + sd * 0.84);
    box(parent, 0.25, 0.3, 0.7, SH.steel, x + 2.03, 1.45, z, false);                                    // bare de joasa tensiune intre container si transformator
    box(parent, 0.3, 0.9, 0.7, SH.trafo, x + 3.4, 1.25, z, false);                                      // cutia de cabluri de medie tensiune
    for (i = -1; i <= 1; i++) cyl(parent, 0.045, 0.045, 0.5, SH.dark, x + 3.4, 0.55, z + i * 0.2, 6, null, false);                // cele trei cabluri coboara in canal
    box(parent, 0.5, 0.03, 1.9, SH.steel, x + 3.4, 0.315, z - 0.65, false); box(parent, 0.5, 0.03, 0.6, SH.steel, x + 2.05, 0.315, z - 1.25, false);      // capacele canalului spre santul din nord
    cyl(parent, 0.16, 0.16, 0.5, SH.trafo, x + 2.7, 2.04, z, 10, [Math.PI / 2, 0, 0], false); box(parent, 0.08, 0.2, 0.08, SH.trafo, x + 2.7, 1.92, z - 0.15, false); box(parent, 0.08, 0.2, 0.08, SH.trafo, x + 2.7, 1.92, z + 0.15, false);   // vas de expansiune pentru ulei
    box(parent, 0.5, 0.03, 0.8, SH.steel, x + 2.05, 0.315, z, false);                                   // capacul canalului de cabluri
    for (sd = -1; sd <= 1; sd += 2) cyl(parent, 0.07, 0.07, 0.9, SH.stripe, x + sd * 3.2, 0.75, z + 1.45, 8, null, false);     // stalpisori de protectie
    ao(parent, 7.4, 3.2, x + 0.2, 0.03, z, 1.4);
  }
