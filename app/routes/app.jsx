// app/routes/app.jsx
import { Outlet, Link, useLocation, useSearchParams } from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";

/** i18n básico */
const STRINGS = {
  en: {
    appName: "Schema Advanced",
    menuPanel: "Panel",
    menuProducts: "Products",
    menuSettings: "Settings",
    language: "Language",
  },
  es: {
    appName: "Schema Advanced",
    menuPanel: "Panel",
    menuProducts: "Productos",
    menuSettings: "Ajustes",
    language: "Idioma",
  },
  pt: {
    appName: "Schema Advanced",
    menuPanel: "Painel",
    menuProducts: "Produtos",
    menuSettings: "Configurações",
    language: "Idioma",
  },
};

function detectLangFromNavigator() {
  try {
    const nav = (typeof navigator !== "undefined" && navigator.language) || "en";
    const two = String(nav).slice(0, 2).toLowerCase();
    return ["es", "pt"].includes(two) ? two : "en";
  } catch {
    return "en";
  }
}

function useLang() {
  const [sp] = useSearchParams();
  const fromQuery = sp.get("lang");
  const [lang, setLang] = useState(() => {
    if (fromQuery && ["es", "en", "pt"].includes(fromQuery)) {
      if (typeof window !== "undefined") localStorage.setItem("sae_lang", fromQuery);
      return fromQuery;
    }
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sae_lang");
      if (stored && ["es", "en", "pt"].includes(stored)) return stored;
    }
    return detectLangFromNavigator();
  });

  useEffect(() => {
    if (fromQuery && ["es", "en", "pt"].includes(fromQuery) && fromQuery !== lang) {
      setLang(fromQuery);
    }
  }, [fromQuery, lang]);

  const t = useMemo(() => STRINGS[lang] || STRINGS.en, [lang]);
  const setAndPersist = (value) => {
    setLang(value);
    try { localStorage.setItem("sae_lang", value); } catch {}
  };
  return { lang, t, setLang: setAndPersist };
}

export default function AppLayout() {
  const location = useLocation();
  const { lang, t, setLang } = useLang();

  const NavLink = ({ to, children }) => (
    <Link
      to={`${to}${to.includes("?") ? "&" : "?"}lang=${lang}`}
      prefetch="intent"
      style={{
        display: "block",
        padding: "10px 12px",
        borderRadius: 8,
        textDecoration: "none",
        background: location.pathname === to ? "#eef2ff" : "transparent",
        color: "#111",
        marginBottom: 6,
        border: "1px solid #e5e7eb",
      }}
    >
      {children}
    </Link>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <aside style={{ padding: 16, borderRight: "1px solid #e5e7eb", background: "#fafafa" }}>
        <h2 style={{ margin: "6px 0 12px 0", fontSize: 16 }}>{t.appName}</h2>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>
            {t.language}
          </label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb" }}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="pt">Português</option>
          </select>
        </div>

        <nav>
          <NavLink to="/app">{t.menuPanel}</NavLink>
          <NavLink to="/app/products">{t.menuProducts}</NavLink>
          <NavLink to="/app/settings">{t.menuSettings}</NavLink>
        </nav>
      </aside>
      <main style={{ padding: 20 }}>
        {/* Propagamos el idioma a las subrutas vía contexto sencillo */}
        <Outlet context={{ lang }} />
      </main>
    </div>
  );
}
