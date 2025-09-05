// app/routes/app.localbusiness.jsx
import { useOutletContext } from "@remix-run/react";

const TEXT = {
  es: {
    title: "Negocio local (LocalBusiness)",
    html: `
      <h3>Qué emite la app</h3>
      <p>La app añade un <strong>único</strong> <code>&lt;script type="application/ld+json"&gt;</code> con un objeto <strong>LocalBusiness</strong> (y, si eliges, un subtipo como <code>Store</code> o <code>HardwareStore</code>). Hereda datos de <code>Organization</code> para evitar duplicados y facilitar el mantenimiento.</p>
      <ul>
        <li><code>@type</code>: <code>["LocalBusiness", "<em>Subtipo opcional</em>"]</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}#local</code> (estable) con <code>parentOrganization</code> → <code>{{ shop.url }}#org</code></li>
        <li><strong>Hereda NAP</strong> de <code>Organization</code>: <em>name</em> (si no defines uno específico), <em>telephone</em>, <em>email</em>, <em>address</em> (street / city / postal / country)</li>
        <li><code>image</code>: usa el logo del bloque <code>Organization</code> si está configurado</li>
        <li><code>openingHours</code>: lista simple (una línea por franja, p. ej. <code>Mo-Fr 09:00-18:00</code>, <code>Sa 10:00-14:00</code>)</li>
        <li><code>geo</code> (<em>latitude/longitude</em>) y <code>hasMap</code> (URL de Google Maps / Google Business Profile)</li>
        <li><code>priceRange</code> opcional (p. ej. <code>€€</code> o <code>€–€€€</code>)</li>
        <li><code>sameAs</code> (opcional) apuntando a la ficha de Google Business Profile</li>
      </ul>

      <h4 style="margin-top:14px">Dónde se activa</h4>
      <p>Por buenas prácticas de Google/Schema, el marcado se emite <strong>solo</strong> donde el negocio es el tema principal:</p>
      <ul>
        <li><strong>Home</strong> (inicio)</li>
        <li><strong>Contacto</strong> (plantilla o ruta que contenga <code>contact</code>)</li>
        <li><strong>About</strong> / “Sobre nosotros” / “Acerca de” (<code>/pages/about</code>, <code>/pages/acerca</code>, <code>/pages/sobre…</code>)</li>
      </ul>
      <p><em>No</em> se añade a PDP, posts u otras páginas para evitar “ruido” y mantener la relevancia del marcado.</p>

      <h4 style="margin-top:14px">Campos de configuración</h4>
      <ul>
        <li><code>emit_localbusiness</code> (checkbox): activar/desactivar la salida de LocalBusiness</li>
        <li><code>localbusiness_type</code> (select): subtipo específico (p. ej. <code>Store</code>, <code>HardwareStore</code>, <code>HomeAndConstructionBusiness</code>)</li>
        <li><code>localbusiness_name</code> (text): nombre alternativo (si lo dejas vacío, usa <code>shop.name</code>)</li>
        <li><code>opening_hours_lines</code> (textarea): una línea por franja <small>(ej.: <code>Mo-Fr 09:00-18:00</code>)</small></li>
        <li><code>geo_lat</code> / <code>geo_lng</code> (text/decimal): coordenadas (si existen, se priorizan)</li>
        <li><code>price_range</code> (text): rango de precios opcional</li>
        <li><code>localbusiness_gbp_url</code> (text): URL de la ficha de Google Business Profile (se usa como <code>hasMap</code> si no hay coordenadas y en <code>sameAs</code>)</li>
      </ul>

      <h4 style="margin-top:14px">Beneficios</h4>
      <ul>
        <li>Eligibilidad para <strong>resultados enriquecidos locales</strong> y mejores señales de relevancia local</li>
        <li>Coherencia NAP al <strong>heredar de Organization</strong>, reduciendo inconsistencias</li>
        <li><strong>Sin duplicados</strong> gracias al supresor de JSON-LD del tema</li>
        <li>Configuración mínima para el cliente: solo completa horas, ubicación y (opcionalmente) rango de precio</li>
      </ul>

      <h4 style="margin-top:14px">Notas y buenas prácticas</h4>
      <ul>
        <li>Usa el <strong>subtipo más específico</strong> posible</li>
        <li>Mantén NAP consistente en el sitio y ficha de GBP</li>
        <li>Si hay varias sedes, lo ideal es 1 página por sede con su propio <code>LocalBusiness</code> y una sola <code>Organization</code> global</li>
        <li>Valida en la Prueba de resultados enriquecidos / validador de Schema.org</li>
      </ul>

      <h4 style="margin-top:14px">Snippet / Implementación (Liquid)</h4>
      <p>Este condicional controla dónde se emite <code>LocalBusiness</code>:</p>
      <pre style="white-space:pre-wrap;background:#0b1022;color:#e5e7eb;border-radius:8px;padding:12px;"><code>{%- comment -%} LocalBusiness guard {%- endcomment -%}
{%- if block.settings.emit_localbusiness -%}
  {%- assign _is_contact = false -%}
  {%- if template contains 'contact' or request.path contains '/pages/contact' -%}{%- assign _is_contact = true -%}{%- endif -%}

  {%- assign _is_about = false -%}
  {%- if template contains 'about' -%}{%- assign _is_about = true -%}{%- endif -%}
  {%- if request.path contains '/pages/about' or request.path contains '/pages/acerca' or request.path contains '/pages/sobre' -%}{%- assign _is_about = true -%}{%- endif -%}

  {%- assign _emit_local = false -%}
  {%- if request.page_type == 'index' -%}{%- assign _emit_local = true -%}{%- endif -%}
  {%- if _is_contact -%}{%- assign _emit_local = true -%}{%- endif -%}
  {%- if _is_about -%}{%- assign _emit_local = true -%}{%- endif -%}

  {%- if _emit_local -%}
    <!-- JSON-LD LocalBusiness aquí -->
  {%- endif -%}
{%- endif -%}</code></pre>
    `,
  },
  en: {
    title: "Local business (LocalBusiness)",
    html: `
      <h3>What the app emits</h3>
      <p>The app injects a <strong>single</strong> <code>&lt;script type="application/ld+json"&gt;</code> with a <strong>LocalBusiness</strong> object (optionally a subtype like <code>Store</code> or <code>HardwareStore</code>). It <em>inherits</em> core data from <code>Organization</code> to avoid duplication.</p>
      <ul>
        <li><code>@type</code>: <code>["LocalBusiness", "<em>Optional subtype</em>"]</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}#local</code> with <code>parentOrganization</code> → <code>{{ shop.url }}#org</code></li>
        <li><strong>Inherits NAP</strong> from <code>Organization</code>: <em>name</em> (unless overridden), <em>telephone</em>, <em>email</em>, <em>address</em></li>
        <li><code>image</code> from Organization logo when available</li>
        <li><code>openingHours</code>: simple list (one line per slot, e.g., <code>Mo-Fr 09:00-18:00</code>)</li>
        <li><code>geo</code> (lat/lng) and <code>hasMap</code> (Google Maps / GBP URL)</li>
        <li><code>priceRange</code> optional (e.g., <code>€€</code> or <code>€–€€€</code>)</li>
        <li><code>sameAs</code> (optional) pointing to your GBP</li>
      </ul>

      <h4 style="margin-top:14px">Where it activates</h4>
      <p>Following best practices, we output it only where the business is the primary topic:</p>
      <ul>
        <li><strong>Home</strong></li>
        <li><strong>Contact</strong> (template or path containing <code>contact</code>)</li>
        <li><strong>About</strong> (<code>/pages/about</code>, <code>/pages/acerca</code>, <code>/pages/sobre…</code>)</li>
      </ul>
      <p><em>Not</em> added to PDP or blog posts to keep markup relevant.</p>

      <h4 style="margin-top:14px">Settings</h4>
      <ul>
        <li><code>emit_localbusiness</code> (checkbox): enable/disable LocalBusiness</li>
        <li><code>localbusiness_type</code> (select): pick a specific subtype</li>
        <li><code>localbusiness_name</code> (text): optional override (defaults to <code>shop.name</code>)</li>
        <li><code>opening_hours_lines</code> (textarea): one line per slot <small>(e.g., <code>Mo-Fr 09:00-18:00</code>)</small></li>
        <li><code>geo_lat</code> / <code>geo_lng</code> (text/decimal): coordinates</li>
        <li><code>price_range</code> (text): optional price band</li>
        <li><code>localbusiness_gbp_url</code> (text): Google Business Profile URL (<code>hasMap</code>/<code>sameAs</code>)</li>
      </ul>

      <h4 style="margin-top:14px">Benefits</h4>
      <ul>
        <li>Eligibility for <strong>local rich results</strong> and stronger local relevance</li>
        <li>Consistent NAP by <strong>inheriting from Organization</strong></li>
        <li><strong>No duplicates</strong> thanks to JSON-LD suppression</li>
        <li>Minimal setup for merchants</li>
      </ul>

      <h4 style="margin-top:14px">Notes & Best practices</h4>
      <ul>
        <li>Choose the <strong>most specific</strong> subtype</li>
        <li>Keep NAP consistent with your GBP listing</li>
        <li>Multiple locations: one page per location with its own <code>LocalBusiness</code> + a single site-level <code>Organization</code></li>
        <li>Validate with Google Rich Results Test / Schema.org Validator</li>
      </ul>

      <h4 style="margin-top:14px">Snippet (Liquid)</h4>
      <p>This guard controls where <code>LocalBusiness</code> is emitted:</p>
      <pre style="white-space:pre-wrap;background:#0b1022;color:#e5e7eb;border-radius:8px;padding:12px;"><code>{%- comment -%} LocalBusiness guard {%- endcomment -%}
{%- if block.settings.emit_localbusiness -%}
  {%- assign _is_contact = false -%}
  {%- if template contains 'contact' or request.path contains '/pages/contact' -%}{%- assign _is_contact = true -%}{%- endif -%}

  {%- assign _is_about = false -%}
  {%- if template contains 'about' -%}{%- assign _is_about = true -%}{%- endif -%}
  {%- if request.path contains '/pages/about' or request.path contains '/pages/acerca' or request.path contains '/pages/sobre' -%}{%- assign _is_about = true -%}{%- endif -%}

  {%- assign _emit_local = false -%}
  {%- if request.page_type == 'index' -%}{%- assign _emit_local = true -%}{%- endif -%}
  {%- if _is_contact -%}{%- assign _emit_local = true -%}{%- endif -%}
  {%- if _is_about -%}{%- assign _emit_local = true -%}{%- endif -%}

  {%- if _emit_local -%}
    <!-- JSON-LD LocalBusiness here -->
  {%- endif -%}
{%- endif -%}</code></pre>
    `,
  },
  pt: {
    title: "Negócio local (LocalBusiness)",
    html: `
      <h3>O que o app emite</h3>
      <p>O app injeta um <strong>único</strong> <code>&lt;script type="application/ld+json"&gt;</code> com um objeto <strong>LocalBusiness</strong> (e, se desejar, um subtipo como <code>Store</code> ou <code>HardwareStore</code>). Ele <em>herda</em> dados de <code>Organization</code> para evitar duplicações.</p>
      <ul>
        <li><code>@type</code>: <code>["LocalBusiness", "<em>Subtipo opcional</em>"]</code></li>
        <li><code>@id</code>: <code>{{ shop.url }}#local</code> com <code>parentOrganization</code> → <code>{{ shop.url }}#org</code></li>
        <li><strong>Herda NAP</strong> de <code>Organization</code>: <em>name</em> (salvo override), <em>telephone</em>, <em>email</em>, <em>address</em></li>
        <li><code>image</code> a partir do logo de Organization (quando houver)</li>
        <li><code>openingHours</code>: lista simples (uma linha por faixa, ex.: <code>Mo-Fr 09:00-18:00</code>)</li>
        <li><code>geo</code> (lat/lng) e <code>hasMap</code> (Google Maps / URL do GBP)</li>
        <li><code>priceRange</code> opcional (ex.: <code>€€</code> ou <code>€–€€€</code>)</li>
        <li><code>sameAs</code> (opcional) apontando para o Google Business Profile</li>
      </ul>

      <h4 style="margin-top:14px">Onde ativa</h4>
      <p>Emitimos apenas onde o negócio é o tópico principal:</p>
      <ul>
        <li><strong>Home</strong></li>
        <li><strong>Contato</strong> (template ou rota com <code>contact</code>)</li>
        <li><strong>About</strong> / “Sobre nós” / “Acerca” (<code>/pages/about</code>, <code>/pages/acerca</code>, <code>/pages/sobre…</code>)</li>
      </ul>
      <p><em>Não</em> adicionamos em PDP/posts para manter o markup relevante.</p>

      <h4 style="margin-top:14px">Campos</h4>
      <ul>
        <li><code>emit_localbusiness</code> (checkbox)</li>
        <li><code>localbusiness_type</code> (select)</li>
        <li><code>localbusiness_name</code> (text)</li>
        <li><code>opening_hours_lines</code> (textarea)</li>
        <li><code>geo_lat</code> / <code>geo_lng</code> (text/decimal)</li>
        <li><code>price_range</code> (text)</li>
        <li><code>localbusiness_gbp_url</code> (text)</li>
      </ul>

      <h4 style="margin-top:14px">Benefícios</h4>
      <ul>
        <li>Rich results locais e maior relevância</li>
        <li>NAP consistente ao herdar de <code>Organization</code></li>
        <li>Sem duplicidade graças ao supressor de JSON-LD</li>
        <li>Setup mínimo</li>
      </ul>

      <h4 style="margin-top:14px">Snippet (Liquid)</h4>
      <p>Guard que controla onde <code>LocalBusiness</code> é emitido:</p>
      <pre style="white-space:pre-wrap;background:#0b1022;color:#e5e7eb;border-radius:8px;padding:12px;"><code>{%- comment -%} LocalBusiness guard {%- endcomment -%}
{%- if block.settings.emit_localbusiness -%}
  {%- assign _is_contact = false -%}
  {%- if template contains 'contact' or request.path contains '/pages/contact' -%}{%- assign _is_contact = true -%}{%- endif -%}

  {%- assign _is_about = false -%}
  {%- if template contains 'about' -%}{%- assign _is_about = true -%}{%- endif -%}
  {%- if request.path contains '/pages/about' or request.path contains '/pages/acerca' or request.path contains '/pages/sobre' -%}{%- assign _is_about = true -%}{%- endif -%}

  {%- assign _emit_local = false -%}
  {%- if request.page_type == 'index' -%}{%- assign _emit_local = true -%}{%- endif -%}
  {%- if _is_contact -%}{%- assign _emit_local = true -%}{%- endif -%}
  {%- if _is_about -%}{%- assign _emit_local = true -%}{%- endif -%}

  {%- if _emit_local -%}
    <!-- JSON-LD LocalBusiness aqui -->
  {%- endif -%}
{%- endif -%}</code></pre>
    `,
  },
};

export default function LocalBusinessPage() {
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

