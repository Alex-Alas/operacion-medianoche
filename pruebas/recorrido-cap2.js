// Recorrido del cap. 2 (lo llama recorrido.js). Usa la API de prueba window.__game.
module.exports = async ({ page, g, foto, espera, modo }) => {
  const ok = (cond, msg) => { if (!cond) throw new Error('FALLA: ' + msg); console.log('  ✓ ' + msg); };
  if (modo === 'cap2') { await page.click('#btnCont'); }
  else { await g(() => __game.onHot('puerta')); }
  await espera(2500);
  let st = await g(() => ({ cap: __game.S.cap, live: __game.S.c2.live, items: __game.S.items }));
  ok(st.cap === 2 && st.live, 'entra al cap. 2 con ' + st.items.join(', '));
  await foto('cap2-recepcion');

  // Rarezas de la escena
  await g(() => { const G = __game; G.onHot('reloj'); G.onHot('escalera'); G.onHot('escalera'); G.onHot('paraguas'); G.onHot('paraguas'); G.onHot('afiche'); });

  // Mostrador: cajón, abrecartas, turnos, visitas y la firma
  await g(() => { const G = __game; G.onHot('mostrador'); G.cuHot('cajon'); G.cuHot('abrecartas'); G.cuHot('turnos'); G.cuHot('visitas'); G.cuHot('firma'); G.cuHot('timbre'); });
  await espera(300); await foto('cap2-mostrador');
  ok(await g(() => __game.S.items.includes('abrecartas')), 'toma el abrecartas');

  // Apagón forzado: algo se mueve y hay que recuperarlo
  await g(() => { __game.closeCloseup(); __game.Presence.p = 1; });
  await espera(1500);
  const h = await g(() => __game.S.c2.hidden);
  ok(h && h.k, `apagón: se movió «${h && h.k}» a ${h && h.spot}`);
  await foto('cap2-tras-apagon');
  await g(sp => __game.onHot(sp), h.spot);
  ok(await g(k => __game.S.items.includes(k), h.k), 'recupera el objeto movido');

  // Tablero: tornillos con el abrecartas, UV sobre la etiqueta, fusible equivocado y el bueno
  await g(() => { const G = __game; G.onHot('fusibles'); G.clickItem('abrecartas'); [0, 1, 2, 3].forEach(i => G.cuHot('tornillo' + i)); });
  ok(await g(() => __game.S.c2.lidOpen), 'abre la tapa del tablero');
  await g(() => { __game.clickItem('uv'); });
  const r = await page.evaluate(() => { const b = document.querySelector('#cuSvg').getBoundingClientRect(); return { x: b.left + b.width * 600 / 1600, y: b.top + b.height * 610 / 900 }; });
  await page.mouse.move(r.x, r.y); await espera(300);
  ok(await g(() => __game.S.c2.uvSeen), 'la linterna UV revela la corrección de Ferraz');
  await foto('cap2-fusibles-uv');
  await g(() => { const G = __game; G.clickItem('uv'); G.cuHot('f10'); G.cuHot('palanca'); });
  ok(await g(() => __game.S.c2.err.fus === 1 && !__game.S.c2.power), 'el fusible de 10 A se quema');
  await g(() => { const G = __game; G.cuHot('f20'); G.cuHot('palanca'); });
  ok(await g(() => __game.S.c2.power), 'el de 20 A devuelve la corriente');
  await espera(300); await foto('cap2-fusibles-on');
  await g(() => __game.closeCloseup()); await espera(400); await foto('cap2-recepcion-luz');

  // Centralita: ALBA (trampa), el conserje y la 13
  await g(() => { __game.onHot('centralita'); __game.cuHot('j12'); }); await espera(900);
  await g(() => __game.cuHot('j14')); await espera(900);
  await foto('cap2-centralita');
  await g(() => __game.cuHot('j13')); await espera(2600);
  ok(await g(() => __game.S.c2.heard[14] && __game.S.odd.has('eco')), 'oye al conserje y la extensión 13');

  // Casilleros: candado de letras (ALBA falla, FARO abre)
  await g(() => { __game.closeCloseup(); __game.onHot('casilleros'); __game.S.c2.letters = [0, 11, 1, 0]; __game.CU.casilleros.render(); });
  await foto('cap2-casilleros');
  await page.click('.unlock');
  await g(() => { __game.S.c2.letters = [5, 0, 17, 14]; __game.CU.casilleros.render(); });
  await page.click('.unlock');
  ok(await g(() => __game.S.c2.lockOpen && __game.S.c2.err.cand === 1), 'FARO abre el candado (tras un intento fallido)');
  await g(() => __game.cuHot('llave'));
  await foto('cap2-casilleros-abierto');

  // Ascensor: la llave, y sin salida marcada no llama
  await g(() => { const G = __game; G.closeCloseup(); G.onHot('ascensor'); G.clickItem('llaveAsc'); G.cuHot('cerradura'); G.cuHot('llamar'); });
  ok(await g(() => __game.S.c2.keyIn && !__game.S.c2.calling), 'pone la llave; sin SALIDA no llama');
  await foto('cap2-ascensor');

  // Checador: Méndez rechazada, Ibáñez marca salida y aparece la tarjeta 13
  await g(() => { const G = __game; G.closeCloseup(); G.onHot('checador'); G.cuHot('t_mendez'); G.cuHot('t_ibanez'); });
  await espera(600);
  ok(await g(() => __game.S.c2.punched === 'ibanez' && __game.S.c2.mine), 'marca la salida de Ibáñez; aparece la tarjeta n.º 13');
  await foto('cap2-tarjeta');
  await page.click('.sheetOv');
  await foto('cap2-checador');

  // Expediente, libreta y pistas
  await g(() => { __game.closeCloseup(); __game.clickItem('expediente'); }); await espera(200);
  await foto('cap2-expediente');
  await page.click('.sheetOv');
  await g(() => __game.openNotebook('lineas')); await foto('cap2-libreta');
  await g(() => __game.openNotebook('notas'));
  await page.fill('#nbNotes', 'F?R? → ¿FARO?');
  ok(await g(() => __game.Save.notes() === 'F?R? → ¿FARO?'), 'las notas propias se guardan');
  await g(() => { document.querySelector('#nbClose').click(); __game.hintNow(); __game.hintNow(); });

  // Final: llamar al ascensor → clímax → la calle → informe
  await g(() => { __game.onHot('ascensor'); __game.cuHot('llamar'); });
  await espera(1200); await foto('cap2-climax');
  await page.waitForFunction(() => document.querySelector('#ending').classList.contains('on'), null, { timeout: 30000 });
  ok(true, 'llega al informe final');
};
