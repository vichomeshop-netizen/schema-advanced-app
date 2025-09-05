import { json, redirect } from "@remix-run/node";
import { getShop } from "~/lib/shop.server";

const V = process.env.SHOPIFY_API_VERSION || "2025-07";

async function adminGql(shop, token, query, variables) {
  const r = await fetch(`https://${shop}/admin/api/${V}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  const txt = await r.text().catch(() => "");
  if (!r.ok) throw new Response(`Admin GQL ${r.status}: ${txt}`, { status: r.status, headers: { "Cache-Control": "no-store" } });
  try { return JSON.parse(txt); } catch { throw new Response("Invalid JSON from Admin API", { status: 502, headers: { "Cache-Control": "no-store" } }); }
}

const Q_ACTIVE = /* GraphQL */ `
  query {
    currentAppInstallation {
      activeSubscriptions { id name status }
    }
  }
`;

const MUT_CANCEL = /* GraphQL */ `
  mutation Cancel($id: ID!) {
    appSubscriptionCancel(id: $id) {
      userErrors { field message }
      appSubscription { id status }
    }
  }
`;

function toGid(id) {
  return id?.startsWith("gid://") ? id : `gid://shopify/AppSubscription/${id}`;
}

async function cancelRoute(request) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const host = url.searchParams.get("host") || "";
  let id = url.searchParams.get("id"); // opcional

  if (!shop) return json({ ok: false, error: "missing shop" }, { status: 400, headers: { "Cache-Control": "no-store" } });

  const rec = await getShop(shop);

  // Si no hay token o está desinstalada → no proceda a billing
  if (!rec?.accessToken || rec?.subscriptionStatus === "UNINSTALLED") {
    return new Response("not installed", { status: 410, headers: { "Cache-Control": "no-store" } });
  }

  const base = (process.env.APP_URL?.replace(/\/+$/, "") || url.origin);
  const returnUrl = `${base}/app?shop=${encodeURIComponent(shop)}${host ? `&host=${encodeURIComponent(host)}` : ""}`;

  // Si no vino id, buscamos la suscripción activa
  if (!id) {
    try {
      const data = await adminGql(shop, rec.accessToken, Q_ACTIVE, {});
      const sub = data?.data?.currentAppInstallation?.activeSubscriptions?.[0];
      if (!sub?.id) {
        // No hay suscripción activa → nada que cancelar
        return redirect(returnUrl, { headers: { "Cache-Control": "no-store" } });
      }
      id = sub.id;
    } catch {
      // Si el check falla, vuelve al panel (mejor UX que reventar)
      return redirect(returnUrl, { headers: { "Cache-Control": "no-store" } });
    }
  }

  const gid = toGid(id);

  // Intento de cancelación
  try {
    const res = await adminGql(shop, rec.accessToken, MUT_CANCEL, { id: gid });
    const err = res?.data?.appSubscriptionCancel?.userErrors?.[0];
    if (err) {
      const msg = (err.message || "").toLowerCase();
      // Trata "already cancelled"/"not active" como éxito idempotente
      if (msg.includes("already") || msg.includes("not active") || msg.includes("inactive")) {
        return redirect(returnUrl, { headers: { "Cache-Control": "no-store" } });
      }
      return json(
        { ok: false, error: { field: err.field, message: err.message } },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }
  } catch (e) {
    // Si el Admin API falla, vuelve al panel (tu webhook/sync lo actualizará si aplica)
    return redirect(returnUrl, { headers: { "Cache-Control": "no-store" } });
  }

  // El webhook app_subscriptions/update actualizará la DB; también puedes sincronizar aquí si quieres.
  return redirect(returnUrl, { headers: { "Cache-Control": "no-store" } });
}

export async function action({ request }) { return cancelRoute(request); }
export async function loader({ request }) { return cancelRoute(request); }

