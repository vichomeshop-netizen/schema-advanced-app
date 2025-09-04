// app/routes/public.embed.js  → sirve /public/embed (pon .js para Content-Type claro)
import { prisma } from "~/lib/prisma.server";

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = (url.searchParams.get("shop") || "").toLowerCase();

  // Lee estado
  const rec = shop ? await prisma.shop.findUnique({ where: { shop } }) : null;
  const active = rec?.subscriptionStatus === "ACTIVE";

  // Si NO está activa → NO-OP (no hace nada en el storefront)
  if (!active) {
    return new Response(`/* schema-advanced embed: inactive for ${shop} */`, {
      headers: { "Content-Type": "application/javascript", "Cache-Control": "no-store" },
    });
  }

  // Si está activa → emite tu lógica (inyectar JSON-LD, etc.)
  const js = `
  (function(){
    try{
      // ejemplo mínimo: inyectar 1 script JSON-LD
      var el=document.createElement("script");
      el.type="application/ld+json";
      el.dataset.sae="1";
      el.text=JSON.stringify({ "@context":"https://schema.org", "@type":"Organization", "name":document.title });
      document.head.appendChild(el);
      // ...tu lógica real aquí...
    }catch(e){ /* swallow */ }
  })();`;

  return new Response(js, {
    headers: { "Content-Type": "application/javascript", "Cache-Control": "no-store" },
  });
}
