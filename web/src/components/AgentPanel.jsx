// Agent panel — the docked right-rail surface for the in-canvas takeoff agent.
// An estimator types a goal; the agent (running on the user's OWN model via
// the BYO-AI seam) aims the app's deterministic tools and stages DASHED pencil
// proposals on the canvas. This panel is the review desk: streaming status
// while the loop runs, then per-proposal Accept/Reject plus Accept all —
// nothing becomes a takeoff until a human says so, exactly like one-click's
// Create gate. Unconfigured builds get the honest empty state (the Contribute
// modal pattern): no key, no run, and a link to AI settings.
import { useEffect, useRef, useState } from "react";
import { keyText } from "../lib/keys.ts";
import { Icon } from "../brand/icons.jsx";

const evidenceText = (ev) => {
  if (!ev) return "";
  const bits = [];
  if (ev.schedule_row_tag) bits.push(`cuadro ${ev.schedule_row_tag}`);
  if (ev.matched_text && ev.matched_text !== ev.schedule_row_tag) bits.push(`“${ev.matched_text}”`);
  if (Array.isArray(ev.seed_norm)) bits.push(`semilla (${(+ev.seed_norm[0]).toFixed(2)}, ${(+ev.seed_norm[1]).toFixed(2)})`);
  return bits.join(" · ");
};

const LOG_STYLE = { status: "var(--ink-muted)", tool: "var(--cobalt)", text: "var(--ink)", error: "var(--c-danger)" };

