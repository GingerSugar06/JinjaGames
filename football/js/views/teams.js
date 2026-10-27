// Takımlar: lige göre kulüp listesi ve milli takımlara geçiş.
import { h, mount, setCrumbs, norm, debounce } from '../util.js';
import { boot, pageHead, crestFor, select, field, sheet, seg } from '../ui.js';
import * as store from '../store.js';

export async function render(app) {
  const ctx = await boot();
  setCrumbs('Takımlar');
  const leagues = Object.values(ctx.comps).filter(c => c.type === 'league' && ctx.idx[c.id]).sort((a, b) => a.tier - b.tier || a.country.localeCompare(b.country, 'tr'));
  const S = { comp: store.pref('teamsComp', 'TR1'), q: '' };
  const box = h('div');
  const search = h('input', { type: 'search', placeholder: 'Takım ara…', style: 'width:min(320px,100%)', 'aria-label': 'Takım ara', oninput: debounce(e => { S.q = e.target.value; draw(); }, 100) });
  const compSel = select([{ group: 'Ana ligler', items: leagues.filter(c => c.tier === 1).map(c => [c.id, `${c.country} · ${c.name}`]) }, { group: 'Alt ligler', items: leagues.filter(c => c.tier > 1).map(c => [c.id, `${c.country} · ${c.name}`]) }], S.comp, v => { S.comp = v; store.setPref('teamsComp', v); draw(); });
  function draw() {
    const q = norm(S.q).trim();
    const all = Object.entries(ctx.clubs).filter(([, c]) => (q ? true : c.c === S.comp) && !/\b(U\d\d|B|II)$/.test(c.n)).map(([id, c]) => ({ id: +id, name: c.n, comp: c.c })).filter(c => c.comp && ctx.comps[c.comp]?.type === 'league');
    const list = (q ? all.filter(c => norm(c.name).includes(q)).slice(0, 60) : all).sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    mount(box, list.length ? h('div', { class: 'grid', style: 'grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px' }, list.map(c =>
      h('a', { class: 'tile', style: 'grid-template-columns:auto 1fr;align-items:center;padding:16px', href: `#/takim/${c.id}` }, crestFor(ctx, c.id, 'lg'), h('div', null, h('h3', { style: 'font-size:17px' }, c.name), h('div', { class: 'dim', style: 'font-size:13.5px' }, ctx.compName(c.comp)))))) : h('div', { class: 'empty' }, h('h3', null, 'Takım bulunamadı'), h('div', null, 'Başka bir lig seçmeyi dene.')));
  }
  mount(app, pageHead('Takımlar', 'Bir takım seç; kadrosunu, maçlarını ve “ya şöyle olsaydı” senaryolarını gör.',
    h('a', { class: 'btn', href: '#/hocalar' }, 'Teknik direktörler'), seg([['k', 'Kulüpler'], ['m', 'Milli takımlar']], 'k', v => { if (v === 'm') location.hash = '#/milli'; })),
  h('div', { class: 'row', style: 'margin-bottom:20px' }, field('Lig', compSel), field('Ara', search)), box);
  draw();
}
