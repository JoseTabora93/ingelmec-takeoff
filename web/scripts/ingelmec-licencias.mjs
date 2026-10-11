// INGELMEC: genera public/licencias.html (página local, sin enlaces externos) con el
// texto completo de LICENSE (Apache-2.0), NOTICE y THIRD-PARTY-NOTICES.md del repo.
// Uso: node scripts/ingelmec-licencias.mjs   (se vuelve a correr si cambian esos archivos)
import { readFileSync, writeFileSync } from "node:fs";
const read = (f) => readFileSync(new URL(`../../${f}`, import.meta.url), "utf8");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// Los enlaces de tablas markdown se dejan como texto plano «nombre (url)» sin enlazar.
const terceros = read("THIRD-PARTY-NOTICES.md").replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)");
const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Licencias y créditos · Ingelmec Takeoff</title>
<style>
body{font:15px/1.6 "Open Sans",system-ui,sans-serif;color:#172031;max-width:820px;margin:0 auto;padding:28px 20px 60px}
h1{font-family:Inter,system-ui,sans-serif;color:#003B5C;font-size:24px;margin:0 0 4px}
h2{font-family:Inter,system-ui,sans-serif;color:#003B5C;font-size:17px;margin:30px 0 8px;border-top:1px solid #d6dde6;padding-top:18px}
pre{white-space:pre-wrap;word-wrap:break-word;background:#f5f7fa;border:1px solid #d6dde6;padding:14px;font:12px/1.5 ui-monospace,Menlo,monospace}
a{color:#1F6FB2}
.nav{margin:0 0 20px;font-size:13px}
</style></head><body>
<div class="nav"><a href="/">Volver a Ingelmec Takeoff</a></div>
<h1>Licencias y créditos</h1>
<p>Ingelmec Takeoff es una versión modificada de OpenTakeoff, software libre publicado bajo la licencia Apache, versión 2.0. Proyecto original: OpenTakeoff, de Kentucky AI (copyright de los autores originales). Las modificaciones son de Ingelmec: traducción al español, unidades métricas, marca, condiciones por disciplina y retiro de enlaces y servicios externos. El software se entrega «tal cual», sin garantías (ver la licencia).</p>
<h2>Aviso (NOTICE)</h2>
<pre>${esc(read("NOTICE"))}</pre>
<h2>Licencia Apache 2.0 (LICENSE)</h2>
<pre>${esc(read("LICENSE"))}</pre>
<h2>Avisos de terceros (THIRD-PARTY-NOTICES)</h2>
<pre>${esc(terceros)}</pre>
</body></html>
`;
writeFileSync(new URL("../public/licencias.html", import.meta.url), html);
console.log("public/licencias.html escrito,", html.length, "bytes");
