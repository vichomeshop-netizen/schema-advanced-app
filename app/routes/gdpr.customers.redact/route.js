// app/routes/gdpr.customers.redact/route.js
import { verifyWebhookHmac } from "~/lib/verify-hmac.server";
export async function action({ request }) {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const hmac = request.headers.get("X-Shopify-Hmac-Sha256") || "";
  const body = Buffer.from(await request.arrayBuffer());
  if (!verifyWebhookHmac(body, hmac)) return new Response("unauthorized", { status: 401 });

  // TODO: borra/anonimiza datos del customer indicado (id + email) en tu BD
  return new Response("ok", { status: 200 });
}
export const loader = () => new Response("Not Found", { status: 404 });
