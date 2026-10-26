"""Jelly Trails ve Jelly Pipes tanıtım sayfalarını üretir:
   jellytrails/index.html  ->  https://jinjagames.com/jellytrails/
   jellypipes/index.html   ->  https://jinjagames.com/jellypipes/

Sırayla: python extract_strings.py (oyun metinleri), python prep_assets.py (görseller),
python gen_trails_puzzles.py (Trails demo bulmacaları; bir kez), python build.py.
Sayfalar elle değil buradan değiştirilir: trails.html / pipes.html sayfaya özel yerleşim, CSS ve demo
betiğini, base.css / base.js ortak iskeleti taşır. Google Play bağlantısı yayına çıkınca PLAY_URL'ye yazılır."""
import json
import os
import random

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))

# Yayına çıkınca doldur: 'https://play.google.com/store/apps/details?id=com.jinjagames.jellytrails'
PLAY_URL = {'jellytrails': '', 'jellypipes': ''}

GAMES = {
    'jellytrails': {
        'name': 'Jelly Trails', 'bg': '#FBF7FF', 'd_bg': '#15101E', 'tpl': 'trails.html',
        'title': 'Jelly Trails: Color Flow | Cute Jelly Puzzle Game for Android | JinjaGames',
        'desc': 'Jelly Trails is a cozy flow puzzle for Android. Drag to link matching jellies, fill every square, play 500 handcrafted levels across 50 sweet worlds. Free, in six languages.',
        'og_title': 'Jelly Trails: Renk Yolu | JinjaGames',
        'og_desc': 'Şirin jöleleri aynı renkle bağla, tüm kareleri doldur. 500 bölüm, 50 dünya. Android için ücretsiz bulmaca.',
        'ld_desc': 'A cozy flow puzzle: drag a finger between two matching jellies, link every pair and fill every square. 500 handcrafted levels in 50 worlds.',
        'shots_alt': ['Home screen', 'World map', 'A level in progress', 'A new twist arrives', 'Level complete'],
        'lab': [('twist.stones', 'flow_stone', 21, None), ('twist.dual', 'flow_node_0_idle', 61, 'dual'), ('twist.straight', 'flow_tile_straight', 101, None),
                ('twist.turn', 'flow_tile_turn', 141, None), ('twist.rooms', 'flow_portal_0', 181, 'room'), ('twist.gates', 'flow_gate_0', 221, None),
                ('twist.hub', 'flow_quad_idle', 261, None), ('twist.doors', 'flow_door_closed', 301, 'door'), ('twist.bridges', 'flow_bridge', 341, None), ('twist.fence', 'flow_fence', 381, None),
                ('twist.counter', 'flow_node_1_idle', 421, 'counter'), ('twist.turncap', 'flow_turncap_badge', 461, None)],
        'cta_h': ('Almost on Google Play.', 'Neredeyse Google Play\'de.'),
        'cta_p': ('Jelly Trails is in release preparation for Google Play. Want to know the day it lands, or have an idea for a new twist? Write to us.',
                  'Jelly Trails\'in Google Play yayın hazırlığı sürüyor. Çıktığı günü öğrenmek ya da yeni bir sürpriz için fikrin varsa bize yaz.'),
    },
    'jellypipes': {
        'name': 'Jelly Pipes', 'bg': '#F2FAFF', 'd_bg': '#0C161C', 'tpl': 'pipes.html',
        'title': 'Jelly Pipes: Water Puzzle | Flowing Pipe Puzzle Game for Android | JinjaGames',
        'desc': 'Jelly Pipes is a calming water puzzle for Android. Rotate sparkling glass pipes so real flowing water reaches every flower. 500 handcrafted levels across 50 worlds. Free, in six languages.',
        'og_title': 'Jelly Pipes: Su Bulmacası | JinjaGames',
        'og_desc': 'Cam boruları çevir, su her çiçeğe ulaşsın. Gerçek akan su, 500 bölüm, 50 dünya. Android için ücretsiz bulmaca.',
        'ld_desc': 'A calming water puzzle: rotate sparkling glass pipes so water travels from the tap to every flower. 500 handcrafted levels in 50 worlds.',
        'shots_alt': ['Home screen', 'World map', 'A level with frozen pipes', 'A flower blooms', 'Level complete'],
        'lab': [('twist.locked', 'pipe_lock', 21, None), ('twist.rocks', 'flow_stone', 61, None), ('twist.frozen', 'pipe_frozen_cross', 101, None),
                ('twist.valve', 'pipe_valve', 141, None), ('twist.twin', 'pipe_source_1', 181, None), ('twist.link', 'pipe_link_badge', 221, None),
                ('twist.dual', 'pipe_flower_open_dual', 261, None), ('twist.worn', 'pipe_worn_3', 301, None), ('twist.pump', 'pipe_pump_active', 341, None),
                ('twist.cactus', 'pipe_cactus', 381, None), ('twist.swap', 'pipe_swap_badge', 421, None), ('twist.wheel', 'pipe_wheel', 461, None)],
        'cta_h': ('Almost on Google Play.', 'Neredeyse Google Play\'de.'),
        'cta_p': ('Jelly Pipes is in release preparation for Google Play. Want to know the day it lands, or have an idea for a new pipe? Write to us.',
                  'Jelly Pipes\'in Google Play yayın hazırlığı sürüyor. Çıktığı günü öğrenmek ya da yeni bir boru için fikrin varsa bize yaz.'),
    },
}


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def read(name):
    return open(os.path.join(HERE, name), encoding='utf8').read()


