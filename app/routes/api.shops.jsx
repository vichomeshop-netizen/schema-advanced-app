import { json } from "@remix-run/node";
import { db } from "~/lib/db.server";

export async function loader() {
  const shops = await db.listShops(); // [{ shop, accessToken, scope, installedAt, updatedAt }]
  const safe = shops.map(s => ({
    shop: s.shop,
    scope: s.scope ?? "",
    installedAt: s.installedAt,
    updatedAt: s.updatedAt,
    accessTokenPreview: s.accessToken ? `${s.accessToken.slice(0,4)}…${s.accessToken.slice(-4)}` : null,
  }));
  return json({ count: safe.length, shops: safe }, { headers: { "cache-control": "no-store" } });
}
