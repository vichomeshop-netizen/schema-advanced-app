import { redirect, json } from "@remix-run/node";
import { shopify } from "~/lib/shopify.server";
import { db } from "~/lib/db.server";

export async function loader({ request }) {
  const url = new URL(request.url);
  console.log("[/auth/callback] hit");

  try {
    const { session, shop, scope } = await shopify.auth.callback({
      isOnline: false,
      rawRequest: request,
    });

    console.log("[/auth/callback] session", { shop, hasAccessToken: !!session?.accessToken, scope });

    await db.upsertShop({ shop, accessToken: session.accessToken, scope });

    const host = url.searchParams.get("host");
    return redirect(`/app?shop=${encodeURIComponent(shop)}${host ? `&host=${encodeURIComponent(host)}` : ""}`);
  } catch (e) {
    console.error("[/auth/callback] error", e);
    // modo debug: devuelve qué llegó
    const received = Object.fromEntries(url.searchParams.entries());
    return json({ ok:false, where:"/auth/callback", message:String(e?.message||e), received }, { status: 401 });
  }
}

export default function AuthCallbackRoute() { return null; }
