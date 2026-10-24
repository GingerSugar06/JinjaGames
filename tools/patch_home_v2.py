"""Ana sayfa düzeni, ikinci tur (bir kez çalıştırılır): Mobil grubu = 'Jelly oyunları' (8 kart) + 'Uygulamalar' (DayPot),
yeni 'Yaptıklarımız' başlığı/paragrafı, hero ilk sayfa metni, SSS, 'Tüm oyunlar' kartı."""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'index.html')
t = open(P, encoding='utf8', newline='').read()
if 'class="ag-icons"' in t:
    raise SystemExit('zaten uygulanmış')
NL = '\r\n' if '\r\n' in t else '\n'
t = t.replace('\r\n', '\n')


def sub1(old, new):
    global t
    assert old in t, old[:90]
    t = t.replace(old, new, 1)


# --- Mobil grubu + Jelly ailesi grubu -> tek 'Mobil' grubu ---
a = t.index('      <div class="wgroup rv">\n        <h3 class="gh"><span class="t"><span class="en i">Mobile</span>')
b = t.index('      <div class="allgames rv">')
old_mobile = t[a:b]
daypot = '          ' + re.search(r'<!-- 03 DAYPOT -->\n\s*(<article id="daypot".*?</article>)', old_mobile, re.S).group(1)
daypot = daypot.replace('<span class="n">03</span>', '<span class="n">01</span>').replace('03 · Kitchen assistant', 'Kitchen assistant').replace('03 · Mutfak yardımcısı', 'Mutfak yardımcısı')
daypot = daypot.replace('class="wp g-warm rv"', 'class="wp g-warm on rv"')
# eski Jelly ailesi kartlarını (6) al
fam = re.search(r'<div class="jgrid">\n(.*?)        </div>\n      </div>\n$', old_mobile, re.S).group(1)

pre = ''' <!-- JELLY TRAILS / PIPES: aynı kart biçiminde -->'''


def tile(slug, shape, name, kind_en, kind_tr, en, tr, cta_en, cta_tr):
    return '''          <a class="jtile g-%s" id="%s" href="%s/" style="--a:var(--w-%s)">
            <span class="jt-media"><img src="%s/img/banner.webp" alt="" width="1024" height="500" loading="lazy"></span>
            <span class="jt-body"><span class="jt-kind"><span class="en i">%s</span><span class="tr i">%s</span></span><b>%s</b>
              <span class="en">%s</span><span class="tr">%s</span><span class="jt-go"><span class="en i">%s</span><span class="tr i">%s</span> <span aria-hidden="true">&rarr;</span></span></span>
          </a>
''' % (shape, slug, slug, shape, slug, kind_en, kind_tr, name, en, tr, cta_en, cta_tr)


trails = tile('jellytrails', 'trails', 'Jelly Trails', 'Color-connect puzzle', 'Renk bağlama bulmacası',
              'Link matching jellies with glossy trails and fill every square.', 'Aynı renkli jöleleri parlak yollarla bağla ve her kareyi doldur.', 'Meet the jellies', 'Jölelerle tanış')
pipes = tile('jellypipes', 'pipes', 'Jelly Pipes', 'Water pipe puzzle', 'Su borusu bulmacası',
             'Rotate glassy pipes so real flowing water reaches every flower.', 'Cam boruları çevir, gerçek akan su her çiçeğe ulaşsın.', 'Let the water flow', 'Suyu akıt')
fam = fam.replace('          <a class="jtile', '          <a class="jtile')
# eski kartlarda id yok; slug'tan ekle
fam = re.sub(r'<a class="jtile g-(\w+)" href="(\w+)/"', r'<a class="jtile g-\1" id="\2" href="\2/"', fam)

mobile = '''      <div class="wgroup rv" id="mobile">
        <h3 class="gh"><span class="t"><span class="en i">Mobile</span><span class="tr i">Mobil</span></span><span class="sub"><span class="en i">Android · Google Play</span><span class="tr i">Android · Google Play</span></span><i aria-hidden="true"></i></h3>
        <h4 class="sg" id="jellyfamily"><span class="en i">Jelly games</span><span class="tr i">Jelly oyunları</span><em><span class="en i">Eight cozy puzzle games · 500 levels each</span><span class="tr i">Sekiz sakin bulmaca oyunu · her biri 500 bölüm</span></em></h4>
        <div class="jgrid">
''' + trails + pipes + fam + '''        </div>
        <h4 class="sg" id="apps"><span class="en i">Apps</span><span class="tr i">Uygulamalar</span><em><span class="en i">Tools for everyday life</span><span class="tr i">Günlük hayatı kolaylaştıran araçlar</span></em></h4>
        <div class="worlds solo" id="worldsrow-mobile">
''' + daypot + '''
        </div>
      </div>
'''
t = t[:a] + mobile + t[b:]

