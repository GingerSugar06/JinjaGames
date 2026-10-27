// Tek maç simülasyonu: ilk 11 + diziliş + taktik → takım gücü → beklenen gol → Poisson.
import { lambdas, poissonInv, poissonMatrix, rng, HOME_ADV } from './engine.js';
import { clamp } from './util.js';

// x: 0-100 soldan sağa, y: 0-100 (0 = rakip kale / hücum, 100 = kendi kalemiz)
const S = (role, x, y) => ({ role, x, y });
export const FORMATIONS = {
  '4-3-3': [S('GK', 50, 91), S('LB', 14, 72), S('CB', 37, 76), S('CB', 63, 76), S('RB', 86, 72), S('DM', 50, 56), S('CM', 30, 44), S('CM', 70, 44), S('LW', 16, 22), S('ST', 50, 14), S('RW', 84, 22)],
  '4-2-3-1': [S('GK', 50, 91), S('LB', 14, 72), S('CB', 37, 76), S('CB', 63, 76), S('RB', 86, 72), S('DM', 36, 55), S('DM', 64, 55), S('LW', 16, 33), S('AM', 50, 35), S('RW', 84, 33), S('ST', 50, 13)],
  '4-4-2': [S('GK', 50, 91), S('LB', 14, 72), S('CB', 37, 76), S('CB', 63, 76), S('RB', 86, 72), S('LM', 14, 46), S('CM', 38, 50), S('CM', 62, 50), S('RM', 86, 46), S('ST', 38, 16), S('ST', 62, 16)],
  '4-1-4-1': [S('GK', 50, 91), S('LB', 14, 72), S('CB', 37, 76), S('CB', 63, 76), S('RB', 86, 72), S('DM', 50, 60), S('LM', 14, 40), S('CM', 38, 42), S('CM', 62, 42), S('RM', 86, 40), S('ST', 50, 14)],
  '3-5-2': [S('GK', 50, 91), S('CB', 25, 75), S('CB', 50, 78), S('CB', 75, 75), S('LWB', 10, 50), S('CM', 33, 46), S('DM', 50, 56), S('CM', 67, 46), S('RWB', 90, 50), S('ST', 38, 16), S('ST', 62, 16)],
  '3-4-3': [S('GK', 50, 91), S('CB', 25, 75), S('CB', 50, 78), S('CB', 75, 75), S('LWB', 12, 50), S('CM', 38, 48), S('CM', 62, 48), S('RWB', 88, 50), S('LW', 18, 22), S('ST', 50, 14), S('RW', 82, 22)],
  '5-3-2': [S('GK', 50, 91), S('LWB', 10, 66), S('CB', 28, 76), S('CB', 50, 79), S('CB', 72, 76), S('RWB', 90, 66), S('CM', 30, 46), S('DM', 50, 52), S('CM', 70, 46), S('ST', 38, 16), S('ST', 62, 16)],
  '5-4-1': [S('GK', 50, 91), S('LWB', 10, 66), S('CB', 28, 76), S('CB', 50, 79), S('CB', 72, 76), S('RWB', 90, 66), S('LM', 20, 44), S('CM', 40, 48), S('CM', 60, 48), S('RM', 80, 44), S('ST', 50, 14)],
};
export const ROLE_LINE = { GK: 'G', LB: 'D', CB: 'D', RB: 'D', LWB: 'D', RWB: 'D', DM: 'M', CM: 'M', AM: 'M', LM: 'M', RM: 'M', LW: 'A', RW: 'A', ST: 'A' };
const ACCEPT = {
  GK: ['GK'], LB: ['LB'], RB: ['RB'], CB: ['CB'], LWB: ['LB', 'LM'], RWB: ['RB', 'RM'], DM: ['DM'], CM: ['CM', 'DM', 'AM'], AM: ['AM', 'CM', 'SS'],
  LM: ['LM', 'LW'], RM: ['RM', 'RW'], LW: ['LW', 'LM'], RW: ['RW', 'RM'], ST: ['CF', 'SS'],
};
const W_ATT = { GK: 0, CB: .12, LB: .3, RB: .3, LWB: .45, RWB: .45, DM: .35, CM: .6, AM: .9, LM: .8, RM: .8, LW: 1, RW: 1, ST: 1.2 };
const W_DEF = { GK: 1.5, CB: 1.1, LB: .8, RB: .8, LWB: .7, RWB: .7, DM: .9, CM: .5, AM: .2, LM: .3, RM: .3, LW: .15, RW: .15, ST: .1 };
const LINES = ['G', 'D', 'M', 'A'];
const V_LO = Math.log(2e5), V_HI = Math.log(2e8);
/** İlk 11'in ortalama log-yeteneğinde 1 birim ≈ 170 Elo (kadro değerleri ve Elo geçmişinden kalibre). */
export const ELO_PER_LN = 170;
/** Yaşa göre log-değer düzeltmesi: genç oyuncunun değeri potansiyeli de içerir (bugünkü gücü daha düşük), yaşlıda tersi. */
const AGE_ADJ = { 17: -.55, 18: -.55, 19: -.52, 20: -.48, 21: -.42, 22: -.34, 23: -.26, 24: -.17, 25: -.08, 30: .05, 31: .12, 32: .2, 33: .28 };
export function ageAdj(age) {
  if (age == null) return 0;
  if (age <= 17) return -.55;
  if (age >= 34) return .35;
  return AGE_ADJ[age] ?? 0;
}
/** Bugünkü oyun gücünün log-değer karşılığı (düz piyasa değerinden daha iyi bir yetenek ölçüsü). */
export const abilityLn = p => clamp(Math.log(Math.max(p?.value || 0, 2e5)), V_LO, V_HI) + ageAdj(p?.age);

