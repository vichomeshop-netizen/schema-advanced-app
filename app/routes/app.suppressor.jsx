// app/routes/app.suppressor.jsx
import { useOutletContext } from "@remix-run/react";

const TEXT = {
  es: {
    title: "Supresor JSON-LD",
    html: `
      <h3>Qué hace</h3>
      <p>Cuando <code>suppress_theme_jsonld</code> está activo, la app elimina scripts JSON-LD del tema que dupliquen los tipos que emite la app.
      Los scripts de la app se identifican por <code>data-sae="1"</code> y se mantienen.</p>

      <h4>Tipos vigilados</h4>
      <ul>
        <li><code>Product</code>, <code>Organization</code>, <code>WebSite</code>, <code>BreadcrumbList</code>, <code>CollectionPage</code>, <code>WebPage</code>, <code>FAQPage</code>, <code>BlogPosting</code>, <code>HowTo</code>, <code>ContactPage</code>, <code>AboutPage</code>, <code>ItemList</code></li>
      </ul>

      <h4>Cómo funciona</h4>
      <ul>
        <li>Escaneo inicial al cargar</li>
        <li>Varios <em>timeouts</em> para inyecciones tardías (400/1200/3000ms)</li>
        <li><em>MutationObserver</em> para eliminar cualquier JSON-LD nuevo que coincida</li>
      </ul>

      <h4>Notas</h4>
      <ul>
        <li>No elimina JSON-LD de terceros que no coincidan con los tipos listados</li>
        <li>Si tu tema genera datos imprescindibles no cubiertos por la app, desactiva el supresor</li>
      </ul>
    `,
  },
  en: {
    title: "JSON-LD Suppressor",
    html: `
      <h3>What it does</h3>
      <p>When <code>suppress_theme_jsonld</code> is enabled, the app removes theme JSON-LD that overlaps with the app's own output.
      App scripts carry <code>data-sae="1"</code> and are preserved.</p>

      <h4>Watched types</h4>
      <ul>
        <li><code>Product</code>, <code>Organization</code>, <code>WebSite</code>, <code>BreadcrumbList</code>, <code>CollectionPage</code>, <code>WebPage</code>, <code>FAQPage</code>, <code>BlogPosting</code>, <code>HowTo</code>, <code>ContactPage</code>, <code>AboutPage</code>, <code>ItemList</code></li>
      </ul>

      <h4>How it works</h4>
      <ul>
        <li>Initial pass on load</li>
        <li>Multiple timeouts for late injections (400/1200/3000ms)</li>
        <li><em>MutationObserver</em> to catch & remove new matching scripts</li>
      </ul>

      <h4>Notes</h4>
      <ul>
        <li>Won’t remove third-party JSON-LD that doesn’t match the listed types</li>
        <li>If your theme outputs something essential not covered by the app, keep the suppressor off</li>
      </ul>
    `,
  },
  pt: {
    title: "Supressor JSON-LD",
    html: `
      <h3>O que faz</h3>
      <p>Com <code>suppress_theme_jsonld</code> ativo, o app remove JSON-LD do tema que se sobrepõe ao do app.
      Os scripts do app têm <code>data-sae="1"</code> e são preservados.</p>

      <h4>Tipos monitorados</h4>
      <ul>
        <li><code>Product</code>, <code>Organization</code>, <code>WebSite</code>, <code>BreadcrumbList</code>, <code>CollectionPage</code>, <code>WebPage</code>, <code>FAQPage</code>, <code>BlogPosting</code>, <code>HowTo</code>, <code>ContactPage</code>, <code>AboutPage</code>, <code>ItemList</code></li>
      </ul>

      <h4>Como funciona</h4>
      <ul>
        <li>Varredura inicial ao carregar</li>
        <li>Vários <em>timeouts</em> para injeções tardias (400/1200/3000ms)</li>
        <li><em>MutationObserver</em> para capturar e remover scripts novos compatíveis</li>
      </ul>

      <h4>Notas</h4>
      <ul>
        <li>Não remove JSON-LD de terceiros que não correspondam aos tipos listados</li>
        <li>Se o tema emitir algo essencial não coberto pelo app, deixe o supressor desligado</li>
      </ul>
    `,
  },
};

export default function SuppressorPage() {
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
