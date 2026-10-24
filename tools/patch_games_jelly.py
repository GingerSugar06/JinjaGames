"""games/index.html: 6 yeni Jelly oyununu ekler (bir kez çalıştırılır): filtre sayıları, kartlar, karşılaştırma tablosu, JSON-LD."""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'games', 'index.html')
t = open(P, encoding='utf8').read()
if 'id="jellyjars"' in t:
    raise SystemExit('zaten uygulanmış')


def sub1(old, new):
    global t
    assert old in t, old[:90]
    t = t.replace(old, new, 1)


G = [
    # slug, ad, sınıf, numara, tür (en, tr), vurgu (en, tr), açıklama (en, tr), üç madde [(en,tr)], düğme, tablo türü
    ('jellyjars', 'Jelly Jars', 'jars', '06', ('Sort puzzle', 'Ayırma bulmacası'),
     ('Pour. Sort. Smile!', 'Dök. Ayır. Gülümse!'),
     ('Pour glossy jelly layers between cozy glass jars until every jar holds a single colour, across 50 sweet worlds.',
      'Parlak jöle katmanlarını şirin cam kavanozlar arasında dök, 50 tatlı dünyada her kavanoz tek renk olsun.'),
     [('Four twists, one at a time: hidden layers, lidded jars, locked jars and mixed jars.', 'Dört sürpriz, tek tek: gizli katmanlar, kapaklı, kilitli ve karışık kavanozlar.'),
      ('Boss levels with a time limit and a move limit together.', 'Süre ve hamle sınırını bir arada getiren patron bölümleri.'),
      ('Free to play with optional ads and gems. An account is optional, only for cloud save.', 'Ücretsiz; reklamlar ve elmaslar isteğe bağlı. Hesap isteğe bağlı, yalnızca bulut kaydı için.')],
     ('Start pouring', 'Dökmeye başla'), ('Sort puzzle', 'Ayırma bulmacası')),
    ('jellylogic', 'Jelly Logic', 'logic', '07', ('Sudoku puzzle', 'Sudoku bulmacası'),
     ('Think. Solve. Smile.', 'Düşün. Çöz. Gülümse.'),
     ('Calm sudoku with a wise jelly owl. Every board has exactly one solution and grows from tiny 4x4 to full 9x9, with a fresh twist in every stretch.',
      'Bilge bir jöle baykuşla sakin sudoku. Her tahtanın tek çözümü var; minik 4x4\'ten tam 9x9\'a büyür ve her aşamada yeni bir sürpriz gelir.'),
     [('Six rules, one at a time: bigger or smaller, odd and even, diagonals, sum cages and jigsaw regions.', 'Altı kural, tek tek: büyük ya da küçük, tek ve çift, çaprazlar, toplam kafesleri ve yapboz bölgeleri.'),
      ('Every new rule starts with a live demo that solves itself.', 'Her yeni kural, kendiliğinden çözülen canlı bir gösterimle başlar.'),
      ('Free to play with optional ads and gems. An account is optional, only for cloud save.', 'Ücretsiz; reklamlar ve elmaslar isteğe bağlı. Hesap isteğe bağlı, yalnızca bulut kaydı için.')],
     ('Solve a grid', 'Bir tablo çöz'), ('Sudoku puzzle', 'Sudoku bulmacası')),
    ('jellyloops', 'Jelly Loops', 'loops', '08', ('Thread puzzle', 'İp bulmacası'),
     ('Pull the thread. Close the loop.', 'İpi çek. Halkayı kapat.'),
     ('Draw one glossy loop through the dots or build stitched bridges between islands. Every puzzle has exactly one solution.',
      'Noktaların arasından tek bir parlak halka çiz ya da adalar arasına dikişli köprüler kur. Her bulmacanın tek bir çözümü var.'),
     [('Two puzzle families in one game: draw the loop and build the bridges.', 'Tek oyunda iki bulmaca ailesi: halkayı çiz ve köprüleri kur.'),
      ('Four twists: pearls, blocked edges, bridges and double bridges.', 'Dört sürpriz: inciler, kapalı kenarlar, köprüler ve çift köprüler.'),
      ('Free to play with optional ads and gems. An account is optional, only for cloud save.', 'Ücretsiz; reklamlar ve elmaslar isteğe bağlı. Hesap isteğe bağlı, yalnızca bulut kaydı için.')],
     ('Pull the thread', 'İpi çek'), ('Line and bridge puzzle', 'Çizgi ve köprü bulmacası')),
    ('jellypark', 'Jelly Park', 'park', '09', ('Car jam puzzle', 'Araba trafiği bulmacası'),
     ('Honk, roll and clear the lot!', 'Korna çal, yuvarlan, otoparkı boşalt!'),
     ('Tap a squishy jelly car and, if its road is clear, it honks and drives out. Find the right order and get every car home.',
      'Ezilebilir bir jöle arabaya dokun; yolu açıksa korna çalıp çıkar. Doğru sırayı bul, her arabayı eve gönder.'),
     [('Twelve twists, one at a time: cones, buses, numbered cars, arrows, barriers, tow trucks, roundabouts and more.', 'On iki sürpriz, tek tek: koniler, otobüsler, numaralı arabalar, oklar, bariyerler, çekiciler, kavşaklar ve daha fazlası.'),
      ('Boss levels with a time limit and a move limit together.', 'Süre ve hamle sınırını bir arada getiren patron bölümleri.'),
      ('Free to play with optional ads and gems. An account is optional, only for cloud save.', 'Ücretsiz; reklamlar ve elmaslar isteğe bağlı. Hesap isteğe bağlı, yalnızca bulut kaydı için.')],
     ('Honk and go', 'Korna çal, çık'), ('Car jam puzzle', 'Araba trafiği bulmacası')),
    ('jellyseek', 'Jelly Seek', 'seek', '10', ('Hidden sweets puzzle', 'Gizli şeker bulmacası'),
     ('Seek, deduce and smile!', 'Ara, çıkarım yap, gülümse!'),
     ('Open the tiles, follow the numbers and find every hidden sweet without waking a sour jelly. Every level can be solved by logic alone.',
      'Karoları aç, sayıları izle ve tek bir ekşi jöleyi uyandırmadan her gizli şekeri bul. Her bölüm yalnızca mantıkla çözülür.'),
     [('Four twists: lanterns, campsites, spyglasses and scales on the edge.', 'Dört sürpriz: fenerler, kamp yerleri, dürbünler ve kenardaki teraziler.'),
      ('No guessing, ever: every board is solvable by deduction.', 'Hiç tahmin yok: her tahta çıkarımla çözülür.'),
      ('Free to play with optional ads and gems. An account is optional, only for cloud save.', 'Ücretsiz; reklamlar ve elmaslar isteğe bağlı. Hesap isteğe bağlı, yalnızca bulut kaydı için.')],
     ('Start seeking', 'Aramaya başla'), ('Logic puzzle', 'Mantık bulmacası')),
    ('jellyslide', 'Jelly Slide', 'slide', '11', ('Ice sliding puzzle', 'Buz kayma bulmacası'),
     ('Swipe, slide and bump!', 'Kaydır, süzül, çarp!'),
     ('Swipe a jelly penguin across the ice. It glides until something stops it, so plan your path and reach the glowing exit hole.',
      'Jöle penguenini buzun üstünde kaydır. Bir şey durdurana kadar süzülür; yolunu planla ve parlayan çıkış deliğine ulaş.'),
     [('Twelve twists, one at a time: snow piles, fish, cracking ice, warp holes, bumpers, keys, a sneaky seal and more.', 'On iki sürpriz, tek tek: kar yığınları, balıklar, çatlayan buz, ışınlanma delikleri, zıplatıcılar, anahtarlar, sinsi bir fok ve daha fazlası.'),
      ('Boss levels with a time limit and a move limit together.', 'Süre ve hamle sınırını bir arada getiren patron bölümleri.'),
      ('Free to play with optional ads and gems. An account is optional, only for cloud save.', 'Ücretsiz; reklamlar ve elmaslar isteğe bağlı. Hesap isteğe bağlı, yalnızca bulut kaydı için.')],
     ('Slide in', 'Kaymaya başla'), ('Ice sliding puzzle', 'Buz kayma bulmacası')),
]

