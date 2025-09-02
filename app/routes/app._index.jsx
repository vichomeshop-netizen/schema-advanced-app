// app/routes/app._index.jsx
import { useEffect, useState } from "react";
import { useOutletContext, useSearchParams } from "@remix-run/react";

const STRINGS = {
  en: {
    title: "Schema Advanced — Quick Guide",
    intro:
      'This app adds optimized JSON-LD structured data to your Shopify store so search engines can understand your business and show rich results.',
    stepsTitle: "Getting started",
    steps: [
      "Go to Online Store → Themes → Customize",
      "Open the App embeds tab",
      "Enable Schema Advanced and save",
      'Visit your storefront: you should see <code>data-sae=\"1\"</code> in the JSON-LD',
      "Check the status below turns to ✅ Active",
    ],
    statusTitle: "Quick status",
    statusChecking: "⏳ Checking…",
    statusOk: "✅ Schema Advanced active",
    statusWarnNoSignal: "⚠️ No confirmation received from the storefront",
    whatTitle: "What schemas are added?",
    whatList: [
      "<strong>Organization</strong>, <strong>WebSite</strong>, <strong>BreadcrumbList</strong>, <strong>CollectionPage</strong>, <strong>FAQPage</strong>, <strong>Product</strong>, <strong>AggregateOffer</strong>, <strong>AggregateRating</strong>, <strong>BlogPosting</strong>, <strong>HowTo</strong>, <strong>ContactPage</strong>, <strong>AboutPage</strong>",
    ],
    extrasTitle: "Extras",
    extrasList: [
      "<strong>Theme JSON-LD suppressor</strong>: removes duplicates",
      "<strong>Auto language</strong>: ES/PT aware for inLanguage",
      "<strong>Return policy</strong>: based on your settings",
    ],
    verifyTitle: "Verification",
    verifyText:
      'Use Google’s <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">Rich Results Test</a> to validate your store’s structured data.',
    openEditor: "Open theme editor",
  },
  es: {
    title: "Schema Advanced — Guía rápida",
    intro:
      "Esta app añade marcado estructurado JSON-LD optimizado a tu tienda Shopify para que los buscadores entiendan mejor tu negocio y muestren resultados enriquecidos.",
    stepsTitle: "Pasos de uso",
    steps: [
      "Ve a Online Store → Themes → Customize",
      "Abre la pestaña App embeds",
      "Activa Schema Advanced y guarda",
      'Visita tu storefront: deberías ver <code>data-sae=\"1\"</code> en el JSON-LD',
      "Comprueba que el estado aquí abajo aparece como ✅ Activo",
    ],
    statusTitle: "Estado rápido",
    statusChecking: "⏳ Comprobando…",
    statusOk: "✅ Schema Advanced activo",
    statusWarnNoSignal: "⚠️ No se recibió confirmación del storefront",
    whatTitle: "¿Qué schemas añade?",
    whatList: [
      "<strong>Organization</strong>, <strong>WebSite</strong>, <strong>BreadcrumbList</strong>, <strong>CollectionPage</strong>, <strong>FAQPage</strong>, <strong>Product</strong>, <strong>AggregateOffer</strong>, <strong>AggregateRating</strong>, <strong>BlogPosting</strong>, <strong>HowTo</strong>, <strong>ContactPage</strong>, <strong>AboutPage</strong>",
    ],
    extrasTitle: "Extras",
    extrasList: [
      "<strong>Supresor de JSON-LD del tema</strong>: elimina duplicados",
      "<strong>Idioma automático</strong>: reconoce ES/PT para inLanguage",
      "<strong>Política de devoluciones</strong>: según tus ajustes",
    ],
    verifyTitle: "Verificación",
    verifyText:
      'Usa la <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">prueba de resultados enriquecidos</a> de Google para validar el marcado.',
    openEditor: "Abrir editor de temas",
  },
  pt: {
    title: "Schema Advanced — Guia rápida",
    intro:
      "Este app adiciona dados estruturados JSON-LD otimizados à sua loja Shopify para que os motores de busca entendam melhor o seu negócio e exibam rich results.",
    stepsTitle: "Como usar",
    steps: [
      "Vá para Online Store → Themes → Customize",
      "Abra a aba App embeds",
      "Ative Schema Advanced e salve",
      'Visite o storefront: você deve ver <code>data-sae=\"1\"</code> no JSON-LD',
      "Verifique aqui abaixo que o estado aparece como ✅ Ativo",
    ],
    statusTitle: "Estado rápido",
    statusChecking: "⏳ Verificando…",
    statusOk: "✅ Schema Advanced ativo",
    statusWarnNoSignal: "⚠️ Nenhuma confirmação recebida do storefront",
    whatTitle: "Quais schemas são adicionados?",
    whatList: [
      "<strong>Organization</strong>, <strong>WebSite</strong>, <strong>BreadcrumbList</strong>, <strong>CollectionPage</strong>, <strong>FAQPage</strong>, <strong>Product</strong>, <strong>AggregateOffer</strong>, <strong>AggregateRating</strong>, <strong>BlogPosting</strong>, <strong>HowTo</strong>, <strong>ContactPage</strong>, <strong>AboutPage</strong>",
    ],
    extrasTitle: "Extras",
    extrasList: [
      "<strong>Supressor de JSON-LD do tema</strong>: remove duplicidades",
      "<strong>Idioma automático</strong>: reconhece ES/PT para inLanguage",
      "<strong>Política de devoluções</strong>: conforme suas configurações",
    ],
    verifyTitle: "Verificação",
    verifyText:
      'Use o <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">Rich Results Test</a> do Google para validar o marcado.',
    openEditor: "Abrir editor do tema",
  },
};

