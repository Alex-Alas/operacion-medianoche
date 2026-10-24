/* =====================================================================
   [2] LA OFICINA: arte de la escena principal (1600×900, punto de fuga
   en 800,380). Capas, de atrás hacia adelante:
   ciudad (horneada) → neón y lluvia (vivos) → cuarto (horneado) →
   cuadro, archivador, escritorio, teléfono, silla, caja fuerte, primer
   plano (horneados por separado para poder cambiarlos) → luces (vivas)
   → tinta UV (viva, enmascarada) → zonas de clic.
   ===================================================================== */
const VP = [800, 380];
// Punto del piso/pared llevado hacia el espectador (t>1) desde la pared del fondo
const persp = (x, y, t) => [VP[0] + (x - VP[0]) * t, VP[1] + (y - VP[1]) * t];

/* ---------- Símbolos de la placa (luna, ojo, ancla) ---------- */
function symMoon(cx, cy, r, col = INK, w = 0) {
  const x0 = f1(cx + r * 0.342), y0 = f1(cy - r * 0.94), y1 = f1(cy + r * 0.94);
  const d = `M${x0} ${y0}A${r} ${r} 0 1 0 ${x0} ${y1}A${f1(r * 0.95)} ${f1(r * 0.95)} 0 0 1 ${x0} ${y0}Z`;
  return w ? `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linejoin="round"/>` : `<path d="${d}" fill="${col}"/>`;
}
function symEye(cx, cy, r, col = INK, w = 3) {
  return `<path d="M${cx - r} ${cy}Q${cx} ${cy - r * 0.95} ${cx + r} ${cy}Q${cx} ${cy + r * 0.95} ${cx - r} ${cy}Z" fill="none" stroke="${col}" stroke-width="${w}" stroke-linejoin="round"/><circle cx="${cx}" cy="${cy}" r="${r * 0.32}" fill="${col}"/>`;
}
function symAnchor(cx, cy, r, col = INK, w = 3) {
  return `<g fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"><circle cx="${cx}" cy="${cy - r * 0.78}" r="${r * 0.2}"/><path d="M${cx} ${cy - r * 0.58}V${cy + r * 0.85}M${cx - r * 0.42} ${cy - r * 0.3}H${cx + r * 0.42}M${cx - r * 0.85} ${cy + r * 0.25}Q${cx - r * 0.7} ${cy + r * 0.9} ${cx} ${cy + r * 0.88}Q${cx + r * 0.7} ${cy + r * 0.9} ${cx + r * 0.85} ${cy + r * 0.25}"/></g>`;
}
const SYM = { luna: symMoon, ojo: symEye, ancla: symAnchor };

/* ---------- Ciudad tras la ventana ---------- */
function artCity() {
  let s = `<defs><linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1322"/><stop offset=".65" stop-color="#26182e"/><stop offset="1" stop-color="#4a1a2e"/></linearGradient></defs>`;
  s += `<rect x="250" y="130" width="410" height="350" fill="url(#gSky)"/>`;
  s += `<circle cx="338" cy="206" r="58" fill="#cfe3ea" opacity=".10"/><circle cx="338" cy="206" r="25" fill="#dfeaea"/>`;
  s += `<path d="M250 214Q300 200 360 216T470 210V232Q400 240 330 230T250 236Z" fill="#141a2b" opacity=".85"/>`;
  const R = rng(7);
  for (let x = 250; x < 660; x += 26 + R() * 22) {            // edificios lejanos, brumosos
    const h = 90 + R() * 120;
    s += `<path d="${rrect(x, 468 - h, 30 + R() * 26, h, { amp: 0.6 })}" fill="#2b2541"/>`;
  }
  for (let x = 240; x < 560; x += 44 + R() * 30) {             // edificios cercanos, oscuros
    const h = 60 + R() * 90, w = 40 + R() * 34;
    s += `<path d="${rrect(x, 468 - h, w, h, { amp: 0.6 })}" fill="#151120"/>`;
    for (let i = 0; i < 3; i++) if (R() < 0.35) s += `<rect x="${x + 6 + R() * (w - 14)}" y="${470 - h + 10 + R() * (h - 30)}" width="6" height="8" fill="#f0bd73" opacity=".8"/>`;
  }
  s += `<path d="${rrect(548, 168, 112, 300, { amp: 0.6 })}" fill="#120e1b"/>`;   // edificio del hotel
  s += `<path d="M470 300h22v-18h-22zM474 300v18M488 300v18" stroke="#120e1b" stroke-width="4" fill="#120e1b"/>`; // tanque de agua
  return s;
}
// Neón y lluvia: vivos (parpadean y caen)
function liveOutside() {
  let rain = '';
  const R = rng(3);
  for (let i = 0; i < 80; i++) { const x = 240 + R() * 470, y = R() * 640; rain += `<path d="M${f1(x)} ${f1(y)}l-7 ${f1(18 + R() * 16)}" stroke="#b9d6ea" stroke-width="1.4" opacity="${f1(0.18 + R() * 0.35)}"/>`; }
  const letters = 'HOTEL'.split('').map((c, i) =>
    `<text class="neonL${i === 3 ? ' neonBroken' : ''}" x="${506 + i * 28}" y="398" text-anchor="middle">${c}</text>`).join('');
  return `<clipPath id="cWin"><rect x="262" y="142" width="386" height="326"/></clipPath>
  <g clip-path="url(#cWin)">
    <g id="neonSign" font-family="Rockwell,Georgia,serif" font-weight="900" font-size="28">
      <rect x="488" y="368" width="150" height="40" rx="4" fill="#1a0d14" stroke="#3a1820" stroke-width="3"/>
      <path d="M560 408V468" stroke="#1a0d14" stroke-width="6"/>
      ${bake(`<defs><filter id="nb" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="7"/></filter></defs>
        <g fill="#ff3d5a" filter="url(#nb)" font-family="Rockwell,Georgia,serif" font-weight="900" font-size="28">${letters}</g>`, { still: true, x: 460, y: 340, w: 210, h: 100 })}
      <g fill="#ff8a9c">${letters}</g>
    </g>
    <g id="rain">${rain}</g>
    <rect id="skyFlash" x="250" y="130" width="410" height="350" fill="#d9e8ff" opacity="0"/>
  </g>`;
}