export default function AgentPanel({
  configured, running, log, proposals, condById, sheetLabel, units,
  fmtArea, onRun, onStop, onAccept, onReject, onAcceptAll, onRejectAll,
  onOpenSettings, onClose, embedded = false,
}) {
  const [goal, setGoal] = useState("");
  const logRef = useRef(null);
  // follow the stream — pin the log to its latest line as events arrive
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);
  void units; // reserved for a metric readout pass; fmtArea already localizes

  const run = () => { const g = goal.trim(); if (g && !running) onRun(g); };
  const ctl = { padding: "3px 9px", border: "1px solid var(--ink-faint)", background: "transparent", cursor: "pointer", fontSize: 11.5 };

  return (
    <div style={{ width: embedded ? "100%" : 340, flex: embedded ? 1 : undefined, flexShrink: 0, display: "flex", flexDirection: "column", borderLeft: embedded ? undefined : "1px solid var(--ink-faint)", background: "var(--paper-bright)", overflow: "hidden", minHeight: 0 }}>
      {/* header strip, matches the docked-panel chrome */}
      {!embedded && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "var(--cobalt)", color: "var(--accent-contrast)" }}>
        <Icon name="target" size={15} />
        <strong style={{ flex: 1, fontSize: 12.5 }}>Agente{proposals.length ? ` · ${proposals.length} pendiente${proposals.length === 1 ? "" : "s"}` : ""}</strong>
        <button onClick={onClose} title="Cerrar panel" style={{ border: "none", background: "transparent", color: "var(--accent-contrast)", fontSize: 16, cursor: "pointer", padding: "0 2px" }}>×</button>
      </div>}

      {!configured ? (
        // honest empty state — the Contribute-modal pattern: nothing configured,
        // nothing runs, no pretense. Zero network calls until the user brings a key.
        <div style={{ padding: 14, fontSize: 13, lineHeight: 1.6, color: "var(--ink)" }}>
          {/* INGELMEC: agente cerrado en el lienzo; se usa desde OpenCode por el MCP */}
          <p style={{ marginTop: 0 }}>
            En Ingelmec el agente se usa desde OpenCode por el MCP; este lienzo no lo configura.
          </p>
          <p style={{ color: "var(--ink-muted)" }}>
            El trabajo que el agente entrega llega aquí como un takeoff importado (Archivo, Importar mediciones).
            Revíselo en Trabajo, pestaña Mediciones, y apruébelo sobre el plano.
          </p>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          {/* goal + run */}
          <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--ink-faint)" }}>
            <textarea
              name="agent-goal" value={goal} onChange={(e) => setGoal(e.target.value)} rows={3}
              placeholder={'p. ej. «Cuantifique la alfombra según el cuadro de acabados de esta hoja.»'}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); run(); } }}
              style={{ width: "100%", boxSizing: "border-box", resize: "vertical", fontSize: 12.5, fontFamily: "inherit", padding: "6px 8px", border: "1px solid var(--ink-faint)", background: "var(--paper-bright)", color: "var(--ink)", outline: "none" }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
              {running ? (
                <button onClick={onStop} style={{ ...ctl, color: "var(--c-danger)", fontWeight: 600 }}>■ Detener</button>
              ) : (
                <button onClick={run} disabled={!goal.trim()} className="btn-primary" style={{ padding: "5px 14px", fontSize: 12, cursor: goal.trim() ? "pointer" : "default", opacity: goal.trim() ? 1 : 0.5 }}>Ejecutar</button>
              )}
              <span style={{ fontSize: 10.5, color: "var(--ink-muted)" }}>{running ? "Trabajando: las propuestas llegan como contornos punteados." : keyText("⌘⏎ ejecuta. Su clave, su endpoint.")}</span>
              <span style={{ flex: 1 }} />
              <button onClick={onOpenSettings} title="Ajustes del agente" style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--ink-muted)" }}><Icon name="sliders" size={13} /></button>
            </div>
          </div>

          {/* streaming status log */}
          <div ref={logRef} style={{ flex: 1, minHeight: 60, overflow: "auto", padding: "8px 12px", fontFamily: "var(--f-mono)", fontSize: 11, lineHeight: 1.55 }}>
            {log.length === 0 && <div style={{ color: "var(--ink-muted)", fontFamily: "inherit" }}>Aún no hay ejecuciones.</div>}
            {log.map((e, i) => (
              <div key={i} style={{ color: LOG_STYLE[e.kind] || "var(--ink)", whiteSpace: "pre-wrap", overflowWrap: "anywhere", marginBottom: 3 }}>{e.text}</div>
            ))}
          </div>

          {/* pending proposals, the accept gate */}
          <div style={{ borderTop: "1px solid var(--ink-faint)", maxHeight: "45%", display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px" }}>
              <strong style={{ flex: 1, fontSize: 11.5 }}>Propuestas · {proposals.length}</strong>
              {proposals.length > 0 && (
                <>
                  <button onClick={onAcceptAll} style={{ ...ctl, color: "var(--c-positive)", fontWeight: 600 }} title={keyText("Aceptar todas las propuestas visibles (⏎ en el lienzo hace lo mismo)")}>Aceptar todas</button>
                  <button onClick={onRejectAll} style={{ ...ctl, color: "var(--c-danger)" }} title="Descartar todas las propuestas pendientes (solo local, no se registra nada)">Rechazar todas</button>
                </>
              )}
            </div>
            <div style={{ overflow: "auto", minHeight: 0 }}>
              {proposals.map((p) => {
                const cond = condById[p.condition_id];
                return (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 12px", borderTop: "1px solid var(--ink-faint)", fontSize: 11.5 }}>
                    <span style={{ width: 10, height: 10, flexShrink: 0, background: cond?.color || "var(--cobalt)", border: "1px solid var(--ink-faint)" }} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 600 }}>{cond?.finish_tag || "?"}</span>
                      {p.measure_role === "deduct" ? " (deducción)" : ""} · {sheetLabel(p.sheet_id)}
                      {p.area_sf != null ? ` · ${fmtArea(p.area_sf)}` : ""}
                      <span style={{ display: "block", color: "var(--ink-muted)", fontSize: 10.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={evidenceText(p.evidence)}>
                        {evidenceText(p.evidence) || "sin evidencia"}
                      </span>
                    </span>
                    <button onClick={() => onAccept(p.id)} style={{ ...ctl, color: "var(--c-positive)", fontWeight: 600 }} title="Aceptar: se confirma como takeoff (origen: agente, revisado por una persona)">✓</button>
                    <button onClick={() => onReject(p.id)} style={{ ...ctl, color: "var(--c-danger)" }} title="Rechazar: descarta esta propuesta (solo local)">✕</button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
