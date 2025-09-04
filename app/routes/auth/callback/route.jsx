import { redirect, json } from "@remix-run/node";
import { shopify } from "~/lib/shopify.server";
import { db } from "~/lib/db.server";

export async function loader({ request }) {
  const url = new URL(request.url);

  // Sonda opcional
  if (url.searchParams.get("__debug") === "1") {
    return json({ ok:true, route:"/auth/callback", received:Object.fromEntries(url.searchParams.entries()) });
  }

  try {
    const { session, shop, scope } = await shopify.auth.callback({
      isOnline: false,
      rawRequest: request,
    });

    await db.upsertShop({ shop, accessToken: session.accessToken, scope });

    const host = url.searchParams.get("host");
    return redirect(`/app?shop=${encodeURIComponent(shop)}${host ? `&host=${encodeURIComponent(host)}` : ""}`);
  } catch (e) {
    return json({
      ok:false,
      where:"/auth/callback",
      message:String(e?.message||e),
      received:Object.fromEntries(url.searchParams.entries()),
    }, { status: 401 });
  }
}
// 👈 SIN export default
