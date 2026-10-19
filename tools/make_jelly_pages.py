"""Jelly Trails ve Jelly Pipes tanıtım sayfalarını üretir:
   jellytrails/index.html  ->  https://jinjagames.com/jellytrails/
   jellypipes/index.html   ->  https://jinjagames.com/jellypipes/

Görseller C:\\Users\\user\\Desktop\\Puzzles\\store altından alınır (simge, özellik grafiği,
telefon ekran görüntüleri) ve <slug>/img/ altına webp/png olarak yazılır.
İçerik mağaza metinlerinden (store/*/listing_*.txt) ve oyunların kodundan çıkarıldı.
Gizlilik özeti, jellytrails/privacy ile aynı gerçeklere dayanır (AdMob + Google Play satın alma,
hesap yok, analiz yok); orası değişirse buradaki 'Verilerin' bölümü de güncellenmeli.
Google Play bağlantısı yayına çıkınca PLAY_URL'ye yazılır; boşken 'Yakında' rozeti görünür."""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STORE = r'C:\Users\user\Desktop\Puzzles\store'
UPDATED = '2026-10-19'

# Yayına çıkınca doldur: 'https://play.google.com/store/apps/details?id=com.jinjagames.jellytrails'
PLAY_URL = {'jellytrails': '', 'jellypipes': ''}

# (ikon yolu: 24x24 viewBox, çizgi)
ICONS = {
    'path': '<path d="M4 18c0-6 8-2 8-8s6-4 8-4"/><circle cx="4" cy="18" r="1.6"/><circle cx="20" cy="6" r="1.6"/>',
    'grid': '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M4 12h16M12 4v16"/>',
    'star': '<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8z"/>',
    'clock': '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.2 2"/>',
    'gem': '<path d="M6.5 4h11L21 9.5 12 20 3 9.5z"/><path d="M3 9.5h18M9 4l-2 5.5L12 20l5-10.5L15 4"/>',
    'bulb': '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
    'drop': '<path d="M12 3.5s6 6.2 6 10.5a6 6 0 0 1-12 0C6 9.700 12 3.500 12 3.500z"/>',
    'puzzle': '<path d="M5 9h3.2a2.2 2.2 0 1 1 4.4 0H16v3.2a2.200 2.200 0 1 1 0 4.400V20H5z"/>',
    'gift': '<rect x="4" y="9" width="16" height="11" rx="2"/><path d="M4 13h16M12 9v11M12 9c-3 0-4.500-3-2.500-4s3.500 1.500 2.500 4zM12 9c3 0 4.500-3 2.500-4S11 6.500 12 9z"/>',
    'globe': '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.600 2.500 3.900 5.500 3.900 9S14.600 18.500 12 21M12 3C9.400 5.500 8.100 8.500 8.100 12s1.300 6.500 3.900 9"/>',
    'flag': '<path d="M6 21V4M6 5h11l-2 4 2 4H6"/>',
    'bubble': '<circle cx="10" cy="14" r="6"/><circle cx="17.500" cy="7" r="2.500"/><path d="M7 12a3.500 3.500 0 0 1 2.500-2"/>',
}

