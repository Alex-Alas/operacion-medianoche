/* =====================================================================
   [3] PRIMEROS PLANOS, RETRATOS E ÍCONOS
   Cada primer plano es otra «pantalla estática» de 1600×900 con sus
   propias zonas de clic. El arte fijo se hornea una vez y se reutiliza.
   ===================================================================== */
const PAPER = '#e8dcc2';
const handFont = 'Segoe Print,Bradley Hand,Comic Sans MS,cursive';
const typeFont = 'Courier New,Courier,monospace';

/* ---------- Hoja con el ojo y las rayas de conteo (23) ---------- */
function tallySheet(x, y, sc = 1, col = INK) {
  let s = `<g transform="translate(${x} ${y}) scale(${sc})">`;
  s += `<text x="0" y="-118" text-anchor="middle" font-family="${handFont}" font-size="30" fill="${col}">lo que cuento</text>`;
  s += symEye(0, -58, 52, col, 6);
  let gx = -170;
  const group = (n, ox) => {
    let g = '';
    for (let i = 0; i < Math.min(n, 4); i++) g += tline([[ox + i * 15, 22 + (i % 2) * 3], [ox + i * 15 + 3, 92]], 5, col);
    if (n === 5) g += tline([[ox - 10, 80], [ox + 60, 34]], 5, col);
    return g;
  };
  for (let k = 0; k < 4; k++) { s += group(5, gx); gx += 82; }
  s += group(3, gx);
  return s + '</g>';
}

