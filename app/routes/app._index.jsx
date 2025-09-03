
// app/routes/app._index.jsx
import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useSearchParams } from "@remix-run/react";

/**
 * UI con una sola columna lateral (la de tu app).
 * Dentro usamos pestañas HORIZONTALES.
 * Idiomas: ES, EN, PT completos.
 * Sin App Bridge; botón editor usa ?host (base64url) con fallbacks.
 */

/* ========== TEXTOS ========== */
const TEXT = {
  es: {
    title: "Schema Advanced — Guía",
    intro:
      "Esta guía detalla TODO lo que emite la app por tipo de página. Usa las pestañas para ver Productos, Colecciones, Páginas, Blog/Artículos, Global y el Supresor.",
    openEditor: "Abrir editor de temas",
    langLabel: "Idioma",
    tabs: {
      products: "Productos",
      collections: "Colecciones",
      pages: "Páginas",
      blog: "Blog / Artículos",
      global: "Global",
      suppressor: "Supresor JSON-LD",
      guide: "Guía",
    },
    guide: `
      <p><strong>Cómo usar:</strong> Activa el App embed en <em>Online Store → Themes → Customize → App embeds</em>.
      La app inserta JSON-LD con <code>data-sae="1"</code>. Valida con
      <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">Google Rich Results Test</a>
      o el <a href="https://validator.schema.org/" target="_blank" rel="noreferrer">Validador de Schema.org</a>.</p>
    `,
    products: `
      <h3>Product (PDP)</h3>
      <p>Se emite en PDP cuando <code>emit_product_auto</code> está activo.</p>
      <h4>Identidad</h4>
      <ul>
        <li><code>@type</code>: Product</li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ product.url }}#product</code></li>
        <li><code>mainEntityOfPage</code> (WebPage) y <code>url</code> absoluta</li>
      </ul>
      <h4>Básicos</h4>
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
      <ul><li>Hasta 8 imágenes a 1200px (https)</li></ul>
      <h4>additionalProperty</h4>
      <ul>
        <li>Metafields <code>custom.*</code>: <em>color</em>, <em>material</em>, <em>pattern</em>, <em>dimensions_text</em>, <em>weight_value+weight_unit</em></li>
      </ul>
      <h4>Ofertas y precio</h4>
      <ul>
        <li>Moneda: <code>cart.currency.iso_code</code>; <code>priceValidUntil</code> ≈ +1 año</li>
        <li>Multi-variantes → <code>AggregateOffer</code> (<code>lowPrice</code>, <code>highPrice</code>, <code>offerCount</code>, array de <code>Offer</code> con <code>?variant=ID</code>)</li>
        <li>Una variante → <code>Offer</code> plano</li>
        <li><code>availability</code>: forzada por <code>force_availability</code> o <code>InStock/OutOfStock</code></li>
        <li><code>itemCondition</code>: <code>NewCondition</code>; <code>seller</code>: <code>@id</code> de Organization</li>
      </ul>
      <h4>Envío (<code>OfferShippingDetails</code>)</h4>
      <ul>
        <li><code>shippingDestination</code>: países de <code>shipping_countries</code> (ej.: ES, PT)</li>
        <li><code>deliveryTime</code>: <code>handlingTime</code> (rango) y <code>transitTime</code> (rango)</li>
        <li><code>shippingRate</code> opcional si <code>include_shipping_rate</code> + <code>shipping_rate_value</code></li>
      </ul>
      <h4>Devoluciones (<code>MerchantReturnPolicy</code>)</h4>
      <ul>
        <li>Ventana finita; <code>merchantReturnDays</code> (por defecto 30); <code>refundType</code>=FullRefund; <code>returnMethod</code>=ReturnByMail; <code>returnFees</code>=FreeReturn/ReturnShippingFees</li>
      </ul>
      <h4>Valoraciones (si existen)</h4>
      <ul>
        <li><code>aggregateRating</code>: <code>ratingValue</code>, <code>reviewCount</code>, <code>bestRating</code>=5, <code>worstRating</code>=1</li>
      </ul>
    `,
    collections: `
      <h3>CollectionPage</h3>
      <p>Se emite en colecciones si <code>emit_collection_auto</code> está activo.</p>
      <ul>
        <li><code>@type</code>: ["WebPage","CollectionPage"]</li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ collection.url }}#collection</code>; <code>url</code>, <code>name</code>, <code>description</code> (~300), <code>inLanguage</code></li>
        <li><code>dateModified</code> si existe; <code>isPartOf</code> → <code>{{ shop.url }}#website</code></li>
        <li><code>primaryImageOfPage</code> si hay imagen</li>
      </ul>
      <h4>FAQPage (opcional)</h4>
      <ul>
        <li>Metafield handle (<code>faq_handle</code>, p.ej. <code>custom.faq</code>)</li>
        <li>Soporta Metaobjects (<code>question/answer</code>) o HTML parseado; requiere ≥2 Q&A</li>
      </ul>
    `,
    pages: `
      <h3>Páginas</h3>
      <h4>ContactPage</h4>
      <ul>
        <li>Activa si plantilla contiene <code>contact</code> o ruta <code>/pages/contact</code></li>
        <li><code>@type</code>: ["WebPage","ContactPage"] · <code>@id</code> con <code>#contact</code></li>
        <li><code>name</code>, <code>description</code> (~300), <code>inLanguage</code></li>
        <li><code>isPartOf</code> → <code>{{ shop.url }}#website</code>; <code>about</code> → <code>{{ shop.url }}#org</code></li>
      </ul>
      <h4>AboutPage</h4>
      <ul>
        <li>Activa en rutas típicas: <code>/pages/acerca</code>, <code>/pages/sobre-nosotros</code>, <code>/pages/about</code></li>
        <li>Misma estructura con ancla <code>#about</code></li>
      </ul>
    `,
    blog: `
      <h3>BlogPosting</h3>
      <ul>
        <li><code>@type</code>: BlogPosting; <code>@id</code>: <code>{{ shop.url }}{{ article.url }}#article</code>; <code>mainEntityOfPage</code>: WebPage</li>
        <li><code>headline</code> (≤110), <code>description</code> (≤300), <code>image</code> (url/width/height)</li>
        <li><code>datePublished</code>, <code>dateModified</code>, <code>author</code> (Person), <code>publisher</code> (Organization), <code>inLanguage</code>, <code>isAccessibleForFree</code>=true, <code>wordCount</code>, <code>articleSection</code></li>
      </ul>
      <h4>HowTo (opcional)</h4>
      <ul>
        <li>Con <code>emit_howto_auto</code></li>
        <li>Se genera desde títulos H2 (H3 normalizado a H2); requiere ≥2 pasos</li>
        <li><code>@type</code>: HowTo; <code>@id</code>: <code>{{ shop.url }}{{ article.url }}#howto</code>; incluye <code>name</code>, <code>description</code>, <code>image</code> (si hay), fechas, <code>author</code>, <code>publisher</code>, <code>step[]</code></li>
      </ul>
    `,
    global: `
      <h3>Organization (todas las páginas)</h3>
      <ul>
        <li><code>@type</code>: Organization; <code>@id</code>=<code>{{ shop.url }}#org</code>; <code>url</code>, <code>name</code>, <code>legalName</code></li>
        <li><code>logo</code> e <code>image</code> desde setting <code>org_logo</code></li>
        <li><code>sameAs</code> normalizado/deduplicado desde <code>org_sameas</code></li>
        <li><code>email</code>, <code>contactPoint</code> (Customer Support; <code>telephone</code> opcional)</li>
        <li><code>address</code> (street, city, postal, country)</li>
        <li><code>areaServed</code> a partir de <code>shipping_countries</code></li>
        <li><code>hasMerchantReturnPolicy</code> global</li>
      </ul>
      <h3>WebSite (home opcional)</h3>
      <ul>
        <li>Solo home si <code>website_on_home_only</code>=true</li>
        <li><code>@id</code>=<code>{{ shop.url }}#website</code>; <code>publisher</code>=<code>#org</code></li>
        <li><code>inLanguage</code> automático (ES/PT/EN)</li>
        <li><code>potentialAction</code>: <code>SearchAction</code> → <code>{{ shop.url }}/search?q={search_term_string}</code></li>
      </ul>
      <h3>BreadcrumbList (toggle)</h3>
      <ul>
        <li>Si <code>emit_breadcrumbs</code> está activo: Home → Colección → Producto</li>
      </ul>
    `,
    suppressor: `
      <h3>Supresor JSON-LD del tema</h3>
      <p>Con <code>suppress_theme_jsonld</code> activo, se eliminan scripts JSON-LD del tema que dupliquen los tipos emitidos por la app (los de la app con <code>data-sae="1"</code> se conservan).</p>
      <ul>
        <li>Tipos: Product, Organization, WebSite, BreadcrumbList, CollectionPage, WebPage, FAQPage, BlogPosting, HowTo, ContactPage, AboutPage, ItemList</li>
        <li>Usa <em>MutationObserver</em> y varias pasadas (DOMContentLoaded + timeouts) para limpiezas tardías</li>
      </ul>
    `,
  },

  en: {
    title: "Schema Advanced — Guide",
    intro:
      "This guide details EVERYTHING the app outputs per page type. Use the tabs to view Products, Collections, Pages, Blog/Articles, Global and the Suppressor.",
    openEditor: "Open theme editor",
    langLabel: "Language",
    tabs: {
      products: "Products",
      collections: "Collections",
      pages: "Pages",
      blog: "Blog / Articles",
      global: "Global",
      suppressor: "JSON-LD Suppressor",
      guide: "Guide",
    },
    guide: `
      <p><strong>How to use:</strong> Enable the App embed in <em>Online Store → Themes → Customize → App embeds</em>.
      The app injects JSON-LD tagged with <code>data-sae="1"</code>. Validate using
      <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">Google Rich Results Test</a>
      or the <a href="https://validator.schema.org/" target="_blank" rel="noreferrer">Schema.org Validator</a>.</p>
    `,
    products: `
      <h3>Product (PDP)</h3>
      <p>Emitted on product pages when <code>emit_product_auto</code> is enabled.</p>
      <h4>Identity</h4>
      <ul>
        <li><code>@type</code>: Product</li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ product.url }}#product</code></li>
        <li><code>mainEntityOfPage</code> (WebPage) and absolute <code>url</code></li>
      </ul>
      <h4>Basics</h4>
      <ul>
        <li><code>name</code> (title) and <code>description</code> (sanitized/truncated)</li>
        <li><code>category</code>: first collection or <code>product.type</code></li>
        <li><code>brand</code>: <code>Brand</code> with <code>name</code>=<code>product.vendor</code> or shop name</li>
      </ul>
      <h4>Identifiers</h4>
      <ul>
        <li><code>mpn</code> from <code>metafields.custom.mpn</code> or <code>variant.sku</code></li>
        <li><code>gtin8/12/13/14</code> based on <code>barcode</code> length</li>
      </ul>
      <h4>Images</h4>
      <ul><li>Up to 8 images at 1200px (https)</li></ul>
      <h4>additionalProperty</h4>
      <ul>
        <li>From <code>custom.*</code> metafields: <em>color</em>, <em>material</em>, <em>pattern</em>, <em>dimensions_text</em>, <em>weight_value+weight_unit</em></li>
      </ul>
      <h4>Offers & Pricing</h4>
      <ul>
        <li>Currency: <code>cart.currency.iso_code</code>; <code>priceValidUntil</code> ≈ +1 year</li>
        <li>Multi-variant → <code>AggregateOffer</code> (<code>lowPrice</code>, <code>highPrice</code>, <code>offerCount</code>, array of per-variant <code>Offer</code> using <code>?variant=ID</code>)</li>
        <li>Single variant → flat <code>Offer</code></li>
        <li><code>availability</code>: forced via <code>force_availability</code> or computed <code>InStock/OutOfStock</code></li>
        <li><code>itemCondition</code>: <code>NewCondition</code>; <code>seller</code>: Organization <code>@id</code></li>
      </ul>
      <h4>Shipping (<code>OfferShippingDetails</code>)</h4>
      <ul>
        <li><code>shippingDestination</code>: countries from <code>shipping_countries</code> (e.g., ES, PT)</li>
        <li><code>deliveryTime</code>: <code>handlingTime</code> (range) and <code>transitTime</code> (range)</li>
        <li>Optional <code>shippingRate</code> when <code>include_shipping_rate</code> + <code>shipping_rate_value</code></li>
      </ul>
      <h4>Returns (<code>MerchantReturnPolicy</code>)</h4>
      <ul>
        <li>Finite window; <code>merchantReturnDays</code> (default 30); <code>refundType</code>=FullRefund; <code>returnMethod</code>=ReturnByMail; <code>returnFees</code>=FreeReturn/ReturnShippingFees</li>
      </ul>
      <h4>Ratings (if present)</h4>
      <ul>
        <li><code>aggregateRating</code>: <code>ratingValue</code>, <code>reviewCount</code>, <code>bestRating</code>=5, <code>worstRating</code>=1</li>
      </ul>
    `,
    collections: `
      <h3>CollectionPage</h3>
      <p>Emitted on collections when <code>emit_collection_auto</code> is enabled.</p>
      <ul>
        <li><code>@type</code>: ["WebPage","CollectionPage"]</li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ collection.url }}#collection</code>; <code>url</code>, <code>name</code>, <code>description</code> (~300), <code>inLanguage</code></li>
        <li><code>dateModified</code> if available; <code>isPartOf</code> → <code>{{ shop.url }}#website</code></li>
        <li><code>primaryImageOfPage</code> when collection image exists</li>
      </ul>
      <h4>FAQPage (optional)</h4>
      <ul>
        <li>Metafield handle (<code>faq_handle</code>, e.g., <code>custom.faq</code>)</li>
        <li>Supports Metaobjects (<code>question/answer</code>) or parsed HTML; requires ≥2 Q&A pairs</li>
      </ul>
    `,
    pages: `
      <h3>Pages</h3>
      <h4>ContactPage</h4>
      <ul>
        <li>Active if template contains <code>contact</code> or path <code>/pages/contact</code></li>
        <li><code>@type</code>: ["WebPage","ContactPage"] · <code>@id</code> with <code>#contact</code></li>
        <li><code>name</code>, <code>description</code> (~300), <code>inLanguage</code></li>
        <li><code>isPartOf</code> → <code>{{ shop.url }}#website</code>; <code>about</code> → <code>{{ shop.url }}#org</code></li>
      </ul>
      <h4>AboutPage</h4>
      <ul>
        <li>Active on common paths: <code>/pages/about</code>, etc.</li>
        <li>Same structure with <code>#about</code> anchor</li>
      </ul>
    `,
    blog: `
      <h3>BlogPosting</h3>
      <ul>
        <li><code>@type</code>: BlogPosting; <code>@id</code>: <code>{{ shop.url }}{{ article.url }}#article</code>; <code>mainEntityOfPage</code>: WebPage</li>
        <li><code>headline</code> (≤110), <code>description</code> (≤300), <code>image</code> (url/width/height)</li>
        <li><code>datePublished</code>, <code>dateModified</code>, <code>author</code> (Person), <code>publisher</code> (Organization), <code>inLanguage</code>, <code>isAccessibleForFree</code>=true, <code>wordCount</code>, <code>articleSection</code></li>
      </ul>
      <h4>HowTo (optional)</h4>
      <ul>
        <li>Enabled via <code>emit_howto_auto</code></li>
        <li>Built from H2 headings (H3 normalized to H2); requires ≥2 steps</li>
        <li><code>@type</code>: HowTo; <code>@id</code>: <code>{{ shop.url }}{{ article.url }}#howto</code>; includes <code>name</code>, <code>description</code>, <code>image</code>, dates, <code>author</code>, <code>publisher</code>, <code>step[]</code></li>
      </ul>
    `,
    global: `
      <h3>Organization (all pages)</h3>
      <ul>
        <li><code>@type</code>: Organization; <code>@id</code>=<code>{{ shop.url }}#org</code>; <code>url</code>, <code>name</code>, <code>legalName</code></li>
        <li><code>logo</code> and <code>image</code> from <code>org_logo</code></li>
        <li><code>sameAs</code> normalized/deduped from <code>org_sameas</code></li>
        <li><code>email</code>, <code>contactPoint</code> (Customer Support; optional <code>telephone</code>)</li>
        <li><code>address</code> (street, city, postal, country)</li>
        <li><code>areaServed</code> from <code>shipping_countries</code></li>
        <li><code>hasMerchantReturnPolicy</code> global</li>
      </ul>
      <h3>WebSite (home optional)</h3>
      <ul>
        <li>Home-only if <code>website_on_home_only</code>=true</li>
        <li><code>@id</code>=<code>{{ shop.url }}#website</code>; <code>publisher</code>=<code>#org</code></li>
        <li><code>inLanguage</code> auto (ES/PT/EN)</li>
        <li><code>potentialAction</code>: <code>SearchAction</code> → <code>{{ shop.url }}/search?q={search_term_string}</code></li>
      </ul>
      <h3>BreadcrumbList (toggle)</h3>
      <ul>
        <li>When <code>emit_breadcrumbs</code> is enabled: Home → Collection → Product</li>
      </ul>
    `,
    suppressor: `
      <h3>Theme JSON-LD Suppressor</h3>
      <p>When <code>suppress_theme_jsonld</code> is enabled, the app removes theme JSON-LD overlapping the app output (scripts with <code>data-sae="1"</code> are preserved).</p>
      <ul>
        <li>Types: Product, Organization, WebSite, BreadcrumbList, CollectionPage, WebPage, FAQPage, BlogPosting, HowTo, ContactPage, AboutPage, ItemList</li>
        <li>Uses <em>MutationObserver</em> and multiple passes (DOMContentLoaded + timeouts) to catch late injections</li>
      </ul>
    `,
  },

  pt: {
    title: "Schema Advanced — Guia",
    intro:
      "Este guia detalha TUDO o que o app emite por tipo de página. Use as abas para ver Produtos, Coleções, Páginas, Blog/Artigos, Global e o Supressor.",
    openEditor: "Abrir editor do tema",
    langLabel: "Idioma",
    tabs: {
      products: "Produtos",
      collections: "Coleções",
      pages: "Páginas",
      blog: "Blog / Artigos",
      global: "Global",
      suppressor: "Supressor JSON-LD",
      guide: "Guia",
    },
    guide: `
      <p><strong>Como usar:</strong> Ative o App embed em <em>Online Store → Themes → Customize → App embeds</em>.
      O app injeta JSON-LD marcado com <code>data-sae="1"</code>. Valide com
      <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">Google Rich Results Test</a>
      ou o <a href="https://validator.schema.org/" target="_blank" rel="noreferrer">Schema.org Validator</a>.</p>
    `,
    products: `
      <h3>Product (PDP)</h3>
      <p>Emitido em páginas de produto quando <code>emit_product_auto</code> está ativo.</p>
      <h4>Identidade</h4>
      <ul>
        <li><code>@type</code>: Product</li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ product.url }}#product</code></li>
        <li><code>mainEntityOfPage</code> (WebPage) e <code>url</code> absoluta</li>
      </ul>
      <h4>Dados básicos</h4>
      <ul>
        <li><code>name</code> (título) e <code>description</code> (higienizado/truncado)</li>
        <li><code>category</code>: primeira coleção ou <code>product.type</code></li>
        <li><code>brand</code>: <code>Brand</code> com <code>name</code>=<code>product.vendor</code> ou nome da loja</li>
      </ul>
      <h4>Identificadores</h4>
      <ul>
        <li><code>mpn</code> de <code>metafields.custom.mpn</code> ou <code>variant.sku</code></li>
        <li><code>gtin8/12/13/14</code> conforme o tamanho do <code>barcode</code></li>
      </ul>
      <h4>Imagens</h4>
      <ul><li>Até 8 imagens em 1200px (https)</li></ul>
      <h4>additionalProperty</h4>
      <ul>
        <li>De <code>custom.*</code>: <em>color</em>, <em>material</em>, <em>pattern</em>, <em>dimensions_text</em>, <em>weight_value+weight_unit</em></li>
      </ul>
      <h4>Ofertas & Preços</h4>
      <ul>
        <li>Moeda: <code>cart.currency.iso_code</code>; <code>priceValidUntil</code> ≈ +1 ano</li>
        <li>Multi-variantes → <code>AggregateOffer</code> (<code>lowPrice</code>, <code>highPrice</code>, <code>offerCount</code>, lista de <code>Offer</code> com <code>?variant=ID</code>)</li>
        <li>Uma variante → <code>Offer</code> simples</li>
        <li><code>availability</code>: forçada por <code>force_availability</code> ou <code>InStock/OutOfStock</code></li>
        <li><code>itemCondition</code>: <code>NewCondition</code>; <code>seller</code>: Organization <code>@id</code></li>
      </ul>
      <h4>Envio (<code>OfferShippingDetails</code>)</h4>
      <ul>
        <li><code>shippingDestination</code>: países de <code>shipping_countries</code> (ex.: ES, PT)</li>
        <li><code>deliveryTime</code>: <code>handlingTime</code> (faixa) e <code>transitTime</code> (faixa)</li>
        <li><code>shippingRate</code> opcional com <code>include_shipping_rate</code> + <code>shipping_rate_value</code></li>
      </ul>
      <h4>Devoluções (<code>MerchantReturnPolicy</code>)</h4>
      <ul>
        <li>Janela finita; <code>merchantReturnDays</code> (padrão 30); <code>refundType</code>=FullRefund; <code>returnMethod</code>=ReturnByMail; <code>returnFees</code>=FreeReturn/ReturnShippingFees</li>
      </ul>
      <h4>Avaliações (se houver)</h4>
      <ul>
        <li><code>aggregateRating</code>: <code>ratingValue</code>, <code>reviewCount</code>, <code>bestRating</code>=5, <code>worstRating</code>=1</li>
      </ul>
    `,
    collections: `
      <h3>CollectionPage</h3>
      <p>Emitido em coleções quando <code>emit_collection_auto</code> está ativo.</p>
      <ul>
        <li><code>@type</code>: ["WebPage","CollectionPage"]</li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ collection.url }}#collection</code>; <code>url</code>, <code>name</code>, <code>description</code> (~300), <code>inLanguage</code></li>
        <li><code>dateModified</code> se existir; <code>isPartOf</code> → <code>{{ shop.url }}#website</code></li>
        <li><code>primaryImageOfPage</code> se houver imagem</li>
      </ul>
      <h4>FAQPage (opcional)</h4>
      <ul>
        <li>Metafield handle (<code>faq_handle</code>, ex.: <code>custom.faq</code>)</li>
        <li>Suporta Metaobjects (<code>question/answer</code>) ou HTML parseado; requer ≥2 Q&A</li>
      </ul>
    `,
    pages: `
      <h3>Páginas</h3>
      <h4>ContactPage</h4>
      <ul>
        <li>Ativo se o template contém <code>contact</code> ou path <code>/pages/contact</code></li>
        <li><code>@type</code>: ["WebPage","ContactPage"] · <code>@id</code> com <code>#contact</code></li>
        <li><code>name</code>, <code>description</code> (~300), <code>inLanguage</code></li>
        <li><code>isPartOf</code> → <code>{{ shop.url }}#website</code>; <code>about</code> → <code>{{ shop.url }}#org</code></li>
      </ul>
      <h4>AboutPage</h4>
      <ul>
        <li>Ativo em paths comuns: <code>/pages/about</code>, etc.</li>
        <li>Mesma estrutura com âncora <code>#about</code></li>
      </ul>
    `,
    blog: `
      <h3>BlogPosting</h3>
      <ul>
        <li><code>@type</code>: BlogPosting; <code>@id</code>: <code>{{ shop.url }}{{ article.url }}#article</code>; <code>mainEntityOfPage</code>: WebPage</li>
        <li><code>headline</code> (≤110), <code>description</code> (≤300), <code>image</code> (url/width/height)</li>
        <li><code>datePublished</code>, <code>dateModified</code>, <code>author</code> (Person), <code>publisher</code> (Organization), <code>inLanguage</code>, <code>isAccessibleForFree</code>=true, <code>wordCount</code>, <code>articleSection</code></li>
      </ul>
      <h4>HowTo (opcional)</h4>
      <ul>
        <li>Com <code>emit_howto_auto</code></li>
        <li>Gerado a partir de títulos H2 (H3 normalizado); requer ≥2 passos</li>
        <li><code>@type</code>: HowTo; <code>@id</code>: <code>{{ shop.url }}{{ article.url }}#howto</code>; inclui <code>name</code>, <code>description</code>, <code>image</code>, datas, <code>author</code>, <code>publisher</code>, <code>step[]</code></li>
      </ul>
    `,
    global: `
      <h3>Organization (todas as páginas)</h3>
      <ul>
        <li><code>@type</code>: Organization; <code>@id</code>=<code>{{ shop.url }}#org</code>; <code>url</code>, <code>name</code>, <code>legalName</code></li>
        <li><code>logo</code> e <code>image</code> de <code>org_logo</code></li>
        <li><code>sameAs</code> normalizado/deduplicado de <code>org_sameas</code></li>
        <li><code>email</code>, <code>contactPoint</code> (Suporte ao cliente; <code>telephone</code> opcional)</li>
        <li><code>address</code> (rua, cidade, postal, país)</li>
        <li><code>areaServed</code> de <code>shipping_countries</code></li>
        <li><code>hasMerchantReturnPolicy</code> global</li>
      </ul>
      <h3>WebSite (home opcional)</h3>
      <ul>
        <li>Apenas home se <code>website_on_home_only</code>=true</li>
        <li><code>@id</code>=<code>{{ shop.url }}#website</code>; <code>publisher</code>=<code>#org</code></li>
        <li><code>inLanguage</code> automático (PT/ES/EN)</li>
        <li><code>potentialAction</code>: <code>SearchAction</code> → <code>{{ shop.url }}/search?q={search_term_string}</code></li>
      </ul>
      <h3>BreadcrumbList (toggle)</h3>
      <ul>
        <li>Se <code>emit_breadcrumbs</code> estiver ativo: Home → Coleção → Produto</li>
      </ul>
    `,
    suppressor: `
      <h3>Supressor JSON-LD do tema</h3>
      <p>Com <code>suppress_theme_jsonld</code> ativo, remove-se JSON-LD do tema que conflita com o do app (mantém os scripts com <code>data-sae="1"</code>).</p>
      <ul>
        <li>Tipos: Product, Organization, WebSite, BreadcrumbList, CollectionPage, WebPage, FAQPage, BlogPosting, HowTo, ContactPage, AboutPage, ItemList</li>
        <li>Usa <em>MutationObserver</em> e múltiplas passagens (DOMContentLoaded + timeouts)</li>
      </ul>
    `,
  },
};

