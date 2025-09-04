import { redirect, json } from "@remix-run/node";
import crypto from "node:crypto";
import { db } from "~/lib/db.server";

const g = globalThis;
g.__SAE_OAUTH_STATES__ ??= new Map();

function parseCookies(cookieHeader = "") {
  const out = {};
  cookieHeader.split(";").forEach((p) => {
    const [k, ...v] = p.trim().split("=");
    if (!k) return;
    out[k] = decodeURIComponent(v.join("="));
  });
  return out;
}

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

  if (url.searchParams.get("__debug") === "1") {
    return json({
      ok: true,
      route: "/auth/callback",
      received: Object.fromEntries(url.searchParams.entries()),
      cookies: request.headers.get("cookie") || "",
    });
  }

  const shop = url.searchParams.get("shop");
  const code = url.searchParams.get("code");
  const hmac = url.searchParams.get("hmac");
  const state = url.searchParams.get("state");

  if (!shop || !code || !hmac || !state) {
    return json({ ok: false, message: "Faltan parámetros" }, { status: 400 });
  }

  // 1) HMAC
  const secret = process.env.SHOPIFY_API_SECRET || "";
  if (!verifyHmac(url.searchParams, secret)) {
    return json({ ok: false, message: "HMAC inválido" }, { status: 401 });
  }

  // 2) STATE (acepta cookie o registro en memoria)
  const cookieState = parseCookies(request.headers.get("cookie")).sae_state;
  const record = g.__SAE_OAUTH_STATES__.get(state);
  g.__SAE_OAUTH_STATES__.delete(state);

  if (!(cookieState === state || (record && record.shop === shop))) {
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

  await db.upsertShop({ shop, accessToken, scope });

  // 4) Limpia cookie y redirige al panel
  const headers = new Headers();
  headers.append("Set-Cookie", "sae_state=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax");

  const host = url.searchParams.get("host");
  return redirect(`/app?shop=${encodeURIComponent(shop)}${host ? `&host=${encodeURIComponent(host)}` : ""}`, { headers });
}
// (resource route: sin export default)


