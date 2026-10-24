/* =====================================================================
   [5] ESTADO, GUION Y HUD (pensamientos, inventario, objetivos, libreta)
   ===================================================================== */
const S = {
  started: false, t0: 0, items: ['libreta'], sel: null, fresh: new Set(),
  clues: { luna: false, ojo: false, ancla: false },
  seen: {},           // calendar, photo, photoBack, plate, mail, cabLocked, paintingLook…
  f: { drawerTries: 0, drawerOpen: false, uvTaken: false, straight: false, cabOpen: false, pcOn: false, logged: false,
       wrongPass: 0, wrongSafe: 0, ringing: false, phoneDone: false, safeOpen: false, docTaken: false, photoSeen: false },
  odd: new Set(), cu: null, ended: false, drums: [0, 0, 0],
};
const ANSWER = [14, 23, 31];             // luna (día del cierre) · ojo (23 rayas) · ancla (XXXI)
const CLUE_NAMES = { luna: 'LUNA', ojo: 'OJO', ancla: 'ANCLA' };
const ITEMS = {
  libreta:    { name: 'Libreta',            use: false },
  uv:         { name: 'Linterna UV',        use: true },
  llave:      { name: 'Llave pequeña',      use: true },
  foto:       { name: 'Foto de Tango',      use: false },
  expediente: { name: 'Expediente NOCTUA',  use: false },
};
// Rarezas: detalles opcionales que no cuadran (se anotan en la libreta y en el informe)
const ODD = {
  abrigo:  'El abrigo del perchero está mojado. Afuera llueve; la oficina lleva cerrada desde 1987.',
  taza:    'Labial fresco en una taza de café de hace 37 años.',
  acceso:  'Último acceso a la computadora: hoy, 23:41. Seis minutos antes de que yo llegara.',
  polilla: 'Una carpeta con mi nombre clave en el archivador. Recién vaciada.',
  llamada: 'Una llamada a un teléfono sin línea. Sabían mi nombre.',
  pared:   '«Te estábamos esperando», escrito en tinta UV en lo alto de la pared.',
};
const clueCount = () => Object.values(S.clues).filter(Boolean).length;
const has = k => S.items.includes(k);

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
  $('#lvUV').style.display = sel === 'uv' ? '' : 'none';
}

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
function clickItem(k) {
  Sfx.click(); S.fresh.delete(k);
  if (k === 'libreta') { openNotebook(); renderInv(); return; }
  if (k === 'foto') { think('«Tango, verano del 79. El único que siempre me espera.» Ferraz y su perro. Lo único alegre de esta oficina.'); renderInv(); return; }
  if (k === 'expediente') { think('El Expediente NOCTUA. Pesa más de lo que debería.'); renderInv(); return; }
  S.sel = S.sel === k ? null : k;
  if (S.sel === 'uv') think('Enciendo la linterna UV. Todo se vuelve violeta… La tinta invisible debería brillar bajo esta luz.');
  if (S.sel === 'llave') think('La llave pequeña. ¿Qué cerradura es tan diminuta?');
  applyCursor(); renderInv();
}

/* ---------- Objetivos ---------- */
function renderObjectives() {
  const n = clueCount(), L = [];
  L.push({ t: 'Recuperar el Expediente NOCTUA', done: S.f.docTaken, main: true });
  L.push({ t: `Reunir las 3 pistas (${n}/3)`, done: n === 3 });
  if (S.seen.cabLocked) L.push({ t: 'Abrir el archivador', done: S.f.cabOpen });
  if (S.f.pcOn) L.push({ t: 'Descubrir la clave de Ferraz', done: S.f.logged });
  if (S.seen.mail) L.push({ t: '¿Qué día cerró la oficina?', done: !!S.seen.calendar });
  if (S.seen.mail || has('uv')) L.push({ t: 'Hallar el ancla «a oscuras»', done: S.clues.ancla });
  if (n === 3 || S.f.safeOpen) L.push({ t: 'Abrir la caja (luna·ojo·ancla)', done: S.f.safeOpen });
  if (S.f.docTaken) L.push({ t: 'Salir de ahí', done: S.ended });
  // Los dos primeros siempre se ven; los secundarios cumplidos se retiran para no saturar la caja
  $('#objList').innerHTML = L.filter((o, i) => i < 2 || !o.done).map(o => `<li class="${o.done ? 'done' : ''}${o.main ? ' main' : ''}">${o.t}</li>`).join('');
  $('#clueCount').textContent = `PISTAS ${n}/3`;
}

/* ---------- Pistas y rarezas ---------- */
function gainClue(k, lines) {
  if (S.clues[k]) return;
  S.clues[k] = true;
  const n = clueCount();
  setTimeout(() => { Sfx.clue(); toast(`PISTA ${n}/3`, CLUE_NAMES[k]); }, 250);
  const extra = n === 3 ? ['Tengo las tres piezas. La placa de la caja fuerte marca el orden.'] : [];
  think([].concat(lines || [], extra));
  renderObjectives();
  if (n === 2 && !S.f.phoneDone) setTimeout(startRinging, 9000);
}
function noteOdd(k) { if (!S.odd.has(k)) { S.odd.add(k); setTimeout(() => Sfx.sting(), 300); } }
function checkLuna() {
  if (S.seen.mail && S.seen.calendar && !S.clues.luna)
    gainClue('luna', ['«La luna duerme el día en que cerramos.» Y el calendario dice que cerraron el 14.', 'Luna: catorce.']);
}

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
    name.textContent = l.who === 'control' ? 'CONTROL' : '???';
    if (l.who === 'control') face(false); else por.innerHTML = portraitStatic() + '<span class="lbl">LÍNEA 3</span>';
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

