// app/routes/app._index.jsx
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { prisma } from "~/lib/prisma.server";

/** Deriva shop desde host (base64url) si falta ?shop= */
function decodeShopFromHost(hostB64url) {
  try {
    const base64 = hostB64url.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = Buffer.from(base64, "base64").toString("utf8");
    const m = decoded.match(/([a-z0-9-]+\.myshopify\.com)/i);
    return m?.[1] ?? null;
  } catch {
    return null;
  }
}

export async function loader({ request }) {
  const url = new URL(request.url);
  let shop = url.searchParams.get("shop");
  const host = url.searchParams.get("host");

  if (!shop && host) {
    const fromHost = decodeShopFromHost(host);
    if (fromHost) shop = fromHost;
  }
  if (!shop) return redirect("/auth");

  const rec = await prisma.shop.findUnique({ where: { shop } });
  if (!rec?.accessToken) return redirect(`/auth?shop=${encodeURIComponent(shop)}`);

  return json({
    shop,
    subscriptionStatus: rec?.subscriptionStatus ?? null,
    planName: rec?.planName ?? null,
  });
}

const TEXT = {
  es: {
    title: "Schema Advanced — Overview",
    intro:
      "Onboarding y guía en una sola vista. Las pestañas de la izquierda (Productos, Colecciones, Ajustes) son informativas: no cambian nada en tu tienda; explican qué emite la app y cómo validarlo.",
    onboardingTitle: "Inicio rápido",
    onboardingHtml: `
      <ol>
        <li><strong>Activa el App embed</strong> en <em>Tienda online → Temas → Personalizar → App embeds</em>.</li>
        <li><strong>Publica/valida</strong> el marcado (Product, CollectionPage, WebSite, FAQPage, HowTo, BreadcrumbList).</li>
        <li>Valida con la <em>Prueba de resultados enriquecidos</em> o el <em>Validador de Schema.org</em>.</li>
      </ol>
      <p>Si el tema ya emite JSON-LD, activa el <em>supresor</em> para evitar duplicados.</p>
    `,
    guideTitle: "Guía rápida",
    guideHtml: `
      <ul>
        <li><strong>Organization</strong> en todas las páginas</li>
        <li><strong>WebSite</strong> con <code>SearchAction</code> (home opcional)</li>
        <li><strong>BreadcrumbList</strong> (toggle)</li>
        <li><strong>CollectionPage</strong> + <strong>FAQPage</strong> (metafields/metaobjects)</li>
        <li><strong>Product</strong> con <strong>AggregateOffer/Offer</strong>, <code>OfferShippingDetails</code>, <code>MerchantReturnPolicy</code></li>
        <li><strong>BlogPosting</strong> y <strong>HowTo</strong> (auto desde H2)</li>
        <li><strong>ContactPage</strong> y <strong>AboutPage</strong></li>
      </ul>
    `,
    ctas: { openEditor: "Abrir editor de temas", openRRT: "Abrir Rich Results Test" },
    badgeActive: (planName) => `Plan activo${planName ? ` — ${planName}` : ""}`,
    badgeInactive: "Sin suscripción",
  },
  en: {
    title: "Schema Advanced — Overview",
    intro:
      "Onboarding and guide in one view. Left tabs (Products, Collections, Settings) are informational only: they don’t change your store; they document outputs and validation.",
    onboardingTitle: "Quick start",
    onboardingHtml: `
      <ol>
        <li><strong>Enable the App embed</strong> in <em>Online Store → Themes → Customize → App embeds</em>.</li>
        <li><strong>Publish/validate</strong> the markup (Product, CollectionPage, WebSite, FAQPage, HowTo, BreadcrumbList).</li>
        <li>Validate with the <em>Rich Results Test</em> or <em>Schema.org Validator</em>.</li>
      </ol>
      <p>If your theme already emits JSON-LD, enable the <em>suppressor</em> to avoid duplicates.</p>
    `,
    guideTitle: "Quick guide",
    guideHtml: `
      <ul>
        <li><strong>Organization</strong> on all pages</li>
        <li><strong>WebSite</strong> with <code>SearchAction</code> (optional on home)</li>
        <li><strong>BreadcrumbList</strong> (toggle)</li>
        <li><strong>CollectionPage</strong> + <strong>FAQPage</strong> (metafields/metaobjects)</li>
        <li><strong>Product</strong> with <strong>AggregateOffer/Offer</strong>, <code>OfferShippingDetails</code>, <code>MerchantReturnPolicy</code></li>
        <li><strong>BlogPosting</strong> and <strong>HowTo</strong> (auto from H2)</li>
        <li><strong>ContactPage</strong> and <strong>AboutPage</strong></li>
      </ul>
    `,
    ctas: { openEditor: "Open Theme Editor", openRRT: "Open Rich Results Test" },
    badgeActive: (planName) => `Active plan${planName ? ` — ${planName}` : ""}`,
    badgeInactive: "No subscription",
  },
  pt: {
    title: "Schema Advanced — Visão geral",
    intro:
      "Onboarding e guia em uma única vista. As abas à esquerda (Produtos, Coleções, Definições) são informativas: não alteram sua loja; documentam saídas e validação.",
    onboardingTitle: "Início rápido",
    onboardingHtml: `
      <ol>
        <li><strong>Ative o App embed</strong> em <em>Online Store → Themes → Customize → App embeds</em>.</li>
        <li><strong>Publique/valide</strong> o markup (Product, CollectionPage, WebSite, FAQPage, HowTo, BreadcrumbList).</li>
        <li>Valide com o <em>Rich Results Test</em> ou <em>Schema.org Validator</em>.</li>
      </ol>
      <p>Se o tema já emite JSON-LD, ative o <em>supressor</em> para evitar duplicados.</p>
    `,
    guideTitle: "Guia rápido",
    guideHtml: `
      <ul>
        <li><strong>Organization</strong> em todas as páginas</li>
        <li><strong>WebSite</strong> com <code>SearchAction</code> (home opcional)</li>
        <li><strong>BreadcrumbList</strong> (toggle)</li>
        <li><strong>CollectionPage</strong> + <strong>FAQPage</strong> (metafields/metaobjects)</li>
        <li><strong>Product</strong> com <strong>AggregateOffer/Offer</strong>, <code>OfferShippingDetails</code>, <code>MerchantReturnPolicy</code></li>
        <li><strong>BlogPosting</strong> e <strong>HowTo</strong> (auto desde H2)</li>
        <li><strong>ContactPage</strong> e <strong>AboutPage</strong></li>
      </ul>
    `,
    ctas: { openEditor: "Abrir editor de temas", openRRT: "Abrir Rich Results Test" },
    badgeActive: (planName) => `Plano ativo${planName ? ` — ${planName}` : ""}`,
    badgeInactive: "Sem assinatura",
  },
};

