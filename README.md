# Operación Medianoche

Aventura de investigación en primera persona (point-and-click), en dos capítulos. HTML + CSS + JavaScript puro, sin dependencias ni build. Todo el arte es SVG generado por código y todo el sonido se sintetiza con WebAudio.

**Jugar:** https://alex-alas.github.io/operacion-medianoche/

## Cómo se juega
- Clic sobre los objetos; los objetos del inventario se seleccionan y se usan sobre la escena o sobre los primeros planos.
- **Cap. 1 · La oficina:** tres pistas (luna, ojo, ancla) dan la combinación de la caja fuerte. La placa de la caja marca el orden. Con el expediente en la mano, se sale por la puerta.
- **Cap. 2 · La recepción:** hay que salir del 3.er piso por el ascensor de servicio. Ojo con lo que hay detrás del vidrio de la oficina: los errores, quedarse quieto y pensar lo acercan.
- `N` libreta, `M` sonido, `Esc` volver. El botón «Pensar» da una pista según el avance; en el cap. 2 es escalonado y tiene costo.
- Al llegar al cap. 2 la partida se guarda en el navegador y la portada ofrece «Continuar». `?cap=2` empieza directo en el cap. 2.

## Archivos
Scripts clásicos (no módulos), cargados en este orden por `index.html`; comparten el ámbito global, así que el juego se abre igual con doble clic.

| Archivo | Qué tiene |
| --- | --- |
| `css/style.css` | Todo el estilo. |
| `js/core.js` | Utilidades, trazos a mano, materiales (`M`), el entintador y la línea viva. |
| `js/escena-oficina.js` | Arte de la oficina (cap. 1). |
| `js/primeros-planos.js` | Primeros planos de la oficina, retratos e íconos. |
| `js/audio.js` | Sonido (`Sfx`). |
| `js/juego.js` | Motor: estado `S`, pensamientos, inventario, objetivos, diálogos, libreta, primeros planos, encuadre, entrada, guardado e informe. Cada capítulo se registra en `CAPS`. |
| `js/cap1.js` | Lógica del cap. 1 y el enlace con el cap. 2. |
| `js/escena-recepcion.js` | Arte de la recepción (cap. 2) y sus zonas de clic. |
| `js/primeros-planos-recepcion.js` | Primeros planos del cap. 2, la tarjeta, el expediente, la calle e íconos. |
| `js/presencia.js` | La presencia tras el vidrio y los apagones. |
| `js/cap2.js` | Lógica del cap. 2: puzzles, centralita, clímax, final. |
| `js/main.js` | Arranque, «Continuar» y la API de prueba `window.__game`. |
| `pruebas/` | Recorridos automáticos con Playwright. |

## Decisiones de estilo (para la próxima sesión)
- Tinta y papel, noir inquietante. Tinta violeta casi negra `#150e1b`, sombras hacia violeta, luz de luna fría desde la ventana (arriba a la izquierda), acentos reservados: rojo neón, verde CRT, violeta UV.
- Entintador SVG: contorno global antes del relleno, sombra en medialuna (pieza corrida hacia la luz), rayado desde el borde oscuro, filo de luz. Bordes con `rough()`.
- Línea viva: cada capa se hornea en 3 variantes con desplazamiento de ruido, se pasan a bitmap una vez y se alternan a ~6 fps. `?noboil` la desactiva; `?flat` muestra solo colores planos.
- La escena va en 4 SVG apilados (fondo, medio, luces en `screen`, interacción) para que lo animado no repinte lo demás.
- La recepción usa la misma técnica, con punto de fuga en 815,380, pared en azul pizarra y una penumbra (`#dark`) que se aclara cuando vuelve la corriente.

## Notas de diseño (spoilers)
- **La verdad (no revelada):** el edificio repite la noche. Quien llegó antes eras tú en otra vuelta. El cap. 2 lo insinúa fuerte (tarjeta n.º 13: 37 entradas a las 23:47, una cada 14 de octubre, ninguna salida) y deja el gancho del cap. 3 (el flash en la ventana y «una entrada nueva, a las 23:47»).
- **Cap. 2:** primero la corriente (abrecartas → 4 tornillos → fusible de 20 A, corregido en tinta UV; el de 10 A es la pista falsa). Después, en cualquier orden: la llave (centralita → ext. 14 → candado `FARO`; «ALBA» es la pista falsa) y marcar salida (turnos + día del cierre → Ibáñez, por el cambio de Méndez).
- Polilla no tiene género en los textos.
- Si falta tiempo, lo primero que se recorta son las rarezas.

## Lo más fácil de calibrar
- Paleta: objeto `M` en `js/core.js` (y `M2` para la recepción en `js/escena-recepcion.js`).
- Amplitud de la línea viva: `boilFilter(i, a)` y el intervalo de `boilTick` (165 ms), en `js/core.js`.
- Combinación del cap. 1: `ANSWER` en `js/cap1.js`. Soluciones del cap. 2: `SECRET`, `CLOSER` y `FUSE_OK` en `js/cap2.js`.
- La presencia: `RATE` e `IDLE_MS` en `js/presencia.js` (pensado para 1 o 2 apagones por partida).

## Pruebas
Con Playwright instalado:

```
node pruebas/recorrido.js todo            # cap. 1 → cap. 2 → informe
node pruebas/recorrido.js cap2 --shots /tmp/capturas
```
