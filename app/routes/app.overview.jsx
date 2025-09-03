// app/routes/app.overview.jsx
import * as React from "react";
import { useOutletContext } from "@remix-run/react";

const ITEMLIST_SNIPPET = `[
  {
    "@context":"https://schema.org",
    "@type":["WebPage","CollectionPage"],
    "@id":"{{ shop.url }}{{ collection.url }}#collection",
    "url":"{{ shop.url }}{{ collection.url }}",
    "name":{{ collection.title | strip_html | json }},
    "description":{{ collection.description | strip_html | truncate: 300 | json }},
    "inLanguage":{{ _lang_out | json }},
    "isPartOf":{"@type":"WebSite","@id":"{{ shop.url }}#website"}
  },
  {
    "@context":"https://schema.org",
    "@type":"ItemList",
    "@id":"{{ shop.url }}{{ collection.url }}#list",
    "url":"{{ shop.url }}{{ collection.url }}",
    "name":{{ collection.title | strip_html | json }},
    "itemListOrder":"https://schema.org/ItemListOrderAscending",
    "numberOfItems":{{ collection.products_count | default: collection.all_products_count | default: collection.products.size }},
    "itemListElement":[
      {%- assign _pos = 1 -%}
      {%- for p in collection.products limit: 12 -%}
      {
        "@type":"ListItem",
        "position":{{ _pos }},
        "item":{
          "@type":"Product",
          "name":{{ p.title | strip_html | json }},
          "url":{{ shop.url | append: p.url | json | replace: '\\/','/' }},
          {%- if p.featured_image -%}
          "image":{{ p.featured_image | image_url: width: 1000 | prepend: "https:" | json | replace: '\\/','/' }},
          {%- endif -%}
          "brand":{"@type":"Brand","name":{{ p.vendor | default: shop.name | json }}},
          "offers":{
            "@type":"Offer",
            "priceCurrency":"{{ cart.currency.iso_code }}",
            "price":"{{ p.price | divided_by: 100.00 }}",
            "availability":"https://schema.org/{% if p.available %}InStock{% else %}OutOfStock{% endif %}",
            "itemCondition":"https://schema.org/NewCondition",
            "seller":{"@id":"{{ shop.url }}#org"}
          }
        }
      }{% unless forloop.last %},{% endunless %}
      {%- assign _pos = _pos | plus: 1 -%}
      {%- endfor -%}
    ]
  }
]`;

