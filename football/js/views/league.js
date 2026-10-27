// Lig & Sezon: tablo, fikstür, sonuç düzenleme, etki raporu, domino (Monte Carlo) ve çok sezonlu yansıma.
import { h, mount, toast, fmtDay, fmtDate, seasonLabel, fmtMoney, fmtPct, setCrumbs, go, crest, esc } from '../util.js';
import { boot, teamLink, crestFor, delta, moneyDelta, formStrip, select, field, seg, sheet, pageHead, emptyState } from '../ui.js';
import { loadMatches, loadElo, loadUpcoming, CURRENT_SEASON } from '../data.js';
import { computeTable, applyEdits, simulateSeason, probIn, leagueTotal, replayElo, rng, poissonInv, lambdas, eloUpdate } from '../engine.js';
import { defaultSlots, positionOutcome, TIER_COLOR, TIER_SHORT, TIER_LABEL } from '../rules.js';
import * as store from '../store.js';

const LAST_PREF = 'lastLeague';

export async function render(app, compArg, seasonArg) {
  const ctx = await boot();
  const leagues = Object.values(ctx.comps).filter(c => c.type === 'league' && ctx.idx[c.id]);
  const lastPref = store.pref(LAST_PREF, { comp: 'TR1', season: 2025 });
  let comp = compArg && ctx.comps[compArg] ? compArg : lastPref.comp;
  const seasons = c => Object.keys(ctx.idx[c] || {}).map(Number).sort((a, b) => b - a);
  let season = seasonArg ? +seasonArg : (seasons(comp).includes(lastPref.season) ? lastPref.season : seasons(comp)[0]);
  if (!seasons(comp).includes(season)) season = seasons(comp)[0];
  store.setPref(LAST_PREF, { comp, season });

  const meta = ctx.comps[comp];
  const isLeague = meta.type === 'league';
  setCrumbs('Lig & Sezon', `${meta.name} ${seasonLabel(season)}`);

  const played = await loadMatches(comp, season);
  // devam eden sezon: oynanmamış fikstürü de ekle (tahmin ve "ya şu skor olsaydı" için)
  const upcoming = season === CURRENT_SEASON ? (await loadUpcoming()).fixtures.filter(f => f.comp === comp && f.id) : [];
  const real = played.concat(upcoming.map(f => ({ id: f.id, date: f.date, round: f.round, h: f.h, a: f.a, hg: null, ag: null })));
  const unplayed = upcoming.length;
  const eloRaw = await loadElo(season);
  const startElo = new Map(Object.entries(eloRaw || {}).map(([k, v]) => [+k, v]));
  const nClubs = new Set(real.flatMap(m => [m.h, m.a])).size;
  const scoreTxt = (a, b) => (a == null ? '– : –' : `${a} - ${b}`);

  const S = {
    view: 'alt', round: null, editing: null, sim: null, proj: null,
    slots: store.pref(`slots.${comp}.${season}`, null) || defaultSlots(comp, season, nClubs),
  };
  const names = Object.fromEntries([...new Set(real.flatMap(m => [m.h, m.a]))].map(id => [id, ctx.clubName(id)]));
  const rounds = [];
  for (const m of real) { if (!rounds.includes(m.round)) rounds.push(m.round); }

  // ------------------------------------------------------------ üst başlık
  const compSel = select(
    groupBy(leagues, c => c.country).map(([country, items]) => ({ group: country, items: items.map(c => [c.id, c.name + (items.filter(x => x.name === c.name).length > 1 ? ` (${c.country})` : '')]) })),
    comp, v => go(`/lig/${v}`));
  const seaSel = select(seasons(comp).map(s => [s, seasonLabel(s)]), season, v => go(`/lig/${comp}/${v}`));
  const head = pageHead(`${meta.name}`, `${meta.country} · ${seasonLabel(season)} · Bir maçın skoruna tıkla ve değiştir; tablo, şampiyon, Avrupa ve küme düşme anında güncellenir.`,
    field('Lig', compSel), field('Sezon', seaSel), h('a', { class: 'btn', style: 'align-self:flex-end', href: '#/kupa' }, 'Kupalar'));

  if (!isLeague || !real.length) {
    mount(app, head, emptyState('Bu yarışma için puan tablosu yok', 'Bu sürümde what-if düzenleme yalnızca lig sezonlarında çalışır.'));
    return;
  }

  const tableBox = h('div'), fixBox = h('div'), impactBox = h('div'), forecastBox = h('div');
  const rulesBox = h('div');
  mount(app, head,
    h('div', { class: 'grid cols-2' },
      h('div', { class: 'grid', style: 'align-content:start' }, fixBox, tableBox),
      h('div', { class: 'grid', style: 'align-content:start' }, impactBox, forecastBox, rulesBox)));

  // ------------------------------------------------------------ hesaplar
  const current = () => {
    const edits = store.resultEdits(comp, season);
    const alt = applyEdits(real, edits);
    const realT = computeTable(real, { comp, names });
    const altT = edits.size ? computeTable(alt, { comp, names }) : realT;
    return { edits, alt, realT, altT };
  };
  const outcome = pos => positionOutcome(comp, pos, nClubs, S.slots);

  // ------------------------------------------------------------ tablo
  function drawTable() {
    const { edits, realT, altT } = current();
    const rows = S.view === 'alt' ? altT : realT;
    const realPos = new Map(realT.map(r => [r.id, r]));
    const hasEdits = edits.size > 0;
    const tb = h('table', { class: 'tbl' },
      h('thead', null, h('tr', null, h('th'), h('th', { class: 'num' }, '#'), h('th', null, 'Takım'), ...['O', 'G', 'B', 'M', 'AG', 'YG', 'Av', 'P'].map(t => h('th', { class: 'num' }, t)), h('th', null, 'Form'), hasEdits ? h('th', { class: 'num', title: 'Gerçek sıra / puan farkı' }, 'Δ') : null)),
      h('tbody', null, rows.map(r => {
        const o = outcome(r.pos), rr = realPos.get(r.id);
        const moved = hasEdits && rr && (rr.pos !== r.pos || rr.pts !== r.pts);
        return h('tr', { class: moved && S.view === 'alt' ? 'chg' : '' },
          h('td', { class: 'band' }, h('i', { style: `background:${TIER_COLOR[o.tier]}`, title: TIER_LABEL[o.tier] })),
          h('td', { class: 'num' }, r.pos),
          h('td', null, teamLink(ctx, r.id, season)),
          h('td', { class: 'num' }, r.p), h('td', { class: 'num' }, r.w), h('td', { class: 'num' }, r.d), h('td', { class: 'num' }, r.l),
          h('td', { class: 'num' }, r.gf), h('td', { class: 'num' }, r.ga), h('td', { class: 'num' }, (r.gd > 0 ? '+' : '') + r.gd),
          h('td', { class: 'num pts' }, r.pts),
          h('td', null, formStrip(r.form)),
          hasEdits ? h('td', { class: 'num' }, S.view === 'alt' && rr && rr.pos !== r.pos ? h('span', null, delta(rr.pos - r.pos), ' ', h('span', { class: 'dim' }, `${rr.pos}→${r.pos}`)) : '') : null);
      })));
    const legend = h('div', { class: 'legend', style: 'padding:10px 14px' },
      ...['promo', 'ucl', 'el', 'uecl', 'rel'].filter(t => S.slots[t === 'rel' ? 'rel' : t] > 0).map(t => h('span', null, h('i', { style: `background:${TIER_COLOR[t]}` }), TIER_LABEL[t])),
      h('span', { class: 'dim' }, 'Kontenjanlar tahminidir; sağdaki “Kurallar” bölümünden düzenleyebilirsin.'));
    const viewSeg = hasEdits ? seg([['alt', 'Alternatif'], ['real', 'Gerçek']], S.view, v => { S.view = v; drawTable(); }, 'mk') : null;
    mount(tableBox, sheet(h('h2', null, 'Puan durumu'), h('div', { style: 'overflow:auto' }, tb, legend), { tight: true, actions: [viewSeg] }));
  }

  // ------------------------------------------------------------ fikstür
  function drawFixtures() {
    const { edits, alt } = current();
    if (S.round == null) {
      const firstEdit = real.find(m => edits.has(m.id));
      S.round = firstEdit ? firstEdit.round : rounds[Math.max(0, Math.floor(rounds.length / 2))];
    }
    const roundSel = select(rounds.map(r => [r, roundLabel(r)]), S.round, v => { S.round = v; S.editing = null; drawFixtures(); });
    const idx = rounds.indexOf(S.round);
    const step = d => () => { S.round = rounds[Math.max(0, Math.min(rounds.length - 1, idx + d))]; S.editing = null; drawFixtures(); };
    const list = alt.filter(m => m.round === S.round);
    const pending = alt.some(m => m.hg == null);
    const toolbar = pending ? h('div', { class: 'row center', style: 'padding:12px 20px;border-bottom:1px solid var(--line);gap:10px' },
      h('button', { class: 'btn sm mk', onclick: () => simulatePending(false) }, 'Bu haftayı simüle et'), h('button', { class: 'btn sm', onclick: () => simulatePending(true) }, 'Sezonun kalanını simüle et'),
      h('span', { class: 'dim', style: 'font-size:13.5px' }, 'Oynanmamış maçların skorunu takım gücüne göre üretir; istediğin skoru sonra değiştirebilirsin.')) : null;
    mount(fixBox, sheet(h('h2', null, '1. Bir maç seç'),
      h('div', null, toolbar, ...list.map(m => fixtureRow(m))), {
        tight: true,
        actions: [h('button', { class: 'btn sm ghost', onclick: step(-1), disabled: idx <= 0, 'aria-label': 'Önceki hafta' }, '‹'), roundSel, h('button', { class: 'btn sm ghost', onclick: step(1), disabled: idx >= rounds.length - 1, 'aria-label': 'Sonraki hafta' }, '›')],
      }));
  }

  function fixtureRow(m) {
    const edited = !!m.edited;
    const editing = S.editing === m.id;
    let mid;
    if (editing) {
      const ih = h('input', { type: 'number', min: 0, max: 20, value: m.hg ?? '', 'aria-label': `${names[m.h]} golleri` });
      const ia = h('input', { type: 'number', min: 0, max: 20, value: m.ag ?? '', 'aria-label': `${names[m.a]} golleri` });
      const commit = () => commitEdit(m, +ih.value, +ia.value);
      for (const el of [ih, ia]) el.addEventListener('keydown', e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { S.editing = null; drawFixtures(); } });
      mid = h('span', { class: 'scoreedit' }, ih, '-', ia);
      queueMicrotask(() => { ih.focus(); ih.select(); });
      const tools = h('div', { style: 'grid-column:1/-1;display:flex;gap:6px;justify-content:flex-end;padding:2px 0 4px;flex-wrap:wrap' },
        h('button', { class: 'btn sm', onclick: () => commitEdit(m, 1, 0) }, `${short(names[m.h])} kazansın`),
        h('button', { class: 'btn sm', onclick: () => commitEdit(m, 1, 1) }, 'Beraberlik'),
        h('button', { class: 'btn sm', onclick: () => commitEdit(m, 0, 1) }, `${short(names[m.a])} kazansın`),
        h('button', { class: 'btn sm mk', onclick: commit }, 'Uygula'),
        edited ? h('button', { class: 'btn sm', onclick: () => { store.removeEdit(e => e.t === 'result' && e.id === m.id); S.editing = null; S.sim = S.proj = null; refresh(); } }, 'Gerçeğe döndür') : null,
        h('button', { class: 'btn sm ghost', onclick: () => { S.editing = null; drawFixtures(); } }, 'Vazgeç'));
      return h('div', null, h('div', { class: `fx ${edited ? 'chg' : ''}` }, h('span', { class: 'd' }, fmtDay(m.date)), h('span', { class: 'h' }, h('span', { class: 'n' }, names[m.h]), crestFor(ctx, m.h)), h('span', { class: 'sc' }, mid), h('span', { class: 'a' }, crestFor(ctx, m.a), h('span', { class: 'n' }, names[m.a])), h('span')), tools);
    }
    return h('div', { class: `fx ${edited ? 'chg' : ''} ${m.hg == null ? 'up' : ''}` },
      h('span', { class: 'd' }, fmtDay(m.date)),
      h('span', { class: 'h' }, h('a', { class: 'n', href: `#/takim/${m.h}/${season}`, style: 'text-decoration:none' }, names[m.h]), crestFor(ctx, m.h)),
      h('span', { class: 'sc' }, h('button', { class: 'score', title: 'Skoru değiştir', onclick: () => { S.editing = m.id; drawFixtures(); } }, scoreTxt(m.hg, m.ag))),
      h('span', { class: 'a' }, crestFor(ctx, m.a), h('a', { class: 'n', href: `#/takim/${m.a}/${season}`, style: 'text-decoration:none' }, names[m.a])),
      edited ? h('span', { class: 'chip mk', title: m.real[0] == null ? 'Senin tahminin' : `Gerçek skor: ${m.real[0]}-${m.real[1]}` }, m.real[0] == null ? 'tahmin' : `${m.real[0]}-${m.real[1]}`) : h('span'));
  }

  /** Devam eden sezonda oynanmamış maçları takım güçlerine göre oynatır (hafta ya da sezonun kalanı). */
  function simulatePending(all) {
    const { alt } = current();
    const pend = alt.filter(m => m.hg == null).sort((a, c) => a.date.localeCompare(c.date) || a.id - c.id);
    if (!pend.length) return;
    const target = all ? null : pend[0].round;
    const todo = all ? pend : pend.filter(m => m.round === target);
    const ratings = replayElo(alt.filter(m => m.hg != null), startElo);
    const rt = id => ratings.get(id) ?? startElo.get(id) ?? 1450;
    const r = rng((Date.now() & 0xffffff) + todo.length), total = leagueTotal(alt);
    const out = [];
    for (const m of todo) {
      const [lh, la] = lambdas(rt(m.h), rt(m.a), total);
      const hg = poissonInv(lh, r()), ag = poissonInv(la, r());
      const d = eloUpdate(rt(m.h), rt(m.a), hg, ag); ratings.set(m.h, rt(m.h) + d); ratings.set(m.a, rt(m.a) - d);
      out.push({ t: 'result', comp, season, id: m.id, hg, ag, real: [null, null], label: `Simüle: ${names[m.h]} ${hg}-${ag} ${names[m.a]}` });
    }
    store.addEdits(out);
    S.round = todo[0].round; toast(`${out.length} maç simüle edildi`); refresh();
  }

  function commitEdit(m, hg, ag) {
    if (!Number.isInteger(hg) || !Number.isInteger(ag) || hg < 0 || ag < 0) { toast('Geçerli bir skor gir'); return; }
    const realM = real.find(x => x.id === m.id);
    if (realM.hg != null && hg === realM.hg && ag === realM.ag) store.removeEdit(e => e.t === 'result' && e.id === m.id);
    else store.addEdit({ t: 'result', comp, season, id: m.id, hg, ag, real: [realM.hg, realM.ag], label: `${names[m.h]} ${hg}-${ag} ${names[m.a]} (${fmtDate(m.date)})` });
    S.editing = null; S.sim = S.proj = null; refresh();
  }

  // ------------------------------------------------------------ etki raporu
  function drawImpact() {
    const { edits, realT, altT } = current();
    if (!edits.size) {
      mount(impactBox, sheet(h('h2', null, 'Ne değişti?'), h('div', { class: 'empty', style: 'padding:22px' },
        h('h3', null, 'Henüz bir şey değiştirmedin'),
        h('div', null, 'Soldaki maç listesinden bir skora tıkla. Burada tablonun nasıl değiştiğini, hangi takımın kazanıp kaybettiğini göreceksin.'),
        h('div', { class: 'row', style: 'justify-content:center' }, h('button', { class: 'btn', onclick: () => biggestDerby() }, 'Örnek: en yüksek skorlu maçı 0-0 yap')))));
      return;
    }
    const rp = new Map(realT.map(r => [r.id, r]));
    const diffs = altT.map(a => {
      const r = rp.get(a.id), oa = outcome(a.pos), orr = outcome(r.pos);
      return { id: a.id, rp: r.pos, ap: a.pos, dp: a.pts - r.pts, tierR: orr.tier, tierA: oa.tier, rev: oa.revenue - orr.revenue };
    }).filter(d => d.rp !== d.ap || d.dp !== 0 || d.tierR !== d.tierA);
    diffs.sort((a, b) => Math.abs(b.rev) - Math.abs(a.rev) || Math.abs(b.rp - b.ap) - Math.abs(a.rp - a.ap));
    const tierChanges = diffs.filter(d => d.tierR !== d.tierA);
    const champR = realT[0], champA = altT[0];

    const editList = h('ul', { class: 'list-plain', style: 'margin:calc(var(--pad) * -1) calc(var(--pad) * -1) 12px' }, ...[...edits.entries()].map(([id, e]) => {
      const m = real.find(x => x.id === id);
      return h('li', null, h('span', { class: 'chip mk' }, `${m.hg == null ? 'tahmin' : m.hg + '-' + m.ag} → ${e.hg}-${e.ag}`), h('span', { style: 'flex:1' }, `${names[m.h]} – ${names[m.a]}`, h('span', { class: 'dim' }, `  ${fmtDay(m.date)}`)),
        h('button', { class: 'btn sm ghost', onclick: () => { store.removeEdit(x => x.t === 'result' && x.id === id); S.sim = S.proj = null; refresh(); } }, 'Kaldır'));
    }));

    const headline = h('div', { class: 'grid', style: 'grid-template-columns:repeat(3,1fr);margin-bottom:12px' },
      kpi('Şampiyon', champA.id === champR.id ? names[champA.id] : `${names[champA.id]}`, champA.id === champR.id ? 'değişmedi' : `gerçek: ${names[champR.id]}`, champA.id !== champR.id),
      kpi('Kontenjan değişimi', tierChanges.length ? `${tierChanges.length} takım` : 'yok', tierChanges.length ? 'aşağıda' : '', tierChanges.length > 0),
      kpi('Tahmini gelir etkisi', fmtMoney(Math.max(...diffs.map(d => Math.abs(d.rev)), 0)), 'en çok etkilenen takım', false));

    const tbl = h('table', { class: 'tbl' },
      h('thead', null, h('tr', null, h('th', null, 'Takım'), h('th', { class: 'num' }, 'Sıra'), h('th', { class: 'num' }, 'Puan'), h('th', null, 'Kontenjan'), h('th', { class: 'num' }, 'Tahmini gelir'))),
      h('tbody', null, diffs.slice(0, 14).map(d => h('tr', null,
        h('td', null, teamLink(ctx, d.id, season)),
        h('td', { class: 'num' }, h('span', { class: 'dim' }, d.rp + '→'), d.ap, ' ', delta(d.rp - d.ap)),
        h('td', { class: 'num' }, delta(d.dp)),
        h('td', null, d.tierR === d.tierA ? h('span', { class: 'dim' }, TIER_SHORT[d.tierA] || '—') : h('span', null, tierChip(d.tierR), ' → ', tierChip(d.tierA))),
        h('td', { class: 'num' }, moneyDelta(d.rev))))));

    const dominoBtn = h('button', { class: 'btn mk', onclick: runDomino }, 'Sonraki maçlara etkisini hesapla');
    const projBtn = h('button', { class: 'btn', onclick: runProject, disabled: !S.sim }, 'Sonraki 4 sezona etkisi');
    mount(impactBox, sheet(h('h2', null, 'Ne değişti?'),
      h('div', null, editList, headline, diffs.length ? h('div', { style: 'overflow:auto;margin:0 calc(var(--pad) * -1)' }, tbl) : h('div', { class: 'note' }, 'Bu değişiklik tabloyu etkilemedi.'),
        h('div', { class: 'note', style: 'margin-top:12px' }, 'Şu an değiştirdiğin maçtan sonraki sonuçlar gerçekte oynandığı gibi kalıyor. “Sonraki maçlara etkisini hesapla” ise o maçtan sonrasını, değişen takım güçleriyle 2000 kez yeniden oynatıp olasılıkları gösterir.'),
        h('div', { class: 'row center', style: 'margin-top:12px' }, dominoBtn, projBtn),
        S.sim ? dominoView() : null,
        S.proj ? projectView() : null),
      { actions: [h('a', { class: 'btn sm ghost', href: '#/senaryolar' }, 'Senaryoyu aç')] }));
  }

  const kpi = (l, v, sub, mk) => h('div', { class: 'kpi' }, h('div', { class: 'l' }, l), h('div', { class: 'v', style: mk ? 'color:var(--marker)' : '' }, v), h('div', { class: 'dim', style: 'font-size:12px' }, sub));
  const tierChip = t => h('span', { class: `chip ${t === 'none' ? '' : t}` }, TIER_SHORT[t] || '—');

  function biggestDerby() {
    const m = [...played].sort((a, b) => (b.hg + b.ag) - (a.hg + a.ag))[0];
    S.round = m.round; commitEdit(m, 0, 0);
  }

  // ------------------------------------------------------------ domino (Monte Carlo)
  async function runDomino(ev) {
    const btn = ev.currentTarget; btn.classList.add('busy'); btn.textContent = 'Hesaplanıyor…';
    await new Promise(r => setTimeout(r, 30));
    const { edits } = current();
    const t0 = real.filter(m => edits.has(m.id)).map(m => m.date).sort()[0];
    const ovAlt = new Map([...edits].map(([id, e]) => [id, [e.hg, e.ag]]));
    const ovBase = new Map([...edits.keys()].map(id => real.find(x => x.id === id)).filter(m => m.hg != null).map(m => [m.id, [m.hg, m.ag]]));
    const n = 2000, seed = 7;
    const base = simulateSeason({ matches: real, startElo, t0, override: ovBase, n, seed });
    const alt = simulateSeason({ matches: real, startElo, t0, override: ovAlt, n, seed });
    S.sim = { base, alt, t0, n };
    refresh();
  }
  function expectedRevenue(posProb) { let s = 0; posProb.forEach((p, i) => { s += p * outcome(i + 1).revenue; }); return s; }
  function dominoView() {
    const { base, alt, n } = S.sim;
    const rows = [...alt.teams.values()].map(a => {
      const b = base.teams.get(a.id), s = S.slots;
      return {
        id: a.id, dPts: a.expPts - b.expPts, ePts: a.expPts, dPos: b.expPos - a.expPos,
        title: [probIn(b.posProb, 1, 1), probIn(a.posProb, 1, 1)],
        ucl: [probIn(b.posProb, 1, s.promo || s.ucl), probIn(a.posProb, 1, s.promo || s.ucl)],
        rel: [probIn(b.posProb, nClubs - s.rel + 1, nClubs), probIn(a.posProb, nClubs - s.rel + 1, nClubs)],
        rev: expectedRevenue(a.posProb) - expectedRevenue(b.posProb),
      };
    }).sort((a, b) => Math.abs(b.dPts) - Math.abs(a.dPts)).slice(0, 10);
    return h('div', { style: 'margin-top:16px' },
      h('div', { class: 'cap', style: 'margin-bottom:6px' }, `Sonraki maçlara etkisi · ${fmtDate(S.sim.t0)} sonrası ${n} kez yeniden oynandı`),
      h('div', { style: 'overflow:auto;margin:0 calc(var(--pad) * -1)' }, h('table', { class: 'tbl' },
        h('thead', null, h('tr', null, h('th', null, 'Takım'), h('th', { class: 'num' }, 'Δ puan'), h('th', { class: 'num' }, 'Şampiyonluk'), h('th', { class: 'num' }, S.slots.promo ? 'Yükselme' : 'Şampiyonlar Ligi'), h('th', { class: 'num' }, 'Küme düşme'), h('th', { class: 'num' }, 'Beklenen gelir'))),
        h('tbody', null, rows.map(r => h('tr', null, h('td', null, teamLink(ctx, r.id, season)), h('td', { class: 'num' }, delta(r.dPts, { digits: 1 })),
          h('td', { class: 'num' }, pp(r.title)), h('td', { class: 'num' }, pp(r.ucl)), h('td', { class: 'num' }, pp(r.rel)), h('td', { class: 'num' }, moneyDelta(r.rev))))))),
      h('div', { class: 'dim', style: 'font-size:12px;margin-top:6px' }, 'Her hücre: gerçek → alternatif olasılık. Aynı rastgele sayılarla karşılaştırıldığı için fark yalnızca senin değişikliğinden gelir.'));
  }
  const pp = ([b, a]) => h('span', null, h('span', { class: 'dim' }, fmtPct(b) + ' → '), h('span', { style: a > b + .005 ? 'color:var(--win)' : a < b - .005 ? 'color:var(--loss)' : '' }, fmtPct(a)));

  // ------------------------------------------------------------ çok sezonlu yansıma
  async function runProject(ev) {
    const btn = ev.currentTarget; btn.classList.add('busy'); btn.textContent = 'Hesaplanıyor…';
    await new Promise(r => setTimeout(r, 30));
    const { base, alt } = S.sim;
    const delta0 = new Map();
    for (const [id, a] of alt.teams) delta0.set(id, a.endRating - base.teams.get(id).endRating);
    const all = seasons(comp).sort((a, b) => a - b);
    const out = [];
    for (let k = 1; k <= 4; k++) {
      const s = season + k;
      let ms = all.includes(s) ? await loadMatches(comp, s) : null, projected = false;
      if (!ms || !ms.length) { ms = await loadMatches(comp, all[all.length - 1]); projected = true; }
      const elo = await loadElo(all.includes(s) ? s : all[all.length - 1] + 1) || await loadElo(all[all.length - 1]);
      const e = new Map(Object.entries(elo || {}).map(([a, b]) => [+a, b]));
      const dk = new Map([...delta0].map(([id, v]) => [id, v * Math.pow(0.55, k)]));
      const b = simulateSeason({ matches: ms, startElo: e, n: 1200, seed: 11 + k });
      const a = simulateSeason({ matches: ms, startElo: e, ratingDelta: dk, n: 1200, seed: 11 + k });
      const clubs = new Set(ms.flatMap(m => [m.h, m.a]));
      const slots = defaultSlots(comp, s, clubs.size);
      const rows = [];
      for (const [id, v] of delta0) if (clubs.has(id) && Math.abs(v) > 2) {
        const A = a.teams.get(id), B = b.teams.get(id);
        rows.push({ id, dPts: A.expPts - B.expPts, title: [probIn(B.posProb, 1, 1), probIn(A.posProb, 1, 1)], ucl: [probIn(B.posProb, 1, slots.promo || slots.ucl), probIn(A.posProb, 1, slots.promo || slots.ucl)] });
      }
      out.push({ season: s, projected, rows });
    }
    S.proj = { delta0, out };
    refresh();
  }
  function projectView() {
    const { out, delta0 } = S.proj;
    const ids = [...delta0].filter(([, v]) => Math.abs(v) > 2).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 6).map(x => x[0]);
    return h('div', { style: 'margin-top:16px' },
      h('div', { class: 'cap', style: 'margin-bottom:6px' }, 'Sonraki 4 sezona etkisi · her yıl etkinin yaklaşık yarısı sönüyor'),
      h('div', { style: 'overflow:auto;margin:0 calc(var(--pad) * -1)' }, h('table', { class: 'tbl' },
        h('thead', null, h('tr', null, h('th', null, 'Takım'), ...out.map(o => h('th', { class: 'num' }, seasonLabel(o.season) + (o.projected ? '*' : ''))))),
        h('tbody', null, ids.map(id => h('tr', null, h('td', null, teamLink(ctx, id, season)),
          ...out.map(o => { const r = o.rows.find(x => x.id === id); return h('td', { class: 'num' }, r ? h('span', null, delta(r.dPts, { digits: 1 }), ' ', h('span', { class: 'dim' }, 'puan'), h('br'), h('span', { class: 'dim', style: 'font-size:11.5px' }, 'şamp. ' + fmtPct(r.title[1]))) : '—'); })))))),
      h('div', { class: 'dim', style: 'font-size:12px;margin-top:6px' }, '* Veri bitti: önceki sezonun fikstürü şablon alındı (tahmin). Kadro/transfer değişiklikleri bu hesaba dahil değil.'));
  }

  // ------------------------------------------------------------ kurallar
  function drawRules() {
    const num = k => h('input', { type: 'number', min: 0, max: 10, value: S.slots[k], style: 'width:64px', 'aria-label': k, onchange: e => { S.slots[k] = Math.max(0, Math.min(10, +e.target.value || 0)); store.setPref(`slots.${comp}.${season}`, { ...S.slots }); refresh(); } });
    mount(rulesBox, sheet(h('h2', null, 'Ayarlar: Avrupa ve küme kontenjanı'), h('div', null,
      h('div', { class: 'row' }, S.slots.promo != null ? field('Yükselme', num('promo')) : [field('Şampiyonlar Ligi', num('ucl')), field('Avrupa Ligi', num('el')), field('Konferans', num('uecl'))], field('Küme düşme', num('rel'))),
      S.slots.note ? h('div', { class: 'dim', style: 'margin-top:8px;font-size:12.5px' }, S.slots.note) : null,
      h('div', { class: 'note', style: 'margin-top:10px' }, 'Kontenjanlar sezona göre varsayılandır; kupa şampiyonlarının devri, elemeler ve sezon içi lig formatı (play-off turları) hesaba katılmaz. Gelir tahminleri Avrupa ve yayın gelirlerinin kaba ortalamasıdır.'))));
  }

  // ------------------------------------------------------------ sezon sonu tahmini (devam eden sezon)
  function drawForecast(f) {
    if (!unplayed) return;
    const run = async ev => {
      const btn = ev.currentTarget; btn.classList.add('busy'); btn.textContent = 'Hesaplanıyor…';
      await new Promise(r => setTimeout(r, 30));
      const { alt, altT } = current();
      const sim = simulateSeason({ matches: alt, startElo, t0: '9999', n: 3000, seed: 3 });
      S.forecast = { sim, altT };
      drawForecast();
    };
    if (!S.forecast) { mount(forecastBox, sheet(h('h2', null, 'Sezon sonu tahmini'), h('div', { class: 'row center' }, h('button', { class: 'btn mk', onclick: run }, 'Kalan maçları simüle et'), h('span', { class: 'dim' }, `${unplayed} maç kaldı · 3000 sezon`)))); return; }
    const { sim, altT } = S.forecast, s = S.slots, pts = new Map(altT.map(r => [r.id, r]));
    const rows = [...sim.teams.values()].sort((a, b) => a.expPos - b.expPos);
    mount(forecastBox, sheet(h('h2', null, 'Sezon sonu tahmini'), h('div', { style: 'overflow:auto;margin:calc(var(--pad) * -1)' }, h('table', { class: 'tbl' },
      h('thead', null, h('tr', null, h('th', null, 'Takım'), h('th', { class: 'num' }, 'Puan'), h('th', { class: 'num' }, 'Tah. puan'), h('th', { class: 'num' }, 'Tah. sıra'), h('th', { class: 'num' }, 'Şampiyonluk'), h('th', { class: 'num' }, S.slots.promo ? 'Yükselme' : 'Avrupa'), h('th', { class: 'num' }, 'Küme düşme'))),
      h('tbody', null, rows.map(t => h('tr', null, h('td', null, teamLink(ctx, t.id, season)), h('td', { class: 'num dim' }, pts.get(t.id)?.pts ?? 0), h('td', { class: 'num' }, t.expPts.toFixed(1)), h('td', { class: 'num' }, t.expPos.toFixed(1)),
        h('td', { class: 'num' }, fmtPct(probIn(t.posProb, 1, 1))), h('td', { class: 'num' }, fmtPct(probIn(t.posProb, 1, s.promo || s.ucl + s.el + s.uecl))), h('td', { class: 'num' }, fmtPct(probIn(t.posProb, nClubs - s.rel + 1, nClubs)))))))),
      { actions: [h('button', { class: 'btn sm', onclick: () => { S.forecast = null; drawForecast(); } }, 'Sıfırla')] }));
  }

  function refresh() { S.forecast = null; drawTable(); drawFixtures(); drawImpact(); drawRules(); drawForecast(); }
  refresh();
}

function groupBy(list, f) { const m = new Map(); for (const x of list) { const k = f(x); (m.get(k) || m.set(k, []).get(k)).push(x); } return [...m]; }
const short = n => (n || '').replace(/\b(FC|AFC|SK|FK|CF|Futbol Kulübü|Spor Kulübü)\b/g, '').trim().split(' ').slice(0, 2).join(' ');
function roundLabel(r) { const m = String(r).match(/^(\d+)\.\s*Matchday/i); return m ? `${m[1]}. Hafta` : r || '—'; }
