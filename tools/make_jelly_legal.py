"""6 yeni Jelly oyununun gizlilik ve veri silme sayfalarını üretir:
   <slug>/privacy/index.html  ->  https://jinjagames.com/<slug>/privacy/
   <slug>/delete/index.html   ->  https://jinjagames.com/<slug>/delete/
Oyunlar bu adreslere bakar (lib/services/legal.dart: https://jinjagames.com/<oyun>/privacy/ ve /delete/).

İçerik oyunların kodundan çıkarıldı (Puzzles/apps/jelly_*): isteğe bağlı hesap (Firebase Authentication + Cloud Firestore,
e-posta ya da Google ile giriş), isteğe bağlı Google Play Oyunlar, Google AdMob (AB/İngiltere'de UMP onay formu),
Firebase Analytics + Crashlytics + Remote Config, yaş kapısı ("13 yaşından küçüğüm" → kişiselleştirilmiş reklam, analiz ve
çökme raporu kapanır), Google Play ile uygulama içi satın alma, yerel bildirimler, uygulama içinden hesap silme.
Oyunlara yeni bir veri işleyen hizmet eklenirse bu metin güncellenip betik yeniden çalıştırılmalı.

Not: Trails ve Pipes sayfaları (make_jelly_privacy.py) 19 Ekim tarihli ve "hesap yok, analiz yok" diyor; bu iki oyunun
kodu da artık aynı Firebase paketlerini taşıyor, o yüzden yayından önce aynı metne taşınmalı."""
import os
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, 'jelly_pages'))
import make_jelly_privacy as M  # noqa: E402  (yalnız PAGE kalıbı)
import build_new as BN  # noqa: E402

ROOT = M.ROOT
PUZZLES = M.PUZZLES
UPDATED = ('24 October 2026', '24 Ekim 2026')
MAIL = 'jinjagamesofficial@gmail.com'

EN = '''
    <p class="note">{name} is a puzzle game made by JinjaGames, an independent studio in Ankara, Türkiye. The game is for players aged 13 and over. This page explains what data is processed when you play. In short: you can play without any account, your progress stays on your device unless you choose to back it up, and the outside services involved are Google (AdMob, Firebase, Google Play).</p>

    <h2>What we process</h2>
    <ul>
      <li><strong>Game progress</strong> (level stars, gems, items, settings, quest and achievement state) is stored on your device. If you create an optional account, it is also backed up to the cloud.</li>
      <li><strong>Optional account:</strong> your email address and, if you sign in with Google, your Google account ID. They are kept with Firebase Authentication and Cloud Firestore (Google LLC), together with your cloud progress. You do not need an account to play.</li>
      <li><strong>Google Play Games (optional):</strong> if you connect it, Google Play Games services handle your player profile for achievements and leaderboards, under Google's policies.</li>
      <li><strong>Ads:</strong> Google AdMob may use your advertising ID, approximate location (from your IP address), and device and app information to show and measure ads. In the EEA and the UK, Google's consent form (UMP) is shown and you can decline personalised ads.</li>
      <li><strong>Analytics and crash reports:</strong> Firebase Analytics and Crashlytics collect device model, operating system, app version, game events (for example finishing a level) and crash logs. Firebase Remote Config delivers game settings to your device.</li>
      <li><strong>Purchases:</strong> handled by Google Play. We never receive your card details, only the purchase record (product ID) needed to give you what you bought.</li>
      <li><strong>Notifications:</strong> reminders are local notifications scheduled on your device. No data is sent to a server for them, and you can turn them off in Settings or in your system settings.</li>
    </ul>

    <h2>Players under 13</h2>
    <p>The first time you open the game it asks your age. The game is not directed to children under 13. If you choose "I'm under 13", personalised ads, analytics and crash reporting are switched off, and we do not knowingly collect personal data from children under 13. If you believe a child has shared data with us, write to us and we will delete it.</p>

    <h2>Why we use it</h2>
    <p>To run the game, back up and restore your progress, verify purchases, show ads, find and fix bugs, and improve the game. We do not sell your data.</p>

    <h2>Retention and deletion</h2>
    <p>Account data is kept until you delete it. You can delete your account in the game (Settings &rsaquo; Account &amp; cloud save &rsaquo; Delete account &amp; cloud data) or follow the steps on the <a href="../delete/">data deletion page</a>. Your cloud progress is then permanently deleted. Data on your device is removed when you uninstall the game or clear its data.</p>

    <h2>Third parties</h2>
    <p>Google (AdMob, Firebase, Google Play and Google Play services) processes data under its own policies:</p>
    <ul>
      <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google Privacy Policy</a></li>
      <li><a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener">How Google uses information from apps that use its services</a></li>
    </ul>
    <p>You can reset or delete your advertising ID, or opt out of personalised ads, in your device settings (on most Android devices: Settings &rsaquo; Google &rsaquo; Ads).</p>

    <h2>Permissions</h2>
    <p>The game uses an internet connection for ads, purchases, account backup and settings. It asks for permission to show notifications, and to restore your reminders after the phone restarts. It does not access your contacts, photos, camera, microphone or precise location.</p>

    <h2>Your rights</h2>
    <p>Depending on where you live (for example under the GDPR or Türkiye's KVKK), you may have the right to access, correct, delete and object to the processing of your data. Write to us and we will help.</p>

    <h2>Changes</h2>
    <p>If the game starts handling data differently, this page will be updated and the date at the top will change.</p>

    <h2>Contact</h2>
    <p>JinjaGames, Ankara, Türkiye · <a href="mailto:{mail}">{mail}</a></p>
    <p class="small">App: {name} · Package: {pkg}</p>
'''

