// app/routes/api.billing.start.jsx
import { redirect, json } from "@remix-run/node";
import { getShop } from "~/lib/shop.server";

const ADMIN_API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-07";

const LIVE_Q = /* GraphQL */ `
  query {
    currentAppInstallation {
      activeSubscriptions { id name status }
    }
  }
`;

const MUTATION = /* GraphQL */ `
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
}
`;

async function adminGraphql(shop, accessToken, query, variables) {
  const res = await fetch(`https://${shop}/admin/api/${ADMIN_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": accessToken },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Response(`Admin GQL ${res.status}: ${txt}`, { status: res.status, headers: { "Cache-Control": "no-store" } });
  }
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
  const host = url.searchParams.get("host") || "";
  if (!shop) return json({ error: "missing shop" }, { status: 400, headers: { "Cache-Control": "no-store" } });

  const s = await getShop(shop);

  // 🔒 Si no hay token o la app está desinstalada, NO iniciar billing.
  if (!s?.accessToken || s?.subscriptionStatus === "UNINSTALLED") {
    return new Response("not installed", { status: 410, headers: { "Cache-Control": "no-store" } });
  }

  // URL de retorno (usa APP_URL si existe para coherencia con el resto de la app)
  const base = (process.env.APP_URL?.replace(/\/+$/, "") || url.origin);
  const returnUrl = `${base}/app?shop=${encodeURIComponent(shop)}${host ? `&host=${encodeURIComponent(host)}` : ""}`;

  // 🛡️ Si ya hay una suscripción ACTIVA, vuelve al panel sin pasar por checkout
  try {
    const live = await adminGraphql(shop, s.accessToken, LIVE_Q, {});
    const sub = live?.data?.currentAppInstallation?.activeSubscriptions?.[0];
    if (sub?.status === "ACTIVE") {
      return redirect(returnUrl, { headers: { "Cache-Control": "no-store" } });
    }
  } catch {
    // no bloquea; continuamos con el intento de crear
  }

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
            interval: "EVERY_30_DAYS", // ⬅️ explícito
          },
        },
      },
    ],
    test: TEST_MODE,
  };

  const data = await adminGraphql(shop, s.accessToken, MUTATION, vars);
  const out = data?.data?.appSubscriptionCreate;

  if (out?.userErrors?.length) {
    const msg = out.userErrors.map((e) => e.message).join("; ").toLowerCase();
    // Si ya existe suscripción activa/pendiente, vuelve al panel
    if (msg.includes("active subscription") || msg.includes("already")) {
      return redirect(returnUrl, { headers: { "Cache-Control": "no-store" } });
    }
    return json({ error: "billing_error", details: out.userErrors }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }

  const confirmationUrl = out?.confirmationUrl;
  if (!confirmationUrl) {
    // fallback defensivo
    return redirect(returnUrl, { headers: { "Cache-Control": "no-store" } });
  }
  return redirect(confirmationUrl, { headers: { "Cache-Control": "no-store" } });
}

export async function action({ request }) { return start(request); }
export async function loader({ request }) { return start(request); } // GET auto-redirect

