// app/routes/webhooks.app_uninstalled/route.js
import crypto from "node:crypto";
import { deleteShop } from "~/lib/shop.server";

// Verificación HMAC correcta (header en base64)
function verifyHmac(buf, hmacHeader) {
  const digest = crypto
    .createHmac("sha256", process.env.SHOPIFY_API_SECRET)
    .update(buf) // buf es Buffer con el raw body
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

export async function action({ request }) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const hmac = request.headers.get("X-Shopify-Hmac-Sha256") || "";
  const shop = request.headers.get("X-Shopify-Shop-Domain") || "";
  const topic = request.headers.get("X-Shopify-Topic") || "";
  const bodyBuf = Buffer.from(await request.arrayBuffer());

  if (!verifyHmac(bodyBuf, hmac)) {
    return new Response("unauthorized", { status: 401 });
  }

  // (Opcional) Asegura que es el tópico correcto
  if (topic !== "app/uninstalled") {
    return new Response("wrong topic", { status: 400 });
  }

  if (shop) {
    try {
      await deleteShop(shop); // o marca como UNINSTALLED si prefieres conservar registro
    } catch (e) {
      // Idempotente: si ya no existe, responde 200 para que Shopify no reintente
      console.warn("APP_UNINSTALLED deleteShop warn:", e?.message || e);
    }
  }

  return new Response("ok", { status: 200 });
}

export const loader = () => new Response("Not Found", { status: 404 });
