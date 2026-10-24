/* =====================================================================
   [6] CAPÍTULO 1 · LA OFICINA: pistas, zonas de clic, primeros planos,
   computadora, caja fuerte, teléfono y el enlace con el capítulo 2.
   ===================================================================== */
const ANSWER = [14, 23, 31];             // luna (día del cierre) · ojo (23 rayas) · ancla (XXXI)
const CLUE_NAMES = { luna: 'LUNA', ojo: 'OJO', ancla: 'ANCLA' };
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
function checkLuna() {
  if (S.seen.mail && S.seen.calendar && !S.clues.luna)
    gainClue('luna', ['«La luna duerme el día en que cerramos.» Y el calendario dice que cerraron el 14.', 'Luna: catorce.']);
}

/* ---------- Escena principal: qué pasa al tocar cada cosa ---------- */
const ACT = {
  ventana() {
    think(once('ventana')
      ? ['Lluvia sobre la avenida. El neón del Hotel Lux parpadea como si le costara respirar.', 'A esta altura nadie puede verme desde la calle… espero.']
      : 'La «E» del cartel se apaga y se enciende. Lleva así toda la noche.');
    if (Math.random() < 0.5) setTimeout(lightning, 500);
  },
  puerta() {
    if (S.f.ch1Done) { goCap2(); return; }
    if (S.f.docTaken) { think('Todavía no. En la caja había algo más.'); return; }
    think('La puerta por la que entré. «SEGUROS FERRAZ», al revés desde este lado. Prefiero no darle la espalda.');
  },
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
function onHot1(id) {
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

/* ---------- Primeros planos de la oficina ---------- */
regCU({
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
});

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
  if (!S.f.docTaken || !S.f.photoSeen || S.f.ch1Done || S.ending) return;
  S.ending = true;
  await wait(1800);
  closeCloseup(); lightning();
  await Dialog.say([C('Polilla, ¿lo tienes?'), C('Bien. Ahora sal de ahí. No toques nada más.'),
    C('…Espera. El registro de la puerta del edificio marca una sola entrada esta noche.', 'alarma'), C('La tuya. A las 23:47.', 'alarma')]);
  think(['Entonces… ¿quién sacó esa foto a las 23:46?', 'No me voy a quedar a averiguarlo. La puerta.']);
  S.f.ch1Done = true; S.ending = false; renderObjectives();
}

/* ---------- Teléfono ---------- */
function startRinging() {
  if (S.f.phoneDone || S.f.ringing || S.ended || S.cap !== 1) return;
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

/* ---------- Objetivos y libreta del capítulo ---------- */
function objectives1() {
  const n = clueCount(), L = [];
  L.push({ t: 'Recuperar el Expediente NOCTUA', done: S.f.docTaken, main: true });
  L.push({ t: `Reunir las 3 pistas (${n}/3)`, done: n === 3 });
  if (S.seen.cabLocked) L.push({ t: 'Abrir el archivador', done: S.f.cabOpen });
  if (S.f.pcOn) L.push({ t: 'Descubrir la clave de Ferraz', done: S.f.logged });
  if (S.seen.mail) L.push({ t: '¿Qué día cerró la oficina?', done: !!S.seen.calendar });
  if (S.seen.mail || has('uv')) L.push({ t: 'Hallar el ancla «a oscuras»', done: S.clues.ancla });
  if (n === 3 || S.f.safeOpen) L.push({ t: 'Abrir la caja (luna·ojo·ancla)', done: S.f.safeOpen });
  if (S.f.docTaken) L.push({ t: 'Salir de ahí', done: S.ended });
  return L;
}

function nbPage1(tab) {
  let h = '';
  if (tab === 'luna') {
    h = `<div class="sub">PISTA 01 · SÍMBOLO DE LA LUNA</div><h2>La luna duerme…</h2><div class="clip">`;
    h += `<svg viewBox="0 0 300 220">${symMoon(52, 60, 34)}<text x="110" y="52" font-family="${typeFont}" font-size="14" font-weight="bold">«La luna duerme</text><text x="110" y="72" font-family="${typeFont}" font-size="14" font-weight="bold">el día en que</text><text x="110" y="92" font-family="${typeFont}" font-size="14" font-weight="bold">cerramos.»</text>`
      + (S.seen.calendar ? `<rect x="110" y="120" width="90" height="80" fill="#e8dcc2" stroke="${INK}" stroke-width="3"/><rect x="110" y="120" width="90" height="20" fill="#7c2434"/><text x="155" y="135" text-anchor="middle" font-family="${typeFont}" font-size="11" fill="#e8dcc2" font-weight="bold">OCT 1987</text><text x="155" y="180" text-anchor="middle" font-family="${typeFont}" font-size="30" font-weight="bold">14</text><ellipse cx="155" cy="170" rx="30" ry="22" fill="none" stroke="#e0283f" stroke-width="3"/>` : '')
      + `</svg>`;
    h += S.seen.mail ? `<div class="txt">Del correo de Ferraz.${S.seen.calendar ? '<br>El calendario del escritorio marca el <b>CIERRE</b> el 14 de octubre.<br><b>☾ = 14</b>' : '<br>¿Qué día cerró la oficina?'}</div>` : nbNone('Ferraz habrá dejado algo en su computadora.');
    h += `</div>`;
  } else if (tab === 'ojo') {
    h = `<div class="sub">PISTA 02 · SÍMBOLO DEL OJO</div><h2>Lo que cuento</h2><div class="clip">`;
    h += S.clues.ojo ? `<svg viewBox="0 0 300 260"><rect width="300" height="260" fill="#e3d6bc"/>${tallySheet(150, 150, 0.62)}</svg><div class="txt">Hoja del archivador (cajón 1).<br>Un ojo y rayas de conteo en grupos de cinco.<br>¿Cuántas son?</div>` : nbNone('Algo guardado bajo llave.');
    h += `</div>`;
  } else if (tab === 'ancla') {
    h = `<div class="sub">PISTA 03 · SÍMBOLO DEL ANCLA</div><h2>Solo a oscuras</h2><div class="clip">`;
    h += S.clues.ancla ? `<svg viewBox="0 0 300 220"><rect width="300" height="220" fill="#1c2436"/><g filter="url(#glowUV)">${symAnchor(90, 110, 44, '#e8c2ff', 7)}<text x="200" y="130" text-anchor="middle" font-family="Rockwell,Georgia,serif" font-weight="900" font-size="54" fill="#e8c2ff">XXXI</text></g></svg><div class="txt">Tinta invisible en el cuadro del faro, revelada con la linterna UV.<br>Números romanos.</div>` : nbNone('«El ancla solo aparece a oscuras.»');
    h += `</div>`;
  } else if (tab === 'placa') {
    h = `<div class="sub">CAJA FUERTE HALCÓN · TRES RUEDAS 00–99</div><h2>El orden</h2><div class="clip">`;
    h += S.seen.plate ? `<svg viewBox="0 0 300 120"><rect x="10" y="10" width="280" height="100" rx="6" fill="#b08a4a" stroke="${INK}" stroke-width="4"/>${symMoon(70, 60, 26)}${symEye(150, 60, 34, INK, 5)}${symAnchor(230, 60, 32, INK, 5)}</svg><div class="txt">Rueda I: luna<br>Rueda II: ojo<br>Rueda III: ancla</div>` : nbNone('Mira la caja fuerte de cerca.');
    h += `</div>`;
  }
  return h;
}

function hint1() {
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
    [S.f.docTaken && !S.f.photoSeen, 'En la caja había algo más, junto al expediente.'],
    [S.f.ch1Done, 'Control tiene razón: hay que salir de aquí. La puerta.'],
  ];
  const h = H.find(x => x[0]);
  think(h ? h[1] : 'Observa. Todo en esta oficina está aquí por una razón.');
}

/* ---------- Ambiente vivo de la oficina: neón, lluvia y el teléfono que vibra ---------- */
function tick1(t) {
  // Neón que respira con caídas al azar; la «E» rota se apaga más. A ~10 Hz: basta para el ojo
  // y cada cambio obliga a recomponer la capa de luces.
  if (t - (tick1.neonT || 0) > 95) {
    tick1.neonT = t;
    const n = Math.random() < 0.06 ? 0.25 : 0.85 + Math.sin(t / 900) * 0.08;
    const ng = $('#neonGlow'), sg = $('#neonSign');
    if (ng) { ng.setAttribute('opacity', n.toFixed(2)); sg.setAttribute('opacity', (0.5 + n * 0.5).toFixed(2)); Sfx.neon(n); }
    $$('.neonBroken').forEach(e => e.setAttribute('opacity', Math.random() < 0.18 ? 0.15 : 1));
  }
  // Lluvia (~30 Hz basta)
  if (t - (tick1.rainT || 0) > 33) {
    tick1.rainT = t;
    const k = (t % 550) / 550, rn = $('#rain');
    if (rn) rn.setAttribute('transform', `translate(${f1(20 - 30 * k)} ${f1(-320 + 320 * k)})`);
  }
  // El teléfono vibra mientras suena
  const ph = $('#gPhone');
  if (ph) ph.setAttribute('transform', S.f.ringing && Math.floor(t / 2600 * 2) % 2 === 0 && (t % 2600) < 1000 ? `translate(${(Math.random() * 4 - 2).toFixed(1)} ${(Math.random() * 2 - 1).toFixed(1)})` : '');
}

/* ---------- Registro del capítulo ---------- */
CAPS[1] = {
  label: 'La oficina de Aurelio Ferraz, de noche',
  build: buildScene,
  onHot: onHot1,
  objectives: objectives1,
  counter: () => `PISTAS ${clueCount()}/3`,
  nbTabs: () => [['luna', '01 LUNA'], ['ojo', '02 OJO'], ['ancla', '03 ANCLA'], ['placa', 'PLACA']],
  nbPage: nbPage1,
  hint: hint1,
  tick: tick1,
  useItem(k) {
    if (k === 'foto') { think('«Tango, verano del 79. El único que siempre me espera.» Ferraz y su perro. Lo único alegre de esta oficina.'); return true; }
    if (k === 'expediente') { think('El Expediente NOCTUA. Pesa más de lo que debería.'); return true; }
  },
  selLine(k) {
    if (k === 'uv') return 'Enciendo la linterna UV. Todo se vuelve violeta… La tinta invisible debería brillar bajo esta luz.';
    if (k === 'llave') return 'La llave pequeña. ¿Qué cerradura es tan diminuta?';
  },
};