/* ---------- El cuarto: paredes, piso, ventana, puerta, perchero ---------- */
function artRoom() {
  let s = '';
  s += ink([{ d: rpoly([[200, 70], [1400, 70], [2050, -270], [-450, -270]]), m: M.ceil, hatch: false, lit: false }]);
  s += ink([
    { d: rpoly([[200, 70], [-450, -270], [-950, 1180], [200, 650]]), m: M.wallL, s: 18, lit: false },
    { d: rpoly([[1400, 70], [2050, -270], [2550, 1180], [1400, 650]]), m: M.wallL, s: 18, lit: false },
  ]);
  s += ink([{ d: rpoly([[200, 650], [1400, 650], [2550, 1180], [-950, 1180]]), m: M.floor, s: 22, hatch: false, lit: false }]);
  // Pared del fondo con el hueco de la ventana (el hueco gira al revés)
  const wall = rough([[200, 70], [1400, 70], [1400, 650], [200, 650]]) + rough([[262, 142], [262, 468], [648, 468], [648, 142]]);
  s += ink([{ d: wall, m: M.wall, s: 16 }]);
  // Papel tapiz: rayas verticales gastadas
  for (let x = 222; x < 1400; x += 38) s += hline([[x, 78], [x + 1, 470]], 1.4, '#55507a', { op: 0.35, seed: x });
  // Zócalo de madera (friso) y moldura
  s += ink([{ d: rrect(200, 478, 1200, 172), m: M.wood, s: 8, hatchOp: 0.35 }], { lw: 4 });
  for (let x = 200; x < 1400; x += 150) s += hline([[x + 12, 494], [x + 138, 494], [x + 138, 634], [x + 12, 634], [x + 12, 494]], 2, '#241217', { op: 0.7, seed: x });
  s += hline([[200, 470], [1400, 470]], 5, INK);
  // Manchas de humedad
  s += `<path d="${rell(1180, 150, 90, 46, { amp: 9 })}" fill="#231d33" opacity=".55"/><path d="${rell(1170, 175, 50, 30, { amp: 7 })}" fill="#1d1729" opacity=".5"/>`;
  s += `<path d="${rell(720, 110, 60, 26, { amp: 7 })}" fill="#231d33" opacity=".45"/>`;
  s += tline([[1240, 72], [1232, 120], [1246, 170], [1238, 230]], 2.6, INK, { curve: true, op: 0.7 });
  // Marca limpia donde colgaba el cuadro derecho
  s += `<path d="${rrect(836, 166, 230, 170)}" fill="#59628a" opacity=".22"/>`;
  s += `<circle cx="950" cy="128" r="4" fill="${INK}"/>`;
  // Tablas del piso que fugan al punto de fuga
  for (let xb = 200; xb <= 1400; xb += 75) { const a = [xb, 650], b = persp(xb, 650, 2.9); s += hline([a, b], 2, INK, { op: 0.4, seed: xb }); }
  for (const t of [1.12, 1.3, 1.55, 1.9, 2.4]) { const a = persp(200, 650, t), b = persp(1400, 650, t); s += hline([a, b], 1.6, INK, { op: 0.28, seed: t * 10 }); }
  // Cielo raso: lámpara colgante muerta
  s += hline([[800, -260], [800, 108]], 3, INK);
  s += ink([{ d: rpoly([[770, 108], [830, 108], [858, 150], [742, 150]]), m: M.metal, s: 6 }], { lw: 5 });
  // Ventana: marco de madera, alféizar y travesaños
  const frame = rough([[248, 128], [662, 128], [662, 482], [248, 482]]) + rough([[262, 142], [262, 468], [648, 468], [648, 142]]);
  s += ink([{ d: frame, m: M.woodL, s: 6 }, { d: rrect(236, 470, 438, 20), m: M.woodL, s: 6 }], { lw: 5 });
  s += ink([{ d: rrect(450, 142, 10, 326), m: M.woodL, s: 3, hatch: false }, { d: rrect(262, 330, 386, 9), m: M.woodL, s: 3, hatch: false }], { lw: 3 });
  // Persiana a medio subir, con una lama rota colgando
  for (let y = 146; y < 318; y += 17) s += `<path d="${rrect(266, y, 378, 9, { amp: 0.7, seed: y })}" fill="#4d4660" stroke="${INK}" stroke-width="2.5"/>` + hline([[268, y + 1.5], [642, y + 1.5]], 1.4, '#9fb7cc', { op: 0.6, seed: y + 3 });
  s += `<path d="${rrect(264, 318, 382, 12)}" fill="#3a3448" stroke="${INK}" stroke-width="3"/>`;
  s += `<path d="${rpoly([[300, 330], [312, 330], [430, 404], [420, 412]])}" fill="#4d4660" stroke="${INK}" stroke-width="2.5"/>`;
  s += hline([[620, 146], [624, 400]], 1.5, '#8d86a0', { op: 0.8 }) + `<circle cx="624" cy="404" r="4" fill="#8d86a0" stroke="${INK}" stroke-width="2"/>`;
  // Puerta en la pared izquierda (vidrio esmerilado con letras al revés)
  const door = [[152, 250], [30, 222], [30, 730], [152, 672]];
  s += ink([{ d: rpoly([[162, 240], [20, 208], [20, 742], [162, 680]]), m: M.wood, s: 6 }, { d: rpoly(door), m: M.woodL, s: 10 }], { lw: 5 });
  s += ink([{ d: rpoly([[140, 278], [44, 258], [44, 470], [140, 474]]), m: { b: '#5b6a80', S: '#3d4860', D: '#28304a', H: '#a9c3d4' }, s: 8 }], { lw: 4 });
  s += `<g transform="matrix(-.78 -.16 0 1 128 330)" font-family="Rockwell,Georgia,serif" font-weight="900" font-size="17" fill="${INK}" opacity=".75"><text x="0" y="0">SEGUROS</text><text x="6" y="26">FERRAZ</text></g>`;
  s += ink([{ d: rell(130, 512, 7, 9), m: M.brass, s: 3, hatch: false }], { lw: 3 });
  s += `<path d="${rrect(64, 178, 74, 26)}" fill="#0f1a14" stroke="${INK}" stroke-width="4"/>`;     // caja del cartel de salida
  // Perchero con abrigo y sombrero (de reojo parece alguien parado)
  s += hline([[262, 380], [262, 708]], 7, INK) + hline([[262, 700], [228, 726]], 6, INK) + hline([[262, 700], [300, 724]], 6, INK);
  s += ink([
    { d: rcurve([[230, 418], [262, 398], [296, 420], [306, 520], [300, 640], [272, 652], [244, 646], [220, 560], [222, 470]]), m: M.coat, s: 12 },
    { d: rcurve([[246, 406], [262, 396], [280, 406], [270, 440], [256, 440]]), m: M.coat, s: 4, hatch: false },
    { d: rcurve([[226, 378], [242, 366], [262, 352], [284, 366], [298, 378], [262, 386]]), m: M.cloth, s: 6 },
  ], { lw: 6 });
  s += tline([[252, 450], [258, 560], [254, 630]], 3, INK, { curve: true, op: 0.6 }) + tline([[284, 470], [290, 600]], 2.5, INK, { op: 0.5 });
  s += hline([[228, 371], [296, 371]], 4, '#5a3a48');
  return s;
}

