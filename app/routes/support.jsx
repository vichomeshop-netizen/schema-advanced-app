
// app/routes/support.jsx
import { useEffect, useState } from "react";
import { useSearchParams } from "@remix-run/react";

const EMAIL = "soporte@vichome.es";

const STR = {
  en: {
    h1: "Support",
    subtitle: "How can we help?",
    checklist: "Quick checklist",
    items: [
      "Online Store → Themes → <strong>Customize</strong> → tab <strong>App embeds</strong> → enable <em>Schema Advanced</em>.",
      'Open your storefront and validate JSON-LD with <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">Rich Results Test</a>.',
      "Set product GTIN/MPN/SKU in variants or metafields if needed.",
    ],
    contactTitle: "Contact",
    contactText: `Write us at <a href="mailto:${EMAIL}">${EMAIL}</a> with your shop URL and a brief description.`,
    footer: { privacy: "Privacy", terms: "Terms", support: "Support" },
    lang: "Language",
  },
  es: {
    h1: "Soporte",
    subtitle: "¿En qué podemos ayudarte?",
    checklist: "Checklist rápido",
    items: [
      "Online Store → Themes → <strong>Customize</strong> → pestaña <strong>App embeds</strong> → activa <em>Schema Advanced</em>.",
      'Abre tu storefront y valida el JSON-LD con la <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">Prueba de resultados enriquecidos</a>.',
      "Define GTIN/MPN/SKU en variantes o metafields si hace falta.",
    ],
    contactTitle: "Contacto",
    contactText: `Escríbenos a <a href="mailto:${EMAIL}">${EMAIL}</a> con la URL de tu tienda y una breve descripción.`,
    footer: { privacy: "Privacidad", terms: "Términos", support: "Soporte" },
    lang: "Idioma",
  },
  pt: {
    h1: "Suporte",
    subtitle: "Como podemos ajudar?",
    checklist: "Checklist rápido",
    items: [
      "Online Store → Themes → <strong>Customize</strong> → aba <strong>App embeds</strong> → ative <em>Schema Advanced</em>.",
      'Abra o storefront e valide o JSON-LD com o <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">Rich Results Test</a>.',
      "Defina GTIN/MPN/SKU nas variações ou metafields, se necessário.",
    ],
    contactTitle: "Contato",
    contactText: `Escreva para <a href="mailto:${EMAIL}">${EMAIL}</a> com a URL da loja e uma breve descrição.`,
    footer: { privacy: "Privacidade", terms: "Termos", support: "Suporte" },
    lang: "Idioma",
  },
};

function useLang() {
  const [sp] = useSearchParams();
  const q = sp.get("lang");
  const allowed = (v) => ["es", "en", "pt"].includes(v);
  // Inicial: solo URL o 'en' (no tocar localStorage en SSR)
  const [lang, setLang] = useState(allowed(q) ? q : "en");

  // Hidratar desde localStorage tras montar
  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("sae_lang") : null;
      if (!allowed(q) && allowed(stored) && stored !== lang) setLang(stored);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persistir y sincronizar ?lang=
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("sae_lang", lang);
        const nsp = new URLSearchParams(window.location.search);
        nsp.set("lang", lang);
        window.history.replaceState({}, "", `?${nsp.toString()}`);
      }
    } catch {}
  }, [lang]);

  return { lang, setLang, t: STR[lang] || STR.en };
}

export default function Support() {
  const { lang, setLang, t } = useLang();
  const withLang = (p) => `${p}${p.includes("?") ? "&" : "?"}lang=${lang}`;

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", lineHeight: 1.6, padding: "2rem", maxWidth: 860, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>{t.h1}</h1>
        <label style={{ fontSize: 12, color: "#6b7280" }}>
          {t.lang}{" "}
          <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ marginLeft: 6 }}>
            <option value="en">EN</option>
            <option value="es">ES</option>
            <option value="pt">PT</option>
          </select>
        </label>
      </div>

      <p style={{ color: "#6b7280", marginBottom: 24 }}>{t.subtitle}</p>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>{t.checklist}</h2>
        <ul style={{ paddingLeft: 20 }}>
          {t.items.map((it, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: it }} />
          ))}
        </ul>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>{t.contactTitle}</h2>
        <p dangerouslySetInnerHTML={{ __html: t.contactText }} />
      </section>

      <footer style={{ marginTop: 32, color: "#6b7280" }}>
        <a href={withLang("/privacy")}> {t.footer.privacy}</a> ·{" "}
        <a href={withLang("/terms")}> {t.footer.terms}</a> ·{" "}
        <a href={withLang("/support")}> {t.footer.support}</a>
      </footer>
    </main>
  );
}
