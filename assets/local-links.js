/* Siteyi sunucusuz, index.html'i çift tıklayarak açınca (file://) klasör bağlantıları
   ("cyberacademy/", "../", "../#studio") tarayıcıda klasör listesi açıyor. Burada bu
   bağlantıların sonuna index.html eklenir. Yayındaki sitede (https) hiçbir şey yapmaz. */
(function () {
  if (location.protocol !== 'file:') return;
  function fix(a) {
    var raw = a.getAttribute('href');
    if (!raw || raw.charAt(0) === '#' || /^[a-z]+:/i.test(raw)) return null;
    var u;
    try { u = new URL(a.href); } catch (e) { return null; }
    if (u.protocol !== 'file:' || u.pathname.slice(-1) !== '/') return null;
    u.pathname += 'index.html';
    return u.href;
  }
  function rewrite() {
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) { var h = fix(links[i]); if (h) links[i].href = h; }
  }
  /* sonradan çizilen bağlantılar için de: tıklanınca düzelt */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var h = fix(a);
    if (h) { e.preventDefault(); if (a.target === '_blank') window.open(h, '_blank'); else location.href = h; }
  }, true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', rewrite); else rewrite();
})();
