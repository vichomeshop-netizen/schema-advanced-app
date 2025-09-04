import { prisma } from "~/lib/prisma.server";


export async function upsertShop({ shop, accessToken, scope }: { shop: string; accessToken: string; scope?: string; }) {
return prisma.shop.upsert({
where: { shop },
create: { shop, accessToken, scope: scope ?? "" },
update: { accessToken, scope: scope ?? undefined },
});
}


export async function getShop(shop: string) {
return prisma.shop.findUnique({ where: { shop } });
}


export async function listShops() {
return prisma.shop.findMany({ orderBy: { installedAt: "desc" } });
}


export async function deleteShop(shop: string) {
return prisma.shop.delete({ where: { shop } });
}


export async function setSubscription(shop: string, data: {
subscriptionId: string;
status: string;
name?: string;
trialEndsAt?: string | null;
}) {
return prisma.shop.update({
where: { shop },
data: {
subscriptionId: data.subscriptionId,
subscriptionStatus: data.status,
planName: data.name ?? undefined,
trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : undefined,
}
});
}