import { h, mount, setCrumbs, fmtDate, norm, debounce } from '../util.js';
import { boot, sheet, crestFor } from '../ui.js';
import { loadUpcoming, loadChanges } from '../data.js';
import * as store from '../store.js';
import { icon } from '../icons.js';

const POPULAR = ['Galatasaray', 'Fenerbahce', 'Beşiktaş Jimnastik Kulübü', 'Trabzonspor', 'Real Madrid', 'FC Barcelona', 'Manchester United', 'Liverpool FC', 'Manchester City', 'Bayern Munich', 'Juventus FC', 'Inter Milan'];

const TILES = [
  ['/lig', 'Lig & Sezon', 'Bir maçın skorunu değiştir; tabloyu, Avrupa kontenjanını ve tahmini geliri gör.', 'table'],
  ['/kupa', 'Kupalar', 'Şampiyonlar Ligi, Avrupa Ligi, FA Cup… Grup ve eleme sonuçlarını değiştir.', 'trophy'],
  ['/transfer', 'Transfer', 'Bir transferi iptal et ya da yeni bir transfer kur.', 'transfer'],
  ['/simulator', 'Maç oyna', 'İlk 11’i, dizilişi ve taktiği seç; maçı 2D izle ya da binlerce kez oynat.', 'sim'],
  ['/haberler', 'Günün haberleri', 'Her lige o günün sonuçları: kim kazandı, kaç kaç bitti, goller kaçıncı dakikada, kartlar.', 'news'],
  ['/hocalar', 'Teknik direktörler', 'Hoca geçmişi ve puanı; “ya şu hoca olsaydı?” senaryosu.', 'manager'],
  ['/milli', 'Milli Takımlar', '1872’den beri Elo, geçmiş maçlarda what-if.', 'globe'],
];

