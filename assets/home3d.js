/* Ana sayfa hero'su: üç dünyanın biçimleri arasında dönüşen 3B parçacık bulutu.
   Boşta: küre. Jelly oyunları: kavanoz, sudoku tablosu, ip halkası, araba, büyüteç, kar tanesi. Cyber Academy: tel kafes küp ve ağ. Locard: parmak izi.
   DayPot: tencere ve buhar. Hero sayfaları değişince bulut o sayfanın biçimine döner; fare bulutu döndürür.
   three.js klasik betik (assets/vendor/three.min.js); dosyadan açınca da çalışır. */
(function () {
  'use strict';
  var THREE = window.THREE, canvas = document.getElementById('hero3d');
  if (!THREE || !canvas) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gl;
  try { gl = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'low-power' }); } catch (e) { return; }
  gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var N = 2600;
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(40, 1, .1, 100);
  camera.position.set(0, 0, 9);

  /* ---------- biçimler ---------- */
  function rand(seed) { var s = seed; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function sphere() {
    var a = new Float32Array(N * 3), g = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < N; i++) {
      var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), t = g * i, R = 2.35;
      a[i * 3] = Math.cos(t) * r * R; a[i * 3 + 1] = y * R; a[i * 3 + 2] = Math.sin(t) * r * R;
    }
    return a;
  }
  function cube() {
    /* küp kenarları + yüzeylerde seyrek ızgara: tel kafes bir makine */
    var a = new Float32Array(N * 3), r = rand(3), S = 1.75;
    for (var i = 0; i < N; i++) {
      var x, y, z;
      if (i < N * .55) {
        var e = Math.floor(r() * 12), t = r() * 2 - 1, ax = e % 3, s1 = (e >> 2) & 1 ? 1 : -1, s2 = (e >> 1) & 1 ? 1 : -1;
        if (ax === 0) { x = t; y = s1; z = s2; } else if (ax === 1) { x = s1; y = t; z = s2; } else { x = s1; y = s2; z = t; }
      } else {
        var f = Math.floor(r() * 6), u = Math.round((r() * 2 - 1) * 4) / 4, v = r() * 2 - 1, sg = f % 2 ? 1 : -1;
        if (r() < .5) { var tmp = u; u = v; v = tmp; }
        if (f < 2) { x = sg; y = u; z = v; } else if (f < 4) { x = u; y = sg; z = v; } else { x = u; y = v; z = sg; }
      }
      a[i * 3] = x * S; a[i * 3 + 1] = y * S; a[i * 3 + 2] = z * S;
    }
    return a;
  }
  function fingerprint() {
    /* iç içe dalgalı halkalar: parmak izi, hafif kavisli bir yüzeyde */
    var a = new Float32Array(N * 3), r = rand(7);
    for (var i = 0; i < N; i++) {
      var ring = Math.floor(r() * 16), t = r() * Math.PI * 2;
      var rad = .18 + ring * .15 + Math.sin(t * 3 + ring * .7) * .035;
      if (ring > 11 && Math.sin(t) < -.55) { t = Math.PI / 2 + (r() - .5) * 2; }
      var x = Math.cos(t) * rad * .82, y = Math.sin(t) * rad * 1.08;
      a[i * 3] = x * 1.25; a[i * 3 + 1] = y * 1.25; a[i * 3 + 2] = -(x * x + y * y) * .22 + (r() - .5) * .04;
    }
    return a;
  }
  function pot() {
    /* çevrilmiş tencere profili + kulplar + yükselen buhar */
    var a = new Float32Array(N * 3), r = rand(11);
    var prof = function (h) { return 1.05 + .55 * Math.sin(Math.PI * (h + .15) / 1.25); };
    for (var i = 0; i < N; i++) {
      var x, y, z, t = r() * Math.PI * 2;
      if (i < N * .7) {
        var h = r() * 1.6; var rad = prof(h) * (h > 1.45 ? 1.02 : 1);
        x = Math.cos(t) * rad; z = Math.sin(t) * rad; y = h - 1.25;
      } else if (i < N * .78) {
        var side = r() < .5 ? -1 : 1, k = r() * Math.PI;
        x = side * (1.62 + Math.sin(k) * .35); y = -.05 + Math.cos(k) * .22; z = (r() - .5) * .12;
      } else {
        var s = r(), sw = Math.floor(r() * 3) - 1;
        y = .5 + s * 1.9; x = sw * .55 + Math.sin(s * 7 + sw) * .28; z = Math.cos(s * 6 + sw) * .2;
      }
      a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z;
    }
    return a;
  }
  function jelly() {
    /* gövde: yarım elipsoit (jöle kubbesi), iki göz ve gülümseme */
    var a = new Float32Array(N * 3), r = rand(19), g = function () { return (r() + r() + r() - 1.5) * .5; };
    for (var i = 0; i < N; i++) {
      var x, y, z;
      if (i < N * .8) {
        var u = r() * Math.PI * 2, v = Math.acos(1 - r() * 1.0);       /* üst yarım küre */
        x = Math.cos(u) * Math.sin(v) * 2.3; z = Math.sin(u) * Math.sin(v) * 2.0; y = Math.cos(v) * 1.75 - 1;
        if (r() < .12) { y = -1; x *= r(); z *= r(); }                  /* zemin */
      } else if (i < N * .93) {
        var side = i % 2 ? 1 : -1; x = side * .72 + g() * .22; y = .25 + g() * .3; z = 1.72 + Math.abs(g()) * .05;
      } else {
        var t = r() * 2 - 1; x = t * .55; y = -.18 - (1 - t * t) * .22; z = 1.82;
      }
      a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z;
    }
    return a;
  }
  function drop() {
    /* damla: yüzeyi döndürülmüş gözyaşı eğrisi + altında halkalanan dalgalar */
    var a = new Float32Array(N * 3), r = rand(23);
    for (var i = 0; i < N; i++) {
      var x, y, z;
      if (i < N * .82) {
        var tt = Math.acos(1 - r() * 2) , rad = Math.sin(tt) * Math.pow(Math.sin(tt / 2), 1.15) * 2.1, ph = r() * Math.PI * 2;
        y = Math.cos(tt) * 2.1 + .35; x = Math.cos(ph) * rad; z = Math.sin(ph) * rad;
      } else {
        var ring = 1 + Math.floor(r() * 3), ph2 = r() * Math.PI * 2;
        x = Math.cos(ph2) * ring * .95; z = Math.sin(ph2) * ring * .95; y = -2.05 + (r() - .5) * .04;
      }
      a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z;
    }
    return a;
  }
  /* JinjaGames: marka işaretinin (kırmızı fırça halkası, J, shuriken) parçacık hâli. Maske, logo-512.png'den
     üretildi: piksel başına 2 bit (0 boş, 1 kırmızı, 2 koyu/shuriken), 4 piksel bir bayt, base64. */
  var LOGO = { w: 104, h: 105, d: 'AAAAAAAAAAAAAABQVQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVFVVVRUAAAAAAAAAAAAAAAAAAAAAAAAAAFBVVVVVVVUAAAAAAAAAAAAAAAAAAAAAAABAVVVVVVVVVRUAAAAAAAAAAAAAAAAAAAAAAFVVVVVVVVVVVQUAAAAAAAAAAAAAAAAAAABUVVVVVVVVVVVVVQEAAAAAAAAAAAAAAAAAQFVVVVVVVVVVVVVVFQAAAAAAAAAAAAAAAABUVVVVVVVVVVVVVVVVAQAAAAAAAAAAAAAAQFVVVVVVVVVVVVVVVVUFAAAAAAAAAAAAAABQVVVVVVVVVVVVVVVVVVUAAAAAAAAAAAAAAFVVVVVVVVVVAVRVVVVVVQUAAAAAAAAAAABAVVVVVVVVBQAAAABVVVVVFQAAAAAAAAAAAFBVVVVVVQUAAAAAAABVVVVVAAAAAAAAAAAAVFVVVVUVAAAAAAAAAEBVVVUFAAAAAAAAAABVVVVVVQEAAAAAAAAAAFRVVRUAAAAAAAAAQFVVVVUFAAAAAAAAAAAAQFVVVQAAAAAAAABQVVVVVQEAAAAAAAAAAAAAVFVVAQAAAAAAAFRVVVUVAAAAAAAAAAAAAABAVVUFAAAAAAAAVVVVVQEAAAAAAAAAAAAAAABVVRUAAAAAAEBVVVVVAAAAAAAAAAAAAAAAAFBVVQAFAAAAUFVVVRUAAAAAAAAAAAAAAAAAAFRVVQUAAABQVVVVAQAAAAAAAAAAAAAAAAAAUFVVAQAAAFRVVVUAAAAAAAAAAAAAAAAAAFRVVVUAAAAAVVVVFQAAAAAAAAAAAAAAAFBVVVVVFQAAAABVVVUFAAAAAAAAAAAAVVVVVVVVVVUFAAAAQFVVVQEAAAAAAABAVVVVVVVVVVVVVRUAAABQVVVVAQAAAAAAAEBVVVVVVVVVVVVVVQAAAFBVVVUAAAAAAAAAQFVVVVVVVVVVVVVVAQAAVFVVFQAAAAAAAABAVVVVVVVVVVVVVVUBAABUVVUFAAAAAAAAAEBVVVVVVVVVVVVRVQUAAFVVVQUAAAAAAAAAQFVVVVVVVVVVVVBVBQAAVVVVAQAAAAAAAABAVVVVVVVVVVUVQFUVAABVVVUAAAAAAAAAAEBVVVVVVVVVVQVAVRUAQFVVVQAAAAAAAAAAQFVVVVVVVVVVAQBVVQBAVVUVAAAAAAAAAABAVVVVVVVVVVUAAFVVAEBVVRUAAAAAAAAAAEBVVVVVVVVVFQAAVFUBUFVVBQAAAAAAAAAAQFVVVVVVVVUFAABUVQFQVVUFAAAAAAAAAABAVVVVVVVVVQEAAFBVAVBVVQUAAAAAAAAAAEBVVVVVVVVVAQAAUFUFUFVVAQAAAAAAAAAAAABQVVVVVVUBAABQVQVQVVUBAAAAAAAAAAAAAFBVVVVVVQAAAEBVBVRVVQEAAAAAAAAAAAAAVFVVVVVVAAAAQFUVVFVVAAAAAAAAAAAAAABUVVVVVVUAAABAVRVUVVUAAAAAAAAAAAAAAFRVVVVVVQAAAABVFVRVVQAAAAAAAAAAAAAAVFVVVVUVAAAAAFUVVFVVAAAAAAAAAAAAAABVVVVVVRUAAAAAVRVUVVUAAAAAAAAAAAAAAFVVVVVVFQAAAABUVVVVFQAAAAAAAAAAAAAAVVVVVVUlAAAAAFRVVVUVAAAAAAAAAAAAAABVVVVVVQUAAAAAVFVVVRUAAAAAAAAAAAAAQFVVVVVVBQAAAABUVVVVFQAAAAAAAAAAAABAVVVVVVUFAAAAAFRVVVUVAAAAAAAAAAAAAEBVVVVVVQUAAAAAUBVVVRUAAAAAAAAAAAAAUFVVVVWVBQAAAABQFVVVFQAAAAAAAAAAAABQVVVVVVUFAAAAAFAVVVUVAAAAAAAAAAAAAFBVVVVVVQkAAAAAUBVVVVUAAAAAAAAAAAAAVFVVVVVVCgAAAABQFVVVVQAAAAAAAAAAAABUVVVVVZUCAAAAAFAVVVVVAAAAAAAAAAAAAFRVVVVVpQIAAAAAUBVVVVUAAAAAAAAAAAAAVFVVVVWpAgAAAABQFVRVVQAAAAAAAAAAAABVVVVVVZoCAAAAAFAUVFVVAAAAAAAAAAAAAFVVVVWVpgIAAAAAABRUVVUAAAAAAAAAAAAAVVVVVaWmAgAAAAAAFFRVVQAAAFVVVQEAAEBVVVVVqaUCAAAAAAAFVFVVAQAAVVVVBQAAQFVVVVWpqQAAAAAAAAVUVVUBAABVVVUFAABAVVVVVaqpAAAAAAAABVBVVQEAAFVVVQUAAFBVVVWVaqoAAAAAAAAFUFVVBQAAVVVVBQAAUFVVVaVqqgAAAAAAAAVQVVUBAABUVVUVAABQVVVVqVqqAAAAAAAABVBVVQEAAFRVVRUAAFRVVVWqmqoAAAAAAAAFQFVVAQAAVFVVVQAAVFVVlaqWKgAAAAAAQAVAVVUFAABUVVVVAFRVVaVaqqYqAAAAAABABUBVVQUAAFBVVVVVVVWqqmqqpSoAAAAAAEAFAFVVFQAAUFVVVVWpqqqqalWlKgAAAAAAQAEAVVUVAABQVVVVqaqqqqpqVZWVAgAAAABQAQBUVVUAAEBVVVVVqapWVWqpVqkqAAAAAFABAFRVVQAAQFVVVVVVqqpaValaqqoCAAAAUAAAVFVVAQAAVVVVVVWlqqpaqlqpqqoAAABUAABQVVUFAABVVVVVVVWpqmqpWlWpqgoAABQAAEBVVQUAAFRVVVVVVVWqWqmWqlapqgAAFQAAQFVVFQAAUFVVVVVVVVWlVZWqqqqqCgAFAAAAVVVVAABQVVVVVVVVVapVpaqqqqqqQAUAAABVVVUBAEBVVVVVVVWVqqWWqqqqKgBQAQAAAFRVVQUAAFVVVVVVVZWqpZqqqgoAAFABAAAAUFVVFQAAUFVVVVVVlWqpWqoCAAAAVAAAAABQVVVVAABAVVVVVVWVaqoqAAAAAAAVAAAAAEBVVVUFAABVVVVVVaVaqgoAAAAAQBUAAAAAAFVVVRUAAFBVVVVVpZqqAgAAAABQBQAAAAAAVVVVVQAAAFVVVVWllqoAAAAAAFQBAAAAAABUVVVVBQAAAFZVVKWmKgAAAAAAVQAAAAAAAFBVVVVVAAAAAABUpaYKAAAAAEAVAAAAAAAAQFVVVVUFAAAAAFSpqQIAAAAAUBUAAAAAAAAAVVVVVVUAAAAAWKmqAAAAAABUBQAAAAAAAABUVVVVVVVVAABYqaoAAAAAQFUAAAAAAAAAAFBVVVVVVVUFAFipKgAAAABQFQAAAAAAAAAAQFVVVVVVVRUAVKoKAAAAAFUFAAAAAAAAAAAAVFVVVVVVVQBUqgIAAABAVQEAAAAAAAAAAABQVVVVVVVVAFCqAAAAAFRVAAAAAAAAAAAAAEBVVVVVVVUBUCoAAABAVQUAAAAAAAAAAAAAAFRVVVVVVQGQCgAAAFRVAQAAAAAAAAAAAAAAQFVVVVVVBZACAABAVRUAAAAAAAAAAAAAAAAAVVVVVVUFkAIAAFRVAQAAAAAAAAAAAAAAAABAVVVVVQGgAABQVRUAAAAAAAAAAAAAAAAAAABUVVVVACAAAFVVAAAAAAAAAAAAAAAAAAAAAABVVVUAAABAVQEAAAAAAAAAAAAAAAAAAAAAAABUAQAAAFQCAAAAAAAAAAAA' };
  function logo() {
    var bin = atob(LOGO.d), cells = [], c;
    for (var i = 0; i < LOGO.w * LOGO.h; i++) { c = (bin.charCodeAt(i >> 2) >> ((i & 3) * 2)) & 3; if (!c) continue;
      var dx = (i % LOGO.w) - LOGO.w / 2, dy = Math.floor(i / LOGO.w) - LOGO.h / 2, inner = Math.hypot(dx, dy) < LOGO.w * .34;
      for (var rep = 0; rep < (c === 2 ? 3 : inner ? 3 : 1); rep++) cells.push(i * 4 + c); }
    var a = new Float32Array(N * 3), r = rand(31), S = 4.6 / LOGO.w;
    for (var k = 0; k < N; k++) {
      var e = cells[Math.floor(r() * cells.length)], cls = e & 3, i2 = e >> 2, px = i2 % LOGO.w, py = Math.floor(i2 / LOGO.w);
      a[k * 3] = (px + r() - LOGO.w / 2) * S;
      a[k * 3 + 1] = -(py + r() - LOGO.h / 2) * S;
      a[k * 3 + 2] = (cls === 2 ? .5 : 0) + (r() - .5) * .22;      /* shuriken öne çıkar */
    }
    return a;
  }
  function shield() {
    /* kalkan: çift çizgili dış hat, içinde asma kilit (halka + gövde + anahtar deliği), seyrek yüzey */
    var a = new Float32Array(N * 3), r = rand(41);
    var half = [[0, 2.35], [1.0, 2.1], [1.85, 1.85], [1.9, .6], [1.55, -.6], [.9, -1.6], [0, -2.5]];
    var poly = half.concat(half.slice(1, -1).reverse().map(function (q) { return [-q[0], q[1]]; }));
    poly = poly.slice(0, half.length).concat(half.slice(0, -1).reverse().map(function (q) { return [-q[0], q[1]]; }));
    var edges = [], tot = 0, m = poly.length;
    for (var i = 0; i < m; i++) { var p0 = poly[i], p1 = poly[(i + 1) % m], l = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]); edges.push([p0, p1, l]); tot += l; }
    function onEdge(sc) {
      var d = r() * tot, e = 0; while (e < edges.length - 1 && d > edges[e][2]) { d -= edges[e][2]; e++; }
      var t = d / edges[e][2], q0 = edges[e][0], q1 = edges[e][1];
      return [(q0[0] + (q1[0] - q0[0]) * t) * sc, (q0[1] + (q1[1] - q0[1]) * t) * sc];
    }
    function inside(x, y) { var ins = false; for (var i = 0, j = m - 1; i < m; j = i++) { var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins; } return ins; }
    for (var k = 0; k < N; k++) {
      var x, y, z, u = r();
      if (u < .34) { var q = onEdge(1); x = q[0]; y = q[1]; z = (r() < .5 ? -1 : 1) * .2; }
      else if (u < .5) { var q2 = onEdge(.84); x = q2[0]; y = q2[1]; z = (r() - .5) * .1; }
      else if (u < .66) { var t = r() * Math.PI * 2; x = Math.cos(t) * .5; y = .45 + Math.sin(t) * .5; z = (r() - .5) * .16 + .05; }       /* kilit halkası */
      else if (u < .8) { x = (r() - .5) * 1.3; y = -.85 + r() * .8; z = .12 + (r() - .5) * .1; }                                       /* kilit gövdesi */
      else { do { x = (r() * 2 - 1) * 1.9; y = -2.4 + r() * 4.7; } while (!inside(x * .9, y * .9)); z = (r() - .5) * .3; }             /* yüzey */
      a[k * 3] = x; a[k * 3 + 1] = y; a[k * 3 + 2] = z;
    }
    return a;
  }
  /* ---- altı yeni Jelly oyununun biçimleri ---- */
  function box(r, cx, cy, cz, sx, sy, sz) {
    /* kutu yüzeyinde rastgele nokta (yüz alanıyla orantılı) */
    var ax = sy * sz, ay = sx * sz, az = sx * sy, u = r() * (ax + ay + az) * 2, s = r() < .5 ? -1 : 1, a = r() - .5, b = r() - .5;
    if (u < ax * 2) return [cx + s * sx / 2, cy + a * sy, cz + b * sz];
    if (u < (ax + ay) * 2) return [cx + a * sx, cy + s * sy / 2, cz + b * sz];
    return [cx + a * sx, cy + b * sy, cz + s * sz / 2];
  }
  function jars() {
    /* kavanoz: hafif göbekli cam gövde, içinde üç jöle katmanı, boyun ve mantar kapak */
    var a = new Float32Array(N * 3), r = rand(41);
    for (var i = 0; i < N; i++) {
      var x, y, z, u = r(), t = r() * Math.PI * 2;
      if (u < .46) { var h = r(); var rad = h > .84 ? 1.12 : 1.62 - .26 * Math.pow(2 * h - 1, 2); y = -2 + h * 3.1; x = Math.cos(t) * rad; z = Math.sin(t) * rad; }
      else if (u < .8) { var k = Math.floor(r() * 3), rr = 1.5 * Math.sqrt(r()); y = -1.55 + k * .78 + (r() - .5) * .08; x = Math.cos(t) * rr; z = Math.sin(t) * rr; }
      else if (u < .86) { var rb = 1.5 * Math.sqrt(r()); y = -2; x = Math.cos(t) * rb; z = Math.sin(t) * rb; }
      else { var rl = 1.18 * Math.sqrt(r()); y = 1.18 + r() * .5; x = Math.cos(t) * rl; z = Math.sin(t) * rl; }
      a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z;
    }
    return a;
  }
  function logicGrid() {
    /* sudoku tablosu: 4x4 ızgara, kalın kutu çizgileri ve birkaç dolu hücre */
    var a = new Float32Array(N * 3), r = rand(43), S = 4.4, c = [[0, 0], [2, 0], [1, 1], [3, 1], [0, 2], [2, 3], [3, 3]];
    for (var i = 0; i < N; i++) {
      var x, y, z = (r() - .5) * .14, u = r();
      if (u < .82) {
        var k = Math.floor(r() * 5), thick = k % 2 === 0, along = (r() - .5) * S, off = -S / 2 + k * S / 4;
        if (!thick && r() < .45) { k = Math.floor(r() * 3) * 2; off = -S / 2 + k * S / 4; }
        if (r() < .5) { x = along; y = off; } else { x = off; y = along; }
      } else { var q = c[Math.floor(r() * c.length)]; x = -S / 2 + (q[0] + .5) * S / 4 + (r() - .5) * .5; y = S / 2 - (q[1] + .5) * S / 4 + (r() - .5) * .5; z = (r() - .5) * .3; }
      a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z;
    }
    return a;
  }
  function loops() {
    /* ip halkası: dolanan tek bir kapalı eğri ve üstünde boncuklar */
    var a = new Float32Array(N * 3), r = rand(47), beads = [];
    var P = function (t) { return [(Math.sin(t) + 2 * Math.sin(2 * t)) * .78, (Math.cos(t) - 2 * Math.cos(2 * t)) * .78, -Math.sin(3 * t) * .9]; };
    for (var b = 0; b < 8; b++) beads.push(b / 8 * Math.PI * 2 + .3);
    for (var i = 0; i < N; i++) {
      var tt, rad, o;
      if (i < N * .84) { tt = r() * Math.PI * 2; rad = .1; }
      else { tt = beads[i % beads.length]; rad = .3; }
      o = P(tt); var ph = r() * Math.PI * 2, rr = rad * Math.sqrt(r());
      a[i * 3] = o[0] + Math.cos(ph) * rr; a[i * 3 + 1] = o[1] + Math.sin(ph) * rr; a[i * 3 + 2] = o[2] + (r() - .5) * rad * 1.6;
    }
    return a;
  }
  function car() {
    /* yandan bakan şirin araba: gövde, kabin, dört tekerlek ve farlar */
    var a = new Float32Array(N * 3), r = rand(53);
    for (var i = 0; i < N; i++) {
      var u = r(), p;
      if (u < .42) p = box(r, 0, -.75, 0, 4.8, 1.1, 1.9);
      else if (u < .66) p = box(r, -.15, .2, 0, 2.5, .95, 1.7);
      else if (u < .94) { var w = Math.floor(r() * 4), t = r() * Math.PI * 2, rad = .48 * (r() < .5 ? 1 : Math.sqrt(r())); p = [(w % 2 ? 1 : -1) * 1.5 + Math.cos(t) * rad, -1.3 + Math.sin(t) * rad, (w < 2 ? 1 : -1) * .98]; }
      else { var side = r() < .5 ? 1 : -1; p = [2.42, -.55 + (r() - .5) * .2, side * .6 + (r() - .5) * .3]; }
      a[i * 3] = p[0] * .92; a[i * 3 + 1] = p[1] * .92 + .3; a[i * 3 + 2] = p[2] * .92;
    }
    return a;
  }
  function seek() {
    /* büyüteç: halka, uzun sap ve camın içinde parıltılı noktalar */
    var a = new Float32Array(N * 3), r = rand(59), cx = -.5, cy = .55, R = 1.55;
    for (var i = 0; i < N; i++) {
      var x, y, z, u = r(), t = r() * Math.PI * 2;
      if (u < .52) { var ph = r() * Math.PI * 2; x = cx + (R + .14 * Math.cos(ph)) * Math.cos(t); y = cy + (R + .14 * Math.cos(ph)) * Math.sin(t); z = .14 * Math.sin(ph); }
      else if (u < .78) { var s = r(), d = Math.SQRT1_2; x = cx + R * d + s * 2.3 * d + Math.cos(t) * .17 * d; y = cy - R * d - s * 2.3 * d + Math.cos(t) * .17 * d; z = Math.sin(t) * .17; }
      else if (u < .92) { var rr = (R - .2) * Math.sqrt(r()); x = cx + Math.cos(t) * rr; y = cy + Math.sin(t) * rr; z = (r() - .5) * .05; }
      else { var q = r(), arm = Math.floor(r() * 4) * Math.PI / 2; x = cx - .55 + Math.cos(arm) * q * .5; y = cy + .6 + Math.sin(arm) * q * .5; z = .3; }
      a[i * 3] = x + .35; a[i * 3 + 1] = y - .1; a[i * 3 + 2] = z;
    }
    return a;
  }
  function flake() {
    /* kar tanesi: altı kol, her kolda iki çift dal ve ortada altıgen */
    var a = new Float32Array(N * 3), r = rand(61);
    for (var i = 0; i < N; i++) {
      var k = Math.floor(r() * 6), ang = k * Math.PI / 3, u = r(), x, y, s = r(), L = 2.5;
      var dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx;
      if (u < .45) { x = dx * s * L; y = dy * s * L; }
      else if (u < .8) { var d0 = u < .62 ? .95 : 1.7, bl = u < .62 ? .8 : .55, sg = r() < .5 ? 1 : -1; x = dx * d0 + (dx * .5 + nx * sg * .87) * s * bl; y = dy * d0 + (dy * .5 + ny * sg * .87) * s * bl; }
      else if (u < .9) { var ph = (k + r()) * Math.PI / 3; x = Math.cos(ph) * .55; y = Math.sin(ph) * .55; }
      else { x = dx * L + (r() - .5) * .3; y = dy * L + (r() - .5) * .3; }
      a[i * 3] = x + (r() - .5) * .07; a[i * 3 + 1] = y + (r() - .5) * .07; a[i * 3 + 2] = (r() - .5) * .18;
    }
    return a;
  }
  var SHAPES = { base: logo(), cyber: shield(), noir: fingerprint(), jelly: jelly(), drop: drop(), warm: pot(), jars: jars(), logic: logicGrid(), loops: loops(), park: car(), seek: seek(), slide: flake() };
  var ORDER = ['base', 'cyber', 'noir', 'jelly', 'drop', 'jars', 'logic', 'loops', 'park', 'seek', 'slide', 'warm'];

  /* ---------- nokta bulutu ---------- */
  var pos = new Float32Array(SHAPES.base), jitter = new Float32Array(N);
  for (var j = 0; j < N; j++) jitter[j] = Math.random();
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  var dot = document.createElement('canvas'); dot.width = dot.height = 64;
  var dx = dot.getContext('2d'), gr = dx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.45, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  dx.fillStyle = gr; dx.fillRect(0, 0, 64, 64);
  var mat = new THREE.PointsMaterial({ size: .085, map: new THREE.CanvasTexture(dot), transparent: true, depthWrite: false, opacity: .95 });
  var cloud = new THREE.Points(geo, mat);
  var group = new THREE.Group(); group.add(cloud); scene.add(group);
  group.position.y = .7; group.scale.setScalar(.74);

  /* yörüngede dönen ince halka */
  var ringGeo = new THREE.BufferGeometry(), RN = 420, rp = new Float32Array(RN * 3);
  for (var k = 0; k < RN; k++) { var t = k / RN * Math.PI * 2; rp[k * 3] = Math.cos(t) * 3.4; rp[k * 3 + 1] = 0; rp[k * 3 + 2] = Math.sin(t) * 3.4; }
  ringGeo.setAttribute('position', new THREE.BufferAttribute(rp, 3));
  var ringMat = new THREE.PointsMaterial({ size: .035, map: mat.map, transparent: true, depthWrite: false, opacity: .55 });
  var ring = new THREE.Points(ringGeo, ringMat); ring.rotation.x = 1.25; ring.rotation.y = .3; group.add(ring);

  /* ---------- renkler (temaya göre) ---------- */
  var COLORS = {};
  function readColors() {
    var cs = getComputedStyle(document.documentElement);
    var v = function (n, f) { return (cs.getPropertyValue(n) || f).trim() || f; };
    COLORS = { base: v('--brand', '#C42B2B'), cyber: v('--w-cyber', '#0E7A8A'), noir: v('--w-noir', '#B03B32'), jelly: v('--w-trails', '#7A4FD6'), drop: v('--w-pipes', '#1C7FB8'), warm: v('--w-warm', '#2F6B48'), jars: v('--w-jars', '#B8470A'), logic: v('--w-logic', '#5A47C9'), loops: v('--w-loops', '#C2306F'), park: v('--w-park', '#D1342F'), seek: v('--w-seek', '#1A7F4F'), slide: v('--w-slide', '#3560D8') };
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    mat.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
    ringMat.blending = mat.blending; mat.needsUpdate = true; ringMat.needsUpdate = true;
  }
  readColors();
  new MutationObserver(function () { readColors(); setColor(current); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  var targetColor = new THREE.Color(COLORS.base);
  function setColor(name) { targetColor.set(COLORS[name] || COLORS.base); }
  mat.color.set(COLORS.base); ringMat.color.set(COLORS.base);

  /* ---------- biçim değişimi ---------- */
  var current = 'base', target = SHAPES.base, pinned = false, lastSwitch = 0;
  function morph(name) {
    if (!SHAPES[name] || name === current) return;
    current = name; target = SHAPES[name]; setColor(name); lastSwitch = performance.now();
  }
  /* ---------- fare ---------- */
  var mx = 0, my = 0, tx = 0, ty = 0, amp = .3;
  window.addEventListener('pointermove', function (e) { tx = e.clientX / window.innerWidth - .5; ty = e.clientY / window.innerHeight - .5; }, { passive: true });

  function resize() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    gl.setSize(w, h, false); camera.aspect = w / h;
    camera.position.z = w < 700 ? 11 : 9;
    camera.updateProjectionMatrix();
  }
  resize(); window.addEventListener('resize', resize);

  var visible = true, running = false, t0 = performance.now();
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) loop(); }).observe(canvas);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) loop(); });

  function frame(now) {
    var t = (now - t0) / 1000;
    mx += (tx - mx) * .05; my += (ty - my) * .05;
    var p = geo.attributes.position.array;
    for (var i = 0; i < N; i++) {
      var k = i * 3, s = .06 + jitter[i] * .06, w = Math.sin(t * 1.6 + jitter[i] * 12) * .03;
      p[k] += (target[k] + w - p[k]) * s; p[k + 1] += (target[k + 1] - p[k + 1]) * s; p[k + 2] += (target[k + 2] - w - p[k + 2]) * s;
    }
    geo.attributes.position.needsUpdate = true;
    mat.color.lerp(targetColor, .06); ringMat.color.lerp(targetColor, .06);
    amp += ((current === 'base' ? .3 : .85) - amp) * .05;      /* logo yüzünü hep gösterir */
    group.rotation.y = Math.sin(t * .32) * amp + mx * (current === 'base' ? .6 : 1.1);
    group.rotation.x = -.15 + my * .6;
    ring.rotation.z = t * .25;
    gl.render(scene, camera);
  }
  function loop() {
    if (running) return; running = true;
    (function tick(now) {
      if (!visible || document.hidden) { running = false; return; }
      frame(now || performance.now());
      if (reduce) { running = false; return; }
      requestAnimationFrame(tick);
    })();
  }
  window.__heroMorph = morph;
  canvas.classList.add('ready');
  loop();
})();
