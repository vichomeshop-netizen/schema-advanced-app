// app/routes/app._index.jsx
import { useEffect, useState } from "react";
import { useOutletContext, useSearchParams } from "@remix-run/react";

const STRINGS = {
  en: {
    title: "Schema Advanced — Quick Guide",
    intro:
      'This app injects optimized <code>JSON-LD</code> into your Shopify store so search engines can understand your business and show rich results.',
    stepsTitle: "Getting started",
    steps: [
      "Go to Online Store → Themes → <strong>Customize</strong>",
      "Open the <strong>App embeds</strong> tab",
      "Enable <strong>Schema Advanced</strong> and save",
      'Open your storefront: you should see <code>data-sae="1"</code> inside the JSON-LD (optional check)',
      "Confirm the status below turns to ✅ Active",
    ],
    statusTitle: "Quick status",
    statusChecking: "⏳ Checking…",
    statusOk: "✅ Schema Advanced active",
    statusWarnNoSignal: "⚠️ No confirmation received from the storefront",
    retry: "Retry",
    whatTitle: "What schemas are added?",
    whatIntro:
      "Out of the box, Schema Advanced emits a complete set of JSON-LD entities designed for high-quality rich results.",
    whatList: [
      "<strong>Organization</strong>, <strong>WebSite</strong>, <strong>BreadcrumbList</strong>, <strong>CollectionPage</strong>, <strong>FAQPage</strong>, <strong>Product</strong>, <strong>AggregateOffer</strong>, <strong>AggregateRating</strong>, <strong>BlogPosting</strong>, <strong>HowTo</strong>, <strong>ContactPage</strong>, <strong>AboutPage</strong>",
    ],
    advancedTitle: "Technical details for advanced users",
    advancedBullets: [
      "<strong>Language</strong>: sets <code>inLanguage</code> automatically (EN/ES/PT) or per setting.",
      "<strong>Product</strong>: emits Brand, SKU/MPN, GTIN8/12/13/14; single variant → <code>Offer</code>, multi-variant → <code>AggregateOffer</code> with <code>lowPrice</code>/<code>highPrice</code>.",
      "<strong>Shipping</strong>: structured <code>OfferShippingDetails</code> with handling/transit and optional <code>shippingRate</code>.",
      "<strong>Returns</strong>: <code>MerchantReturnPolicy</code> with configurable days, method and fees.",
      "<strong>Reviews</strong>: adds <code>AggregateRating</code> when metafields provide rating value/count.",
      "<strong>Collections</strong>: <code>CollectionPage</code> + optional <code>FAQPage</code> from metafields/metaobjects.",
      "<strong>Articles</strong>: <code>BlogPosting</code> + optional <code>HowTo</code> auto-generated from H2 blocks (≥ 2).",
      "<strong>Suppressor</strong>: removes overlapping theme JSON-LD (keeps only app-emitted scripts tagged with <code>data-sae</code>).",
      "<strong>IDs</strong>: uses canonical <code>@id</code> anchors (e.g. <code>#org</code>, <code>#product</code>, <code>#website</code>).",
    ],
    extrasTitle: "Extras",
    extrasList: [
      "<strong>Theme JSON-LD suppressor</strong>: removes duplicates",
      "<strong>Auto language</strong>: EN/ES/PT aware for <code>inLanguage</code>",
      "<strong>Return policy</strong>: driven by your settings",
    ],
    verifyTitle: "Verification",
    verifyText:
      'Use Google’s <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">Rich Results Test</a> to validate your structured data.',
    helpTitle: "Help & legal",
    helpLinks: { support: "Support", privacy: "Privacy Policy", terms: "Terms of Service" },
    troubleshootingTitle: "Troubleshooting",
    troubleshooting: [
      "Ensure the App embed is enabled and saved in the Theme Editor.",
      "If your theme injects its own JSON-LD, enable the suppressor in the app embed settings.",
      "Clear cache or test in a private window if the status does not refresh.",
    ],
    openEditor: "Open theme editor",
  },
  es: {
    title: "Schema Advanced — Guía rápida",
    intro:
      "Esta app inyecta <code>JSON-LD</code> optimizado en tu tienda Shopify para que los buscadores entiendan tu negocio y muestren resultados enriquecidos.",
    stepsTitle: "Pasos de uso",
    steps: [
      "Ve a Online Store → Themes → <strong>Customize</strong>",
      "Abre la pestaña <strong>App embeds</strong>",
      "Activa <strong>Schema Advanced</strong> y guarda",
      'Abre tu storefront: deberías ver <code>data-sae="1"</code> dentro del JSON-LD (comprobación opcional)',
      "Confirma que el estado de abajo cambia a ✅ Activo",
    ],
    statusTitle: "Estado rápido",
    statusChecking: "⏳ Comprobando…",
    statusOk: "✅ Schema Advanced activo",
    statusWarnNoSignal: "⚠️ No se recibió confirmación del storefront",
    retry: "Reintentar",
    whatTitle: "¿Qué schemas añade?",
    whatIntro:
      "De forma predeterminada, Schema Advanced emite un conjunto completo de entidades JSON-LD orientadas a rich results de alta calidad.",
    whatList: [
      "<strong>Organization</strong>, <strong>WebSite</strong>, <strong>BreadcrumbList</strong>, <strong>CollectionPage</strong>, <strong>FAQPage</strong>, <strong>Product</strong>, <strong>AggregateOffer</strong>, <strong>AggregateRating</strong>, <strong>BlogPosting</strong>, <strong>HowTo</strong>, <strong>ContactPage</strong>, <strong>AboutPage</strong>",
    ],
    advancedTitle: "Detalles técnicos para usuarios avanzados",
    advancedBullets: [
      "<strong>Idioma</strong>: ajusta <code>inLanguage</code> automáticamente (ES/EN/PT) o por configuración.",
      "<strong>Producto</strong>: emite Brand, SKU/MPN, GTIN8/12/13/14; variante única → <code>Offer</code>, múltiples → <code>AggregateOffer</code> con <code>lowPrice</code>/<code>highPrice</code>.",
      "<strong>Envíos</strong>: <code>OfferShippingDetails</code> estructurado con handling/transit y <code>shippingRate</code> opcional.",
      "<strong>Devoluciones</strong>: <code>MerchantReturnPolicy</code> con días, método y tasas configurables.",
      "<strong>Reseñas</strong>: añade <code>AggregateRating</code> cuando los metafields aportan rating value/count.",
      "<strong>Colecciones</strong>: <code>CollectionPage</code> + <code>FAQPage</code> opcional desde metafields/metaobjetos.",
      "<strong>Artículos</strong>: <code>BlogPosting</code> + <code>HowTo</code> opcional generado desde H2 (≥ 2).",
      "<strong>Supresor</strong>: elimina JSON-LD del tema que se solape (mantiene scripts de la app con <code>data-sae</code>).",
      "<strong>IDs</strong>: usa anclas canónicas <code>@id</code> (p. ej. <code>#org</code>, <code>#product</code>, <code>#website</code>).",
    ],
    extrasTitle: "Extras",
    extrasList: [
      "<strong>Supresor del JSON-LD del tema</strong>: elimina duplicados",
      "<strong>Idioma automático</strong>: reconoce ES/EN/PT para <code>inLanguage</code>",
      "<strong>Política de devoluciones</strong>: controlada por tus ajustes",
    ],
    verifyTitle: "Verificación",
    verifyText:
      'Usa la <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">prueba de resultados enriquecidos</a> de Google para validar el marcado.',
    helpTitle: "Ayuda & legal",
    helpLinks: { support: "Soporte", privacy: "Política de privacidad", terms: "Términos del servicio" },
    troubleshootingTitle: "Solución de problemas",
    troubleshooting: [
      "Asegúrate de activar y guardar el App embed en el editor de temas.",
      "Si tu tema inyecta su propio JSON-LD, activa el supresor en los ajustes del embed.",
      "Borra caché o prueba en una ventana privada si el estado no se actualiza.",
    ],
    openEditor: "Abrir editor de temas",
  },
  pt: {
    title: "Schema Advanced — Guia rápida",
    intro:
      'Este app injeta <code>JSON-LD</code> otimizado na sua loja Shopify para que os motores de busca entendam o seu negócio e exibam rich results.',
    stepsTitle: "Como usar",
    steps: [
      "Vá para Online Store → Themes → <strong>Customize</strong>",
      "Abra a aba <strong>App embeds</strong>",
      "Ative <strong>Schema Advanced</strong> e salve",
      'Abra o storefront: você deve ver <code>data-sae="1"</code> dentro do JSON-LD (verificação opcional)',
      "Confirme que o estado abaixo muda para ✅ Ativo",
    ],
    statusTitle: "Estado rápido",
    statusChecking: "⏳ Verificando…",
    statusOk: "✅ Schema Advanced ativo",
    statusWarnNoSignal: "⚠️ Nenhuma confirmação recebida do storefront",
    retry: "Tentar novamente",
    whatTitle: "Quais schemas são adicionados?",
    whatIntro:
      "Por padrão, o Schema Advanced emite um conjunto completo de entidades JSON-LD projetadas para rich results de alta qualidade.",
    whatList: [
      "<strong>Organization</strong>, <strong>WebSite</strong>, <strong>BreadcrumbList</strong>, <strong>CollectionPage</strong>, <strong>FAQPage</strong>, <strong>Product</strong>, <strong>AggregateOffer</strong>, <strong>AggregateRating</strong>, <strong>BlogPosting</strong>, <strong>HowTo</strong>, <strong>ContactPage</strong>, <strong>AboutPage</strong>",
    ],
    advancedTitle: "Detalhes técnicos para usuários avançados",
    advancedBullets: [
      "<strong>Idioma</strong>: ajusta <code>inLanguage</code> automaticamente (PT/EN/ES) ou por configuração.",
      "<strong>Produto</strong>: emite Brand, SKU/MPN, GTIN8/12/13/14; variação única → <code>Offer</code>, múltiplas → <code>AggregateOffer</code> com <code>lowPrice</code>/<code>highPrice</code>.",
      "<strong>Envio</strong>: <code>OfferShippingDetails</code> com handling/transit e <code>shippingRate</code> opcional.",
      "<strong>Devoluções</strong>: <code>MerchantReturnPolicy</code> com dias, método e taxas configuráveis.",
      "<strong>Avaliações</strong>: adiciona <code>AggregateRating</code> quando os metafields fornecem rating value/count.",
      "<strong>Coleções</strong>: <code>CollectionPage</code> + <code>FAQPage</code> opcional a partir de metafields/metaobjects.",
      "<strong>Artigos</strong>: <code>BlogPosting</code> + <code>HowTo</code> opcional a partir de H2 (≥ 2).",
      "<strong>Supressor</strong>: remove JSON-LD do tema sobreposto (mantém scripts da app com <code>data-sae</code>).",
      "<strong>IDs</strong>: usa âncoras canônicas <code>@id</code> (ex.: <code>#org</code>, <code>#product</code>, <code>#website</code>).",
    ],
    extrasTitle: "Extras",
    extrasList: [
      "<strong>Supressor de JSON-LD do tema</strong>: remove duplicidades",
      "<strong>Idioma automático</strong>: reconhece PT/EN/ES para <code>inLanguage</code>",
      "<strong>Política de devoluções</strong>: definida pelas suas configurações",
    ],
    verifyTitle: "Verificação",
    verifyText:
      'Use o <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">Rich Results Test</a> do Google para validar o marcado.',
    helpTitle: "Ajuda & legal",
    helpLinks: { support: "Suporte", privacy: "Política de privacidade", terms: "Termos de serviço" },
    troubleshootingTitle: "Solução de problemas",
    troubleshooting: [
      "Certifique-se de ativar e salvar o App embed no editor de temas.",
      "Se o tema injeta seu próprio JSON-LD, ative o supressor nas configurações do embed.",
      "Limpe o cache ou teste em janela privada se o estado não atualizar.",
    ],
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
  const [loading, setLoading] = useState(false);

  // ⚙️ Ping endurecido + cancelación segura
  const checkStatus = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/embed-ping", { method: "GET" });
      if (!r.ok) throw new Error(`Ping HTTP ${r.status}`);
      try { await r.json(); } catch { /* si no hay JSON, no rompemos */ }
      setState(t.statusOk);
    } catch (e) {
      console.error("[ping] failed:", e);
      setState(t.statusWarnNoSignal);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/embed-ping", { method: "GET" });
        if (!r.ok) throw new Error(`Ping HTTP ${r.status}`);
        try { await r.json(); } catch {}
        if (!cancelled) setState(t.statusOk);
      } catch (e) {
        console.error("[ping] failed:", e);
        if (!cancelled) setState(t.statusWarnNoSignal);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openThemeEditor = () => {
    if (typeof window !== "undefined") {
      window.top.location.href = "/admin/themes/current/editor?context=apps";
    }
  };

  // UI helpers
  const Card = ({ children }) => (
    <div style={{ padding: 14, border: "1px solid #e5e7eb", borderRadius: 10, background: "#fff" }}>{children}</div>
  );
  const Section = ({ title, children, emoji }) => (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 18, marginBottom: 10 }}>{emoji ? `${emoji} ` : ""}{title}</h2>
      {children}
    </section>
  );

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: 1.5 }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Schema Advanced</h1>
      <p style={{ marginBottom: 18, color: "#374151" }} dangerouslySetInnerHTML={{ __html: t.intro }} />

      <Section title={t.stepsTitle} emoji="📌">
        <ol style={{ paddingLeft: 20, color: "#111", marginBottom: 12 }}>
          {t.steps.map((s, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: s }} />
          ))}
        </ol>
        <button
          onClick={openThemeEditor}
          style={{
            marginTop: 6,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            cursor: "pointer",
          }}
        >
          {t.openEditor}
        </button>
      </Section>

      <Section title={t.statusTitle} emoji="⚡">
        <Card>
          <div dangerouslySetInnerHTML={{ __html: state }} />
          <div style={{ marginTop: 10 }}>
            <button
              onClick={checkStatus}
              disabled={loading}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                cursor: "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {t.retry}
            </button>
          </div>
        </Card>
      </Section>

      <Section title={t.whatTitle} emoji="📚">
        <p style={{ color: "#374151", marginBottom: 10 }} dangerouslySetInnerHTML={{ __html: t.whatIntro }} />
        <ul style={{ listStyle: "disc", paddingLeft: 20, color: "#111" }}>
          {t.whatList.map((s, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: s }} />
          ))}
        </ul>
      </Section>

      <Section title={t.advancedTitle} emoji="🧠">
        <ul style={{ listStyle: "disc", paddingLeft: 20, color: "#111" }}>
          {t.advancedBullets.map((s, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: s }} />
          ))}
        </ul>
      </Section>

      <Section title={t.extrasTitle} emoji="⚙️">
        <ul style={{ listStyle: "disc", paddingLeft: 20, color: "#111" }}>
          {t.extrasList.map((s, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: s }} />
          ))}
        </ul>
      </Section>

      <Section title={t.verifyTitle} emoji="🔍">
        <p dangerouslySetInnerHTML={{ __html: t.verifyText }} />
      </Section>

      <Section title={t.helpTitle} emoji="🧭">
        <ul style={{ listStyle: "disc", paddingLeft: 20 }}>
          <li><a href="/support" target="_blank" rel="noreferrer">{t.helpLinks.support}</a></li>
          <li><a href="/privacy" target="_blank" rel="noreferrer">{t.helpLinks.privacy}</a></li>
          <li><a href="/terms" target="_blank" rel="noreferrer">{t.helpLinks.terms}</a></li>
        </ul>
      </Section>

      <Section title={t.troubleshootingTitle} emoji="🛠️">
        <ul style={{ listStyle: "disc", paddingLeft: 20 }}>
          {t.troubleshooting.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      </Section>

      <footer style={{ marginTop: 20, fontSize: 13, color: "#6b7280" }}>
        Schema Advanced &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