# --- 'Tüm oyunlar' kartı ---
a = t.index('      <div class="allgames rv">')
b = t.index('      </div>\n', a) + len('      </div>\n')
icons = ['jellytrails', 'jellypipes', 'jellyjars', 'jellylogic', 'jellyloops', 'jellypark', 'jellyseek', 'jellyslide']
ic = ''.join('<img src="%s/img/icon.png" alt="" width="64" height="64" loading="lazy">' % s for s in icons) + '<img src="daypot/img/daypot-icon.png" alt="" width="64" height="64" loading="lazy">'
allg = '''      <div class="allgames rv">
        <div class="ag-icons" aria-hidden="true">%s</div>
        <div class="ag-text">
          <b class="en">Every game and app in one place.</b><b class="tr">Bütün oyunlar ve uygulamalar tek yerde.</b>
          <p class="en">Status, platforms, languages and what each one is really for, side by side.</p>
          <p class="tr">Durum, platform, diller ve her birinin asıl amacı, yan yana.</p>
        </div>
        <a class="btn p" href="games/"><span class="en i">Browse all</span><span class="tr i">Hepsine bak</span> <span class="arw">&rarr;</span></a>
      </div>
''' % ic
t = t[:a] + allg + t[b:]

# --- CSS ---
a = t.index('.allgames{margin-top:34px;')
b = t.index('.allgames p{', a)
b = t.index('\n', b) + 1
css = '''.sg{display:flex;align-items:baseline;flex-wrap:wrap;gap:6px 14px;margin:30px 0 14px;font-family:var(--f-display);font-weight:600;font-size:clamp(20px,2.2vw,26px);letter-spacing:-.02em}
.sg:first-of-type{margin-top:6px}
.sg em{font-style:normal;font-family:var(--f-mono);font-weight:400;font-size:11.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3)}
.worlds.solo{height:clamp(320px,44vh,400px)}
.allgames{margin-top:44px;display:flex;align-items:center;gap:26px;flex-wrap:wrap;padding:26px 30px;border:1px solid var(--line-2);border-radius:18px;background:linear-gradient(120deg,rgba(var(--brand-rgb),.07),transparent 55%),var(--surface);position:relative;overflow:hidden}
.ag-icons{display:flex;flex-shrink:0}
.ag-icons img{width:52px;height:52px;border-radius:14px;border:2px solid var(--bg);margin-left:-14px;box-shadow:0 6px 14px rgba(0,0,0,.25);transition:transform .35s var(--ease)}
.ag-icons img:first-child{margin-left:0}
.allgames:hover .ag-icons img{transform:translateY(-4px) rotate(-3deg)}.allgames:hover .ag-icons img:nth-child(even){transform:translateY(-4px) rotate(3deg)}
.ag-text{flex:1 1 280px;min-width:0}
.ag-text b{display:block;font-family:var(--f-display);font-size:clamp(20px,2.2vw,26px);letter-spacing:-.02em;font-weight:600}
.allgames p{color:var(--ink-2);font-size:15.5px;max-width:620px;margin-top:4px}
'''
t = t[:a] + css + t[b:]
sub1('  .allgames{padding:20px}', '  .allgames{padding:20px;gap:18px}\n  .ag-icons img{width:44px;height:44px;margin-left:-16px}\n  .worlds.solo{height:auto}')
sub1('.jgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}', '.jgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}')
sub1('@media(max-width:1060px){.jgrid{grid-template-columns:repeat(2,minmax(0,1fr))}}', '@media(max-width:1180px){.jgrid{grid-template-columns:repeat(2,minmax(0,1fr))}}')
sub1('.jtile{position:relative;display:flex;flex-direction:column;border-radius:6px;overflow:hidden;background:#0d0b0c;isolation:isolate;min-height:330px;',
     '.jtile{position:relative;display:flex;flex-direction:column;border-radius:6px;overflow:hidden;background:#0d0b0c;isolation:isolate;min-height:380px;')

# --- başlık ve paragraf ---
sub1('<h2 class="en">Eleven worlds, one <span class="hl">way of building.</span></h2>', '<h2 class="en">Games for <span class="hl">every kind of player.</span></h2>')
sub1('<h2 class="tr">On bir dünya, tek bir <span class="hl">yapma biçimi.</span></h2>', '<h2 class="tr">Her oyuncuya <span class="hl">bir oyun.</span></h2>')
pe = re.search(r'<p class="en">Yes, I know how it looks:.*?</p>', t, re.S).group(0)
pt = re.search(r'<p class="tr">Evet, farkındayım:.*?</p>', t, re.S).group(0)
t = t.replace(pe, '<p class="en">I try to make something for everyone: a deep PC game when you want to learn, a case to crack when you want a story, and a growing shelf of calm mobile games and handy apps for the moments in between. JinjaGames is an independent studio, and it is just me, building each one with care and AI as a working partner. Different fields, one promise: it should be worth your time.</p>', 1)
t = t.replace(pt, '<p class="tr">Herkese uygun bir şeyler yapmaya çalışıyorum: öğrenmek istediğinde derin bir PC oyunu, hikâye istediğinde çözülecek bir dosya, aradaki anlar için de büyüyen bir sakin mobil oyun ve işe yarar uygulama rafı. JinjaGames bağımsız bir stüdyo ve yalnızca ben varım; her birini özenle, yapay zekâyı çalışma ortağı olarak yanıma alarak yapıyorum. Alanlar farklı, söz aynı: zamanına değmeli.</p>', 1)
sub1('Eleven worlds in progress. They all want the same thing: that you enjoy yourself, that you learn something while you play, or that your day gets a little easier.',
     'Games and apps for every kind of player, made by one indie developer. Learn something, solve a case, take a calm break, or make your day a little easier.')
