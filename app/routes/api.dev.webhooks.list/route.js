import { json } from "@remix-run/node";
import { getShop } from "~/lib/shop.server";
const V = process.env.SHOPIFY_API_VERSION || "2024-10";

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  if (!shop) return json({ error: "missing shop" }, 400);

  const s = await getShop(shop);
  if (!s?.accessToken) return json({ error: "no token" }, 401);

  const res = await fetch(`https://${shop}/admin/api/${V}/webhooks.json`, {
    headers: { "X-Shopify-Access-Token": s.accessToken }
  });
  const body = await res.json().catch(() => null);
  return json({ status: res.status, body });
}
