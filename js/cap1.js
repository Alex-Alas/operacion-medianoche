/* =====================================================================
   [6] INTERACCIONES: escena principal, primeros planos, UV, caja fuerte,
   teléfono, ambiente vivo, final y arranque.
   ===================================================================== */
const once = k => (S.seen[k] ? false : (S.seen[k] = true));

/* ---------- Etiqueta flotante sobre lo que se puede tocar ---------- */
const tag = $('#hoverTag');
function showTag(text, e) { tag.textContent = text; tag.classList.add('on'); moveTag(e); }
function moveTag(e) { tag.style.left = e.clientX + 'px'; tag.style.top = e.clientY + 'px'; }
function hideTag() { tag.classList.remove('on'); }

/* ---------- Escena principal: qué pasa al tocar cada cosa ---------- */
const ACT = {
  ventana() {
    think(once('ventana')
      ? ['Lluvia sobre la avenida. El neón del Hotel Lux parpadea como si le costara respirar.', 'A esta altura nadie puede verme desde la calle… espero.']
      : 'La «E» del cartel se apaga y se enciende. Lleva así toda la noche.');
    if (Math.random() < 0.5) setTimeout(lightning, 500);
  },
  puerta() { think('La puerta por la que entré. «SEGUROS FERRAZ», al revés desde este lado. Prefiero no darle la espalda.'); },
  perchero() {
    if (once('perchero')) think(['Por un segundo creí que había alguien parado en la esquina.', 'Es solo un perchero. Un abrigo y un sombrero.']);
    else { noteOdd('abrigo'); think(['Toco el abrigo. Está mojado.', 'Afuera llueve desde la tarde. Y esta oficina lleva cerrada desde 1987.']); }
  },
  cuadro() {
    if (S.sel === 'uv') {
      if (!S.clues.ancla) gainClue('ancla', ['Bajo la luz violeta aparece tinta invisible sobre el mar del cuadro…', 'Un ancla. Y al lado: XXXI. Números romanos.']);
      else think('El ancla sigue ahí, brillando. XXXI.');
      return;
    }
    if (!S.f.straight) {
      if (once('paintingLook')) { think(['«Faro de medianoche». Está torcido.', 'El marco dejó una marca limpia en el polvo de la pared: alguien lo movió hace poco.']); return; }
      S.f.straight = true; straightenPainting();
      think(['Lo enderezo con cuidado…', 'Algo cae de detrás del marco. Una llave diminuta.']);
      setTimeout(() => addItem('llave'), 700);
      return;
    }
    think(has('uv') ? 'La pintura brilla un poco en algunas zonas, como si tuviera otra capa encima. Con la linterna UV podría verlo mejor.'
                    : 'Un faro en una tormenta. La pintura del mar tiene un brillo raro, como si tuviera otra capa encima.');
  },
  archivador() {
    if (S.f.cabOpen) { openCloseup('cab'); return; }
    if (S.sel === 'llave') {
      S.f.cabOpen = true; S.sel = null; S.items = S.items.filter(k => k !== 'llave'); applyCursor(); renderInv(); Sfx.unlock();
      $('#cabOpen').innerHTML = bake(artCabinet(true), { x: 1100, y: 270, w: 260, h: 450 }); hydrate($('#cabOpen'));
      $('#cabClosed').style.display = 'none'; $('#cabOpen').style.display = '';
      think('La llave gira con un chasquido seco. El primer cajón se abre.');
      renderObjectives(); setTimeout(() => openCloseup('cab'), 700); return;
    }
    S.seen.cabLocked = true; renderObjectives();
    think(has('llave') ? 'Cerrado con llave. Tengo una llave pequeña… podría usarla aquí (selecciónala en el inventario).'
                       : ['Un archivador metálico de tres cajones. Cerrado con llave.', 'La cerradura es diminuta. Necesito una llave muy pequeña.']);
  },
  computadora() { openCloseup('pc'); },
  escritorio() { openCloseup('desk'); },
  telefono() {
    if (S.f.ringing) { answerPhone(); return; }
    think(S.f.phoneDone ? 'Lo descuelgo. Nada. Ni siquiera tono. Como debería ser.' : 'Un teléfono de disco. Sin tono, claro: aquí no pagan la línea desde hace décadas.');
  },
  pared() {
    if (S.sel !== 'uv') return;
    noteOdd('pared'); think(['Hay letras en lo alto de la pared. Enormes. Solo se ven con la luz UV.', '«TE ESTÁBAMOS ESPERANDO».', 'Mejor no pensar en eso ahora.']);
  },
  caja() { S.seen.plate = true; openCloseup('safe'); },
};
const USE_FAIL = {
  uv: 'Paso la luz violeta. Nada. Solo polvo y pelusas fosforescentes.',
  llave: 'La llave es demasiado pequeña para esto.',
};
function onHot(id) {
  if (Dialog.open || S.ended) return;
  Sfx.click();
  if (S.sel && !['cuadro', 'archivador', 'pared'].includes(id) && !(S.sel === 'uv' && id === 'caja')) {
    think(USE_FAIL[S.sel]); return;
  }
  if (S.sel === 'uv' && id === 'caja') { think('Ni una marca en la caja fuerte. Ferraz no escondería la clave sobre la propia caja.'); return; }
  if (S.sel === 'llave' && id !== 'archivador') { think(USE_FAIL.llave); return; }
  ACT[id]?.();
}
function straightenPainting() {
  const g = $('#gPainting'), u = $('#uvPaint'); let a = -7; Sfx.drawer();
  const step = () => { a = Math.min(0, a + 0.7); const tr = `translate(950 250) rotate(${a})`; g.setAttribute('transform', tr); u.setAttribute('transform', tr); if (a < 0) requestAnimationFrame(step); };
  step();
}

