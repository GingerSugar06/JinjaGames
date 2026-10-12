/* Hero sahnesi: yüzen bir voksel ada, etrafında dönen gerçek mod eşyaları ve XP tozları.
   three.js yerel kopyadan gelir (vendor/three.min.js, klasik betik): ES modülü değil, çünkü
   site index.html çift tıklanarak (file://) açıldığında modüller yüklenmez. Dokular kodla
   çizilir; eşya simgeleri data/hero-sprites.js içindeki veri URI'sinden gelir. */
(function () {
'use strict';
var THREE = window.THREE;
if (!THREE) return;

const canvas = document.getElementById('scene');
const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
let gl;
try { gl = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'low-power' }); } catch (e) { gl = null; }
if (gl && canvas) start();

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/* 16x16 piksel doku üretici */
function tex(draw, seed) {
  const c = document.createElement('canvas'); c.width = c.height = 16;
  const x = c.getContext('2d'), r = rng(seed);
  draw(x, r);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; if ('colorSpace' in t) t.colorSpace = THREE.SRGBColorSpace; else t.encoding = THREE.sRGBEncoding; t.generateMipmaps = false;
  return t;
}
function speckle(x, r, base, cols, n) {
  x.fillStyle = base; x.fillRect(0, 0, 16, 16);
  for (let i = 0; i < n; i++) { x.fillStyle = cols[Math.floor(r() * cols.length)]; x.fillRect(Math.floor(r() * 16), Math.floor(r() * 16), 1 + (r() < .3 ? 1 : 0), 1); }
}
function makeTextures() {
  const T = {};
  T.grassTop = tex((x, r) => speckle(x, r, '#5da33a', ['#6fbd47', '#4f8f30', '#78c850', '#56993a'], 90), 1);
  T.dirt = tex((x, r) => speckle(x, r, '#866043', ['#9a7350', '#705038', '#7b583d', '#5c412c'], 110), 2);
  T.grassSide = tex((x, r) => {
    speckle(x, r, '#866043', ['#9a7350', '#705038', '#7b583d'], 90);
    x.fillStyle = '#5da33a'; x.fillRect(0, 0, 16, 3);
    for (let i = 0; i < 16; i++) if (r() < .55) { x.fillStyle = r() < .5 ? '#5da33a' : '#4f8f30'; x.fillRect(i, 3, 1, 1 + Math.floor(r() * 2)); }
  }, 3);
  T.stone = tex((x, r) => speckle(x, r, '#7d7d7d', ['#8f8f8f', '#6b6b6b', '#747474', '#888'], 120), 4);
  const ore = (col, seed) => tex((x, r) => {
    speckle(x, r, '#7d7d7d', ['#8f8f8f', '#6b6b6b', '#747474'], 100);
    for (let k = 0; k < 5; k++) { const cx = 2 + Math.floor(r() * 11), cy = 2 + Math.floor(r() * 11); x.fillStyle = col; x.fillRect(cx, cy, 2, 2); x.fillStyle = '#ffffff55'; x.fillRect(cx, cy, 1, 1); }
  }, seed);
  T.gold = ore('#ffd34d', 5); T.diamond = ore('#5ff1e6', 6); T.emerald = ore('#2ee35e', 7); T.red = ore('#ff3b3b', 8); T.amethyst = ore('#b46cff', 9);
  T.logSide = tex((x, r) => { speckle(x, r, '#6b4f2e', ['#5a4126', '#7a5b36', '#4d3720'], 60); for (let i = 0; i < 16; i += 4) { x.fillStyle = '#4d3720'; x.fillRect(i + Math.floor(r() * 2), 0, 1, 16); } }, 10);
  T.logTop = tex((x, r) => { x.fillStyle = '#a2814f'; x.fillRect(0, 0, 16, 16); x.strokeStyle = '#7d6038'; for (let k = 2; k < 8; k += 2) { x.strokeRect(8 - k, 8 - k, k * 2, k * 2); } }, 11);
  T.leaves = tex((x, r) => { speckle(x, r, '#3f8a2a', ['#2f6d1f', '#4fa336', '#2a5f1b', '#5cb840'], 140); }, 12);
  T.water = tex((x, r) => speckle(x, r, '#2f6fd6', ['#3d82e8', '#2a62c0', '#4a90f0'], 70), 13);
  return T;
}

