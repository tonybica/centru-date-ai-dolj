  function rackDetail(parent, x, z) {       // un rack desenat in detaliu: usa se deschide, un server iese pe sine
    var g = new T.Group(); g.position.set(x, 0.3, z); parent.add(g);
    [[-0.57, -0.27], [-0.57, 0.27], [0.57, -0.27], [0.57, 0.27]].forEach(function (c) { box(g, 0.06, 2.2, 0.06, SH.rackBody, c[0], 1.1, c[1], false); });
    box(g, 1.2, 0.06, 0.6, SH.rackBody, 0, 2.17, 0); box(g, 1.2, 0.06, 0.6, SH.rackBody, 0, 0.03, 0, false);
    box(g, 1.14, 2.08, 0.02, SH.rackBody, 0, 1.1, -0.29, false); box(g, 0.02, 2.08, 0.56, SH.rackBody, -0.59, 1.1, 0, false);
    cyl(g, 0.025, 0.025, 2.0, SH.blue, -0.53, 1.1, -0.2, 8, null, false); cyl(g, 0.025, 0.025, 2.0, SH.red, -0.53, 1.1, 0.2, 8, null, false);   // colectoarele de lichid
    beam(g, SH.blue, -0.53, 2.08, -0.2, -0.44, 2.47, -0.2, 0.04, false); beam(g, SH.red, -0.53, 2.08, 0.2, -0.56, 2.47, 0.2, 0.04, false);     // furtunurile care urca la tevile de rand
    box(g, 0.05, 1.9, 0.05, SH.copper, -0.535, 1.1, 0, false);                                                                                 // bara de alimentare
    box(g, 0.04, 1.9, 0.035, SH.dark, 0.5, 1.1, -0.272, false); for (var q = 0; q < 12; q++) box(g, 0.012, 0.02, 0.02, SH.led, 0.522, 0.35 + q * 0.14, -0.272, false);   // prizele verticale (PDU), una pe fiecare parte
    box(g, 0.04, 1.9, 0.035, SH.dark, 0.5, 1.1, 0.272, false); box(g, 0.02, 1.72, 0.022, SH.stripe, 0.532, 1.2, 0.272, false);                 // manunchiul galben de fibra coboara de la comutator
    for (q = 0; q < 3; q++) box(g, 0.012, 0.05, 0.5, SH.rackBody, 0.52, 0.71 + q * 0.42, 0, false);                                            // panouri oarbe intre servere
    box(g, 0.012, 0.035, 0.5, SH.dark, 0.52, 1.975, 0, false); for (q = 0; q < 12; q++) box(g, 0.012, 0.016, 0.022, SH.silver, 0.527, 1.975, -0.2 + q * 0.036, false);   // panou de conexiuni
    cyl(g, 0.014, 0.014, 0.42, SH.stripe, 0.14, 2.3, -0.04, 6, null, false); cyl(g, 0.014, 0.014, 0.42, SH.stripe, 0.14, 2.3, 0.04, 6, null, false);   // fibra urca in canalul galben
    box(g, 1.0, 0.2, 0.5, SH.silver, 0.02, 0.17, 0, false); box(g, 0.012, 0.03, 0.4, SH.led, 0.53, 0.17, 0, false);
    box(g, 0.8, 0.09, 0.5, SH.rackAlt, 0.12, 2.06, 0, false); box(g, 0.012, 0.04, 0.44, SH.led, 0.525, 2.06, 0, false);
    var out = { g: g, door: null, server: null, cover: null }, m;
    for (var i = 0; i < 4; i++) {
      if (i !== 2) {       // serverele care nu se misca se lipesc de rack, ca sa nu coste desene in plus
        var sy = 0.32 + i * 0.42;
        box(g, 1.0, 0.36, 0.5, SH.dark, 0.02, sy + 0.18, 0, false);
        box(g, 0.02, 0.32, 0.48, SH.rackAlt, 0.53, sy + 0.18, 0, false); box(g, 0.012, 0.03, 0.3, SH.led, 0.542, sy + 0.3, 0, false);
        for (m = 0; m < 6; m++) box(g, 0.014, 0.2, 0.05, SH.dark, 0.542, sy + 0.15, -0.19 + m * 0.076, false);
        box(g, 0.03, 0.05, 0.02, SH.silver, 0.55, sy + 0.18, -0.235, false); box(g, 0.03, 0.05, 0.02, SH.silver, 0.55, sy + 0.18, 0.235, false);          // manere
        box(g, 0.06, 0.03, 0.03, SH.blue, -0.5, sy + 0.26, -0.2, false); box(g, 0.06, 0.03, 0.03, SH.red, -0.5, sy + 0.26, 0.2, false);                // cuplele de lichid din spate
        continue;
      }
      var s = new T.Group(); s.position.set(0.02, 0.32 + i * 0.42, 0); g.add(s);
      out.server = s;
      box(s, 1.0, 0.02, 0.5, SH.steel, 0, 0.01, 0, false);
      box(s, 1.0, 0.34, 0.012, SH.rackAlt, 0, 0.18, -0.244, false); box(s, 1.0, 0.34, 0.012, SH.rackAlt, 0, 0.18, 0.244, false);
      box(s, 0.02, 0.34, 0.5, SH.rackAlt, 0.5, 0.18, 0, false); box(s, 0.012, 0.03, 0.3, SH.led, 0.512, 0.3, 0, false);
      box(s, 0.4, 0.016, 0.44, SH.pcb, -0.16, 0.03, 0, false);                                                     // placa de baza
      box(s, 0.09, 0.07, 0.09, SH.silver, -0.12, 0.075, -0.1, false); box(s, 0.09, 0.07, 0.09, SH.silver, -0.12, 0.075, 0.1, false);   // procesoare
      for (m = 0; m < 8; m++) box(s, 0.13, 0.05, 0.008, SH.dark, -0.27, 0.065, -0.2 + m * 0.057, false);          // memorie
      for (m = 0; m < 4; m++) box(s, 0.16, 0.1, 0.1, SH.silver, -0.41, 0.07, -0.18 + m * 0.12, false);             // surse
      for (m = 0; m < 8; m++) {                                                                                      // cele 8 GPU-uri, fiecare cu placa de racire
        var gz = -0.203 + m * 0.058;
        box(s, 0.36, 0.24, 0.014, SH.pcb, 0.27, 0.15, gz, false);
        box(s, 0.16, 0.13, 0.022, SH.copper, 0.27, 0.17, gz + 0.018, false);
      }
      cyl(s, 0.011, 0.011, 0.46, SH.blue, 0.31, 0.295, 0, 6, [Math.PI / 2, 0, 0], false); cyl(s, 0.011, 0.011, 0.46, SH.red, 0.23, 0.295, 0, 6, [Math.PI / 2, 0, 0], false);
      cyl(s, 0.011, 0.011, 0.75, SH.blue, -0.07, 0.295, -0.22, 6, [0, 0, Math.PI / 2], false); cyl(s, 0.011, 0.011, 0.67, SH.red, -0.11, 0.295, 0.22, 6, [0, 0, Math.PI / 2], false);
      out.cover = mesh(s, new T.BoxGeometry(1.0, 0.016, 0.5), SH.rackAlt, 0, 0.352, 0, false);
    }
    var d = new T.Group(); d.position.set(0.61, 0, -0.3); g.add(d);
    box(d, 0.02, 2.1, 0.6, SH.rackFront, 0, 1.1, 0.3, false);
    out.door = d;
    return out;
  }
