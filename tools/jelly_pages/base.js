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

  /* ---------- Dünya gezgini ---------- */
  var wx=$('#wx');
  if(wx && window.JG_WORLDS){
    var W=window.JG_WORLDS, cur=0, timer=null, N=W.length;
    var view=$('.wx-view',wx)||$('#wxview'), numEl=$('.wx-num',wx), nmEn=$('.wx-name .en',wx), nmTr=$('.wx-name .tr',wx), strip=$('.wx-strip',wx);
    var pad=function(i){return (i<10?'0':'')+i;};
    var ths=W.map(function(w,i){
      var b=d.createElement('button'); b.type='button'; b.className='wx-th'; b.setAttribute('aria-label',w.en);
      b.innerHTML='<img src="'+window.JG_WBASE+pad(i+1)+'.webp" alt="" width="320" height="569" loading="lazy">';
      b.addEventListener('click',function(){ go(i,true); });
      strip.appendChild(b); return b;
    });
    function go(i,user){
      i=(i+N)%N; var img=d.createElement('img');
      img.src=window.JG_WBASE+pad(i+1)+'.webp'; img.alt=''; img.className='out';
      var old=$('img:not(.out)',view);
      view.appendChild(img);
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ img.classList.remove('out'); if(old) old.classList.add('out'); setTimeout(function(){ if(old&&old.parentNode) old.parentNode.removeChild(old); },500); }); });
      cur=i; numEl.textContent=(i+1)+' / '+N; nmEn.textContent=W[i].en; nmTr.textContent=W[i].tr;
      ths.forEach(function(t,k){ t.classList.toggle('on',k===i); });
      var t=ths[i]; strip.scrollTo({left:t.offsetLeft-strip.clientWidth/2+t.clientWidth/2,behavior:'smooth'});
      if(user) stop();
    }
    function stop(){ if(timer){ clearInterval(timer); timer=null; } }
    function play(){ if(!timer) timer=setInterval(function(){ go(cur+1); },3800); }
    $('.wx-prev',wx).addEventListener('click',function(){ go(cur-1,true); });
    $('.wx-next',wx).addEventListener('click',function(){ go(cur+1,true); });
    wx.addEventListener('keydown',function(e){ if(e.key==='ArrowRight') go(cur+1,true); if(e.key==='ArrowLeft') go(cur-1,true); });
    var first=d.createElement('img'); first.src=window.JG_WBASE+'01.webp'; first.alt=''; view.appendChild(first);
    go(0);
    if('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      new IntersectionObserver(function(es){ es[0].isIntersecting?play():stop(); },{threshold:.35}).observe(wx);
    }
  }

  /* ---------- Mekanik laboratuvarı ---------- */
  var lab=$('#lab');
  if(lab){
    var tabs=$$('.lab-tab',lab), panes=$$('.lab-pane',lab);
    function pick(i){ tabs.forEach(function(t,k){ t.classList.toggle('on',k===i); t.setAttribute('aria-selected',k===i); }); panes.forEach(function(p,k){ p.classList.toggle('on',k===i); }); }
    tabs.forEach(function(t,i){ t.addEventListener('click',function(){ pick(i); }); });
    $$('.lab-art img',lab).forEach(function(im){ im.addEventListener('click',function(){ im.classList.remove('pop'); void im.offsetWidth; im.classList.add('pop'); }); });
    pick(0);
  }

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
