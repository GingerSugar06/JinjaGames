"""Jelly Trails ve Jelly Pipes gizlilik sayfalarını üretir:
   jellytrails/privacy/index.html  ->  https://jinjagames.com/jellytrails/privacy/
   jellypipes/privacy/index.html   ->  https://jinjagames.com/jellypipes/privacy/

İçerik, oyunların kodundan çıkarıldı (Puzzles/apps/*): Google AdMob (ödüllü + geçiş reklamı,
içerik derecesi en çok T), Google Play üzerinden uygulama içi satın alma (mücevher paketleri),
ilerleme yalnız cihazda (shared_preferences), hesap yok, analiz olayları hiçbir yere gönderilmiyor.
Oyunlara Firebase, çökme raporu, rıza formu (UMP) vb. eklenirse bu metin güncellenmeli."""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUZZLES = r'C:\Users\user\Desktop\Puzzles\store'
UPDATED = ('19 October 2026', '19 Ekim 2026')

APPS = [
    {'slug': 'jellytrails', 'name': 'Jelly Trails', 'pkg': 'com.jinjagames.jellytrails', 'store': 'jelly_trails', 'accent': '#7A4FD6', 'accent_d': '#B79BFF', 'bg': '#F7F2FF', 'bg_d': '#141019'},
    {'slug': 'jellypipes', 'name': 'Jelly Pipes', 'pkg': 'com.jinjagames.jellypipes', 'store': 'jelly_pipes', 'accent': '#1C7FB8', 'accent_d': '#79C8F2', 'bg': '#F1F8FC', 'bg_d': '#0F1519'},
]

EN = '''
    <p class="note">{name} is a puzzle game made by JinjaGames, an independent studio in Ankara, Türkiye. This page explains what happens to data when you play it. In short: we do not collect personal data ourselves, the game has no accounts, and the only third parties involved are Google AdMob (ads) and Google Play (purchases).</p>

    <h2>Data we collect</h2>
    <p>None. {name} does not ask for your name, email address or phone number, has no sign up and no account, and we do not run any server that receives your data.</p>

    <h2>Data stored on your device</h2>
    <p>The game remembers your progress on your own device, inside its private storage:</p>
    <ul>
      <li>levels you have completed and your stars</li>
      <li>your gem and hint balance, and items you unlocked</li>
      <li>your settings, such as language, sound and music</li>
    </ul>
    <p>This is not sent to us. It is removed when you uninstall the game or clear its data. If Android backup is turned on, your device may back it up to your own Google account; that backup belongs to you and we have no access to it.</p>

    <h2>Advertising (Google AdMob)</h2>
    <p>The game shows ads through Google AdMob: rewarded ads that you choose to watch for a reward, and full screen ads between levels. To show, measure and limit ads and to prevent fraud, Google may collect information from your device, such as your advertising ID, IP address (and an approximate location derived from it), device and app information, and how you interact with ads. This information goes to Google, not to us, and is handled under Google's own policies:</p>
    <ul>
      <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google Privacy Policy</a></li>
      <li><a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener">How Google uses information from apps that use its services</a></li>
    </ul>
    <p>You can reset or delete your advertising ID, or opt out of personalised ads, in your device settings (on most Android devices: Settings &rsaquo; Google &rsaquo; Ads). Ads in the game are limited to content rated for teens.</p>

    <h2>In app purchases (Google Play)</h2>
    <p>You can buy gem packs inside the game. Payments are handled entirely by Google Play. Your payment details never reach us; the game only receives a confirmation of which pack was bought so it can add the gems. Purchases are governed by the Google Play terms and Google's privacy policy.</p>

    <h2>Analytics and crash reports</h2>
    <p>The game does not send analytics or crash reports to us or to any analytics service.</p>

    <h2>Permissions</h2>
    <p>The game uses an internet connection to load ads and to make purchases. The advertising ID permission is used only by the ad service described above. The game does not access your contacts, photos, camera, microphone or precise location.</p>

    <h2>Children</h2>
    <p>{name} is intended for players aged 13 and over and is not directed at children under 13. We do not knowingly collect personal data from children.</p>

    <h2>Sharing and selling</h2>
    <p>We do not sell, rent or share personal data, because we do not collect any. Data collected by Google for ads and purchases is described in the sections above.</p>

    <h2>Your rights</h2>
    <p>Depending on where you live (for example under the GDPR or Türkiye's KVKK), you may have rights to access or delete data about you. Since we hold no personal data, there is nothing for us to export or erase; for data held by Google, use Google's tools above. You are always welcome to contact us with any question.</p>

    <h2>Changes</h2>
    <p>If the game starts handling data differently, this page will be updated and the date at the top will change.</p>

    <h2>Contact</h2>
    <p>JinjaGames, Ankara, Türkiye · <a href="mailto:jinjagamesofficial@gmail.com">jinjagamesofficial@gmail.com</a></p>
    <p class="small">App: {name} · Package: {pkg}</p>
'''

