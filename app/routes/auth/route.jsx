// app/routes/auth/route.jsx
import { redirect, json } from "@remix-run/node";
import { shopify } from "~/lib/shopify.server";

function respondHTML(html) {
  return new Response("<!DOCTYPE html>"+html, { headers: { "content-type": "text/html; charset=utf-8" } });
}

// Quita trailing slash a APP_URL y construye absolutos si necesitas
const ABS = (p) => (process.env.APP_URL?.replace(/\/+$/,"") || "") + (p.startsWith("/") ? p : "/"+p);

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || "";
  const embedded = url.searchParams.get("embedded") === "1";
  const host = url.searchParams.get("host") || "";

  // DEBUG rápido
  if (url.searchParams.get("__debug") === "1") {
    const req = ["SHOPIFY_API_KEY","SHOPIFY_API_SECRET","SCOPES","APP_URL","SHOPIFY_API_VERSION","SESSION_SECRET"];
    const envStatus = Object.fromEntries(req.map(k => [k, process.env[k] ? "set" : "MISSING"]));
    return json({ ok:true, route:"/auth", shop, embedded, host, envStatus }, { headers: { "cache-control": "no-store" }});
  }

  if (!shop) return new Response("Falta ?shop=mi-tienda.myshopify.com", { status: 400 });

  // 1) Si venimos EMBEDDED, hacemos bounce al top y volvemos a /auth en top-level
  if (embedded || host) {
    const params = new URLSearchParams({ shop }); // sin embedded/host
    const topUrl = ABS(`/auth?${params.toString()}`);
    return respondHTML(`
<html><body>
<script>
  // Saca la navegación al top (fuera del iframe)
  var target = ${JSON.stringify(topUrl)};
  if (window.top === window.self) { window.location.href = target; }
  else { window.top.location.href = target; }
</script>
</body></html>`);
  }

  // 2) Ya en top-level: inicia OAuth con la SDK y propaga Set-Cookie
  //    (stub para que la SDK pueda escribir headers en Serverless)
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
      rawResponse: stubRes, // <- la SDK pondrá Set-Cookie + Location aquí si lo necesita
    });

    // URL de destino (directa o leída del stub)
    let location = (typeof result === "string") ? result : result?.url;
    if (!location) location = stubRes.getHeader("location") || stubRes.getHeader("Location");
    if (!location) throw new Error("Unexpected begin() result: no redirect URL");

    // Propaga cookies (state) al navegador
    const headers = new Headers();
    const fromResult = (result && result.headers) || {};
    const resSetCookie = fromResult["set-cookie"] || fromResult["Set-Cookie"];
    const stubSetCookie = stubRes.getHeader("set-cookie");
    const cookies = []
      .concat(Array.isArray(resSetCookie) ? resSetCookie : (resSetCookie ? [resSetCookie] : []))
      .concat(Array.isArray(stubSetCookie) ? stubSetCookie : (stubSetCookie ? [stubSetCookie] : []));
    for (const c of cookies) headers.append("Set-Cookie", c);

    return redirect(location, { headers });
  } catch (e) {
    // Fallback manual para diagnosticar si hiciera falta
    const clientId = process.env.SHOPIFY_API_KEY || "";
    const scopes = (process.env.SCOPES || "").trim();
    const redirectUri = ABS("/auth/callback");
    if (!clientId || !scopes || !redirectUri) {
      return json({ ok:false, where:"/auth", message:String(e?.message||e), details:{ clientId:!!clientId, scopes:!!scopes, redirectUri }}, { status:500 });
    }
    const manualUrl =
      `https://${shop}/admin/oauth/authorize` +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${encodeURIComponent(crypto.randomUUID())}`;
    return redirect(manualUrl);
  }
}
// SIN export default


