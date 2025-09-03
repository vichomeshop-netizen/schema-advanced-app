import { redirect } from "@remix-run/node";
import { shopify } from "~/lib/shopify.server";

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  if (!shop || !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(shop)) {
    throw new Response("Parámetro ?shop inválido", { status: 400 });
  }

  const authUrl = await shopify.auth.begin({
    shop,
    callbackPath: "/auth/callback",
    isOnline: false, // offline token
  });

  return redirect(authUrl);
}

export default function Auth() { return null; }
