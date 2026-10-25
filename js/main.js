/* Искра — персональные журналы на заказ
   © 2026, Полунин Лев. Все права защищены. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- header & burger ---------- */
  var hdr = $('#hdr');
  var burger = $('#burger');
  var nav = $('#nav');

  function onScroll() { hdr.classList.toggle('is-scrolled', window.pageYOffset > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); burger.focus(); }
  });
  window.addEventListener('resize', function () { if (window.innerWidth > 900) setMenu(false); });

  /* ---------- toast & clipboard ---------- */
  var toast = $('#toast');
  var toastT;
  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toast.classList.remove('is-on'); }, 3600);
  }

  function copyText(text) {
    var done = false;
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      done = document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (e) { done = false; }
    if (!done && navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(function () {});
      done = true;
    }
    return done;
  }

  function sparks(x, y) {
    if (reduceMotion) return;
    for (var i = 0; i < 9; i++) {
      var p = document.createElement('span');
      var a = (Math.PI * 2 * i) / 9 + Math.random() * 0.4;
      var d = 34 + Math.random() * 30;
      p.className = 'spark-p';
      p.style.left = (x - 5) + 'px';
      p.style.top = (y - 5) + 'px';
      p.style.setProperty('--dx', Math.cos(a) * d + 'px');
      p.style.setProperty('--dy', Math.sin(a) * d + 'px');
      document.body.appendChild(p);
      setTimeout(function (el) { return function () { el.remove(); }; }(p), 800);
    }
  }

  // Ссылки в директ: копируем подготовленный текст заявки и даём ссылке открыться
  $$('.js-dm').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var msg = a.getAttribute('data-msg');
      if (msg && copyText(msg)) showToast('Текст заявки скопирован — вставьте его в директ');
      var r = a.getBoundingClientRect();
      sparks(e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2);
    });
  });

  /* ---------- 1. конструктор крышки ---------- */
  var THEMES = {
    mom:     { def: 'Мама',   line: 'ты — мой самый тёплый дом',       foot: 'специальный выпуск',    title: 'маме' },
    dad:     { def: 'Папа',   line: 'ты — моя опора и сила',           foot: 'мой главный герой',     title: 'папе' },
    bday:    { def: 'Гоша',   line: 'день, когда родилась легенда',    foot: 'happy birthday',        title: 'на день рождения' },
    love:    { def: 'Даня',   line: 'это наша история любви',          foot: 'love story',            title: 'love story' },
    friends: { def: 'Алина',  line: 'ну мы же по чуть-чуть',           foot: 'friends story',         title: 'friend story' },
    travel:  { def: 'Катя',   line: 'все наши дороги в одном журнале', foot: 'travel story',          title: 'travel story' },
    pet:     { def: 'Буся',   line: 'главный хвост в нашей семье',     foot: 'журнал про питомца',    title: 'про питомца' }
  };
  var input = $('#nameInput');
  var lidName = $('#lidName');
  var lidLine = $('#lidLine');
  var lidFoot = $('#lidFoot');
  var heart = $('.lid__heart');
  var makerBtn = $('.js-maker-dm');
  var chips = $$('.chip');
  var theme = 'mom';

  function cleanName(v) { return v.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim(); }

  function renderLid(stamp) {
    var t = THEMES[theme];
    var name = cleanName(input.value) || t.def;
    input.placeholder = t.def;
    lidName.textContent = name + (theme === 'pet' ? ' —' : ',');
    lidLine.textContent = t.line;
    lidFoot.textContent = t.foot;
    makerBtn.setAttribute('data-msg', 'Здравствуйте! Хочу журнал ' + t.title + '. Для кого: ' + name + '.');
    if (stamp && !reduceMotion) {
      heart.classList.remove('is-stamp');
      void heart.offsetWidth;
      heart.classList.add('is-stamp');
    }
  }

  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      theme = c.getAttribute('data-theme');
      chips.forEach(function (o) {
        var on = o === c;
        o.classList.toggle('is-on', on);
        o.setAttribute('aria-checked', String(on));
      });
      renderLid(true);
    });
  });
  // клавиатура для radiogroup
  $('.chips').addEventListener('keydown', function (e) {
    var i = chips.indexOf(document.activeElement);
    if (i < 0) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); chips[(i + 1) % chips.length].focus(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); chips[(i - 1 + chips.length) % chips.length].focus(); }
  });

  var typingT;
  input.addEventListener('input', function () {
    renderLid(false);
    clearTimeout(typingT);
    typingT = setTimeout(function () { renderLid(true); }, 450);
  });
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') input.blur(); });
  renderLid(false);

  /* ---------- 3. полка ---------- */
  var spines = $$('.spine');
  spines.forEach(function (sp) {
    var btn = $('.spine__btn', sp);
    btn.addEventListener('click', function () {
      var isMobile = window.innerWidth <= 760;
      var wasOpen = sp.classList.contains('is-open');
      if (wasOpen && !isMobile) return;
      spines.forEach(function (o) {
        o.classList.remove('is-open');
        $('.spine__btn', o).setAttribute('aria-expanded', 'false');
        $('.spine__body', o).hidden = true;
      });
      if (!wasOpen) {
        sp.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        $('.spine__body', sp).hidden = false;
      }
    });
  });

  /* ---------- 4. табы работ ---------- */
  var tabs = $$('.tab');
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var p = document.getElementById(t.getAttribute('aria-controls'));
      p.hidden = !on;
      if (on) { var s = $('.strip', p); if (s) s.scrollLeft = 0; }
    });
    if (focus) tab.focus();
    tab.scrollIntoView && tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); selectTab(tabs[(i + 1) % tabs.length], true); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); selectTab(tabs[(i - 1 + tabs.length) % tabs.length], true); }
    });
  });

  /* ---------- лайтбокс ---------- */
  var lb = $('#lb');
  var lbImg = $('#lbImg');
  var lbCap = $('#lbCap');
  var lbList = [];
  var lbIdx = 0;
  var lbReturn = null;

  function bigSrc(img) {
    var src = img.currentSrc || img.src;
    return src.replace(/-480\.(webp|jpg)$/, '-960.$1');
  }
  function lbShow(i) {
    lbIdx = (i + lbList.length) % lbList.length;
    var fig = lbList[lbIdx];
    var img = $('img', fig);
    lbImg.src = bigSrc(img);
    lbImg.alt = img.alt;
    var cap = $('figcaption', fig);
    lbCap.textContent = cap ? cap.textContent : '';
  }
  function lbOpen(fig) {
    lbList = $$('.sp', fig.closest('.panel'));
    lbReturn = document.activeElement;
    lb.hidden = false;
    document.body.classList.add('menu-open');
    lbShow(lbList.indexOf(fig));
    $('.lb__x', lb).focus();
  }
  function lbClose() {
    lb.hidden = true;
    document.body.classList.remove('menu-open');
    if (lbReturn) lbReturn.focus();
  }
  $$('.sp').forEach(function (fig) {
    var img = $('img', fig);
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', 'Открыть: ' + img.alt);
    img.addEventListener('click', function () { lbOpen(fig); });
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lbOpen(fig); }
    });
  });
  $('.lb__x', lb).addEventListener('click', lbClose);
  $('.lb__arr--l', lb).addEventListener('click', function () { lbShow(lbIdx - 1); });
  $('.lb__arr--r', lb).addEventListener('click', function () { lbShow(lbIdx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lbClose(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') lbClose();
    if (e.key === 'ArrowLeft') lbShow(lbIdx - 1);
    if (e.key === 'ArrowRight') lbShow(lbIdx + 1);
    if (e.key === 'Tab') { // простая ловушка фокуса
      var f = $$('button', lb);
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  var lbX0 = null;
  lb.addEventListener('touchstart', function (e) { lbX0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (lbX0 === null) return;
    var dx = e.changedTouches[0].clientX - lbX0;
    if (Math.abs(dx) > 50) lbShow(lbIdx + (dx < 0 ? 1 : -1));
    lbX0 = null;
  });

  /* ---------- 5. видео: играем только в зоне видимости ---------- */
  var reels = $$('.reel');
  reels.forEach(function (r) {
    var v = $('video', r);
    var b = $('.reel__toggle', r);
    r._userPaused = reduceMotion;
    if (reduceMotion) { b.setAttribute('aria-pressed', 'true'); b.setAttribute('aria-label', 'Воспроизвести'); }
    b.addEventListener('click', function () {
      if (v.paused) {
        r._userPaused = false;
        var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
        b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'Пауза');
      } else {
        r._userPaused = true; v.pause();
        b.setAttribute('aria-pressed', 'true'); b.setAttribute('aria-label', 'Воспроизвести');
      }
    });
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var r = en.target, v = $('video', r);
        if (en.isIntersecting && !r._userPaused) {
          if (v.preload === 'none') { v.preload = 'auto'; }
          var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
        } else if (!en.isIntersecting) { v.pause(); }
      });
    }, { threshold: 0.35 });
    reels.forEach(function (r) { io.observe(r); });
  }

  /* ---------- 9. слайдер отзывов ---------- */
  var vp = $('#rvViewport');
  var track = $('#rvTrack');
  var slides = $$('.rv', track);
  var prev = $('#rvPrev');
  var next = $('#rvNext');
  var dotsWrap = $('#rvDots');
  var idx = 0;
  var dots = [];

  function perView() {
    var w = window.innerWidth;
    return w <= 760 ? 1 : (w <= 1080 ? 2 : 3);
  }
  function maxIdx() { return Math.max(0, slides.length - perView()); }
  function step() {
    var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
    return slides[0].getBoundingClientRect().width + gap;
  }
  function buildDots() {
    dotsWrap.innerHTML = '';
    dots = [];
    for (var i = 0; i <= maxIdx(); i++) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'rv-dot';
      d.setAttribute('aria-label', 'Отзыв ' + (i + 1));
      d.addEventListener('click', (function (n) { return function () { go(n); }; })(i));
      dotsWrap.appendChild(d);
      dots.push(d);
    }
  }
  function go(n, noAnim) {
    idx = Math.max(0, Math.min(n, maxIdx()));
    track.classList.toggle('no-anim', !!noAnim);
    track.style.transform = 'translate3d(' + (-idx * step()) + 'px,0,0)';
    prev.disabled = idx === 0;
    next.disabled = idx === maxIdx();
    dots.forEach(function (d, i) {
      d.classList.toggle('is-on', i === idx);
      d.setAttribute('aria-current', i === idx ? 'true' : 'false');
    });
    slides.forEach(function (s, i) {
      var vis = i >= idx && i < idx + perView();
      s.setAttribute('aria-hidden', String(!vis));
    });
  }
  prev.addEventListener('click', function () { go(idx - 1); });
  next.addEventListener('click', function () { go(idx + 1); });
  vp.setAttribute('tabindex', '0');
  vp.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') go(idx - 1);
    if (e.key === 'ArrowRight') go(idx + 1);
  });

  // свайп мышью и пальцем
  var sx = 0, sy = 0, dx = 0, dragging = false, locked = null;
  function startDrag(x, y) { sx = x; sy = y; dx = 0; dragging = true; locked = null; }
  function moveDrag(x, y, e) {
    if (!dragging) return;
    var mx = x - sx, my = y - sy;
    if (locked === null && (Math.abs(mx) > 6 || Math.abs(my) > 6)) locked = Math.abs(mx) > Math.abs(my) ? 'x' : 'y';
    if (locked !== 'x') return;
    if (e && e.cancelable) e.preventDefault();
    dx = mx;
    vp.classList.add('is-drag');
    track.classList.add('no-anim');
    track.style.transform = 'translate3d(' + (-idx * step() + dx) + 'px,0,0)';
  }
  function endDrag() {
    if (!dragging) return;
    dragging = false;
    vp.classList.remove('is-drag');
    if (locked === 'x' && Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1));
    else go(idx);
  }
  vp.addEventListener('touchstart', function (e) { startDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
  vp.addEventListener('touchmove', function (e) { moveDrag(e.touches[0].clientX, e.touches[0].clientY, e); }, { passive: false });
  vp.addEventListener('touchend', endDrag);
  vp.addEventListener('touchcancel', endDrag);
  vp.addEventListener('mousedown', function (e) { e.preventDefault(); startDrag(e.clientX, e.clientY); });
  window.addEventListener('mousemove', function (e) { if (dragging) moveDrag(e.clientX, e.clientY); });
  window.addEventListener('mouseup', endDrag);

  var lastPV = perView();
  var rT;
  window.addEventListener('resize', function () {
    clearTimeout(rT);
    rT = setTimeout(function () {
      if (perView() !== lastPV) { lastPV = perView(); buildDots(); }
      go(idx, true);
    }, 120);
  });
  buildDots();
  go(0, true);

  /* ---------- FAQ: открыт только один ---------- */
  var qas = $$('.qa');
  qas.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) qas.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });
})();
