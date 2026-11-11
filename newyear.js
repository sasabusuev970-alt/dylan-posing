/* ============================================================
   Новогодняя тема для /newyear/
   Снегопад на canvas + бейдж «Новогодняя версия».
   При prefers-reduced-motion снег не запускается.
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) { /* старый браузер */ }

  function addBadge() {
    var wrap = document.querySelector('.hero .wrap');
    if (!wrap || wrap.querySelector('.ny-badge')) return;

    var badge = document.createElement('div');
    badge.className = 'ny-badge';
    var icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '\u2744'; // ❄
    badge.appendChild(icon);
    badge.appendChild(document.createTextNode(' Новогодняя версия'));
    wrap.insertBefore(badge, wrap.firstChild);
  }

  function startSnow() {
    if (reduceMotion) return;

    var probe = document.createElement('canvas');
    if (!probe.getContext) return;

    var canvas = document.createElement('canvas');
    canvas.id = 'ny-snow';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var COLORS = ['#ffffff', '#e6f3ff', '#ffe7b0', '#cfe6ff'];
    var flakes = [];
    var w = 0;
    var h = 0;
    var dpr = 1;
    var rafId = 0;
    var lastTime = 0;

    function makeFlake() {
      var depth = Math.random(); // 0 — далеко, 1 — близко
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.7 + depth * 2.1,
        vy: 12 + depth * 46,
        sway: 6 + depth * 14,
        swaySpeed: 0.4 + Math.random() * 0.9,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.35 + depth * 0.5,
        color: COLORS[(Math.random() * COLORS.length) | 0]
      };
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var target = Math.max(24, Math.min(150, Math.round(w / 10)));
      while (flakes.length < target) flakes.push(makeFlake());
      if (flakes.length > target) flakes.length = target;
    }

    function frame(now) {
      rafId = 0;
      var dt = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0.016;
      lastTime = now;

      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        f.y += f.vy * dt;
        f.x += Math.sin(now / 1000 * f.swaySpeed + f.phase) * f.sway * dt;

        if (f.y - f.r > h) {
          f.y = -f.r;
          f.x = Math.random() * w;
        }
        if (f.x < -6) f.x = w + 6;
        else if (f.x > w + 6) f.x = -6;

        ctx.globalAlpha = f.alpha;
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      rafId = window.requestAnimationFrame(frame);
    }

    function play() {
      if (rafId) return;
      lastTime = 0;
      rafId = window.requestAnimationFrame(frame);
    }

    function pause() {
      if (!rafId) return;
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }

    resize();
    play();

    var resizeTimer = 0;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 150);
    });

    // Не тратим батарею, когда вкладка скрыта
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pause();
      else play();
    });
  }

  function init() {
    try {
      document.title = 'Dylan.Posing | Новогодняя версия';
    } catch (e) { /* ignore */ }
    addBadge();
    startSnow();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
