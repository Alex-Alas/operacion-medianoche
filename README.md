# Operación Medianoche

Demo jugable de aventura de investigación en primera persona (point-and-click), en un único `index.html`: HTML + CSS + JavaScript puro, sin dependencias. Todo el arte es SVG generado por código y todo el sonido se sintetiza con WebAudio.

**Jugar:** https://alex-alas.github.io/operacion-medianoche/

## Cómo se juega
- Clic sobre los objetos de la oficina; los objetos del inventario se seleccionan y se usan sobre la escena.
- Tres pistas (luna, ojo, ancla) dan la combinación de la caja fuerte. La placa de la caja marca el orden.
- `N` libreta, `M` sonido, `Esc` volver. Botón «Pensar» da una pista según el avance.

## Decisiones de estilo (para la próxima sesión)
- Tinta y papel, noir inquietante. Tinta violeta casi negra `#150e1b`, sombras hacia violeta, luz de luna fría desde la ventana (arriba a la izquierda), acentos reservados: rojo neón, verde CRT, violeta UV.
- Entintador SVG: contorno global antes del relleno, sombra en medialuna (pieza corrida hacia la luz), rayado desde el borde oscuro, filo de luz. Bordes con `rough()`.
- Línea viva: cada capa se hornea en 3 variantes con desplazamiento de ruido, se pasan a bitmap una vez y se alternan a ~6 fps. `?noboil` la desactiva; `?flat` muestra solo colores planos.
- La escena va en 4 SVG apilados (fondo, cuarto, luces en `screen`, interacción) para que lo animado no repinte lo demás.

## Lo más fácil de calibrar
- Paleta: objeto `M` (materiales) en el bloque `s-core`.
- Amplitud de la línea viva: `boilFilter(i, a)` y el intervalo de `boilTick` (165 ms).
- Combinación: `ANSWER` en `s-game`.
