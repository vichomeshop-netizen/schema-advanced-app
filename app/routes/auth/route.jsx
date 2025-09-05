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

function b64urlDecode(s = "") {
  try {
    const pad = "=".repeat((4 - (s.length % 4)) % 4);
    const str = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
    return Buffer.from(str, "base64").toString("utf8");
  } catch {
    return "";
  }
}

export async function loader({ request }) {
  const url = new URL(request.url);
  let shop = url.searchParams.get("shop") || "";
  const embedded = url.searchParams.get("embedded") === "1";
  const host = url.searchParams.get("host") || "";

  // ── DEBUG OPCIONAL ─────────────────────────────────────────────────────────────
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

  // 0) Si no viene ?shop= pero sí ?host= (Dev Panel / App Bridge), derivamos shop del host (base64url)
  if (!shop && host) {
    const decoded = b64urlDecode(host); // ej: "vichome-dev.myshopify.com/admin"
    const m = decoded.match(/^([a-z0-9-]+\.myshopify\.com)\b/i);
    if (m) shop = m[1];
  }

  if (!shop || !/^[a-z0-9-]+\.myshopify\.com$/i.test(shop)) {
    return new Response('Falta ?shop=mi-tienda.myshopify.com', { status: 400 });
  }

  // 1) Si venimos embebidos (o con host), saca la navegación a top-level manteniendo shop & host
  if (embedded || host) {
    const topUrl = ABS(`/auth?shop=${encodeURIComponent(shop)}${host ? `&host=${encodeURIComponent(host)}` : ""}`);
    return respondHTML(`
<html><body>
<script>
  var t=${JSON.stringify(topUrl)};
  if (window.top===window.self) location.href=t; else window.top.location.href=t;
</script>
</body></html>`);
  }

  // 2) ¿Necesitamos re-OAuth? (si no faltan scopes y HAY token → directo a /app)
  const required = parseScopes(process.env.SCOPES || process.env.SHOPIFY_API_SCOPES || "");
  let needsReauth = true;
  try {
    const s = await getShop(shop); // { accessToken, scope, ... }
    if (s?.accessToken) {
      if (required.size === 0) {
        needsReauth = false;
      } else if (s?.scope) {
        const current = parseScopes(s.scope);
        // needsReauth si algún scope requerido NO está en current
        needsReauth = [...required].some(req => !current.has(req));
      }
    }
  } catch {
    needsReauth = true;
  }

  if (!needsReauth) {
    const toApp = `/app?shop=${encodeURIComponent(shop)}${host ? `&host=${encodeURIComponent(host)}` : ""}`;
    return redirect(toApp);
  }

  // 3) Genera state firmado y setéalo en cookie (sólo el valor público viaja en la URL)
  const stateRaw = makeState();            // p.ej. "<uuid>.<firma>"
  const statePublic = stateRaw.split(".")[0];

  const clientId = process.env.SHOPIFY_API_KEY || "";
  const scopes = [...required].join(",");  // usa los scopes de ENV normalizados (puede ser "")
  const redirectUri = ABS("/auth/callback");

  if (!clientId || !redirectUri) {
    return json(
      { ok: false, where: "/auth", message: "Faltan envs", details: { clientId: !!clientId, redirectUri } },
      { status: 500 }
    );
  }

  // 4) Redirige a Shopify con el state público; añade grant_options[]=per-user si lo marcas en ENV
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    state: statePublic,
  });
  if (scopes) params.set("scope", scopes);
  if (process.env.SHOPIFY_GRANT_PER_USER === "1" || process.env.GRANT_PER_USER === "1") {
    params.append("grant_options[]", "per-user");
  }

  const authUrl = `https://${shop}/admin/oauth/authorize?${params.toString()}`;
  const headers = new Headers();
  headers.append("Set-Cookie", setStateCookieHeader(stateRaw)); // HttpOnly; Secure; SameSite=(según tu helper); Max-Age=300
  return redirect(authUrl, { headers });
}
// (resource route: sin export default)





