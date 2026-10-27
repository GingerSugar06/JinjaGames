import { h, mount, setCrumbs, fmtMoney, fmtDate, seasonLabel, lineChart, ageOn } from '../util.js';
import { boot, sheet, POS_LONG, avatar, crestFor } from '../ui.js';
import { loadPlayers, loadValuations, loadTransfers, loadCurrent, monthIdxToDate, LAST_SEASON } from '../data.js';

export async function render(app, idArg) {
  const ctx = await boot();
  const [P, cur] = await Promise.all([loadPlayers(), loadCurrent()]);
  const p = P.byId.get(+idArg);
  if (!p) { mount(app, h('div', { class: 'empty' }, h('h3', null, 'Oyuncu bulunamadı'), h('a', { class: 'btn primary', href: '#/oyuncular' }, 'Oyunculara dön'))); return; }
  setCrumbs(p.name);
  // güncel kulüp ve sakatlık: ESPN kadrolarından
  let now = null;
  for (const [cid, rows] of Object.entries(cur.clubs)) { const r = rows.find(x => x.id === p.id); if (r) { now = { club: +cid, ...r }; break; } }
  const club = now?.club ?? p.club;
  const vals = await loadValuations(p.id);
  const trBox = h('div', null, h('div', { class: 'skel', style: 'height:80px' }));

  const peak = vals.reduce((m, v) => (v.v > m.v ? v : m), { v: 0, mi: 0 });
  const chart = vals.length > 1 ? lineChart({ series: [{ pts: vals.map(v => [v.mi / 12 + 2000, v.v]), color: 'var(--brand)', w: 2.5 }], yFmt: v => fmtMoney(v), xFmt: v => Math.round(v), height: 240 }) : h('div', { class: 'empty' }, 'Değer geçmişi yok');
  const age = ageOn(p.dob);
  mount(app,
    h('div', { class: 'page-h', style: 'align-items:center' },
      avatar({ name: p.name, img: p.img, esp: now?.e }, 'xl'),
      h('div', { style: 'min-width:0' }, h('h1', null, p.name),
        h('div', { class: 'row center', style: 'gap:8px;margin-top:10px' },
          h('span', { class: 'chip' }, p.pos || POS_LONG[p.line]), age ? h('span', { class: 'chip' }, `${age} yaş`) : null, p.nat ? h('span', { class: 'chip' }, p.nat) : null,
          now?.inj ? h('span', { class: 'chip rel', title: now.inj.t }, `Sakat: ${now.inj.t}`) : null),
        club ? h('a', { href: `#/takim/${club}`, class: 'row center', style: 'gap:10px;margin-top:12px;text-decoration:none;font-weight:600;font-size:17px' }, crestFor(ctx, club), ctx.clubName(club)) : null),
      h('div', { class: 'sp' }),
      h('a', { class: 'btn', href: `#/transfer/${LAST_SEASON}` }, 'Transferi değiştir')),
    h('div', { class: 'grid cols-2' },
      h('div', { class: 'grid', style: 'align-content:start' },
        sheet(h('h2', null, 'Piyasa değeri'), chart),
        sheet(h('h2', null, 'Transfer geçmişi'), trBox, { tight: true })),
      h('div', { class: 'grid', style: 'align-content:start' },
        sheet(h('h2', null, 'Bilgiler'), h('dl', { class: 'kv' },
          h('dt', null, 'Güncel değer'), h('dd', null, h('b', null, fmtMoney(p.value))),
          h('dt', null, 'Zirve değer'), h('dd', null, `${fmtMoney(p.peak)}${peak.v ? ` (${monthIdxToDate(peak.mi)})` : ''}`),
          h('dt', null, 'Doğum'), h('dd', null, p.dob ? fmtDate(p.dob) : '—'),
          h('dt', null, 'Boy / ayak'), h('dd', null, `${p.height ? p.height + ' cm' : '—'} · ${p.foot || '—'}`),
          h('dt', null, 'Sözleşme'), h('dd', null, p.contract ? fmtDate(p.contract) : '—'),
          h('dt', null, 'Milli maç'), h('dd', null, p.caps ?? '—'))),
        now ? sheet(h('h2', null, 'Bu sezon'), h('div', { class: 'row', style: 'gap:28px' },
          ...[['Maç', now.st.ap], ['Gol', now.st.g], ['Asist', now.st.as], ['Sarı', now.st.y], ['Kırmızı', now.st.r]].map(([l, v]) => h('div', { class: 'kpi' }, h('div', { class: 'v' }, v), h('div', { class: 'l' }, l))))) : null)));

  // transfer geçmişi: tüm dönemleri tara
  const rows = [];
  const seasons = Array.from({ length: LAST_SEASON - 2000 + 2 }, (_, i) => 2000 + i);
  const res = await Promise.all(seasons.map(s => loadTransfers(s).then(l => l.filter(t => t.pid === p.id)).catch(() => [])));
  for (const l of res) rows.push(...l);
  rows.sort((a, b) => b.date.localeCompare(a.date));
  trBox.replaceChildren(rows.length ? h('div', null, rows.map(t => h('div', { class: 'xfer' },
    h('span', { class: 'dim', style: 'font-size:14px' }, fmtDate(t.date)),
    h('span', { class: 'route' }, crestFor(ctx, t.from), ctx.clubName(t.from), h('span', { class: 'arrow' }, '→'), crestFor(ctx, t.to), ctx.clubName(t.to)),
    h('b', { style: 'font:700 16px var(--f-display)' }, t.fee ? fmtMoney(t.fee) : t.det ? 'ücret bilinmiyor' : 'serbest'),
    h('a', { class: 'btn sm', href: `#/transfer/${t.season}` }, 'Dönemi aç')))) : h('div', { class: 'empty' }, 'Kayıtlı transfer yok.'));
}
