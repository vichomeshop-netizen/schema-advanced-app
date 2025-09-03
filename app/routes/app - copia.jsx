// app/routes/app.jsx
import { Outlet, NavLink, useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";

/**
 * Layout padre de /app:
 * - ÚNICA barra lateral con pestañas (Overview, Panel, Products, Collections, Pages, Blog, Global, Suppressor, Settings)
 * - Selector de idioma ES/EN/PT (propaga via <Outlet context={{lang}} />)
 * - Botón "Open theme editor" robusto:
 *   - Decodifica host base64url → "admin.shopify.com/store/..." o "{shop}.myshopify.com/admin"
 *   - Construye la URL del editor en ambos casos
 *   - Navega en _top mediante <a target="_top"> (evita bloqueos por iframe)
 *   - Fallbacks: ?shop=, window.Shopify.shop, y ruta relativa /admin
 * - Enlaces Support / Terms / Privacy en la sidebar.
 */

function decodeHostB64Url(hostParam) {
  if (!hostParam) return "";
  try {
    let b64 = hostParam.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    return atob(b64) || "";
  } catch {
    return "";
  }
}

function buildThemeEditorUrl() {
  const params = new URLSearchParams(window.location.search);
  const hostParam = params.get("host") || "";
  const decoded = decodeHostB64Url(hostParam); // ej.: "admin.shopify.com/store/xxxx" o "shop.myshopify.com/admin"

  // Caso A: admin.shopify.com/store/{store}
  const m1 = decoded.match(/admin\.shopify\.com\/store\/([^\/?#]+)/i);
  if (m1 && m1[1]) {
    return `https://admin.shopify.com/store/${m1[1]}/themes/current/editor?context=apps`;
  }

  // Caso B: {shop}.myshopify.com/admin
  const m2 = decoded.match(/([^\/]+\.myshopify\.com)\/admin/i);
  if (m2 && m2[1]) {
    return `https://${m2[1]}/admin/themes/current/editor?context=apps`;
  }

  // Fallbacks con ?shop= o window.Shopify.shop
  const shop =
    params.get("shop") ||
    (typeof window !== "undefined" && window.Shopify && window.Shopify.shop) ||
    "";

  if (shop) {
    return `https://${shop}/admin/themes/current/editor?context=apps`;
  }

  // Último recurso (si ya estás dentro del admin)
  return `/admin/themes/current/editor?context=apps`;
}

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

  // Abrir editor de temas: robusto y compatible con iframe del Admin
  const openThemeEditor = () => {
    try {
      const url = buildThemeEditorUrl();

      // Navegación segura fuera del iframe:
      const a = document.createElement("a");
      a.href = url;
      a.target = "_top";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Open theme editor failed:", err);
      alert(
        "No pude abrir el editor.\nAbre la app desde el Admin (URL con ?host=...) o añade ?shop=tu-tienda.myshopify.com."
      );
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "240px 1fr",
        gap: 16,
        maxWidth: 1200,
        margin: "0 auto",
        padding: 12,
      }}
    >
      {/* === BARRA LATERAL ÚNICA === */}
      <aside style={{ borderRight: "1px solid #e5e7eb", paddingRight: 12 }}>
        <h2 style={{ fontSize: 16, margin: "6px 0 10px" }}>Schema Advanced</h2>

        <label style={{ display: "block", fontSize: 12, marginBottom: 8 }}>
          {lang === "en" ? "Language" : "Idioma"}
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            style={{
              display: "block",
              marginTop: 4,
              padding: "6px 8px",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              width: "100%",
            }}
          >
            <option value="es">Español</option>
            <option value="en">English</option>
            <option value="pt">Português</option>
          </select>
        </label>

        <nav style={{ display: "grid", gap: 6, marginTop: 10 }}>
          {/* Nueva pestaña: Overview */}
          <NavLink to="overview" style={({ isActive }) => navBtn(isActive)}>
            {lang === "pt" ? "Visão geral" : lang === "en" ? "Overview" : "Overview"}
          </NavLink>

          <NavLink end to="." style={({ isActive }) => navBtn(isActive)}>
            {lang === "pt" ? "Painel" : lang === "en" ? "Panel" : "Panel"}
          </NavLink>
          <NavLink to="products" style={({ isActive }) => navBtn(isActive)}>
            {lang === "pt" ? "Produtos" : lang === "en" ? "Products" : "Productos"}
          </NavLink>
          <NavLink to="collections" style={({ isActive }) => navBtn(isActive)}>
            {lang === "pt" ? "Coleções" : lang === "en" ? "Collections" : "Colecciones"}
          </NavLink>
          <NavLink to="pages" style={({ isActive }) => navBtn(isActive)}>
            {lang === "pt" ? "Páginas" : lang === "en" ? "Pages" : "Páginas"}
          </NavLink>
          <NavLink to="blog" style={({ isActive }) => navBtn(isActive)}>
            {lang === "pt" ? "Blog / Artigos" : lang === "en" ? "Blog / Articles" : "Blog / Artículos"}
          </NavLink>
          <NavLink to="global" style={({ isActive }) => navBtn(isActive)}>
            {lang === "pt" ? "Global" : "Global"}
          </NavLink>
          <NavLink to="suppressor" style={({ isActive }) => navBtn(isActive)}>
            {lang === "pt" ? "Supressor JSON-LD" : lang === "en" ? "JSON-LD Suppressor" : "Supresor JSON-LD"}
          </NavLink>
          <NavLink to="settings" style={({ isActive }) => navBtn(isActive)}>
            {lang === "pt" ? "Configurações" : lang === "en" ? "Settings" : "Ajustes"}
          </NavLink>
        </nav>

        <button
          onClick={openThemeEditor}
          style={{
            marginTop: 12,
            padding: "8px 10px",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            background: "#111827",
            color: "#fff",
            fontWeight: 700,
          }}
        >
          {lang === "pt" ? "Abrir editor do tema" : lang === "en" ? "Open theme editor" : "Abrir editor de temas"}
        </button>

        {/* Enlaces legales/soporte */}
        <div style={{ marginTop: 14, fontSize: 12 }}>
          <div>
            <a href="/support" target="_blank" rel="noreferrer">
              Support
            </a>
          </div>
          <div>
            <a href="/terms" target="_blank" rel="noreferrer">
              Terms
            </a>
          </div>
          <div>
            <a href="/privacy" target="_blank" rel="noreferrer">
              Privacy
            </a>
          </div>
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

