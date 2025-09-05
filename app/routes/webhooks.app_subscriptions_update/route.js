// app/routes/webhooks.app_subscriptions_update/route.js
import crypto from "node:crypto";
import { prisma } from "~/lib/prisma.server";
import { setSubscription } from "~/lib/shop.server";

// HMAC de webhooks: firma base64
function verifyHmac(buf, hmacHeader) {
  const digest = crypto
    .createHmac("sha256", process.env.SHOPIFY_API_SECRET)
    .update(buf)
    .digest("base64");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(digest, "base64"),
      Buffer.from(hmacHeader || "", "base64")
    );
  } catch {
    return false;
  }
}

export const loader = () => new Response("Not Found", { status: 404 });

export async function action({ request }) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const hmac  = request.headers.get("X-Shopify-Hmac-Sha256") || "";
  const shop  = (request.headers.get("X-Shopify-Shop-Domain") || "").toLowerCase();
  const topic = request.headers.get("X-Shopify-Topic") || "";
  const wid   = request.headers.get("X-Shopify-Webhook-Id") || "";

  const bodyBuf = Buffer.from(await request.arrayBuffer());

  // 1) Verificación HMAC (base64) + tópico correcto
  if (!verifyHmac(bodyBuf, hmac)) {
    return new Response("unauthorized", { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  if (topic !== "app_subscriptions/update") {
    return new Response("wrong topic", { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  // 2) Deduplicación por Webhook-Id
  if (wid) {
    try {
      await prisma.processedWebhook.create({ data: { id: wid } });
    } catch {
      return new Response("duplicate", { status: 200, headers: { "Cache-Control": "no-store" } });
    }
  }

  // 3) Parse robusto del payload
  let p = {};
  try { p = JSON.parse(bodyBuf.toString("utf8")); } catch {}
  const sub =
    p.app_subscription ??
    p.appSubscription ??
    p.app_subscriptions ??
    p?.data?.app_subscription ??
    p?.data?.appSubscription ??
    p;

  const gid = sub?.admin_graphql_api_id || sub?.id || null;
  const subscriptionId = gid ? String(gid).replace(/^gid:\/\/shopify\/AppSubscription\//, "") : null;
  const rawStatus = sub?.status || null;
  const status = rawStatus ? String(rawStatus).toUpperCase() : null;
  const name = sub?.name || sub?.line_items?.[0]?.name || null;
  const trialEndsAt = sub?.trial_ends_on || sub?.trial_ends_at || null;

  // 4) Persistencia (idempotente)
  try {
    await setSubscription(shop, { subscriptionId, status, name, trialEndsAt });
  } catch (e) {
    console.error("setSubscription failed:", e?.message || e);
    // devolvemos 200 igualmente para no provocar reintentos infinitos
  }

  return new Response("ok", { status: 200, headers: { "Cache-Control": "no-store" } });
}


