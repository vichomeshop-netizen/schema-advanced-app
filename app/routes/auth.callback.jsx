// app/routes/auth.callback.jsx
import { redirect, json } from "@remix-run/node";
import { shopify } from "~/lib/shopify.server";
import { db } from "~/lib/db.server";

export async function loader({ request }) {
  const url = new URL(request.url);
  const debug = url.searchParams.get("__debug") === "1";
  const qs = Object.fromEntries(url.searchParams.entries()); // lo que nos manda Shopify

  // 1) prueba rápida: ¿entra la ruta?
  if (debug) {
    return json({ ok: true, route: "/auth/callback", received: qs }, { headers: { "cache-control":"no-store" }});
  }

  try {
    const { session, shop, scope } = await shopify.auth.callback({
      isOnline: false,
      rawRequest: request,
    });

    // 2) si llegamos aquí, el HMAC/STATE han pasado y tenemos token
    await db.upsertShop({ shop, accessToken: session.accessToken, scope });

    const host = url.searchParams.get("host");
    return redirect(`/app?shop=${encodeURIComponent(shop)}${host ? `&host=${encodeURIComponent(host)}` : ""}`);
  } catch (e) {
    // 3) en caso de error, devolvemos TODO para ver el motivo exacto
    return json({
      ok: false,
      where: "auth.callback",
      message: String(e?.message || e),
      tip:
        "Si el mensaje contiene 'HMAC' o 'state', revisa Allowed redirection URL en el Partner Dashboard y que begin() use callbackPath '/auth/callback'.",
      received: qs,
    }, { status: 401, headers: { "cache-control": "no-store" } });
  }
}

export default function AuthCallback(){ return null; }