/* ---------- Primeros planos ---------- */
const bakedCU = {};
const cuBake = (key, fn) => bakedCU[key] || (bakedCU[key] = bake(fn(), { x: -40, y: -40, w: 1680, h: 980, amp: 3.6, cu: true }));
const hotPath = (id, name, pts) => `<path class="hot" data-id="${id}" data-name="${name}" tabindex="0" role="button" aria-label="${name}" d="M${pts.map(p => p.join(' ')).join('L')}Z"/>`;
const box = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

const CU = {
  desk: {
    title: 'ESCRITORIO DE FERRAZ',
    enter() { if (once('desk')) think('El escritorio de Ferraz. Todo quedó como si fuera a volver mañana.'); },
    svg() {
      let s = cuBake('deskBase', cuDeskBase);
      if (S.seen.photoBack && S.photoFlip) s += cuBake('photoBack', cuPhotoBack);
      s += S.f.drawerOpen ? cuBake('drawerOpen', () => cuDrawer(true)) : cuBake('drawerClosed', () => cuDrawer(false));
      if (S.f.drawerOpen && !S.f.uvTaken) s += cuBake('flash', cuFlashlight);
      s += `<g id="cuLight" style="mix-blend-mode:screen;pointer-events:none">${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${-200 + i * 120} -40L${200 + i * 120} -40L${900 + i * 120} 960L${500 + i * 120} 960Z" fill="#cfeeff" opacity=".045"/>`).join('')}</g>`;
      s += hotPath('calendario', 'Calendario', [[132, 120], [600, 88], [636, 580], [168, 614]]);
      s += hotPath('foto', 'Portarretratos', [[724, 140], [1018, 156], [1000, 524], [704, 508]]);
      s += hotPath('taza', 'Taza', box(1166, 206, 1390, 392));
      if (S.f.drawerOpen && !S.f.uvTaken) s += hotPath('linterna', 'Linterna', [[596, 690], [880, 656], [890, 744], [604, 760]]);
      if (S.f.drawerOpen) s += hotPath('fosforos', 'Caja de fósforos', box(920, 660, 1020, 750));
      if (!S.f.drawerOpen) s += hotPath('cajon', 'Cajón', box(480, 706, 1120, 884));
      return s;
    },
    hot: {
      calendario() {
        const first = !S.seen.calendar; S.seen.calendar = true;
        think(first ? ['Un calendario de octubre de 1987.', 'Alguien tachó los días uno por uno… hasta el 14. Ese lo encerró en rojo: «CIERRE».', 'El último día de la oficina.'] : 'El 14 de octubre de 1987, encerrado en rojo. «CIERRE».');
        renderObjectives(); checkLuna();
      },
      foto() {
        if (once('photo')) { think('Ferraz en la playa, con un perro enorme. Sonríe. Es lo único alegre de esta oficina.'); return; }
        S.photoFlip = !S.photoFlip;
        if (S.photoFlip) {
          const first = !S.seen.photoBack; S.seen.photoBack = true;
          think(first ? ['Le doy la vuelta. Detrás, a lápiz:', '«Tango, verano del 79. El único que siempre me espera.»'] : '«Tango, verano del 79.»');
          if (first) setTimeout(() => addItem('foto'), 600);
        } else think('Ferraz y Tango. Nadie más en la foto.');
        CU.desk.render();
      },
      taza() {
        if (once('tazaLook')) { think(['Café de hace treinta y siete años, convertido en piedra.', 'En el borde hay una marca de labial. Todavía brilla.']); return; }
        noteOdd('taza'); think('Paso el dedo. El labial se corre. Está fresco.');
      },
      cajon() {
        S.f.drawerTries++; Sfx.drawer();
        if (S.f.drawerTries === 1) { think('Está atascado. Tiro un poco más fuerte…'); return; }
        S.f.drawerOpen = true;
        think('Cede de golpe. Lápices, una caja de fósforos del Hotel Lux… y una linterna.'); CU.desk.render();
      },
      linterna() {
        S.f.uvTaken = true; addItem('uv'); CU.desk.render(); renderObjectives();
        think(['Una linterna de luz negra. ¿Para qué querría un vendedor de seguros una linterna UV?', 'Sirve para leer tinta invisible. Puedo usarla desde el inventario.']);
      },
      fosforos() { think('Fósforos del Hotel Lux, el del neón de enfrente. Falta uno solo.'); },
    },
  },
  pc: {
    title: 'COMPUTADORA',
    enter() { if (!S.f.pcOn && once('pcLook')) think('Una computadora de los ochenta. Pesa como un ataúd. ¿Tendrá corriente?'); },
    svg() {
      return cuBake('pc', cuPC) + hotPath('power', 'Botón de encendido', box(1166, 714, 1234, 782)) + hotPath('postit', 'Nota adhesiva', [[1250, 70], [1440, 92], [1420, 270], [1230, 250]]);
    },
    html() {
      const d = document.createElement('div'); d.className = 'crt'; d.id = 'crt';
      Object.assign(d.style, { left: '23.3%', top: '13.9%', width: '53.4%', height: '61.6%' });
      $('#cuHtml').appendChild(d); renderCRT();
    },
    hot: {
      power() {
        if (S.f.pcOn) { think('Mejor no apagarla. No sé si volvería a encender.'); return; }
        S.f.pcOn = true; Sfx.crtOn(); bootCRT(); setScreenOn(); renderObjectives();
        think(['Un zumbido… y la pantalla se enciende.', '¿Electricidad? Este edificio no tiene servicio desde hace décadas.']);
      },
      postit() { think('«Martes: veterinario, 17 h». Con la letra de Ferraz.'); },
    },
  },
  cab: {
    title: 'ARCHIVADOR · CAJÓN 1',
    enter() { if (once('cabLook')) think('Carpetas colgantes, todas con etiquetas escritas a máquina. Y una hoja suelta encima de todo.'); },
    svg() {
      return cuBake('cab', cuCabinet) + hotPath('polizas', 'Pólizas', box(1106, 336, 1452, 724)) + hotPath('polilla', 'Carpeta «POLILLA»', box(196, 250, 374, 300))
        + hotPath('siniestros', 'Carpeta «SINIESTROS»', box(246, 400, 424, 450)) + hotPath('personal', 'Carpeta «PERSONAL»', box(296, 550, 474, 600))
        + hotPath('hoja', 'Hoja suelta', [[530, 290], [1050, 262], [1076, 762], [556, 790]]);
    },
    hot: {
      hoja() {
        if (S.clues.ojo) { think('Un ojo y rayas de conteo. «Lo que cuento». La copié en la libreta.'); return; }
        gainClue('ojo', ['Un ojo dibujado… y debajo, rayas de conteo en grupos de cinco.', '«Lo que cuento». Ferraz contaba algo, día tras día. La copio en la libreta.']);
      },
      polilla() { noteOdd('polilla'); think(['Una carpeta con la etiqueta «POLILLA».', 'Mi nombre clave. Está vacía… y no tiene ni una mota de polvo.']); },
      polizas() { think('Pólizas de 1986. Todas firmadas por la misma persona, con la misma letra. Incluso las de clientes distintos.'); },
      siniestros() { think('Siniestros: incendios, robos… y un apartado entero que dice «desapariciones».'); },
      personal() { think(['Fichas del personal. Doce empleados.', 'Todas tienen la misma fecha de baja: 14 de octubre de 1987.']); },
    },
  },
  safe: {
    title: 'CAJA FUERTE HALCÓN',
    enter() {
      if (S.f.safeOpen) return;
      if (once('safeLook')) think(['Una caja fuerte Halcón de los sesenta. Tres ruedas, del 00 al 99.', 'Sobre ellas, una placa con tres símbolos: luna, ojo, ancla.']);
      else if (clueCount() < 3) think(`Todavía me faltan pistas (${clueCount()}/3). Probar al azar sería inútil.`);
    },
    svg() {
      if (!S.f.safeOpen) return cuBake('safeClosed', () => cuSafe(false)) + hotPath('manija', 'Manija', [[1220, 300], [1330, 300], [1330, 680], [1220, 680]]) + hotPath('placa', 'Placa', box(540, 124, 1060, 252));
      let s = cuBake('safeOpen', () => cuSafe(true)) + cuSafeLoot(!S.f.docTaken, !S.f.photoSeen);
      if (!S.f.docTaken) s += hotPath('expediente', 'Expediente NOCTUA', box(466, 320, 976, 610));
      if (!S.f.photoSeen) s += hotPath('polaroid', 'Foto instantánea', box(1020, 330, 1260, 620));
      return s;
    },
    html() {
      if (S.f.safeOpen) return;
      [29.2, 44.5, 59.8].forEach((left, i) => {
        const d = document.createElement('div'); d.className = 'drum';
        Object.assign(d.style, { left: left + '%', top: '36%', width: '10.8%', height: '33%' });
        d.innerHTML = `<button aria-label="Subir rueda ${i + 1}">▲</button><div class="num" id="drum${i}">${String(S.drums[i]).padStart(2, '0')}</div><button aria-label="Bajar rueda ${i + 1}">▼</button>`;
        const [up, , down] = d.children;
        up.onclick = () => turnDrum(i, 1); down.onclick = () => turnDrum(i, -1);
        d.addEventListener('wheel', e => { e.preventDefault(); turnDrum(i, e.deltaY < 0 ? 1 : -1); }, { passive: false });
        $('#cuHtml').appendChild(d);
      });
    },
    hot: {
      placa() { S.seen.plate = true; think('Luna, ojo, ancla. Rueda uno, dos y tres. El orden ya está escrito.'); },
      manija() {
        const n = clueCount(), v = S.drums;
        if (n < 3) { Sfx.wrong(); think(`No tiene sentido probar al azar: son un millón de combinaciones. Me faltan pistas (${n}/3).`); return; }
        if (v.every((x, i) => x === ANSWER[i])) { openSafe(); return; }
        S.f.wrongSafe++; Sfx.wrong();
        const sameSet = [...v].sort((a, b) => a - b).join() === [...ANSWER].sort((a, b) => a - b).join();
        think(sameSet ? 'Los números se sienten correctos… pero no el orden. La placa: luna, ojo, ancla.'
          : S.f.wrongSafe < 2 ? 'Nada. Solo un clic sordo.' : 'Otra vez nada. Tengo las tres pistas en la libreta: hay que contar las rayas y traducir los números romanos.');
      },
      expediente() {
        S.f.docTaken = true; addItem('expediente', true); Sfx.pickup(); toast('RECUPERADO', 'EXPEDIENTE NOCTUA'); CU.safe.render(); renderObjectives();
        think('El Expediente NOCTUA. Por fin.'); maybeEnd();
      },
      polaroid() {
        S.f.photoSeen = true; Sfx.sting(); CU.safe.render(); showPolaroid();
        think(['Una foto instantánea. Es esta oficina: la puerta, vista desde adentro.', '«23:46 — ya casi llega».', 'Yo entré a las 23:47.']);
      },
    },
  },
};
for (const k in CU) CU[k].render = () => renderCloseup();

function openCloseup(key) {
  S.cu = key; hideTag(); $('#closeup').classList.add('on'); renderCloseup(); layout(); CU[key].enter?.();
}
function closeCloseup() { S.cu = null; $('#closeup').classList.remove('on'); $('#cuHtml').innerHTML = ''; hideTag(); }
function renderCloseup() {
  const c = CU[S.cu]; if (!c) return;
  $('#cuTitle').textContent = c.title; $('#cuSvg').innerHTML = c.svg(); hydrate($('#cuSvg')); $('#cuHtml').innerHTML = ''; c.html?.();
  bindHots($('#cuSvg'), id => { if (Dialog.open) return; Sfx.click(); c.hot[id]?.(); });
}
function turnDrum(i, d) { S.drums[i] = (S.drums[i] + d + 100) % 100; $('#drum' + i).textContent = String(S.drums[i]).padStart(2, '0'); Sfx.dial(); }
function showPolaroid() {
  const d = document.createElement('div');
  Object.assign(d.style, { position: 'absolute', inset: '0', display: 'grid', placeItems: 'center', background: 'rgba(5,3,8,.7)', cursor: 'pointer', zIndex: 4 });
  d.innerHTML = `<svg viewBox="0 0 260 300" style="height:86%;transform:rotate(-3deg)">${polaroid(20, 20, 1, true)}</svg>`;
  d.onclick = () => { d.remove(); maybeEnd(); };
  $('#cuHtml').appendChild(d);
}

/* ---------- Computadora: arranque, clave y correo ---------- */
function setScreenOn() { $('#screenOff').style.display = 'none'; $('#screenOn').style.display = ''; $('#crtGlow').setAttribute('opacity', '.9'); }
function bootCRT() {
  const el = $('#crt'); if (!el) return;
  const lines = ['FERRAZ SISTEMAS (c) 1986', 'MEMORIA ........ 640K OK', 'DISCO C: ....... OK', 'CARGANDO SISTEMA FERRAZ v2.1…'];
  el.innerHTML = ''; let i = 0;
  const t = setInterval(() => { if (!$('#crt')) { clearInterval(t); return; } el.innerHTML += `<div>${lines[i++]}</div>`; Sfx.tick(); if (i >= lines.length) { clearInterval(t); setTimeout(renderCRT, 500); } }, window.__game?.fast ? 1 : 330);
}
function renderCRT(msg = '') {
  const el = $('#crt'); if (!el) return;
  if (!S.f.pcOn) { el.innerHTML = `<div class="dim" style="margin-top:22%;text-align:center">· · ·</div>`; el.onclick = () => think('Está apagada. El botón de encendido está abajo, a la derecha.'); return; }
  el.onclick = null;
  if (!S.f.logged) {
    el.innerHTML = `<div>SISTEMA FERRAZ v2.1</div><div class="dim">────────────────────────</div><div>USUARIO: A.FERRAZ</div>
      <div>CLAVE: <input id="pass" maxlength="16" autocomplete="off" spellcheck="false" aria-label="Clave"></div>
      <div class="dim" style="margin-top:.8em">RECORDATORIO DE CLAVE:</div><div>«EL ÚNICO QUE SIEMPRE ME ESPERA»</div>
      <div class="err" style="margin-top:.8em">${msg}</div><div class="dim">[ENTER] PARA INGRESAR</div>`;
    const inp = $('#pass'); setTimeout(() => inp.focus(), 50);
    inp.addEventListener('keydown', e => { e.stopPropagation(); Sfx.tick(); if (e.key === 'Enter') tryPass(inp.value); });
    return;
  }
  el.innerHTML = `<div>BANDEJA ▸ BORRADORES (1) · NO ENVIADO</div><div class="dim">PARA: SECCIÓN OCASO · ASUNTO: SI ME PASA ALGO</div><div class="dim">────────────────────────────────</div>
    <div>Si leen esto, ya no estoy.</div><div>La combinación sigue la placa de la caja.</div>
    <div>☾ La luna duerme el día en que cerramos.</div><div>◉ Lo que vigilo lo cuento y lo guardo bajo llave.</div>
    <div>⚓&#xFE0E; El ancla solo aparece a oscuras, en el mar que pinté.</div><div>No confíen en el edificio. — A.F.</div>
    <div class="err blinkc" style="margin-top:.6em">ÚLTIMO ACCESO: HOY 23:41 </div>`;
}
function tryPass(v) {
  const clean = v.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toUpperCase();
  if (clean === 'TANGO') {
    S.f.logged = true; S.seen.mail = true; Sfx.pickup(); renderCRT(); renderObjectives(); noteOdd('acceso');
    $('#screenLine').textContent = 'BORRADOR (1)';
    think(['Entré. Hay un correo que Ferraz nunca envió… dirigido a nosotros.', 'Último acceso: hoy, 23:41. Yo llegué a las 23:47.', 'Alguien estuvo aquí seis minutos antes que yo.']);
    setTimeout(checkLuna, 200);
    return;
  }
  S.f.wrongPass++; Sfx.wrong(); renderCRT('CLAVE INCORRECTA');
  think(!S.seen.photo ? 'No. «El único que siempre me espera»… alguien cercano a Ferraz. Quizá haya algo personal en su escritorio.'
    : !S.seen.photoBack ? 'Esa foto con el perro… quizá tenga algo escrito detrás.' : 'Tango. El perro de la foto. Tiene que ser eso.');
}

/* ---------- Caja fuerte abierta y final ---------- */
function openSafe() {
  S.f.safeOpen = true; Sfx.unlock(); setTimeout(() => Sfx.safeOpen(), 250);
  toast('ABIERTA', '14 · 23 · 31'); renderObjectives();
  think(['Catorce, veintitrés, treinta y uno. La manija cede.', 'Adentro hay una carpeta… y una foto instantánea.']);
  setTimeout(renderCloseup, 400);
}
async function maybeEnd() {
  if (!S.f.docTaken || !S.f.photoSeen || S.ended || S.ending) return;
  S.ending = true;
  await new Promise(r => setTimeout(r, 1800));
  closeCloseup(); lightning();
  await Dialog.say([C('Polilla, ¿lo tienes?'), C('Bien. Ahora sal de ahí. No toques nada más.'),
    C('…Espera. El registro de la puerta del edificio marca una sola entrada esta noche.', 'alarma'), C('La tuya. A las 23:47.', 'alarma')]);
  think('Entonces… ¿quién sacó esa foto a las 23:46?');
  await new Promise(r => setTimeout(r, 2600));
  S.ended = true; renderObjectives(); showEnding();
}
function showEnding() {
  const t = Math.round((Date.now() - S.t0) / 1000), mm = String(Math.floor(t / 60)).padStart(2, '0'), ss = String(t % 60).padStart(2, '0');
  const odd = Object.keys(ODD).filter(k => S.odd.has(k));
  $('#endSheet').innerHTML = `
    <div class="stamp" style="right:24px;top:30px">RECUPERADO</div>
    <div class="kicker">SECCIÓN OCASO · INFORME DE MISIÓN · EXPEDIENTE 07</div>
    <h1>OPERACIÓN<br>MEDIANOCHE</h1>
    <div class="field">
      <b>Agente:</b><span class="hand">«Polilla»</span>
      <b>Objetivo:</b><span>Expediente NOCTUA — recuperado</span>
      <b>Combinación:</b><span>luna 14 · ojo 23 · ancla 31</span>
      <b>Tiempo:</b><span>${mm}:${ss}</span>
      <b>Errores:</b><span>${S.f.wrongPass} ${S.f.wrongPass === 1 ? 'clave' : 'claves'} · ${S.f.wrongSafe} ${S.f.wrongSafe === 1 ? 'intento' : 'intentos'} en la caja</span>
      <b>Rarezas:</b><span>${odd.length}/${Object.keys(ODD).length} anotadas</span>
    </div>
    ${odd.length ? `<ul>${odd.map(k => `<li>${ODD[k]}</li>`).join('')}</ul>` : ''}
    <p class="hand" style="font-size:18px;color:#5b1f2e">«La puerta registró una sola entrada esta noche. Descansa, Polilla. Mañana hablamos de esa foto.» — Control</p>
    <p style="font-weight:bold;letter-spacing:.2em">FIN DE LA DEMO</p>
    <div class="row"><button class="btn" id="btnAgain">VOLVER A JUGAR</button></div>`;
  $('#ending').classList.add('on'); Sfx.stamp();
  $('#btnAgain').onclick = () => location.reload();
}

/* ---------- Teléfono ---------- */
function startRinging() {
  if (S.f.phoneDone || S.f.ringing || S.ended) return;
  S.f.ringing = true; Sfx.ringStart();
  think('…¿Está sonando el teléfono?');
  S.ringStop = setTimeout(() => { if (S.f.ringing) { S.f.ringing = false; S.f.phoneDone = true; Sfx.ringStop(); think('Dejó de sonar.'); } }, 24000);
}
async function answerPhone() {
  S.f.ringing = false; S.f.phoneDone = true; clearTimeout(S.ringStop); Sfx.ringStop(); noteOdd('llamada');
  await Dialog.say([X('…'), X('Llegas tarde, Polilla.'), X('Él ya no va a volver. Pero tú todavía puedes irte.'), X('— clic —')]);
  await Dialog.say([C('¿Polilla? Perdí tu señal unos segundos. ¿Todo bien ahí?', 'alarma')]);
  think(['Ese teléfono no tiene línea desde 1987.', 'Y nadie fuera de la Sección conoce mi nombre clave.']);
}

/* ---------- Ambiente vivo: neón, motas, relámpagos, timbre ---------- */
function lightning() {
  const fl = $('#flash'), sky = $('#skyFlash');
  const pulse = (o, d) => { fl.style.transition = 'none'; fl.style.opacity = o; sky.setAttribute('opacity', o * 1.6); setTimeout(() => { fl.style.transition = `opacity ${d}ms`; fl.style.opacity = 0; sky.setAttribute('opacity', 0); }, 60); };
  pulse(0.35, 220); setTimeout(() => pulse(0.22, 600), 180);
  setTimeout(() => Sfx.thunder(), 700 + Math.random() * 900);
}
function scheduleLightning() { setTimeout(() => { if (S.started && !S.ended) lightning(); scheduleLightning(); }, 22000 + Math.random() * 26000); }
const motes = [];
let lastT = 0;
function loop(t) {
  const dt = Math.min(0.05, (t - lastT) / 1000 || 0); lastT = t;
  // Neón que respira con caídas al azar; la «E» rota se apaga más. A ~10 Hz: basta para el ojo
  // y cada cambio obliga a recomponer la capa de luces.
  if (t - (loop.neonT || 0) > 95) {
    loop.neonT = t;
    const n = Math.random() < 0.06 ? 0.25 : 0.85 + Math.sin(t / 900) * 0.08;
    const ng = $('#neonGlow'), sg = $('#neonSign');
    if (ng) { ng.setAttribute('opacity', n.toFixed(2)); sg.setAttribute('opacity', (0.5 + n * 0.5).toFixed(2)); Sfx.neon(n); }
    $$('.neonBroken').forEach(e => e.setAttribute('opacity', Math.random() < 0.18 ? 0.15 : 1));
  }
  // Lluvia (~30 Hz basta) y motas de polvo en el haz de luna (~20 Hz: flotan lento)
  if (t - (loop.rainT || 0) > 33) {
    loop.rainT = t;
    const k = (t % 550) / 550, rn = $('#rain');
    if (rn) rn.setAttribute('transform', `translate(${f1(20 - 30 * k)} ${f1(-320 + 320 * k)})`);
  }
  if (t - (loop.moteT || 0) > 50) {
    const mdt = (t - (loop.moteT || t)) / 1000; loop.moteT = t;
    if (!motes.length) $$('.mote').forEach(m => motes.push({ m, x: +m.getAttribute('cx'), y: +m.getAttribute('cy'), s: 3 + Math.random() * 6, p: Math.random() * 6 }));
    for (const o of motes) { o.y -= o.s * mdt; o.x += Math.sin(t / 1800 + o.p) * 6 * mdt; if (o.y < 220) o.y = 860; o.m.setAttribute('cx', o.x.toFixed(1)); o.m.setAttribute('cy', o.y.toFixed(1)); }
  }
  // El teléfono vibra mientras suena
  const ph = $('#gPhone');
  if (ph) ph.setAttribute('transform', S.f.ringing && Math.floor(t / 2600 * 2) % 2 === 0 && (t % 2600) < 1000 ? `translate(${(Math.random() * 4 - 2).toFixed(1)} ${(Math.random() * 2 - 1).toFixed(1)})` : '');
  requestAnimationFrame(loop);
}

/* ---------- Linterna UV: la mancha de luz sigue al puntero ---------- */
function toScene(svg, e) { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); }
function moveUV(e) {
  if (S.sel !== 'uv') return;
  const p = toScene($('#scene'), e);
  for (const id of ['uvSpot', 'uvBeam']) { const c = $('#' + id); c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); }
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
    h.addEventListener('click', e => { e.stopPropagation(); moveUV(e); fn(h.dataset.id); });
    h.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(h.dataset.id); } });
    h.addEventListener('pointerenter', e => showTag(h.dataset.name, e));
    h.addEventListener('pointermove', moveTag);
    h.addEventListener('pointerleave', hideTag);
  });
}
function hintNow() {
  const n = clueCount();
  const H = [
    [!S.f.pcOn, 'Esa computadora vieja… si todavía tiene corriente, puede que Ferraz haya dejado algo.'],
    [S.f.pcOn && !S.f.logged && !S.seen.photoBack, 'La clave es «el único que siempre me espera». Alguien cercano a Ferraz. Debería revisar su escritorio a fondo.'],
    [S.f.pcOn && !S.f.logged, 'Tango. El perro de la foto. Esa tiene que ser la clave.'],
    [S.seen.mail && !S.seen.calendar, '«La luna duerme el día en que cerramos». ¿Qué día cerró la oficina? En el escritorio había un calendario.'],
    [!S.f.drawerOpen, 'El cajón del escritorio estaba atascado. A veces solo hay que insistir.'],
    [!S.f.straight && !S.f.cabOpen, 'El cuadro está torcido. Alguien lo movió hace poco… ¿qué habrá detrás?'],
    [!S.f.cabOpen && has('llave'), 'Tengo una llave pequeña. La selecciono en el inventario y la uso sobre el archivador.'],
    [S.f.cabOpen && !S.clues.ojo, 'En el archivador había una hoja suelta con un ojo. Debería mirarla bien.'],
    [!S.clues.ancla && has('uv'), '«El ancla solo aparece a oscuras, en el mar que pinté». La linterna UV sobre el cuadro.'],
    [n === 3 && !S.f.safeOpen, 'Luna, ojo, ancla. El día del cierre, las rayas contadas y los números romanos traducidos.'],
    [S.f.safeOpen && !S.f.docTaken, 'La caja está abierta. El expediente me espera.'],
  ];
  const h = H.find(x => x[0]);
  think(h ? h[1] : 'Observa. Todo en esta oficina está aquí por una razón.');
}
function bindUI() {
  bindHots($('#scene'), onHot);
  $('#scene').addEventListener('pointermove', moveUV);
  $('#scene').addEventListener('pointerdown', moveUV);
  $('#scene').addEventListener('click', () => { if (S.sel && !Dialog.open) { S.sel = null; applyCursor(); renderInv(); } });
  $('#thoughts').onclick = () => Thought.next();
  $('#cuBack').onclick = e => { e.stopPropagation(); Sfx.click(); closeCloseup(); };
  $('#closeup').addEventListener('click', e => { if (e.target.id === 'closeup') closeCloseup(); });
  $('#nbClose').onclick = () => { Sfx.click(); closeNotebook(); };
  $('#notebook').addEventListener('click', e => { if (e.target.id === 'notebook') closeNotebook(); });
  $('#btnBook').onclick = () => { Sfx.click(); openNotebook(); };
  $('#btnHint').onclick = () => { Sfx.click(); hintNow(); };
  $('#btnMute').onclick = () => toggleMute();
  $('#btnRotateAnyway').onclick = () => { S.rotateOk = true; layout(); };
  $('#btnStart').onclick = startGame;
  addEventListener('resize', layout);
  addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (Dialog.open && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); Dialog.advance(); return; }
    if (e.key === 'Escape') { if ($('#notebook').classList.contains('on')) closeNotebook(); else if (S.cu) closeCloseup(); else if (S.sel) { S.sel = null; applyCursor(); renderInv(); } }
    if (e.key === 'n' || e.key === 'N') { $('#notebook').classList.contains('on') ? closeNotebook() : openNotebook(); }
    if (e.key === 'm' || e.key === 'M') toggleMute();
  });
}
function toggleMute() {
  Sfx.setMuted(!Sfx.muted);
  $('#muteIco').setAttribute('d', Sfx.muted ? 'M4 9h4l5-4v14l-5-4H4zM17 9l5 6M22 9l-5 6' : 'M4 9h4l5-4v14l-5-4H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11');
}

/* ---------- Arranque ---------- */
async function startGame() {
  Sfx.init(); $('#title').classList.remove('on'); S.started = true; S.t0 = Date.now();
  think('…');
  await Dialog.say([
    C('Polilla, aquí Control. ¿Me recibes? Bien.'),
    C('Estás en el tercer piso de Seguros Ferraz. Cerrado desde 1987. Nadie ha entrado desde entonces… en teoría.'),
    C('Aurelio Ferraz guardó el Expediente NOCTUA en la caja fuerte de su oficina antes de desaparecer. Lo queremos de vuelta.'),
    C('Ferraz no confiaba en nadie. Repartió la combinación por la oficina: busca tres pistas.'),
    C('Y Polilla… no toques nada que no necesites. Ese edificio tiene mala fama.'),
  ]);
  think(['Huele a papel húmedo, a polvo… y a algo más.', 'Empecemos. Con calma: todo lo que necesito está en esta habitación.']);
  scheduleLightning(); setTimeout(lightning, 4000);
}
function boot() {
  buildScene(); applyCursor(); renderInv(); renderObjectives(); bindUI(); layout();
  requestAnimationFrame(loop);
  think('Haz clic en «Aceptar misión».');
  if (QS.has('shot')) { $('#title').classList.remove('on'); S.started = true; S.t0 = Date.now(); think('Huele a papel húmedo, a polvo… y a algo más.'); }
}
// API de prueba (para recorridos automáticos): __game.fast = true salta diálogos
window.__game = {
  S, fast: false, CU, onHot, openCloseup, closeCloseup, tryPass, turnDrum, clickItem, layout, lightning, startRinging, answerPhone, hintNow, openNotebook,
  cuHot: id => CU[S.cu].hot[id](),
  setDrums: v => { S.drums = v.slice(); if (S.cu === 'safe') renderCloseup(); },
};
boot();
