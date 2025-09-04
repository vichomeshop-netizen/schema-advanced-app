// app/routes/auth.callback.jsx
import { redirect, json } from "@remix-run/node";
import { shopify } from "~/lib/shopify.server";
import { db } from "~/lib/db.server";

export async function loader({ request }) {
  console.log("[auth.callback] hit");

  let session, shop, scope;
  try {
    ({ session, shop, scope } = await shopify.auth.callback({
      isOnline: false,
      rawRequest: request,
    }));
  } catch (e) {
    console.error("[auth.callback] shopify.auth.callback error", e);
    return json({ ok:false, error:"callback-failed" }, { status: 401 });
  }

  console.log("[auth.callback] got session", { shop, hasAccessToken: !!session?.accessToken, scope });

  try {
    await db.upsertShop({ shop, accessToken: session.accessToken, scope });
  } catch (e) {
    console.error("[auth.callback] db.upsertShop error", e);
  }

  const q = new URL(request.url).searchParams;
  const host = q.get("host");
  const dest = `/app?shop=${encodeURIComponent(shop)}${host ? `&host=${encodeURIComponent(host)}` : ""}`;

  console.log("[auth.callback] redirect ->", dest);
  return redirect(dest);
}

export default function AuthCallback() { return null; }
