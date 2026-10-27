import { h, mount, setCrumbs, go, toast } from '../util.js';
import { pageHead, sheet, emptyState } from '../ui.js';
import { decodeScenario, importShared } from '../palette.js';

export async function render(app, data) {
  setCrumbs('Paylaşılan senaryo');
  let sc;
  try { sc = decodeScenario(data); if (!Array.isArray(sc.edits)) throw new Error(); } catch { mount(app, emptyState('Bağlantı okunamadı', 'Bağlantı eksik ya da bozuk olabilir.', h('a', { class: 'btn', href: '#/' }, 'Ana sayfa'))); return; }
  const first = sc.edits.find(e => e.t === 'result' || e.t === 'pens');
  const target = first ? `/${first.comp && ['CL', 'EL', 'FAC', 'CDR', 'DFB', 'CIT', 'UCOL'].includes(first.comp) ? 'kupa' : 'lig'}/${first.comp}/${first.season}` : first?.t === 'transfer' ? `/transfer/${first.season}` : '/senaryolar';
  mount(app, pageHead(sc.name || 'Paylaşılan senaryo', `${sc.edits.length} değişiklik içeriyor. İçe aktarırsan senin senaryolarına eklenir.`,
    h('button', { class: 'btn primary', onclick: () => { importShared(sc); toast('Senaryo eklendi'); go(target); } }, 'İçe aktar ve aç')),
  sheet('Değişiklikler', h('ul', { class: 'list-plain', style: 'margin:calc(var(--pad) * -1)' }, sc.edits.map(e => h('li', null, h('span', { class: 'chip' }, ({ result: 'Skor', transfer: 'Transfer', intl: 'Milli', pens: 'Penaltı' }[e.t] || e.t)), h('span', null, e.label || '')))), {}));
}