function useI18n() {
  const { lang: ctxLang } = useOutletContext() || {};
  const [sp] = useSearchParams();
  const q = sp.get("lang");
  const lang = (q && ["es", "en", "pt"].includes(q)) ? q : (ctxLang || "en");
  return STRINGS[lang] || STRINGS.en;
}

export default function Dashboard() {
  const t = useI18n();
  const [state, setState] = useState(t.statusChecking);

  // Nuevo useEffect con ping al backend
  useEffect(() => {
    fetch("/api/embed-ping")
      .then(r => r.json())
      .then(() => setState(t.statusOk))
      .catch(() => setState(t.statusWarnNoSignal));
  }, [t.statusOk, t.statusWarnNoSignal]);

  const openThemeEditor = () => {
    window.top.location.href = "/admin/themes/current/editor?context=apps";
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: 1.5 }}>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>{t.title}</h1>
      <p style={{ marginBottom: 20, color: "#374151" }} dangerouslySetInnerHTML={{ __html: t.intro }} />

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>📌 {t.stepsTitle}</h2>
        <ol style={{ paddingLeft: 20, color: "#111" }}>
          {t.steps.map((s, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: s }} />
          ))}
        </ol>
        <button
          onClick={openThemeEditor}
          style={{
            marginTop: 10,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            cursor: "pointer",
          }}
        >
          {t.openEditor}
        </button>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>⚡ {t.statusTitle}</h2>
        <div
          style={{
            padding: 14,
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            background: "#f9fafb",
            fontWeight: 500,
          }}
          dangerouslySetInnerHTML={{ __html: state }}
        />
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>📚 {t.whatTitle}</h2>
        <ul style={{ listStyle: "disc", paddingLeft: 20, color: "#111" }}>
          {t.whatList.map((s, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: s }} />
          ))}
        </ul>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>⚙️ {t.extrasTitle}</h2>
        <ul style={{ listStyle: "disc", paddingLeft: 20, color: "#111" }}>
          {t.extrasList.map((s, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: s }} />
          ))}
        </ul>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>🔍 {t.verifyTitle}</h2>
        <p dangerouslySetInnerHTML={{ __html: t.verifyText }} />
      </section>

      <footer style={{ marginTop: 40, fontSize: 14, color: "#6b7280" }}>
        Schema Advanced &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
