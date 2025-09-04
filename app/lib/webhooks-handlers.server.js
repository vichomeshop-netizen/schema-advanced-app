import crypto from "node:crypto";
import { prisma } from "~/lib/prisma.server";

function verifyHmac(raw, hmacHeader) {
  const digest = crypto
    .createHmac("sha256", process.env.SHOPIFY_API_SECRET)
    .update(raw, "utf8")
    .digest("base64");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader || "", "utf8"));
}

export async function handleAppUninstalled({ request }) {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const topic = request.headers.get("X-Shopify-Topic") || "";
  const shop = request.headers.get("X-Shopify-Shop-Domain") || "";
  const hmac = request.headers.get("X-Shopify-Hmac-Sha256") || "";

  const raw = await request.text();
  if (!verifyHmac(raw, hmac)) return new Response("Invalid HMAC", { status: 401 });

  // Marca la tienda como desinstalada (ajusta a tu esquema)
  try {
    await prisma.shop.update({
      where: { shop },
      data: {
        accessToken: null,
        subscriptionStatus: "UNINSTALLED",
        subscriptionId: null,
      },
    });
  } catch (e) {
    // Si no existe la fila, ignora
  }

  return new Response("ok", { status: 200 });
}
