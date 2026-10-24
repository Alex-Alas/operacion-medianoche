/* =====================================================================
   [8b] CAPÍTULO 2 · LA RECEPCIÓN: salir del 3.er piso por el ascensor
   de servicio. Primero la corriente (abrecartas → tornillos → fusible de
   20 A, corregido en tinta UV); después, en cualquier orden, la llave
   (centralita → conserje → candado FARO) y «marcar salida» (turnos +
   día del cierre → la tarjeta de Ibáñez). El gancho: la tarjeta n.º 13.
   ===================================================================== */
// Rarezas del cap. 2 (se suman a las del cap. 1 en la libreta y en el informe)
const ODD2 = {
  subida:     'La escalera está encadenada y el ascensor no tenía corriente. No sé por dónde subí.',
  reloj:      'El reloj de la recepción anda hacia atrás.',
  firma:      'Una firma en el libro de visitas, a las 23:41. La tinta estaba fresca. La letra se parece a la mía.',
  eco:        'La extensión 13 transmite esta misma recepción, con un segundo de retraso.',
  paraguas:   'Un paraguas mojado en el paragüero. Igual que el abrigo de la oficina.',
  expediente: 'El Expediente NOCTUA: «personal retenido». Doce nombres… y un decimotercero, tachado.',
};
Object.assign(ITEMS, {
  abrecartas: { name: 'Abrecartas',          use: true },
  llaveAsc:   { name: 'Llave de servicio',   use: true },
});
Object.assign(CUR, {
  abrecartas: cursorUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><path d="M4 28L22 10l6-6" stroke="#150e1b" stroke-width="7" stroke-linecap="round"/><path d="M4 28L22 10l6-6" stroke="#d6dee6" stroke-width="3" stroke-linecap="round"/><path d="M3 29l6-6" stroke="#5e3532" stroke-width="5" stroke-linecap="round"/></svg>`, 28, 4, 'pointer'),
  llaveAsc: CUR.llave,
});
const SECRET = 'FARO', CLOSER = 'ibanez', FUSE_OK = 20;
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const newC2 = () => ({
  live: false, t2: Date.now(), power: false, screws: [false, false, false, false], lidOpen: false,
  drawerOpen: false, abreTaken: false, fuseIn: null, burnt: [], uvSeen: false,
  pbxSeen: false, heard: {}, plug: null, letters: [0, 0, 0, 0], lockOpen: false, keyTaken: false, keyIn: false,
  panelRead: false, turnosSeen: false, visitasSeen: false, punched: null, rejected: [], mine: false, cardSeen: false,
  calling: false, needle: FLOOR_ANG.PB, err: { fus: 0, cand: 0, tarj: 0 }, blackouts: 0, hidden: null, tiers: {}, thought: false,
});
S.c2 = newC2();

/* ---------- Del cap. 1 al cap. 2 ---------- */
// Lo que se lleva del cap. 1 (y lo que se guarda en el navegador)
function snapshotCh1() {
  return { v: 1, cap: 2, items: S.items.filter(k => ITEMS[k] && k !== 'llave'), odd: [...S.odd], t1: Date.now() - S.t0,
    wrongPass: S.f.wrongPass, wrongSafe: S.f.wrongSafe, hints: S.hints };
}
// Para empezar directo en el cap. 2 (?cap=2) sin partida guardada
const defaultCarry = () => ({ v: 1, cap: 2, items: ['libreta', 'uv', 'foto', 'expediente'], odd: [], t1: 0, wrongPass: 0, wrongSafe: 0, hints: 0 });

async function goCap2() {
  if (S.busy) return;
  S.busy = true; closeCloseup(); deselect();
  clearTimeout(S.ringStop); Sfx.ringStop(); S.f.ringing = false; S.f.phoneDone = true;
  Sfx.drawer();
  await fade(true);
  const d = snapshotCh1(); Save.write(d);
  S.busy = false;
  enterCap2(d);
}
async function enterCap2(d) {
  S.cap = 2; S.items = d.items.slice(); S.fresh = new Set(); S.sel = null; S.odd = new Set(d.odd);
  S.hints = d.hints || 0; S.f.wrongPass = d.wrongPass || 0; S.f.wrongSafe = d.wrongSafe || 0; S.t1 = d.t1 || 0;
  if (!S.t0) S.t0 = Date.now();
  S.c2 = newC2(); Presence.p = 0; S.busy = true;
  closeCloseup(); closeNotebook();
  setScene(); renderInv(); renderObjectives(); renderHidden();
  if (!Save.read()) Save.write(d);
  await wait(500);
  fade(false);
  await wait(700);
  think('…');
  S.busy = false;
  await Dialog.say([
    C('Polilla, ¿sigues ahí? Te perdí unos segundos.', 'alarma'),
    C('Escucha: la escalera está encadenada desde el 87. Tu única salida es el ascensor de servicio.'),
    C('Ese piso no tiene corriente. Tendrás que arreglártelas.'),
    C('Y Polilla… no vuelvas a entrar a esa oficina. Pase lo que pase.', 'alarma'),
  ]);
  think(['La recepción. Todo a oscuras, salvo el cartel de SALIDA… sobre una puerta encadenada.', 'Mejor no quedarme quieto mucho rato.']);
  S.c2.live = true; S.c2.t2 = Date.now(); S.lastAct = performance.now();
}

/* ---------- Escena principal: qué pasa al tocar cada cosa ---------- */
const FAIL2 = {
  uv: 'Paso la luz violeta. Nada brilla ahí.',
  abrecartas: 'El abrecartas no sirve para esto.',
  llaveAsc: 'La llave no entra aquí.',
  llave: 'La llave pequeña no entra aquí.',
};
const ACT2 = {
  puertaOf() {
    if (Presence.p > 0.6) { think('Hay alguien del otro lado del vidrio. No pienso abrir.'); return; }
    think(once('puertaOfLook') ? ['La puerta de la oficina de Ferraz. Del otro lado, la luz del neón.', 'Control lo dijo claro: no volver a entrar.'] : 'No. No vuelvo a entrar.');
  },
  reloj() {
    if (once('relojLook')) { think(['Un reloj de pared. Las doce menos dos.', '…No. Las doce menos tres. El segundero gira al revés.']); noteOdd('reloj'); return; }
    think('El reloj sigue andando hacia atrás.');
  },
  fusibles() { openCloseup('fusibles'); },
  casilleros() { openCloseup('casilleros'); },
  afiche() { think(['Un búho y un lema: «velamos por usted».', 'En latín, noctua es la lechuza. Y también un género de polillas.']); },
  checador() { openCloseup('checador'); },
  mostrador() { openCloseup('mostrador'); },
  centralita() { openCloseup('centralita'); },
  ascensor() { openCloseup('ascensor'); },
  escalera() {
    if (once('escaleraLook')) { think(['Una puerta cortafuego con cadena y un candado industrial.', 'Oxidado. Nadie la abrió en años.']); return; }
    noteOdd('subida'); think(['Si la escalera está cerrada y el ascensor no tenía corriente…', '¿Por dónde subí yo?']);
  },
  paraguas() {
    if (once('paraguasLook')) { think('Un paragüero con un paraguas negro.'); return; }
    noteOdd('paraguas'); think(['Lo toco. Está empapado.', 'Alguien entró de la lluvia hace muy poco. Como con el abrigo de la oficina.']);
  },
  planta() { think('Un ficus muerto. Ni las plantas aguantaron este piso.'); },
  banco() { think('Un banco de espera y revistas de 1987. Nadie vino a buscarlas.'); },
};
// Desde la escena principal, un objeto se usa entrando al primer plano donde sirve
const USE_IN = { fusibles: ['abrecartas', 'uv'], ascensor: ['llaveAsc'] };
function onHot2(id) {
  Sfx.click();
  const h = S.c2.hidden;
  if (h?.spot === id) {
    S.c2.hidden = null; renderHidden(); addItem(h.k); renderObjectives();
    think(['Aquí está.', 'Yo no lo dejé aquí.']); return;
  }
  if (S.sel) {
    if (USE_IN[id]?.includes(S.sel)) { ACT2[id](); return; }
    think(FAIL2[S.sel] || 'Eso no sirve aquí.'); return;
  }
  ACT2[id]?.();
}

/* ---------- Primeros planos ---------- */
// Envuelve un manejador: si hay un objeto seleccionado que no sirve ahí, lo dice y no hace nada más
const H = (fn, ...uses) => () => { if (S.sel && !uses.includes(S.sel)) { think(FAIL2[S.sel] || 'Eso no sirve aquí.'); return; } fn(); };
const c2r = () => renderCloseup();

regCU({
  mostrador: {
    title: 'MOSTRADOR DE RECEPCIÓN',
    enter() { if (once('mostLook')) think('El mostrador. Un libro de visitas, el timbre y una carpeta de turnos.'); },
    svg() {
      const c = S.c2;
      let s = cuBake('mostBase', cuMostradorBase);
      s += c.drawerOpen ? cuBake('mostDrawerOpen', () => cuMostradorDrawer(true)) : cuBake('mostDrawerClosed', () => cuMostradorDrawer(false));
      if (c.drawerOpen && !c.abreTaken) s += cuBake('abre', cuAbrecartas);
      // La firma de las 23:41: la tinta todavía brilla
      s += `<g transform="rotate(-3 420 330)">${T(470, 500, '— — —', { s: 15, f: handFont, b: false, c: '#2a2030' })}${T(540, 500, '23:41', { s: 17, f: handFont, b: false, c: '#1c2a5a' })}
        <path d="M612 506c14 -30 26 -30 20 -6s10 -26 22 -14s4 18 18 4s20 -10 30 -2" stroke="#1c2a5a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path d="M628 488l6 -4M668 492l5 -3" stroke="#fff" stroke-width="2" opacity=".8"/></g>`;
      s += hotPath('visitas', 'Libro de visitas', [[86, 96], [770, 60], [790, 560], [100, 600]]);
      s += hotPath('firma', 'Firma', [[456, 462], [740, 446], [746, 530], [460, 548]]);
      s += hotPath('turnos', 'Libro de turnos', [[856, 60], [1516, 84], [1500, 620], [840, 596]]);
      s += hotPath('timbre', 'Timbre', box(150, 596, 350, 730));
      if (!c.drawerOpen) s += hotPath('cajon', 'Cajón', box(540, 744, 1060, 884));
      else {
        if (!c.abreTaken) s += hotPath('abrecartas', 'Abrecartas', [[530, 690], [850, 660], [856, 744], [536, 770]]);
        s += hotPath('sellos', 'Sellos', box(890, 650, 1050, 790));
      }
      return s;
    },
    hot: {
      visitas: H(() => { S.c2.visitasSeen = true; think(['El libro de visitas de octubre de 1987. La última visita es del 14, a las 9:05.', 'El 13 vino un técnico de TEMPUS. Anotó: «checador ↔ ascensor».']); }),
      firma: H(() => { noteOdd('firma'); think(['Al pie de la página hay una firma nueva. Sin fecha. Solo una hora: 23:41.', 'Paso el dedo. La tinta mancha.', 'Esa letra… se parece demasiado a la mía.']); }),
      turnos: H(() => {
        S.c2.turnosSeen = true;
        think(once('turnosLook') ? ['«Turnos de cierre, octubre de 1987». Quién cerraba cada semana: llaves, luces y checador.', 'Al margen, con otra tinta: «cambié con el de la semana siguiente — R.M.».']
          : 'Los turnos de cierre de octubre. Y la nota de Méndez al margen.');
      }),
      timbre: H(() => { Sfx.bell(); Presence.add('noise'); think(once('timbre') ? ['Ding.', 'El sonido se queda flotando demasiado tiempo.'] : 'Mejor no volver a tocarlo.'); }),
      cajon: H(() => { S.c2.drawerOpen = true; Sfx.drawer(); think('El cajón se abre sin resistencia. Sellos de goma, clips… y un abrecartas.'); c2r(); }),
      abrecartas: H(() => { S.c2.abreTaken = true; addItem('abrecartas'); c2r(); think(['Un abrecartas de acero, delgado y plano.', 'Sirve para más cosas que abrir cartas.']); }),
      sellos: H(() => think('«PAGADO» y «ANULADO». Lo que esta empresa hacía con la gente, en dos palabras.')),
    },
  },

  fusibles: {
    title: 'TABLERO GENERAL · PISO 3',
    enter() {
      const c = S.c2;
      if (!c.lidOpen && once('fusLook')) think(['El tablero eléctrico del piso. Una tapa de chapa con cuatro tornillos.', 'Tornillos de ranura.']);
      else if (c.lidOpen && !c.power && once('fusOpenLook')) think(['Cuatro zócalos. El GENERAL está vacío.', 'Hay una lata de repuestos: fusibles de 10, 15 y 20 amperios.']);
    },
    svg() {
      const c = S.c2;
      if (!c.lidOpen) {
        let s = cuBake('fusClosed', cuFusiblesClosed);
        SCREWS.forEach(([x, y], i) => { s += screwSvg(x, y, c.screws[i]); });
        s += hotPath('tapa', 'Tapa del tablero', box(520, 160, 1080, 600));
        SCREWS.forEach(([x, y], i) => { if (!c.screws[i]) s += hotPath('tornillo' + i, 'Tornillo', box(x - 40, y - 40, x + 40, y + 40)); });
        return s;
      }
      let s = cuBake('fusOpen', cuFusiblesOpen);
      s += c.fuseIn ? fuseSvg(540, 375, FUSE_COL[c.fuseIn], c.fuseIn + ' A') : `<rect x="512" y="318" width="56" height="114" rx="6" fill="#07050a" stroke="${INK}" stroke-width="3"/>`;
      for (const a of [10, 15, 20]) if (c.fuseIn !== a) s += fuseSvg(SPARE_X[a], 735, FUSE_COL[a], a + ' A', c.burnt.includes(a));
      s += cuFusibleLever(c.power);
      s += hotPath('zocalo', 'Zócalo GENERAL', box(486, 280, 594, 470)) + hotPath('etiqueta', 'Etiqueta', box(470, 514, 610, 640));
      s += hotPath('otros', 'Fusibles', box(636, 280, 1046, 580)) + hotPath('palanca', 'Palanca general', box(1046, 220, 1144, 560));
      for (const a of [10, 15, 20]) if (c.fuseIn !== a) s += hotPath('f' + a, `Fusible de ${a} A`, box(SPARE_X[a] - 34, 664, SPARE_X[a] + 34, 806));
      return s;
    },
    uv() { return S.c2.lidOpen ? uvFusibles() : ''; },
    uvAt(x, y) { if (S.c2.lidOpen && Math.hypot(x - 600, y - 610) < 150) seeUV(); },
    hot: {
      tapa: H(() => think(S.sel === 'abrecartas' ? 'El abrecartas va en los tornillos de las esquinas.' : S.c2.screws.some(Boolean) ? 'Quedan tornillos.' : '«PELIGRO». Cuatro tornillos sujetan la tapa.'), 'abrecartas'),
      ...Object.fromEntries([0, 1, 2, 3].map(i => ['tornillo' + i, H(() => unscrew(i), 'abrecartas')])),
      zocalo: H(() => {
        const c = S.c2;
        if (c.power) { think('Mejor no meter los dedos con corriente.'); return; }
        if (c.fuseIn) { think(`Saco el fusible de ${c.fuseIn} A.`); c.fuseIn = null; Sfx.screw(); c2r(); return; }
        think('El zócalo GENERAL está vacío. Alguien sacó el fusible.');
      }),
      etiqueta: H(() => {
        if (S.sel === 'uv') { seeUV(true); return; }
        think(S.c2.uvSeen ? 'Impreso: «10 A». Encima, en tinta invisible, la letra de Ferraz: «¡20 A!».'
          : ['«GENERAL P.3 — 10 A».', 'Alrededor de la etiqueta hay marcas de dedos, como si alguien la hubiera tocado mucho.']);
      }, 'uv'),
      otros: H(() => think('Alumbrado, centralita, ascensor. Esos fusibles están enteros. Falta el general.')),
      f10: H(() => placeFuse(10)), f15: H(() => placeFuse(15)), f20: H(() => placeFuse(20)),
      palanca: H(() => pullLever()),
    },
  },

  centralita: {
    title: 'CENTRALITA TELEFÓNICA',
    enter() {
      S.c2.pbxSeen = true;
      if (!S.c2.power) think(once('pbxDead') ? ['Una centralita de clavijas. Ocho líneas internas y un directorio.', 'Sin corriente, las lámparas están muertas.'] : 'Sin corriente no funciona.');
      else if (once('pbxLook')) think('Con corriente, las lámparas de las líneas brillan apenas. La clavija conecta y el sonido sale por el parlante.');
    },
    svg() {
      let s = cuBake('pbx', cuCentralitaBase) + cuCentralitaLive(S.c2.power, S.c2.plug);
      s += hotPath('directorio', 'Directorio', box(200, 96, 540, 530));
      for (const [n, a] of EXT) { const [x, y] = jackPos(n); s += hotPath('j' + n, `Extensión ${n}${a ? ' · ' + a : ''}`, box(x - 60, y - 96, x + 60, y + 56)); }
      s += hotPath('auricular', 'Auriculares', box(1090, 680, 1270, 810));
      return s;
    },
    hot: {
      directorio: H(() => think('El directorio de extensiones, del 10 al 17. La 13 no tiene nombre.')),
      auricular: H(() => think('Auriculares de operadora. Huelen a laca de 1987.')),
      ...Object.fromEntries(EXT.map(([n]) => ['j' + n, H(() => callExt(n))])),
    },
  },

  casilleros: {
    title: 'CASILLEROS DE CORRESPONDENCIA',
    enter() { if (once('casLook')) think(['Un casillero con el nombre de cada empleado.', 'El de Méndez, el conserje, tiene puerta de chapa… y un candado de letras.']); },
    svg() {
      const c = S.c2;
      let s = cuBake('cas', cuCasillerosBase) + cuCasilleroMendez(c.lockOpen, c.lockOpen && !c.keyTaken);
      for (let k = 0; k < 15; k++) if (k !== CELL_MENDEZ) { const [x, y, w, h] = cellBox(k); s += hotPath('c' + k, CELL_NAMES[k] ? `Casillero · ${CELL_NAMES[k]}` : 'Casillero sin nombre', box(x, y, x + w, y + h + 40)); }
      const [x, y, w, h] = cellBox(CELL_MENDEZ);
      if (c.lockOpen) s += c.keyTaken ? hotPath('mendez', 'Casillero · R. Méndez', box(x, y, x + w, y + h)) : hotPath('llave', 'Llave de servicio', box(x + w / 2 - 50, y + 30, x + w / 2 + 50, y + 230));
      else s += hotPath('candado', 'Candado', box(PADLOCK.x0, y - 30, PADLOCK.x1, PADLOCK.y1));
      return s;
    },
    html() {
      if (S.c2.lockOpen) return;
      S.c2.letters.forEach((v, i) => {
        const d = document.createElement('div'); d.className = 'drum letters';
        Object.assign(d.style, { left: (53 + i * 6.55) + '%', top: '51%', width: '5.9%', height: '22%' });
        d.innerHTML = `<button aria-label="Letra ${i + 1}: siguiente">▲</button><div class="num" id="let${i}">${ABC[v]}</div><button aria-label="Letra ${i + 1}: anterior">▼</button>`;
        const [up, , down] = d.children;
        up.onclick = () => turnLetter(i, 1); down.onclick = () => turnLetter(i, -1);
        d.addEventListener('wheel', e => { e.preventDefault(); turnLetter(i, e.deltaY < 0 ? 1 : -1); }, { passive: false });
        $('#cuHtml').appendChild(d);
      });
      const b = document.createElement('button'); b.className = 'unlock'; b.textContent = 'ABRIR';
      Object.assign(b.style, { left: '59.4%', top: '75.6%', width: '13%', height: '7%' });
      b.onclick = () => { if (!S.busy && !Dialog.open) tryLock(); };
      $('#cuHtml').appendChild(b);
    },
    hot: {
      llave: H(() => { S.c2.keyTaken = true; addItem('llaveAsc'); c2r(); renderObjectives(); think('La llave de servicio del ascensor. «ASC.», dice la etiqueta roja.'); }),
      mendez: H(() => think('El casillero de Méndez. Ya no queda nada.')),
      candado: H(() => think(S.c2.heard[14] ? 'Cuatro letras. «Lo que él pintó».' : 'Un candado de cuatro letras. Ni idea de la clave… todavía.')),
      ...Object.fromEntries(Array.from({ length: 15 }, (_, k) => ['c' + k, H(() => think(CELL_LINES[k] || `El casillero de ${CELL_NAMES[k]}. Papeles viejos.`))])),
    },
  },

  checador: {
    title: 'RELOJ CHECADOR TEMPUS',
    enter() {
      if (once('chkLook')) think(['Un reloj checador. Las tarjetas de los doce empleados siguen en ENTRADA. Ninguna en SALIDA.', 'Las agujas marcan las 23:47. No se mueven.'].concat(S.c2.power ? [] : ['Sin corriente, no marca nada.']));
      else if (!S.c2.power) think('Sin corriente, el checador no marca.');
    },
    svg() {
      const c = S.c2;
      let s = cuBake('chk', cuChecadorBase) + cuChecadorLive({ punched: c.punched, rejected: c.rejected, mine: c.mine, power: c.power });
      STAFF.forEach(([id, name], i) => { if (c.punched === id) return; const [x, y] = pocketXY('in', i); s += hotPath('t_' + id, `Tarjeta · ${name}`, box(x + 14, y - 6, x + 186, y + 86)); });
      if (c.mine) { const [x, y] = pocketXY('in', 12); s += hotPath('mia', 'Tarjeta n.º 13', box(x + 14, y - 6, x + 186, y + 86)); }
      if (c.punched) { const [x, y] = pocketXY('out', 0); s += hotPath('marcada', 'Tarjeta marcada', box(x + 14, y - 6, x + 186, y + 86)); }
      s += hotPath('maquina', 'Reloj', box(660, 90, 940, 370));
      return s;
    },
    hot: {
      ...Object.fromEntries(STAFF.map(([id]) => ['t_' + id, H(() => punch(id))])),
      mia: H(() => showTarjeta()),
      marcada: H(() => think('La tarjeta de Ibáñez, marcada en SALIDA a las 23:47. Treinta y siete años tarde.')),
      maquina: H(() => think('Las agujas del checador marcan las 23:47. No se mueven.')),
    },
  },

  ascensor: {
    title: 'ASCENSOR DE SERVICIO',
    enter() {
      S.c2.panelRead = true; renderObjectives();
      if (once('ascLook')) think(['El panel del ascensor. Instrucciones grabadas en el bronce:', 'llave en SERVICIO, el responsable de cierre marca SALIDA y, recién entonces, LLAMAR.']);
    },
    svg() {
      const c = S.c2;
      let s = cuBake('asc', cuAscensorBase) + cuAscensorLive({ power: c.power, keyIn: c.keyIn, ready: elevReady() });
      s += hotPath('placa', 'Instrucciones', box(676, 84, 1044, 352)) + hotPath('lamparas', 'Lámparas', box(720, 380, 1000, 510));
      s += hotPath('cerradura', 'Cerradura de servicio', box(790, 530, 930, 670)) + hotPath('llamar', 'Botón LLAMAR', box(800, 712, 920, 830));
      s += hotPath('puertas', 'Puertas', box(0, 0, 470, 900));
      return s;
    },
    hot: {
      placa: H(() => think('«1 · Llave en SERVICIO. 2 · El responsable de cierre marca SALIDA en el checador. 3 · Pulse LLAMAR.»')),
      lamparas: H(() => think(!S.c2.power ? 'Las dos lámparas, apagadas.' : elevReady() ? 'EN SERVICIO, en verde.' : 'FUERA DE HORARIO, en rojo.')),
      cerradura: H(() => {
        const c = S.c2;
        if (c.keyIn) { think('La llave está puesta, en SERVICIO.'); return; }
        if (S.sel === 'llaveAsc') {
          c.keyIn = true; dropItem('llaveAsc'); Sfx.unlock(); c2r(); renderObjectives();
          think(c.power ? 'La llave entra y gira hasta SERVICIO. Clac.' : 'La llave entra y gira… pero sin corriente no se enciende nada.');
          return;
        }
        think(has('llaveAsc') ? 'Una cerradura de servicio. La llave del conserje tendría que entrar aquí.' : 'Una cerradura de llave: APAGADO o SERVICIO.');
      }, 'llaveAsc'),
      llamar: H(() => callElevator()),
      puertas: H(() => think('Las puertas no ceden ni un milímetro.')),
    },
  },
});

