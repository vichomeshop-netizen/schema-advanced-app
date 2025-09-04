// app/routes/auth/route.jsx
import { redirect, json } from "@remix-run/node";
import { shopify } from "~/lib/shopify.server";

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (url.searchParams.get("__debug") === "1") {
    const req = ["SHOPIFY_API_KEY","SHOPIFY_API_SECRET","SCOPES","APP_URL","SHOPIFY_API_VERSION","SESSION_SECRET"];
    const envStatus = Object.fromEntries(req.map(k => [k, process.env[k] ? "set" : "MISSING"]));
    return json({ ok:true, route:"/auth", shop, envStatus });
  }

  if (!shop) return new Response("Falta ?shop=mi-tienda.myshopify.com", { status: 400 });

  try {
    const result = await shopify.auth.begin({
      shop,
      callbackPath: "/auth/callback",
      isOnline: false,
      rawRequest: request,               // <-- IMPORTANTE
      // rawResponse: no es necesario en Remix, devolvemos nosotros el redirect
    });

    // Compatibilidad con distintas versiones del SDK:
    if (typeof result === "string") {
      return redirect(result);
    }
    if (result?.url) {
      return redirect(result.url, { headers: result.headers ?? {} });
    }

    // Si llegamos aquí, algo raro devolvió el SDK:
    return json({ ok:false, where:"/auth", message:"Unexpected begin() result", result }, { status: 500 });
  } catch (e) {
    return json({ ok:false, where:"/auth", message:String(e?.message || e) }, { status: 500 });
  }
}
// ⚠️ SIN export default
