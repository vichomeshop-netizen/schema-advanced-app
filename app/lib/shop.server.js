import { prisma } from "~/lib/prisma.server";

export async function upsertShop({ shop, accessToken, scope }) {
  if (!shop || !accessToken) throw new Error("upsertShop requiere { shop, accessToken }");
  return prisma.shop.upsert({
    where: { shop },
    create: { shop, accessToken, scope: scope ?? "" },
    update: { accessToken, scope: scope ?? undefined },
  });
}

export function getShop(shop) {
  return prisma.shop.findUnique({ where: { shop } });
}

export function listShops() {
  return prisma.shop.findMany({ orderBy: { installedAt: "desc" } });
}

export function deleteShop(shop) {
  return prisma.shop.delete({ where: { shop } });
}

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
