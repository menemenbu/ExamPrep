(() => {
  if (document.getElementById('study-ink-root')) return;

  const viewRoot = document.querySelector('#main, main, .main');
  function getViewKey() {
    const title = viewRoot?.querySelector('h2')?.textContent?.trim() || document.title || 'Ders merkezi';
    const tab = viewRoot?.querySelector('.tabs button.active, [role="tab"][aria-selected="true"]')?.textContent?.trim() || '';
    const identity = `${title}::${tab}`.replace(/\s+/g, ' ');
    return `study-ink-v2:${location.pathname}:${encodeURIComponent(identity)}`;
  }
  let pageKey = getViewKey();
  const root = document.createElement('div');
  root.id = 'study-ink-root';
  root.innerHTML = `
    <canvas class="study-ink-canvas" aria-label="Çizim alanı"></canvas>
    <section class="study-ink-tools" aria-label="Çizim araçları" hidden>
      <div class="study-ink-tools-head"><div><strong>Ekran kalemi</strong><span>Sayfaya çizmek için dokun</span></div><button type="button" data-action="minimize" title="Araç çubuğunu alta al">⌄ Alta al</button></div>
      <div class="study-ink-tool-row">
        <button type="button" data-tool="pen" aria-pressed="true" title="Opak tükenmez kalem">✎ Tükenmez</button>
        <button type="button" data-tool="highlighter" aria-pressed="false" title="Yarı saydam fosforlu kalem">▰ Fosforlu</button>
        <button type="button" data-tool="eraser" aria-pressed="false" title="Silgi">⌫ Silgi</button>
        <div class="study-ink-colors" role="group" aria-label="Renk seç"><span>Renk</span>
          <button type="button" data-color="#e53935" aria-label="Kırmızı" title="Kırmızı" aria-pressed="true" style="--swatch:#e53935"></button>
          <button type="button" data-color="#2563eb" aria-label="Mavi" title="Mavi" aria-pressed="false" style="--swatch:#2563eb"></button>
          <button type="button" data-color="#17966e" aria-label="Yeşil" title="Yeşil" aria-pressed="false" style="--swatch:#17966e"></button>
          <button type="button" data-color="#e6b800" aria-label="Sarı" title="Sarı" aria-pressed="false" style="--swatch:#e6b800"></button>
          <button type="button" data-color="#8b5cf6" aria-label="Mor" title="Mor" aria-pressed="false" style="--swatch:#8b5cf6"></button>
        </div>
      </div>
      <label class="study-ink-size-label">Kalınlık <input type="range" min="2" max="28" value="5" aria-label="Kalem kalınlığı"><output>5 px</output></label>
      <div class="study-ink-tool-row study-ink-actions">
        <button type="button" data-action="undo" title="Geri al">↶ Geri al</button>
        <button type="button" data-action="redo" title="Yinele">↷ Yinele</button>
        <button type="button" data-action="clear" title="Tüm çizimleri temizle">Temizle</button>
      </div>
      <p>Çizim sayfaya kaydedilir. Sayfada gezinmek için kalemi kapat.</p>
    </section>
    <button class="study-ink-toggle" type="button" aria-expanded="false" aria-label="Çizim araçlarını aç" title="Çizim araçlarını aç">✎</button>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #study-ink-root{font:14px/1.35 system-ui,-apple-system,"Segoe UI",sans-serif;color:#17243b}
    .study-ink-canvas{position:fixed;inset:0;width:100vw;height:100vh;z-index:2147482998;pointer-events:none;touch-action:none}
    .study-ink-tools{position:fixed;z-index:2147483000;left:12px;bottom:calc(66px + env(safe-area-inset-bottom,0px));width:min(360px,calc(100vw - 24px));padding:13px;border:1px solid #dce3ed;border-radius:15px;background:#fff;box-shadow:0 12px 36px #16233b30}
    .study-ink-tools[hidden]{display:none}
    .study-ink-tools-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}
    .study-ink-tools-head>div{display:flex;flex-direction:column;gap:2px}.study-ink-tools-head button{min-height:34px;padding:5px 8px;white-space:nowrap}
    .study-ink-tools-head strong{font-size:15px}.study-ink-tools-head span,.study-ink-tools p{font-size:12px;color:#62718a}
    .study-ink-tool-row{display:flex;gap:7px;align-items:center;flex-wrap:wrap}
    .study-ink-tools button,.study-ink-color-label{min-height:40px;padding:7px 10px;border:1px solid #dce3ed;border-radius:9px;background:#fff;color:#17243b;font:inherit;font-weight:700}
    .study-ink-tools button[data-tool][aria-pressed="true"]{border-color:#7183e5;background:#eef1ff;color:#344bbd}
    .study-ink-colors{display:flex;align-items:center;gap:6px;padding-left:3px;font-size:13px;font-weight:700}
    .study-ink-tools button[data-color]{width:40px;height:40px;min-height:40px;padding:0;border:2px solid transparent;border-radius:50%;background:transparent;box-shadow:none;display:grid;place-items:center;flex:none}
    .study-ink-tools button[data-color]::after{content:"";display:block;width:24px;height:24px;border-radius:50%;background:var(--swatch);box-shadow:0 0 0 1px #bbc5d3}
    .study-ink-tools button[data-color][aria-pressed="true"]{border-color:#344fc8}
    .study-ink-size-label{display:flex;align-items:center;gap:8px;margin:10px 1px;font-size:13px;font-weight:700}.study-ink-size-label input{flex:1;min-width:80px;accent-color:#5269df}.study-ink-size-label output{min-width:40px;color:#62718a;text-align:right}
    .study-ink-actions{border-top:1px solid #e7ebf1;padding-top:9px}.study-ink-tools p{margin:9px 1px 0}
    .study-ink-toggle{position:fixed;z-index:2147483001;left:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));display:grid;place-items:center;width:48px;height:48px;border:0;border-radius:50%;background:#344fc8;color:white;box-shadow:0 5px 18px #15234d55;font:26px/1 system-ui;cursor:pointer;touch-action:manipulation}
    .study-ink-toggle[aria-expanded="true"]{background:#172742}.study-ink-toggle:focus-visible,.study-ink-tools button:focus-visible{outline:3px solid #9baaff;outline-offset:2px}
    @media(max-width:480px){.study-ink-tools{left:9px;bottom:calc(64px + env(safe-area-inset-bottom,0px));width:calc(100vw - 18px);padding:11px}.study-ink-toggle{left:10px;bottom:calc(10px + env(safe-area-inset-bottom,0px));width:50px;height:50px}.study-ink-tools button{min-height:44px}}
  `;
  document.head.append(style);
  document.body.append(root);

  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const tools = root.querySelector('.study-ink-tools');
  const toggle = root.querySelector('.study-ink-toggle');
  const sizeInput = root.querySelector('input[type="range"]');
  const sizeOutput = root.querySelector('output');
  let actions = [];
  let redoActions = [];
  let active = false;
  let minimized = false;
  let tool = 'pen';
  let color = '#e53935';
  let currentStroke = null;
  let dpr = 1;
  const toolSizes = { pen: 5, highlighter: 17, eraser: 20 };

  try {
    const saved = JSON.parse(localStorage.getItem(pageKey) || '[]');
    if (Array.isArray(saved)) actions = saved;
  } catch (_) {}

  function loadView(nextKey) {
    if (nextKey === pageKey) return;
    pageKey = nextKey;
    try {
      const saved = JSON.parse(localStorage.getItem(pageKey) || '[]');
      actions = Array.isArray(saved) ? saved : [];
    } catch (_) { actions = []; }
    redoActions = [];
    currentStroke = null;
    redraw();
    updateUndoButtons();
  }

  function scrollOffset() {
    return { x: window.scrollX || 0, y: window.scrollY || 0 };
  }

  function resizeCanvas() {
    const offset = scrollOffset();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw(offset);
  }

  function drawStroke(stroke, offset) {
    const points = stroke.points || [];
    if (!points.length) return;
    ctx.save();
    ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.globalAlpha = stroke.tool === 'highlighter' ? 0.34 : 1;
    ctx.strokeStyle = stroke.color || '#e53935';
    ctx.fillStyle = stroke.color || '#e53935';
    ctx.lineWidth = stroke.size || 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (points.length === 1) {
      ctx.beginPath();
      ctx.arc(points[0].x - offset.x, points[0].y - offset.y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(points[0].x - offset.x, points[0].y - offset.y);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x - offset.x, points[i].y - offset.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function redraw(offset = scrollOffset()) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const action of actions) {
      if (action.type === 'clear') ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      else drawStroke(action, offset);
    }
    if (currentStroke) drawStroke(currentStroke, offset);
  }

  function save() {
    try { localStorage.setItem(pageKey, JSON.stringify(actions.slice(-1800))); } catch (_) {}
  }

  function updateUndoButtons() {
    root.querySelector('[data-action="undo"]').disabled = actions.length === 0;
    root.querySelector('[data-action="redo"]').disabled = redoActions.length === 0;
    root.querySelectorAll('[data-action="undo"],[data-action="redo"]').forEach(button => {
      button.style.opacity = button.disabled ? '.48' : '1';
    });
  }

  function setActive(value) {
    active = value;
    if (!active) minimized = false;
    tools.hidden = !active || minimized;
    canvas.style.pointerEvents = active ? 'auto' : 'none';
    toggle.setAttribute('aria-expanded', String(active && !minimized));
    toggle.textContent = active && minimized ? '⌃' : '✎';
    toggle.setAttribute('aria-label', active && minimized ? 'Çizim araçlarını göster' : active ? 'Çizimi kapat' : 'Çizim araçlarını aç');
    toggle.title = active && minimized ? 'Araç çubuğunu göster' : active ? 'Çizimi kapat ve sayfayla etkileş' : 'Çizim araçlarını aç';
    if (!active) currentStroke = null;
    redraw();
  }

  function setMinimized(value) {
    if (!active) return;
    minimized = value;
    tools.hidden = minimized;
    toggle.setAttribute('aria-expanded', String(!minimized));
    toggle.textContent = minimized ? '⌃' : '✎';
    toggle.setAttribute('aria-label', minimized ? 'Çizim araçlarını göster' : 'Çizimi kapat');
    toggle.title = minimized ? 'Araç çubuğunu göster' : 'Çizimi kapat ve sayfayla etkileş';
  }

  function pointFromEvent(event) {
    const offset = scrollOffset();
    return { x: event.clientX + offset.x, y: event.clientY + offset.y };
  }

  canvas.addEventListener('pointerdown', event => {
    if (!active || event.button !== 0 && event.pointerType === 'mouse') return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    const point = pointFromEvent(event);
    currentStroke = { tool, color, size: Number(sizeInput.value), points: [point] };
    redraw();
  });
  canvas.addEventListener('pointermove', event => {
    if (!currentStroke) return;
    const point = pointFromEvent(event);
    const last = currentStroke.points[currentStroke.points.length - 1];
    if (Math.hypot(point.x - last.x, point.y - last.y) < 1.5) return;
    currentStroke.points.push(point);
    redraw();
  });
  function finishStroke() {
    if (!currentStroke) return;
    actions.push(currentStroke);
    currentStroke = null;
    redoActions = [];
    save();
    updateUndoButtons();
    redraw();
  }
  canvas.addEventListener('pointerup', finishStroke);
  canvas.addEventListener('pointercancel', finishStroke);
  canvas.addEventListener('lostpointercapture', finishStroke);
  window.addEventListener('scroll', () => redraw(), { passive: true });
  window.addEventListener('resize', resizeCanvas);
  if (viewRoot) {
    let viewChangeQueued = false;
    new MutationObserver(() => {
      if (viewChangeQueued) return;
      viewChangeQueued = true;
      requestAnimationFrame(() => { viewChangeQueued = false; loadView(getViewKey()); });
    }).observe(viewRoot, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['class', 'aria-selected'] });
  }

  toggle.addEventListener('click', () => {
    if (active && minimized) setMinimized(false);
    else setActive(!active);
  });
  root.querySelector('[data-action="minimize"]').addEventListener('click', () => setMinimized(true));
  root.querySelectorAll('[data-tool]').forEach(button => button.addEventListener('click', () => {
    toolSizes[tool] = Number(sizeInput.value);
    tool = button.dataset.tool;
    sizeInput.value = String(toolSizes[tool]);
    sizeOutput.value = `${sizeInput.value} px`;
    root.querySelectorAll('[data-tool]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  }));
  root.querySelectorAll('[data-color]').forEach(button => button.addEventListener('click', () => {
    color = button.dataset.color;
    root.querySelectorAll('[data-color]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  }));
  sizeInput.addEventListener('input', () => { sizeOutput.value = `${sizeInput.value} px`; toolSizes[tool] = Number(sizeInput.value); });
  root.querySelector('[data-action="undo"]').addEventListener('click', () => {
    if (!actions.length) return;
    redoActions.push(actions.pop()); save(); redraw(); updateUndoButtons();
  });
  root.querySelector('[data-action="redo"]').addEventListener('click', () => {
    if (!redoActions.length) return;
    actions.push(redoActions.pop()); save(); redraw(); updateUndoButtons();
  });
  root.querySelector('[data-action="clear"]').addEventListener('click', () => {
    if (!actions.length || actions[actions.length - 1].type === 'clear') return;
    actions.push({ type: 'clear' }); redoActions = []; save(); redraw(); updateUndoButtons();
  });
  window.addEventListener('keydown', event => {
    if (!active) return;
    const target = event.target;
    if (target && /INPUT|TEXTAREA|SELECT/.test(target.tagName)) return;
    if (event.key === 'Escape') setActive(false);
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      root.querySelector(event.shiftKey ? '[data-action="redo"]' : '[data-action="undo"]').click();
    }
  });

  resizeCanvas();
  updateUndoButtons();
  setActive(false);
})();
