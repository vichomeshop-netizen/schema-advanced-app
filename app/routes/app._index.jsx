// app/routes/app._index.jsx
import { useEffect, useState } from "react";
import { useOutletContext, useSearchParams } from "@remix-run/react";

// === STRINGS (EN/ES/PT) ===
const STRINGS = {
  en: {
    title: "Schema Advanced — Guide",
    intro:
      "Schema Advanced automatically injects high-quality JSON-LD into your Shopify store. Beginners can follow the quick steps below, while advanced users will find detailed explanations of each entity.",
    stepsTitle: "Quick start (for beginners)",
    steps: [
      "Go to Online Store → Themes → Customize",
      "Open the App embeds tab",
      "Enable Schema Advanced and save changes",
      'Visit your storefront and confirm <code>data-sae="1"</code> appears in the JSON-LD scripts',
      "Return here and check the status below shows Active",
    ],
    statusTitle: "Status",
    statusChecking: "Checking…",
    statusOk: "Active — app embed detected on the storefront",
    statusWarn: "Not detected — enable the app embed in your theme and reload your storefront",
    retry: "Retry check",
    openEditor: "Open theme editor",
    whatTitle: "What does Schema Advanced add?",
    whatIntro:
      "Schema Advanced provides a complete set of JSON-LD entities designed for SEO rich results:",
    whatList: [
      "<strong>Organization</strong>: business name, legal name, logo, image, contact info.",
      "<strong>WebSite</strong>: site search (<code>SearchAction</code>).",
      "<strong>BreadcrumbList</strong>: hierarchical navigation (Home → Collection → Product).",
      "<strong>CollectionPage</strong>: metadata for category pages.",
      "<strong>FAQPage</strong>: FAQs extracted from metafields or metaobjects.",
      "<strong>Product</strong>: GTIN, MPN, SKU, images, brand, description, pricing.",
      "<strong>AggregateOffer</strong>: structured price range for multi-variant products.",
      "<strong>AggregateRating</strong>: average rating and count, if reviews are available.",
      "<strong>BlogPosting</strong>: articles metadata.",
      "<strong>HowTo</strong>: auto-generated from article headings.",
      "<strong>ContactPage</strong> and <strong>AboutPage</strong>.",
    ],
    advancedTitle: "Technical details (for advanced users)",
    advancedBullets: [
      "<strong>@id anchors</strong>: consistent identifiers (<code>#org</code>, <code>#website</code>, <code>#product</code>).",
      "<strong>sameAs</strong>: normalized external URLs (social, directories).",
      "<strong>isPartOf</strong>: collections reference the parent <code>WebSite</code> entity.",
      "<strong>inLanguage</strong>: automatically detects ES, EN, PT; can be forced via settings.",
      "<strong>OfferShippingDetails</strong>: structured handling/transit times and optional <code>shippingRate</code>.",
      "<strong>MerchantReturnPolicy</strong>: days, method and fees configurable.",
      "<strong>Suppressor</strong>: removes overlapping theme JSON-LD, keeping only scripts with <code>data-sae</code>.",
      "<strong>ImageObject</strong>: logo and primary images are tagged for Google Image search.",
    ],
    verifyTitle: "How to verify",
    verifyText:
      'Validate with <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">Google Rich Results Test</a> or <a href="https://validator.schema.org/" target="_blank" rel="noreferrer">Schema.org Validator</a>.',
    helpTitle: "Help & Legal",
    helpLinks: { support: "Support", privacy: "Privacy Policy", terms: "Terms of Service" },
  },
  es: {
    title: "Schema Advanced — Guía",
    intro:
      "Schema Advanced inyecta automáticamente JSON-LD de alta calidad en tu tienda Shopify. Los usuarios básicos pueden seguir los pasos rápidos, y los avanzados encontrarán explicaciones detalladas de cada entidad.",
    stepsTitle: "Inicio rápido (para principiantes)",
    steps: [
      "Ve a Online Store → Themes → Customize",
      "Abre la pestaña App embeds",
      "Activa Schema Advanced y guarda los cambios",
      'Visita tu storefront y confirma que aparece <code>data-sae="1"</code> en los scripts JSON-LD',
      "Vuelve aquí y comprueba que el estado muestre Activo",
    ],
    statusTitle: "Estado",
    statusChecking: "Comprobando…",
    statusOk: "Activo — app embed detectado en el storefront",
    statusWarn: "No detectado — activa el app embed en tu tema y recarga el storefront",
    retry: "Reintentar",
    openEditor: "Abrir editor de temas",
    whatTitle: "¿Qué añade Schema Advanced?",
    whatIntro:
      "Schema Advanced emite un conjunto completo de entidades JSON-LD diseñadas para resultados enriquecidos:",
    whatList: [
      "<strong>Organization</strong>: nombre, razón social, logo, imagen, contacto.",
      "<strong>WebSite</strong>: buscador interno (<code>SearchAction</code>).",
      "<strong>BreadcrumbList</strong>: navegación jerárquica (Inicio → Colección → Producto).",
      "<strong>CollectionPage</strong>: metadatos para páginas de colección.",
      "<strong>FAQPage</strong>: FAQs desde metafields o metaobjetos.",
      "<strong>Product</strong>: GTIN, MPN, SKU, imágenes, marca, descripción, precios.",
      "<strong>AggregateOffer</strong>: rango de precios en productos con variantes.",
      "<strong>AggregateRating</strong>: media de valoraciones y recuento, si existen reseñas.",
      "<strong>BlogPosting</strong>: metadatos de artículos.",
      "<strong>HowTo</strong>: generado automáticamente a partir de encabezados H2.",
      "<strong>ContactPage</strong> y <strong>AboutPage</strong>.",
    ],
    advancedTitle: "Detalles técnicos (para avanzados)",
    advancedBullets: [
      "<strong>@id anchors</strong>: identificadores consistentes (<code>#org</code>, <code>#website</code>, <code>#product</code>).",
      "<strong>sameAs</strong>: URLs externas normalizadas (redes, directorios).",
      "<strong>isPartOf</strong>: las colecciones referencian la entidad <code>WebSite</code> padre.",
      "<strong>inLanguage</strong>: detecta ES, EN, PT automáticamente; configurable en ajustes.",
      "<strong>OfferShippingDetails</strong>: tiempos de gestión y tránsito estructurados; <code>shippingRate</code> opcional.",
      "<strong>MerchantReturnPolicy</strong>: días, método y tasas configurables.",
      "<strong>Supresor</strong>: elimina JSON-LD duplicado del tema, mantiene scripts con <code>data-sae</code>.",
      "<strong>ImageObject</strong>: logo e imágenes principales etiquetadas para Google Imágenes.",
    ],
    verifyTitle: "Cómo verificar",
    verifyText:
      'Valida con la <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">Prueba de resultados enriquecidos de Google</a> o el <a href="https://validator.schema.org/" target="_blank" rel="noreferrer">validador de Schema.org</a>.',
    helpTitle: "Ayuda y legal",
    helpLinks: { support: "Soporte", privacy: "Política de privacidad", terms: "Términos del servicio" },
  },
  pt: {
    title: "Schema Advanced — Guia",
    intro:
      "O Schema Advanced injeta automaticamente JSON-LD de alta qualidade na sua loja Shopify. Usuários básicos podem seguir os passos rápidos e os avançados encontrarão explicações detalhadas de cada entidade.",
    stepsTitle: "Início rápido (para iniciantes)",
    steps: [
      "Vá para Online Store → Themes → Customize",
      "Abra a aba App embeds",
      "Ative o Schema Advanced e salve",
      'Visite o storefront e confirme que <code>data-sae="1"</code> aparece nos scripts JSON-LD',
      "Volte aqui e verifique que o estado mostra Ativo",
    ],
    statusTitle: "Estado",
    statusChecking: "Verificando…",
    statusOk: "Ativo — app embed detectado no storefront",
    statusWarn: "Não detectado — ative o app embed no tema e recarregue o storefront",
    retry: "Repetir",
    openEditor: "Abrir editor do tema",
    whatTitle: "O que o Schema Advanced adiciona?",
    whatIntro:
      "O Schema Advanced emite um conjunto completo de entidades JSON-LD para rich results:",
    whatList: [
      "<strong>Organization</strong>: nome, razão social, logo, imagem, contato.",
      "<strong>WebSite</strong>: busca interna (<code>SearchAction</code>).",
      "<strong>BreadcrumbList</strong>: navegação hierárquica (Início → Coleção → Produto).",
      "<strong>CollectionPage</strong>: metadados para páginas de coleção.",
      "<strong>FAQPage</strong>: FAQs de metafields ou metaobjects.",
      "<strong>Product</strong>: GTIN, MPN, SKU, imagens, marca, descrição, preços.",
      "<strong>AggregateOffer</strong>: faixa de preços em produtos com variações.",
      "<strong>AggregateRating</strong>: média de avaliações e contagem, se houver.",
      "<strong>BlogPosting</strong>: metadados de artigos.",
      "<strong>HowTo</strong>: gerado automaticamente a partir de H2.",
      "<strong>ContactPage</strong> e <strong>AboutPage</strong>.",
    ],
    advancedTitle: "Detalhes técnicos (para avançados)",
    advancedBullets: [
      "<strong>@id anchors</strong>: identificadores consistentes (<code>#org</code>, <code>#website</code>, <code>#product</code>).",
      "<strong>sameAs</strong>: URLs externas normalizadas (redes/diretórios).",
      "<strong>isPartOf</strong>: coleções referenciam a entidade <code>WebSite</code> pai.",
      "<strong>inLanguage</strong>: PT/EN/ES detectado automaticamente; configurável em ajustes.",
      "<strong>OfferShippingDetails</strong>: tempos de manuseio/transporte estruturados; <code>shippingRate</code> opcional.",
      "<strong>MerchantReturnPolicy</strong>: dias, método e taxas configuráveis.",
      "<strong>Supressor</strong>: remove JSON-LD duplicado do tema, mantém scripts com <code>data-sae</code>.",
      "<strong>ImageObject</strong>: logo e imagens principais para Google Imagens.",
    ],
    verifyTitle: "Como verificar",
    verifyText:
      'Valide com o <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">Teste de resultados enriquecidos do Google</a> ou o <a href="https://validator.schema.org/" target="_blank" rel="noreferrer">validador do Schema.org</a>.',
    helpTitle: "Ajuda & jurídico",
    helpLinks: { support: "Suporte", privacy: "Política de privacidade", terms: "Termos de serviço" },
  },
};

