/* =====================================================================
   [1] NÚCLEO: utilidades, ruido, trazos a mano y el ENTINTADOR SVG
   ---------------------------------------------------------------------
   Técnica (portada del kit FILO a SVG):
   - Bordes ásperos: cada lado se remuestrea y se corre sobre su normal con
     ruido, así ninguna recta es perfecta.
   - Un solo contorno: todas las piezas de un grupo se trazan gruesas en
     tinta ANTES de rellenar; los rellenos tapan las uniones interiores.
   - Sombra en medialuna: la pieza en tono oscuro + la misma pieza corrida
     hacia la luz en tono base. Tres valores: oclusión, sombra, base.
   - Rayado de tinta que nace del borde oscuro y filo frío de luz de luna.
   - Línea viva («boil»): el arte se hornea en tres variantes con un
     desplazamiento de ruido distinto y se alternan a ~6 fps.
   ===================================================================== */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const f1 = n => (Math.round(n * 10) / 10).toString();
const QS = new URLSearchParams(location.search);
const FLAT = QS.has('flat');                 // ?flat → solo colores planos (prueba de silueta)
const NOBOIL = QS.has('noboil') || matchMedia('(prefers-reduced-motion: reduce)').matches;
const INK = '#150e1b';

let _uid = 0;
const uid = () => 'u' + (++_uid).toString(36);

/* ---------- Ruido determinista ---------- */
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function noise1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }
function rng(seed) { let s = (seed * 9301 + 49297) % 233280 || 1; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }

/* ---------- Geometría a mano ---------- */
// Borde áspero: remuestrea cada lado cada `step` unidades y lo desplaza sobre la normal.
function rough(pts, o = {}) {
  const closed = o.closed !== false, amp = o.amp ?? 1.4, step = o.step ?? 22, seed = o.seed ?? (pts[0][0] * 0.13 + pts[0][1] * 0.07);
  const out = []; let acc = 0;
  const n = pts.length, last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len, k = Math.max(1, Math.ceil(len / step));
    for (let j = 0; j < k; j++) {
      const t = j / k, off = (j === 0 ? 0.35 : 1) * amp * noise1(seed + acc * 0.055);
      out.push([a[0] + dx * t + nx * off, a[1] + dy * t + ny * off]);
      acc += len / k;
    }
  }
  if (!closed) out.push(pts[n - 1]);
  return 'M' + out.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + (closed ? 'Z' : '');
}
const rrect = (x, y, w, h, o) => rough([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], o);
const rpoly = (pts, o) => rough(pts, o);
// Elipse con contorno que respira un poco
function rell(cx, cy, rx, ry, o = {}) {
  const n = o.n || Math.max(18, Math.round((rx + ry) / 5)), seed = o.seed ?? (cx * 0.37 + cy * 0.11), amp = o.amp ?? 1.1;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (o.rot || 0), w = 1 + (amp * noise1(seed + i * 0.8)) / Math.max(rx, ry);
    pts.push([cx + Math.cos(a) * rx * w, cy + Math.sin(a) * ry * w]);
  }
  return 'M' + pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z';
}
// Spline Catmull-Rom (uniforme) muestreada: para formas orgánicas (silla, abrigo, hojas).
function cr(pts, closed = false, k = 7) {
  const out = [], n = pts.length, P = i => closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)];
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    for (let j = 0; j < k; j++) {
      const t = j / k, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map(c => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)));
    }
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}
const rcurve = (pts, o = {}) => rough(cr(pts, o.closed !== false, o.k || 7), { step: 1e9, amp: 0.9, ...o });
// Trazo afinado: grueso al medio, fino en las puntas (detalles, grietas, pliegues).
function taper(pts, w = 3, o = {}) {
  const P = o.curve ? cr(pts, false, 6) : pts, n = P.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const t = i / (n - 1), ww = w * (0.18 + 0.82 * Math.pow(Math.sin(Math.PI * clamp(t, 0.03, 0.97)), o.pow ?? 0.55)) / 2;
    L.push([P[i][0] - dy * ww, P[i][1] + dx * ww]); R.push([P[i][0] + dy * ww, P[i][1] - dx * ww]);
  }
  const all = L.concat(R.reverse());
  return 'M' + all.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z';
}
// Línea a mano con trazo (no rellena)
const hline = (pts, w = 2, col = INK, o = {}) =>
  `<path d="${rough(pts, { closed: false, amp: o.amp ?? 0.9, step: o.step ?? 18, seed: o.seed })}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${o.op ? ` opacity="${o.op}"` : ''}/>`;
