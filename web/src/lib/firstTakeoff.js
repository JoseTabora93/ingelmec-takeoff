// The guided first takeoff — the step logic, kept pure so the rules are tested
// apart from the canvas that renders them.
//
// Every step completes on the REAL action, never on a "Next" button: the canvas
// reports what it can see (a sheet open, its scale set, the Area tool armed, a
// new floor shape, the Report open) and advanceTour folds that into a done set.
// The set is monotonic — closing the Report or switching back to Select doesn't
// un-teach a step the person already did.

export const TOUR_STEPS = [
  {
    id: "open",
    title: "Abrir un plano",
    body: "Empiece con el ejemplo incluido: un plano real de acabados de piso de un centro médico. Sus propios PDF funcionan igual: arrástrelos al lienzo.",
  },
  {
    id: "scale",
    title: "Fijar la escala",
    body: "Toda cantidad se apoya en ella. Abra el menú Fijar escala y elija «El plano dice …, usarla»: es la escala impresa en la hoja.",
    target: '[data-tour="scale"]',
  },
  {
    id: "tool",
    title: "Armar la herramienta Área",
    body: "Presione A, o haga clic en el icono Área de la barra de herramientas a la izquierda.",
    target: 'button[aria-label="Área"]',
  },
  {
    id: "trace",
    title: "Trazar un recinto",
    body: "Use la rueda para acercar a un recinto. Haga clic en cada esquina sobre la cara interior del muro y presione ⏎ o doble clic para cerrar. Espacio+arrastrar desplaza mientras traza.",
  },
  {
    id: "report",
    title: "Abrir el Reporte",
    body: "El Reporte totaliza cada condición, suma el desperdicio y exporta a CSV o Excel.",
    target: '[data-tour="report"]',
  },
];

const ORDER = TOUR_STEPS.map((s) => s.id);

// A committed floor shape: positive area, not a cut-out.
export function countFloorShapes(shapes) {
  let n = 0;
  for (const s of shapes || []) {
    if ((s?.computed?.area_sf || 0) > 0 && s.measure_role !== "deduct") n += 1;
  }
  return n;
}

// What the canvas can see right now → which steps that proves.
//   obs = { sheetOpen, scaled, tool, floorShapes, reportOpen }
//   baseline = floor shapes that existed when the tour started
export function observedSteps(obs, baseline) {
  const traced = (obs.floorShapes || 0) > (baseline || 0);
  const seen = new Set();
  // a traced shape proves the steps before it (the tools refuse an unscaled sheet)
  if (obs.sheetOpen || traced) seen.add("open");
  if (obs.scaled || traced) seen.add("scale");
  if (obs.tool === "area" || obs.tool === "rect" || traced) seen.add("tool");
  if (traced) seen.add("trace");
  return seen;
}

// Monotonic merge. Returns the SAME array when nothing changed so a caller can
// bail out of a state update.
export function advanceTour(done, obs, baseline) {
  const prev = new Set(done || []);
  const seen = observedSteps(obs, baseline);
  // the Report only teaches something once this tour has put a number in it
  if (obs.reportOpen && (prev.has("trace") || seen.has("trace"))) seen.add("report");
  let changed = false;
  for (const id of seen) if (!prev.has(id)) { prev.add(id); changed = true; }
  return changed ? ORDER.filter((id) => prev.has(id)) : done;
}

// The first step not yet done, or null when the tour is finished.
export function currentStep(done) {
  const d = new Set(done || []);
  return TOUR_STEPS.find((s) => !d.has(s.id)) || null;
}