TR = '''
    <p class="note">{name}, Ankara merkezli bağımsız stüdyo JinjaGames tarafından geliştirilen bir bulmaca oyunudur. Oyun 13 yaş ve üzeri oyuncular içindir. Bu sayfa, oyunu oynarken hangi verilerin işlendiğini açıklar. Kısaca: hesapsız oynayabilirsin, ilerlemen yedeklemeyi seçmediğin sürece cihazında kalır ve işin içindeki dış hizmetler Google'ın hizmetleridir (AdMob, Firebase, Google Play).</p>

    <h2>Neyi işleriz</h2>
    <ul>
      <li><strong>Oyun ilerlemesi</strong> (bölüm yıldızları, elmaslar, öğeler, ayarlar, görev ve başarım durumu) cihazında saklanır. İsteğe bağlı bir hesap açarsan buluta da yedeklenir.</li>
      <li><strong>İsteğe bağlı hesap:</strong> e-posta adresin ve Google ile girersen Google hesap kimliğin. Bulut ilerlemenle birlikte Firebase Authentication ve Cloud Firestore'da (Google LLC) tutulur. Oynamak için hesap gerekmez.</li>
      <li><strong>Google Play Oyunlar (isteğe bağlı):</strong> bağlarsan başarımlar ve skor tabloları için oyuncu profilini Google Play Oyunlar hizmetleri, Google'ın politikalarına göre işler.</li>
      <li><strong>Reklamlar:</strong> Google AdMob reklamları göstermek ve ölçmek için reklam kimliğini, (IP adresinden çıkarılan) yaklaşık konumu, cihaz ve uygulama bilgilerini kullanabilir. AEA ve Birleşik Krallık'ta Google'ın onay formu (UMP) gösterilir ve kişiselleştirilmiş reklamları reddedebilirsin.</li>
      <li><strong>Analiz ve çökme raporları:</strong> Firebase Analytics ve Crashlytics cihaz modeli, işletim sistemi, uygulama sürümü, oyun olayları (örneğin bölüm bitirme) ve çökme kayıtlarını toplar. Firebase Remote Config oyun ayarlarını cihazına iletir.</li>
      <li><strong>Satın almalar:</strong> Google Play tarafından işlenir. Kart bilgilerin bize hiç ulaşmaz; yalnızca aldığını vermek için gereken satın alma kaydını (ürün kimliği) alırız.</li>
      <li><strong>Bildirimler:</strong> hatırlatmalar cihazında zamanlanan yerel bildirimlerdir. Bunlar için bir sunucuya veri gönderilmez; Ayarlar'dan ya da sistem ayarlarından kapatabilirsin.</li>
    </ul>

    <h2>13 yaşından küçük oyuncular</h2>
    <p>Oyunu ilk açtığında yaşını sorar. Oyun 13 yaşından küçük çocuklara yönelik değildir. "13 yaşından küçüğüm" dersen kişiselleştirilmiş reklamlar, analiz ve çökme raporu kapatılır; 13 yaşından küçüklerden bilerek kişisel veri toplamayız. Bir çocuğun bize veri verdiğini düşünüyorsan bize yaz, sileriz.</p>

    <h2>Ne için kullanırız</h2>
    <p>Oyunu çalıştırmak, ilerlemeni yedeklemek ve geri yüklemek, satın almaları doğrulamak, reklam göstermek, hataları bulup düzeltmek ve oyunu geliştirmek için. Verilerini satmayız.</p>

    <h2>Saklama ve silme</h2>
    <p>Hesap verilerin, sen silene kadar saklanır. Hesabını oyun içinden (Ayarlar &rsaquo; Hesap ve bulut kaydı &rsaquo; Hesabı ve bulut verisini sil) ya da <a href="../delete/">veri silme sayfasındaki</a> adımlarla silebilirsin. Buluttaki ilerleme kaydın kalıcı olarak silinir. Cihazındaki veriler oyunu kaldırdığında ya da verilerini temizlediğinde silinir.</p>

    <h2>Üçüncü taraflar</h2>
    <p>Google (AdMob, Firebase, Google Play ve Google Play hizmetleri) verileri kendi politikalarına göre işler:</p>
    <ul>
      <li><a href="https://policies.google.com/privacy?hl=tr" target="_blank" rel="noopener">Google Gizlilik Politikası</a></li>
      <li><a href="https://policies.google.com/technologies/partner-sites?hl=tr" target="_blank" rel="noopener">Google, hizmetlerini kullanan uygulamalardan gelen bilgileri nasıl kullanır</a></li>
    </ul>
    <p>Reklam kimliğini sıfırlayabilir ya da silebilir, kişiselleştirilmiş reklamları cihaz ayarlarından kapatabilirsin (çoğu Android cihazda: Ayarlar &rsaquo; Google &rsaquo; Reklamlar).</p>

    <h2>İzinler</h2>
    <p>Oyun internet bağlantısını reklam, satın alma, hesap yedeği ve ayarlar için kullanır. Bildirim göstermek ve telefon yeniden başlayınca hatırlatmalarını geri kurmak için izin ister. Rehberine, fotoğraflarına, kamerana, mikrofonuna ya da hassas konumuna erişmez.</p>

    <h2>Haklarınız</h2>
    <p>Yaşadığın yere göre (örneğin GDPR ya da KVKK kapsamında) verilerine erişme, düzeltme, silme ve işlenmesine itiraz etme hakkın olabilir. Bize yaz, yardımcı olalım.</p>

    <h2>Değişiklikler</h2>
    <p>Oyun verileri farklı bir şekilde işlemeye başlarsa bu sayfa güncellenir ve üstteki tarih değişir.</p>

    <h2>İletişim</h2>
    <p>JinjaGames, Ankara, Türkiye · <a href="mailto:{mail}">{mail}</a></p>
    <p class="small">Uygulama: {name} · Paket: {pkg}</p>
'''