export async function render(app) {
  const ctx = await boot();
  setCrumbs();
  const idByName = n => Number(Object.keys(ctx.clubs).find(k => ctx.clubs[k].n === n && ctx.clubs[k].c) || 0);
  const popular = POPULAR.map(idByName).filter(Boolean);
  const leagueClubs = Object.entries(ctx.clubs).filter(([, c]) => c.c && ctx.comps[c.c]?.type === 'league' && ctx.comps[c.c].tier === 1).map(([id, c]) => ({ id: +id, name: c.n, key: norm(c.n), comp: ctx.compName(c.c) }));
  const up = (await loadUpcoming()).fixtures.filter(f => f.h > 0 && f.a > 0).slice(0, 5);
  const scs = store.scenarios().slice(0, 4);
  const CH = await loadChanges();
  const KIND = { hoca: 'Teknik direktör', baskan: 'Başkan', ceo: 'Genel müdür', sahip: 'Sahip', transfer: 'Transfer', sakat: 'Sakatlık', mac: 'Maç' };
  const chText = r => (r[1] === 'mac' ? r[3].replace(/^([A-Z0-9]+):/, (_, c) => `${ctx.comps[c] ? ctx.compName(c) : c}:`) : r[3]);
  const updatedAt = CH.updated ? new Date(CH.updated).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }) : null;

  // ---- takım arama
  const results = h('div', { class: 'suggest', role: 'listbox', hidden: true });
  const input = h('input', { type: 'search', class: 'hero-search', placeholder: 'Takımını yaz: Galatasaray, Real Madrid, Liverpool…', 'aria-label': 'Takım ara', autocomplete: 'off' });
  const draw = () => {
    const q = norm(input.value).trim();
    const hit = q ? leagueClubs.filter(c => q.split(' ').every(t => c.key.includes(t))).slice(0, 7) : [];
    results.replaceChildren(...hit.map(c => h('a', { class: 'sg', href: `#/takim/${c.id}`, role: 'option' }, crestFor(ctx, c.id), h('span', null, c.name), h('span', { class: 'dim' }, c.comp))));
    results.hidden = !hit.length;
  };
  input.addEventListener('input', debounce(draw, 60));
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { const a = results.querySelector('a'); if (a) location.hash = a.getAttribute('href'); } });

  const examples = [
    ['Fenerbahçe 2015/16', 'Şampiyon olmak için kaç sonucu çevirmek yeterdi?', `#/takim/${idByName('Fenerbahce')}/2015`],
    ['Liverpool 2018/19', '97 puan yetmedi. Hangi maç şampiyonluğu getirirdi?', `#/takim/${idByName('Liverpool FC')}/2018`],
    ['Bellingham Dortmund’da kalsaydı', 'Real Madrid ve Dortmund’un sezonu nasıl değişirdi?', '#/transfer/2023'],
    ['Barcelona 0-4’ü yemeseydi', 'Şampiyonlar Ligi 2018/19 yarı finali rövanşı 0-0 bitseydi?', '#/kupa/CL/2018'],
    ['Galatasaray – Fenerbahçe', 'İlk 11’leri sen seç, 100.000 kez oynat.', `#/simulator/h=${idByName('Galatasaray')}&a=${idByName('Fenerbahce')}`],
  ];

  // ---- 3D sahne
  const stage = h('section', { class: 'stage', 'aria-label': 'Etkileşimli stadyum sahnesi' });
  const call = h('div', { class: 'stage-call', 'aria-hidden': 'true' });
  const hudG = h('b', null, '0'), hudS = h('b', null, '0');
  const flash = (text, cls) => { call.className = 'stage-call'; void call.offsetWidth; call.textContent = text; call.className = `stage-call show ${cls || ''}`; };
  stage.append(
    h('div', { class: 'stage-scrim' }),
    h('div', { class: 'stage-hud' }, h('div', { class: 'hud-score' }, h('div', null, hudG, h('span', null, 'Gol')), h('div', null, hudS, h('span', null, 'Şut'))), h('div', { class: 'hud-hint' }, 'Sahaya dokun — topa vur, kaleciyi geç')),
    call,
    h('div', { class: 'stage-ui' },
      h('h1', null, 'Ya şöyle ', h('em', null, 'olsaydı?')),
      h('p', { class: 'lead' }, 'Gerçek futbol tarihinde tek bir maçı, transferi ya da penaltıyı değiştir. Tabloya, kupalara, paraya ve sonraki yıllara etkisini hesapla.'),
      h('div', { class: 'hero-box' }, input, results),
      h('div', { class: 'chips-row' }, h('span', { class: 'cap' }, 'Hızlı seç:'), ...popular.slice(0, 8).map(id => h('a', { class: 'btn sm', href: `#/takim/${id}` }, crestFor(ctx, id), ctx.clubName(id).replace(/ Jimnastik Kulübü| FC$/g, ''))))));
  window.__stage?.destroy?.(); window.__stage = null;
  import('../stadium3d.js').then(async m => {
    const api = await m.mountStadium(stage, {
      onShot: n => { hudS.textContent = n; },
      onGoal: n => { hudG.textContent = n; flash('Gol!', 'goal'); },
      onSave: () => flash('Kurtardı!'), onWood: () => flash('Direk!'),
    });
    if (!api) stage.classList.add('nogl'); else window.__stage = api;
  }).catch(() => stage.classList.add('nogl'));

  mount(app, stage,
    h('div', { class: 'section-h' }, 'Hazır senaryolar'),
    h('div', { class: 'grid ex-grid' }, examples.map(([t, d, href]) => h('a', { class: 'tile ex', href }, h('h3', null, t), h('p', null, d), h('span', { class: 'go' }, 'Dene →')))),
    h('div', { class: 'section-h' }, 'Neler yapabilirsin'),
    h('div', { class: 'grid', style: 'grid-template-columns:repeat(auto-fill,minmax(220px,1fr))' },
      TILES.map(([href, t, d, ic]) => h('a', { class: 'tile', href: '#' + href }, h('span', { class: 'ic', html: icon(ic) }), h('h3', null, t), h('p', null, d)))),
    h('div', { class: 'grid cols-2', style: 'margin-top:40px' },
      sheet('Yaklaşan maçlar', up.length ? h('ul', { class: 'list-plain', style: 'margin:calc(var(--pad) * -1)' }, up.map(f => h('li', null,
        h('span', { class: 'dim', style: 'width:54px' }, fmtDate(f.date).slice(0, -5)), h('span', { class: 'chip' }, ctx.compName(f.comp)),
        h('span', { style: 'flex:1' }, `${ctx.clubName(f.h)} – ${ctx.clubName(f.a)}`),
        h('a', { class: 'btn sm mk', href: `#/simulator/h=${f.h}&a=${f.a}` }, 'Simüle et')))) : h('div', { class: 'dim' }, 'Yaklaşan maç verisi yok.')),
      sheet('Son güncellemeler', CH.items.length ? h('div', null, h('ul', { class: 'list-plain', style: 'margin:calc(var(--pad) * -1);max-height:340px;overflow:auto' }, CH.items.slice(0, 40).map(r => h('li', null,
        h('span', { class: 'dim', style: 'width:54px' }, fmtDate(r[0]).slice(0, -5)), h('span', { class: 'chip' }, KIND[r[1]] || r[1]),
        r[2] && ctx.clubs[r[2]] ? h('a', { style: 'flex:1', href: `#/takim/${r[2]}` }, chText(r)) : h('span', { style: 'flex:1' }, chText(r)))))) : h('div', { class: 'dim' }, 'Henüz kaydedilmiş değişiklik yok. Veri her güncellendiğinde yeni maç sonuçları, transferler, sakatlıklar ve hoca/başkan değişiklikleri burada listelenir.'),
        { actions: [updatedAt ? h('span', { class: 'dim', style: 'font-size:12.5px' }, `Veri: ${updatedAt}`) : null] }),
      sheet('Senaryolarım', scs.length
        ? h('ul', { class: 'list-plain', style: 'margin:calc(var(--pad) * -1)' }, scs.map(s => h('li', null,
          h('span', { style: 'flex:1' }, h('b', null, s.name), h('span', { class: 'dim' }, `  ${s.edits.length} değişiklik`)),
          h('button', { class: 'btn sm', onclick: () => { store.setActive(s.id); location.hash = '#/senaryolar'; } }, 'Aç'))))
        : h('div', { class: 'dim' }, 'İlk değişikliğini yaptığında senaryon burada saklanır.'))));
}
