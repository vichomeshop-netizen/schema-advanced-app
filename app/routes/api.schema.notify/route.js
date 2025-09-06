// app/routes/api.schema.notify/route.js
import { json } from "@remix-run/node";
import { prisma } from "~/lib/prisma.server";

export async function action({ request }) {
  let payload = {};
  try { payload = await request.json(); } catch {}
  const shop = payload?.shop;
  const ok = !!payload?.ok;
  const path = payload?.path || "/";

  if (!shop) return json({ error: "missing shop" }, { status: 400 });

  // Ajusta a tu modelo real. Ejemplo: campos en la tabla Shop
  try {
    await prisma.shop.update({
      where: { shop },
      data: {
        schemaDetected: ok,
        schemaLastPath: path,
        schemaLastPingAt: new Date(),
      },
    });
  } catch (e) {
    // si la actualización falla, no tires la UI
  }

  return json({ ok: true });
}

// Opcional: evita 405 en GET
export async function loader() {
  return json({ ok: true });
}
