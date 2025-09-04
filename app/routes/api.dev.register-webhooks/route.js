import { json } from "@remix-run/node";
import { getShop } from "~/lib/shop.server";
const V = process.env.SHOPIFY_API_VERSION || "2024-10";

async function reg(shop, token, topic, address) {
  const res = await fetch(`https://${shop}/admin/api/${V}/webhooks.json`, {
    method: "POST",
    headers: {
      "Content-Type":"application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ webhook: { topic, address, format: "json" } }),
  });
  let body = null;
  try { body = await res.json(); } catch {}
  return { ok: res.ok, status: res.status, body };
}

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  if (!shop) return json({ error: "missing shop" }, 400);

  const s = await getShop(shop);
  if (!s?.accessToken) return json({ error: "no token" }, 401);

  const base = (process.env.APP_URL || "").replace(/\/$/, "");
  if (!base) return json({ error: "APP_URL missing" }, 500);

  const r1 = await reg(shop, s.accessToken, "app/uninstalled", `${base}/webhooks/app_uninstalled`);
  const r2 = await reg(shop, s.accessToken, "app_subscriptions/update", `${base}/webhooks/app_subscriptions_update`);

  return json({ shop, results: { uninstalled: r1, subscriptions_update: r2 } });
}
