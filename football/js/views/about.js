// Veri ve yöntem: kaynaklar, lisanslar, hesaplama yöntemlerinin kısa özeti, sınırlar.
import { h, mount, setCrumbs } from '../util.js';
import { pageHead, sheet } from '../ui.js';
import { loadManagers, loadChanges } from '../data.js';

const SOURCES = [
  ['Transfermarkt veri seti (dcaribou/transfermarkt-datasets)', 'Maçlar ve hoca adları, oyuncular, piyasa değeri geçmişi, transferler, kulüpler', 'CC0 (kamu malı); topluluğun herkese açık veri seti. Transfermarkt sitesinden doğrudan veri çekilmez.', 'https://github.com/dcaribou/transfermarkt-datasets'],
  ['martj42/international_results', '1872’den beri milli maçlar', 'CC0', 'https://github.com/martj42/international_results'],
  ['openfootball/england, jalapic/engsoccerdata', '2000’den itibaren İngiltere ve diğer ligler', 'Açık lisans / kamu malı', 'https://github.com/openfootball'],
  ['Wikidata', 'Güncel başkan, genel müdür, sahipler, hoca', 'CC0', 'https://www.wikidata.org'],
  ['ESPN açık JSON API', 'Güncel sezon sonuçları, maç olayları, kadrolar', 'Belgesiz API; yalnızca kişisel/tanıtım amaçlı küçük ölçekte kullanılır', 'https://www.espn.com'],
  ['Fantasy Premier League API', 'Premier League sakatlıkları', 'Herkese açık API', 'https://fantasy.premierleague.com'],
  ['TheSportsDB', 'Kulüp armaları', 'Topluluk veritabanı; armalar sahiplerine aittir', 'https://www.thesportsdb.com'],
];

export async function render(app) {
  setCrumbs('Veri ve yöntem');
  const [M, CH] = await Promise.all([loadManagers(), loadChanges()]);
  const p = (...c) => h('p', { style: 'max-width:78ch;margin:0 0 10px' }, ...c);
  mount(app,
    pageHead('Veri ve yöntem', 'Neye dayanıyoruz, nasıl hesaplıyoruz, nerede yanılabiliriz.'),
    h('div', { class: 'grid', style: 'gap:18px' },
      sheet(h('h2', null, 'Veri kaynakları'), h('div', { style: 'overflow:auto' }, h('table', { class: 'tbl' },
        h('thead', null, h('tr', null, h('th', null, 'Kaynak'), h('th', null, 'Ne için'), h('th', null, 'Lisans / not'))),
        h('tbody', null, SOURCES.map(([n, w, l, u]) => h('tr', null, h('td', null, h('a', { href: u, target: '_blank', rel: 'noopener' }, n)), h('td', { class: 'dim' }, w), h('td', { class: 'dim' }, l)))))),
        { tight: true }),
      sheet(h('h2', null, 'Takım gücü nasıl hesaplanıyor?'), h('div', null,
        p(h('b', null, 'Oyuncu: '), 'piyasa değerinin logaritması yetenek ölçüsüdür; genç oyuncunun değeri potansiyeli de içerdiği için yaşa göre düzeltilir. Mevki dışında oynayan oyuncu, mevki uyumu kadar katkı verir (FIFA’daki “mevki dışı” cezası gibi).'),
        p(h('b', null, 'Takım: '), 'ilk 11’in mevkilere göre ağırlıklı hücum ve savunma kalitesi. Kulübün sezon başı Elo’su gerçek kadronun gücünü taşır; senin değişikliğin yalnızca bunun üstüne FARK olarak eklenir. İlk 11’in ortalama yeteneğinde bir birimlik fark ≈ 170 Elo’dur.'),
        p(h('b', null, 'Kimya: '), 'FIFA’daki gibi komşu mevkilerdeki oyuncular arasında bağlar kurulur. Bağ gücü; birlikte oynadıkları ay (Transfermarkt kulüp geçmişinden), ortak uyruk ve aynı ligi bilmeleriyle artar. Yeni gelen oyuncu kulübe ~1,5 yılda tam uyum sağlar. Kimyadaki fark ≈ 85 Elo/birim, en fazla ±60 Elo.'),
        p(h('b', null, 'Teknik direktör: '), 'her hocanın kulüpten bağımsız hücum ve savunma etkisi, kulüp-dönem etkisiyle birlikte tahmin edilen bir istatistik modelinden (ridge regresyon) bulunur; az maçlı hocalar ortalamaya çekilir. Ayrıca hocanın en çok kullandığı diziliş bilinir; farklı dizilişte küçük bir uyum cezası vardır.'),
        p(h('b', null, 'Sonuç: '), 'hücum/savunma farkından beklenen gol, buradan Poisson ile skor olasılıkları (ve istenirse 2D canlı maç).'))),
      sheet(h('h2', null, 'Sınırlar'), h('div', null,
        p('Piyasa değeri oyun kalitesinin kusurlu bir göstergesidir: sakatlık, form, oyun tarzı, ruh hâli ve taktik uyumu bilinmez. Oyuncu özellikleri (hız, şut gücü gibi FM tarzı nitelikler) ücretsiz ve düzenli bir kaynakta yok; bu yüzden modellenmez.'),
        p('Güncel piyasa değerleri Transfermarkt veri setinin son güncellemesindendir (Eylül 2026); o tarihten sonraki değer değişimleri yoktur. Yardımcı hocalar, sportif direktör gibi kadro dışı personel verisi yoktur.'),
        p('Bu site resmî bir kaynak değildir ve bahis amaçlı kullanılmamalıdır; olasılıklar bir model tahminidir.'))),
      sheet(h('h2', null, 'Güncel durum'), h('div', { class: 'dim' },
        `Hoca/başkan verisi: ${M.asOf || '—'} · Son güncelleme: ${CH.updated ? new Date(CH.updated).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}. Veri her gece 00.05’te (Türkiye saati) yenilenir.`))));
}
