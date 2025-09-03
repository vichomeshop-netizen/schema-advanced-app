// app/routes/app.collections.jsx
import { useOutletContext } from "@remix-run/react";

const TEXT = {
  es: {
    title: "Colecciones",
    html: `
      <h3>CollectionPage</h3>
      <p>Se emite en páginas de colección cuando <code>emit_collection_auto</code> está activo.</p>
      <ul>
        <li><code>@type</code>: <code>["WebPage","CollectionPage"]</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ collection.url }}#collection</code></li>
        <li><code>url</code>, <code>name</code> (título), <code>description</code> (~300), <code>inLanguage</code></li>
        <li><code>dateModified</code> si existe</li>
        <li><code>isPartOf</code>: <code>@id</code>=<code>{{ shop.url }}#website</code></li>
        <li><code>primaryImageOfPage</code> si hay imagen</li>
      </ul>

      <h3 style="margin-top:18px">ItemList (carrusel de productos)</h3>
      <p>Se añade en el mismo <code>&lt;script type="application/ld+json"&gt;</code> que <strong>CollectionPage</strong>, como segundo objeto dentro de un array JSON. Límite de <strong>12</strong> ítems para no ralentizar.</p>
      <ul>
        <li><code>@type</code>: <code>ItemList</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ collection.url }}#list</code></li>
        <li><code>url</code>, <code>name</code></li>
        <li><code>itemListOrder</code>: <code>https://schema.org/ItemListOrderAscending</code></li>
        <li><code>numberOfItems</code>: recuento de productos de la colección</li>
        <li><code>itemListElement</code>: array de <code>ListItem</code> con:
          <ul>
            <li><code>position</code></li>
            <li><code>item</code> <em>(Product)</em>: <code>name</code>, <code>url</code>, <code>image</code> (si existe), <code>brand</code>, <code>offers</code> (<code>Offer</code> con <code>priceCurrency</code>, <code>price</code>, <code>availability</code>, <code>itemCondition</code>, <code>seller</code>=<code>@id</code> de <code>#org</code>)</li>
          </ul>
        </li>
        <li><strong>Sin</strong> <code>inLanguage</code> en <code>ItemList</code> (evita advertencia del validador).</li>
      </ul>

      <h4 style="margin-top:14px">Beneficios</h4>
      <ul>
        <li>Ayuda a los motores de búsqueda a entender la relación <em>colección → productos</em> y el orden.</li>
        <li>Mejor contexto para rastreo e indexación de PDPs enlazadas desde la colección.</li>
        <li>Estructura ligera (1 solo script, máx. 12 items) ⇒ impacto mínimo en rendimiento.</li>
        <li>Compatible con el supresor (usa <code>data-sae="1"</code>), no se duplica con el tema.</li>
        <li>No garantiza “rich results” por sí solo, pero mejora la comprensión del listado.</li>
      </ul>

      <h4>FAQPage (opcional)</h4>
      <ul>
        <li>Handle de metafield configurable (<code>faq_handle</code>, por ejemplo <code>custom.faq</code>)</li>
        <li>Soporta Metaobjects (<code>question/answer</code>) o HTML parseado</li>
        <li>Requiere ≥2 pares Pregunta/Respuesta</li>
      </ul>

      <h4>BreadcrumbList (relacionado)</h4>
      <ul>
        <li>Si <code>emit_breadcrumbs</code> está activo: Home → Colección → Producto</li>
      </ul>
    `,
  },
  en: {
    title: "Collections",
    html: `
      <h3>CollectionPage</h3>
      <p>Emitted on collection pages when <code>emit_collection_auto</code> is enabled.</p>
      <ul>
        <li><code>@type</code>: <code>["WebPage","CollectionPage"]</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ collection.url }}#collection</code></li>
        <li><code>url</code>, <code>name</code>, <code>description</code> (~300), <code>inLanguage</code></li>
        <li><code>dateModified</code> when available</li>
        <li><code>isPartOf</code>: <code>@id</code>=<code>{{ shop.url }}#website</code></li>
        <li><code>primaryImageOfPage</code> when there is a collection image</li>
      </ul>

      <h3 style="margin-top:18px">ItemList (product carousel)</h3>
      <p>Added in the same <code>&lt;script type="application/ld+json"&gt;</code> as <strong>CollectionPage</strong>, as the second object inside a JSON array. Hard limit of <strong>12</strong> items to stay fast.</p>
      <ul>
        <li><code>@type</code>: <code>ItemList</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ collection.url }}#list</code></li>
        <li><code>url</code>, <code>name</code></li>
        <li><code>itemListOrder</code>: <code>https://schema.org/ItemListOrderAscending</code></li>
        <li><code>numberOfItems</code>: collection products count</li>
        <li><code>itemListElement</code>: array of <code>ListItem</code>:
          <ul>
            <li><code>position</code></li>
            <li><code>item</code> <em>(Product)</em>: <code>name</code>, <code>url</code>, <code>image</code> (if any), <code>brand</code>, <code>offers</code> (<code>Offer</code> with <code>priceCurrency</code>, <code>price</code>, <code>availability</code>, <code>itemCondition</code>, <code>seller</code>=<code>@id</code> of <code>#org</code>)</li>
          </ul>
        </li>
        <li><strong>No</strong> <code>inLanguage</code> on <code>ItemList</code> (avoids validator warning).</li>
      </ul>

      <h4 style="margin-top:14px">Benefits</h4>
      <ul>
        <li>Helps search engines understand the <em>collection → products</em> relationship and order.</li>
        <li>Provides clearer context for crawling/indexing of linked PDPs.</li>
        <li>Lightweight structure (single script, up to 12 items) ⇒ minimal performance impact.</li>
        <li>Works with the JSON-LD suppressor (<code>data-sae="1"</code>), no theme duplication.</li>
        <li>Does not guarantee rich results by itself, but improves list understanding.</li>
      </ul>

      <h4>FAQPage (optional)</h4>
      <ul>
        <li>Configurable metafield handle (<code>faq_handle</code>, e.g., <code>custom.faq</code>)</li>
        <li>Supports Metaobjects (<code>question/answer</code>) or parsed HTML</li>
        <li>Requires ≥2 question/answer pairs</li>
      </ul>

      <h4>BreadcrumbList (related)</h4>
      <ul>
        <li>When <code>emit_breadcrumbs</code> is enabled: Home → Collection → Product</li>
      </ul>
    `,
  },
  pt: {
    title: "Coleções",
    html: `
      <h3>CollectionPage</h3>
      <p>Emitido em páginas de coleção quando <code>emit_collection_auto</code> está ativo.</p>
      <ul>
        <li><code>@type</code>: <code>["WebPage","CollectionPage"]</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ collection.url }}#collection</code></li>
        <li><code>url</code>, <code>name</code>, <code>description</code> (~300), <code>inLanguage</code></li>
        <li><code>dateModified</code> se existir</li>
        <li><code>isPartOf</code>: <code>@id</code>=<code>{{ shop.url }}#website</code></li>
        <li><code>primaryImageOfPage</code> quando há imagem</li>
      </ul>

      <h3 style="margin-top:18px">ItemList (carrossel de produtos)</h3>
      <p>Adicionado no mesmo <code>&lt;script type="application/ld+json"&gt;</code> que <strong>CollectionPage</strong>, como segundo objeto dentro de um array JSON. Limite fixo de <strong>12</strong> itens para não perder desempenho.</p>
      <ul>
        <li><code>@type</code>: <code>ItemList</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ collection.url }}#list</code></li>
        <li><code>url</code>, <code>name</code></li>
        <li><code>itemListOrder</code>: <code>https://schema.org/ItemListOrderAscending</code></li>
        <li><code>numberOfItems</code>: total de produtos da coleção</li>
        <li><code>itemListElement</code>: array de <code>ListItem</code> com:
          <ul>
            <li><code>position</code></li>
            <li><code>item</code> <em>(Product)</em>: <code>name</code>, <code>url</code>, <code>image</code> (se houver), <code>brand</code>, <code>offers</code> (<code>Offer</code> com <code>priceCurrency</code>, <code>price</code>, <code>availability</code>, <code>itemCondition</code>, <code>seller</code>=<code>@id</code> de <code>#org</code>)</li>
          </ul>
        </li>
        <li><strong>Sem</strong> <code>inLanguage</code> em <code>ItemList</code> (evita aviso do validador).</li>
      </ul>

      <h4 style="margin-top:14px">Benefícios</h4>
      <ul>
        <li>Ajuda os mecanismos de busca a entender a relação <em>coleção → produtos</em> e a ordem.</li>
        <li>Melhor contexto para rastreamento e indexação das PDPs ligadas a partir da coleção.</li>
        <li>Estrutura leve (um único script, até 12 itens) ⇒ impacto mínimo de performance.</li>
        <li>Compatível com o supressor (<code>data-sae="1"</code>), sem duplicar com o tema.</li>
        <li>Não garante rich results por si só, mas melhora a compreensão da lista.</li>
      </ul>

      <h4>FAQPage (opcional)</h4>
      <ul>
        <li>Handle de metafield configurável (<code>faq_handle</code>, ex.: <code>custom.faq</code>)</li>
        <li>Suporta Metaobjects (<code>question/answer</code>) ou HTML parseado</li>
        <li>Requer ≥2 pares Pergunta/Resposta</li>
      </ul>

      <h4>BreadcrumbList (relacionado)</h4>
      <ul>
        <li>Se <code>emit_breadcrumbs</code> estiver ativo: Home → Coleção → Produto</li>
      </ul>
    `,
  },
};

export default function CollectionsPage() {
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
