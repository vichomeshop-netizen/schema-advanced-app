
// app/routes/app._index.jsx
import { useEffect, useRef, useState } from "react";
import { useLoaderData, useOutletContext, useSearchParams } from "@remix-run/react";
import { json } from "@remix-run/node";

/**
 * Loader: expone la API key para App Bridge (solo para abrir el editor).
 * Asegúrate de definir SHOPIFY_API_KEY en tus variables de entorno.
 */
export async function loader() {
  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
}

/**
 * Pantalla informativa con pestañas laterales (sidebar).
 * Incluye ES/EN/PT y botón "Abrir editor de temas" con App Bridge Redirect + fallbacks.
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
        <li><code>url</code>, <code>name</code> (título), <code>description</code> (limpia/truncada ~300)</li>
        <li><code>inLanguage</code>, <code>dateModified</code> (si existe)</li>
        <li><code>isPartOf</code>: <code>@id</code>=<code>{{ shop.url }}#website</code></li>
        <li><code>primaryImageOfPage</code> (si existe)</li>
      </ul>
      <h4>FAQPage (opcional)</h4>
      <ul>
        <li>Handle <code>faq_handle</code> (p. ej. <code>custom.faq</code>)</li>
        <li><strong>Metaobjects</strong> con campos <code>question/answer</code> (también <em>pregunta/respuesta</em>)</li>
        <li><strong>HTML</strong> parseado emparejando ¿...? + respuesta; requiere ≥2 Q&A</li>
      </ul>
    `,
    pagesHtml: `
      <h3>Páginas (Contact / About)</h3>
      <h4>ContactPage</h4>
      <ul>
        <li>Activa si la plantilla contiene <code>contact</code> o ruta <code>/pages/contact</code></li>
        <li><code>@type</code>: <code>["WebPage","ContactPage"]</code></li>
        <li><code>@id</code>: URL con <code>#contact</code>; <code>name</code>, <code>description</code>, <code>inLanguage</code></li>
        <li><code>isPartOf</code>: <code>@id</code>=<code>{{ shop.url }}#website</code>; <code>about</code>=<code>@id</code> de Organization</li>
      </ul>
      <h4>AboutPage</h4>
      <ul>
        <li>Activa si la plantilla contiene <code>about</code> o rutas típicas (<code>/pages/acerca</code>, <code>/pages/sobre-nosotros</code>, <code>/pages/about</code>)</li>
        <li>Estructura análoga con <code>#about</code></li>
      </ul>
    `,
    blogHtml: `
      <h3>BlogPosting (Artículos)</h3>
      <ul>
        <li><code>@type</code>: <code>BlogPosting</code>; <code>@id</code>=<code>{{ shop.url }}{{ article.url }}#article</code>; <code>mainEntityOfPage</code>=WebPage</li>
        <li><code>headline</code> (≤110), <code>description</code> (≤300), <code>image</code> (ImageObject con url/width/height)</li>
        <li><code>datePublished</code>, <code>dateModified</code>, <code>author</code>(Person), <code>publisher</code>(Organization), <code>inLanguage</code>, <code>isAccessibleForFree</code>=true, <code>wordCount</code>, <code>articleSection</code></li>
      </ul>
      <h4>HowTo (opcional)</h4>
      <ul>
        <li>Activado con <code>emit_howto_auto</code></li>
        <li>Se genera desde H2 del artículo (normaliza H3 → H2). Requiere ≥2 pasos.</li>
        <li><code>@type</code>: <code>HowTo</code>; incluye <code>name</code>, <code>description</code>, <code>image</code> (si hay), fechas, <code>author</code>, <code>publisher</code>, y <code>step[]</code> (cada uno con <code>name</code> + <code>text</code>)</li>
      </ul>
    `,
    globalHtml: `
      <h3>Organization (todas las páginas)</h3>
      <ul>
        <li><code>@type</code>: <code>Organization</code>; <code>@id</code>=<code>{{ shop.url }}#org</code>; <code>url</code>, <code>name</code>, <code>legalName</code></li>
        <li><code>logo</code> e <code>image</code> desde setting <code>org_logo</code></li>
        <li><code>sameAs</code> normalizado (https y deduplicado desde <code>org_sameas</code>)</li>
        <li><code>email</code>, <code>contactPoint</code> (Customer Support con <code>telephone</code> opcional)</li>
        <li><code>address</code> (street, city, postal, country)</li>
        <li><code>areaServed</code> por países de <code>shipping_countries</code></li>
        <li><code>hasMerchantReturnPolicy</code> global</li>
      </ul>

      <h3>WebSite (home opcional)</h3>
      <ul>
        <li>Solo home si <code>website_on_home_only</code>=true</li>
        <li><code>@id</code>=<code>{{ shop.url }}#website</code>; <code>publisher</code>=<code>#org</code></li>
        <li><code>inLanguage</code>: auto (ES/PT/EN) por <em>locale</em>, <em>routes</em> e <em>idioma de tienda</em></li>
        <li><code>potentialAction</code>: <code>SearchAction</code> → <code>{{ shop.url }}/search?q={search_term_string}</code></li>
      </ul>

      <h3>BreadcrumbList (toggle)</h3>
      <ul>
        <li>Activado con <code>emit_breadcrumbs</code>. Cadena: Home → Collection (si aplica) → Product (si aplica)</li>
      </ul>
    `,
    suppressorHtml: `
      <h3>Supresor JSON-LD del tema</h3>
      <p>Al activar <code>suppress_theme_jsonld</code>, un script elimina los JSON-LD del tema que se solapan con los emitidos por la app (respeta los de la app marcados con <code>data-sae="1"</code>).</p>
      <ul>
        <li>Tipos afectados: Product, Organization, WebSite, BreadcrumbList, CollectionPage, WebPage, FAQPage, BlogPosting, HowTo, ContactPage, AboutPage, ItemList</li>
        <li>Usa <em>MutationObserver</em> y múltiples pasadas para limpiar inyecciones tardías</li>
      </ul>
    `,
  },

  en: {
    title: "Schema Advanced — Guide",
    intro:
      "This guide details EVERYTHING the app outputs per page type. Use the left sidebar to explore Products, Collections, Pages, Blog/Articles, Global and the Suppressor.",
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
      <p><strong>How to use:</strong> Enable the App embed under <em>Online Store → Themes → Customize → App embeds</em>.
      The app injects JSON-LD scripts with <code>data-sae="1"</code>. Validate with
      <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">Google Rich Results Test</a>
      or the <a href="https://validator.schema.org/" target="_blank" rel="noreferrer">Schema.org Validator</a>.</p>
    `,
    productsHtml: `
      <h3>Product (PDP)</h3>
      <p>Emitted on product pages when <code>emit_product_auto</code> is enabled.</p>
      <h4>Identity & links</h4>
      <ul>
        <li><code>@type</code>: <code>Product</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ product.url }}#product</code>; <code>mainEntityOfPage</code> (WebPage); absolute <code>url</code></li>
      </ul>
      <h4>Basics</h4>
      <ul>
        <li><code>name</code> (title), <code>description</code> (sanitized/truncated)</li>
        <li><code>category</code>: first collection title or <code>product.type</code></li>
        <li><code>brand</code>: <code>Brand</code> with <code>name</code>=<code>product.vendor</code> or shop name</li>
      </ul>
      <h4>Identifiers</h4>
      <ul>
        <li><code>mpn</code> from <code>metafields.custom.mpn</code> or <code>variant.sku</code></li>
        <li><code>gtin8/12/13/14</code> based on <code>barcode</code> length</li>
      </ul>
      <h4>Images</h4>
      <ul><li>Up to 8 images at 1200px (https URLs)</li></ul>
      <h4>additionalProperty</h4>
      <ul>
        <li>From <code>custom.*</code> metafields: <em>color, material, pattern, dimensions_text, weight_value+weight_unit</em></li>
      </ul>
      <h4>Offers & pricing</h4>
      <ul>
        <li>Currency: <code>cart.currency.iso_code</code>; <code>priceValidUntil</code> ≈ +1 year</li>
        <li>Multi-variant: <code>AggregateOffer</code> (<code>lowPrice</code>, <code>highPrice</code>, <code>offerCount</code>, array of per-variant <code>Offer</code> with <code>?variant=ID</code>)</li>
        <li>Single variant: flat <code>Offer</code></li>
        <li><code>availability</code>: forced via <code>force_availability</code> or computed <code>InStock/OutOfStock</code></li>
        <li><code>itemCondition</code>: <code>NewCondition</code>; <code>seller</code>: Organization <code>@id</code></li>
      </ul>
      <h4>Shipping (OfferShippingDetails)</h4>
      <ul>
        <li><code>shippingDestination</code>: countries from <code>shipping_countries</code> (e.g., ES, PT)</li>
        <li><code>deliveryTime</code>: <code>handlingTime</code> (range) and <code>transitTime</code> (range)</li>
        <li>Optional <code>shippingRate</code> with <code>include_shipping_rate</code> + <code>shipping_rate_value</code></li>
      </ul>
      <h4>Returns (MerchantReturnPolicy)</h4>
      <ul>
        <li>Finite window; <code>merchantReturnDays</code> (default 30); <code>refundType</code>=FullRefund; <code>returnMethod</code>=ReturnByMail; <code>returnFees</code>=FreeReturn/ReturnShippingFees</li>
      </ul>
      <h4>Ratings (if available)</h4>
      <ul>
        <li><code>aggregateRating</code> with <code>ratingValue</code>, <code>reviewCount</code>, <code>bestRating</code>=5, <code>worstRating</code>=1</li>
      </ul>
    `,
    collectionsHtml: `
      <h3>CollectionPage</h3>
      <p>Emitted on collection pages when <code>emit_collection_auto</code> is enabled.</p>
      <h4>WebPage + CollectionPage</h4>
      <ul>
        <li><code>@type</code>: <code>["WebPage","CollectionPage"]</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ collection.url }}#collection</code></li>
        <li><code>url</code>, <code>name</code>, <code>description</code> (~300), <code>inLanguage</code>, <code>dateModified</code> (if present)</li>
        <li><code>isPartOf</code>: <code>@id</code>=<code>{{ shop.url }}#website</code>; <code>primaryImageOfPage</code> if available</li>
      </ul>
      <h4>FAQPage (optional)</h4>
      <ul>
        <li>Handle <code>faq_handle</code> (e.g., <code>custom.faq</code>)</li>
        <li><strong>Metaobjects</strong> with <code>question/answer</code> fields, or parsed <strong>HTML</strong> Q&A; requires ≥2 pairs</li>
      </ul>
    `,
    pagesHtml: `
      <h3>Pages (Contact / About)</h3>
      <h4>ContactPage</h4>
      <ul>
        <li>Active if template contains <code>contact</code> or path <code>/pages/contact</code></li>
        <li><code>@type</code>: <code>["WebPage","ContactPage"]</code></li>
        <li><code>@id</code> with <code>#contact</code>; <code>name</code>, <code>description</code>, <code>inLanguage</code></li>
        <li><code>isPartOf</code>: <code>@id</code>=<code>{{ shop.url }}#website</code>; <code>about</code>=Organization <code>@id</code></li>
      </ul>
      <h4>AboutPage</h4>
      <ul>
        <li>Active if template contains <code>about</code> or common paths (<code>/pages/about</code>, etc.)</li>
        <li>Same structure with <code>#about</code></li>
      </ul>
    `,
    blogHtml: `
      <h3>BlogPosting (Articles)</h3>
      <ul>
        <li><code>@type</code>: <code>BlogPosting</code>; <code>@id</code>=<code>{{ shop.url }}{{ article.url }}#article</code>; <code>mainEntityOfPage</code>=WebPage</li>
        <li><code>headline</code> (≤110), <code>description</code> (≤300), <code>image</code> (ImageObject)</li>
        <li><code>datePublished</code>, <code>dateModified</code>, <code>author</code>(Person), <code>publisher</code>(Organization), <code>inLanguage</code>, <code>isAccessibleForFree</code>=true, <code>wordCount</code>, <code>articleSection</code></li>
      </ul>
      <h4>HowTo (optional)</h4>
      <ul>
        <li>Enabled via <code>emit_howto_auto</code></li>
        <li>Auto-generated from H2 headings (H3 normalized to H2). Needs ≥2 steps.</li>
        <li><code>@type</code>: <code>HowTo</code>; includes <code>name</code>, <code>description</code>, <code>image</code>, dates, <code>author</code>, <code>publisher</code>, and <code>step[]</code></li>
      </ul>
    `,
    globalHtml: `
      <h3>Organization (every page)</h3>
      <ul>
        <li><code>@type</code>: <code>Organization</code>; <code>@id</code>=<code>{{ shop.url }}#org</code>; <code>url</code>, <code>name</code>, <code>legalName</code></li>
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
        <li>Enabled via <code>emit_breadcrumbs</code>. Chain: Home → Collection → Product</li>
      </ul>
    `,
    suppressorHtml: `
      <h3>Theme JSON-LD Suppressor</h3>
      <p>When <code>suppress_theme_jsonld</code> is enabled, a script removes theme-injected JSON-LD overlapping the app output (keeps those with <code>data-sae="1"</code>).</p>
      <ul>
        <li>Types: Product, Organization, WebSite, BreadcrumbList, CollectionPage, WebPage, FAQPage, BlogPosting, HowTo, ContactPage, AboutPage, ItemList</li>
        <li>Uses MutationObserver and multiple passes to catch late injections</li>
      </ul>
    `,
  },

  pt: {
    title: "Schema Advanced — Guia",
    intro:
      "Este guia detalha TUDO o que o app emite por tipo de página. Use as abas laterais para ver Produtos, Coleções, Páginas, Blog/Artigos, Global e o Supressor.",
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
    productsHtml: `
      <h3>Product (PDP)</h3>
      <p>Emitido em páginas de produto quando <code>emit_product_auto</code> está ativo.</p>
      <h4>Identidade & links</h4>
      <ul>
        <li><code>@type</code>: <code>Product</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ product.url }}#product</code>; <code>mainEntityOfPage</code> (WebPage); <code>url</code> absoluta</li>
      </ul>
      <h4>Dados básicos</h4>
      <ul>
        <li><code>name</code> (título), <code>description</code> (higienizado/truncado)</li>
        <li><code>category</code>: primeira coleção ou <code>product.type</code></li>
        <li><code>brand</code>: <code>Brand</code> com <code>name</code>=<code>product.vendor</code> ou nome da loja</li>
      </ul>
      <h4>Identificadores</h4>
      <ul>
        <li><code>mpn</code> de <code>metafields.custom.mpn</code> ou <code>variant.sku</code></li>
        <li><code>gtin8/12/13/14</code> conforme o tamanho do <code>barcode</code></li>
      </ul>
      <h4>Imagens</h4>
      <ul><li>Até 8 imagens em 1200px (URLs https)</li></ul>
      <h4>additionalProperty</h4>
      <ul>
        <li>De metafields <code>custom.*</code>: <em>color, material, pattern, dimensions_text, weight_value+weight_unit</em></li>
      </ul>
      <h4>Ofertas & preços</h4>
      <ul>
        <li>Moeda: <code>cart.currency.iso_code</code>; <code>priceValidUntil</code> ≈ +1 ano</li>
        <li>Multi-variantes: <code>AggregateOffer</code> (<code>lowPrice</code>, <code>highPrice</code>, <code>offerCount</code>, lista de <code>Offer</code> com <code>?variant=ID</code>)</li>
        <li>1 variante: <code>Offer</code> simples</li>
        <li><code>availability</code>: forçada via <code>force_availability</code> ou <code>InStock/OutOfStock</code></li>
        <li><code>itemCondition</code>: <code>NewCondition</code>; <code>seller</code>: <code>@id</code> de Organization</li>
      </ul>
      <h4>Envio (OfferShippingDetails)</h4>
      <ul>
        <li><code>shippingDestination</code>: países de <code>shipping_countries</code> (ex.: ES, PT)</li>
        <li><code>deliveryTime</code>: <code>handlingTime</code> (faixa) e <code>transitTime</code> (faixa)</li>
        <li><code>shippingRate</code> opcional com <code>include_shipping_rate</code> + <code>shipping_rate_value</code></li>
      </ul>
      <h4>Devoluções (MerchantReturnPolicy)</h4>
      <ul>
        <li>Janela finita; <code>merchantReturnDays</code> (padrão 30); <code>refundType</code>=FullRefund; <code>returnMethod</code>=ReturnByMail; <code>returnFees</code>=FreeReturn/ReturnShippingFees</li>
      </ul>
      <h4>Avaliações (se houver)</h4>
      <ul>
        <li><code>aggregateRating</code> com <code>ratingValue</code>, <code>reviewCount</code>, <code>bestRating</code>=5, <code>worstRating</code>=1</li>
      </ul>
    `,
    collectionsHtml: `
      <h3>CollectionPage</h3>
      <p>Emitido em páginas de coleção quando <code>emit_collection_auto</code> está ativo.</p>
      <h4>WebPage + CollectionPage</h4>
      <ul>
        <li><code>@type</code>: <code>["WebPage","CollectionPage"]</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ collection.url }}#collection</code></li>
        <li><code>url</code>, <code>name</code>, <code>description</code> (~300), <code>inLanguage</code>, <code>dateModified</code> (se existir)</li>
        <li><code>isPartOf</code>: <code>@id</code>=<code>{{ shop.url }}#website</code>; <code>primaryImageOfPage</code> se disponível</li>
      </ul>
      <h4>FAQPage (opcional)</h4>
      <ul>
        <li>Handle <code>faq_handle</code> (ex.: <code>custom.faq</code>)</li>
        <li><strong>Metaobjects</strong> com campos <code>question/answer</code> ou <strong>HTML</strong> parseado; exige ≥2 pares</li>
      </ul>
    `,
    pagesHtml: `
      <h3>Páginas (Contact / About)</h3>
      <h4>ContactPage</h4>
      <ul>
        <li>Ativo se o template contém <code>contact</code> ou path <code>/pages/contact</code></li>
        <li><code>@type</code>: <code>["WebPage","ContactPage"]</code></li>
        <li><code>@id</code> com <code>#contact</code>; <code>name</code>, <code>description</code>, <code>inLanguage</code></li>
        <li><code>isPartOf</code>: <code>@id</code>=<code>{{ shop.url }}#website</code>; <code>about</code>=Organization <code>@id</code></li>
      </ul>
      <h4>AboutPage</h4>
      <ul>
        <li>Ativo se o template contém <code>about</code> ou paths comuns (<code>/pages/about</code>, etc.)</li>
        <li>Mesma estrutura com <code>#about</code></li>
      </ul>
    `,
    blogHtml: `
      <h3>BlogPosting (Artigos)</h3>
      <ul>
        <li><code>@type</code>: <code>BlogPosting</code>; <code>@id</code>=<code>{{ shop.url }}{{ article.url }}#article</code>; <code>mainEntityOfPage</code>=WebPage</li>
        <li><code>headline</code> (≤110), <code>description</code> (≤300), <code>image</code> (ImageObject)</li>
        <li><code>datePublished</code>, <code>dateModified</code>, <code>author</code>(Person), <code>publisher</code>(Organization), <code>inLanguage</code>, <code>isAccessibleForFree</code>=true, <code>wordCount</code>, <code>articleSection</code></li>
      </ul>
      <h4>HowTo (opcional)</h4>
      <ul>
        <li>Ativado via <code>emit_howto_auto</code></li>
        <li>Gerado automaticamente a partir de títulos H2 (H3 → H2). Requer ≥2 passos.</li>
        <li><code>@type</code>: <code>HowTo</code>; inclui <code>name</code>, <code>description</code>, <code>image</code>, datas, <code>author</code>, <code>publisher</code>, e <code>step[]</code></li>
      </ul>
    `,
    globalHtml: `
      <h3>Organization (todas as páginas)</h3>
      <ul>
        <li><code>@type</code>: <code>Organization</code>; <code>@id</code>=<code>{{ shop.url }}#org</code>; <code>url</code>, <code>name</code>, <code>legalName</code></li>
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
        <li>Ativado via <code>emit_breadcrumbs</code>. Cadeia: Home → Coleção → Produto</li>
      </ul>
    `,
    suppressorHtml: `
      <h3>Supressor JSON-LD do tema</h3>
      <p>Com <code>suppress_theme_jsonld</code> ativo, um script remove JSON-LD do tema que conflita com a saída do app (mantém os marcados com <code>data-sae="1"</code>).</p>
      <ul>
        <li>Tipos: Product, Organization, WebSite, BreadcrumbList, CollectionPage, WebPage, FAQPage, BlogPosting, HowTo, ContactPage, AboutPage, ItemList</li>
        <li>Usa MutationObserver e múltiplas passagens para injeções tardias</li>
      </ul>
    `,
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

// UI helpers
const Sidebar = ({ tabs, active, onChange }) => (
  <nav
    aria-label="Sections"
    style={{
      width: 260,
      minWidth: 220,
      borderRight: "1px solid #e5e7eb",
      paddingRight: 12,
      paddingTop: 8,
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
  const { apiKey } = useLoaderData();
  const t = useI18n();
  const [sp] = useSearchParams();

  const host = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("host") : null;
  const shop =
    sp.get("shop") ||
    (typeof window !== "undefined" && window.Shopify && window.Shopify.shop) ||
    "";

  // App Bridge
  const appBridgeRef = useRef(null);
  useEffect(() => {
    async function initAB() {
      if (!host || !apiKey) return;
      try {
        const { default: createApp } = await import("@shopify/app-bridge");
        const app = createApp({ apiKey, host, forceRedirect: false });
        appBridgeRef.current = app;
      } catch {
        // sin App Bridge, usaremos fallback
      }
    }
    initAB();
  }, [host, apiKey]);

  const openThemeEditor = async () => {
    // 1) Preferente: App Bridge → abre siempre en el Admin correcto (admin.shopify.com)
    if (appBridgeRef.current) {
      try {
        const { Redirect } = await import("@shopify/app-bridge/actions");
        const redirect = Redirect.create(appBridgeRef.current);
        redirect.dispatch(Redirect.Action.ADMIN_PATH, "/themes/current/editor?context=apps");
        return;
      } catch {
        // sigue a fallback
      }
    }

    // 2) Fallback dentro del Admin (por si estamos ya en admin.shopify.com)
    try {
      const adminRelative = "/admin/themes/current/editor?context=apps";
      (window.top || window).location.assign(adminRelative);
      return;
    } catch {
      // sigue
    }

    // 3) Fallback absoluto con shop (para salir del iframe si es necesario)
    if (shop) {
      const abs = `https://${shop}/admin/themes/current/editor?context=apps`;
      (window.top || window).location.assign(abs);
      return;
    }

    alert("No pude abrir el editor. Abre la app desde el Admin para disponer de ?host=... o proporciona ?shop=xxxx.myshopify.com.");
  };

  const tabs = [
    { key: "guide", label: t.tabs.guide, html: t.guideHtml },
    { key: "products", label: t.tabs.products, html: t.productsHtml },
    { key: "collections", label: t.tabs.collections, html: t.collectionsHtml },
    { key: "pages", label: t.tabs.pages, html: t.pagesHtml },
    { key: "blog", label: t.tabs.blog, html: t.blogHtml },
    { key: "global", label: t.tabs.global, html: t.globalHtml },
    { key: "suppressor", label: t.tabs.suppressor, html: t.suppressorHtml },
  ];

  const [active, setActive] = useState("products");
  const current = tabs.find((x) => x.key === active) || tabs[0];

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

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
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
