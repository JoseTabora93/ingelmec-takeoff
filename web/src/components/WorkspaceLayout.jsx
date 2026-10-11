import { useCallback, useEffect, useRef, useState } from "react";
import { Z } from "../lib/ui.js";
import { DEFAULT_LAYOUT, WORKSPACE_LAYOUT_KEY, moveDock, normalizeLayout, readWorkspacePreferences } from "../lib/workspaceLayout.js";

export function useWorkspaceLayout() {
  const [prefs, setPrefs] = useState(() => {
    let raw = null;
    try { raw = localStorage.getItem(WORKSPACE_LAYOUT_KEY); } catch { /* session-only layout */ }
    const pref = readWorkspacePreferences(raw);
    if (["calm", "premium"].includes(new URLSearchParams(window.location.search).get("workspace"))) pref.enabled = true;
    return pref;
  });
  const [storageFailed, setStorageFailed] = useState(false);
  useEffect(() => { try { localStorage.setItem(WORKSPACE_LAYOUT_KEY, JSON.stringify(prefs)); setStorageFailed(false); } catch { setStorageFailed(true); } }, [prefs]);
  const setEnabled = useCallback((enabled) => {
    setPrefs((p) => ({ ...p, enabled }));
    const url = new URL(window.location.href);
    url.searchParams.delete("workspace");
    window.history.replaceState(window.history.state, "", url);
  }, []);
  const update = useCallback((patch) => setPrefs((p) => ({ ...p, layout: normalizeLayout({ ...p.layout, ...patch }) })), []);
  const move = useCallback((dock, side) => setPrefs((p) => ({ ...p, layout: moveDock(p.layout, dock, side) })), []);
  const save = (name) => setPrefs((p) => {
    const clean = name.trim().slice(0, 40);
    if (!clean) return p;
    return { ...p, saved: [...p.saved.filter((s) => s.name !== clean), { name: clean, layout: { ...p.layout } }].slice(-8) };
  });
  const remove = (name) => setPrefs((p) => ({ ...p, saved: p.saved.filter((s) => s.name !== name) }));
  return { ...prefs, setEnabled, update, move, save, remove, storageFailed };
}

export function DockHandle({ dock, label, locked, onDrag, onMove }) {
  const startRef = useRef(null);
  const cancel = () => { startRef.current = null; onDrag(null); };
  if (locked) return null;
  return <button type="button" className="calm-dock-handle" aria-label={`Mover ${label}`} title={`Mover ${label}: arrastre a cualquier borde, o use las flechas Izquierda/Derecha. La disposición también tiene selectores de posición.`}
    onKeyDown={(e) => { if (["ArrowLeft", "ArrowRight", "Escape"].includes(e.key)) { e.preventDefault(); e.stopPropagation(); if (e.key !== "Escape") onMove(dock, e.key === "ArrowLeft" ? "left" : "right"); cancel(); } }}
    onPointerDown={(e) => { if (e.button !== 0) return; e.preventDefault(); e.stopPropagation(); e.currentTarget.focus({ preventScroll: true }); startRef.current = { x: e.clientX, y: e.clientY, moved: false }; e.currentTarget.setPointerCapture(e.pointerId); }}
    onPointerMove={(e) => { const start = startRef.current; if (!start) return; e.stopPropagation(); if (!start.moved && Math.hypot(e.clientX - start.x, e.clientY - start.y) >= 6) { start.moved = true; onDrag(dock); } }}
    onPointerUp={(e) => {
      const start = startRef.current; if (!start) return; e.stopPropagation();
      const bounds = e.currentTarget.closest("[data-canvas-workspace]")?.getBoundingClientRect();
      if (start.moved && bounds && e.clientY >= bounds.top && e.clientY <= bounds.bottom) {
        const edge = Math.min(264, bounds.width * 0.3);
        if (e.clientX >= bounds.left && e.clientX <= bounds.left + edge) onMove(dock, "left");
        else if (e.clientX >= bounds.right - edge && e.clientX <= bounds.right) onMove(dock, "right");
      }
      cancel(); e.currentTarget.releasePointerCapture(e.pointerId);
    }} onPointerCancel={cancel} onLostPointerCapture={cancel}>⠿</button>;
}

export function DockTargets({ dragging }) {
  if (!dragging) return null;
  return <>{["left", "right"].map((side) => <div key={side} className={`calm-dock-target calm-dock-target-${side}`} style={{ zIndex: Z.modal }} aria-hidden="true">Acoplar {side === "left" ? "a la izquierda" : "a la derecha"}</div>)}</>;
}

