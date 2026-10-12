# JinjaGames — jinjagames.com

Stüdyo/yayıncı sitesi. Tek dosyalık statik site (harici bağımlılık yok), GitHub Pages + özel domain ile yayınlanır.

## Tasarım sistemi

Dört sayfa aynı iskeleti paylaşır — aynı nav, aynı bölüm ritmi, aynı
`jg_lang` / `jg_theme` anahtarları, aynı açık/koyu mantığı — ama her biri
kendi dünyasının yüzeyini kullanır. Ortak olan yapı, farklı olan ten:

| Sayfa | His | Başlık | Gövde | Etiket | Vurgu |
|---|---|---|---|---|---|
| Ana sayfa | Editöryel stüdyo | Space Grotesk | Inter | JetBrains Mono | Kırmızı `#C42B2B` |
| Cyber Academy | Terminal, gece | JetBrains Mono | Inter | JetBrains Mono | Camgöbeği |
| Locard | Dosya / gizem | Playfair Display | Inter | Courier Prime | Damga kırmızısı |
| DayPot | Sakin mutfak | Fraunces | Nunito | Nunito | Orman yeşili |

Locard'ın açık teması sararmış dosya kâğıdı, koyu teması gece bürosudur;
ikisi de aynı ölçüleri kullanır. DayPot yuvarlak köşe ve geniş satır aralığı
kullanır, keskin çizgi yoktur. Ana sayfada üç projenin başlığı kendi
sayfasının yazı tipiyle yazılır, böylece fark okumadan önce hissedilir.

**Renk kuralı:** hiçbir bileşen sabit renk yazmaz, hepsi `:root` belirteçlerinden
gelir. Metin/zemin çiftleri WCAG AA eşiğine (küçük metin 4.5, büyük metin 3.0)
göre seçilmiştir; yeni bir renk eklerken bu kontrol tekrarlanmalı.

## Yazı tipleri

`assets/fonts/` altında woff2 olarak depoda durur, `assets/fonts.css` ile
tanımlanır. **Google Fonts ya da başka bir CDN kullanılmaz:** sitede üçüncü
taraf isteği yoktur ve gizlilik metni bunu söyler. `unicode-range` sayesinde
tarayıcı yalnız gereken dilimi indirir; Türkçe karakterler (ğ ş İ) `latin-ext`
dilimindedir, o yüzden yeni bir aile eklenirken latin-ext sürümü de indirilmeli.

Aileler: Inter, Space Grotesk, JetBrains Mono, Playfair Display, Courier Prime,
Fraunces, Nunito. Hepsi açık lisanslıdır (SIL OFL).

## Dosyalar
Her sayfa kendi CSS ve JS'ini içinde taşır; harici bağımlılık yoktur.

- `index.html` — ana sayfa (hero, üç projelik derli toplu kart vitrini, stüdyo, SSS, iletişim).
  Ayrıntı ana sayfada değil `games/` sayfasında; ana sayfa yalnız kapı.
- `games/index.html` — oyunlar merkezi (jinjagames.com/games/): filtrelenebilir oyun satırları,
  karşılaştırma tablosu ve BaneBender wikisine açılan kapı. Oyun sayfalarının adresleri
  (`/cyberacademy/`, `/locard/`, `/daypot/`) bilerek TAŞINMADI: Steam, Play Console ve dış
  bağlantılar bu adreslere bakıyor.
- `banebender/` — kardeşimin (BaneBender) Minecraft mod wikisi. Sitenin geri kalanıyla
  bilerek ortak tasarım dili yok;
  ana sayfadaki menüden (BaneBender), SSS'nin üstündeki kapıdan ve `games/` sayfasından girilir. Ayrıntı aşağıda, "BaneBender wikisi".
- `assets/fonts.css` + `assets/fonts/` — yazı tipleri; her sayfa bunu bağlar.
- `cyberacademy/index.html` — Cyber Academy tanıtım sayfası. Fragman `cyberacademy/media/darknet-trailer.mp4`
  (kaynak: `steam_cyberacademy/steam_darknet_trailer/DarkNet_Trailer_EN_final.mp4`, web için yeniden
  sıkıştırıldı), kısa sessiz döngü `darknet-loop.mp4` ana sayfa ve oyunlar kartında; ekran
  görüntüleri `cyberacademy/img/` (WebP).
- `locard/index.html` — Locard tanıtım sayfası (`locard-og.jpg` paylaşım görseli,
  `locard/img/` oyun içi kareler ve kapak sahnesi, WebP). Sayfada etkileşimli delil
  panosu, fragman (`locard/media/locard-trailer.mp4`, kaynak `steam_locard/06_Fragman/Locard_Gameplay_Trailer_16x9.mp4`;
  spoiler içermiyor), galeri, sekmeli sistem listesi ve birlikte oynama bölümü var.