const tline = (pts, w = 3, col = INK, o = {}) => `<path d="${taper(pts, w, o)}" fill="${col}"${o.op ? ` opacity="${o.op}"` : ''}/>`;

/* ---------- Materiales (base, Sombra, oclusión D, brillo H de luna) ----------
   Giro de tono: las sombras van al violeta, los brillos a la luna fría. */
const M = {
  wall:   { b: '#3b3452', S: '#2a243c', D: '#1b1629', H: '#65739a' },
  wallL:  { b: '#2e2843', S: '#211c33', D: '#141020', H: '#4f5a7c' },
  ceil:   { b: '#1c1727', S: '#15111e', D: '#0d0a13', H: '#2f2c44' },
  floor:  { b: '#35272e', S: '#251a21', D: '#150f14', H: '#5d4b55' },
  wood:   { b: '#5e3532', S: '#3d2126', D: '#241217', H: '#93604f' },
  woodL:  { b: '#74463b', S: '#4b2a2d', D: '#2c171b', H: '#b07a62' },
  metal:  { b: '#4b5765', S: '#2f3642', D: '#1a1f29', H: '#93b4c4' },
  safe:   { b: '#3b4c4c', S: '#243032', D: '#121a1c', H: '#86b0ae' },
  brass:  { b: '#b08a4a', S: '#74562f', D: '#45311c', H: '#ecc97f' },
  paper:  { b: '#d9cdb4', S: '#a699a8', D: '#6e6279', H: '#f5ecd9' },
  plastic:{ b: '#bcb19c', S: '#827880', D: '#4d4555', H: '#e9e0cc' },
  cloth:  { b: '#2e2a3b', S: '#1d1a27', D: '#100d16', H: '#535a78' },
  leaf:   { b: '#22302a', S: '#161f1b', D: '#0b110e', H: '#45604f' },
  red:    { b: '#7c2434', S: '#4b1422', D: '#2c0b15', H: '#c4485a' },
  glass:  { b: '#1b2830', S: '#121b21', D: '#0a1014', H: '#56788a' },
  skin:   { b: '#c99a80', S: '#8c6a78', D: '#5a4358', H: '#f0c9a8' },
  hair:   { b: '#4a4250', S: '#2c2634', D: '#18141d', H: '#8b8aa0' },
  coat:   { b: '#3e3a2f', S: '#26232a', D: '#14121a', H: '#6e6c6a' },
  bone:   { b: '#e3d6bd', S: '#b3a4b2', D: '#7f7190', H: '#fff6e6' },
};
// Dirección hacia la luz (la luna entra por la ventana, arriba a la izquierda)
let LIGHT = [-0.5, -0.86];

/* ---------- El entintador ----------
   pieces: [{ d, m, s (tamaño de sombra), hatch, lit, lw, noLine, flat, fill }] */
function ink(pieces, o = {}) {
  const lw = o.lw ?? 6; let out = '<g>';
  for (const p of pieces) if (!p.noLine) out += `<path d="${p.d}" fill="${INK}" stroke="${INK}" stroke-width="${p.lw ?? lw}" stroke-linejoin="round"/>`;
  for (const p of pieces) out += fillPiece(p, o);
  return out + '</g>';
}
function fillPiece(p, o = {}) {
  const m = p.m || M.wall;
  if (p.fill) return `<path d="${p.d}" fill="${p.fill}"/>`;
  if (FLAT || p.flat) return `<path d="${p.d}" fill="${m.b}"/>`;
  const s = p.s ?? o.s ?? 10, L = p.light || o.light || LIGHT, lx = L[0] * s, ly = L[1] * s, id = uid();
  const tr = k => ` transform="translate(${f1(lx * k)} ${f1(ly * k)})"`;
  let g = `<clipPath id="${id}"><path d="${p.d}"/></clipPath><g clip-path="url(#${id})">`;
  g += `<path d="${p.d}" fill="${m.D}"/>`;                     // oclusión (borde más oscuro)
  g += `<path d="${p.d}" fill="${m.S}"${tr(0.32)}/>`;          // sombra propia
  g += `<path d="${p.d}" fill="${m.b}"${tr(1)}/>`;             // base: la pieza corrida hacia la luz
  if (p.hatch !== false && o.hatch !== false) {                 // rayado que nace del borde oscuro
    const mid = uid();
    g += `<mask id="${mid}" maskUnits="userSpaceOnUse" x="-600" y="-600" width="2800" height="2100"><path d="${p.d}" fill="#fff"/><path d="${p.d}" fill="#000"${tr(0.62)}/></mask>`;
    g += `<rect x="-600" y="-600" width="2800" height="2100" fill="url(#${p.cross ? 'hatchX' : 'hatch'})" mask="url(#${mid})" opacity="${p.hatchOp ?? 0.5}"/>`;
  }
  if (p.lit !== false && o.lit !== false) {                     // filo de luz fría del lado de la luna
    const hid = uid(), k = p.litW ?? 0.3;
    g += `<mask id="${hid}" maskUnits="userSpaceOnUse" x="-600" y="-600" width="2800" height="2100"><path d="${p.d}" fill="#fff"/><path d="${p.d}" fill="#000"${tr(-k)}/></mask>`;
    g += `<path d="${p.d}" fill="${m.H}" mask="url(#${hid})" opacity="${p.litOp ?? 0.75}"/>`;
  }
  return g + '</g>';
}

