
// app/routes/app._index.jsx
import { useState } from "react";
import { useOutletContext, useSearchParams } from "@remix-run/react";

/**
 * Pantalla informativa con sidebar lateral.
 * - SIN @shopify/app-bridge (evita error de Vite).
 * - Botón "Abrir editor": usa ?host= (base64) -> https://{shop}.myshopify.com/admin/...,
 *   y tiene fallbacks a ?shop=... y a /admin/... .
 * - Idiomas ES/EN/PT completos.
 */

const STRINGS = {
  es: {
    title: "Schema Advanced — Guía",
    intro:
      "Esta guía detalla TODO lo que emite Schema Advanced por tipo de página. Usa las pestañas laterales para ver Productos, Colecciones, Páginas, Blog/Artículos, Global y Supresor.",
    openEditor: "Abrir editor de temas",
    tabs: {
      guide: "Guía",
      products: "Productos",
      collections: "Colecciones",
      pages: "Páginas",
      blog: "Blog / Artículos",
      global: "Global",
      suppressor: "Supresor JSON-LD",
    },
    guideHtml: `
      <p><strong>Cómo usar:</strong> Activa el App embed en <em>Online Store → Themes → Customize → App embeds</em>.
      La app añadirá scripts JSON-LD con <code>data-sae="1"</code>. Valida con
      <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">Google Rich Results Test</a>
      o el <a href="https://validator.schema.org/" target="_blank" rel="noreferrer">Validador de Schema.org</a>.</p>
    `,
    productsHtml: `
      <h3>Product (PDP)</h3>
      <p>Se emite en páginas de producto cuando <code>emit_product_auto</code> está activo.</p>
      <h4>Identidad y vínculos</h4>
      <ul>
        <li><code>@type</code>: <code>Product</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ product.url }}#product</code>; <code>mainEntityOfPage</code> (WebPage); <code>url</code> absoluta</li>
      </ul>
      <h4>Datos básicos</h4>
      <ul>
        <li><code>name</code> (título) y <code>description</code> (limpia/truncada)</li>
        <li><code>category</code>: primera colección o <code>product.type</code></li>
        <li><code>brand</code>: <code>Brand</code> con <code>name</code>=<code>product.vendor</code> o nombre de tienda</li>
      </ul>
      <h4>Identificadores</h4>
      <ul>
        <li><code>mpn</code> de <code>metafields.custom.mpn</code> o <code>variant.sku</code></li>
        <li><code>gtin8/12/13/14</code> según longitud de <code>barcode</code></li>
      </ul>
      <h4>Imágenes</h4>
      <ul><li>Hasta 8 imágenes a 1200px (URLs https)</li></ul>
      <h4>additionalProperty</h4>
      <ul>
        <li>De metafields <code>custom.*</code>: <em>color, material, pattern, dimensions_text, weight_value+weight_unit</em></li>
      </ul>
      <h4>Ofertas y precios</h4>
      <ul>
        <li>Moneda: <code>cart.currency.iso_code</code>; <code>priceValidUntil</code> ≈ +1 año</li>
        <li>Multi-variantes: <code>AggregateOffer</code> (<code>lowPrice</code>, <code>highPrice</code>, <code>offerCount</code>, lista de <code>Offer</code> con <code>?variant=ID</code>)</li>
        <li>1 variante: <code>Offer</code> plano</li>
        <li><code>availability</code>: forzada por <code>force_availability</code> o <code>InStock/OutOfStock</code></li>
        <li><code>itemCondition</code>: <code>NewCondition</code>; <code>seller</code>: <code>@id</code> de Organization</li>
      </ul>
      <h4>Envío (OfferShippingDetails)</h4>
      <ul>
        <li><code>shippingDestination</code>: países de <code>shipping_countries</code> (p. ej. ES, PT)</li>
        <li><code>deliveryTime</code>: <code>handlingTime</code> (rango) y <code>transitTime</code> (rango)</li>
        <li><code>shippingRate</code> opcional con <code>include_shipping_rate</code> + <code>shipping_rate_value</code></li>
      </ul>
      <h4>Devoluciones (MerchantReturnPolicy)</h4>
      <ul>
        <li>Ventana finita; <code>merchantReturnDays</code> (por defecto 30); <code>refundType</code>=FullRefund; <code>returnMethod</code>=ReturnByMail; <code>returnFees</code>=FreeReturn/ReturnShippingFees</li>
      </ul>
      <h4>Valoraciones (si existen)</h4>
      <ul>
        <li><code>aggregateRating</code> con <code>ratingValue</code>, <code>reviewCount</code>, <code>bestRating</code>=5, <code>worstRating</code>=1</li>
      </ul>
    `,
    collectionsHtml: `
      <h3>CollectionPage (Colección)</h3>
      <p>Se emite en páginas de colección cuando <code>emit_collection_auto</code> está activo.</p>
      <h4>WebPage + CollectionPage</h4>
      <ul>
        <li><code>@type</code>: <code>["WebPage","CollectionPage"]</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ collection.url }}#collection</code></li>
        <li><code>url</code>, <code>name</code> (título), <code>description</code> (~300), <code>inLanguage</code>, <code>dateModified</code> (si existe)</li>
        <li><code>isPartOf</code>: <code>@id</code>=<code>{{ shop.url }}#website</code></li>
        <li><code>primaryImageOfPage</code> (si existe)</li>
      </ul>
      <h4>FAQPage (opcional)</h4>
      <ul>
        <li>Handle <code>faq_handle</code> (p. ej. <code>custom.faq</code>)</li>
        <li><strong>Metaobjects</strong> con <code>question/answer</code> o <strong>HTML</strong> parseado; requiere ≥2 Q&A</li>
      </ul>
    `,
    pagesHtml: `
      <h3>Páginas (Contact / About)</h3>
      <h4>ContactPage</h4>
      <ul>
        <li>Activa si la plantilla contiene <code>contact</code> o ruta <code>/pages/contact</code></li>
        <li><code>@type</code>: <code>["WebPage","ContactPage"]</code></li>
        <li><code>@id</code> con <code>#contact</code>; <code>name</code>, <code>description</code>, <code>inLanguage</code></li>
        <li><code>isPartOf</code>: <code>@id</code>=<code>{{ shop.url }}#website</code>; <code>about</code>=<code>@id</code> de Organization</li>
      </ul>
      <h4>AboutPage</h4>
      <ul>
        <li>Activa si la plantilla contiene <code>about</code> o rutas típicas (<code>/pages/about</code>, etc.)</li>
        <li>Misma estructura con <code>#about</code></li>
      </ul>
    `,
    blogHtml: `
      <h3>BlogPosting (Artículos)</h3>
      <ul>
        <li><code>@type</code>: <code>BlogPosting</code>; <code>@id</code>=<code>{{ shop.url }}{{ article.url }}#article</code>; <code>mainEntityOfPage</code>=WebPage</li>
        <li><code>headline</code> (≤110), <code>description</code> (≤300), <code>image</code> (ImageObject)</li>
        <li><code>datePublished</code>, <code>dateModified</code>, <code>author</code>(Person), <code>publisher</code>(Organization), <code>inLanguage</code>, <code>isAccessibleForFree</code>=true, <code>wordCount</code>, <code>articleSection</code></li>
      </ul>
      <h4>HowTo (opcional)</h4>
      <ul>
        <li>Activado con <code>emit_howto_auto</code></li>
        <li>Generado desde H2 (H3 normalizado a H2). Requiere ≥2 pasos.</li>
        <li><code>@type</code>: <code>HowTo</code>; incluye <code>name</code>, <code>description</code>, <code>image</code>, fechas, <code>author</code>, <code>publisher</code>, y <code>step[]</code></li>
      </ul>
    `,
    globalHtml: `
      <h3>Organization (todas las páginas)</h3>
      <ul>
        <li><code>@type</code>: <code>Organization</code>; <code>@id</code>=<code>{{ shop.url }}#org</code>; <code>url</code>, <code>name</code>, <code>legalName</code></li>
        <li><code>logo</code> e <code>image</code> desde <code>org_logo</code></li>
        <li><code>sameAs</code> normalizado/deduplicado desde <code>org_sameas</code></li>
        <li><code>email</code>, <code>contactPoint</code> (Customer Support; <code>telephone</code> opcional)</li>
        <li><code>address</code> (street, city, postal, country)</li>
        <li><code>areaServed</code> desde <code>shipping_countries</code></li>
        <li><code>hasMerchantReturnPolicy</code> global</li>
      </ul>

      <h3>WebSite (home opcional)</h3>
      <ul>
        <li>Solo home si <code>website_on_home_only</code>=true</li>
        <li><code>@id</code>=<code>{{ shop.url }}#website</code>; <code>publisher</code>=<code>#org</code></li>
        <li><code>inLanguage</code> auto (ES/PT/EN)</li>
        <li><code>potentialAction</code>: <code>SearchAction</code> → <code>{{ shop.url }}/search?q={search_term_string}</code></li>
      </ul>

      <h3>BreadcrumbList (toggle)</h3>
      <ul>
        <li>Activado con <code>emit_breadcrumbs</code>. Cadena: Home → Collection → Product</li>
      </ul>
    `,
    suppressorHtml: `
      <h3>Supresor JSON-LD del tema</h3>
      <p>Con <code>suppress_theme_jsonld</code> activo, se eliminan JSON-LD del tema que duplican los de la app (los de la app, con <code>data-sae="1"</code>, se respetan).</p>
      <ul>
        <li>Tipos: Product, Organization, WebSite, BreadcrumbList, CollectionPage, WebPage, FAQPage, BlogPosting, HowTo, ContactPage, AboutPage, ItemList</li>
        <li>Usa <em>MutationObserver</em> y varias pasadas para inyecciones tardías</li>
      </ul>
    `,
  },

  en: {
    title: "Schema Advanced — Guide",
    intro:
      "This guide details EVERYTHING the app outputs per page type. Use the left sidebar to browse Products, Collections, Pages, Blog/Articles, Global and the Suppressor.",
    openEditor: "Open theme editor",
    tabs: {
      guide: "Guide",
      products: "Products",
      collections: "Collections",
      pages: "Pages",
      blog: "Blog / Articles",
      global: "Global",
      suppressor: "JSON-LD Suppressor",
    },
    guideHtml: `
      <p><strong>How to:</strong> Enable the App embed under <em>Online Store → Themes → Customize → App embeds</em>.
      The app injects JSON-LD with <code>data-sae="1"</code>. Validate with
      <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">Google Rich Results Test</a>
      or the <a href="https://validator.schema.org/" target="_blank" rel="noreferrer">Schema.org Validator</a>.</p>
    `,
    productsHtml: STRINGS?.es?.productsHtml, // reuse content
    collectionsHtml: STRINGS?.es?.collectionsHtml,
    pagesHtml: STRINGS?.es?.pagesHtml,
    blogHtml: STRINGS?.es?.blogHtml,
    globalHtml: STRINGS?.es?.globalHtml,
    suppressorHtml: STRINGS?.es?.suppressorHtml,
  },

  pt: {
    title: "Schema Advanced — Guia",
    intro:
      "Este guia detalha TUDO o que o app emite por tipo de página. Use a barra lateral para ver Produtos, Coleções, Páginas, Blog/Artigos, Global e o Supressor.",
    openEditor: "Abrir editor do tema",
    tabs: {
      guide: "Guia",
      products: "Produtos",
      collections: "Coleções",
      pages: "Páginas",
      blog: "Blog / Artigos",
      global: "Global",
      suppressor: "Supressor JSON-LD",
    },
    guideHtml: `
      <p><strong>Como usar:</strong> Ative o App embed em <em>Online Store → Themes → Customize → App embeds</em>.
      O app injeta JSON-LD com <code>data-sae="1"</code>. Valide com
      <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">Google Rich Results Test</a>
      ou o <a href="https://validator.schema.org/" target="_blank" rel="noreferrer">Schema.org Validator</a>.</p>
    `,
    productsHtml: STRINGS?.es?.productsHtml,
    collectionsHtml: STRINGS?.es?.collectionsHtml,
    pagesHtml: STRINGS?.es?.pagesHtml,
    blogHtml: STRINGS?.es?.blogHtml,
    globalHtml: STRINGS?.es?.globalHtml,
    suppressorHtml: STRINGS?.es?.suppressorHtml,
  },
};