- `assets/steam.js` — **Locard Steam anahtarı.** Mağaza sayfası açılınca değiştirilecek tek
  yer burası (aşağıya bak). Hem `locard/` hem ana sayfa bunu okur.
- `daypot/index.html` — DayPot tanıtım sayfası; görseller `daypot/img/`.
- `daypot/gizlilik.html` — DayPot gizlilik politikası (TR + EN). Uygulamadaki
  `privacyPolicyUrl` bu adrese bakmalı: `https://jinjagames.com/daypot/gizlilik.html`.
- `privacy.html` — site gizlilik politikası.
- `sitemap.xml`, `robots.txt` — yeni sayfa eklenince sitemap da güncellenmeli.
- `CNAME` — özel domain (`jinjagames.com`); GitHub Pages bunu okur.

## Bilinen tuzaklar

Bu sitede iki kez ısırdılar, üçüncüsü olmasın diye buraya yazıyoruz:

- **`overflow-x:hidden` hem `html` hem `body` üzerinde olursa ikisi de ayrı bir
  kaydırma kabı olur** ve içerik gövdeden taşarsa sayfada iki dikey kaydırma
  çubuğu belirir. Doğrusu `overflow-x:clip` (kap oluşturmaz, `overflow-y`
  görünür kalır); `hidden` yalnız eski tarayıcılar için yedek olarak önce yazılır.
- **Etiket adıyla seçici yazarken dikkat:** `nav { position:fixed }` kuralı üst
  barı değil, sayfadaki her `<nav>` etiketini yakalar. Breadcrumb da bir `<nav>`
  olduğu için ekranın tepesine yapışıp üst barın altında kaybolmuştu. Üst bar
  her sayfada `nav#nav` ile seçilir.
- **`<img>` üzerinde `width`/`height` özniteliği varsa CSS'te `height:auto`
  şart.** Yoksa CSS genişliği daraltırken yükseklik öznitelikte kalır ve görsel
  ezilir. Temel `img` kuralı bunu taşır; bir görsele özel yükseklik verilecekse
  daha özgül bir seçiciyle verilir.
- **Telefonda dokunma hedefi** en az 44 piksel olmalı. Küçük bağlantılarda
  (breadcrumb, alt bilgi) düzeni bozmamak için görünmez bir `::after` katmanı
  kullanılıyor: `content:"";position:absolute;left:0;right:0;top:50%;height:44px`.
- **Dar ekranda marka yazısı** geri bağlantısının üstüne binebiliyor. Alt
  sayfalarda `.brand span` 680 pikselin altında gizleniyor (Cyber Academy'nin
  marka metni span içinde olmadığı için orada geri bağlantısı gizleniyor).
- **Etiket tipografisi** telefonda 12 pikselin altına inmemeli; masaüstünde
  10-11 piksel duran mono etiketler dar ekranda büyütülüyor.
- **Süs lekeleri** (`section.blk::before` gibi) bölümden taşacak şekilde
  konumlanıyor. Son bölümdekinin aşağı sarkması sayfanın altına boş alan ekler;
  son bölümde leke yukarı alınır.

- **`<nav>` etiketini üst bar dışında kullanma.** Ana sayfadaki `nav{position:fixed}` kuralı
  her `<nav>`'ı yakalar; telefondaki alt gezinme çubuğu bu yüzden `div role="navigation"`.

## Canlı katmanlar

- Ana sayfa hero'su: `assets/home3d.js`, üç dünyanın biçimleri (küp, parmak izi, tencere)
  arasında dönüşen parçacık bulutu; hero listesindeki adların üzerine gelince biçim değişir.
  Renkleri temadan (`--brand`, `--w-cyber` …) okur.
- Ana sayfa "Yaptıklarımız": yan yana üç panel; üzerine gelinen açılır. Telefonda alt alta.
- Cyber Academy: hero'da canlı ağ animasyonu ve yazı yazan terminal, "Karanlık Ağ'da bir
  operasyon" adımları (kareler `cyberacademy/img/run/`, Karanlık Ağ fragmanından), imleci
  izleyen kart ışığı, sayan rakamlar. Hepsi `prefers-reduced-motion` açıkken durur.

## Siteyi bilgisayarda açmak

`index.html` çift tıklanarak (sunucusuz, `file://`) açılabilir. Bu durumda klasör
bağlantıları (`cyberacademy/`, `../`) tarayıcıda klasör listesi açardı; her sayfanın
`<head>`'indeki `assets/local-links.js` yalnız `file://` altında bu bağlantıların sonuna
`index.html` ekler, yayındaki sitede hiçbir şey yapmaz. Yeni sayfa eklenince bu betik de bağlanmalı.