/** Oyuncunun bu mevkiye uygunluk çarpanı (0-1). */
export function fit(player, role) {
  if (!player) return 0;
  const line = ROLE_LINE[role];
  if (player.pos && ACCEPT[role].includes(player.pos)) return 1;
  if (line === 'G' || player.line === 'G') return player.line === line ? 1 : 0.12;
  const d = Math.abs(LINES.indexOf(player.line) - LINES.indexOf(line));
  if (d === 0) return player.pos ? 0.88 : 0.95;
  if (d === 1) return 0.7;
  return 0.45;
}
/** Mevki uyumuyla düzeltilmiş log-yetenek: mevki dışındaki yıldız tam katkı vermez. */
export const effLn = (p, f) => V_LO + f * (abilityLn(p) - V_LO);

/** Sakat (belirsiz ya da %50 altı oynama şansı) oyuncu otomatik 11'e alınmaz. */
export const isOut = p => !!p?.inj && (p.inj.c == null || p.inj.c <= 50);

/** Atama problemi (Macar yöntemi): cost[n][m], n <= m; satır başına seçilen sütunu verir. */
function assign(cost) {
  const n = cost.length, m = cost[0].length, INF = 1e18;
  const u = new Float64Array(n + 1), v = new Float64Array(m + 1), pp = new Int32Array(m + 1), way = new Int32Array(m + 1);
  for (let i = 1; i <= n; i++) {
    pp[0] = i; let j0 = 0; const minv = new Float64Array(m + 1).fill(INF), used = new Uint8Array(m + 1);
    do {
      used[j0] = 1; const i0 = pp[j0]; let delta = INF, j1 = 0;
      for (let j = 1; j <= m; j++) if (!used[j]) {
        const cur = cost[i0 - 1][j - 1] - u[i0] - v[j];
        if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
        if (minv[j] < delta) { delta = minv[j]; j1 = j; }
      }
      for (let j = 0; j <= m; j++) { if (used[j]) { u[pp[j]] += delta; v[j] -= delta; } else minv[j] -= delta; }
      j0 = j1;
    } while (pp[j0] !== 0);
    do { const j1 = way[j0]; pp[j0] = pp[j1]; j0 = j1; } while (j0);
  }
  const res = Array(n).fill(-1);
  for (let j = 1; j <= m; j++) if (pp[j]) res[pp[j] - 1] = j - 1;
  return res;
}

/** Dizilişe göre en iyi 11: mevki uyumuyla ağırlıklı log-değeri en büyük yapan atama (kimse yanlış mevkiye "yıldız diye" konmaz). */
export function autoXI(squad, formation) {
  const slots = FORMATIONS[formation];
  const pool = squad.filter(p => !isOut(p));
  if (!pool.length) return Array(slots.length).fill(null);
  const m = Math.max(pool.length, slots.length);
  const cost = slots.map(s => Array.from({ length: m }, (_, j) => {
    const p = pool[j];
    return p ? -effLn(p, fit(p, s.role)) : 0;
  }));
  const pick = assign(cost);
  return pick.map(j => (j >= 0 && pool[j] ? pool[j].id : null));
}

