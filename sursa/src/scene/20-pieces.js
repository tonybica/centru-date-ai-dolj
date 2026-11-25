
  /* ---------- piese: fiecare functie pune un obiect intreg la locul lui ---------- */
  // ajutoare doar pentru piese: cutie care se ingusteaza in sus, bulgare turtit, disc in picioare, roata
  function taper(parent, w, h, d, m, x, y, z, kx, kz, oz, cast) {
    oz = oz || 0;
    addGeo(parent, unit('tap|' + kx + '|' + kz + '|' + oz, function () {
      var g = new T.BoxGeometry(1, 1, 1), P = g.attributes.position;
      for (var i = 0; i < P.count; i++) if (P.getY(i) > 0) P.setXYZ(i, P.getX(i) * kx, P.getY(i), P.getZ(i) * kz + oz);
      g.computeVertexNormals(); return g;
    }), m, x, y, z, w, h, d, null, cast);
  }
  function blob(parent, m, x, y, z, sx, sy, sz, ry, cast) {
    addGeo(parent, unit('ico1', function () { return new T.IcosahedronGeometry(1, 1); }), m, x, y, z, sx, sy, sz, ry ? [0.3 * ry, ry, 0] : null, cast);
  }
  function lump(parent, m, x, y, z, sx, sy, sz, ry, det, seed) {     // coroana de copac: sfera cu denivelari, cu umbrire neteda
    addGeo(parent, unit('lump|' + det + '|' + seed, function () {
      var g = new T.IcosahedronGeometry(1, det), P = g.attributes.position, N = g.attributes.normal, acc = {}, keys = [], i, k, v = new T.Vector3(), a = new T.Vector3(), b = new T.Vector3(), c = new T.Vector3();
      for (i = 0; i < P.count; i++) {
        v.set(P.getX(i), P.getY(i), P.getZ(i)); keys.push(Math.round(v.x * 500) + ',' + Math.round(v.y * 500) + ',' + Math.round(v.z * 500));
        var n = Math.sin(v.x * 3.1 + seed) * Math.sin(v.y * 2.6 + seed * 1.7) * Math.sin(v.z * 3.3 + seed * 0.6) * 0.3 + Math.sin(v.x * 6.1 + v.y * 4.3 + seed * 2.1) * Math.sin(v.z * 5.7 + v.y * 3.9 + seed) * 0.13;
        v.multiplyScalar(1 + n); P.setXYZ(i, v.x, v.y, v.z);
      }
      for (i = 0; i < P.count; i += 3) {
        a.fromBufferAttribute(P, i); b.fromBufferAttribute(P, i + 1); c.fromBufferAttribute(P, i + 2); b.sub(a); c.sub(a); b.cross(c);
        for (k = 0; k < 3; k++) { var e = acc[keys[i + k]] || (acc[keys[i + k]] = new T.Vector3()); e.add(b); }
      }
      for (i = 0; i < P.count; i++) { v.copy(acc[keys[i]]).normalize(); N.setXYZ(i, v.x, v.y, v.z); }
      return g;
    }), m, x, y, z, sx, sy, sz, ry ? [0, ry, 0] : null, true);
  }
  function vdisc(parent, r, m, x, y, z, alongX) {      // disc in picioare (ventilator pe o fata verticala)
    addGeo(parent, unit('disc', function () { var g = new T.CircleGeometry(1, 20); g.rotateX(-Math.PI / 2); return g; }), m, x, y, z, r, 1, r, alongX ? [0, 0, -Math.PI / 2] : [Math.PI / 2, 0, 0], false);
  }
  function wheel(parent, x, y, z, r, w, sd) {          // roata cu janta; sd = partea pe care se vede janta
    cyl(parent, r, r, w, SH.tire, x, y, z, 14, [0, 0, Math.PI / 2], false);
    cyl(parent, r * 0.6, r * 0.6, 0.03, SH.silver, x + sd * (w / 2 + 0.005), y, z, 10, [0, 0, Math.PI / 2], false);
    cyl(parent, r * 0.2, r * 0.2, 0.05, SH.dark, x + sd * (w / 2 + 0.01), y, z, 6, [0, 0, Math.PI / 2], false);
  }

  /* ---------- piese: fiecare functie pune un obiect intreg la locul lui ---------- */
