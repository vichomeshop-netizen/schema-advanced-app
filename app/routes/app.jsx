// app/routes/app.jsx
import { Outlet, NavLink, useSearchParams, useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { json, redirect } from "@remix-run/node";
import { prisma } from "~/lib/prisma.server";

const ADMIN_API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-10";
const LIVE_Q = `query { currentAppInstallation { activeSubscriptions { id name status } } }`;

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || null;
  if (!shop) throw json({ error: "missing shop" }, { status: 400 });

  const rec = await prisma.shop.findUnique({ where: { shop } });
  let status = rec?.subscriptionStatus ?? null;

  // Fallback: tras volver del checkout, valida en vivo y sincroniza si ya está ACTIVA
  if (status !== "ACTIVE" && rec?.accessToken) {
    try {
      const r = await fetch(`https://${shop}/admin/api/${ADMIN_API_VERSION}/graphql.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": rec.accessToken },
        body: JSON.stringify({ query: LIVE_Q }),
      });
      const data = await r.json();
      const sub = data?.data?.currentAppInstallation?.activeSubscriptions?.[0];
      if (sub?.status === "ACTIVE") {
        await prisma.shop.update({
          where: { shop },
          data: {
            subscriptionId: String(sub.id).replace(/^gid:\/\/shopify\/AppSubscription\//, ""),
            subscriptionStatus: sub.status,
            planName: sub.name,
          },
        });
        status = "ACTIVE";
      }
    } catch { /* ignore */ }
  }

  if (status !== "ACTIVE") {
    // Redirección automática a la pantalla de suscripción (GET soportado)
  const q = new URLSearchParams({ shop });
 const host = url.searchParams.get("host") || "";
 if (host) q.set("host", host);
 throw redirect(`/api/billing/start?${q.toString()}`);
  }

  return json({ shop, subscriptionStatus: status });
}

/**
 * Layout padre de /app (sin botones de billing):
 * - Sidebar único con pestañas
 * - Selector de idioma (propaga vía <Outlet context={{lang}} />)
 * - Botón "Open theme editor" robusto
 * - Conserva el query string al navegar
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
  const decoded = decodeHostB64Url(hostParam); // "admin.shopify.com/store/xxx" o "{shop}.myshopify.com/admin"

  const m1 = decoded.match(/admin\.shopify\.com\/store\/([^\/?#]+)/i);
  if (m1 && m1[1]) {
    return `https://admin.shopify.com/store/${m1[1]}/themes/current/editor?context=apps`;
  }

  const m2 = decoded.match(/([^\/]+\.myshopify\.com)\/admin/i);
  if (m2 && m2[1]) {
    return `https://${m2[1]}/admin/themes/current/editor?context=apps`;
  }

  const shop =
    params.get("shop") ||
    (typeof window !== "undefined" && window.Shopify && window.Shopify.shop) ||
    "";

  if (shop) {
    return `https://${shop}/admin/themes/current/editor?context=apps`;
  }

  return `/admin/themes/current/editor?context=apps`;
}

export default function AppLayout() {
  const [sp] = useSearchParams();
  const { search } = useLocation();
  const initial = sp.get("lang") || "es";
  const [lang, setLang] = useState(["es", "en", "pt"].includes(initial) ? initial : "es");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    q.set("lang", lang);
    window.history.replaceState({}, "", `?${q.toString()}`);
  }, [lang]);

  const toWithSearch = (pathname) => ({ pathname, search });

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

  const openThemeEditor = () => {
    try {
      const url = buildThemeEditorUrl();
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
          {lang === "en" ? "Language" : lang === "pt" ? "Idioma" : "Idioma"}
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
          <NavLink to={toWithSearch("overview")} style={({ isActive }) => navBtn(isActive)}>
            {lang === "pt" ? "Visão geral" : lang === "en" ? "Overview" : "Overview"}
          </NavLink>

          <NavLink end to={toWithSearch(".")} style={({ isActive }) => navBtn(isActive)}>
            {lang === "pt" ? "Painel" : lang === "en" ? "Panel" : "Panel"}
          </NavLink>

          <NavLink to={toWithSearch("products")} style={({ isActive }) => navBtn(isActive)}>
            {lang === "pt" ? "Produtos" : lang === "en" ? "Products" : "Productos"}
          </NavLink>

          <NavLink to={toWithSearch("collections")} style={({ isActive }) => navBtn(isActive)}>
            {lang === "pt" ? "Coleções" : lang === "en" ? "Collections" : "Colecciones"}
          </NavLink>

          <NavLink to={toWithSearch("pages")} style={({ isActive }) => navBtn(isActive)}>
            {lang === "pt" ? "Páginas" : lang === "en" ? "Pages" : "Páginas"}
          </NavLink>

          <NavLink to={toWithSearch("blog")} style={({ isActive }) => navBtn(isActive)}>
            {lang === "pt" ? "Blog / Artigos" : lang === "en" ? "Blog / Articles" : "Blog / Artículos"}
          </NavLink>

          <NavLink to={toWithSearch("global")} style={({ isActive }) => navBtn(isActive)}>
            {lang === "pt" ? "Global" : "Global"}
          </NavLink>

          <NavLink to={toWithSearch("suppressor")} style={({ isActive }) => navBtn(isActive)}>
            {lang === "pt" ? "Supressor JSON-LD" : lang === "en" ? "JSON-LD Suppressor" : "Supresor JSON-LD"}
          </NavLink>

          <NavLink to={toWithSearch("settings")} style={({ isActive }) => navBtn(isActive)}>
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

        <div style={{ marginTop: 14, fontSize: 12 }}>
          <div><a href="/support" target="_blank" rel="noreferrer">Support</a></div>
          <div><a href="/terms" target="_blank" rel="noreferrer">Terms</a></div>
          <div><a href="/privacy" target="_blank" rel="noreferrer">Privacy</a></div>
        </div>
      </aside>

      {/* === CONTENIDO === */}
      <main>
        <Outlet context={{ lang }} />
      </main>
    </div>
  );
}



