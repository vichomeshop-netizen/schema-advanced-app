import { redirect } from "@remix-run/node";
import { shopify } from "~/lib/shopify.server"; // <- relativo y con .js
import { db } from "../lib/db.server.js";           // <- relativo y con .js

export async function loader({ request, params }) {
  const tail = (params["*"] || "").toLowerCase();

  if (tail === "callback") {
    const { session, shop, scope } = await shopify.auth.callback({
      isOnline: false,
      rawRequest: request,
    });

    await db.upsertShop({ shop, accessToken: session.accessToken, scope });

    const q = new URL(request.url).searchParams;
    const host = q.get("host");
    return redirect(`/app?shop=${encodeURIComponent(shop)}${host ? `&host=${encodeURIComponent(host)}` : ""}`);
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
