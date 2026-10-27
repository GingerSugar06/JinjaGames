// Takım gücü v2: oyuncu yeteneği (yaşa göre düzeltilmiş), mevki uyumu, TAKIM KİMYASI (kim kiminle daha önce oynadı?), hoca etkisi.
// FIFA'daki gibi kimya bağlarla (komşu mevkiler) hesaplanır; FM'deki gibi "yeni gelen uyum sağlar" mantığı vardır.
// Hepsi Elo cinsinden: sezon başı Elo = kulübün gerçek kadrosunun gücü; burada yalnızca KADRODAKİ DEĞİŞİKLİĞİN farkı eklenir.
import { clamp } from './util.js';
import { FORMATIONS, ROLE_LINE, ELO_PER_LN, ageAdj, abilityLn } from './matchsim.js';
export { ELO_PER_LN, ageAdj, abilityLn };

export const CHEM_PER_UNIT = 85;        // takım kimyasında 1.0 (tam) fark ≈ 85 Elo; ±60 ile sınırlı
/** FIFA tarzı 0-99 "OVR" (yalnızca gösterim): 1M€ ≈ 50, 10M€ ≈ 66, 50M€ ≈ 77, 150M€ ≈ 85. */
export const ovr = p => clamp(Math.round(50 + 7 * (abilityLn(p) - Math.log(1e6))), 35, 97);

// ---------------------------------------------------------------- kimya
/** Oyuncu kulüp dönemleri: { id: [kulüp, başlangıç_ay, bitiş_ay, ...] } -> Map */
export function stintMap(raw) {
  const m = new Map();
  for (const [pid, flat] of Object.entries(raw || {})) { const a = []; for (let i = 0; i < flat.length; i += 3) a.push([flat[i], flat[i + 1], flat[i + 2]]); m.set(+pid, a); }
  return m;
}
/** Ay sırası: 2000 Ocak = 0. Bugünün ya da bir sezonun başlangıcının ay sırası. */
export const monthNow = () => { const d = new Date(); return (d.getFullYear() - 2000) * 12 + d.getMonth(); };
export const monthOfSeason = s => (s - 2000) * 12 + 7;

function together(sa, sb, ref) {
  let t = 0;
  for (const [ca, a0, a1] of sa) for (const [cb, b0, b1] of sb) if (ca === cb) t += Math.max(0, Math.min(a1, b1, ref) - Math.max(a0, b0));
  return t;
}
/** İki oyuncu arasındaki bağ gücü (0-1): birlikte oynanan ay + aynı uyruk + aynı lig. */
export function linkStrength(a, b, S, ref, compOf, byNat = true) {
  const sa = S.get(a.id) || [], sb = S.get(b.id) || [];
  const T = together(sa, sb, ref);
  const lt = 1 - Math.exp(-T / 18);                                           // 18 ay ≈ %63, 3 yıl ≈ %86
  const ln = byNat && a.nat && a.nat === b.nat ? 0.30 : 0;                    // ortak dil/milli takım
  const la = sa.length ? sa.reduce((x, s) => (s[1] <= ref ? s : x), sa[0]) : null, lb = sb.length ? sb.reduce((x, s) => (s[1] <= ref ? s : x), sb[0]) : null;
  const lg = la && lb && compOf(la[0]) && compOf(la[0]) === compOf(lb[0]) ? 0.12 : 0;   // aynı ligi biliyorlar
  return { s: 1 - (1 - lt) * (1 - ln) * (1 - lg), months: T };
}
/** Bir oyuncunun bu kulüpte kaç aydır olduğu (uyum süresi). Kulüpte hiç dönemi yoksa 0 (yeni gelen). */
function monthsAt(p, club, S, ref) {
  const st = S.get(p.id) || [];
  let best = 0;
  for (const [c, a, b] of st) if (c === club && a <= ref) best = Math.max(best, Math.min(b, ref) - a);
  return best;
}

/** Formasyondaki komşu mevki çiftleri: her slot en yakın 3 slotla bağlanır (FIFA'daki bağlantı çizgileri gibi). */
export function neighbors(formation) {
  const slots = FORMATIONS[formation], pairs = new Set();
  slots.forEach((s, i) => {
    const d = slots.map((t, j) => [j, Math.hypot((s.x - t.x) * 0.85, s.y - t.y)]).filter(([j]) => j !== i).sort((a, b) => a[1] - b[1]).slice(0, 3);
    for (const [j] of d) pairs.add(i < j ? `${i}-${j}` : `${j}-${i}`);
  });
  return [...pairs].map(k => k.split('-').map(Number));
}

/**
 * Takım kimyası. xi: oyuncu kimlikleri; byId: Map(id -> oyuncu); S: stintMap; ref: ay sırası; club: takımın kulüp kimliği (milli takımda null)
 * Döner: { team: 0-1, per: [slot başına 0-1], links: [{i, j, s}], newcomers: n }
 */
export function chemistry({ xi, formation, byId, S, ref, club = null, compOf = () => null }) {
  const nat = club == null;
  const pairs = neighbors(formation);
  const ps = xi.map(id => byId.get(id) || null);
  const acc = ps.map(() => []);
  const links = [];
  for (const [i, j] of pairs) {
    if (!ps[i] || !ps[j]) continue;
    const l = linkStrength(ps[i], ps[j], S, ref, compOf, !nat);
    acc[i].push(l.s); acc[j].push(l.s); links.push({ i, j, s: l.s, months: l.months });
  }
  let newcomers = 0;
  const per = ps.map((p, i) => {
    if (!p) return 0;
    const lk = acc[i].length ? acc[i].reduce((x, y) => x + y, 0) / acc[i].length : 0;
    const ad = nat ? 1 : clamp(monthsAt(p, club, S, ref) / 18, 0, 1);       // kulüpte ~1,5 yıl = tam uyum
    if (!nat && ad < .25) newcomers++;
    return 0.75 * lk + 0.25 * ad;
  });
  const have = per.filter((_, i) => ps[i]);
  return { team: have.length ? have.reduce((x, y) => x + y, 0) / have.length : 0, per, links, newcomers };
}
/** Kimya farkının Elo karşılığı (taban: kulübün gerçek ilk 11'inin kimyası). */
export const chemElo = (cur, ref) => clamp(CHEM_PER_UNIT * (cur - ref), -60, 60);

// ---------------------------------------------------------------- hoca
/** "4-3-3 Attacking" gibi Transfermarkt diziliş adlarını "4-3-3"e indirger. */
export const baseForm = f => (String(f).match(/^\d(?:-\d)+/) || [''])[0];
/** Hocanın bu dizilişi ne kadar sık kullandığı → uyum (0-1); veri yoksa null. 0.4 ve üstü tam uyum. */
export function formFamiliarity(forms, formation) {
  if (!forms?.length) return null;
  const share = forms.filter(([f]) => baseForm(f) === formation).reduce((s, [, c]) => s + c, 0);
  return clamp(share / 0.4, 0, 1);
}
/** Hocanın en çok kullandığı, simülatörde bulunan diziliş. */
export function favouriteFormation(forms) {
  const agg = new Map();
  for (const [f, c] of forms || []) { const b = baseForm(f); if (FORMATIONS[b]) agg.set(b, (agg.get(b) || 0) + c); }
  return [...agg].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}
/** Diziliş uyumsuzluğunun Elo cezası: hocanın hiç kullanmadığı dizilişte −14. */
export const formElo = fam => (fam == null ? 0 : -14 * (1 - fam));

