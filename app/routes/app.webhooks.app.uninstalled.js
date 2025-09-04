import crypto from "node:crypto";
import { deleteShop } from "~/lib/shop.server";

// Verificación HMAC (Shopify)
function verifyHmac(bodyBuffer, hmacHeader) {
  const digest = crypto.createHmac("sha256", process.env.SHOPIFY_API_SECRET)
    .update(bodyBuffer)
    .digest("base64");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader || "", "utf8"));
  } catch {
    return false;
  }
}

export async function action({ request }) {
  const hmac = request.headers.get("X-Shopify-Hmac-Sha256") || "";
  const shop = (request.headers.get("X-Shopify-Shop-Domain") || "").toLowerCase();

  const bodyBuffer = Buffer.from(await request.arrayBuffer());
  if (!verifyHmac(bodyBuffer, hmac)) {
    return new Response("unauthorized", { status: 401 });
  }

  // Opcional: borra el shop al desinstalar (o comenta si prefieres conservarlo)
  try {
    if (shop) await deleteShop(shop);
  } catch (e) {
    console.error("uninstalled alias deleteShop error:", e);
  }

  return new Response("ok");
}

export const loader = action; // por si Shopify hace una verificación por GET
