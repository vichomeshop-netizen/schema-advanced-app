// app/routes/webhooks.app_uninstalled/route.js
import crypto from "node:crypto";
import { prisma } from "~/lib/prisma.server";

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

export async function action({ request }) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const hmac = request.headers.get("X-Shopify-Hmac-Sha256") || "";
  const shop = request.headers.get("X-Shopify-Shop-Domain") || "";
  const topic = request.headers.get("X-Shopify-Topic") || "";
  const wid   = request.headers.get("X-Shopify-Webhook-Id") || ""; // dedupe
  const bodyBuf = Buffer.from(await request.arrayBuffer());

  if (!verifyHmac(bodyBuf, hmac)) return new Response("unauthorized", { status: 401 });
  if (topic !== "app/uninstalled") return new Response("wrong topic", { status: 400 });

  // 0) DEDUPE por Webhook-Id (idempotente a nivel BD)
  if (wid) {
    try {
      await prisma.processedWebhook.create({ data: { id: wid } });
    } catch {
      // ya procesado
      return new Response("duplicate", { status: 200 });
    }
  }

  // 1) Marca desinstalada sin lanzar excepción si no existe
  const updated = await prisma.shop.updateMany({
    where: { shop },
    data: {
      accessToken: null,
      subscriptionStatus: "UNINSTALLED",
      subscriptionId: null,
      uninstalledAt: new Date(),
    },
  });

  if (updated.count === 0) {
    // Si no había fila, déjalo en logs (no devuelvas !=200 para que Shopify no reintente)
    console.warn("APP_UNINSTALLED for unknown shop:", shop);
  }

  return new Response("ok", { status: 200 });
}

export const loader = () => new Response("Not Found", { status: 404 });