# --- üst veri ---
sub1('<title>Games | JinjaGames: Cyber Academy, Locard, DayPot, Jelly Trails, Jelly Pipes</title>', '<title>Games | JinjaGames: Cyber Academy, Locard, DayPot and the Jelly puzzle family</title>')
sub1('and the Jelly puzzle pair for Android, Jelly Trails and Jelly Pipes.', 'and eight Jelly puzzle games for Android: Trails, Pipes, Jars, Logic, Loops, Park, Seek and Slide.')
sub1('Cyber Academy, Locard, DayPot, Jelly Trails and Jelly Pipes: status, platforms and languages, side by side.', 'Cyber Academy, Locard, DayPot and eight Jelly puzzle games: status, platforms and languages, side by side.')
ld = ''.join(',{"@type":"ListItem","position":%d,"url":"https://jinjagames.com/%s/","name":"%s"}' % (6 + i, g[0], g[1]) for i, g in enumerate(G))
sub1('"name":"Jelly Pipes"}]}},', '"name":"Jelly Pipes"}' + ld + ']}},')

# --- CSS ---
sub1('--w-trails:#7A4FD6; --w-pipes:#1C7FB8;', '--w-trails:#7A4FD6; --w-pipes:#1C7FB8; --w-jars:#B8470A; --w-logic:#5A47C9; --w-loops:#C2306F; --w-park:#D1342F; --w-seek:#1A7F4F; --w-slide:#3560D8;')
sub1('--w-trails:#B79BFF; --w-pipes:#79C8F2;', '--w-trails:#B79BFF; --w-pipes:#79C8F2; --w-jars:#FFB45E; --w-logic:#A9A2FF; --w-loops:#FF8FBF; --w-park:#FF8A7D; --w-seek:#6FE0A6; --w-slide:#9DB8FF;')
cls = [g[2] for g in G]
sub1('.g-trails h2,.g-pipes h2{font-family:var(--f-warm);font-weight:700;letter-spacing:-.022em}',
     '.g-trails h2,.g-pipes h2{font-family:var(--f-warm);font-weight:700;letter-spacing:-.022em}\n'
     + ''.join('.g-%s{--accent:var(--w-%s)}' % (c, c) for c in cls) + '\n'
     + '.' + ',.'.join('g-%s .media' % c for c in cls) + '{aspect-ratio:1024/500}\n'
     + ','.join('.g-%s h2' % c for c in cls) + '{font-family:var(--f-warm);font-weight:700;letter-spacing:-.022em}')
