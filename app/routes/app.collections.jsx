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
      <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}
        dangerouslySetInnerHTML={{ __html: t.html }} />
    </div>
  );
}
