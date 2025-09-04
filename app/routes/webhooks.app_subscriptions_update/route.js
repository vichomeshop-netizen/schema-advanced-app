import crypto from "node:crypto";
import { setSubscription } from "~/lib/shop.server"; // usa tu helper

function verifyHmac(bodyBuffer, hmacHeader) {
  const digest = crypto
    .createHmac("sha256", process.env.SHOPIFY_API_SECRET)
    .update(bodyBuffer)
    .digest("base64");
  try {
    return (
      hmacHeader &&
      crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader, "utf8"))
    );
  } catch {
    return false;
  }
}

export async function loader() {
  return new Response("Method Not Allowed", { status: 405 });
}

export async function action({ request }) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const hmac = request.headers.get("X-Shopify-Hmac-Sha256") || "";
  const shop = (request.headers.get("X-Shopify-Shop-Domain") || "").toLowerCase();
  // (opcional) validar el topic:
  // const topic = request.headers.get("X-Shopify-Topic") || "";
  // if (topic !== "app_subscriptions/update") return new Response("Bad Topic", { status: 400 });

  const bodyBuffer = Buffer.from(await request.arrayBuffer());
  if (!verifyHmac(bodyBuffer, hmac)) {
    return new Response("unauthorized", { status: 401 });
  }

  // Parse robusto y extracción tolerante
  const json = JSON.parse(bodyBuffer.toString("utf8"));
  const gid =
    json.admin_graphql_api_id ||
    json.id ||
    json?.app_subscription?.id ||
    json?.appSubscription?.id ||
    null;

  const subscriptionId = gid
    ? String(gid).replace(/^gid:\/\/shopify\/AppSubscription\//, "")
    : null;

  const status =
    json.status ||
    json?.app_subscription?.status ||
    json?.appSubscription?.status ||
    null;

  const name =
    json.name ||
    json?.line_items?.[0]?.name ||
    json?.lineItems?.[0]?.name ||
    null;

  const trialEndsAt =
    json.trial_ends_on ||
    json.trial_ends_at ||
    json?.app_subscription?.trial_ends_on ||
    json?.app_subscription?.trial_ends_at ||
    null;

  try {
    await setSubscription(shop, {
      subscriptionId,
      status,        // tu helper puede mapearlo a subscriptionStatus
      name,          // tu helper puede mapearlo a planName
      trialEndsAt,   // Date o string; convierte dentro del helper si quieres
    });
  } catch (e) {
    console.error("setSubscription failed:", e?.message || e);
    // devolvemos 200 igualmente para que Shopify no reintente sin fin
  }

  return new Response("ok");
}
