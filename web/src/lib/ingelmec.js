// Marca y valores por omisión de INGELMEC TAKEOFF (fork de OpenTakeoff).
//
// TODO lo nuestro vive en este módulo para mantener la divergencia mínima
// frente al original (ver INGELMEC.md): el resto de la app solo importa
// constantes de aquí. El original queda intacto y atribuido (Apache-2.0):
// OT_NAME/OT_CREDIT en lib/branding.js siguen nombrando a OpenTakeoff como
// proyecto madre.
//
// Reglas de marca Ingelmec: Inter en títulos, Open Sans en cuerpo, NUNCA
// Montserrat. Colores del cintillo: #003B5C, #1F6FB2, #00A7B5, #7AB648,
// #B5D334, #F0A500.

export const INGELMEC_NAME = (typeof import.meta !== "undefined" && import.meta.env?.VITE_BRAND_NAME) || "Ingelmec Takeoff";
// Imagotipo horizontal fondo blanco (OneDrive MERCADEO/Ingelmec), incrustado
// como dataURL: lo consumen <img> del masthead Y pdf-lib (embedPng) en el
// juego marcado, y un string base64 es lo único que sirve en ambos.
export const INGELMEC_LOGO = "data:image/png;base64,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";
export const INGELMEC_COLORS = ["#003B5C", "#1F6FB2", "#00A7B5", "#7AB648", "#B5D334", "#F0A500"];

// SIN PREMIUM: el llamado a servicios de pago del original (formulario
// «premium-interest» por POST a Netlify, botón «Solicitar Premium», diálogo
// automático tras cerrar el reporte) queda APAGADO en el fork Ingelmec:
// ninguna superficie de la app abre ese flujo. El módulo del original
// (premiumInterest.js / PremiumInterest.jsx) queda intacto y sin efectos.
export const SIN_PREMIUM = true;

// SIN EXTERNOS (limpieza 2026-10-11): ninguna superficie de la app saca a la
// persona del sitio ni habla con terceros. Con la bandera encendida: sin enlaces
// a Kentucky AI / GitHub / documentación del original, sin «Conecte su IA»
// (descargas de GitHub y nodejs.org), sin «Contribuir» (envío de datos al modelo
// abierto del original), sin video de demostración del original, sin inicio de
// sesión de Google ni de Microsoft 365, y las tipografías se sirven desde el
// propio sitio (sin Google Fonts). El crédito exigido por Apache-2.0 vive en
// «Ayuda > Acerca de y licencias» como texto plano y en /licencias.html.
export const SIN_EXTERNOS = true;

export const INGELMEC_ATRIBUCION = [
  "Ingelmec Takeoff es una versión modificada de OpenTakeoff, software libre publicado bajo la licencia Apache 2.0.",
  "Proyecto original: OpenTakeoff, de Kentucky AI. Copyright de los autores originales.",
  "Esta versión fue modificada por Ingelmec: traducción al español, unidades métricas, marca, condiciones por disciplina y retiro de enlaces y servicios externos.",
  "El software se entrega «tal cual», sin garantías de ningún tipo (ver licencia).",
].join("\n");

// Preventa: por omisión el reporte y las exportaciones NO muestran la lista
// de compras con costos (la web no calcula precios monetarios; el BOM con
// precios vive en los motores de Ingelmec). Un toggle en el Reporte la vuelve
// a mostrar cuando se trabaja en etapa de ejecución.
export const PREVENTA_DEFAULT = true;

// Juego de condiciones por omisión para PREVENTA INGELMEC — una por disciplina,
// con las áreas de riesgo de NFPA 13 primero. Los acabados de piso del original
// (FLOORING_DEFAULTS en canvasConstants.js) siguen disponibles en la librería de
// plantillas; solo dejan de ser el juego sembrado.
// Formato TEMPLATE (igual que FLOORING_DEFAULTS): sin ids — instantiateTemplate
// los acuña (canvasUtil.js). Sin materiales sembrados: en preventa no se venden
// insumos de piso.
export const INGELMEC_DEFAULTS = [
  // ── Áreas de riesgo NFPA 13 (protección contra incendio) ──
  { finish_tag: "RL-1",  color: "#c2410c", hatch: "diagdense", waste_pct: 0 },  // Riesgo ligero (Light hazard)
  { finish_tag: "RO1-1", color: "#b91c1c", hatch: "diag",     waste_pct: 0 },  // Riesgo ordinario grupo 1 (Ordinary hazard 1)
  { finish_tag: "RO2-1", color: "#7f1d1d", hatch: "cross",    waste_pct: 0 },  // Riesgo ordinario grupo 2 (Ordinary hazard 2)
  { finish_tag: "RE-1",  color: "#581c87", hatch: "honeycomb", waste_pct: 0 }, // Riesgo extra (Extra hazard)
  { finish_tag: "RAL-1", color: "#3f3f46", hatch: "basket",   waste_pct: 0 },  // Almacenamiento (Storage)
  // ── HVAC ──
  { finish_tag: "HVAC-1", color: "#0e7490", hatch: "wave",    waste_pct: 0 },  // Recinto HVAC (sala de máquinas, cuartos técnicos)
  // ── Eléctrico ──
  { finish_tag: "ELC-1", color: "#a16207", hatch: "plus",     waste_pct: 0 },  // Zona eléctrica (tableros, cuartos eléctricos)
  // ── Datos / bajo voltaje ──
  { finish_tag: "DAT-1", color: "#1d4ed8", hatch: "grid",     waste_pct: 0 },  // Área de cableado (zonas de work area TIA-568)
  { finish_tag: "CCTV-1", color: "#065f46", hatch: "scan",    waste_pct: 0 },  // Zona CCTV (cobertura de videovigilancia)
];
