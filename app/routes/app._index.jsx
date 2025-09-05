// app/routes/app._index.jsx
import { json } from "@remix-run/node";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { prisma } from "~/lib/prisma.server";

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || null;
  const rec = shop ? await prisma.shop.findUnique({ where: { shop } }) : null;
  return json({
    shop,
    subscriptionStatus: rec?.subscriptionStatus ?? null,
    planName: rec?.planName ?? null,
  });
}

const TEXT = {
  es: {
    title: "Schema Advanced — Panel de inicio",
    intro:
      "Este panel combina el onboarding con la guía completa. Las pestañas de la izquierda (Productos, Colecciones, Ajustes) son informativas: no hacen cambios en la tienda; explican qué emite la app y cómo validarlo.",
    onboardingTitle: "Inicio rápido (Onboarding)",
    onboardingHtml: `
      <ol>
        <li><strong>Activa el App embed</strong> en <em>Tienda online → Temas → Personalizar → App embeds</em>.</li>
        <li><strong>Publica/valida el marcado</strong> (Product, CollectionPage, WebSite, FAQPage, HowTo, BreadcrumbList, etc.).</li>
        <li>Comprueba con la
          <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">Prueba de resultados enriquecidos</a>
          y el <a href="https://validator.schema.org/" target="_blank" rel="noreferrer">Validador de Schema.org</a>.
        </li>
      </ol>
      <p>Consejo: si el tema ya emite JSON-LD, activa el <em>supresor</em> para evitar duplicados.</p>
    `,
    guideTitle: "Guía completa",
    guideHtml: `
      <p><strong>Cómo funciona:</strong> La app inserta JSON-LD con <code>data-sae="1"</code>. Puedes revisarlo en el código fuente o con las herramientas de validación.</p>
      <ul>
        <li><strong>Organization</strong> en todas las páginas</li>
        <li><strong>WebSite</strong> (home opcional) con <code>SearchAction</code></li>
        <li><strong>BreadcrumbList</strong> (toggle)</li>
        <li><strong>CollectionPage</strong> + <strong>FAQPage</strong> (metafield/metaobjects)</li>
        <li><strong>Product</strong> con <strong>AggregateOffer/Offer</strong>, <code>OfferShippingDetails</code>, <code>MerchantReturnPolicy</code></li>
        <li><strong>BlogPosting</strong> y <strong>HowTo</strong> (auto desde H2)</li>
        <li><strong>ContactPage</strong> y <strong>AboutPage</strong></li>
        <li>Supresor JSON-LD del tema (opcional)</li>
      </ul>
    `,
    ctas: {
      openEditor: "Abrir editor de temas",
      openRRT: "Abrir Rich Results Test",
      scrollGuide: "Ir a la guía",
    },
    badgeActive: (planName) => `Plan activo${planName ? ` — ${planName}` : ""}`,
    badgeInactive: "Sin suscripción",
  },
  en: {
    title: "Schema Advanced — Home panel",
    intro:
      "This panel merges onboarding with the full guide. Left tabs (Products, Collections, Settings) are informational: they don’t change the store; they describe outputs and validation.",
    onboardingTitle: "Quick start (Onboarding)",
    onboardingHtml: `
      <ol>
        <li><strong>Enable the App embed</strong> in <em>Online Store → Themes → Customize → App embeds</em>.</li>
        <li><strong>Publish/validate</strong> the markup (Product, CollectionPage, WebSite, FAQPage, HowTo, BreadcrumbList, etc.).</li>
        <li>Verify with
          <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">Rich Results Test</a>
          and the <a href="https://validator.schema.org/" target="_blank" rel="noreferrer">Schema.org Validator</a>.
        </li>
      </ol>
      <p>Tip: if your theme already emits JSON-LD, enable the <em>suppressor</em> to avoid duplicates.</p>
    `,
    guideTitle: "Full guide",
    guideHtml: `
      <p><strong>How it works:</strong> The app injects JSON-LD tagged with <code>data-sae="1"</code>. Inspect the source or validate with Google tools.</p>
      <ul>
        <li><strong>Organization</strong> on all pages</li>
        <li><strong>WebSite</strong> (optional on home) with <code>SearchAction</code></li>
        <li><strong>BreadcrumbList</strong> (toggle)</li>
        <li><strong>CollectionPage</strong> + <strong>FAQPage</strong> (metafields/metaobjects)</li>
        <li><strong>Product</strong> with <strong>AggregateOffer/Offer</strong>, <code>OfferShippingDetails</code>, <code>MerchantReturnPolicy</code></li>
        <li><strong>BlogPosting</strong> and <strong>HowTo</strong> (auto from H2)</li>
        <li><strong>ContactPage</strong> and <strong>AboutPage</strong></li>
        <li>Theme JSON-LD suppressor (optional)</li>
      </ul>
    `,
    ctas: {
      openEditor: "Open Theme Editor",
      openRRT: "Open Rich Results Test",
      scrollGuide: "Go to guide",
    },
    badgeActive: (planName) => `Active plan${planName ? ` — ${planName}` : ""}`,
    badgeInactive: "No subscription",
  },
  pt: {
    title: "Schema Advanced — Painel inicial",
    intro:
      "Este painel une o onboarding com o guia completo. As abas à esquerda (Produtos, Coleções, Definições) são informativas: não alteram a loja; explicam saídas e validação.",
    onboardingTitle: "Início rápido (Onboarding)",
    onboardingHtml: `
      <ol>
        <li><strong>Ative o App embed</strong> em <em>Online Store → Themes → Customize → App embeds</em>.</li>
        <li><strong>Publique/valide</strong> o markup (Product, CollectionPage, WebSite, FAQPage, HowTo, BreadcrumbList, etc.).</li>
        <li>Verifique com
          <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">Rich Results Test</a>
          e o <a href="https://validator.schema.org/" target="_blank" rel="noreferrer">Schema.org Validator</a>.
        </li>
      </ol>
      <p>Dica: se o tema já emite JSON-LD, ative o <em>supressor</em> para evitar duplicados.</p>
    `,
    guideTitle: "Guia completo",
    guideHtml: `
      <p><strong>Como funciona:</strong> O app injeta JSON-LD com <code>data-sae="1"</code>. Revise no código-fonte ou valide nas ferramentas do Google.</p>
      <ul>
        <li><strong>Organization</strong> em todas as páginas</li>
        <li><strong>WebSite</strong> (home opcional) com <code>SearchAction</code></li>
        <li><strong>BreadcrumbList</strong> (toggle)</li>
        <li><strong>CollectionPage</strong> + <strong>FAQPage</strong> (metafields/metaobjects)</li>
        <li><strong>Product</strong> com <strong>AggregateOffer/Offer</strong>, <code>OfferShippingDetails</code>, <code>MerchantReturnPolicy</code></li>
        <li><strong>BlogPosting</strong> e <strong>HowTo</strong> (auto desde H2)</li>
        <li><strong>ContactPage</strong> e <strong>AboutPage</strong></li>
        <li>Supressor de JSON-LD do tema (opcional)</li>
      </ul>
    `,
    ctas: {
      openEditor: "Abrir editor de temas",
      openRRT: "Abrir Rich Results Test",
      scrollGuide: "Ir ao guia",
    },
    badgeActive: (planName) => `Plano ativo${planName ? ` — ${planName}` : ""}`,
    badgeInactive: "Sem assinatura",
  },
};

// Helper local: abre el editor de temas en top, soporta admin.shopify.com y admin clásico
function openThemeEditorFromQS() {
  if (typeof window === "undefined") return;
  const qs = new URLSearchParams(window.location.search);
  const shop = qs.get("shop") || "";
  const store = shop.replace(".myshopify.com", "");
  const href = store
    ? `https://admin.shopify.com/store/${store}/themes`
    : `https://${shop || window.location.hostname}/admin/themes`;
  window.top.location.href = href;
}

export default function Panel() {
  const { lang } = useOutletContext() || { lang: "es" };
  const t = TEXT[lang] || TEXT.es;

  const { subscriptionStatus, planName } = useLoaderData();
  const isActive = subscriptionStatus === "ACTIVE";

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: 1.5 }}>
      {/* Badge de estado de suscripción */}
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

      {/* Onboarding al principio */}
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
          <a
            href="https://search.google.com/test/rich-results"
            target="_blank"
            rel="noreferrer"
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
          <a
            href="#guide"
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#fff",
              color: "#111827",
              textDecoration: "none",
            }}
          >
            {t.ctas.scrollGuide}
          </a>
        </div>
      </section>

      {/* Guía completa fusionada con el panel */}
      <section
        id="guide"
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