sub1('.c-jt{color:var(--w-trails)}.c-jp{color:var(--w-pipes)}',
     '.c-jt{color:var(--w-trails)}.c-jp{color:var(--w-pipes)}' + ''.join('.c-j%s{color:var(--w-%s)}' % (c, c) for c in cls))
sub1('thead th.c-cy,thead th.c-no,thead th.c-wa,thead th.c-jt,thead th.c-jp{',
     'thead th.c-cy,thead th.c-no,thead th.c-wa,thead th.c-jt,thead th.c-jp,' + ','.join('thead th.c-j%s' % c for c in cls) + '{')

# --- filtre sayıları ---
sub1('data-filter="all" aria-pressed="true"><span class="en i">All</span><span class="tr i">Hepsi</span> <em>5</em>', 'data-filter="all" aria-pressed="true"><span class="en i">All</span><span class="tr i">Hepsi</span> <em>11</em>')
sub1('<span class="tr i">Yolda</span> <em>4</em>', '<span class="tr i">Yolda</span> <em>10</em>')
sub1('<span class="tr i">Mobil</span> <em>3</em>', '<span class="tr i">Mobil</span> <em>9</em>')

# --- kartlar ---
cards = ''
for k, (slug, name, c, num, kind, claim, pitch, hi, cta, genre) in enumerate(G):
    flip = ' flip' if k % 2 == 1 else ''
    cards += '''    <!-- %s -->
    <article class="game g-%s%s rv" id="%s" data-tags="all soon mobile">
      <a class="media" href="../%s/" aria-label="%s">
        <img src="../%s/img/banner.webp" alt="" width="1024" height="500" loading="lazy">
        <span class="sheen" aria-hidden="true"></span>
      </a>
      <div class="info">
        <span class="num">%s</span><span class="kind en i">%s</span><span class="kind tr i">%s</span>
        <h2>%s</h2>
        <p class="pitch en"><b>%s</b> %s</p>
        <p class="pitch tr"><b>%s</b> %s</p>
        <dl class="facts">
          <div><dt><span class="en i">Status</span><span class="tr i">Durum</span></dt><dd><span class="en i">Release preparation, Google Play soon</span><span class="tr i">Yayın hazırlığında, Google Play yakında</span></dd></div>
          <div><dt>Platform</dt><dd>Android</dd></div>
          <div><dt><span class="en i">Levels</span><span class="tr i">Bölüm</span></dt><dd><span class="en i">500 in 50 worlds</span><span class="tr i">50 dünyada 500</span></dd></div>
          <div><dt><span class="en i">Language</span><span class="tr i">Dil</span></dt><dd><span class="en i">6 languages</span><span class="tr i">6 dil</span></dd></div>
        </dl>
        <ul class="hi">
%s        </ul>
        <div class="acts">
          <a class="btn p" href="../%s/"><span class="en i">%s</span><span class="tr i">%s</span> <span class="arw">&rarr;</span></a>
          <a class="btn g" href="../%s/privacy/"><span class="en i">Privacy</span><span class="tr i">Gizlilik</span></a>
        </div>
      </div>
    </article>

''' % (name.upper(), c, flip, slug, slug, name, slug, num, kind[0], kind[1], name, claim[0], pitch[0], claim[1], pitch[1],
       ''.join('          <li><span class="en i">%s</span><span class="tr i">%s</span></li>\n' % h for h in hi), slug, cta[0], cta[1], slug)
