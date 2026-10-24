/* =====================================================================
   [8] LA PRESENCIA (cap. 2): algo del otro lado del vidrio de la oficina.
   Un solo número, 0…1, que sube con los errores, con cada «Pensar», con
   el rato quieto y con el tiempo. Se lee en la escena, sin barras: la
   silueta se hace nítida, el vidrio late y los tubos titilan. Al llegar
   a 1: apagón, un susto, y uno de tus objetos aparece en otro lugar.
   Calibración: una partida normal ve 1 o 2 apagones; una cuidadosa, ninguno.
   ===================================================================== */
const Presence = (() => {
  let P = 0, knocked = false, visT = 0;
  const RATE = {
    drift: 0.0004,      // por segundo, siempre (15 min ≈ +0,36)
    idle: 0.004,        // por segundo, tras IDLE_MS sin tocar nada
    error: 0.2,         // fusible equivocado, clave mala, tarjeta rechazada
    think: 0.12,        // cada «Pensar»
    open: 0.15,         // abrir el expediente
    noise: 0.06,        // el timbre del mostrador
  };
  const IDLE_MS = 25000;
  const active = () => S.cap === 2 && S.c2?.live && !S.ended && !S.busy && !Dialog.open && !nbOpen() && !$('.sheetOv') && !document.hidden;

  function add(kind) { if (S.cap === 2 && S.c2?.live && !S.ended) P = Math.min(1.05, P + RATE[kind]); }

  // Lo que se ve y se oye según P
  function show(t) {
    const sil = $('#sil'); if (!sil) return;
    const k = clamp((P - 0.12) / 0.5, 0, 1), sc = 0.82 + P * 0.32;
    sil.setAttribute('opacity', (k * k * (3 - 2 * k) * 0.92).toFixed(2));
    sil.setAttribute('transform', sil.getAttribute('transform').replace(/ scale\([^)]*\)/, '') + ` scale(${sc.toFixed(3)})`);
    $('#silS').setAttribute('filter', `url(#silB${P < 0.45 ? 0 : P < 0.78 ? 1 : 2})`);
    $('#silHand').setAttribute('opacity', P > 0.82 ? 1 : 0);
    // El vidrio late con el neón de la oficina (más inquieto cuanto más cerca)
    const g = Math.random() < 0.05 + P * 0.12 ? 0.04 : 0.16 + Math.sin(t / 700) * 0.04;
    $('#glassGlow').setAttribute('opacity', g.toFixed(2));
    $('#glassSpill').setAttribute('opacity', (0.35 + g * 1.6).toFixed(2));
    // Tubos: titilan más cuanto más cerca está
    const on = S.c2.power, flick = on && Math.random() < 0.012 + P * P * 0.16;
    $('#tubeGlow').setAttribute('opacity', on ? (flick ? 0.08 : 0.42) : 0);
    $('#tubeCone').setAttribute('opacity', on ? (flick ? 0.05 : 0.3) : 0);
    $('#dark').setAttribute('opacity', on ? (flick ? 0.45 : 0.1) : 0.66);
    Sfx.hum(on, P);
  }

  function tick(t, dt) {
    if (S.cap !== 2 || !$('#sil')) return;
    if (active()) {
      P += RATE.drift * dt;
      if (performance.now() - (S.lastAct || 0) > IDLE_MS) P += RATE.idle * dt;
      if (P >= 1) blackout();
      else if (P > 0.85 && !knocked) { knocked = true; Sfx.knock(); setTimeout(() => { if (!S.busy) think('Golpes en el vidrio. Desde adentro de la oficina.'); }, 500); }
    }
    if (t - visT > 100) { visT = t; show(t); }
  }

  // Apagón: negro, un destello, y al volver la luz algo cambió de lugar
  async function blackout() {
    S.busy = true; S.c2.blackouts++;
    closeCloseup(); closeNotebook(); deselect(); hideTag();
    const bo = $('#blackout'), svg = $('#blackout svg');
    svg.innerHTML = artApagon(); svg.style.opacity = 0;
    bo.classList.add('on'); Sfx.blackout(); Sfx.hum(false, 0);
    await wait(1300);
    svg.style.opacity = 1; Sfx.sting(); Sfx.breath();
    await wait(160);
    svg.style.opacity = 0;
    await wait(1100);
    const moved = moveSomething();
    bo.classList.remove('on');
    P = 0.3; knocked = false; S.busy = false; S.lastAct = performance.now();
    think(moved ? ['Vuelve la luz. Hay algo distinto…', `¿Dónde está ${moved === 'uv' ? 'la linterna' : moved === 'llaveAsc' ? 'la llave de servicio' : 'el abrecartas'}? Lo tenía en la mano.`]
                : ['Vuelve la luz. Todo sigue en su lugar… creo.', 'Por un segundo hubo alguien parado junto al mostrador.']);
  }
  // Solo se mueve algo que todavía hace falta, y siempre a un lugar a la vista
  function moveSomething() {
    const c2 = S.c2, need = [];
    if (c2.hidden) return null;                    // uno a la vez: nunca se pierde nada para siempre
    if (has('abrecartas') && c2.screws.filter(Boolean).length < 4) need.push('abrecartas');
    if (has('uv') && !c2.uvSeen) need.push('uv');
    if (has('llaveAsc') && !c2.keyIn) need.push('llaveAsc');
    if (!need.length) return null;
    const k = need[Math.floor(Math.random() * need.length)];
    const spots = Object.keys(HIDE_SPOTS);
    c2.hidden = { k, spot: spots[Math.floor(Math.random() * spots.length)] };
    dropItem(k); renderHidden();
    return k;
  }
  return { add, tick, get p() { return P; }, set p(v) { P = v; } };
})();

function renderHidden() {
  const h = S.c2.hidden, g = $('#hidden'); if (!g) return;
  if (!h) { g.innerHTML = ''; return; }
  const [x, y] = HIDE_SPOTS[h.spot];
  g.innerHTML = `<g transform="translate(${x - 30} ${y - 30}) rotate(${h.spot === 'paraguas' ? -30 : 12} 32 32)">${ICONS[h.k]()}</g>`;
}