/* ---------- Corriente: tornillos, fusibles y palanca ---------- */
function unscrew(i) {
  const c = S.c2;
  if (S.sel !== 'abrecartas') {
    think(has('abrecartas') ? 'Con los dedos no gira. El abrecartas podría hacer de destornillador.' : 'Tornillos de ranura. Con las uñas no voy a poder.');
    return;
  }
  c.screws[i] = true; Sfx.screw();
  const n = c.screws.filter(Boolean).length;
  if (n < 4) { think(['Gira. Uno menos.', 'Otro más.', 'Queda uno.'][n - 1]); c2r(); return; }
  c.lidOpen = true; dropItem('abrecartas'); Sfx.drawer();
  think(['El último tornillo cae. La tapa se abre con un chirrido.', 'Dejo el abrecartas en el borde del tablero.']);
  c2r(); CU.fusibles.enter();
}
function seeUV(clicked) {
  const c = S.c2;
  if (c.uvSeen) { if (clicked) think('«¡20 A! El de 10 salta. — A.F.»'); return; }
  c.uvSeen = true; Sfx.clue();
  think(['Bajo la luz violeta, junto a la etiqueta, aparece la letra de Ferraz:', '«¡20 A! El de 10 salta. — A.F.»']);
}
function placeFuse(a) {
  const c = S.c2;
  if (c.power) { think('Ya hay corriente. No hace falta.'); return; }
  if (c.burnt.includes(a)) { think(`El de ${a} A está quemado. Negro.`); return; }
  c.fuseIn = a; Sfx.screw(); c2r();
  think(`Pongo el fusible de ${a} A en el zócalo GENERAL.`);
}
function pullLever() {
  const c = S.c2;
  if (c.power) { think('La palanca está arriba. Hay corriente.'); return; }
  if (!c.fuseIn) { Sfx.drawer(); think('Sin fusible en el zócalo GENERAL, la palanca sube y vuelve a caer.'); return; }
  if (c.fuseIn === FUSE_OK) { powerOn(); return; }
  const a = c.fuseIn;
  Sfx.spark(); c.burnt.push(a); c.fuseIn = null; c.err.fus++; Presence.add('error');
  const fl = document.createElement('div');
  Object.assign(fl.style, { position: 'absolute', inset: 0, background: '#fff6d0', opacity: 0.85, transition: 'opacity .5s', pointerEvents: 'none', zIndex: 5 });
  $('#cuHtml').appendChild(fl); requestAnimationFrame(() => { fl.style.opacity = 0; });
  c2r();
  think(a === 10 ? ['¡Chispazo! El fusible de 10 A se quema al instante.', 'Y del otro lado del vidrio, algo se movió.'] : ['Aguanta un segundo… y revienta.', 'No era ese.']);
}
function powerOn() {
  const c = S.c2;
  c.power = true; Sfx.powerOn(); c2r(); renderObjectives();
  toast('CORRIENTE', 'PISO 3');
  think(['Subo la palanca…', 'Clac. Un zumbido recorre las paredes. Los tubos parpadean… y se encienden.', '¿Corriente? En un edificio cerrado desde 1987.']);
}