GAMES = [
    {
        'slug': 'jellytrails', 'store': 'jelly_trails', 'name': 'Jelly Trails',
        'pkg': 'com.jinjagames.jellytrails',
        'accent': '#7A4FD6', 'accent2': '#9166E6', 'accent_rgb': '122,79,214', 'pop': '#E8607A', 'pop_rgb': '232,96,122',
        'bg': '#F7F2FF', 'bg_soft': '#EFE7FC', 'surface': '#FFFFFF', 'surface2': '#FAF6FF', 'ink': '#241D33', 'ink2': '#5D5470',
        'ink3': '#6C6380', 'line': '#E7DEF4', 'line2': '#D8CBEB',
        'd_accent': '#B79BFF', 'd_accent2': '#CDB8FF', 'd_accent_rgb': '183,155,255', 'd_pop': '#FF8FA3', 'd_pop_rgb': '255,143,163',
        'd_bg': '#141019', 'd_bg_soft': '#191420', 'd_surface': '#1D1826', 'd_surface2': '#241E2F', 'd_ink': '#F3EFFA',
        'd_ink2': '#C6BED6', 'd_ink3': '#A096B5', 'd_line': '#2B2437', 'd_line2': '#3A3149',
        'title': 'Jelly Trails: Color Flow | Cute Jelly Puzzle Game for Android | JinjaGames',
        'desc': 'Jelly Trails is a cozy color-connect puzzle for Android. Drag to link matching jellies, fill every square, play 500 handcrafted levels across 50 sweet worlds. Free, in English and Turkish.',
        'og_title': 'Jelly Trails: Renk Yolu | JinjaGames',
        'og_desc': 'Şirin jöleleri aynı renkle bağla, tüm kareleri doldur. 500 bölüm, 50 dünya. Android için ücretsiz bulmaca.',
        'ld_desc': 'A cozy color-connect puzzle: drag a finger between two matching jellies, link every pair and fill every square. 500 handcrafted levels in 50 worlds.',
        'claim_en': 'Link the jellies. Fill the board.', 'claim_tr': 'Jöleleri bağla. Tahtayı doldur.',
        'lead_en': 'A cozy color-connect puzzle. Drag your finger to draw a glossy trail between two matching jellies, link every pair and fill every single square. Easy to learn, very hard to put down.',
        'lead_tr': 'Rahatlatıcı bir renk bağlama bulmacası. Parmağını sürükleyerek aynı renkli iki jöle arasında parlak bir yol çiz, tüm çiftleri bağla ve tahtadaki her kareyi doldur. Öğrenmesi kolay, bırakması zor.',
        'icon_alt': 'Jelly Trails app icon',
        'shots': ['01_R_home', '02_R_map2', '03_R_play24', '04_R_play30', '05_R_res30'],
        'shot_alt_en': ['Jelly Trails home screen', 'World map', 'A level in progress', 'A harder board', 'Level complete'],
        'shot_alt_tr': ['Jelly Trails ana ekran', 'Dünya haritası', 'Oynanan bir bölüm', 'Daha zor bir tahta', 'Bölüm tamamlandı'],
        'steps': [
            ('Drag to connect', 'Sürükleyerek bağla',
             'Press a jelly and drag to its twin. A glossy trail follows your finger and snaps into place.',
             'Bir jöleye bas ve eşine doğru sürükle. Parlak bir yol parmağını takip eder ve yerine oturur.'),
            ('Never cross, never leave a gap', 'Kesişme, boşluk bırakma',
             'Trails cannot cross, and every square of the board has to be filled before the level is done.',
             'Yollar kesişemez ve bölümün bitmesi için tahtadaki her kare dolmalı.'),
            ('Cut one? It springs back', 'Yolu kestin mi? Geri zıplar',
             'Cross an old trail and it simply springs back. Try as often as you like, nothing is lost.',
             'Eski bir yolun üstünden geçersen yol geri zıplar. İstediğin kadar dene, hiçbir şey kaybolmaz.'),
        ],
        'feats': [
            ('grid', '500 handcrafted levels', '500 özenle hazırlanmış bölüm',
             'Boards grow gently from tiny 3x3 squares to brain-tickling giants, so you are never thrown in at the deep end.',
             'Tahtalar minik 3x3 karelerden kafa yoran devlere yumuşakça büyür; seni hiçbir zaman derin sulara atmaz.'),
            ('path', 'A new twist every few worlds', 'Her birkaç dünyada yeni bir sürpriz',
             'Portals, straight and corner jellies, color gates, keyed gates, bridges, wandering blockers, triple and quad jellies and rotation limits.',
             'Portallar, düz ve köşe jöleler, renk kapıları, anahtarlı kapılar, köprüler, gezen engeller, üçlü ve dörtlü jöleler, dönüş sınırları.'),
            ('clock', 'Boss levels', 'Patron bölümleri',
             'Boss levels bring a time limit and a move limit together, for the moments you want a real challenge.',
             'Patron bölümleri süre ve hamle sınırını bir arada getirir; gerçek bir meydan okuma istediğin anlar için.'),
            ('star', 'Up to three stars', 'En fazla üç yıldız',
             'Every level can be replayed for a better score. The first 20 levels have no limits at all, so you can learn at your own pace.',
             'Her bölüm daha iyi bir skor için tekrar oynanabilir. İlk 20 bölümde hiçbir sınır yok, rahatça öğrenirsin.'),
            ('bulb', 'A hint when you are stuck', 'Takılınca ipucu',
             'Use a hint, get unstuck and keep the fun going. Short levels fit a coffee break, the bus or bedtime.',
             'Bir ipucu kullan, takıldığın yeri aş, eğlence kesilmesin. Kısa bölümler kahve molasına, yolculuğa ya da uyku öncesine sığar.'),
            ('gift', 'Daily gifts and gems', 'Günlük hediyeler ve elmaslar',
             'Daily gifts, star rewards and gems to spend in the shop. Optional ads and optional gem packs, nothing is forced.',
             'Günlük hediyeler, yıldız ödülleri ve mağazada harcayacağın elmaslar. Reklamlar ve elmas paketleri isteğe bağlı, hiçbir şey zorunlu değil.'),
        ],
        'stats': [('500', 'Handcrafted levels', 'Özenle hazırlanmış bölüm'), ('50', 'Sweet worlds', 'Tatlı dünya'),
                  ('3', 'Stars on every level', 'Her bölümde yıldız'), ('2', 'Languages: English, Turkish', 'Dil: İngilizce, Türkçe')],
        'worlds_h_en': '50 worlds to <span class="hl">wander through.</span>', 'worlds_h_tr': 'Gezecek <span class="hl">50 dünya.</span>',
        'worlds_p_en': 'Jelly Garden, Candy River, Cloud Field, Rainbow Bridge and many more. Every world has its own painted backdrop and its own sweet mood.',
        'worlds_p_tr': 'Jöle Bahçesi, Şeker Nehri, Bulut Tarlası, Gökkuşağı Köprüsü ve çok daha fazlası. Her dünyanın kendi çizilmiş arka planı ve tatlı bir havası var.',
        'cta_h_en': 'Almost on Google Play.', 'cta_h_tr': 'Neredeyse Google Play\'de.',
        'cta_p_en': 'Jelly Trails is in release preparation for Google Play. Want to know the day it lands, or have an idea for a new twist? Write to us.',
        'cta_p_tr': 'Jelly Trails\'in Google Play yayın hazırlığı sürüyor. Çıktığı günü öğrenmek ya da yeni bir sürpriz için fikrin varsa bize yaz.',
        'sibling': ('jellypipes', 'Jelly Pipes', 'Jelly Pipes: rotate glassy pipes and make the water reach every flower.',
                    'Jelly Pipes: cam boruları çevir, su her çiçeğe ulaşsın.'),
    },
    {
        'slug': 'jellypipes', 'store': 'jelly_pipes', 'name': 'Jelly Pipes',
        'pkg': 'com.jinjagames.jellypipes',
        'accent': '#1C7FB8', 'accent2': '#2A93CF', 'accent_rgb': '28,127,184', 'pop': '#E8728F', 'pop_rgb': '232,114,143',
        'bg': '#F1F8FC', 'bg_soft': '#E4F1F9', 'surface': '#FFFFFF', 'surface2': '#F5FAFD', 'ink': '#14262F', 'ink2': '#4B6370',
        'ink3': '#5F7682', 'line': '#D9E8F1', 'line2': '#C5DCEA',
        'd_accent': '#79C8F2', 'd_accent2': '#A2DBF8', 'd_accent_rgb': '121,200,242', 'd_pop': '#FF9DB4', 'd_pop_rgb': '255,157,180',
        'd_bg': '#0F1519', 'd_bg_soft': '#131B20', 'd_surface': '#182229', 'd_surface2': '#1E2A32', 'd_ink': '#EEF6FA',
        'd_ink2': '#B9CDD7', 'd_ink3': '#93A9B5', 'd_line': '#243139', 'd_line2': '#32434D',
        'title': 'Jelly Pipes: Water Puzzle | Flowing Pipe Puzzle Game for Android | JinjaGames',
        'desc': 'Jelly Pipes is a calming water puzzle for Android. Rotate sparkling glass pipes so real flowing water reaches every flower. 500 handcrafted levels across 50 worlds. Free, in English and Turkish.',
        'og_title': 'Jelly Pipes: Su Bulmacası | JinjaGames',
        'og_desc': 'Cam boruları çevir, su her çiçeğe ulaşsın. Gerçek akan su, 500 bölüm, 50 dünya. Android için ücretsiz bulmaca.',
        'ld_desc': 'A calming water puzzle: rotate sparkling glass pipes so water travels from the tap to every flower. 500 handcrafted levels in 50 worlds.',
        'claim_en': 'Tap, twist and let the water flow.', 'claim_tr': 'Dokun, çevir, suyu akıt.',
        'lead_en': 'A calming water puzzle. Rotate sparkling glass pipes so water travels from the tap to every thirsty flower, and watch it actually flow, bubble and splash along your pipes. Every flower you water blooms with a happy smile.',
        'lead_tr': 'Sakinleştirici bir su bulmacası. Işıltılı cam boruları çevir, su musluktan susamış her çiçeğe ulaşsın ve borularında gerçekten akışını, kabarcıklanışını izle. Suladığın her çiçek mutlu bir gülümsemeyle açar.',
        'icon_alt': 'Jelly Pipes app icon',
        'shots': ['01_Q_home', '02_Q_map3', '03_Q_play21', '04_Q_play30', '05_Q_res30'],
        'shot_alt_en': ['Jelly Pipes home screen', 'World map', 'A level in progress', 'A harder board', 'Level complete'],
        'shot_alt_tr': ['Jelly Pipes ana ekran', 'Dünya haritası', 'Oynanan bir bölüm', 'Daha zor bir tahta', 'Bölüm tamamlandı'],
        'steps': [
            ('Tap a pipe to rotate it', 'Bir boruya dokunup çevir',
             'Every tap turns a pipe a quarter turn. Line the pieces up until there is a way through.',
             'Her dokunuş bir boruyu çeyrek tur çevirir. Bir geçit oluşana kadar parçaları hizala.'),
            ('Connect the tap to every flower', 'Musluğu her çiçeğe bağla',
             'The water only flows along an unbroken line of pipe, and every flower has to be reached.',
             'Su yalnızca kesintisiz bir boru hattı boyunca akar ve her çiçeğe ulaşmak zorunda.'),
            ('Watch the water run', 'Suyun akışını izle',
             'Water flows for real, bubbling and splashing through the glass. Wrong turns make it flow back.',
             'Su gerçekten akar; camın içinde kabarır ve sıçrar. Yanlış dönüşler suyu geri akıtır.'),
        ],
        'feats': [
            ('drop', 'Real flowing water', 'Gerçek akan su',
             'Not a color change, an actual simulation: water travels through the glass, bubbles and splashes, and every flower blooms when it arrives.',
             'Renk değişimi değil, gerçek bir simülasyon: su camın içinden akar, kabarır, sıçrar ve ulaştığı her çiçek açar.'),
            ('grid', '500 handcrafted levels', '500 özenle hazırlanmış bölüm',
             'Levels start tiny and grow into clever, satisfying brain-teasers, one gentle step at a time.',
             'Bölümler minik başlar ve her adımda yumuşakça akıllı, tatmin edici zeka oyunlarına dönüşür.'),
            ('puzzle', 'Fresh mechanics in every world', 'Her dünyada yeni mekanikler',
             'Locked pipes, rocks, frozen pipes that melt when a flower blooms, one-way valves, extra taps with colored flowers, linked pipes, two-color flowers, aged pipes, pumps, grumpy cactuses, swap badges and spinning wheels.',
             'Kilitli borular, kayalar, bir çiçek açınca eriyen donmuş borular, tek yönlü valfler, renkli çiçekli ek musluklar, bağlı borular, iki renkli çiçekler, yaşlı borular, pompalar, huysuz kaktüsler, takas rozetleri ve dönen çarklar.'),
            ('clock', 'Boss levels', 'Patron bölümleri',
             'Boss levels bring a time limit and a move limit together. The first 20 levels have no limits at all.',
             'Patron bölümleri süre ve hamle sınırını bir arada getirir. İlk 20 bölümde hiçbir sınır yok.'),
            ('bulb', 'A hint when you are stuck', 'Takılınca ipucu',
             'Use a hint and keep the water flowing. Short levels fit a break anywhere, with soft and soothing sounds.',
             'Bir ipucu kullan, su akmaya devam etsin. Kısa bölümler her yerde bir mola için uygun; sesler yumuşak ve rahatlatıcı.'),
            ('gift', 'Daily gifts and gems', 'Günlük hediyeler ve elmaslar',
             'Daily gifts, star rewards and gems to spend in the shop. Optional ads and optional gem packs, nothing is forced.',
             'Günlük hediyeler, yıldız ödülleri ve mağazada harcayacağın elmaslar. Reklamlar ve elmas paketleri isteğe bağlı, hiçbir şey zorunlu değil.'),
        ],
        'stats': [('500', 'Handcrafted levels', 'Özenle hazırlanmış bölüm'), ('50', 'Refreshing worlds', 'Ferahlatıcı dünya'),
                  ('12', 'Special pipe mechanics', 'Özel boru mekaniği'), ('2', 'Languages: English, Turkish', 'Dil: İngilizce, Türkçe')],
        'worlds_h_en': '50 worlds to <span class="hl">dive into.</span>', 'worlds_h_tr': 'Dalacak <span class="hl">50 dünya.</span>',
        'worlds_p_en': 'Droplet Garden, Flower Brook, Waterfall Cave, Rainbow Pool, Crystal Lake, Coral Reef and many more, each with beautiful aqua-glass art.',
        'worlds_p_tr': 'Damla Bahçesi, Çiçek Deresi, Şelale Mağarası, Gökkuşağı Havuzu, Kristal Göl, Mercan Resifi ve çok daha fazlası; hepsi güzel bir su camı çizimiyle.',
        'cta_h_en': 'Almost on Google Play.', 'cta_h_tr': 'Neredeyse Google Play\'de.',
        'cta_p_en': 'Jelly Pipes is in release preparation for Google Play. Want to know the day it lands, or have an idea for a new pipe? Write to us.',
        'cta_p_tr': 'Jelly Pipes\'in Google Play yayın hazırlığı sürüyor. Çıktığı günü öğrenmek ya da yeni bir boru için fikrin varsa bize yaz.',
        'sibling': ('jellytrails', 'Jelly Trails', 'Jelly Trails: link matching jellies and fill the whole board.',
                    'Jelly Trails: aynı renkli jöleleri bağla, tüm tahtayı doldur.'),
    },
]

