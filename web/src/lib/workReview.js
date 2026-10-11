// Read-only presentation of stored measurement receipts. These labels are not
// verification or authentication; missing attribution stays unknown.
export function workActor(shape) {
  const origin = shape.origin || {};
  if (origin.actor === "agent" || origin.method === "agent_v1") return "Agente";
  if (origin.actor === "rule" || origin.method === "rule_v1") return "Regla";
  if (origin.actor === "canvas" || origin.actor === "human") return "Lienzo";
  return shape.author ? "Autor con nombre" : "Sin registrar";
}

export function workReviewState(shape) {
  if (shape.origin?.reviewed === false) return "Por revisar";
  if (shape.origin?.reviewed === true) return "Revisado";
  return "Registrado";
}

export function workMethod(shape) {
  const names = { manual: "Geometría explícita", agent_v1: "Propuesta del agente", rule_v1: "Regla de corrección", one_click_v1: "Detección de recintos", net_v1: "Detección de recintos", derived: "Medición derivada" };
  return names[shape.origin?.method] || shape.origin?.method || "Sin registrar";
}

export function workQuantity(shape) {
  const c = shape.computed || {};
  const kind = shape.measure_role === "count" ? "count" : shape.measure_role === "linear" ? "length" : "area";
  const value = kind === "count" ? c.count : kind === "length" ? c.perimeter_lf : c.area_sf;
  return { kind, value: Number.isFinite(value) ? value : null, deduct: shape.measure_role === "deduct" };
}

export function filterWork(shapes, { filter = "all", query = "", conditionLabel = () => "", sheetLabel = () => "" } = {}) {
  const term = query.trim().toLocaleLowerCase();
  return shapes.filter((shape) => {
    if (filter === "pending" && workReviewState(shape) !== "Por revisar") return false;
    if (filter === "agent" && workActor(shape) !== "Agente") return false;
    return !term || [shape.id, shape.label, shape.author, conditionLabel(shape.condition_id), sheetLabel(shape.sheet_id)]
      .some((value) => String(value || "").toLocaleLowerCase().includes(term));
  });
}
