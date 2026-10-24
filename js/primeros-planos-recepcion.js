/* =====================================================================
   [7b] PRIMEROS PLANOS DE LA RECEPCIÓN, LÁMINAS E ÍCONOS DEL CAP. 2
   Cada primer plano es una pantalla de 1600×900. Lo fijo se hornea una
   vez (cuBake); lo que cambia con el estado se dibuja encima, sin hornear.
   ===================================================================== */
const UVINK = '#e8c2ff';
const T = (x, y, txt, o = {}) => `<text x="${x}" y="${y}"${o.a ? ` text-anchor="${o.a}"` : ''} font-family="${o.f || typeFont}"${o.b === false ? '' : ' font-weight="bold"'} font-size="${o.s || 20}" fill="${o.c || INK}"${o.ls ? ` letter-spacing="${o.ls}"` : ''}${o.tr ? ` transform="${o.tr}"` : ''}${o.op ? ` opacity="${o.op}"` : ''}>${txt}</text>`;

/* ---------- Mostrador: libro de visitas, libro de turnos, timbre y cajón ---------- */
// Turnos de cierre de octubre de 1987. Méndez cambió con «el de la semana siguiente»: el 14 cerró Ibáñez.
const TURNOS = [['28 SEP – 02 OCT', 'N. Paredes'], ['05 – 09 OCT', 'M. Olmos'], ['12 – 16 OCT', 'R. Méndez'], ['19 – 23 OCT', 'E. Ibáñez'], ['26 – 30 OCT', 'J. Cortés']];
const VISITAS = [['12/10', '09:40', 'Sr. Ugarte', 'póliza hogar'], ['12/10', '15:10', 'Mensajería Rayo', 'sobres'], ['13/10', '11:25', 'Sra. Benítez', 'siniestro'],
  ['13/10', '17:02', 'Técnico TEMPUS', 'checador ↔ ascensor'], ['14/10', '09:05', 'Insp. Ruiz', '—']];
function cuMostradorBase() {
  let s = ink([{ d: rrect(-30, -30, 1660, 960), m: M2.formica, s: 20, hatch: false, lit: false }], { lw: 0 });
  for (let i = 0; i < 40; i++) { const R = rng(i + 3); s += `<circle cx="${f1(R() * 1600)}" cy="${f1(R() * 720)}" r="${f1(1 + R() * 2)}" fill="#6e624e" opacity=".5"/>`; }
  // Libro de visitas abierto
  s += `<g transform="rotate(-3 420 330)">`;
  s += ink([{ d: rrect(80, 80, 690, 500), m: { b: '#3a2c3e', S: '#261c2a', D: '#140e18', H: '#6a5470' }, s: 10 }]);
  s += ink([{ d: rrect(100, 96, 320, 466), m: M.paper, s: 6, hatch: false }, { d: rrect(430, 96, 320, 466), m: M.paper, s: 6, hatch: false }], { lw: 4 });
  s += hline([[425, 98], [425, 560]], 3, INK, { op: 0.6 });
  s += T(260, 136, 'LIBRO DE VISITAS', { a: 'middle', s: 20, f: 'Rockwell,Georgia,serif', ls: 2 });
  s += T(116, 172, 'FECHA  HORA   NOMBRE', { s: 13, c: '#7c2434' });
  for (let i = 0; i < 12; i++) s += hline([[112, 190 + i * 31], [410, 190 + i * 31]], 1.2, '#7f7190', { op: 0.6, seed: i });
  for (let i = 0; i < 12; i++) s += hline([[442, 130 + i * 34], [740, 130 + i * 34]], 1.2, '#7f7190', { op: 0.6, seed: i + 40 });
  VISITAS.forEach(([d, h, n, a], i) => {
    const y = i < 4 ? 214 + i * 62 : 156;
    const x = i < 4 ? 116 : 446;
    s += T(x, y, `${d}  ${h}`, { s: 14, f: handFont, b: false, c: '#2a2030' }) + T(x + 104, y, n, { s: 15, f: handFont, b: false, c: '#2a2030' });
    s += T(x + 16, y + 24, '· ' + a, { s: 13, f: handFont, b: false, c: '#4a3a50' });
  });
  s += `</g>`;
  // Libro de turnos (carpeta azul abierta en octubre)
  s += `<g transform="rotate(2 1180 330)">`;
  s += ink([{ d: rrect(850, 70, 660, 540), m: { b: '#2e3c58', S: '#1e283c', D: '#121826', H: '#5a6e92' }, s: 10 }]);
  s += ink([{ d: rrect(874, 92, 612, 496), m: M.paper, s: 6, hatch: false }], { lw: 4 });
  for (const y of [140, 300, 460]) s += `<circle cx="896" cy="${y}" r="9" fill="#2e3c58" stroke="${INK}" stroke-width="2.5"/>`;
  s += T(1190, 140, 'TURNOS DE CIERRE · OCTUBRE 1987', { a: 'middle', s: 22, f: 'Rockwell,Georgia,serif' });
  s += T(1190, 168, 'responsable: llaves, luces y checador', { a: 'middle', s: 15, c: '#4a3a50', b: false });
  TURNOS.forEach(([sem, quien], i) => {
    const y = 228 + i * 52;
    s += hline([[930, y + 14], [1450, y + 14]], 1.4, '#7f7190', { op: 0.6, seed: i });
    s += T(940, y, sem, { s: 21 }) + T(1220, y, quien, { s: 22, f: handFont, b: false, c: '#2a2030' });
  });
  // La nota al margen de Méndez, en otra tinta
  s += `<path d="M1404 330q36 -6 40 30t-30 40" stroke="#2c4a8a" stroke-width="3" fill="none"/><path d="M1414 398l-14 4 8 -12" stroke="#2c4a8a" stroke-width="3" fill="none"/>`;
  s += T(1180, 512, 'cambié con el de la semana siguiente', { a: 'middle', s: 19, f: handFont, b: false, c: '#2c4a8a', tr: 'rotate(-2 1180 512)' });
  s += T(1380, 540, '— R.M.', { s: 18, f: handFont, b: false, c: '#2c4a8a' });
  s += T(1190, 572, 'Último en salir: marcar SALIDA en el checador.', { a: 'middle', s: 14, c: '#7c2434' });
  s += `</g>`;
  // Timbre de mostrador
  s += ink([{ d: rell(250, 690, 92, 30), m: M.metal, s: 6, hatch: false }, { d: `M170 682a80 70 0 0 1 160 0z`, m: { b: '#9aa8b4', S: '#626e7c', D: '#3a4250', H: '#e0ecf4' }, s: 10 }], { lw: 5 });
  s += ink([{ d: rrect(242, 598, 16, 18), m: M.metal, s: 2, hatch: false }], { lw: 3 });
  // Frente del mostrador (abajo)
  s += ink([{ d: rrect(-30, 730, 1660, 230), m: M.wood, s: 14 }]);
  return s;
}
function cuMostradorDrawer(open) {
  if (!open) return ink([{ d: rrect(540, 744, 520, 140), m: M.wood, s: 12 }]) + ink([{ d: rrect(750, 800, 100, 20), m: M.brass, s: 4, hatch: false }], { lw: 4 });
  let s = ink([{ d: rpoly([[520, 610], [1080, 610], [1120, 905], [480, 905]]), m: M.wood, s: 10 }]);
  s += `<path d="${rpoly([[550, 630], [1050, 630], [1078, 880], [522, 880]])}" fill="#1a0d10" stroke="${INK}" stroke-width="5"/>`;
  // Sellos de goma y clips
  s += ink([{ d: rrect(900, 660, 60, 70), m: M.wood, s: 4, hatch: false }, { d: rrect(980, 680, 56, 64), m: M.wood, s: 4, hatch: false }], { lw: 4 });
  s += `<rect x="904" y="716" width="52" height="14" fill="#7c2434"/><rect x="984" y="730" width="48" height="14" fill="#2c4a8a"/>`;
  s += T(930, 760, 'PAGADO', { a: 'middle', s: 12, c: '#c4485a' }) + T(1008, 774, 'ANULADO', { a: 'middle', s: 11, c: '#7aa0e0' });
  for (const [x, y] of [[600, 820], [640, 840], [700, 812]]) s += `<path d="M${x} ${y}h22a6 6 0 0 1 0 12h-18a4 4 0 0 1 0 -8h14" fill="none" stroke="#a6abb5" stroke-width="3"/>`;
  return s;
}
function cuAbrecartas() {
  return `<g transform="rotate(-8 720 720)">${ink([
    { d: rpoly([[600, 712], [800, 704], [840, 716], [800, 726], [600, 728]]), m: { b: '#b8c2cc', S: '#7a8492', D: '#4a525e', H: '#f0f6fa' }, s: 3, hatch: false },
    { d: rrect(540, 704, 64, 30), m: { b: '#5e3532', S: '#3d2126', D: '#241217', H: '#93604f' }, s: 4, hatch: false },
  ], { lw: 4 })}</g>`;
}

