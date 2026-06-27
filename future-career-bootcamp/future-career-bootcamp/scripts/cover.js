/* =========================================================
   Future Career Bootcamp · 封面特效
   移植自 FABLE 5「星之挽歌」WebGL 粒子引擎
   粒子在 文字 / 星系 / 心形 间变形，鼠标拨动、点击绽放
   配色沿用当前 FABLE 调色板（青→紫→玫→金）

   · 每个会话首次进首页自动播放一次（sessionStorage 记忆）
   · 之后不打扰；首页提供「重温封面星河」按钮可随时重播
   · 对外暴露 window.playCover() 供首页调用
   ========================================================= */
(function () {
  "use strict";

  /* ---------- 样式（只注入一次） ---------- */
  function ensureStyle() {
    if (document.getElementById("fableCoverStyle")) return;
    const css = `
    #fableCover{position:fixed;inset:0;z-index:9999;background:#04050a;cursor:crosshair;
      transition:opacity 1.4s ease;font-family:"Segoe UI","PingFang SC","Microsoft YaHei",system-ui,sans-serif;color:#fff}
    #fableCover.gone{opacity:0;pointer-events:none}
    #coverGl{position:absolute;inset:0;width:100%;height:100%;display:block}
    #fableCover .cv-vignette{position:absolute;inset:0;pointer-events:none;z-index:2;
      background:radial-gradient(ellipse 75% 75% at 50% 50%,transparent 55%,rgba(0,0,0,.78) 100%)}
    #fableCover .cv-brand{position:absolute;top:5vh;left:0;right:0;text-align:center;z-index:3;pointer-events:none;
      font-size:.7rem;letter-spacing:.95em;color:rgba(255,255,255,.5);text-indent:.95em}
    #fableCover .cv-poem{position:absolute;left:0;right:0;bottom:17vh;z-index:3;text-align:center;pointer-events:none;
      font-weight:200;font-size:clamp(1.25rem,3.6vw,2.4rem);line-height:1.5;letter-spacing:.05em;
      opacity:0;transition:opacity 1.3s ease,transform 1.3s ease;transform:translateY(20px);
      text-shadow:0 0 30px rgba(120,140,255,.4);padding:0 6vw;mix-blend-mode:screen}
    #fableCover .cv-poem.show{opacity:1;transform:none}
    #fableCover .cv-poem b{font-weight:600}
    #fableCover .cv-hud{position:absolute;left:0;right:0;bottom:8vh;z-index:3;text-align:center;pointer-events:none}
    #fableCover .cv-dots{display:flex;gap:10px;justify-content:center;margin-bottom:1.3rem;pointer-events:auto}
    #fableCover .cv-dots i{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.2);transition:.5s;cursor:pointer}
    #fableCover .cv-dots i.on{background:#f5c971;box-shadow:0 0 12px #f5c971;transform:scale(1.4)}
    #fableCover .cv-arrows{position:absolute;top:50%;left:0;right:0;z-index:3;display:flex;justify-content:space-between;padding:0 3vw;transform:translateY(-50%);pointer-events:none}
    #fableCover .cv-arrow{width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);
      display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1.2rem;color:rgba(255,255,255,.4);
      transition:all .25s;user-select:none;-webkit-user-select:none;pointer-events:auto;opacity:0}
    #fableCover .cv-arrow.show{opacity:1}
    #fableCover .cv-arrow:hover{background:rgba(255,255,255,.1);border-color:rgba(155,108,255,.5);color:#fff;box-shadow:0 0 14px -2px rgba(120,140,255,.5)}
    #fableCover .cv-tip{font-size:.68rem;letter-spacing:.32em;color:rgba(255,255,255,.34)}
    #coverEnter{position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;
      align-items:center;justify-content:center;background:#04050a;transition:opacity 1.5s ease;cursor:pointer;text-align:center;padding:0 6vw}
    #coverEnter.gone{opacity:0;pointer-events:none}
    #coverEnter h1{font-size:clamp(1.8rem,7vw,4.6rem);font-weight:800;letter-spacing:.01em;line-height:1.1;
      background:linear-gradient(110deg,#5ad8ff,#9b6cff 45%,#ff7eb6 75%,#f5c971);
      -webkit-background-clip:text;background-clip:text;color:transparent;background-size:300% 300%;animation:cvFlow 9s ease infinite}
    #coverEnter .cv-sub{margin-top:1.2rem;letter-spacing:.34em;font-size:.74rem;color:rgba(255,255,255,.45)}
    #coverEnter p{margin-top:2.2rem;letter-spacing:.4em;font-size:.78rem;color:rgba(255,255,255,.5);animation:cvPulse 2.4s ease-in-out infinite}
    @keyframes cvFlow{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
    @keyframes cvPulse{0%,100%{opacity:.35}50%{opacity:1}}
    #coverGo{position:absolute;top:4.5vh;right:5vw;z-index:6;cursor:pointer;
      padding:9px 20px;border-radius:999px;font-size:.72rem;letter-spacing:.18em;color:rgba(255,255,255,.8);
      background:rgba(255,255,255,.05);border:1px solid rgba(180,195,255,.22);backdrop-filter:blur(8px);
      opacity:0;transition:opacity .8s ease,border-color .25s,box-shadow .25s,color .25s}
    #coverGo.show{opacity:1}
    #coverGo:hover{color:#fff;border-color:rgba(155,108,255,.5);box-shadow:0 0 18px -4px rgba(120,140,255,.6)}
    /* 首页「重温封面」按钮 */
    #replay-cover{background:var(--card);border:1px solid var(--border);color:var(--t-1)}
    #replay-cover:hover{border-color:var(--border-glow);box-shadow:0 0 0 1px var(--border-glow),0 14px 36px -16px var(--c-indigo)}
    `;
    const styleEl = document.createElement("style");
    styleEl.id = "fableCoverStyle";
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  }

  /* ---------- 播放封面 ---------- */
  function playCover() {
    if (document.getElementById("fableCover")) return; // 正在播放，避免重复挂载
    ensureStyle();

    const cover = document.createElement("div");
    cover.id = "fableCover";
    cover.innerHTML = `
      <canvas id="coverGl"></canvas>
      <div class="cv-vignette"></div>
      <div class="cv-brand">FUTURE&nbsp;&nbsp;CAREER&nbsp;&nbsp;BOOTCAMP</div>
      <div class="cv-poem" id="coverPoem"></div>
      <div class="cv-hud">
        <div class="cv-dots" id="coverDots"></div>
        <div class="cv-tip">点击圆点 / 左右键 / 箭头切换星河</div>
      </div>
      <div class="cv-arrows" id="coverArrows">
        <div class="cv-arrow" data-dir="prev">‹</div>
        <div class="cv-arrow" data-dir="next">›</div>
      </div>
      <button id="coverGo">进 入 知 识 库 →</button>
      <div id="coverEnter">
        <h1>Future&nbsp;Career&nbsp;Bootcamp</h1>
        <div class="cv-sub">职 场 特 训 营 · 数 字 知 识 库</div>
        <p>点 击 任 意 处 · 进 入</p>
      </div>`;
    document.body.appendChild(cover);
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const cv = cover.querySelector("#coverGl");
    const gl = cv.getContext("webgl", { alpha: false, antialias: true, premultipliedAlpha: false })
      || cv.getContext("experimental-webgl");

    if (!gl) { dismiss(true); return; }

    let killed = false, raf = 0, ro = null;

    /* 尺寸 */
    let W, H, DPR, ASPECT;
    function resize() {
      DPR = Math.min(devicePixelRatio || 1, 2);
      const vv = window.visualViewport;
      W = window.innerWidth || (vv && vv.width) || document.documentElement.clientWidth || 1280;
      H = window.innerHeight || (vv && vv.height) || 800;
      if (W < 50) W = 1280;
      if (H < 50) H = 800;
      ASPECT = W / H;
      cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + "px"; cv.style.height = H + "px";
      gl.viewport(0, 0, cv.width, cv.height);
    }
    resize();

    /* 着色器 */
    function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s)); return s; }
    function prog(vs, fs) { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
      gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(p)); return p; }

    const pPoints = prog(`
      attribute vec2 a_pos; attribute vec3 a_col; attribute float a_seed;
      uniform float u_time, u_psize; varying vec3 v_col; varying float v_tw;
      void main(){ gl_Position=vec4(a_pos,0.0,1.0);
        float tw=0.55+0.45*sin(u_time*2.2 + a_seed*6.2831);
        v_tw=tw; v_col=a_col; gl_PointSize=u_psize*(0.55+0.9*tw); }`,`
      precision mediump float; varying vec3 v_col; varying float v_tw;
      void main(){ vec2 c=gl_PointCoord-0.5; float d=length(c);
        float a=smoothstep(0.5,0.0,d); a*=a; gl_FragColor=vec4(v_col*(0.6+v_tw), a); }`);
    const aPos = gl.getAttribLocation(pPoints, "a_pos");
    const aCol = gl.getAttribLocation(pPoints, "a_col");
    const aSeed = gl.getAttribLocation(pPoints, "a_seed");
    const uTime = gl.getUniformLocation(pPoints, "u_time");
    const uPsize = gl.getUniformLocation(pPoints, "u_psize");

    const pFade = prog(`attribute vec2 p; void main(){gl_Position=vec4(p,0.0,1.0);}`,`
      precision mediump float; uniform float u_a; void main(){ gl_FragColor=vec4(0.01,0.012,0.03,u_a); }`);
    const fadeBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, fadeBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    const aFadeP = gl.getAttribLocation(pFade, "p");
    const uFadeA = gl.getUniformLocation(pFade, "u_a");

    /* 粒子数据 */
    const COUNT = 22000;
    const posA = new Float32Array(COUNT * 2);
    const velA = new Float32Array(COUNT * 2);
    const tgtA = new Float32Array(COUNT * 2);
    const colA = new Float32Array(COUNT * 3);
    const seedA = new Float32Array(COUNT);
    const STOPS = [[0.35,0.85,1.0],[0.61,0.42,1.0],[1.0,0.49,0.71],[0.96,0.79,0.44]];
    function grad(t){ t=Math.max(0,Math.min(1,t)); const f=t*(STOPS.length-1);
      const i=Math.floor(f), k=f-i, a=STOPS[i], b=STOPS[Math.min(i+1,STOPS.length-1)];
      return [a[0]+(b[0]-a[0])*k, a[1]+(b[1]-a[1])*k, a[2]+(b[2]-a[2])*k]; }
    for (let i=0;i<COUNT;i++){
      const ang=Math.random()*6.283, rad=Math.random();
      posA[i*2]=Math.cos(ang)*rad; posA[i*2+1]=Math.sin(ang)*rad;
      const c=grad(i/COUNT); colA[i*3]=c[0]; colA[i*3+1]=c[1]; colA[i*3+2]=c[2];
      seedA[i]=Math.random();
    }
    const bufPos=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,bufPos); gl.bufferData(gl.ARRAY_BUFFER,posA,gl.DYNAMIC_DRAW);
    const bufCol=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,bufCol); gl.bufferData(gl.ARRAY_BUFFER,colA,gl.STATIC_DRAW);
    const bufSeed=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,bufSeed); gl.bufferData(gl.ARRAY_BUFFER,seedA,gl.STATIC_DRAW);

    /* 形状生成 */
    const off=document.createElement("canvas"); const octx=off.getContext("2d");
    function sampleText(str){
      const scale=Math.min(0.55, 900/W);
      const ow=Math.max(8,Math.floor(W*scale)), oh=Math.max(8,Math.floor(H*scale));
      off.width=ow; off.height=oh; octx.clearRect(0,0,ow,oh);
      octx.fillStyle="#fff"; octx.textAlign="center"; octx.textBaseline="middle";
      let fs=Math.floor(oh*0.5);
      octx.font="800 "+fs+'px "Segoe UI","PingFang SC","Microsoft YaHei",sans-serif';
      while(octx.measureText(str).width>ow*0.82 && fs>8){ fs-=2;
        octx.font="800 "+fs+'px "Segoe UI","PingFang SC","Microsoft YaHei",sans-serif'; }
      octx.fillText(str, ow/2, oh/2);
      const data=octx.getImageData(0,0,ow,oh).data;
      const xs=[],ys=[]; const stride=Math.max(2,Math.floor(ow/360));
      for(let y=0;y<oh;y+=stride){ for(let x=0;x<ow;x+=stride){
        if(data[(y*ow+x)*4+3]>130){ xs.push((x/ow*2-1)*0.92); ys.push(-(y/oh*2-1)*0.82); } } }
      return {xs,ys};
    }
    function setTargetsFromPts(pts){ const n=pts.xs.length; if(!n)return;
      for(let i=0;i<COUNT;i++){ const s=(i*49297)%n;
        tgtA[i*2]=pts.xs[s]+(Math.random()-0.5)*0.012;
        tgtA[i*2+1]=pts.ys[s]+(Math.random()-0.5)*0.012; } }
    function setGalaxy(){ const arms=4, spin=5.5, maxR=0.92;
      for(let i=0;i<COUNT;i++){ const t=i/COUNT; const r=Math.pow(t,0.62)*maxR;
        const arm=(i%arms)*(6.283/arms); const scatter=(Math.random()-0.5)*(0.55*(1-t)+0.06);
        const ang=arm + r*spin + scatter;
        tgtA[i*2]=Math.cos(ang)*r/ASPECT; tgtA[i*2+1]=Math.sin(ang)*r; } }
    function setHeart(){ for(let i=0;i<COUNT;i++){ const a=(i/COUNT)*6.283 + (Math.random()-0.5)*0.05;
        const rr=0.018*(0.55+0.45*Math.random());
        let x=16*Math.pow(Math.sin(a),3);
        let y=13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a);
        x*=rr; y*=rr; tgtA[i*2]=x/ASPECT; tgtA[i*2+1]=y+0.04; } }

    /* 阶段（职场特训营主题） */
    const phases=[
      {kind:"text", val:"成长",  poem:"从校园到职场，<br>先完成一次<b>认知升级</b>。"},
      {kind:"text", val:"出发",  poem:"你不是在找一份工作，<br>而是在建立<b>成长能力</b>。"},
      {kind:"galaxy",            poem:"前辈走过的路，<br>是你少走弯路的<b>地图</b>。"},
      {kind:"text", val:"∞",     poem:"让每一次学习，<br>都被<b>沉淀</b>。"},
      {kind:"heart",             poem:"愿你在职场里，<br>被世界<b>温柔以待</b>。"},
      {kind:"text", val:"FCB",   poem:"Future Career Bootcamp<br>站在前人经验之上，继续<b>出发</b>。"},
    ];
    const poemEl=cover.querySelector("#coverPoem");
    const dotsEl=cover.querySelector("#coverDots");
    phases.forEach(()=>{const i=document.createElement("i");dotsEl.appendChild(i);});
    const dotEls=[...dotsEl.children];

    let phase=-1;
    function applyPhase(p){ const ph=phases[p];
      if(ph.kind==="text") setTargetsFromPts(sampleText(ph.val));
      else if(ph.kind==="galaxy") setGalaxy();
      else if(ph.kind==="heart") setHeart();
      poemEl.classList.remove("show");
      setTimeout(()=>{ poemEl.innerHTML=ph.poem; poemEl.classList.add("show"); },500);
      dotEls.forEach((d,i)=>d.classList.toggle("on",i===p)); }
    function nextPhase(){ phase=(phase+1)%phases.length; applyPhase(phase); }
    function prevPhase(){ phase=(phase-1+phases.length)%phases.length; applyPhase(phase); }
    function goPhase(idx){ phase=idx; applyPhase(phase); }
    // 重置自动切换计时器
    function resetAutoTimer(){ startT=performance.now(); }

    /* 交互 */
    const mouse={x:0,y:0,active:false};
    cover.addEventListener("mousemove",e=>{mouse.x=e.clientX/W*2-1; mouse.y=-(e.clientY/H*2-1); mouse.active=true;});
    cover.addEventListener("mouseleave",()=>mouse.active=false);
    cover.addEventListener("touchmove",e=>{const t=e.touches[0];mouse.x=t.clientX/W*2-1;mouse.y=-(t.clientY/H*2-1);mouse.active=true;},{passive:true});
    function explode(cx,cy){ for(let i=0;i<COUNT;i++){ let dx=posA[i*2]-cx, dy=posA[i*2+1]-cy;
        let d=Math.hypot(dx,dy)+0.05; const f=Math.min(0.14, 0.06/d);
        velA[i*2]+=dx/d*f; velA[i*2+1]+=dy/d*f; } }
    cover.addEventListener("click",e=>{ if(!started)return;
      if(e.target.id==="coverGo")return;
      // 点击圆点切换到对应阶段
      if(e.target.parentElement===dotsEl){ const idx=dotEls.indexOf(e.target);
        if(idx>=0){ goPhase(idx); resetAutoTimer(); return; } }
      // 点击箭头切换
      const arrow=e.target.closest(".cv-arrow");
      if(arrow){ if(arrow.dataset.dir==="prev") prevPhase(); else nextPhase(); resetAutoTimer(); return; }
      explode(e.clientX/W*2-1, -(e.clientY/H*2-1)); });

    /* 键盘左右键切换 */
    function onKey(e){ if(!started)return;
      if(e.key==="ArrowLeft"){ prevPhase(); resetAutoTimer(); e.preventDefault(); }
      else if(e.key==="ArrowRight"){ nextPhase(); resetAutoTimer(); e.preventDefault(); } }
    document.addEventListener("keydown",onKey);

    /* 物理 */
    const K=0.018, DAMP=0.90;
    function update(t){ const mx=mouse.x, my=mouse.y;
      for(let i=0;i<COUNT;i++){ const ix=i*2, iy=ix+1; let x=posA[ix], y=posA[iy];
        let ax=(tgtA[ix]-x)*K, ay=(tgtA[iy]-y)*K;
        ax+=Math.sin(y*3.0+t*0.7+seedA[i]*6.0)*0.00045;
        ay+=Math.cos(x*3.0+t*0.6+seedA[i]*6.0)*0.00045;
        if(mouse.active){ const dx=x-mx, dy=y-my; const d2=dx*dx+dy*dy;
          if(d2<0.05){ const d=Math.sqrt(d2)+0.02; const f=0.0016*(1-d2/0.05)/d; ax+=dx*f*60; ay+=dy*f*60; } }
        let vx=(velA[ix]+ax)*DAMP, vy=(velA[iy]+ay)*DAMP;
        velA[ix]=vx; velA[iy]=vy; posA[ix]=x+vx; posA[iy]=y+vy; } }

    /* 渲染循环 */
    gl.disable(gl.DEPTH_TEST); gl.enable(gl.BLEND);
    gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT);
    let started=false, startT=0;
    function frame(now){
      if(killed)return;
      const t=now*0.001;
      if(started){
        update(t);
        gl.bindBuffer(gl.ARRAY_BUFFER,bufPos); gl.bufferSubData(gl.ARRAY_BUFFER,0,posA);
        gl.useProgram(pFade); gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
        gl.bindBuffer(gl.ARRAY_BUFFER,fadeBuf); gl.enableVertexAttribArray(aFadeP);
        gl.vertexAttribPointer(aFadeP,2,gl.FLOAT,false,0,0); gl.uniform1f(uFadeA,0.16); gl.drawArrays(gl.TRIANGLES,0,6);
        gl.useProgram(pPoints); gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
        gl.uniform1f(uTime,t); gl.uniform1f(uPsize, Math.max(1.5, 2.6*DPR));
        gl.bindBuffer(gl.ARRAY_BUFFER,bufPos); gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0);
        gl.bindBuffer(gl.ARRAY_BUFFER,bufCol); gl.enableVertexAttribArray(aCol); gl.vertexAttribPointer(aCol,3,gl.FLOAT,false,0,0);
        gl.bindBuffer(gl.ARRAY_BUFFER,bufSeed); gl.enableVertexAttribArray(aSeed); gl.vertexAttribPointer(aSeed,1,gl.FLOAT,false,0,0);
        gl.drawArrays(gl.POINTS,0,COUNT);
        if(now-startT>5500){ startT=now; nextPhase(); }
      }
      raf=requestAnimationFrame(frame);
    }
    raf=requestAnimationFrame(frame);

    function onResize(){ if(killed)return; resize(); if(phase>=0) applyPhase(phase); }
    addEventListener("resize", onResize, { passive:true });
    if(window.ResizeObserver){ ro=new ResizeObserver(onResize); ro.observe(document.documentElement); }

    /* 进入体验 */
    const enterEl=cover.querySelector("#coverEnter");
    const goBtn=cover.querySelector("#coverGo");
    function begin(){ if(started)return; started=true; startT=performance.now(); nextPhase();
      enterEl.classList.add("gone"); setTimeout(()=>{ if(enterEl.parentNode) enterEl.remove(); },1600);
      setTimeout(()=>goBtn.classList.add("show"),1200);
      setTimeout(()=>{ const arrows=cover.querySelectorAll(".cv-arrow"); arrows.forEach(a=>a.classList.add("show")); },1500); }
    enterEl.addEventListener("click",begin);

    /* 离开封面，进入站点 */
    function dismiss(skipFade){
      sessionStorage.setItem("fcb_entered","1");
      document.documentElement.style.overflow="";
      document.body.style.overflow="";
      removeEventListener("resize", onResize);
      document.removeEventListener("keydown",onKey);
      if(ro) ro.disconnect();
      function teardown(){ killed=true; cancelAnimationFrame(raf); if(cover.parentNode) cover.remove(); }
      if(skipFade){ teardown(); return; }
      cover.classList.add("gone");
      setTimeout(teardown, 1500);
    }
    goBtn.addEventListener("click",(e)=>{ e.stopPropagation(); dismiss(false); });
  }

  /* 对外暴露：首页「重温封面」按钮调用 */
  window.playCover = playCover;

  /* 本会话首次进首页：自动播放一次 */
  if (!sessionStorage.getItem("fcb_entered")) playCover();
})();
