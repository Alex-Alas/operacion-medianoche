/* =====================================================================
   [5] MOTOR DEL JUEGO: estado, pensamientos, inventario, objetivos,
   diálogos, libreta, primeros planos, encuadre, entrada y guardado.
   Lo propio de cada capítulo vive en cap1.js y cap2.js, que se registran
   en CAPS con sus ganchos (escena, zonas de clic, objetivos, libreta…).
   ===================================================================== */
const S = {
  started: false, t0: 0, cap: 1, items: ['libreta'], sel: null, fresh: new Set(),
  clues: { luna: false, ojo: false, ancla: false },
  seen: {},           // calendar, photo, photoBack, plate, mail, cabLocked, paintingLook…
  f: { drawerTries: 0, drawerOpen: false, uvTaken: false, straight: false, cabOpen: false, pcOn: false, logged: false,
       wrongPass: 0, wrongSafe: 0, ringing: false, phoneDone: false, safeOpen: false, docTaken: false, photoSeen: false },
  odd: new Set(), cu: null, ended: false, drums: [0, 0, 0],
  hints: 0,           // veces que pensó (los dos capítulos)
  busy: false,        // secuencia guionada en curso: no se aceptan clics en la escena
};
const CAPS = {};
const CAP = () => CAPS[S.cap];
const ITEMS = {
  libreta:    { name: 'Libreta',            use: false },
  uv:         { name: 'Linterna UV',        use: true },
  llave:      { name: 'Llave pequeña',      use: true },
  foto:       { name: 'Foto de Tango',      use: false },
  expediente: { name: 'Expediente NOCTUA',  use: false },
};
const has = k => S.items.includes(k);
const wait = ms => new Promise(r => setTimeout(r, window.__game?.fast ? Math.min(ms, 60) : ms));

/* ---------- Pensamientos (caja inferior, máquina de escribir) ---------- */
const Thought = (() => {
  let queue = [], typing = null, full = '', timer = null;
  const box = $('#thoughtText'), more = $('#thoughtMore');
  function show(line) {
    clearInterval(typing); clearTimeout(timer);
    full = line; let i = 0; box.textContent = '';
    typing = setInterval(() => {
      i += 2; box.textContent = full.slice(0, i);
      if (i % 6 === 0) Sfx.tick();
      if (i >= full.length) { clearInterval(typing); typing = null; done(); }
    }, 26);
    more.hidden = queue.length === 0;
  }
  function done() {
    box.textContent = full; more.hidden = queue.length === 0;
    if (queue.length) timer = setTimeout(next, 1400 + full.length * 38);
  }
  function next() {
    if (typing) { clearInterval(typing); typing = null; done(); return; }
    if (queue.length) show(queue.shift());
  }
  return {
    say(lines) { queue = [].concat(lines); show(queue.shift()); },
    next,
  };
})();
const think = l => Thought.say(l);

/* ---------- Avisos (sello de «pista obtenida») ---------- */
let toastT = null;
function toast(main, sub = '') {
  const t = $('#toast'); t.innerHTML = main + (sub ? `<small>${sub}</small>` : '');
  t.classList.remove('on'); void t.offsetWidth; t.classList.add('on'); Sfx.stamp();
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2300);
}