/* ---------- Caja de fusibles ---------- */
const SCREWS = [[470, 100], [1130, 100], [470, 800], [1130, 800]];
const FUSE_COL = { 10: '#c0283c', 15: '#3a6ab0', 20: '#e2b23a' };
const SOCKETS = [['GENERAL P.3', '10 A'], ['ALUMBRADO', '6 A'], ['CENTRALITA', '4 A'], ['ASCENSOR SERV.', '16 A']];
const SPARE_X = { 10: 560, 15: 680, 20: 800 };
function cuFusiblesWall() {
  let s = `<rect x="-20" y="-20" width="1640" height="960" fill="#1e2532"/>`;
  for (let x = 20; x < 1600; x += 44) s += hline([[x, -10], [x + 1, 920]], 1.2, '#2e3a4a', { op: 0.5, seed: x });
  return s;
}
function cuFusiblesClosed() {
  let s = cuFusiblesWall();
  s += ink([{ d: rrect(420, 40, 760, 820), m: M2.green, s: 22 }], { lw: 8 });
  s += `<path d="${rrect(450, 70, 700, 760)}" fill="none" stroke="${INK}" stroke-width="4" opacity=".7"/>`;
  s += `<path d="M800 170l-110 190h220z" fill="#e8c445" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/><path d="M812 214l-36 66h34l-28 58" stroke="${INK}" stroke-width="10" fill="none" stroke-linejoin="round"/>`;
  s += T(800, 410, 'PELIGRO', { a: 'middle', s: 40, f: 'Rockwell,Georgia,serif', ls: 6, c: '#e8c445' });
  s += ink([{ d: rrect(600, 480, 400, 110), m: M.paper, s: 6, hatch: false }], { lw: 5 });
  s += T(800, 528, 'TABLERO GENERAL', { a: 'middle', s: 30, f: 'Rockwell,Georgia,serif' }) + T(800, 568, 'PISO 3 · SEGUROS FERRAZ', { a: 'middle', s: 18 });
  s += ink([{ d: rrect(1080, 400, 40, 120), m: M.metal, s: 4, hatch: false }], { lw: 5 });
  for (const [a, b] of [[[520, 700], [600, 680]], [[1000, 740], [1080, 760]]]) s += tline([a, b], 3, '#6f9a84', { op: 0.6 });
  return s;
}
const screwSvg = (x, y, out) => out
  ? `<circle cx="${x}" cy="${y}" r="13" fill="#0b100d" stroke="${INK}" stroke-width="3"/>`
  : ink([{ d: rell(x, y, 20, 20), m: { b: '#9fb3a8', S: '#6a7c72', D: '#3c4a42', H: '#e0f0e6' }, s: 4, hatch: false }], { lw: 4 }) + `<path d="M${x - 13} ${y + 5}L${x + 13} ${y - 5}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
function cuFusiblesOpen() {
  let s = cuFusiblesWall();
  s += ink([{ d: rrect(420, 40, 760, 820), m: M2.green, s: 22 }], { lw: 8 });
  s += `<path d="${rrect(450, 70, 700, 760)}" fill="#141a18" stroke="${INK}" stroke-width="6"/>`;
  // La tapa abierta, de canto, a la izquierda
  s += ink([{ d: rpoly([[420, 40], [300, 90], [300, 820], [420, 860]]), m: M2.green, s: 10 }], { lw: 7 });
  // Riel y zócalos de porcelana
  s += ink([{ d: rrect(470, 250, 660, 260), m: { b: '#2c3430', S: '#1c2220', D: '#0e1210', H: '#4a5650' }, s: 8, hatch: false }], { lw: 5 });
  SOCKETS.forEach(([n, a], i) => {
    const cx = 540 + i * 150;
    s += ink([{ d: rrect(cx - 52, 280, 104, 190), m: M.bone, s: 8 }], { lw: 5 });
    s += `<rect x="${cx - 30}" y="292" width="60" height="18" fill="#b08a4a" stroke="${INK}" stroke-width="2"/><rect x="${cx - 30}" y="440" width="60" height="18" fill="#b08a4a" stroke="${INK}" stroke-width="2"/>`;
    s += ink([{ d: rrect(cx - 64, 520, 128, 54), m: M.paper, s: 4, hatch: false }], { lw: 3 });
    s += T(cx, 542, n, { a: 'middle', s: 13 }) + T(cx, 566, a, { a: 'middle', s: 18 });
  });
  // Palanca general (la manija va aparte: cambia de posición)
  s += ink([{ d: rrect(1060, 240, 70, 280), m: M.metal, s: 8 }], { lw: 6 });
  s += T(1095, 232, 'ON', { a: 'middle', s: 18, c: '#e2d4b2' }) + T(1095, 545, 'OFF', { a: 'middle', s: 18, c: '#e2d4b2' });
  // Lata de repuestos
  s += ink([{ d: rrect(480, 640, 420, 190), m: { b: '#6e5a3e', S: '#4a3c2a', D: '#2a2218', H: '#a88c5e' }, s: 10 }], { lw: 6 });
  s += `<path d="${rrect(500, 660, 380, 150, { amp: 0.6 })}" fill="#1d1712" stroke="${INK}" stroke-width="3"/>`;
  s += T(690, 860, 'REPUESTOS', { a: 'middle', s: 18, c: '#e2d4b2', ls: 3 });
  // Fusibles viejos (intactos) en los otros tres zócalos
  for (let i = 1; i < 4; i++) s += fuseSvg(540 + i * 150, 375, '#7f8a84', ['', '6 A', '4 A', '16 A'][i]);
  return s;
}
// Cartucho de fusible (vertical), con la banda de color del amperaje
function fuseSvg(cx, cy, col, label, burnt = false) {
  let s = ink([{ d: rrect(cx - 18, cy - 62, 36, 124), m: burnt ? { b: '#2a2222', S: '#1a1414', D: '#0c0909', H: '#4a3a3a' } : M.bone, s: 4, hatch: false }], { lw: 4 });
  s += `<rect x="${cx - 18}" y="${cy - 62}" width="36" height="16" fill="#b08a4a" stroke="${INK}" stroke-width="2"/><rect x="${cx - 18}" y="${cy + 46}" width="36" height="16" fill="#b08a4a" stroke="${INK}" stroke-width="2"/>`;
  if (!burnt) s += `<rect x="${cx - 18}" y="${cy - 10}" width="36" height="14" fill="${col}"/>` + T(cx, cy + 32, label, { a: 'middle', s: 13 });
  else s += `<path d="M${cx - 10} ${cy - 20}l20 14l-16 10l14 12" stroke="#000" stroke-width="3" fill="none"/>`;
  return s;
}
function cuFusibleLever(on) {
  const y = on ? 300 : 460;
  return ink([{ d: rrect(1082, Math.min(y, 380), 26, Math.abs(y - 380) + 10), m: M.metal, s: 3, hatch: false }, { d: rrect(1064, y - 16, 62, 32), m: { b: '#7c2434', S: '#4b1422', D: '#2c0b15', H: '#c4485a' }, s: 4, hatch: false }], { lw: 4 });
}
// La corrección de Ferraz, solo visible con la linterna UV
function uvFusibles() {
  return `<g font-family="${handFont}" font-weight="bold" fill="${UVINK}">
    <text x="476" y="626" font-size="30" transform="rotate(-6 476 626)">¡20 A!</text>
    <text x="580" y="628" font-size="21" transform="rotate(-6 580 628)">el de 10 salta — A.F.</text></g>
    <path d="M530 590q-6 -30 6 -40" stroke="${UVINK}" stroke-width="4" fill="none"/>`;
}

/* ---------- Centralita ---------- */
const EXT = [[10, 'Dirección', 'A. Ferraz'], [11, 'Recepción', 'M. Olmos'], [12, 'Archivo', 'N. Paredes'], [13, '', ''],
  [14, 'Conserjería', 'R. Méndez'], [15, 'Contabilidad', 'E. Ibáñez'], [16, 'Siniestros', 'J. Cortés'], [17, 'Portería (P.B.)', '']];
const jackPos = n => { const i = n - 10; return [700 + (i % 4) * 190, i < 4 ? 220 : 400]; };
const PLUG_HOLE = [720, 660];
function cuCentralitaBase() {
  let s = `<rect x="-20" y="-20" width="1640" height="960" fill="#1e2532"/>`;
  s += ink([{ d: rrect(120, 20, 1360, 900), m: M2.cream, s: 20 }], { lw: 8 });
  s += ink([{ d: rrect(160, 60, 1280, 500), m: M.woodL, s: 12 }], { lw: 6 });
  s += `<path d="${rrect(180, 80, 1240, 460)}" fill="#2a1a1e" stroke="${INK}" stroke-width="4"/>`;
  // Directorio a máquina
  s += `<g transform="rotate(-1.5 360 300)">${ink([{ d: rrect(206, 104, 330, 420), m: M.paper, s: 6, hatch: false }], { lw: 4 })}`;
  s += T(371, 144, 'EXTENSIONES', { a: 'middle', s: 22, f: 'Rockwell,Georgia,serif', ls: 2 });
  EXT.forEach(([n, a, b], i) => {
    const y = 188 + i * 41;
    s += T(222, y, String(n), { s: 20, c: '#7c2434' }) + T(260, y, a || '…………', { s: 16 }) + (b ? T(520, y + 18, b, { a: 'end', s: 13, c: '#4a3a50', b: false }) : '');
  });
  s += `</g>`;
  // Campo de clavijas: número, lámpara y anillo de bronce
  for (const [n] of EXT) {
    const [x, y] = jackPos(n);
    s += `<rect x="${x - 40}" y="${y - 92}" width="80" height="30" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>` + T(x, y - 69, String(n), { a: 'middle', s: 22 });
    s += `<circle cx="${x}" cy="${y - 34}" r="11" fill="#3a2a18" stroke="${INK}" stroke-width="3"/>`;
    s += ink([{ d: rell(x, y + 18, 30, 30), m: M.brass, s: 5, hatch: false }], { lw: 5 }) + `<circle cx="${x}" cy="${y + 18}" r="13" fill="#07050a"/>`;
  }
  // Repisa: llaves de conversación, agujero del cordón y auriculares colgados
  s += ink([{ d: rrect(160, 600, 1280, 90), m: M.woodL, s: 8 }], { lw: 6 });
  for (let i = 0; i < 6; i++) s += ink([{ d: rrect(220 + i * 70, 616, 30, 56), m: M.bone, s: 3, hatch: false }], { lw: 3 });
  s += `<circle cx="${PLUG_HOLE[0]}" cy="${PLUG_HOLE[1]}" r="16" fill="#07050a" stroke="${INK}" stroke-width="3"/>`;
  s += hline([[1180, 560], [1180, 640]], 5, INK) + ink([{ d: `M1120 700a60 60 0 0 1 120 0`, m: M.cloth, s: 3, hatch: false, noLine: true }]);
  s += `<path d="M1120 760a60 60 0 0 1 120 0" fill="none" stroke="${INK}" stroke-width="10"/><path d="M1120 760a60 60 0 0 1 120 0" fill="none" stroke="#3a3448" stroke-width="5"/>`;
  s += ink([{ d: rell(1120, 770, 20, 28), m: M.cloth, s: 4, hatch: false }, { d: rell(1240, 770, 20, 28), m: M.cloth, s: 4, hatch: false }], { lw: 4 });
  s += T(800, 860, 'CENTRAL PRIVADA · FERRAZ · 8 LÍNEAS', { a: 'middle', s: 18, c: '#4a4250', ls: 2 });
  return s;
}
// Lámparas y cordón: según la corriente y la clavija enchufada
function cuCentralitaLive(power, plug) {
  let s = '';
  for (const [n] of EXT) {
    const [x, y] = jackPos(n), on = power && plug === n;
    if (power) s += `<circle cx="${x}" cy="${y - 34}" r="${on ? 22 : 13}" fill="#ffb347" opacity="${on ? 0.9 : 0.25}" filter="url(#glowSoft)"/><circle cx="${x}" cy="${y - 34}" r="8" fill="${on ? '#ffe2a0' : '#8a6a3a'}"/>`;
  }
  if (plug) {
    const [x, y] = jackPos(plug);
    s += `<path d="M${PLUG_HOLE[0]} ${PLUG_HOLE[1]}C${PLUG_HOLE[0]} ${PLUG_HOLE[1] - 160} ${x} ${y + 200} ${x} ${y + 40}" stroke="${INK}" stroke-width="12" fill="none"/><path d="M${PLUG_HOLE[0]} ${PLUG_HOLE[1]}C${PLUG_HOLE[0]} ${PLUG_HOLE[1] - 160} ${x} ${y + 200} ${x} ${y + 40}" stroke="#7c2434" stroke-width="6" fill="none"/>`;
    s += ink([{ d: rrect(x - 12, y + 18, 24, 46), m: M.brass, s: 3, hatch: false }], { lw: 4 });
  } else {
    s += `<path d="M${PLUG_HOLE[0]} ${PLUG_HOLE[1]}q-60 40 -120 20" stroke="${INK}" stroke-width="12" fill="none"/><path d="M${PLUG_HOLE[0]} ${PLUG_HOLE[1]}q-60 40 -120 20" stroke="#7c2434" stroke-width="6" fill="none"/>`;
    s += ink([{ d: rrect(570, 668, 46, 24), m: M.brass, s: 3, hatch: false }], { lw: 4 });
  }
  return s;
}

/* ---------- Casilleros de correspondencia ---------- */
const CELL_NAMES = ['A. Ferraz', 'M. Olmos', 'E. Ibáñez', 'C. Salas', 'L. Durán', 'J. Cortés', 'T. Vidal', 'N. Paredes', 'R. Méndez', 'S. Rojas', 'H. Quiroga', 'B. Lagos', '', 'VARIOS', 'DEVOLUC.'];
const CELL_MENDEZ = 8;
const PADLOCK = { x0: 826, y0: 438, x1: 1274, y1: 760 };       // cuerpo del candado (las ruedas y ABRIR van en HTML encima)
const cellBox = k => { const r = Math.floor(k / 5), c = k % 5; return [170 + c * 254, 50 + r * 272, 236, 230]; };
function cuCasillerosBase() {
  let s = `<rect x="-20" y="-20" width="1640" height="960" fill="#1e2532"/>`;
  s += ink([{ d: rrect(140, 20, 1320, 870), m: M.woodL, s: 18 }], { lw: 8 });
  for (let k = 0; k < 15; k++) {
    const [x, y, w, h] = cellBox(k);
    s += `<path d="${rrect(x, y, w, h, { seed: k })}" fill="#120c10" stroke="${INK}" stroke-width="5"/>`;
    s += `<path d="M${x + 6} ${y + 6}H${x + w - 6}V${y + 40}Q${x + w / 2} ${y + 26} ${x + 6} ${y + 46}Z" fill="#1d141a"/>`;
    s += ink([{ d: rrect(x + 30, y + h + 6, w - 60, 30), m: M.paper, s: 3, hatch: false }], { lw: 3 });
    s += T(x + w / 2, y + h + 28, CELL_NAMES[k] || '—', { a: 'middle', s: 17 });
    if ([0, 3, 6, 10, 11].includes(k)) {
      s += ink([{ d: rpoly([[x + 20, y + h - 20], [x + w - 40, y + h - 60], [x + w - 24, y + h - 14], [x + 30, y + h - 6]], { amp: 0.8 }), m: { b: '#cfc2a6', S: '#a09078', D: '#6e604c', H: '#f0e6d0' }, s: 5, hatch: false }], { lw: 4 });
      s += hline([[x + 50, y + h - 34], [x + 140, y + h - 50]], 2, INK, { op: 0.5 });
    }
  }
  return s;
}
// La puertita del conserje: cerrada (con el candado de letras) o abierta, con la llave adentro
function cuCasilleroMendez(open, keyIn) {
  const [x, y, w, h] = cellBox(CELL_MENDEZ);
  if (!open) {
    let s = ink([{ d: rrect(x - 4, y - 4, w + 8, h + 8), m: M.metal, s: 10 }], { lw: 6 });
    for (let i = 0; i < 4; i++) s += hline([[x + 20, y + 30 + i * 14], [x + w - 20, y + 30 + i * 14]], 2.5, INK, { op: 0.5 });
    s += ink([{ d: rrect(x + w - 24, y + 90, 22, 60), m: M.metal, s: 3, hatch: false }], { lw: 4 });
    // Candado grande colgando del pasador (las ruedas de letras van en HTML encima)
    s += `<path d="M${x + w / 2 - 90} ${y + 130}v-40a90 90 0 0 1 180 0v40" fill="none" stroke="${INK}" stroke-width="26"/><path d="M${x + w / 2 - 90} ${y + 130}v-40a90 90 0 0 1 180 0v40" fill="none" stroke="#a6abb5" stroke-width="14"/>`;
    s += ink([{ d: rrect(PADLOCK.x0, PADLOCK.y0, PADLOCK.x1 - PADLOCK.x0, PADLOCK.y1 - PADLOCK.y0), m: M.brass, s: 12 }], { lw: 7 });
    return s;
  }
  let s = `<path d="${rrect(x, y, w, h)}" fill="#0c080b" stroke="${INK}" stroke-width="5"/>`;
  s += ink([{ d: rpoly([[x, y - 4], [x - 70, y + 20], [x - 70, y + h - 20], [x, y + h + 4]]), m: M.metal, s: 6 }], { lw: 6 });
  s += ink([{ d: rpoly([[x + 30, y + h - 10], [x + w - 30, y + h - 10], [x + w - 40, y + h - 60], [x + 40, y + h - 60]]), m: { b: '#2e3a4e', S: '#1e2636', D: '#10141e', H: '#56688a' }, s: 4 }], { lw: 4 });
  if (keyIn) s += cuLlaveServicio(x + w / 2, y + 110);
  return s;
}
function cuLlaveServicio(cx, cy, sc = 1) {
  return `<g transform="translate(${cx} ${cy}) scale(${sc})">
    ${ink([{ d: rrect(-34, -70, 68, 44), m: { b: '#7c2434', S: '#4b1422', D: '#2c0b15', H: '#c4485a' }, s: 4, hatch: false }], { lw: 4 })}
    ${T(0, -42, 'ASC.', { a: 'middle', s: 15, c: PAPER })}
    <path d="M0 -26V-6" stroke="${INK}" stroke-width="4"/>
    ${ink([{ d: rell(0, 10, 18, 18), m: M.brass, s: 3, hatch: false }, { d: rrect(-6, 24, 12, 80), m: M.brass, s: 2, hatch: false }, { d: rrect(6, 70, 16, 10), m: M.brass, s: 2, hatch: false }, { d: rrect(6, 88, 12, 10), m: M.brass, s: 2, hatch: false }], { lw: 4 })}
    <circle cx="0" cy="10" r="7" fill="${INK}"/></g>`;
}

/* ---------- Reloj checador ---------- */
const pocketXY = (rack, i) => [(rack === 'in' ? 110 : 1070) + (i < 7 ? 0 : 214), 92 + (i < 7 ? i : i - 7) * 112];
function cuChecadorBase() {
  let s = `<rect x="-20" y="-20" width="1640" height="960" fill="#1e2532"/>`;
  for (const [rack, lbl] of [['in', 'ENTRADA'], ['out', 'SALIDA']]) {
    const x0 = rack === 'in' ? 90 : 1050;
    s += ink([{ d: rrect(x0, 40, 460, 840), m: M.metal, s: 12 }], { lw: 6 });
    s += T(x0 + 230, 76, lbl, { a: 'middle', s: 22, c: '#e2d4b2', ls: 4 });
    for (let i = 0; i < 13; i++) {
      const [x, y] = pocketXY(rack, i);
      s += `<path d="${rrect(x, y + 36, 200, 64, { seed: i + (rack === 'in' ? 0 : 50) })}" fill="#2a2f38" stroke="${INK}" stroke-width="4"/>`;
      s += T(x + 186, y + 90, String(i + 1), { a: 'end', s: 13, c: '#8a96a6' });
    }
  }
  // La máquina: reloj, ranura y palanca
  s += ink([{ d: rrect(600, 40, 400, 840), m: M2.cream, s: 18 }], { lw: 8 });
  s += ink([{ d: rell(800, 230, 140, 140), m: M.brass, s: 10 }, { d: rell(800, 230, 118, 118), m: M.bone, s: 8, hatch: false }], { lw: 6 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; s += `<path d="M${f1(800 + Math.cos(a) * 96)} ${f1(230 + Math.sin(a) * 96)}L${f1(800 + Math.cos(a) * 112)} ${f1(230 + Math.sin(a) * 112)}" stroke="${INK}" stroke-width="${i % 3 ? 3 : 6}"/>`; }
  // Las agujas: 11:47 (23:47). No se mueven.
  const hand = (deg, len, w) => { const r = (deg - 90) * Math.PI / 180; return tline([[800, 230], [800 + Math.cos(r) * len, 230 + Math.sin(r) * len]], w); };
  s += hand(11 * 30 + 47 * 0.5, 62, 10) + hand(47 * 6, 92, 7) + `<circle cx="800" cy="230" r="9" fill="${INK}"/>`;
  s += T(800, 420, 'TEMPUS', { a: 'middle', s: 34, f: 'Rockwell,Georgia,serif', ls: 6, c: '#4a4250' });
  s += ink([{ d: rrect(660, 470, 280, 60), m: M.metal, s: 6, hatch: false }], { lw: 5 }) + `<rect x="690" y="494" width="220" height="12" fill="#07050a"/>`;
  s += T(800, 560, 'INSERTE TARJETA', { a: 'middle', s: 18, c: '#4a4250' });
  s += ink([{ d: rrect(760, 600, 80, 200), m: M.metal, s: 6 }, { d: rell(800, 600, 40, 40), m: { b: '#7c2434', S: '#4b1422', D: '#2c0b15', H: '#c4485a' }, s: 6 }], { lw: 6 });
  return s;
}
// Tarjeta asomando de un bolsillo, con el apellido a máquina
function timecardTop(x, y, name, o = {}) {
  let s = ink([{ d: rrect(x + 14, y - 6, 172, 92), m: o.mine ? { b: '#e6d6b4', S: '#b8a68a', D: '#7a6a58', H: '#fff4dc' } : M.paper, s: 4, hatch: false }], { lw: 4 });
  s += `<rect x="${x + 14}" y="${y - 6}" width="172" height="14" fill="${o.mine ? '#7c2434' : '#5a6e92'}"/>`;
  s += T(x + 100, y + 34, name, { a: 'middle', s: o.mine ? 26 : 22, f: o.mine ? handFont : typeFont, c: o.mine ? '#2a2030' : INK });
  if (o.stamp) s += T(x + 100, y + 72, o.stamp, { a: 'middle', s: 18, c: '#c0283c', tr: `rotate(-6 ${x + 100} ${y + 72})`, op: 0.85 });
  return s;
}
function cuChecadorLive(st) {
  let s = '';
  STAFF.forEach(([id, name], i) => {
    if (st.punched === id) return;
    const [x, y] = pocketXY('in', i);
    s += timecardTop(x, y, name.split(' ')[1], { stamp: st.rejected?.includes(id) ? 'RECHAZADA' : '' });
  });
  if (st.punched) { const name = STAFF.find(p => p[0] === st.punched)[1]; const [x, y] = pocketXY('out', 0); s += timecardTop(x, y, name.split(' ')[1]); }
  if (st.mine) { const [x, y] = pocketXY('in', 12); s += timecardTop(x, y, 'Polilla', { mine: true }); }
  if (st.power) s += `<circle cx="935" cy="500" r="16" fill="#ffb347" opacity=".8" filter="url(#glowSoft)"/><circle cx="935" cy="500" r="6" fill="#ffe2a0"/>`;
  return s;
}

/* ---------- Panel del ascensor ---------- */
function cuAscensorBase() {
  let s = `<rect x="-20" y="-20" width="1640" height="960" fill="#1e2532"/>`;
  // Las puertas a la izquierda y el marco
  s += ink([{ d: rrect(-40, -20, 520, 960), m: M2.steel, s: 16 }], { lw: 8 });
  s += hline([[230, -20], [230, 940]], 6, INK) + `<path d="${rrect(20, 60, 180, 360)}" fill="none" stroke="${INK}" stroke-width="3" opacity=".6"/><path d="${rrect(260, 60, 180, 360)}" fill="none" stroke="${INK}" stroke-width="3" opacity=".6"/>`;
  s += ink([{ d: rrect(470, -20, 60, 960), m: M2.steel, s: 6, hatch: false }], { lw: 6 });
  // Panel de bronce
  s += ink([{ d: rrect(640, 40, 440, 830), m: M.brass, s: 18 }], { lw: 8 });
  for (const [x, y] of [[664, 64], [1056, 64], [664, 846], [1056, 846]]) s += `<circle cx="${x}" cy="${y}" r="8" fill="#74562f" stroke="${INK}" stroke-width="2.5"/>`;
  // Placa de instrucciones grabada
  s += ink([{ d: rrect(676, 84, 368, 268), m: { b: '#2a2420', S: '#1a1614', D: '#0e0c0a', H: '#5a4a3a' }, s: 6, hatch: false }], { lw: 5 });
  const L = [['ASCENSOR DE SERVICIO', 22], ['USO NOCTURNO', 16], ['', 8], ['1 · Llave en SERVICIO', 18], ['2 · El responsable de cierre', 18], ['     marca SALIDA en el checador', 16], ['3 · Pulse LLAMAR', 18]];
  let y = 120; for (const [t, sz] of L) { s += T(694, y, t, { s: sz, c: '#e2c27a' }); y += sz + 14; }
  // Lámparas de estado
  s += T(760, 410, 'FUERA DE', { a: 'middle', s: 14, c: INK }) + T(760, 428, 'HORARIO', { a: 'middle', s: 14, c: INK });
  s += T(960, 410, 'EN', { a: 'middle', s: 14, c: INK }) + T(960, 428, 'SERVICIO', { a: 'middle', s: 14, c: INK });
  for (const x of [760, 960]) s += ink([{ d: rell(x, 470, 30, 30), m: M.metal, s: 4, hatch: false }], { lw: 5 });
  // Cerradura de llave con sus dos posiciones
  s += ink([{ d: rell(860, 600, 64, 64), m: M.metal, s: 8 }, { d: rell(860, 600, 34, 34), m: M.brass, s: 5, hatch: false }], { lw: 6 });
  s += `<rect x="854" y="580" width="12" height="40" rx="3" fill="#07050a"/>`;
  s += T(752, 560, 'APAGADO', { a: 'middle', s: 14 }) + T(972, 560, 'SERVICIO', { a: 'middle', s: 14 });
  // Botón de llamada
  s += ink([{ d: rell(860, 770, 56, 56), m: M.metal, s: 6 }, { d: rell(860, 770, 40, 40), m: M.bone, s: 6, hatch: false }], { lw: 6 });
  s += T(860, 778, 'LLAMAR', { a: 'middle', s: 15 });
  s += T(1300, 860, 'OTIS · 1961', { a: 'middle', s: 16, c: '#5a6e7c', ls: 3 });
  return s;
}
function cuAscensorLive(st) {
  let s = '';
  if (st.power) {
    const ok = st.ready;
    s += `<circle cx="${ok ? 960 : 760}" cy="470" r="34" fill="${ok ? '#3dff8a' : '#ff3d5a'}" opacity=".75" filter="url(#glowSoft)"/><circle cx="${ok ? 960 : 760}" cy="470" r="18" fill="${ok ? '#c9ffd9' : '#ffb0bc'}"/>`;
  }
  if (st.keyIn) s += `<g transform="rotate(${st.power ? 90 : 0} 860 600)">${ink([{ d: rell(860, 600, 20, 52), m: M.brass, s: 4, hatch: false }], { lw: 5 })}<circle cx="860" cy="566" r="7" fill="${INK}"/><path d="M860 584V640" stroke="#74562f" stroke-width="3"/></g>`;
  return s;
}

/* ---------- Láminas: la tarjeta n.º 13, el expediente y la calle ---------- */
function sheetTarjeta() {
  let s = `<rect x="6" y="6" width="420" height="660" fill="#000" opacity=".35"/>`;
  s += ink([{ d: rrect(0, 0, 420, 660), m: { b: '#e6d6b4', S: '#b8a68a', D: '#7a6a58', H: '#fff4dc' }, s: 6, hatch: false }], { lw: 5 });
  s += `<rect x="0" y="0" width="420" height="34" fill="#7c2434"/>` + T(210, 23, 'SEGUROS FERRAZ · TARJETA DE ASISTENCIA', { a: 'middle', s: 12.5, c: PAPER });
  s += T(20, 64, 'N.º 13', { s: 18 }) + T(120, 66, 'NOMBRE:', { s: 14 }) + T(200, 68, 'Polilla', { s: 26, f: handFont, b: false, c: '#2a2030' });
  s += T(20, 98, 'FECHA', { s: 12, c: '#7c2434' }) + T(110, 98, 'ENTRADA', { s: 12, c: '#7c2434' }) + T(190, 98, 'SALIDA', { s: 12, c: '#7c2434' });
  s += T(230 + 20, 98, 'FECHA', { s: 12, c: '#7c2434' }) + T(230 + 110, 98, 'ENT.', { s: 12, c: '#7c2434' }) + T(230 + 160, 98, 'SAL.', { s: 12, c: '#7c2434' });
  s += hline([[14, 106], [406, 106]], 1.6, INK) + hline([[222, 86], [222, 650]], 1.2, INK, { op: 0.6 });
  for (let i = 0; i < 37; i++) {
    const yr = String((88 + i) % 100).padStart(2, '0'), col = i < 19 ? 0 : 1, row = col ? i - 19 : i, y = 128 + row * 28;
    const last = i === 36, c = last ? '#a3202f' : '#3a3040';
    s += T(20 + col * 230, y, `14 OCT ${yr}`, { s: 13, c }) + T(110 + col * 230, y, '23:47', { s: 13, c });
    s += hline([[14 + col * 230, y + 8], [214 + col * 230, y + 8]], 0.8, '#7f7190', { op: 0.5, seed: i });
  }
  return `<g transform="translate(14 14)">${s}</g>`;
}
function sheetExpediente() {
  let s = `<rect x="8" y="8" width="460" height="640" fill="#000" opacity=".35"/>`;
  s += ink([{ d: rrect(0, 0, 460, 640), m: M.paper, s: 6, hatch: false }], { lw: 5 });
  s += T(230, 50, 'NOCTUA', { a: 'middle', s: 34, f: 'Rockwell,Georgia,serif', ls: 6 });
  s += T(230, 80, 'PERSONAL RETENIDO · 14 · X · 87', { a: 'middle', s: 15, c: '#7c2434' });
  s += hline([[30, 96], [430, 96]], 2, INK);
  STAFF.forEach(([, n, r], i) => { const y = 128 + i * 34; s += T(34, y, `${String(i + 1).padStart(2, '0')}.`, { s: 16 }) + T(80, y, n, { s: 18 }) + T(430, y, r, { a: 'end', s: 13, c: '#4a3a50', b: false }); });
  const y13 = 128 + 12 * 34;
  s += T(34, y13, '13.', { s: 16 });
  for (let i = 0; i < 9; i++) s += tline([[72 + i * 3, y13 - 22 + i * 3], [424 - i * 5, y13 - 16 + (i % 3) * 5]], 15 - i, '#150e1b', { op: 0.92 });
  s += `<path d="M300 ${y13 - 6}l10 -8 6 10 8 -6" stroke="${PAPER}" stroke-width="3" fill="none"/>`;
  s += T(230, 600, 'NO ABRIR FUERA DEL EDIFICIO', { a: 'middle', s: 14, c: '#7c2434' });
  s += `<g transform="rotate(-12 340 560)"><rect x="262" y="530" width="156" height="50" fill="none" stroke="#c0283c" stroke-width="4" rx="6"/>${T(340, 564, 'RETENIDO', { a: 'middle', s: 24, c: '#c0283c' })}</g>`;
  return `<g transform="translate(14 14)">${s}</g>`;
}
// Afuera, bajo la lluvia: la fachada desde la vereda y la ventana del tercer piso
function artCalle() {
  let s = `<defs><linearGradient id="gSky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0f1c"/><stop offset=".7" stop-color="#1e1428"/><stop offset="1" stop-color="#3a1524"/></linearGradient></defs>`;
  s += `<rect x="-20" y="-20" width="1640" height="960" fill="url(#gSky2)"/>`;
  // Fachada en contrapicado
  s += ink([{ d: rpoly([[380, -40], [1240, -40], [1320, 900], [300, 900]]), m: { b: '#2a2434', S: '#1c1824', D: '#100d16', H: '#4a4560' }, s: 14 }], { lw: 7 });
  const rows = [[60, 150], [230, 315], [395, 480], [560, 650]];          // pisos 4, 3, 2, 1 (desde arriba)
  rows.forEach(([y0, y1], r) => {
    for (let c = 0; c < 4; c++) {
      const x0 = 420 + c * 200 - (3 - r) * 4, w = 150;
      const lit = r === 1 && c === 1;                                       // tercer piso, la oficina de Ferraz
      s += `<path d="${rrect(x0, y0, w, y1 - y0, { seed: r * 4 + c })}" fill="${lit ? '#c98a5a' : '#0e0c16'}" stroke="${INK}" stroke-width="5"/>`;
      if (!lit) s += `<path d="M${x0 + 10} ${y0 + 10}L${x0 + 60} ${y0 + 10}L${x0 + 10} ${y0 + 50}Z" fill="#4a5a7a" opacity=".25"/>`;
      s += hline([[x0 - 8, y1 + 6], [x0 + w + 8, y1 + 6]], 6, INK);
    }
  });
  // Silueta en la ventana encendida
  s += `<g id="calleSil"><ellipse cx="695" cy="262" rx="16" ry="20" fill="#120a10"/><path d="M660 316Q662 284 678 276Q695 270 712 276Q728 284 730 316Z" fill="#120a10"/></g>`;
  s += `<path d="M600 230h150v85H600z" fill="url(#hatchF)" opacity=".2"/>`;
  // Marquesina y puerta del edificio
  s += ink([{ d: rpoly([[540, 690], [1080, 690], [1120, 730], [500, 730]]), m: { b: '#5b1f2e', S: '#3a121d', D: '#220a12', H: '#8a3a4a' }, s: 6 }], { lw: 6 });
  s += T(810, 720, 'EDIFICIO FERRAZ', { a: 'middle', s: 24, f: 'Rockwell,Georgia,serif', ls: 4, c: '#e8dcc2' });
  s += `<path d="${rrect(700, 740, 220, 170)}" fill="#e8c98a" opacity=".85" stroke="${INK}" stroke-width="6"/>`;
  // Auto de la Sección en primer plano (techo y parabrisas mojado)
  s += `<g transform="translate(0 -70)">${ink([{ d: rcurve([[1040, 940], [1120, 800], [1300, 770], [1560, 790], [1660, 860], [1660, 940]]), m: { b: '#1c1e26', S: '#121318', D: '#08090c', H: '#5a6070' }, s: 12 }], { lw: 8 })}
    <path d="M1160 840Q1260 800 1420 806L1440 860H1150Z" fill="#2c3448" opacity=".9"/><path d="M1200 846l60 -30" stroke="#8aa0c0" stroke-width="3" opacity=".5"/></g>`;
  // Lluvia
  const R = rng(29);
  for (let i = 0; i < 140; i++) { const x = R() * 1640, y = R() * 900; s += `<path d="M${f1(x)} ${f1(y)}l-9 ${f1(22 + R() * 18)}" stroke="#b9d6ea" stroke-width="1.6" opacity="${f1(0.15 + R() * 0.35)}"/>`; }
  s += `<rect id="calleFlash" x="-20" y="-20" width="1640" height="960" fill="#fff" opacity="0"/>`;
  s += `<circle id="calleBurst" cx="695" cy="280" r="60" fill="#fff" opacity="0" filter="url(#glowBig)"/>`;
  return s;
}
// En el destello del apagón: lo que está parado en la recepción
function artApagon() {
  let s = `<rect x="-20" y="-20" width="1640" height="960" fill="#0a0d16"/>`;
  s += `<path d="M330 90H1300V640H330Z" fill="#141a26"/><path d="M538 478H1012V690H538Z" fill="#0c0f16"/><path d="M1150 244H1282V640H1150Z" fill="#0c0f16"/>`;
  s += `<path d="M330 640L1300 640L2076 1056L-446 1056Z" fill="#10141c"/>`;
  s += `<g transform="translate(470 340)"><ellipse cx="0" cy="0" rx="34" ry="42" fill="#020103"/><path d="M-80 520Q-86 120 -42 58Q0 40 42 58Q86 120 80 520Z" fill="#020103"/></g>`;
  return s;
}

/* ---------- Íconos del inventario del cap. 2 ---------- */
Object.assign(ICONS, {
  abrecartas: () => ink([{ d: rpoly([[12, 46], [44, 18], [54, 12], [50, 22], [18, 52]], { amp: 0.3 }), m: { b: '#b8c2cc', S: '#7a8492', D: '#4a525e', H: '#f0f6fa' }, s: 2, hatch: false }, { d: rpoly([[6, 50], [16, 40], [24, 48], [14, 58]], { amp: 0.3 }), m: M.wood, s: 2, hatch: false }], { lw: 3 }),
  llaveAsc: () => ink([{ d: rrect(10, 8, 26, 18, { amp: 0.3 }), m: { b: '#7c2434', S: '#4b1422', D: '#2c0b15', H: '#c4485a' }, s: 2, hatch: false }, { d: rell(36, 34, 9, 9, { amp: 0.3 }), m: M.brass, s: 2, hatch: false }, { d: rpoly([[42, 38], [58, 54], [54, 58], [38, 42]], { amp: 0.2 }), m: M.brass, s: 2, hatch: false }], { lw: 3 })
    + `<path d="M28 20L34 30" stroke="${INK}" stroke-width="2"/><circle cx="36" cy="34" r="3" fill="${INK}"/>`,
});