/* ========== HOOK I18N ========== */
function useI18n() {
  const { lang: ctxLang } = useOutletContext() || {};
  const [sp, setSp] = useSearchParams();
  const initial = sp.get("lang") || ctxLang || "es";
  const [lang, setLang] = useState(["es", "en", "pt"].includes(initial) ? initial : "es");

  // sync URL when language changes
  useEffect(() => {
    const nsp = new URLSearchParams(sp);
    nsp.set("lang", lang);
    window.history.replaceState({}, "", `?${nsp.toString()}`);
  }, [lang]); // eslint-disable-line

  const t = useMemo(() => TEXT[lang] || TEXT.es, [lang]);
  return { t, lang, setLang };
}

/* ========== TABS HORIZONTALES (no sidebar) ========== */
function Tabs({ items, active, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "12px 0 16px" }}>
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => onChange(it.key)}
          style={{
            padding: "8px 12px",
            borderRadius: 999,
            border: active === it.key ? "2px solid #111827" : "1px solid #d1d5db",
            background: active === it.key ? "#111827" : "#fff",
            color: active === it.key ? "#fff" : "#111827",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

/* ========== COMPONENTE ========== */
export default function Dashboard() {
  const { t, lang, setLang } = useI18n();
  const [sp] = useSearchParams();

  // pestañas
  const tabs = [
    { key: "guide", label: t.tabs.guide, html: t.guide },
    { key: "products", label: t.tabs.products, html: t.products },
    { key: "collections", label: t.tabs.collections, html: t.collections },
    { key: "pages", label: t.tabs.pages, html: t.pages },
    { key: "blog", label: t.tabs.blog, html: t.blog },
    { key: "global", label: t.tabs.global, html: t.global },
    { key: "suppressor", label: t.tabs.suppressor, html: t.suppressor },
  ];

  const initialTab = sp.get("tab") || "products";
  const [active, setActive] = useState(tabs.find((x) => x.key === initialTab) ? initialTab : "products");

  useEffect(() => {
    const nsp = new URLSearchParams(window.location.search);
    nsp.set("tab", active);
    window.history.replaceState({}, "", `?${nsp.toString()}`);
  }, [active]);

  const openThemeEditor = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const hostParam = params.get("host");
      if (hostParam) {
        // base64url → base64
        let b64 = hostParam.replace(/-/g, "+").replace(/_/g, "/");
        while (b64.length % 4) b64 += "=";
        let decoded = "";
        try { decoded = atob(b64); } catch {}
        if (decoded) {
          // soporta "shop.myshopify.com/admin" y "admin.shopify.com/store/..."
          const base = decoded.replace(/\/admin.*/i, "/admin").replace(/\/$/, "");
          const url = `https://${base}/themes/current/editor?context=apps`;
          (window.top || window).location.href = url;
          return;
        }
      }
      const shop =
        sp.get("shop") ||
        (typeof window !== "undefined" && window.Shopify && window.Shopify.shop) ||
        "";
      if (shop) {
        (window.top || window).location.href = `https://${shop}/admin/themes/current/editor?context=apps`;
        return;
      }
      (window.top || window).location.href = "/admin/themes/current/editor?context=apps";
    } catch {
      alert("No pude abrir el editor. Abre la app desde el Admin (URL con ?host=...) o añade ?shop=tu-tienda.myshopify.com.");
    }
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: 1.5, maxWidth: 1000, margin: "0 auto", padding: "10px 0" }}>
      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 4 }}>{t.title}</h1>
          <p style={{ margin: 0, color: "#374151" }}>{t.intro}</p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ fontSize: 12, color: "#374151" }}>
            {t.langLabel}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              style={{ marginLeft: 6, padding: "6px 8px", borderRadius: 6, border: "1px solid #d1d5db" }}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </label>

          <button
            onClick={openThemeEditor}
            style={{
              padding: "8px 12px",
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
        </div>
      </header>

      {/* Tabs horizontales */}
      <Tabs items={tabs} active={active} onChange={setActive} />

      {/* Contenido */}
      <section
        style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}
        dangerouslySetInnerHTML={{ __html: tabs.find((x) => x.key === active)?.html || "" }}
      />

      <footer style={{ marginTop: 20, fontSize: 12, color: "#6b7280" }}>
        Schema Advanced &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