/* ---------- Centralita: lo que se oye en cada extensión ---------- */
const LN = (text, name, lbl, screen) => ({ who: 'x', text, name, lbl, screen });
const LINES = {
  10: { d: [LN('…catorce… veintitrés… treinta y uno…', 'EXT. 10', 'DIRECCIÓN', 'GRABACIÓN'), LN('…no confíen en el edificio… no confíen en el…', 'EXT. 10', 'DIRECCIÓN', 'GRABACIÓN'), LN('— la grabación vuelve a empezar —', 'EXT. 10', 'DIRECCIÓN', 'GRABACIÓN')],
        after: 'La voz de Ferraz, grabada. La combinación de la caja. Eso ya no me sirve.' },
  11: { ring: true, after: ['Suena un teléfono… el del mostrador, a mi lado.', 'Me estoy llamando a mí. Desconecto.'] },
  12: { d: [LN('A… L… B… A.', 'EXT. 12', 'ARCHIVO'), LN('ALBA. ALBA. ALBA.', 'EXT. 12', 'ARCHIVO'), LN('…alba…', 'EXT. 12', 'ARCHIVO')],
        after: '«ALBA», una y otra vez. ¿Una clave? ¿O solo alguien que no puede dormir?' },
  13: { echo: true, after: ['La 13 no tiene nombre. Se oye una habitación en silencio: lluvia, un zumbido…', 'Chasqueo los dedos. Un segundo después, en el parlante: clic.', 'Es esta recepción.'] },
  14: { d: [LN('— bip —', 'EXT. 14', 'CONSERJERÍA', 'CONTESTADOR'), LN('Habla Méndez, conserje. Si se trabó el ascensor de servicio, la llave está en mi casillero.', 'EXT. 14', 'CONSERJERÍA', 'CONTESTADOR'),
        LN('El candado lo eligió el jefe. Cuatro letras: lo que él pintó.', 'EXT. 14', 'CONSERJERÍA', 'CONTESTADOR'), LN('Efe… —shhhhh— …erre… ¿Se oye? Esta línea es un desastre.', 'EXT. 14', 'CONSERJERÍA', 'CONTESTADOR'), LN('— bip —', 'EXT. 14', 'CONSERJERÍA', 'CONTESTADOR')],
        after: ['La llave del ascensor está en el casillero de Méndez.', 'Cuatro letras. Efe, algo, erre, algo. «Lo que él pintó».'] },
  15: { busy: true, after: 'Ocupado. ¿Ocupado? ¿Quién habla desde contabilidad a esta hora?' },
  16: { d: [LN('…desaparecidos… doce… expediente cerrado…', 'EXT. 16', 'SINIESTROS'), LN('— estática —', 'EXT. 16', 'SINIESTROS')],
        after: 'Retazos de una conversación vieja. «Desaparecidos: doce».' },
  17: { d: [LN('Portería… ¿Hola?', 'PORTERÍA', 'P.B.'), LN('¿Tercer piso? Ahí no hay nadie desde el ochenta y siete.', 'PORTERÍA', 'P.B.'), LN('…Espere. ¿Usted desde dónde me llama?', 'PORTERÍA', 'P.B.'), LN('— clic —', 'PORTERÍA', 'P.B.')],
        after: 'Cortó.' },
};
const LINE_NOTES = {
  10: '«…catorce… veintitrés… treinta y uno…» (Ferraz, grabado)', 11: 'Suena aquí, en el mostrador.', 12: '«ALBA. ALBA. ALBA.»',
  13: 'Se oye esta misma recepción, un segundo tarde.', 14: '«La llave está en mi casillero. El candado: cuatro letras, lo que pintó el jefe. Efe… …erre…»',
  15: 'Ocupado.', 16: '«…desaparecidos… doce…»', 17: '«Ahí no hay nadie desde el ochenta y siete.»',
};
async function callExt(n) {
  const c = S.c2;
  if (!c.power) { think('Sin corriente, la clavija no hace nada.'); return; }
  c.plug = n; Sfx.plug(); c2r();
  S.busy = true;
  await wait(500);
  const L = LINES[n];
  c.heard[n] = true;
  if (L.ring) { Sfx.ringStart(); await wait(2600); Sfx.ringStop(); }
  else if (L.busy) { Sfx.busy(); await wait(1500); }
  else if (L.echo) { await wait(600); Sfx.echoClick(); await wait(1500); noteOdd('eco'); }
  S.busy = false;
  if (L.d) await Dialog.say(L.d);
  think(L.after);
  c.plug = null; Sfx.plug(); if (S.cu === 'centralita') c2r();
  renderObjectives();
}