TR = '''
    <p class="note">{name}, Ankara merkezli bağımsız stüdyo JinjaGames tarafından geliştirilen bir bulmaca oyunudur. Bu sayfa, oyunu oynarken verilere ne olduğunu açıklar. Kısaca: kişisel veriyi biz toplamıyoruz, oyunda hesap yok ve işin içindeki tek üçüncü taraflar Google AdMob (reklam) ve Google Play (satın alma).</p>

    <h2>Topladığımız veriler</h2>
    <p>Hiçbiri. {name} adınızı, mail adresinizi ya da telefon numaranızı istemez; kayıt ve hesap yoktur; verilerinizi alan bir sunucumuz yoktur.</p>

    <h2>Cihazınızda saklanan veriler</h2>
    <p>Oyun ilerlemenizi kendi cihazınızda, uygulamanın özel depolama alanında tutar:</p>
    <ul>
      <li>tamamladığınız bölümler ve yıldızlarınız</li>
      <li>mücevher ve ipucu bakiyeniz, açtığınız öğeler</li>
      <li>dil, ses ve müzik gibi ayarlarınız</li>
    </ul>
    <p>Bunlar bize gönderilmez. Oyunu kaldırdığınızda ya da verilerini temizlediğinizde silinir. Android yedekleme açıksa cihazınız bunları kendi Google hesabınıza yedekleyebilir; bu yedek size aittir ve bizim erişimimiz yoktur.</p>

    <h2>Reklamlar (Google AdMob)</h2>
    <p>Oyun, Google AdMob üzerinden reklam gösterir: ödül almak için kendi isteğinizle izlediğiniz ödüllü reklamlar ve bölüm aralarında tam ekran reklamlar. Reklamları göstermek, ölçmek, sıklığını sınırlamak ve sahtekârlığı önlemek için Google cihazınızdan reklam kimliğiniz, IP adresiniz (ve ondan çıkarılan yaklaşık konum), cihaz ve uygulama bilgileri ile reklamlarla etkileşiminiz gibi bilgiler toplayabilir. Bu bilgiler bize değil Google'a gider ve Google'ın kendi politikalarına tabidir:</p>
    <ul>
      <li><a href="https://policies.google.com/privacy?hl=tr" target="_blank" rel="noopener">Google Gizlilik Politikası</a></li>
      <li><a href="https://policies.google.com/technologies/partner-sites?hl=tr" target="_blank" rel="noopener">Google, hizmetlerini kullanan uygulamalardan gelen bilgileri nasıl kullanır</a></li>
    </ul>
    <p>Reklam kimliğinizi sıfırlayabilir ya da silebilir, kişiselleştirilmiş reklamları cihaz ayarlarından kapatabilirsiniz (çoğu Android cihazda: Ayarlar &rsaquo; Google &rsaquo; Reklamlar). Oyundaki reklamlar gençlere uygun içerikle sınırlıdır.</p>

    <h2>Uygulama içi satın alma (Google Play)</h2>
    <p>Oyunda mücevher paketleri satın alabilirsiniz. Ödemeler tamamen Google Play tarafından işlenir. Ödeme bilgileriniz bize hiçbir zaman ulaşmaz; oyun yalnızca hangi paketin alındığına dair bir onay alır ve mücevherleri ekler. Satın almalar Google Play şartlarına ve Google'ın gizlilik politikasına tabidir.</p>

    <h2>Analiz ve çökme raporları</h2>
    <p>Oyun bize ya da herhangi bir analiz hizmetine analiz verisi veya çökme raporu göndermez.</p>

    <h2>İzinler</h2>
    <p>Oyun internet bağlantısını reklam yüklemek ve satın alma yapmak için kullanır. Reklam kimliği izni yalnızca yukarıdaki reklam hizmeti tarafından kullanılır. Oyun rehberinize, fotoğraflarınıza, kameranıza, mikrofonunuza ya da hassas konumunuza erişmez.</p>

    <h2>Çocuklar</h2>
    <p>{name}, 13 yaş ve üzeri oyuncular için tasarlanmıştır ve 13 yaşından küçük çocuklara yönelik değildir. Çocuklardan bilerek kişisel veri toplamayız.</p>

    <h2>Paylaşım ve satış</h2>
    <p>Kişisel veri toplamadığımız için kişisel veri satmaz, kiralamaz ya da paylaşmayız. Reklam ve satın alma için Google'ın topladığı veriler yukarıdaki bölümlerde açıklanmıştır.</p>

    <h2>Haklarınız</h2>
    <p>Yaşadığınız yere göre (örneğin GDPR ya da KVKK kapsamında) hakkınızdaki verilere erişme veya onları sildirme haklarınız olabilir. Kişisel veri tutmadığımız için bizim dışa aktaracağımız ya da sileceğimiz bir veri yoktur; Google'ın tuttuğu veriler için yukarıdaki Google araçlarını kullanabilirsiniz. Her türlü sorunuz için bize yazabilirsiniz.</p>

    <h2>Değişiklikler</h2>
    <p>Oyun verileri farklı bir şekilde işlemeye başlarsa bu sayfa güncellenir ve üstteki tarih değişir.</p>

    <h2>İletişim</h2>
    <p>JinjaGames, Ankara, Türkiye · <a href="mailto:jinjagamesofficial@gmail.com">jinjagamesofficial@gmail.com</a></p>
    <p class="small">Uygulama: {name} · Paket: {pkg}</p>
'''