// Hook idioma
function useI18n() {
  const { lang: ctxLang } = useOutletContext() || {};
  const [sp] = useSearchParams();
  const q = sp.get("lang");
  const lang = (q && ["es", "en", "pt"].includes(q)) ? q : (ctxLang || "en");
  return STRINGS[lang] || STRINGS.en;
}

// UI helpers
const Card = ({ children }) => (
  <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff" }}>{children}</div>
);
const Section = ({ title, children }) => (
  <section style={{ marginBottom: 28 }}>
    <h2 style={{ fontSize: 18, marginBottom: 10 }}>{title}</h2>
    {children}
  </section>
);

export default function Dashboard() {
  const t = useI18n();
  const [sp] = useSearchParams();

  // shop para construir la URL del editor (no se usa para la detección)
  const shop =
    sp.get("shop") ||
    (typeof window !== "undefined" && window.Shopify && window.Shopify.shop) ||
    "";

  const [statusHtml, setStatusHtml] = useState(t.statusChecking);
  const [loading, setLoading] = useState(false);

  async function checkStatus() {
    setLoading(true);
    setStatusHtml(t.statusChecking);
    try {
      // Detección fiable via Admin API (requiere scope read_themes en tu backend)
      const r = await fetch(`/api/sae-admin-detect`, {
        headers: { "cache-control": "no-cache" },
      });
      const j = await r.json().catch(() => ({}));
      setStatusHtml(j && j.active ? t.statusOk : t.statusWarn);
    } catch {
      setStatusHtml(t.statusWarn);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mantener textos si cambia idioma
  useEffect(() => {
    setStatusHtml(prev => {
      if (prev === STRINGS.en.statusChecking || prev === STRINGS.es.statusChecking || prev === STRINGS.pt.statusChecking) return t.statusChecking;
      if (prev === STRINGS.en.statusOk || prev === STRINGS.es.statusOk || prev === STRINGS.pt.statusOk) return t.statusOk;
      if (prev === STRINGS.en.statusWarn || prev === STRINGS.es.statusWarn || prev === STRINGS.pt.statusWarn) return t.statusWarn;
      return prev;
    });
  }, [t]);

  const editorUrl = shop ? `https://${shop}/admin/themes/current/editor?context=apps` : "";

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: 1.5, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>{t.title}</h1>
      <p style={{ marginBottom: 18, color: "#374151" }} dangerouslySetInnerHTML={{ __html: t.intro }} />

      <Section title={t.stepsTitle}>
        <ol style={{ paddingLeft: 20, color: "#111", marginBottom: 12 }}>
          {t.steps.map((s, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: s }} />
          ))}
        </ol>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          {/* Enlace seguro que abre el editor en la pestaña superior (fuera del iframe) */}
          <a
            href={editorUrl || "#"}
            target="_top"
            rel="noopener"
            onClick={(e) => {
              if (!editorUrl) {
                e.preventDefault();
                alert("Abre la app desde el Admin de Shopify para disponer de ?shop=xxxx.myshopify.com");
              }
            }}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              textDecoration: "none",
              background: "#111827",
              color: "#fff",
              fontWeight: 600,
              cursor: editorUrl ? "pointer" : "not-allowed",
              opacity: editorUrl ? 1 : 0.6,
            }}
            aria-label={t.openEditor}
            title={t.openEditor}
          >
            {t.openEditor}
          </a>

          <button
            onClick={checkStatus}
            disabled={loading}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              cursor: "pointer",
              background: "#fff",
              color: "#111827",
              fontWeight: 600,
              opacity: loading ? 0.6 : 1,
            }}
            aria-label={t.retry}
            title={t.retry}
          >
            {t.retry}
          </button>
        </div>
      </Section>

      <Section title={t.statusTitle}>
        <Card>
          <div dangerouslySetInnerHTML={{ __html: statusHtml }} />
          <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
            {shop ? `Shop: ${shop}` : "Tip: abre este panel desde el Admin de Shopify para disponer de ?shop=..."}
          </div>
        </Card>
      </Section>

      <Section title={t.whatTitle}>
        <p style={{ color: "#374151", marginBottom: 10 }} dangerouslySetInnerHTML={{ __html: t.whatIntro }} />
        <ul style={{ listStyle: "disc", paddingLeft: 20 }}>
          {t.whatList.map((s, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: s }} />
          ))}
        </ul>
      </Section>

      <Section title={t.advancedTitle}>
        <ul style={{ listStyle: "disc", paddingLeft: 20 }}>
          {t.advancedBullets.map((s, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: s }} />
          ))}
        </ul>
      </Section>

      <Section title={t.verifyTitle}>
        <p dangerouslySetInnerHTML={{ __html: t.verifyText }} />
      </Section>

      <Section title={t.helpTitle}>
        <ul style={{ listStyle: "disc", paddingLeft: 20 }}>
          <li><a href="/support" target="_blank" rel="noreferrer">{t.helpLinks.support}</a></li>
          <li><a href="/privacy" target="_blank" rel="noreferrer">{t.helpLinks.privacy}</a></li>
          <li><a href="/terms" target="_blank" rel="noreferrer">{t.helpLinks.terms}</a></li>
        </ul>
      </Section>

      <footer style={{ marginTop: 30, fontSize: 13, color: "#6b7280" }}>
        Schema Advanced &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