/* ---------- Cuadro «Faro de medianoche» (local, centrado en 0,0) ---------- */
function artPainting() {
  let s = hline([[0, -122], [-92, -86]], 2, INK) + hline([[0, -122], [92, -86]], 2, INK);
  s += ink([{ d: rrect(-118, -88, 236, 176), m: M.brass, s: 8 }], { lw: 6 });
  s += `<path d="${rrect(-102, -72, 204, 144, { amp: 0.8 })}" fill="#1c2436" stroke="${INK}" stroke-width="4"/>`;
  s += `<path d="M-102 -72H102V-10Q40 -26 -20 -14T-102 -6Z" fill="#2c3550"/>`;
  s += `<path d="M-60 -60Q-20 -70 20 -58T80 -62" stroke="#3d4868" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M30 -30L102 -52V-8L30 -22Z" fill="#e8e3c8" opacity=".35"/>`;                        // haz del faro
  s += ink([{ d: rpoly([[22, 40], [38, 40], [34, -26], [26, -26]], { amp: 0.5 }), m: M.bone, s: 3, hatch: false }], { lw: 3 });
  s += `<rect x="24" y="-6" width="14" height="5" fill="#7c2434"/><rect x="25" y="14" width="13" height="5" fill="#7c2434"/><circle cx="30" cy="-30" r="5" fill="#f6e7b0"/>`;
  s += `<path d="M-102 30Q-70 10 -40 30T20 26T70 34T102 22V72H-102Z" fill="#14233a" stroke="${INK}" stroke-width="3"/>`;
  s += `<path d="M-90 50q14 -10 28 0M-30 46q12 -9 24 0M40 54q12 -8 24 0" stroke="#5b7290" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M-74 26l10 -24 2 24zM-80 28h30l-6 7h-20z" fill="#0f0c16"/>`;                       // barquito
  s += `<path d="${rrect(-102, -72, 204, 144)}" fill="url(#hatchF)" opacity=".18"/>`;
  return s;
}