/* ---------- Casilleros: el candado de letras ---------- */
const CELL_LINES = {
  0: 'Correspondencia de Ferraz, sin abrir. El último sobre es del 13 de octubre de 1987.',
  1: 'Una postal de la costa para M. Olmos: «Volvemos el 15. Besos».',
  2: 'Recibos de contabilidad, ordenados por fecha. Ibáñez era de los prolijos.',
  7: 'Fichas de archivo de N. Paredes, atadas con un cordel.',
  12: 'El casillero sin nombre. Adentro no hay ni polvo.',
  13: 'VARIOS: folletos de Seguros Ferraz con el búho en la tapa.',
  14: 'DEVOLUCIONES: cartas que nunca llegaron a destino. Todas de octubre del 87.',
};
function turnLetter(i, d) {
  const c = S.c2; c.letters[i] = (c.letters[i] + d + 26) % 26;
  $('#let' + i).textContent = ABC[c.letters[i]]; Sfx.dial();
}
function tryLock() {
  const c = S.c2, w = c.letters.map(i => ABC[i]).join('');
  if (w === SECRET) { c.lockOpen = true; Sfx.unlock(); c2r(); renderObjectives(); think(['F, A, R, O. El candado cede.', 'Adentro, colgada de un clavo, una llave con etiqueta roja.']); return; }
  c.err.cand++; Presence.add('error'); Sfx.wrong();
  think(w === 'ALBA' ? 'ALBA no. Esa voz del archivo no estaba ayudando.' : c.err.cand < 3 ? `${w}. El candado no cede.` : `${w}. Nada. Probar al azar solo hace ruido… y aquí el ruido atrae cosas.`);
}

