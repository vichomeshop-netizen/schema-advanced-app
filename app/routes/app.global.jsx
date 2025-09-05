// app/routes/app.global.jsx
import { useOutletContext } from "@remix-run/react";

const TEXT = {
  es: {
    title: "Global",
    html: `
      <h3>Organization (todas las páginas)</h3>
      <ul>
        <li><strong>Identidad</strong>: <code>@type</code>=<code>Organization</code>; <code>@id</code>=<code>{{ shop.url }}#org</code></li>
        <li><strong>Básicos</strong>: <code>url</code>, <code>name</code>, <code>legalName</code></li>
        <li><strong>Marca</strong>: <code>logo</code> e <code>image</code> desde <code>org_logo</code></li>
        <li><strong>Perfiles</strong>: <code>sameAs</code> normalizado y deduplicado desde <code>org_sameas</code> (admite comas/espacios; se completa <code>https://</code> si falta)</li>
        <li><strong>Contacto</strong>: <code>email</code>, <code>contactPoint</code> (Customer Support; <code>telephone</code> opcional)</li>
        <li><strong>Dirección</strong>: calle, ciudad, postal, <code>addressCountry</code> (código ISO-2 en mayúsculas)</li>
        <li><strong>Ámbito</strong>: <code>areaServed</code> → países desde <code>shipping_countries</code> (admite varios separados por coma)</li>
        <li><strong>Devoluciones</strong>: <code>hasMerchantReturnPolicy</code> (categoría, días, método, tasas) + <code>applicableCountry</code> → mismos países de <code>shipping_countries</code></li>
      </ul>
      <p style="margin:.5rem 0 0;color:#4b5563;">
        Notas: normalizamos alias comunes (<em>UK/EN</em> → <code>GB</code>, <em>EN-US</em> → <code>US</code>); los enumerados usan <code>https://schema.org/…</code>.
      </p>

      <h3>WebSite (home opcional)</h3>
      <ul>
        <li>Se emite salvo que límites a home o cuando estés en home</li>
        <li><code>@id</code>=<code>{{ shop.url }}#website</code>; <code>publisher</code>=<code>#org</code></li>
        <li><code>inLanguage</code> automático (ES/PT; si no, EN)</li>
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
        <li><strong>Identity</strong>: <code>@type</code>=<code>Organization</code>; <code>@id</code>=<code>{{ shop.url }}#org</code></li>
        <li><strong>Basics</strong>: <code>url</code>, <code>name</code>, <code>legalName</code></li>
        <li><strong>Brand</strong>: <code>logo</code> and <code>image</code> from <code>org_logo</code></li>
        <li><strong>Profiles</strong>: <code>sameAs</code> normalized & deduped from <code>org_sameas</code> (commas/spaces allowed; <code>https://</code> added if missing)</li>
        <li><strong>Contact</strong>: <code>email</code>, <code>contactPoint</code> (Customer Support; optional <code>telephone</code>)</li>
        <li><strong>Address</strong>: street, city, postal, <code>addressCountry</code> (ISO-2 code, uppercase)</li>
        <li><strong>Scope</strong>: <code>areaServed</code> → countries from <code>shipping_countries</code> (multiple comma-separated)</li>
        <li><strong>Returns</strong>: <code>hasMerchantReturnPolicy</code> (category, days, method, fees) + <code>applicableCountry</code> → same countries as <code>shipping_countries</code></li>
      </ul>
      <p style="margin:.5rem 0 0;color:#4b5563;">
        Notes: common aliases normalized (<em>UK/EN</em> → <code>GB</code>, <em>EN-US</em> → <code>US</code>); enums use <code>https://schema.org/…</code>.
      </p>

      <h3>WebSite (home optional)</h3>
      <ul>
        <li>Emitted unless limited to home, or when on home</li>
        <li><code>@id</code>=<code>{{ shop.url }}#website</code>; <code>publisher</code>=<code>#org</code></li>
        <li><code>inLanguage</code> auto (ES/PT; otherwise EN)</li>
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
        <li><strong>Identidade</strong>: <code>@type</code>=<code>Organization</code>; <code>@id</code>=<code>{{ shop.url }}#org</code></li>
        <li><strong>Básico</strong>: <code>url</code>, <code>name</code>, <code>legalName</code></li>
        <li><strong>Marca</strong>: <code>logo</code> e <code>image</code> de <code>org_logo</code></li>
        <li><strong>Perfis</strong>: <code>sameAs</code> normalizado/deduplicado de <code>org_sameas</code> (vírgulas/espaços; adiciona <code>https://</code> se faltar)</li>
        <li><strong>Contato</strong>: <code>email</code>, <code>contactPoint</code> (Suporte; <code>telephone</code> opcional)</li>
        <li><strong>Endereço</strong>: rua, cidade, postal, <code>addressCountry</code> (código ISO-2 em maiúsculas)</li>
        <li><strong>Âmbito</strong>: <code>areaServed</code> → países de <code>shipping_countries</code> (múltiplos separados por vírgula)</li>
        <li><strong>Devoluções</strong>: <code>hasMerchantReturnPolicy</code> (categoria, dias, método, taxas) + <code>applicableCountry</code> → mesmos países de <code>shipping_countries</code></li>
      </ul>
      <p style="margin:.5rem 0 0;color:#4b5563;">
        Notas: normalizamos aliases comuns (<em>UK/EN</em> → <code>GB</code>, <em>EN-US</em> → <code>US</code>); enums usam <code>https://schema.org/…</code>.
      </p>

      <h3>WebSite (home opcional)</h3>
      <ul>
        <li>Emitido exceto quando limitado à home, ou quando estiver na home</li>
        <li><code>@id</code>=<code>{{ shop.url }}#website</code>; <code>publisher</code>=<code>#org</code></li>
        <li><code>inLanguage</code> automático (PT/ES; caso contrário EN)</li>
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
      <section
        style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}
        dangerouslySetInnerHTML={{ __html: t.html }}
      />
    </div>
  );
}