/* ---------- Archivador (cerrado o con el cajón de arriba abierto) ---------- */
function artCabinet(open) {
  let s = ink([
    { d: rpoly([[1150, 300], [1129, 306], [1129, 672], [1150, 690]]), m: M.metal, s: 8, lit: false },
    { d: rrect(1150, 300, 172, 390), m: M.metal, s: 12 },
  ]);
  for (let i = 0; i < 3; i++) {
    const y = 316 + i * 122;
    if (open && i === 0) continue;
    s += ink([{ d: rrect(1162, y, 148, 110), m: M.metal, s: 6, hatchOp: 0.35 }], { lw: 4 });
    s += ink([{ d: rrect(1213, y + 22, 46, 18), m: M.brass, s: 3, hatch: false }, { d: rrect(1218, y + 50, 36, 12), m: M.brass, s: 3, hatch: false }], { lw: 3 });
    s += `<path d="${rrect(1218, y + 24, 36, 13, { amp: 0.4 })}" fill="#e6dcc4"/>` + hline([[1222, y + 30], [1250, y + 30]], 1.4, INK, { op: 0.6 });
  }
  if (!open) s += ink([{ d: rell(1236, 309, 6, 6), m: M.brass, s: 2, hatch: false }], { lw: 3 });
  else {
    s += `<path d="${rrect(1162, 316, 148, 110)}" fill="#0c0a10"/>`;
    s += ink([
      { d: rpoly([[1150, 330], [1162, 316], [1162, 426], [1150, 452]]), m: M.metal, s: 4, hatch: false },
      { d: rrect(1140, 408, 150, 118), m: M.metal, s: 6 },
    ], { lw: 4 });
    s += ink([{ d: rrect(1158, 380, 30, 34, { amp: 0.5 }), m: M.paper, s: 4, hatch: false }, { d: rrect(1196, 372, 34, 42), m: M.paper, s: 4, hatch: false }, { d: rrect(1238, 386, 40, 28), m: { b: '#c7a46b', S: '#8a6a45', D: '#5a4230', H: '#ecd29a' }, s: 4, hatch: false }], { lw: 3 });
    s += ink([{ d: rrect(1192, 438, 46, 18), m: M.brass, s: 3, hatch: false }], { lw: 3 });
  }
  return s;
}

