// app/routes/app.overview.jsx
import * as React from "react";
import { useOutletContext } from "@remix-run/react";

/**
 * Snippet listo para pegar en el bloque de colección (un único <script>):
 * - Emite ["WebPage","CollectionPage"] + "ItemList" juntos
 * - SIN inLanguage en ItemList (evita warnings)
 * - Máx 12 items para rendimiento
 */
const ITEMLIST_SNIPPET = `[
  {
    "@context": "https://schema.org",
    "@type": ["WebPage", "CollectionPage"],
    "@id": "{{ shop.url }}{{ collection.url }}#collection",
    "url": "{{ shop.url }}{{ collection.url }}",
    "name": {{ collection.title | strip_html | json }},
    "description": {{ collection.description | strip_html | truncate: 300 | json }},
    "inLanguage": {{ _lang_out | json }},
    "isPartOf": { "@type": "WebSite", "@id": "{{ shop.url }}#website" }{% if collection.image %},
    "primaryImageOfPage": { "@type": "ImageObject", "url": {{ collection.image | image_url: width: 1200 | prepend: "https:" | json | replace: '\\/','/' }} }{% endif %}
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": "{{ shop.url }}{{ collection.url }}#list",
    "url": "{{ shop.url }}{{ collection.url }}",
    "name": {{ collection.title | strip_html | json }},
    "itemListOrder": "https://schema.org/ItemListOrderAscending",
    "numberOfItems": {{ collection.products_count | default: collection.all_products_count | default: collection.products.size }},
    "itemListElement": [
      {%- assign _pos = 1 -%}
      {%- for p in collection.products limit: 12 -%}
      {
        "@type": "ListItem",
        "position": {{ _pos }},
        "item": {
          "@type": "Product",
          "name": {{ p.title | strip_html | json }},
          "url": {{ shop.url | append: p.url | json | replace: '\\/','/' }}{% if p.featured_image %},
          "image": {{ p.featured_image | image_url: width: 1000 | prepend: "https:" | json | replace: '\\/','/' }}{% endif %},
          "brand": { "@type": "Brand", "name": {{ p.vendor | default: shop.name | json }} },
          "offers": {
            "@type": "Offer",
            "priceCurrency": "{{ cart.currency.iso_code }}",
            "price": "{{ p.price | divided_by: 100.00 }}",
            "availability": "https://schema.org/{% if p.available %}InStock{% else %}OutOfStock{% endif %}",
            "itemCondition": "https://schema.org/NewCondition",
            "seller": { "@id": "{{ shop.url }}#org" }
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
    tabs: { quick: "Guía rápida", advanced: "Avanzado" },
    quickHtml: `
      <p><strong>Qué es:</strong> App <em>embedded</em> en Shopify que añade <em>JSON-LD</em> de alta calidad, elimina duplicados/errores del tema y mejora el rendimiento.</p>
      <h3>Qué emite (automático y seguro)</h3>
      <ul>
        <li><strong>Organization</strong> (#org) con <em>sameAs</em> deduplicado, contacto, dirección y política de devoluciones.</li>
        <li><strong>WebSite</strong> (home) con <code>SearchAction</code> y <code>publisher → #org</code>.</li>
        <li><strong>BreadcrumbList</strong> (Home → Colección → Producto) con posiciones y URLs canónicas.</li>
        <li><strong>Colecciones</strong>: <em>CollectionPage</em> + <em>ItemList</em> en un solo <code>&lt;script&gt;</code>, máx. 12 ítems (carrusel SEO sin ralentizar).</li>
        <li><strong>Producto</strong>: Brand, MPN/GTIN (8/12/13/14), imágenes (hasta 8), <em>Offers</em> (Aggregate/Offer), envío y devoluciones, <em>aggregateRating</em> si existe.</li>
        <li><strong>BlogPosting</strong> + <strong>HowTo</strong> opcional (≥2 H2), <strong>ContactPage</strong>, <strong>AboutPage</strong>.</li>
      </ul>
      <h3>Por qué es diferente</h3>
      <ul>
        <li><strong>Embedded real</strong>: sin iframes raros ni scripts externos que añaden latencia.</li>
        <li><strong>Supresor JSON-LD</strong> robusto que evita duplicados del tema/apps (respeta <code>data-sae="1"</code>).</li>
        <li><strong>I18N inteligente</strong>: ES/PT automáticos, fallback EN; <code>inLanguage</code> solo donde procede (no en ItemList).</li>
        <li><strong>“Instalar y olvidar”</strong>: opciones claras, cambios seguros, rendimiento estable.</li>
      </ul>
    `,
    advancedHtml: `
      <h2>Diseño técnico completo (Avanzado)</h2>

      <h3>1) Objetivos y arquitectura</h3>
      <ul>
        <li>JSON-LD consistente, canónico, sin duplicados (<em>arrays</em> en un único script por bloque; evitamos <code>@graph</code>).</li>
        <li>App embebida (Admin de Shopify): UI nativa, menor latencia, control total.</li>
        <li>Rendimiento: <em>CollectionPage + ItemList</em> en un único <code>&lt;script type="application/ld+json"&gt;</code>, 12 ítems, 8 imágenes por producto, URLs absolutas HTTPS.</li>
        <li>Supresor JSON-LD: limpia Product, Organization, WebSite, BreadcrumbList, CollectionPage, WebPage, FAQPage, BlogPosting, HowTo, ContactPage, AboutPage, ItemList (respeta <code>data-sae="1"</code>).</li>
      </ul>

      <h3>2) I18N y <code>inLanguage</code></h3>
      <ul>
        <li>Detección (<code>language_mode</code>): es/pt/en/auto. Auto: <code>request.locale</code> → <code>localization.language</code> → <code>routes.root_url</code> → <code>shop.primary_locale</code>.</li>
        <li>Salida: <code>es-ES</code>, <code>pt-PT</code> o <code>en</code>.</li>
        <li>Uso correcto: <em>WebSite</em>, <em>CollectionPage</em>, <em>BlogPosting</em>, <em>HowTo</em>. <strong>No</strong> en <em>ItemList</em>.</li>
      </ul>

      <h3>3) IDs canónicos y URIs</h3>
      <ul>
        <li>Organization: <code>{{ shop.url }}#org</code>; WebSite: <code>{{ shop.url }}#website</code>.</li>
        <li>CollectionPage: <code>{{ shop.url }}{{ collection.url }}#collection</code>; ItemList: <code>#list</code>.</li>
        <li>Product: <code>{{ shop.url }}{{ product.url }}#product</code>.</li>
        <li>Estados/orden siempre en HTTPS: <code>https://schema.org/ItemListOrderAscending</code>, <code>https://schema.org/InStock</code>, <code>https://schema.org/NewCondition</code>.</li>
      </ul>

      <h3>4) Organization</h3>
      <ul>
        <li>Campos: url, name, legalName, logo/image (si hay), email, contactPoint (telephone/email), address, areaServed, hasMerchantReturnPolicy.</li>
        <li><em>sameAs</em> normalizado: <code>https://</code>, deduplicación, limpieza de comillas.</li>
      </ul>

      <h3>5) WebSite</h3>
      <ul>
        <li>Condicional por <code>website_on_home_only</code>.</li>
        <li><code>SearchAction</code> (<code>/search?q={search_term_string}</code>) y <code>publisher → #org</code>.</li>
      </ul>

      <h3>6) BreadcrumbList</h3>
      <ul>
        <li>Home → Colección → Producto; en PDP usa <code>product.collections.first</code> si no hay <code>collection</code> en contexto.</li>
        <li>Posiciones incrementales y URLs canónicas.</li>
      </ul>

      <h3>7) CollectionPage + ItemList (un solo script)</h3>
      <p><strong>CollectionPage</strong>: tipos, @id, url, name, description (~300), inLanguage, dateModified si existe, isPartOf → #website, primaryImageOfPage si hay imagen.</p>
      <p><strong>ItemList</strong> (12 máx, orden ascendente): @id #list, url, name, itemListOrder HTTPS, numberOfItems; cada ListItem: Product mínimo viable (name, url, image 1000 px si hay, Brand.name, Offer simple con priceCurrency/price/availability/itemCondition/seller → #org).</p>

      <h3>8) FAQPage (colección, opcional)</h3>
      <ul>
        <li>Handle único (<code>faq_handle</code>, p.ej. <code>custom.faq</code>), soporta metaobjects (question/answer o pregunta/respuesta) y HTML parseado.</li>
        <li>Reglas HTML: tokenizar por <code>&lt;/p&gt;</code>, pregunta si “¿” inicial o “?” final (≤220 chars), acumular respuesta hasta la siguiente pregunta; requiere ≥2 Q/A.</li>
      </ul>

      <h3>9) Product (PDP)</h3>
      <ul>
        <li>Identidad: @id #product, mainEntityOfPage → URL PDP.</li>
        <li>Brand/MPN/GTIN: brand = vendor/shop; mpn = metafield o sku; GTIN por longitud (8/12/13/14) en la variante seleccionada y por variante en AggregateOffer.</li>
        <li>Imágenes: hasta 8 (1200 px), absolutas https.</li>
        <li>additionalProperty: color, material, patrón, dimensiones, peso cuando existan.</li>
        <li>category: primera colección o fallback a product.type.</li>
        <li>Offers:
          <ul>
            <li>Con variantes: AggregateOffer (priceCurrency, lowPrice, highPrice, offerCount, offers[] por variante con URL ?variant, sku, GTIN, price, priceValidUntil anual, availability derivada/forzada, itemCondition, seller → #org, shippingDetails).</li>
            <li>Sin variantes: Offer con campos equivalentes.</li>
            <li>ShippingDetails: shippingDestination desde <code>shipping_countries</code>; deliveryTime con handling/transit (rangos a-b); shippingRate opcional.</li>
          </ul>
        </li>
        <li>Relación con colección:
          <ul>
            <li>Explícita desde la colección vía ItemList.</li>
            <li>Opcional desde el producto con <code>subjectOf</code> → CollectionPage:
              <pre><code>"subjectOf": { "@type":"CollectionPage", "@id":"{{ shop.url }}{{ collection.url }}#collection" }</code></pre>
            </li>
          </ul>
        </li>
        <li>aggregateRating: si hay metafields de reviews.</li>
      </ul>

      <h3>10) BlogPosting + HowTo</h3>
      <ul>
        <li>BlogPosting: headline, description, image (width/height), dates, author, publisher → #org, inLanguage, isAccessibleForFree, wordCount, articleSection.</li>
        <li>HowTo (opcional): ≥2 H2 → HowToStep (name/text ~700 chars).</li>
      </ul>

      <h3>11) ContactPage / AboutPage</h3>
      <ul>
        <li>Tipos compuestos ["WebPage","ContactPage"] o ["WebPage","AboutPage"], @id/url canónicos, name, description (~300), inLanguage, isPartOf → #website, about → #org.</li>
      </ul>

      <h3>12) Supresor JSON-LD</h3>
      <ul>
        <li>Estrategia: clean() inmediata, DOMContentLoaded, reintentos temporizados y MutationObserver que elimina scripts no marcados con <code>data-sae</code> si su @type coincide con la kill-list.</li>
      </ul>

      <h3>13) Rendimiento y límites</h3>
      <ul>
        <li>Un único script para CollectionPage + ItemList; 12 productos por lista; 8 imágenes por PDP.</li>
        <li>priceValidUntil anual; precios con <code>divided_by:100.00</code>; URIs absolutas HTTPS.</li>
      </ul>

      <h3>14) Validación y troubleshooting</h3>
      <ul>
        <li>No usar <code>inLanguage</code> en ItemList.</li>
        <li>Comprobación rápida en consola:
          <pre><code>Array.from(document.querySelectorAll('script[type="application/ld+json"]')).some(s =&gt; s.textContent.includes('"@type":"ItemList"'))</code></pre>
        </li>
        <li>Si el tema emite JSON-LD, activar el supresor.</li>
      </ul>

      <h3>15) Diferenciadores</h3>
      <ul>
        <li>Embedded real, supresor robusto, marcado consolidado, self-linking Colección↔Producto, GTIN/MPN, políticas de envío/devolución, HowTo automático, I18N inteligente.</li>
      </ul>
    `,
    copy: "Copiar snippet",
    copied: "¡Copiado!",
  },
  en: {
    title: "App Overview",
    tabs: { quick: "Quick start", advanced: "Advanced" },
    quickHtml: `
      <p><strong>What it is:</strong> Embedded Shopify app that adds high-quality <em>JSON-LD</em>, removes theme duplicates/errors, and improves performance.</p>
      <h3>What it emits (automatic & safe)</h3>
      <ul>
        <li><strong>Organization</strong> (#org) with cleaned <em>sameAs</em>, contact, address, return policy.</li>
        <li><strong>WebSite</strong> (home) with <code>SearchAction</code> and <code>publisher → #org</code>.</li>
        <li><strong>BreadcrumbList</strong> (Home → Collection → Product) with positions and canonical URLs.</li>
        <li><strong>Collections</strong>: <em>CollectionPage</em> + <em>ItemList</em> in one <code>&lt;script&gt;</code>, max 12 items (SEO carousel without slowing down).</li>
        <li><strong>Product</strong>: Brand, MPN/GTIN (8/12/13/14), images (up to 8), <em>Offers</em> (Aggregate/Offer), shipping/returns, <em>aggregateRating</em> if present.</li>
        <li><strong>BlogPosting</strong> + optional <strong>HowTo</strong> (≥2 H2), <strong>ContactPage</strong>, <strong>AboutPage</strong>.</li>
      </ul>
      <h3>Why it’s different</h3>
      <ul>
        <li><strong>True embedded</strong>: native Admin UI, no extra-latency scripts.</li>
        <li><strong>Robust JSON-LD suppressor</strong> that avoids theme/app duplicates (respects <code>data-sae="1"</code>).</li>
        <li><strong>Smart I18N</strong>: ES/PT auto, EN fallback; <code>inLanguage</code> only where valid (not on ItemList).</li>
        <li><strong>Install & forget</strong>: safe toggles, stable performance.</li>
      </ul>
    `,
    advancedHtml: `
      <h2>Full Technical Design (Advanced)</h2>

      <h3>1) Goals & Architecture</h3>
      <ul>
        <li>Consistent, canonical JSON-LD without duplicates (JSON arrays per logical block; no <code>@graph</code>).</li>
        <li>Embedded Admin app: native UI, lower latency, full control.</li>
        <li>Performance: <em>CollectionPage + ItemList</em> in a single <code>&lt;script type="application/ld+json"&gt;</code>, 12 items, 8 images per product, absolute HTTPS URLs.</li>
        <li>JSON-LD suppressor: cleans Product, Organization, WebSite, BreadcrumbList, CollectionPage, WebPage, FAQPage, BlogPosting, HowTo, ContactPage, AboutPage, ItemList (respects <code>data-sae="1"</code>).</li>
      </ul>

      <h3>2) I18N & <code>inLanguage</code></h3>
      <ul>
        <li>Detection (<code>language_mode</code>): es/pt/en/auto. Auto: <code>request.locale</code> → <code>localization.language</code> → <code>routes.root_url</code> → <code>shop.primary_locale</code>.</li>
        <li>Output: <code>es-ES</code>, <code>pt-PT</code> or <code>en</code>.</li>
        <li>Proper usage: <em>WebSite</em>, <em>CollectionPage</em>, <em>BlogPosting</em>, <em>HowTo</em>. <strong>Not</strong> on <em>ItemList</em>.</li>
      </ul>

      <h3>3) Canonical IDs & URIs</h3>
      <ul>
        <li>Organization: <code>{{ shop.url }}#org</code>; WebSite: <code>{{ shop.url }}#website</code>.</li>
        <li>CollectionPage: <code>{{ shop.url }}{{ collection.url }}#collection</code>; ItemList: <code>#list</code>.</li>
        <li>Product: <code>{{ shop.url }}{{ product.url }}#product</code>.</li>
        <li>States/order in HTTPS: <code>https://schema.org/ItemListOrderAscending</code>, <code>https://schema.org/InStock</code>, <code>https://schema.org/NewCondition</code>.</li>
      </ul>

      <h3>4) Organization</h3>
      <ul>
        <li>Fields: url, name, legalName, logo/image (if present), email, contactPoint (telephone/email), address, areaServed, hasMerchantReturnPolicy.</li>
        <li><em>sameAs</em> normalization: enforce <code>https://</code>, dedupe, clean quotes.</li>
      </ul>

      <h3>5) WebSite</h3>
      <ul>
        <li>Conditional by <code>website_on_home_only</code>.</li>
        <li><code>SearchAction</code> (<code>/search?q={search_term_string}</code>) and <code>publisher → #org</code>.</li>
      </ul>

      <h3>6) BreadcrumbList</h3>
      <ul>
        <li>Home → Collection → Product; on PDP use <code>product.collections.first</code> if <code>collection</code> is missing.</li>
        <li>Incremental positions and canonical URLs.</li>
      </ul>

      <h3>7) CollectionPage + ItemList (single script)</h3>
      <p><strong>CollectionPage</strong>: types, @id, url, name, description (~300), inLanguage, dateModified if present, isPartOf → #website, primaryImageOfPage when available.</p>
      <p><strong>ItemList</strong> (12 max, ascending): @id #list, url, name, itemListOrder HTTPS, numberOfItems; each ListItem: minimal Product (name, url, image 1000 px if present, Brand.name, simple Offer with priceCurrency/price/availability/itemCondition/seller → #org).</p>

      <h3>8) FAQPage (collection, optional)</h3>
      <ul>
        <li>Single <code>faq_handle</code> (e.g., <code>custom.faq</code>), supports metaobjects (question/answer or pregunta/respuesta) and parsed HTML.</li>
        <li>HTML rules: tokenize by <code>&lt;/p&gt;</code>, detect question if starts with “¿” or ends with “?” (≤220 chars), accumulate answer until next question; require ≥2 Q/A.</li>
      </ul>

      <h3>9) Product (PDP)</h3>
      <ul>
        <li>Identity: @id #product, mainEntityOfPage → PDP URL.</li>
        <li>Brand/MPN/GTIN: brand = vendor/shop; mpn = metafield or sku; GTIN by length (8/12/13/14) for selected variant and per-variant in AggregateOffer.</li>
        <li>Images: up to 8 (1200 px), absolute https.</li>
        <li>additionalProperty: color, material, pattern, dimensions, weight when present.</li>
        <li>category: first collection or fallback product.type.</li>
        <li>Offers:
          <ul>
            <li>With variants: AggregateOffer (priceCurrency, lowPrice, highPrice, offerCount, offers[] per variant with ?variant URL, sku, GTIN, price, annual priceValidUntil, derived/forced availability, itemCondition, seller → #org, shippingDetails).</li>
            <li>No variants: Offer with equivalent fields.</li>
            <li>ShippingDetails: shippingDestination from <code>shipping_countries</code>; deliveryTime with handling/transit (a-b ranges); optional shippingRate.</li>
          </ul>
        </li>
        <li>Collection linking:
          <ul>
            <li>Explicit from collection via ItemList.</li>
            <li>Optional from product via <code>subjectOf</code> → CollectionPage:
              <pre><code>"subjectOf": { "@type":"CollectionPage", "@id":"{{ shop.url }}{{ collection.url }}#collection" }</code></pre>
            </li>
          </ul>
        </li>
        <li>aggregateRating: if review metafields exist.</li>
      </ul>

      <h3>10) BlogPosting + HowTo</h3>
      <ul>
        <li>BlogPosting: headline, description, image (width/height), dates, author, publisher → #org, inLanguage, isAccessibleForFree, wordCount, articleSection.</li>
        <li>HowTo (optional): ≥2 H2 → HowToStep (name/text ~700 chars).</li>
      </ul>

      <h3>11) ContactPage / AboutPage</h3>
      <ul>
        <li>Composite types ["WebPage","ContactPage"] or ["WebPage","AboutPage"], canonical @id/url, name, description (~300), inLanguage, isPartOf → #website, about → #org.</li>
      </ul>

      <h3>12) JSON-LD Suppressor</h3>
      <ul>
        <li>Strategy: immediate clean(), DOMContentLoaded, timed retries, and MutationObserver that removes untagged scripts when @type matches kill-list; preserves those with <code>data-sae</code>.</li>
      </ul>

      <h3>13) Performance & limits</h3>
      <ul>
        <li>Single script for CollectionPage + ItemList; 12 products per list; 8 images per PDP.</li>
        <li>Annual priceValidUntil; prices via <code>divided_by:100.00</code>; absolute HTTPS URIs.</li>
      </ul>

      <h3>14) Validation & troubleshooting</h3>
      <ul>
        <li>Do not use <code>inLanguage</code> on ItemList.</li>
        <li>Quick console check:
          <pre><code>Array.from(document.querySelectorAll('script[type="application/ld+json"]')).some(s =&gt; s.textContent.includes('"@type":"ItemList"'))</code></pre>
        </li>
        <li>If the theme emits JSON-LD, enable the suppressor.</li>
      </ul>

      <h3>15) Differentiators</h3>
      <ul>
        <li>True embedded, robust suppressor, consolidated markup, self-linking Collection↔Product, GTIN/MPN, shipping/returns policy, auto HowTo, smart I18N.</li>
      </ul>
    `,
    copy: "Copy snippet",
    copied: "Copied!",
  },
  pt: {
    title: "Visão geral do app",
    tabs: { quick: "Guia rápida", advanced: "Avançado" },
    quickHtml: `
      <p><strong>O que é:</strong> App incorporado no Shopify que adiciona <em>JSON-LD</em> de alta qualidade, remove duplicações/erros do tema e melhora a performance.</p>
      <h3>O que emite (automático e seguro)</h3>
      <ul>
        <li><strong>Organization</strong> (#org) com <em>sameAs</em> limpo, contacto, endereço e política de devoluções.</li>
        <li><strong>WebSite</strong> (home) com <code>SearchAction</code> e <code>publisher → #org</code>.</li>
        <li><strong>BreadcrumbList</strong> (Home → Coleção → Produto) com posições e URLs canónicas.</li>
        <li><strong>Coleções</strong>: <em>CollectionPage</em> + <em>ItemList</em> num único <code>&lt;script&gt;</code>, máx. 12 itens (carrossel SEO sem atrasar).</li>
        <li><strong>Produto</strong>: Brand, MPN/GTIN (8/12/13/14), imagens (até 8), <em>Offers</em> (Aggregate/Offer), envio/devoluções, <em>aggregateRating</em> se existir.</li>
        <li><strong>BlogPosting</strong> + <strong>HowTo</strong> opcional (≥2 H2), <strong>ContactPage</strong>, <strong>AboutPage</strong>.</li>
      </ul>
      <h3>Porque é diferente</h3>
      <ul>
        <li><strong>Embedded real</strong>: UI nativa, sem scripts externos com latência.</li>
        <li><strong>Supressor JSON-LD</strong> robusto que evita duplicações (respeita <code>data-sae="1"</code>).</li>
        <li><strong>I18N inteligente</strong>: ES/PT automáticos, EN fallback; <code>inLanguage</code> só onde é válido (não em ItemList).</li>
        <li><strong>Instalar e esquecer</strong>: opções seguras e estáveis.</li>
      </ul>
    `,
    advancedHtml: `
      <h2>Desenho técnico completo (Avançado)</h2>

      <h3>1) Objetivos e arquitetura</h3>
      <ul>
        <li>JSON-LD consistente, canónico e sem duplicações (arrays por bloco lógico; sem <code>@graph</code>).</li>
        <li>App embedded no Admin: UI nativa, menor latência, controlo total.</li>
        <li>Performance: <em>CollectionPage + ItemList</em> num único <code>&lt;script type="application/ld+json"&gt;</code>, 12 itens, 8 imagens por produto, URLs absolutas HTTPS.</li>
        <li>Supressor JSON-LD: remove Product, Organization, WebSite, BreadcrumbList, CollectionPage, WebPage, FAQPage, BlogPosting, HowTo, ContactPage, AboutPage, ItemList (respeita <code>data-sae="1"</code>).</li>
      </ul>

      <h3>2) I18N e <code>inLanguage</code></h3>
      <ul>
        <li>Detecção (<code>language_mode</code>): es/pt/en/auto. Auto: <code>request.locale</code> → <code>localization.language</code> → <code>routes.root_url</code> → <code>shop.primary_locale</code>.</li>
        <li>Saída: <code>es-ES</code>, <code>pt-PT</code> ou <code>en</code>.</li>
        <li>Uso adequado: <em>WebSite</em>, <em>CollectionPage</em>, <em>BlogPosting</em>, <em>HowTo</em>. <strong>Não</strong> em <em>ItemList</em>.</li>
      </ul>

      <h3>3) IDs canónicos e URIs</h3>
      <ul>
        <li>Organization: <code>{{ shop.url }}#org</code>; WebSite: <code>{{ shop.url }}#website</code>.</li>
        <li>CollectionPage: <code>{{ shop.url }}{{ collection.url }}#collection</code>; ItemList: <code>#list</code>.</li>
        <li>Product: <code>{{ shop.url }}{{ product.url }}#product</code>.</li>
        <li>Estados/ordem sempre em HTTPS: <code>https://schema.org/ItemListOrderAscending</code>, <code>https://schema.org/InStock</code>, <code>https://schema.org/NewCondition</code>.</li>
      </ul>

      <h3>4) Organization</h3>
      <ul>
        <li>Campos: url, name, legalName, logo/image (se houver), email, contactPoint (telephone/email), address, areaServed, hasMerchantReturnPolicy.</li>
        <li>Normalização de <em>sameAs</em>: forçar <code>https://</code>, deduplicar, limpar aspas.</li>
      </ul>

      <h3>5) WebSite</h3>
      <ul>
        <li>Condicionado por <code>website_on_home_only</code>.</li>
        <li><code>SearchAction</code> (<code>/search?q={search_term_string}</code>) e <code>publisher → #org</code>.</li>
      </ul>

      <h3>6) BreadcrumbList</h3>
      <ul>
        <li>Home → Coleção → Produto; em PDP usa <code>product.collections.first</code> se faltar <code>collection</code>.</li>
        <li>Posições incrementais e URLs canónicas.</li>
      </ul>

      <h3>7) CollectionPage + ItemList (script único)</h3>
      <p><strong>CollectionPage</strong>: tipos, @id, url, name, description (~300), inLanguage, dateModified se existir, isPartOf → #website, primaryImageOfPage quando aplicável.</p>
      <p><strong>ItemList</strong> (máx 12, ascendente): @id #list, url, name, itemListOrder HTTPS, numberOfItems; cada ListItem: Product mínimo (name, url, image 1000 px se houver, Brand.name, Offer simples com priceCurrency/price/availability/itemCondition/seller → #org).</p>

      <h3>8) FAQPage (coleção, opcional)</h3>
      <ul>
        <li><code>faq_handle</code> único (ex.: <code>custom.faq</code>), suporta metaobjects (question/answer ou pergunta/resposta) e HTML parseado.</li>
        <li>Regras HTML: tokenizar por <code>&lt;/p&gt;</code>, pergunta se começa com “¿” ou termina com “?” (≤220 chars), acumular resposta até a próxima pergunta; requer ≥2 Q/A.</li>
      </ul>

      <h3>9) Product (PDP)</h3>
      <ul>
        <li>Identidade: @id #product, mainEntityOfPage → URL PDP.</li>
        <li>Brand/MPN/GTIN: brand = vendor/shop; mpn = metafield ou sku; GTIN por comprimento (8/12/13/14) na variante selecionada e por variante em AggregateOffer.</li>
        <li>Imagens: até 8 (1200 px), https absolutas.</li>
        <li>additionalProperty: color, material, pattern, dimensions, weight quando existirem.</li>
        <li>category: primeira coleção ou fallback product.type.</li>
        <li>Offers:
          <ul>
            <li>Com variantes: AggregateOffer (priceCurrency, lowPrice, highPrice, offerCount, offers[] por variante com URL ?variant, sku, GTIN, price, priceValidUntil anual, availability derivada/forçada, itemCondition, seller → #org, shippingDetails).</li>
            <li>Sem variantes: Offer com campos equivalentes.</li>
            <li>ShippingDetails: shippingDestination de <code>shipping_countries</code>; deliveryTime com handling/transit (intervalos a-b); shippingRate opcional.</li>
          </ul>
        </li>
        <li>Ligação com coleção:
          <ul>
            <li>Explícita pela coleção via ItemList.</li>
            <li>Opcional pelo produto via <code>subjectOf</code> → CollectionPage:
              <pre><code>"subjectOf": { "@type":"CollectionPage", "@id":"{{ shop.url }}{{ collection.url }}#collection" }</code></pre>
            </li>
          </ul>
        </li>
        <li>aggregateRating: se existirem metafields de reviews.</li>
      </ul>

      <h3>10) BlogPosting + HowTo</h3>
      <ul>
        <li>BlogPosting: headline, description, image (width/height), datas, author, publisher → #org, inLanguage, isAccessibleForFree, wordCount, articleSection.</li>
        <li>HowTo (opcional): ≥2 H2 → HowToStep (name/text ~700 chars).</li>
      </ul>

      <h3>11) ContactPage / AboutPage</h3>
      <ul>
        <li>Tipos compostos ["WebPage","ContactPage"] ou ["WebPage","AboutPage"], @id/url canónicos, name, description (~300), inLanguage, isPartOf → #website, about → #org.</li>
      </ul>

      <h3>12) Supressor JSON-LD</h3>
      <ul>
        <li>Estrategia: clean() imediata, DOMContentLoaded, tentativas temporizadas e MutationObserver que remove scripts sem <code>data-sae</code> quando @type bate na lista; preserva os nossos.</li>
      </ul>

      <h3>13) Performance e limites</h3>
      <ul>
        <li>Script único para CollectionPage + ItemList; 12 produtos por lista; 8 imagens por PDP.</li>
        <li>priceValidUntil anual; preços com <code>divided_by:100.00</code>; URIs absolutas HTTPS.</li>
      </ul>

      <h3>14) Validação e troubleshooting</h3>
      <ul>
        <li>Não usar <code>inLanguage</code> no ItemList.</li>
        <li>Verificação rápida na consola:
          <pre><code>Array.from(document.querySelectorAll('script[type="application/ld+json"]')).some(s =&gt; s.textContent.includes('"@type":"ItemList"'))</code></pre>
        </li>
        <li>Se o tema emitir JSON-LD, ativar o supressor.</li>
      </ul>

      <h3>15) Diferenciadores</h3>
      <ul>
        <li>Embedded real, supressor robusto, marcação consolidada, auto-referência Coleção↔Produto, GTIN/MPN, política de envio/devolução, HowTo automático, I18N inteligente.</li>
      </ul>
    `,
    copy: "Copiar snippet",
    copied: "Copiado!",
  },
};

export default function OverviewPage() {
  const { lang } = useOutletContext() || { lang: "es" };
  const L = TEXT[lang] || TEXT.es;

  // Tabs: quick / advanced (sin genéricos TS)
  const [tab, setTab] = React.useState("quick");
  const [copied, setCopied] = React.useState(false);

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(ITEMLIST_SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = ITEMLIST_SNIPPET;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch {}
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
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
        {tabBtn("quick", L.tabs.quick)}
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
        dangerouslySetInnerHTML={{ __html: tab === "quick" ? L.quickHtml : L.advancedHtml }}
      />
    </div>
  );
}

