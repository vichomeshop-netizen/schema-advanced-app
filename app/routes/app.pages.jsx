// app/routes/app.pages.jsx
import { useOutletContext } from "@remix-run/react";

const TEXT = {
  es: {
    title: "Páginas",
    html: `
      <h3>ContactPage</h3>
      <ul>
        <li>Activa si la plantilla contiene <code>contact</code> o la ruta <code>/pages/contact</code></li>
        <li><code>@type</code>: <code>["WebPage","ContactPage"]</code></li>
        <li><code>@id</code> con ancla <code>#contact</code>; <code>url</code></li>
        <li><code>name</code>, <code>description</code> (~300), <code>inLanguage</code></li>
        <li><code>isPartOf</code> → <code>{{ shop.url }}#website</code>; <code>about</code> → <code>{{ shop.url }}#org</code></li>
      </ul>

      <h3>AboutPage</h3>
      <ul>
        <li>Activa si la plantilla contiene <code>about</code> o rutas comunes (<code>/pages/about</code>, <code>/pages/acerca</code>, <code>/pages/sobre-nosotros</code>)</li>
        <li>Estructura análoga con ancla <code>#about</code></li>
      </ul>
    `,
  },
  en: {
    title: "Pages",
    html: `
      <h3>ContactPage</h3>
      <ul>
        <li>Active when the template contains <code>contact</code> or the path is <code>/pages/contact</code></li>
        <li><code>@type</code>: <code>["WebPage","ContactPage"]</code></li>
        <li><code>@id</code> with <code>#contact</code> anchor; <code>url</code></li>
        <li><code>name</code>, <code>description</code> (~300), <code>inLanguage</code></li>
        <li><code>isPartOf</code> → <code>{{ shop.url }}#website</code>; <code>about</code> → <code>{{ shop.url }}#org</code></li>
      </ul>

      <h3>AboutPage</h3>
      <ul>
        <li>Active if the template contains <code>about</code> or common paths (<code>/pages/about</code>, etc.)</li>
        <li>Same structure with <code>#about</code> anchor</li>
      </ul>
    `,
  },
  pt: {
    title: "Páginas",
    html: `
      <h3>ContactPage</h3>
      <ul>
        <li>Ativo se o template contém <code>contact</code> ou path <code>/pages/contact</code></li>
        <li><code>@type</code>: <code>["WebPage","ContactPage"]</code></li>
        <li><code>@id</code> com âncora <code>#contact</code>; <code>url</code></li>
        <li><code>name</code>, <code>description</code> (~300), <code>inLanguage</code></li>
        <li><code>isPartOf</code> → <code>{{ shop.url }}#website</code>; <code>about</code> → <code>{{ shop.url }}#org</code></li>
      </ul>

      <h3>AboutPage</h3>
      <ul>
        <li>Ativo quando há template <code>about</code> ou paths comuns (<code>/pages/about</code>, etc.)</li>
        <li>Mesma estrutura com âncora <code>#about</code></li>
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
      <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}
        dangerouslySetInnerHTML={{ __html: t.html }} />
    </div>
  );
}
