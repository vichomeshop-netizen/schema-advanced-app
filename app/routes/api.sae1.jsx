// app/routes/api.sae1.js
import { json } from "@remix-run/node";

const UA =
  "SchemaAdvanced/1.0 (+https://tu-app.example) detection bot";
const DETECT_RE = /data-sae\s*=\s*["']?1["']?/i;

export async function loader({ request }) {
  const { searchParams } = new URL(request.url);
  const shop = (searchParams.get("shop") || "").trim();

  if (!shop || !/^[a-z0-9-]+\.myshopify\.com$/i.test(shop)) {
    return json({ active: false, error: "missing_or_invalid_shop" }, { status: 400 });
  }

  // Usa la home por defecto. Si tu embed solo carga en producto/colección,
  // cambia a una URL que *sepas* que incluye el embed.
  const url = `https://${shop}/?sae_probe=1`;

  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "user-agent": UA,
        "accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "es-ES,es;q=0.9,en;q=0.8",
        "cache-control": "no-cache",
        pragma: "no-cache",
      },
    });

    const text = await res.text();
    const found = DETECT_RE.test(text);
    return json(
      {
        active: !!found,
        status: res.status,
        finalUrl: res.url,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (e) {
    return json(
      { active: false, error: e?.message || String(e) },
      { status: 200 }
    );
  }
}