DEL_EN = '''
    <p class="note">You can delete your {name} account and the data we hold about it at any time. If you never created an account, we hold no data about you on our servers.</p>

    <h2>In the game</h2>
    <p>Open <strong>Settings &rsaquo; Account &amp; cloud save &rsaquo; Delete account &amp; cloud data</strong>. Your account and your cloud progress are permanently deleted.</p>

    <h2>By email</h2>
    <p>From the address you used for your account, send a message titled <strong>"Data deletion request - {name}"</strong> to <a href="mailto:{mail}?subject=Data%20deletion%20request%20-%20{name_q}">{mail}</a>. We delete the data within 30 days and confirm by email.</p>

    <h2>What is deleted</h2>
    <ul>
      <li>your account email and sign in ID</li>
      <li>your cloud progress: levels, gems, items, quest and achievement state</li>
    </ul>
    <p>Purchase records that must be kept by law stay with Google Play; they are not ours. Data on your device is removed when you uninstall the game. Ad and analytics data held by Google can be managed in your Google account and device settings, see the <a href="../privacy/">privacy policy</a>.</p>

    <h2>Contact</h2>
    <p>JinjaGames, Ankara, Türkiye · <a href="mailto:{mail}">{mail}</a></p>
    <p class="small">App: {name} · Package: {pkg}</p>
'''

