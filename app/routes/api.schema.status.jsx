// app/routes/api.schema.status.jsx
import { json } from "@remix-run/node";

/**
 * Lee el HTML publicado de https://{shop}{path} y detecta
 * estrictamente: <script type="application/ld+json" data-sae="1">
 *
 * QS:
 *  - shop (obligatorio)   -> foo.myshopify.com
 *  - path (opcional)      -> /products/handle  (por defecto "/")
 *  - mode (opcional)      -> "fetch" | "db" (db añade ?sae_ping=1)
 */
export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const path = url.searchParams.get("path") || "/";
  const mode = url.searchParams.get("mode") || "fetch";
  if (!shop) return json({ detected: false, error: "missing shop" }, { status: 400 });

  // Construye destino (si mode=db, añade ?sae_ping=1)
  let target = `https://${shop}${path}`;
  try {
    const hasQs = target.includes("?");
    if (mode === "db") target += hasQs ? "&sae_ping=1" : "?sae_ping=1";

    const res = await fetch(target, {
      redirect: "follow",
      headers: {
        // Evita bloqueos tontos por UA
        "user-agent": "SchemaAdvancedBot/1.0 (+remix)",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    const html = await res.text();

    // Coincidencia ESTRICTA: type="application/ld+json" y data-sae="1"
    const re =
      /<script(?=[^>]*\btype=["']application\/ld\+json["'])(?=[^>]*\bdata-sae=["']1["'])[^>]*>/i;

    const detected = re.test(html);

    return json({
      ok: true,
      method: mode,
      shop,
      path,
      detected,
      status: res.status,
      lastPingAt: new Date().toISOString(),
      // opcional: devuelve un breve motivo si no detecta
      reason: detected ? undefined : "No se encontró <script type=\"application/ld+json\" data-sae=\"1\"> en el HTML.",
    });
  } catch (e) {
    return json({ ok: false, detected: false, error: String(e), shop, path }, { status: 500 });
  }
}