sub1('Üretimde on bir dünya. Hepsinin amacı aynı: oynarken eğlenmen, oynarken bir şey öğrenmen ya da günlük işinin biraz kolaylaşması.',
     'Her oyuncuya uygun oyunlar ve uygulamalar, tek bir bağımsız geliştiriciden. Bir şey öğren, bir vaka çöz, sakin bir mola ver ya da gününü biraz kolaylaştır.')

# --- SSS ---
m = re.search(r'<span class="en i">Eleven projects: .*?</span><span class="tr i">On bir proje: .*?</span>', t, re.S)
t = t[:m.start()] + ('<span class="en i">On PC: <a href="cyberacademy/">Cyber Academy</a>, a cybersecurity game that is out now in Steam Early Access, and <a href="locard/">Locard</a>, a first person detective game you can wishlist on Steam. On Android, a growing line of mobile games and apps: eight Jelly puzzle games (<a href="jellytrails/">Trails</a>, <a href="jellypipes/">Pipes</a>, <a href="jellyjars/">Jars</a>, <a href="jellylogic/">Logic</a>, <a href="jellyloops/">Loops</a>, <a href="jellypark/">Park</a>, <a href="jellyseek/">Seek</a> and <a href="jellyslide/">Slide</a>) and the offline cooking assistant <a href="daypot/">DayPot</a>, with more apps on the way. All of them are on the <a href="games/">games page</a>.</span>'
                     '<span class="tr i">PC\'de: Steam Erken Erişimde çıkmış siber güvenlik oyunu <a href="cyberacademy/">Cyber Academy</a> ve Steam\'de istek listesine eklenebilen birinci şahıs dedektif oyunu <a href="locard/">Locard</a>. Android\'de büyüyen bir mobil oyun ve uygulama hattı: sekiz Jelly bulmaca oyunu (<a href="jellytrails/">Trails</a>, <a href="jellypipes/">Pipes</a>, <a href="jellyjars/">Jars</a>, <a href="jellylogic/">Logic</a>, <a href="jellyloops/">Loops</a>, <a href="jellypark/">Park</a>, <a href="jellyseek/">Seek</a> ve <a href="jellyslide/">Slide</a>) ile çevrimdışı yemek yardımcısı <a href="daypot/">DayPot</a>; yolda başka uygulamalar da var. Hepsi <a href="games/">oyunlar sayfasında</a>.</span>') + t[m.end():]
sub1('JinjaGames is building eleven projects: Cyber Academy, a cybersecurity game out now in Steam Early Access; Locard, a first person co-op detective game coming to Steam; DayPot, an offline cooking assistant for Android; and eight jelly puzzle games for Android: Jelly Trails, Jelly Pipes, Jelly Jars, Jelly Logic, Jelly Loops, Jelly Park, Jelly Seek and Jelly Slide.',
     'JinjaGames makes PC games and a growing line of Android games and apps: Cyber Academy, a cybersecurity game out now in Steam Early Access; Locard, a first person co-op detective game coming to Steam; eight Jelly puzzle games (Trails, Pipes, Jars, Logic, Loops, Park, Seek and Slide); and DayPot, an offline cooking assistant, with more apps on the way.')
m = re.search(r'On the surface they are different, but the aim underneath is the same:.*?</span><span class="tr i">.*?</span>', t, re.S)
t = t[:m.start()] + ('Because I try to make something for every kind of player. Cyber Academy teaches directly, Locard puts a story inside a case you solve alone or with friends, DayPot makes an everyday chore easier, and the Jelly games are there for a calm, cheerful break. The fields differ, but the aim is the same: help people or teach them something, and make it enjoyable while it happens.</span>'
                     '<span class="tr i">Çünkü her tür oyuncuya uygun bir şeyler yapmaya çalışıyorum. Cyber Academy doğrudan öğretiyor, Locard yalnız ya da arkadaşlarınla çözdüğün bir vakanın içine hikâye koyuyor, DayPot günlük bir işi kolaylaştırıyor, Jelly oyunları da sakin ve neşeli bir mola için orada. Alanlar farklı ama amaç aynı: insanlara yardımcı olmak ya da bir şey öğretmek, üstelik bunu eğlendirerek yapmak.</span>') + t[m.end():]
# soru başlığı da uyumlu kalsın
open(P, 'w', encoding='utf8', newline='').write(t.replace('\n', NL))
print('ok')