DEL_TR = '''
    <p class="note">{name} hesabını ve hakkında tuttuğumuz verileri istediğin an silebilirsin. Hiç hesap açmadıysan sunucularımızda sana ait veri yoktur.</p>

    <h2>Oyun içinden</h2>
    <p><strong>Ayarlar &rsaquo; Hesap ve bulut kaydı &rsaquo; Hesabı ve bulut verisini sil</strong> yolunu aç. Hesabın ve buluttaki ilerleme kaydın kalıcı olarak silinir.</p>

    <h2>E-posta ile</h2>
    <p>Hesabında kullandığın adresten <a href="mailto:{mail}?subject=Veri%20silme%20talebi%20-%20{name_q}">{mail}</a> adresine <strong>"Veri silme talebi - {name}"</strong> konulu bir mesaj gönder. Verileri en geç 30 gün içinde sileriz ve e-postayla haber veririz.</p>

    <h2>Neler silinir</h2>
    <ul>
      <li>hesap e-postan ve giriş kimliğin</li>
      <li>bulut ilerlemen: bölümler, elmaslar, öğeler, görev ve başarım durumu</li>
    </ul>
    <p>Yasal zorunluluk gereği saklanması gereken satın alma kayıtları Google Play'de kalır; bunlar bize ait değildir. Cihazındaki veriler oyunu kaldırdığında silinir. Google'ın tuttuğu reklam ve analiz verilerini Google hesabından ve cihaz ayarlarından yönetebilirsin, <a href="../privacy/">gizlilik politikasına</a> bak.</p>

    <h2>İletişim</h2>
    <p>JinjaGames, Ankara, Türkiye · <a href="mailto:{mail}">{mail}</a></p>
    <p class="small">Uygulama: {name} · Paket: {pkg}</p>
'''

PAGE = M.PAGE


def delete_page(tpl):
    t = tpl.replace('{name} Privacy Policy | JinjaGames', '{name} Delete Your Data | JinjaGames')
    t = t.replace('{name} privacy policy. No accounts and no personal data collected by JinjaGames; ads by Google AdMob and purchases by Google Play.',
                  'How to delete your {name} account and cloud data.')
    t = t.replace('https://jinjagames.com/{slug}/privacy/', 'https://jinjagames.com/{slug}/delete/')
    t = t.replace('<span class="eyebrow en">PRIVACY POLICY</span><span class="eyebrow tr">GİZLİLİK POLİTİKASI</span>', '<span class="eyebrow en">DATA DELETION</span><span class="eyebrow tr">VERİ SİLME</span>')
    t = t.replace('<h1 class="en">{name} Privacy Policy</h1>', '<h1 class="en">Delete your {name} data</h1>')
    t = t.replace('<h1 class="tr">{name} Gizlilik Politikası</h1>', '<h1 class="tr">{name} verilerini sil</h1>')
    assert 'DATA DELETION' in t and 'Delete your' in t and '/delete/' in t
    return t


def main():
    page_del = delete_page(PAGE)
    for slug, g in BN.GAMES.items():
        a = dict(slug=slug, name=g['name'], pkg=g['pkg'], store=g['app'], accent=g['light']['accent'], accent_d=g['dark']['accent'], bg=g['light']['bg'],
                 bg_d=g['dark']['bg'], mail=MAIL, name_q=g['name'].replace(' ', '%20'))
        for kind, en, tr, page in (('privacy', EN, TR, PAGE), ('delete', DEL_EN, DEL_TR, page_del)):
            out = os.path.join(ROOT, slug, kind)
            os.makedirs(out, exist_ok=True)
            icon = Image.open(os.path.join(PUZZLES, a['store'], 'app_icon.png')).convert('RGBA')
            icon.thumbnail((128, 128))
            icon.save(os.path.join(out, 'icon.png'), optimize=True)
            html = page.format(en=en.format(**a), tr=tr.format(**a), upd_en=UPDATED[0], upd_tr=UPDATED[1], **a)
            html = html.replace('href="../../"', 'href="../../"')
            open(os.path.join(out, 'index.html'), 'w', encoding='utf8', newline='\n').write(html)
            print('ok', slug, kind)


if __name__ == '__main__':
    main()
