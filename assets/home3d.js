/* Ana sayfa hero'su: üç dünyanın biçimleri arasında dönüşen 3B parçacık bulutu.
   Boşta: küre. Cyber Academy: tel kafes küp ve ağ. Locard: parmak izi.
   DayPot: tencere ve buhar. Hero listesindeki adların üzerine gelince ya da
   birkaç saniyede bir kendiliğinden biçim değişir; fare bulutu döndürür.
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
  var SHAPES = { base: sphere(), cyber: cube(), noir: fingerprint(), warm: pot() };
  var ORDER = ['base', 'cyber', 'noir', 'warm'];

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
    COLORS = { base: v('--brand', '#C42B2B'), cyber: v('--w-cyber', '#0E7A8A'), noir: v('--w-noir', '#B03B32'), warm: v('--w-warm', '#2F6B48') };
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
    var links = document.querySelectorAll('.hero-index a');
    for (var i = 0; i < links.length; i++) links[i].classList.toggle('on', links[i].getAttribute('data-shape') === name);
  }
  var idx = document.querySelectorAll('.hero-index a[data-shape]');
  for (var i = 0; i < idx.length; i++) {
    (function (a) {
      a.addEventListener('mouseenter', function () { pinned = true; morph(a.getAttribute('data-shape')); });
      a.addEventListener('focus', function () { pinned = true; morph(a.getAttribute('data-shape')); });
      a.addEventListener('mouseleave', function () { pinned = false; lastSwitch = performance.now(); });
    })(idx[i]);
  }

  /* ---------- fare ---------- */
  var mx = 0, my = 0, tx = 0, ty = 0;
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
    if (!pinned && !reduce && now - lastSwitch > 5200) morph(ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]);
    mx += (tx - mx) * .05; my += (ty - my) * .05;
    var p = geo.attributes.position.array;
    for (var i = 0; i < N; i++) {
      var k = i * 3, s = .06 + jitter[i] * .06, w = Math.sin(t * 1.6 + jitter[i] * 12) * .03;
      p[k] += (target[k] + w - p[k]) * s; p[k + 1] += (target[k + 1] - p[k + 1]) * s; p[k + 2] += (target[k + 2] - w - p[k + 2]) * s;
    }
    geo.attributes.position.needsUpdate = true;
    mat.color.lerp(targetColor, .06); ringMat.color.lerp(targetColor, .06);
    group.rotation.y = Math.sin(t * .32) * .85 + mx * 1.1;
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
