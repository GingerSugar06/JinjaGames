// Genel arama (Ctrl+K), yardım penceresi ve paylaşım bağlantısı.
import { h, norm, toast, fmtMoney, go } from './util.js';
import { boot, pick } from './ui.js';
import { loadPlayers } from './data.js';
import * as store from './store.js';

let itemsP;
function items() {
  return itemsP ??= (async () => {
    const ctx = await boot();
    const out = [];
    for (const c of Object.values(ctx.comps)) {
      if (!ctx.idx[c.id]) continue;
      if (c.type === 'league') out.push({ id: `/lig/${c.id}`, label: `${c.name} · ${c.country}`, sub: 'lig', tag: 'LİG', tagCls: 'M' });
      else if (['cup', 'euro'].includes(c.type)) out.push({ id: `/kupa/${c.id}`, label: c.name, sub: 'kupa', tag: 'KUPA', tagCls: 'G' });
    }
    for (const [id, c] of Object.entries(ctx.clubs)) if (c.c && ctx.comps[c.c]?.type === 'league') out.push({ id: `/takim/${id}`, label: c.n, sub: ctx.compName(c.c), tag: 'TAKIM', tagCls: 'D' });
    const P = await loadPlayers();
    for (const p of P.list.filter(x => x.value >= 3e6 || (x.peak || 0) >= 2e7).sort((a, b) => b.value - a.value).slice(0, 7000)) out.push({ id: `/oyuncu/${p.id}`, label: p.name, sub: p.nat || '', right: fmtMoney(p.value), tag: 'OYUNCU', tagCls: 'A' });
    out.push({ id: '/milli', label: 'Milli takımlar', sub: 'sayfa', tag: 'SAYFA', tagCls: 'M' }, { id: '/transfer', label: 'Transfer what-if', sub: 'sayfa', tag: 'SAYFA', tagCls: 'M' }, { id: '/simulator', label: 'Maç simülatörü', sub: 'sayfa', tag: 'SAYFA', tagCls: 'M' }, { id: '/senaryolar', label: 'Senaryolarım', sub: 'sayfa', tag: 'SAYFA', tagCls: 'M' });
    return out;
  })();
}

export async function openPalette() {
  const all = await items();
  const id = await pick({ title: 'Ara', items: all, placeholder: 'Takım, oyuncu, lig ya da kupa…', limit: 40 });
  if (id) go(id);
}

export function openHelp() {
  const dlg = h('dialog', { 'aria-label': 'Nasıl kullanılır' });
  const step = (n, t, d) => h('li', { style: 'display:grid;grid-template-columns:30px 1fr;gap:10px;padding:10px 0;border-bottom:1px solid var(--line-soft)' }, h('b', { class: 'mk', style: 'font:700 22px var(--font-c)' }, n), h('div', null, h('b', null, t), h('div', { class: 'mute', style: 'font-size:13px' }, d)));
  dlg.append(h('div', { style: 'padding:16px 18px' },
    h('h3', { style: 'font-size:24px;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px' }, 'Nasıl kullanılır?'),
    h('ul', { class: 'list-plain', style: 'padding:0' },
      step(1, 'Takımını seç', 'Ana sayfada takımını yaz. Senaryo atölyesi, “şampiyon olmak için hangi maçlar?” sorusunu otomatik çözer.'),
      step(2, 'Bir şeyi değiştir', '“Geçmişi değiştir”den bir maç, transfer ya da kupa seç. Skora tıkla, transferi iptal et, penaltıyı çevir. Sarı renk = senin değişikliğin.'),
      step(3, 'Sonucunu gör', 'Tablo, şampiyon, Avrupa ve küme düşme anında güncellenir. İstersen sonraki maçları ve sonraki sezonları da yeniden oynatıp olasılıkları görürsün.'),
      step(4, 'Maçı oyna', '“Maç oyna”da ilk 11’i ve taktiği seç; maçı 2D izle ya da binlerce kez oynatıp olasılıkları gör.'),
      step(5, 'Kaydet ve paylaş', 'Her şey tarayıcıda saklanır. Senaryolar sayfasından link kopyalayabilir ya da dosya olarak yedekleyebilirsin.')),
    h('div', { class: 'dim', style: 'font-size:12.5px;margin-top:10px' }, 'Kısayollar: Ctrl+K arama · Esc pencereyi kapat'),
    h('div', { class: 'row', style: 'justify-content:flex-end;margin-top:12px' }, h('button', { class: 'btn primary', onclick: () => { dlg.close(); dlg.remove(); } }, 'Anladım'))));
  dlg.addEventListener('cancel', () => dlg.remove());
  document.body.append(dlg); dlg.showModal();
}

// ---- paylaşım bağlantısı (sunucusuz: senaryo URL içinde taşınır)
const b64 = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = s => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
export const encodeScenario = sc => b64(JSON.stringify({ n: sc.name, e: sc.edits.map(({ at, ...rest }) => rest) }));
export const decodeScenario = s => { const o = JSON.parse(unb64(s)); return { name: o.n, edits: o.e }; };
export async function copyShareLink(sc) {
  const url = `${location.origin}/#/paylas/${encodeScenario(sc)}`;
  try { await navigator.clipboard.writeText(url); toast('Bağlantı kopyalandı'); } catch { prompt('Bağlantıyı kopyala:', url); }
}
export function importShared(sc) {
  const s = store.newScenario(sc.name || 'Paylaşılan senaryo');
  s.edits = sc.edits.map(e => ({ ...e, at: Date.now() }));
  store.setActive(s.id);
}
