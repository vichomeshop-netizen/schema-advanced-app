// app/routes/auth.callback/route.jsx
import { redirect, json } from "@remix-run/node";
import crypto from "node:crypto";
import { upsertShop } from "~/lib/shop.server";
import { ensureWebhooks } from "~/lib/ensure-webhooks.server";
import {
  readStateCookie,
  verifyState,
  clearStateCookieHeader,
} from "~/lib/state.server";

const APP_URL = (process.env.APP_URL || "").replace(/\/+$/, "");
const API_KEY = process.env.SHOPIFY_API_KEY || "";
const API_SECRET = process.env.SHOPIFY_API_SECRET || "";

// ---- HMAC de OAuth (HEX, no base64) ----
function verifyOAuthHmac(searchParams) {
  const entries = [];
  for (const [k, v] of searchParams) {
    if (k === "hmac" || k === "signature") continue;
    entries.push(`${k}=${v}`);
  }
  entries.sort(); // orden lexicográfico por clave
  const message = entries.join("&");

  const digestHex = crypto.createHmac("sha256", API_SECRET).update(message).digest("hex");
  const givenHex = searchParams.get("hmac") || "";
  try {
    return crypto.timingSafeEqual(
      Buffer.from(digestHex, "utf8"),
      Buffer.from(givenHex, "utf8")
    );
  } catch {
    return false;
  }
}

export async function loader({ request }) {
  const url   = new URL(request.url);
  const shop  = url.searchParams.get("shop") || "";
  const code  = url.searchParams.get("code") || "";
  const state = url.searchParams.get("state") || "";
  const host  = url.searchParams.get("host") || "";

  // Debug opcional
  if (url.searchParams.get("__debug") === "1") {
    return json({
      route: "/auth/callback",
      received: Object.fromEntries(url.searchParams.entries()),
      hasAppUrl: Boolean(APP_URL),
      hasKey: Boolean(API_KEY),
      hasSecret: Boolean(API_SECRET),
      cookies: request.headers.get("cookie") || "",
    }, { headers: { "cache-control": "no-store" } });
  }

  if (!shop || !code) {
    return json({ ok: false, message: "Faltan parámetros", shop, codePresent: Boolean(code) }, { status: 400 });
  }
  if (!/^[a-z0-9-]+\.myshopify\.com$/i.test(shop)) {
    return json({ ok: false, message: "Shop inválido" }, { status: 400 });
  }
  if (!API_KEY || !API_SECRET || !APP_URL) {
    return json({ ok: false, message: "Faltan envs", API_KEY: !!API_KEY, API_SECRET: !!API_SECRET, APP_URL: !!APP_URL }, { status: 500 });
  }

  // 1) Verifica HMAC (HEX)
  if (!verifyOAuthHmac(url.searchParams)) {
    return new Response("unauthorized", { status: 401 });
  }

  // 2) Verifica CSRF state con tu cookie firmada
  const cookieStateRaw = readStateCookie(request); // p.ej. "<uuid>.<firma>"
  if (!verifyState(cookieStateRaw, state)) {
    return new Response("unauthorized", { status: 401 });
  }

  // 3) Intercambia code → access_token
  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      client_id: API_KEY,
      client_secret: API_SECRET,
      code,
    }),
  });

  if (!tokenRes.ok) {
    const t = await tokenRes.text().catch(() => "");
    console.error("ACCESS_TOKEN_FAIL", tokenRes.status, t);
    return new Response("unauthorized", { status: 401 });
  }

  let tokenJson;
  try { tokenJson = await tokenRes.json(); } catch {
    return json({ ok: false, message: "Token JSON inválido" }, { status: 500 });
  }
  const accessToken = tokenJson.access_token;
  const scope = tokenJson.scope || tokenJson.scopes || "";
  if (!accessToken) {
    return json({ ok: false, message: "Falta access_token" }, { status: 500 });
  }

  // 4) Guarda/actualiza tienda (idempotente)
  await upsertShop({ shop, accessToken, scope });

  // 5) Registra webhooks "de app" de forma idempotente
  try {
    await ensureWebhooks({ shop, accessToken, appUrl: APP_URL });
  } catch (e) {
    console.warn("ensureWebhooks warn:", e?.message || e);
  }

  // 6) Limpia cookie de state y vuelve al panel embebido
  const headers = new Headers();
  headers.append("Set-Cookie", clearStateCookieHeader());
  const back = `${APP_URL}/app?shop=${encodeURIComponent(shop)}${host ? `&host=${encodeURIComponent(host)}` : ""}`;
  return redirect(back, { headers });
}

export const action = loader;





