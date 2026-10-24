/* =====================================================================
   [7] LA RECEPCIÓN (cap. 2): arte de la escena principal, los primeros
   planos y las láminas (tarjeta, expediente, la calle). Mismo entintador
   que la oficina; punto de fuga en 815,380.
   Capas: cuarto y muebles (horneados) → puertas del ascensor, agujas y
   reloj (vivos) → penumbra → vidrio de la oficina con la silueta (vivo)
   → luces en «screen» → motas, objetos movidos y zonas de clic.
   ===================================================================== */
const VP2 = [815, 380];
const p2 = (x, y, t) => [VP2[0] + (x - VP2[0]) * t, VP2[1] + (y - VP2[1]) * t];
// Pared del fondo: x 330–1300, y 90–640
const M2 = {
  wall:   { b: '#34404e', S: '#252e3b', D: '#151a24', H: '#5f7690' },   // pizarra fría: más azul que la oficina
  wallL:  { b: '#2a3341', S: '#1e2532', D: '#11151d', H: '#4c5f78' },
  formica:{ b: '#8a7c64', S: '#5e5248', D: '#3a3230', H: '#c2b08a' },
  cream:  { b: '#b3a588', S: '#7a6f6c', D: '#4a4250', H: '#e2d4b2' },   // esmalte crema (checador, centralita)
  green:  { b: '#3e5a4c', S: '#2a3e35', D: '#16231e', H: '#6f9a84' },   // esmalte verde industrial (fusibles)
  vinyl:  { b: '#5a2a33', S: '#3b1a22', D: '#220d13', H: '#94505c' },   // banco de espera
  steel:  { b: '#5a636e', S: '#3a414c', D: '#20252e', H: '#a3b6c4' },
};
// Los 12 empleados de 1987 (directorio, checador, casilleros y el expediente usan la misma lista)
const STAFF = [
  ['ferraz', 'A. Ferraz', 'Dirección'], ['olmos', 'M. Olmos', 'Recepción'], ['mendez', 'R. Méndez', 'Conserjería'],
  ['ibanez', 'E. Ibáñez', 'Contabilidad'], ['salas', 'C. Salas', 'Pólizas'], ['duran', 'L. Durán', 'Pólizas'],
  ['cortes', 'J. Cortés', 'Siniestros'], ['vidal', 'T. Vidal', 'Siniestros'], ['paredes', 'N. Paredes', 'Archivo'],
  ['rojas', 'S. Rojas', 'Secretaría'], ['quiroga', 'H. Quiroga', 'Cobranzas'], ['lagos', 'B. Lagos', 'Mensajería'],
];

/* ---------- Geometría fija de la escena ---------- */
const DOOR_OF = [p2(330, 250, 1.38), p2(330, 250, 1.08), p2(330, 640, 1.08), p2(330, 640, 1.38)];     // puerta de la oficina
const GLASS_OF = [p2(330, 270, 1.35), p2(330, 270, 1.11), p2(330, 450, 1.11), p2(330, 450, 1.35)];    // su vidrio esmerilado
const STAIR = [p2(1300, 250, 1.08), p2(1300, 250, 1.36), p2(1300, 640, 1.36), p2(1300, 640, 1.08)];    // escalera (pared derecha)
const ELEV = { x0: 1150, x1: 1282, y0: 244, y1: 640, mid: 1216 };
const CLOCK2 = [800, 160];
const NEEDLE = [1216, 214];
const FLOOR_ANG = { PB: 200, 1: 240, 2: 300, 3: 340 };

