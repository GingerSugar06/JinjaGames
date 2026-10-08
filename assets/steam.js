/* ============================================================
   LOCARD STEAM ANAHTARI
   Steam mağaza sayfası açıldığında değiştirilecek TEK yer burası.

   1) live:true yaz  (ya da)
   2) liveAt alanına açılış anını yaz, örn. '2026-10-09T17:00:00Z';
      o andan itibaren siteler kendiliğinden "istek listesine ekle" moduna geçer.

   Bu dosya <head> içinde, senkron yüklenir; böylece sayfa ilk çizilirken
   doğru mod hazırdır (yanıp sönme olmaz). Üçüncü taraf isteği yapmaz:
   Steam'e yalnızca kullanıcı bağlantıya tıkladığında gidilir.
   ============================================================ */
(function () {
  var cfg = window.LOCARD_STEAM = {
    appId: 5296440,          // Steamworks uygulama kimliği
    slug: 'Locard',          // mağaza adresindeki ad
    live: false,             // mağaza sayfası açık mı?
    liveAt: null             // ya da açılış zamanı (ISO 8601, UTC)
  };
  var now = Date.now();
  var isLive = cfg.live === true || (cfg.liveAt && now >= Date.parse(cfg.liveAt));
  cfg.url = 'https://store.steampowered.com/app/' + cfg.appId + '/' + cfg.slug + '/';
  cfg.isLive = !!isLive;
  var d = document.documentElement;
  d.setAttribute('data-steam', isLive ? 'live' : 'soon');
  d.classList.add('js');
  document.addEventListener('DOMContentLoaded', function () {
    var links = document.querySelectorAll('[data-steam-link]');
    for (var i = 0; i < links.length; i++) {
      links[i].setAttribute('href', cfg.url);
      links[i].setAttribute('target', '_blank');
      links[i].setAttribute('rel', 'noopener');
    }
  });
})();
