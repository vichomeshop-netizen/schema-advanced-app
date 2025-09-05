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
const API_VER = process.env.SHOPIFY_API_VERSION || "2025-07";

// ---- HMAC de OAuth (HEX, no base64) ----
function verifyOAuthHmac(searchParams) {
  const entries = [];
  for (const [k, v] of searchParams) {
    if (k === "hmac" || k === "signature") continue;
    entries.push(`${k}=${v}`);
  }
  entries.sort();
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

// Mira en vivo si ya hay una suscripción activa
async function probeActiveSubscription(shop, accessToken) {
  try {
    const q = `query {
      currentAppInstallation { activeSubscriptions { id name status } }
    }`;
    const r = await fetch(`https://${shop}/admin/api/${API_VER}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query: q }),
    });
    const j = await r.json();
    const sub = j?.data?.currentAppInstallation?.activeSubscriptions?.[0];
    if (sub?.status === "ACTIVE") {
      return {
        subscriptionStatus: "ACTIVE",
        subscriptionId: String(sub.id).replace(/^gid:\/\/shopify\/AppSubscription\//, ""),
        planName: sub.name,
      };
    }
  } catch {}
  return { subscriptionStatus: "INACTIVE", subscriptionId: null, planName: null };
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

  // ⬇️ Fallback: si el callback llega sin `code`, vuelve a /auth para reiniciar OAuth
  if (!code) {
    const qs = new URLSearchParams();
    if (shop) qs.set("shop", shop);
    if (host) qs.set("host", host);
    return redirect(`${APP_URL}/auth${qs.toString() ? `?${qs.toString()}` : ""}`);
  }

  // Validaciones mínimas
  if (!shop) {
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
  const cookieStateRaw = readStateCookie(request); // "<uuid>.<firma>"
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

  // 4) Sincroniza estado real de la suscripción y guarda idempotente
  const statusData = await probeActiveSubscription(shop, accessToken);
  await upsertShop({ shop, accessToken, scope, ...statusData });

  // 5) Registra webhooks "de app" (idempotente)
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







