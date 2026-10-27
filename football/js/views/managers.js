// Teknik direktörler: puan sıralaması, aktif görevler, kulüp geçmişi.
import { h, mount, setCrumbs, norm, debounce, fmtDate } from '../util.js';
import { boot, pageHead, sheet, seg, field, crestFor } from '../ui.js';
import { loadManagers, mgrInfo } from '../data.js';
import { eloChip, dampPct } from '../mgr.js';

export async function render(app) {
  const ctx = await boot();
  const M = await loadManagers();
  setCrumbs('Takımlar', 'Teknik direktörler');
  // hoca -> son görevi (en geç biten dönem) ve bugün görevde olduğu kulüp
  const lastStint = new Map(), active = new Map();
  for (const [cid, c] of Object.entries(M.c)) {
    for (const r of c.hist || []) { const o = lastStint.get(r[0]); if (!o || r[2] > o.to) lastStint.set(r[0], { club: +cid, to: r[2], from: r[1] }); }
    if (c.cur?.n && (c.cur.src === 'wikidata' || (c.hist?.at(-1)?.[2] ?? '') >= '2026-03-01')) active.set(c.cur.n, +cid);   // eski kulüplerin son hocası "görevde" sayılmaz
  }
  const S = { q: '', view: 'act', sort: 'elo', min: 100 };
  const box = h('div');
  const rows = () => {
    const q = norm(S.q).trim();
    let list = Object.entries(M.m).map(([n, r]) => ({ n, i: mgrInfo(M, n), club: active.get(n) ?? lastStint.get(n)?.club, now: active.has(n) }));
    list = list.filter(x => x.i.g >= (q ? 12 : S.min) && (q ? norm(x.n).includes(q) : S.view === 'all' || x.now));
    const key = { elo: x => -x.i.elo, g: x => -x.i.g, ppg: x => -x.i.ppg }[S.sort];
    return list.sort((a, b) => key(a) - key(b)).slice(0, 120);
  };
  function draw() {
    const list = rows();
    mount(box, list.length ? sheet(null, h('div', { style: 'overflow:auto' }, h('table', { class: 'tbl' },
      h('thead', null, h('tr', null, h('th', { class: 'num' }, '#'), h('th', null, 'Hoca'), h('th', null, S.view === 'act' ? 'Kulüp' : 'Son kulüp'), h('th', { class: 'num' }, 'Maç'), h('th', { class: 'num' }, 'G-B-M'), h('th', { class: 'num' }, 'Puan/maç'), h('th', { class: 'num' }, 'Beklenen'), h('th', { class: 'num' }, 'Hoca puanı'))),
      h('tbody', null, list.map((x, k) => h('tr', null,
        h('td', { class: 'num dim' }, k + 1),
        h('td', null, h('b', null, x.n), x.now ? null : h('span', { class: 'dim', style: 'margin-left:6px;font-size:12.5px' }, `son maç ${x.i.last.slice(0, 4)}`)),
        h('td', null, x.club && ctx.clubs[x.club] ? h('a', { class: 'who', href: `#/takim/${x.club}` }, crestFor(ctx, x.club, 'sm'), ctx.clubName(x.club)) : h('span', { class: 'dim' }, '—')),
        h('td', { class: 'num' }, x.i.g), h('td', { class: 'num' }, `${x.i.w}-${x.i.d}-${x.i.l}`), h('td', { class: 'num' }, x.i.ppg.toFixed(2)), h('td', { class: 'num dim' }, x.i.xppg?.toFixed(2) ?? '—'),
        h('td', { class: 'num' }, eloChip(x.i.elo, { label: '' })))))),
    ), { tight: true }) : h('div', { class: 'empty' }, h('h3', null, 'Hoca bulunamadı'), h('div', null, 'Aramayı ya da “en az maç” filtresini gevşet.')));
  }
  const search = h('input', { type: 'search', placeholder: 'Hoca ara… (ör. Guardiola)', style: 'width:min(320px,100%)', 'aria-label': 'Hoca ara', oninput: debounce(e => { S.q = e.target.value; draw(); }, 100) });
  const minSel = h('select', { 'aria-label': 'En az maç', onchange: e => { S.min = +e.target.value; draw(); } }, [12, 50, 100, 200, 400].map(v => h('option', { value: v, selected: v === S.min }, `${v}+ maç`)));
  mount(app, pageHead('Teknik direktörler', 'Hoca geçmişi ve “hoca puanı”: aynı kadro değerindeki takımlardan beklenenin ne kadar üstünde puan topladığı.'),
    h('div', { class: 'row', style: 'margin-bottom:20px;align-items:flex-end' },
      seg([['act', 'Görevdekiler'], ['all', 'Tüm hocalar']], S.view, v => { S.view = v; draw(); }, 'mk'),
      field('Sırala', seg([['elo', 'Hoca puanı'], ['ppg', 'Puan/maç'], ['g', 'Maç']], S.sort, v => { S.sort = v; draw(); })), field('En az', minSel), field('Ara', search)),
    box,
    h('div', { class: 'dim', style: 'font-size:12.5px;margin-top:14px;max-width:80ch' }, `Hoca puanı = (gerçek − beklenen) puan/maç farkının Elo karşılığı (1 puan/maç ≈ 240 Elo); az maçlı hocalar ortalamaya çekilir, ±70 ile sınırlıdır. Beklenen puan kadro piyasa değerinden hesaplandığı için pahalı kadro tek başına puan kazandırmaz; ama değer, oyun kalitesinin kusurlu bir göstergesidir (özellikle küçük liglerde), bu yüzden puan kaba bir ölçüdür. Simülasyona bunun %${dampPct}’i yansır. Veri: Transfermarkt (2006+), güncel görevler Wikidata (${M.asOf || '—'}).`));
  draw();
}