PAGE = r'''<!doctype html>
<html lang="en" data-lang="en" data-theme="light">
<head>
<meta charset="utf-8" />
<script>
// Keep legacy index.html links on the same clean URL as directory links.
if ((location.protocol === 'https:' || location.protocol === 'http:') && location.pathname.endsWith('/index.html')) {
  history.replaceState(history.state, '', location.pathname.replace(/index\.html$/, '') + location.search + location.hash);
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
</script>

<style>
/* ============================================================
   @@name@@ — oyun sayfası
   Jelly serisinin ortak yüzü: yumuşak pastel zemin, yuvarlak köşe,
   keskin çizgi ve sert gölge yok. Yazı: başlıklar Fraunces, gövde Nunito.
   Seri rengi sayfaya göre değişir: --accent (ana) ve --pop (vurgu).
   ============================================================ */
:root{
  --bg:@@bg@@; --bg-soft:@@bg_soft@@; --surface:@@surface@@; --surface-2:@@surface2@@;
  --ink:@@ink@@; --ink-2:@@ink2@@; --ink-3:@@ink3@@;
  --line:@@line@@; --line-2:@@line2@@;
  --accent:@@accent@@; --accent-2:@@accent2@@; --accent-rgb:@@accent_rgb@@;
  --pop:@@pop@@; --pop-rgb:@@pop_rgb@@;
  --nav-bg:rgba(255,255,255,.78); --nav-bg-solid:rgba(255,255,255,.97);
  --shadow-1:0 2px 4px rgba(36,29,51,.03), 0 12px 30px rgba(36,29,51,.07);
  --shadow-2:0 24px 60px rgba(36,29,51,.14);
  --W:1180px; --ease:cubic-bezier(.22,1,.36,1); --navh:74px; --r:26px; --r-sm:16px;
  --f-body:'Nunito',-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  --f-display:'Fraunces',Georgia,'Times New Roman',serif;
}
html[data-theme="dark"]{
  color-scheme:dark;
  --bg:@@d_bg@@; --bg-soft:@@d_bg_soft@@; --surface:@@d_surface@@; --surface-2:@@d_surface2@@;
  --ink:@@d_ink@@; --ink-2:@@d_ink2@@; --ink-3:@@d_ink3@@;
  --line:@@d_line@@; --line-2:@@d_line2@@;
  --accent:@@d_accent@@; --accent-2:@@d_accent2@@; --accent-rgb:@@d_accent_rgb@@;
  --pop:@@d_pop@@; --pop-rgb:@@d_pop_rgb@@;
  --nav-bg:rgba(20,16,25,.78); --nav-bg-solid:rgba(20,16,25,.97);
  --shadow-1:0 2px 4px rgba(0,0,0,.3), 0 12px 30px rgba(0,0,0,.3);
  --shadow-2:0 24px 60px rgba(0,0,0,.5);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{background:var(--bg);color:var(--ink);font-family:var(--f-body);font-size:17.5px;line-height:1.78;-webkit-font-smoothing:antialiased;transition:background .35s ease,color .35s ease}
a{color:inherit;text-decoration:none}
img{max-width:100%;display:block;height:auto}
button{font:inherit;color:inherit}
:focus-visible{outline:3px solid var(--accent);outline-offset:3px;border-radius:10px}
.wrap{max-width:var(--W);margin:0 auto;padding:0 30px}
h1,h2,h3,h4{font-family:var(--f-display);font-weight:700;line-height:1.16;letter-spacing:-.018em}
.eyebrow{display:inline-block;font-weight:800;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}
.tr,.en{display:block}
html[data-lang="en"] .tr{display:none!important}
html[data-lang="tr"] .en{display:none!important}
.tr.i,.en.i{display:inline}
html[data-lang="en"] .tr.i{display:none!important}
html[data-lang="tr"] .en.i{display:none!important}
@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation:none!important;transition-duration:.001ms!important;scroll-behavior:auto!important}}

/* NAV */
nav#nav{position:fixed;top:0;left:0;right:0;z-index:100;background:var(--nav-bg);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid transparent;transition:background .3s,border-color .3s}
nav#nav.stuck{background:var(--nav-bg-solid);border-color:var(--line)}
.nav-in{max-width:var(--W);margin:0 auto;padding:0 30px;height:var(--navh);display:flex;align-items:center;justify-content:space-between;gap:14px}
.brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:16.5px;color:var(--ink-2);transition:color .2s}
.brand img{height:28px;width:auto}
.brand:hover{color:var(--ink)}
.nav-end{display:flex;align-items:center;gap:8px}
.back{font-size:14.5px;font-weight:700;color:var(--ink-2);padding:9px 14px;border-radius:999px;white-space:nowrap;transition:.2s}
.back:hover{color:var(--accent);background:var(--bg-soft)}
.lang-menu{position:relative}
.lang-trigger{min-width:78px;height:38px;display:flex;align-items:center;justify-content:center;gap:7px;padding:0 12px;background:var(--surface);border:1px solid var(--line-2);border-radius:999px;cursor:pointer;color:var(--ink-2);font-size:12px;font-weight:800;letter-spacing:.05em;transition:.22s}
.lang-trigger:hover,.lang-menu.open .lang-trigger{color:var(--accent);border-color:var(--accent)}
.lang-globe{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.7}
.lang-chev{width:11px;height:11px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;transition:transform .22s}
.lang-menu.open .lang-chev{transform:rotate(180deg)}
.lang-popover{position:absolute;right:0;top:calc(100% + 10px);width:222px;padding:8px;background:var(--surface);border:1px solid var(--line);border-radius:18px;box-shadow:var(--shadow-2);opacity:0;visibility:hidden;transform:translateY(-6px);transition:.22s;z-index:220}
.lang-menu.open .lang-popover{opacity:1;visibility:visible;transform:none}
.lang-menu-title{padding:7px 10px 9px;color:var(--ink-3);font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
.lang-option{width:100%;display:flex;align-items:center;gap:10px;padding:10px;border:0;border-radius:12px;background:transparent;cursor:pointer;text-align:left;color:var(--ink-2);font-size:14.5px;font-weight:700;transition:.2s}
.lang-option:hover,.lang-option.on{background:var(--bg-soft);color:var(--ink)}
.lang-code{min-width:22px;color:var(--accent);font-size:10.5px;font-weight:800;letter-spacing:.06em}
.lang-option.on::after{content:"";width:7px;height:7px;border-radius:50%;background:var(--accent);margin-left:auto}
.iconbtn{width:38px;height:38px;border-radius:999px;background:var(--surface);border:1px solid var(--line-2);display:grid;place-items:center;cursor:pointer;color:var(--ink-2);transition:.22s}
.iconbtn:hover{color:var(--accent);border-color:var(--accent)}
.iconbtn svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
html[data-theme="dark"] .ic-sun{display:block}html[data-theme="dark"] .ic-moon{display:none}
.ic-sun{display:none}.ic-moon{display:block}

/* BUTONLAR */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:11px;padding:16px 28px;border-radius:999px;font-weight:800;font-size:16px;border:1.5px solid transparent;cursor:pointer;transition:transform .25s var(--ease),background .2s,color .2s,border-color .2s,box-shadow .25s}
.btn.p{background:var(--accent);color:#fff;box-shadow:0 12px 26px rgba(var(--accent-rgb),.28)}
html[data-theme="dark"] .btn.p{color:#15101D}
.btn.p:hover{transform:translateY(-3px);background:var(--accent-2)}
.btn.g{background:var(--surface);color:var(--ink);border-color:var(--line-2)}
.btn.g:hover{transform:translateY(-3px);border-color:var(--accent);color:var(--accent)}
.btn.soon{background:var(--surface);color:var(--ink-2);border-color:var(--line-2);cursor:default}
.btn.soon:hover{transform:none}
.btn .dotlive{width:9px;height:9px;border-radius:50%;background:var(--pop)}
.arw{transition:transform .3s var(--ease)}.btn:hover .arw{transform:translateX(5px)}

/* HERO */
.hero{padding:calc(var(--navh) + 66px) 0 84px;position:relative;overflow:hidden}
.hero::before{content:"";position:absolute;width:680px;height:680px;left:-260px;top:-220px;border-radius:50%;background:radial-gradient(circle,rgba(var(--accent-rgb),.16),transparent 66%);pointer-events:none}
.hero::after{content:"";position:absolute;width:520px;height:520px;right:-180px;bottom:-240px;border-radius:50%;background:radial-gradient(circle,rgba(var(--pop-rgb),.16),transparent 68%);pointer-events:none}
.hero-in{position:relative;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(280px,.95fr);gap:60px;align-items:center}
.crumb{display:flex;align-items:center;gap:10px;font-size:14px;font-weight:700;color:var(--ink-3);margin-bottom:30px;flex-wrap:wrap}
.crumb a:hover{color:var(--accent)}
.applogo{width:96px;height:96px;margin-bottom:22px;border-radius:24px;box-shadow:var(--shadow-1)}
h1{font-size:clamp(50px,8vw,92px);letter-spacing:-.03em}
.claim{margin-top:10px;font-family:var(--f-display);font-weight:600;font-size:clamp(22px,3.1vw,32px);line-height:1.3;letter-spacing:-.02em;color:var(--accent)}
.lead{max-width:560px;margin-top:20px;color:var(--ink-2);font-size:18px}
.hero .cta{display:flex;gap:13px;flex-wrap:wrap;margin-top:32px}
.badges{display:flex;gap:9px;flex-wrap:wrap;margin-top:24px}
.badges span{font-size:13.5px;font-weight:800;color:var(--ink-2);background:var(--surface);border:1px solid var(--line-2);padding:5px 14px;border-radius:999px}
.hero-art{position:relative;display:grid;place-items:center}
.hero-art .frame{width:min(100%,330px);border-radius:40px;overflow:hidden;box-shadow:var(--shadow-2);border:8px solid var(--surface);background:var(--surface)}
.hero-art .frame img{width:100%;aspect-ratio:9/16;object-fit:cover}

/* BÖLÜMLER */
section.blk{padding:100px 0;position:relative}
.band{background:var(--bg-soft)}
.head{max-width:720px;margin-bottom:54px}
.head h2{font-size:clamp(32px,4.5vw,50px);margin:14px 0 18px}
.head p{color:var(--ink-2);font-size:18px}
.hl{color:var(--accent)}
.center{text-align:center;margin-left:auto;margin-right:auto}
.rv{opacity:0;transform:translateY(24px);transition:opacity .8s var(--ease),transform .8s var(--ease)}
.rv.in{opacity:1;transform:none}

/* EKRAN GÖRÜNTÜLERİ */
.shots{display:grid;grid-template-columns:repeat(4,1fr);gap:22px}
.shot{border-radius:30px;overflow:hidden;border:6px solid var(--surface);box-shadow:var(--shadow-1);background:var(--surface);transition:transform .35s var(--ease),box-shadow .35s}
.shot:hover{transform:translateY(-8px);box-shadow:var(--shadow-2)}
.shot img{width:100%;aspect-ratio:9/16;object-fit:cover}

/* ÜÇ ADIM */
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.stepc{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:34px 32px;transition:transform .3s var(--ease),box-shadow .3s}
.stepc:hover{transform:translateY(-5px);box-shadow:var(--shadow-1)}
.stepc .no{display:inline-grid;place-items:center;width:44px;height:44px;border-radius:50%;background:var(--bg-soft);color:var(--accent);font-family:var(--f-display);font-weight:700;font-size:19px;margin-bottom:18px}
.stepc h4{font-size:21px;margin-bottom:10px}
.stepc p{color:var(--ink-2);font-size:16px}

/* ÖZELLİKLER */
.feats{display:grid;grid-template-columns:repeat(2,1fr);gap:22px}
.feat{display:grid;grid-template-columns:76px minmax(0,1fr);gap:24px;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:32px 34px;transition:transform .3s var(--ease),box-shadow .3s,border-color .3s}
.feat:hover{transform:translateY(-4px);box-shadow:var(--shadow-1);border-color:var(--line-2)}
.feat .ico{width:76px;height:76px;border-radius:26px;display:grid;place-items:center;
  background:linear-gradient(150deg,rgba(var(--accent-rgb),.18),rgba(var(--pop-rgb),.16));
  box-shadow:inset 0 0 0 1px rgba(var(--accent-rgb),.16);
  transition:transform .4s var(--ease),box-shadow .3s}
.feat:hover .ico{transform:translateY(-3px) rotate(-5deg);box-shadow:inset 0 0 0 1px rgba(var(--accent-rgb),.34)}
.feat .ico svg{width:38px;height:38px;fill:none;stroke:var(--accent);stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.feat h4{font-size:20px;margin-bottom:8px}
.feat p{color:var(--ink-2);font-size:16px}

/* RAKAMLAR */
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;margin-top:52px}
.stats div{background:var(--surface);border:1px solid var(--line);border-radius:var(--r-sm);padding:26px;text-align:center}
.stats b{display:block;font-family:var(--f-display);font-weight:700;font-size:38px;line-height:1;color:var(--accent);margin-bottom:8px}
.stats span{font-size:13.5px;font-weight:700;color:var(--ink-3)}

/* GİZLİLİK */
.privacy{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.7fr);gap:30px;align-items:start}
.pbox{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:16px 36px 20px}
.pbox ul{list-style:none}
.pbox li{display:flex;gap:16px;align-items:flex-start;padding:18px 0;border-bottom:1px solid var(--line);color:var(--ink-2);font-size:16.5px}
.pbox li:last-child{border-bottom:0}
.pbox li svg{width:22px;height:22px;flex-shrink:0;margin-top:5px;fill:none;stroke:var(--accent);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.pside{background:var(--accent);color:#fff;border-radius:var(--r);padding:36px;box-shadow:0 18px 40px rgba(var(--accent-rgb),.26)}
html[data-theme="dark"] .pside{background:linear-gradient(150deg,rgba(var(--accent-rgb),.34),rgba(var(--accent-rgb),.18));color:var(--ink)}
.pside h4{font-size:22px;margin-bottom:12px}
.pside p{font-size:16px;opacity:.95;margin-bottom:22px}
.pside a{display:inline-flex;align-items:center;gap:10px;background:#fff;color:var(--accent);border:1px solid transparent;padding:12px 20px;border-radius:999px;font-weight:800;font-size:15px;transition:.22s}
html[data-theme="dark"] .pside a{background:var(--accent);color:#15101D}
.pside a:hover{transform:translateY(-2px)}

/* KARDEŞ OYUN */
.sib{display:flex;align-items:center;gap:22px;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:24px 28px;margin-top:22px;transition:transform .3s var(--ease),box-shadow .3s}
.sib:hover{transform:translateY(-4px);box-shadow:var(--shadow-1)}
.sib img{width:72px;height:72px;border-radius:18px;flex-shrink:0}
.sib b{display:block;font-family:var(--f-display);font-size:21px;margin-bottom:2px}
.sib span{color:var(--ink-2);font-size:15.5px}
.sib .arw{margin-left:auto;color:var(--accent);font-weight:800;font-size:22px}

/* CTA */
.endcta{background:var(--surface);border:1px solid var(--line);border-radius:38px;padding:74px 48px;text-align:center;position:relative;overflow:hidden;box-shadow:var(--shadow-1)}
.endcta::before{content:"";position:absolute;width:520px;height:520px;left:50%;top:-360px;transform:translateX(-50%);border-radius:50%;background:radial-gradient(circle,rgba(var(--accent-rgb),.18),transparent 66%)}
.endcta>*{position:relative}
.endcta img{width:84px;height:84px;margin:0 auto 22px;border-radius:22px}
.endcta h2{font-size:clamp(30px,4.2vw,46px);margin-bottom:16px}
.endcta p{color:var(--ink-2);font-size:18px;max-width:560px;margin:0 auto 32px}
.endcta .cta{display:flex;gap:13px;justify-content:center;flex-wrap:wrap}

footer{border-top:1px solid var(--line);padding:38px 0;color:var(--ink-3);font-size:14.5px}
footer .wrap{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
footer a{font-weight:700;color:var(--ink-2)}
footer a:hover{color:var(--accent)}

@media(max-width:960px){
  .hero-in{grid-template-columns:1fr;gap:46px}
  .hero-art{max-width:330px;margin:0 auto}
  .steps,.feats{grid-template-columns:1fr}
  .privacy{grid-template-columns:1fr}
  .stats{grid-template-columns:1fr 1fr}
  .shots{grid-template-columns:repeat(2,1fr)}
}
@media(max-width:560px){
  .stats{grid-template-columns:1fr;gap:12px}
  .stats div{display:flex;align-items:center;gap:18px;text-align:left;padding:18px 22px}
  .stats b{margin-bottom:0;font-size:32px;min-width:66px}
  .stats span{font-size:15px}
  .shots{gap:14px}
  .shot{border-width:4px;border-radius:24px}
  .sib{padding:18px}
  .sib img{width:56px;height:56px}
}
@media(max-width:680px){
  :root{--navh:64px;--r:22px}
  body{font-size:16.5px}
  .wrap{padding:0 20px}
  section.blk{padding:66px 0}
  .hero{padding:calc(var(--navh) + 36px) 0 56px}
  .hero .cta{flex-direction:column;align-items:stretch}
  .feat{grid-template-columns:1fr;gap:16px;padding:28px 24px}
  .pbox{padding:10px 24px 14px}
  .endcta{padding:48px 24px;border-radius:28px}
  .back{padding:9px 8px}
}
html,body{overflow-x:hidden;overflow-x:clip}

/* TELEFON RÖTUŞU: küçük bağlantıların dokunma alanı 44 piksele çıkar. */
@media(max-width:680px){
  .brand{min-height:44px}
  .crumb a,footer a,.pside a{position:relative}
  .crumb a::after,footer a::after{content:"";position:absolute;left:0;right:0;top:50%;height:44px;transform:translateY(-50%)}
  .brand span{display:none}
  .brand{min-width:44px}
  .crumb a::after{left:-10px;right:-10px}
}
</style>
<script src="../assets/clean-scroll.js?v=20261012d" defer></script>
<script src="../assets/local-links.js?v=20261012d"></script>
</head>
<body>

<nav id="nav">
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
</nav>

<header class="hero">
  <div class="wrap">
    <nav class="crumb" aria-label="Breadcrumb"><a href="../"><span class="en i">Home</span><span class="tr i">Ana Sayfa</span></a><span aria-hidden="true">/</span><a href="../games/"><span class="en i">Games</span><span class="tr i">Oyunlar</span></a><span aria-hidden="true">/</span><span>@@name@@</span></nav>
    <div class="hero-in">
      <div>
        <img class="applogo" src="img/icon.png" alt="@@icon_alt@@" width="512" height="512">
        <h1>@@name@@</h1>
        <p class="claim en">@@claim_en@@</p>
        <p class="claim tr">@@claim_tr@@</p>
        <p class="lead en">@@lead_en@@</p>
        <p class="lead tr">@@lead_tr@@</p>
        <div class="cta">
          @@play_btn@@
          <a class="btn g" href="#how"><span class="en i">How it works</span><span class="tr i">Nasıl oynanır?</span></a>
        </div>
        <div class="badges"><span>Android</span><span class="en i">Free to play</span><span class="tr i">Ücretsiz</span><span>EN · TR</span></div>
      </div>
      <div class="hero-art">
        <div class="frame"><img src="img/shot-1.webp" alt="" width="540" height="960" loading="eager"></div>
      </div>
    </div>
  </div>
</header>

<main>

  <!-- EKRAN GÖRÜNTÜLERİ -->
  <section class="blk band">
    <div class="wrap">
      <div class="head center rv" style="text-align:center">
        <span class="eyebrow"><span class="en i">Take a look</span><span class="tr i">Bir göz at</span></span>
        <h2 class="en">Soft, glossy and <span class="hl">a little bit squishy.</span></h2>
        <h2 class="tr">Yumuşak, parlak ve <span class="hl">biraz da jöle gibi.</span></h2>
      </div>
      <div class="shots rv">
@@shots@@
      </div>
    </div>
  </section>

  <!-- ÜÇ ADIM -->
  <section id="how" class="blk">
    <div class="wrap">
      <div class="head rv">
        <span class="eyebrow"><span class="en i">How to play</span><span class="tr i">Nasıl oynanır</span></span>
        <h2 class="en">Three things to know, <span class="hl">then just play.</span></h2>
        <h2 class="tr">Bilmen gereken üç şey, <span class="hl">sonrası oyun.</span></h2>
      </div>
      <div class="steps">
@@steps@@
      </div>
    </div>
  </section>

  <!-- ÖZELLİKLER -->
  <section id="features" class="blk band">
    <div class="wrap">
      <div class="head rv">
        <span class="eyebrow"><span class="en i">What makes it special</span><span class="tr i">Neden özel</span></span>
        <h2 class="en">Built for a calm break <span class="hl">anywhere.</span></h2>
        <h2 class="tr">Her yerde sakin bir mola için <span class="hl">tasarlandı.</span></h2>
        <p class="en">Short, satisfying levels with soft sounds. No pressure at the start, a real challenge when you want one.</p>
        <p class="tr">Kısa, tatmin edici bölümler ve yumuşak sesler. Başlangıçta baskı yok, istediğinde gerçek bir meydan okuma var.</p>
      </div>
      <div class="feats">
@@feats@@
      </div>
      <div class="stats rv">
@@stats@@
      </div>
    </div>
  </section>

  <!-- DÜNYALAR -->
  <section class="blk">
    <div class="wrap">
      <div class="head rv">
        <span class="eyebrow"><span class="en i">The worlds</span><span class="tr i">Dünyalar</span></span>
        <h2 class="en">@@worlds_h_en@@</h2>
        <h2 class="tr">@@worlds_h_tr@@</h2>
        <p class="en">@@worlds_p_en@@</p>
        <p class="tr">@@worlds_p_tr@@</p>
      </div>
      <a class="sib rv" href="../@@sib_slug@@/">
        <img src="../@@sib_slug@@/img/icon.png" alt="" width="512" height="512" loading="lazy">
        <div><b>@@sib_name@@</b><span class="en">@@sib_en@@</span><span class="tr">@@sib_tr@@</span></div>
        <span class="arw" aria-hidden="true">&rarr;</span>
      </a>
    </div>
  </section>

  <!-- GİZLİLİK -->
  <section class="blk band">
    <div class="wrap">
      <div class="head rv">
        <span class="eyebrow"><span class="en i">Your data</span><span class="tr i">Verilerin</span></span>
        <h2 class="en">No account. <span class="hl">No personal data from us.</span></h2>
        <h2 class="tr">Hesap yok. <span class="hl">Bizden kişisel veri yok.</span></h2>
        <p class="en">@@name@@ keeps your progress on your own device. The only outside services are Google AdMob for the optional ads and Google Play for purchases.</p>
        <p class="tr">@@name@@ ilerlemeni kendi cihazında tutar. Dışarıdaki tek hizmetler isteğe bağlı reklamlar için Google AdMob ve satın almalar için Google Play.</p>
      </div>
      <div class="privacy">
        <div class="pbox rv">
          <ul>
            <li><svg viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg><span><span class="en i">No signup, no email, no phone number. The game never asks who you are.</span><span class="tr i">Kayıt yok, mail adresi yok, telefon numarası yok. Oyun kim olduğunu hiç sormaz.</span></span></li>
            <li><svg viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg><span><span class="en i">Levels, stars, gems and settings stay in the game's private storage on your device. Uninstall and they are gone.</span><span class="tr i">Bölümler, yıldızlar, elmaslar ve ayarlar cihazındaki oyunun özel alanında durur. Oyunu silince onlar da gider.</span></span></li>
            <li><svg viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg><span><span class="en i">Ads come from Google AdMob and are limited to content rated for teens. You can reset your advertising ID in your device settings.</span><span class="tr i">Reklamlar Google AdMob'dan gelir ve gençler için uygun içerikle sınırlıdır. Reklam kimliğini cihaz ayarlarından sıfırlayabilirsin.</span></span></li>
            <li><svg viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg><span><span class="en i">Gem packs are bought through Google Play. Your payment details never reach us.</span><span class="tr i">Elmas paketleri Google Play üzerinden alınır. Ödeme bilgilerin bize hiç ulaşmaz.</span></span></li>
            <li><svg viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg><span><span class="en i">No analytics and no crash reports are sent anywhere. The game does not touch your contacts, photos, camera, microphone or precise location.</span><span class="tr i">Hiçbir yere analiz ya da çökme raporu gönderilmez. Oyun rehberine, fotoğraflarına, kamerana, mikrofonuna ya da kesin konumuna dokunmaz.</span></span></li>
          </ul>
        </div>
        <div class="pside rv">
          <h4><span class="en i">Read the full policy</span><span class="tr i">Politikanın tamamı</span></h4>
          <p class="en">The privacy policy spells out exactly what is stored, what leaves the device and who handles it, in English and Turkish.</p>
          <p class="tr">Gizlilik politikası neyin saklandığını, cihazdan neyin çıktığını ve kimin işlediğini tek tek yazar; İngilizce ve Türkçe.</p>
          <a href="privacy/"><span class="en i">Privacy policy</span><span class="tr i">Gizlilik politikası</span> <span class="arw">&rarr;</span></a>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="blk">
    <div class="wrap">
      <div class="endcta rv">
        <img src="img/icon.png" alt="" width="512" height="512" loading="lazy">
        <h2 class="en">@@cta_h_en@@</h2>
        <h2 class="tr">@@cta_h_tr@@</h2>
        <p class="en">@@cta_p_en@@</p>
        <p class="tr">@@cta_p_tr@@</p>
        <div class="cta">
          <a class="btn p" href="mailto:jinjagamesofficial@gmail.com?subject=@@name_q@@"><span class="en i">Write to us</span><span class="tr i">Bize yaz</span> <span class="arw">&rarr;</span></a>
          <a class="btn g" href="https://www.instagram.com/jinja.games/" target="_blank" rel="noopener">Instagram</a>
          <a class="btn g" href="../games/"><span class="en i">All games</span><span class="tr i">Tüm oyunlar</span></a>
        </div>
      </div>
    </div>
  </section>
</main>

<footer>
  <div class="wrap">
    <div>&copy; <span id="yr"></span> JinjaGames, Ankara, Türkiye</div>
    <div><a href="../">&larr; <span class="en i">Back to JinjaGames</span><span class="tr i">JinjaGames'e dön</span></a> · <a href="privacy/"><span class="en i">@@name@@ privacy</span><span class="tr i">@@name@@ gizlilik</span></a> · <a href="../privacy/"><span class="en i">Site privacy</span><span class="tr i">Site gizliliği</span></a></div>
  </div>
</footer>

<script>
(function(){
  'use strict';
  var d=document, root=d.documentElement;
  function $(s,c){return (c||d).querySelector(s);}
  function $$(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s));}
  function store(k,v){try{localStorage.setItem(k,v);}catch(e){}}

  function paintLang(l){
    $$('[data-lang-set]').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-lang-set')===l); });
    $$('[data-current-lang]').forEach(function(el){ el.textContent=l.toUpperCase(); });
  }
  function closeLangMenus(){
    $$('.lang-menu.open').forEach(function(m){ m.classList.remove('open'); var t=$('[data-lang-toggle]',m); if(t) t.setAttribute('aria-expanded','false'); });
  }
  $$('[data-lang-set]').forEach(function(b){
    b.addEventListener('click',function(){
      var l=b.getAttribute('data-lang-set'); if(l!=='tr'&&l!=='en') l='en';
      root.setAttribute('data-lang',l); root.lang=l; store('jg_lang',l); paintLang(l); closeLangMenus();
    });
  });
  paintLang(root.getAttribute('data-lang')||'en');
  $$('[data-lang-toggle]').forEach(function(t){
    t.addEventListener('click',function(e){
      var m=t.closest('.lang-menu'), opening=!m.classList.contains('open');
      closeLangMenus(); if(opening){ m.classList.add('open'); t.setAttribute('aria-expanded','true'); }
      e.stopPropagation();
    });
  });
  d.addEventListener('click',function(e){ if(!e.target.closest('.lang-menu')) closeLangMenus(); });
  d.addEventListener('keydown',function(e){ if(e.key==='Escape') closeLangMenus(); });

  $$('[data-theme-toggle]').forEach(function(b){
    b.addEventListener('click',function(){
      var t=root.getAttribute('data-theme')==='dark'?'light':'dark';
      root.setAttribute('data-theme',t); store('jg_theme',t);
    });
  });

  var nav=$('#nav');
  window.addEventListener('scroll',function(){ nav.classList.toggle('stuck',(window.scrollY||0)>10); },{passive:true});

  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); },{threshold:.06,rootMargin:'0px 0px -60px 0px'});
    $$('.rv').forEach(function(el){ io.observe(el); });
  } else { $$('.rv').forEach(function(el){ el.classList.add('in'); }); }

  var yr=$('#yr'); if(yr) yr.textContent=new Date().getFullYear();
})();
</script>
</body>
</html>
'''


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def build_images(g):
    out = os.path.join(ROOT, g['slug'], 'img')
    os.makedirs(out, exist_ok=True)
    src = os.path.join(STORE, g['store'])
    icon = Image.open(os.path.join(src, 'app_icon_512.png')).convert('RGBA')
    icon.save(os.path.join(out, 'icon.png'), optimize=True)
    fg = Image.open(os.path.join(src, 'feature_graphic_title.png')).convert('RGB')
    # paylaşım görseli 1200x630: özellik grafiği (1024x500) ortalanıp kırpılarak ölçeklenir
    w, h = fg.size
    target = 1200 / 630
    cw = int(h * target)
    left = max(0, (w - cw) // 2)
    og = fg.crop((left, 0, left + min(cw, w), h)).resize((1200, 630), Image.LANCZOS)
    og.save(os.path.join(out, 'og.jpg'), quality=88, optimize=True)
    fg.resize((1024, 500), Image.LANCZOS).save(os.path.join(out, 'banner.webp'), 'WEBP', quality=84, method=6)
    for i, name in enumerate(g['shots'], 1):
        im = Image.open(os.path.join(src, 'screenshots', 'phone', name + '.png')).convert('RGB')
        im = im.resize((540, 960), Image.LANCZOS)
        im.save(os.path.join(out, 'shot-%d.webp' % i), 'WEBP', quality=82, method=6)


def build_page(g):
    cks = ('<path d="m5 13 4 4L19 7"/>')
    shots = []
    for i in range(2, 6):  # 1. görüntü hero'da
        shots.append('        <div class="shot"><img src="img/shot-%d.webp" alt="%s" width="540" height="960" loading="lazy"></div>'
                     % (i, esc(g['shot_alt_en'][i - 1])))
    steps = []
    for n, (te, tt, pe, pt) in enumerate(g['steps'], 1):
        steps.append('''        <div class="stepc rv">
          <span class="no">%d</span>
          <h4><span class="en i">%s</span><span class="tr i">%s</span></h4>
          <p class="en">%s</p>
          <p class="tr">%s</p>
        </div>''' % (n, esc(te), esc(tt), esc(pe), esc(pt)))
    feats = []
    for ic, te, tt, pe, pt in g['feats']:
        feats.append('''        <div class="feat rv">
          <div class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">%s</svg></div>
          <div>
            <h4><span class="en i">%s</span><span class="tr i">%s</span></h4>
            <p class="en">%s</p>
            <p class="tr">%s</p>
          </div>
        </div>''' % (ICONS[ic], esc(te), esc(tt), esc(pe), esc(pt)))
    stats = '\n'.join('        <div><b>%s</b><span class="en i">%s</span><span class="tr i">%s</span></div>' % (n, esc(e), esc(t))
                      for n, e, t in g['stats'])
    play = PLAY_URL[g['slug']]
    if play:
        play_btn = ('<a class="btn p" href="%s" target="_blank" rel="noopener"><span class="en i">Get it on Google Play</span>'
                    '<span class="tr i">Google Play\'den indir</span> <span class="arw">&rarr;</span></a>' % play)
    else:
        play_btn = ('<span class="btn soon"><span class="dotlive" aria-hidden="true"></span><span class="en i">Coming soon to Google Play</span>'
                    '<span class="tr i">Yakında Google Play\'de</span></span>')
    ld = ('{"@context":"https://schema.org","@graph":[{"@type":"MobileApplication","name":"%(name)s","url":"https://jinjagames.com/%(slug)s/",'
          '"image":"https://jinjagames.com/%(slug)s/img/og.jpg","description":"%(ld_desc)s","applicationCategory":"GameApplication",'
          '"genre":"Puzzle","operatingSystem":"Android","inLanguage":["en","tr"],"offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},'
          '"author":{"@type":"Organization","name":"JinjaGames"},"publisher":{"@type":"Organization","name":"JinjaGames","url":"https://jinjagames.com/"}},'
          '{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"JinjaGames","item":"https://jinjagames.com/"},'
          '{"@type":"ListItem","position":2,"name":"Games","item":"https://jinjagames.com/games/"},'
          '{"@type":"ListItem","position":3,"name":"%(name)s","item":"https://jinjagames.com/%(slug)s/"}]}]}') % g
    sib = g['sibling']
    vals = dict(g)
    vals.update({
        'ld': ld, 'play_btn': play_btn, 'shots': '\n'.join(shots), 'steps': '\n'.join(steps), 'feats': '\n'.join(feats),
        'stats': stats, 'sib_slug': sib[0], 'sib_name': sib[1], 'sib_en': esc(sib[2]), 'sib_tr': esc(sib[3]),
        'name_q': g['name'].replace(' ', '%20'),
    })
    html = PAGE
    for k, v in vals.items():
        if isinstance(v, str):
            html = html.replace('@@%s@@' % k, v)
    left = [t for t in set(__import__('re').findall(r'@@(\w+)@@', html))]
    assert not left, left
    # alt metni: ekran görüntüsü alt'ları EN; TR oturumda da okunabilir kalsın diye dile göre çift yazmıyoruz
    return html


for g in GAMES:
    build_images(g)
    html = build_page(g)
    out = os.path.join(ROOT, g['slug'], 'index.html')
    open(out, 'w', encoding='utf8', newline='\n').write(html)
    print('ok', g['slug'], len(html))
