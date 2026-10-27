// Simülasyon motoru: Elo → beklenen gol → Poisson, puan tablosu, sezon Monte Carlo (ortak rastgele sayılarla).

export const HOME_ADV = 60;     // Elo puanı
const K_GOAL = 0.85;            // Elo farkı → gol oranı duyarlılığı

// ---- rastgelelik -----------------------------------------------------------
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function poissonInv(lambda, u) {          // ters dönüşüm: aynı u → monoton sonuç (CRN için şart)
  let k = 0, p = Math.exp(-lambda), c = p;
  while (u > c && k < 16) { k++; p *= lambda / k; c += p; }
  return k;
}
export function lambdas(rH, rA, total = 2.7, ha = HOME_ADV) {
  const x = (rH + ha - rA) / 400;
  return [total / 2 * Math.exp(K_GOAL * x), total / 2 * Math.exp(-K_GOAL * x)];
}
export function eloUpdate(rH, rA, hg, ag, k0 = 22, ha = HOME_ADV) {
  const e = 1 / (1 + 10 ** (-(rH + ha - rA) / 400));
  const res = hg > ag ? 1 : hg === ag ? .5 : 0;
  const gd = Math.abs(hg - ag);
  const mult = gd <= 1 ? 1 : gd === 2 ? 1.5 : (11 + gd) / 8;
  const d = k0 * mult * (res - e);
  return d;
}
export function winProbs(rH, rA, total = 2.7, ha = HOME_ADV) {   // Poisson matrisinden 1X2
  const [lh, la] = lambdas(rH, rA, total, ha);
  return poissonMatrix(lh, la).probs;
}
export function poissonMatrix(lh, la, max = 8) {
  const ph = [], pa = [];
  let a = Math.exp(-lh), b = Math.exp(-la);
  for (let k = 0; k <= max; k++) { ph.push(a); pa.push(b); a *= lh / (k + 1); b *= la / (k + 1); }
  const m = []; let w = 0, d = 0, l = 0;
  for (let i = 0; i <= max; i++) { m.push([]); for (let j = 0; j <= max; j++) { const p = ph[i] * pa[j]; m[i].push(p); if (i > j) w += p; else if (i === j) d += p; else l += p; } }
  const s = w + d + l;
  return { m, probs: { w: w / s, d: d / s, l: l / s } };
}

// ---- puan tablosu --------------------------------------------------------------
const H2H_LEAGUES = new Set(['ES1', 'IT1', 'TR1', 'PO1', 'GR1', 'RU1', 'UKR1', 'SC1_']);

