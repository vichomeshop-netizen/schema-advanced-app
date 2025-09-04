import { redirect, json } from "@remix-run/node";
import crypto from "node:crypto";

// Memoria global para estados (sobrevive hot-reload/cold-start en el mismo worker)
const g = globalThis;
g.__SAE_OAUTH_STATES__ ??= new Map(); // key = state, value = { shop, ts }

const ABS = (p) =>
  (process.env.APP_URL?.replace(/\/+$/, "") || "") + (p.startsWith("/") ? p : `/${p}`);

function setStateCookie(state, maxAge = 300) {
  // Host-only cookie (sin Domain) + Secure + Lax: suficiente para callback top-level
  return [
    `sae_state=${state}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ].join("; ");
}

function respondHTML(html) {
  return new Response("<!doctype html>" + html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
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

  // 2) Genera y guarda state (en memoria) + cookie propia
  const state = crypto.randomUUID();
  g.__SAE_OAUTH_STATES__.set(state, { shop, ts: Date.now() });

  const clientId = process.env.SHOPIFY_API_KEY || "";
  const scopes = (process.env.SCOPES || "").trim();
  const redirectUri = ABS("/auth/callback");

  if (!clientId || !scopes || !redirectUri) {
    return json(
      { ok: false, where: "/auth", message: "Faltan envs", details: { clientId: !!clientId, scopes: !!scopes, redirectUri } },
      { status: 500 }
    );
  }

  // 3) Redirige a Shopify con state propio
  const authUrl =
    `https://${shop}/admin/oauth/authorize` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${encodeURIComponent(state)}`;

  const headers = new Headers();
  headers.append("Set-Cookie", setStateCookie(state));
  return redirect(authUrl, { headers });
}
// (resource route: sin export default)



