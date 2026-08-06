# JinjaGames — jinjagames.com

Stüdyo/yayıncı sitesi. Tek dosyalık statik site (harici bağımlılık yok), GitHub Pages + özel domain ile yayınlanır.

**Tema:** turuncu (`#FF6A1F`) + beyaz, sıcak ve modern. Animasyonlar: kayan blob'lar, scroll-reveal,
sayaç animasyonu, marquee şerit, hover mikro-etkileşimleri.

## Dosyalar
- `index.html` — sitenin tamamı (CSS + JS gömülü).
- `CNAME` — özel domain (`jinjagames.com`); GitHub Pages bunu okur.

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
- [ ] Tanıtım videosu (`trailer.mp4`) eklenecek.
- [ ] Steam sayfası yayınlanınca "Wishlist on Steam" butonuna gerçek URL (`#wishlist` id'li `<a>`).
- [ ] İstenirse sosyal medya linkleri (footer).
