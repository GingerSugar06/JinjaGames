"""Ana sayfaya 6 yeni Jelly oyununu ekler (bir kez çalıştırılır; ikinci çalıştırmada 'zaten uygulanmış' der):
hero sayfaları, renk değişkenleri, 'Jelly ailesi' kartları, alt bilgi bağlantıları, metin ve JSON-LD güncellemeleri."""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'index.html')
t = open(P, encoding='utf8').read()
if 'data-shape="jars"' in t:
    raise SystemExit('zaten uygulanmış')

NEW = [
    # slug, ad, şekil, etiket (en, tr), açıklama (en, tr), düğme (en, tr), renk (açık, koyu), kart afişi odak
    ('jellyjars', 'Jelly Jars', 'jars', ('Sort puzzle · Android', 'Ayırma bulmacası · Android'),
     ('Pour glossy jelly layers between glass jars until every jar is one colour. 500 handcrafted levels across 50 sweet worlds.',
      'Parlak jöle katmanlarını cam kavanozlar arasında dök, her kavanoz tek renk olsun. 50 tatlı dünyada özenle hazırlanmış 500 bölüm.'),
     ('Start pouring', 'Dökmeye başla'), ('#B8470A', '#FFB45E')),
    ('jellylogic', 'Jelly Logic', 'logic', ('Sudoku puzzle · Android', 'Sudoku bulmacası · Android'),
     ('Calm sudoku with a wise jelly owl: cages, diagonals, odd-even and jigsaw twists. 500 handcrafted levels from 4x4 to 9x9.',
      'Bilge bir jöle baykuşla sakin sudoku: kafesler, çaprazlar, tek-çift ve yapboz bölgeleri. 4x4\'ten 9x9\'a özenle hazırlanmış 500 bölüm.'),
     ('Solve a grid', 'Bir tablo çöz'), ('#5A47C9', '#A9A2FF')),
    ('jellyloops', 'Jelly Loops', 'loops', ('Thread puzzle · Android', 'İp bulmacası · Android'),
     ('Draw one glossy thread loop or build bridges between islands. Every puzzle has exactly one solution. 500 handcrafted levels.',
      'Tek bir parlak ip halkası çiz ya da adalar arasına köprü kur. Her bulmacanın tek bir çözümü var. Özenle hazırlanmış 500 bölüm.'),
     ('Pull the thread', 'İpi çek'), ('#C2306F', '#FF8FBF')),
    ('jellypark', 'Jelly Park', 'park', ('Car jam puzzle · Android', 'Araba trafiği bulmacası · Android'),
     ('Tap the squishy jelly cars to honk and drive them out of the packed parking lot. 500 handcrafted levels across 50 sweet worlds.',
      'Ezilebilir jöle arabalara dokun, korna çalıp sıkışık otoparktan çıksınlar. 50 tatlı dünyada özenle hazırlanmış 500 bölüm.'),
     ('Honk and go', 'Korna çal, çık'), ('#D1342F', '#FF8A7D')),
    ('jellyseek', 'Jelly Seek', 'seek', ('Hidden sweets puzzle · Android', 'Gizli şeker bulmacası · Android'),
     ('Open the tiles, follow the numbers and find every hidden sweet. No guessing, only logic. 500 handcrafted levels.',
      'Karoları aç, sayıları izle, her gizli şekeri bul. Tahmin yok, yalnızca mantık. Özenle hazırlanmış 500 bölüm.'),
     ('Start seeking', 'Aramaya başla'), ('#1A7F4F', '#6FE0A6')),
    ('jellyslide', 'Jelly Slide', 'slide', ('Ice sliding puzzle · Android', 'Buz kayma bulmacası · Android'),
     ('Swipe a jelly penguin across the ice until it reaches the exit hole. 500 handcrafted levels across 50 frosty worlds.',
      'Jöle penguenini buzun üstünde kaydır, çıkış deliğine ulaştır. 50 buzlu dünyada özenle hazırlanmış 500 bölüm.'),
     ('Slide in', 'Kaymaya başla'), ('#3560D8', '#9DB8FF')),
]


def sub1(old, new, count=1):
    global t
    assert old in t, old[:80]
    t = t.replace(old, new, count)


# --- başlık, açıklama, og ---
sub1('<title>JinjaGames | Cyber Academy, Locard, DayPot, Jelly Trails ve Jelly Pipes</title>',
     '<title>JinjaGames | Cyber Academy, Locard, DayPot ve sekiz Jelly bulmaca oyunu</title>')