/* ---------- Primer plano: escritorio ---------- */
function cuDeskBase() {
  let s = ink([{ d: rrect(-30, -30, 1660, 960), m: M.woodL, s: 20, hatch: false, lit: false }], { lw: 0 });
  for (let y = 20; y < 900; y += 34) s += hline([[-20, y], [400, y + 6], [900, y - 4], [1620, y + 8]], 1.6, '#3a2025', { op: 0.35, seed: y });
  // Calendario
  s += `<g transform="rotate(-4 370 360)">`;
  s += ink([{ d: rrect(140, 110, 470, 500), m: { b: '#5a4a3e', S: '#3a2e28', D: '#221a17', H: '#8a7462' }, s: 10 }, { d: rrect(160, 130, 430, 460), m: M.paper, s: 8, hatch: false }]);
  s += `<path d="${rrect(160, 130, 430, 70)}" fill="#7c2434"/><text x="375" y="178" text-anchor="middle" font-family="Rockwell,Georgia,serif" font-weight="900" font-size="34" fill="${PAPER}" letter-spacing="2">OCTUBRE 1987</text>`;
  const days = 'LMMJVSD';
  for (let c = 0; c < 7; c++) s += `<text x="${196 + c * 60}" y="232" text-anchor="middle" font-family="${typeFont}" font-weight="bold" font-size="20" fill="#7c2434">${days[c]}</text>`;
  for (let d = 1; d <= 31; d++) {
    const i = d + 2, c = i % 7, r = Math.floor(i / 7), cx = 196 + c * 60, cy = 280 + r * 66;
    s += `<text x="${cx}" y="${cy}" text-anchor="middle" font-family="${typeFont}" font-weight="bold" font-size="26" fill="${INK}">${d}</text>`;
    if (d < 14) s += tline([[cx - 16, cy - 26], [cx + 16, cy + 8]], 3, '#3a3040', { op: 0.75 }) + tline([[cx + 16, cy - 26], [cx - 16, cy + 8]], 3, '#3a3040', { op: 0.75 });
    if (d === 14) s += `<path d="${rell(cx, cy - 9, 30, 24, { amp: 3, n: 30 })}" fill="none" stroke="#e0283f" stroke-width="5"/><text x="${cx + 4}" y="${cy + 34}" text-anchor="middle" font-family="${handFont}" font-weight="bold" font-size="17" fill="#e0283f">CIERRE</text>`;
  }
  s += `</g>`;
  // Marco de la foto (frente)
  s += `<g transform="rotate(3 860 330)">`;
  s += ink([{ d: rrect(720, 150, 290, 360), m: M.wood, s: 12 }, { d: rrect(746, 176, 238, 308), m: { b: '#b49a74', S: '#8a7058', D: '#5e4a3c', H: '#e0c9a0' }, s: 4, hatch: false, lit: false }]);
  s += `<path d="M746 176H984V330Q880 312 746 338Z" fill="#cdb48a"/><path d="M746 338Q880 312 984 330V380H746Z" fill="#8f7a64"/><path d="M746 380H984V484H746Z" fill="#a88d6a"/>`;
  s += `<path d="${rcurve([[812, 470], [806, 380], [812, 300], [834, 262], [856, 300], [862, 380], [858, 470]])}" fill="#3b2f2c"/><circle cx="834" cy="250" r="20" fill="#3b2f2c"/>`;
  s += `<path d="${rcurve([[880, 470], [884, 412], [904, 380], [930, 372], [946, 350], [966, 356], [960, 384], [944, 400], [944, 470]])}" fill="#2a201e"/><path d="M948 352l6 -18 8 20z" fill="#2a201e"/>`;
  s += `<path d="M856 350Q880 380 902 396" stroke="#3b2f2c" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  s += `<rect x="746" y="176" width="238" height="308" fill="#f3e0b4" opacity=".12"/>`;
  s += `</g>`;
  // Taza con marca de labial
  s += ink([{ d: rell(1260, 300, 84, 84), m: M.bone, s: 10 }, { d: rell(1360, 300, 20, 30), m: M.bone, s: 4, hatch: false }]);
  s += `<path d="${rell(1260, 300, 64, 64)}" fill="#1c0f10" stroke="${INK}" stroke-width="4"/><path d="${rell(1250, 290, 50, 50)}" fill="none" stroke="#3a2420" stroke-width="3" opacity=".7"/>`;
  s += `<path d="M1204 254q10 -16 26 -22" stroke="#c0283c" stroke-width="9" fill="none" stroke-linecap="round" opacity=".85"/>`;
  s += `<path d="${rell(1160, 470, 70, 66, { amp: 4 })}" fill="none" stroke="#3a2025" stroke-width="5" opacity=".45"/>`;
  // Lápiz y clips
  s += ink([{ d: rpoly([[1060, 640], [1320, 600], [1326, 616], [1066, 656]]), m: { b: '#c79a3a', S: '#8a6420', D: '#5a3e14', H: '#f0cc6a' }, s: 4, hatch: false }, { d: rpoly([[1320, 600], [1356, 602], [1326, 616]]), m: M.bone, s: 2, hatch: false }], { lw: 4 });
  // Borde frontal del escritorio
  s += ink([{ d: rrect(-30, 680, 1660, 260), m: M.wood, s: 14 }]);
  return s;
}
function cuDrawer(open) {
  if (!open) return ink([{ d: rrect(480, 712, 640, 170), m: M.wood, s: 12 }]) + ink([{ d: rrect(740, 780, 120, 22), m: M.brass, s: 4, hatch: false }], { lw: 4 });
  let s = ink([{ d: rpoly([[470, 600], [1130, 600], [1170, 905], [430, 905]]), m: M.wood, s: 10 }]);
  s += `<path d="${rpoly([[500, 620], [1100, 620], [1128, 880], [472, 880]])}" fill="#1a0d10" stroke="${INK}" stroke-width="5"/>`;
  s += ink([{ d: rpoly([[520, 820], [760, 800], [764, 812], [524, 832]]), m: { b: '#c79a3a', S: '#8a6420', D: '#5a3e14', H: '#f0cc6a' }, s: 3, hatch: false }, { d: rpoly([[880, 650], [1050, 640], [1060, 760], [890, 770]]), m: M.paper, s: 6, hatch: false }], { lw: 4 });
  s += `<g transform="rotate(-8 970 705)"><rect x="930" y="676" width="80" height="54" fill="#7c2434" stroke="${INK}" stroke-width="3"/><text x="970" y="702" text-anchor="middle" font-family="Rockwell,Georgia,serif" font-weight="900" font-size="15" fill="${PAPER}">HOTEL</text><text x="970" y="720" text-anchor="middle" font-family="Rockwell,Georgia,serif" font-weight="900" font-size="15" fill="${PAPER}">LUX</text></g>`;
  return s;
}
function cuFlashlight() {
  return ink([
    { d: rpoly([[600, 700], [820, 680], [826, 726], [606, 744]]), m: { b: '#2b2833', S: '#18161d', D: '#0c0b10', H: '#6e6a80' }, s: 6 },
    { d: rpoly([[820, 668], [872, 662], [878, 736], [826, 740]]), m: { b: '#2b2833', S: '#18161d', D: '#0c0b10', H: '#6e6a80' }, s: 6 },
  ], { lw: 5 }) + `<path d="${rell(876, 700, 10, 34)}" fill="#c98bff" stroke="${INK}" stroke-width="4"/><rect x="680" y="694" width="26" height="14" fill="#5a5a6e" stroke="${INK}" stroke-width="2"/>`;
}
function cuPhotoBack() {
  return `<g transform="rotate(3 860 330)">${ink([{ d: rrect(720, 150, 290, 360), m: { b: '#a58c6a', S: '#7a6450', D: '#55463a', H: '#d2b88e' }, s: 10 }])}
    <text font-family="${handFont}" font-size="26" fill="#2a2030"><tspan x="760" y="250">Tango,</tspan><tspan x="760" y="290">verano del 79.</tspan><tspan x="760" y="360" font-size="21">El único que</tspan><tspan x="760" y="392" font-size="21">siempre me espera.</tspan></text>
    <path d="M840 440l22 22M862 440l-22 22" stroke="#2a2030" stroke-width="3"/></g>`;
}

/* ---------- Primer plano: computadora ---------- */
function cuPC() {
  let s = `<rect x="-20" y="-20" width="1640" height="960" fill="#221c30"/>`;
  s += ink([{ d: rrect(-30, 770, 1660, 200), m: M.woodL, s: 14, hatch: false }]);
  s += ink([{ d: rrect(270, 40, 1060, 760), m: M.plastic, s: 22 }]);
  s += `<path d="${rrect(352, 104, 896, 596, { amp: 1 })}" fill="#0b100e" stroke="${INK}" stroke-width="8"/>`;
  s += `<text x="420" y="752" font-family="Rockwell,Georgia,serif" font-weight="900" font-size="24" letter-spacing="3" fill="#6a6070">FERRAZ·SISTEMAS</text>`;
  for (let i = 0; i < 6; i++) s += hline([[870 + i * 26, 726], [870 + i * 26, 770]], 4, '#6a6070');
  s += ink([{ d: rell(1200, 748, 22, 22), m: M.plastic, s: 6 }], { lw: 5 });
  // Post-it con letra de Ferraz
  s += `<g transform="rotate(7 1330 170)">${ink([{ d: rrect(1240, 80, 180, 170), m: { b: '#e9d36a', S: '#b39a4a', D: '#7e6a30', H: '#fff3a8' }, s: 6, hatch: false }], { lw: 4 })}
    <text font-family="${handFont}" font-size="22" fill="#2a2030"><tspan x="1256" y="130">Martes:</tspan><tspan x="1256" y="166">veterinario</tspan><tspan x="1256" y="200">17 h</tspan></text></g>`;
  return s;
}

/* ---------- Primer plano: archivador abierto ---------- */
function cuCabinet() {
  let s = `<rect x="-20" y="-20" width="1640" height="960" fill="#121014"/>`;
  s += ink([{ d: rpoly([[60, 20], [1540, 20], [1460, 900], [140, 900]]), m: M.metal, s: 18 }]);
  s += `<path d="${rpoly([[130, 70], [1470, 70], [1400, 880], [200, 880]])}" fill="#0f0d12" stroke="${INK}" stroke-width="6"/>`;
  const khaki = { b: '#b99a62', S: '#86693f', D: '#5a4530', H: '#e6cd92' };
  for (let r = 0; r < 4; r++) {
    const y = 140 + r * 150;
    s += ink([{ d: rpoly([[150 + r * 12, y], [1450 - r * 12, y], [1440 - r * 12, y + 200], [160 + r * 12, y + 200]]), m: khaki, s: 8 }], { lw: 5 });
    const tx = [1180, 200, 250, 300][r];                       // pestañas escalonadas, lejos de la hoja suelta
    s += ink([{ d: rrect(tx, y - 34, 170, 40), m: khaki, s: 4, hatch: false }], { lw: 4 });
    s += `<rect x="${tx + 16}" y="${y - 26}" width="138" height="24" fill="${PAPER}"/><text x="${tx + 85}" y="${y - 8}" text-anchor="middle" font-family="${typeFont}" font-weight="bold" font-size="17" fill="${INK}">${['PÓLIZAS 86', 'POLILLA', 'SINIESTROS', 'PERSONAL'][r]}</text>`;
    s += hline([[160 + r * 12, y + 196], [1440 - r * 12, y + 196]], 6, '#0f0d12', { op: 0.7 });
  }
  // Pólizas atadas
  s += ink([{ d: rpoly([[1110, 360], [1430, 340], [1450, 700], [1130, 720]]), m: M.paper, s: 8 }]);
  for (let i = 0; i < 8; i++) s += hline([[1150, 400 + i * 36], [1400, 386 + i * 36]], 1.6, INK, { op: 0.5, seed: i });
  s += hline([[1250, 350], [1270, 712]], 6, '#7c2434');
  // La hoja del ojo, encima de todo
  s += `<g transform="rotate(-3 800 520)">${ink([{ d: rrect(540, 270, 520, 500), m: M.paper, s: 10, hatch: false }])}${tallySheet(800, 530, 1.15)}</g>`;
  return s;
}

/* ---------- Primer plano: caja fuerte ---------- */
function cuSafe(open) {
  let s = `<rect x="-20" y="-20" width="1640" height="960" fill="#151217"/>`;
  s += ink([{ d: rrect(160, -20, 1280, 960), m: M.safe, s: 26 }], { lw: 9 });
  if (!open) {
    s += `<path d="${rrect(220, 40, 1160, 840)}" fill="none" stroke="${INK}" stroke-width="5" opacity=".85"/>`;
    s += `<text x="800" y="96" text-anchor="middle" font-family="Rockwell,Georgia,serif" font-weight="900" font-size="44" letter-spacing="10" fill="#b08a4a" stroke="${INK}" stroke-width="1.5">HALCÓN</text>`;
    s += ink([{ d: rrect(540, 124, 520, 128), m: M.brass, s: 10 }], { lw: 6 });
    s += symMoon(650, 188, 38) + symEye(800, 188, 50, INK, 7) + symAnchor(950, 188, 48, INK, 7);
    for (const [cx, cy] of [[560, 140], [1040, 140], [560, 236], [1040, 236]]) s += `<circle cx="${cx}" cy="${cy}" r="6" fill="#74562f" stroke="${INK}" stroke-width="2"/>`;
    s += ink([{ d: rrect(430, 300, 740, 340), m: M.metal, s: 12 }], { lw: 7 });
    for (const [x, n] of [[555, 'I'], [800, 'II'], [1045, 'III']]) s += `<text x="${x}" y="680" text-anchor="middle" font-family="Rockwell,Georgia,serif" font-weight="900" font-size="30" fill="#86b0ae">${n}</text>`;
    s += ink([{ d: rrect(1240, 360, 70, 300), m: M.brass, s: 10 }, { d: rell(1275, 360, 52, 52), m: M.brass, s: 10 }], { lw: 7 });
    for (const [a, b] of [[[300, 760], [380, 730]], [[1180, 800], [1260, 820]], [[260, 300], [280, 360]]]) s += tline([a, b], 3, '#86b0ae', { op: 0.6 });
  } else {
    s += `<path d="${rrect(250, 60, 1100, 800)}" fill="#08070a" stroke="${INK}" stroke-width="8"/>`;
    s += ink([{ d: rrect(250, 600, 1100, 30), m: M.safe, s: 6, hatch: false }]);
    s += ink([{ d: rpoly([[1350, 60], [1560, -10], [1560, 930], [1350, 860]]), m: M.safe, s: 18 }], { lw: 8 });
    s += `<path d="M260 70H1340V300Q800 240 260 320Z" fill="#cfe9ee" opacity=".05"/>`;
  }
  return s;
}
function cuSafeLoot(hasDoc, hasPhoto) {
  let s = '';
  if (hasDoc) {
    s += `<g transform="rotate(-2 720 470)">${ink([{ d: rrect(470, 330, 500, 270), m: { b: '#8a3a2c', S: '#5a2420', D: '#381512', H: '#c26a4e' }, s: 12 }])}
      <rect x="560" y="390" width="320" height="64" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>
      <text x="720" y="436" text-anchor="middle" font-family="Rockwell,Georgia,serif" font-weight="900" font-size="38" letter-spacing="4" fill="${INK}">NOCTUA</text>
      <text x="720" y="540" text-anchor="middle" font-family="${typeFont}" font-weight="bold" font-size="26" fill="#ff8f9c" transform="rotate(-8 720 540)" opacity=".9">ULTRASECRETO</text></g>`;
  }
  if (hasPhoto) s += `<g transform="rotate(9 1140 480)">${polaroid(1040, 340, 0.9)}</g>`;
  return s;
}
// Polaroid: la puerta de la oficina, vista desde adentro, esta misma noche
function polaroid(x, y, sc = 1, big = false) {
  return `<g transform="translate(${x} ${y}) scale(${sc})">
    ${ink([{ d: rrect(0, 0, 220, 260), m: { b: '#efe7d6', S: '#c4b8c0', D: '#948aa0', H: '#fffaf0' }, s: 6, hatch: false }], { lw: 5 })}
    <rect x="16" y="16" width="188" height="176" fill="#171320"/>
    <path d="M70 40H150V192H70Z" fill="#2c2738"/><path d="M84 54H136V120H84Z" fill="#c9d6c0" opacity=".85"/>
    <path d="M80 192L150 192 204 150 204 192Z" fill="#d8f0ff" opacity=".12"/>
    <circle cx="150" cy="70" r="16" fill="#fff" opacity=".6" filter="url(#glowSoft)"/>
    <text x="110" y="232" text-anchor="middle" font-family="${handFont}" font-size="${big ? 19 : 17}" textLength="184" lengthAdjust="spacingAndGlyphs" fill="#2a2030">23:46 — ya casi llega</text></g>`;
}

/* ---------- Retratos para el comunicador ---------- */
function portraitControl(mood = 'neutral', open = false) {
  const coat = { b: '#6e6658', S: '#4a4048', D: '#2c2632', H: '#a8a090' };
  let s = `<rect width="200" height="200" fill="#1d2a2c"/><rect width="200" height="200" fill="url(#hatchF)" opacity=".18"/>`;
  s += ink([
    { d: rcurve([[8, 210], [30, 166], [74, 150], [100, 156], [128, 150], [170, 166], [194, 210]]), m: coat, s: 8 },
    { d: rpoly([[82, 128], [118, 128], [116, 160], [100, 168], [84, 160]]), m: M.skin, s: 6, hatch: false },
    { d: rcurve([[60, 92], [62, 50], [100, 34], [138, 50], [140, 92], [134, 124], [114, 144], [100, 148], [86, 144], [66, 124]]), m: M.skin, s: 9 },
    { d: rcurve([[52, 110], [48, 58], [80, 26], [122, 24], [154, 52], [150, 112], [140, 90], [132, 56], [104, 46], [72, 58], [62, 92]]), m: M.hair, s: 7 },
    { d: rpoly([[74, 150], [100, 178], [86, 196], [62, 160]]), m: coat, s: 4, hatch: false },
    { d: rpoly([[126, 150], [100, 178], [114, 196], [138, 160]]), m: coat, s: 4, hatch: false },
  ], { lw: 5, s: 8 });
  s += tline([[126, 30], [142, 50], [148, 86]], 6, '#c9c6d4', { curve: true, op: 0.85 });                 // mechón gris
  s += hline([[56, 74], [70, 34], [100, 22], [132, 32], [146, 74]], 5, '#2a2a33');                          // vincha del auricular
  s += ink([{ d: rell(56, 92, 11, 16), m: M.metal, s: 4, hatch: false }], { lw: 4 });
  s += hline([[58, 106], [70, 132], [92, 138]], 3, '#2a2a33') + `<circle cx="94" cy="138" r="4" fill="#2a2a33"/>`;
  const by = mood === 'alarma' ? -5 : 0;
  s += tline([[74, 80 + by], [92, 77 + by]], 4) + tline([[108, 77 + by], [126, 80 + by]], 4);
  s += `<path d="M77 90Q84 86 91 90" stroke="${INK}" stroke-width="3" fill="none"/><path d="M109 90Q116 86 123 90" stroke="${INK}" stroke-width="3" fill="none"/>`;
  s += `<circle cx="84" cy="92" r="${mood === 'alarma' ? 2.3 : 3}" fill="${INK}"/><circle cx="116" cy="92" r="${mood === 'alarma' ? 2.3 : 3}" fill="${INK}"/>`;
  s += `<path d="M78 98q6 4 13 1M109 99q7 3 13 -1" stroke="#8c6a78" stroke-width="2" fill="none"/>`;            // ojeras
  s += tline([[101, 92], [96, 114], [104, 116]], 3, '#5a4358');
  s += open ? `<path d="${rell(100, 128, mood === 'alarma' ? 9 : 8, mood === 'alarma' ? 7 : 4)}" fill="#3a1a24" stroke="${INK}" stroke-width="2.5"/>` : tline([[90, 128], [100, 129], [111, 127]], 3.4);
  s += `<rect width="200" height="200" fill="url(#scanl)" opacity=".5"/>`;
  return `<svg viewBox="22 14 156 156"><defs><pattern id="scanl" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="2" fill="#000" opacity=".25"/></pattern></defs>${s}</svg>`;
}
function portraitStatic(txt = 'SIN SEÑAL') {
  return `<svg viewBox="0 0 200 200"><rect width="200" height="200" fill="#0d1112"/><rect width="200" height="200" filter="url(#tv)"/>
    <text x="100" y="108" text-anchor="middle" font-family="${typeFont}" font-weight="bold" font-size="16" fill="#e6f0e8" opacity=".85">${txt}</text></svg>`;
}

/* ---------- Íconos del inventario (64×64) ---------- */
const ICONS = {
  libreta: () => ink([{ d: rrect(14, 8, 38, 48, { amp: 0.6 }), m: { b: '#6b4a34', S: '#462e22', D: '#2a1a14', H: '#a07658' }, s: 4 }, { d: rrect(12, 8, 6, 48, { amp: 0.3 }), m: M.wood, s: 2, hatch: false }], { lw: 3 })
    + `<rect x="24" y="18" width="20" height="10" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/><path d="M46 8V56" stroke="#7c2434" stroke-width="3"/>`,
  uv: () => ink([{ d: rpoly([[8, 38], [40, 22], [46, 32], [14, 50]], { amp: 0.4 }), m: { b: '#2b2833', S: '#18161d', D: '#0c0b10', H: '#7e7a92' }, s: 3 }, { d: rpoly([[40, 18], [52, 12], [60, 28], [48, 36]], { amp: 0.4 }), m: { b: '#2b2833', S: '#18161d', D: '#0c0b10', H: '#7e7a92' }, s: 3 }], { lw: 3 })
    + `<path d="M52 12L60 28" stroke="#c98bff" stroke-width="5" stroke-linecap="round"/><circle cx="57" cy="20" r="9" fill="#c98bff" opacity=".35"/>`,
  llave: () => ink([{ d: rell(18, 32, 11, 11, { amp: 0.4 }), m: M.brass, s: 3, hatch: false }, { d: rpoly([[26, 29], [56, 29], [56, 35], [26, 35]], { amp: 0.3 }), m: M.brass, s: 2, hatch: false }, { d: rpoly([[46, 35], [52, 35], [52, 44], [46, 44]], { amp: 0.2 }), m: M.brass, s: 2, hatch: false }], { lw: 3 })
    + `<circle cx="18" cy="32" r="4" fill="${INK}"/>`,
  foto: () => ink([{ d: rrect(12, 8, 40, 50, { amp: 0.4 }), m: M.wood, s: 4 }, { d: rrect(17, 13, 30, 40, { amp: 0.3 }), m: { b: '#b49a74', S: '#8a7058', D: '#5e4a3c', H: '#e0c9a0' }, s: 2, hatch: false }], { lw: 3 })
    + `<circle cx="26" cy="27" r="4" fill="#3b2f2c"/><path d="M22 52V34h8v18M34 52q0 -12 8 -14l4 -4v18" fill="#3b2f2c"/>`,
  expediente: () => ink([{ d: rrect(8, 14, 48, 38, { amp: 0.4 }), m: { b: '#8a3a2c', S: '#5a2420', D: '#381512', H: '#c26a4e' }, s: 4 }], { lw: 3 })
    + `<rect x="16" y="24" width="32" height="10" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/>`,
};
const iconSvg = k => `<svg viewBox="0 0 64 64">${ICONS[k]()}</svg>`;
