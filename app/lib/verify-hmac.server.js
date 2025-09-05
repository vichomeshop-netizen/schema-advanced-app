// app/lib/verify-hmac.server.js
import crypto from "node:crypto";
export function verifyWebhookHmac(buf, hmacHeader) {
  const digest = crypto.createHmac("sha256", process.env.SHOPIFY_API_SECRET)
    .update(buf).digest("base64");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(digest, "base64"),
      Buffer.from(hmacHeader || "", "base64")
    );
  } catch { return false; }
}
