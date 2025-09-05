// app/routes/app.pages.jsx
import { useOutletContext } from "@remix-run/react";

const TEXT = {
  es: {
    title: "Páginas",
    html: `
      <h3>Qué emite la app en páginas de contenido</h3>
      <p>La app detecta automáticamente el tipo de página y emite el marcado correspondiente en un único
      <code>&lt;script type="application/ld+json"&gt;</code> con <code>data-sae="1"</code>.</p>

      <h4>ContactPage</h4>
      <ul>
        <li><strong>Cuándo:</strong> plantilla que contiene <code>contact</code> o rutas comunes:
          <code>/pages/contact</code>, <code>/contact</code>, <code>/pages/contacto</code>, <code>/pages/contato</code>.</li>
        <li><strong>@type</strong>: <code>["WebPage","ContactPage"]</code></li>
        <li><strong>@id</strong>: <code>{{ shop.url }}{{ page.url }}#contact</code>; <strong>url</strong></li>
        <li><strong>name</strong>, <strong>description</strong> (~300), <strong>inLanguage</strong></li>
        <li><strong>isPartOf</strong> → <code>{{ shop.url }}#website</code>; <strong>about</strong> → <code>{{ shop.url }}#org</code></li>
        <li><strong>primaryImageOfPage</strong> si hay imagen destacada en la página</li>
      </ul>

      <h4>AboutPage</h4>
      <ul>
        <li><strong>Cuándo:</strong> plantilla que contiene <code>about</code> o slugs habituales:
          <code>/pages/about</code>, <code>/pages/acerca</code>, <code>/pages/sobre-nosotros</code>, <code>/pages/sobre</code>.</li>
        <li>Estructura análoga con ancla <code>#about</code>:
          <strong>@type</strong> <code>["WebPage","AboutPage"]</code>,
          <strong>@id</strong> <code>{{ shop.url }}{{ page.url }}#about</code>,
          <strong>url</strong>, <strong>name</strong>, <strong>description</strong>, <strong>inLanguage</strong>,
          <strong>isPartOf</strong> (<code>#website</code>) y <strong>about</strong> (<code>#org</code>).</li>
        <li><strong>primaryImageOfPage</strong> si procede</li>
      </ul>

      <h4>WebPage (genérico)</h4>
      <ul>
        <li><strong>Cuándo:</strong> cualquier otra página que no encaje en Contact/About/FAQ/HowTo.</li>
        <li><strong>@type</strong>: <code>["WebPage"]</code>; <strong>@id</strong>: <code>{{ shop.url }}{{ page.url }}#page</code></li>
        <li><strong>url</strong>, <strong>name</strong>, <strong>description</strong> (resumen limpio), <strong>inLanguage</strong></li>
        <li><strong>isPartOf</strong> → <code>#website</code>; <strong>about</strong> → <code>#org</code></li>
      </ul>

      <h4>FAQPage (opcional en páginas)</h4>
      <ul>
        <li>Handle de metafield configurable (p.ej., <code>custom.faq</code>) o Metaobject de preguntas/respuestas.</li>
        <li>Requiere <strong>≥ 2</strong> pares <em>Question/Answer</em>.</li>
        <li>Se emite junto al WebPage/ContactPage/AboutPage dentro del mismo array JSON.</li>
      </ul>

      <h4>HowTo (opcional, auto desde el contenido)</h4>
      <ul>
        <li>Se genera cuando el contenido de la página tiene pasos claros (p. ej., subtítulos H2 como “Paso 1”, “Paso 2”…).</li>
        <li><strong>@type</strong> <code>HowTo</code> con <code>name</code>, <code>step</code> (múltiples), imágenes si existen y opcionalmente <code>tool</code>/<code>supply</code> (desde listas/metafields).</li>
        <li>Requiere al menos <strong>2</strong> pasos; si no, se omite para evitar ruido.</li>
      </ul>

      <h4>Breadcrumbs (relacionado)</h4>
      <ul>
        <li>Si los habilitas globalmente, emitimos <code>BreadcrumbList</code> (p. ej., Home → Página).</li>
      </ul>

      <h4>Notas</h4>
      <ul>
        <li>Todos los objetos referencian a <code>#website</code> y <code>#org</code> definidos en “Global”.</li>
        <li>Salida compacta: un solo <code>&lt;script&gt;</code> por página; compatible con el supresor del tema.</li>
        <li>Valida siempre con la Prueba de resultados enriquecidos o el validador de Schema.org.</li>
      </ul>
    `,
  },
  en: {
    title: "Pages",
    html: `
      <h3>What the app emits on content pages</h3>
      <p>The app auto-detects the page type and emits the appropriate markup in a single
      <code>&lt;script type="application/ld+json"&gt;</code> with <code>data-sae="1"</code>.</p>

      <h4>ContactPage</h4>
      <ul>
        <li><strong>When:</strong> template includes <code>contact</code> or common paths:
          <code>/pages/contact</code>, <code>/contact</code>, <code>/pages/contacto</code>, <code>/pages/contato</code>.</li>
        <li><strong>@type</strong>: <code>["WebPage","ContactPage"]</code></li>
        <li><strong>@id</strong>: <code>{{ shop.url }}{{ page.url }}#contact</code>; <strong>url</strong></li>
        <li><strong>name</strong>, <strong>description</strong> (~300), <strong>inLanguage</strong></li>
        <li><strong>isPartOf</strong> → <code>{{ shop.url }}#website</code>; <strong>about</strong> → <code>{{ shop.url }}#org</code></li>
        <li><strong>primaryImageOfPage</strong> when a featured image exists</li>
      </ul>

      <h4>AboutPage</h4>
      <ul>
        <li><strong>When:</strong> template includes <code>about</code> or common slugs:
          <code>/pages/about</code>, <code>/pages/acerca</code>, <code>/pages/sobre-nosotros</code>, <code>/pages/sobre</code>.</li>
        <li>Same structure with <code>#about</code> anchor:
          <strong>@type</strong> <code>["WebPage","AboutPage"]</code>,
          <strong>@id</strong> <code>{{ shop.url }}{{ page.url }}#about</code>,
          <strong>url</strong>, <strong>name</strong>, <strong>description</strong>, <strong>inLanguage</strong>,
          <strong>isPartOf</strong> (<code>#website</code>) and <strong>about</strong> (<code>#org</code>).</li>
        <li><strong>primaryImageOfPage</strong> when relevant</li>
      </ul>

      <h4>WebPage (generic)</h4>
      <ul>
        <li><strong>When:</strong> any other page that isn't Contact/About/FAQ/HowTo.</li>
        <li><strong>@type</strong>: <code>["WebPage"]</code>; <strong>@id</strong>: <code>{{ shop.url }}{{ page.url }}#page</code></li>
        <li><strong>url</strong>, <strong>name</strong>, <strong>description</strong> (clean summary), <strong>inLanguage</strong></li>
        <li><strong>isPartOf</strong> → <code>#website</code>; <strong>about</strong> → <code>#org</code></li>
      </ul>

      <h4>FAQPage (optional on pages)</h4>
      <ul>
        <li>Configurable metafield handle (e.g., <code>custom.faq</code>) or QA Metaobject.</li>
        <li>Requires <strong>≥ 2</strong> Question/Answer pairs.</li>
        <li>Emitted alongside WebPage/ContactPage/AboutPage within the same JSON array.</li>
      </ul>

      <h4>HowTo (optional, auto from content)</h4>
      <ul>
        <li>Generated when page content contains clear steps (e.g., H2 headings like “Step 1”, “Step 2”…).</li>
        <li><strong>@type</strong> <code>HowTo</code> with <code>name</code>, <code>step</code> (multiple), images when available, and optional <code>tool</code>/<code>supply</code> (from lists/metafields).</li>
        <li>Requires at least <strong>2</strong> steps; omitted otherwise.</li>
      </ul>

      <h4>Breadcrumbs (related)</h4>
      <ul>
        <li>When enabled globally, we emit <code>BreadcrumbList</code> (e.g., Home → Page).</li>
      </ul>

      <h4>Notes</h4>
      <ul>
        <li>All objects reference <code>#website</code> and <code>#org</code> defined in “Global”.</li>
        <li>Compact output: a single <code>&lt;script&gt;</code> per page; compatible with the theme suppressor.</li>
        <li>Always validate with Google Rich Results Test or Schema.org Validator.</li>
      </ul>
    `,
  },
  pt: {
    title: "Páginas",
    html: `
      <h3>O que o app emite nas páginas de conteúdo</h3>
      <p>O app detecta automaticamente o tipo de página e emite o markup adequado em um único
      <code>&lt;script type="application/ld+json"&gt;</code> com <code>data-sae="1"</code>.</p>

      <h4>ContactPage</h4>
      <ul>
        <li><strong>Quando:</strong> template com <code>contact</code> ou paths comuns:
          <code>/pages/contact</code>, <code>/contact</code>, <code>/pages/contacto</code>, <code>/pages/contato</code>.</li>
        <li><strong>@type</strong>: <code>["WebPage","ContactPage"]</code></li>
        <li><strong>@id</strong>: <code>{{ shop.url }}{{ page.url }}#contact</code>; <strong>url</strong></li>
        <li><strong>name</strong>, <strong>description</strong> (~300), <strong>inLanguage</strong></li>
        <li><strong>isPartOf</strong> → <code>{{ shop.url }}#website</code>; <strong>about</strong> → <code>{{ shop.url }}#org</code></li>
        <li><strong>primaryImageOfPage</strong> quando houver imagem destacada</li>
      </ul>

      <h4>AboutPage</h4>
      <ul>
        <li><strong>Quando:</strong> template com <code>about</code> ou slugs comuns:
          <code>/pages/about</code>, <code>/pages/acerca</code>, <code>/pages/sobre-nosotros</code>, <code>/pages/sobre</code>.</li>
        <li>Mesma estrutura com âncora <code>#about</code>:
          <strong>@type</strong> <code>["WebPage","AboutPage"]</code>,
          <strong>@id</strong> <code>{{ shop.url }}{{ page.url }}#about</code>,
          <strong>url</strong>, <strong>name</strong>, <strong>description</strong>, <strong>inLanguage</strong>,
          <strong>isPartOf</strong> (<code>#website</code>) e <strong>about</strong> (<code>#org</code>).</li>
        <li><strong>primaryImageOfPage</strong> quando aplicável</li>
      </ul>

      <h4>WebPage (genérico)</h4>
      <ul>
        <li><strong>Quando:</strong> qualquer outra página que não seja Contact/About/FAQ/HowTo.</li>
        <li><strong>@type</strong>: <code>["WebPage"]</code>; <strong>@id</strong>: <code>{{ shop.url }}{{ page.url }}#page</code></li>
        <li><strong>url</strong>, <strong>name</strong>, <strong>description</strong> (resumo limpo), <strong>inLanguage</strong></li>
        <li><strong>isPartOf</strong> → <code>#website</code>; <strong>about</strong> → <code>#org</code></li>
      </ul>

      <h4>FAQPage (opcional nas páginas)</h4>
      <ul>
        <li>Handle de metafield configurável (ex.: <code>custom.faq</code>) ou Metaobject de perguntas/respostas.</li>
        <li>Requer <strong>≥ 2</strong> pares de Pergunta/Resposta.</li>
        <li>É emitido junto ao WebPage/ContactPage/AboutPage dentro do mesmo array JSON.</li>
      </ul>

      <h4>HowTo (opcional, auto a partir do conteúdo)</h4>
      <ul>
        <li>Gerado quando o conteúdo tem passos claros (ex.: H2 “Passo 1”, “Passo 2”…).</li>
        <li><strong>@type</strong> <code>HowTo</code> com <code>name</code>, múltiplos <code>step</code>, imagens quando houver e opcional <code>tool</code>/<code>supply</code> (listas/metafields).</li>
        <li>Precisa de pelo menos <strong>2</strong> passos; caso contrário é omitido.</li>
      </ul>

      <h4>Breadcrumbs (relacionado)</h4>
      <ul>
        <li>Se habilitado globalmente, emitimos <code>BreadcrumbList</code> (ex.: Home → Página).</li>
      </ul>

      <h4>Notas</h4>
      <ul>
        <li>Todos os objetos referenciam <code>#website</code> e <code>#org</code> definidos em “Global”.</li>
        <li>Saída compacta: um único <code>&lt;script&gt;</code> por página; compatível com o supressor do tema.</li>
        <li>Sempre valide com o Rich Results Test ou o validador do Schema.org.</li>
      </ul>
    `,
  },
};

export default function PagesPage() {
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
