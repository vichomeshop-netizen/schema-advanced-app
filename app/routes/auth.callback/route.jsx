// app/routes/auth.callback/route.jsx
import { redirect, json } from "@remix-run/node";
import crypto from "node:crypto";
import { upsertShop } from "~/lib/shop.server";
import {
  readStateCookie,
  verifyState,
  clearStateCookieHeader,
} from "~/lib/state.server";

// Igual que ya tienes: verificación HMAC de Shopify
function verifyHmac(searchParams, secret) {
  const entries = [];
  for (const [k, v] of searchParams) {
    if (k === "hmac" || k === "signature") continue;
    entries.push(`${k}=${v}`);
  }
  entries.sort();
  const message = entries.join("&");
  const digest = crypto.createHmac("sha256", secret).update(message).digest("hex");
  const provided = searchParams.get("hmac") || "";
  const a = Buffer.from(digest, "utf8");
  const b = Buffer.from(provided, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function loader({ request }) {
  const url = new URL(request.url);

  // Debug opcional
  if (url.searchParams.get("__debug") === "1") {
    return json({
      ok: true,
      route: "/auth/callback",
      received: Object.fromEntries(url.searchParams.entries()),
      cookies: request.headers.get("cookie") || "",
    }, { headers: { "cache-control": "no-store" }});
  }

  const shop = url.searchParams.get("shop");
  const code = url.searchParams.get("code");
  const hmac = url.searchParams.get("hmac");
  const state = url.searchParams.get("state");
  if (!shop || !code || !hmac || !state) {
    return json({ ok: false, message: "Faltan parámetros" }, { status: 400 });
  }

  // (Opcional) endurecer shop
  if (!/^[a-z0-9-]+\.myshopify\.com$/i.test(shop)) {
    return json({ ok:false, message:"Shop inválido" }, { status: 400 });
  }

  // 1) HMAC
  const secret = process.env.SHOPIFY_API_SECRET || "";
  if (!verifyHmac(url.searchParams, secret)) {
    return json({ ok: false, message: "HMAC inválido" }, { status: 401 });
  }

  // 2) STATE: cookie firmada (sin Map)
  const rawCookieState = readStateCookie(request);   // p.ej. "<uuid>.<firma>"
  if (!verifyState(rawCookieState, state)) {
    return json({ ok: false, message: "State inválido" }, { status: 401 });
  }

  // 3) Canjea el token
  const resp = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: secret,
      code,
    }),
  });
  const data = await resp.json();

  if (!resp.ok || !data?.access_token) {
    return json({ ok: false, message: "Fallo canje token", status: resp.status, data }, { status: 500 });
  }

  const accessToken = data.access_token;
  const scope = data.scope || data.scopes || "";

  await upsertShop({ shop, accessToken, scope });

  // 4) Limpia cookie y redirige al panel
  const headers = new Headers();
  headers.append("Set-Cookie", clearStateCookieHeader());

  const host = url.searchParams.get("host");
  return redirect(
    `/app?shop=${encodeURIComponent(shop)}${host ? `&host=${encodeURIComponent(host)}` : ""}`,
    { headers }
  );
}
// (resource route: sin export default)



