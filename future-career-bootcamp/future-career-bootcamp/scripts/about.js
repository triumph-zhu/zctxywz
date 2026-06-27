/* =========================================================
   About 页面独有 JS
   — Network canvas 可视化
   — Hero 入场动画（line-wipe, glitch）
   — .curr-item 交错延迟
   ========================================================= */

(function () {
  window.initAbout = function () {
    initNetworkCanvas();
    initHeroAnimation();
    initCurrStagger();
  };

  /* ── NETWORK CANVAS ── */
  function initNetworkCanvas() {
    var c = document.getElementById("netCanvas");
    if (!c) return;
    var ctx = c.getContext("2d");
    var W, H, nodes = [];

    function resize() {
      var rect = c.parentElement.getBoundingClientRect();
      W = c.width = rect.width;
      H = c.height = rect.height;
      init();
    }

    function init() {
      nodes = [];
      var count = 28;
      var cx = W / 2, cy = H / 2;
      nodes.push({ x: cx, y: cy, r: 7, core: true, vx: 0, vy: 0, a: 1 });
      for (var i = 0; i < count; i++) {
        var angle = Math.random() * Math.PI * 2;
        var dist = 50 + Math.random() * (Math.min(W, H) / 2 - 70);
        nodes.push({
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          r: Math.random() * 2.5 + 1,
          core: false,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          a: Math.random() * 0.6 + 0.2,
          conn: Math.floor(Math.random() * 3) + 1,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      // connections
      nodes.forEach(function (n, i) {
        if (n.core) return;
        var core = nodes[0];
        var dist = Math.hypot(n.x - core.x, n.y - core.y);
        if (dist < 200) {
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(core.x, core.y);
          ctx.strokeStyle = "rgba(245,201,113," + (0.04 + 0.06 * (1 - dist / 200)) + ")";
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
        nodes.forEach(function (m, j) {
          if (j <= i || m.core) return;
          var d = Math.hypot(n.x - m.x, n.y - m.y);
          if (d < 90) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = "rgba(245,201,113," + (0.03 * (1 - d / 90)) + ")";
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        });
      });
      // nodes
      nodes.forEach(function (n) {
        if (!n.core) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 5 || n.x > W - 5) n.vx *= -1;
          if (n.y < 5 || n.y > H - 5) n.vy *= -1;
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        if (n.core) {
          ctx.fillStyle = "rgba(245,201,113,.9)";
          ctx.shadowColor = "rgba(245,201,113,.6)";
          ctx.shadowBlur = 20;
        } else {
          ctx.fillStyle = "rgba(245,201,113," + n.a + ")";
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      requestAnimationFrame(draw);
    }

    if (window.ResizeObserver) {
      new ResizeObserver(resize).observe(c.parentElement);
    }
    resize();
    draw();
  }

  /* ── HERO ANIMATIONS ── */
  function initHeroAnimation() {
    var hero = document.getElementById("hero");
    if (!hero) return;
    setTimeout(function () { hero.classList.add("in"); }, 80);
    setTimeout(function () { hero.classList.add("done"); }, 2200);
    // glitch effect
    var accent = hero.querySelector(".accent");
    if (accent) {
      setInterval(function () {
        accent.style.setProperty("--gl", Math.random() < 0.06 ? 1 : 0);
      }, 140);
    }
  }

  /* ── STAGGER CURR ITEMS ── */
  function initCurrStagger() {
    document.querySelectorAll(".curr-item").forEach(function (el, i) {
      el.style.transitionDelay = i * 0.08 + "s";
    });
  }
})();