sub1('ve çevrimdışı yemek yardımcısı DayPot ile Android için iki jöle bulmacası: Jelly Trails ve Jelly Pipes.',
     've çevrimdışı yemek yardımcısı DayPot ile Android için sekiz jöle bulmacası: Jelly Trails, Pipes, Jars, Logic, Loops, Park, Seek ve Slide.')
sub1('content="JinjaGames | Cyber Academy, Locard, DayPot, Jelly Trails, Jelly Pipes"', 'content="JinjaGames | Cyber Academy, Locard, DayPot and eight Jelly puzzle games"')
sub1('Deep, honest indie games from Ankara: Cyber Academy, Locard, DayPot, Jelly Trails and Jelly Pipes.',
     'Deep, honest indie games from Ankara: Cyber Academy, Locard, DayPot and the Jelly puzzle family: Trails, Pipes, Jars, Logic, Loops, Park, Seek and Slide.')

# --- JSON-LD ---
sub1('JinjaGames is building five projects: Cyber Academy, a cybersecurity game out now in Steam Early Access; Locard, a first person co-op detective game coming to Steam; DayPot, an offline cooking assistant for Android; and two jelly puzzle games for Android, Jelly Trails and Jelly Pipes.',
     'JinjaGames is building eleven projects: Cyber Academy, a cybersecurity game out now in Steam Early Access; Locard, a first person co-op detective game coming to Steam; DayPot, an offline cooking assistant for Android; and eight jelly puzzle games for Android: Jelly Trails, Jelly Pipes, Jelly Jars, Jelly Logic, Jelly Loops, Jelly Park, Jelly Seek and Jelly Slide.')
ld = ''
for slug, name, shape, lab, desc, cta, col in NEW:
    ld += (',{"@type":"MobileApplication","name":"%s","url":"https://jinjagames.com/%s/","image":"https://jinjagames.com/%s/img/og.jpg","description":"%s",'
           '"applicationCategory":"GameApplication","genre":"Puzzle","operatingSystem":"Android","inLanguage":["en","tr"],"author":{"@type":"Organization","name":"JinjaGames"},'
           '"publisher":{"@type":"Organization","name":"JinjaGames","url":"https://jinjagames.com/"}}') % (name, slug, slug, desc[0])
m = re.search(r'(\{"@type":"MobileApplication","name":"Jelly Pipes".*?"publisher":\{"@type":"Organization","name":"JinjaGames","url":"https://jinjagames.com/"\}\})', t, re.S)
assert m
t = t[:m.end()] + ld + t[m.end():]

# --- renk değişkenleri ---
sub1('--w-trails:#7A4FD6; --w-pipes:#1C7FB8;', '--w-trails:#7A4FD6; --w-pipes:#1C7FB8; --w-jars:#B8470A; --w-logic:#5A47C9; --w-loops:#C2306F; --w-park:#D1342F; --w-seek:#1A7F4F; --w-slide:#3560D8;')
sub1('--w-trails:#B79BFF; --w-pipes:#79C8F2;', '--w-trails:#B79BFF; --w-pipes:#79C8F2; --w-jars:#FFB45E; --w-logic:#A9A2FF; --w-loops:#FF8FBF; --w-park:#FF8A7D; --w-seek:#6FE0A6; --w-slide:#9DB8FF;')

# --- hero CSS ---
shapes = [n[2] for n in NEW]
css = '\n'.join('.slide[data-shape="%s"] .gtitle{font-family:var(--f-warm);font-weight:700;letter-spacing:-.03em;color:var(--w-%s)}\n.slide[data-shape="%s"] .btn.p{background:var(--w-%s)}' % (s, s, s, s) for s in shapes)
sub1('.slide[data-shape="cyber"] .btn.p{background:var(--w-cyber)}', css + '\n.slide[data-shape="cyber"] .btn.p{background:var(--w-cyber)}')

