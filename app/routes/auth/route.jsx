import { redirect, json } from "@remix-run/node";
import { shopify } from "~/lib/shopify.server";

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const debug = url.searchParams.get("__debug") === "1";

  // Diagnóstico: presencia de envs (sin exponer secretos)
  const required = [
    "SHOPIFY_API_KEY",
    "SHOPIFY_API_SECRET",
    "SCOPES",
    "APP_URL",
    "SHOPIFY_API_VERSION",
    "SESSION_SECRET",
  ];
  const envStatus = Object.fromEntries(
    required.map((k) => [k, process.env[k] ? "set" : "MISSING"])
  );

  if (debug) {
    return json({
      ok: true,
      route: "/auth",
      shop,
      envStatus,
      note: "Si todo está 'set', prueba /auth normal. Si algo está MISSING, corrígelo en Vercel → Environment Variables.",
    }, { headers: { "cache-control":"no-store" }});
  }

  if (!shop) {
    return new Response("Falta ?shop=mi-tienda.myshopify.com", { status: 400 });
  }

  try {
    const authUrl = await shopify.auth.begin({
      shop,
      callbackPath: "/auth/callback",
      isOnline: false,
    });
    return redirect(authUrl);
  } catch (e) {
    return json({
      ok: false,
      where: "/auth",
      message: String(e?.message || e),
      envStatus,
      tip: "Si falta APP_URL/KEY/SECRET/SESSION_SECRET o SCOPES en Vercel, arranca aquí.",
    }, { status: 500, headers: { "cache-control":"no-store" }});
  }
}

export default function AuthRoute(){ return null; }
