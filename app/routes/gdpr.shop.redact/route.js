// app/routes/gdpr.shop.redact/route.js
import { verifyWebhookHmac } from "~/lib/verify-hmac.server";
export async function action({ request }) {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const hmac = request.headers.get("X-Shopify-Hmac-Sha256") || "";
  const shop = request.headers.get("X-Shopify-Shop-Domain") || "";
  const body = Buffer.from(await request.arrayBuffer());
  if (!verifyWebhookHmac(body, hmac)) return new Response("unauthorized", { status: 401 });

  // TODO: elimina datos de la tienda (logs, backups, metadatos) en tu BD para `shop`
  return new Response("ok", { status: 200 });
}
export const loader = () => new Response("Not Found", { status: 404 });
