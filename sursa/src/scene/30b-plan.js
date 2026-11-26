    /* --- planul bazei si locurile rezervate pentru instalatii --- */
    // Coordonatele sunt ale bazei, nu ale busolei: x creste dinspre calea ferata spre interiorul bazei (nord-vest real),
    // z creste de-a lungul caii ferate (nord-est real). Originea este in mijlocul halei centrului. In text, „nord” inseamna -z, „sud” +z,
    // „vest” -x (calea ferata), „est” +x (restul halei lungi). Grupul `root` este rotit cu NORTH_ROT, deci soarele si busola arata nordul real.
    // Releveu din satelit, cu eroare de circa 15%: u = de-a lungul caii ferate, v = perpendicular pe ea; x = v - 23.5, z = u - 369.
    function bzR(id, u1, u2, v1, v2, h, roof, kind) { return { id: id, x0: v1 - 23.5, x1: v2 - 23.5, z0: u1 - 369, z1: u2 - 369, h: h, roof: roof, kind: kind || 'hala' }; }
    var BZ = [                                          // h = inaltimea la streasina; roof = culoarea acoperisului din satelit
      bzR(1, 359, 379, 46.5, 126, 7, 0xe6e2d6),         // restul halei lungi; capatul dinspre calea ferata (x < W/2) este centrul nostru
      bzR(2, 91.5, 135.5, 111, 155, 8, 0x4a4f55),       // hala mare, acoperis inchis
      bzR(3, 276, 388, 187, 201.5, 6.5, 0x8d9193),
      bzR(4, 231.5, 297, 141, 154.3, 6, 0xcfc7b4),
      bzR(5, 220, 268, 120, 136, 6, 0x8f9496),
      bzR(6, 254.8, 267.6, 66, 120, 5.5, 0xdedbd2),
      bzR(7, 135, 171, 75.5, 92.5, 6, 0x5f9a6a),        // hala libera 2 (acoperis verde)
      bzR(8, 380, 421.6, 124, 134, 5, 0xe4e4e0),
      bzR(9, 431, 442.7, 41.8, 87, 3.5, 0xd8d6cf, 'garaj'),
      bzR(10, 131, 190, 93, 100, 4, 0x55595c, 'sopron'),
      bzR(11, 2, 15.5, 109, 138, 3.5, 0xd4d2cb, 'garaj'),
      bzR(12, 218.5, 235.5, 18, 39.6, 7, 0xd9d2bf, 'birou'),
      bzR(13, 233, 259, 188, 201.5, 5, 0x82878a),
      bzR(14, 384, 411, 65, 77, 4.5, 0xe2e2de),
      bzR(15, 385.8, 411.3, 30, 41.8, 4.5, 0xcfd1d0),
      bzR(16, 186, 207, 111, 134, 5, 0x8a7f74),
      bzR(17, 0, 45, 0, 6.5, 3.5, 0x777b7d, 'sopron'),
      bzR(18, 135, 165, 56.5, 66, 4, 0x4d5257),
      bzR(19, 10, 45, 30, 38, 3.5, 0x80858a, 'sopron'),
      bzR(20, 354.5, 375, 174, 186.5, 4.5, 0xe6e6e2),
      bzR(21, 138, 160, 111, 122, 4, 0x4f5459),
      bzR(22, 168, 190, 146, 156, 4, 0x878c8f),
      bzR(23, 0, 11, 178, 197, 3.5, 0x8b8f90),
      bzR(24, 59.5, 76.5, 179, 191, 3.5, 0x8b8f90),
      bzR(25, 431, 443, 87, 102, 3.5, 0xd6d4cc),
      bzR(26, 218.5, 226.5, 41, 54.6, 3, 0xd9d6cc, 'birou')
    ];
    function bzGet(id) { for (var q = 0; q < BZ.length; q++) if (BZ[q].id === id) return BZ[q]; return null; }
    // Toate cladirile bazei au acoperis in doua ape, cu coama pe lungimea cladirii si panta de 9% (circa 5 grade).
    // Cine deseneaza acoperisul si cine pune panouri pe el folosesc aceleasi doua functii, ca panourile sa stea exact pe tabla.
    var BZ_SLOPE = 0.09;
    function bzRoof(b) { var lx = b.x1 - b.x0, lz = b.z1 - b.z0, hf = Math.min(lx, lz) / 2; return { alongX: lx >= lz, half: hf, rise: hf * BZ_SLOPE, cx: (b.x0 + b.x1) / 2, cz: (b.z0 + b.z1) / 2, len: Math.max(lx, lz) }; }
    function bzRoofY(b, x, z) { var r = bzRoof(b), d = r.alongX ? Math.abs(z - r.cz) : Math.abs(x - r.cx); return b.h + r.rise * (1 - Math.min(1, d / r.half)); }
    var HALL = { id: 0, x0: -W / 2, x1: W / 2, z0: -D / 2, z1: D / 2, h: H, roof: 0xe6e2d6, kind: 'centru' };       // hala centrului, cu acelasi fel de acoperis
    var PER = [[-23.5, 87], [-23.5, -369], [176.5, -378], [183.5, -372], [187.5, 20], [151.5, 80]];                // perimetrul bazei (x, z)
    var YA = { x0: -15.5, x1: 94.5, z0: -77, z1: -13 }, YB = { x0: -21.5, x1: 98.5, z0: 12, z1: 60 };              // curtile deschise de langa hala (A la nord, B la sud)
    var RAIL = { x0: -66, x1: -28 };                                                                             // triajul: liniile merg pe z, intre aceste doua x
    var x0 = PER[0][0], x1 = 187.5, z0 = -378, z1 = 87, cx = 82, cz = -145, spanX = x1 - x0, spanZ = z1 - z0, RR = Math.sqrt(spanX * spanX + spanZ * spanZ) / 2;
    var k = 1.6;                                                                                                 // marimea fluxurilor si a etichetelor
    // Instalatiile noi stau in curtea A, la nord de hala, pe o platforma noua de beton. Fiecare zona are dreptunghiul ei [x0, x1, z0, z1]
    // si nu iese din el. Intre peretele de nord (z = zNw) si instalatii ramane un culoar de 4 m, cu santul comun de cabluri pe z = zCor.
    var zNw = -D / 2, zCor = zNw - 2.3;
    var RZ = { sub: [-22, -3, -31, -14], gen: [-1, 13, -28, -14], cool: [15, 36, -30, -14], bess: [-22, 6, -45, -34] };
    // Treceri prin peretele de nord: xInG = cablurile de la transformatoare (tabloul general), xInB = generatoare, panouri si baterii (dulapul de cabluri),
    // xCW = apa racita (teava rece la xCW, teava calda la xCW + 0.35, amandoua la inaltimea yCW, raza 0.11).
    var xInG = -17, xInB = -12.5, xCW = 11.6, yCW = 2.9;
    var xF = 8.9;                                                                                                // intrarea fibrei, pe peretele de sud
    // cate aparate cere puterea aleasa
    var nCool = Math.max(2, Math.ceil(p.it * 1.25 / 0.45) + 1), coolLen = 9;
    var nGen = 2, genLen = big ? 12 : 6, genS = big ? 1 : 0.7;
    var subS = big ? 1.3 : 0.8;
    var nB = p.bess > 0 ? Math.max(1, Math.ceil(p.bess / 2.5)) : 0;
    // platforma noua de beton (fata de sus la y = 0.2): curtea instalatiilor la nord si trotuarul de acces la sud
    var carsG = grp(root), peopleG = grp(root), lampG = grp(root);                                               // masinile si oamenii centrului, stalpii noi de iluminat: apar la sfarsitul santierului
    var platX0 = -23, platX1 = 38, platZ0 = -47, platZ1 = zNw, platG = grp(root), pcx = (platX0 + platX1) / 2, pcz = (platZ0 + platZ1) / 2;
    platG.position.set(pcx, 0, pcz);
    box(platG, platX1 - platX0, 0.2, platZ1 - platZ0, SH.concrete, 0, 0.1, 0, false);
    box(platG, platX1 - platX0 + 0.3, 0.3, 0.3, SH.base, 0, 0.15, (platZ0 - platZ1) / 2, false); box(platG, 0.3, 0.3, platZ1 - platZ0, SH.base, (platX1 - platX0) / 2, 0.15, 0, false);
    box(platG, W, 0.2, 6.5, SH.concrete, -pcx, 0.1, D / 2 + 3.25 - pcz, false);
    for (i = 1; i < 10; i++) flat(platG, 0.04, platZ1 - platZ0, SH.dark, platX0 + i * (platX1 - platX0) / 10 - pcx, 0.203, 0);          // rosturile de dilatare
    for (i = 1; i < 6; i++) flat(platG, platX1 - platX0, 0.04, SH.dark, 0, 0.203, platZ0 + i * (platZ1 - platZ0) / 6 - pcz);
