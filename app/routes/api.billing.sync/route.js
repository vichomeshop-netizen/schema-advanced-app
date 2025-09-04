import { json } from "@remix-run/node";
import { getShop, setSubscription } from "~/lib/shop.server";

const V = process.env.SHOPIFY_API_VERSION || "2024-10";
const Q = `query {
  currentAppInstallation {
    activeSubscriptions {
      id name status
    }
  }
}`;

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  if (!shop) return json({ ok:false, error:"missing shop" }, { status: 400 });

  const s = await getShop(shop);
  if (!s?.accessToken) return json({ ok:false, error:"no token" }, { status: 401 });

  const r = await fetch(`https://${shop}/admin/api/${V}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type":"application/json", "X-Shopify-Access-Token": s.accessToken },
    body: JSON.stringify({ query: Q }),
  });
  const data = await r.json();
  const sub = data?.data?.currentAppInstallation?.activeSubscriptions?.[0];

  if (sub) {
    const id = String(sub.id).replace(/^gid:\/\/shopify\/AppSubscription\//, "");
    await setSubscription(shop, {
      subscriptionId: id,
      status: sub.status,            // "ACTIVE"
      name: sub.name,
      trialEndsAt: null,
    });
    return json({ ok:true, status:"SYNCED_TO_ACTIVE", id, name: sub.name });
  } else {
    await setSubscription(shop, {
      subscriptionId: null,
      status: "CANCELLED",
      name: null,
      trialEndsAt: null,
    });
    return json({ ok:true, status:"SYNCED_TO_CANCELLED" });
  }
}

export const action = loader;