/* ---------- El cuarto: cielo raso, paredes, piso de damero ---------- */
function artRecepcionRoom() {
  let s = '';
  const far = 2.6;
  s += ink([{ d: rpoly([[330, 90], [1300, 90], p2(1300, 90, far), p2(330, 90, far)]), m: M.ceil, hatch: false, lit: false }]);
  s += ink([
    { d: rpoly([[330, 90], p2(330, 90, far), p2(330, 640, far), [330, 640]]), m: M2.wallL, s: 18, lit: false },
    { d: rpoly([[1300, 90], p2(1300, 90, far), p2(1300, 640, far), [1300, 640]]), m: M2.wallL, s: 18, lit: false },
  ]);
  s += ink([{ d: rpoly([[330, 640], [1300, 640], p2(1300, 640, far), p2(330, 640, far)]), m: M.floor, s: 22, hatch: false, lit: false }]);
  // Damero de linóleo en perspectiva
  const xs = [], ts = [1, 1.09, 1.2, 1.34, 1.52, 1.76, 2.08, 2.6];
  for (let x = 330; x <= 1300.1; x += 97) xs.push(x);
  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < ts.length - 1; j++) {
    if ((i + j) % 2) continue;
    const q = [p2(xs[i], 640, ts[j]), p2(xs[i + 1], 640, ts[j]), p2(xs[i + 1], 640, ts[j + 1]), p2(xs[i], 640, ts[j + 1])];
    s += `<path d="${rpoly(q, { amp: 0.8, seed: i * 7 + j })}" fill="#463c48" opacity=".55"/>`;
  }
  for (const x of xs) s += hline([[x, 640], p2(x, 640, far)], 1.6, INK, { op: 0.35, seed: x });
  for (const t of ts.slice(1)) s += hline([p2(330, 640, t), p2(1300, 640, t)], 1.4, INK, { op: 0.3, seed: t * 10 });
  // Pared del fondo con friso de madera
  s += ink([{ d: rrect(330, 90, 970, 550), m: M2.wall, s: 16 }]);
  for (let x = 352; x < 1300; x += 44) s += hline([[x, 98], [x + 1, 470]], 1.2, '#4e5d70', { op: 0.3, seed: x });
  s += ink([{ d: rrect(330, 478, 970, 162), m: M.wood, s: 8, hatchOp: 0.35 }], { lw: 4 });
  s += hline([[330, 470], [1300, 470]], 5, INK);
  // Manchas de humedad y una grieta
  s += `<path d="${rell(560, 120, 80, 28, { amp: 7 })}" fill="#1f2632" opacity=".5"/><path d="${rell(1240, 140, 50, 40, { amp: 8 })}" fill="#1c222d" opacity=".5"/>`;
  s += tline([[930, 92], [924, 150], [936, 196]], 2.4, INK, { curve: true, op: 0.6 });
  // Friso en las paredes laterales (línea en perspectiva)
  s += hline([[330, 470], p2(330, 470, far)], 4, INK, { op: 0.8 }) + hline([[1300, 470], p2(1300, 470, far)], 4, INK, { op: 0.8 });
  return s;
}