sub1('    <p class="empty" id="empty" hidden>', cards + '    <p class="empty" id="empty" hidden>')

# --- karşılaştırma tablosu ---
head = ''.join('<th class="c-j%s">%s</th>' % (g[2], g[1]) for g in G)
sub1('<th class="c-jp">Jelly Pipes</th></tr></thead>', '<th class="c-jp">Jelly Pipes</th>' + head + '</tr></thead>')


def tr_add(label_marker, cells):
    global t
    i = t.index(label_marker)
    j = t.index('</tr>', i)
    t = t[:j] + cells + t[j:]


dot = '<td><span class="dot" style="background:#E3B341"></span><span class="en i">In development</span><span class="tr i">Yapımda</span></td>'
tr_add('<tr><th><span class="en i">Status</span><span class="tr i">Durum</span></th><td><span class="dot" style="background:#45D49A">', dot * 6)
tr_add('<tr><th><span class="en i">Genre</span>', ''.join('<td><span class="en i">%s</span><span class="tr i">%s</span></td>' % g[9] for g in G))
tr_add('<tr><th>Platform</th>', '<td>Android</td>' * 6)
tr_add('<tr><th><span class="en i">Players</span>', '<td><span class="en i">Single player</span><span class="tr i">Tek oyunculu</span></td>' * 6)
tr_add('<tr><th><span class="en i">Languages</span>', '<td><span class="en i">6 languages</span><span class="tr i">6 dil</span></td>' * 6)
tr_add('<tr><th><span class="en i">Internet</span>', '<td><span class="en i">Optional, for ads, purchases and cloud save</span><span class="tr i">İsteğe bağlı, reklam, satın alma ve bulut kaydı için</span></td>' * 6)
tr_add('<tr><th><span class="en i">Where</span>', '<td><span class="en i">Google Play, soon</span><span class="tr i">Google Play, yakında</span></td>' * 6)

open(P, 'w', encoding='utf8', newline='\n').write(t)
print('ok')
