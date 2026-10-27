// Maç Simülatörü: iki takım, ilk 11, diziliş, taktik → binlerce kez simüle et.
import { h, mount, setCrumbs, crest, fmtMoney, fmtPct, ageOn, seasonLabel, debounce, toast } from '../util.js';
import { boot, pick, clubItems, select, field, seg, sheet, pageHead, crestFor } from '../ui.js';
import { loadPlayers, loadSquads, loadElo, loadUpcoming, loadIntlElo, loadCurrent, loadManagers, mgrDelta, mgrInfo, LAST_SEASON } from '../data.js';
import { eloChip, eloText, pickManager } from '../mgr.js';
import { tr, NAT_ALIAS } from '../nations.js';
import { FORMATIONS, autoXI, teamRatings, matchLambdas, simulate, playOne } from '../matchsim.js';
import { lineupEditor, lastName } from '../lineup.js';
import { openLive } from '../liveview.js';
import { Match2D } from '../match2d.js';

const NOW = 'now';
const DEFAULT_TACTICS = () => ({ mentality: 50, tempo: 50, press: 50, width: 50, counter: 0 });

export async function render(app, argStr) {
  const ctx = await boot();
  const [P, M] = await Promise.all([loadPlayers(), loadManagers()]);
  setCrumbs('Maç Simülatörü');
  const params = new URLSearchParams(argStr || '');

  const sides = { h: null, a: null };
  const O = { mode: 'club', active: 'h', neutral: false, knockout: false, n: 10000 };
  let res = null, story = null, editor = null;

  async function loadSide(clubId, season, kind = O.mode) {
    if (kind === 'nation') {
      const squad = buildNationSquad(P, clubId);
      const elo = (await natElo()).get(clubId) ?? teamEloFromSquad(squad);
      return { kind, clubId, season: NOW, squad, elo, formation: '4-2-3-1', xi: autoXI(squad, '4-2-3-1'), tactics: DEFAULT_TACTICS() };
    }
    const squad = await buildSquad(ctx, P, clubId, season);
    const eloSnap = await loadElo(season === NOW ? LAST_SEASON + 1 : season);
    const elo = eloSnap?.[clubId] ?? teamEloFromSquad(squad);
    const formation = '4-2-3-1';
    return { kind, clubId, season, squad, elo, formation, xi: autoXI(squad, formation), tactics: DEFAULT_TACTICS(), mgr: { base: baseMgr(clubId, season), alt: null } };
  }
  /** Seçilen dönemde kulübü çalıştıran hoca: güncel kadroda görevdeki, geçmiş sezonda o yılın ocak ayındaki. */
  function baseMgr(clubId, season) {
    const c = M.c[clubId];
    if (!c) return null;
    if (season === NOW) return c.cur?.n || null;
    const d = `${season + 1}-01-15`;
    return (c.hist || []).find(r => r[1] <= d && d <= r[2])?.[0] || null;
  }
  /** Takım Elo'su + (kullanıcı hoca değiştirdiyse) hoca farkı. */
  const effElo = s => s.elo + (s.mgr?.alt ? mgrDelta(M, s.mgr.base, s.mgr.alt) : 0);
  async function changeMgr(side) {
    const s = sides[side];
    const alt = await pickManager(ctx, M, { title: `${nameOf(s)} için teknik direktör`, exclude: s.mgr?.base });
    if (alt) { s.mgr.alt = alt; editor = null; refresh(); }
  }
  const nameOf = s => (s.kind === 'nation' ? tr(s.clubId) : ctx.clubName(s.clubId));

  const defH = +(params.get('h') || 36), defA = +(params.get('a') || 141);
  if (params.get('mode') === 'nation') {
    O.mode = 'nation'; O.neutral = true;
    sides.h = await loadSide(params.get('h') || 'Turkey', NOW, 'nation'); sides.a = await loadSide(params.get('a') || 'Germany', NOW, 'nation');
  } else {
    sides.h = await loadSide(defH, params.get('s') === null ? NOW : (params.get('s') === NOW ? NOW : +params.get('s')), 'club');
    sides.a = await loadSide(defA, sides.h.season, 'club');
  }

  const root = h('div');
  mount(app, pageHead('Maç Simülatörü', 'İlk 11’i, dizilişi ve taktiği sen belirle; maçı on binlerce kez oynat. Geçmiş sezonların kadroları da seçilebilir.'), root);
  const upcoming = await loadUpcoming();

  function calc() {
    const hh = sides.h, aa = sides.a;
    const hr = teamRatings({ baseElo: effElo(hh), squad: hh.squad, formation: hh.formation, xi: hh.xi, tactics: hh.tactics });
    const ar = teamRatings({ baseElo: effElo(aa), squad: aa.squad, formation: aa.formation, xi: aa.xi, tactics: aa.tactics });
    const [lh, la] = matchLambdas(hr, ar, { neutral: O.neutral, ha: O.mode === 'nation' ? 100 : undefined });
    const edge = Math.tanh((effElo(hh) - effElo(aa)) / 600) * 0.12;
    res = { hr, ar, lh, la, sim: simulate({ lh, la, n: O.n, knockout: O.knockout, qualityEdge: edge }) };
    story = null;
  }

  async function changeTeam(side, clubId, season = sides[side].season) {
    sides[side] = await loadSide(clubId, season, O.mode);
    if (O.active === side) editor = null;
    refresh();
  }

  async function chooseClub(side) {
    if (O.mode === 'nation') {
      const elo = await natElo();
      const items = [...elo].filter(([, v]) => v > 1300).sort((x, y) => y[1] - x[1]).slice(0, 120).map(([t, v]) => ({ id: t, label: tr(t), sub: '', right: Math.round(v) }));
      const id = await pick({ title: side === 'h' ? 'Ev sahibi milli takım' : 'Deplasman milli takım', items, placeholder: 'Ülke ara… (ör. Türkiye)' });
      if (id) await changeTeam(side, id);
      return;
    }
    const ids = Object.keys(ctx.clubs).map(Number).filter(id => ctx.clubs[id].c && ctx.comps[ctx.clubs[id].c]?.type === 'league');
    const id = await pick({ title: side === 'h' ? 'Ev sahibi takım' : 'Deplasman takımı', items: clubItems(ctx, ids, id => ctx.compName(ctx.clubs[id].c)), placeholder: 'Takım ara… (ör. Galatasaray)' });
    if (id) { await changeTeam(side, id); }
  }
  async function setMode(mode) {
    O.mode = mode; O.neutral = mode === 'nation'; editor = null;
    sides.h = await loadSide(mode === 'nation' ? 'Turkey' : 36, NOW, mode); sides.a = await loadSide(mode === 'nation' ? 'Germany' : 141, NOW, mode);
    refresh();
  }
  async function changeSeason(season) {
    const s = season === NOW ? NOW : +season;
    sides.h = await loadSide(sides.h.clubId, s, 'club'); sides.a = await loadSide(sides.a.clubId, s, 'club'); editor = null; refresh();
  }

  const rec = debounce(() => { calc(); drawResults(); drawStrength(); }, 60);
  const resultsBox = h('div'), strengthBox = h('div'), tacticsBox = h('div');

  /** Kart içinde hoca satırı: görevdeki hoca + puanı; değiştirildiyse yeni hoca ve etkisi. */
  function mgrRow(side, s) {
    const m = s.mgr, name = m?.alt || m?.base, i = name && mgrInfo(M, name);
    const act = (txt, f) => h('span', { role: 'button', tabindex: 0, class: 'btn sm ghost', style: 'margin-left:6px', onclick: e => { e.stopPropagation(); f(); }, onkeydown: e => { if (e.key === 'Enter') { e.stopPropagation(); f(); } } }, txt);
    return h('div', { class: 'row center', style: 'gap:6px;margin-top:6px;font-size:13px;flex-wrap:wrap' }, h('span', { class: 'cap' }, 'Hoca'),
      name ? h('b', null, name) : h('span', { class: 'dim' }, 'bilinmiyor'), i ? eloChip(i.elo, { label: '' }) : null,
      m?.alt ? h('span', { class: 'chip mk', title: `${m.base || 'önceki hoca'} yerine; takım gücüne ${eloText(Math.round(mgrDelta(M, m.base, m.alt)))} Elo yansır` }, `${eloText(Math.round(mgrDelta(M, m.base, m.alt)))} Elo`) : null,
      act('Hoca seç', () => changeMgr(side)), m?.alt ? act('Geri al', () => { m.alt = null; editor = null; refresh(); }) : null);
  }

  function drawTeamBar() {
    const seasons = [[NOW, 'Güncel kadro'], ...Array.from({ length: LAST_SEASON - 2004 + 1 }, (_, i) => LAST_SEASON - i).map(s => [s, seasonLabel(s)])];
    const teamCard = side => {
      const s = sides[side];
      return h('button', { class: 'tile', style: `text-align:left;cursor:pointer;color:inherit;font:inherit;${O.active === side ? 'border-color:var(--chalk)' : ''}`, onclick: () => { O.active = side; editor = null; refresh(); }, 'aria-pressed': String(O.active === side) },
        h('div', { class: 'row center', style: 'gap:12px;flex-wrap:nowrap' }, (s.kind === 'nation' ? crest(nameOf(s), 'lg') : crestFor(ctx, s.clubId, 'lg')),
          h('div', { style: 'flex:1;min-width:0' }, h('div', { class: 'cap' }, side === 'h' ? 'Ev sahibi' : 'Deplasman'), h('div', { style: 'font:600 22px var(--font-c);letter-spacing:.03em;text-transform:uppercase;overflow:hidden;text-overflow:ellipsis;white-space:nowrap' }, nameOf(s)),
            h('div', { class: 'dim', style: 'font-size:12.5px' }, `${s.kind === 'nation' ? 'Milli takım' : ctx.compName(ctx.clubs[s.clubId]?.c)} · Elo ${Math.round(effElo(s))} · ${s.squad.length} oyuncu`),
            s.kind === 'nation' ? null : mgrRow(side, s)),
          h('span', { role: 'button', tabindex: 0, class: 'btn sm', onclick: e => { e.stopPropagation(); chooseClub(side); }, onkeydown: e => { if (e.key === 'Enter') { e.stopPropagation(); chooseClub(side); } } }, 'Değiştir')));
    };
    const ups = upcoming.fixtures.slice(0, 6);
    return h('div', { class: 'grid', style: 'margin-bottom:14px' },
      h('div', { class: 'grid teams-row' }, teamCard('h'), h('div', { class: 'cap vs', style: 'font-size:18px' }, 'vs'), teamCard('a')),
      h('div', { class: 'row center' }, seg([['club', 'Kulüpler'], ['nation', 'Milli takımlar']], O.mode, setMode, 'mk'), O.mode === 'club' ? field('Kadro dönemi', select(seasons, sides.h.season, v => changeSeason(v))) : null,
        h('button', { class: 'btn', style: 'align-self:flex-end', onclick: async () => { const t = sides.h; sides.h = await loadSide(sides.a.clubId, t.season, O.mode); sides.a = await loadSide(t.clubId, t.season, O.mode); editor = null; refresh(); } }, '⇄ Yer değiştir'),
        O.mode === 'club' && ups.length ? h('div', { class: 'row center', style: 'align-self:flex-end' }, h('span', { class: 'cap' }, 'Yaklaşan:'), ...ups.map(f => h('button', { class: 'btn sm', onclick: async () => { if (f.h && f.a) { sides.h = await loadSide(f.h, NOW); sides.a = await loadSide(f.a, NOW); editor = null; refresh(); } } }, `${ctx.clubs[f.h] ? ctx.clubName(f.h) : f.hn} – ${ctx.clubs[f.a] ? ctx.clubName(f.a) : f.an}`))) : null));
  }

  function drawTactics() {
    const s = sides[O.active];
    const sl = (key, label, lo, hi) => h('div', { class: 'sl mk' }, h('div', { class: 't' }, h('span', null, label), h('span', { class: 'dim' }, `${lo} ↔ ${hi}`)),
      h('input', { type: 'range', min: 0, max: 100, value: s.tactics[key], 'aria-label': label, oninput: e => { s.tactics[key] = +e.target.value; rec(); } }));
    mount(tacticsBox, h('div', { class: 'sliders' }, sl('mentality', 'Mentalite', 'Defansif', 'Hücumcu'), sl('tempo', 'Tempo', 'Yavaş', 'Hızlı'), sl('press', 'Pres', 'Düşük', 'Yüksek'), sl('width', 'Kanat oyunu', 'Dar', 'Geniş'), sl('counter', 'Kontra ataklar', 'Yok', 'Çok')),
      h('div', { class: 'dim', style: 'font-size:12px;margin-top:10px' }, 'Taktik etkileri sezgiseldir ve küçüktür (gol beklentisinde yaklaşık ±%10). Asıl fark ilk 11’den ve takım gücünden gelir.'));
  }

  function drawStrength() {
    const { hr, ar, lh, la } = res;
    const row = (name, r) => h('tr', null, h('td', null, name), h('td', { class: 'num' }, Math.round(r.att)), h('td', { class: 'num' }, Math.round(r.def)),
      h('td', { class: 'num' }, h('span', { class: `delta ${r.dA + r.dD < -4 ? 'dn' : r.dA + r.dD > 4 ? 'up' : 'eq'}` }, `${(r.dA + r.dD) / 2 > 0 ? '+' : ''}${Math.round((r.dA + r.dD) / 2)}`)));
    mount(strengthBox, h('table', { class: 'tbl' }, h('thead', null, h('tr', null, h('th', null, 'Takım'), h('th', { class: 'num' }, 'Hücum'), h('th', { class: 'num' }, 'Savunma'), h('th', { class: 'num', title: 'İlk 11’in kulübün en iyi 11’ine göre farkı' }, '11 farkı'))),
      h('tbody', null, row(nameOf(sides.h), hr), row(nameOf(sides.a), ar))),
    h('div', { class: 'dim', style: 'font-size:12px;margin-top:6px' }, `Beklenen gol: ${lh.toFixed(2)} – ${la.toFixed(2)}`));
  }

  function drawResults() {
    const { sim, lh, la } = res;
    const hn = nameOf(sides.h), an = nameOf(sides.a);
    const bar = (label, p, color) => h('div', { class: 'pbar' }, h('span', null, label), h('div', { class: 'meter' }, h('i', { style: `width:${p * 100}%;background:${color}` })), h('b', { class: 'num' }, fmtPct(p, 1)));
    const max = Math.max(...sim.grid.slice(0, 6).flatMap(r => r.slice(0, 6)));
    const heat = h('div', { class: 'heat', style: 'grid-template-columns:34px repeat(6,1fr)' },
      h('div', { style: 'background:none;color:var(--chalk-3);font-size:10px' }, ''), ...[0, 1, 2, 3, 4, 5].map(j => h('div', { style: 'background:none;color:var(--chalk-3)' }, j)),
      ...[0, 1, 2, 3, 4, 5].flatMap(i => [h('div', { style: 'background:none;color:var(--chalk-3)' }, i), ...[0, 1, 2, 3, 4, 5].map(j => { const p = sim.grid[i][j]; const a = Math.sqrt(p / max); return h('div', { style: `background:color-mix(in srgb, ${i > j ? 'var(--ucl)' : i === j ? 'var(--chalk-2)' : 'var(--el)'} ${Math.round(18 + a * 82)}%, var(--bg-1));color:${a > .55 ? '#08120d' : 'var(--chalk)'}`, title: `${i}-${j}: ${fmtPct(p, 1)}` }, p >= .005 ? Math.round(p * 100) + '%' : ''); })]));
    const out = h('div', { class: 'grid', style: 'gap:18px' },
      h('div', null, bar(`${hn} galibiyet`, sim.hw, 'var(--ucl)'), bar('Beraberlik', sim.dr, 'var(--chalk-2)'), bar(`${an} galibiyet`, sim.aw, 'var(--el)'),
        sim.knock ? h('div', { class: 'note mk', style: 'margin-top:8px' }, `Eleme: ${hn} tur atlar ${fmtPct(sim.knock.hAdv, 1)} · ${an} ${fmtPct(sim.knock.aAdv, 1)} (uzatma ${fmtPct(sim.knock.et)}, penaltı ${fmtPct(sim.knock.pen)})`) : null),
      h('div', { class: 'grid', style: 'grid-template-columns:repeat(4,1fr);gap:10px' },
        kv('Ortalama gol', `${sim.avgH.toFixed(2)} – ${sim.avgA.toFixed(2)}`), kv('2,5 üstü', fmtPct(sim.over25)), kv('Karşılıklı gol', fmtPct(sim.btts)), kv('Gol yemeden', `${fmtPct(sim.hCs)} / ${fmtPct(sim.aCs)}`)),
      h('div', null, h('div', { class: 'cap', style: 'margin-bottom:6px' }, 'Skor olasılıkları · satır: ' + lastName(hn) + ' golü, sütun: ' + lastName(an)), heat,
        h('div', { class: 'row', style: 'margin-top:8px;gap:8px' }, ...sim.top.slice(0, 5).map(t => h('span', { class: 'chip' }, `${t.h}-${t.a} · ${fmtPct(t.p, 1)}`)))),
      h('div', null, h('div', { class: 'row center', style: 'margin-bottom:8px' }, h('button', { class: 'btn mk', onclick: playStory }, 'Tek maç oyna'), h('span', { class: 'dim', style: 'font-size:12px' }, `${sim.n.toLocaleString('tr')} simülasyon üzerinden`)), h('div', { id: 'story' }, storyView())));
    mount(resultsBox, out);
  }
  const kv = (l, v) => h('div', { class: 'kpi' }, h('div', { class: 'v', style: 'font-size:20px' }, v), h('div', { class: 'l' }, l));

  function playStory() {
    const mk = k => { const x = sides[k], by = new Map(x.squad.map(q => [q.id, q])); return { name: nameOf(x), formation: x.formation, squad: x.squad, xi: x.xi.map(id => by.get(id) || null), tactics: { ...x.tactics } }; };
    const m = new Match2D({ sides: { h: mk('h'), a: mk('a') }, rates: () => ({ lh: res.lh, la: res.la }), seed: (Math.random() * 1e9) | 0 });
    m.finishNow(); story = m;
    const box = document.getElementById('story'); if (box) box.replaceChildren(storyView());
  }
  function storyView() {
    if (!story) return h('div', { class: 'dim' }, 'Bir maç oynat: skor, gol dakikaları, golü atanlar ve maç istatistikleri.');
    const m = story, hn = nameOf(sides.h), an = nameOf(sides.a), s = m.stats, tot = Math.max(1, s.h.seq + s.a.seq);
    const goals = m.events.filter(e => e.type === 'goal'), best = m.summary().best;
    const row = (l, a, b) => h('tr', null, h('td', { class: 'num' }, a), h('td', { style: 'text-align:center;color:var(--ink-3)' }, l), h('td', null, b));
    return h('div', { class: 'grid', style: 'gap:12px' },
      h('div', { style: 'font:700 30px var(--font-c);letter-spacing:.03em' }, `${hn} ${m.score.h} – ${m.score.a} ${an}`),
      goals.length ? h('ul', { class: 'list-plain' }, goals.map(e => h('li', { style: 'padding:5px 0' }, h('span', { class: 'chip' }, `${e.min}'`), h('span', null, e.text.replace('GOL! ', '')))))
        : h('div', { class: 'mute' }, 'Gol yok.'),
      h('table', { class: 'tbl' }, h('tbody', null, row('Top hakimiyeti', fmtPct(s.h.seq / tot), fmtPct(s.a.seq / tot)), row('Şut (isabetli)', `${s.h.shots} (${s.h.on})`, `${s.a.shots} (${s.a.on})`),
        row('Beklenen gol (xG)', s.h.xg.toFixed(2), s.a.xg.toFixed(2)), row('Korner', s.h.corner, s.a.corner), row('Kart (sarı / kırmızı)', `${s.h.y} / ${s.h.r}`, `${s.a.y} / ${s.a.r}`))),
      best ? h('div', { class: 'note' }, `Maçın oyuncusu: ${best.p.name} (${nameOf(sides[best.side])}) — ${best.st.g} gol, ${best.st.a} asist, ${best.st.s} şut${best.st.k ? `, ${best.st.k} kurtarış` : ''}`) : null);
  }

  function drawEditor() {
    const s = sides[O.active];
    if (!editor) editor = lineupEditor({ squad: s.squad, formation: s.formation, xi: s.xi, addPlayer: async () => {
      const have = new Set(s.squad.map(q => q.id));
      const items = P.list.filter(x => x.value >= 1e6 && (x.lastSeason ?? 0) >= LAST_SEASON && !have.has(x.id)).sort((x, y) => y.value - x.value).slice(0, 5000).map(x => ({ id: x.id, label: x.name, sub: `${x.club ? ctx.clubName(x.club) : ''} ${x.nat || ''}`, right: fmtMoney(x.value), tag: x.pos || x.line, tagCls: x.line }));
      const id = await pick({ title: 'Kadroya kim katılsın?', items, placeholder: 'Oyuncu ara… (ör. Haaland)' });
      const x = id && P.byId.get(id); return x ? { id: x.id, name: x.name, line: x.line, pos: x.pos, value: x.value || 3e5, age: ageOn(x.dob), nat: x.nat, img: x.img, added: true } : null;
    }, onChange: (xi, f) => { s.xi = xi; s.formation = f; rec(); } });
    return editor.el;
  }

  const watchBtn = () => h('button', { class: 'btn primary', onclick: () => {
    const side = k => { const x = sides[k]; return { squad: x.squad, elo: effElo(x), formation: x.formation, xi: [...x.xi], tactics: { ...x.tactics } }; };
    openLive({ names: { h: nameOf(sides.h), a: nameOf(sides.a) }, sides: { h: side('h'), a: side('a') }, neutral: O.neutral, haValue: O.mode === 'nation' ? 100 : undefined });
  } }, 'Maçı 2D izle');
  function refresh() {
    calc();
    const left = sheet(h('h2', null, `İlk 11 · ${nameOf(sides[O.active])}`), drawEditor(), { actions: [seg([['h', 'Ev sahibi'], ['a', 'Deplasman']], O.active, v => { O.active = v; editor = null; refresh(); })] });
    drawTactics(); drawResults(); drawStrength();
    const opts = h('div', { class: 'row center' },
      h('label', { class: 'row center', style: 'gap:6px' }, h('input', { type: 'checkbox', checked: O.neutral, onchange: e => { O.neutral = e.target.checked; rec(); } }), 'Tarafsız saha'),
      h('label', { class: 'row center', style: 'gap:6px' }, h('input', { type: 'checkbox', checked: O.knockout, onchange: e => { O.knockout = e.target.checked; rec(); } }), 'Eleme maçı'),
      field('Simülasyon', select([[1000, '1.000'], [10000, '10.000'], [100000, '100.000'], [1000000, '1.000.000']], O.n, v => { O.n = +v; rec(); })));
    mount(root, drawTeamBar(),
      h('div', { class: 'grid cols-2' }, left,
        h('div', { class: 'grid', style: 'align-content:start' }, sheet(h('h2', null, 'Sonuç'), resultsBox, { actions: [watchBtn()] }), sheet(h('h2', null, 'Maç ayarları'), h('div', { class: 'grid' }, opts, strengthBox)), sheet(h('h2', null, `Taktik · ${nameOf(sides[O.active])}`), tacticsBox))));
  }
  refresh();
}