/* ---------- Checador: marcar la salida del responsable de cierre ---------- */
function punch(id) {
  const c = S.c2, name = STAFF.find(p => p[0] === id)[1];
  if (c.punched) { think('La salida del responsable ya está marcada.'); return; }
  if (!c.power) { think('Sin corriente, el checador no marca.'); return; }
  Sfx.punch();
  if (id === CLOSER) {
    c.punched = id; c2r(); renderObjectives();
    think([`La tarjeta de ${name}, en la ranura. Clac.`, 'SALIDA: 23:47. Afuera, la lámpara del ascensor cambia de color.']);
    setTimeout(revealMine, window.__game?.fast ? 50 : 2600);
    return;
  }
  if (!c.rejected.includes(id)) c.rejected.push(id);
  c.err.tarj++; Presence.add('error'); setTimeout(() => Sfx.buzz(), 250); c2r();
  think(id === 'ferraz' ? ['Clac… y la máquina la escupe con un sello: RECHAZADA.', 'Ferraz era el jefe. No el que cerraba.'] : `La tarjeta de ${name}. Clac… y la máquina la escupe: RECHAZADA.`);
}
function revealMine() {
  const c = S.c2; if (c.mine) return;
  c.mine = true; Sfx.sting();
  if (S.cu === 'checador') c2r();
  else openCloseup('checador');
  think('En el bolsillo 13 de ENTRADA hay una tarjeta. Hace un segundo no estaba.');
  setTimeout(showTarjeta, window.__game?.fast ? 50 : 2400);
}
// Lámina sobre la escena (no depende del primer plano)
function showSheet(inner, vb, onClose) {
  const d = document.createElement('div'); d.className = 'sheetOv';
  d.innerHTML = `<svg viewBox="${vb}">${inner}</svg>`;
  d.onclick = e => { e.stopPropagation(); d.remove(); onClose?.(); };
  $('#stage').appendChild(d); Sfx.stamp();
  return d;
}
function showTarjeta() {
  if ($('.sheetOv')) return;
  showSheet(sheetTarjeta(), '0 0 450 690', () => {
    const first = !S.c2.cardSeen; S.c2.cardSeen = true; renderObjectives();
    if (first) think(['Una tarjeta con mi nombre clave. Con mi letra.', 'Treinta y siete entradas, todas a las 23:47. Una por año, cada 14 de octubre.', 'Ninguna salida.', 'La última es de hoy.']);
  });
}
function openExpediente() {
  if ($('.sheetOv')) return;
  const first = !S.odd.has('expediente');
  if (first) { noteOdd('expediente'); Presence.add('open'); }
  showSheet(sheetExpediente(), '0 0 490 670', () => {
    think(first ? ['Control dijo que no lo abriera…', 'Una sola hoja suelta: «Personal retenido». Los doce empleados.', 'Y un renglón trece, tachado con tanta fuerza que rompió el papel.'] : 'Mejor no volver a mirarlo.');
  });
}

