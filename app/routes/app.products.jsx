// app/routes/app.products.jsx
import { useOutletContext } from "@remix-run/react";

const TEXT = {
  es: {
    title: "Productos",
    html: `
      <h3>Product (PDP)</h3>
      <p>Se emite en páginas de producto cuando <code>emit_product_auto</code> está activo.</p>

      <h4>Identidad y vínculos</h4>
      <ul>
        <li><code>@type</code>: <code>Product</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ product.url }}#product</code></li>
        <li><code>mainEntityOfPage</code> = <code>WebPage</code>, <code>url</code> absoluta</li>
      </ul>

      <h4>Datos básicos</h4>
      <ul>
        <li><code>name</code> (título) y <code>description</code> (limpia y truncada)</li>
        <li><code>category</code>: primera colección o <code>product.type</code></li>
        <li><code>brand</code>: <code>Brand</code> con <code>name</code>=<code>product.vendor</code> o nombre de la tienda</li>
      </ul>

      <h4>Identificadores</h4>
      <ul>
        <li><code>mpn</code> de <code>metafields.custom.mpn</code> o <code>variant.sku</code></li>
        <li><code>gtin8</code>/<code>gtin12</code>/<code>gtin13</code>/<code>gtin14</code> según longitud de <code>barcode</code></li>
      </ul>

      <h4>Imágenes</h4>
      <ul><li>Hasta 8 imágenes a 1200px (URLs https)</li></ul>

      <h4>Propiedades adicionales</h4>
      <ul>
        <li>Desde metafields <code>custom.*</code>: <em>color</em>, <em>material</em>, <em>pattern</em>, <em>dimensions_text</em>, <em>weight_value+weight_unit</em></li>
      </ul>

      <h4>Ofertas y precio</h4>
      <ul>
        <li>Moneda: <code>cart.currency.iso_code</code></li>
        <li><code>priceValidUntil</code>: ~+1 año</li>
        <li>Multi-variantes → <code>AggregateOffer</code> con <code>lowPrice</code>, <code>highPrice</code>, <code>offerCount</code> y array de <code>Offer</code> por variante (<code>?variant=ID</code>)</li>
        <li>Una variante → <code>Offer</code> plano</li>
        <li><code>availability</code>: forzada por <code>force_availability</code> o calculada <code>InStock/OutOfStock</code></li>
        <li><code>itemCondition</code>: <code>NewCondition</code></li>
        <li><code>seller</code>: <code>@id</code> de <code>Organization</code></li>
      </ul>

      <h4>Envío (<code>OfferShippingDetails</code>)</h4>
      <ul>
        <li><code>shippingDestination</code>: países de <code>shipping_countries</code> (p. ej. ES, PT)</li>
        <li><code>deliveryTime</code>: <code>handlingTime</code> (rango) y <code>transitTime</code> (rango)</li>
        <li><code>shippingRate</code> opcional con <code>include_shipping_rate</code> + <code>shipping_rate_value</code></li>
      </ul>

      <h4>Devoluciones (<code>MerchantReturnPolicy</code>)</h4>
      <ul>
        <li>Ventana finita; <code>merchantReturnDays</code> (por defecto 30)</li>
        <li><code>refundType</code>=FullRefund; <code>returnMethod</code>=ReturnByMail</li>
        <li><code>returnFees</code>=FreeReturn o ReturnShippingFees</li>
      </ul>

      <h4>Valoraciones</h4>
      <ul>
        <li><code>aggregateRating</code> si existen reseñas: <code>ratingValue</code>, <code>reviewCount</code>, <code>bestRating</code>=5, <code>worstRating</code>=1</li>
      </ul>
    `,
  },
  en: {
    title: "Products",
    html: `
      <h3>Product (PDP)</h3>
      <p>Emitted on product pages when <code>emit_product_auto</code> is enabled.</p>

      <h4>Identity & Links</h4>
      <ul>
        <li><code>@type</code>: <code>Product</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ product.url }}#product</code></li>
        <li><code>mainEntityOfPage</code> = <code>WebPage</code>, absolute <code>url</code></li>
      </ul>

      <h4>Basics</h4>
      <ul>
        <li><code>name</code> (title) and <code>description</code> (sanitized & truncated)</li>
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

      <h4>Additional properties</h4>
      <ul>
        <li>From <code>custom.*</code> metafields: <em>color</em>, <em>material</em>, <em>pattern</em>, <em>dimensions_text</em>, <em>weight_value+weight_unit</em></li>
      </ul>

      <h4>Offers & Pricing</h4>
      <ul>
        <li>Currency: <code>cart.currency.iso_code</code></li>
        <li><code>priceValidUntil</code>: ~+1 year</li>
        <li>Multi-variant → <code>AggregateOffer</code> (<code>lowPrice</code>, <code>highPrice</code>, <code>offerCount</code>, per-variant <code>Offer</code> using <code>?variant=ID</code>)</li>
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
        <li>Finite window; <code>merchantReturnDays</code> (default 30)</li>
        <li><code>refundType</code>=FullRefund; <code>returnMethod</code>=ReturnByMail</li>
        <li><code>returnFees</code>=FreeReturn or ReturnShippingFees</li>
      </ul>

      <h4>Ratings</h4>
      <ul>
        <li><code>aggregateRating</code> when available: <code>ratingValue</code>, <code>reviewCount</code>, <code>bestRating</code>=5, <code>worstRating</code>=1</li>
      </ul>
    `,
  },
  pt: {
    title: "Produtos",
    html: `
      <h3>Product (PDP)</h3>
      <p>Emitido em páginas de produto quando <code>emit_product_auto</code> está ativo.</p>

      <h4>Identidade e ligações</h4>
      <ul>
        <li><code>@type</code>: <code>Product</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ product.url }}#product</code></li>
        <li><code>mainEntityOfPage</code> = <code>WebPage</code>, <code>url</code> absoluta</li>
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
      <ul><li>Até 8 imagens a 1200px (https)</li></ul>

      <h4>Propriedades adicionais</h4>
      <ul>
        <li>De metafields <code>custom.*</code>: <em>color</em>, <em>material</em>, <em>pattern</em>, <em>dimensions_text</em>, <em>weight_value+weight_unit</em></li>
      </ul>

      <h4>Ofertas & Preços</h4>
      <ul>
        <li>Moeda: <code>cart.currency.iso_code</code></li>
        <li><code>priceValidUntil</code>: ~+1 ano</li>
        <li>Multi-variantes → <code>AggregateOffer</code> (<code>lowPrice</code>, <code>highPrice</code>, <code>offerCount</code>, lista de <code>Offer</code> por variante com <code>?variant=ID</code>)</li>
        <li>Uma variante → <code>Offer</code> simples</li>
        <li><code>availability</code>: forçada por <code>force_availability</code> ou calculada <code>InStock/OutOfStock</code></li>
        <li><code>itemCondition</code>: <code>NewCondition</code>; <code>seller</code>: <code>@id</code> da Organization</li>
      </ul>

      <h4>Envio (<code>OfferShippingDetails</code>)</h4>
      <ul>
        <li><code>shippingDestination</code>: países de <code>shipping_countries</code> (ex.: ES, PT)</li>
        <li><code>deliveryTime</code>: <code>handlingTime</code> (faixa) e <code>transitTime</code> (faixa)</li>
        <li><code>shippingRate</code> opcional com <code>include_shipping_rate</code> + <code>shipping_rate_value</code></li>
      </ul>

      <h4>Devoluções (<code>MerchantReturnPolicy</code>)</h4>
      <ul>
        <li>Janela finita; <code>merchantReturnDays</code> (padrão 30)</li>
        <li><code>refundType</code>=FullRefund; <code>returnMethod</code>=ReturnByMail</li>
        <li><code>returnFees</code>=FreeReturn ou ReturnShippingFees</li>
      </ul>

      <h4>Avaliações</h4>
      <ul>
        <li><code>aggregateRating</code> quando disponível: <code>ratingValue</code>, <code>reviewCount</code>, <code>bestRating</code>=5, <code>worstRating</code>=1</li>
      </ul>
    `,
  },
};

export default function ProductsPage() {
  const { lang } = useOutletContext() || { lang: "es" };
  const t = TEXT[lang] || TEXT.es;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: 1.5 }}>
      <h1 style={{ fontSize: 22, marginBottom: 6 }}>{t.title}</h1>
      <section
        style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}
        dangerouslySetInnerHTML={{ __html: t.html }}
      />
    </div>
  );
}