const TEXT = {
  es: {
    title: "Overview de la app",
    tabs: { beginner: "Principiante", advanced: "Avanzado" },
    beginnerHtml: `
      <p><strong>Qué es:</strong> App embebida en Shopify que añade <em>datos estructurados (JSON-LD)</em> de alta calidad y <em>elimina duplicados/errores</em> del tema para evitar avisos y latencias.</p>
      <ul>
        <li><strong>Instalar y olvidar:</strong> opciones claras, cambios seguros y reversibles.</li>
        <li><strong>Rendimiento:</strong> scripts compactos, un solo bloque por entidad, límites prudentes (p.ej., 12 ítems en <code>ItemList</code>).</li>
        <li><strong>Idiomas:</strong> ES/PT automáticos (fallback EN).</li>
      </ul>

      <h3>¿Qué añade?</h3>
      <ul>
        <li><strong>Organization</strong> (empresa, <code>#org</code>)</li>
        <li><strong>WebSite</strong> (solo home, con <code>SearchAction</code>)</li>
        <li><strong>BreadcrumbList</strong> (Home → Colección → Producto)</li>
        <li><strong>Colección</strong>: <em>CollectionPage</em> + <em>ItemList</em> (carrusel de productos)</li>
        <li><strong>Producto</strong>: <em>Product</em> (Brand, GTIN/MPN, Offers, envío, devoluciones, rating)</li>
        <li><strong>BlogPosting</strong> y opcional <strong>HowTo</strong> (si hay ≥2 H2)</li>
        <li><strong>ContactPage</strong> y <strong>AboutPage</strong> cuando apliquen</li>
      </ul>

      <h3>Beneficios clave</h3>
      <ul>
        <li><strong>Entendimiento semántico</strong> superior en Google (mejor contexto catálogo).</li>
        <li><strong>Menos advertencias</strong> en validadores; sin duplicados gracias al supresor.</li>
        <li><strong>Autorreferencia Colección ↔ Producto</strong>: la colección lista productos (<code>ItemList</code>) y el producto puede referenciar su colección (<code>subjectOf</code>).</li>
      </ul>
    `,
    advancedHtml: `
      <h3>Diseño técnico</h3>
      <ul>
        <li><strong>IDs canónicos</strong>: <code>{{ shop.url }}#org</code>, <code>{{ shop.url }}{{ collection.url }}#collection</code>, <code>#list</code>, <code>{{ shop.url }}{{ product.url }}#product</code>.</li>
        <li><strong>Supresor JSON-LD</strong> con MutationObserver: borra tipos del tema/apps (respeta <code>data-sae="1"</code>).</li>
        <li><strong>I18N</strong>: <code>inLanguage</code> donde aplica (no en <code>ItemList</code>).</li>
        <li><strong>Rendimiento</strong>: array JSON en lugar de <code>@graph</code>, límite 12 productos, imágenes 1000–1200 px.</li>
      </ul>

      <h4>Entidades</h4>
      <ul>
        <li><strong>Organization</strong>: <code>sameAs</code> normalizado, <code>contactPoint</code>, <code>address</code>, <code>areaServed</code>, <code>hasMerchantReturnPolicy</code>.</li>
        <li><strong>WebSite</strong>: <code>SearchAction</code>, <code>publisher → #org</code>.</li>
        <li><strong>CollectionPage</strong> + <strong>ItemList</strong>: orden ascendente (HTTPS), 12 ítems, seller → <code>#org</code>.</li>
        <li><strong>FAQPage</strong> (colección): <code>faq_handle</code> único, soporta metaobjetos o HTML; ≥2 Q/A.</li>
        <li><strong>Product</strong>: mapeo GTIN por longitud, <code>mpn/sku</code>, <code>additionalProperty</code> (color, material, patrón, dimensiones, peso), <code>AggregateOffer</code> o <code>Offer</code>, <code>OfferShippingDetails</code> (destinos, handling/transit, rate), <code>force_availability</code> opcional, <code>aggregateRating</code> si existe; <em>opcional</em> <code>subjectOf → CollectionPage</code>.</li>
        <li><strong>BlogPosting</strong> + <strong>HowTo</strong> (≥2 H2), <strong>ContactPage</strong>, <strong>AboutPage</strong>.</li>
      </ul>

      <h4>Buenas prácticas incluidas</h4>
      <ul>
        <li>URIs en <strong>HTTPS</strong> (incl. <code>itemListOrder</code>, availability, condition).</li>
        <li><code>priceValidUntil</code> anual, <code>seller</code> siempre → <code>#org</code>.</li>
        <li>Deduplicación de <code>sameAs</code>, limpieza de entradas, límites de imágenes/ofertas.</li>
      </ul>

      <details>
        <summary><strong>Snippet ItemList (copiable)</strong></summary>
        <p>Se emite junto a <code>CollectionPage</code> en un <em>array JSON</em> dentro del mismo script.</p>
        <pre><code id="snippet-block">/* Usa el botón "Copiar snippet" de la derecha */</code></pre>
      </details>
    `,
    copy: "Copiar snippet",
    copied: "¡Copiado!",
  },
  en: {
    title: "App Overview",
    tabs: { beginner: "Beginner", advanced: "Advanced" },
    beginnerHtml: `
      <p><strong>What it is:</strong> Embedded Shopify app that adds high-quality <em>JSON-LD</em> and <em>removes theme errors/duplicates</em> to avoid warnings and extra latency.</p>
      <ul>
        <li><strong>Install & forget:</strong> safe toggles, revertible changes.</li>
        <li><strong>Performance:</strong> compact scripts, single block per entity, prudent limits (e.g., 12 items in <code>ItemList</code>).</li>
        <li><strong>Languages:</strong> ES/PT auto (fallback EN).</li>
      </ul>

      <h3>What it emits</h3>
      <ul>
        <li><strong>Organization</strong> (<code>#org</code>)</li>
        <li><strong>WebSite</strong> (home only, with <code>SearchAction</code>)</li>
        <li><strong>BreadcrumbList</strong> (Home → Collection → Product)</li>
        <li><strong>Collection</strong>: <em>CollectionPage</em> + <em>ItemList</em> (product carousel)</li>
        <li><strong>Product</strong>: Brand, GTIN/MPN, Offers, shipping, returns, rating</li>
        <li><strong>BlogPosting</strong> + optional <strong>HowTo</strong> (≥2 H2)</li>
        <li><strong>ContactPage</strong> & <strong>AboutPage</strong> when applicable</li>
      </ul>

      <h3>Key benefits</h3>
      <ul>
        <li>Stronger <strong>semantic understanding</strong> in Google.</li>
        <li><strong>Fewer warnings</strong> in validators; duplicates removed by the suppressor.</li>
        <li><strong>Self-linking Collection ↔ Product</strong>: collection lists products (<code>ItemList</code>), product can reference its collection (<code>subjectOf</code>).</li>
      </ul>
    `,
    advancedHtml: `
      <h3>Technical design</h3>
      <ul>
        <li><strong>Canonical @id</strong> scheme: <code>{{ shop.url }}#org</code>, <code>{{ shop.url }}{{ collection.url }}#collection</code>, <code>#list</code>, <code>{{ shop.url }}{{ product.url }}#product</code>.</li>
        <li><strong>JSON-LD suppressor</strong> via MutationObserver (respects <code>data-sae="1"</code>).</li>
        <li><strong>I18N</strong>: <code>inLanguage</code> only where valid (not on <code>ItemList</code>).</li>
        <li><strong>Performance</strong>: JSON array (no <code>@graph</code>), 12 products, images 1000–1200 px.</li>
      </ul>

      <h4>Entities</h4>
      <ul>
        <li><strong>Organization</strong>: normalized <code>sameAs</code>, <code>contactPoint</code>, <code>address</code>, <code>areaServed</code>, <code>hasMerchantReturnPolicy</code>.</li>
        <li><strong>WebSite</strong>: <code>SearchAction</code>, <code>publisher → #org</code>.</li>
        <li><strong>CollectionPage</strong> + <strong>ItemList</strong>: ascending order (HTTPS), 12 items, seller → <code>#org</code>.</li>
        <li><strong>FAQPage</strong> (collection): single <code>faq_handle</code>, supports metaobjects or parsed HTML; ≥2 Q/A.</li>
        <li><strong>Product</strong>: GTIN by length, <code>mpn/sku</code>, <code>additionalProperty</code>, <code>AggregateOffer</code>/<code>Offer</code>, <code>OfferShippingDetails</code>, <code>force_availability</code>, <code>aggregateRating</code>; optional <code>subjectOf → CollectionPage</code>.</li>
        <li><strong>BlogPosting</strong> + <strong>HowTo</strong> (≥2 H2), <strong>ContactPage</strong>, <strong>AboutPage</strong>.</li>
      </ul>

      <h4>Built-in best practices</h4>
      <ul>
        <li>All URIs in <strong>HTTPS</strong> (incl. <code>itemListOrder</code>, availability, condition).</li>
        <li>Yearly <code>priceValidUntil</code>, <code>seller</code> always → <code>#org</code>.</li>
        <li><code>sameAs</code> dedupe & input cleanup; limits for images/offers.</li>
      </ul>

      <details>
        <summary><strong>ItemList snippet (copy-ready)</strong></summary>
        <p>Emitted alongside <code>CollectionPage</code> as a JSON array within the same script.</p>
        <pre><code id="snippet-block">/* Use the 'Copy snippet' button on the right */</code></pre>
      </details>
    `,
    copy: "Copy snippet",
    copied: "Copied!",
  },
  pt: {
    title: "Visão geral do app",
    tabs: { beginner: "Principiante", advanced: "Avançado" },
    beginnerHtml: `
      <p><strong>O que é:</strong> App incorporado no Shopify que adiciona <em>JSON-LD</em> de alta qualidade e <em>remove erros/duplicações</em> do tema para evitar avisos e latência.</p>
      <ul>
        <li><strong>Instalar e esquecer:</strong> opções seguras e reversíveis.</li>
        <li><strong>Performance:</strong> scripts compactos, um bloco por entidade, limites prudentes (ex.: 12 itens em <code>ItemList</code>).</li>
        <li><strong>Idiomas:</strong> ES/PT automáticos (fallback EN).</li>
      </ul>

      <h3>O que emite</h3>
      <ul>
        <li><strong>Organization</strong> (<code>#org</code>)</li>
        <li><strong>WebSite</strong> (apenas home, com <code>SearchAction</code>)</li>
        <li><strong>BreadcrumbList</strong> (Home → Coleção → Produto)</li>
        <li><strong>Coleção</strong>: <em>CollectionPage</em> + <em>ItemList</em> (carrossel de produtos)</li>
        <li><strong>Produto</strong>: Brand, GTIN/MPN, Offers, envio, devoluções, rating</li>
        <li><strong>BlogPosting</strong> + <strong>HowTo</strong> opcional (≥2 H2)</li>
        <li><strong>ContactPage</strong> e <strong>AboutPage</strong> quando aplicável</li>
      </ul>

      <h3>Benefícios</h3>
      <ul>
        <li>Melhor <strong>entendimento semântico</strong> no Google.</li>
        <li><strong>Menos avisos</strong> em validadores; duplicações removidas pelo supressor.</li>
        <li><strong>Autorreferência Coleção ↔ Produto</strong>: coleção lista produtos (<code>ItemList</code>) e o produto pode referenciar sua coleção (<code>subjectOf</code>).</li>
      </ul>
    `,
    advancedHtml: `
      <h3>Desenho técnico</h3>
      <ul>
        <li><strong>@id canônicos</strong>: <code>{{ shop.url }}#org</code>, <code>{{ shop.url }}{{ collection.url }}#collection</code>, <code>#list</code>, <code>{{ shop.url }}{{ product.url }}#product</code>.</li>
        <li><strong>Supressor JSON-LD</strong> com MutationObserver (respeita <code>data-sae="1"</code>).</li>
        <li><strong>I18N</strong>: <code>inLanguage</code> apenas onde é válido (não em <code>ItemList</code>).</li>
        <li><strong>Performance</strong>: array JSON (sem <code>@graph</code>), 12 produtos, imagens 1000–1200 px.</li>
      </ul>

      <h4>Entidades</h4>
      <ul>
        <li><strong>Organization</strong>: <code>sameAs</code> normalizado, <code>contactPoint</code>, <code>address</code>, <code>areaServed</code>, <code>hasMerchantReturnPolicy</code>.</li>
        <li><strong>WebSite</strong>: <code>SearchAction</code>, <code>publisher → #org</code>.</li>
        <li><strong>CollectionPage</strong> + <strong>ItemList</strong>: ordem ascendente (HTTPS), 12 itens, seller → <code>#org</code>.</li>
        <li><strong>FAQPage</strong> (coleção): <code>faq_handle</code> único, metaobjects/HTML; ≥2 Q/A.</li>
        <li><strong>Product</strong>: GTIN por comprimento, <code>mpn/sku</code>, <code>additionalProperty</code>, <code>AggregateOffer</code>/<code>Offer</code>, <code>OfferShippingDetails</code>, <code>force_availability</code>, <code>aggregateRating</code>; opcional <code>subjectOf → CollectionPage</code>.</li>
        <li><strong>BlogPosting</strong> + <strong>HowTo</strong> (≥2 H2), <strong>ContactPage</strong>, <strong>AboutPage</strong>.</li>
      </ul>

      <h4>Boas práticas</h4>
      <ul>
        <li>URIs <strong>HTTPS</strong> (incl. <code>itemListOrder</code>, availability, condition).</li>
        <li><code>priceValidUntil</code> anual, <code>seller</code> sempre → <code>#org</code>.</li>
        <li>Deduplicação de <code>sameAs</code>, limpeza e limites de imagens/ofertas.</li>
      </ul>

      <details>
        <summary><strong>Snippet ItemList (copiar)</strong></summary>
        <p>Emitido junto com <code>CollectionPage</code> como um array JSON no mesmo script.</p>
        <pre><code id="snippet-block">/* Use o botão "Copiar snippet" à direita */</code></pre>
      </details>
    `,
    copy: "Copiar snippet",
    copied: "Copiado!",
  },
};

