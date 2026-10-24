/* =====================================================================
   [9] ARRANQUE: portada, «Continuar» (cap. 2 guardado) y API de prueba.
   ===================================================================== */
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
// Cap. 2 desde la portada: con la partida guardada o, con ?cap=2 y sin partida, con lo que se lleva del cap. 1
function continueGame() {
  Sfx.init(); $('#title').classList.remove('on'); S.started = true;
  enterCap2(Save.read() || defaultCarry());
  scheduleLightning();
}
function boot() {
  setScene(); renderInv(); renderObjectives(); bindUI();
  requestAnimationFrame(loop);
  think('Haz clic en «Aceptar misión».');
  const saved = Save.read(), cap2 = QS.get('cap') === '2';
  if (saved?.cap === 2 || cap2) {
    $('#btnCont').hidden = false;
    if (cap2) { $('#btnCont').textContent = 'EMPEZAR CAP. 2'; $('#btnCont').classList.remove('ghost'); }
  }
  $('#btnStart').onclick = startGame;
  $('#btnCont').onclick = continueGame;
  if (QS.has('shot')) { $('#title').classList.remove('on'); S.started = true; S.t0 = Date.now(); think('Huele a papel húmedo, a polvo… y a algo más.'); }
}
// API de prueba (para recorridos automáticos): __game.fast = true salta diálogos y acorta esperas
window.__game = {
  S, fast: false, CU, Presence, Save, onHot, openCloseup, closeCloseup, tryPass, turnDrum, clickItem, layout, lightning, startRinging, answerPhone, hintNow, openNotebook,
  cuHot: id => CU[S.cu].hot[id](),
  setDrums: v => { S.drums = v.slice(); if (S.cu === 'safe') renderCloseup(); },
};
boot();
