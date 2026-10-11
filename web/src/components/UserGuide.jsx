// The in-app manual — the short version, reachable without leaving the canvas.
//
// docs/USER_GUIDE.md is 705 lines and good, and until now NOTHING in the app
// pointed at it: a first-time visitor to the demo had no way to learn that a
// manual exists. (The one icon that reads as help is the RFI hexagon, whose own
// comment calls it "a question motif".) This is the overlay that closes that
// gap — the five-minute path plus the real key bindings, with the long-form
// manual one link away.
//
// DELIBERATELY NOT a rendering of the markdown. Bundling a parser to re-display
// a document that lives in the repo buys a dependency and a second thing to
// keep true; what an estimator needs mid-trace is the shortcut and the next
// step, not sixteen sections. The bindings below are transcribed from
// USER_GUIDE.md §15, which is itself maintained against the code — if a
// shortcut changes, §15 and this table move together.
import { oneClickEnabled, commandBoxEnabled } from "../lib/gate.js";
import { useEffect, useRef } from "react";
import { inOtherModal, otherModalOpen } from "../lib/modalKeys";
import { Z, S } from "../lib/ui.js";
import { keyLabel, keyText, isApplePlatform } from "../lib/keys.ts";

// INGELMEC: sin enlace a la guía larga del original (GUIDE_URL retirado): la app no saca de este sitio.

function Kbd({ children }) {
  return (
    <kbd style={{
      fontFamily: "var(--f-mono)", fontSize: 11, padding: "2px 6px", border: "1px solid var(--ink-faint)",
      borderBottomWidth: 2, borderRadius: 5, background: "var(--paper-bright)", color: "var(--ink)", whiteSpace: "nowrap",
    }}>{children}</kbd>
  );
}

export function Keys({ combo }) {
  // A tool with no key (Copy text) says where it lives instead of an empty cell.
  if (!combo.length) return <span style={S.monoLabel}>barra</span>;
  // Labels only — the handlers already treat ⌘ and Ctrl as one key. See lib/keys.ts.
  const apple = isApplePlatform();
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
      {combo.map((k, i) => <Kbd key={i}>{keyLabel(k, apple)}</Kbd>)}
    </span>
  );
}

