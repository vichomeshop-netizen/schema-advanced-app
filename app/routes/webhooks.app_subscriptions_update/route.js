import crypto from "node:crypto";
import { setSubscription } from "~/lib/shop.server";

function verifyHmac(bodyBuffer, hmacHeader) {
  const digest = crypto.createHmac("sha256", process.env.SHOPIFY_API_SECRET)
    .update(bodyBuffer)
    .digest("base64");
  try {
    return hmacHeader && crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader, "utf8"));
  } catch {
    return false;
  }
}

export async function loader() {
  return new Response("Method Not Allowed", { status: 405 });
}

export async function action({ request }) {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const hmac = request.headers.get("X-Shopify-Hmac-Sha256") || "";
  const shop = (request.headers.get("X-Shopify-Shop-Domain") || "").toLowerCase();

  const bodyBuffer = Buffer.from(await request.arrayBuffer());
  if (!verifyHmac(bodyBuffer, hmac)) return new Response("unauthorized", { status: 401 });

  const p = JSON.parse(bodyBuffer.toString("utf8"));
  const sub =
    p.app_subscription ??
    p.appSubscription ??
    p.app_subscriptions ??
    p?.data?.app_subscription ??
    p?.data?.appSubscription ??
    p;

  const gid = sub?.admin_graphql_api_id || sub?.id || null;
  const subscriptionId = gid ? String(gid).replace(/^gid:\/\/shopify\/AppSubscription\//, "") : null;
  const status = sub?.status || null;
  const name = sub?.name || sub?.line_items?.[0]?.name || null;
  const trialEndsAt = sub?.trial_ends_on || sub?.trial_ends_at || null;

  try {
    await setSubscription(shop, { subscriptionId, status, name, trialEndsAt });
  } catch (e) {
    console.error("setSubscription failed:", e?.message || e);
    // devolvemos 200 igualmente para que Shopify no reintente sin fin
  }

  return new Response("ok");
}

