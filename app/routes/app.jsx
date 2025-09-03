
// app/routes/app.jsx
import { Outlet, NavLink, useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";

/**
 * Layout padre de /app:
 * - ÚNICA barra lateral con pestañas (Panel, Products, Collections, Pages, Blog, Global, Suppressor, Settings)
 * - Selector de idioma ES/EN/PT (propaga via <Outlet context={{lang}} />)
 * - Botón "Open theme editor" robusto (host base64url → myshopify/admin o admin.shopify.com/store/...),
 *   con fallbacks a ?shop= y a /admin/ relativo.
 * - Enlaces Support / Terms / Privacy en la sidebar.
 */

export default function AppLayout() {
  const [sp] = useSearchParams();
  const initial = sp.get("lang") || "es";
  const [lang, setLang] = useState(["es", "en", "pt"].includes(initial) ? initial : "es");

  // Mantener ?lang= en la URL cuando el usuario cambie el idioma
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    q.set("lang", lang);
    window.history.replaceState({}, "", `?${q.toString()}`);
  }, [lang]);

  function navBtn(isActive) {
    return {
      display: "block",
      padding: "8px 10px",
      borderRadius: 8,
      border: "1px solid " + (isActive ? "#111827" : "#d1d5db"),
      background: isActive ? "#111827" : "#fff",
      color: isActive ? "#fff" : "#111827",
      fontWeight: 600,
      textDecoration: "none",
    };
  }

  // Abrir editor de temas: soporta host admin.shopify.com y {shop}.myshopify.com/admin
  const openThemeEditor = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const hostParam = params.get("host");

      if (hostParam) {
        // base64url -> base64
        let b64 = hostParam.replace(/-/g, "+").replace(/_/g, "/");
        while (b64.length % 4) b64 += "=";

        let decoded = "";
        try {
          decoded = atob(b64); // ejemplos: "shop.myshopify.com/admin" o "admin.shopify.com/store/xxxx"
        } catch {}

        if (decoded) {
          // Caso 1: admin.shopify.com/store/{store-id}
          const storeMatch = decoded.match(/admin\.shopify\.com\/store\/([^/?#]+)/i);
          if (storeMatch) {
            const store = storeMatch[1];
            (window.top || window).location.href =
              `https://admin.shopify.com/store/${store}/themes/current/editor?context=apps`;
            return;
          }

          // Caso 2: {shop}.myshopify.com/admin
          if (/myshopify\.com\/admin/i.test(decoded)) {
            const base = decoded.replace(/\/admin.*/i, "/admin").replace(/\/$/, "");
            (window.top || window).location.href =
              `https://${base}/themes/current/editor?context=apps`;
            return;
          }
        }
      }

      // Fallback con ?shop= o window.Shopify.shop
      const shop =
        params.get("shop") ||
        (typeof window !== "undefined" && window.Shopify && window.Shopify.shop) ||
        "";
      if (shop) {
        (window.top || window).location.href =
          `https://${shop}/admin/themes/current/editor?context=apps`;
        return;
      }

      // Último recurso: relativo (si ya estás en admin)
      (window.top || window).location.href = "/admin/themes/current/editor?context=apps";
    } catch {
      alert("No pude abrir el editor. Abre la app desde el Admin (URL con ?host=...) o añade ?shop=tu-tienda.myshopify.com.");
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16, maxWidth: 1200, margin: "0 auto", padding: 12 }}>
      {/* === BARRA LATERAL ÚNICA === */}
      <aside style={{ borderRight: "1px solid #e5e7eb", paddingRight: 12 }}>
        <h2 style={{ fontSize: 16, margin: "6px 0 10px" }}>Schema Advanced</h2>

        <label style={{ display: "block", fontSize: 12, marginBottom: 8 }}>
          {lang === "es" ? "Idioma" : lang === "pt" ? "Idioma" : "Language"}
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            style={{ display: "block", marginTop: 4, padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: 6, width: "100%" }}
          >
            <option value="es">Español</option>
            <option value="en">English</option>
            <option value="pt">Português</option>
          </select>
        </label>

        <nav style={{ display: "grid", gap: 6, marginTop: 10 }}>
          <NavLink end to="." style={({ isActive }) => navBtn(isActive)}>{lang==="pt"?"Painel":lang==="en"?"Panel":"Panel"}</NavLink>
          <NavLink to="products" style={({ isActive }) => navBtn(isActive)}>{lang==="pt"?"Produtos":lang==="en"?"Products":"Productos"}</NavLink>
          <NavLink to="collections" style={({ isActive }) => navBtn(isActive)}>{lang==="pt"?"Coleções":lang==="en"?"Collections":"Colecciones"}</NavLink>
          <NavLink to="pages" style={({ isActive }) => navBtn(isActive)}>{lang==="pt"?"Páginas":lang==="en"?"Pages":"Páginas"}</NavLink>
          <NavLink to="blog" style={({ isActive }) => navBtn(isActive)}>{lang==="pt"?"Blog / Artigos":"Blog / Articles"}</NavLink>
          <NavLink to="global" style={({ isActive }) => navBtn(isActive)}>{lang==="pt"?"Global":"Global"}</NavLink>
          <NavLink to="suppressor" style={({ isActive }) => navBtn(isActive)}>{lang==="pt"?"Supressor JSON-LD":lang==="en"?"JSON-LD Suppressor":"Supresor JSON-LD"}</NavLink>
          <NavLink to="settings" style={({ isActive }) => navBtn(isActive)}>{lang==="pt"?"Configurações":lang==="en"?"Settings":"Ajustes"}</NavLink>
        </nav>

        <button
          onClick={openThemeEditor}
          style={{ marginTop: 12, padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 8, background: "#111827", color: "#fff", fontWeight: 700 }}
        >
          {lang === "pt" ? "Abrir editor do tema" : lang === "en" ? "Open theme editor" : "Abrir editor de temas"}
        </button>

        {/* Enlaces legales/soporte */}
        <div style={{ marginTop: 14, fontSize: 12 }}>
          <div><a href="/support" target="_blank" rel="noreferrer">Support</a></div>
          <div><a href="/terms" target="_blank" rel="noreferrer">Terms</a></div>
          <div><a href="/privacy" target="_blank" rel="noreferrer">Privacy</a></div>
        </div>
      </aside>

      {/* === CONTENIDO === */}
      <main>
        {/* Pasamos el idioma a las rutas hijas */}
        <Outlet context={{ lang }} />
      </main>
    </div>
  );
}
