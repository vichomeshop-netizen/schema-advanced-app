// app/routes/api.billing.active.jsx
import { json } from "@remix-run/node";
import { getShop } from "~/lib/shop.server";
const V = process.env.SHOPIFY_API_VERSION || "2024-10";
const Q = `query{ currentAppInstallation{ activeSubscriptions{ id name status } } }`;
export async function loader({ request }) {
  const url = new URL(request.url); const shop = url.searchParams.get("shop");
  if (!shop) return json({ error:"missing shop" }, 400);
  const s = await getShop(shop); if (!s?.accessToken) return json({ error:"no token" }, 401);
  const r = await fetch(`https://${shop}/admin/api/${V}/graphql.json`, {
    method:"POST", headers:{ "Content-Type":"application/json","X-Shopify-Access-Token": s.accessToken },
    body: JSON.stringify({ query: Q })
  });
  const data = await r.json(); return json({ data });
}
export const action = loader;