# --- hero sayfaları (Pipes'tan sonra, DayPot'tan önce) ---
slides = ''
for slug, name, shape, lab, desc, cta, col in NEW:
    slides += '''        <article class="slide" data-shape="%s" data-name="%s" aria-hidden="true">
          <span class="label"><span class="en i">%s</span><span class="tr i">%s</span></span>
          <h2 class="gtitle">%s</h2>
          <p class="tagline en">%s</p>
          <p class="tagline tr">%s</p>
          <div class="cta"><a class="btn p" href="%s/"><span class="en i">%s</span><span class="tr i">%s</span> <span class="arw">&rarr;</span></a><a class="btn g" href="%s/#try"><span class="en i">Try a puzzle</span><span class="tr i">Bir bulmaca dene</span></a></div>
        </article>
''' % (shape, name, lab[0], lab[1], name, desc[0], desc[1], slug, cta[0], cta[1], slug)
sub1('        <article class="slide" data-shape="warm" data-name="DayPot"', slides + '        <article class="slide" data-shape="warm" data-name="DayPot"')
sub1('/* HERO SAYFALARI: JinjaGames, Cyber Academy, Locard, Jelly Trails, Jelly Pipes, DayPot; sonda başa sarar. */',
     '/* HERO SAYFALARI: JinjaGames, Cyber Academy, Locard, sekiz Jelly oyunu, DayPot; sonda başa sarar. */')
sub1('/* Hero sayfaları: JinjaGames → Cyber Academy → Locard → Jelly Trails → Jelly Pipes → DayPot → başa.',
     '/* Hero sayfaları: JinjaGames → Cyber Academy → Locard → Jelly Trails → Pipes → Jars → Logic → Loops → Park → Seek → Slide → DayPot → başa.')

# --- Jelly ailesi kartları (Mobil grubundan sonra) ---
tiles = ''
for slug, name, shape, lab, desc, cta, col in NEW:
    tiles += '''          <a class="jtile g-%s" href="%s/" style="--a:var(--w-%s)">
            <span class="jt-media"><img src="%s/img/banner.webp" alt="" width="1024" height="500" loading="lazy"></span>
            <span class="jt-body"><span class="jt-kind"><span class="en i">%s</span><span class="tr i">%s</span></span><b>%s</b>
              <span class="en">%s</span><span class="tr">%s</span><span class="jt-go"><span class="en i">%s</span><span class="tr i">%s</span> <span aria-hidden="true">&rarr;</span></span></span>
          </a>
''' % (shape, slug, shape, slug, lab[0].replace(' · Android', ''), lab[1].replace(' · Android', ''), name, desc[0].split('. 500')[0] + '.', desc[1].split('. ')[0] + '.', cta[0], cta[1])
group = '''
      <div class="wgroup rv" id="jellyfamily">
        <h3 class="gh"><span class="t"><span class="en i">More Jelly games</span><span class="tr i">Daha fazla Jelly oyunu</span></span><span class="sub"><span class="en i">Android · 500 levels each</span><span class="tr i">Android · her biri 500 bölüm</span></span><i aria-hidden="true"></i></h3>
        <div class="jgrid">
%s        </div>
      </div>
''' % tiles
sub1('      <div class="allgames rv">', group + '      <div class="allgames rv">')
jcss = '''/* Jelly ailesi: altı yeni oyun, banner üstünde kartlar */
.jgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.jtile{position:relative;display:flex;flex-direction:column;border-radius:6px;overflow:hidden;background:#0d0b0c;isolation:isolate;min-height:330px;color:#F6F1EF;transition:transform .5s var(--ease),box-shadow .5s var(--ease)}
.jtile:hover{transform:translateY(-6px);box-shadow:var(--shadow-2)}
.jt-media{position:absolute;inset:0;z-index:-2}
.jt-media img{width:100%;height:100%;object-fit:cover;transition:transform 1.2s var(--ease),filter .6s;filter:saturate(.8) brightness(.75)}
.jtile:hover .jt-media img{transform:scale(1.07);filter:saturate(1.05) brightness(.9)}
.jtile::after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(10,8,9,.05) 0%,rgba(10,8,9,.35) 38%,rgba(10,8,9,.94) 100%)}
.jtile::before{content:"";position:absolute;left:0;right:0;bottom:0;height:3px;background:var(--a);transform:scaleX(.18);transform-origin:left;transition:transform .7s var(--ease)}
.jtile:hover::before{transform:scaleX(1)}
.jt-body{margin-top:auto;padding:26px 26px 24px;display:flex;flex-direction:column;gap:6px}
.jt-kind{font-family:var(--f-mono);font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:#fff;opacity:.85}
.jt-body b{font-family:var(--f-warm);font-weight:700;font-size:clamp(30px,3.2vw,40px);line-height:1;letter-spacing:-.02em;color:#fff}
.jt-body>.en,.jt-body>.tr{font-size:15.5px;line-height:1.55;color:rgba(246,241,239,.82)}
.jt-go{margin-top:8px;display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:15px;color:#fff}
.jt-go span[aria-hidden]{transition:transform .3s var(--ease)}
.jtile:hover .jt-go span[aria-hidden]{transform:translateX(6px)}
@media(max-width:1060px){.jgrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:680px){.jgrid{grid-template-columns:1fr}.jtile{min-height:290px}}
'''
sub1('.allgames{margin-top:34px;', jcss + '.allgames{margin-top:34px;')

