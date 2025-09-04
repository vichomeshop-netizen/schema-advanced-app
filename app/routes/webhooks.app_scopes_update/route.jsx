// app/routes/webhooks.app_scopes_update/route.jsx
import crypto from "node:crypto";

function verifyHmac(buf, hmac) {
  const digest = crypto.createHmac("sha256", process.env.SHOPIFY_API_SECRET).update(buf).digest("base64");
  try { return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac || "", "utf8")); } catch { return false; }
}

export async function action({ request }) {
  const h = request.headers.get("X-Shopify-Hmac-Sha256") || "";
  const buf = Buffer.from(await request.arrayBuffer());
  if (!verifyHmac(buf, h)) return new Response("unauthorized", { status: 401 });
  // No necesitamos mutar nada: solo confirmar recepción
  return new Response("ok");
}

// 👉 Esto evita el error en GET
export const loader = action;
