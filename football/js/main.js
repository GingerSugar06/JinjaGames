import { $, h, mount, toast } from './util.js';
import * as store from './store.js';
import { openPalette, openHelp, copyShareLink } from './palette.js';
import { icon } from './icons.js';
export { icon };


const NAV = [
  ['/', 'Ana sayfa', 'home'],
  ['/degistir', 'Geçmişi değiştir', 'edit'],
  ['/simulator', 'Maç oyna', 'sim'],
  ['/haberler', 'Haberler', 'news'],
  ['/takimlar', 'Takımlar', 'shield'],
  ['/oyuncular', 'Oyuncular', 'players'],
];
const SECTION = [
  [/^\/(degistir|lig|kupa|transfer)/, '/degistir'], [/^\/simulator/, '/simulator'], [/^\/haberler/, '/haberler'], [/^\/(takim|takimlar|milli|hocalar)/, '/takimlar'], [/^\/oyuncu/, '/oyuncular'],
];

const ROUTES = [
  [/^\/?$/, () => import('./views/home.js')],
  [/^\/degistir$/, () => import('./views/hub.js')],
  [/^\/takimlar$/, () => import('./views/teams.js')],
  [/^\/hocalar$/, () => import('./views/managers.js')],
  [/^\/haberler(?:\/(\d{4}-\d{2}-\d{2}))?$/, () => import('./views/news.js')],
  [/^\/lig(?:\/([^/]+))?(?:\/(\d{4}))?$/, () => import('./views/league.js')],
  [/^\/kupa(?:\/([^/]+))?(?:\/(\d{4}))?$/, () => import('./views/cup.js')],
  [/^\/takim\/(\d+)(?:\/(\d{4}))?$/, () => import('./views/team.js')],
  [/^\/oyuncular$/, () => import('./views/players.js')],
  [/^\/oyuncu\/(\d+)$/, () => import('./views/player.js')],
  [/^\/transfer(?:\/(\d{4}))?$/, () => import('./views/transfer.js')],
  [/^\/simulator(?:\/(.*))?$/, () => import('./views/simulator.js')],
  [/^\/milli(?:\/(.+))?$/, () => import('./views/national.js')],
  [/^\/paylas\/(.+)$/, () => import('./views/share.js')],
  [/^\/senaryolar$/, () => import('./views/scenarios.js')],
];

let navToken = 0;
async function route() {
  const path = decodeURIComponent(location.hash.slice(1) || '/');
  const token = ++navToken;
  const app = $('#app');
  renderNav(path);
  for (const [re, loader] of ROUTES) {
    const m = path.match(re);
    if (!m) continue;
    app.replaceChildren(h('div', { class: 'skel', style: 'width:260px;height:34px;margin-bottom:20px' }), h('div', { class: 'skel', style: 'height:320px;border-radius:18px' }));
    try {
      const mod = await loader();
      if (token !== navToken) return;
      const view = await mod.render(app, ...m.slice(1));
      if (token !== navToken) return;
      scrollTo({ top: 0 });
      return view;
    } catch (e) {
      console.error(e);
      if (token === navToken) mount(app, h('div', { class: 'empty' }, h('h3', null, 'Bu ekran yüklenemedi'), h('div', null, String(e.message || e)), h('a', { class: 'btn', href: '#/' }, 'Ana sayfaya dön')));
      return;
    }
  }
  mount(app, h('div', { class: 'empty' }, h('h3', null, 'Sayfa bulunamadı'), h('a', { class: 'btn primary', href: '#/' }, 'Ana sayfaya dön')));
}

function currentSection(path) {
  if (path === '/') return '/';
  for (const [re, p] of SECTION) if (re.test(path)) return p;
  return null;
}

function renderNav(path) {
  const cur = currentSection(path);
  const link = ([p, label, ic]) => h('a', { href: '#' + p, 'aria-current': p === cur ? 'page' : null, html: `${icon(ic)}<span>${label}</span>` });
  const s = store.active(), n = s?.edits.length || 0;
  const dark = document.documentElement.dataset.theme === 'dark';
  $('#topbar').replaceChildren(
    h('a', { class: 'brand', href: '#/', 'aria-label': 'What If Football ana sayfa', html: '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#0b8a4a"/><g class="ball-logo"><circle cx="16" cy="16" r="9" fill="#fff"/><path d="M16 10.6l3.9 2.8-1.5 4.5h-4.8l-1.5-4.5z" fill="#0b2214"/><path d="M16 10.6V7.1M19.9 13.4l3.3-1.1M18.4 17.9l2 2.8M13.6 17.9l-2 2.8M12.1 13.4L8.8 12.3" stroke="#0b2214" stroke-width="1.5" stroke-linecap="round" fill="none"/><circle cx="16" cy="16" r="9" fill="none" stroke="#0b2214" stroke-width="1.4"/></g></svg><span>What If <b>Football</b></span>' }),
    h('nav', { class: 'nav', 'aria-label': 'Ana gezinti' }, NAV.map(link)),
    h('div', { class: 'top-right' },
      h('button', { class: 'search-btn', onclick: openPalette, 'aria-label': 'Ara', html: `${icon('search')}<span class="tx">Takım, oyuncu, lig ara…</span><kbd>Ctrl K</kbd>` }),
      n ? h('button', { class: 'icon-btn', title: 'Son değişikliği geri al', 'aria-label': 'Geri al', html: icon('undo'), onclick: () => { store.undo(); toast('Son değişiklik geri alındı'); } }) : null,
      n ? h('button', { class: 'icon-btn', title: 'Senaryo bağlantısını kopyala', 'aria-label': 'Paylaş', html: icon('share'), onclick: () => copyShareLink(s) }) : null,
      h('a', { class: `scn-pill ${n ? 'live' : ''}`, href: '#/senaryolar', title: 'Senaryolarım' }, n ? [s.name, h('b', null, `${n} değişiklik`)] : 'Senaryolarım'),
      h('button', { class: 'icon-btn help-btn', title: 'Nasıl kullanılır?', 'aria-label': 'Yardım', onclick: openHelp }, '?'),
      h('button', { class: 'icon-btn', title: dark ? 'Açık tema' : 'Koyu tema', 'aria-label': 'Temayı değiştir', html: icon(dark ? 'sun' : 'moon'), onclick: toggleTheme }),
    ),
  );
  $('#dock').replaceChildren(...NAV.map(link));
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('wif.theme', next); } catch { /* yok */ }
  renderNav(decodeURIComponent(location.hash.slice(1) || '/'));
}

store.subscribe(() => renderNav(decodeURIComponent(location.hash.slice(1) || '/')));
addEventListener('hashchange', route);
route();

addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); }
});
try { if (!localStorage.getItem('wif.seenHelp')) { localStorage.setItem('wif.seenHelp', '1'); setTimeout(openHelp, 800); } } catch { /* yok */ }

// 3D eğilen kartlar: imleç konumuna göre hafif perspektif ve ışık
document.addEventListener('pointermove', e => {
  const t = e.target.closest?.('.tile'); if (!t || e.pointerType === 'touch') return;
  const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
  t.style.setProperty('--ry', `${((x - 0.5) * 9).toFixed(2)}deg`); t.style.setProperty('--rx', `${(-(y - 0.5) * 9).toFixed(2)}deg`);
  t.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`); t.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
});
document.addEventListener('pointerout', e => { const t = e.target.closest?.('.tile'); if (t && !t.contains(e.relatedTarget)) { t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg'); } });
