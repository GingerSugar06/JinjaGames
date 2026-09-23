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

- `index.html` — ana sayfa (hero, üç proje satırı, stüdyo, SSS, iletişim).
- `assets/fonts.css` + `assets/fonts/` — yazı tipleri; her sayfa bunu bağlar.
- `cyberacademy/index.html` — Cyber Academy tanıtım sayfası.
- `locard/index.html` — Locard tanıtım sayfası (`locard-og.jpg` paylaşım görseli).
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

## Yazı kuralları

- **Sitede uzun tire (—), kısa tire (–) ve kelime içi tire kullanılmaz.** Cümle
  tireyle bölünecekse yeniden yazılır; "co-op", "low-poly", "e-posta" gibi
  yazımlardan da kaçınılır ("birlikte", "low poly", "mail adresi").
- Ayırıcı gerektiğinde nokta, virgül, iki nokta, noktalı virgül ya da orta
  nokta (·) kullanılır.
- Her cümlenin Türkçesi ve İngilizcesi `class="tr"` / `class="en"` çiftiyle
  yan yana durur; satır içi kullanımda `i` sınıfı eklenir.

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
- [ ] Locard: Steam mağaza sayfası açılınca `locard/index.html` ve ana sayfadaki satıra
      gerçek Steam bağlantısı eklenecek (uygulama kimliği Steamworks panelinden teyit edilmeli).
- [ ] Locard sayfası Windows + macOS ve birlikte oynama (co-op) vaadini duyuruyor;
      ikisi de kullanıcı kararıdır, geliştirme belgeleri henüz bunları kesinleştirmedi.
      Plan değişirse `locard/index.html` künyesi, "Açık konuşalım" listesi ve JSON-LD
      (`gamePlatform`, `playMode`) birlikte güncellenmeli.
- [ ] Cyber Academy sayfası çıkışta Windows, macOS ve Linux diyor (önceden "çıkışta
      Windows, macOS ve Linux sonra" yazıyordu). Bu da kullanıcı kararıdır; plan
      değişirse künye şeridi, "Üç platform" kartı, rakam şeridi ve JSON-LD
      (`gamePlatform`) birlikte güncellenmeli.
- [ ] DayPot tarif sayısı sayfada "250+" olarak yazılıyor; katalog büyüdükçe bu eşik
      güncellenebilir (ana sayfadaki rakam satırı ve DayPot sayfası).
- [ ] Locard: tanıtıma uygun görsel/fragman çıkınca hero'ya ve karta konacak. Mevcut
      geliştirme ekran görüntüleri Rev4 öncesi adlandırmayı taşıdığı için siteye konmadı.
- [ ] DayPot: Play yayını açılınca "Yakında Google Play'de" durumu mağaza rozetiyle
      değiştirilecek; mağaza ekran görüntüleri alınınca sayfaya galeri eklenebilir.
- [ ] DayPot: gizlilik politikasındaki tarih, yayın gününde güncellensin.
