import { h, mount, setCrumbs } from '../util.js';
import { pageHead } from '../ui.js';
import { icon } from '../icons.js';

const OPTIONS = [
  ['#/lig', 'table', 'Bir maçın sonucunu', 'Bir skoru değiştir. Şampiyon kim olurdu, Avrupa’ya kim giderdi, kim küme düşerdi?', 'Maç seç'],
  ['#/transfer', 'transfer', 'Bir transferi', 'Gerçekleşen bir transferi iptal et ya da hiç olmamış bir transfer yap. Takımlar nasıl değişirdi?', 'Transfer seç'],
  ['#/kupa', 'trophy', 'Bir kupa maçını', 'Şampiyonlar Ligi, Avrupa Ligi, FA Cup… Bir maçı ya da penaltıyı değiştir, kupayı kim kazanırdı?', 'Kupa seç'],
  ['#/milli', 'globe', 'Bir milli maçı', 'Dünya Kupası, EURO ve diğer milli maçlar. Sonucu değiştir, güç sıralaması nasıl değişir?', 'Milli maç seç'],
];

export async function render(app) {
  setCrumbs('Geçmişi değiştir');
  mount(app,
    pageHead('Neyi değiştirmek istersin?', 'Birini seç. Sonrasında ne yapacağını adım adım gösteririz.'),
    h('div', { class: 'grid', style: 'grid-template-columns:repeat(auto-fit,minmax(250px,1fr))' }, OPTIONS.map(([href, ic, t, d, go]) =>
      h('a', { class: 'tile big', href }, h('span', { class: 'ic', html: icon(ic) }), h('h3', null, t), h('p', null, d), h('span', { class: 'go' }, `${go} →`)))),
    h('div', { class: 'section-h' }, 'Takımınla başlamak ister misin?'),
    h('a', { class: 'btn lg', href: '#/takimlar' }, 'Takımımı seç →'),
    h('p', { class: 'dim', style: 'max-width:60ch;margin-top:10px' }, 'Takım sayfasında “Senaryo atölyesi” var: hedefini seç (şampiyonluk, Avrupa, ligde kalmak), hangi sonuçları çevirmen gerektiğini senin yerine bulalım.'));
}
