// /public/embed  (Remix: archivo public.embed.js -> ruta /public/embed)
import { prisma } from "~/lib/prisma.server";

const HEADERS = {
  "Content-Type": "application/javascript",
  // Caché súper agresivo para no cachear nada:
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = (url.searchParams.get("shop") || "").toLowerCase().trim();

  // Si no viene shop, devolvemos no-op seguro
  if (!shop) {
    return new Response("/* schema-advanced embed: missing ?shop */", { headers: HEADERS });
  }

  // Lee estado de la DB (tolerante a errores)
  let active = false;
  try {
    const rec = await prisma.shop.findUnique({ where: { shop } });
    active = rec?.subscriptionStatus === "ACTIVE";
  } catch {
    // Si falla la DB, mejor no hacer nada en el storefront
    return new Response(`/* schema-advanced embed: db error for ${shop} */`, { headers: HEADERS });
  }

  // NO-OP cuando no está activa la suscripción
  if (!active) {
    return new Response(`/* schema-advanced embed: inactive for ${shop} */`, { headers: HEADERS });
  }

  // JS cuando está ACTIVA (idempotente: evita duplicar si ya existe)
  const js = `
  (function(){
    try{
      if (document.querySelector('script[type="application/ld+json"][data-sae="1"]')) return;
      var el = document.createElement("script");
      el.type = "application/ld+json";
      el.dataset.sae = "1";
      el.text = JSON.stringify({
        "@context":"https://schema.org",
        "@type":"Organization",
        "name": document.title
      });
      document.head.appendChild(el);
    }catch(e){ /* swallow */ }
  })();`;

  return new Response(js, { headers: HEADERS });
}