export function computeTable(matches, { comp, names = {} } = {}) {
  const T = new Map();
  const row = id => {
    if (!T.has(id)) T.set(id, { id, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0, results: [] });
    return T.get(id);
  };
  const played = matches.filter(m => m.hg != null && m.ag != null);
  for (const m of played) {
    const H = row(m.h), A = row(m.a);
    H.p++; A.p++; H.gf += m.hg; H.ga += m.ag; A.gf += m.ag; A.ga += m.hg;
    if (m.hg > m.ag) { H.w++; A.l++; H.pts += 3; H.results.push('W'); A.results.push('L'); }
    else if (m.hg < m.ag) { A.w++; H.l++; A.pts += 3; H.results.push('L'); A.results.push('W'); }
    else { H.d++; A.d++; H.pts++; A.pts++; H.results.push('D'); A.results.push('D'); }
  }
  const rows = [...T.values()];
  for (const r of rows) { r.gd = r.gf - r.ga; r.form = r.results.slice(-5); }
  const nm = id => names[id] || '';
  const byOverall = (a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || nm(a.id).localeCompare(nm(b.id));
  rows.sort(byOverall);
  if (H2H_LEAGUES.has(comp)) {
    // eşit puanlı grupları aralarındaki maçlara göre yeniden sırala
    const out = [];
    for (let i = 0; i < rows.length;) {
      let j = i; while (j < rows.length && rows[j].pts === rows[i].pts) j++;
      const grp = rows.slice(i, j);
      if (grp.length > 1) {
        const ids = new Set(grp.map(r => r.id)), mini = new Map(grp.map(r => [r.id, { pts: 0, gd: 0, gf: 0 }]));
        for (const m of played) if (ids.has(m.h) && ids.has(m.a)) {
          const H = mini.get(m.h), A = mini.get(m.a);
          H.gf += m.hg; A.gf += m.ag; H.gd += m.hg - m.ag; A.gd += m.ag - m.hg;
          if (m.hg > m.ag) H.pts += 3; else if (m.hg < m.ag) A.pts += 3; else { H.pts++; A.pts++; }
        }
        grp.sort((a, b) => { const x = mini.get(a.id), y = mini.get(b.id); return y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || byOverall(a, b); });
      }
      out.push(...grp); i = j;
    }
    rows.splice(0, rows.length, ...out);
  }
  rows.forEach((r, i) => { r.pos = i + 1; });
  return rows;
}

export function applyEdits(matches, edits) {
  // edits: Map<gameId,{hg,ag}> → yeni dizi; değişenlere real ve edited alanları eklenir
  return matches.map(m => {
    const e = edits.get(m.id);
    if (!e) return m;
    return { ...m, real: [m.hg, m.ag], hg: e.hg, ag: e.ag, edited: true };
  });
}

export function leagueTotal(matches) {
  const pl = matches.filter(m => m.hg != null);
  return pl.length ? pl.reduce((s, m) => s + m.hg + m.ag, 0) / pl.length : 2.7;
}

// ---- sezon Monte Carlo ---------------------------------------------------------
/**
 * Bir sezonu t0 tarihinden itibaren n kez yeniden oynatır.
 * - t0 öncesi maçlar gerçek sonuçla (ve Elo güncellemesiyle) sabittir.
 * - override: Map<gameId,[hg,ag]> bu maçların sonucunu sabitler (what-if).
 * - ratingDelta: Map<teamId,elo> sezon boyunca eklenen sabit fark (transfer etkisi).
 * - Her maç için iki tek düzgün sayı HER ZAMAN çekilir → karşılaştırmalı koşular (CRN) tutarlıdır.
 */
export function simulateSeason({ matches, startElo, t0 = '0000', override = null, ratingDelta = null, n = 2000, seed = 1, dynamic = true, total, defaultElo = 1450 }) {
  const ms = [...matches].sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
  const ids = [...new Set(ms.flatMap(m => [m.h, m.a]))];
  const ix = new Map(ids.map((id, i) => [id, i]));
  const N = ids.length;
  total ??= leagueTotal(ms);
  const base = ids.map(id => (startElo?.get?.(id) ?? defaultElo) + (ratingDelta?.get?.(id) || 0));
  // 1. faz: t0 öncesi gerçek
  const pts0 = new Float64Array(N), gd0 = new Float64Array(N), gf0 = new Float64Array(N);
  const r0 = Float64Array.from(base);
  const future = [];
  for (const m of ms) {
    const hi = ix.get(m.h), ai = ix.get(m.a);
    if (m.date < t0 && m.hg != null) {
      score(pts0, gd0, gf0, hi, ai, m.hg, m.ag);
      if (dynamic) { const d = eloUpdate(r0[hi], r0[ai], m.hg, m.ag); r0[hi] += d; r0[ai] -= d; }
    } else future.push({ m, hi, ai });
  }
  const posCount = Array.from({ length: N }, () => new Float32Array(N));
  const ptsSum = new Float64Array(N), ptsSq = new Float64Array(N), rSum = new Float64Array(N);
  const pts = new Float64Array(N), gd = new Float64Array(N), gf = new Float64Array(N), r = new Float64Array(N);
  const order = new Array(N);
  const ovr = override;
  for (let s = 0; s < n; s++) {
    const rnd = rng(seed * 100003 + s);
    pts.set(pts0); gd.set(gd0); gf.set(gf0); r.set(r0);
    for (const { m, hi, ai } of future) {
      const u1 = rnd(), u2 = rnd();
      let hg, ag;
      const o = ovr?.get(m.id);
      if (o) { hg = o[0]; ag = o[1]; }
      else {
        const [lh, la] = lambdas(r[hi], r[ai], total);
        hg = poissonInv(lh, u1); ag = poissonInv(la, u2);
      }
      score(pts, gd, gf, hi, ai, hg, ag);
      if (dynamic) { const d = eloUpdate(r[hi], r[ai], hg, ag); r[hi] += d; r[ai] -= d; }
    }
    for (let i = 0; i < N; i++) order[i] = i;
    order.sort((a, b) => pts[b] - pts[a] || gd[b] - gd[a] || gf[b] - gf[a] || a - b);
    for (let p = 0; p < N; p++) posCount[order[p]][p]++;
    for (let i = 0; i < N; i++) { ptsSum[i] += pts[i]; ptsSq[i] += pts[i] * pts[i]; rSum[i] += r[i]; }
  }
  const out = new Map();
  for (let i = 0; i < N; i++) {
    const pp = Array.from(posCount[i], c => c / n);
    const mean = ptsSum[i] / n;
    out.set(ids[i], { id: ids[i], expPts: mean, sdPts: Math.sqrt(Math.max(0, ptsSq[i] / n - mean * mean)), posProb: pp, expPos: pp.reduce((s, p, k) => s + p * (k + 1), 0), rating: r0[i], endRating: rSum[i] / n });
  }
  return { teams: out, n, count: N };
}
function score(pts, gd, gf, hi, ai, hg, ag) {
  gd[hi] += hg - ag; gd[ai] += ag - hg; gf[hi] += hg; gf[ai] += ag;
  if (hg > ag) pts[hi] += 3; else if (hg < ag) pts[ai] += 3; else { pts[hi]++; pts[ai]++; }
}

export function probIn(posProb, from, to) { let s = 0; for (let k = from - 1; k < Math.min(to, posProb.length); k++) s += posProb[k]; return s; }

// Elo'yu t tarihine kadar gerçek maçlarla oynatıp (isteğe bağlı override ile) son derecelendirmeleri verir
export function replayElo(matches, startElo, { override = null, until = '9999', defaultElo = 1450 } = {}) {
  const r = new Map();
  const get = id => r.get(id) ?? startElo?.get?.(id) ?? defaultElo;
  for (const m of [...matches].sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id)) {
    if (m.date >= until || m.hg == null) continue;
    const o = override?.get(m.id);
    const hg = o ? o[0] : m.hg, ag = o ? o[1] : m.ag;
    const rh = get(m.h), ra = get(m.a), d = eloUpdate(rh, ra, hg, ag);
    r.set(m.h, rh + d); r.set(m.a, ra - d);
  }
  return r;
}