/* ---------- Definiciones compartidas (tramas, filtros) ---------- */
const ART_DEFS = `
<pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-38)"><path d="M0 4H8" stroke="${INK}" stroke-width="1.6"/></pattern>
<pattern id="hatchX" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-38)"><path d="M0 4H8M4 0V8" stroke="${INK}" stroke-width="1.4"/></pattern>
<pattern id="hatchF" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(52)"><path d="M0 3H6" stroke="${INK}" stroke-width="1.1"/></pattern>
<filter id="dry" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".9 .06" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.05"/><feComposite in="SourceGraphic" operator="in"/></filter>`;
const boilFilter = (i, a = 3.2) =>
  `<filter id="boil${i}" filterUnits="userSpaceOnUse" x="-800" y="-800" width="3200" height="2500"><feTurbulence type="fractalNoise" baseFrequency=".022" numOctaves="2" seed="${i * 7 + 3}"/><feDisplacementMap in="SourceGraphic" scale="${a}" xChannelSelector="R" yChannelSelector="G"/></filter>`;

// Filtros del documento vivo (sellos, brillos UV, estática del comunicador)
const LIVE_DEFS = ART_DEFS + `
<filter id="fxStamp"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="2" seed="9"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.6"/><feComposite in="SourceGraphic" operator="in" result="g"/><feTurbulence type="fractalNoise" baseFrequency=".04" seed="2" result="w"/><feDisplacementMap in="g" in2="w" scale="3"/></filter>
<filter id="glowUV" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="shaftBlur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="7"/></filter>
<filter id="glowSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
<filter id="glowBig" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="26"/></filter>
<filter id="tv"><feTurbulence id="tvNoise" type="fractalNoise" baseFrequency=".9 .25" numOctaves="1" seed="1"/><feColorMatrix values="0 0 0 0 .55  0 0 0 0 .7  0 0 0 0 .62  0 0 0 1.4 -.2"/></filter>
<radialGradient id="gMoonPool" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#bfe4f2" stop-opacity=".5"/><stop offset="1" stop-color="#bfe4f2" stop-opacity="0"/></radialGradient>
<radialGradient id="gNeon" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff3d5a" stop-opacity=".55"/><stop offset=".45" stop-color="#ff3d5a" stop-opacity=".16"/><stop offset="1" stop-color="#ff3d5a" stop-opacity="0"/></radialGradient>
<radialGradient id="gCrt" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#86ffb5" stop-opacity=".42"/><stop offset=".5" stop-color="#86ffb5" stop-opacity=".1"/><stop offset="1" stop-color="#86ffb5" stop-opacity="0"/></radialGradient>
<radialGradient id="gUVspot" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff"/><stop offset=".62" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<radialGradient id="gExit" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#3dff8a" stop-opacity=".35"/><stop offset="1" stop-color="#3dff8a" stop-opacity="0"/></radialGradient>
<linearGradient id="gShaft" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cfeeff" stop-opacity=".24"/><stop offset=".7" stop-color="#cfeeff" stop-opacity=".06"/><stop offset="1" stop-color="#cfeeff" stop-opacity="0"/></linearGradient>`;
document.getElementById('defsRoot').innerHTML = LIVE_DEFS;

/* ---------- Horneado con línea viva ----------
   Convierte un fragmento SVG en 3 imágenes (una por variante de «boil»).
   Renderizar imágenes es barato; alternar cuál se ve, casi gratis. */
