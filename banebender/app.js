/* BaneBender wiki: arayüz, yönlendirme ve mod sayfaları.
   Veri: data/generated.js (mod dosyalarından otomatik) + data/mods.js (elle yazılmış). */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var GEN = window.BB_GEN || {}, MODS = window.BB_MODS || [], CATS = window.BB_CATS || [], PROF = window.BB_PROFILE || {};
  var BY = {}; MODS.forEach(function (m, i) { m.i = i; m.g = GEN[m.slug] || {}; BY[m.slug] = m; });
  var COLS = 12, CELL = 32;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches;

  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function L() { return root.getAttribute('data-lang') === 'tr' ? 'tr' : 'en'; }
  /* iki dilli metin: {en,tr} ya da düz metin */
  function bi(o, tag) {
    if (o == null) return '';
    if (typeof o === 'string') return esc(o);
    tag = tag || 'span';
    if (o.en === o.tr || o.tr == null) return esc(o.en);
    return '<' + tag + ' class="en i">' + esc(o.en) + '</' + tag + '><' + tag + ' class="tr i">' + esc(o.tr) + '</' + tag + '>';
  }
  function biBlock(o, tag, cls) {
    tag = tag || 'p';
    if (typeof o === 'string') return '<' + tag + (cls ? ' class="' + cls + '"' : '') + '>' + esc(o) + '</' + tag + '>';
    return '<' + tag + ' class="en' + (cls ? ' ' + cls : '') + '">' + esc(o.en) + '</' + tag + '><' + tag + ' class="tr' + (cls ? ' ' + cls : '') + '">' + esc(o.tr) + '</' + tag + '>';
  }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function fmtDate(iso) {
    var p = iso.split('-'), mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], ay = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    return { en: (+p[2]) + ' ' + mo[+p[1] - 1] + ' ' + p[0], tr: (+p[2]) + ' ' + ay[+p[1] - 1] + ' ' + p[0] };
  }
  function catName(id) { for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i]; return { en: id, tr: id }; }
  function logo(m, small) { return 'img/' + m.slug + '/logo' + (small ? '-s' : '') + '.webp'; }

  /* ---------------- DİL ---------------- */
  function setLang(l) {
    root.setAttribute('data-lang', l); root.lang = l; store('jg_lang', l);
    $$('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-lang') === l ? 'true' : 'false'); });
    var q = $('#q'); if (q) q.placeholder = l === 'tr' ? 'Mod, boss ya da eşya ara' : 'Search mods, bosses, items';
  }
  $$('button[data-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); }); });
  setLang(L());

  /* ---------------- AÇILIŞ ---------------- */
  var boot = $('#boot');
  if (root.classList.contains('seen')) { if (boot) boot.remove(); }
  else setTimeout(function () { boot.classList.add('done'); try { sessionStorage.setItem('bb_seen', '1'); } catch (e) {} setTimeout(function () { boot.remove(); }, 700); }, reduce ? 50 : 1300);

  /* başlık harfleri tek tek düşsün */
  var title = $('#title');
  if (title) title.innerHTML = title.textContent.split('').map(function (c, i) { return '<span style="--i:' + i + '" aria-hidden="true">' + esc(c) + '</span>'; }).join('');

  /* ---------------- RAKAMLAR ---------------- */
  var totalBosses = 0;
  ['frontier-structures', 'pantheon-of-legends', 'towers'].forEach(function (s) { totalBosses += { 'frontier-structures': 10, 'pantheon-of-legends': 15, 'towers': 9 }[s]; });
  totalBosses += 3; /* Hard Mobs */
  var stats = [
    { b: String(MODS.length), en: 'Mods', tr: 'Mod' },
    { b: totalBosses + '+', en: 'Bosses', tr: 'Boss' },
    { b: PROF.downloads + '+', en: 'Downloads', tr: 'İndirme' },
    { b: '1.20.1', en: 'Forge', tr: 'Forge' }
  ];
  $('#stats').innerHTML = stats.map(function (s) { return '<div class="stat"><b>' + esc(s.b) + '</b><span>' + bi(s) + '</span></div>'; }).join('');

  $('#ribbon').innerHTML = (function () { var h = MODS.map(function (m) { return '<span>' + esc(m.g.name || m.slug) + '</span>'; }).join(''); return h + h; })();

  /* ---------------- KATEGORİLER + KARTLAR ---------------- */
  var activeCat = 'all', query = '';
  function countIn(cat) { return cat === 'all' ? MODS.length : MODS.filter(function (m) { return m.cats.indexOf(cat) > -1; }).length; }
  $('#cats').innerHTML = CATS.map(function (c) { return '<button class="cat" type="button" data-cat="' + c.id + '" aria-pressed="' + (c.id === 'all') + '">' + bi(c) + ' <em>' + countIn(c.id) + '</em></button>'; }).join('');

  var FEAT = { 'pale-contagion': 1, 'frontier-structures': 1 };
  $('#grid').innerHTML = MODS.map(function (m, i) {
    var g = m.g, feat = FEAT[m.slug];
    var art = feat
      ? '<img class="bgblur" src="' + logo(m) + '" alt="" loading="lazy"><img class="fg" src="' + logo(m) + '" alt="" loading="lazy">'
      : '<img src="' + logo(m) + '" alt="" loading="lazy" width="400" height="400">';
    return '<a class="card rv' + (feat ? ' feat' : '') + '" href="#/' + m.slug + '" data-slug="' + m.slug + '" style="--ac:' + (g.accent || '#7ed957') + '">' +
      '<div class="art">' + art + '<span class="num">#' + String(i + 1).padStart(2, '0') + '</span>' +
      '<span class="dlc" title="CurseForge downloads"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/></svg>' + m.dl + '</span></div>' +
      '<div class="body"><h3>' + esc(g.name) + '</h3><p>' + bi(m.tag) + '</p><div class="chips">' +
      m.cats.map(function (c) { return '<span class="chip">' + bi(catName(c)) + '</span>'; }).join('') + '</div></div>' +
      '<span class="glare" aria-hidden="true"></span><span class="bar" aria-hidden="true"></span></a>';
  }).join('');
  d.getElementById('grid').style.gridAutoFlow = 'dense';

  /* arama dizini: ad, slogan, kategori, varlık ve eşya adları (iki dilde) */
  MODS.forEach(function (m) {
    var g = m.g, parts = [g.name, m.slug, m.tag.en, m.tag.tr];
    (g.entities || []).forEach(function (e) { parts.push(e.en, e.tr); });
    (g.sprites || []).forEach(function (e) { parts.push(e.en, e.tr); });
    var ls = g.lists || {}; Object.keys(ls).forEach(function (k) { ls[k].forEach(function (e) { parts.push(e.en, e.tr); }); });
    m.cats.forEach(function (c) { var n = catName(c); parts.push(n.en, n.tr); });
    m.idx = parts.join(' ').toLocaleLowerCase('tr');
  });
  function applyFilter() {
    var shown = 0, q = query.trim().toLocaleLowerCase('tr');
    $$('.card').forEach(function (el) {
      var m = BY[el.getAttribute('data-slug')];
      var ok = (activeCat === 'all' || m.cats.indexOf(activeCat) > -1) && (!q || m.idx.indexOf(q) > -1);
      el.classList.toggle('hide', !ok); if (ok) { shown++; el.classList.add('in'); }
    });
    $('#nores').classList.toggle('on', shown === 0);
  }
  $$('[data-cat]').forEach(function (b) {
    b.addEventListener('click', function () {
      activeCat = b.getAttribute('data-cat');
      $$('[data-cat]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      applyFilter();
    });
  });
  var qi = $('#q');
  qi.addEventListener('input', function () { query = qi.value; applyFilter(); });
  d.addEventListener('keydown', function (e) {
    if (e.key === '/' && d.activeElement !== qi && !$('#page').classList.contains('open')) { e.preventDefault(); qi.focus(); qi.scrollIntoView({ block: 'center' }); }
  });

  /* kart eğimi */
  if (fine && !reduce) {
    $$('.card').forEach(function (c) {
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.transform = 'rotateY(' + ((x - .5) * 14) + 'deg) rotateX(' + ((.5 - y) * 12) + 'deg) translateZ(10px)';
        c.style.setProperty('--gx', (x * 100) + '%'); c.style.setProperty('--gy', (y * 100) + '%');
      });
      c.addEventListener('mouseleave', function () { c.style.transform = ''; });
    });
  }

  /* dünyalar (kategori kısayolları) */
  var BIO = [
    { c: 'adventure', col: '#ff9a3d', en: 'Lairs, towers and shrines with bosses that need a trick.', tr: 'Hile isteyen boss’larla inler, kuleler ve tapınaklar.' },
    { c: 'magic', col: '#a77bff', en: 'Six elements, spellbooks and the gods of two mythologies.', tr: 'Altı element, büyü kitapları ve iki mitolojinin tanrıları.' },
    { c: 'tech', col: '#3fc1ff', en: 'Power grids, machines and storage that works for you.', tr: 'Enerji şebekeleri, makineler ve senin için çalışan depolar.' },
    { c: 'horror', col: '#ff4d4d', en: 'A spreading infection and a dream you should not follow.', tr: 'Yayılan bir enfeksiyon ve izlememen gereken bir rüya.' }
  ];
  $('#biomes').innerHTML = BIO.map(function (b) {
    return '<a class="biome rv" href="#mods" data-go="' + b.c + '" style="--bc:' + b.col + '"><b>' + bi(catName(b.c)) + '</b><span>' + bi(b) + '</span><i aria-hidden="true"></i></a>';
  }).join('');
  $$('[data-go]').forEach(function (a) {
    a.addEventListener('click', function () { var b = $('[data-cat="' + a.getAttribute('data-go') + '"]'); if (b) b.click(); });
  });

  /* ---------------- GÖRÜNÜNCE ---------------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .06, rootMargin: '0px 0px -40px 0px' }) : null;
  function observe(scope) { $$('.rv', scope).forEach(function (el) { if (io) io.observe(el); else el.classList.add('in'); }); }
  observe(d);

  /* üst bar */
  var top = $('#top');
  window.addEventListener('scroll', function () { top.classList.toggle('stuck', (window.scrollY || 0) > 20); }, { passive: true });
  $('#yr').textContent = new Date().getFullYear();

  /* ---------------- İPUCU (Minecraft tarzı) ---------------- */
  var tip = $('#tip');
  function showTip(el, x, y) {
    var nm = L() === 'tr' ? el.getAttribute('data-tr') : el.getAttribute('data-en');
    var other = L() === 'tr' ? el.getAttribute('data-en') : el.getAttribute('data-tr');
    tip.innerHTML = esc(nm) + (other && other !== nm ? '<em>' + esc(other) + '</em>' : '') + '<small>' + esc(el.getAttribute('data-mod')) + '</small>';
    tip.classList.add('on'); moveTip(x, y);
  }
  function moveTip(x, y) {
    var w = tip.offsetWidth, h = tip.offsetHeight, vw = window.innerWidth;
    var left = x + 14, topp = y - h - 10;
    if (left + w > vw - 8) left = x - w - 14;
    if (topp < 8) topp = y + 18;
    tip.style.left = left + 'px'; tip.style.top = topp + 'px';
  }
  function hideTip() { tip.classList.remove('on'); }
  d.addEventListener('mouseover', function (e) { var s = e.target.closest && e.target.closest('.slot2'); if (s) showTip(s, e.clientX, e.clientY); });
  d.addEventListener('mousemove', function (e) { if (tip.classList.contains('on')) moveTip(e.clientX, e.clientY); });
  d.addEventListener('mouseout', function (e) { var s = e.target.closest && e.target.closest('.slot2'); if (s && !s.contains(e.relatedTarget)) hideTip(); });
  d.addEventListener('focusin', function (e) { var s = e.target.closest && e.target.closest('.slot2'); if (s) { var r = s.getBoundingClientRect(); showTip(s, r.left + r.width / 2, r.top); } });
  d.addEventListener('focusout', function (e) { if (e.target.closest && e.target.closest('.slot2')) hideTip(); });
  d.addEventListener('touchstart', function (e) { var s = e.target.closest && e.target.closest('.slot2'); if (s) { var t = e.touches[0]; showTip(s, t.clientX, t.clientY); } else hideTip(); }, { passive: true });

  /* ---------------- IŞIK KUTUSU ---------------- */
  var lb = $('#lb'), lbImg = $('img', lb), lbList = [], lbI = 0;
  function lbShow(i) { lbI = (i + lbList.length) % lbList.length; lbImg.src = lbList[lbI].src; lbImg.alt = lbList[lbI].alt || ''; $('.cnt', lb).textContent = (lbI + 1) + ' / ' + lbList.length; }
  function lbOpen(list, i) { lbList = list; lbShow(i); lb.classList.add('open'); }
  function lbClose() { lb.classList.remove('open'); }
  $('.x', lb).addEventListener('click', lbClose);
  $('.pv', lb).addEventListener('click', function () { lbShow(lbI - 1); });
  $('.nx', lb).addEventListener('click', function () { lbShow(lbI + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lbClose(); });

  /* ---------------- MOD SAYFASI ---------------- */
  var page = $('#page'), wipe = $('#wipe');
  wipe.innerHTML = new Array(12 * 8 + 1).join('<i></i>');
  var cells = $$('i', wipe);
  cells.forEach(function (c, i) { var col = i % 12, row = Math.floor(i / 12); c.style.transitionDelay = ((col + row) * 14) + 'ms'; });

  function spriteHTML(m, list) {
    var g = m.g, ex = m.spriteExclude || [];
    var html = '';
    (g.sprites || []).forEach(function (s, i) {
      if (ex.some(function (w) { return s.en.indexOf(w) > -1; })) return;
      var size = 40, x = -(i % COLS) * size, y = -Math.floor(i / COLS) * size;
      html += '<span class="slot2" tabindex="0" data-en="' + esc(s.en) + '" data-tr="' + esc(s.tr) + '" data-mod="' + esc(g.name) + '"><i class="spr" style="background-image:url(img/' + m.slug + '/items.png);background-size:' + (COLS * size) + 'px auto;background-position:' + x + 'px ' + y + 'px" aria-label="' + esc(s.en) + '"></i></span>';
    });
    return html;
  }
  var SKIP = /^(Boss Bolt|Bolt|Spell|Seat|Wheeled Seat|Phylactery|Acid Glob|Wind Charge|Thrown Weapon|Dynamite|Explosive Arrow)$/;
  function bestiaryHTML(m) {
    var b = m.bestiary, ents = (m.g.entities || []).filter(function (e) { return !SKIP.test(e.en) && (!b.exclude || b.exclude.indexOf(e.en) < 0); });
    var seen = {}; ents = ents.filter(function (e) { if (seen[e.en]) return false; seen[e.en] = 1; return true; });
    var total = ents.length, list = ents;
    if (b.limit && ents.length > b.limit) { var step = ents.length / b.limit; list = []; for (var i = 0; i < b.limit; i++) list.push(ents[Math.floor(i * step)]); }
    return '<div class="mini">' + list.map(function (e) { return '<span>' + bi(e) + '</span>'; }).join('') + '</div>' +
      (list.length < total ? '<p class="more">' + bi({ en: list.length + ' of ' + total + ' named creatures in the mod files', tr: 'Mod dosyalarındaki ' + total + ' adlı yaratıktan ' + list.length + ' tanesi' }) + '</p>' : '');
  }
  function lookupStruct(m, en) {
    var l = (m.g.lists && m.g.lists.structures) || [];
    var n = function (x) { return x.replace(/[‘’]/g, "'"); };
    for (var i = 0; i < l.length; i++) if (n(l[i].en) === n(en)) return l[i];
    return { en: en, tr: en };
  }
  function bossCard(m, b) {
    var e = (m.g.entities || [])[b.e] || { en: '?', tr: '?' };
    return '<div class="boss"><div class="bn">' + bi(e) + '</div><div class="bl">' + bi(lookupStruct(m, b.lair)) + '</div><div class="bh">' + bi(b.how) + '</div>' +
      (b.drop ? '<div class="bd"><b>' + esc(b.drop) + '</b>' + (b.power ? ' · ' + bi(b.power) : '') + '</div>' : '') + '</div>';
  }
  var ELCOL = ['#3fa9f5', '#cfe6f2', '#ff6a2b', '#b07a3e', '#9a4ee0', '#4caf50'];
  var SHAPES = {
    'Connected': [0, 1, 0, 1, 1, 0, 0, 1, 1], 'Trees and Ores': [0, 1, 0, 1, 1, 1, 0, 1, 0], 'Tool': [0, 0, 0, 0, 1, 0, 0, 0, 0], 'Tunnel': [0, 0, 0, 0, 1, 0, 0, 1, 0],
    'Wide Tunnel (3x3)': [1, 1, 1, 1, 1, 1, 1, 1, 1], 'Wall': [1, 1, 1, 1, 1, 1, 0, 0, 0], 'Layer': [0, 0, 0, 1, 1, 1, 0, 0, 0], 'Column': [0, 1, 0, 0, 1, 0, 0, 1, 0],
    'Pit': [0, 0, 0, 1, 1, 1, 1, 1, 1], 'Trench': [0, 0, 0, 0, 0, 0, 1, 1, 1], 'Escape Stairs': [0, 0, 1, 0, 1, 0, 1, 0, 0], 'Cube (3x3x3)': [1, 1, 1, 1, 0, 1, 1, 1, 1], 'Sphere': [0, 1, 0, 1, 1, 1, 0, 1, 0]
  };
  function chipsFromList(m, names) {
    var pool = []; var ls = m.g.lists || {};
    ['effects', 'advancements'].forEach(function (k) { (ls[k] || []).forEach(function (x) { pool.push(x); }); });
    return '<div class="chips2">' + names.map(function (n) { var f = pool.filter(function (p) { return p.en === n; })[0]; return '<span>' + bi(f || n) + '</span>'; }).join('') + '</div>';
  }

  function sectionHTML(m, s, idx) {
    var id = 's' + idx, h = '<h2 class="blockh" id="' + id + '">' + bi(s.h) + '</h2>';
    if (s.p) h += biBlock(s.p);
    if (s.list) h += '<ul class="ul">' + s.list.map(function (li) { return '<li>' + bi(li) + '</li>'; }).join('') + '</ul>';
    if (s.cards) h += '<div class="bgrid">' + s.cards.map(function (c) { return '<div class="boss"><div class="bn">' + esc(c.t) + '</div>' + (c.sub ? '<div class="bl">' + bi(c.sub) + '</div>' : '') + '<div class="bh">' + bi(c) + '</div></div>'; }).join('') + '</div>';
    if (s.table) h += '<div class="tblwrap"><table class="tbl"><thead><tr>' + s.table.cols.map(function (c) { return '<th>' + bi(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      s.table.rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + bi(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
    if (s.chips === 'structures') { var st = (m.g.lists && m.g.lists.structures) || []; h += '<div class="chips2">' + st.map(function (x) { return '<span>' + bi(x) + '</span>'; }).join('') + '</div>'; }
    if (s.chips === 'spells') {
      var sp = ((m.g.lists && m.g.lists.spells) || []).filter(function (x) { return x.en.indexOf('%') < 0; });
      var seen = {}; sp = sp.filter(function (x) { if (seen[x.en]) return false; seen[x.en] = 1; return true; });
      h += '<div class="chips2">' + sp.slice(0, 100).map(function (x) { return '<span>' + bi(x) + '</span>'; }).join('') + '</div>' +
        '<p class="more">' + bi({ en: sp.length + ' spell and sword art names in the mod files', tr: 'Mod dosyalarında ' + sp.length + ' büyü ve kılıç sanatı adı' }) + '</p>';
    }
    if (s.chipsList) h += chipsFromList(m, s.chipsList);
    if (s.elements) { var els = ((m.g.lists && m.g.lists.elements) || []).slice(0, 6); h += '<div class="els">' + els.map(function (e, i) { return '<div class="el" style="--ec:' + ELCOL[i] + '"><i></i><b>' + bi(e) + '</b></div>'; }).join('') + '</div><p class="note">' + bi({ en: 'An element wand gives +30% damage to spells of its own element.', tr: 'Bir element asası kendi elementinin büyülerine +%30 hasar verir.' }) + '</p>'; }
    if (s.towers) {
      var tw = (m.g.lists && m.g.lists.towers) || [], bosses = m.g.entities || [], gal = m.g.gallery || [];
      h += '<div class="towers">' + m.towerList.map(function (t, i) {
        var shot = t.img ? gal.filter(function (g) { return g.src.indexOf(t.img) > -1 && g.src.indexOf('near') > -1; })[0] : null;
        return '<div class="tower"><div class="ti' + (shot ? '' : ' none') + '"' + (shot ? ' style="background-image:url(img/' + m.slug + '/' + shot.f + '-t.webp)"' : '') + '><span class="dim">' + t.dim + '</span><span class="fl">' + t.floors + 'F</span></div>' +
          '<div class="tb"><div class="tn">' + bi(tw[i] || t.name) + '</div><div class="tbo">' + bi(bosses[i] || t.boss) + '</div><div class="th">' + bi(t.hz) + '</div></div></div>';
      }).join('') + '</div>';
    }
    if (s.variants) {
      var vs = (m.g.lists && m.g.lists.variants) || [], heads = ['Zombie', 'Creeper', 'Skeleton', 'Spider'], headsTr = ['Zombi', 'Creeper', 'İskelet', 'Örümcek'];
      h += heads.map(function (hd, k) { return '<div class="realm">' + bi({ en: hd, tr: headsTr[k] }) + '</div><div class="mini">' + vs.slice(k * 15, k * 15 + 15).map(function (v) { return '<span>' + bi(v) + '</span>'; }).join('') + '</div>'; }).join('');
    }
    if (s.grades) {
      var gr = [['V1', '#55c25a', { en: 'Green', tr: 'Yeşil' }], ['V2', '#4ba3ff', { en: 'Blue', tr: 'Mavi' }], ['V3', '#b46cff', { en: 'Purple', tr: 'Mor' }], ['V4', '#ffc23d', { en: 'Gold', tr: 'Altın' }]];
      h += '<div class="grades">' + gr.map(function (g) { return '<div class="grade" style="--gc:' + g[1] + '"><b>' + g[0] + '</b><span>' + bi(g[2]) + '</span></div>'; }).join('') + '</div>';
    }
    if (s.recipes) {
      var R = [
        { n: { en: 'Uncrafting Table', tr: 'Ters Üretim Masası' }, g: ['Crafting Table', 'Crafting Table', 'Crafting Table', 'Planks', 'Diamond', 'Planks', 'Crafting Table', 'Crafting Table', 'Crafting Table'] },
        { n: { en: 'Unfurnace', tr: 'Ters Fırın' }, g: ['Stone Bricks', 'Stone Bricks', 'Stone Bricks', 'Charcoal', 'Furnace', 'Coal', 'Charcoal', 'Redstone', 'Coal'] }
      ];
      h += '<div class="recipes">' + R.map(function (r) { return '<div class="recipe"><h4>' + bi(r.n) + '</h4><div class="craft">' + r.g.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div></div>'; }).join('') + '</div>';
    }
    if (s.shapes) h += '<div class="shapes">' + s.shapes.map(function (n) { var p = SHAPES[n] || []; return '<div class="shape"><i aria-hidden="true">' + p.map(function (on) { return '<b' + (on ? ' class="on"' : '') + '></b>'; }).join('') + '</i>' + esc(n) + '</div>'; }).join('') + '</div>';
    if (s.cook) h += '<div class="cook"><span class="slot" title="Rotten Flesh"><b class="px" style="color:#3b2a1a;font-size:12px;text-align:center">Rotten<br>Flesh</b></span><span class="arrow">&rarr;</span><span class="slot" title="Leather"><b class="px" style="color:#3b2a1a;font-size:12px">Leather</b></span><span class="fire">' + bi({ en: 'Furnace · Blast Furnace · Smoker · Campfire', tr: 'Fırın · Maden Ocağı · Tütsüleyici · Kamp Ateşi' }) + '</span></div>';
    if (s.quotes) h += '<div class="quotes">' + s.quotes.map(function (q) { return '<q>' + esc(q) + '</q>'; }).join('') + '</div>';
    if (s.note) h += '<p class="note">' + bi(s.note) + '</p>';
    return { html: h, id: id, title: s.h };
  }

  function renderPage(m) {
    var g = m.g, ac = g.accent || '#7ed957', toc = [], secs = '', n = 0;
    m.sections.forEach(function (s) { var r = sectionHTML(m, s, n++); secs += r.html; toc.push(r); });

    if (m.bosses) {
      var id = 's' + (n++), b = m.bosses, bh = '<h2 class="blockh" id="' + id + '">' + bi(b.title) + '</h2>' + (b.intro ? biBlock(b.intro) : '');
      if (b.list) bh += '<div class="bgrid">' + b.list.map(function (x) { return bossCard(m, x); }).join('') + '</div>';
      if (b.realms) b.realms.forEach(function (r) { bh += '<div class="realm">' + bi(r.name) + '</div><div class="bgrid">' + r.list.map(function (x) { return bossCard(m, x); }).join('') + '</div>'; });
      if (b.outro) bh += '<p class="note">' + bi(b.outro) + '</p>';
      secs += bh; toc.push({ id: id, title: b.title });
    }
    if (m.bestiary && (g.entities || []).length) {
      var bid = 's' + (n++); secs += '<h2 class="blockh" id="' + bid + '">' + bi(m.bestiary.title) + '</h2>' + bestiaryHTML(m); toc.push({ id: bid, title: m.bestiary.title });
    }
    var spr = spriteHTML(m);
    if (spr) {
      var iid = 's' + (n++), it = { en: 'Items from the mod files', tr: 'Mod dosyalarından eşyalar' };
      secs += '<h2 class="blockh" id="' + iid + '">' + bi(it) + '</h2><p>' + bi({ en: 'Real textures and names pulled from the mod itself. Hover or tap a slot to read it.', tr: 'Modun kendisinden alınmış gerçek dokular ve adlar. Okumak için bir yuvanın üstüne gel ya da dokun.' }) + '</p><div class="inv">' + spr + '</div>';
      if ((g.counts || {}).itemTextures > (g.sprites || []).length) secs += '<p class="more">' + bi({ en: (g.sprites || []).length + ' shown of ' + g.counts.itemTextures + ' item textures', tr: g.counts.itemTextures + ' eşya dokusundan ' + (g.sprites || []).length + ' tanesi gösteriliyor' }) + '</p>';
      toc.push({ id: iid, title: it });
    }
    if (m.video) {
      var vid = 's' + (n++), vt = { en: 'Video', tr: 'Video' };
      secs += '<h2 class="blockh" id="' + vid + '">' + bi(vt) + '</h2><div class="vid" style="background-image:url(' + logo(m) + ')"><button type="button" data-yt="' + esc(m.video) + '"><i></i>' + bi({ en: 'Play on YouTube', tr: 'YouTube’da oynat' }) + '<small>' + bi({ en: 'The video loads from youtube-nocookie.com only after you press play.', tr: 'Video yalnız oynata bastıktan sonra youtube-nocookie.com’dan yüklenir.' }) + '</small></button></div>';
      toc.push({ id: vid, title: vt });
    }
    var gal = (g.gallery || []).filter(function (x) { return !(m.slug === 'towers' && x.src.indexOf('struct_') > -1 && x.src.indexOf('near') > -1); });
    if (gal.length) {
      var gid = 's' + (n++), gt = { en: 'Gallery', tr: 'Galeri' };
      secs += '<h2 class="blockh" id="' + gid + '">' + bi(gt) + '</h2><div class="gal">' + gal.map(function (x, i) { return '<button type="button" data-gi="' + i + '"><img src="img/' + m.slug + '/' + x.f + '-t.webp" alt="' + esc(g.name) + ' screenshot ' + (i + 1) + '" loading="lazy"></button>'; }).join('') + '</div><p class="more">' + bi({ en: 'From the mod’s CurseForge gallery.', tr: 'Modun CurseForge galerisinden.' }) + '</p>';
      toc.push({ id: gid, title: gt });
    }

    var file = fmtDate(g.fileDate || m.released);
    var langs = (g.langs || []).length > 2 ? { en: g.langs.length + ' languages', tr: g.langs.length + ' dil' } : (g.langs || []).length === 2 ? { en: 'English, Turkish', tr: 'İngilizce, Türkçe' } : { en: 'No text to translate', tr: 'Çevrilecek metin yok' };
    var deps = (g.deps || []).length ? g.deps.join(', ') : { en: 'None', tr: 'Yok' };
    var info = [
      [{ en: 'Minecraft', tr: 'Minecraft' }, g.mc || '1.20.1'], [{ en: 'Loader', tr: 'Yükleyici' }, g.loader || 'Forge'],
      [{ en: 'Version', tr: 'Sürüm' }, g.version || '1.0.0'], [{ en: 'Mod ID', tr: 'Mod kimliği' }, g.modid],
      [{ en: 'Side', tr: 'Taraf' }, { en: 'Client + server', tr: 'İstemci + sunucu' }], [{ en: 'Requires', tr: 'Gerektirir' }, deps],
      [{ en: 'Languages', tr: 'Diller' }, langs],
      [{ en: 'Latest file', tr: 'Son dosya' }, file], [{ en: 'Downloads', tr: 'İndirme' }, { en: m.dl + ' (12 Oct 2026)', tr: m.dl + ' (12 Eki 2026)' }]
    ];
    var i = m.i, prev = MODS[(i - 1 + MODS.length) % MODS.length], next = MODS[(i + 1) % MODS.length];

    page.style.setProperty('--ac', ac);
    page.innerHTML =
      '<div class="pbar"><div class="pbar-in"><a class="pback" href="#/"><span aria-hidden="true">&larr;</span>' + bi({ en: 'All mods', tr: 'Tüm modlar' }) + '</a>' +
      '<span class="pcrumb">BaneBender / ' + bi({ en: 'Mods', tr: 'Modlar' }) + ' / <b>' + esc(g.name) + '</b></span>' +
      '<div class="pnav"><button type="button" data-to="' + prev.slug + '" aria-label="Previous mod"><svg viewBox="0 0 24 24"><path d="m15 5-7 7 7 7"/></svg></button><button type="button" data-to="' + next.slug + '" aria-label="Next mod"><svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></svg></button></div></div><i class="progress" id="prog"></i></div>' +
      '<header class="banner"><div class="bg" style="background-image:url(' + logo(m) + ')"></div><canvas id="motes"></canvas><div class="wrap banner-in">' +
      '<div class="bigicon"><img src="' + logo(m) + '" alt="' + esc(g.name) + ' logo" width="400" height="400"></div><div>' +
      '<div class="cats2">' + m.cats.map(function (c) { return '<span class="chip">' + bi(catName(c)) + '</span>'; }).join('') + '<span class="chip">Forge 1.20.1</span></div>' +
      '<h1>' + esc(g.name) + '</h1><p class="tagl">' + bi(m.tag) + '</p><div class="acts">' +
      '<a class="mcbtn green" href="' + esc(g.url) + '/files" target="_blank" rel="noopener">' + bi({ en: 'Download on CurseForge', tr: 'CurseForge’dan indir' }) + ' ↗</a>' +
      '<a class="mcbtn" href="' + esc(g.url) + '" target="_blank" rel="noopener">' + bi({ en: 'Project page', tr: 'Proje sayfası' }) + ' ↗</a></div></div></div></header>' +
      '<div class="wrap article"><article>' + biBlock(m.lede, 'p', 'lead') + (m.warn ? '<div class="warn">' + bi(m.warn) + '</div>' : '') + secs + '</article>' +
      '<aside class="side"><div class="infobox"><div class="ih"><img src="' + logo(m, true) + '" alt="">' + esc(g.name) + '</div><dl>' +
      info.map(function (r) { return '<dt>' + bi(r[0]) + '</dt><dd>' + bi(r[1]) + '</dd>'; }).join('') + '</dl></div>' +
      '<nav class="toc" aria-label="Contents"><b>' + bi({ en: 'On this page', tr: 'Bu sayfada' }) + '</b>' + toc.map(function (t) { return '<a href="#' + t.id + '" data-toc="' + t.id + '">' + bi(t.title) + '</a>'; }).join('') + '</nav>' +
      '</aside></div>' +
      '<div class="wrap"><div class="pfoot"><button type="button" data-to="' + prev.slug + '"><img src="' + logo(prev, true) + '" alt=""><span><small>' + bi({ en: 'Previous', tr: 'Önceki' }) + '</small><b>' + esc(prev.g.name) + '</b></span></button>' +
      '<button type="button" class="n" data-to="' + next.slug + '"><img src="' + logo(next, true) + '" alt=""><span><small>' + bi({ en: 'Next', tr: 'Sonraki' }) + '</small><b>' + esc(next.g.name) + '</b></span></button></div></div>';

    /* bağlantılar */
    $$('[data-to]', page).forEach(function (b) { b.addEventListener('click', function () { go(b.getAttribute('data-to')); }); });
    $$('[data-toc]', page).forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); var t = d.getElementById(a.getAttribute('data-toc')); if (t) page.scrollTo({ top: t.offsetTop - 80, behavior: reduce ? 'auto' : 'smooth' }); }); });
    var galList = gal.map(function (x) { return { src: 'img/' + m.slug + '/' + x.f + '.webp', alt: g.name }; });
    $$('[data-gi]', page).forEach(function (b) { b.addEventListener('click', function () { lbOpen(galList, +b.getAttribute('data-gi')); }); });
    $$('[data-yt]', page).forEach(function (b) {
      b.addEventListener('click', function () {
        var f = d.createElement('iframe');
        f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(b.getAttribute('data-yt')) + '?autoplay=1&rel=0';
        f.title = g.name + ' video'; f.allow = 'autoplay; encrypted-media; picture-in-picture'; f.allowFullscreen = true;
        b.parentNode.appendChild(f); b.remove();
      });
    });
    motes(ac);
  }

  /* afiş üstünde süzülen piksel tozlar */
  var moteRAF = 0;
  function motes(color) {
    cancelAnimationFrame(moteRAF);
    var c = $('#motes', page); if (!c || reduce) return;
    var ctx = c.getContext('2d'), W, H, P = [];
    function size() { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; }
    size();
    for (var i = 0; i < 46; i++) P.push({ x: Math.random(), y: Math.random(), s: 2 + Math.floor(Math.random() * 3) * 2, v: .0006 + Math.random() * .0016, a: Math.random() * 6.28, o: .25 + Math.random() * .55 });
    (function tick() {
      if (!page.classList.contains('open')) return;
      if (c.offsetWidth !== W) size();
      ctx.clearRect(0, 0, W, H);
      P.forEach(function (p) {
        p.y -= p.v; p.a += .02; if (p.y < -.05) { p.y = 1.05; p.x = Math.random(); }
        ctx.globalAlpha = p.o * (.6 + .4 * Math.sin(p.a)); ctx.fillStyle = color;
        ctx.fillRect(Math.round(p.x * W + Math.sin(p.a) * 8), Math.round(p.y * H), p.s, p.s);
      });
      moteRAF = requestAnimationFrame(tick);
    })();
  }

  /* okuma ilerlemesi + içindekiler vurgusu */
  page.addEventListener('scroll', function () {
    var p = $('#prog'); if (!p) return;
    var max = page.scrollHeight - page.clientHeight; p.style.width = (max > 0 ? page.scrollTop / max * 100 : 0) + '%';
    var cur = null; $$('.blockh', page).forEach(function (h) { if (h.offsetTop - 120 <= page.scrollTop) cur = h.id; });
    $$('[data-toc]', page).forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-toc') === cur); });
  }, { passive: true });

  /* ---------------- YÖNLENDİRME ---------------- */
  var current = null, lastFocus = null;
  function doWipe(color, mid) {
    if (reduce) { mid(); return; }
    wipe.style.setProperty('--wc', color);
    cells.forEach(function (c) { c.style.background = color; });
    wipe.classList.add('on');
    setTimeout(function () { mid(); wipe.classList.remove('on'); }, 420);
  }
  /* Adres çubuğunda # görünmesin: mod sayfaları geçmişe adres değiştirmeden yazılır,
     bölüm bağlantıları yalnız kaydırır. Geri tuşu yine çalışır. */
  var cleanURL = location.pathname + location.search;
  function setState(slug, replace) {
    try { history[replace ? 'replaceState' : 'pushState']({ bb: slug || null }, '', cleanURL); } catch (e) {}
  }
  function route(slug) {
    var m = slug ? BY[slug] : null;
    if (m) {
      if (current === m.slug) return;
      var first = !current; current = m.slug;
      if (first) lastFocus = d.activeElement;
      doWipe(m.g.accent || '#5da33a', function () {
        renderPage(m); page.classList.add('open'); page.scrollTop = 0; d.body.classList.add('locked');
        d.title = m.g.name + ' · BaneBender Mods Wiki';
        var b = $('.pback', page); if (b) b.focus({ preventScroll: true });
      });
    } else if (current) {
      current = null; hideTip(); cancelAnimationFrame(moteRAF);
      page.classList.remove('open'); d.body.classList.remove('locked'); d.title = 'BaneBender · Minecraft Mods Wiki';
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }
    window.dispatchEvent(new Event('bb:route'));
  }
  function go(slug) {
    if ((slug || null) === current) return;
    setState(slug, false); route(slug);
  }
  window.addEventListener('popstate', function (e) { route(e.state && e.state.bb); });
  /* sayfa içi bütün # bağlantıları burada karşılanır */
  d.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var h = a.getAttribute('href');
    if (a.hasAttribute('data-toc')) return;
    e.preventDefault();
    if (h.indexOf('#/') === 0) { go(h.slice(2) || null); if (!h.slice(2)) window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
    var t = d.getElementById(h.slice(1));
    if (current) go(null);
    if (t) setTimeout(function () { t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }, current ? 60 : 0);
  });
  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (lb.classList.contains('open')) lbClose();
      else if (current) go(null);
    } else if (lb.classList.contains('open')) {
      if (e.key === 'ArrowLeft') lbShow(lbI - 1); else if (e.key === 'ArrowRight') lbShow(lbI + 1);
    }
  });
  /* eski #/mod bağlantısıyla gelindiyse o modu aç, sonra adresi temizle */
  (function () {
    var h = location.hash, slug = h.indexOf('#/') === 0 ? h.slice(2) : null;
    setState(BY[slug] ? slug : null, true);
    if (BY[slug]) route(slug);
    else if (h.length > 1) { var t = d.getElementById(h.slice(1)); if (t) setTimeout(function () { t.scrollIntoView(); }, 50); }
  })();
})();
