import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../brand/icons.jsx";
import { keyText } from "../lib/keys.ts";
import { SIN_PREMIUM } from "../lib/ingelmec.js";
import "./workspaceChrome.css";

// Workspace chrome. All actions are supplied by the existing canvas;
// this component owns only navigation, search and disclosure state.
export function WorkspaceChrome({ title, onOpen, onNavigate, navigationOpen, onTakeoffs, takeoffsOpen,
  onPremium, onWork, workOpen, workButtonRef, pending, running, onReport, onFocus, onClassic,
  onControls, controlsOpen, onSearch, pinControl, panelTools, layoutMenu, helpMenu, fileMenu, scaleMenu, conditionControl, aids, history, action }) {
  return <>
    <header className="calm-header">
      <strong className="calm-brand">ingelmec<span>takeoff</span></strong>
      <div className="calm-project" title={title}><span>{title || "Espacio sin nombre"}</span><small>Ingelmec Takeoff</small></div>
      <div className="calm-header-actions">
        <button type="button" onClick={onOpen} title="Abrir planos"><Icon name="plus" size={16} /><span>Abrir</span></button>
        {fileMenu}
        <button type="button" aria-pressed={navigationOpen} onClick={onNavigate}><Icon name="sheets" size={16} />Hojas</button>
        {pinControl}
        <button type="button" onClick={onSearch} className="calm-search-trigger" title="Buscar una herramienta o acción"><Icon name="search" size={16} /><span>Buscar acción</span><kbd>{keyText("⌘K")}</kbd></button>
        <button type="button" aria-pressed={takeoffsOpen} onClick={onTakeoffs} title="Cantidades medidas, condiciones y materiales de apoyo"><Icon name="product" size={16} />Cantidades</button>
        <button type="button" ref={workButtonRef} aria-expanded={workOpen} onClick={onWork} className="calm-work">Trabajo{running ? <span className="calm-badge">En curso</span> : pending > 0 ? <span className="calm-badge">{pending}</span> : null}</button>
        {panelTools}
        <button type="button" onClick={onReport} className="calm-report" data-tour="report"><Icon name="document" size={16} />Reporte</button>
        {layoutMenu}{helpMenu}{!SIN_PREMIUM && <button type="button" className="calm-premium" data-premium-trigger onClick={onPremium}>Solicitar Premium</button>}<button type="button" onClick={onClassic} className="calm-classic" title="Volver a la disposición actual sin recargar el plano">Disposición clásica</button>
      </div>
    </header>
    <div className="calm-context" aria-label="Current drawing settings">
      <div className="calm-context-scroll">{conditionControl}<span className="calm-separator" />{history}<span className="calm-separator" />{aids}</div>
      <div className="calm-context-pinned">{action}{scaleMenu}
        <button type="button" onClick={onFocus} title="Enfoque: oculta el chrome y deja las herramientas de medición (F)"><Icon name="focus" size={16} /><span className="calm-focus-label">Enfoque</span></button>
        <button type="button" onClick={onControls} aria-expanded={controlsOpen} title="Todos los controles y ajustes de la barra">{controlsOpen ? "Cerrar controles" : "Todos los controles"}</button>
      </div>
    </div>
  </>;
}

export function WorkspaceNavigator({ open, items, current, onSelect, onClose, onGallery, dockSide, width, dockHandle }) {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => items.filter((s) => `${s.label} ${s.file}`.toLowerCase().includes(query.trim().toLowerCase())), [items, query]);
  return <aside className="calm-navigator" data-dock-side={dockSide} style={{ width, order: dockSide === "right" ? 20 : -20 }} hidden={!open} aria-label="Sheet navigator" onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } }}>
    <header>{dockHandle}<strong>Sheets <small>{items.length}</small></strong><button type="button" aria-label="Close sheet navigator" onClick={onClose}>×</button></header>
    <label><Icon name="search" size={15} /><input name="workspace-sheet-search" aria-label="Buscar una hoja" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar una hoja…" /></label>
    <div className="calm-sheet-list">{matches.map((s) => <button type="button" key={s.key} aria-current={s.key === current ? "page" : undefined} onClick={() => onSelect(s.key)} title={`${s.label} · ${s.file}`}>
      <Icon name="document" size={19} /><span><strong>{s.label}</strong><small>{s.file}</small></span>{s.count > 0 && <em>{s.count}</em>}
    </button>)}{!matches.length && <p>{items.length ? "Ninguna hoja coincide con su búsqueda." : "Abra un plano para ver sus hojas aquí."}</p>}</div>
    <footer><button type="button" onClick={onGallery}><Icon name="sheets" size={16} />Open visual gallery</button></footer>
  </aside>;
}

export function WorkspaceCommandMenu({ open, onClose, actions, onOpenChange }) {
  const dialogRef = useRef(null);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const rows = actions.filter((a) => `${a.label} ${a.group || ""} ${a.shortcut || ""}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 50);
  useEffect(() => {
    if (!open) return;
    setQuery(""); setIndex(0);
    const dialog = dialogRef.current;
    dialog?.showModal();
    onOpenChange(true);
    return () => { dialog?.close(); onOpenChange(false); };
  }, [open, onOpenChange]);
  useEffect(() => { dialogRef.current?.querySelector(".is-highlighted")?.scrollIntoView({ block: "nearest" }); }, [index]);
  const run = (row) => { if (row && !row.disabled) { onClose(); row.run(); } };
  return <dialog ref={dialogRef} className="calm-command-menu" onKeyDown={(e) => e.stopPropagation()} aria-label="Find an action" onCancel={(e) => { e.preventDefault(); onClose(); }} onClick={(e) => { if (e.target === e.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose(); } }}>
    <header><Icon name="search" size={18} /><input name="workspace-action-search" role="combobox" aria-autocomplete="list" aria-expanded={true} aria-controls="workspace-action-results" aria-activedescendant={rows[index] ? `workspace-action-${rows[index].id}` : undefined} aria-label="Buscar acciones" autoFocus value={query} placeholder="Buscar herramienta, hoja o acción…" onChange={(e) => { setQuery(e.target.value); setIndex(0); }}
      onKeyDown={(e) => { if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); setIndex((i) => Math.max(0, Math.min(rows.length - 1, i + (e.key === "ArrowDown" ? 1 : -1)))); } else if (e.key === "Enter") { e.preventDefault(); run(rows[index]); } }} /><button type="button" aria-label="Cerrar la búsqueda de acciones" onClick={onClose}>Esc</button></header>
    <div className="calm-command-results" id="workspace-action-results" role="listbox" aria-label="Acciones">{rows.map((row, i) => <button type="button" role="option" tabIndex={-1} aria-selected={i === index} id={`workspace-action-${row.id}`} key={row.id} className={i === index ? "is-highlighted" : ""} disabled={row.disabled} onMouseEnter={() => setIndex(i)} onClick={() => run(row)}><span>{row.label}<small>{row.group}</small></span>{row.shortcut && <kbd>{keyText(row.shortcut)}</kbd>}</button>)}{!rows.length && <p>Ninguna acción coincide. Pruebe «escala», «importar» o el nombre de una herramienta.</p>}</div>
    <footer>↑ ↓ to choose · Enter to run · Esc to close</footer>
  </dialog>;
}