/* ---------- Muebles y cosas de la pared del fondo ---------- */
function artRecepcionBack() {
  let s = '';
  // Lámpara de tubos colgante (apagada hasta que vuelve la corriente)
  s += hline([[640, -200], [640, 112]], 2.5, INK) + hline([[990, -200], [990, 112]], 2.5, INK);
  s += ink([{ d: rrect(600, 110, 430, 18), m: M.metal, s: 4, hatch: false }, { d: rpoly([[592, 128], [1038, 128], [1028, 142], [602, 142]]), m: { b: '#8d93a0', S: '#5c6170', D: '#363a48', H: '#c9d2dc' }, s: 3, hatch: false }], { lw: 4 });
  // Caja de fusibles (esmalte verde, cartel de peligro, cuatro tornillos)
  s += ink([{ d: rrect(350, 250, 92, 168), m: M2.green, s: 8 }], { lw: 5 });
  s += `<path d="${rrect(360, 262, 72, 144, { amp: 0.6 })}" fill="none" stroke="${INK}" stroke-width="2.5" opacity=".7"/>`;
  s += `<path d="M396 282l-14 26h28z" fill="#e8c445" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><path d="M398 288l-5 9h5l-4 8" stroke="${INK}" stroke-width="2" fill="none"/>`;
  s += `<rect x="372" y="326" width="48" height="16" fill="${PAPER}" stroke="${INK}" stroke-width="2"/><text x="396" y="338" text-anchor="middle" font-family="${typeFont}" font-weight="bold" font-size="11" fill="${INK}">P.3</text>`;
  for (const [x, y] of [[358, 258], [434, 258], [358, 410], [434, 410]]) s += `<circle cx="${x}" cy="${y}" r="3.5" fill="#9fb3a8" stroke="${INK}" stroke-width="1.5"/>`;
  s += hline([[396, 418], [398, 470]], 5, INK, { op: 0.9 });                                    // caño hacia el piso
  // Casilleros de correspondencia (5×3), el del conserje con puertita y candado
  s += ink([{ d: rrect(458, 148, 246, 256), m: M.woodL, s: 10 }], { lw: 6 });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
    const x = 468 + c * 46.5, y = 158 + r * 81.5, w = 40, h = 64;
    s += `<path d="${rrect(x, y, w, h, { amp: 0.6, seed: r * 5 + c })}" fill="#120c10" stroke="${INK}" stroke-width="2.5"/>`;
    s += `<rect x="${x + 4}" y="${y + h + 4}" width="${w - 8}" height="7" fill="${PAPER}" opacity=".8"/>`;
    const k = r * 5 + c;
    if (k === 8) {                                                           // conserje: puertita de chapa
      s += ink([{ d: rrect(x + 1, y + 1, w - 2, h - 2), m: M.metal, s: 4, hatch: false }], { lw: 3 });
      s += `<path d="M${x + w / 2 - 5} ${y + 30}a5 5 0 0 1 10 0v4h-10z" fill="none" stroke="#b08a4a" stroke-width="2"/><rect x="${x + w / 2 - 7}" y="${y + 33}" width="14" height="12" rx="2" fill="#b08a4a" stroke="${INK}" stroke-width="2"/>`;
    } else if ([0, 3, 6, 10, 11].includes(k)) {                               // sobres olvidados
      s += `<path d="${rpoly([[x + 4, y + h - 4], [x + w - 6, y + h - 10], [x + w - 4, y + h - 2], [x + 6, y + h]], { amp: 0.4 })}" fill="#cfc2a6" stroke="${INK}" stroke-width="1.5"/>`;
    }
  }
  // Reloj de pared (las agujas van en una capa viva: andan hacia atrás)
  s += ink([{ d: rell(CLOCK2[0], CLOCK2[1], 42, 42), m: M.wood, s: 6 }, { d: rell(CLOCK2[0], CLOCK2[1], 34, 34), m: M.bone, s: 5, hatch: false }], { lw: 5 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; s += `<path d="M${f1(CLOCK2[0] + Math.cos(a) * 27)} ${f1(CLOCK2[1] + Math.sin(a) * 27)}L${f1(CLOCK2[0] + Math.cos(a) * 32)} ${f1(CLOCK2[1] + Math.sin(a) * 32)}" stroke="${INK}" stroke-width="${i % 3 ? 2 : 3.5}"/>`; }
  // Letrero de recepción
  s += ink([{ d: rrect(722, 214, 156, 34), m: M.brass, s: 4, hatch: false }], { lw: 4 });
  s += `<text x="800" y="238" text-anchor="middle" font-family="Rockwell,Georgia,serif" font-weight="900" font-size="18" letter-spacing="3" fill="${INK}">RECEPCIÓN</text>`;
  // Afiche de la empresa: el búho de Seguros Ferraz
  s += `<g transform="rotate(-2 800 345)">${ink([{ d: rrect(738, 272, 124, 150), m: M.paper, s: 6, hatch: false }], { lw: 4 })}
    <path d="${rrect(748, 282, 104, 96, { amp: 0.6 })}" fill="#2a3346"/>
    <path d="M800 300c-22 0-34 16-34 34s12 34 34 34 34-16 34-34-12-34-34-34zM772 300l8 12M828 300l-8 12" fill="#c9b27a" stroke="${INK}" stroke-width="2.5"/>
    <circle cx="788" cy="330" r="9" fill="#f3e3b0" stroke="${INK}" stroke-width="2"/><circle cx="812" cy="330" r="9" fill="#f3e3b0" stroke="${INK}" stroke-width="2"/>
    <circle cx="788" cy="331" r="4" fill="${INK}"/><circle cx="812" cy="331" r="4" fill="${INK}"/><path d="M796 342l4 7 4-7z" fill="#7c2434"/>
    <text x="800" y="398" text-anchor="middle" font-family="Rockwell,Georgia,serif" font-weight="900" font-size="12" fill="${INK}">SEGUROS FERRAZ</text>
    <text x="800" y="412" text-anchor="middle" font-family="${handFont}" font-size="11" fill="#7c2434">velamos por usted</text></g>`;
  // Reloj checador con los tarjeteros
  for (const [x0, lbl] of [[928, 'ENTRADA'], [1056, 'SALIDA']]) {
    s += ink([{ d: rrect(x0, 252, 42, 190), m: M.metal, s: 5, hatch: false }], { lw: 4 });
    for (let i = 0; i < 7; i++) {
      s += hline([[x0 + 4, 268 + i * 25], [x0 + 38, 268 + i * 25]], 2, INK, { op: 0.8 });
      if (x0 === 928 && i < 6) s += `<rect x="${x0 + 8}" y="${256 + i * 25}" width="26" height="12" fill="#d8ccb0" stroke="${INK}" stroke-width="1.4"/>`;
    }
    s += `<text x="${x0 + 21}" y="458" text-anchor="middle" font-family="${typeFont}" font-weight="bold" font-size="9" fill="#c9d2dc">${lbl}</text>`;
  }
  s += ink([{ d: rrect(976, 262, 76, 160), m: M2.cream, s: 8 }], { lw: 5 });
  s += ink([{ d: rell(1014, 300, 24, 24), m: M.bone, s: 3, hatch: false }], { lw: 3 });
  s += `<path d="M1014 300l-8 -12M1014 300l10 3" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`;
  s += `<rect x="990" y="342" width="48" height="8" fill="#151018" stroke="${INK}" stroke-width="2"/><rect x="996" y="372" width="36" height="34" fill="none" stroke="${INK}" stroke-width="2" opacity=".6"/>`;
  s += `<text x="1014" y="392" text-anchor="middle" font-family="Rockwell,Georgia,serif" font-weight="900" font-size="9" fill="${INK}">TEMPUS</text>`;
  // Panel de llamada del ascensor
  s += ink([{ d: rrect(1102, 378, 30, 104), m: M.brass, s: 4, hatch: false }], { lw: 4 });
  s += `<circle cx="1117" cy="404" r="5" fill="#2a2030" stroke="${INK}" stroke-width="2"/><rect x="1113" y="420" width="8" height="12" rx="2" fill="#151018"/><circle cx="1117" cy="456" r="8" fill="#d9cdb4" stroke="${INK}" stroke-width="2.5"/>`;
  // Ascensor: marco, indicador de piso y la cabina (detrás de las puertas)
  s += ink([{ d: rrect(1138, 228, 156, 412), m: M2.steel, s: 8 }], { lw: 6 });
  s += `<path d="${rrect(ELEV.x0, ELEV.y0, ELEV.x1 - ELEV.x0, ELEV.y1 - ELEV.y0)}" fill="#0b0a0e"/>`;
  s += `<path d="M${ELEV.x0} 600H${ELEV.x1}V640H${ELEV.x0}Z" fill="#2a2228"/>` + hline([[ELEV.x0 + 8, 470], [ELEV.x1 - 8, 470]], 4, '#5a636e', { op: 0.8 });
  s += ink([{ d: `M${NEEDLE[0] - 34} ${NEEDLE[1]}A34 34 0 0 1 ${NEEDLE[0] + 34} ${NEEDLE[1]}Z`, m: M.brass, s: 4, hatch: false }], { lw: 4 });
  for (const [k, a] of Object.entries(FLOOR_ANG)) {
    const r = a * Math.PI / 180;
    s += `<text x="${f1(NEEDLE[0] + Math.cos(r) * 22)}" y="${f1(NEEDLE[1] + Math.sin(r) * 22 + 4)}" text-anchor="middle" font-family="${typeFont}" font-weight="bold" font-size="9" fill="${INK}">${k}</text>`;
  }
  // Mostrador: tapa de fórmica, frente de madera, centralita, libros y timbre
  s += ink([
    { d: rpoly([[556, 452], [994, 452], [1012, 478], [538, 478]]), m: M2.formica, s: 4, hatch: false },
    { d: rrect(538, 478, 474, 212), m: M.wood, s: 12 },
  ]);
  for (let x = 552; x < 1000; x += 115) s += `<path d="${rrect(x, 500, 100, 170, { seed: x })}" fill="none" stroke="#241217" stroke-width="3" opacity=".7"/>`;
  s += ink([{ d: rrect(742, 560, 66, 18), m: M.brass, s: 3, hatch: false }], { lw: 3 });
  s += `<text x="775" y="573" text-anchor="middle" font-family="${typeFont}" font-weight="bold" font-size="10" fill="${INK}">M. OLMOS</text>`;
  // Centralita (esmalte crema, panel inclinado de clavijas)
  s += ink([
    { d: rrect(556, 404, 140, 66), m: M2.cream, s: 8 },
    { d: rpoly([[562, 404], [690, 404], [676, 372], [576, 372]]), m: M2.cream, s: 4, hatch: false },
  ], { lw: 5 });
  for (let i = 0; i < 8; i++) {
    const x = 584 + (i % 4) * 26, y = i < 4 ? 382 : 394;
    s += `<circle cx="${x}" cy="${y}" r="3.6" fill="#151018" stroke="#b08a4a" stroke-width="1.5"/>`;
  }
  for (let i = 0; i < 4; i++) s += ink([{ d: rrect(578 + i * 28, 426, 14, 24), m: M.bone, s: 2, hatch: false }], { lw: 2.5 });
  s += hline([[690, 440], [712, 462], [700, 480]], 3, INK, { op: 0.9 });                        // cordón con la clavija
  // Libro de visitas abierto, timbre y libro de turnos
  s += ink([{ d: rpoly([[746, 458], [848, 456], [852, 474], [742, 476]]), m: M.paper, s: 3, hatch: false }], { lw: 3 });
  s += hline([[797, 457], [797, 475]], 1.6, INK, { op: 0.7 });
  s += ink([{ d: `M852 466a16 10 0 0 1 32 0z`, m: { b: '#9aa8b4', S: '#626e7c', D: '#3a4250', H: '#e0ecf4' }, s: 3, hatch: false }, { d: rrect(848, 466, 40, 6), m: M.metal, s: 2, hatch: false }], { lw: 3 });
  s += ink([{ d: rpoly([[930, 446], [992, 444], [1000, 474], [926, 476]]), m: { b: '#2e3c58', S: '#1e283c', D: '#121826', H: '#5a6e92' }, s: 4, hatch: false }], { lw: 3 });
  s += `<rect x="944" y="452" width="34" height="9" fill="${PAPER}" stroke="${INK}" stroke-width="1.2"/>`;
  return s;
}

