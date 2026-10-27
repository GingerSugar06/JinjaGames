import { h, mount, setCrumbs, toast, fmtDate } from '../util.js';
import { pageHead, sheet, emptyState } from '../ui.js';
import { copyShareLink } from '../palette.js';
import * as store from '../store.js';

export async function render(app) {
  setCrumbs('Senaryolar');
  const draw = () => {
    const list = store.scenarios(), act = store.active();
    const file = h('input', { type: 'file', accept: '.json', hidden: true, onchange: async e => { try { store.importJSON(await e.target.files[0].text()); toast('İçe aktarıldı'); draw(); } catch (err) { toast('Dosya okunamadı'); } } });
    const exportBtn = h('button', { class: 'btn', onclick: () => {
      const url = URL.createObjectURL(new Blob([store.exportJSON()], { type: 'application/json' }));
      const a = h('a', { href: url, download: 'what-if-senaryolar.json' }); document.body.append(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } }, 'Dışa aktar');
    mount(app, pageHead('Senaryolar', 'Yaptığın tüm değişiklikler bu tarayıcıda saklanır. Dışa aktararak yedekleyebilirsin.',
      file, h('button', { class: 'btn', onclick: () => file.click() }, 'İçe aktar'), exportBtn,
      h('button', { class: 'btn primary', onclick: () => { store.newScenario(); draw(); } }, 'Yeni senaryo')),
    list.length ? h('div', { class: 'grid' }, list.map(s => sheet(
      h('div', { style: 'display:flex;align-items:center;gap:10px;flex:1' },
        h('input', { type: 'text', value: s.name, 'aria-label': 'Senaryo adı', style: 'font:600 16px var(--font-c);width:260px', onchange: e => store.rename(s.id, e.target.value || 'Adsız') }),
        s.id === act?.id ? h('span', { class: 'chip mk' }, 'Aktif') : null),
      s.edits.length ? h('ul', { class: 'list-plain', style: 'margin:calc(var(--pad) * -1)' }, s.edits.map((e, i) => h('li', null,
        h('span', { class: 'chip' }, ({ result: 'Skor', transfer: 'Transfer', intl: 'Milli', pens: 'Penaltı' }[e.t] || e.t)), h('span', { style: 'flex:1' }, e.label || (e.t === 'result' ? `Maç #${e.id}` : `Oyuncu #${e.pid}`)),
        h('button', { class: 'btn sm ghost', onclick: () => { s.edits.splice(i, 1); store.setActive(s.id); draw(); } }, 'Kaldır')))) : h('div', { class: 'dim' }, 'Bu senaryoda henüz değişiklik yok.'),
      { actions: [s.id !== act?.id ? h('button', { class: 'btn sm', onclick: () => { store.setActive(s.id); draw(); } }, 'Aktif yap') : null,
        h('button', { class: 'btn sm', onclick: () => copyShareLink(s) }, 'Bağlantı kopyala'),
        h('span', { class: 'dim', style: 'font-size:12px' }, fmtDate(new Date(s.created).toISOString())),
        h('button', { class: 'btn sm ghost', onclick: () => { if (confirm(`“${s.name}” silinsin mi?`)) { store.remove(s.id); draw(); } } }, 'Sil')] }))) : emptyState('Kayıtlı senaryo yok', 'Bir lig sezonunda skor değiştirdiğinde senaryo otomatik oluşur.', h('a', { class: 'btn primary', href: '#/lig' }, 'Lig & Sezon’a git')));
  };
  draw();
}
