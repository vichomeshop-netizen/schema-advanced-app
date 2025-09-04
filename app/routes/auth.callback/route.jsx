// app/routes/auth.callback/route.jsx
import { redirect, json } from "@remix-run/node";
import { shopify } from "~/lib/shopify.server";
import { db } from "~/lib/db.server";

export async function loader({ request }) {
  const url = new URL(request.url);

  // DEBUG: confirma que la ruta responde sin tocar la SDK
  if (url.searchParams.get("__debug") === "1") {
    return json({
      ok: true,
      route: "/auth/callback",
      received: Object.fromEntries(url.searchParams.entries()),
    }, { headers: { "cache-control": "no-store" }});
  }

  try {
    const { session, shop, scope } = await shopify.auth.callback({
      isOnline: false,
      rawRequest: request,
    });

    await db.upsertShop({ shop, accessToken: session.accessToken, scope });

    const host = url.searchParams.get("host");
    return redirect(`/app?shop=${encodeURIComponent(shop)}${host ? `&host=${encodeURIComponent(host)}` : ""}`);
  } catch (e) {
    // Log a Vercel (mira “Functions → Logs”)
    console.error("[/auth/callback] error", { url: String(url), err: String(e?.message || e) });

    return json({
      ok: false,
      where: "/auth/callback",
      message: String(e?.message || e),
      received: Object.fromEntries(url.searchParams.entries()),
      tip: "Si dice 'state' o 'HMAC', revisa cookies y Allowed Redirect URL.",
    }, { status: 401, headers: { "cache-control": "no-store" }});
  }
}
// ⚠️ SIN export default