function Table({ rows }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "7px 14px", alignItems: "baseline" }}>
      {rows.map(([combo, what], i) => (
        <div key={i} style={{ display: "contents" }}>
          <div style={{ justifySelf: "start" }}><Keys combo={combo} /></div>
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.45 }}>{keyText(what)}</div>
        </div>
      ))}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div className="t-label" style={{ marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

const START = [
  ["Abrir un plano", "Arrastre un PDF, una imagen o un juego de planos .zip completo al lienzo, o haga clic en Cargar plano de ejemplo. Los planos se quedan en su dispositivo en el espacio local por omisión."],
  ["Fije la escala primero", "Toda cantidad depende de ella. El menú Escala ofrece lo que declara el cajetín de la hoja; pase el cursor para previsualizar una regla calibrada sobre el dibujo, o calibre dos puntos de una dimensión conocida. Se recuerda por hoja."],
  ["Agregue una condición", "Una condición es un acabado: CPT-1, LVT, rodapié. Dele una etiqueta, un % de desperdicio y un color. Presione 1 a 9 para armar una."],
  ["Medir", oneClickEnabled() ? "Con One-Click, un recinto se selecciona solo; o trace a mano con Área, Rectángulo, Lineal o Conteo. En One-Click, ⏎ lo crea." : "Trace a mano con Área, Rectángulo, Lineal o Conteo: haga clic en las esquinas, ⏎ cierra la figura. (One-Click Área está temporalmente deshabilitado mientras se revalida el motor de relleno.)"],
  ["Lea el reporte", "El REPORTE totaliza cada condición, aplica el desperdicio y le da cantidades de pedido, una lista de compras y exportación a CSV / Excel."],
];

export const TOOLS = [
  ...(oneClickEnabled() ? [[["O"], "One-Click Área: haga clic dentro de un recinto y se selecciona solo"]] : []),
  [["A"], "Área"], [["R"], "Rectángulo"], [["L"], "Lineal"], [["Q"], "Recta ⇄ Curva (en pleno trazo)"],
  [["S"], "Superficie (muros)"], [["C"], "Conteo"],
  [["D"], "Deducir figura (Recorte)"], [["⇧", "D"], "Deducir rectángulo"],
  [["H"], "Resaltador"], [["K"], "Verificar una dimensión contra lo que dice el dibujo"],
  [["N"], "Línea de cota: etiqueta de longitud independiente a la escala de la hoja (anotación, nunca se cuenta)"],
  [["V"], "Seleccionar"], [["G"], "Galería de hojas"],
  [[], "Copiar texto (sin tecla): encierre una nota o cuadro; su texto va al portapapeles"],
  [["1", "-", "9"], "Armar la condición N"],
  ...(commandBoxEnabled() ? [[["mantener", "M"], "Dictado con pulsar para hablar: soltar lo ejecuta, Esc lo descarta"]] : []),
];

export const DRAW = [
  [["⏎"], oneClickEnabled() ? "Terminar la figura. En One-Click: crear la selección" : "Terminar la figura"],
  [["⌫"], "Retroceder un paso: el último punto, luego el vértice elegido, la región, la figura seleccionada, la anotación"],
  [["⌘", "Z"], "En pleno trazo quita el último punto; si no, deshace"],
  [["⇧", "⌘", "Z"], "Rehacer"],
  [["Esc"], "Retroceder un nivel: primero la selección de vértice, luego lo que esté en curso"],
  [["mantener", "⇧"], "Forzar el bloqueo de ángulo de 45° con cualquier ángulo del cursor"],
  ...(oneClickEnabled() ? [[["⌥", "clic"], "En One-Click: abrir un recorte dentro de un espacio seleccionado"]] : []),
  [["⇧", "clic"], "Insertar un vértice en el punto medio de un borde y arrastrarlo"],
  [["⌘", "C"], "Copiar"], [["⌘", "V"], "Pegar bajo el cursor"], [["⌘", "D"], "Duplicar"],
  [["T"], "Trazar otro igual a la figura seleccionada: su condición y su herramienta se arman, la selección se suelta"],
];

export const VIEW = [
  [["rueda"], "Acercar hacia el cursor"],
  [["dos dedos"], "Desplazar en ambos ejes"],
  [["⇧", "rueda"], "Desplazar"],
  [["mantener", "Espacio"], "Desplazar con cualquier herramienta armada, igual que arrastrar con el botón central o el derecho"],
  [["F"], "Modo enfoque: contrae la interfaz y la cambia por altura de lienzo"],
  [["?"], "Abrir esta guía"],
];

export default function UserGuide({ onClose, onTour, onConnect }) {
  // The dialog closes ITSELF, and that is not a style preference. The canvas's
  // Escape chain lives in an effect that early-returns while the plan-set
  // gallery is up — so a guide dismissed from there would have swallowed the
  // key and stayed open, which is precisely the first-time visitor who came
  // looking for the manual. Owning the key here makes dismissal independent of
  // whatever view is behind. Capture phase + stopPropagation so the same press
  // cannot also back out of a trace the user cannot see behind the overlay.
  // Esc pressed inside another modal over the guide (the OCR download
  // notice), or with one open anywhere while focus is on the body, is that
  // modal's own: it is the one on top.
  const dialogRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (inOtherModal(e.target, dialogRef.current) || otherModalOpen(document, dialogRef.current)) return;
      e.preventDefault();
      e.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: Z.modal, background: "var(--scrim)",
        display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "5vh 16px", overflow: "auto",
      }}>
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        // keys typed in the guide stay in it: the canvas's window shortcuts
        // (and the gallery's, which step aside for a modal) never see them
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Guía de Ingelmec Takeoff"
        className="panel"
        style={{
          width: "min(760px, 100%)", background: "var(--paper-bright)", color: "var(--ink)",
          border: "1px solid var(--ink-faint)", borderRadius: 0, padding: "22px 26px 26px",
          boxShadow: "var(--shadow-2)",
        }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
          <strong style={{ fontFamily: "var(--f-display)", fontSize: 17, letterSpacing: "-0.02em" }}>Cómo funciona Ingelmec Takeoff</strong>
          <button onClick={onClose} title="Cerrar (Esc)"
            style={{ background: "none", border: "none", color: "var(--ink-soft)", fontSize: 18, cursor: "pointer", lineHeight: 1, padding: 4 }}>×</button>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.5, margin: "0 0 22px" }}>
          Un lienzo de takeoff con espacio de trabajo local, sin cuenta. Abra un plano, fije la escala,
          mida los acabados y exporte un reporte de cantidades. Nada sale de su navegador.
        </p>

        {(onTour || onConnect) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
            {onTour && (
              <button type="button" onClick={onTour}
                style={{ padding: "8px 14px", border: "none", background: "var(--cobalt)", color: "var(--accent-contrast)", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>
                Iniciar el primer takeoff guiado
              </button>
            )}
            {onConnect && (
              <button type="button" onClick={onConnect}
                style={{ padding: "8px 14px", border: "1px solid var(--ink-faint)", background: "transparent", color: "var(--ink)", fontSize: 12.5, cursor: "pointer" }}>
                Conectar su IA
              </button>
            )}
          </div>
        )}

        {/* INGELMEC: páginas legales del original (Kentucky AI / Netlify) reemplazadas por la página local de licencias */}
        <nav aria-label="Legal" style={{ display: "flex", gap: 16, marginBottom: 22, fontSize: 12.5 }}>
          <a href="/licencias.html" target="_blank" rel="noreferrer">Licencias y créditos</a>
        </nav>

        <Section title="Cinco minutos para un takeoff">
          <ol style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 9 }}>
            {START.map(([t, d]) => (
              <li key={t} style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                <strong style={{ color: "var(--ink)" }}>{t}</strong>
                <span style={{ color: "var(--ink-soft)" }}>: {keyText(d)}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Herramientas"><Table rows={TOOLS} /></Section>
        <Section title="Dibujo y edición"><Table rows={DRAW} /></Section>
        <Section title="Cómo moverse"><Table rows={VIEW} /></Section>

        <div style={{ borderTop: "1px solid var(--ink-faint)", paddingTop: 14, fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.5 }}>
          Esta es la versión corta. Cubre lo esencial para medir; las condiciones, las anotaciones y los RFI,
          las revisiones, el reporte y las exportaciones se aprenden usando la app.
        </div>
      </div>
    </div>
  );
}
