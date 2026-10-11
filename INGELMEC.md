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

## Cambios de la fase T3/T4 (2026-10-10)

- **Premium apagado** (`SIN_PREMIUM = true` en `lib/ingelmec.js`): el botón
  «Solicitar Premium» (barra compacta y galería), el ítem del menú ⋯, el diálogo
  automático tras cerrar el reporte y el render del modal quedan sin efecto. El
  módulo original (`premiumInterest.js` / `PremiumInterest.jsx`) queda intacto:
  ninguna superficie hace el POST del formulario. El rótulo del espacio en la
  barra pasa de «Espacio premium» a «Ingelmec Takeoff».
- **Segunda pasada de español** (barra compacta, galería «Juego de planos ·
  elija una o varias…», menú Editar completo, paleta de comandos, pins, sellos,
  RFI, revisiones, ayudas). Sigue en inglés lo listado arriba, más el vocabulario
  de tool MCP en la barra de estado (`TOOL_VERB`: son los NOMBRES reales de las
  herramientas del agente; traducirlos mentiría).
- **Sello Aprobado sobre tarjetas y con nombre** (`placeApproval` en
  `TakeoffCanvas.jsx`, marcado `INGELMEC (T4)`): además de sellar una forma, el
  sello humano ahora puede sellar un **markup** (la tarjeta de una guarda del
  motor — se registra `markup_id`) y guarda el **nombre declarado** del autor
  (`by`, el mismo modelo de autodeclaración que `git user.name`). Ambos campos
  son aditivos: pasan intactos por `sanitizeApprovals`, el export/import y el
  PDF marcado. `firmas_desde_takeoff` (motor dxf-takeoff) es el consumidor.

## Limpieza «sin externos» (2026-10-11)

Objetivo: ninguna superficie saca a la persona del sitio, ni hay logos del original,
ni enlaces de pago, ni peticiones a terceros. Todo detrás de `SIN_EXTERNOS = true`
(`web/src/lib/ingelmec.js`); poner `false` y recompilar devuelve el comportamiento
del original (salvo los archivos borrados, que se recuperan con `git checkout`).

| Archivo | Qué cambió |
|---|---|
| `web/src/lib/ingelmec.js` | `SIN_EXTERNOS` e `INGELMEC_ATRIBUCION` (texto de crédito Apache-2.0). |
| `web/src/components/IngelmecAbout.jsx` | **NUEVO.** «Acerca de y licencias»: crédito en texto plano; único enlace a `/licencias.html` (local). |
| `web/public/licencias.html` | **NUEVO.** Generada por `web/scripts/ingelmec-licencias.mjs` desde `LICENSE`, `NOTICE` y `THIRD-PARTY-NOTICES.md`; sin enlaces externos. |
| `web/src/pages/TakeoffCanvas.jsx` | «Conectar su IA» fuera de menús/paleta/galería/guía/tour; «Acerca de y licencias» en Ayuda, menú ⋯ y paleta; «Disposición premium» pasa a «Disposición compacta». |
| `web/src/components/PlanNavigator.jsx` | Sin video de demostración del original (mostraba su marca y su botón premium); el enlace a Kentucky AI pasa a texto plano «Basado en OpenTakeoff · Apache-2.0 · modificado por Ingelmec». |
| `web/src/components/UserGuide.jsx` | Sin enlaces a la guía del original ni a `/privacy` y `/terms`; un enlace a `/licencias.html`. |
| `web/src/components/FirstTakeoffTour.jsx` | El cierre del tour no ofrece «Connect your AI» si no hay `onConnect`. |
| `web/src/components/ReportPanel.jsx` | Botón «Contribuir» (envío de datos al modelo abierto del original) oculto. El crédito «Measured with OpenTakeoff» se conserva como texto plano. |
| `web/src/lib/google/auth.js`, `web/src/lib/msgraph/config.js` | Inicio de sesión de Google y de Microsoft 365 apagados (sin `accounts.google.com`, sin `login.microsoftonline.com`). |
| `web/src/styles/tokens.css`, `web/src/styles/ingelmec-fonts.js`, `web/src/main.jsx` | Se quita el `@import` de Google Fonts; tipografías autoalojadas con `@fontsource/*` (subconjunto latino). Dependencias nuevas en `web/package.json`. |
| `web/src/components/workspaceChrome.css` | `.calm-brand` con color propio (la marca del encabezado era azul oscuro sobre fondo oscuro). |
| `web/index.html` | Sin enlaces a GitHub en la página estática; `noindex`. |
| `web/public/_headers` | CSP cerrada a `'self'` (sin Google, Cloudflare ni fuentes externas). Caddy emite la misma política en producción. |
| `web/public/robots.txt` | `Disallow: /` (herramienta interna). |
| `NOTICE` | Aviso de modificaciones al día. |
| **Borrados** | `web/public/privacy/`, `terms/`, `legal.css`, `llms.txt`, `sitemap.xml`, `.well-known/mcp.json`, `googlec4381fb3b0fbe628.html`, `og-card.png`, `demo/first-takeoff.mp4`, `demo/first-takeoff-poster.jpg`, `web/test/llmsTxt.test.ts` (activos y prueba del sitio del original). |

Los nombres internos que dicen `opentakeoff` (claves de localStorage, esquemas
`opentakeoff.profile.v1`, `application/x-opentakeoff-condition`, comentarios) NO se
tocan: son identificadores técnicos que no se ven y cambiarlos rompería perfiles y
exportaciones ya guardados.

Pruebas: el repo ya traía 43 fallas de pruebas doradas desde T1 (encabezados al
español en `reportColumns`, `branding`, CSV/Excel); esta limpieza no agrega ninguna.
