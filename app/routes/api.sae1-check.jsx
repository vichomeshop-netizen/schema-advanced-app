// app/routes/api.sae1-check.jsx
const HEADERS = { "Content-Type": "application/json", "Cache-Control": "no-store" };

// Seguridad básica: solo http/https y tamaño limitado
function isSafeUrl(u) {
  try {
    const x = new URL(u);
    return (x.protocol === "https:" || x.protocol === "http:");
  } catch { return false; }
}

export async function loader({ request }) {
  const url = new URL(request.url);
  const target = url.searchParams.get("url") || "";

  if (!isSafeUrl(target)) {
    return new Response(JSON.stringify({ ok:false, error:"Invalid URL" }), { status:400, headers:HEADERS });
  }

  try {
    const r = await fetch(target, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": "SchemaAdvancedBot/1.0 (+https://schema-advanced-app.vercel.app)"
      },
    });

    const text = await r.text();
    // Limita a 1MB por si acaso
    const body = text.slice(0, 1_000_000);

    // Busca exacto `data-sae="1"` y, por si acaso, también "SAE1"
    const hasDataAttr = /data-sae\s*=\s*["']1["']/i.test(body);
    const hasSAE1 = /SAE1/i.test(body);

    return new Response(JSON.stringify({
      ok: true,
      status: r.status,
      found: !!(hasDataAttr || hasSAE1),
      foundDataAttr: hasDataAttr,
      foundSAE1: hasSAE1,
    }), { headers: HEADERS });

  } catch (e) {
    return new Response(JSON.stringify({ ok:false, error:String(e) }), { status:500, headers:HEADERS });
  }
}
