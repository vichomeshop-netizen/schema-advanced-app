import { json, redirect } from "@remix-run/node";
import { getShop } from "~/lib/shop.server";

const V = process.env.SHOPIFY_API_VERSION || "2024-10";

async function adminGql(shop, token, query, variables) {
  const r = await fetch(`https://${shop}/admin/api/${V}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  const j = await r.json();
  if (!r.ok) throw new Response(`Admin GQL ${r.status}`, { status: r.status });
  return j;
}

const MUT_CANCEL = `
mutation Cancel($id: ID!) {
  appSubscriptionCancel(id: $id) {
    userErrors { field message }
    appSubscription { id status }
  }
}`;

const Q_ACTIVE = `
query {
  currentAppInstallation {
    activeSubscriptions { id }
  }
}`;

export async function action({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  let id = url.searchParams.get("id"); // opcional; si no viene lo buscamos

  if (!shop) return json({ ok:false, error:"missing shop" }, { status: 400 });
  const s = await getShop(shop);
  if (!s?.accessToken) return json({ ok:false, error:"no token" }, { status: 401 });

  // Busca la suscripción activa si no vino id
  if (!id) {
    const data = await adminGql(shop, s.accessToken, Q_ACTIVE, {});
    id = data?.data?.currentAppInstallation?.activeSubscriptions?.[0]?.id || null;
    if (id) id = String(id).replace(/^gid:\/\/shopify\/AppSubscription\//, "");
  }
  if (!id) return json({ ok:false, error:"no active subscription" }, { status: 400 });

  const gid = id.startsWith("gid://") ? id : `gid://shopify/AppSubscription/${id}`;

  const res = await adminGql(shop, s.accessToken, MUT_CANCEL, { id: gid });
  const err = res?.data?.appSubscriptionCancel?.userErrors?.[0];
  if (err) {
    const msg = `${(err.field || []).join(".")}: ${err.message}`;
    return json({ ok:false, error: msg }, { status: 400 });
  }

  // Vuelve al panel; el webhook/sync actualizará la DB a CANCELLED
  const returnUrl = `${process.env.APP_URL || url.origin}/app?shop=${encodeURIComponent(shop)}`;
  return redirect(returnUrl);
}

export const loader = () => json({ ok: true });
