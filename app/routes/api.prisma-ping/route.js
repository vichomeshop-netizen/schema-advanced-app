import { json } from "@remix-run/node";
import { prisma } from "~/lib/prisma.server";

export async function loader() {
  try {
    await prisma.$queryRaw`SELECT 1 as ok`;
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: e?.message || String(e) }, 500);
  }
}