export function WorkspaceLayoutDialog({ open, onClose, prefs, onOpenChange }) {
  const ref = useRef(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!open) return;
    const dialog = ref.current;
    dialog.showModal(); onOpenChange(true);
    return () => { dialog.close(); onOpenChange(false); };
  }, [open, onOpenChange]);
  const { layout, update } = prefs;
  return <dialog ref={ref} className="calm-layout-dialog" onKeyDown={(e) => e.stopPropagation()} aria-labelledby="workspace-layout-title" onCancel={(e) => { e.preventDefault(); onClose(); }}>
    <header><div><h2 id="workspace-layout-title">Su espacio de trabajo</h2><p>Guardado en este navegador. Su equipo conserva su propia disposición.</p></div><button type="button" onClick={onClose} aria-label="Cerrar ajustes de disposición">×</button></header>
    <section className="workspace-appearance"><h3>Apariencia</h3><label>Superficie<select aria-label="Superficie del espacio de trabajo" value={layout.look} onChange={(e) => update({ look: e.target.value })}><option value="graphite">Grafito retroiluminado</option><option value="light">Luz de estudio</option><option value="hud">HUD de instrumento</option></select></label><label>Retroiluminación del icono activo<input aria-label="Retroiluminación del icono activo" type="range" min="0" max="100" value={layout.backlight} onChange={(e) => update({ backlight: Number(e.target.value) })} /><output>{layout.backlight}%</output></label></section>
    <label className="calm-lock"><input type="checkbox" checked={layout.locked} onChange={(e) => update({ locked: e.target.checked })} />Bloquear posiciones y tamaños de los paneles</label>
    <p className="calm-layout-help">Desbloquee para arrastrar el asa de un panel a cualquier borde, o elija su posición abajo. Abrir y cerrar paneles siempre está disponible.</p>
    <fieldset disabled={layout.locked}><legend>Disposición de paneles</legend>
      {[["tools", "Herramientas de medición"], ["sheets", "Hojas"], ["work", "Trabajo y revisión"], ["takeoffs", "Cantidades"]].map(([id, label]) => <label key={id}>{label}<select aria-label={`${label} position`} value={layout[id]} onChange={(e) => prefs.move(id, e.target.value)}><option value="left">Barra lateral izquierda</option><option value="right">Barra lateral derecha</option></select></label>)}
      <label>Ancho del panel de trabajo <input aria-label="Ancho del panel de trabajo" type="range" min="300" max="480" step="20" value={layout.workWidth} onChange={(e) => update({ workWidth: Number(e.target.value) })} /><output>{layout.workWidth}px</output></label>
      <label>Ancho del panel de hojas <input aria-label="Ancho del panel de hojas" type="range" min="220" max="340" step="20" value={layout.sheetWidth} onChange={(e) => update({ sheetWidth: Number(e.target.value) })} /><output>{layout.sheetWidth}px</output></label>
    </fieldset>
    <div className="calm-layout-options"><label><input type="checkbox" checked={layout.readout} onChange={(e) => update({ readout: e.target.checked })} />Mostrar cuadro flotante de cantidades</label><label><input type="checkbox" checked={layout.palette} onChange={(e) => update({ palette: e.target.checked })} />Mostrar la paleta de condiciones fijadas</label><label><input type="checkbox" checked={layout.counter} onChange={(e) => update({ counter: e.target.checked })} />Mostrar el contador de cantidades del proyecto</label></div>
    <section><h3>Disposiciones guardadas</h3><form onSubmit={(e) => { e.preventDefault(); prefs.save(name); setMessage(`Se guardó «${name.trim()}».`); setName(""); }}><input aria-label="Nombre de la disposición" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="p. ej. Mi mesa de estimación" /><button disabled={!name.trim()}>Guardar la actual</button></form>
      <p className="calm-layout-help">Hasta 8 disposiciones. Guardar con el mismo nombre la reemplaza. Cargar una disposición también restaura su ajuste de bloqueo.</p>
      {prefs.saved.map((s) => <div key={s.name} className="calm-saved-layout"><button type="button" onClick={() => { update(s.layout); setMessage(`Se cargó «${s.name}».`); }}>{s.name}</button><button type="button" aria-label={`Eliminar disposición ${s.name}`} onClick={() => { prefs.remove(s.name); setMessage(`Se quitó «${s.name}» de las disposiciones guardadas.`); }}>×</button></div>)}
      <p role="status">{prefs.storageFailed ? "El almacenamiento del navegador no está disponible. Esta disposición durará solo esta sesión." : message}</p>
    </section>
    <footer><button type="button" onClick={() => { update(DEFAULT_LAYOUT); setMessage("Disposición por omisión restaurada. Se conservaron las disposiciones guardadas."); }}>Restablecer disposición</button><button type="button" onClick={onClose}>Listo</button></footer>
  </dialog>;
}