function start() {
  const T = makeTextures();
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x070b12, 30, 70);
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 200);
  gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

  scene.add(new THREE.HemisphereLight(0xcfe8ff, 0x2a1d10, 1.15));
  const sun = new THREE.DirectionalLight(0xfff1d6, 1.6); sun.position.set(12, 20, 8); scene.add(sun);
  const rim = new THREE.DirectionalLight(0x7ed957, .55); rim.position.set(-14, 4, -10); scene.add(rim);

  const M = (t) => new THREE.MeshLambertMaterial({ map: t });
  const grassMats = [M(T.grassSide), M(T.grassSide), M(T.grassTop), M(T.dirt), M(T.grassSide), M(T.grassSide)];
  const logMats = [M(T.logSide), M(T.logSide), M(T.logTop), M(T.logTop), M(T.logSide), M(T.logSide)];
  const mats = { grass: grassMats, dirt: M(T.dirt), stone: M(T.stone), gold: M(T.gold), diamond: M(T.diamond), emerald: M(T.emerald), red: M(T.red), amethyst: M(T.amethyst), log: logMats,
    leaves: new THREE.MeshLambertMaterial({ map: T.leaves, transparent: false }), water: new THREE.MeshLambertMaterial({ map: T.water, transparent: true, opacity: .82 }) };

  /* ada yerleşimi */
  const blocks = { grass: [], dirt: [], stone: [], gold: [], diamond: [], emerald: [], red: [], amethyst: [], log: [], leaves: [], water: [] };
  const r = rng(42), R = 8.5;
  const h = (x, z) => Math.round(1.6 * Math.sin(x * .55) + 1.3 * Math.cos(z * .5) + .8 * Math.sin((x + z) * .35));
  const top = {};
  for (let x = -10; x <= 10; x++) for (let z = -10; z <= 10; z++) {
    const d = Math.sqrt(x * x + z * z) + (r() - .5) * 1.2;
    if (d > R) continue;
    const y0 = h(x, z) - (d > R - 1.5 ? 1 : 0);
    top[x + ',' + z] = y0;
    const pond = (x - 2) * (x - 2) + (z + 2) * (z + 2) < 5 && y0 <= 0;
    if (pond) blocks.water.push([x, 0, z]); else blocks.grass.push([x, y0, z]);
    const depth = Math.round((R - d) * 1.15 + 2 + r() * 2);
    for (let k = 1; k <= depth; k++) {
      const y = (pond ? 0 : y0) - k;
      if (k <= 2) blocks.dirt.push([x, y, z]);
      else { const p = r(); const kind = p < .035 ? 'gold' : p < .06 ? 'diamond' : p < .08 ? 'emerald' : p < .1 ? 'red' : p < .115 ? 'amethyst' : 'stone'; blocks[kind].push([x, y, z]); }
    }
  }
  /* ağaçlar */
  [[-4, 3], [3, 5], [-2, -5]].forEach(([tx, tz], i) => {
    const y0 = top[tx + ',' + tz]; if (y0 === undefined) return;
    const H = 4 + i % 2;
    for (let k = 1; k <= H; k++) blocks.log.push([tx, y0 + k, tz]);
    for (let lx = -2; lx <= 2; lx++) for (let lz = -2; lz <= 2; lz++) for (let ly = H - 1; ly <= H + 1; ly++) {
      if (Math.abs(lx) + Math.abs(lz) + Math.max(0, ly - H) * 2 > 3) continue;
      if (lx === 0 && lz === 0 && ly <= H) continue;
      blocks.leaves.push([tx + lx, y0 + ly, tz + lz]);
    }
  });
  /* minik kule (Towers'a selam) */
  const tx = 5, tz = -3, ty = top[tx + ',' + tz];
  if (ty !== undefined) for (let k = 1; k <= 7; k++) for (const [ax, az] of [[0, 0], [1, 0], [0, 1], [1, 1]]) if (k < 7 || (ax + az) % 2 === 0) blocks.stone.push([tx + ax, ty + k, tz + az]);

  const island = new THREE.Group();
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const tmp = new THREE.Object3D();
  Object.keys(blocks).forEach((k) => {
    const list = blocks[k]; if (!list.length) return;
    const g = k === 'water' ? new THREE.BoxGeometry(1, .8, 1) : geo;
    const mesh = new THREE.InstancedMesh(g, mats[k], list.length);
    list.forEach(([x, y, z], i) => { tmp.position.set(x, y - (k === 'water' ? .1 : 0), z); tmp.updateMatrix(); mesh.setMatrixAt(i, tmp.matrix); });
    island.add(mesh);
  });
  scene.add(island);

  /* yüzen cevher blokları */
  const floaters = [];
  ['diamond', 'gold', 'emerald', 'amethyst', 'red', 'diamond'].forEach((k, i) => {
    const m = new THREE.Mesh(geo, mats[k]); const a = i / 6 * Math.PI * 2;
    m.userData = { a, rad: 11.5 + (i % 2) * 1.5, y: 1 + (i % 3) * 1.6, sp: .12 + i * .01 };
    m.scale.setScalar(.7); island.add(m); floaters.push(m);
  });

  /* modların gerçek eşyaları: tek bir küçük atlastan billboard */
  const sprites = [];
  const HS = window.BB_HERO_SPRITES;
  if (HS) {
    const img = new Image();
    img.onload = () => {
      const base = new THREE.Texture(img); base.needsUpdate = true;
      base.magFilter = THREE.NearestFilter; base.minFilter = THREE.NearestFilter; base.generateMipmaps = false;
      if ('colorSpace' in base) base.colorSpace = THREE.SRGBColorSpace; else base.encoding = THREE.sRGBEncoding;
      const pick = rng(7);
      for (let i = 0; i < HS.n; i++) {
        const t = base.clone(); t.needsUpdate = true;
        t.repeat.set(1 / HS.cols, 1 / HS.rows); t.offset.set((i % HS.cols) / HS.cols, 1 - (Math.floor(i / HS.cols) + 1) / HS.rows);
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true }));
        s.userData = { a: i / HS.n * Math.PI * 2, rad: 13 + pick() * 4, y: -2 + pick() * 9, sp: .06 + pick() * .08, bob: pick() * 6 };
        s.scale.setScalar(1.25); island.add(s); sprites.push(s);
      }
    };
    img.src = HS.src;
  }

  /* XP tozları */
  const N = 160, pos = new Float32Array(N * 3), seeds = [];
  for (let i = 0; i < N; i++) { const a = r() * Math.PI * 2, d = 4 + r() * 16; pos[i * 3] = Math.cos(a) * d; pos[i * 3 + 1] = -6 + r() * 18; pos[i * 3 + 2] = Math.sin(a) * d; seeds.push(r() * 6); }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dot = document.createElement('canvas'); dot.width = dot.height = 8; const dx = dot.getContext('2d'); dx.fillStyle = '#c8ff7a'; dx.fillRect(2, 2, 4, 4); dx.fillStyle = '#fff'; dx.fillRect(3, 3, 1, 1);
  const dt = new THREE.CanvasTexture(dot); dt.magFilter = THREE.NearestFilter;
  const pts = new THREE.Points(pg, new THREE.PointsMaterial({ size: .32, map: dt, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xb6ff6a }));
  scene.add(pts);

  /* yerleşim: masaüstünde ada sağda, telefonda arkada */
  let wide = true;
  function resize() {
    const w = canvas.clientWidth, hh = canvas.clientHeight;
    gl.setSize(w, hh, false); camera.aspect = w / Math.max(1, hh);
    wide = w > 900;
    camera.position.set(0, 10, wide ? 42 : 50); camera.lookAt(0, 0, 0);
    island.position.x = wide ? 12.5 : 0; island.position.y = wide ? 0 : -6;
    pts.position.x = island.position.x;
    camera.updateProjectionMatrix();
  }
  resize(); window.addEventListener('resize', resize);

  let mx = 0, my = 0, tmx = 0, tmy = 0;
  window.addEventListener('pointermove', (e) => { tmx = e.clientX / window.innerWidth - .5; tmy = e.clientY / window.innerHeight - .5; }, { passive: true });

  let visible = true;
  if ('IntersectionObserver' in window) new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) loop(); }, { threshold: 0 }).observe(canvas);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) loop(); });

  const clock = new THREE.Clock(); let running = false;
  function frame() {
    const t = clock.getElapsedTime();
    mx += (tmx - mx) * .05; my += (tmy - my) * .05;
    const sc = Math.min(1, (window.scrollY || 0) / (canvas.clientHeight || 1));
    island.rotation.y = t * .08 + mx * .6;
    island.rotation.x = .05 + my * .12;
    island.position.y = (wide ? 0 : -6) + Math.sin(t * .8) * .35 - sc * 6;
    canvas.style.opacity = String(1 - sc * .9);
    floaters.forEach((f) => { const u = f.userData; const a = u.a + t * u.sp; f.position.set(Math.cos(a) * u.rad, u.y + Math.sin(t * 1.3 + u.a) * .5, Math.sin(a) * u.rad); f.rotation.set(t * .7 + u.a, t * .9, 0); });
    sprites.forEach((s) => { const u = s.userData; const a = u.a - t * u.sp; s.position.set(Math.cos(a) * u.rad, u.y + Math.sin(t + u.bob) * .6, Math.sin(a) * u.rad); });
    const p = pg.attributes.position.array;
    for (let i = 0; i < N; i++) { p[i * 3 + 1] += .012 + (i % 5) * .002; if (p[i * 3 + 1] > 13) p[i * 3 + 1] = -6; }
    pg.attributes.position.needsUpdate = true;
    pts.rotation.y = t * .03;
    gl.render(scene, camera);
  }
  function loop() {
    if (running) return; running = true;
    (function tick() {
      const pageOpen = document.getElementById('page').classList.contains('open');
      if (!visible || document.hidden || pageOpen) { running = false; return; }
      frame(); requestAnimationFrame(tick);
    })();
  }
  if (reduce) { frame(); } else loop();
  /* mod sayfası kapanınca yeniden başlat */
  window.addEventListener('bb:route', () => setTimeout(() => { if (!reduce) loop(); }, 500));
}
})();