// Helper: abrir editor de temas (mismo patrón que usas en el layout)
function openThemeEditorFromQS() {
  if (typeof window === "undefined") return;
  const qs = new URLSearchParams(window.location.search);
  const shop = qs.get("shop") || "";
  const store = shop.replace(".myshopify.com", "");
  const href = store
    ? `https://admin.shopify.com/store/${store}/themes/current/editor?context=apps`
    : `https://${shop || window.location.hostname}/admin/themes/current/editor?context=apps`;
  window.top.location.href = href;
}

export default function Overview() {
  const { lang } = useOutletContext() || { lang: "es" };
  const t = TEXT[lang] || TEXT.es;

  const { subscriptionStatus, planName } = useLoaderData();
  const isActive = subscriptionStatus === "ACTIVE";

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: 1.5 }}>
      {/* Badge de suscripción */}
      <div style={{ marginBottom: 8 }}>
        <span
          style={{
            padding: "4px 8px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            border: isActive ? "1px solid #10b981" : "1px solid #d1d5db",
            color: isActive ? "#065f46" : "#374151",
            background: isActive ? "#ecfdf5" : "#f9fafb",
          }}
        >
          {isActive ? t.badgeActive(planName) : t.badgeInactive}
        </span>
      </div>

      <h1 style={{ fontSize: 22, marginBottom: 6 }}>{t.title}</h1>
      <p style={{ marginTop: 0, color: "#374151" }}>{t.intro}</p>

      {/* Onboarding */}
      <section
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          padding: 16,
          marginTop: 12,
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: 18 }}>{t.onboardingTitle}</h2>
        <div dangerouslySetInnerHTML={{ __html: t.onboardingHtml }} />

        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          <button
            onClick={openThemeEditorFromQS}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #111827",
              background: "#111827",
              color: "#fff",
              cursor: "pointer",
            }}
            type="button"
          >
            {t.ctas.openEditor}
          </button>

          {/* ÚNICO CTA a Rich Results (sin duplicar link) */}
          <a
            href="https://search.google.com/test/rich-results"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#fff",
              color: "#111827",
              textDecoration: "none",
            }}
          >
            {t.ctas.openRRT}
          </a>
        </div>
      </section>

      {/* Guía rápida */}
      <section
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          padding: 16,
          marginTop: 12,
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: 18 }}>{t.guideTitle}</h2>
        <div dangerouslySetInnerHTML={{ __html: t.guideHtml }} />
      </section>
    </div>
  );
}



