// app/routes/app.jsx
import { Outlet, NavLink, useSearchParams, useLocation, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { json, redirect } from "@remix-run/node";
import { Provider as AppBridgeProvider } from "@shopify/app-bridge-react";
import { prisma } from "~/lib/prisma.server";

const ADMIN_API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-07";
const LIVE_Q = `query { currentAppInstallation { activeSubscriptions { id name status } } }`;

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || null;
  const host = url.searchParams.get("host") || "";
  if (!shop) throw json({ error: "missing shop" }, { status: 400 });

  const rec = await prisma.shop.findUnique({ where: { shop } });

  // Sin token → si venimos del Admin (hay host), inicia OAuth automáticamente
  if (!rec?.accessToken) {
    if (host) {
      const toAuth = `/auth?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(host)}`;
      return redirect(toAuth);
    }
    // Fuera del Admin, muestra CTA de reinstalación
    return json({ state: "UNINSTALLED_OR_NO_TOKEN", shop, host, apiKey: process.env.SHOPIFY_API_KEY });
  }

  // Marcada como desinstalada
  if (rec.subscriptionStatus === "UNINSTALLED") {
    if (host) {
      const toAuth = `/auth?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(host)}`;
      return redirect(toAuth);
    }
    return json({ state: "UNINSTALLED", shop, host, apiKey: process.env.SHOPIFY_API_KEY });
  }

  // ¿Necesita billing?
  let needsBilling = rec.subscriptionStatus !== "ACTIVE";
  if (needsBilling) {
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
        needsBilling = false;
      }
    } catch {
      // ignora fallo; seguimos con lo persistido
    }
  }

  return json({ state: needsBilling ? "NEEDS_BILLING" : "OK", shop, host, apiKey: process.env.SHOPIFY_API_KEY });
}

