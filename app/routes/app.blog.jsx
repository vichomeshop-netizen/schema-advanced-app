// app/routes/app.blog.jsx
import { useOutletContext } from "@remix-run/react";

const TEXT = {
  es: {
    title: "Blog / Artículos",
    html: `
      <h3>BlogPosting</h3>
      <ul>
        <li><code>@type</code>: <code>BlogPosting</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ article.url }}#article</code></li>
        <li><code>mainEntityOfPage</code>: <code>WebPage</code></li>
        <li><code>headline</code> (≤110), <code>description</code> (≤300)</li>
        <li><code>image</code> (<code>ImageObject</code> con <em>url/width/height</em>)</li>
        <li><code>datePublished</code>, <code>dateModified</code></li>
        <li><code>author</code> (Person), <code>publisher</code> (Organization)</li>
        <li><code>inLanguage</code>, <code>isAccessibleForFree</code>=true, <code>wordCount</code>, <code>articleSection</code></li>
      </ul>

      <h4>HowTo (opcional)</h4>
      <ul>
        <li>Activado con <code>emit_howto_auto</code></li>
        <li>Generado desde encabezados H2 (H3 normalizado a H2)</li>
        <li>Requiere ≥2 pasos</li>
        <li><code>@type</code>: <code>HowTo</code>; <code>@id</code>: <code>{{ shop.url }}{{ article.url }}#howto</code></li>
        <li>Incluye <code>name</code>, <code>description</code>, <code>image</code> (si existe), fechas, <code>author</code>, <code>publisher</code>, <code>step[]</code></li>
      </ul>
    `,
  },
  en: {
    title: "Blog / Articles",
    html: `
      <h3>BlogPosting</h3>
      <ul>
        <li><code>@type</code>: <code>BlogPosting</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ article.url }}#article</code></li>
        <li><code>mainEntityOfPage</code>: <code>WebPage</code></li>
        <li><code>headline</code> (≤110), <code>description</code> (≤300)</li>
        <li><code>image</code> (<code>ImageObject</code> with <em>url/width/height</em>)</li>
        <li><code>datePublished</code>, <code>dateModified</code></li>
        <li><code>author</code> (Person), <code>publisher</code> (Organization)</li>
        <li><code>inLanguage</code>, <code>isAccessibleForFree</code>=true, <code>wordCount</code>, <code>articleSection</code></li>
      </ul>

      <h4>HowTo (optional)</h4>
      <ul>
        <li>Enabled via <code>emit_howto_auto</code></li>
        <li>Built from H2 headings (H3 normalized to H2)</li>
        <li>Requires ≥2 steps</li>
        <li><code>@type</code>: <code>HowTo</code>; <code>@id</code>: <code>{{ shop.url }}{{ article.url }}#howto</code></li>
        <li>Includes <code>name</code>, <code>description</code>, <code>image</code> (if any), dates, <code>author</code>, <code>publisher</code>, <code>step[]</code></li>
      </ul>
    `,
  },
  pt: {
    title: "Blog / Artigos",
    html: `
      <h3>BlogPosting</h3>
      <ul>
        <li><code>@type</code>: <code>BlogPosting</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}{{ article.url }}#article</code></li>
        <li><code>mainEntityOfPage</code>: <code>WebPage</code></li>
        <li><code>headline</code> (≤110), <code>description</code> (≤300)</li>
        <li><code>image</code> (<code>ImageObject</code> com <em>url/width/height</em>)</li>
        <li><code>datePublished</code>, <code>dateModified</code></li>
        <li><code>author</code> (Person), <code>publisher</code> (Organization)</li>
        <li><code>inLanguage</code>, <code>isAccessibleForFree</code>=true, <code>wordCount</code>, <code>articleSection</code></li>
      </ul>

      <h4>HowTo (opcional)</h4>
      <ul>
        <li>Ativado por <code>emit_howto_auto</code></li>
        <li>Gerado a partir de títulos H2 (H3 normalizado)</li>
        <li>Requer ≥2 passos</li>
        <li><code>@type</code>: <code>HowTo</code>; <code>@id</code>: <code>{{ shop.url }}{{ article.url }}#howto</code></li>
        <li>Inclui <code>name</code>, <code>description</code>, <code>image</code>, datas, <code>author</code>, <code>publisher</code>, <code>step[]</code></li>
      </ul>
    `,
  },
};

export default function BlogPage() {
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