/* ---------- Escritorio, monitor, lámpara, papeles ---------- */
function artDesk() {
  let s = '';
  // Cubierta (vista desde arriba porque está bajo la línea del horizonte)
  s += ink([
    { d: rpoly([[540, 558], [1060, 558], [1104, 604], [496, 604]]), m: M.woodL, s: 6 },
    { d: rrect(496, 604, 608, 22), m: M.wood, s: 5, hatch: false },
    { d: rrect(506, 626, 196, 150), m: M.wood, s: 12 },
    { d: rrect(898, 626, 196, 150), m: M.wood, s: 12 },
    { d: rrect(702, 626, 196, 70), m: M.wood, s: 10 },
  ]);
  s += `<path d="${rrect(712, 696, 176, 74)}" fill="#0d080c"/>`;                       // hueco para las piernas
  for (const [x, y, h] of [[518, 640, 58], [518, 708, 58], [910, 640, 58], [910, 708, 58]])
    s += `<path d="${rrect(x, y, 172, h)}" fill="none" stroke="${INK}" stroke-width="3"/>` + ink([{ d: rrect(x + 70, y + 24, 32, 9), m: M.brass, s: 2, hatch: false }], { lw: 3 });
  s += ink([{ d: rrect(940, 708, 92, 18), m: M.brass, s: 3, hatch: false }], { lw: 3 });
  s += `<text x="986" y="722" font-family="Courier New,monospace" font-weight="bold" font-size="12" text-anchor="middle" fill="${INK}">A. FERRAZ</text>`;
  for (let x = 560; x < 1060; x += 46) s += hline([[x, 566], [x - 10, 600]], 1.2, '#2c171b', { op: 0.45, seed: x }); // veta
  // Papeles y carpetas sobre la mesa
  s += ink([{ d: rpoly([[830, 566], [892, 562], [900, 590], [834, 594]]), m: M.paper, s: 3, hatch: false }, { d: rpoly([[846, 572], [906, 568], [912, 596], [850, 598]]), m: M.paper, s: 3, hatch: false }], { lw: 3 });
  s += hline([[858, 578], [896, 576]], 1.3, INK, { op: 0.6 }) + hline([[858, 585], [890, 584]], 1.3, INK, { op: 0.6 });
  // Taza
  s += ink([{ d: rpoly([[1030, 556], [1056, 556], [1054, 588], [1032, 588]]), m: M.bone, s: 4, hatch: false }, { d: rell(1061, 570, 7, 9), m: M.bone, s: 2, hatch: false }], { lw: 4 });
  s += `<path d="${rell(1043, 557, 12, 3.5)}" fill="#1a0e10"/>`;
  // Monitor CRT (el vidrio va en una capa viva). Plástico más apagado que en el primer plano:
  // de noche no debe ser lo más claro del cuadro.
  const pc = { b: '#958a78', S: '#625866', D: '#3a3242', H: '#c9bfa9' };
  s += ink([
    { d: rpoly([[598, 412], [584, 420], [584, 566], [598, 574]]), m: pc, s: 4, lit: false },
    { d: rrect(598, 404, 206, 172), m: pc, s: 14, hatchOp: 0.6 },
    { d: rpoly([[650, 576], [752, 576], [764, 592], [638, 592]]), m: pc, s: 4, hatch: false },
  ]);
  s += `<path d="${rrect(616, 420, 170, 132, { amp: 0.6 })}" fill="#121a1c" stroke="${INK}" stroke-width="5"/>`;
  s += `<circle cx="782" cy="564" r="3.5" fill="#3a4a3a"/>` + hline([[606, 566], [650, 566]], 2, '#6d6370', { op: 0.6 });
  // Teclado
  s += ink([{ d: rpoly([[612, 594], [790, 594], [804, 612], [600, 612]]), m: M.plastic, s: 3, hatch: false }], { lw: 4 });
  for (let i = 0; i < 12; i++) s += `<rect x="${614 + i * 15}" y="598" width="11" height="5" fill="#8b8188"/>`;
  // Lámpara articulada (apagada)
  s += ink([
    { d: rell(1004, 588, 32, 8), m: M.metal, s: 3, hatch: false },
    { d: taper([[1004, 584], [990, 520], [1020, 462]], 9), m: M.metal, s: 2, hatch: false },
    { d: rpoly([[1000, 444], [1046, 452], [1060, 500], [988, 476]]), m: M.metal, s: 7 },
  ], { lw: 5 });
  return s;
}
function artPhone() {
  const bak = { b: '#4a2c34', S: '#2e1a22', D: '#1a0e14', H: '#9a6a74' };    // baquelita vino: se separa del escritorio
  let s = ink([
    { d: rpoly([[902, 548], [966, 548], [978, 582], [890, 582]]), m: bak, s: 5 },
    { d: rcurve([[888, 538], [930, 530], [980, 538], [976, 548], [930, 544], [892, 548]]), m: bak, s: 4, hatch: false },
  ], { lw: 5 });
  s += `<circle cx="934" cy="566" r="11" fill="#d9cdb4" stroke="${INK}" stroke-width="3"/><circle cx="934" cy="566" r="4" fill="${INK}"/>`;
  s += hline([[976, 576], [1000, 600], [990, 640]], 2.4, INK, { op: 0.8 });
  return s;
}

