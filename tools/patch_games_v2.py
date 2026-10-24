"""games/index.html ikinci tur (bir kez çalıştırılır): sayaç satırı ve filtre çubuğu kalkar, kahraman 3B kart halkası olur,
DayPot en sona iner ve kartlar yeniden numaralanır, karşılaştırma tablosunda Durum ve Oyuncu satırları kalkar."""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'games', 'index.html')
t = open(P, encoding='utf8', newline='').read()
if 'id="games3d"' in t:
    raise SystemExit('zaten uygulanmış')
NL = '\r\n' if '\r\n' in t else '\n'
t = t.replace('\r\n', '\n')


def sub1(old, new):
    global t
    assert old in t, old[:90]
    t = t.replace(old, new, 1)


# --- kahraman ---
a = t.index('  <header class="hero">')
b = t.index('  </header>', a) + len('  </header>')
hero = '''  <header class="hero">
    <div class="wrap">
      <nav class="crumb" aria-label="Breadcrumb"><a href="../"><span class="en i">Home</span><span class="tr i">Ana Sayfa</span></a><span aria-hidden="true">/</span><span><span class="en i">Games</span><span class="tr i">Oyunlar</span></span></nav>
      <div class="hero-grid">
        <div>
          <span class="label"><span class="en i">Games and apps · JinjaGames</span><span class="tr i">Oyunlar ve uygulamalar · JinjaGames</span></span>
          <h1 class="en" style="margin-top:18px">Every world, <span class="hl">in one place.</span></h1>
          <h1 class="tr" style="margin-top:18px">Bütün dünyalar, <span class="hl">tek yerde.</span></h1>
          <p class="lede en">PC games and a growing line of mobile games and apps. What each one is, which platform it runs on and where you can get it.</p>
          <p class="lede tr">PC oyunları ve büyüyen bir mobil oyun ve uygulama hattı. Her birinin ne olduğu, hangi platformda çalıştığı ve nereden alınabileceği.</p>
        </div>
        <canvas id="games3d" aria-hidden="true"></canvas>
      </div>
    </div>
  </header>'''
t = t[:a] + hero + t[b:]
a = t.index('  <div class="filters"')
b = t.index('\n  </div>\n', a) + len('\n  </div>\n')
t = t[:a] + t[b:]
sub1('.counts{display:flex;', '''.hero-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:10px;align-items:center}
.hero-grid .hl{display:inline}
.hero h1{font-size:clamp(44px,6.4vw,92px)}
#games3d{width:100%;height:clamp(300px,42vw,500px);display:block;opacity:0;transition:opacity 1.2s ease;touch-action:pan-y}
#games3d.ready{opacity:1}
@media(max-width:900px){.hero-grid{grid-template-columns:1fr}#games3d{height:300px;margin-top:6px}}
.counts{display:flex;''')
sub1('.tablewrap{overflow-x:auto;', '.tablewrap{scrollbar-width:thin;scrollbar-color:var(--accent-line,var(--line-2)) transparent;overflow-x:auto;')

# --- kart sırası ---
arts = {}
for m in re.finditer(r'    <!-- [^\n]* -->\n    <article class="game [^\n]*? id="(\w+)".*?\n    </article>\n', t, re.S):
    arts[m.group(1)] = m
order = list(arts)
first = min(m.start() for m in arts.values())
last = max(m.end() for m in arts.values())
blocks = {k: m.group(0) for k, m in arts.items()}
new_order = [k for k in order if k != 'daypot'] + ['daypot']
out = ''
for n, k in enumerate(new_order, 1):
    blk = blocks[k]
    blk = re.sub(r'<span class="num">\d+</span>', '<span class="num">%02d</span>' % n, blk, 1)
    blk = re.sub(r'( g-\w+)( flip)?( rv")', lambda mm: mm.group(1) + (' flip' if n % 2 == 0 else '') + mm.group(3), blk, 1)
    out += blk + '\n'
t = t[:first] + out + t[last:].lstrip('\n')

# --- tablo ---
def drop_row(label):
    global t
    i = t.index('<tr><th><span class="en i">%s</span>' % label)
    j = t.index('</tr>', i) + len('</tr>')
    k = t.index('\n', j) + 1
    t = t[:i].rstrip(' ') + t[k:]


drop_row('Status')
drop_row('Players')
# DayPot sütunu (3.) en sona
tb = t.index('<table>')
te = t.index('</table>', tb)
tab = t[tb:te]
rows = re.findall(r'<tr>.*?</tr>', tab, re.S)
new_rows = []
for r in rows:
    cells = re.findall(r'<t[hd][ >].*?</t[hd]>|<th></th>', r, re.S)
    assert len(cells) == 12, (len(cells), r[:80])
    cells = cells[:3] + cells[4:] + [cells[3]]
    new_rows.append('<tr>' + ''.join(cells) + '</tr>')
for r, nr in zip(rows, new_rows):
    tab = tab.replace(r, nr, 1)
t = t[:tb] + tab + t[te:]
# Locard dil hücresi: Cyber Academy ile aynı
sub1('<td><span class="en i">Turkish, English planned</span><span class="tr i">Türkçe, İngilizce planlanıyor</span></td>',
     '<td><span class="en i">25 interface languages, like Cyber Academy</span><span class="tr i">Cyber Academy gibi 25 arayüz dili</span></td>')
# kartlardaki Locard dil satırı da aynı iddiayı taşısın mı: kart facts'inde ne yazıyorsa onu göster
m = re.search(r'id="locard".*?<dt><span class="en i">Languages</span><span class="tr i">[^<]*</span></dt><dd>(.*?)</dd>', t, re.S)
print('locard card languages:', m.group(1)[:200] if m else None)

# --- betikler ---
sub1('<script src="../assets/local-links.js?v=20261012d"></script>', '<script src="../assets/local-links.js?v=20261012d"></script>\n<script src="../assets/vendor/three.min.js?v=20261012d" defer></script>\n<script src="../assets/games3d.js?v=20261024a" defer></script>')
open(P, 'w', encoding='utf8', newline='').write(t.replace('\n', NL))
print('ok')
