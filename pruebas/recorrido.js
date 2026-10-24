// Recorrido automático del juego con Playwright (sin servidor: abre index.html con file://).
// Uso: node pruebas/recorrido.js [cap1|cap2|todo] [--shots carpeta]
const { chromium } = require('playwright');
const path = require('path');

const modo = process.argv[2] || 'todo';
const si = process.argv.indexOf('--shots');
const shots = si > 0 ? process.argv[si + 1] : null;
const url = 'file://' + path.resolve(__dirname, '..', 'index.html');
const espera = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errores = [];
  page.on('pageerror', e => errores.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errores.push('console: ' + m.text()); });
  let n = 0;
  const foto = async nombre => { if (shots) await page.screenshot({ path: path.join(shots, `${String(++n).padStart(2, '0')}-${nombre}.png`) }); };
  const g = (code, arg) => page.evaluate(code, arg);
  const paso = async (nombre, fn) => { await fn(); await espera(120); };

  await page.goto(url + (modo === 'cap2' ? '?cap=2' : ''));
  await page.waitForFunction(() => window.__game);
  await g(() => { window.__game.fast = true; });

  if (modo !== 'cap2') {
    await page.click('#btnStart'); await espera(300); await foto('cap1-inicio');
    await paso('escritorio', () => g(() => { const G = __game; G.onHot('escritorio'); G.cuHot('cajon'); G.cuHot('cajon'); G.cuHot('linterna'); G.cuHot('calendario'); G.cuHot('foto'); G.cuHot('foto'); }));
    await foto('cap1-escritorio');
    await paso('cuadro', () => g(() => { const G = __game; G.closeCloseup(); G.onHot('cuadro'); G.onHot('cuadro'); }));
    await espera(900);
    await paso('archivador', () => g(() => { const G = __game; G.clickItem('llave'); G.onHot('archivador'); }));
    await espera(900);
    await paso('hoja', () => g(() => { const G = __game; G.cuHot('hoja'); G.closeCloseup(); G.onHot('computadora'); G.cuHot('power'); }));
    await espera(400);
    await paso('clave', () => g(() => { __game.tryPass('tango'); }));
    await foto('cap1-pc');
    await paso('uv', () => g(() => { const G = __game; G.closeCloseup(); G.clickItem('uv'); G.onHot('cuadro'); G.clickItem('uv'); }));
    await paso('caja', () => g(() => { const G = __game; G.onHot('caja'); G.setDrums([14, 23, 31]); G.cuHot('manija'); }));
    await espera(700); await foto('cap1-caja');
    await paso('botin', () => g(() => { const G = __game; G.cuHot('expediente'); G.cuHot('polaroid'); }));
    await page.click('#cuHtml > div'); await espera(5200);
    const s1 = await g(() => ({ clues: __game.S.clues, doc: __game.S.f.docTaken, ended: __game.S.ended, ch1Done: !!__game.S.f.ch1Done, cap: __game.S.cap }));
    console.log('cap1 →', JSON.stringify(s1));
    await foto('cap1-fin');
  }
  if (modo === 'todo' || modo === 'cap2') await require('./recorrido-cap2.js')({ page, g, foto, espera, modo });
  const fin = await g(() => ({ ended: __game.S.ended, ending: document.querySelector('#ending').classList.contains('on') }));
  console.log('final →', JSON.stringify(fin));
  await foto('informe');
  console.log(errores.length ? 'ERRORES:\n' + errores.join('\n') : 'Sin errores en consola.');
  await browser.close();
  process.exit(errores.length ? 1 : 0);
})();
