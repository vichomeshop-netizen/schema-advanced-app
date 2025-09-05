// app/routes/app.collections.jsx
import { useOutletContext } from "@remix-run/react";

const TEXT = {
  es: {
    title: "Colecciones",
    html: `
      <h3>Qué emite la app en páginas de colección</h3>
      <p>La app añade un <strong>único</strong> <code>&lt;script type="application/ld+json"&gt;</code> con <strong>dos objetos</strong> dentro de un array JSON:</p>
      <ol>
        <li><strong>CollectionPage</strong>: describe la página de la colección.</li>
        <li><strong>ItemList</strong>: lista compacta de productos (hasta <strong>12</strong> elementos) con datos clave.</li>
      </ol>

      <h4 style="margin-top:14px">CollectionPage (detalle)</h4>
      <ul>
        <li><code>@type</code>: <code>["WebPage","CollectionPage"]</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ collection.url }}#collection</code> (estable y canónico)</li>
        <li><code>url</code>, <code>name</code> (título de la colección)</li>
        <li><code>description</code>: texto limpio (sin HTML) ~300 caracteres si hay contenido</li>
        <li><code>inLanguage</code>: auto (ES/PT; si no detecta, EN)</li>
        <li><code>dateModified</code>: última actualización si está disponible</li>
        <li><code>isPartOf</code>: referencia a <code>@id = {{ shop.url }}#website</code></li>
        <li><code>primaryImageOfPage</code>: si la colección tiene imagen destacada</li>
        <li>Compatible con el <em>supresor</em> de JSON-LD del tema (<code>data-sae="1"</code>) para evitar duplicados</li>
      </ul>

      <h4 style="margin-top:14px">ItemList (lista de productos)</h4>
      <ul>
        <li><code>@type</code>: <code>ItemList</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ collection.url }}#list</code></li>
        <li><code>url</code>, <code>name</code> (igual que la colección)</li>
        <li><code>itemListOrder</code>: <code>https://schema.org/ItemListOrderAscending</code> (respeta el orden mostrado)</li>
        <li><code>numberOfItems</code>: total de productos de la colección</li>
        <li><code>itemListElement</code>: hasta <strong>12</strong> elementos de tipo <code>ListItem</code> con:
          <ul>
            <li><code>position</code> (1..N)</li>
            <li><code>item</code> <em>(Product compacto)</em>:
              <ul>
                <li><code>name</code>, <code>url</code>, <code>image</code> (si existe)</li>
                <li><code>brand</code> (vendor)</li>
                <li><code>offers</code> (<code>Offer</code>): <code>priceCurrency</code>, <code>price</code> (precio actual), <code>availability</code>, <code>itemCondition</code>, <code>seller</code>=<code>@id</code> de <code>#org</code></li>
              </ul>
            </li>
          </ul>
        </li>
        <li><strong>No</strong> añadimos <code>inLanguage</code> en <code>ItemList</code> para evitar avisos del validador</li>
      </ul>

      <h4 style="margin-top:14px">FAQPage en colección (opcional)</h4>
      <ul>
        <li>Conecta un metafield manejable (p.ej. <code>custom.faq</code>)</li>
        <li>Soporta Metaobjects (<code>question</code>/<code>answer</code>) o HTML parseado</li>
        <li>Se publica si hay <strong>≥ 2</strong> pares pregunta/respuesta</li>
      </ul>

      <h4 style="margin-top:14px">Breadcrumbs (relacionado)</h4>
      <ul>
        <li>Si los habilitas globalmente, emitimos <code>BreadcrumbList</code>: Home → Colección → Producto</li>
      </ul>

      <h4 style="margin-top:14px">Notas y buenas prácticas</h4>
      <ul>
        <li>El límite de 12 productos equilibra cobertura y rendimiento de la página</li>
        <li>Todo se emite en un solo <code>&lt;script&gt;</code> para reducir nodos y peso</li>
        <li>Puedes desactivar esta salida desde Ajustes si no la necesitas</li>
        <li>Valida con la Prueba de resultados enriquecidos o el validador de Schema.org</li>
      </ul>
    `,
  },
  en: {
    title: "Collections",
    html: `
      <h3>What the app emits on collection pages</h3>
      <p>The app adds a <strong>single</strong> <code>&lt;script type="application/ld+json"&gt;</code> containing a JSON array with <strong>two objects</strong>:</p>
      <ol>
        <li><strong>CollectionPage</strong>: describes the collection page.</li>
        <li><strong>ItemList</strong>: a compact product list (up to <strong>12</strong> items) with key data.</li>
      </ol>

      <h4 style="margin-top:14px">CollectionPage (details)</h4>
      <ul>
        <li><code>@type</code>: <code>["WebPage","CollectionPage"]</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ collection.url }}#collection</code> (stable/canonical)</li>
        <li><code>url</code>, <code>name</code> (collection title)</li>
        <li><code>description</code>: clean text (no HTML), ~300 chars when available</li>
        <li><code>inLanguage</code>: auto (ES/PT; falls back to EN)</li>
        <li><code>dateModified</code>: last update when available</li>
        <li><code>isPartOf</code>: references <code>@id = {{ shop.url }}#website</code></li>
        <li><code>primaryImageOfPage</code>: when the collection has a featured image</li>
        <li>Works with the theme JSON-LD suppressor (<code>data-sae="1"</code>) to avoid duplicates</li>
      </ul>

      <h4 style="margin-top:14px">ItemList (product list)</h4>
      <ul>
        <li><code>@type</code>: <code>ItemList</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ collection.url }}#list</code></li>
        <li><code>url</code>, <code>name</code> (same as collection)</li>
        <li><code>itemListOrder</code>: <code>https://schema.org/ItemListOrderAscending</code> (matches UI order)</li>
        <li><code>numberOfItems</code>: total products in collection</li>
        <li><code>itemListElement</code>: up to <strong>12</strong> <code>ListItem</code> entries:
          <ul>
            <li><code>position</code> (1..N)</li>
            <li><code>item</code> <em>(compact Product)</em>:
              <ul>
                <li><code>name</code>, <code>url</code>, <code>image</code> (if any)</li>
                <li><code>brand</code> (vendor)</li>
                <li><code>offers</code> (<code>Offer</code>): <code>priceCurrency</code>, <code>price</code> (current), <code>availability</code>, <code>itemCondition</code>, <code>seller</code>=<code>@id</code> of <code>#org</code></li>
              </ul>
            </li>
          </ul>
        </li>
        <li><strong>No</strong> <code>inLanguage</code> on <code>ItemList</code> to avoid validator warnings</li>
      </ul>

      <h4 style="margin-top:14px">FAQPage on collections (optional)</h4>
      <ul>
        <li>Bind a metafield handle (e.g., <code>custom.faq</code>)</li>
        <li>Supports Metaobjects (<code>question</code>/<code>answer</code>) or parsed HTML</li>
        <li>Emitted when there are <strong>≥ 2</strong> Q/A pairs</li>
      </ul>

      <h4 style="margin-top:14px">Breadcrumbs (related)</h4>
      <ul>
        <li>When enabled globally, we emit <code>BreadcrumbList</code>: Home → Collection → Product</li>
      </ul>

      <h4 style="margin-top:14px">Notes & best practices</h4>
      <ul>
        <li>The 12-item cap balances coverage and performance</li>
        <li>All output lives in a single <code>&lt;script&gt;</code> to keep payload small</li>
        <li>You can disable this output in Settings if you don’t need it</li>
        <li>Validate with Google Rich Results Test or Schema.org Validator</li>
      </ul>
    `,
  },
  pt: {
    title: "Coleções",
    html: `
      <h3>O que o app emite nas páginas de coleção</h3>
      <p>O app adiciona um <strong>único</strong> <code>&lt;script type="application/ld+json"&gt;</code> contendo um array JSON com <strong>dois objetos</strong>:</p>
      <ol>
        <li><strong>CollectionPage</strong>: descreve a página da coleção.</li>
        <li><strong>ItemList</strong>: lista compacta de produtos (até <strong>12</strong> itens) com dados essenciais.</li>
      </ol>

      <h4 style="margin-top:14px">CollectionPage (detalhes)</h4>
      <ul>
        <li><code>@type</code>: <code>["WebPage","CollectionPage"]</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ collection.url }}#collection</code> (estável/canônico)</li>
        <li><code>url</code>, <code>name</code> (título da coleção)</li>
        <li><code>description</code>: texto limpo (sem HTML) ~300 caracteres quando houver</li>
        <li><code>inLanguage</code>: automático (PT/ES; fallback EN)</li>
        <li><code>dateModified</code>: última atualização quando disponível</li>
        <li><code>isPartOf</code>: referência a <code>@id = {{ shop.url }}#website</code></li>
        <li><code>primaryImageOfPage</code>: quando a coleção tem imagem destacada</li>
        <li>Compatível com o supressor de JSON-LD do tema (<code>data-sae="1"</code>) para evitar duplicação</li>
      </ul>

      <h4 style="margin-top:14px">ItemList (lista de produtos)</h4>
      <ul>
        <li><code>@type</code>: <code>ItemList</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ collection.url }}#list</code></li>
        <li><code>url</code>, <code>name</code></li>
        <li><code>itemListOrder</code>: <code>https://schema.org/ItemListOrderAscending</code> (segue a ordem da UI)</li>
        <li><code>numberOfItems</code>: total de produtos da coleção</li>
        <li><code>itemListElement</code>: até <strong>12</strong> entradas <code>ListItem</code>:
          <ul>
            <li><code>position</code> (1..N)</li>
            <li><code>item</code> <em>(Product compacto)</em>:
              <ul>
                <li><code>name</code>, <code>url</code>, <code>image</code> (se houver)</li>
                <li><code>brand</code> (vendor)</li>
                <li><code>offers</code> (<code>Offer</code>): <code>priceCurrency</code>, <code>price</code> (atual), <code>availability</code>, <code>itemCondition</code>, <code>seller</code>=<code>@id</code> de <code>#org</code></li>
              </ul>
            </li>
          </ul>
        </li>
        <li><strong>Sem</strong> <code>inLanguage</code> em <code>ItemList</code> para evitar avisos do validador</li>
      </ul>

      <h4 style="margin-top:14px">FAQPage (opcional) na coleção</h4>
      <ul>
        <li>Vincule um metafield (ex.: <code>custom.faq</code>)</li>
        <li>Suporta Metaobjects (<code>question</code>/<code>answer</code>) ou HTML parseado</li>
        <li>Emite quando houver <strong>≥ 2</strong> pares de perguntas/respostas</li>
      </ul>

      <h4 style="margin-top:14px">Breadcrumbs (relacionado)</h4>
      <ul>
        <li>Se habilitado globalmente, emitimos <code>BreadcrumbList</code>: Home → Coleção → Produto</li>
      </ul>

      <h4 style="margin-top:14px">Notas e boas práticas</h4>
      <ul>
        <li>O limite de 12 itens equilibra cobertura e performance</li>
        <li>Toda a saída fica em um único <code>&lt;script&gt;</code> para reduzir peso</li>
        <li>Você pode desativar essa saída em Configurações, se não precisar</li>
        <li>Valide com o Rich Results Test ou o validador do Schema.org</li>
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

