/* Jelly sayfaları ortak betik: dil/tema/gezinti, görünme animasyonu, dünya gezgini,
   mekanik laboratuvarı ve ışık kutusu. Sayfaya özel oyun demoları sayfanın kendi betiğinde. */
(function(){
  'use strict';
  var d=document, root=d.documentElement;
  var $=function(s,c){return (c||d).querySelector(s);};
  var $$=function(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s));};
  var store=function(k,v){try{localStorage.setItem(k,v);}catch(e){}};
  window.JG={$:$,$$:$$,lang:function(){return root.getAttribute('data-lang')||'en';}};

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
      d.dispatchEvent(new CustomEvent('jg:lang',{detail:l}));
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

  /* ---------- Mekanik laboratuvarı ---------- */
  var lab=$('#lab');
  if(lab){
    var tabs=$$('.lab-tab',lab), panes=$$('.lab-pane',lab);
    function pick(i){ tabs.forEach(function(t,k){ t.classList.toggle('on',k===i); t.setAttribute('aria-selected',k===i); }); panes.forEach(function(p,k){ p.classList.toggle('on',k===i); }); }
    tabs.forEach(function(t,i){ t.addEventListener('click',function(){ pick(i); }); });
    $$('.lab-art img',lab).forEach(function(im){ im.addEventListener('click',function(){ im.classList.remove('pop'); void im.offsetWidth; im.classList.add('pop'); }); });
    pick(0);
  }

  /* ---------- Galeri okları ---------- */
  $$('.gal').forEach(function(g){
    var nav=d.createElement('div'); nav.className='gal-nav';
    nav.innerHTML='<button type="button" data-d="-1" aria-label="Previous"><svg viewBox="0 0 24 24"><path d="m15 5-7 7 7 7"/></svg></button><div class="gal-track"><i></i></div><button type="button" data-d="1" aria-label="Next"><svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></svg></button>';
    g.parentNode.insertBefore(nav,g.nextSibling);
    var bt=$$('button',nav), th=$('i',nav);
    function upd(){ var max=g.scrollWidth-g.clientWidth; var r=max>0?g.scrollLeft/max:0; var w=max>0?Math.max(14,g.clientWidth/g.scrollWidth*100):100;
      th.style.width=w+'%'; th.style.left=((100-w)*r)+'%'; bt[0].disabled=g.scrollLeft<4; bt[1].disabled=g.scrollLeft>=max-4; }
    bt.forEach(function(b){ b.addEventListener('click',function(){ g.scrollBy({left:(+b.getAttribute('data-d'))*g.clientWidth*.7,behavior:'smooth'}); }); });
    g.addEventListener('scroll',upd,{passive:true}); window.addEventListener('resize',upd); upd(); setTimeout(upd,400);
  });

  /* ---------- Işık kutusu ---------- */
  var lb=$('#lb');
  if(lb){
    var shots=$$('.gal button'), li=0, lim=$('img',lb);
    function show(i){ li=(i+shots.length)%shots.length; lim.src=shots[li].getAttribute('data-full'); lb.classList.add('on'); }
    shots.forEach(function(b,i){ b.addEventListener('click',function(){ show(i); }); });
    $('.lb-x',lb).addEventListener('click',function(){ lb.classList.remove('on'); });
    $('.lb-n.l',lb).addEventListener('click',function(e){ e.stopPropagation(); show(li-1); });
    $('.lb-n.r',lb).addEventListener('click',function(e){ e.stopPropagation(); show(li+1); });
    lb.addEventListener('click',function(e){ if(e.target===lb) lb.classList.remove('on'); });
    d.addEventListener('keydown',function(e){ if(!lb.classList.contains('on')) return; if(e.key==='Escape') lb.classList.remove('on'); if(e.key==='ArrowRight') show(li+1); if(e.key==='ArrowLeft') show(li-1); });
  }
})();