/* ---------- Paredes laterales: la puerta de la oficina y la escalera ---------- */
function artRecepcionSides() {
  let s = '';
  // Puerta de la oficina (el vidrio va en su propia capa viva)
  s += ink([{ d: rpoly([p2(330, 236, 1.41), p2(330, 236, 1.05), p2(330, 640, 1.05), p2(330, 640, 1.41)]), m: M.wood, s: 6 }, { d: rpoly(DOOR_OF), m: M.woodL, s: 10 }], { lw: 5 });
  s += ink([{ d: rpoly([p2(330, 262, 1.36), p2(330, 262, 1.1), p2(330, 458, 1.1), p2(330, 458, 1.36)]), m: M.wood, s: 3, hatch: false }], { lw: 4 });
  s += `<path d="${rpoly([p2(330, 500, 1.32), p2(330, 500, 1.14), p2(330, 610, 1.14), p2(330, 610, 1.32)])}" fill="none" stroke="#2c171b" stroke-width="3" opacity=".7"/>`;
  // Escalera: puerta cortafuego con barra, cadena y candado
  const stairM = { b: '#58403a', S: '#3a2a28', D: '#20161a', H: '#93705e' };
  s += ink([{ d: rpoly([p2(1300, 236, 1.05), p2(1300, 236, 1.4), p2(1300, 640, 1.4), p2(1300, 640, 1.05)]), m: M.metal, s: 6 }, { d: rpoly(STAIR), m: stairM, s: 10 }], { lw: 5 });
  s += ink([{ d: rpoly([p2(1300, 420, 1.12), p2(1300, 420, 1.33), p2(1300, 440, 1.33), p2(1300, 440, 1.12)]), m: M2.steel, s: 2, hatch: false }], { lw: 3 });
  const ch = [p2(1300, 360, 1.1), p2(1300, 430, 1.22), p2(1300, 520, 1.34)];
  s += hline(ch, 7, INK) + hline(ch, 3.5, '#8b8f99');
  for (let i = 0; i < 9; i++) { const [x, y] = [lerp(ch[0][0], ch[2][0], i / 8), lerp(ch[0][1], ch[2][1], i / 8) + (i % 2 ? 2 : -2)]; s += `<path d="${rell(x, y, 5, 3.5)}" fill="none" stroke="#a6abb5" stroke-width="2"/>`; }
  const [px, py] = p2(1300, 440, 1.22);
  s += ink([{ d: rrect(px - 11, py + 4, 22, 22), m: M2.steel, s: 3, hatch: false }], { lw: 3 }) + `<path d="M${px - 7} ${py + 4}a7 7 0 0 1 14 0" stroke="#a6abb5" stroke-width="3" fill="none"/>`;
  // Caja del cartel de SALIDA (la letra va viva, en la capa de luces)
  s += `<path d="${rpoly([[1368, 140], [1446, 120], [1446, 150], [1368, 168]])}" fill="#0f1a14" stroke="${INK}" stroke-width="4"/>`;
  return s;
}

