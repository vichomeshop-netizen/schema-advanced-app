// app/lib/db.server.js
// ⚠️ Implementación en memoria para desarrollo / pruebas.
// En Serverless (Vercel) puede resetearse en despliegues/cold starts.
// Para producción migra a Prisma (te paso esa versión cuando quieras).

const stores = new Map(); // key: shop domain, value: { shop, accessToken, scope, installedAt, updatedAt }

/**
 * Guarda o actualiza las credenciales de una tienda.
 * @param {{shop: string, accessToken: string, scope?: string}} param0
 */
async function upsertShop({ shop, accessToken, scope }) {
  if (!shop || !accessToken) {
    throw new Error("upsertShop requiere { shop, accessToken }");
  }
  const prev = stores.get(shop) || {};
  stores.set(shop, {
    shop,
    accessToken,
    scope: scope ?? prev.scope ?? "",
    installedAt: prev.installedAt || new Date(),
    updatedAt: new Date(),
  });
  return stores.get(shop);
}

/**
 * Devuelve la fila de la tienda (o null si no existe).
 * @param {string} shop
 */
async function getShop(shop) {
  return stores.get(shop) || null;
}

/**
 * Elimina la tienda (por ejemplo, al recibir APP_UNINSTALLED).
 * @param {string} shop
 */
async function deleteShop(shop) {
  stores.delete(shop);
  return true;
}

/**
 * (Opcional) Listado rápido para debug.
 */
async function listShops() {
  return Array.from(stores.values());
}

export const db = {
  upsertShop,
  getShop,
  deleteShop,
  listShops,
};