/** İlk 11 → hücum/savunma KALİTESİ (ağırlıklı ortalama log-yetenek). Eksik oyuncu en düşük değerle sayılır. */
export function lineupQuality(squadById, formation, xi) {
  const slots = FORMATIONS[formation];
  let A = 0, D = 0, wa = 0, wd = 0, n = 0;
  slots.forEach((s, i) => {
    const p = squadById.get(xi[i]);
    const q = p ? effLn(p, fit(p, s.role)) : V_LO;
    A += W_ATT[s.role] * q; D += W_DEF[s.role] * q; wa += W_ATT[s.role]; wd += W_DEF[s.role]; if (p) n++;
  });
  return { A: A / wa, D: D / wd, n };
}

/** (eski) İlk 11 → hücum/savunma değer toplamları. */
export function lineupStrength(squadById, formation, xi) {
  const slots = FORMATIONS[formation];
  let A = 0, D = 0, total = 0, n = 0;
  slots.forEach((s, i) => {
    const p = squadById.get(xi[i]);
    if (!p) return;
    const v = Math.exp(effLn(p, fit(p, s.role)));
    A += W_ATT[s.role] * v; D += W_DEF[s.role] * v; total += v; n++;
  });
  return { A, D, total, n };
}

/**
 * Bir takımın maça özgü hücum ve savunma "Elo" değeri.
 *  baseElo   = kulübün GERÇEK kadrosunun gücü (sezon başı Elo). Kadro değişikliği bunun üstüne fark olarak eklenir.
 *  baseSquad = değişiklik yapılmadan önceki kadro (yoksa `added` işaretsiz oyuncular). Taban en iyi 11 buradan kurulur;
 *              böylece kadroya alınan yıldızlar tabanı da yükseltip etkisiz kalmaz (eski sürümdeki hata).
 *  chemElo, mgrA, mgrD, formElo = kimya, hoca hücum/savunma farkı, diziliş uyumsuzluğu (strength.js).
 */
export function teamRatings({ baseElo, squad, baseSquad, formation, xi, tactics, chemElo = 0, mgrA = 0, mgrD = 0, formElo = 0 }) {
  const byId = new Map(squad.map(p => [p.id, p]));
  const baseList = baseSquad || squad.filter(p => !p.added);
  const best = lineupQuality(new Map(baseList.map(p => [p.id, p])), formation, autoXI(baseList, formation));
  const cur = lineupQuality(byId, formation, xi);
  const missing = 11 - cur.n;
  const dA = clamp(ELO_PER_LN * (cur.A - best.A), -320, 360), dD = clamp(ELO_PER_LN * (cur.D - best.D), -320, 360);
  const t = tactics || {};
  const m = (t.mentality ?? 50) / 50 - 1;        // -1 defansif … +1 hücumcu
  const press = (t.press ?? 50) / 50 - 1;
  const width = (t.width ?? 50) / 50 - 1;
  const common = chemElo + formElo - 40 * missing;
  const tA = 28 * m + 9 * press + 5 * width, tD = -28 * m * 0.9 - 3 * press;
  const att = baseElo + dA + mgrA + common + tA;
  const def = baseElo + dD + mgrD + common + tD;
  return { att, def, base: baseElo, dA, dD, best, cur, chem: chemElo, mgrA, mgrD, form: formElo, missing, tactA: tA, tactD: tD, tempo: (t.tempo ?? 50) / 50 - 1, counter: (t.counter ?? 0) / 100 };
}

export function matchLambdas(home, away, { neutral = false, total = 2.65, ha: haValue = HOME_ADV } = {}) {
  const ha = neutral ? 0 : haValue;
  const tempo = 1 + 0.10 * (home.tempo + away.tempo) / 2;
  const k = 0.85;
  // kontra: daha güçlü rakibe karşı hücum bonusu
  const cH = home.counter * Math.max(0, (away.att + away.def) / 2 - (home.att + home.def) / 2) * 0.08;
  const cA = away.counter * Math.max(0, (home.att + home.def) / 2 - (away.att + away.def) / 2) * 0.08;
  const lh = total / 2 * tempo * Math.exp(k * (home.att + cH - away.def + ha) / 400);
  const la = total / 2 * tempo * Math.exp(k * (away.att + cA - home.def - ha) / 400);
  return [lh, la];
}

