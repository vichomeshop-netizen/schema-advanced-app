// app/routes/api.oauth-check.$shop.jsx
import { json } from "@remix-run/node";
import { db } from "~/lib/db.server";

const API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-10";

export async function loader({ params }) {
  const shop = params.shop;
  if (!shop) return json({ ok:false, error:"Falta :shop" }, { status:400 });

  const rec = await db.getShop(shop);
  if (!rec?.accessToken) {
    return json({ ok:false, error:`No hay token para ${shop}` }, { status:404 });
  }

  const res = await fetch(`https://${shop}/admin/api/${API_VERSION}/shop.json`, {
    headers: { "X-Shopify-Access-Token": rec.accessToken, "Content-Type":"application/json" },
  });
  const text = await res.text();
  let body; try { body = JSON.parse(text); } catch { body = text; }

  if (!res.ok) return json({ ok:false, status:res.status, body }, { status:502 });

  return json({ ok:true, status:res.status, scope: rec.scope || null, shopInfo: body?.shop ?? body });
}