/* ---------- Silla de oficina (de espaldas) ---------- */
function artChair() {
  let s = hline([[832, 720], [832, 790]], 9, INK);
  for (const [x2, y2] of [[760, 812], [800, 830], [866, 830], [902, 810], [832, 800]]) s += hline([[832, 790], [x2, y2]], 7, INK) + `<circle cx="${x2}" cy="${y2 + 7}" r="7" fill="${INK}"/>`;
  s += ink([
    { d: rcurve([[762, 706], [832, 694], [904, 706], [896, 728], [832, 736], [768, 728]]), m: M.red, s: 6 },
    { d: rcurve([[772, 584], [832, 566], [894, 584], [900, 650], [888, 708], [832, 716], [776, 708], [764, 650]]), m: M.red, s: 14 },
  ]);
  s += tline([[790, 600], [832, 588], [874, 600]], 2.5, '#2c0b15', { curve: true }) + tline([[832, 596], [832, 700]], 2.5, '#2c0b15', { op: 0.7 });
  for (const [x, y] of [[798, 620], [866, 620], [798, 670], [866, 670], [832, 646]]) s += `<circle cx="${x}" cy="${y}" r="3" fill="#2c0b15"/>`;
  return s;
}

/* ---------- Caja fuerte (primer plano derecho) ---------- */
function artSafe(open) {
  const top = [[1340, 560], [1580, 560], [1504, 542], [1288, 542]];
  let s = ink([
    { d: rpoly([[1340, 560], [1288, 542], [1288, 822], [1340, 872]]), m: M.safe, s: 8, lit: false },
    { d: rpoly(top), m: M.safe, s: 5, hatch: false },
    { d: rrect(1340, 560, 240, 312), m: M.safe, s: 16 },
  ], { lw: 7 });
  s += `<path d="${rrect(1358, 578, 204, 276)}" fill="none" stroke="${INK}" stroke-width="3" opacity=".8"/>`;
  s += `<text x="1460" y="606" text-anchor="middle" font-family="Rockwell,Georgia,serif" font-weight="900" font-size="20" letter-spacing="3" fill="#b08a4a" stroke="${INK}" stroke-width=".8">HALCÓN</text>`;
  // Placa con el orden de los símbolos
  s += ink([{ d: rrect(1404, 618, 112, 34), m: M.brass, s: 4, hatch: false }], { lw: 4 });
  s += symMoon(1426, 635, 10) + symEye(1460, 635, 12, INK, 2.6) + symAnchor(1494, 635, 12, INK, 2.6);
  // Dial con tres ruedas
  s += ink([{ d: rell(1460, 730, 56, 56), m: M.brass, s: 10 }, { d: rell(1460, 730, 34, 34), m: M.metal, s: 6, hatch: false }], { lw: 6 });
  for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2; s += `<path d="M${f1(1460 + Math.cos(a) * 44)} ${f1(730 + Math.sin(a) * 44)}L${f1(1460 + Math.cos(a) * 52)} ${f1(730 + Math.sin(a) * 52)}" stroke="${INK}" stroke-width="2.5"/>`; }
  s += `<path d="M1460 666l-7 -12h14z" fill="#ff3d5a" stroke="${INK}" stroke-width="2"/>`;
  s += ink([{ d: rrect(1530, 700, 18, 64), m: M.brass, s: 4, hatch: false }], { lw: 5 });
  s += ink([{ d: rrect(1350, 868, 36, 14), m: M.safe, s: 3, hatch: false }, { d: rrect(1534, 868, 36, 14), m: M.safe, s: 3, hatch: false }], { lw: 4 });
  // Rayones y pintura gastada
  for (const [a, b] of [[[1372, 800], [1418, 780]], [[1500, 820], [1540, 830]], [[1380, 690], [1392, 720]]]) s += tline([a, b], 2.4, '#86b0ae', { op: 0.6 });
  return s;
}

/* ---------- Primer plano: planta muerta y papeles en el piso ---------- */
function artFore() {
  let s = '';
  const sheets = [[[380, 760], [452, 752], [460, 790], [386, 798]], [[470, 812], [540, 822], [528, 860], [456, 848]], [[1080, 820], [1150, 812], [1160, 850], [1088, 858]], [[640, 860], [712, 856], [718, 896], [644, 900]]];
  s += ink(sheets.map(p => ({ d: rpoly(p), m: M.paper, s: 5, hatch: false })), { lw: 4 });
  s += hline([[396, 768], [440, 764]], 1.4, INK, { op: 0.5 }) + hline([[478, 826], [520, 832]], 1.4, INK, { op: 0.5 });
  // Planta muerta: formas gruesas y casi negras con un borde frío
  const dark = { b: '#161a1c', S: '#0e1012', D: '#07080a', H: '#3e5258' };
  s += ink([
    { d: rpoly([[40, 790], [196, 790], [178, 960], [58, 960]]), m: { b: '#2a1c22', S: '#1a1016', D: '#0d080b', H: '#5a3f48' }, s: 12 },
    { d: rcurve([[110, 790], [70, 700], [-10, 660], [-40, 700], [40, 720], [96, 792]]), m: dark, s: 8 },
    { d: rcurve([[120, 790], [150, 680], [230, 620], [262, 640], [190, 700], [134, 792]]), m: dark, s: 8 },
    { d: rcurve([[116, 790], [96, 640], [120, 560], [140, 580], [130, 690], [126, 792]]), m: dark, s: 8 },
    { d: rcurve([[130, 792], [210, 760], [300, 790], [292, 806], [220, 790], [140, 798]]), m: dark, s: 6 },
  ], { lw: 7 });
  return s;
}

