
// app/routes/app._index.jsx
import { useState } from "react";
import { useOutletContext, useSearchParams } from "@remix-run/react";

/**
 * NOTA: Esta pantalla es puramente informativa para el cliente.
 * Resume TODO lo que emite la app en cada tipo de página, basado en tu snippet Liquid.
 */

// === I18N (ES principal). EN/PT heredan texto ES para no dejar nada vacío. ===
const STRINGS = {
  es: {
    title: "Schema Advanced — Guía",
    intro:
      "Esta guía explica con detalle TODO lo que emite Schema Advanced en cada tipo de página. Usa las pestañas para ver Productos, Colecciones, Páginas, Blog/Artículos, Global y el Supresor.",
    openEditor: "Abrir editor de temas",
    tabs: {
      guide: "Guía",
      products: "Productos",
      collections: "Colecciones",
      pages: "Páginas",
      blog: "Blog / Artículos",
      global: "Global (Organization, WebSite, Breadcrumbs)",
      suppressor: "Supresor JSON-LD",
    },

    guideHtml: `
      <p><strong>Cómo usar:</strong> Activa el App embed en <em>Online Store → Themes → Customize → App embeds</em>.
      Schema Advanced añadirá bloques JSON-LD con <code>data-sae="1"</code>. Valida con
      <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">Google Rich Results Test</a>
      o el <a href="https://validator.schema.org/" target="_blank" rel="noreferrer">Validador de Schema.org</a>.</p>
      <p>En las pestañas tienes la lista exhaustiva de propiedades emitidas, la lógica de cuándo aparecen y de dónde salen los datos (metafields, settings, etc.).</p>
    `,

    productsHtml: `
      <h3>Product (PDP)</h3>
      <p>Se emite en páginas de producto cuando <code>Emitir Product automáticamente en PDP</code> está activo.</p>

      <h4>Identidad y vínculos</h4>
      <ul>
        <li><code>@type</code>: <code>Product</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ product.url }}#product</code></li>
        <li><code>mainEntityOfPage</code>: WebPage con <code>@id</code> = URL del producto</li>
        <li><code>url</code>: URL absoluta del producto</li>
        <li><code>inLanguage</code>: heredado de Global (ver pestaña Global)</li>
      </ul>

      <h4>Datos básicos</h4>
      <ul>
        <li><code>name</code>: título del producto</li>
        <li><code>description</code>: descripción del producto, saneada y truncada a ~500 caracteres</li>
        <li><code>category</code>: título de la primera colección del producto; si no, <code>product.type</code></li>
        <li><code>brand</code>: <code>Brand</code> con <code>name</code> = <code>product.vendor</code> o, en su defecto, nombre de la tienda</li>
      </ul>

      <h4>Identificadores</h4>
      <ul>
        <li><code>mpn</code>: de <code>product.metafields.custom.mpn</code> o, si no, <code>variant.sku</code> seleccionado</li>
        <li><code>gtin8/12/13/14</code>: detectado por longitud de <code>barcode</code> (tanto en variante seleccionada como por-variante)</li>
      </ul>

      <h4>Imágenes</h4>
      <ul>
        <li><code>image</code>: hasta 8 imágenes del producto a 1200px (URLs absolutas https)</li>
      </ul>

      <h4>Propiedades adicionales (<code>additionalProperty</code>)</h4>
      <p>Se generan como <code>PropertyValue</code> si existen estos metafields (namespace <code>custom</code>):</p>
      <ul>
        <li><strong>Color</strong> → <code>custom.color</code></li>
        <li><strong>Material</strong> → <code>custom.material</code></li>
        <li><strong>Patrón</strong> → <code>custom.pattern</code></li>
        <li><strong>Dimensiones</strong> → <code>custom.dimensions_text</code></li>
        <li><strong>Peso</strong> → <code>custom.weight_value</code> + <code>custom.weight_unit</code></li>
      </ul>

      <h4>Ofertas y precios</h4>
      <ul>
        <li>Moneda: <code>cart.currency.iso_code</code></li>
        <li>Si hay <strong>múltiples variantes</strong>: <code>AggregateOffer</code>
          <ul>
            <li><code>lowPrice</code>, <code>highPrice</code>, <code>offerCount</code></li>
            <li><code>offers[]</code>: array de <code>Offer</code> por variante con:
              <ul>
                <li><code>url</code> con <code>?variant=ID</code></li>
                <li><code>sku</code> (si existe)</li>
                <li><code>gtin*</code> por variante (si <code>barcode</code>)</li>
                <li><code>price</code> y <code>priceValidUntil</code> (~1 año desde hoy)</li>
                <li><code>availability</code>: forzado por setting <code>force_availability</code> o calculado (<code>InStock</code>/<code>OutOfStock</code>)</li>
                <li><code>itemCondition</code>: <code>NewCondition</code></li>
                <li><code>seller</code>: <code>@id</code> de Organization</li>
                <li><code>shippingDetails</code>: ver “Envío”</li>
              </ul>
            </li>
            <li><code>hasMerchantReturnPolicy</code> global (ver “Devoluciones”)</li>
          </ul>
        </li>
        <li>Si hay <strong>una sola variante</strong>: <code>Offer</code> plano con los mismos campos relevantes</li>
      </ul>

      <h4>Envío (<code>OfferShippingDetails</code>)</h4>
      <ul>
        <li><code>shippingDestination</code>: lista de <code>DefinedRegion</code> por país desde setting <code>shipping_countries</code> (por defecto: ES, PT)</li>
        <li><code>deliveryTime</code>:
          <ul>
            <li><code>handlingTime</code>: rango en días desde setting <code>handling_days</code> (p.ej. <code>0-1</code>)</li>
            <li><code>transitTime</code>: rango en días desde setting <code>shipping_days</code> (p.ej. <code>2-3</code>)</li>
          </ul>
        </li>
        <li><code>shippingRate</code> opcional: si <code>include_shipping_rate</code> y <code>shipping_rate_value</code> están definidos</li>
      </ul>

      <h4>Devoluciones (<code>MerchantReturnPolicy</code>)</h4>
      <ul>
        <li><code>returnPolicyCategory</code>: <code>MerchantReturnFiniteReturnWindow</code></li>
        <li><code>merchantReturnDays</code>: setting <code>returns_days</code> (por defecto 30)</li>
        <li><code>refundType</code>: <code>FullRefund</code></li>
        <li><code>returnMethod</code>: <code>ReturnByMail</code></li>
        <li><code>returnFees</code>: <code>FreeReturn</code> si <code>free_returns</code> = true; si no, <code>ReturnShippingFees</code></li>
      </ul>

      <h4>Valoraciones (si existen)</h4>
      <ul>
        <li><code>aggregateRating</code> con <code>ratingValue</code>, <code>reviewCount</code>, <code>bestRating</code>=5, <code>worstRating</code>=1</li>
        <li>Fuente: <code>product.metafields.reviews.rating</code> y <code>product.metafields.reviews.rating_count</code></li>
      </ul>
    `,

    collectionsHtml: `
      <h3>CollectionPage (Colección)</h3>
      <p>Se emite en páginas de colección cuando <code>emit_collection_auto</code> está activo.</p>

      <h4>WebPage + CollectionPage</h4>
      <ul>
        <li><code>@type</code>: <code>["WebPage","CollectionPage"]</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ collection.url }}#collection</code></li>
        <li><code>url</code>, <code>name</code> (título), <code>description</code> (saneada y truncada ~300)</li>
        <li><code>inLanguage</code>: ver pestaña Global</li>
        <li><code>dateModified</code>: <code>collection.updated_at</code> (si existe)</li>
        <li><code>isPartOf</code>: referencia a <code>WebSite</code> (<code>@id</code> = <code>{{ shop.url }}#website</code>)</li>
        <li><code>primaryImageOfPage</code>: <code>ImageObject</code> con imagen de la colección (si existe)</li>
      </ul>

      <h4>FAQPage (opcional)</h4>
      <p>Handle configurable en <code>faq_handle</code> (por defecto <code>custom.faq</code>). Se soportan dos fuentes:</p>
      <ul>
        <li><strong>Metaobjects</strong>: el metafield devuelve entradas con campos <code>question</code>/<code>answer</code> (soporta <em>pregunta/respuesta</em>).</li>
        <li><strong>Texto HTML</strong>: se parsean párrafos para emparejar preguntas (¿...?) y respuestas. Se necesita ≥2 Q&amp;A para emitir <code>FAQPage</code>.</li>
      </ul>
      <p>Salida: <code>FAQPage</code> con <code>mainEntity</code> = array de <code>Question</code> + <code>acceptedAnswer</code>.</p>
    `,

    pagesHtml: `
      <h3>Páginas (Contact / About)</h3>

      <h4>ContactPage</h4>
      <ul>
        <li>Se activa si la plantilla contiene <code>contact</code> o la ruta incluye <code>/pages/contact</code></li>
        <li><code>@type</code>: <code>["WebPage","ContactPage"]</code></li>
        <li><code>@id</code>: URL de la página con <code>#contact</code></li>
        <li><code>name</code>, <code>description</code> (saneada y truncada ~300), <code>inLanguage</code></li>
        <li><code>isPartOf</code>: <code>WebSite</code> (<code>@id</code> = <code>{{ shop.url }}#website</code>)</li>
        <li><code>about</code>: <code>@id</code> de <code>Organization</code></li>
      </ul>

      <h4>AboutPage</h4>
      <ul>
        <li>Se activa si la plantilla contiene <code>about</code> o rutas típicas (<code>/pages/acerca</code>, <code>/pages/sobre-nosotros</code>, <code>/pages/about</code>)</li>
        <li>Estructura análoga a ContactPage con <code>@type</code>: <code>["WebPage","AboutPage"]</code> y <code>#about</code> como ancla</li>
      </ul>
    `,

    blogHtml: `
      <h3>BlogPosting (Artículos)</h3>
      <ul>
        <li><code>@type</code>: <code>BlogPosting</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ article.url }}#article</code></li>
        <li><code>mainEntityOfPage</code>: WebPage del artículo</li>
        <li><code>headline</code> (≤110), <code>description</code> (≤300, saneada), <code>image</code> (ImageObject con url/width/height)</li>
        <li><code>datePublished</code>, <code>dateModified</code></li>
        <li><code>author</code> (Person) y <code>publisher</code> (Organization por @id)</li>
        <li><code>inLanguage</code>, <code>isAccessibleForFree</code>=true, <code>wordCount</code>, <code>articleSection</code> (título del blog)</li>
      </ul>

      <h4>HowTo (opcional)</h4>
      <ul>
        <li>Activado por setting <code>emit_howto_auto</code></li>
        <li>Se genera automáticamente a partir de los H2 del artículo (normaliza H3 como H2). Requiere ≥2 pasos.</li>
        <li><code>@type</code>: <code>HowTo</code>; <code>@id</code> = URL del artículo con <code>#howto</code></li>
        <li>Incluye: <code>name</code>, <code>description</code>, <code>image</code> (si existe), fechas, <code>author</code>, <code>publisher</code>, y <code>step[]</code> (cada uno con <code>name</code> + <code>text</code>)</li>
      </ul>
    `,

    globalHtml: `
      <h3>Organization (todas las páginas)</h3>
      <ul>
        <li><code>@type</code>: <code>Organization</code>; <code>@id</code> = <code>{{ shop.url }}#org</code>; <code>url</code>, <code>name</code>, <code>legalName</code></li>
        <li><code>logo</code> e <code>image</code> (ImageObject) desde setting <code>org_logo</code></li>
        <li><code>sameAs</code>: lista normalizada (separadores: espacios, comas, saltos de línea). Asegura <code>https://</code> y deduplica.</li>
        <li><code>email</code> y <code>contactPoint</code> (type Customer Support, email y <code>telephone</code> opcional)</li>
        <li><code>address</code>: PostalAddress desde settings (<em>street</em>, <em>city</em>, <em>postal</em>, <em>country</em>)</li>
        <li><code>areaServed</code>: array de países desde <code>shipping_countries</code> (p.ej. ES, PT)</li>
        <li><code>hasMerchantReturnPolicy</code>: política global (días, método, tasas)</li>
      </ul>

      <h3>WebSite (home opcional)</h3>
      <ul>
        <li>Solo en home si <code>website_on_home_only</code> = true; si no, en todas</li>
        <li><code>@id</code> = <code>{{ shop.url }}#website</code>; <code>publisher</code> apunta a <code>#org</code></li>
        <li><code>inLanguage</code>: <em>auto</em> por <code>language_mode</code> (ES/PT/EN) con detección por <em>locale</em>, <em>routes.root_url</em> y <em>shop.primary_locale</em></li>
        <li><code>potentialAction</code>: <code>SearchAction</code> → <code>{{ shop.url }}/search?q={search_term_string}</code></li>
      </ul>

      <h3>BreadcrumbList (toggle)</h3>
      <ul>
        <li>Activado por <code>emit_breadcrumbs</code>. Estructura simple:
          <ul>
            <li><strong>Home</strong> → Collection (si aplica) → Product (si aplica)</li>
          </ul>
        </li>
      </ul>
    `,

    suppressorHtml: `
      <h3>Supresor de JSON-LD del tema</h3>
      <p>Cuando <code>suppress_theme_jsonld</code> está activo, se ejecuta un script que:</p>
      <ul>
        <li>Detecta <code>&lt;script type="application/ld+json"&gt;</code> inyectados por el tema</li>
        <li>Elimina aquellos cuyo <code>@type</code> coincide con los que emite la app (<em>Product, Organization, WebSite, BreadcrumbList, CollectionPage, WebPage, FAQPage, BlogPosting, HowTo, ContactPage, AboutPage, ItemList</em>)</li>
        <li>Respeta los de la app (marcados con <code>data-sae="1"</code>)</li>
        <li>Vigila mutaciones (MutationObserver) y limpia múltiple veces (DOMContentLoaded + timeouts)</li>
      </ul>
      <p>Objetivo: evitar duplicados y conflictos con el JSON-LD del tema.</p>
    `,
  },

  // EN/PT → mostramos lo mismo que ES para no dejar huecos.
  en: null,
  pt: null,
};

