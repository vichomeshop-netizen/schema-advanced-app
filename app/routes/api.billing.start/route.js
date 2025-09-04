
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
    return ["development", "partner_test", "affiliate"].some((k) => plan.includes(k));
  } catch {
    return false;
  }
}

async function start(request) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  if (!shop) return json({ error: "missing shop" }, 400);

  const s = await getShop(shop);
  if (!s?.accessToken) return json({ error: "no token" }, 401);

  const returnUrl =
    process.env.BILLING_RETURN_URL || `${url.origin}/app?shop=${encodeURIComponent(shop)}`;

  // TEST MODE si tienda dev o forzado por env
  const TEST_MODE =
    (await isDevShop(shop, s.accessToken)) || process.env.BILLING_TEST === "1";

  const vars = {
    name: "Schema Advanced — Monthly",
    returnUrl,
    trialDays: 7,
    lineItems: [
      {
        plan: {
          appRecurringPricingDetails: {
            price: { amount: 9.99, currencyCode: "EUR" },
            // interval: "EVERY_30_DAYS", // descomenta si tu versión lo exige
          },
        },
      },
    ],
    test: TEST_MODE,
  };

  const data = await adminGraphql(shop, s.accessToken, MUTATION, vars);
  const out = data?.data?.appSubscriptionCreate;

  // Si Shopify devolvió errores de negocio
  if (out?.userErrors?.length) {
    const msg = out.userErrors.map((e) => e.message).join("; ").toLowerCase();

    // Fallback: si ya hay una suscripción activa y Shopify no nos da confirmationUrl,
    // volvemos al panel (el loader hará check en vivo / webhook hará sync)
    if (msg.includes("active subscription") || msg.includes("already")) {
      return redirect(returnUrl);
    }
    return json({ error: out.userErrors }, 400);
  }

  const confirmationUrl = out?.confirmationUrl;
  if (!confirmationUrl) {
    // Último recurso: volver al panel
    return redirect(returnUrl);
  }

  return redirect(confirmationUrl);
}

export async function action({ request }) {
  return start(request);
}

// Permitimos GET para auto-redirect (sin botón)
export async function loader({ request }) {
  return start(request);
}
