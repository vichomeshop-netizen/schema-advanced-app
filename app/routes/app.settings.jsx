// app/routes/app.settings.jsx
import { useOutletContext } from "@remix-run/react";

const TEXT = {
  es: {
    title: "Ajustes de la app",
    intro:
      "Referencia de todas las opciones de Schema Advanced. Estos ajustes se configuran desde el App embed en el editor de temas.",
    groups: [
      {
        h3: "General",
        html: `
          <ul>
            <li><strong>language_mode</strong> (auto/es/en/pt): Forzar idioma de salida del JSON-LD o autodetectar.</li>
            <li><strong>website_on_home_only</strong> (checkbox): Emite <code>WebSite</code> solo en la página de inicio.</li>
          </ul>
        `,
      },
      {
        h3: "Organización",
        html: `
          <ul>
            <li><strong>org_logo</strong> (imagen): Logo para <code>Organization</code> y <code>ImageObject</code>.</li>
            <li><strong>org_phone</strong> (texto): Teléfono para <code>contactPoint</code>.</li>
            <li><strong>org_email</strong> (texto): Email público (<code>email</code> y <code>contactPoint.email</code>).</li>
            <li><strong>org_sameas</strong> (textarea): URLs de redes/perfiles (se normalizan y deduplican).</li>
          </ul>
        `,
      },
      {
        h3: "Dirección",
        html: `
          <ul>
            <li><strong>address_street</strong>, <strong>address_city</strong>, <strong>address_postal</strong>, <strong>address_country</strong>: Campos para <code>PostalAddress</code>.</li>
          </ul>
        `,
      },
      {
        h3: "Envíos y devoluciones",
        html: `
          <ul>
            <li><strong>shipping_countries</strong> (texto, ej.: <code>ES,PT</code>): Países de <code>shippingDestination</code>.</li>
            <li><strong>handling_days</strong> (texto rango, ej.: <code>0-1</code>): Tiempo de preparación.</li>
            <li><strong>shipping_days</strong> (texto rango, ej.: <code>2-3</code>): Tiempo de tránsito.</li>
            <li><strong>include_shipping_rate</strong> (checkbox) + <strong>shipping_rate_value</strong>: Añade <code>shippingRate</code> a las ofertas.</li>
            <li><strong>returns_days</strong> (range): Días de devolución para <code>MerchantReturnPolicy</code>.</li>
            <li><strong>free_returns</strong> (checkbox): <code>returnFees</code> = FreeReturn o ReturnShippingFees.</li>
          </ul>
        `,
      },
      {
        h3: "Disponibilidad y precios",
        html: `
          <ul>
            <li><strong>force_availability</strong> (texto opcional): Forzar <code>availability</code> (ej.: <code>InStock</code>). Si se deja vacío, se calcula por variante.</li>
          </ul>
        `,
      },
      {
        h3: "Productos (PDP)",
        html: `
          <ul>
            <li><strong>emit_product_auto</strong> (checkbox): Emite <code>Product</code> automáticamente en PDP.</li>
            <li>Incluye: <code>Brand</code>, <code>MPN</code>/<code>GTIN</code>, imágenes, <code>AggregateOffer</code>/<code>Offer</code>, <code>OfferShippingDetails</code>, <code>MerchantReturnPolicy</code>, y <code>aggregateRating</code> (si hay).</li>
          </ul>
        `,
      },
      {
        h3: "Colecciones y FAQ",
        html: `
          <ul>
            <li><strong>emit_collection_auto</strong> (checkbox): Emite <code>WebPage</code> + <code>CollectionPage</code>.</li>
            <li><strong>faq_handle</strong> (texto, ej.: <code>custom.faq</code>): Metafield/metaobjects para construir <code>FAQPage</code> (requiere ≥2 Q&A).</li>
          </ul>
        `,
      },
      {
        h3: "Blog / Artículos",
        html: `
          <ul>
            <li>Emite <code>BlogPosting</code> con metadatos completos.</li>
            <li><strong>emit_howto_auto</strong> (checkbox): Genera <code>HowTo</code> a partir de H2 (requiere ≥2 pasos).</li>
          </ul>
        `,
      },
      {
        h3: "Breadcrumbs",
        html: `
          <ul>
            <li><strong>emit_breadcrumbs</strong> (checkbox): Inserta <code>BreadcrumbList</code> (Inicio → Colección → Producto).</li>
          </ul>
        `,
      },
      {
        h3: "Supresor JSON-LD del tema",
        html: `
          <ul>
            <li><strong>suppress_theme_jsonld</strong> (checkbox): Elimina JSON-LD del tema que duplique tipos emitidos por la app. Respeta scripts con <code>data-sae="1"</code>.</li>
          </ul>
        `,
      },
      {
        h3: "Ayuda y legal",
        html: `
          <ul>
            <li><a href="/support" target="_blank" rel="noreferrer">Soporte</a></li>
            <li><a href="/terms" target="_blank" rel="noreferrer">Términos</a></li>
            <li><a href="/privacy" target="_blank" rel="noreferrer">Privacidad</a></li>
          </ul>
        `,
      },
    ],
  },

  en: {
    title: "App Settings",
    intro:
      "Reference of all Schema Advanced options. Adjust these in the Theme editor under the App embed.",
    groups: [
      {
        h3: "General",
        html: `
          <ul>
            <li><strong>language_mode</strong> (auto/es/en/pt): Force JSON-LD output language or auto-detect.</li>
            <li><strong>website_on_home_only</strong> (checkbox): Emit <code>WebSite</code> only on the homepage.</li>
          </ul>
        `,
      },
      {
        h3: "Organization",
        html: `
          <ul>
            <li><strong>org_logo</strong> (image): Logo for <code>Organization</code> and <code>ImageObject</code>.</li>
            <li><strong>org_phone</strong> (text): Phone for <code>contactPoint</code>.</li>
            <li><strong>org_email</strong> (text): Public email (<code>email</code> and <code>contactPoint.email</code>).</li>
            <li><strong>org_sameas</strong> (textarea): Social/profile URLs (normalized & deduped).</li>
          </ul>
        `,
      },
      {
        h3: "Address",
        html: `
          <ul>
            <li><strong>address_street</strong>, <strong>address_city</strong>, <strong>address_postal</strong>, <strong>address_country</strong>: Fields for <code>PostalAddress</code>.</li>
          </ul>
        `,
      },
      {
        h3: "Shipping & Returns",
        html: `
          <ul>
            <li><strong>shipping_countries</strong> (text, e.g., <code>ES,PT</code>): Countries for <code>shippingDestination</code>.</li>
            <li><strong>handling_days</strong> (range text, e.g., <code>0-1</code>): Handling time.</li>
            <li><strong>shipping_days</strong> (range text, e.g., <code>2-3</code>): Transit time.</li>
            <li><strong>include_shipping_rate</strong> (checkbox) + <strong>shipping_rate_value</strong>: Adds <code>shippingRate</code> to offers.</li>
            <li><strong>returns_days</strong> (range): Return window days for <code>MerchantReturnPolicy</code>.</li>
            <li><strong>free_returns</strong> (checkbox): <code>returnFees</code> = FreeReturn or ReturnShippingFees.</li>
          </ul>
        `,
      },
      {
        h3: "Availability & Pricing",
        html: `
          <ul>
            <li><strong>force_availability</strong> (optional text): Force <code>availability</code> (e.g., <code>InStock</code>). Empty = computed per variant.</li>
          </ul>
        `,
      },
      {
        h3: "Products (PDP)",
        html: `
          <ul>
            <li><strong>emit_product_auto</strong> (checkbox): Emit <code>Product</code> automatically on PDP.</li>
            <li>Includes <code>Brand</code>, <code>MPN</code>/<code>GTIN</code>, images, <code>AggregateOffer</code>/<code>Offer</code>, <code>OfferShippingDetails</code>, <code>MerchantReturnPolicy</code>, and <code>aggregateRating</code> (when present).</li>
          </ul>
        `,
      },
      {
        h3: "Collections & FAQ",
        html: `
          <ul>
            <li><strong>emit_collection_auto</strong> (checkbox): Emit <code>WebPage</code> + <code>CollectionPage</code>.</li>
            <li><strong>faq_handle</strong> (text, e.g., <code>custom.faq</code>): Metafield/metaobjects used to build <code>FAQPage</code> (needs ≥2 Q&A).</li>
          </ul>
        `,
      },
      {
        h3: "Blog / Articles",
        html: `
          <ul>
            <li>Emits <code>BlogPosting</code> with complete metadata.</li>
            <li><strong>emit_howto_auto</strong> (checkbox): Generates <code>HowTo</code> from H2 (needs ≥2 steps).</li>
          </ul>
        `,
      },
      {
        h3: "Breadcrumbs",
        html: `
          <ul>
            <li><strong>emit_breadcrumbs</strong> (checkbox): Inserts <code>BreadcrumbList</code> (Home → Collection → Product).</li>
          </ul>
        `,
      },
      {
        h3: "Theme JSON-LD Suppressor",
        html: `
          <ul>
            <li><strong>suppress_theme_jsonld</strong> (checkbox): Removes theme JSON-LD overlapping app output. Keeps scripts with <code>data-sae="1"</code>.</li>
          </ul>
        `,
      },
      {
        h3: "Help & Legal",
        html: `
          <ul>
            <li><a href="/support" target="_blank" rel="noreferrer">Support</a></li>
            <li><a href="/terms" target="_blank" rel="noreferrer">Terms</a></li>
            <li><a href="/privacy" target="_blank" rel="noreferrer">Privacy</a></li>
          </ul>
        `,
      },
    ],
  },

  pt: {
    title: "Configurações do app",
    intro:
      "Referência de todas as opções do Schema Advanced. Ajuste-as no editor de temas, no App embed.",
    groups: [
      {
        h3: "Geral",
        html: `
          <ul>
            <li><strong>language_mode</strong> (auto/es/en/pt): Força o idioma do JSON-LD ou autodetecta.</li>
            <li><strong>website_on_home_only</strong> (checkbox): Emite <code>WebSite</code> apenas na página inicial.</li>
          </ul>
        `,
      },
      {
        h3: "Organização",
        html: `
          <ul>
            <li><strong>org_logo</strong> (imagem): Logo para <code>Organization</code> e <code>ImageObject</code>.</li>
            <li><strong>org_phone</strong> (texto): Telefone para <code>contactPoint</code>.</li>
            <li><strong>org_email</strong> (texto): Email público (<code>email</code> e <code>contactPoint.email</code>).</li>
            <li><strong>org_sameas</strong> (textarea): URLs de perfis/redes (normalizadas e deduplicadas).</li>
          </ul>
        `,
      },
      {
        h3: "Endereço",
        html: `
          <ul>
            <li><strong>address_street</strong>, <strong>address_city</strong>, <strong>address_postal</strong>, <strong>address_country</strong>: Campos para <code>PostalAddress</code>.</li>
          </ul>
        `,
      },
      {
        h3: "Envio e devoluções",
        html: `
          <ul>
            <li><strong>shipping_countries</strong> (texto, ex.: <code>ES,PT</code>): Países de <code>shippingDestination</code>.</li>
            <li><strong>handling_days</strong> (faixa texto, ex.: <code>0-1</code>): Tempo de manuseio.</li>
            <li><strong>shipping_days</strong> (faixa texto, ex.: <code>2-3</code>): Tempo de trânsito.</li>
            <li><strong>include_shipping_rate</strong> (checkbox) + <strong>shipping_rate_value</strong>: Adiciona <code>shippingRate</code> às ofertas.</li>
            <li><strong>returns_days</strong> (range): Dias de devolução para <code>MerchantReturnPolicy</code>.</li>
            <li><strong>free_returns</strong> (checkbox): <code>returnFees</code> = FreeReturn ou ReturnShippingFees.</li>
          </ul>
        `,
      },
      {
        h3: "Disponibilidade e preços",
        html: `
          <ul>
            <li><strong>force_availability</strong> (texto opcional): Força <code>availability</code> (ex.: <code>InStock</code>). Vazio = calculado por variante.</li>
          </ul>
        `,
      },
      {
        h3: "Produtos (PDP)",
        html: `
          <ul>
            <li><strong>emit_product_auto</strong> (checkbox): Emite <code>Product</code> automaticamente em PDP.</li>
            <li>Inclui <code>Brand</code>, <code>MPN</code>/<code>GTIN</code>, imagens, <code>AggregateOffer</code>/<code>Offer</code>, <code>OfferShippingDetails</code>, <code>MerchantReturnPolicy</code> e <code>aggregateRating</code> (se houver).</li>
          </ul>
        `,
      },
      {
        h3: "Coleções e FAQ",
        html: `
          <ul>
            <li><strong>emit_collection_auto</strong> (checkbox): Emite <code>WebPage</code> + <code>CollectionPage</code>.</li>
            <li><strong>faq_handle</strong> (texto, ex.: <code>custom.faq</code>): Metafield/metaobjects para montar <code>FAQPage</code> (precisa de ≥2 Q&A).</li>
          </ul>
        `,
      },
      {
        h3: "Blog / Artigos",
        html: `
          <ul>
            <li>Emite <code>BlogPosting</code> com metadados completos.</li>
            <li><strong>emit_howto_auto</strong> (checkbox): Gera <code>HowTo</code> a partir de H2 (precisa de ≥2 passos).</li>
          </ul>
        `,
      },
      {
        h3: "Breadcrumbs",
        html: `
          <ul>
            <li><strong>emit_breadcrumbs</strong> (checkbox): Insere <code>BreadcrumbList</code> (Início → Coleção → Produto).</li>
          </ul>
        `,
      },
      {
        h3: "Supressor de JSON-LD do tema",
        html: `
          <ul>
            <li><strong>suppress_theme_jsonld</strong> (checkbox): Remove JSON-LD do tema que conflita com a saída do app. Mantém scripts com <code>data-sae="1"</code>.</li>
          </ul>
        `,
      },
      {
        h3: "Ajuda & jurídico",
        html: `
          <ul>
            <li><a href="/support" target="_blank" rel="noreferrer">Support</a></li>
            <li><a href="/terms" target="_blank" rel="noreferrer">Terms</a></li>
            <li><a href="/privacy" target="_blank" rel="noreferrer">Privacy</a></li>
          </ul>
        `,
      },
    ],
  },
};

export default function Settings() {
  const { lang } = useOutletContext() || { lang: "es" };
  const t = TEXT[lang] || TEXT.es;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: 1.5 }}>
      <h1 style={{ fontSize: 22, marginBottom: 6 }}>{t.title}</h1>
      <p style={{ marginTop: 0, color: "#374151" }}>{t.intro}</p>

      {t.groups.map((g, i) => (
        <section key={i} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, marginTop: 12 }}>
          <h3 style={{ marginTop: 0 }}>{g.h3}</h3>
          <div dangerouslySetInnerHTML={{ __html: g.html }} />
        </section>
      ))}
    </div>
  );
}

