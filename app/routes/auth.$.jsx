import { redirect } from "@remix-run/node";
import { shopify } from "~/lib/shopify.server";
import { db } from "~/lib/db.server";              // usa alias "~" para evitar duplicados
import { saeTokenCookie } from "~/lib/sae-cookie.server";

export async function loader({ request, params }) {
  const tail = (params["*"] || "").toLowerCase();

  if (tail === "callback") {
    const { session, shop, scope } = await shopify.auth.callback({
      isOnline: false,
      rawRequest: request,
    });

    // Guarda en memoria
    await db.upsertShop({ shop, accessToken: session.accessToken, scope });

    // + Emite cookie firmada (fallback si caes en otra instancia)
    const cookieVal = JSON.stringify({ shop, accessToken: session.accessToken, scope });
    const setCookie = await saeTokenCookie.serialize(cookieVal);

    const q = new URL(request.url).searchParams;
    const host = q.get("host");
    return redirect(`/app?shop=${encodeURIComponent(shop)}${host ? `&host=${encodeURIComponent(host)}` : ""}`, {
      headers: { "Set-Cookie": setCookie },
    });
  }

  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  if (shop) {
    const authUrl = await shopify.auth.begin({
      shop,
      callbackPath: "/auth/callback",
      isOnline: false,
    });
    return redirect(authUrl);
  }

  return new Response("Usa /auth?shop=tu-tienda.myshopify.com para iniciar OAuth", { status: 400 });
}

export default function AuthCatchAll() { return null; }
