import { redirect } from "@remix-run/node";
import { shopify } from "../lib/shopify.server.js"; // <- OJO: relativo y con .js

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  if (!shop || !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(shop)) {
    throw new Response("Parámetro ?shop inválido. Ej: ?shop=tu-tienda.myshopify.com", { status: 400 });
  }

  const authUrl = await shopify.auth.begin({
    shop,
    callbackPath: "/auth/callback",
    isOnline: false,
  });

  return redirect(authUrl);
}

export default function AuthIndex() { return null; }
