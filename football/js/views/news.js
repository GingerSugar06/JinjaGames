// Günün haberleri: her lig için biten maçlar, skorlar; maça tıklayınca dakika dakika olaylar (gol türü, penaltı, kartlar).
import { h, mount, setCrumbs, crest } from '../util.js';
import { boot, pageHead, crestFor } from '../ui.js';
import { loadNewsIndex, loadNews } from '../data.js';
import { icon } from '../icons.js';

const EV = {
  g: ['ball', 'Gol'], h: ['ball', 'Kafa golü'], v: ['ball', 'Röveşata golü'], f: ['ball', 'Frikik golü'], p: ['penalty', 'Penaltıdan gol'],
  o: ['own', 'Kendi kalesine'], y: ['yellow', 'Sarı kart'], r: ['red', 'Kırmızı kart'],
};
const isGoal = k => 'ghvfpo'.includes(k);
const opp = s => (s === 'h' ? 'a' : 'h');
const goalSide = e => (e[1] === 'o' ? opp(e[2]) : e[2]);        // kendi kalesine gol rakibin hanesine yazılır
const STATUS = { AET: 'Uzatmalı', PEN: 'Penaltılarla' };
const dayLong = d => new Date(`${d}T12:00:00`).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const dayShort = d => new Date(`${d}T12:00:00`).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
const wd = d => new Date(`${d}T12:00:00`).toLocaleDateString('tr-TR', { weekday: 'short' });
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function countUp(el, to) {
  if (reduced || to < 2) { el.textContent = to; return; }
  const t0 = performance.now(), dur = 700;
  setTimeout(() => { el.textContent = to; }, dur + 150);   // arka plan sekmesinde animasyon kareleri durabilir; son değer garanti
  const step = t => { const k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

export async function render(app, dayArg) {
  const ctx = await boot();
  setCrumbs('Haberler');
  const index = await loadNewsIndex();
  const days = index.days || [];
  if (!days.length) {
    mount(app, pageHead('Günün haberleri', 'Her lige o günün sonuçları ve maç olayları.'), h('div', { class: 'empty' }, h('h3', null, 'Henüz haber yok'), h('div', null, 'Veri güncellendiğinde (her gece 00.00) biten maçlar burada listelenir.')));
    return;
  }
  const day = days.includes(dayArg) ? dayArg : days[0];
  const data = await loadNews(day);
  const leagues = data.leagues || [];
  const all = leagues.flatMap(l => l.m.map(m => ({ ...m, c: l.c })));
  const name = (id, fallback) => (id > 0 && ctx.clubs[id] ? ctx.clubName(id) : fallback);
  const logo = (id, fallback, size = 'sm') => (id > 0 && ctx.clubs[id] ? crestFor(ctx, id, size) : crest(fallback, size));
  const cName = c => (ctx.comps[c] ? ctx.compName(c) : c);

  // ---------------------------------------------------------------- günün özeti
  const goalsOf = m => m.hg + m.ag;
  const evs = k => all.flatMap(m => m.ev.filter(e => e[1] === k).map(e => ({ m, e })));
  const stat = { n: all.length, goals: all.reduce((s, m) => s + goalsOf(m), 0), pen: evs('p').length, red: evs('r').length };
  const scorers = new Map();
  for (const m of all) for (const e of m.ev) if (isGoal(e[1]) && e[1] !== 'o') { const k = `${m.id}|${e[3]}`; const o = scorers.get(k) || { who: e[3], m, side: e[2], n: 0 }; o.n++; scorers.set(k, o); }
  const multi = [...scorers.values()].filter(x => x.n >= 2).sort((a, b) => b.n - a.n);
  const topMatch = [...all].sort((a, b) => goalsOf(b) - goalsOf(a) || Math.abs(a.hg - a.ag) - Math.abs(b.hg - b.ag))[0];
  const biggest = [...all].sort((a, b) => Math.abs(b.hg - b.ag) - Math.abs(a.hg - a.ag))[0];
  const draws0 = all.filter(m => m.hg === 0 && m.ag === 0).length;
  const mt = m => `${name(m.h, m.hn)} ${m.hg}-${m.ag} ${name(m.a, m.an)}`;

  const focus = id => {
    const row = document.getElementById(`m-${id}`);
    if (!row) return;
    if (S.comp !== 'all' && S.comp !== row.dataset.c) { S.comp = 'all'; drawLeagues(); }
    const r = document.getElementById(`m-${id}`);
    r.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    if (r.querySelector('.nm-head').getAttribute('aria-expanded') !== 'true') r.querySelector('.nm-head').click();
  };
  const hl = [];
  if (topMatch && goalsOf(topMatch) >= 4) hl.push(['fire', 'Gol yağmuru', mt(topMatch), topMatch.id]);
  else if (topMatch) hl.push(['ball', 'Günün en golcü maçı', mt(topMatch), topMatch.id]);
  if (biggest && Math.abs(biggest.hg - biggest.ag) >= 3 && biggest !== topMatch) hl.push(['spark', 'En farklı skor', mt(biggest), biggest.id]);
  for (const x of multi.slice(0, 3)) hl.push([x.n >= 3 ? 'trophy' : 'boot', x.n >= 3 ? 'Hat-trick' : 'Duble', `${x.who} · ${name(x.side === 'h' ? x.m.h : x.m.a, x.side === 'h' ? x.m.hn : x.m.an)} (${mt(x.m)})`, x.m.id]);
  for (const { m, e } of evs('r').slice(0, 3)) hl.push(['red', 'Kırmızı kart', `${e[3] || 'Bir oyuncu'} · ${e[0]} (${mt(m)})`, m.id]);
  if (stat.pen) { const x = evs('p')[0]; hl.push(['penalty', stat.pen > 1 ? `${stat.pen} penaltı golü` : 'Penaltı golü', stat.pen > 1 ? 'Günün penaltıları maç satırlarında işaretli' : `${x.e[3]} · ${x.e[0]} (${mt(x.m)})`, x.m.id]); }
  if (draws0 >= 2) hl.push(['whistle', 'Gol çıkmadı', `${draws0} maç 0-0 bitti`, null]);

  const kpi = (label, v, ic) => { const el = h('b', null, '0'); queueMicrotask(() => countUp(el, v)); return h('div', { class: 'nm-kpi' }, h('span', { class: 'ev-ic', html: icon(ic) }), h('div', null, el, h('span', null, label))); };
  const summary = h('section', { class: 'nm-sum' },
    h('div', { class: 'nm-kpis' }, kpi('Maç', stat.n, 'whistle'), kpi('Gol', stat.goals, 'ball'), kpi('Penaltı golü', stat.pen, 'penalty'), kpi('Kırmızı kart', stat.red, 'red')),
    hl.length ? h('div', { class: 'nm-hl' }, hl.map(([ic, t, d, id]) => h(id ? 'button' : 'div', { class: 'nm-hl-i', type: id ? 'button' : null, onclick: id ? () => focus(id) : null },
      h('span', { class: 'ev-ic', html: icon(ic) }), h('span', null, h('b', null, t), h('span', null, d))))) : null);

  // ---------------------------------------------------------------- tarih şeridi
  const idx = days.indexOf(day);
  const nav = (to, ic, label) => h(to ? 'a' : 'span', { class: `btn sm ${to ? '' : 'off'}`, href: to ? `#/haberler/${to}` : null, 'aria-label': label, html: icon(ic) });
  const strip = h('div', { class: 'nm-strip', role: 'tablist', 'aria-label': 'Gün seç' }, days.slice(0, 21).map(d => h('a', { class: 'nm-day', href: `#/haberler/${d}`, role: 'tab', 'aria-selected': String(d === day) },
    h('span', null, wd(d)), h('b', null, new Date(`${d}T12:00:00`).getDate()), h('span', null, dayShort(d).split(' ')[1]))));
  requestAnimationFrame(() => strip.querySelector('[aria-selected="true"]')?.scrollIntoView({ inline: 'center', block: 'nearest' }));

  // ---------------------------------------------------------------- lig bölümleri
  const S = { comp: 'all' };
  const chips = h('div', { class: 'nm-chips' });
  const box = h('div', { class: 'nm-leagues' });

  function timeline(m) {
    let sh = 0, sa = 0;
    const rows = m.ev.map(e => {
      const side = isGoal(e[1]) ? goalSide(e) : e[2];
      if (isGoal(e[1])) { if (side === 'h') sh++; else sa++; }
      const [ic, label] = EV[e[1]];
      const cell = h('div', { class: `nm-ev ${side}` },
        h('span', { class: 'ev-ic', html: icon(ic) }),
        h('span', { class: 'nm-who' }, h('b', null, e[3] || '—'), h('span', null, e[1] === 'o' ? `${label} (${(e[2] === 'h' ? m.hn : m.an)})` : label)),
        isGoal(e[1]) ? h('span', { class: 'nm-run' }, `${sh}-${sa}`) : null);
      return h('li', { class: 'nm-tl' }, side === 'h' ? cell : h('div'), h('span', { class: 'nm-min' }, e[0]), side === 'a' ? cell : h('div'));
    });
    return m.ev.length ? h('ol', { class: 'nm-timeline' }, rows) : h('div', { class: 'dim', style: 'padding:6px 0' }, 'Bu maç için olay verisi yok.');
  }

  function matchRow(m) {
    const hw = m.hg > m.ag, aw = m.ag > m.hg;
    const flags = [];
    if (m.ev.some(e => e[1] === 'p')) flags.push(['penalty', 'Penaltı golü var']);
    if (m.ev.some(e => e[1] === 'o')) flags.push(['own', 'Kendi kalesine gol var']);
    if (m.ev.some(e => e[1] === 'r')) flags.push(['red', 'Kırmızı kart var']);
    const panel = h('div', { class: 'nm-panel', hidden: true });
    let built = false;
    const head = h('button', { class: 'nm-head', type: 'button', 'aria-expanded': 'false', onclick: () => {
      const open = head.getAttribute('aria-expanded') !== 'true';
      head.setAttribute('aria-expanded', String(open));
      if (open && !built) {
        built = true;
        panel.append(timeline(m),
          h('div', { class: 'nm-foot' }, h('span', { class: 'dim' }, [m.v, m.att ? `${m.att.toLocaleString('tr-TR')} seyirci` : null, STATUS[m.st]].filter(Boolean).join(' · ')),
            h('span', { class: 'row' },
              m.h > 0 && ctx.clubs[m.h] ? h('a', { class: 'btn sm', href: `#/takim/${m.h}` }, name(m.h, m.hn)) : null,
              m.a > 0 && ctx.clubs[m.a] ? h('a', { class: 'btn sm', href: `#/takim/${m.a}` }, name(m.a, m.an)) : null,
              m.h > 0 && m.a > 0 && ctx.clubs[m.h] && ctx.clubs[m.a] ? h('a', { class: 'btn sm mk', href: `#/simulator/h=${m.h}&a=${m.a}` }, 'Yeniden simüle et') : null)));
      }
      panel.hidden = !open;
      row.classList.toggle('open', open);
    } },
      h('span', { class: 'nm-time' }, m.t),
      h('span', { class: `nm-team h ${hw ? 'w' : ''}` }, h('span', { class: 'nm-name' }, name(m.h, m.hn)), logo(m.h, m.hn)),
      h('span', { class: 'nm-score' }, h('b', null, m.hg), h('i', null, '–'), h('b', null, m.ag)),
      h('span', { class: `nm-team a ${aw ? 'w' : ''}` }, logo(m.a, m.an), h('span', { class: 'nm-name' }, name(m.a, m.an))),
      h('span', { class: 'nm-flags' }, flags.map(([ic, t]) => h('span', { class: 'ev-ic', title: t, html: icon(ic) })), m.st !== 'FT' ? h('span', { class: 'chip' }, STATUS[m.st]) : null),
      h('span', { class: 'nm-chev', html: icon('chevr') }));
    const row = h('li', { class: 'nm-match', id: `m-${m.id}`, 'data-c': m.c }, head, panel);
    return row;
  }

  function leagueSummary(l) {
    const hw = l.m.filter(m => m.hg > m.ag).length, aw = l.m.filter(m => m.ag > m.hg).length, d = l.m.length - hw - aw;
    const g = l.m.reduce((s, m) => s + goalsOf(m), 0);
    const parts = [`${l.m.length} maç oynandı`];
    if (hw) parts.push(`${hw} ev sahibi galibiyeti`);
    if (d) parts.push(`${d} beraberlik`);
    if (aw) parts.push(`${aw} deplasman galibiyeti`);
    return `${parts.join(' · ')} · ${g} gol (maç başı ${(g / l.m.length).toFixed(1)})`;
  }

  function drawLeagues() {
    chips.replaceChildren(h('button', { type: 'button', 'aria-pressed': String(S.comp === 'all'), onclick: () => { S.comp = 'all'; drawLeagues(); } }, 'Tümü', h('em', null, all.length)),
      ...leagues.map(l => h('button', { type: 'button', 'aria-pressed': String(S.comp === l.c), onclick: () => { S.comp = l.c; drawLeagues(); } }, cName(l.c), h('em', null, l.m.length))));
    const shown = leagues.filter(l => S.comp === 'all' || l.c === S.comp);
    mount(box, ...(shown.length ? shown.map(l => h('section', { class: 'nm-league' },
      h('header', null, h('h2', null, cName(l.c)), h('span', { class: 'dim' }, leagueSummary(l)),
        ctx.comps[l.c]?.type === 'league' ? h('a', { class: 'btn sm', href: `#/lig/${l.c}/2026` }, 'Puan durumu') : null),
      h('ul', { class: 'nm-list' }, l.m.map(matchRow)))) : [h('div', { class: 'empty' }, h('h3', null, 'Bu gün maç yok'))]));
  }

  mount(app,
    pageHead('Günün haberleri', dayLong(day),
      h('div', { class: 'row center' }, nav(days[idx + 1], 'chevl', 'Önceki gün'), nav(days[idx - 1], 'chevr', 'Sonraki gün'))),
    strip, summary, chips, box,
    h('div', { class: 'dim', style: 'font-size:12.5px;margin-top:18px' }, `Veri: ESPN, ${index.asOf ? index.asOf.slice(0, 10) : ''}. Günler Türkiye saatine göre; haberler her gece 00.00’da güncellenir. Maça tıklayınca gol dakikaları, penaltılar ve kartlar açılır.`));
  drawLeagues();
}
