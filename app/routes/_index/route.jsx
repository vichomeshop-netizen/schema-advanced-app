// app/routes/_index/route.jsx
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "@remix-run/react";

const STR = {
  en: {
    h1: "Schema Advanced",
    tagline: "JSON-LD for Shopify: rich results, better SEO and product visibility (EN/ES/PT).",
    what: "What does it do?",
    items: [
      "<strong>Organization</strong>, <strong>WebSite</strong>, <strong>BreadcrumbList</strong>",
      "<strong>Product</strong> with GTIN/MPN/SKU, variants (<strong>AggregateOffer</strong>), shipping & returns",
      "<strong>CollectionPage</strong>, <strong>FAQPage</strong>, <strong>BlogPosting</strong>, <strong>HowTo</strong>, <strong>ContactPage</strong>, <strong>AboutPage</strong>",
      "<strong>Theme JSON-LD suppressor</strong> (removes duplicates)",
      "Auto language (EN/ES/PT)",
    ],
    how: "How to use?",
    steps: [
      "Admin → Online Store → Themes → <strong>Customize</strong>",
      "Tab <strong>App embeds</strong> → enable <strong>Schema Advanced</strong> → Save",
      'Validate with <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">Rich Results Test</a>',
    ],
    login: "Log in with Shopify",
    lang: "Language",
    footer: { privacy: "Privacy", terms: "Terms", support: "Support" },
    placeholder: "your-shop.myshopify.com",
  },
  es: {
    h1: "Schema Advanced",
    tagline: "JSON-LD para Shopify: rich results, mejor SEO y visibilidad de productos (ES/EN/PT).",
    what: "¿Qué hace?",
    items: [
      "<strong>Organization</strong>, <strong>WebSite</strong>, <strong>BreadcrumbList</strong>",
      "<strong>Product</strong> con GTIN/MPN/SKU, variantes (<strong>AggregateOffer</strong>), envíos y devoluciones",
      "<strong>CollectionPage</strong>, <strong>FAQPage</strong>, <strong>BlogPosting</strong>, <strong>HowTo</strong>, <strong>ContactPage</strong>, <strong>AboutPage</strong>",
      "<strong>Supresor</strong> del JSON-LD del tema (evita duplicados)",
      "Idioma automático (ES/EN/PT)",
    ],
    how: "¿Cómo se usa?",
    steps: [
      "Admin → Online Store → Themes → <strong>Customize</strong>",
      "Pestaña <strong>App embeds</strong> → activa <strong>Schema Advanced</strong> → Guardar",
      'Valida con <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">Rich Results Test</a>',
    ],
    login: "Acceder con Shopify",
    lang: "Idioma",
    footer: { privacy: "Privacidad", terms: "Términos", support: "Soporte" },
    placeholder: "tu-tienda.myshopify.com",
  },
  pt: {
    h1: "Schema Advanced",
    tagline: "JSON-LD para Shopify: rich results, melhor SEO e visibilidade de produtos (PT/EN/ES).",
    what: "O que faz?",
    items: [
      "<strong>Organization</strong>, <strong>WebSite</strong>, <strong>BreadcrumbList</strong>",
      "<strong>Product</strong> com GTIN/MPN/SKU, variações (<strong>AggregateOffer</strong>), envio e devoluções",
      "<strong>CollectionPage</strong>, <strong>FAQPage</strong>, <strong>BlogPosting</strong>, <strong>HowTo</strong>, <strong>ContactPage</strong>, <strong>AboutPage</strong>",
      "<strong>Supressor</strong> do JSON-LD do tema (evita duplicidades)",
      "Idioma automático (PT/EN/ES)",
    ],
    how: "Como usar?",
    steps: [
      "Admin → Online Store → Themes → <strong>Customize</strong>",
      "Aba <strong>App embeds</strong> → ative <strong>Schema Advanced</strong> → Salvar",
      'Valide com <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">Rich Results Test</a>',
    ],
    login: "Entrar com Shopify",
    lang: "Idioma",
    footer: { privacy: "Privacidade", terms: "Termos", support: "Suporte" },
    placeholder: "sua-loja.myshopify.com",
  },
};

function detectLang(def = "en") {
  const nav = typeof navigator !== "undefined" ? (navigator.language || "").slice(0, 2) : "";
  if (["es", "pt", "en"].includes(nav)) return nav;
  return def;
}

export default function Landing() {
  const [sp] = useSearchParams();
  const q = sp.get("lang");
  const [lang, setLang] = useState(() => (q && ["es", "en", "pt"].includes(q) ? q : (localStorage.getItem("sae_lang") || detectLang())));
  const t = useMemo(() => STR[lang] || STR.en, [lang]);

  useEffect(() => { localStorage.setItem("sae_lang", lang); }, [lang]);

  const withLang = (path) => `${path}${path.includes("?") ? "&" : "?"}lang=${lang}`;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: 1.5, padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <header style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ fontSize: 32, margin: 0 }}>{t.h1}</h1>
          <label style={{ fontSize: 12, color: "#6b7280" }}>
            {t.lang}{" "}
            <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ marginLeft: 6 }}>
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="pt">PT</option>
            </select>
          </label>
        </div>
        <p style={{ fontSize: 18, color: "#374151", marginTop: 8 }} dangerouslySetInnerHTML={{ __html: t.tagline }} />
      </header>

      <form method="get" action="/auth/login" style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        <input type="hidden" name="lang" value={lang} />
        <input
          type="text" name="shop" placeholder={t.placeholder} required
          style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, minWidth: 280 }}
        />
        <button type="submit" style={{ padding: "10px 16px", borderRadius: 8, background: "#111827", color: "#fff", border: 0 }}>
          {t.login}
        </button>
      </form>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>{t.what}</h2>
        <ul style={{ paddingLeft: 20 }}>
          {t.items.map((it, i) => <li key={i} dangerouslySetInnerHTML={{ __html: it }} />)}
        </ul>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>{t.how}</h2>
        <ol style={{ paddingLeft: 20 }}>
          {t.steps.map((st, i) => <li key={i} dangerouslySetInnerHTML={{ __html: st }} />)}
        </ol>
      </section>

      <footer style={{ marginTop: 32, color: "#6b7280" }}>
        <a href={withLang("/privacy")}>{t.footer.privacy}</a> ·{" "}
        <a href={withLang("/terms")}>{t.footer.terms}</a> ·{" "}
        <a href={withLang("/support")}>{t.footer.support}</a>
      </footer>
    </div>
  );
}
