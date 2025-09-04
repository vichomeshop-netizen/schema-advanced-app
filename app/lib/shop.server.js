// app/lib/shop.server.js
import { prisma } from "~/lib/prisma.server";

/**
 * Crea o actualiza una tienda por dominio.
 * - create: guarda shop, accessToken y scope ("" si no viene).
 * - update: actualiza accessToken y scope (si se pasa).
 */
export async function upsertShop({ shop, accessToken, scope }) {
  if (!shop || !accessToken) {
    throw new Error("upsertShop requiere { shop, accessToken }");
  }
  return prisma.shop.upsert({
    where: { shop },
    create: { shop, accessToken, scope: scope ?? "" },
    update: { accessToken, scope: scope ?? undefined },
  });
}

/** Devuelve una tienda por dominio (o null si no existe). */
export function getShop(shop) {
  return prisma.shop.findUnique({ where: { shop } });
}

/** Lista tiendas, ordenadas por fecha de instalación (desc). */
export function listShops() {
  return prisma.shop.findMany({ orderBy: { installedAt: "desc" } });
}

/** Elimina una tienda por dominio. */
export function deleteShop(shop) {
  return prisma.shop.delete({ where: { shop } });
}

/**
 * Actualiza datos de suscripción de la tienda.
 * Espera:
 *  - subscriptionId: string (puede ser ID simple o GID — normalízalo antes si quieres)
 *  - status: "ACTIVE" | "PENDING" | "CANCELLED" | ...
 *  - name: nombre del plan (opcional)
 *  - trialEndsAt: fecha (string ISO o Date) — conversión aquí.
 */
export function setSubscription(shop, { subscriptionId, status, name, trialEndsAt }) {
  return prisma.shop.update({
    where: { shop },
    data: {
      subscriptionId,
      subscriptionStatus: status,
      planName: name ?? undefined,
      trialEndsAt: trialEndsAt ? new Date(trialEndsAt) : undefined,
    },
  });
}