PAGE = '''<!doctype html>
<html lang="en" data-lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{name} Privacy Policy | JinjaGames</title>
<meta name="description" content="{name} privacy policy. No accounts and no personal data collected by JinjaGames; ads by Google AdMob and purchases by Google Play.">
<meta name="robots" content="noindex,follow">
<link rel="canonical" href="https://jinjagames.com/{slug}/privacy/">
<meta name="theme-color" content="{bg}">
<link rel="icon" type="image/png" href="icon.png">
<link rel="stylesheet" href="../../assets/fonts.css?v=20261012d">
<style>
:root{{--bg:{bg};--surface:#FFFFFF;--ink:#221D2B;--muted:#5D566A;--line:#E6E0EE;--accent:{accent};
  --f-body:'Nunito',-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;--f-display:'Fraunces',Georgia,serif}}
html[data-theme="dark"]{{color-scheme:dark;--bg:{bg_d};--surface:#1A1720;--ink:#F3F0F7;--muted:#C2BBCD;--line:#2B2633;--accent:{accent_d}}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--ink);font-family:var(--f-body);font-size:17px;line-height:1.8}}
.wrap{{width:min(830px,calc(100% - 44px));margin:auto}}
.top{{padding:16px 0;border-bottom:1px solid var(--line);background:var(--surface)}}
.top .wrap{{display:flex;align-items:center;justify-content:space-between;gap:14px}}
.brand{{display:flex;align-items:center;gap:11px;font-family:var(--f-display);font-weight:700;color:var(--ink);text-decoration:none;font-size:19px}}
.brand img{{height:36px;width:36px;border-radius:9px}}
.langsw{{display:flex;gap:6px}}
.langsw button{{border:1px solid var(--line);background:transparent;color:var(--muted);font:inherit;font-size:12.5px;font-weight:800;letter-spacing:.05em;padding:7px 14px;border-radius:999px;cursor:pointer}}
.langsw button.on{{background:var(--accent);border-color:var(--accent);color:#fff}}
main{{padding:56px 0 80px}}
.eyebrow{{color:var(--accent);font-size:12.5px;font-weight:800;letter-spacing:.14em}}
.en,.tr{{display:block}}
html[data-lang="en"] .tr,html[data-lang="tr"] .en{{display:none!important}}
h1{{font-family:var(--f-display);font-weight:700;font-size:clamp(32px,6vw,48px);line-height:1.14;margin:12px 0}}
h2{{font-family:var(--f-display);font-weight:600;font-size:22px;margin:34px 0 8px}}
p,li{{color:var(--muted)}}
ul{{padding-left:22px}}
a{{color:var(--accent);font-weight:700}}
.note{{padding:20px 24px;border:1px solid var(--line);border-radius:20px;background:var(--surface);margin:22px 0 6px}}
.updated{{font-size:15px}}
.small{{font-size:14px}}
footer{{padding:28px 0;border-top:1px solid var(--line);color:var(--muted);font-size:14.5px}}
@media(max-width:680px){{.brand{{min-height:44px}}}}
</style>
<script>(function(){{try{{var d=document.documentElement,t=localStorage.getItem('jg_theme'),l=localStorage.getItem('jg_lang');d.setAttribute('data-theme',t==='dark'?'dark':'light');d.setAttribute('data-lang',l==='tr'?'tr':'en');d.lang=l==='tr'?'tr':'en'}}catch(e){{}}}})()</script>
<script src="../../assets/local-links.js?v=20261012d"></script>
</head>
<body>
<header class="top"><div class="wrap">
  <span class="brand"><img src="icon.png" alt="" width="36" height="36">{name}</span>
  <div class="langsw"><button type="button" data-set="en">EN</button><button type="button" data-set="tr">TR</button></div>
</div></header>
<main class="wrap">
  <span class="eyebrow en">PRIVACY POLICY</span><span class="eyebrow tr">GİZLİLİK POLİTİKASI</span>
  <h1 class="en">{name} Privacy Policy</h1>
  <h1 class="tr">{name} Gizlilik Politikası</h1>
  <p class="updated en">Last updated: {upd_en}</p>
  <p class="updated tr">Son güncelleme: {upd_tr}</p>
  <div class="en">{en}</div>
  <div class="tr">{tr}</div>
</main>
<footer><div class="wrap">&copy; <span id="year"></span> JinjaGames · <a href="../../">jinjagames.com</a></div></footer>
<script>
(function(){{var d=document.documentElement;function paint(){{var l=d.getAttribute('data-lang');[].forEach.call(document.querySelectorAll('[data-set]'),function(b){{b.classList.toggle('on',b.getAttribute('data-set')===l);}});}}
[].forEach.call(document.querySelectorAll('[data-set]'),function(b){{b.addEventListener('click',function(){{var l=b.getAttribute('data-set');d.setAttribute('data-lang',l);d.lang=l;try{{localStorage.setItem('jg_lang',l);}}catch(e){{}}paint();}});}});
paint();document.getElementById('year').textContent=new Date().getFullYear();}})();
</script>
</body>
</html>
'''

if __name__ == '__main__':
    for a in APPS:
        out = os.path.join(ROOT, a['slug'], 'privacy')
        os.makedirs(out, exist_ok=True)
        icon = Image.open(os.path.join(PUZZLES, a['store'], 'app_icon.png')).convert('RGBA')
        icon.thumbnail((128, 128)); icon.save(os.path.join(out, 'icon.png'), optimize=True)
        html = PAGE.format(en=EN.format(**a), tr=TR.format(**a), upd_en=UPDATED[0], upd_tr=UPDATED[1], **a)
        open(os.path.join(out, 'index.html'), 'w', encoding='utf8', newline='\n').write(html)
        print('ok', a['slug'])