/* ---------- Capas vivas: luces, cartel de salida, pantalla, UV ---------- */
// Haz de luna con las franjas de la persiana: estático y desenfocado → se hornea una sola vez
function artShaft() {
  const shaft = 'M' + [[280, 160], [632, 160], [1470, 905], [870, 905]].map(p => p.join(' ')).join('L') + 'Z';
  let stripes = '';
  for (let i = 0; i < 26; i++) { const y = 470 + i * 17; stripes += `<path d="M300 ${y}L1600 ${y - 330}" stroke="#d8f0ff" stroke-width="7" opacity=".07"/>`; }
  return `<defs><linearGradient id="gShaftB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cfeeff" stop-opacity=".24"/><stop offset=".7" stop-color="#cfeeff" stop-opacity=".06"/><stop offset="1" stop-color="#cfeeff" stop-opacity="0"/></linearGradient>
    <filter id="blurB" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="7"/></filter><clipPath id="cShaftB"><path d="${shaft}"/></clipPath></defs>
    <path d="${shaft}" fill="url(#gShaftB)" filter="url(#blurB)"/><g clip-path="url(#cShaftB)" filter="url(#blurB)">${stripes}</g>`;
}
function liveLights() {
  // Las luces suman (la capa entera va en «screen»)
  return `${bake(artShaft(), { still: true, x: 240, y: 120, w: 1400, h: 820 })}
    <ellipse id="neonGlow" cx="560" cy="410" rx="520" ry="360" fill="url(#gNeon)"/>
    <ellipse id="crtGlow" cx="700" cy="500" rx="300" ry="230" fill="url(#gCrt)" opacity="0"/>
    <ellipse cx="100" cy="190" rx="140" ry="90" fill="url(#gExit)"/>`;
}
// Motas de polvo: van en la capa de arriba (mezcla normal) para no recomponer las luces
function liveMotes() {
  let motes = '';
  const R = rng(11);
  for (let i = 0; i < 26; i++) motes += `<circle class="mote" cx="${f1(420 + R() * 700)}" cy="${f1(260 + R() * 560)}" r="${f1(1 + R() * 1.8)}" fill="#e4f4ff" opacity="${f1(0.2 + R() * 0.4)}"/>`;
  return motes;
}
function liveExit() {
  return `<g font-family="Courier New,monospace" font-weight="bold" font-size="17" text-anchor="middle">
    <text x="101" y="197" fill="#3dff8a" filter="url(#glowSoft)">SALIDA</text><text x="101" y="197" fill="#c9ffd9">SALIDA</text></g>`;
}
function liveScreen() {
  return `<g id="screenOff"><path d="M628 428Q680 422 720 432L700 470Q660 456 628 464Z" fill="#cfe9ee" opacity=".08"/></g>
  <g id="screenOn" style="display:none">
    <rect x="618" y="422" width="166" height="128" rx="14" fill="#0f2a1d"/>
    <rect x="618" y="422" width="166" height="128" rx="14" fill="#86ffb5" opacity=".18" filter="url(#glowSoft)"/>
    <g font-family="Courier New,monospace" font-size="11" font-weight="bold" fill="#86ffb5">
      <text x="630" y="446">SISTEMA FERRAZ</text><text id="screenLine" x="630" y="470">CLAVE: _</text></g>
  </g>`;
}
// Tinta invisible: solo aparece bajo la linterna UV (máscara que sigue al puntero)
function liveUV() {
  // Mensaje enorme a lo largo de la pared, por encima de todo (se ve en cualquier encuadre)
  const wallMsg = `<g font-family="Segoe Print,Bradley Hand,Comic Sans MS,cursive" font-weight="bold" font-size="38" fill="#d9a6ff" text-anchor="middle" transform="rotate(-3 960 410)"><text x="960" y="396" textLength="280" lengthAdjust="spacingAndGlyphs">TE ESTÁBAMOS</text><text x="975" y="440" textLength="230" lengthAdjust="spacingAndGlyphs">ESPERANDO</text></g>`;
  const paint = `<g id="uvPaint" transform="translate(950 250) rotate(-7)">
      ${symAnchor(-58, 0, 30, '#e8c2ff', 6)}
      <text x="42" y="16" text-anchor="middle" font-family="Rockwell,Georgia,serif" font-weight="900" font-size="40" fill="#e8c2ff">XXXI</text>
      <path d="M-90 52q30 -8 60 2" stroke="#d9a6ff" stroke-width="4" fill="none"/></g>`;
  return `<mask id="uvMask" maskUnits="userSpaceOnUse" x="-420" y="-260" width="2440" height="1420"><rect x="-420" y="-260" width="2440" height="1420" fill="#000"/><circle id="uvSpot" cx="-500" cy="-500" r="125" fill="url(#gUVspot)"/></mask>
    <rect x="-420" y="-260" width="2440" height="1420" fill="#12051f" opacity=".42"/>
    <circle id="uvBeam" cx="-500" cy="-500" r="150" fill="#8f52ff" opacity=".22" filter="url(#glowSoft)"/>
    <g mask="url(#uvMask)" filter="url(#glowUV)">${paint}${wallMsg}
      <path d="M1046 548q8 -14 18 -2" stroke="#e0b4ff" stroke-width="3" fill="none"/></g>`;
}