/* Mostrar un SVG con filtro como <image> obliga a re-rasterizarlo entero cada vez que vuelve a
   verse. Por eso cada variante se pasa a mapa de bits UNA vez (en segundo plano) y la línea viva
   alterna bitmaps ya decodificados. Mientras tanto se ve la variante 0 en vector, quieta. */
const blobUrl = (s, type = 'image/svg+xml') => URL.createObjectURL(s instanceof Blob ? s : new Blob([s], { type }));
const bakeJobs = new Map();               // id → { svgs, w, h, cu, urls }
let bakeSeq = 0, rasterOn = !NOBOIL;
const rasterQueue = [];
function bake(inner, o = {}) {
  const x = o.x ?? -320, y = o.y ?? -120, w = o.w ?? 2240, h = o.h ?? 1120;
  const amp = o.amp ?? 3.2, img = (cls, href) => `<image class="${cls}" href="${href}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="none"/>`;
  const svgOf = i => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}"><defs>${ART_DEFS}${i < 0 ? '' : boilFilter(i, amp)}</defs><g${i < 0 ? '' : ` filter="url(#boil${i})"`}>${inner}</g></svg>`;
  if (NOBOIL || o.still) return `<g>${img('', blobUrl(svgOf(-1)))}</g>`;
  const id = 'b' + (++bakeSeq), svgs = [0, 1, 2].map(svgOf);
  bakeJobs.set(id, { svgs, w, h, cu: !!o.cu, urls: null });
  rasterQueue.push(id); pumpRaster();
  return `<g class="baked" data-bake="${id}">${img('bv0', blobUrl(svgs[0]))}${img('bv1', '')}${img('bv2', '')}</g>`;
}
// Escala del mapa de bits: lo que ocupa en pantalla × densidad, acotada para cuidar la memoria
function rasterScale(cu) {
  const dpr = Math.min(2, devicePixelRatio || 1);
  const px = cu ? ($('#cuFrame').getBoundingClientRect().width || 900) / 1600
                : ($('#stage').getBoundingClientRect().width || 1200) / ($('#scene').viewBox.baseVal?.width || 1600);
  return clamp(px * dpr, 0.5, 1.25);
}
let rasterBusy = false;
async function pumpRaster() {
  if (rasterBusy || !rasterOn) return;
  rasterBusy = true;
  await new Promise(r => setTimeout(r, 60));
  while (rasterQueue.length && rasterOn) {
    const id = rasterQueue.shift(), job = bakeJobs.get(id), sc = rasterScale(job.cu);
    const W = Math.round(job.w * sc), H = Math.round(job.h * sc), urls = [];
    try {
      for (const svg of job.svgs) {
        const src = blobUrl(svg), im = new Image(); im.src = src; await im.decode();
        const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
        cv.getContext('2d').drawImage(im, 0, 0, W, H); URL.revokeObjectURL(src);
        urls.push(blobUrl(await new Promise((res, rej) => cv.toBlob(b => b ? res(b) : rej(), 'image/png'))));
        await new Promise(r => setTimeout(r, 0));
      }
      job.urls = urls; hydrate(document);
    } catch (e) { rasterOn = false; console.warn('Línea viva desactivada:', e); }
  }
  rasterBusy = false;
  window.__rasterIdle = true;           // para las pruebas automáticas
}
// Pone los mapas de bits listos en todo grupo horneado que haya en `root`
function hydrate(root) {
  $$('.baked:not(.ready)', root).forEach(g => {
    const job = bakeJobs.get(g.dataset.bake); if (!job?.urls) return;
    $$('image', g).forEach((im, i) => im.setAttribute('href', job.urls[i]));
    g.classList.add('ready');
  });
}
// Alterna las variantes («en dos»: ~6 cambios por segundo). Solo en grupos con sus 3 bitmaps.
const boilStyle = document.createElement('style');
document.head.appendChild(boilStyle);
let boilFrame = 0;
function boilTick() {
  boilFrame = (boilFrame + 1) % 3;
  boilStyle.textContent = '.baked:not(.ready) .bv1,.baked:not(.ready) .bv2{display:none}'
    + [0, 1, 2].filter(i => i !== boilFrame).map(i => `.baked.ready .bv${i}`).join(',') + '{display:none}';
}
boilTick();
if (!NOBOIL) setInterval(boilTick, 165);