/* ---------- Ascensor: llamada, clímax y salida ---------- */
const elevReady = () => S.c2.power && S.c2.keyIn && !!S.c2.punched;
function callElevator() {
  const c = S.c2;
  if (!c.power) { think('Aprieto el botón. Nada. Sin corriente.'); return; }
  if (!elevReady()) { Sfx.buzz(); think(['Un zumbido seco. La lámpara sigue en FUERA DE HORARIO.', 'Falta algo de lo que dice la placa.']); return; }
  climax();
}
// Anima un atributo numérico en el tiempo (rotaciones, desplazamientos)
function tween(ms, fn) {
  return new Promise(res => {
    const t0 = performance.now(), d = window.__game?.fast ? 30 : ms;
    const step = t => { const k = Math.min(1, (t - t0) / d); fn(k * k * (3 - 2 * k)); if (k < 1) requestAnimationFrame(step); else res(); };
    requestAnimationFrame(step);
  });
}
async function climax() {
  const c = S.c2;
  S.busy = true; c.calling = true; renderObjectives();
  closeCloseup(); deselect();
  Sfx.ding(); Sfx.motor(true);
  think('Aprieto LLAMAR. Muy abajo, algo se pone en marcha.');
  Presence.p = Math.max(Presence.p, 0.5);
  const needle = $('#needle'), base = needle.getAttribute('transform').replace(/ rotate\([^)]*\)/, '');
  const handle = $('#ofHandle'), hBase = handle.getAttribute('transform');
  let rattle = null;
  const floors = [['PB', '1'], ['1', '2'], ['2', '3']];
  for (let i = 0; i < floors.length; i++) {
    const [a, b] = floors[i].map(f => FLOOR_ANG[f]);
    await tween(2800, k => { c.needle = a + (b - a) * k; needle.setAttribute('transform', `${base} rotate(${c.needle.toFixed(1)})`); });
    Sfx.ding(); Presence.p = Math.min(1, Presence.p + 0.17);
    if (i === 0) { Sfx.knock(); think('Golpes. En el vidrio de la oficina.'); }
    if (i === 1) {
      think('La manija de la oficina está girando. Desde adentro.');
      rattle = setInterval(() => { Sfx.rattle(); handle.setAttribute('transform', `${hBase} rotate(${(Math.random() * 40 - 32).toFixed(0)})`); }, 420);
    }
  }
  Sfx.motor(false);
  await wait(500);
  // Se abren las puertas
  Sfx.doors(); $('#cabIn').setAttribute('opacity', 1);
  const L = $('#elevL'), R = $('#elevR');
  await tween(1300, k => { L.setAttribute('transform', `translate(${(-64 * k).toFixed(1)} 0)`); R.setAttribute('transform', `translate(${(64 * k).toFixed(1)} 0)`); $('#cabLight').setAttribute('opacity', (0.6 * k).toFixed(2)); });
  think('¡Las puertas!');
  await wait(1100);
  clearInterval(rattle);
  Sfx.doors(); Sfx.hum(false, 0);
  await fade(true);
  streetEnding();
}
async function streetEnding() {
  const c = S.c2;
  c.live = false;
  const cine = $('#cine'); $('svg', cine).innerHTML = artCalle(); cine.classList.add('on');
  await wait(400);
  fade(false);
  think(['Afuera. Lluvia. El auto de la Sección espera con el motor en marcha.', 'Antes de subir, miro hacia arriba.']);
  await wait(4200);
  // Un flash en la ventana del tercer piso
  Sfx.shutter();
  const burst = $('#calleBurst'), fl = $('#calleFlash');
  await tween(700, k => { const v = k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8; burst.setAttribute('opacity', v.toFixed(2)); fl.setAttribute('opacity', (v * 0.5).toFixed(2)); });
  think('Un flash. En la ventana del tercer piso. En la oficina de Ferraz.');
  await wait(2600);
  await Dialog.say([C('Polilla, sube. Rápido.'), C('¿Qué miras?'), C('…No hay nadie en ese edificio. Lo sabes.', 'alarma')]);
  await wait(900);
  const mins = 23 * 60 + 58 + Math.round((Date.now() - c.t2) / 60000), hm = m => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  S.report = {
    t1: S.t1 ? mmss(S.t1) : '—', t2: mmss(Date.now() - c.t2), wrongPass: S.f.wrongPass, wrongSafe: S.f.wrongSafe,
    errFus: c.err.fus, errCand: c.err.cand, errTarj: c.err.tarj, blackouts: c.blackouts, salida: hm(mins),
  };
  S.ended = true; S.busy = false; renderObjectives(); showEnding();
}

