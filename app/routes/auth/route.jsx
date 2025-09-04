// app/routes/auth/route.jsx
import { redirect, json } from "@remix-run/node";
import { makeState, setStateCookieHeader } from "~/lib/state.server";
import { getShop } from "~/lib/shop.server";

const ABS = (p) =>
  (process.env.APP_URL?.replace(/\/+$/, "") || "") + (p.startsWith("/") ? p : `/${p}`);

function respondHTML(html) {
  return new Response("<!doctype html>" + html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function parseScopes(s) {
  return new Set((s || "").split(",").map(x => x.trim()).filter(Boolean));
}

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || "";
  const embedded = url.searchParams.get("embedded") === "1";
  const host = url.searchParams.get("host") || "";

  // Debug
  if (url.searchParams.get("__debug") === "1") {
    const req = [
      "SHOPIFY_API_KEY",
      "SHOPIFY_API_SECRET",
      "SCOPES",
      "SHOPIFY_API_SCOPES",
      "APP_URL",
      "SHOPIFY_API_VERSION",
      "SESSION_SECRET",
    ];
    const envStatus = Object.fromEntries(req.map((k) => [k, process.env[k] ? "set" : "MISSING"]));
    return json({ ok: true, route: "/auth", shop, embedded, host, envStatus });
  }

  if (!shop) return new Response("Falta ?shop=mi-tienda.myshopify.com", { status: 400 });

  // 1) Si venimos embebidos, saca la navegación al top (evita third-party cookies)
  if (embedded || host) {
    const topUrl = ABS(`/auth?shop=${encodeURIComponent(shop)}`);
    return respondHTML(`
<html><body>
<script>
  var t=${JSON.stringify(topUrl)};
  if (window.top===window.self) location.href=t; else window.top.location.href=t;
</script>
</body></html>`);
  }

  // 2) ¿Faltan scopes? (si no faltan, vamos directo a /app)
  const required = parseScopes(process.env.SCOPES || process.env.SHOPIFY_API_SCOPES || "");
  let needsReauth = true;
  try {
    const s = await getShop(shop);
    if (s?.scope) {
      const current = parseScopes(s.scope);
      // needsReauth si algún scope requerido NO está en current
      needsReauth = [...required].some(req => !current.has(req));
    }
  } catch {
    // Si no existe en BD, seguiremos a OAuth igualmente
    needsReauth = true;
  }

  if (!needsReauth) {
    const toApp = `/app?shop=${encodeURIComponent(shop)}${host ? `&host=${encodeURIComponent(host)}` : ""}`;
    return redirect(toApp);
  }

  // 3) Genera state firmado y setéalo en cookie (solo el valor viaja en la URL)
  const stateRaw = makeState();             // p.ej. "<uuid>.<firma>"
  const statePublic = stateRaw.split(".")[0];

  const clientId = process.env.SHOPIFY_API_KEY || "";
  const scopes = [...required].join(",");   // usa los scopes de ENV normalizados
  const redirectUri = ABS("/auth/callback");

  if (!clientId || !scopes || !redirectUri) {
    return json(
      { ok: false, where: "/auth", message: "Faltan envs", details: { clientId: !!clientId, scopes: !!scopes, redirectUri } },
      { status: 500 }
    );
  }

  // 4) Redirige a Shopify con el state público y envía la cookie firmada
  const authUrl =
    `https://${shop}/admin/oauth/authorize` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${encodeURIComponent(statePublic)}`;
    // Nota: añade grant_options[]=per-user si usas tokens online

  const headers = new Headers();
  headers.append("Set-Cookie", setStateCookieHeader(stateRaw)); // HttpOnly; Secure; SameSite=Lax; Max-Age=300
  return redirect(authUrl, { headers });
}
// (resource route: sin export default)