export default function OverviewPage() {
  const { lang } = useOutletContext() || { lang: "es" };
  const L = TEXT[lang] || TEXT.es;
  const [tab, setTab] = React.useState<"beginner" | "advanced">("beginner");
  const [copied, setCopied] = React.useState(false);

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(ITEMLIST_SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // noop
    }
  };

  const tabBtn = (key, label) => (
    <button
      onClick={() => setTab(key)}
      style={{
        padding: "8px 12px",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        background: tab === key ? "#111827" : "#fff",
        color: tab === key ? "#fff" : "#111827",
        cursor: "pointer",
        fontSize: 13,
        marginRight: 8,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: 1.5, maxWidth: 900 }}>
      <h1 style={{ fontSize: 22, marginBottom: 6 }}>{L.title}</h1>

      <div style={{ display: "flex", alignItems: "center", margin: "10px 0 14px" }}>
        {tabBtn("beginner", L.tabs.beginner)}
        {tabBtn("advanced", L.tabs.advanced)}
        <div style={{ flex: 1 }} />
        <button
          onClick={copySnippet}
          title="Copy ItemList snippet"
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: "#fff",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          {copied ? L.copied : L.copy}
        </button>
      </div>

      <section
        style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}
        dangerouslySetInnerHTML={{ __html: tab === "beginner" ? L.beginnerHtml : L.advancedHtml }}
      />
    </div>
  );
}
