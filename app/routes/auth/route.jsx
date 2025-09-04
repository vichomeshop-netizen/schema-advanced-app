import { redirect, json } from "@remix-run/node";
import { shopify } from "~/lib/shopify.server";

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
    return json({ ok:true, route:"/auth", shop, envStatus });
  }

  if (!shop) return new Response("Falta ?shop=mi-tienda.myshopify.com", { status: 400 });

  // Stub de respuesta que soporta múltiples Set-Cookie
  const stubRes = {
    statusCode: 200,
    headers: Object.create(null),
    setHeader(name, value) {
      const k = name.toLowerCase();
      if (k === "set-cookie") {
        if (!this.headers[k]) this.headers[k] = [];
        if (Array.isArray(value)) this.headers[k].push(...value);
        else this.headers[k].push(value);
      } else {
        this.headers[k] = value;
      }
    },
    getHeader(name) { return this.headers[name.toLowerCase()]; },
    end() {},
  };

  try {
    const result = await shopify.auth.begin({
      shop,
      callbackPath: "/auth/callback",
      isOnline: false,
      rawRequest: request,
      rawResponse: stubRes, // <- la SDK escribirá Location y Set-Cookie aquí
    });

    // Determinar URL de destino (devolución directa o header)
    let location = (typeof result === "string") ? result : result?.url;
    if (!location) {
      location = stubRes.getHeader("location") || stubRes.getHeader("Location");
    }
    if (!location) {
      throw new Error("Unexpected begin() result: no redirect URL");
    }

    // Construir headers a reenviar (sobre todo Set-Cookie)
    const headers = new Headers();
    const fromResult = result?.headers ?? {};
    const resSetCookie = fromResult["set-cookie"] || fromResult["Set-Cookie"];
    const stubSetCookie = stubRes.getHeader("set-cookie");

    const cookies = []
      .concat(resSetCookie ?? [])
      .concat(stubSetCookie ?? []);
    for (const c of (Array.isArray(cookies) ? cookies : [cookies])) {
      if (c) headers.append("Set-Cookie", c);
    }

    return redirect(location, { headers });
  } catch (e) {
    // Fallback manual para diagnosticar si fuese necesario
    try {
      const clientId = process.env.SHOPIFY_API_KEY;
      const scopes = (process.env.SCOPES || "").trim();
      const redirectUri = abs("/auth/callback");
      const manualUrl =
        `https://${shop}/admin/oauth/authorize?client_id=${encodeURIComponent(clientId)}` +
        `&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&state=${encodeURIComponent(crypto.randomUUID())}`;
      return redirect(manualUrl);
    } catch (e2) {
      return json({ ok:false, where:"/auth", message:String(e?.message || e2) }, { status: 500 });
    }
  }
}
// (sin export default)

