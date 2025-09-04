// app/lib/ensure-webhooks.server.js
const API_VER = process.env.SHOPIFY_API_VERSION || "2024-10";

function normalizeBase(u) { return (u || "").replace(/\/+$/, ""); }

export async function ensureWebhooks({ shop, accessToken, appUrl }) {
  const base = normalizeBase(appUrl);

  const desired = [
    { topic: "app/uninstalled",          address: `${base}/webhooks/app_uninstalled` },
    { topic: "app_subscriptions/update", address: `${base}/webhooks/app_subscriptions_update` },
  ];

  // 1) Lista existentes (cliente-side filter por seguridad)
  const listRes = await fetch(`https://${shop}/admin/api/${API_VER}/webhooks.json`, {
    headers: { "X-Shopify-Access-Token": accessToken },
  });
  const { webhooks = [] } = await listRes.json();

  // 2) Para cada deseado: si existe EXACTO → NO crear; borra variantes con otra address si quieres exclusividad
  for (const d of desired) {
    const sameTopic = webhooks.filter(w => w.topic === d.topic);
    const exact = sameTopic.find(w => w.address === d.address);

    // (Opcional) Exclusividad: elimina otros del MISMO topic con address distinta
    for (const w of sameTopic) {
      if (w.address !== d.address) {
        await fetch(`https://${shop}/admin/api/${API_VER}/webhooks/${w.id}.json`, {
          method: "DELETE",
          headers: { "X-Shopify-Access-Token": accessToken },
        });
      }
    }

    // Si ya existe el EXACTO → skip creación
    if (exact) continue;

    // 3) Crear si falta (maneja 422 como éxito idempotente)
    const createRes = await fetch(`https://${shop}/admin/api/${API_VER}/webhooks.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ webhook: { topic: d.topic, address: d.address, format: "json" } }),
    });

    if (createRes.status === 422) {
      // address for this topic has already been taken → tratar como OK
      // (puede venir de una carrera entre instancias)
      continue;
    }

    if (!createRes.ok) {
      const text = await createRes.text().catch(() => "");
      console.error("WEBHOOK_CREATE_FAIL", d.topic, createRes.status, text);
    }
  }
}

