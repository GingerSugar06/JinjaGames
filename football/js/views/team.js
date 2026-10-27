// Takım sayfası: kadro, maçlar, transferler ve güç (Elo) geçmişi.
import { h, mount, toast, norm, setCrumbs, crest, barChart, fmtMoney, fmtDate, fmtDay, seasonLabel, lineChart, ageOn, go } from '../util.js';
import { boot, select, sheet, pageHead, delta, formStrip, POS_LONG, crestFor, avatar } from '../ui.js';
import { loadMatches, loadSquads, loadTransfers, loadPlayers, loadElo, loadCurrent, loadManagers, mgrInfo, mgrDelta, LAST_SEASON } from '../data.js';
import { eloChip, eloText, pickManager, seasonManager, isCaretaker, dampPct } from '../mgr.js';
import { turningPoints, planTarget, TARGETS } from '../workshop.js';
import { defaultSlots, positionOutcome, TIER_LABEL } from '../rules.js';
import { computeTable, simulateSeason, probIn } from '../engine.js';
import * as store from '../store.js';

export async function render(app, idArg, seasonArg) {
  const ctx = await boot();
  const [P, M] = await Promise.all([loadPlayers(), loadManagers()]);
  const id = +idArg;
  const club = ctx.clubs[id];
  const name = ctx.clubName(id);
  const compId = club?.c;
  // bu kulübün bulunduğu sezonlar (ana lig verisinden)
  const leagueSeasons = compId ? Object.keys(ctx.idx[compId] || {}).map(Number) : [];
  let season = seasonArg ? +seasonArg : LAST_SEASON;
  const dflt = compId && ctx.idx[compId]?.[2026] ? 2026 : LAST_SEASON;   // güncel sezon verisi varsa varsayılan o
  setCrumbs('Takımlar', name);

  const mcur = M.c[id]?.cur, mstale = mcur?.src === 'maç' && (M.c[id].hist.at(-1)?.[2] ?? '') < '2026-03-01';   // veri setindeki son maçı eskiyse bu "güncel" hoca değildir
  const head = pageHead(name, `${compId ? ctx.compFull(compId) : ''}${club?.st ? ' · ' + club.st : ''}${mcur?.n ? ` · ${mstale ? 'Son hoca' : 'Teknik direktör'}: ${mcur.n}` : ''}`,
    h('div', { style: 'align-self:center' }, crestFor(ctx, id, 'xl')),
    select([['now', 'Güncel'], [2026, '2026/27'], ...Array.from({ length: LAST_SEASON - 2003 + 1 }, (_, i) => LAST_SEASON - i).map(s => [s, seasonLabel(s)])], seasonArg || LAST_SEASON, v => go(`/takim/${id}/${v}`)));
  const body = h('div');
  mount(app, head, body);

  let tab = 'atolye';
  const tabs = h('div', { class: 'tabs', role: 'tablist' });
  const content = h('div');
  const TABS = [['atolye', 'Senaryo atölyesi'], ['yonetim', 'Yönetim'], ['kadro', 'Kadro'], ['mac', 'Maçlar'], ['transfer', 'Transferler'], ['finans', 'Finans'], ['guc', 'Güç geçmişi']];
  const drawTabs = () => { tabs.replaceChildren(...TABS.map(([k, l]) => h('button', { role: 'tab', 'aria-selected': String(tab === k), onclick: () => { tab = k; drawTabs(); drawTab(); } }, l))); };
  mount(body, tabs, content);

  async function drawTab() {
    content.replaceChildren(h('div', { class: 'skel', style: 'height:200px' }));
    const node = await ({ atolye: atolyeTab, yonetim: yonetimTab, finans: financeTab, kadro: squadTab, mac: matchesTab, transfer: transferTab, guc: powerTab }[tab])();
    content.replaceChildren(node);
  }


  // ------------------------------------------------------------------ senaryo atölyesi
  async function findLeague(s) {
    const first = compId && ctx.idx[compId]?.[s] ? [compId] : [];
    const country = ctx.comps[compId]?.country;
    const others = Object.values(ctx.comps).filter(c => c.type === 'league' && c.id !== compId && ctx.idx[c.id]?.[s] && (!country || c.country === country)).sort((a, b) => a.tier - b.tier).map(c => c.id);
    for (const c of [...first, ...others]) {
      const ms = await loadMatches(c, s);
      if (ms.some(m => m.h === id || m.a === id)) return { comp: c, matches: ms };
    }
    return null;
  }

  async function atolyeTab() {
    const s = seasonArg ? season : dflt;
    const L = await findLeague(s);
    if (!L) return h('div', { class: 'empty' }, h('h3', null, 'Bu sezon için lig verisi yok'), h('div', null, 'Başka bir sezon seç; 2000’den bugüne çoğu büyük ligde veri var.'));
    const { comp, matches } = L;
    const names = Object.fromEntries([...new Set(matches.flatMap(m => [m.h, m.a]))].map(x => [x, ctx.clubName(x)]));
    const n = new Set(matches.flatMap(m => [m.h, m.a])).size;
    const slots = defaultSlots(comp, s, n);
    const table = computeTable(matches, { comp, names });
    const me = table.find(r => r.id === id);
    const apply = (list) => {
      for (const f of list) store.addEdit({ t: 'result', comp, season: s, id: f.match.id, hg: f.score.hg, ag: f.score.ag, real: [f.match.hg, f.match.ag], label: `${ctx.compName(comp)} ${seasonLabel(s)}: ${ctx.clubName(f.match.h)} ${f.score.hg}-${f.score.ag} ${ctx.clubName(f.match.a)}` });
      toast(`${list.length} maç değiştirildi`); go(`/lig/${comp}/${s}`);
    };
    const mname = m => `${ctx.clubName(m.h)} – ${ctx.clubName(m.a)}`;
    const planBox = h('div'), tpBox = h('div');
    const drawPlan = key => {
      const p = planTarget({ matches, id, comp, slots, names, target: key });
      if (p.already) { mount(planBox, h('div', { class: 'note' }, `${name} zaten ${TARGETS[key].label.toLowerCase()} hedefindeydi (${me.pos}. sıra).`)); return; }
      const flips = p.edits;
      mount(planBox, h('div', { class: p.ok ? 'note mk' : 'note' },
        p.ok ? h('div', null, h('b', null, `${TARGETS[key].label} için ${flips.length} sonucu çevirmen yeterdi`), ` — sezonu ${p.final.pos}. sırada bitirirdin (${p.final.pts} puan).`)
          : h('div', null, `Yalnızca ${name} sonuçlarını değiştirerek bu hedefe ulaşmak mümkün olmadı (en iyi ${p.final.pos}. sıra). Rakiplerin sonuçlarını Lig & Sezon ekranından da değiştirebilirsin.`),
        h('ul', { class: 'list-plain', style: 'margin:8px calc(var(--pad) * -1) 0' }, flips.map(f => h('li', null, h('span', { class: 'chip' }, f.before === 'L' ? 'Mağlubiyet' : 'Beraberlik'), h('span', { style: 'flex:1' }, `${mname(f.match)} `, h('span', { class: 'dim' }, `${fmtDay(f.match.date)} · ${f.match.hg}-${f.match.ag} → ${f.score.hg}-${f.score.ag}`))))),
        h('div', { class: 'row', style: 'margin-top:10px' }, h('button', { class: 'btn mk', onclick: () => apply(flips) }, 'Senaryoyu aç ve düzenle'))));
    };
    let mode = 'up';
    const drawTp = () => {
      const t = turningPoints({ matches, id, comp, slots, names, mode });
      const top = t.flips.filter(f => f.dPos !== 0 || f.tierShift !== 0).slice(0, 6);
      mount(tpBox, top.length ? h('ul', { class: 'list-plain' }, top.map(f => h('li', null,
        h('span', { style: 'flex:1' }, h('div', null, mname(f.match)), h('div', { class: 'dim', style: 'font-size:12.5px' }, `${fmtDay(f.match.date)} · ${f.match.hg}-${f.match.ag} → ${f.score.hg}-${f.score.ag}`)),
        f.tierShift ? h('span', { class: `chip ${f.tier === 'none' ? '' : f.tier}` }, TIER_LABEL[f.tier]) : null,
        h('span', { class: `delta ${f.dPos > 0 ? 'up' : 'dn'}` }, `${f.dPos > 0 ? '+' : '−'}${Math.abs(f.dPos)} sıra`),
        h('button', { class: 'btn sm', onclick: () => apply([f]) }, 'Uygula')))) : h('div', { class: 'dim', style: 'padding:14px' }, mode === 'up' ? 'Tek bir sonucu çevirmek sıralamayı değiştirmezdi.' : 'Tek bir sonucu kötüye çevirmek sıralamayı değiştirmezdi.'));
    };
    drawTp();
    const modeSeg = h('div', { class: 'seg mk' }, ...[['up', 'Kazansaydık'], ['down', 'Kaybetseydik']].map(([k, l]) => h('button', { type: 'button', 'aria-pressed': String(mode === k), onclick: e => { mode = k; [...e.currentTarget.parentNode.children].forEach(b => b.setAttribute('aria-pressed', String(b === e.currentTarget))); drawTp(); } }, l)));
    const tier = TIER_LABEL[positionOutcome(comp, me.pos, n, slots).tier];
    return h('div', { class: 'grid cols-2' },
      h('div', { class: 'grid', style: 'align-content:start' },
        sheet(h('h2', null, `${seasonLabel(s)} · ${ctx.compName(comp)}`), h('div', { class: 'row center', style: 'gap:22px' },
          h('div', { class: 'kpi' }, h('div', { class: 'v' }, `${me.pos}.`), h('div', { class: 'l' }, 'Sıra')), h('div', { class: 'kpi' }, h('div', { class: 'v' }, me.pts), h('div', { class: 'l' }, 'Puan')),
          h('div', { class: 'kpi' }, h('div', { class: 'v' }, `${me.w}-${me.d}-${me.l}`), h('div', { class: 'l' }, 'G-B-M')), h('div', { class: 'kpi' }, h('div', { class: 'v', style: 'font-size:18px' }, tier === '—' ? 'Orta sıra' : tier), h('div', { class: 'l' }, 'Sonuç')),
          h('a', { class: 'btn', style: 'margin-left:auto', href: `#/lig/${comp}/${s}` }, 'Sezonu aç'))),
        sheet(h('h2', null, 'Hedef koy'), h('div', { class: 'grid' }, h('div', { class: 'dim' }, `Hangi hedefe ulaşmak istersin? ${name} için en az sayıda sonucu çevirerek bir plan çıkarırım.`), h('div', { class: 'row' }, ...Object.entries(TARGETS).filter(([k]) => k === 'title' || k === 'safe' || (k === 'promo' && slots.promo) || (k === 'ucl' && slots.ucl) || (k === 'euro' && slots.ucl + slots.el + slots.uecl > 0)).map(([k, t]) => h('button', { class: 'btn', onclick: () => drawPlan(k) }, t.label))), planBox))),
      sheet(h('h2', null, 'Dönüm noktaları'), tpBox, { tight: true, actions: [modeSeg] }));
  }


  // ------------------------------------------------------------------ yönetim: teknik direktör, başkan, sahip + "ya başka hoca olsaydı?"
  async function yonetimTab() {
    const mc = M.c[id] || {};
    const cur = mc.cur, ci = cur && mgrInfo(M, cur.n);
    const hist = [...(mc.hist || [])].reverse();
    const stint = hist.find(r => r[0] === cur?.n);
    const nm = norm(name), own = (mc.own || []).filter(o => { const k = norm(o); return !k.includes(nm) && !nm.includes(k); });   // "Galatasaray SK, Galatasaray’ın sahibi" gibi kendine gönderme yapanlar atılır
    const person = (label, who, extra) => h('div', { class: 'mrow' }, h('div', { class: 'cap' }, label),
      who ? h('div', { class: 'who-b' }, h('b', null, who), extra) : h('span', { class: 'dim' }, 'Veri yok'));
    const since = x => (x?.since ? h('span', { class: 'dim' }, ` ${fmtDate(x.since)}’den beri`) : null);
    const staff = sheet(h('h2', null, 'Kulüp yönetimi'), h('div', { class: 'mgmt' },
      person(mstale ? 'Son bilinen hoca' : 'Teknik direktör', cur?.n, h('span', null, since(cur), ci ? ' ' : null, ci ? eloChip(ci.elo, { label: 'hoca puanı' }) : null, stint && isCaretaker(stint[3]) ? h('span', { class: 'chip' }, 'vekil') : null)),
      person('Başkan', mc.chair?.n, since(mc.chair)),
      mc.ceo ? person('Genel müdür / CEO', mc.ceo.n, since(mc.ceo)) : null,
      person(own.length > 1 ? 'Sahipler / ortaklar' : 'Sahip', own.join(' · ')),
      person('Stadyum', club?.st, club?.se ? h('span', { class: 'dim' }, ` ${club.se.toLocaleString('tr-TR')} kişilik`) : null)),
      { actions: [h('a', { class: 'btn sm', href: '#/hocalar' }, 'Tüm hocalar')] });
    const note = h('div', { class: 'dim', style: 'font-size:12.5px' }, `Hoca geçmişi Transfermarkt maç verisinden (2006+), başkan/sahip/genel müdür Wikidata’dan alınır (${M.asOf || '—'}); topluluk verisi olduğu için eksik ya da gecikmeli olabilir. Yardımcı hocalar, sportif direktör, doktor gibi kadro dışı personel için ücretsiz ve yapılandırılmış bir kaynak yok; bu yüzden yer almıyor.`);

    const hs = hist.length ? sheet(h('h2', null, 'Teknik direktör geçmişi'), h('div', null, h('div', { style: 'overflow:auto' }, h('table', { class: 'tbl' },
      h('thead', null, h('tr', null, h('th', null, 'Hoca'), h('th', null, 'Dönem'), h('th', { class: 'num' }, 'Maç'), h('th', { class: 'num' }, 'G-B-M'), h('th', { class: 'num' }, 'Puan/maç'), h('th', { class: 'num' }, 'Hoca puanı'))),
      h('tbody', null, hist.map(r => { const i = mgrInfo(M, r[0]); return h('tr', null,
        h('td', null, h('b', null, r[0]), isCaretaker(r[3]) ? h('span', { class: 'chip', style: 'margin-left:6px' }, 'vekil') : null),
        h('td', { class: 'dim' }, `${fmtDate(r[1])} – ${cur?.n === r[0] && cur.src === 'maç' ? 'son maç ' : ''}${fmtDate(r[2])}`),
        h('td', { class: 'num' }, r[3]), h('td', { class: 'num' }, `${r[4]}-${r[5]}-${r[6]}`), h('td', { class: 'num' }, ((3 * r[4] + r[5]) / r[3]).toFixed(2)),
        h('td', { class: 'num' }, i ? eloChip(i.elo, { label: '' }) : h('span', { class: 'dim' }, '—'))); })))),
      h('div', { class: 'dim', style: 'padding:10px 14px;font-size:13px' }, 'Son 14 görev; lig ve kupa maçları birlikte sayılır. Hoca puanı kariyerinin tamamına bakar, yalnızca bu kulübe değil.')), { tight: true }) : null;

    const box = h('div');
    const draw = res => {
      if (!res) { mount(box, h('div', { class: 'dim' }, 'Bir hoca seç; seçtiğin hocanın bu takımı sezon boyunca çalıştırdığını varsayıp sezonu 1500 kez yeniden oynatırım.')); return; }
      if (res.err) { mount(box, h('div', { class: 'note' }, res.err)); return; }
      const pc = x => `${(x * 100).toFixed(x < .1 && x > 0 ? 1 : 0)}%`;
      const pp = ([b, a]) => h('span', null, h('span', { class: 'dim' }, `${pc(b)} → `), h('span', { style: a > b + .005 ? 'color:var(--win)' : a < b - .005 ? 'color:var(--loss)' : '' }, pc(a)));
      mount(box, h('div', { class: 'grid' },
        h('div', { class: 'note mk' }, h('b', null, `${res.from} yerine ${res.to}`), ` · ${seasonLabel(res.s)} · takım gücü ${eloText(Math.round(res.dElo))} Elo (hoca puanı farkının %${dampPct}’i)`),
        h('div', { class: 'row center', style: 'gap:22px' },
          h('div', { class: 'kpi' }, h('div', { class: 'v' }, `${res.pos[0].toFixed(1)} → ${res.pos[1].toFixed(1)}`), h('div', { class: 'l' }, 'Beklenen sıra')),
          h('div', { class: 'kpi' }, h('div', { class: 'v' }, delta(res.pts[1] - res.pts[0], { digits: 1 })), h('div', { class: 'l' }, 'Beklenen puan')),
          h('div', { class: 'kpi' }, h('div', { class: 'v', style: 'font-size:20px' }, pp(res.title)), h('div', { class: 'l' }, 'Şampiyonluk')),
          h('div', { class: 'kpi' }, h('div', { class: 'v', style: 'font-size:20px' }, pp(res.euro)), h('div', { class: 'l' }, res.promo ? 'Yükselme' : 'Avrupa')),
          res.rel ? h('div', { class: 'kpi' }, h('div', { class: 'v', style: 'font-size:20px' }, pp(res.rel)), h('div', { class: 'l' }, 'Küme düşme')) : null),
        h('div', { class: 'dim', style: 'font-size:12.5px' }, 'Aynı rastgele sayılarla karşılaştırıldığı için fark yalnızca hoca değişikliğinden gelir. Hocanın oyun anlayışı, kadroyla uyumu ve sezon içi görevden alınma ihtimali modelde yoktur.')));
    };
    const run = async alt => {
      const s = seasonArg ? season : dflt;
      mount(box, h('div', { class: 'skel', style: 'height:120px' }));
      const L = await findLeague(s);
      if (!L) return draw({ err: 'Bu sezon için lig verisi yok; başka bir sezon seç.' });
      const base = seasonManager(L.matches, id) || cur?.n;
      if (!base) return draw({ err: 'Bu sezon için takımın hocası bilinmiyor.' });
      const eloRaw = (await loadElo(s)) || (await loadElo(LAST_SEASON + 1)) || {};
      const startElo = new Map(Object.entries(eloRaw).map(([a, b]) => [+a, b]));
      const d = mgrDelta(M, base, alt);
      const n = 1500, a = simulateSeason({ matches: L.matches, startElo, n, seed: 7 + s }), b = simulateSeason({ matches: L.matches, startElo, ratingDelta: new Map([[id, d]]), n, seed: 7 + s });
      const A = a.teams.get(id), B = b.teams.get(id), nC = a.count, sl = defaultSlots(L.comp, s, nC);
      const top = sl.promo || sl.ucl + sl.el + sl.uecl;
      draw({ s, from: base, to: alt, dElo: d, pos: [A.expPos, B.expPos], pts: [A.expPts, B.expPts], title: [probIn(A.posProb, 1, 1), probIn(B.posProb, 1, 1)], euro: [probIn(A.posProb, 1, top), probIn(B.posProb, 1, top)], promo: !!sl.promo, rel: sl.rel > 0 ? [probIn(A.posProb, nC - sl.rel + 1, nC), probIn(B.posProb, nC - sl.rel + 1, nC)] : null });
    };
    draw(null);
    const btn = h('button', { class: 'btn mk', onclick: async () => { const alt = await pickManager(ctx, M, { title: `${name} için teknik direktör`, exclude: cur?.n }); if (alt) run(alt); } }, 'Hoca seç ve sezonu yeniden oyna');
    const what = sheet(h('h2', null, 'Ya başka hoca olsaydı?'), h('div', { class: 'grid' }, box), { actions: [btn] });
    return h('div', { class: 'grid' }, staff, note, what, hs);
  }

  // ------------------------------------------------------------------ güncel kadro (ESPN) + sakatlıklar
  async function currentSquad(cur, asOf) {
    const order = { G: 0, D: 1, M: 2, A: 3 }, names = { G: 'Kaleciler', D: 'Defans', M: 'Orta saha', A: 'Forvet' };
    const list = [...cur].sort((a, b) => order[a.l] - order[b.l] || (b.v || 0) - (a.v || 0));
    const hurt = list.filter(p => p.inj);
    const total = list.reduce((s, p) => s + (p.v || 0), 0);
    const rows = [];
    let lastLine = null;
    for (const p of list) {
      if (p.l !== lastLine) { rows.push(h('tr', null, h('td', { colspan: 9, style: 'background:var(--surface-2);font-weight:700;padding:8px 12px' }, names[p.l]))); lastLine = p.l; }
      rows.push(h('tr', null, h('td', { class: 'dim num' }, p.j || ''), h('td', null, h('div', { class: 'who' }, avatar({ name: p.n, img: P.byId.get(p.id)?.img, esp: p.e }, 'sm'), p.id ? h('a', { href: `#/oyuncu/${p.id}` }, p.n) : p.n, p.inj ? h('span', { class: `chip ${p.inj.c != null && p.inj.c > 50 ? 'mk' : 'rel'}`, title: p.inj.t }, p.inj.c != null && p.inj.c > 50 ? 'Şüpheli' : 'Sakat') : null)),
        h('td', { class: 'mute' }, p.p || ''), h('td', { class: 'num' }, ageOn(p.dob) ?? '—'), h('td', { class: 'mute' }, p.nat || ''),
        h('td', { class: 'num' }, p.st.ap), h('td', { class: 'num' }, p.st.g), h('td', { class: 'num' }, p.st.as), h('td', { class: 'num' }, p.v ? fmtMoney(p.v) : h('span', { class: 'dim' }, 'bilinmiyor'))));
    }
    return h('div', { class: 'grid' },
      hurt.length ? sheet(h('h2', null, `Sakat / şüpheli (${hurt.length})`), h('ul', { class: 'list-plain', style: 'margin:calc(var(--pad) * -1)' }, hurt.map(p => h('li', null, h('b', null, p.n), h('span', { class: 'mute', style: 'flex:1' }, p.inj.t), p.inj.c != null ? h('span', { class: 'chip' }, `%${p.inj.c} oynama şansı`) : null)))) : null,
      sheet(h('h2', null, 'Güncel kadro'), h('div', null, h('div', { style: 'overflow:auto' }, h('table', { class: 'tbl' },
        h('thead', null, h('tr', null, h('th', { class: 'num' }, 'No'), h('th', null, 'Oyuncu'), h('th', null, 'Mevki'), h('th', { class: 'num' }, 'Yaş'), h('th', null, 'Uyruk'), h('th', { class: 'num' }, 'Maç'), h('th', { class: 'num' }, 'Gol'), h('th', { class: 'num' }, 'Asist'), h('th', { class: 'num' }, 'Piyasa değeri'))), h('tbody', null, rows))),
      h('div', { class: 'dim', style: 'padding:14px 20px;font-size:14px' }, `Toplam piyasa değeri ${fmtMoney(total)} · ${list.length} oyuncu · Kaynak: ESPN (${asOf}); sakatlıklar: FPL (yalnızca Premier League). Piyasa değerleri Transfermarkt veri setinden.`)), { tight: true }));
  }

  // ------------------------------------------------------------------ finans (transfer harcaması)
  async function financeTab() {
    const seasons = Array.from({ length: 12 }, (_, i) => LAST_SEASON - 11 + i);
    const all = await Promise.all(seasons.map(async s => ({ s, t: (await loadTransfers(s)).filter(x => x.from === id || x.to === id) })));
    const per = all.map(({ s, t }) => ({ s, spent: t.filter(x => x.to === id).reduce((q, x) => q + (x.fee || 0), 0), got: t.filter(x => x.from === id).reduce((q, x) => q + (x.fee || 0), 0) }));
    if (!per.some(r => r.spent || r.got)) return h('div', { class: 'empty' }, h('h3', null, 'Bu takım için transfer harcaması verisi yok'));
    const flat = all.flatMap(({ s, t }) => t.map(x => ({ ...x, s })));
    const buys = flat.filter(x => x.to === id && x.fee).sort((a, b) => b.fee - a.fee).slice(0, 5), sells = flat.filter(x => x.from === id && x.fee).sort((a, b) => b.fee - a.fee).slice(0, 5);
    const net = per.reduce((q, r) => q + r.got - r.spent, 0);
    const mini = (title, list, key) => sheet(h('h2', null, title), h('ul', { class: 'list-plain', style: 'margin:calc(var(--pad) * -1)' }, list.map(x => h('li', null, h('span', { style: 'flex:1' }, h('b', null, P.byId.get(x.pid)?.name || `#${x.pid}`), h('span', { class: 'dim' }, `  ${ctx.clubName(x[key])} · ${seasonLabel(x.s)}`)), h('b', null, fmtMoney(x.fee))))));
    return h('div', { class: 'grid' },
      sheet(h('h2', null, 'Net transfer harcaması (son 12 sezon)'), h('div', null, h('div', { class: 'row center', style: 'margin-bottom:10px' }, h('div', { class: 'kpi' }, h('div', { class: 'v', style: `color:${net >= 0 ? 'var(--win)' : 'var(--loss)'}` }, fmtMoney(net, { sign: true })), h('div', { class: 'l' }, 'Toplam net (gelir − harcama)'))),
        barChart({ data: per.map(r => ({ label: seasonLabel(r.s).slice(2), value: Math.round((r.got - r.spent) / 1e6) })), fmt: v => (v ? `${v > 0 ? '+' : ''}${v}M` : '') }),
        h('div', { class: 'dim', style: 'font-size:13.5px;margin-top:6px' }, 'Yeşil: transferlerden net gelir. Kırmızı: net harcama (milyon €). Maaş ve sponsor gelirleri veride yok.'))),
      h('div', { class: 'grid cols-2' }, mini('En pahalı alımlar', buys, 'from'), mini('En pahalı satışlar', sells, 'to')));
  }

  async function squadTab() {
    if (!seasonArg || season >= 2026) { const c = await loadCurrent(); if (c.clubs[id]?.length) return currentSquad(c.clubs[id], c.asOf); }
    let list;
    if (!seasonArg || season >= 2026) list = P.list.filter(p => p.club === id).sort((a, b) => b.value - a.value).map(p => ({ id: p.id, value: p.value }));
    else list = ((await loadSquads(season))[id] || []).map(([pid, v]) => ({ id: pid, value: v }));
    if (!list.length) return h('div', { class: 'empty' }, h('h3', null, 'Bu dönem için kadro verisi yok'));
    const ref = seasonArg ? new Date(`${season + 1}-01-01`) : new Date();
    const total = list.reduce((s, p) => s + p.value, 0);
    return sheet(h('h2', null, 'Kadro'), h('div', { style: 'overflow:auto' }, h('table', { class: 'tbl' },
      h('thead', null, h('tr', null, h('th'), h('th', null, 'Oyuncu'), h('th', null, 'Mevki'), h('th', { class: 'num' }, 'Yaş'), h('th', null, 'Uyruk'), h('th', { class: 'num' }, 'Piyasa değeri'))),
      h('tbody', null, list.map(r => { const p = P.byId.get(r.id); return p && h('tr', null, h('td', null, h('span', { class: `chip` }, p.pos || p.line)), h('td', null, h('div', { class: 'who' }, avatar(p, 'sm'), h('a', { href: `#/oyuncu/${p.id}` }, p.name))), h('td', { class: 'mute' }, POS_LONG[p.line]), h('td', { class: 'num' }, ageOn(p.dob, ref) ?? '—'), h('td', { class: 'mute' }, p.nat || ''), h('td', { class: 'num' }, fmtMoney(r.value))); }))),
    h('div', { class: 'dim', style: 'padding:10px 14px' }, `Toplam piyasa değeri: ${fmtMoney(total)} (${list.length} oyuncu)`)), { tight: true });
  }

  async function matchesTab() {
    const s = seasonArg ? season : dflt;
    const comps = Object.keys(ctx.idx).filter(c => ctx.idx[c][s]);
    const all = (await Promise.all(comps.map(async c => (await loadMatches(c, s)).filter(m => m.h === id || m.a === id).map(m => ({ ...m, comp: c }))))).flat().sort((a, b) => a.date.localeCompare(b.date));
    if (!all.length) return h('div', { class: 'empty' }, h('h3', null, 'Bu sezon için maç verisi yok'));
    const res = all.map(m => { const own = m.h === id ? m.hg : m.ag, opp = m.h === id ? m.ag : m.hg; return own > opp ? 'W' : own === opp ? 'D' : 'L'; });
    const w = res.filter(x => x === 'W').length, d = res.filter(x => x === 'D').length, l = res.filter(x => x === 'L').length;
    return sheet(h('h2', null, `${seasonLabel(s)} maçları`), h('div', { style: 'overflow:auto' }, h('table', { class: 'tbl' },
      h('tbody', null, all.map((m, i) => h('tr', null, h('td', { class: 'dim' }, fmtDay(m.date)), h('td', { class: 'dim' }, ctx.compName(m.comp)), h('td', null, m.h === id ? h('b', null, ctx.clubName(m.h)) : ctx.clubName(m.h)), h('td', { class: 'num' }, h('b', null, `${m.hg} - ${m.ag}`)), h('td', null, m.a === id ? h('b', null, ctx.clubName(m.a)) : ctx.clubName(m.a)), h('td', null, formStrip([res[i]])))))),
    h('div', { class: 'dim', style: 'padding:10px 14px' }, `${w} galibiyet · ${d} beraberlik · ${l} mağlubiyet`)), { tight: true, actions: [compId ? h('a', { class: 'btn sm', href: `#/lig/${compId}/${s}` }, 'Lig sayfasında what-if yap') : null] });
  }

  async function transferTab() {
    const s = seasonArg ? season : dflt;
    const tr = (await loadTransfers(s)).filter(t => t.from === id || t.to === id);
    if (!tr.length) return h('div', { class: 'empty' }, h('h3', null, 'Bu dönem için transfer verisi yok'));
    const spent = tr.filter(t => t.to === id).reduce((q, t) => q + (t.fee || 0), 0), got = tr.filter(t => t.from === id).reduce((q, t) => q + (t.fee || 0), 0);
    return sheet(h('h2', null, `${seasonLabel(s)} transferleri`), h('div', { style: 'overflow:auto' }, h('table', { class: 'tbl' },
      h('thead', null, h('tr', null, h('th', null, 'Tarih'), h('th', null, 'Yön'), h('th', null, 'Oyuncu'), h('th', null, 'Diğer kulüp'), h('th', { class: 'num' }, 'Bonservis'))),
      h('tbody', null, tr.sort((a, b) => (b.fee || 0) - (a.fee || 0)).map(t => { const p = P.byId.get(t.pid), into = t.to === id; return h('tr', null, h('td', { class: 'dim' }, fmtDate(t.date)), h('td', null, h('span', { class: `chip ${into ? 'uecl' : 'rel'}` }, into ? 'Geldi' : 'Gitti')), h('td', null, p ? h('a', { href: `#/oyuncu/${t.pid}` }, p.name) : `#${t.pid}`), h('td', null, ctx.clubName(into ? t.from : t.to)), h('td', { class: 'num' }, t.fee ? fmtMoney(t.fee) : h('span', { class: 'dim' }, t.det ? 'ücret bilinmiyor' : 'serbest/kiralık'))); }))),
    h('div', { style: 'padding:10px 14px', class: 'row center' }, h('span', { class: 'dim' }, 'Harcama'), fmtMoney(spent), h('span', { class: 'dim' }, 'Gelir'), fmtMoney(got), h('span', { class: 'dim' }, 'Net'), delta((got - spent) / 1e6, { digits: 1, suffix: 'M' }))), { tight: true, actions: [h('a', { class: 'btn sm', href: `#/transfer/${s}` }, 'Transfer what-if')] });
  }

  async function powerTab() {
    const pts = [];
    for (let s = 2012; s <= LAST_SEASON + 1; s++) { const e = await loadElo(s); if (e?.[id]) pts.push([s, e[id]]); }
    if (pts.length < 2) return h('div', { class: 'empty' }, h('h3', null, 'Güç geçmişi için yeterli maç verisi yok'));
    return sheet(h('h2', null, 'Sezon başı Elo'), lineChart({ series: [{ pts, color: 'var(--chalk)', markers: true }], xFmt: v => seasonLabel(Math.round(v)), yFmt: v => Math.round(v) }));
  }

  drawTabs(); drawTab();
}