/** Utilidades **/
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
  const decoded = decodeHostB64Url(hostParam);

  const m1 = decoded.match(/admin\.shopify\.com\/store\/([^\/?#]+)/i);
  if (m1 && m1[1]) return `https://admin.shopify.com/store/${m1[1]}/themes/current/editor?context=apps`;

  const m2 = decoded.match(/([^\/]+\.myshopify\.com)\/admin/i);
  if (m2 && m2[1]) return `https://${m2[1]}/admin/themes/current/editor?context=apps`;

  const shop =
    params.get("shop") ||
    (typeof window !== "undefined" && window.Shopify && window.Shopify.shop) ||
    "";

  return shop ? `https://${shop}/admin/themes/current/editor?context=apps` : `/admin/themes/current/editor?context=apps`;
}

export default function AppLayout() {
  const { state, shop, apiKey, host } = useLoaderData();
  const [sp] = useSearchParams();
  const { search } = useLocation();
  const initial = sp.get("lang") || "es";
  const [lang, setLang] = useState(["es", "en", "pt"].includes(initial) ? initial : "es");

  // Re-embed top-level si estamos fuera del iframe y tenemos host
  useEffect(() => {
    if (!apiKey || !host) return;
    if (typeof window === "undefined") return;
    if (window.top === window.self) {
      import("@shopify/app-bridge")
        .then(({ default: createApp }) => {
          createApp({ apiKey, host, forceRedirect: true });
        })
        .catch(() => {});
    }
  }, [apiKey, host]);

  // Billing (una sola vez por sesión)
  useEffect(() => {
    if (state !== "NEEDS_BILLING" || !shop) return;
    const key = `billing:${shop}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    (async () => {
      try {
        const { default: createApp } = await import("@shopify/app-bridge");
        const { Redirect } = await import("@shopify/app-bridge/actions");
        const app = createApp({ apiKey, host, forceRedirect: true });
        const redirect = Redirect.create(app);
        const url = `/api/billing/start?shop=${encodeURIComponent(shop)}${
          host ? `&host=${encodeURIComponent(host)}` : ""
        }`;
        redirect.dispatch(Redirect.Action.REMOTE, url);
        setTimeout(() => { if (window.top) window.top.location.href = url; }, 1200);
      } catch {
        const url = `/api/billing/start?shop=${encodeURIComponent(shop)}${
          host ? `&host=${encodeURIComponent(host)}` : ""
        }`;
        if (window.top) window.top.location.href = url;
      }
    })();
  }, [state, shop, host, apiKey]);

  if (state === "UNINSTALLED" || state === "UNINSTALLED_OR_NO_TOKEN") {
    const reinstall = `/auth?shop=${encodeURIComponent(shop || "")}`;
    return (
      <div style={{ padding: 16 }}>
        <h3>La app no está instalada en esta tienda.</h3>
        <p>
          Instálala de nuevo:{" "}
          <a href={reinstall} target="_top" rel="noreferrer">
            {reinstall}
          </a>
        </p>
      </div>
    );
  }

  if (state === "NEEDS_BILLING") {
    return <p style={{ padding: 16 }}>Redirigiendo a la suscripción…</p>;
  }

  // Mantener ?lang=
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    q.set("lang", lang);
    window.history.replaceState({}, "", `?${q.toString()}`);
  }, [lang]);

  const toWithSearch = (pathname) => ({ pathname, search });

  const linkStyle = (isActive) => ({
    display: "block",
    padding: "8px 10px",
    borderRadius: 8,
    border: isActive ? "1px solid #111827" : "1px solid #dfe3e8",
    background: isActive ? "#111827" : "#fff",
    color: isActive ? "#fff" : "#111827",
    fontWeight: 600,
    textDecoration: "none",
  });

  const openThemeEditor = () => {
    try {
      const url = buildThemeEditorUrl();
      const a = document.createElement("a");
      a.href = url; a.target = "_top"; a.rel = "noopener";
      document.body.appendChild(a); a.click(); a.remove();
    } catch (err) {
      console.error("Open theme editor failed:", err);
      alert("No pude abrir el editor.\nAbre la app desde el Admin (URL con ?host=...) o añade ?shop=tu-tienda.myshopify.com.");
    }
  };

  // 👇 Monta App Bridge Provider SOLO en cliente para evitar “shopify global is not defined”
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  if (!isClient) return null;

  if (!apiKey || !host) {
    return (
      <div style={{ padding: 16 }}>
        Falta <code>host</code> o <code>apiKey</code>. Abre la app desde el Admin de Shopify para inicializar App Bridge.
      </div>
    );
  }

  return (
    <AppBridgeProvider config={{ apiKey, host, forceRedirect: true }}>
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
        {/* Sidebar tipo Shopify Admin */}
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
                background: "#fff",
              }}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </label>

          <nav style={{ display: "grid", gap: 6, marginTop: 10 }}>
            {/* Overview = índice de /app */}
            <NavLink end to={toWithSearch(".")} style={({ isActive }) => linkStyle(isActive)}>
              {lang === "pt" ? "Visão geral" : lang === "en" ? "Overview" : "Overview"}
            </NavLink>

            <NavLink to={toWithSearch("products")} style={({ isActive }) => linkStyle(isActive)}>
              {lang === "pt" ? "Produtos" : lang === "en" ? "Products" : "Productos"}
            </NavLink>

            <NavLink to={toWithSearch("collections")} style={({ isActive }) => linkStyle(isActive)}>
              {lang === "pt" ? "Coleções" : lang === "en" ? "Collections" : "Colecciones"}
            </NavLink>

            <NavLink to={toWithSearch("pages")} style={({ isActive }) => linkStyle(isActive)}>
              {lang === "pt" ? "Páginas" : lang === "en" ? "Pages" : "Páginas"}
            </NavLink>

            <NavLink to={toWithSearch("localbusiness")} style={({ isActive }) => linkStyle(isActive)}>
              {lang === "pt" ? "Negócio local" : lang === "en" ? "Local business" : "Negocio local"}
            </NavLink>

            <NavLink to={toWithSearch("blog")} style={({ isActive }) => linkStyle(isActive)}>
              {lang === "pt" ? "Blog / Artigos" : lang === "en" ? "Blog / Articles" : "Blog / Artículos"}
            </NavLink>

            <NavLink to={toWithSearch("global")} style={({ isActive }) => linkStyle(isActive)}>
              Global
            </NavLink>

            <NavLink to={toWithSearch("suppressor")} style={({ isActive }) => linkStyle(isActive)}>
              {lang === "pt" ? "Supressor JSON-LD" : lang === "en" ? "JSON-LD Suppressor" : "Supresor JSON-LD"}
            </NavLink>

            <NavLink to={toWithSearch("settings")} style={({ isActive }) => linkStyle(isActive)}>
              {lang === "pt" ? "Configurações" : lang === "en" ? "Settings" : "Ajustes"}
            </NavLink>
          </nav>

          <button
            onClick={openThemeEditor}
            style={{
              marginTop: 12,
              padding: "8px 10px",
              border: "1px solid #dfe3e8",
              borderRadius: 8,
              background: "#111827",
              color: "#fff",
              fontWeight: 700,
              width: "100%",
            }}
          >
            {lang === "pt" ? "Abrir editor do tema" : lang === "en" ? "Open theme editor" : "Abrir editor de temas"}
          </button>

          <div style={{ marginTop: 14, fontSize: 12 }}>
            <div><a href={`/support${search}`} target="_top" rel="noreferrer">Support</a></div>
            <div><a href={`/terms${search}`} target="_top" rel="noreferrer">Terms</a></div>
            <div><a href={`/privacy${search}`} target="_top" rel="noreferrer">Privacy</a></div>
          </div>
        </aside>

        {/* Contenido */}
        <main>
          {/* El Outlet y TODO lo que use useAppBridge vive dentro del Provider */}
          <Outlet context={{ lang }} />
        </main>
      </div>
    </AppBridgeProvider>
  );
}
