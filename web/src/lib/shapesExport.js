// Per-shape detail export — MEASURED quantities only: no condition multiplier,
// no waste (those are condition-level report adjustments; see totals.js).
// Deduct rows carry NEGATIVE area SF so a column sum reconciles with the
// condition's floor SF. The LF column on floor_area / deduct / surface_area
// rows is the traced perimeter or run — a REFERENCE figure (floor perimeters
// include door openings and shared walls), never counted in the condition's
// LF total; only linear rows sum to it.

import { csvEsc as esc } from "./csv.js";
import { linearVerticalFt } from "./shapeMetrics.js";
import { M_PER_FT, M2_PER_SF } from "./units";
import { round2 } from "./num.js";

export function shapesDetail(conditions, shapes, sheetLabel) {
  const byId = new Map(conditions.map((c) => [c.id, c]));
  return shapes.map((s) => {
    const cond = byId.get(s.condition_id);
    const cp = s.computed || {};
    const role = s.measure_role;
    let area_sf = 0, lf = 0, ea = 0;
    switch (role) {
      case "deduct": area_sf = -(cp.area_sf || 0); lf = cp.perimeter_lf || 0; break;
      case "floor_area":
      case "surface_area":
      case "linear": area_sf = cp.area_sf || 0; lf = cp.perimeter_lf || 0; break;
      case "count": ea = cp.count || 1; break;
      default: break;
    }
    return {
      shape_id: s.id,
      sheet_id: s.sheet_id,
      sheet: sheetLabel ? sheetLabel(s.sheet_id) : s.sheet_id,
      finish: cond?.finish_tag ?? "",
      role,
      area_sf, lf, ea,
      // recomputeShape's height semantics, mirrored: an explicit override wins
      // outright (even 0); a legacy shape without its own height reports the
      // condition height its wall SF was actually computed against.
      height_ft: s.height_override === true
        ? Number(s.height_ft) || 0
        : Number(s.height_ft) || Number(cond?.height_ft) || 0,
      height_override: s.height_override === true,
      // #441 — a linear run's LF above is the TOTAL; these split out what of it
      // is vertical so a column reader can see the plan trace and the legs.
      // Non-linear rows carry 0 (a wall's height is height_ft, not a leg).
      rise_ft: role === "linear" ? linearVerticalFt(s, cond).rise : 0,
      drop_ft: role === "linear" ? linearVerticalFt(s, cond).drop : 0,
      origin: s.origin?.method || "untracked",
    };
  });
}

export function shapesToCsv(rows, projectName = "", brandName = "Ingelmec Takeoff", units = "imperial") {
  const M = units === "metric";
  const areaUnit = M ? "m2" : "SF";
  const lengthUnit = M ? "m" : "LF";
  const heightUnit = M ? "m" : "ft";
  const A = (v) => (M ? round2((Number(v) || 0) * M2_PER_SF) : v);
  const L = (v) => (M ? round2((Number(v) || 0) * M_PER_FT) : v);
  const header = ["Figura", "Hoja", "ID de hoja", "Acabado", "Rol", `Área ${areaUnit}`, lengthUnit, "UND", `Altura ${heightUnit}`, "Altura propia", `Subida ${heightUnit}`, `Bajada ${heightUnit}`, "Origen"];
  const lines = [
    "# Cantidades medidas por figura: sin multiplicador ni desperdicio; las deducciones son negativas; LF en filas de piso, deducción y superficie es solo referencia del trazo (incluye vanos); solo las filas lineales suman al LF de la condición; el LF de una fila lineal incluye su Subida + Bajada",
    header.map(esc).join(","),
  ];
  for (const r of rows) {
    lines.push([
      r.shape_id, r.sheet, r.sheet_id, r.finish, r.role,
      A(r.area_sf), L(r.lf), r.ea, L(r.height_ft),
      r.height_override ? "yes" : "",
      L(r.rise_ft), L(r.drop_ft),
      r.origin,
    ].map(esc).join(","));
  }
  const title = projectName ? `# ${projectName}, ${brandName}: figuras\n` : "";
  return title + lines.join("\n") + "\n";
}

export function shapesToJson(rows, projectName) {
  return {
    schema: "opentakeoff.shapes.v1",
    project_name: projectName || null,
    generated_with: "OpenTakeoff",
    shapes: rows,
  };
}