// Hook idioma (ES por defecto con fallback)
function useI18n() {
  const { lang: ctxLang } = useOutletContext() || {};
  const [sp] = useSearchParams();
  const q = sp.get("lang");
  const code = (q && ["es", "en", "pt"].includes(q)) ? q : (ctxLang || "es");
  const base = STRINGS.es;
  const t = STRINGS[code] || {};
  return { ...base, ...t }; // mezcla para que nunca falte nada
}

// UI helpers
const Section = ({ title, children }) => (
  <section style={{ marginBottom: 28 }}>
    {title ? <h2 style={{ fontSize: 18, marginBottom: 10 }}>{title}</h2> : null}
    {children}
  </section>
);
const Tabs = ({ tabs, active, onChange }) => (
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
    {tabs.map((t) => (
      <button
        key={t.key}
        onClick={() => onChange(t.key)}
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          border: active === t.key ? "2px solid #111827" : "1px solid #d1d5db",
          background: active === t.key ? "#111827" : "#fff",
          color: active === t.key ? "#fff" : "#111827",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {t.label}
      </button>
    ))}
  </div>
);

export default function Dashboard() {
  const t = useI18n();
  const [sp] = useSearchParams();
  const shop =
    sp.get("shop") ||
    (typeof window !== "undefined" && window.Shopify && window.Shopify.shop) ||
    "";

  const editorUrl = shop ? `https://${shop}/admin/themes/current/editor?context=apps` : "";

  const tabs = [
    { key: "guide", label: t.tabs.guide },
    { key: "products", label: t.tabs.products },
    { key: "collections", label: t.tabs.collections },
    { key: "pages", label: t.tabs.pages },
    { key: "blog", label: t.tabs.blog },
    { key: "global", label: t.tabs.global },
    { key: "suppressor", label: t.tabs.suppressor },
  ];

  const [active, setActive] = useState("products");

  const renderTab = () => {
    switch (active) {
      case "guide":
        return <div dangerouslySetInnerHTML={{ __html: t.guideHtml }} />;
      case "products":
        return <div dangerouslySetInnerHTML={{ __html: t.productsHtml }} />;
      case "collections":
        return <div dangerouslySetInnerHTML={{ __html: t.collectionsHtml }} />;
      case "pages":
        return <div dangerouslySetInnerHTML={{ __html: t.pagesHtml }} />;
      case "blog":
        return <div dangerouslySetInnerHTML={{ __html: t.blogHtml }} />;
      case "global":
        return <div dangerouslySetInnerHTML={{ __html: t.globalHtml }} />;
      case "suppressor":
        return <div dangerouslySetInnerHTML={{ __html: t.suppressorHtml }} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: 1.5, maxWidth: 980, margin: "0 auto" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 6 }}>{t.title}</h1>
          <p style={{ marginBottom: 0, color: "#374151" }} dangerouslySetInnerHTML={{ __html: t.intro }} />
        </div>
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
            display: "inline-block",
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            textDecoration: "none",
            background: "#111827",
            color: "#fff",
            fontWeight: 700,
          }}
          aria-label={t.openEditor}
          title={t.openEditor}
        >
          {t.openEditor}
        </a>
      </header>

      <Tabs tabs={tabs} active={active} onChange={setActive} />
      <Section title="">
        {renderTab()}
      </Section>

      <footer style={{ marginTop: 30, fontSize: 13, color: "#6b7280" }}>
        Schema Advanced &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