/* ---------- Zonas de clic (polígonos simples sobre los objetos) ---------- */
const HOTS = [
  { id: 'ventana',     name: 'Ventana',            pts: [[262, 142], [648, 142], [648, 468], [262, 468]] },
  { id: 'puerta',      name: 'Puerta',             pts: [[152, 250], [30, 222], [30, 730], [152, 672]] },
  { id: 'perchero',    name: 'Perchero',           pts: [[218, 350], [306, 350], [312, 660], [300, 730], [222, 730], [214, 600]] },
  { id: 'cuadro',      name: 'Cuadro',             pts: [[826, 150], [1076, 150], [1076, 350], [826, 350]] },
  { id: 'archivador',  name: 'Archivador',         pts: [[1126, 296], [1326, 296], [1326, 694], [1126, 694]] },
  { id: 'computadora', name: 'Computadora',        pts: [[580, 400], [808, 400], [808, 614], [580, 614]] },
  { id: 'telefono',    name: 'Teléfono',           pts: [[884, 528], [984, 528], [984, 596], [884, 596]] },
  { id: 'escritorio',  name: 'Escritorio',         pts: [[496, 552], [1106, 552], [1106, 780], [902, 780], [902, 700], [700, 700], [700, 780], [496, 780]] },
  { id: 'pared',       name: 'Pared',              pts: [[810, 352], [1120, 352], [1120, 452], [810, 452]], uvOnly: true },
  { id: 'caja',        name: 'Caja fuerte',        pts: [[1286, 538], [1584, 538], [1584, 884], [1340, 884], [1286, 826]] },
];
function hotspotsSvg() {
  return HOTS.map(h => `<path class="hot${h.uvOnly ? ' uvOnly' : ''}" data-id="${h.id}" data-name="${h.name}" tabindex="0" role="button" aria-label="${h.name}" d="M${h.pts.map(p => p.join(' ')).join('L')}Z"/>`).join('');
}

/* ---------- Montaje de la escena ---------- */
function buildScene() {
  // Fondo: la ciudad y lo que se ve por la ventana (lluvia y neón animados)
  $('#sceneBg').innerHTML = `${bake(artCity(), { x: 240, y: 120, w: 430, h: 370, amp: 1.5 })}<g id="lvOutside">${liveOutside()}</g>`;
  // Medio: el cuarto y los muebles (casi todo horneado)
  $('#sceneMid').innerHTML = `
    ${bake(artRoom())}
    <g id="lvExit">${liveExit()}</g>
    <g id="gPainting" transform="translate(950 250) rotate(-7)">${bake(artPainting(), { x: -140, y: -140, w: 280, h: 250 })}</g>
    <g id="gCabinet"><g id="cabClosed">${bake(artCabinet(false), { x: 1100, y: 270, w: 260, h: 450 })}</g><g id="cabOpen" style="display:none"></g></g>
    ${bake(artDesk(), { x: 470, y: 420, w: 660, h: 380 })}
    <g id="lvScreen">${liveScreen()}</g>
    ${bake(artChair(), { x: 740, y: 550, w: 190, h: 300 })}
    ${bake(artSafe(), { x: 1270, y: 520, w: 330, h: 380 })}
    ${bake(artFore(), { x: -80, y: 540, w: 1300, h: 440 })}`;
  // Luces: se suman en «screen» sobre todo lo anterior
  $('#sceneLight').innerHTML = liveLights();
  // Arriba: el teléfono (vibra), la tinta UV y las zonas de clic
  $('#scene').innerHTML = `
    <g id="gPhone">${bake(artPhone(), { x: 870, y: 515, w: 150, h: 140 })}</g>
    <g id="motes" style="pointer-events:none">${liveMotes()}</g>
    <g id="lvUV" style="display:none;pointer-events:none">${liveUV()}</g>
    <g id="hots">${hotspotsSvg()}</g>`;
}
