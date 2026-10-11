import { useEffect, useMemo, useState } from "react";
import { filterWork, workActor, workMethod, workQuantity, workReviewState } from "../lib/workReview.js";
import { Z } from "../lib/ui.js";
import "./workspacePanel.css";

export default function WorkspacePanel({ open, shapes, conditions, selectedId, sheetLabel, fmtArea, fmtLength,
  scales, scaleUnconfirmed, running, proposalCount, onLocate, onReview, onClose, onReport, children, dockSide, width, dockHandle }) {
  const [tab, setTab] = useState("work");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(50);
  const pending = shapes.filter((s) => workReviewState(s) === "Por revisar").length;
  const rows = useMemo(() => filterWork(shapes, { filter, query,
    conditionLabel: (id) => conditions[id]?.finish_tag || "", sheetLabel }), [shapes, filter, query, conditions, sheetLabel]);
  const selected = shapes.find((s) => s.id === selectedId);
  useEffect(() => { setLimit(50); }, [filter, query]);
  const quantity = (shape) => {
    const q = workQuantity(shape);
    if (q.value === null) return "Sin medir";
    const text = q.kind === "count" ? `${q.value} UND` : q.kind === "length" ? fmtLength(q.value) : fmtArea(q.value);
    return `${q.deduct ? "−" : ""}${text}`;
  };
  const evidence = selected?.origin?.evidence || {};
  return (
    <aside className="workspace-panel" hidden={!open} aria-label="Trabajo y revisión" data-dock-side={dockSide} style={{ zIndex: Z.drawer, ...(dockSide ? { order: dockSide === "left" ? -10 : 10, width } : {}) }} onKeyDown={(e) => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onClose(); } }}>
      <header className="workspace-heading">
        {dockHandle}
        <div><span className="workspace-eyebrow">Espacio compartido</span><h2>Trabajo y revisión</h2></div>
        <button type="button" onClick={onClose} aria-label="Cerrar panel de trabajo">×</button>
      </header>
      <div className="workspace-summary">
        <div><strong>{shapes.length}</strong><span>mediciones</span></div>
        <div><strong>{pending}</strong><span>por revisar</span></div>
        <div><strong>{new Set(shapes.map((s) => s.sheet_id)).size}</strong><span>hojas con trabajo</span></div>
      </div>
      <div className="workspace-tabs" role="tablist" aria-label="Vistas del espacio de trabajo" onKeyDown={(e) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
        e.preventDefault();
        const next = e.key === "Home" ? "work" : e.key === "End" ? "agent" : tab === "work" ? "agent" : "work";
        setTab(next); document.getElementById(`workspace-${next}-tab`)?.focus();
      }}>
        <button type="button" role="tab" tabIndex={tab === "work" ? 0 : -1} id="workspace-work-tab" aria-controls="workspace-work-view" aria-selected={tab === "work"} onClick={() => setTab("work")}>Mediciones</button>
        <button type="button" role="tab" tabIndex={tab === "agent" ? 0 : -1} id="workspace-agent-tab" aria-controls="workspace-agent-view" aria-selected={tab === "agent"} onClick={() => setTab("agent")}>Agente {running ? "· Trabajando" : proposalCount ? `· ${proposalCount} propuesta${proposalCount === 1 ? "" : "s"}` : ""}</button>
      </div>
      <div id="workspace-agent-view" role="tabpanel" aria-labelledby="workspace-agent-tab" hidden={tab !== "agent"} className="workspace-agent-view">{children}</div>
      <div id="workspace-work-view" role="tabpanel" aria-labelledby="workspace-work-tab" hidden={tab !== "work"} className="workspace-work-view">
        <div className="workspace-filters">
          <label className="workspace-search"><span>Buscar trabajo</span><input name="work-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Condición, hoja, etiqueta o autor" /></label>
          <div className="workspace-filter-buttons" aria-label="Filtrar mediciones">
            {[["all", "Todo el trabajo"], ["pending", `Por revisar · ${pending}`], ["agent", "Agente"]].map(([id, label]) =>
              <button type="button" key={id} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>)}
          </div>
        </div>
        <div className="workspace-list" aria-label="Mediciones">
          {!rows.length && <div className="workspace-empty"><h3>{shapes.length ? "No hay trabajo que coincida" : "Aquí aparecen sus mediciones"}</h3><p>{shapes.length ? "Cambie el filtro o la búsqueda para ver más mediciones." : "Mida en el plano o importe el takeoff de un agente. Inspeccione aquí el trabajo de cualquiera de los dos, y luego abra su límite en el dibujo."}</p></div>}
          {rows.slice(0, limit).map((shape) => <button type="button" className="workspace-row" key={shape.id} aria-pressed={selectedId === shape.id} onClick={() => onLocate(shape)}>
            <span className="workspace-row-top"><strong>{conditions[shape.condition_id]?.finish_tag || "Sin asignar"}{shape.label ? ` · ${shape.label}` : ""}</strong><span className="workspace-quantity">{quantity(shape)}</span></span>
            <span className="workspace-sheet">{sheetLabel(shape.sheet_id)}</span>
            <span className="workspace-row-bottom"><span>{shape.author || workActor(shape)}</span><span className={workReviewState(shape) === "Por revisar" ? "workspace-pending" : ""}>{workReviewState(shape)}</span></span>
          </button>)}
          {rows.length > limit && <button type="button" className="workspace-more" onClick={() => setLimit((n) => n + 50)}>Mostrar más · quedan {rows.length - limit}</button>}
        </div>
        {selected && <section className="workspace-inspector" aria-label="Medición seleccionada">
          <div className="workspace-inspector-title"><h3>Constancia de la medición</h3><strong className="workspace-quantity">{quantity(selected)}</strong></div>
          <dl>
            <div><dt>Origen</dt><dd>{workActor(selected)}{selected.author ? ` · ${selected.author}` : ""}</dd></div>
            <div><dt>Método</dt><dd>{workMethod(selected)}</dd></div>
            <div><dt>Revisión</dt><dd>{workReviewState(selected)}</dd></div>
            <div><dt>Escala</dt><dd>{scales[selected.sheet_id] ? scaleUnconfirmed[selected.sheet_id] === false ? "Fijada · requiere confirmación" : "Fijada" : "Sin fijar"}</dd></div>
            <div><dt>Geometría</dt><dd>{selected.verts_norm?.length || 0} vértices · {selected.verts_norm_holes?.length || 0} huecos</dd></div>
            {evidence.matched_text && <div><dt>Texto del dibujo</dt><dd>{String(evidence.matched_text)}</dd></div>}
            {evidence.schedule_row_tag && <div><dt>Etiqueta del cuadro</dt><dd>{String(evidence.schedule_row_tag)}</dd></div>}
          </dl>
          <p className="workspace-receipt-note">Procedencia registrada. El estado de revisión no verifica la exactitud de la medición.</p>
          <div className="workspace-inspector-actions"><button type="button" onClick={() => onLocate(selected)}>Mostrar en el plano</button>{selected.origin?.reviewed === false && <button type="button" className="workspace-primary" onClick={() => onReview(selected.id)}>Marcar revisado</button>}</div>
        </section>}
        <footer className="workspace-footer"><span>{rows.length} de {shapes.length} mediciones</span><button type="button" onClick={onReport}>Abrir reporte →</button></footer>
      </div>
    </aside>
  );
}