/* ---------- Primer plano: paragüero, planta muerta y banco de espera ---------- */
function artRecepcionFore() {
  let s = '';
  // Charco y paragüero junto a la puerta de la oficina
  s += `<path d="${rell(352, 744, 46, 10, { amp: 3 })}" fill="#1a2633" opacity=".9"/><path d="M330 742q14 -4 30 0" stroke="#7d9ab0" stroke-width="2" fill="none" opacity=".7"/>`;
  s += ink([
    { d: rrect(330, 664, 46, 78), m: M.metal, s: 6 },
    { d: rcurve([[338, 666], [344, 600], [350, 560], [356, 600], [366, 666]]), m: M.cloth, s: 5 },
  ], { lw: 5 });
  s += `<path d="M352 562q0 -26 18 -26t16 18" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M352 562q0 -26 18 -26t16 18" stroke="#5a3a48" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  s += tline([[344, 620], [340, 664]], 2, '#9fb7cc', { op: 0.6 });
  // Planta muerta en el rincón izquierdo
  const dark = { b: '#161a1c', S: '#0e1012', D: '#07080a', H: '#3e5258' };
  s += ink([
    { d: rpoly([[20, 780], [170, 780], [154, 940], [36, 940]]), m: { b: '#3a2a22', S: '#241a16', D: '#120d0b', H: '#6a5040' }, s: 12 },
    { d: rcurve([[90, 780], [60, 690], [-20, 640], [-40, 680], [30, 706], [80, 782]]), m: dark, s: 8 },
    { d: rcurve([[100, 780], [130, 650], [210, 600], [236, 622], [170, 690], [114, 782]]), m: dark, s: 8 },
    { d: rcurve([[96, 780], [80, 620], [104, 540], [124, 560], [112, 680], [106, 782]]), m: dark, s: 8 },
  ], { lw: 7 });
  // Banco de espera (vinilo vino) con revistas viejas
  s += ink([
    { d: rpoly([[1176, 770], [1452, 770], [1470, 806], [1160, 806]]), m: M2.vinyl, s: 6 },
    { d: rrect(1160, 806, 310, 22), m: M2.vinyl, s: 5, hatch: false },
    { d: rpoly([[1184, 700], [1444, 700], [1452, 770], [1176, 770]]), m: M2.vinyl, s: 8 },
  ], { lw: 6 });
  for (const x of [1176, 1452]) s += hline([[x, 828], [x, 880]], 7, INK);
  for (const x of [1250, 1320, 1390]) s += `<circle cx="${x}" cy="736" r="3" fill="#220d13"/>`;
  s += ink([{ d: rpoly([[1214, 776], [1290, 772], [1296, 798], [1218, 802]]), m: { b: '#b8a27a', S: '#86704e', D: '#56462f', H: '#e8d4a6' }, s: 3, hatch: false }], { lw: 3 });
  s += `<text x="1254" y="792" text-anchor="middle" font-family="Rockwell,Georgia,serif" font-weight="900" font-size="10" fill="#7c2434" transform="rotate(-2 1254 790)">GENTE · 1987</text>`;
  // Papeles en el piso
  s += ink([{ d: rpoly([[560, 820], [632, 812], [640, 850], [566, 858]]), m: M.paper, s: 5, hatch: false }, { d: rpoly([[900, 860], [968, 870], [956, 906], [888, 896]]), m: M.paper, s: 5, hatch: false }], { lw: 4 });
  return s;
}

/* ---------- Capas vivas ---------- */
// Puertas del ascensor: dos hojas que se abren en el clímax
function artElevDoor(side) {
  const x = side < 0 ? ELEV.x0 : ELEV.mid, w = ELEV.mid - ELEV.x0;
  let s = ink([{ d: rrect(x, ELEV.y0, w, ELEV.y1 - ELEV.y0), m: M2.steel, s: 6, hatchOp: 0.3 }], { lw: 4 });
  s += `<path d="${rrect(x + 8, ELEV.y0 + 14, w - 16, 170, { seed: x })}" fill="none" stroke="${INK}" stroke-width="2" opacity=".6"/><path d="${rrect(x + 8, ELEV.y0 + 200, w - 16, 170, { seed: x + 1 })}" fill="none" stroke="${INK}" stroke-width="2" opacity=".6"/>`;
  return s;
}
// Vidrio esmerilado de la oficina: luz de adentro, la silueta y las letras encima
function liveGlass() {
  const g = rpoly(GLASS_OF, { amp: 0.6 }), c = GLASS_OF;
  const cx = (c[0][0] + c[1][0]) / 2, cy = (c[0][1] + c[2][1]) / 2;
  return `<defs><clipPath id="cGlass"><path d="${g}"/></clipPath>
      <filter id="silB0" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="13"/></filter>
      <filter id="silB1" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="7"/></filter>
      <filter id="silB2" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.5"/></filter>
      <radialGradient id="gGlassIn" cx=".55" cy=".42" r=".75"><stop offset="0" stop-color="#9a6080"/><stop offset=".5" stop-color="#5e5880"/><stop offset="1" stop-color="#2f2d46"/></radialGradient></defs>
    <g clip-path="url(#cGlass)">
      <path d="${g}" fill="url(#gGlassIn)"/>
      <path id="glassGlow" d="${g}" fill="#ff5a78" opacity=".16"/>
      <g id="sil" opacity="0" transform="translate(${f1(cx)} ${f1(cy + 40)})"><g id="silS" filter="url(#silB0)">
        <ellipse cx="0" cy="-88" rx="21" ry="26" fill="#0a0610"/>
        <path d="M-58 120Q-60 -20 -26 -50Q0 -62 26 -50Q60 -20 58 120Z" fill="#0a0610"/>
        <path id="silHand" d="M30 -30q14 -6 18 8l2 30q-6 6 -14 2z" fill="#0a0610" opacity="0"/>
      </g></g>
      <path d="${g}" fill="url(#hatchF)" opacity=".22"/>
    </g>
    <g transform="matrix(.8 .05 0 1 ${f1(c[0][0] + 14)} ${f1(cy - 34)})" font-family="Rockwell,Georgia,serif" font-weight="900" fill="${INK}" opacity=".78">
      <text x="0" y="0" font-size="17">SEGUROS</text><text x="4" y="22" font-size="17">FERRAZ</text><text x="2" y="52" font-size="11" letter-spacing="1">DIRECCIÓN</text></g>
    <path d="${g}" fill="none" stroke="${INK}" stroke-width="4"/>
    <g id="ofHandle" transform="translate(${f1(p2(330, 485, 1.32)[0])} ${f1(p2(330, 485, 1.32)[1])})">${ink([{ d: rell(0, 0, 6, 8), m: M.brass, s: 3, hatch: false }, { d: rrect(-2, -3, 18, 6), m: M.brass, s: 2, hatch: false }], { lw: 3 })}</g>`;
}
// Agujas del reloj (andan hacia atrás) y del indicador del ascensor
function liveRecepcionDials() {
  const [cx, cy] = CLOCK2;
  return `<g id="clkH" transform="translate(${cx} ${cy})"><path d="M-3 4L0 -18L3 4Z" fill="${INK}"/></g>
    <g id="clkM" transform="translate(${cx} ${cy})"><path d="M-2 4L0 -27L2 4Z" fill="${INK}"/></g>
    <g id="clkS" transform="translate(${cx} ${cy})"><path d="M0 6V-29" stroke="#a3202f" stroke-width="1.6"/></g>
    <circle cx="${cx}" cy="${cy}" r="3" fill="${INK}"/>
    <g id="needle" transform="translate(${NEEDLE[0]} ${NEEDLE[1]}) rotate(${FLOOR_ANG.PB})"><path d="M0 -2L28 0L0 2Z" fill="#a3202f" stroke="${INK}" stroke-width="1"/></g><circle cx="${NEEDLE[0]}" cy="${NEEDLE[1]}" r="3.5" fill="${INK}"/>`;
}
function liveRecepcionLights() {
  const [sx, sy] = [1407, 150];
  return `<ellipse id="tubeGlow" cx="815" cy="300" rx="560" ry="300" fill="#dff2ff" opacity="0" filter="url(#glowBig)"/>
    <ellipse id="tubeCone" cx="815" cy="560" rx="420" ry="160" fill="#cfe8ff" opacity="0" filter="url(#glowBig)"/>
    <ellipse id="glassSpill" cx="${f1(GLASS_OF[1][0] + 30)}" cy="600" rx="210" ry="120" fill="url(#gNeon)" opacity=".6"/>
    <ellipse cx="${sx}" cy="${sy + 10}" rx="130" ry="80" fill="url(#gExit)"/>
    <ellipse id="cabLight" cx="${ELEV.mid}" cy="470" rx="150" ry="240" fill="#ffe2b0" opacity="0" filter="url(#glowBig)"/>
    <ellipse id="pbxGlow" cx="626" cy="388" rx="80" ry="36" fill="#ffb347" opacity="0" filter="url(#glowSoft)"/>
    <circle id="lampElev" cx="1117" cy="404" r="12" fill="#ff3d5a" opacity="0" filter="url(#glowSoft)"/>`;
}
function liveSalida() {
  return `<g font-family="Courier New,monospace" font-weight="bold" font-size="15" transform="matrix(1 -.25 0 1 1376 158)">
    <text x="0" y="0" fill="#3dff8a" filter="url(#glowSoft)">SALIDA</text><text x="0" y="0" fill="#c9ffd9">SALIDA</text></g>`;
}
function liveRecepcionMotes() {
  let motes = '';
  const R = rng(17);
  for (let i = 0; i < 18; i++) motes += `<circle class="mote" cx="${f1(560 + R() * 520)}" cy="${f1(240 + R() * 560)}" r="${f1(1 + R() * 1.6)}" fill="#e4f4ff" opacity="${f1(0.15 + R() * 0.3)}"/>`;
  return motes;
}

/* ---------- Zonas de clic de la recepción ---------- */
const HOTS2 = [
  { id: 'puertaOf',   name: 'Puerta de la oficina', pts: DOOR_OF },
  { id: 'reloj',      name: 'Reloj de pared',       pts: box(756, 116, 844, 204) },
  { id: 'fusibles',   name: 'Caja de fusibles',     pts: box(344, 244, 448, 424) },
  { id: 'casilleros', name: 'Casilleros',           pts: box(452, 142, 710, 410) },
  { id: 'afiche',     name: 'Afiche',               pts: box(734, 266, 866, 426) },
  { id: 'checador',   name: 'Reloj checador',       pts: box(922, 246, 1100, 462) },
  { id: 'mostrador',  name: 'Mostrador',            pts: box(538, 440, 1012, 690) },
  { id: 'centralita', name: 'Centralita',           pts: box(550, 364, 718, 482) },
  { id: 'ascensor',   name: 'Ascensor',             pts: box(1100, 176, 1298, 644) },
  { id: 'escalera',   name: 'Escalera',             pts: STAIR },
  { id: 'paraguas',   name: 'Paragüero',            pts: box(322, 530, 392, 750) },
  { id: 'planta',     name: 'Planta',               pts: [[0, 640], [240, 610], [180, 780], [170, 900], [0, 900]] },
  { id: 'banco',      name: 'Banco',                pts: box(1156, 694, 1474, 836) },
];
// Dónde puede aparecer un objeto que «se movió solo» durante un apagón
const HIDE_SPOTS = { banco: [1330, 760], paraguas: [312, 712], planta: [118, 760], escalera: [1410, 690] };

/* ---------- Montaje de la escena ---------- */
function buildRecepcion() {
  $('#sceneBg').innerHTML = bake(artRecepcionRoom() + artRecepcionBack() + artRecepcionSides(), { x: -120, y: -40, w: 1840, h: 980 });
  $('#sceneMid').innerHTML = `
    <defs><clipPath id="cElev"><rect x="${ELEV.x0}" y="${ELEV.y0}" width="${ELEV.x1 - ELEV.x0}" height="${ELEV.y1 - ELEV.y0}"/></clipPath></defs>
    <g id="cabIn" opacity="0"><rect x="${ELEV.x0}" y="${ELEV.y0}" width="${ELEV.x1 - ELEV.x0}" height="${ELEV.y1 - ELEV.y0}" fill="#6b5240"/>
      <rect x="${ELEV.x0 + 14}" y="${ELEV.y0 + 20}" width="${ELEV.x1 - ELEV.x0 - 28}" height="330" fill="#8a6c52"/><path d="M${ELEV.x0} 600H${ELEV.x1}V640H${ELEV.x0}Z" fill="#3a2a22"/></g>
    <g clip-path="url(#cElev)"><g id="elevL">${bake(artElevDoor(-1), { x: ELEV.x0 - 10, y: ELEV.y0 - 10, w: 90, h: 420 })}</g><g id="elevR">${bake(artElevDoor(1), { x: ELEV.mid - 10, y: ELEV.y0 - 10, w: 90, h: 420 })}</g></g>
    ${liveRecepcionDials()}
    ${bake(artRecepcionFore(), { x: -60, y: 500, w: 1600, h: 460 })}
    <rect id="dark" x="-120" y="-40" width="1840" height="980" fill="#05030a" opacity=".62" style="pointer-events:none"/>
    <g id="hidden" opacity=".9"></g>
    <g id="glassG">${liveGlass()}</g>`;
  $('#sceneLight').innerHTML = liveRecepcionLights() + liveSalida();
  $('#scene').innerHTML = `
    <g id="motes" style="pointer-events:none">${liveRecepcionMotes()}</g>
    <g id="lvUV" style="display:none;pointer-events:none"><mask id="uvMask" maskUnits="userSpaceOnUse" x="-420" y="-260" width="2440" height="1420"><rect x="-420" y="-260" width="2440" height="1420" fill="#000"/><circle id="uvSpot" cx="-500" cy="-500" r="125" fill="url(#gUVspot)"/></mask>
      <rect x="-420" y="-260" width="2440" height="1420" fill="#12051f" opacity=".42"/><circle id="uvBeam" cx="-500" cy="-500" r="150" fill="#8f52ff" opacity=".22" filter="url(#glowSoft)"/></g>
    <g id="hots">${HOTS2.map(h => `<path class="hot" data-id="${h.id}" data-name="${h.name}" tabindex="0" role="button" aria-label="${h.name}" d="M${h.pts.map(p => p.map(f1).join(' ')).join('L')}Z"/>`).join('')}</g>`;
}
