# INGELMEC TAKEOFF — notas del fork

Fork de [Kentucky-ai/opentakeoff](https://github.com/Kentucky-ai/opentakeoff) (Apache-2.0)
mantenido por Ingelmec. La interfaz y los valores por omisión están adaptados a la
preventa de Ingelmec: español, métrico, marca Ingelmec, condiciones por disciplina y
sin lista de compras en preventa.

## Traer los cambios del original

El original avanza casi a diario. Para actualizar:

```bash
git remote add upstream https://github.com/Kentucky-ai/opentakeoff.git   # una sola vez
git fetch upstream
git merge upstream/main          # o rebase si se prefiere historia lineal
npm install --prefix web && npm run check --prefix web   # typecheck + lint + tests + build
```

Regla del fork: **mínima divergencia**. Todo lo nuestro vive en módulos aparte
(`web/src/lib/ingelmec.js` y `web/src/lib/ingelmecConditions` vía `lib/ingelmec.js`)
o en cambios puntuales marcados con comentarios `INGELMEC`. Al fusionar, los
conflictos deben quedar solo en los archivos de esta lista.

## Archivos tocados por el fork (a 2026-10-10, fase T1)

| Archivo | Qué cambió |
|---|---|
| `web/src/lib/ingelmec.js` | **NUEVO.** Marca (nombre, logo dataURL, colores), condiciones por disciplina por omisión y bandera `PREVENTA_DEFAULT`. |
| `web/src/lib/canvasUtil.js` | El espacio nuevo se siembra con el juego Ingelmec (antes: acabados de piso). |
| `web/src/lib/canvasConstants.js` | Etiquetas de herramientas al español. |
| `web/src/lib/reportColumns.js` | Encabezados de columnas del reporte al español (los tokens SF/LF se conservan: `applyUnits` los cambia a m²/m en métrico). |
| `web/src/lib/branding.js` | El entregable presenta «Ingelmec Takeoff» (logo + nombre) por omisión; el crédito a OpenTakeoff se conserva siempre. |
| `web/src/pages/TakeoffCanvas.jsx` | Unidades métricas por omisión; textos de barras/menús/escala al español. |
| `web/src/components/ReportPanel.jsx` | Gate preventa (oculta la lista de compras en reporte y exportaciones), botón Preventa, masthead y textos al español. |
| `web/src/components/TakeoffsPanel.jsx` | Textos del panel de condiciones al español. |
| `web/src/components/PlanNavigator.jsx` | Textos de la galería al español. |
| `web/src/components/WorkspacePanel.jsx`, `WorkspaceChrome.jsx` | Textos del panel de trabajo y del chrome premium al español. |
| `web/src/styles/tokens.css` | Inter (títulos) y Open Sans (cuerpo). Nunca Montserrat. |
| `web/index.html` | Español, marca Ingelmec, sin beacon de Cloudflare ni formulario Netlify. |
| `web/public/favicon.svg`, `web/public/ingelmec-logo.png` | Marca Ingelmec. |
| `NOTICE` | Aviso de modificaciones de Ingelmec. |
| `firstTakeoff.js` | Selector del tour apunta a `aria-label="Área"`. |

Los acabados de piso del original (`FLOORING_DEFAULTS` en `canvasConstants.js`)
siguen disponibles desde la pestaña Plantillas del panel de Mediciones.

## Qué queda en inglés (fase T1)

- **Prefijo de error `Couldn't …`** en la barra de estado: es una convención
  funcional (la prueba de mensajes de peligro `isDangerMsg` en `canvasUtil.js`
  hace `startsWith("Couldn't")`). Traducirlo exige tocar la convención completa.
- **Tooltips profundos** de funciones de acabados de piso (roll goods, seam LF,
  presets de adhesivos) y de las opciones avanzadas de símbolos/OCR.
- **La guía en la app** (`UserGuide.jsx`) y el tour guiado (`FirstTakeoffTour.jsx`).
- **Textos del agente en el lienzo** (`AgentPanel`, `ConnectAI`, `AiSettings`) y
  los mensajes del motor de voz (`voiceIntent`), salvo los rótulos principales.
- **MCP** (`mcp/`): las respuestas de las herramientas siguen en inglés (es la
  superficie del agente, no la de la persona).

## Marca

- Logo: imagotipo horizontal fondo blanco (`web/public/ingelmec-logo.png`,
  incrustado también como dataURL en `lib/ingelmec.js` para el PDF).
- Tipografías: **Inter** (títulos) y **Open Sans** (cuerpo). Nunca Montserrat.
- Crédito obligatorio a OpenTakeoff en los entregables («Measured with
  OpenTakeoff») — requerido por la licencia Apache-2.0 del proyecto original.