/** n kez oynat. knockout: eşitlikte uzatma + penaltı. */
export function simulate({ lh, la, n = 10000, seed = Date.now() % 1e9, knockout = false, qualityEdge = 0 }) {
  const r = rng(seed);
  const W = 8, grid = Array.from({ length: W + 1 }, () => new Float64Array(W + 1));
  let hw = 0, dr = 0, aw = 0, hGoals = 0, aGoals = 0, btts = 0, over25 = 0, hCs = 0, aCs = 0, hAdv = 0, hPen = 0, aPen = 0, hEt = 0, aEt = 0;
  const gdHist = new Map();
  for (let i = 0; i < n; i++) {
    let hg = poissonInv(lh, r()), ag = poissonInv(la, r());
    grid[Math.min(hg, W)][Math.min(ag, W)]++;
    hGoals += hg; aGoals += ag;
    if (hg > 0 && ag > 0) btts++;
    if (hg + ag > 2) over25++;
    if (ag === 0) hCs++; if (hg === 0) aCs++;
    if (hg > ag) hw++; else if (hg === ag) dr++; else aw++;
    gdHist.set(hg - ag, (gdHist.get(hg - ag) || 0) + 1);
    if (knockout) {
      if (hg > ag) hAdv++;
      else if (hg === ag) {
        const eh = poissonInv(lh / 3, r()), ea = poissonInv(la / 3, r());
        if (eh > ea) { hAdv++; hEt++; } else if (eh < ea) { aEt++; }
        else { const pHome = clamp(0.5 + qualityEdge, 0.3, 0.7); if (r() < pHome) { hAdv++; hPen++; } else aPen++; }
      }
    }
  }
  const sc = [];
  for (let i = 0; i <= W; i++) for (let j = 0; j <= W; j++) sc.push({ h: i, a: j, p: grid[i][j] / n });
  sc.sort((a, b) => b.p - a.p);
  return {
    n, hw: hw / n, dr: dr / n, aw: aw / n, avgH: hGoals / n, avgA: aGoals / n, btts: btts / n, over25: over25 / n, hCs: hCs / n, aCs: aCs / n,
    grid: grid.map(row => Array.from(row, c => c / n)), top: sc.slice(0, 6), gd: [...gdHist].sort((a, b) => a[0] - b[0]).map(([d, c]) => [d, c / n]),
    knock: knockout ? { hAdv: hAdv / n, aAdv: 1 - hAdv / n, pen: (hPen + aPen) / n, et: (hEt + aEt) / n } : null,
  };
}

/** Tek maçı dakika dakika "anlat": gol dakikaları + golü atan oyuncular. */
export function playOne({ lh, la, homeXI, awayXI, seed = Date.now() % 1e9 }) {
  const r = rng(seed);
  const hg = poissonInv(lh, r()), ag = poissonInv(la, r());
  const minute = () => { const u = r(); return Math.min(90, Math.max(1, Math.round(1 + 89 * (u * 0.8 + 0.2 * u * u)))); };
  const scorer = xi => {
    const w = xi.map(p => (p ? ({ G: 0.005, D: 0.08, M: 0.35, A: 1 }[p.line] * Math.pow(Math.max(p.value, 3e5) / 1e7, 0.45)) : 0));
    const t = w.reduce((s, x) => s + x, 0) || 1; let u = r() * t;
    for (let i = 0; i < w.length; i++) { u -= w[i]; if (u <= 0) return xi[i]; }
    return xi[xi.length - 1];
  };
  const ev = [];
  for (let i = 0; i < hg; i++) ev.push({ side: 'h', m: minute(), p: scorer(homeXI) });
  for (let i = 0; i < ag; i++) ev.push({ side: 'a', m: minute(), p: scorer(awayXI) });
  ev.sort((a, b) => a.m - b.m);
  return { hg, ag, ev };
}

export { poissonMatrix };
