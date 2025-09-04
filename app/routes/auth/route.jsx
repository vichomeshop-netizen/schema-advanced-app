import { redirect, json } from "@remix-run/node";
import { shopify } from "~/lib/shopify.server";

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  // Debug: ver envs sin exponer secretos
  if (url.searchParams.get("__debug") === "1") {
    const req = ["SHOPIFY_API_KEY","SHOPIFY_API_SECRET","SCOPES","APP_URL","SHOPIFY_API_VERSION","SESSION_SECRET"];
    const envStatus = Object.fromEntries(req.map(k => [k, process.env[k] ? "set" : "MISSING"]));
    return json({ ok:true, route:"/auth", shop, envStatus }, { headers:{ "cache-control":"no-store" }});
  }

  if (!shop) return new Response("Falta ?shop=mi-tienda.myshopify.com", { status: 400 });

  try {
    const authUrl = await shopify.auth.begin({
      shop,
      callbackPath: "/auth/callback",
      isOnline: false,
    });
    return redirect(authUrl); // 302 directo (sin HTML intermedio)
  } catch (e) {
    return json({ ok:false, where:"/auth", message:String(e?.message||e) }, { status:500 });
  }
}
// 👈 SIN export default
