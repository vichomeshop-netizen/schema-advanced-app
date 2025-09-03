// app/routes/api.sae1.jsx
const mem = new Map(); // shop -> { ok:boolean, ts:number }
const HEADERS = { "Cache-Control": "no-store", "Content-Type": "application/json" };
const WINDOW_MS = 5 * 60 * 1000; // consideramos "reciente" en los últimos 5 min

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || "";
  const okParam = url.searchParams.get("ok"); // cuando viene de la imagen: ok=1|0
  const now = Date.now();

  // Si llega ok=... desde el storefront, guardamos el latido (sí, mutamos en loader — simple y efectivo).
  if (shop && (okParam === "1" || okParam === "0")) {
    mem.set(shop, { ok: okParam === "1", ts: now });
    // Devolvemos un 204 para la imagen (sin cuerpo)
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  }

  // Consulta de estado (p.ej., desde el panel)
  const rec = shop ? mem.get(shop) : null;
  const active = !!(rec && rec.ok && (now - rec.ts) < WINDOW_MS);
  return new Response(JSON.stringify({ ok: true, shop, active, lastTs: rec?.ts || null }), { headers: HEADERS });
}