// ---------------------------------------------------------------------------- kadro kurma
export async function buildSquad(ctx, P, clubId, season) {
  if (season === NOW) {
    const cur = (await loadCurrent()).clubs[clubId];
    if (cur?.length >= 14) {
      const now = new Date();
      return cur.map(c => ({ id: c.id || -c.e, name: c.n, line: c.l, pos: c.p || '', value: c.v || estimateValue(c, now), age: ageOn(c.dob, now), nat: c.nat || '', inj: c.inj, st: c.st, jersey: c.j, dob: c.dob, tm: !!c.id, img: P.byId.get(c.id)?.img, esp: c.e }));
    }
  }
  let rows;
  if (season === NOW) {
    rows = P.list.filter(p => p.club === clubId && (p.lastSeason == null || p.lastSeason >= LAST_SEASON)).map(p => ({ pid: p.id, v: p.value })).sort((a, b) => b.v - a.v).slice(0, 45);
    if (rows.length < 14) rows = P.list.filter(p => p.club === clubId).map(p => ({ pid: p.id, v: p.value })).sort((a, b) => b.v - a.v).slice(0, 45);
  } else {
    const sq = (await loadSquads(season))[clubId] || [];
    rows = sq.map(([pid, v]) => ({ pid, v }));
  }
  const ref = season === NOW ? new Date() : new Date(`${season + 1}-01-01`);
  return rows.map(r => P.byId.get(r.pid) && ({ id: r.pid, name: P.byId.get(r.pid).name, line: P.byId.get(r.pid).line, pos: P.byId.get(r.pid).pos, value: r.v || P.byId.get(r.pid).value || 3e5, age: ageOn(P.byId.get(r.pid).dob, ref), nat: P.byId.get(r.pid).nat, img: P.byId.get(r.pid).img })).filter(Boolean);
}
// Transfermarkt'ta bulunmayan (yeni) oyuncu için kaba değer tahmini: yaşa göre
const estimateValue = (c, now) => { const a = ageOn(c.dob, now) || 26; return a <= 21 ? 1.5e6 : a <= 30 ? 1e6 : 4e5; };
function teamEloFromSquad(squad) {
  const top = squad.map(p => p.value).sort((a, b) => b - a).slice(0, 18).reduce((s, v) => s + v, 0);
  return 1500 + 120 * Math.log(Math.max(top, 2e6) / 60e6);
}

// ---------------------------------------------------------------------------- milli takım kadrosu
let natP;
const natElo = () => natP ??= loadIntlElo().then(o => new Map(Object.entries(o).map(([t, d]) => { const ys = Object.keys(d).map(Number); return [t, d[Math.max(...ys)]]; })));
export function buildNationSquad(P, name) {
  const nat = NAT_ALIAS[name] || name;
  return P.list.filter(p => p.nat === nat && (p.lastSeason ?? 0) >= LAST_SEASON).sort((a, b) => b.value - a.value).slice(0, 40)
    .map(p => ({ id: p.id, name: p.name, line: p.line, pos: p.pos, value: p.value || 3e5, age: ageOn(p.dob), nat: p.nat }));
}
