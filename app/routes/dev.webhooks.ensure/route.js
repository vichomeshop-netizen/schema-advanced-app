import { json } from "@remix-run/node";
import { prisma } from "~/lib/prisma.server";

const API_VER = process.env.SHOPIFY_API_VERSION || "2024-10";

function normalizeBase(u) { return (u || "").replace(/\/+$/, ""); }

async function ensureWebhooks({ shop, accessToken, appUrl }) {
  const base = normalizeBase(appUrl);
  const wanted = [
    { topic: "app/uninstalled",          address: `${base}/webhooks/app_uninstalled` },
    { topic: "app_subscriptions/update", address: `${base}/webhooks/app_subscriptions_update` },
  ];

  const listRes = await fetch(`https://${shop}/admin/api/${API_VER}/webhooks.json`, {
    headers: { "X-Shopify-Access-Token": accessToken },
  });
  const { webhooks = [] } = await listRes.json();

  const ops = [];

  for (const w of webhooks) {
    const keep = wanted.find(d => d.topic === w.topic && d.address === w.address);
    const isManaged = w.topic === "app/uninstalled" || w.topic === "app_subscriptions/update";
    if (isManaged && !keep) {
      ops.push(fetch(`https://${shop}/admin/api/${API_VER}/webhooks/${w.id}.json`, {
        method: "DELETE",
        headers: { "X-Shopify-Access-Token": accessToken },
      }));
    }
  }

  for (const d of wanted) {
    const exists = webhooks.find(w => w.topic === d.topic && w.address === d.address);
    if (!exists) {
      ops.push(fetch(`https://${shop}/admin/api/${API_VER}/webhooks.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({ webhook: { topic: d.topic, address: d.address, format: "json" } }),
      }));
    }
  }

  await Promise.allSettled(ops);
  return { ok: true, changed: ops.length };
}

export async function loader({ request }) {
  const url  = new URL(request.url);
  const key  = url.searchParams.get("key") || "";
  const shop = url.searchParams.get("shop") || "";

  if (key !== process.env.INTERNAL_KEY) return new Response("forbidden", { status: 403 });
  if (!shop) return json({ error: "missing shop" }, { status: 400 });

  const rec = await prisma.shop.findUnique({ where: { shop } });
  if (!rec?.accessToken) return json({ error: "no token for shop" }, { status: 404 });

  const appUrl = (process.env.APP_URL || "").replace(/\/+$/, "");
  const out = await ensureWebhooks({ shop, accessToken: rec.accessToken, appUrl });
  return json(out);
}

export const action = loader; // por si haces POST

