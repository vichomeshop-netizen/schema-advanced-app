// app/routes/app._index.jsx
import { useOutletContext } from "@remix-run/react";

const TEXT = {
  es: {
    title: "Schema Advanced — Guía",
    intro:
      "Esta guía detalla TODO lo que emite la app por tipo de página. Navega con las pestañas de la izquierda.",
    guideHtml: `
      <p><strong>Cómo usar:</strong> Activa el App embed en <em>Online Store → Themes → Customize → App embeds</em>.
      La app inserta scripts JSON-LD con <code>data-sae="1"</code>. Valida con la
      <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">Prueba de resultados enriquecidos</a>
      o el <a href="https://validator.schema.org/" target="_blank" rel="noreferrer">Validador de Schema.org</a>.</p>
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
  },
  en: {
    title: "Schema Advanced — Guide",
    intro:
      "This guide lists EVERYTHING the app outputs by page type. Use the left tabs to navigate.",
    guideHtml: `
      <p><strong>How to:</strong> Enable the App embed under <em>Online Store → Themes → Customize → App embeds</em>.
      The app injects JSON-LD tagged with <code>data-sae="1"</code>. Validate with
      <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">Google Rich Results Test</a>
      or the <a href="https://validator.schema.org/" target="_blank" rel="noreferrer">Schema.org Validator</a>.</p>
      <ul>
        <li><strong>Organization</strong> on all pages</li>
        <li><strong>WebSite</strong> (optional on home) with <code>SearchAction</code></li>
        <li><strong>BreadcrumbList</strong> (toggle)</li>
        <li><strong>CollectionPage</strong> + <strong>FAQPage</strong> (metafield/metaobjects)</li>
        <li><strong>Product</strong> with <strong>AggregateOffer/Offer</strong>, <code>OfferShippingDetails</code>, <code>MerchantReturnPolicy</code></li>
        <li><strong>BlogPosting</strong> and <strong>HowTo</strong> (auto from H2)</li>
        <li><strong>ContactPage</strong> and <strong>AboutPage</strong></li>
        <li>Theme JSON-LD suppressor (optional)</li>
      </ul>
    `,
  },
  pt: {
    title: "Schema Advanced — Guia",
    intro:
      "Este guia lista TUDO o que o app emite por tipo de página. Use as abas da esquerda para navegar.",
    guideHtml: `
      <p><strong>Como usar:</strong> Ative o App embed em <em>Online Store → Themes → Customize → App embeds</em>.
      O app injeta JSON-LD com <code>data-sae="1"</code>. Valide com o
      <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">Google Rich Results Test</a>
      ou o <a href="https://validator.schema.org/" target="_blank" rel="noreferrer">Schema.org Validator</a>.</p>
      <ul>
        <li><strong>Organization</strong> em todas as páginas</li>
        <li><strong>WebSite</strong> (home opcional) com <code>SearchAction</code></li>
        <li><strong>BreadcrumbList</strong> (toggle)</li>
        <li><strong>CollectionPage</strong> + <strong>FAQPage</strong> (metafield/metaobjects)</li>
        <li><strong>Product</strong> com <strong>AggregateOffer/Offer</strong>, <code>OfferShippingDetails</code>, <code>MerchantReturnPolicy</code></li>
        <li><strong>BlogPosting</strong> e <strong>HowTo</strong> (auto de H2)</li>
        <li><strong>ContactPage</strong> e <strong>AboutPage</strong></li>
        <li>Supressor de JSON-LD do tema (opcional)</li>
      </ul>
    `,
  },
};

export default function Panel() {
  const { lang } = useOutletContext() || { lang: "es" };
  const t = TEXT[lang] || TEXT.es;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: 1.5 }}>
      <h1 style={{ fontSize: 22, marginBottom: 6 }}>{t.title}</h1>
      <p style={{ marginTop: 0, color: "#374151" }}>{t.intro}</p>

      <section
        style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}
        dangerouslySetInnerHTML={{ __html: t.guideHtml }}
      />
    </div>
  );
}