// Hook idioma
function useI18n() {
  const { lang: ctxLang } = useOutletContext() || {};
  const [sp] = useSearchParams();
  const q = sp.get("lang");
  const code = (q && ["es", "en", "pt"].includes(q)) ? q : (ctxLang || "es");
  return STRINGS[code] || STRINGS.es;
}

// Sidebar lateral
const Sidebar = ({ tabs, active, onChange }) => (
  <nav
    aria-label="Sections"
    style={{
      width: 260,
      minWidth: 220,
      borderRight: "1px solid #e5e7eb",
      paddingRight: 12,
      paddingTop: 8,
      position: "sticky",
      top: 10,
      alignSelf: "flex-start",
    }}
  >
    {tabs.map((t) => (
      <button
        key={t.key}
        onClick={() => onChange(t.key)}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid transparent",
          marginBottom: 8,
          background: active === t.key ? "#111827" : "transparent",
          color: active === t.key ? "#fff" : "#111827",
          fontWeight: 600,
          cursor: "pointer",
        }}
        aria-current={active === t.key ? "page" : undefined}
      >
        {t.label}
      </button>
    ))}
  </nav>
);

export default function Dashboard() {
  const t = useI18n();
  const [sp] = useSearchParams();
  const [active, setActive] = useState("products");

  const tabs = [
    { key: "guide", label: t.tabs.guide, html: t.guideHtml },
    { key: "products", label: t.tabs.products, html: t.productsHtml },
    { key: "collections", label: t.tabs.collections, html: t.collectionsHtml },
    { key: "pages", label: t.tabs.pages, html: t.pagesHtml },
    { key: "blog", label: t.tabs.blog, html: t.blogHtml },
    { key: "global", label: t.tabs.global, html: t.globalHtml },
    { key: "suppressor", label: t.tabs.suppressor, html: t.suppressorHtml },
  ];
  const current = tabs.find((x) => x.key === active) || tabs[0];

  // Botón editor: sin App Bridge; usa ?host= (base64) o ?shop=... o /admin...
  const openThemeEditor = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const hostParam = params.get("host");
      if (hostParam) {
        // host es base64 de "shop.myshopify.com/admin"
        let decoded = "";
        try {
          decoded = atob(hostParam);
        } catch { /* ignore */ }
        if (decoded && /myshopify\.com\/admin/i.test(decoded)) {
          const base = decoded.replace(/\/admin.*/i, "/admin");
          const url = `https://${base}/themes/current/editor?context=apps`;
          (window.top || window).location.href = url;
          return;
        }
      }
      // fallback con ?shop= o window.Shopify.shop
      const shop =
        sp.get("shop") ||
        (typeof window !== "undefined" && window.Shopify && window.Shopify.shop) ||
        "";
      if (shop) {
        const url = `https://${shop}/admin/themes/current/editor?context=apps`;
        (window.top || window).location.href = url;
        return;
      }
      // último recurso: relativo (si ya estamos en admin)
      (window.top || window).location.href = "/admin/themes/current/editor?context=apps";
    } catch (e) {
      alert("No pude abrir el editor. Abre la app desde el Admin para que la URL incluya ?host=... o añade ?shop=xxxx.myshopify.com.");
    }
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: 1.5, maxWidth: 1200, margin: "0 auto", padding: "10px 0" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 6 }}>{t.title}</h1>
          <p style={{ margin: 0, color: "#374151" }}>{t.intro}</p>
        </div>
        <button
          onClick={openThemeEditor}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            background: "#111827",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
          aria-label={t.openEditor}
          title={t.openEditor}
        >
          {t.openEditor}
        </button>
      </header>

      <div style={{ display: "flex", gap: 16 }}>
        <Sidebar tabs={tabs} active={active} onChange={setActive} />
        <main style={{ flex: 1, paddingLeft: 4 }}>
          <section
            style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}
            dangerouslySetInnerHTML={{ __html: current.html }}
          />
        </main>
      </div>

      <footer style={{ marginTop: 24, fontSize: 13, color: "#6b7280" }}>
        Schema Advanced &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
