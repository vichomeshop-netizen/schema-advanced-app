import crypto from "node:crypto";
import { deleteShop } from "~/lib/shop.server";

// Verificación HMAC (igual que en otros webhooks)
function verifyHmac(buf, hmacHeader) {
  const digest = crypto
    .createHmac("sha256", process.env.SHOPIFY_API_SECRET)
    .update(buf)
    .digest("base64");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(digest),
      Buffer.from(hmacHeader || "", "utf8")
    );
  } catch {
    return false;
  }
}

export async function action({ request }) {
  const hmac = request.headers.get("X-Shopify-Hmac-Sha256") || "";
  const shop = request.headers.get("X-Shopify-Shop-Domain") || "";
  const bodyBuf = Buffer.from(await request.arrayBuffer());

  if (!verifyHmac(bodyBuf, hmac)) {
    return new Response("unauthorized", { status: 401 });
  }

  // Shopify envía un body con info básica de la tienda (no lo necesitamos para borrar).
  // Si prefieres conservar el registro, cambia deleteShop() por un "markUninstalled".
  if (shop) {
    try {
      await deleteShop(shop);
    } catch (e) {
      // Idempotencia: si ya no existe, respondemos 200 igualmente para que Shopify no reintente.
      console.warn("APP_UNINSTALLED deleteShop warn:", e?.message || e);
    }
  }

  return new Response("ok");
}

// Reutilizamos action para GET (algunos validadores llaman por GET)
export const loader = action;
