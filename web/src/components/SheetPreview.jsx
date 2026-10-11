import { useEffect, useRef, useState } from "react";
import { parseSheetKey } from "../lib/sheets";
import { previewPixelWidth, previewViewport } from "../lib/sheetPreview.js";
import "./sheetPreview.css";

// Separate render task and canvas: no changes to the working sheet, scale,
// selection or multi-sheet order. The native dialog owns focus restoration.
export default function SheetPreview({ sheet, label, withDoc, onClose, onOpen }) {
  const dialog = useRef(null);
  const canvas = useRef(null);
  const [status, setStatus] = useState("Loading detailed preview…");
  const [zoom, setZoom] = useState(false);
  useEffect(() => {
    const el = dialog.current;
    el.showModal();
    const suppress = (e) => { e.stopPropagation(); if (e.key === "Escape") { e.preventDefault(); onClose(); } };
    window.addEventListener("keydown", suppress, true);
    return () => { window.removeEventListener("keydown", suppress, true); el.close(); };
  }, [onClose]);
  useEffect(() => {
    let live = true, task, close;
    const closed = new Promise((r) => { close = r; });
    setStatus("Cargando vista previa detallada…"); setZoom(false);
    const { file, page } = parseSheetKey(sheet);
    // the file may be in no tab: held while the preview is open
    withDoc(file, async (doc) => {
      if (!live) return;
      const pg = await doc.getPage(page);
      if (!live) return;
      const vp = previewViewport(pg, previewPixelWidth(Math.min(1200, window.innerWidth - 64), window.devicePixelRatio));
      const c = canvas.current;
      c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height);
      task = pg.render({ canvasContext: c.getContext("2d", { alpha: false }), viewport: vp, background: "#ffffff" });
      await task.promise;
      if (live) setStatus("");
      await closed;
    }).catch(() => { if (live) setStatus("No se pudo cargar esta vista previa. Abra la hoja para inspeccionarla en el lienzo."); });
    return () => { live = false; task?.cancel(); close(); };
  }, [sheet, withDoc]);
  return <dialog ref={dialog} className="sheet-detail-dialog" aria-label={`Vista previa de la hoja: ${label}`} onCancel={(e) => { e.preventDefault(); onClose(); }}>
    <header><div><small>Vista previa de la hoja</small><h2>{label}</h2></div><button type="button" onClick={onClose} aria-label="Cerrar vista previa de la hoja">×</button></header>
    <div className="sheet-detail-toolbar"><span>Inspeccionar antes de abrir</span><button type="button" aria-pressed={zoom} onClick={() => setZoom(v => !v)}>{zoom ? "Ajustar página" : "Píxeles reales"}</button><button type="button" onClick={() => onOpen(sheet)}>Abrir hoja</button></div>
    {status && <p role="status">{status}</p>}
    <div className={`sheet-detail-paper${zoom ? " actual-pixels" : ""}`}><canvas ref={canvas} aria-label={`${label}: página dibujada`} hidden={!!status} /></div>
  </dialog>;
}
