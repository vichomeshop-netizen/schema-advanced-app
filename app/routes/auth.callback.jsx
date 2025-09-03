import { redirect } from "@remix-run/node";
import { shopify } from "~/lib/shopify.server";
import { db } from "~/lib/db.server"; // tu “DB” (aunque sea la temporal en memoria)

export async function loader({ request }) {
  const { session, shop, scope } = await shopify.auth.callback({
    isOnline: false,
    rawRequest: request,
  });

  await db.upsertShop({ shop, accessToken: session.accessToken, scope });

  const q = new URL(request.url).searchParams;
  const host = q.get("host");
  return redirect(`/app?shop=${encodeURIComponent(shop)}${host ? `&host=${encodeURIComponent(host)}` : ""}`);
}

export default function AuthCallback() { return null; }