/* ---------- Objetivos ---------- */
function objectives2() {
  const c = S.c2, L = [];
  L.push({ t: 'Salir del 3.er piso', done: S.ended, main: true });
  L.push({ t: 'Devolver la corriente al piso', done: c.power });
  if (c.panelRead || c.heard[14] || c.power) L.push({ t: 'Conseguir la llave de servicio', done: c.keyTaken || c.keyIn });
  if (c.keyTaken) L.push({ t: 'Poner la llave en el panel', done: c.keyIn });
  if (c.panelRead) L.push({ t: 'Que el responsable de cierre marque SALIDA', done: !!c.punched });
  if (c.keyIn && c.punched) L.push({ t: 'Llamar al ascensor', done: c.calling });
  if (c.hidden) L.push({ t: `Encontrar: ${ITEMS[c.hidden.k].name.toLowerCase()}`, done: false });
  return L;
}

/* ---------- Libreta: solo los datos, sin conclusiones ---------- */
function nbPage2(tab) {
  const c = S.c2;
  if (tab === 'tablero') {
    let h = `<div class="sub">TABLERO GENERAL · PISO 3</div><h2>Los fusibles</h2>`;
    if (!c.lidOpen) return h + nbNone('El tablero está tras una tapa atornillada.');
    h += `<div class="clip"><svg viewBox="0 0 300 170"><rect width="300" height="170" fill="#141a18"/><rect x="40" y="20" width="110" height="46" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>
      <text x="95" y="40" text-anchor="middle" font-family="${typeFont}" font-weight="bold" font-size="12">GENERAL P.3</text><text x="95" y="58" text-anchor="middle" font-family="${typeFont}" font-weight="bold" font-size="15">10 A</text>
      ${c.uvSeen ? `<g filter="url(#glowUV)" font-family="${handFont}" font-weight="bold" fill="${UVINK}"><text x="40" y="104" font-size="24" transform="rotate(-5 40 104)">¡20 A!</text><text x="40" y="136" font-size="15" transform="rotate(-5 40 136)">el de 10 salta — A.F.</text></g>` : ''}</svg>`;
    h += `<div class="txt">Zócalo GENERAL: vacío.<br>Repuestos: 10 A, 15 A y 20 A.${c.burnt.length ? `<br>Quemados: ${c.burnt.map(a => a + ' A').join(', ')}.` : ''}${c.power ? '<br><b>Hay corriente.</b>' : ''}</div></div>`;
    return h;
  }
  if (tab === 'lineas') {
    let h = `<div class="sub">CENTRALITA · OCHO LÍNEAS INTERNAS</div><h2>Extensiones</h2>`;
    if (!c.pbxSeen) return h + nbNone('La centralita está sobre el mostrador.');
    h += `<table>${EXT.map(([n, a, b]) => `<tr><td><b>${n}</b></td><td>${a || '—'}${b ? ` (${b})` : ''}</td><td class="hand">${c.heard[n] ? LINE_NOTES[n] : ''}</td></tr>`).join('')}</table>`;
    return h;
  }
  if (tab === 'turnos') {
    let h = `<div class="sub">CIERRE DE LA OFICINA</div><h2>Turnos y salida</h2>`;
    if (!c.turnosSeen && !c.panelRead) return h + nbNone('El ascensor tiene instrucciones grabadas.');
    if (c.panelRead) h += `<div class="txt">Placa del ascensor: «1 · Llave en SERVICIO. 2 · El responsable de cierre marca SALIDA en el checador. 3 · Pulse LLAMAR».</div>`;
    if (c.turnosSeen) h += `<p class="txt" style="margin-top:12px"><b>Turnos de cierre · octubre 1987</b></p><table>${TURNOS.map(([s, q]) => `<tr><td>${s}</td><td>${q}</td></tr>`).join('')}</table>
      <div class="txt">Al margen, junto a Méndez: «cambié con el de la semana siguiente — R.M.»</div>`;
    if (c.visitasSeen) h += `<div class="txt" style="margin-top:8px">Libro de visitas: el 13 vino un técnico de TEMPUS («checador ↔ ascensor»).</div>`;
    return h;
  }
  if (tab === 'cap1') {
    return `<div class="sub">CAPÍTULO 1 · LA OFICINA DE FERRAZ</div><h2>Lo que ya sé</h2><div class="txt">
      · Calendario del escritorio: <b>CIERRE</b>, 14 de octubre de 1987.<br>
      · Fichas del personal: doce empleados, todos de baja el 14 de octubre de 1987.<br>
      · El cuadro de la oficina, «Faro de medianoche». Ferraz escribió: «el mar que pinté».<br>
      · La caja fuerte: 14 · 23 · 31.<br>
      · La foto instantánea: «23:46 — ya casi llega». Yo entré a las 23:47.</div>`;
  }
  return '';
}

