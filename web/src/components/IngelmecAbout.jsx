// INGELMEC: «Acerca de y licencias». Lugar discreto para el crédito que exige la
// licencia Apache-2.0 del proyecto original (OpenTakeoff). Todo es TEXTO PLANO:
// sin logo del original y sin enlaces que saquen de este sitio. El único enlace
// va a /licencias.html, una página estática propia con el texto completo de la
// licencia, el NOTICE y los avisos de terceros.
import { useEffect, useRef } from "react";
import { Z } from "../lib/ui.js";
import { INGELMEC_NAME, INGELMEC_ATRIBUCION } from "../lib/ingelmec.js";
import { inOtherModal, otherModalOpen } from "../lib/modalKeys";

export default function IngelmecAbout({ onClose }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (inOtherModal(e.target, dialogRef.current) || otherModalOpen(document, dialogRef.current)) return;
      e.preventDefault(); e.stopPropagation(); onClose();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return (
    <div onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: Z.modal, background: "var(--scrim)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "8vh 16px", overflow: "auto" }}>
      <div ref={dialogRef} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-label="Acerca de y licencias" className="panel"
        style={{ width: "min(560px, 100%)", background: "var(--paper-bright)", color: "var(--ink)", border: "1px solid var(--ink-faint)", borderRadius: 0, padding: "22px 26px 24px", boxShadow: "var(--shadow-2)" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
          <strong style={{ fontFamily: "var(--f-display)", fontSize: 17, letterSpacing: "-0.02em" }}>Acerca de {INGELMEC_NAME}</strong>
          <button onClick={onClose} title="Cerrar (Esc)"
            style={{ background: "none", border: "none", color: "var(--ink-soft)", fontSize: 18, cursor: "pointer", lineHeight: 1, padding: 4 }}>×</button>
        </div>
        <p style={{ margin: "0 0 12px", fontSize: 12.5, lineHeight: 1.55, color: "var(--ink-soft)" }}>
          Herramienta de cómputo de planos de Ingelmec. Todo corre en su navegador; los planos no se suben a ningún servicio.
        </p>
        <div style={{ whiteSpace: "pre-line", fontSize: 12.5, lineHeight: 1.6, color: "var(--ink-soft)", borderTop: "1px solid var(--ink-faint)", paddingTop: 12 }}>
          {INGELMEC_ATRIBUCION}
        </div>
        <p style={{ margin: "14px 0 0", fontSize: 12.5 }}>
          <a href="/licencias.html" target="_blank" rel="noreferrer" style={{ color: "var(--cobalt)" }}>Licencia Apache 2.0, aviso (NOTICE) y avisos de terceros</a>
        </p>
      </div>
    </div>
  );
}