# --- metinler ---
sub1('Five worlds in progress. They all want the same thing', 'Eleven worlds in progress. They all want the same thing')
sub1('Üretimde beş dünya. Hepsinin amacı aynı', 'Üretimde on bir dünya. Hepsinin amacı aynı')
sub1('<h2 class="en">Five worlds, one <span class="hl">way of building.</span></h2>', '<h2 class="en">Eleven worlds, one <span class="hl">way of building.</span></h2>')
sub1('<h2 class="tr">Beş dünya, tek bir <span class="hl">yapma biçimi.</span></h2>', '<h2 class="tr">On bir dünya, tek bir <span class="hl">yapma biçimi.</span></h2>')
sub1('a kitchen app and two cute puzzle games are very different fields', 'a kitchen app and eight cute puzzle games are very different fields')
sub1('and the Jelly pair is there for a calm, cheerful break.', 'and the Jelly family is there for a calm, cheerful break.')
sub1('bir mutfak uygulaması ve iki sevimli bulmaca oyunu bambaşka alanlar', 'bir mutfak uygulaması ve sekiz sevimli bulmaca oyunu bambaşka alanlar')
sub1('Jelly ikilisi de sakin ve neşeli bir mola için orada.', 'Jelly ailesi de sakin ve neşeli bir mola için orada.')
sub1('Five projects: <a href="cyberacademy/">', 'Eleven projects: <a href="cyberacademy/">')
sub1('and two puzzle games for Android, <a href="jellytrails/">Jelly Trails</a> and <a href="jellypipes/">Jelly Pipes</a>.',
     'and eight puzzle games for Android, the Jelly family: <a href="jellytrails/">Jelly Trails</a>, <a href="jellypipes/">Jelly Pipes</a>, <a href="jellyjars/">Jelly Jars</a>, <a href="jellylogic/">Jelly Logic</a>, <a href="jellyloops/">Jelly Loops</a>, <a href="jellypark/">Jelly Park</a>, <a href="jellyseek/">Jelly Seek</a> and <a href="jellyslide/">Jelly Slide</a>.')
sub1('Beş proje: Steam Erken Erişimde', 'On bir proje: Steam Erken Erişimde')
sub1('ve Android için iki bulmaca oyunu, <a href="jellytrails/">Jelly Trails</a> ile <a href="jellypipes/">Jelly Pipes</a>.',
     've Android için sekiz bulmaca oyunu, yani Jelly ailesi: <a href="jellytrails/">Jelly Trails</a>, <a href="jellypipes/">Jelly Pipes</a>, <a href="jellyjars/">Jelly Jars</a>, <a href="jellylogic/">Jelly Logic</a>, <a href="jellyloops/">Jelly Loops</a>, <a href="jellypark/">Jelly Park</a>, <a href="jellyseek/">Jelly Seek</a> ve <a href="jellyslide/">Jelly Slide</a>.')
sub1('and Jelly Trails and Jelly Pipes are there for a calm, cheerful break.', 'and the eight Jelly games are there for a calm, cheerful break.')
sub1('Jelly Trails ile Jelly Pipes ise sakin ve neşeli bir mola olarak yapıyor.', 'sekiz Jelly oyunu ise sakin ve neşeli bir mola olarak yapıyor.')

# --- alt bilgi ---
sub1('      <a href="jellypipes/">Jelly Pipes</a>\n    </div>',
     '      <a href="jellypipes/">Jelly Pipes</a>\n' + ''.join('      <a href="%s/">%s</a>\n' % (n[0], n[1]) for n in NEW) + '    </div>')
sub1('      <a href="jellypipes/privacy/"><span class="en i">Jelly Pipes privacy</span><span class="tr i">Jelly Pipes gizlilik</span></a>\n',
     '      <a href="jellypipes/privacy/"><span class="en i">Jelly Pipes privacy</span><span class="tr i">Jelly Pipes gizlilik</span></a>\n'
     + ''.join('      <a href="%s/privacy/"><span class="en i">%s privacy</span><span class="tr i">%s gizlilik</span></a>\n' % (n[0], n[1], n[1]) for n in NEW))

open(P, 'w', encoding='utf8', newline='\n').write(t)
print('ok')
