/* =========================================================
   Future Career Bootcamp · 前端逻辑
   导航 / 渲染 / 搜索 / 筛选 / 页面控制器
   ========================================================= */
(function () {
  let D;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  /* ---------- 工具 ---------- */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function highlight(text, q) {
    const safe = escapeHtml(text);
    if (!q) return safe;
    const tokens = q.trim().split(/\s+/).filter(Boolean).map(escapeRe);
    if (!tokens.length) return safe;
    return safe.replace(new RegExp("(" + tokens.join("|") + ")", "gi"), "<mark>$1</mark>");
  }
  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  function getParam(name) { return new URLSearchParams(location.search).get(name); }
  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
  function courseById(id) { return D.courses.find((c) => c.id === id); }
  function cohortById(id) { return D.cohorts.find((c) => c.id === id); }

  /* ---------- 主题切换 ---------- */
  function getPreferredTheme() {
    const stored = localStorage.getItem("fcb-theme");
    if (stored) return stored;
    return "dark";
  }
  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("fcb-theme", theme);
  }
  function toggleTheme() {
    const current = document.documentElement.dataset.theme || "dark";
    setTheme(current === "dark" ? "light" : "dark");
    updateAllThemeIcons();
  }
  function updateAllThemeIcons() {
    document.querySelectorAll(".theme-icon").forEach((icon) => {
      const isLight = document.documentElement.dataset.theme === "light";
      icon.textContent = isLight ? "☾" : "☀";
    });
  }

  /* ---------- 导航 + 页脚 ---------- */
  const NAV = [
    { href: "index.html", label: "首页", key: "home" },
    { href: "learn.html", label: "学习资料", key: "learn" },
    { href: "messages.html", label: "师兄师姐寄语", key: "messages" },
    { href: "career-path.html", label: "职业路径规划", key: "careerpath" },
    { href: "interview.html", label: "面试模拟", key: "interview" },
    { href: "about.html", label: "关于训练营", key: "about" },
  ];

  function buildNav(active) {
    const nav = document.createElement("nav");
    nav.className = "nav";
    nav.innerHTML = `
      <div class="container">
        <a class="brand" href="index.html">
          <span class="logo"></span>
          <span>Future Career Bootcamp<small>职场特训营数字知识库</small></span>
        </a>
        <button class="nav-toggle" aria-label="菜单">☰</button>
        <ul class="nav-links">
          ${NAV.map((n) => `<li><a href="${n.href}" class="${n.key === active ? "active" : ""}">${n.label}</a></li>`).join("")}
        </ul>
        <button class="theme-toggle" aria-label="切换主题" title="切换深色/浅色主题">
          <span class="theme-icon">☀</span>
        </button>
      </div>`;
    document.body.prepend(nav);
    const links = $(".nav-links", nav);
    $(".nav-toggle", nav).addEventListener("click", () => links.classList.toggle("open"));
    const themeBtn = $(".theme-toggle", nav);
    themeBtn.addEventListener("click", toggleTheme);
    updateAllThemeIcons();
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function buildFooter() {
    const f = document.createElement("footer");
    f.className = "footer";
    f.innerHTML = `
      <div class="container">
        <div class="brand"><span class="logo"></span>
          <span>Future Career Bootcamp<small>从校园到职场，进入你的职业成长加速系统。</small></span>
        </div>
        <div>© 2026 职场特训营数字知识库 · 第一阶段 · 让每一次学习都被沉淀</div>
      </div>`;
    document.body.appendChild(f);
  }

  function buildCosmos() {
    // 暗角 + 流光光斑
    const vig = document.createElement("div");
    vig.className = "vignette";
    document.body.prepend(vig);
    ["a", "b", "c"].forEach((k) => {
      const o = document.createElement("div");
      o.className = "orb " + k;
      document.body.prepend(o);
    });
    // FABLE 5 星河：轻量 canvas 星点，缓慢漂移 + 闪烁
    const cv = document.createElement("canvas");
    cv.id = "cosmos";
    document.body.prepend(cv);
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const PALETTE_DARK = ["#5ad8ff", "#9b6cff", "#ff7eb6", "#f5c971", "#ffffff"];
    const PALETTE_LIGHT = ["#5ad8ff", "#9b6cff", "#ff7eb6", "#f5c971", "#8888aa"];
    let stars = [], W, H, DPR;
    function currentPalette() {
      return document.documentElement.dataset.theme === "light" ? PALETTE_LIGHT : PALETTE_DARK;
    }
    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      const de = document.documentElement;
      const vv = window.visualViewport;
      W = window.innerWidth || (vv && vv.width) || de.clientWidth || 1280;
      H = window.innerHeight || (vv && vv.height) || 800;
      if (W < 50) W = 1280;
      if (H < 50) H = 800;
      cv.width = W * DPR; cv.height = H * DPR;
      cv.style.width = W + "px"; cv.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const count = Math.min(220, Math.floor((W * H) / 9000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.4 + 0.3,
        ci: (Math.random() * 5) | 0,
        tw: Math.random() * 6.283, sp: 0.6 + Math.random() * 1.6,
        vx: (Math.random() - 0.5) * 0.06, vy: (Math.random() - 0.5) * 0.06,
      }));
    }
    function tick(t) {
      const pal = currentPalette();
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        s.x += s.vx; s.y += s.vy;
        if (s.x < 0) s.x = W; if (s.x > W) s.x = 0;
        if (s.y < 0) s.y = H; if (s.y > H) s.y = 0;
        const a = 0.35 + 0.45 * Math.sin(t * 0.001 * s.sp + s.tw);
        ctx.globalAlpha = Math.max(0, a);
        const c = pal[s.ci] || pal[0];
        ctx.fillStyle = c;
        ctx.shadowColor = c; ctx.shadowBlur = s.r * 4;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      requestAnimationFrame(tick);
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("load", resize);
    if (window.ResizeObserver) new ResizeObserver(resize).observe(document.documentElement);
    requestAnimationFrame(tick);
  }

  /* ---------- 滚动入场 ---------- */
  function initReveal() {
    const els = $$(".reveal:not(.in)");
    if (!els.length) return;
    const reveal = (el) => el.classList.add("in");
    // 不支持 IntersectionObserver：直接全部显示，绝不让 UI 隐藏
    if (!("IntersectionObserver" in window)) { els.forEach(reveal); return; }
    const vh = window.innerHeight || document.documentElement.clientHeight || 800;
    const io = new IntersectionObserver(
      (entries, obs) => entries.forEach((e) => { if (e.isIntersecting) { reveal(e.target); obs.unobserve(e.target); } }),
      { threshold: 0, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => {
      // 首屏（已在视口内）的元素立即显示，避免观察器延迟/异常导致内容不可见
      const r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) reveal(el);
      else io.observe(el);
    });
    // 兜底：极端情况下（异常视口、观察器不触发、后台节流）2s 后强制显示剩余元素
    setTimeout(() => $$(".reveal:not(.in)").forEach(reveal), 2000);
  }

  /* ---------- 卡片模板 ---------- */
  function courseCard(c, q) {
    return `
      <article class="glass course-card reveal">
        <span class="course-no">${c.courseNo}</span>
        <div class="meta">
          <span class="tag grad">${escapeHtml(c.category)}</span>
          <span class="tag">${escapeHtml(c.cohortTitle)}</span>
        </div>
        <h3>${highlight(c.title, q)}</h3>
        <p class="summary">${highlight(c.summary, q)}</p>
        <div class="tags">${c.tags.map((t) => `<span class="tag">#${escapeHtml(t)}</span>`).join("")}</div>
        <div class="foot">
          <span class="info">${escapeHtml(c.speaker)} · ${escapeHtml(c.date)}</span>
          <a class="read-link" href="course-detail.html?id=${c.id}">阅读全文</a>
        </div>
      </article>`;
  }
  function messageCard(m, q) {
    const initial = m.name.replace(/师兄|师姐/g, "").trim().charAt(0) || m.name.charAt(0);
    return `
      <article class="glass msg-card reveal">
        <p class="msg-text">${highlight(m.content, q)}</p>
        <div class="tags">${m.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
        <div class="msg-who">
          <span class="avatar">${escapeHtml(initial)}</span>
          <span class="who-text">
            <b>${highlight(m.name, q)}</b>
            <small>${escapeHtml(m.status)} · ${escapeHtml(m.cohortTitle)}</small>
          </span>
        </div>
      </article>`;
  }
  function cohortCard(c) {
    return `
      <article class="glass cohort-card reveal">
        <div class="cohort-period">${escapeHtml(c.period)}</div>
        <h3>${escapeHtml(c.title)}</h3>
        <div class="theme">主题 · ${escapeHtml(c.theme)}</div>
        <p class="desc">${escapeHtml(c.description)}</p>
        <div class="cohort-stats">
          <div><b>${c.courseCount}</b><small>课程文稿</small></div>
          <div><b>${c.messageCount}</b><small>师兄师姐寄语</small></div>
        </div>
        <ul class="feat-list">${c.featuredCourses.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>
        <a class="btn primary" href="learn.html?cohort=${c.id}">查看本期内容</a>
      </article>`;
  }

  const EMPTY = `<div class="empty"><div class="big">⚲</div>暂未找到相关内容，可以尝试搜索"简历""面试""沟通""职业规划"等关键词。</div>`;

  /* ---------- 页面：首页 ---------- */
  function initHome() {
    // 数据概览
    const stats = [
      { n: D.courses.length + "+", label: "课程文稿", desc: "持续沉淀的职场课程讲义" },
      { n: D.cohorts.length, label: "期训练营沉淀", desc: "每一期都是成长样本" },
      { n: D.messages.length + "+", label: "师兄师姐寄语", desc: "来自前辈的真实经验" },
      { n: D.categories.length, label: "职场成长主题", desc: "覆盖求职全流程" },
    ];
    $("#stats").innerHTML = stats.map((s) => `
      <div class="glass stat reveal"><b>${s.n}</b><div class="label">${s.label}</div><div class="desc">${s.desc}</div></div>`).join("");

    // 学习资料
    $("#hot-courses").innerHTML = D.courses.slice(0, 3).map((c) => courseCard(c, "")).join("");
    // 精选寄语
    $("#hot-messages").innerHTML = D.messages.slice(0, 3).map((m) => messageCard(m, "")).join("");
    // 期数入口
    $("#home-cohorts").innerHTML = D.cohorts.map((c) => cohortCard(c)).join("");

    // 「重温封面星河」按钮 → 重播封面特效
    const replay = $("#replay-cover");
    if (replay) replay.addEventListener("click", () => {
      if (typeof window.playCover === "function") window.playCover();
    });
  }

  /* ---------- 页面：学习资料 ---------- */
  function initCourses() {
    // 渲染期数卡片（原 initCohorts 逻辑）
    const cohortList = $("#cohort-list");
    if (cohortList) cohortList.innerHTML = D.cohorts.map((c) => cohortCard(c)).join("");

    const state = { q: "", cohort: getParam("cohort") || "all", category: "all", tag: "all" };

    // 期数筛选
    $("#f-cohort").innerHTML =
      chip("all", "全部", state.cohort) + D.cohorts.map((c) => chip(c.id, c.period, state.cohort)).join("");
    // 分类筛选
    $("#f-category").innerHTML =
      chip("all", "全部", "all") + D.categories.map((c) => chip(c, c, "all")).join("");
    // 标签筛选
    $("#f-tag").innerHTML =
      chip("all", "全部", "all") + D.tags.map((t) => chip(t, t, "all")).join("");

    function chip(val, label, current) {
      return `<span class="chip ${val === current ? "active" : ""}" data-val="${escapeHtml(val)}">${escapeHtml(label)}</span>`;
    }

    function render() {
      const q = state.q.toLowerCase();
      const list = D.courses.filter((c) => {
        if (state.cohort !== "all" && c.cohortId !== state.cohort) return false;
        if (state.category !== "all" && c.category !== state.category) return false;
        if (state.tag !== "all" && !c.tags.includes(state.tag)) return false;
        if (!q) return true;
        const hay = [c.title, c.summary, c.content, c.speaker, c.category, c.cohortTitle, c.tags.join(" ")].join(" ").toLowerCase();
        return hay.includes(q);
      });
      $("#count").textContent = `共找到 ${list.length} 篇课程文稿`;
      $("#list").innerHTML = list.length ? list.map((c) => courseCard(c, state.q)).join("") : EMPTY;
      initReveal();
    }

    // 搜索
    $("#search").addEventListener("input", debounce((e) => { state.q = e.target.value; render(); }, 160));
    // 筛选点击（事件委托）
    bindChips("#f-cohort", (v) => { state.cohort = v; render(); });
    bindChips("#f-category", (v) => { state.category = v; render(); });
    bindChips("#f-tag", (v) => { state.tag = v; render(); });

    function bindChips(sel, cb) {
      const wrap = $(sel);
      wrap.addEventListener("click", (e) => {
        const chip = e.target.closest(".chip");
        if (!chip) return;
        $$(".chip", wrap).forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        cb(chip.dataset.val);
      });
    }

    // 若带 cohort 参数，显示提示
    if (state.cohort !== "all") {
      const co = cohortById(state.cohort);
      if (co) $("#cohort-note").innerHTML =
        `当前筛选：<b style="color:var(--c-cyan)">${escapeHtml(co.title)}</b> · <a class="read-link" href="learn.html">查看全部期数</a>`;
    }
    render();
  }

  /* ---------- 页面：寄语 ---------- */
  function initMessages() {
    const state = { q: "", cohort: getParam("cohort") || "all", tag: "all" };

    $("#f-cohort").innerHTML =
      chip("all", "全部", state.cohort) + D.cohorts.map((c) => chip(c.id, c.period, state.cohort)).join("");
    $("#f-tag").innerHTML =
      chip("all", "全部", "all") + D.messageTags.map((t) => chip(t, t, "all")).join("");

    function chip(val, label, current) {
      return `<span class="chip ${val === current ? "active" : ""}" data-val="${escapeHtml(val)}">${escapeHtml(label)}</span>`;
    }

    function render() {
      const q = state.q.toLowerCase();
      const list = D.messages.filter((m) => {
        if (state.cohort !== "all" && m.cohortId !== state.cohort) return false;
        if (state.tag !== "all" && !m.tags.includes(state.tag)) return false;
        if (!q) return true;
        const hay = [m.name, m.status, m.content, m.cohortTitle, m.tags.join(" ")].join(" ").toLowerCase();
        return hay.includes(q);
      });
      $("#count").textContent = `共 ${list.length} 条经验信号`;
      $("#list").innerHTML = list.length ? list.map((m) => messageCard(m, state.q)).join("") : EMPTY;
      initReveal();
    }

    $("#search").addEventListener("input", debounce((e) => { state.q = e.target.value; render(); }, 160));
    bindChips("#f-cohort", (v) => { state.cohort = v; render(); });
    bindChips("#f-tag", (v) => { state.tag = v; render(); });
    function bindChips(sel, cb) {
      const wrap = $(sel);
      wrap.addEventListener("click", (e) => {
        const chip = e.target.closest(".chip");
        if (!chip) return;
        $$(".chip", wrap).forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        cb(chip.dataset.val);
      });
    }
    render();
  }

  /* ---------- 页面：课程详情 ---------- */
  function initDetail() {
    const c = courseById(getParam("id")) || D.courses[0];
    document.title = c.title + " · Future Career Bootcamp";

    $("#detail").innerHTML = `
      <a class="back-link" href="learn.html">← 返回学习资料</a>
      <div class="glass detail-head reveal">
        <div class="meta" style="display:flex;gap:8px;flex-wrap:wrap">
          <span class="tag grad">${escapeHtml(c.category)}</span>
          <span class="tag">${escapeHtml(c.cohortTitle)}</span>
          <span class="tag">${escapeHtml(c.courseNo)}</span>
        </div>
        <h1>${escapeHtml(c.title)}</h1>
        <div class="detail-meta">
          <span>讲师 · <b>${escapeHtml(c.speaker)}</b></span>
          <span>日期 · <b>${escapeHtml(c.date)}</b></span>
          <span>分类 · <b>${escapeHtml(c.category)}</b></span>
        </div>
      </div>

      <div class="detail-layout">
        <div class="article reveal">
          <div class="callout"><b>课程摘要：</b>${escapeHtml(c.summary)}</div>

          <h2>课程正文</h2>
          ${c.content.split("\n").filter(Boolean).map((p) => `<p>${escapeHtml(p)}</p>`).join("")}

          <h2>核心观点</h2>
          <ul class="checklist">
            ${c.keyPoints.map((k) => `<li><span class="box">◆</span><span>${escapeHtml(k)}</span></li>`).join("")}
          </ul>

          <h2>重点金句</h2>
          <div class="quote-grid">
            ${c.quotes.map((q) => `<div class="quote-chip">${escapeHtml(q)}</div>`).join("")}
          </div>

          <h2>行动建议</h2>
          <ul class="checklist">
            ${c.actions.map((a) => `<li><span class="box">✓</span><span>${escapeHtml(a)}</span></li>`).join("")}
          </ul>
        </div>

        <aside class="aside reveal">
          <div class="glass">
            <h4>课程信息</h4>
            <div class="info-row"><span>课程编号</span><b>${escapeHtml(c.courseNo)}</b></div>
            <div class="info-row"><span>所属期数</span><b>${escapeHtml(c.cohortTitle)}</b></div>
            <div class="info-row"><span>讲师</span><b>${escapeHtml(c.speaker)}</b></div>
            <div class="info-row"><span>日期</span><b>${escapeHtml(c.date)}</b></div>
            <div class="info-row"><span>分类</span><b>${escapeHtml(c.category)}</b></div>
          </div>
          <div class="glass">
            <h4>标签</h4>
            <div class="tags" style="display:flex;flex-wrap:wrap;gap:7px">
              ${c.tags.map((t) => `<span class="tag">#${escapeHtml(t)}</span>`).join("")}
            </div>
          </div>
        </aside>
      </div>

      <hr class="divider">
      <div class="section-head"><div><div class="eyebrow">Related</div><h2 class="section-title">相关课程推荐</h2></div></div>
      <div class="grid cols-3" id="related"></div>`;

    // 相关课程：同期或同分类，排除自身
    const related = D.courses
      .filter((x) => x.id !== c.id && (x.cohortId === c.cohortId || x.category === c.category))
      .slice(0, 3);
    const fallback = D.courses.filter((x) => x.id !== c.id).slice(0, 3);
    $("#related").innerHTML = (related.length ? related : fallback).map((x) => courseCard(x, "")).join("");
    initReveal();
  }

  /* ---------- 启动 ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    window.loadData().then((data) => {
      D = data;
      const page = document.body.dataset.page;
      buildCosmos();
      buildNav(page);
      const initers = {
        home: initHome, learn: initCourses, messages: initMessages,
        detail: initDetail,
        careerpath: () => {}, // 职业路径规划有自己的 ES module 初始化逻辑
        interview: () => {}, // 面试模拟器有自己的 ES module 初始化逻辑
        about: () => { if (typeof window.initAbout === "function") window.initAbout(); },
      };
      (initers[page] || (() => {}))();
      buildFooter();
      initReveal();
    });
  });
})();
