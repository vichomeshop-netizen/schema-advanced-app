// app/routes/api.billing.start.jsx
import { redirect, json } from "@remix-run/node";
import { getShop } from "~/lib/shop.server";

const ADMIN_API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-10";
const MUTATION = `
mutation CreateSubscription(
  $name: String!,
  $returnUrl: URL!,
  $trialDays: Int,
  $lineItems: [AppSubscriptionLineItemInput!]!,
  $test: Boolean
) {
  appSubscriptionCreate(
    name: $name,
    returnUrl: $returnUrl,
    trialDays: $trialDays,
    lineItems: $lineItems,
    test: $test
  ) {
    userErrors { field message }
    confirmationUrl
    appSubscription { id name status }
  }
}`;

async function adminGraphql(shop, accessToken, query, variables) {
  const res = await fetch(`https://${shop}/admin/api/${ADMIN_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": accessToken },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Response(`Admin GQL ${res.status}`, { status: res.status });
  return res.json();
}

async function isDevShop(shop, accessToken) {
  try {
    const r = await fetch(`https://${shop}/admin/api/${ADMIN_API_VERSION}/shop.json`, {
      headers: { "X-Shopify-Access-Token": accessToken },
    });
    if (!r.ok) return false;
    const j = await r.json();
    const plan = (j?.shop?.plan_name || "").toLowerCase();
    // development/partner_test/affiliate suelen indicar tienda de desarrollo
    return ["development", "partner_test", "affiliate"].some((k) => plan.includes(k));
  } catch {
    return false;
  }
}

export async function action({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  if (!shop) return json({ error: "missing shop" }, 400);

  const s = await getShop(shop);
  if (!s?.accessToken) return json({ error: "no token" }, 401);

  const returnUrl = process.env.BILLING_RETURN_URL || `${url.origin}/app?shop=${shop}`;

  // TEST MODE: true si tienda dev o si fuerzas con ENV
  const TEST_MODE = (await isDevShop(shop, s.accessToken)) || process.env.BILLING_TEST === "1";

  const vars = {
    name: "Schema Advanced — Monthly",
    returnUrl,
    trialDays: 7,
    lineItems: [
      {
        plan: {
          appRecurringPricingDetails: {
            price: { amount: 9.99, currencyCode: "EUR" },
            // interval: "EVERY_30_DAYS", // opcional: si tu versión lo requiere, descomenta
          },
        },
      },
    ],
    test: TEST_MODE, // <<— clave para no pedir tarjeta en dev
  };

  const data = await adminGraphql(shop, s.accessToken, MUTATION, vars);
  const out = data?.data?.appSubscriptionCreate;
  if (!out) return json({ error: "no response" }, 500);
  if (out.userErrors?.length) return json({ error: out.userErrors }, 400);

  return redirect(out.confirmationUrl);
}

export const loader = () => json({ ok: true });