HEAD = '''<meta charset="utf-8" />
<script>
// Keep legacy index.html links on the same clean URL as directory links.
if ((location.protocol === 'https:' || location.protocol === 'http:') && location.pathname.endsWith('/index.html')) {
  history.replaceState(history.state, '', location.pathname.replace(/index\\.html$/, '') + location.search + location.hash);
}
</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>@@title@@</title>
<meta name="description" content="@@desc@@" />
<meta name="robots" content="index,follow" />
<link rel="canonical" href="https://jinjagames.com/@@slug@@/" />
<meta name="theme-color" content="@@bg@@" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="@@d_bg@@" media="(prefers-color-scheme: dark)" />
<link rel="icon" type="image/png" href="img/icon.png" />
<link rel="apple-touch-icon" href="img/icon.png" />
<meta property="og:title" content="@@og_title@@" />
<meta property="og:description" content="@@og_desc@@" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://jinjagames.com/@@slug@@/" />
<meta property="og:image" content="https://jinjagames.com/@@slug@@/img/og.jpg" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="preload" as="font" type="font/woff2" href="../assets/fonts/fraunces-latin-700.woff2" crossorigin />
<link rel="preload" as="font" type="font/woff2" href="../assets/fonts/nunito-latin-400.woff2" crossorigin />
<link rel="stylesheet" href="../assets/fonts.css?v=20261012d" />
<script type="application/ld+json">
@@ld@@
</script>
<script>
/* Tema + dil, ana siteyle AYNI anahtarlardan okunur → sayfalar arası tutarlı. */
(function(){
  var d=document.documentElement;
  try{
    var t=localStorage.getItem('jg_theme');
    if(t!=='light'&&t!=='dark'){ t=(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light'; }
    d.setAttribute('data-theme',t);
    var l=localStorage.getItem('jg_lang');
    if(l!=='tr'&&l!=='en') l='en';
    d.setAttribute('data-lang',l); d.lang=l;
  }catch(e){}
})();
</script>'''

NAV = '''<nav id="nav">
  <div class="nav-in">
    <a class="brand" href="../">
      <img src="../brand-mark.png" alt="" onerror="this.style.display='none'">
      <span>JinjaGames</span>
    </a>
    <div class="nav-end">
      <a class="back" href="../games/">&larr; <span class="en i">All games</span><span class="tr i">Tüm oyunlar</span></a>
      <div class="lang-menu">
        <button class="lang-trigger" type="button" data-lang-toggle aria-expanded="false" aria-controls="language-menu"><svg class="lang-globe" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3c2.6 2.5 3.9 5.5 3.9 9S14.6 18.5 12 21M12 3C9.4 5.5 8.1 8.5 8.1 12s1.3 6.5 3.9 9"></path></svg><span data-current-lang>EN</span><svg class="lang-chev" viewBox="0 0 12 12" aria-hidden="true"><path d="m2 4 4 4 4-4"></path></svg></button>
        <div class="lang-popover" id="language-menu" role="menu">
          <div class="lang-menu-title"><span class="en i">Site language</span><span class="tr i">Site dili</span></div>
          <button class="lang-option" type="button" role="menuitem" data-lang-set="en"><span class="lang-code">GB</span> English</button>
          <button class="lang-option" type="button" role="menuitem" data-lang-set="tr"><span class="lang-code">TR</span> Türkçe</button>
        </div>
      </div>
      <button class="iconbtn" data-theme-toggle aria-label="Toggle theme" title="Light / Dark">
        <svg class="ic-moon" viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
        <svg class="ic-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"/></svg>
      </button>
    </div>
  </div>
</nav>'''

