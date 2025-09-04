import { redirect } from "@remix-run/node";
import { shopify } from "~/lib/shopify.server";

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  // debug opcional en logs
  console.log("[/auth] loader", { shop });

  if (!shop) {
    return new Response("Falta ?shop=mi-tienda.myshopify.com", { status: 400 });
  }

  const authUrl = await shopify.auth.begin({
    shop,
    callbackPath: "/auth/callback",
    isOnline: false,
  });

  return redirect(authUrl);
}

export default function AuthRoute() { return null; }
