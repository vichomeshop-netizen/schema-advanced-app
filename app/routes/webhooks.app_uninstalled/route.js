import crypto from "node:crypto";
import { prisma } from "~/lib/prisma.server";

function verifyHmac(buf, hmacHeader) {
  const digest = crypto.createHmac("sha256", process.env.SHOPIFY_API_SECRET).update(buf).digest("base64");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest, "base64"), Buffer.from(hmacHeader || "", "base64"));
  } catch { return false; }
}

export async function action({ request }) {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const hmac = request.headers.get("X-Shopify-Hmac-Sha256") || "";
  const shop = request.headers.get("X-Shopify-Shop-Domain") || "";
  const topic = request.headers.get("X-Shopify-Topic") || "";
  const bodyBuf = Buffer.from(await request.arrayBuffer());
  if (!verifyHmac(bodyBuf, hmac)) return new Response("unauthorized", { status: 401 });
  if (topic !== "app/uninstalled") return new Response("wrong topic", { status: 400 });

  // 🔒 No borres la fila; déjala “revivible”
  await prisma.shop.update({
    where: { shop },
    data: { accessToken: null, subscriptionStatus: "UNINSTALLED", subscriptionId: null },
  }).catch(async () => {
    await prisma.shop.deleteMany({ where: { shop } }); // idempotente si no existe
  });

  return new Response("ok");
}
export const loader = () => new Response("Not Found", { status: 404 });