FOOT = '''<footer>
  <div class="wrap">
    <div>&copy; <span id="yr"></span> JinjaGames, Ankara, Türkiye</div>
    <div><a href="../">&larr; <span class="en i">Back to JinjaGames</span><span class="tr i">JinjaGames'e dön</span></a> · <a href="privacy/"><span class="en i">@@name@@ privacy</span><span class="tr i">@@name@@ gizlilik</span></a> · <a href="../privacy/"><span class="en i">Site privacy</span><span class="tr i">Site gizliliği</span></a></div>
  </div>
</footer>'''

CK = '<svg viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg>'
PRIVACY = '''      <div class="head rv">
        <span class="eyebrow"><span class="en i">Your data</span><span class="tr i">Verilerin</span></span>
        <h2 class="en">Play without an account. <span class="hl">Sign in only if you want to.</span></h2>
        <h2 class="tr">Hesapsız oyna. <span class="hl">Yalnızca istersen giriş yap.</span></h2>
        <p class="en">@@name@@ keeps your progress on your own device. An account is optional and only used to back up your progress. Ads come from Google AdMob and purchases go through Google Play.</p>
        <p class="tr">@@name@@ ilerlemeni kendi cihazında tutar. Hesap isteğe bağlıdır ve yalnızca ilerlemeni yedeklemek için kullanılır. Reklamlar Google AdMob'dan gelir, satın almalar Google Play üzerinden yapılır.</p>
      </div>
      <div class="privacy">
        <div class="pbox rv">
          <ul>
            <li>@@CK@@<span><span class="en i">No signup is needed to play. Levels, stars, gems and settings live on your device. An optional account (email or Google) backs them up so you can continue on another phone.</span><span class="tr i">Oynamak için kayıt gerekmez. Bölümler, yıldızlar, elmaslar ve ayarlar cihazında durur. İsteğe bağlı hesap (e-posta ya da Google) bunları yedekler, başka telefonda devam edebilirsin.</span></span></li>
            <li>@@CK@@<span><span class="en i">Ads come from Google AdMob. In the EEA and UK you get Google's consent form and can decline personalised ads. Pick "I'm under 13" and personalised ads are switched off.</span><span class="tr i">Reklamlar Google AdMob'dan gelir. AEA ve Birleşik Krallık'ta Google'ın onay formu çıkar ve kişiselleştirilmiş reklamları reddedebilirsin. "13 yaşından küçüğüm" dersen kişiselleştirilmiş reklamlar kapanır.</span></span></li>
            <li>@@CK@@<span><span class="en i">Anonymous game events and crash reports help us find bugs (Firebase). They are switched off for players who say they are under 13.</span><span class="tr i">Anonim oyun olayları ve çökme raporları hataları bulmamıza yardım eder (Firebase). 13 yaşından küçük olduğunu söyleyen oyuncular için kapalıdır.</span></span></li>
            <li>@@CK@@<span><span class="en i">Gem packs and the monthly pass are bought through Google Play. Your card details never reach us.</span><span class="tr i">Elmas paketleri ve aylık geçiş Google Play üzerinden alınır. Kart bilgilerin bize hiç ulaşmaz.</span></span></li>
            <li>@@CK@@<span><span class="en i">Delete your account any time in Settings, or follow the data deletion page. We do not sell your data, and the game never touches your contacts, photos, camera or microphone.</span><span class="tr i">Hesabını istediğin an Ayarlar'dan ya da veri silme sayfasından silebilirsin. Verilerini satmayız; oyun rehberine, fotoğraflarına, kamerana ya da mikrofonuna dokunmaz.</span></span></li>
          </ul>
        </div>
        <div class="pside rv">
          <h4><span class="en i">Read the full policy</span><span class="tr i">Politikanın tamamı</span></h4>
          <p class="en">The privacy policy spells out exactly what is stored, what leaves the device and who handles it, in English and Turkish.</p>
          <p class="tr">Gizlilik politikası neyin saklandığını, cihazdan neyin çıktığını ve kimin işlediğini tek tek yazar; İngilizce ve Türkçe.</p>
          <a href="privacy/"><span class="en i">Privacy policy</span><span class="tr i">Gizlilik politikası</span> <span class="arw">&rarr;</span></a>
          <a href="delete/" style="margin-top:10px"><span class="en i">Delete my data</span><span class="tr i">Verilerimi sil</span> <span class="arw">&rarr;</span></a>
        </div>
      </div>'''.replace('@@CK@@', CK)

