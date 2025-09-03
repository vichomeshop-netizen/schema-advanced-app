// app/routes/app.global.jsx
import { useOutletContext } from "@remix-run/react";

const TEXT = {
  es: {
    title: "Global",
    html: `
      <h3>Organization (todas las páginas)</h3>
      <ul>
        <li><code>@type</code>: <code>Organization</code>; <code>@id</code>=<code>{{ shop.url }}#org</code></li>
        <li><code>url</code>, <code>name</code>, <code>legalName</code></li>
        <li><code>logo</code> e <code>image</code> desde <code>org_logo</code></li>
        <li><code>sameAs</code> normalizado/deduplicado desde <code>org_sameas</code></li>
        <li><code>email</code>, <code>contactPoint</code> (Customer Support; <code>telephone</code> opcional)</li>
        <li><code>address</code>: calle, ciudad, postal, país</li>
        <li><code>areaServed</code>: países de <code>shipping_countries</code></li>
        <li><code>hasMerchantReturnPolicy</code> global (días, método, tasas)</li>
      </ul>

      <h3>WebSite (home opcional)</h3>
      <ul>
        <li>Se emite si no está limitado a home o si estás en home</li>
        <li><code>@id</code>=<code>{{ shop.url }}#website</code>; <code>publisher</code>=<code>#org</code></li>
        <li><code>inLanguage</code> auto: ES/PT; si no, EN</li>
        <li><code>potentialAction</code>: <code>SearchAction</code> → <code>{{ shop.url }}/search?q={search_term_string}</code></li>
      </ul>

      <h3>BreadcrumbList (toggle)</h3>
      <ul>
        <li>Con <code>emit_breadcrumbs</code>: Home → Colección → Producto</li>
      </ul>

      <h3>Detección de idioma</h3>
      <ul>
        <li>Modo: <code>auto</code> / forzado (<code>es</code>, <code>pt</code>, <code>en</code>)</li>
        <li>Fuentes: <code>request.locale</code>, <code>localization.language</code>, <code>routes.root_url</code>, <code>shop.primary_locale</code></li>
      </ul>
    `,
  },
  en: {
    title: "Global",
    html: `
      <h3>Organization (all pages)</h3>
      <ul>
        <li><code>@type</code>: <code>Organization</code>; <code>@id</code>=<code>{{ shop.url }}#org</code></li>
        <li><code>url</code>, <code>name</code>, <code>legalName</code></li>
        <li><code>logo</code> and <code>image</code> from <code>org_logo</code></li>
        <li><code>sameAs</code> normalized/deduped from <code>org_sameas</code></li>
        <li><code>email</code>, <code>contactPoint</code> (Customer Support; optional <code>telephone</code>)</li>
        <li><code>address</code>: street, city, postal, country</li>
        <li><code>areaServed</code>: countries from <code>shipping_countries</code></li>
        <li>Global <code>hasMerchantReturnPolicy</code> (days, method, fees)</li>
      </ul>

      <h3>WebSite (home optional)</h3>
      <ul>
        <li>Emitted unless limited to home, or when on home</li>
        <li><code>@id</code>=<code>{{ shop.url }}#website</code>; <code>publisher</code>=<code>#org</code></li>
        <li><code>inLanguage</code> auto: ES/PT; otherwise EN</li>
        <li><code>potentialAction</code>: <code>SearchAction</code> → <code>{{ shop.url }}/search?q={search_term_string}</code></li>
      </ul>

      <h3>BreadcrumbList (toggle)</h3>
      <ul>
        <li>When <code>emit_breadcrumbs</code> is enabled: Home → Collection → Product</li>
      </ul>

      <h3>Language detection</h3>
      <ul>
        <li>Mode: <code>auto</code> / forced (<code>es</code>, <code>pt</code>, <code>en</code>)</li>
        <li>Sources: <code>request.locale</code>, <code>localization.language</code>, <code>routes.root_url</code>, <code>shop.primary_locale</code></li>
      </ul>
    `,
  },
  pt: {
    title: "Global",
    html: `
      <h3>Organization (todas as páginas)</h3>
      <ul>
        <li><code>@type</code>: <code>Organization</code>; <code>@id</code>=<code>{{ shop.url }}#org</code></li>
        <li><code>url</code>, <code>name</code>, <code>legalName</code></li>
        <li><code>logo</code> e <code>image</code> de <code>org_logo</code></li>
        <li><code>sameAs</code> normalizado/deduplicado de <code>org_sameas</code></li>
        <li><code>email</code>, <code>contactPoint</code> (Suporte; <code>telephone</code> opcional)</li>
        <li><code>address</code>: rua, cidade, postal, país</li>
        <li><code>areaServed</code>: países de <code>shipping_countries</code></li>
        <li><code>hasMerchantReturnPolicy</code> global (dias, método, taxas)</li>
      </ul>

      <h3>WebSite (home opcional)</h3>
      <ul>
        <li>Emitido exceto se limitado à home, ou quando estiver na home</li>
        <li><code>@id</code>=<code>{{ shop.url }}#website</code>; <code>publisher</code>=<code>#org</code></li>
        <li><code>inLanguage</code> auto: PT/ES; caso contrário EN</li>
        <li><code>potentialAction</code>: <code>SearchAction</code> → <code>{{ shop.url }}/search?q={search_term_string}</code></li>
      </ul>

      <h3>BreadcrumbList (toggle)</h3>
      <ul>
        <li>Se <code>emit_breadcrumbs</code> estiver ativo: Home → Coleção → Produto</li>
      </ul>

      <h3>Detecção de idioma</h3>
      <ul>
        <li>Modo: <code>auto</code> / forçado (<code>es</code>, <code>pt</code>, <code>en</code>)</li>
        <li>Fontes: <code>request.locale</code>, <code>localization.language</code>, <code>routes.root_url</code>, <code>shop.primary_locale</code></li>
      </ul>
    `,
  },
};

export default function GlobalPage() {
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