/* ---------- Pensar: escalonado, y cada vez la presencia se acerca ---------- */
function hint2() {
  const c = S.c2;
  Presence.add('think');
  const spotName = { banco: 'el banco de espera', paraguas: 'el paragüero', planta: 'la planta muerta', escalera: 'la puerta de la escalera' };
  const steps = [
    ['perdido', !!c.hidden, ['Algo mío no está donde lo dejé.', 'Después del apagón, algo cambió de lugar. Hay que mirar la recepción con calma.', `Por ${spotName[c.hidden?.spot]}.`]],
    ['abre', !c.lidOpen && !has('abrecartas'), ['Sin luz no voy a ningún lado. Esa caja verde de la pared tiene pinta de tablero eléctrico.', 'La tapa del tablero está atornillada. Necesito algo plano y delgado… En un mostrador siempre hay de todo.', 'El cajón del mostrador. Ahí debe haber algo que sirva de destornillador.']],
    ['tapa', !c.lidOpen, ['Ya tengo con qué abrir el tablero.', 'Los cuatro tornillos de la tapa. El abrecartas puede hacer de destornillador.', 'Selecciono el abrecartas en el inventario y lo uso en cada tornillo de la caja de fusibles.']],
    ['fusible', !c.power, ['Falta el fusible GENERAL. Hay repuestos, pero ¿cuál va?', 'La etiqueta dice una cosa… pero Ferraz no confiaba en nada impreso. Escribía donde nadie mira.', c.uvSeen ? 'La corrección de Ferraz: veinte amperios. Ese fusible, y después la palanca.' : 'La linterna UV sobre la etiqueta del zócalo GENERAL.']],
    ['llave', !c.keyTaken && !c.keyIn && !c.heard[14], ['El ascensor pide una llave de servicio. ¿Quién la tendría?', 'Con corriente, la centralita funciona. El directorio dice quién es quién en este piso.', 'La extensión del conserje: la 14.']],
    ['candado', !c.keyTaken && !c.keyIn, ['Cuatro letras. Efe… erre… La estática se comió el resto.', '«Lo que pintó el jefe». ¿Qué pintó Ferraz? Lo vi en su oficina.', 'El cuadro de la oficina: «Faro de medianoche». F-A-R-O.']],
    ['llaveIn', !c.keyIn, ['La llave de servicio. Ya sé dónde va.', 'El panel de bronce junto al ascensor tiene una cerradura.', 'Selecciono la llave de servicio y la uso en la cerradura del panel del ascensor.']],
    ['salida', !c.punched, [c.panelRead ? '«El responsable de cierre marca SALIDA». ¿Quién cerraba?' : 'El panel del ascensor tiene instrucciones grabadas. Debería leerlas.',
      'En el mostrador hay una carpeta con los turnos de cierre. Y la oficina cerró un día preciso.',
      'Cerró el 14 de octubre. Esa semana figuraba Méndez… pero la nota al margen dice que cambió con el de la semana siguiente.']],
    ['llamar', true, ['Todo listo. Solo falta llamar al ascensor.', 'Todo listo. Solo falta llamar al ascensor.', 'El botón LLAMAR, en el panel del ascensor.']],
  ];
  const [id, , tiers] = steps.find(s => s[1]);
  const n = c.tiers[id] || 0; c.tiers[id] = Math.min(2, n + 1);
  const pre = c.thought ? [] : ['(Cada vez que me quedo pensando, el vidrio se oscurece un poco más.)'];
  c.thought = true;
  think(pre.concat(tiers[n]));
}

/* ---------- Ambiente vivo de la recepción ---------- */
function tick2(t, dt) {
  Presence.tick(t, dt);
  if (t - (tick2.T || 0) < 100) return;
  tick2.T = t;
  const c = S.c2;
  // El reloj de pared anda hacia atrás desde las 23:58
  const secs = 86280 - (c.live ? (Date.now() - c.t2) / 1000 : 0);
  const set = (id, deg) => { const g = $('#' + id); if (g) g.setAttribute('transform', g.getAttribute('transform').replace(/ rotate\([^)]*\)/, '') + ` rotate(${deg.toFixed(1)})`); };
  set('clkS', (secs % 60) * 6); set('clkM', (secs / 60 % 60) * 6); set('clkH', (secs / 3600 % 12) * 30);
  const pg = $('#pbxGlow'); if (pg) pg.setAttribute('opacity', c.power ? 0.3 : 0);
  const le = $('#lampElev');
  if (le) { le.setAttribute('opacity', c.power ? 0.85 : 0); le.setAttribute('fill', elevReady() ? '#3dff8a' : '#ff3d5a'); }
}

/* ---------- Registro del capítulo ---------- */
CAPS[2] = {
  label: 'La recepción de Seguros Ferraz, a oscuras',
  build: buildRecepcion,
  onHot: onHot2,
  objectives: objectives2,
  counter: () => 'CAP. 2',
  nbTabs: () => [['tablero', 'TABLERO'], ['lineas', 'CENTRALITA'], ['turnos', 'TURNOS'], ['cap1', 'CAP. 1']],
  nbPage: nbPage2,
  hint: hint2,
  tick: tick2,
  lightning: 0.25,
  useItem(k) {
    if (k === 'foto') { think('Ferraz y Tango. «El único que siempre me espera.»'); return true; }
    if (k === 'expediente') { openExpediente(); return true; }
  },
  selLine(k) {
    if (k === 'uv') return 'La linterna UV. Por si Ferraz dejó algo más escrito a oscuras.';
    if (k === 'abrecartas') return 'El abrecartas. Plano y firme: casi un destornillador.';
    if (k === 'llaveAsc') return 'La llave de servicio del ascensor.';
  },
};
