    // racire (est)
    var cool = grp(root), coolO = [], coolI = inst(cool, coolerTpl(coolLen), nCool);
    for (i = 0; i < nCool; i++) {
      var cc = Math.floor(i / perCol), cr = i % perCol, rowsHere = Math.min(perCol, nCool - cc * perCol), ccx = coolX0 + cc * (coolLen + 2), ccz = (cr - (rowsHere - 1) / 2) * 4;
      mtx.compose(pos.set(ccx, 0.2, ccz), q0, one); coolI.setMatrixAt(i, mtx); coolO.push([ccx, 3.6, ccz]);
    }
    var pz = Math.min(D / 2 - 1.2, ((Math.min(perCol, nCool) - 1) / 2) * 4 + 2.2);
    cyl(cool, 0.22, 0.22, coolW + 3, SH.blue, W / 2 + (coolW + 3) / 2, 0.9, pz, 10, [0, 0, Math.PI / 2]); cyl(cool, 0.22, 0.22, coolW + 3, SH.red, W / 2 + (coolW + 3) / 2, 0.9, pz + 0.6, 10, [0, 0, Math.PI / 2]);
    for (i = 0; i < Math.round((coolW + 3) / 4); i++) box(cool, 0.12, 0.6, 1.2, SH.steel, W / 2 + 1 + i * 4, 0.5, pz + 0.3, false);
    cyl(cool, 0.8, 0.8, 2.6, SH.silver, W / 2 + 1.7, 1.5, -pz, 16); sph(cool, 0.8, SH.silver, W / 2 + 1.7, 2.8, -pz, false, 0.45);      // vas tampon
    box(cool, 2.2, 0.16, 1.2, SH.dark, W / 2 + 1.9, 0.28, -pz + 2.2, false); cyl(cool, 0.3, 0.3, 1.0, SH.blue, W / 2 + 1.6, 0.72, -pz + 2.2, 12, [0, 0, Math.PI / 2], false); cyl(cool, 0.24, 0.24, 0.7, SH.steel, W / 2 + 2.5, 0.72, -pz + 2.2, 12, [0, 0, Math.PI / 2], false);   // pompe
    tag(cool, 'cool');