CTA = '''      <div class="endcta rv">
        <img class="ic" src="img/icon.png" alt="" width="512" height="512" loading="lazy">
        <h2 class="en">@@cta_h_en@@</h2>
        <h2 class="tr">@@cta_h_tr@@</h2>
        <p class="en">@@cta_p_en@@</p>
        <p class="tr">@@cta_p_tr@@</p>
        <div class="cta">
          <a class="btn p" href="mailto:jinjagamesofficial@gmail.com?subject=@@name_q@@"><span class="en i">Write to us</span><span class="tr i">Bize yaz</span> <span class="arw">&rarr;</span></a>
          <a class="btn g" href="https://www.instagram.com/jinja.games/" target="_blank" rel="noopener">Instagram</a>
          <a class="btn g" href="../games/"><span class="en i">All games</span><span class="tr i">Tüm oyunlar</span></a>
        </div>
      </div>'''


def sub(s, vals):
    for k, v in vals.items():
        s = s.replace('@@%s@@' % k, v)
    return s


def build(slug, g):
    strings = json.load(open(os.path.join(HERE, 'strings_%s.json' % slug), encoding='utf8'))
    tabs, panes = [], []
    ART = {
        'dual': '<span class="art-dual"><img src="img/s/flow_node_0_idle.webp" alt=""><img src="img/s/flow_node_4_idle.webp" alt=""></span>',
        'room': '<span class="art-room"><svg viewBox="0 0 200 200" aria-hidden="true"><g class="rm-o"><rect x="22" y="22" width="76" height="76" rx="16"/><rect x="102" y="22" width="76" height="76" rx="16"/><rect x="102" y="102" width="76" height="76" rx="16"/></g><g class="rm-i"><rect x="22" y="22" width="76" height="76" rx="16"/><rect x="102" y="22" width="76" height="76" rx="16"/><rect x="102" y="102" width="76" height="76" rx="16"/></g><g class="rm-f"><rect x="21" y="21" width="78" height="78" rx="16"/><rect x="101" y="21" width="78" height="78" rx="16"/><rect x="101" y="101" width="78" height="78" rx="16"/><rect x="92" y="40" width="16" height="40"/><rect x="120" y="92" width="40" height="16"/></g><path class="rm-t" d="M60 60H140V140"/><circle class="rm-b" cx="34" cy="34" r="11"/></svg><img class="rm-j1" src="img/s/flow_node_0_done.webp" alt=""><img class="rm-j2" src="img/s/flow_node_0_idle.webp" alt=""></span>',
        'door': '<span class="art-pair"><img src="img/s/flow_door_closed.webp" alt=""><img src="img/s/flow_key_badge.webp" alt=""></span>',
        'counter': '<span class="art-counter"><img src="img/s/flow_node_1_idle.webp" alt=""><b>7</b></span>',
    }
    for n, (key, sprite, level, art) in enumerate(g['lab']):
        nm = strings[key]
        desc = strings[key + '.desc']
        tabs.append('          <button class="lab-tab" type="button" role="tab"><img src="img/s/%s.webp" alt="" width="192" height="192" loading="lazy"><span><span class="en i">%s</span><span class="tr i">%s</span></span></button>'
                    % (sprite, esc(nm['en']), esc(nm['tr'])))
        art_html = ART[art] if art else '<img src="img/s/%s.webp" alt="" width="192" height="192" loading="lazy">' % sprite
        panes.append('''          <div class="lab-pane" role="tabpanel">
            <div class="lab-art">%s</div>
            <div>
              <h3><span class="en i">%s</span><span class="tr i">%s</span></h3>
              <p class="en">%s</p>
              <p class="tr">%s</p>
              <p class="lab-tip"><span class="en i">First shows up at level %d</span><span class="tr i">İlk %d. bölümde karşına çıkar</span></p>
            </div>
          </div>''' % (art_html, esc(nm['en']), esc(nm['tr']), esc(desc['en']), esc(desc['tr']), level, level))
    gallery = '\n'.join('      <button type="button" data-full="img/shot-%d.webp" aria-label="%s"><img src="img/shot-%d.webp" alt="%s" width="540" height="960" loading="lazy"></button>'
                        % (i, g['shots_alt'][i - 1], i, g['shots_alt'][i - 1]) for i in range(1, 6))
    play = PLAY_URL[slug]
    if play:
        play_btn = ('<a class="btn p" href="%s" target="_blank" rel="noopener"><span class="en i">Get it on Google Play</span>'
                    '<span class="tr i">Google Play\'den indir</span> <span class="arw">&rarr;</span></a>' % play)
    else:
        play_btn = ('<span class="btn soon"><span class="dotlive" aria-hidden="true"></span><span class="en i">Coming soon to Google Play</span>'
                    '<span class="tr i">Yakında Google Play\'de</span></span>')
    rr = random.Random(3)
    bubbles = ''.join('<i style="--x:%d%%;--s:%dpx;--t:%.1fs;--dl:-%.1fs;--dr:%dpx"></i>' % (rr.randint(2, 96), rr.randint(14, 54), rr.uniform(9, 18), rr.uniform(0, 14), rr.randint(-60, 60)) for _ in range(18))
    ld = ('{"@context":"https://schema.org","@graph":[{"@type":"MobileApplication","name":"%(name)s","url":"https://jinjagames.com/%(slug)s/",'
          '"image":"https://jinjagames.com/%(slug)s/img/og.jpg","description":"%(ld_desc)s","applicationCategory":"GameApplication",'
          '"genre":"Puzzle","operatingSystem":"Android","inLanguage":["en","tr","de","es","pt","fr"],"offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},'
          '"author":{"@type":"Organization","name":"JinjaGames"},"publisher":{"@type":"Organization","name":"JinjaGames","url":"https://jinjagames.com/"}},'
          '{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"JinjaGames","item":"https://jinjagames.com/"},'
          '{"@type":"ListItem","position":2,"name":"Games","item":"https://jinjagames.com/games/"},'
          '{"@type":"ListItem","position":3,"name":"%(name)s","item":"https://jinjagames.com/%(slug)s/"}]}]}') % dict(g, slug=slug)
    puzzles = '[]'
    if slug == 'jellytrails':
        puzzles = open(os.path.join(HERE, 'puzzles_trails.json'), encoding='utf8').read()
    tags = {
        'slug': slug, 'name': g['name'], 'name_q': g['name'].replace(' ', '%20'), 'title': g['title'], 'desc': g['desc'], 'og_title': g['og_title'],
        'og_desc': g['og_desc'], 'bg': g['bg'], 'd_bg': g['d_bg'], 'ld': ld,
        'cta_h_en': g['cta_h'][0], 'cta_h_tr': g['cta_h'][1], 'cta_p_en': g['cta_p'][0], 'cta_p_tr': g['cta_p'][1],
    }
    html = read(g['tpl'])
    html = html.replace('@@HEAD@@', HEAD).replace('@@NAV@@', NAV).replace('@@FOOT@@', FOOT).replace('@@PRIVACY@@', PRIVACY).replace('@@CTA@@', CTA)
    html = html.replace('@@BASE_CSS@@', read('base.css')).replace('@@BASE_JS@@', read('base.js'))
    html = html.replace('@@LAB_TABS@@', '\n'.join(tabs)).replace('@@LAB_PANES@@', '\n'.join(panes)).replace('@@GALLERY@@', gallery)
    html = html.replace('@@PLAY_BTN@@', play_btn).replace('@@BUBBLES@@', bubbles)
    html = html.replace('@@PUZZLES@@', puzzles)
    html = sub(html, tags)
    import re
    left = set(re.findall(r'@@(\w+)@@', html))
    assert not left, left
    out = os.path.join(ROOT, slug, 'index.html')
    open(out, 'w', encoding='utf8', newline='\n').write(html)
    print('ok', slug, round(len(html) / 1024), 'KB')


if __name__ == '__main__':
    for slug, g in GAMES.items():
        build(slug, g)
