// Ana sayfa 3D sahnesi: gece maçı stadyumu. Sahaya tıkla, top o noktaya doğru gitsin; kaleciyi geçersen gol.
// Three.js CDN'den dinamik yüklenir; yüklenemezse (çevrimdışı, WebGL yok) null döner ve sayfa statik zeminle çalışır.
const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const GOAL_Z = -30, GOAL_W = 14, GOAL_H = 4.8, R = 0.55, SPOT_Z = -19;
const G = 24;

export async function mountStadium(host, cb = {}) {
  let T;
  try { T = await import(/* @vite-ignore */ THREE_URL); } catch { return null; }
  const canvas = document.createElement('canvas');
  canvas.className = 'stadium-canvas';
  let renderer;
  try { renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); } catch { return null; }
  host.prepend(canvas);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.2;

  const scene = new T.Scene();
  scene.background = new T.Color('#040806');
  scene.fog = new T.Fog('#040806', 50, 150);
  const camera = new T.PerspectiveCamera(54, 1, 0.1, 300);
  const camBase = new T.Vector3(0, 3.4, SPOT_Z + 13.5);
  camera.position.copy(camBase);

  // ---------------------------------------------------------------- saha
  const tex = (() => {
    const W = 1024, H = 1536, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    const px = X => (X + 40) / 80 * W, pz = Z => (Z + 60) / 120 * H;
    for (let i = 0; i < 20; i++) { x.fillStyle = i % 2 ? '#1c6b3f' : '#175c36'; x.fillRect(0, i * H / 20, W, H / 20 + 1); }
    x.strokeStyle = 'rgba(255,255,255,.92)'; x.lineWidth = 5; x.lineCap = 'round';
    const line = (a, b, c2, d) => { x.beginPath(); x.moveTo(px(a), pz(b)); x.lineTo(px(c2), pz(d)); x.stroke(); };
    line(-40, GOAL_Z, 40, GOAL_Z); line(-40, 40, 40, 40);
    line(-20, GOAL_Z, -20, GOAL_Z + 16); line(20, GOAL_Z, 20, GOAL_Z + 16); line(-20, GOAL_Z + 16, 20, GOAL_Z + 16);
    line(-11, GOAL_Z, -11, GOAL_Z + 5.5); line(11, GOAL_Z, 11, GOAL_Z + 5.5); line(-11, GOAL_Z + 5.5, 11, GOAL_Z + 5.5);
    x.beginPath(); x.arc(px(0), pz(SPOT_Z), 9 / 80 * W, 0.62, Math.PI - 0.62); x.stroke();
    x.fillStyle = '#fff'; x.beginPath(); x.arc(px(0), pz(SPOT_Z), 5, 0, 6.3); x.fill();
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; return t;
  })();
  const pitch = new T.Mesh(new T.PlaneGeometry(80, 120), new T.MeshStandardMaterial({ map: tex, roughness: 1, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.4 }));
  pitch.rotation.x = -Math.PI / 2; scene.add(pitch);
  const apron = new T.Mesh(new T.PlaneGeometry(400, 400), new T.MeshBasicMaterial({ color: '#050a07' })); apron.rotation.x = -Math.PI / 2; apron.position.y = -0.05; scene.add(apron);

  // ---------------------------------------------------------------- aydınlatma
  scene.add(new T.HemisphereLight('#dbeaff', '#123a22', 0.8));
  const towers = [[-34, -42], [34, -42], [-34, 8], [34, 8]];
  const beams = [];
  towers.forEach(([x, z], i) => {
    const pole = new T.Mesh(new T.CylinderGeometry(0.35, 0.5, 27, 8), new T.MeshStandardMaterial({ color: '#1a2320', roughness: 0.8 }));
    pole.position.set(x, 13.5, z); scene.add(pole);
    const head = new T.Mesh(new T.BoxGeometry(7, 3.4, 0.6), new T.MeshBasicMaterial({ color: '#fff6d6' }));
    head.position.set(x, 27.5, z); head.lookAt(0, 0, -12); scene.add(head);
    const from = new T.Vector3(x, 27, z), to = new T.Vector3(x * 0.15, 0, -14), len = from.distanceTo(to);
    const g = new T.ConeGeometry(11, len, 28, 1, true); g.translate(0, -len / 2, 0); g.rotateX(-Math.PI / 2);
    const beam = new T.Mesh(g, new T.MeshBasicMaterial({ color: '#fff3c9', transparent: true, opacity: 0.05, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
    beam.position.copy(from); beam.lookAt(to); scene.add(beam); beams.push(beam);
    if (i < 2 || i === 3) {
      const s = new T.SpotLight('#fff1c9', 9000, 0, 0.75, 0.7, 2); s.position.copy(from); s.target.position.set(0, 0, -12); scene.add(s, s.target);
    }
  });

  // ---------------------------------------------------------------- tribünler
  const crowdGeo = new T.BoxGeometry(0.62, 0.95, 0.42);
  const palette = ['#d62828', '#f2b705', '#f4f4f4', '#2563d6', '#2fd07f', '#8a8f98', '#d62828'].map(c => new T.Color(c));
  const spots = [];
  // arka tribün
  for (let t = 0; t < 4; t++) for (let i = 0; i < 90; i++) spots.push({ x: -44 + i * 0.98, y: 1.6 + t * 1.55, z: -38 - t * 1.9, rotY: 0 });
  // yan tribünler
  for (let t = 0; t < 4; t++) for (let i = 0; i < 80; i++) { spots.push({ x: -41 - t * 1.9, y: 1.6 + t * 1.55, z: -36 + i * 0.98, rotY: Math.PI / 2 }); spots.push({ x: 41 + t * 1.9, y: 1.6 + t * 1.55, z: -36 + i * 0.98, rotY: -Math.PI / 2 }); }
  const crowd = new T.InstancedMesh(crowdGeo, new T.MeshBasicMaterial({ color: '#ffffff' }), spots.length);
  const m4 = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(), sc = new T.Vector3(1, 1, 1), pos = new T.Vector3();
  const base = [];
  spots.forEach((s, i) => {
    e.set(0, s.rotY, 0); q.setFromEuler(e); pos.set(s.x, s.y, s.z); m4.compose(pos, q, sc); crowd.setMatrixAt(i, m4);
    const c = palette[(Math.random() * palette.length) | 0].clone().multiplyScalar(0.1 + Math.random() * 0.2); base.push(c.clone()); crowd.setColorAt(i, c);
  });
  scene.add(crowd);
  const risers = [];
  for (let t = 0; t < 4; t++) {
    const back = new T.Mesh(new T.BoxGeometry(96, 1.5, 1.9), new T.MeshBasicMaterial({ color: '#0b1210' })); back.position.set(0, 0.8 + t * 1.55, -38.5 - t * 1.9); scene.add(back);
    for (const sx of [-1, 1]) { const side = new T.Mesh(new T.BoxGeometry(1.9, 1.5, 80), new T.MeshBasicMaterial({ color: '#0b1210' })); side.position.set(sx * (41.5 + t * 1.9), 0.8 + t * 1.55, 4); scene.add(side); risers.push(side); }
  }
  const flashes = [];

  // ---------------------------------------------------------------- kale
  const goal = new T.Group(); goal.position.z = GOAL_Z; scene.add(goal);
  const wood = new T.MeshStandardMaterial({ color: '#f6f6f2', roughness: 0.35, metalness: 0.1 });
  const post = (x, h) => { const m = new T.Mesh(new T.CylinderGeometry(0.12, 0.12, h, 12), wood); m.position.set(x, h / 2, 0); goal.add(m); };
  post(-GOAL_W / 2, GOAL_H); post(GOAL_W / 2, GOAL_H);
  const bar = new T.Mesh(new T.CylinderGeometry(0.12, 0.12, GOAL_W + 0.24, 12), wood); bar.rotation.z = Math.PI / 2; bar.position.y = GOAL_H; goal.add(bar);
  const netTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.strokeStyle = 'rgba(255,255,255,.75)'; x.lineWidth = 3; x.beginPath(); for (let i = 0; i <= 128; i += 16) { x.moveTo(i, 0); x.lineTo(i, 128); x.moveTo(0, i); x.lineTo(128, i); } x.stroke(); const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; return t; })();
  const netMat = (rx, ry) => { const t = netTex.clone(); t.repeat.set(rx, ry); t.needsUpdate = true; return new T.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.55, side: T.DoubleSide, depthWrite: false }); };
  const DEPTH = 3.2;
  const netBack = new T.Mesh(new T.PlaneGeometry(GOAL_W, GOAL_H), netMat(GOAL_W / 0.9, GOAL_H / 0.9)); netBack.position.set(0, GOAL_H / 2, -DEPTH); goal.add(netBack);
  const netTop = new T.Mesh(new T.PlaneGeometry(GOAL_W, DEPTH), netMat(GOAL_W / 0.9, DEPTH / 0.9)); netTop.rotation.x = Math.PI / 2; netTop.position.set(0, GOAL_H, -DEPTH / 2); goal.add(netTop);
  for (const sx of [-1, 1]) { const s = new T.Mesh(new T.PlaneGeometry(DEPTH, GOAL_H), netMat(DEPTH / 0.9, GOAL_H / 0.9)); s.rotation.y = Math.PI / 2; s.position.set(sx * GOAL_W / 2, GOAL_H / 2, -DEPTH / 2); goal.add(s); }

  // ---------------------------------------------------------------- kaleci
  const keeper = new T.Group(); scene.add(keeper);
  const kb = new T.Mesh(new T.CapsuleGeometry(0.42, 1.0, 6, 12), new T.MeshStandardMaterial({ color: '#f2b705', roughness: 0.6 })); kb.position.y = 1.0; keeper.add(kb);
  const kh = new T.Mesh(new T.SphereGeometry(0.3, 16, 12), new T.MeshStandardMaterial({ color: '#e0b896', roughness: 0.7 })); kh.position.y = 2.05; keeper.add(kh);
  for (const sx of [-1, 1]) { const arm = new T.Mesh(new T.CapsuleGeometry(0.13, 0.9, 4, 8), new T.MeshStandardMaterial({ color: '#f2b705' })); arm.position.set(sx * 0.62, 1.2, 0); arm.rotation.z = sx * 0.5; keeper.add(arm); const gl = new T.Mesh(new T.SphereGeometry(0.2, 10, 8), new T.MeshStandardMaterial({ color: '#2fd07f' })); gl.position.set(sx * 0.95, 1.65, 0); keeper.add(gl); }
  const K = { x: 0, tx: 0, dive: 0, t: 0, side: 0, active: false, y: 0 };

  // ---------------------------------------------------------------- top
  const ballGeo = (() => {
    const g = new T.IcosahedronGeometry(R, 1).toNonIndexed(), p = g.attributes.position, n = g.attributes.normal;
    const ico = new T.IcosahedronGeometry(1, 0).attributes.position, orig = [];
    for (let i = 0; i < ico.count; i++) { const v = new T.Vector3().fromBufferAttribute(ico, i).normalize(); if (!orig.some(o => o.distanceTo(v) < 1e-3)) orig.push(v); }
    const col = new Float32Array(p.count * 3), v = new T.Vector3();
    for (let f = 0; f < p.count; f += 3) {
      let dark = false;
      for (let k = 0; k < 3; k++) { v.fromBufferAttribute(p, f + k).normalize(); if (orig.some(o => o.distanceTo(v) < 1e-3)) dark = true; }
      for (let k = 0; k < 3; k++) { const c = dark ? 0.06 : 0.97; col[(f + k) * 3] = c; col[(f + k) * 3 + 1] = c; col[(f + k) * 3 + 2] = c; v.fromBufferAttribute(p, f + k).normalize(); n.setXYZ(f + k, v.x, v.y, v.z); }
    }
    g.setAttribute('color', new T.BufferAttribute(col, 3)); return g;
  })();
  const ball = new T.Mesh(ballGeo, new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.42, metalness: 0.05 }));
  scene.add(ball);
  const shadowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 2, 32, 32, 30); g.addColorStop(0, 'rgba(0,0,0,.65)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new T.CanvasTexture(c); })();
  const shadow = new T.Mesh(new T.PlaneGeometry(2.2, 2.2), new T.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.02; scene.add(shadow);
  const reticle = new T.Mesh(new T.RingGeometry(0.7, 0.9, 40), new T.MeshBasicMaterial({ color: '#c8ff5a', transparent: true, opacity: 0.8, depthWrite: false })); reticle.rotation.x = -Math.PI / 2; reticle.position.y = 0.04; reticle.visible = false; scene.add(reticle);

  const B = { p: new T.Vector3(0, R, SPOT_Z), v: new T.Vector3(), spin: new T.Vector3(), state: 'ready', t: 0, scored: false, saved: false, grow: 0 };
  let goals = 0, shots = 0, streak = 0;

  // ---------------------------------------------------------------- konfeti
  const NC = 240, cGeo = new T.BufferGeometry(), cPos = new Float32Array(NC * 3), cCol = new Float32Array(NC * 3), cVel = new Float32Array(NC * 3);
  cGeo.setAttribute('position', new T.BufferAttribute(cPos, 3)); cGeo.setAttribute('color', new T.BufferAttribute(cCol, 3));
  const confetti = new T.Points(cGeo, new T.PointsMaterial({ size: 0.38, vertexColors: true, transparent: true, depthWrite: false })); confetti.visible = false; confetti.frustumCulled = false; scene.add(confetti);
  let cLife = 0;
  const burst = () => {
    const cols = ['#c8ff5a', '#ffc933', '#ffffff', '#ff7a6b', '#6fa8ff'].map(c => new T.Color(c));
    for (let i = 0; i < NC; i++) {
      cPos.set([(Math.random() - .5) * 10, 4 + Math.random() * 2, GOAL_Z + 1 + Math.random() * 2], i * 3);
      cVel.set([(Math.random() - .5) * 9, 6 + Math.random() * 9, 6 + Math.random() * 10], i * 3);
      const c = cols[i % cols.length]; cCol.set([c.r, c.g, c.b], i * 3);
    }
    cGeo.attributes.color.needsUpdate = true; confetti.visible = true; cLife = 3.2;
    for (let i = 0; i < 90; i++) flashes.push({ i: (Math.random() * spots.length) | 0, t: 0.15 + Math.random() * 1.2 });
  };

  // ---------------------------------------------------------------- vuruş
  const predict = (p0, v0) => {
    const p = p0.clone(), v = v0.clone();
    for (let i = 0; i < 400; i++) {
      v.y -= G * 0.01; p.addScaledVector(v, 0.01); if (p.y < R) { p.y = R; v.y *= -0.55; }
      if (p.z <= GOAL_Z + 0.3) return p;
    }
    return null;
  };
  function kick(tx, tz) {
    if (B.state !== 'ready') return;
    const dx = tx - B.p.x, dz = tz - B.p.z, d = Math.hypot(dx, dz) || 1;
    const sp = Math.min(38, Math.max(15, 11 + d * 1.35));
    B.v.set(dx / d * sp, 3.4 + sp * 0.13, dz / d * sp);
    B.spin.set(-B.v.z * 0.4, 0, B.v.x * 0.4);
    B.state = 'flight'; B.t = 0; B.scored = false; B.saved = false; shots++; cb.onShot?.(shots);
    const hit = predict(B.p, B.v);
    K.active = true; K.t = 0;
    if (hit && Math.abs(hit.x) < GOAL_W / 2 - 0.3 && hit.y < GOAL_H - 0.3) {
      const save = Math.random() < 0.38;
      K.tx = save ? Math.max(-5.6, Math.min(5.6, hit.x)) : (hit.x > 0 ? -1 : 1) * (2 + Math.random() * 3);
      K.hy = hit.y;
    } else { K.tx = (Math.random() - .5) * 3; K.hy = 1; }
    K.side = Math.sign(K.tx - K.x) || 1;
  }
  const reset = () => { B.p.set(0, R, SPOT_Z); B.v.set(0, 0, 0); B.spin.set(0, 0, 0); B.state = 'ready'; B.grow = 0; ball.scale.setScalar(0.01); K.tx = 0; K.active = false; K.dive = 0; };

  // ---------------------------------------------------------------- girdi
  const ray = new T.Raycaster(), ndc = new T.Vector2(), plane = new T.Plane(new T.Vector3(0, 1, 0), 0), hitPt = new T.Vector3();
  const mouse = { x: 0, y: 0 };
  const groundAt = ev => {
    const r = canvas.getBoundingClientRect(); ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera); return ray.ray.intersectPlane(plane, hitPt) ? hitPt : null;
  };
  const free = ev => !ev.target.closest('a,button,input,select,label,.hero-box,.suggest');
  const onMove = ev => {
    const r = host.getBoundingClientRect(); mouse.x = ((ev.clientX - r.left) / r.width) * 2 - 1; mouse.y = ((ev.clientY - r.top) / r.height) * 2 - 1;
    if (!free(ev)) { reticle.visible = false; return; }
    const p = groundAt(ev);
    if (p && B.state === 'ready') { reticle.visible = true; reticle.position.set(Math.max(-38, Math.min(38, p.x)), 0.04, Math.max(-58, Math.min(B.p.z - 3, p.z))); } else reticle.visible = false;
  };
  const onDown = ev => {
    if (!free(ev)) return;
    const p = groundAt(ev); if (!p) return;
    kick(p.x, Math.min(p.z, B.p.z - 3));
  };
  host.addEventListener('pointermove', onMove); host.addEventListener('pointerdown', onDown); host.addEventListener('pointerleave', () => { reticle.visible = false; });

  // ---------------------------------------------------------------- boyut / döngü
  const fit = () => { const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / Math.max(1, h); camera.updateProjectionMatrix(); };
  const ro = new ResizeObserver(fit); ro.observe(host); fit();
  let visible = true; const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; }); io.observe(host);
  let raf = 0, last = performance.now(), dead = false, flashT = 0, time = 0;
  reset(); ball.scale.setScalar(1); B.grow = 1;

  function step(dt) {
    time += dt;
    // top
    if (B.state === 'flight' || B.state === 'goal') {
      B.t += dt;
      B.v.y -= G * dt; B.v.multiplyScalar(1 - 0.06 * dt);
      const prevZ = B.p.z; B.p.addScaledVector(B.v, dt);
      if (B.p.y < R) { B.p.y = R; if (Math.abs(B.v.y) > 1.2) B.v.y *= -0.58; else B.v.y = 0; B.v.x *= 1 - 1.6 * dt; B.v.z *= 1 - 1.6 * dt; }
      if (B.p.y <= R + 0.01) { B.v.x *= 1 - 0.9 * dt; B.v.z *= 1 - 0.9 * dt; }
      // kale çizgisi: gol / direk
      if (B.state === 'flight' && prevZ > GOAL_Z && B.p.z <= GOAL_Z) {
        const inX = Math.abs(B.p.x) < GOAL_W / 2 - R * 0.35, inY = B.p.y < GOAL_H - R * 0.35;
        const post = Math.abs(Math.abs(B.p.x) - GOAL_W / 2) < R * 0.7 && B.p.y < GOAL_H + R, barHit = Math.abs(B.p.y - GOAL_H) < R * 0.7 && Math.abs(B.p.x) < GOAL_W / 2 + R;
        if (inX && inY && !B.saved) { B.state = 'goal'; B.scored = true; goals++; streak++; cb.onGoal?.(goals, streak, shots); burst(); B.t = 0; }
        else if (post || barHit) { B.v.z = Math.abs(B.v.z) * 0.45; B.v.x *= 0.5; B.v.y = Math.max(B.v.y, 2); B.p.z = GOAL_Z + 0.4; cb.onWood?.(); }
      }
      if (B.state === 'goal') { if (B.p.z < GOAL_Z - DEPTH + R) { B.p.z = GOAL_Z - DEPTH + R; B.v.z *= -0.15; B.v.x *= 0.5; netShake = 0.5; } }
      // kaleci teması
      if (B.state === 'flight' && !B.saved && Math.abs(B.p.z - keeper.position.z) < 0.9 && B.v.z < 0) {
        const reach = 0.95 + 1.45 * K.dive, ky = 0.2 + 1.9 + K.dive * 0.9;
        if (Math.abs(B.p.x - K.x) < reach && B.p.y < ky + R) { B.saved = true; B.v.z = Math.abs(B.v.z) * 0.35; B.v.x += (Math.random() - .5) * 8; B.v.y = 3 + Math.random() * 3; B.p.z = keeper.position.z + 1; streak = 0; cb.onSave?.(); }
      }
      // saha dışı / durdu
      const speed = B.v.length();
      const out = B.p.z > 20 || Math.abs(B.p.x) > 39 || B.p.z < -41;
      const resting = B.p.y <= R + 0.02 && speed < 0.5;
      if (B.state === 'flight' && B.t > 0.6 && (out || resting || B.t > 7)) { if (!B.scored && !B.saved) streak = 0; B.state = 'reset'; B.t = 0; if (!B.scored && !B.saved) cb.onMiss?.(); }
      else if (B.state === 'flight' && B.saved && B.t > 3.2) { B.state = 'reset'; B.t = 0; }
      else if (B.state === 'goal' && B.t > 2.6) { B.state = 'reset'; B.t = 0; }
    } else if (B.state === 'reset') {
      B.t += dt; B.v.set(0, 0, 0);
      if (B.t > 0.7) reset();
    }
    if (B.state === 'ready' && B.grow < 1) { B.grow = Math.min(1, B.grow + dt * 3); ball.scale.setScalar(Math.max(0.01, B.grow)); }
    ball.position.copy(B.p);
    ball.rotation.x += (B.v.z * dt) / R; ball.rotation.z -= (B.v.x * dt) / R;
    shadow.position.set(B.p.x, 0.02, B.p.z); const hh = Math.max(0, B.p.y - R); shadow.scale.setScalar(Math.max(0.4, 1 - hh * 0.07)); shadow.material.opacity = Math.max(0.2, 1 - hh * 0.09); shadow.visible = B.state !== 'goal' || B.p.z > GOAL_Z;
    // kaleci
    if (K.active) {
      K.t += dt; const k = Math.min(1, K.t / 0.55), ease = 1 - Math.pow(1 - k, 3);
      K.x += (K.tx - K.x) * Math.min(1, dt * 7); K.dive = Math.abs(K.tx) > 1 ? ease : 0.2 * ease;
    } else { K.x += (0 - K.x) * Math.min(1, dt * 4); K.dive *= 1 - Math.min(1, dt * 5); K.hy = 0; }
    keeper.position.set(K.x, 0, GOAL_Z + 0.9 + Math.sin(time * 1.4) * 0.05 * (K.active ? 0 : 1));
    keeper.rotation.z = -K.side * K.dive * 1.05; keeper.position.y = K.dive * 0.7;
    if (!K.active) { keeper.position.x += Math.sin(time * 1.2) * 0.4; }
    // ağ titreşimi
    netShake = Math.max(0, netShake - dt); netBack.position.z = -DEPTH - Math.sin(time * 40) * 0.12 * netShake; netBack.scale.x = 1 + Math.sin(time * 36) * 0.01 * netShake;
    // konfeti
    if (cLife > 0) {
      cLife -= dt; for (let i = 0; i < NC; i++) { cVel[i * 3 + 1] -= 14 * dt; cPos[i * 3] += cVel[i * 3] * dt; cPos[i * 3 + 1] += cVel[i * 3 + 1] * dt; cPos[i * 3 + 2] += cVel[i * 3 + 2] * dt; if (cPos[i * 3 + 1] < 0.05) { cPos[i * 3 + 1] = 0.05; cVel[i * 3] *= 0.7; cVel[i * 3 + 1] = 0; cVel[i * 3 + 2] *= 0.7; } }
      cGeo.attributes.position.needsUpdate = true; if (cLife <= 0) confetti.visible = false;
    }
    // seyirci flaşları
    flashT -= dt;
    if (flashT <= 0) { flashT = 0.07 + Math.random() * 0.12; flashes.push({ i: (Math.random() * spots.length) | 0, t: 0.1 }); }
    for (let k = flashes.length - 1; k >= 0; k--) {
      const f = flashes[k]; f.t -= dt;
      if (f.t > 0) crowd.setColorAt(f.i, new T.Color(1.6, 1.6, 1.4)); else { crowd.setColorAt(f.i, base[f.i]); flashes.splice(k, 1); }
    }
    crowd.instanceColor.needsUpdate = true;
    // kamera
    const follow = B.state === 'flight' || B.state === 'goal' ? Math.max(-6, Math.min(6, B.p.x * 0.35)) : 0;
    camera.position.x += ((camBase.x + mouse.x * 2.2 + Math.sin(time * 0.25) * 0.8) - camera.position.x) * Math.min(1, dt * 2);
    camera.position.y += ((camBase.y - mouse.y * 0.5 + Math.sin(time * 0.35) * 0.15) - camera.position.y) * Math.min(1, dt * 2);
    camera.lookAt(follow + mouse.x * 1.2, 1.1, -22);
    beams.forEach((b, i) => { b.material.opacity = 0.045 + Math.sin(time * 0.8 + i) * 0.008; });
  }
  let netShake = 0;
  function loop(now) {
    if (dead) return;
    raf = requestAnimationFrame(loop);
    if (!host.isConnected) { api.destroy(); return; }
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!visible || document.hidden) return;
    step(dt); renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(loop);

  const api = {
    renderer,
    destroy() {
      if (dead) return; dead = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      host.removeEventListener('pointermove', onMove); host.removeEventListener('pointerdown', onDown);
      scene.traverse(o => { o.geometry?.dispose?.(); const m = o.material; if (m) (Array.isArray(m) ? m : [m]).forEach(x => { x.map?.dispose?.(); x.dispose?.(); }); });
      renderer.dispose(); canvas.remove();
    },
    stats: () => ({ goals, shots }),
  };
  return api;
}