## Telefonda gezinme

Sağ üstteki üç çizgili menü kaldırıldı. 1060 pikselin altında ana sayfada ve `games/`
sayfasında ekranın altında yüzen bir çubuk (`.dock`) var: Oyunlar · Stüdyo · SSS · İletişim.
Bulunulan bölüm çubukta yanar. Dil ve tema düğmeleri sağ üstte kalır. Çubuk içeriğin
üstüne binmesin diye `body` altına çubuk kadar boşluk alır.

## BaneBender wikisi

- `banebender/index.html` iskelet, `app.css` görünüm, `app.js` arayüz ve mod sayfaları
  (adres çubuğunda # görünmez; mod sayfaları geçmişe adres değiştirmeden yazılır, geri tuşu çalışır), `scene.js` hero'daki 3B voksel ada.
- `assets/vendor/three.min.js` — three.js r149 (MIT; hem ana sayfa hem wiki kullanır), klasik betik olarak yerel kopya
  (ES modülü değil; modüller dosyadan açınca yüklenmiyor). Dönen eşya simgeleri
  `banebender/data/hero-sprites.js` içinde veri URI'si. Sitede
  üçüncü taraf isteği olmaması kuralı burada da geçerli.
- `assets/fonts/pixelify-sans-var.woff2` — Pixelify Sans (SIL OFL), Türkçe karakterleri içerir.
- `banebender/data/mods.js` — **elle yazılmış içerik** (İngilizce + Türkçe). Kaynak yalnızca
  modların CurseForge açıklamaları ve modların kendi dosyaları; açıklamada olmayan bir
  özellik yazılmaz. İndirme sayıları 12 Ekim 2026 tarihli; güncellenirken tarih de değişmeli.
- `banebender/data/generated.js` + `banebender/img/<slug>/` — **otomatik üretilir**:
  `tools/build_banebender.py`, mod jar dosyalarından (dil dosyaları, dokular) eşya adlarını,
  sprite atlaslarını (`items.png`), yaratık/yapı/büyü listelerini ve logodan vurgu rengini çıkarır.
  CurseForge logo ve galeri görselleri `$CF_CACHE_PARENT/dl/<slug>/` altında beklenir.
- Yeni mod eklenince: jar'ı CurseForge örneğine kur, `build_banebender.py` içindeki `JARS`
  listesine ekle, betiği çalıştır, sonra `mods.js`'e o modun metnini yaz.
- Bilinen tuzak: Frontier Structures'ın `tr_tr.json` dosyasında bazı adlar çift kodlanmış
  (Ã¼ gibi). Betik bunu düzeltiyor (`fix()`); asıl düzeltme modun kendisinde yapılmalı.
- YouTube videosu (Chest Hauler) tıklanana kadar yüklenmez, tıklanınca youtube-nocookie.com
  açılır; gizlilik sayfası bunu söylüyor.

## Yazı kuralları

- **Sitede uzun tire (—), kısa tire (–) ve kelime içi tire kullanılmaz.** Cümle
  tireyle bölünecekse yeniden yazılır; "co-op", "low-poly", "e-posta" gibi
  yazımlardan da kaçınılır ("birlikte", "low poly", "mail adresi").
- Ayırıcı gerektiğinde nokta, virgül, iki nokta, noktalı virgül ya da orta
  nokta (·) kullanılır.
- Her cümlenin Türkçesi ve İngilizcesi `class="tr"` / `class="en"` çiftiyle
  yan yana durur; satır içi kullanımda `i` sınıfı eklenir.

## Locard: Steam sayfası açılınca

**Mağaza sayfası yayında (Ekim 2026):** `assets/steam.js` içinde `live:true`. `live:false`
yapılırsa sitede "Steam sayfası yakında" görünür ve istek listesi düğmeleri gizlenir.
Başka bir oyun için aynı düzen gerekirse adımlar şunlardı:

1. `live:true` yap (ya da `liveAt:'2026-10-09T17:00:00Z'` gibi bir an yaz; o andan sonra
   site kendiliğinden açılır, elle müdahale gerekmez), commit + push.
2. Bağlantı `https://store.steampowered.com/app/5296440/Locard/` adresine gider. Uygulama
   kimliğini (5296440) Steamworks panelinden bir kez daha teyit et.

Canlı modda: Locard sayfasında hero düğmesi, üst bar düğmesi, telefondaki alt çubuk ve
kapanış bölümü "Steam'de istek listesine ekle" olur; ana sayfadaki kartta ek bağlantı belirir.

Hero sahnesindeki yazı görselden silinip sayfada canlı yazı olarak basılır (oyunun kendi
Spartan SemiBold yazı tipi, yalnız L O C A R D alt kümesi: `assets/fonts/spartan-semibold-locard.woff`).
Kaynak sahne: `steam_locard/90_Uretim_Kaynaklari/main.png`.

## Yeni proje sayfası eklerken
1. Sayfayı `<proje>/index.html` olarak aç; `locard/index.html` iyi bir iskelet.
   Site içi bağlantılarda dosya adı yerine klasör adresini (`/locard/`, `/daypot/`, `/cyberacademy/`) kullan; ana sayfa için `/` kullan.
2. Ana sayfada `.world` satırı ekle (kendi `--accent` deri sınıfıyla) ve alt bilgideki "İşler" sütununa bağlantı koy.
3. `sitemap.xml` ve `index.html` içindeki JSON-LD `@graph` listesini güncelle.

## Tanıtım videosu ekleme
`index.html` içinde `<div class="video" id="video">…</div>` bloğunu bul ve şununla değiştir:

```html
<video src="trailer.mp4" controls poster="poster.jpg" style="width:100%;aspect-ratio:16/9;display:block"></video>
```

`trailer.mp4` (ve istersen `poster.jpg`) dosyasını bu klasöre koy. Alternatif: YouTube'a yükleyip
`<iframe>` gömebilirsin.

## Yayınlama (GitHub Pages)
1. GitHub'da **public** repo aç: `JinjaGames` (ya da `jinjagames.com`).
2. Bu klasördeki dosyaları yükle (web arayüzü: *Add file → Upload files*, ya da git).
3. Repo → **Settings → Pages** → Source: **Deploy from a branch** → Branch: `main` / `(root)` → Save.
4. Aynı sayfada **Custom domain**: `jinjagames.com` → Save. Doğrulanınca *Enforce HTTPS* aktifleşir.

### Git ile
```bash
cd C:/Users/user/Desktop/JinjaGames
git init
git add .
git commit -m "JinjaGames site"
git branch -M main
git remote add origin https://github.com/<kullanıcı-adın>/JinjaGames.git
git push -u origin main
```

## DNS (domain sağlayıcında)
Apex (kök) domain için **A** kayıtları, `www` için **CNAME**:

**A kayıtları** — host `@`:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```
**CNAME** — host `www` → değer: `<kullanıcı-adın>.github.io`

DNS yayılması 10 dk – 24 saat sürebilir.

## Yapılacaklar
- [x] Locard: Steam mağaza sayfası açıldı, `assets/steam.js` içinde `live:true`.
- [ ] Locard: Steam sayfası şu an yalnız Windows ve yalnız Türkçe listeliyor; site de böyle
      diyor ("macOS planlanıyor", "İngilizce planlanıyor"). Steam'e Mac derlemesi ya da İngilizce
      eklenince künye şeridi, "Henüz değil" listesi, ana sayfa kartı, `games/` sayfası ve
      JSON-LD (`gamePlatform`, `inLanguage`) birlikte güncellenmeli.
- [ ] Locard sayfasındaki rakamlar (10 mekân, 18 karakter, 64 kayıt, 7 son) ve "Erken Erişim ·
      Q1 2027" ibaresi Steam mağaza metniyle birebir aynı olmalı. Çıkış tarihi kesinleşince ya da
      mağaza "yakında" yerine tarih gösterirse `locard/index.html` künyesi güncellenmeli.
- [ ] Cyber Academy 11 Eylül 2026'da Steam Erken Erişime çıktı; site "istek listesi" yerine
      "Steam'de al" diyor. Modül sayısı sitede "25 modül planlanıyor, ilkleri oynanabilir"
      olarak yazılı; yeni modüller duyurulunca kesin sayı yazılabilir. Steam'deki Erken Erişim
      SSS'si hâlâ "25+ modules … English + Turkish" diyor, mağazadaki dil listesi 23 dil; oyun
      ise 25 arayüz dili taşıyor. Steamworks'teki bu metinler güncellenmeli (site doğru olanı söylüyor).
- [ ] DayPot tarif sayısı sayfada "250+" olarak yazılıyor; katalog büyüdükçe bu eşik
      güncellenebilir (ana sayfadaki rakam satırı ve DayPot sayfası).
- [x] Locard: oynanış fragmanı eklendi, galeri 7 kare. `Locard_Bolum01_Senaryo.mp4` katili
      açıkladığı için siteye konmaz.
- [ ] DayPot: Play yayını açılınca "Yakında Google Play'de" durumu mağaza rozetiyle
      değiştirilecek; mağaza ekran görüntüleri alınınca sayfaya galeri eklenebilir.
- [ ] DayPot: gizlilik politikasındaki tarih, yayın gününde güncellensin.
