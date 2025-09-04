// app/lib/ensure-webhooks.server.js
const API_VER = process.env.SHOPIFY_API_VERSION || "2024-10";

function normalizeBase(u) { return (u || "").replace(/\/+$/, ""); }

export async function ensureWebhooks({ shop, accessToken, appUrl }) {
  const base = normalizeBase(appUrl);
  const desired = [
    { topic: "app/uninstalled",          address: `${base}/webhooks/app_uninstalled` },
    { topic: "app_subscriptions/update", address: `${base}/webhooks/app_subscriptions_update` },
  ];

  // 1) listar existentes
  const list = await fetch(`https://${shop}/admin/api/${API_VER}/webhooks.json`, {
    headers: { "X-Shopify-Access-Token": accessToken },
  }).then(r => r.json());
  const existing = list.webhooks || [];

  // 2) por cada topic deseado, eliminar los que no coinciden en address y crear si falta el exacto
  const ops = [];
  for (const d of desired) {
    const current = existing.filter(w => w.topic === d.topic);
    const exact = current.find(w => w.address === d.address);

    for (const w of current) {
      if (w.address !== d.address) {
        ops.push(fetch(`https://${shop}/admin/api/${API_VER}/webhooks/${w.id}.json`, {
          method: "DELETE",
          headers: { "X-Shopify-Access-Token": accessToken },
        }));
      }
    }
    if (!exact) {
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

  // 3) opcional: eliminar cualquier otro webhook de tu app que no esté en 'desired'
  const desiredKeys = new Set(desired.map(d => `${d.topic}|${d.address}`));
  for (const w of existing) {
    const key = `${w.topic}|${w.address}`;
    if (!desiredKeys.has(key) && (w.topic === "app/uninstalled" || w.topic === "app_subscriptions/update")) {
      ops.push(fetch(`https://${shop}/admin/api/${API_VER}/webhooks/${w.id}.json`, {
        method: "DELETE",
        headers: { "X-Shopify-Access-Token": accessToken },
      }));
    }
  }

  await Promise.allSettled(ops);
  return { ok: true };
}
