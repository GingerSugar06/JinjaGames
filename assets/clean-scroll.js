(function () {
  'use strict';

  var pendingKey = 'jg_scroll_target';
  var initialHash = location.hash;

  function cleanPath(pathname) {
    return pathname.replace(/index\.html$/, '');
  }

  function cleanCurrentAddress() {
    if (!location.hash || !history.replaceState) return;
    history.replaceState(history.state, '', location.pathname + location.search);
  }

  function scrollToTarget(id) {
    if (!id) return false;
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return true;
    }
    var target = document.getElementById(id);
    if (!target) return false;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  }

  function rememberTarget(pathname, id) {
    try {
      sessionStorage.setItem(pendingKey, JSON.stringify({
        path: cleanPath(pathname),
        id: id
      }));
    } catch (error) {}
  }

  function takeRememberedTarget() {
    try {
      var value = sessionStorage.getItem(pendingKey);
      if (!value) return '';
      var pending = JSON.parse(value);
      if (pending.path !== cleanPath(location.pathname)) return '';
      sessionStorage.removeItem(pendingKey);
      return pending.id || '';
    } catch (error) {
      return '';
    }
  }

  if (initialHash) cleanCurrentAddress();

  document.addEventListener('click', function (event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var link = event.target.closest('a[href]');
    if (!link || link.target || link.hasAttribute('download')) return;

    var url;
    try { url = new URL(link.href, location.href); } catch (error) { return; }
    if (!url.hash || url.origin !== location.origin) return;

    var id = decodeURIComponent(url.hash.slice(1));
    event.preventDefault();

    if (cleanPath(url.pathname) === cleanPath(location.pathname)) {
      scrollToTarget(id);
      cleanCurrentAddress();
      return;
    }

    rememberTarget(url.pathname, id);
    location.assign(url.href.slice(0, url.href.indexOf('#')));
  });

  function restoreScrollTarget() {
    var id = takeRememberedTarget() || decodeURIComponent(initialHash.slice(1));
    if (!id) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { scrollToTarget(id); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restoreScrollTarget, { once: true });
  } else {
    restoreScrollTarget();
  }
})();
