/* =====================================================================
   [4] SONIDO: todo sintetizado con WebAudio (sin archivos).
   Ambiente: lluvia, zumbido del edificio y del neón. Efectos: clics,
   objetos, pistas, CRT, dial, teléfono, radio y golpes de tensión.
   ===================================================================== */
const Sfx = (() => {
  let ctx = null, master = null, muted = false, neonGain = null, ringTimer = null, humNodes = null, motorNode = null;
  const now = () => ctx.currentTime;
  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return; }
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.9; master.connect(ctx.destination);
    ambience();
  }
  function noiseBuf(sec = 2, brown = false) {
    const b = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate), d = b.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w; }
    return b;
  }
  function src(buf, loop = false) { const s = ctx.createBufferSource(); s.buffer = buf; s.loop = loop; return s; }
  function env(g, t, a, peak, dcy, sus = 0.0001) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(sus, t + a + dcy); }
  function ambience() {
    // Lluvia: ruido filtrado con un vaivén lento
    const rain = src(noiseBuf(3), true), bp = ctx.createBiquadFilter(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
    bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 0.4; lp.type = 'lowpass'; lp.frequency.value = 4200; g.gain.value = 0.085;
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 0.025; lfo.connect(lg).connect(g.gain); lfo.start();
    rain.connect(bp).connect(lp).connect(g).connect(master); rain.start();
    // Zumbido del edificio (algo que no debería tener corriente)
    for (const [f, v] of [[55, 0.03], [110, 0.012]]) { const o = ctx.createOscillator(), og = ctx.createGain(); o.frequency.value = f; og.gain.value = v; o.connect(og).connect(master); o.start(); }
    // Neón: diente de sierra filtrado; su volumen sigue al parpadeo
    const n = ctx.createOscillator(), hp = ctx.createBiquadFilter(); neonGain = ctx.createGain();
    n.type = 'sawtooth'; n.frequency.value = 120; hp.type = 'highpass'; hp.frequency.value = 900; neonGain.gain.value = 0.006;
    n.connect(hp).connect(neonGain).connect(master); n.start();
  }
  function tone(f, d = 0.12, type = 'sine', v = 0.12, t0 = 0, glide = 0) {
    if (!ctx) return; const t = now() + t0, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + d);
    env(g, t, 0.008, v, d); o.connect(g).connect(master); o.start(t); o.stop(t + d + 0.05);
  }
  function burst(d = 0.08, freq = 3000, type = 'highpass', v = 0.2, t0 = 0, brown = false) {
    if (!ctx) return; const t = now() + t0, s = src(noiseBuf(Math.max(0.2, d + 0.1), brown)), f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = type; f.frequency.value = freq; env(g, t, 0.004, v, d); s.connect(f).connect(g).connect(master); s.start(t); s.stop(t + d + 0.1);
  }
  return {
    init,
    get muted() { return muted; },
    setMuted(m) { muted = m; if (master) master.gain.setTargetAtTime(m ? 0 : 0.9, now(), 0.05); },
    neon(v) { if (neonGain) neonGain.gain.setTargetAtTime(0.002 + v * 0.007, now(), 0.02); },
    click() { tone(1400, 0.03, 'square', 0.04); },
    tick() { burst(0.018, 2500, 'highpass', 0.05); },
    pickup() { tone(523, 0.12, 'triangle', 0.12); tone(784, 0.22, 'triangle', 0.12, 0.09); },
    clue() { [196, 233, 294].forEach((f, i) => tone(f, 2.2, 'sine', 0.09, i * 0.06)); tone(587, 1.4, 'triangle', 0.04, 0.2); burst(0.25, 180, 'lowpass', 0.5, 0, true); },
    stamp() { burst(0.18, 160, 'lowpass', 0.7, 0, true); burst(0.03, 1800, 'bandpass', 0.15); },
    wrong() { tone(110, 0.25, 'sawtooth', 0.06); tone(104, 0.25, 'sawtooth', 0.06); },
    dial() { burst(0.012, 4000, 'bandpass', 0.18); tone(2200, 0.02, 'square', 0.02); },
    crtOn() { burst(0.2, 120, 'lowpass', 0.5, 0, true); tone(14800, 1.6, 'sine', 0.012); tone(60, 0.5, 'sawtooth', 0.05, 0, 40); },
    radio() { burst(0.35, 1800, 'bandpass', 0.12); tone(1200, 0.04, 'square', 0.03, 0.32); },
    thunder() { if (!ctx) return; const t = now(), s = src(noiseBuf(4, true)), f = ctx.createBiquadFilter(), g = ctx.createGain();
      f.type = 'lowpass'; f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(70, t + 3); env(g, t, 0.15, 0.9, 3.2); s.connect(f).connect(g).connect(master); s.start(t); s.stop(t + 4); },
    drawer() { burst(0.35, 500, 'bandpass', 0.18); tone(90, 0.3, 'triangle', 0.08, 0, 60); },
    unlock() { burst(0.02, 3000, 'bandpass', 0.3); burst(0.04, 1200, 'bandpass', 0.25, 0.12); },
    safeOpen() { burst(0.5, 140, 'lowpass', 0.8, 0, true); tone(70, 1.4, 'sawtooth', 0.05, 0.3, 45); tone(310, 1.1, 'sawtooth', 0.015, 0.4, 260); },
    sting() { [110, 116.5, 164.8, 174.6].forEach((f, i) => tone(f, 3.2, 'sine', 0.06, i * 0.02)); tone(880, 2.5, 'sine', 0.02, 0.1, 860); },
    ringStart() {
      if (!ctx || ringTimer) return;
      const ring = () => { for (let k = 0; k < 2; k++) { tone(440, 0.4, 'sine', 0.07, k * 0.5); tone(480, 0.4, 'sine', 0.07, k * 0.5); } };
      ring(); ringTimer = setInterval(ring, 2600);
    },
    ringStop() { clearInterval(ringTimer); ringTimer = null; },
    /* --- Cap. 2: la recepción --- */
    // Zumbido de los tubos (con corriente) y un bordón grave que crece con la presencia
    hum(power, p) {
      if (!ctx) return;
      if (!humNodes) {
        const fl = ctx.createOscillator(), bp = ctx.createBiquadFilter(), fg = ctx.createGain();
        fl.type = 'sawtooth'; fl.frequency.value = 100; bp.type = 'bandpass'; bp.frequency.value = 1100; bp.Q.value = 2; fg.gain.value = 0;
        fl.connect(bp).connect(fg).connect(master); fl.start();
        const dg = ctx.createGain(); dg.gain.value = 0; dg.connect(master);
        for (const f of [46, 69.3]) { const o = ctx.createOscillator(); o.frequency.value = f; o.connect(dg); o.start(); }
        humNodes = { fg, dg };
      }
      humNodes.fg.gain.setTargetAtTime(power ? 0.008 + p * 0.01 : 0, now(), 0.08);
      humNodes.dg.gain.setTargetAtTime(Math.max(0, p - 0.3) * 0.09, now(), 0.4);
    },
    spark() { for (let i = 0; i < 4; i++) burst(0.04, 3500, 'highpass', 0.35, i * 0.07 + Math.random() * 0.03); tone(60, 0.35, 'sawtooth', 0.09, 0, 30); },
    powerOn() { burst(0.25, 120, 'lowpass', 0.8, 0, true); tone(50, 0.9, 'sawtooth', 0.05, 0, 100); [0.35, 0.5, 0.62, 0.9].forEach(t => burst(0.03, 2600, 'bandpass', 0.2, t)); },
    screw() { burst(0.05, 2200, 'bandpass', 0.16); tone(380, 0.06, 'square', 0.025, 0.03); },
    plug() { burst(0.03, 2500, 'bandpass', 0.25); tone(820, 0.05, 'square', 0.03, 0.02); burst(0.4, 1800, 'bandpass', 0.05, 0.05); },
    busy() { for (let i = 0; i < 4; i++) tone(425, 0.35, 'sine', 0.06, i * 0.7); },
    punch() { burst(0.12, 220, 'lowpass', 0.7, 0, true); tone(180, 0.08, 'square', 0.08); burst(0.02, 3000, 'bandpass', 0.2, 0.12); tone(1568, 0.5, 'sine', 0.05, 0.18); },
    bell() { tone(2093, 1.6, 'sine', 0.12); tone(3140, 1.0, 'sine', 0.05); tone(4186, 0.6, 'sine', 0.03); },
    buzz() { tone(150, 0.4, 'square', 0.05); tone(153, 0.4, 'square', 0.05); },
    ding() { tone(1318, 0.9, 'sine', 0.08); tone(1046, 1.2, 'sine', 0.08, 0.25); },
    motor(on) {
      if (!ctx) return;
      if (on && !motorNode) {
        const o = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
        o.type = 'sawtooth'; o.frequency.value = 52; lp.type = 'lowpass'; lp.frequency.value = 260; g.gain.value = 0;
        o.connect(lp).connect(g).connect(master); o.start(); g.gain.setTargetAtTime(0.07, now(), 0.4); motorNode = { o, g };
      } else if (!on && motorNode) { const m = motorNode; motorNode = null; m.g.gain.setTargetAtTime(0, now(), 0.15); setTimeout(() => m.o.stop(), 900); }
    },
    doors() { burst(1.1, 600, 'bandpass', 0.1); tone(90, 1.0, 'triangle', 0.05, 0, 70); },
    blackout() { burst(0.6, 90, 'lowpass', 0.9, 0, true); tone(55, 1.6, 'sawtooth', 0.07, 0, 30); burst(1.4, 500, 'bandpass', 0.06, 0.4, true); },
    knock() { [0, 0.2, 0.4].forEach(t => { burst(0.06, 260, 'lowpass', 0.6, t, true); tone(95, 0.08, 'sine', 0.12, t); }); },
    rattle() { for (let i = 0; i < 8; i++) burst(0.03, 1900, 'bandpass', 0.16, i * 0.11 + Math.random() * 0.04); },
    breath() { burst(1.6, 700, 'bandpass', 0.07, 0, true); },
    shutter() { burst(0.02, 3200, 'bandpass', 0.35); burst(0.03, 1600, 'bandpass', 0.25, 0.09); tone(2600, 0.7, 'sine', 0.02, 0.15, 6000); },
    echoClick() { tone(1400, 0.03, 'square', 0.03, 1); },
  };
})();
