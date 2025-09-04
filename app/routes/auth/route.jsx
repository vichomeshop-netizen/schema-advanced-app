import { redirect, json } from "@remix-run/node";
import { shopify } from "~/lib/shopify.server";

// util mínima para construir redirect_uri absoluta
function abs(p) {
  const base = process.env.APP_URL?.replace(/\/+$/, "") || "";
  return `${base}${p.startsWith("/") ? p : `/${p}`}`;
}

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  // Debug rápido
  if (url.searchParams.get("__debug") === "1") {
    const req = ["SHOPIFY_API_KEY","SHOPIFY_API_SECRET","SCOPES","APP_URL","SHOPIFY_API_VERSION","SESSION_SECRET"];
    const envStatus = Object.fromEntries(req.map(k => [k, process.env[k] ? "set" : "MISSING"]));
    return json({ ok:true, route:"/auth", shop, envStatus }, { headers:{ "cache-control":"no-store" }});
  }

  if (!shop) return new Response("Falta ?shop=mi-tienda.myshopify.com", { status: 400 });

  // --- 1) Intento normal con la SDK, pero pasando stubs para Node response ---
  const stubRes = {
    statusCode: 200,
    headers: {},
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    getHeader(name) { return this.headers[name.toLowerCase()]; },
    end() {},
  };

  try {
    const result = await shopify.auth.begin({
      shop,
      callbackPath: "/auth/callback",
      isOnline: false,
      rawRequest: request,
      rawResponse: stubRes,            // <- clave: evita el crash por statusCode/headers
    });

    // La SDK puede devolver string o { url, headers }
    if (typeof result === "string") {
      return redirect(result);
    }
    if (result?.url) {
      return redirect(result.url, { headers: result.headers ?? {} });
    }

    // Algunas versiones solo escriben en rawResponse (Location en headers)
    const location = stubRes.getHeader("location") || stubRes.getHeader("Location");
    if (location) {
      return redirect(location);
    }

    // Si no hay nada aprovechable, caemos al fallback manual
    throw new Error("Unexpected begin() result");
  } catch (e) {
    // --- 2) Fallback manual: construimos el authorize URL directamente ---
    try {
      const clientId = process.env.SHOPIFY_API_KEY;
      const scopes = (process.env.SCOPES || "").trim();
      const redirectUri = abs("/auth/callback");

      if (!clientId || !scopes || !redirectUri) {
        return json(
          { ok:false, where:"/auth", message:"Missing envs for manual fallback", details:{ clientId: !!clientId, scopes: !!scopes, redirectUri } },
          { status: 500 }
        );
      }

      // Nota: para offline no se envía `grant_options[]=per-user`
      const manualUrl =
        `https://${shop}/admin/oauth/authorize` +
        `?client_id=${encodeURIComponent(clientId)}` +
        `&scope=${encodeURIComponent(scopes)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&state=${encodeURIComponent(crypto.randomUUID())}`;

      // Este fallback NO pone cookie de state de la SDK, pero si el flujo te redirige
      // y el callback te falla por "state", sabremos que el problema era la SDK.
      return redirect(manualUrl);
    } catch (e2) {
      return json({ ok:false, where:"/auth (fallback)", message:String(e2?.message || e2) }, { status: 500 });
    }
  }
}
// (sin export default)