/* ---------- Cursores (SVG en línea) ---------- */
function cursorUrl(svg, hx = 16, hy = 16, fb = 'auto') { return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${hx} ${hy}, ${fb}`; }
const CUR = {
  idle: cursorUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="7" fill="none" stroke="#e8dcc2" stroke-width="4"/><circle cx="16" cy="16" r="7" fill="none" stroke="#150e1b" stroke-width="2"/><circle cx="16" cy="16" r="1.6" fill="#150e1b"/></svg>`, 16, 16, 'crosshair'),
  look: cursorUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><path d="M19 19l9 9" stroke="#150e1b" stroke-width="7" stroke-linecap="round"/><path d="M19 19l9 9" stroke="#b08a4a" stroke-width="3.5" stroke-linecap="round"/><circle cx="12" cy="12" r="9" fill="#cfe9ee" fill-opacity=".35" stroke="#150e1b" stroke-width="4"/><circle cx="12" cy="12" r="9" fill="none" stroke="#e8dcc2" stroke-width="1.5"/></svg>`, 12, 12, 'pointer'),
  uv: cursorUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="11" fill="#c98bff" fill-opacity=".25" stroke="#150e1b" stroke-width="4"/><circle cx="16" cy="16" r="11" fill="none" stroke="#e6c8ff" stroke-width="2"/><circle cx="16" cy="16" r="2" fill="#fff"/></svg>`, 16, 16, 'crosshair'),
  llave: cursorUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="9" cy="9" r="6" fill="#b08a4a" stroke="#150e1b" stroke-width="3"/><path d="M13 13l14 14M22 22l-4 4M26 26l-3 3" stroke="#150e1b" stroke-width="6" stroke-linecap="round"/><path d="M13 13l14 14M22 22l-4 4" stroke="#ecc97f" stroke-width="2.5" stroke-linecap="round"/></svg>`, 4, 4, 'pointer'),
};
function applyCursor() {
  const app = $('#app'), sel = S.sel;
  app.style.setProperty('--cur-default', sel ? CUR[sel] : CUR.idle);
  app.style.setProperty('--cur-hot', sel ? CUR[sel] : CUR.look);
  app.classList.toggle('using', !!sel);
  app.classList.toggle('uv', sel === 'uv');
  for (const id of ['#lvUV', '#cuUV']) { const g = $(id); if (g) g.style.display = sel === 'uv' ? '' : 'none'; }
}
function deselect() { if (S.sel) { S.sel = null; applyCursor(); renderInv(); } }

/* ---------- Inventario ---------- */
function renderInv() {
  const inv = $('#inv'); inv.innerHTML = '';
  const slots = Math.max(5, S.items.length);
  for (let i = 0; i < slots; i++) {
    const k = S.items[i], b = document.createElement('button');
    b.className = 'slot' + (k ? ' full' : '') + (k && S.sel === k ? ' sel' : '');
    if (k) {
      b.innerHTML = iconSvg(k) + (S.fresh.has(k) ? '<span class="new">NUEVO</span>' : '');
      b.title = ITEMS[k].name; b.setAttribute('aria-label', ITEMS[k].name);
      b.onclick = e => { e.stopPropagation(); clickItem(k); };
      b.onpointerenter = e => showTag(ITEMS[k].name, e); b.onpointerleave = hideTag;
    } else b.disabled = true;
    inv.appendChild(b);
  }
}
function addItem(k, silent) {
  if (has(k)) return;
  S.items.push(k); S.fresh.add(k); renderInv(); renderObjectives();
  if (!silent) { Sfx.pickup(); toast('OBTIENES', ITEMS[k].name.toUpperCase()); }
}
function dropItem(k) {
  S.items = S.items.filter(x => x !== k); S.fresh.delete(k);
  if (S.sel === k) { S.sel = null; applyCursor(); }
  renderInv();
}
function clickItem(k) {
  if (S.busy) return;
  Sfx.click(); S.fresh.delete(k);
  if (k === 'libreta') { openNotebook(); renderInv(); return; }
  if (CAP().useItem?.(k)) { renderInv(); return; }       // objetos que se miran, no se usan sobre la escena
  S.sel = S.sel === k ? null : k;
  if (S.sel) { const l = CAP().selLine?.(k); if (l) think(l); }
  applyCursor(); renderInv();
}

/* ---------- Objetivos ---------- */
function renderObjectives() {
  const L = CAP().objectives();
  // Los dos primeros siempre se ven; los secundarios cumplidos se retiran para no saturar la caja
  $('#objList').innerHTML = L.filter((o, i) => i < 2 || !o.done).map(o => `<li class="${o.done ? 'done' : ''}${o.main ? ' main' : ''}">${o.t}</li>`).join('');
  $('#clueCount').textContent = CAP().counter?.() ?? '';
}

/* ---------- Rarezas (detalles opcionales que no cuadran) ----------
   Cada capítulo aporta las suyas: ODD (cap. 1) y ODD2 (cap. 2). */
const oddKeys = () => Object.keys(ODD).concat(S.cap >= 2 ? Object.keys(ODD2) : []);
const oddText = k => ODD[k] ?? ODD2[k];
function noteOdd(k) { if (!S.odd.has(k)) { S.odd.add(k); setTimeout(() => Sfx.sting(), 300); } }

/* ---------- Diálogos con retrato (estilo aventura gráfica) ---------- */
const Dialog = (() => {
  let resolveFn = null, lines = [], typing = null, full = '', flap = null, cur = null;
  const ov = $('#dialog'), txt = $('#dlgText'), por = $('#dlgPortrait'), name = $('#dlgName');
  function face(open) {
    if (!cur || cur.who !== 'control') return;
    por.innerHTML = portraitControl(cur.mood, open) + '<span class="lbl">COMUNICADOR</span>';
  }
  function show(l) {
    cur = l; ov.classList.toggle('static', l.who !== 'control');
    name.textContent = l.who === 'control' ? 'CONTROL' : (l.name || '???');
    if (l.who === 'control') face(false); else por.innerHTML = portraitStatic(l.screen) + `<span class="lbl">${l.lbl || 'LÍNEA 3'}</span>`;
    full = l.text; let i = 0; txt.textContent = '';
    clearInterval(typing); clearInterval(flap);
    let o = false; flap = setInterval(() => face(o = !o), 120);
    typing = setInterval(() => {
      i += 1; txt.textContent = full.slice(0, i);
      if (i % 3 === 0) Sfx.tick();
      if (i >= full.length) finish();
    }, window.__game?.fast ? 0 : 22);
  }
  function finish() { clearInterval(typing); clearInterval(flap); typing = null; txt.textContent = full; face(false); }
  function advance() {
    if (typing) { finish(); return; }
    if (lines.length) { show(lines.shift()); return; }
    ov.classList.remove('on'); const r = resolveFn; resolveFn = null; r && r();
  }
  ov.addEventListener('click', e => { e.stopPropagation(); Sfx.click(); advance(); });
  return {
    get open() { return !!resolveFn; },
    advance,
    say(ls) {
      return new Promise(res => {
        if (window.__game?.fast) { res(); return; }
        lines = ls.slice(); resolveFn = res; ov.classList.add('on'); Sfx.radio(); show(lines.shift());
      });
    },
  };
})();
const C = (text, mood = 'neutral') => ({ who: 'control', text, mood });
const X = text => ({ who: 'x', text });

/* ---------- Libreta del agente ----------
   Cada capítulo da sus pestañas (nbTabs/nbPage); RAREZAS es común y
   NOTAS (texto libre del jugador, guardado en el navegador) es del cap. 2. */
let nbTab = null;
function openNotebook(tab) { if (tab) nbTab = tab; renderNotebook(); $('#notebook').classList.add('on'); }
function closeNotebook() { $('#notebook').classList.remove('on'); }
const nbOpen = () => $('#notebook').classList.contains('on');
function renderNotebook() {
  const tabs = CAP().nbTabs().concat([['rarezas', 'RAREZAS']], S.cap >= 2 ? [['notas', 'NOTAS']] : []);
  if (!tabs.some(t => t[0] === nbTab)) nbTab = tabs[0][0];
  $('#nbTabs').innerHTML = tabs.map(([k, l]) => `<button data-k="${k}" class="${k === nbTab ? 'on' : ''}">${l}</button>`).join('');
  $$('#nbTabs button').forEach(b => b.onclick = () => { Sfx.click(); nbTab = b.dataset.k; renderNotebook(); });
  const pg = $('#nbPage');
  if (nbTab === 'rarezas') {
    const keys = oddKeys();
    let h = `<div class="sub">COSAS QUE NO CUADRAN · ${keys.filter(k => S.odd.has(k)).length}/${keys.length}</div><h2>Rarezas</h2><div class="txt"><ol>`;
    for (const k of keys) h += `<li>${S.odd.has(k) ? oddText(k) : '<span style="opacity:.5">¿…?</span>'}</li>`;
    pg.innerHTML = h + `</ol></div>`;
  } else if (nbTab === 'notas') {
    pg.innerHTML = `<div class="sub">NOTAS PROPIAS · SE GUARDAN SOLAS</div><h2>Lo que pienso</h2><textarea id="nbNotes" spellcheck="false" placeholder="Escribe aquí lo que quieras recordar…"></textarea>`;
    const ta = $('#nbNotes'); ta.value = Save.notes();
    ta.addEventListener('input', () => Save.notes(ta.value));
  } else pg.innerHTML = CAP().nbPage(nbTab);
}
const nbNone = h => `<div class="txt" style="opacity:.7">Sin datos todavía.<br>${h}</div>`;

/* ---------- Etiqueta flotante sobre lo que se puede tocar ---------- */
const once = k => (S.seen[k] ? false : (S.seen[k] = true));
const tag = $('#hoverTag');
function showTag(text, e) { tag.textContent = text; tag.classList.add('on'); moveTag(e); }
function moveTag(e) { tag.style.left = e.clientX + 'px'; tag.style.top = e.clientY + 'px'; }
function hideTag() { tag.classList.remove('on'); }

/* ---------- Escena principal: cada capítulo resuelve sus zonas de clic ---------- */
function onHot(id) {
  if (Dialog.open || S.ended || S.busy) return;
  CAP().onHot(id);
}
// Monta las capas de la escena del capítulo actual y vuelve a enlazar sus zonas de clic
function setScene() {
  CAP().build();
  motes.length = 0;
  $('#scene').setAttribute('aria-label', CAP().label);
  bindHots($('#scene'), onHot);
  applyCursor(); layout();
}

/* ---------- Primeros planos ----------
   Cada uno es otra «pantalla estática» de 1600×900 con sus zonas de clic.
   Si define uv(), lleva además una capa de tinta invisible bajo la linterna. */
const bakedCU = {};
const cuBake = (key, fn) => bakedCU[key] || (bakedCU[key] = bake(fn(), { x: -40, y: -40, w: 1680, h: 980, amp: 3.6, cu: true }));
const hotPath = (id, name, pts) => `<path class="hot" data-id="${id}" data-name="${name}" tabindex="0" role="button" aria-label="${name}" d="M${pts.map(p => p.join(' ')).join('L')}Z"/>`;
const box = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const CU = {};
const cuUVLayer = inner => `<g id="cuUV" style="display:none;pointer-events:none">
    <mask id="cuUVMask" maskUnits="userSpaceOnUse" x="-40" y="-40" width="1680" height="980"><rect x="-40" y="-40" width="1680" height="980" fill="#000"/><circle id="cuSpot" cx="-500" cy="-500" r="190" fill="url(#gUVspot)"/></mask>
    <rect x="-40" y="-40" width="1680" height="980" fill="#12051f" opacity=".45"/>
    <circle id="cuBeam" cx="-500" cy="-500" r="230" fill="#8f52ff" opacity=".22" filter="url(#glowSoft)"/>
    <g mask="url(#cuUVMask)" filter="url(#glowUV)">${inner}</g></g>`;

function openCloseup(key) {
  S.cu = key; hideTag(); $('#closeup').classList.add('on'); renderCloseup(); layout(); CU[key].enter?.();
}
function closeCloseup() { S.cu = null; $('#closeup').classList.remove('on'); $('#cuHtml').innerHTML = ''; hideTag(); }
function renderCloseup() {
  const c = CU[S.cu]; if (!c) return;
  $('#cuTitle').textContent = c.title; $('#cuSvg').innerHTML = c.svg() + (c.uv ? cuUVLayer(c.uv()) : ''); hydrate($('#cuSvg')); $('#cuHtml').innerHTML = ''; c.html?.();
  bindHots($('#cuSvg'), id => { if (Dialog.open || S.busy) return; Sfx.click(); c.hot[id]?.(); });
  applyCursor();
}
const regCU = defs => { for (const k in defs) { defs[k].render = () => renderCloseup(); CU[k] = defs[k]; } };
function turnDrum(i, d) { S.drums[i] = (S.drums[i] + d + 100) % 100; $('#drum' + i).textContent = String(S.drums[i]).padStart(2, '0'); Sfx.dial(); }

/* ---------- Pensar (pista según el avance; cada capítulo decide cuál y cuánto cuesta) ---------- */
function hintNow() { if (S.busy || S.ended) return; S.hints++; CAP().hint(); }

/* ---------- Ambiente vivo: relámpagos y motas (lo demás lo anima cada capítulo) ---------- */
function lightning(k = 1) {
  const fl = $('#flash'), sky = $('#skyFlash');
  const pulse = (o, d) => { fl.style.transition = 'none'; fl.style.opacity = o; sky?.setAttribute('opacity', o * 1.6); setTimeout(() => { fl.style.transition = `opacity ${d}ms`; fl.style.opacity = 0; sky?.setAttribute('opacity', 0); }, 60); };
  pulse(0.35 * k, 220); setTimeout(() => pulse(0.22 * k, 600), 180);
  setTimeout(() => Sfx.thunder(), 700 + Math.random() * 900);
}
function scheduleLightning() { setTimeout(() => { if (S.started && !S.ended && !S.busy) lightning(CAP().lightning ?? 1); scheduleLightning(); }, 22000 + Math.random() * 26000); }
const motes = [];
let lastT = 0;
function loop(t) {
  const dt = Math.min(0.05, (t - lastT) / 1000 || 0); lastT = t;
  CAP().tick?.(t, dt);
  // Motas de polvo en el haz de luz (~20 Hz: flotan lento)
  if (t - (loop.moteT || 0) > 50) {
    const mdt = (t - (loop.moteT || t)) / 1000; loop.moteT = t;
    if (!motes.length) $$('.mote').forEach(m => motes.push({ m, x: +m.getAttribute('cx'), y: +m.getAttribute('cy'), s: 3 + Math.random() * 6, p: Math.random() * 6 }));
    for (const o of motes) { o.y -= o.s * mdt; o.x += Math.sin(t / 1800 + o.p) * 6 * mdt; if (o.y < 220) o.y = 860; o.m.setAttribute('cx', o.x.toFixed(1)); o.m.setAttribute('cy', o.y.toFixed(1)); }
  }
  requestAnimationFrame(loop);
}

/* ---------- Linterna UV: la mancha de luz sigue al puntero ---------- */
function toScene(svg, e) { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); }
function moveUV(e) {
  if (S.sel !== 'uv' || !$('#uvSpot')) return;
  const p = toScene($('#scene'), e);
  for (const id of ['uvSpot', 'uvBeam']) { const c = $('#' + id); c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); }
}
function moveUVcu(e) {
  if (S.sel !== 'uv' || !$('#cuSpot')) return;
  const p = toScene($('#cuSvg'), e);
  for (const id of ['cuSpot', 'cuBeam']) { const c = $('#' + id); c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); }
  CU[S.cu]?.uvAt?.(p.x, p.y);
}

/* ---------- Encuadre: la cámara no se mueve, pero el marco se adapta ---------- */
const SAFE_BOX = { x0: 150, x1: 1450, y0: 100, y1: 815 };     // zona que siempre debe verse
function layout() {
  const st = $('#stage').getBoundingClientRect(), a = st.width / Math.max(1, st.height);
  let vw = 1600, vh = 1600 / a;
  if (vh > 900) { vh = 900; vw = 900 * a; }
  if (vh < SAFE_BOX.y1 - SAFE_BOX.y0) { vh = SAFE_BOX.y1 - SAFE_BOX.y0; vw = vh * a; }
  if (vw < SAFE_BOX.x1 - SAFE_BOX.x0) { vw = SAFE_BOX.x1 - SAFE_BOX.x0; vh = vw / a; }
  const cy = clamp(450, SAFE_BOX.y1 - vh / 2, SAFE_BOX.y0 + vh / 2);
  const vb = `${f1(800 - vw / 2)} ${f1(cy - vh / 2)} ${f1(vw)} ${f1(vh)}`;
  $$('.lay').forEach(s => s.setAttribute('viewBox', vb));
  const fw = Math.min(st.width * 0.97, st.height * 0.95 * 16 / 9), fr = $('#cuFrame');
  fr.style.width = fw + 'px'; fr.style.height = fw * 9 / 16 + 'px';
  $('#rotateHint').classList.toggle('on', innerHeight > innerWidth && innerWidth < 640 && !S.rotateOk);
}

/* ---------- Enlaces de entrada ---------- */
function bindHots(root, fn) {
  $$('.hot', root).forEach(h => {
    h.addEventListener('click', e => { e.stopPropagation(); moveUV(e); moveUVcu(e); fn(h.dataset.id); });
    h.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(h.dataset.id); } });
    h.addEventListener('pointerenter', e => showTag(h.dataset.name, e));
    h.addEventListener('pointermove', moveTag);
    h.addEventListener('pointerleave', hideTag);
  });
}
function bindUI() {
  $('#scene').addEventListener('pointermove', moveUV);
  $('#scene').addEventListener('pointerdown', moveUV);
  $('#cuSvg').addEventListener('pointermove', moveUVcu);
  $('#cuSvg').addEventListener('pointerdown', moveUVcu);
  $('#scene').addEventListener('click', () => { if (S.sel && !Dialog.open) deselect(); });
  addEventListener('pointerdown', () => { S.lastAct = performance.now(); }, true);
  $('#thoughts').onclick = () => Thought.next();
  $('#cuBack').onclick = e => { e.stopPropagation(); if (S.busy) return; Sfx.click(); closeCloseup(); };
  $('#closeup').addEventListener('click', e => { if (e.target.id === 'closeup' && !S.busy) closeCloseup(); });
  $('#nbClose').onclick = () => { Sfx.click(); closeNotebook(); };
  $('#notebook').addEventListener('click', e => { if (e.target.id === 'notebook') closeNotebook(); });
  $('#btnBook').onclick = () => { Sfx.click(); openNotebook(); };
  $('#btnHint').onclick = () => { Sfx.click(); hintNow(); };
  $('#btnMute').onclick = () => toggleMute();
  $('#btnRotateAnyway').onclick = () => { S.rotateOk = true; layout(); };
  addEventListener('resize', layout);
  addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    S.lastAct = performance.now();
    if (Dialog.open && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); Dialog.advance(); return; }
    if (e.key === 'Escape') { if (nbOpen()) closeNotebook(); else if (S.cu && !S.busy) closeCloseup(); else deselect(); }
    if (e.key === 'n' || e.key === 'N') { nbOpen() ? closeNotebook() : openNotebook(); }
    if (e.key === 'm' || e.key === 'M') toggleMute();
  });
}
function toggleMute() {
  Sfx.setMuted(!Sfx.muted);
  $('#muteIco').setAttribute('d', Sfx.muted ? 'M4 9h4l5-4v14l-5-4H4zM17 9l5 6M22 9l-5 6' : 'M4 9h4l5-4v14l-5-4H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11');
}

/* ---------- Fundido a negro (cambios de escena) ---------- */
function fade(on) { $('#fade').classList.toggle('on', on); return wait(850); }

/* ---------- Guardado en el navegador ----------
   Solo se guarda al llegar al cap. 2 (y las notas de la libreta). Si el
   navegador no deja guardar, el juego sigue igual, sin «Continuar». */
const Save = {
  KEY: 'operacion-medianoche.partida.v1', NOTES: 'operacion-medianoche.notas.v1',
  read() { try { return JSON.parse(localStorage.getItem(this.KEY) || 'null'); } catch { return null; } },
  write(d) { try { localStorage.setItem(this.KEY, JSON.stringify(d)); } catch {} },
  notes(v) {
    try {
      if (v === undefined) return localStorage.getItem(this.NOTES) || '';
      localStorage.setItem(this.NOTES, v);
    } catch { return ''; }
  },
};

/* ---------- Informe final (cubre los dos capítulos) ---------- */
const mmss = ms => { const t = Math.round(ms / 1000); return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; };
const plural = (n, a, b) => `${n} ${n === 1 ? a : b}`;
function showEnding() {
  const r = S.report, keys = oddKeys(), odd = keys.filter(k => S.odd.has(k));
  $('#endSheet').innerHTML = `
    <div class="stamp" style="right:24px;top:30px">RECUPERADO</div>
    <div class="kicker">SECCIÓN OCASO · INFORME DE MISIÓN · EXPEDIENTE 07</div>
    <h1>OPERACIÓN<br>MEDIANOCHE</h1>
    <div class="field">
      <b>Agente:</b><span class="hand">«Polilla»</span>
      <b>Objetivo:</b><span>Expediente NOCTUA — recuperado</span>
      <b>Cap. 1:</b><span>La oficina · ${r.t1} · ${plural(r.wrongPass, 'clave errada', 'claves erradas')} · ${plural(r.wrongSafe, 'intento', 'intentos')} en la caja</span>
      <b>Cap. 2:</b><span>La recepción · ${r.t2} · ${plural(r.errFus, 'fusible quemado', 'fusibles quemados')} · ${plural(r.errCand, 'clave errada', 'claves erradas')} en el candado · ${plural(r.errTarj, 'tarjeta rechazada', 'tarjetas rechazadas')}</span>
      <b>Pensaste:</b><span>${plural(S.hints, 'vez', 'veces')}</span>
      <b>Apagones:</b><span>${r.blackouts}</span>
      <b>Rarezas:</b><span>${odd.length}/${keys.length} anotadas</span>
    </div>
    ${odd.length ? `<ul>${odd.map(k => `<li>${oddText(k)}</li>`).join('')}</ul>` : ''}
    <p class="hand" style="font-size:18px;color:#5b1f2e">«El registro de la puerta acaba de actualizarse: una salida, la tuya, a las ${r.salida}. Y una entrada nueva. A las 23:47.» — Control</p>
    <p style="font-weight:bold;letter-spacing:.2em">FIN DEL CAPÍTULO 2</p>
    <div class="row"><button class="btn" id="btnAgain">VOLVER A JUGAR</button><button class="btn ghost" id="btnAgain2">REPETIR CAP. 2</button></div>`;
  $('#ending').classList.add('on'); Sfx.stamp();
  $('#btnAgain').onclick = () => { location.href = location.pathname; };
  $('#btnAgain2').onclick = () => { location.href = location.pathname + '?cap=2'; };
}