/* ---------- Libreta del agente ---------- */
let nbTab = 'luna';
function openNotebook(tab) { if (tab) nbTab = tab; renderNotebook(); $('#notebook').classList.add('on'); }
function closeNotebook() { $('#notebook').classList.remove('on'); }
function renderNotebook() {
  const tabs = [['luna', '01 LUNA'], ['ojo', '02 OJO'], ['ancla', '03 ANCLA'], ['placa', 'PLACA'], ['rarezas', 'RAREZAS']];
  $('#nbTabs').innerHTML = tabs.map(([k, l]) => `<button data-k="${k}" class="${k === nbTab ? 'on' : ''}">${l}</button>`).join('');
  $$('#nbTabs button').forEach(b => b.onclick = () => { Sfx.click(); nbTab = b.dataset.k; renderNotebook(); });
  const pg = $('#nbPage'), none = h => `<div class="txt" style="opacity:.7">Sin datos todavía.<br>${h}</div>`;
  let h = '';
  if (nbTab === 'luna') {
    h = `<div class="sub">PISTA 01 · SÍMBOLO DE LA LUNA</div><h2>La luna duerme…</h2><div class="clip">`;
    h += `<svg viewBox="0 0 300 220">${symMoon(52, 60, 34)}<text x="110" y="52" font-family="${typeFont}" font-size="14" font-weight="bold">«La luna duerme</text><text x="110" y="72" font-family="${typeFont}" font-size="14" font-weight="bold">el día en que</text><text x="110" y="92" font-family="${typeFont}" font-size="14" font-weight="bold">cerramos.»</text>`
      + (S.seen.calendar ? `<rect x="110" y="120" width="90" height="80" fill="#e8dcc2" stroke="${INK}" stroke-width="3"/><rect x="110" y="120" width="90" height="20" fill="#7c2434"/><text x="155" y="135" text-anchor="middle" font-family="${typeFont}" font-size="11" fill="#e8dcc2" font-weight="bold">OCT 1987</text><text x="155" y="180" text-anchor="middle" font-family="${typeFont}" font-size="30" font-weight="bold">14</text><ellipse cx="155" cy="170" rx="30" ry="22" fill="none" stroke="#e0283f" stroke-width="3"/>` : '')
      + `</svg>`;
    h += S.seen.mail ? `<div class="txt">Del correo de Ferraz.${S.seen.calendar ? '<br>El calendario del escritorio marca el <b>CIERRE</b> el 14 de octubre.<br><b>☾ = 14</b>' : '<br>¿Qué día cerró la oficina?'}</div>` : none('Ferraz habrá dejado algo en su computadora.');
    h += `</div>`;
  } else if (nbTab === 'ojo') {
    h = `<div class="sub">PISTA 02 · SÍMBOLO DEL OJO</div><h2>Lo que cuento</h2><div class="clip">`;
    h += S.clues.ojo ? `<svg viewBox="0 0 300 260"><rect width="300" height="260" fill="#e3d6bc"/>${tallySheet(150, 150, 0.62)}</svg><div class="txt">Hoja del archivador (cajón 1).<br>Un ojo y rayas de conteo en grupos de cinco.<br>¿Cuántas son?</div>` : none('Algo guardado bajo llave.');
    h += `</div>`;
  } else if (nbTab === 'ancla') {
    h = `<div class="sub">PISTA 03 · SÍMBOLO DEL ANCLA</div><h2>Solo a oscuras</h2><div class="clip">`;
    h += S.clues.ancla ? `<svg viewBox="0 0 300 220"><rect width="300" height="220" fill="#1c2436"/><g filter="url(#glowUV)">${symAnchor(90, 110, 44, '#e8c2ff', 7)}<text x="200" y="130" text-anchor="middle" font-family="Rockwell,Georgia,serif" font-weight="900" font-size="54" fill="#e8c2ff">XXXI</text></g></svg><div class="txt">Tinta invisible en el cuadro del faro, revelada con la linterna UV.<br>Números romanos.</div>` : none('«El ancla solo aparece a oscuras.»');
    h += `</div>`;
  } else if (nbTab === 'placa') {
    h = `<div class="sub">CAJA FUERTE HALCÓN · TRES RUEDAS 00–99</div><h2>El orden</h2><div class="clip">`;
    h += S.seen.plate ? `<svg viewBox="0 0 300 120"><rect x="10" y="10" width="280" height="100" rx="6" fill="#b08a4a" stroke="${INK}" stroke-width="4"/>${symMoon(70, 60, 26)}${symEye(150, 60, 34, INK, 5)}${symAnchor(230, 60, 32, INK, 5)}</svg><div class="txt">Rueda I: luna<br>Rueda II: ojo<br>Rueda III: ancla</div>` : none('Mira la caja fuerte de cerca.');
    h += `</div>`;
  } else {
    h = `<div class="sub">COSAS QUE NO CUADRAN · ${S.odd.size}/${Object.keys(ODD).length}</div><h2>Rarezas</h2><div class="txt"><ol>`;
    for (const k of Object.keys(ODD)) h += `<li>${S.odd.has(k) ? ODD[k] : '<span style="opacity:.5">¿…?</span>'}</li>`;
    h += `</ol></div>`;
  }
  pg.innerHTML = h;
}
