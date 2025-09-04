import { json } from "@remix-run/node";
import { prisma } from "~/lib/prisma.server";
import { ensureWebhooks } from "~/lib/ensure-webhooks.server";

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
