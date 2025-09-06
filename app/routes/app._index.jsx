// app/routes/app._index.jsx
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { prisma } from "~/lib/prisma.server";

/** Deriva shop desde host (base64url) si falta ?shop= */
function decodeShopFromHost(hostB64url) {
  try {
    const base64 = hostB64url.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = Buffer.from(base64, "base64").toString("utf8");
    const m = decoded.match(/([a-z0-9-]+\.myshopify\.com)/i);
    return m?.[1] ?? null;
  } catch {
    return null;
  }
}

export async function loader({ request }) {
  const url = new URL(request.url);
  let shop = url.searchParams.get("shop");
  const host = url.searchParams.get("host");

  if (!shop && host) {
    const fromHost = decodeShopFromHost(host);
    if (fromHost) shop = fromHost;
  }
  if (!shop) return redirect("/auth");

  const rec = await prisma.shop.findUnique({ where: { shop } });
  if (!rec?.accessToken) return redirect(`/auth?shop=${encodeURIComponent(shop)}`);

  return json({
    shop,
    subscriptionStatus: rec?.subscriptionStatus ?? null,
    planName: rec?.planName ?? null,
  });
}

/* ==========================================================
   Tarjeta SIN input: detecta rutas y muestra estado automáticamente
   Busca exactamente <script type="application/ld+json" data-sae="1">
   ========================================================== */
function SchemaStatusCardNoInput({ shop }) {
  const [paths, setPaths] = useState(["/"]);
  const [activePath, setActivePath] = useState("/");
  const [loading, setLoading] = useState(false);
  const [detected, setDetected] = useState(null); // null | boolean
  const [lastPingAt, setLastPingAt] = useState(null);
  const [method, setMethod] = useState("fetch");

  // Control de sesión de verificación para no pisar resultados
  const verifyRef = useRef({ id: 0, done: false });

  function toast(msg) { try { window.shopify?.toast?.show(msg); } catch {} }
  function log(...a) { try { console.debug("[SAE]", ...a); } catch {} }

  // 🔔 Escucha el postMessage del escaparate (?sae_ping=1)
  useEffect(() => {
  function onMessage(ev) {
    const d = ev?.data;
    if (!d || d.source !== "schema-advanced" || d.type !== "sae-status") return;

    // Actualiza UI
    setDetected(!!d.ok);
    setLastPingAt(new Date());
    setMethod("ping");

    // ✅ Persistir desde el panel (no lo bloquea el ad-blocker)
    fetch("/api/schema/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shop,                        // lo tienes del loader
        path: d.path || activePath,  // ruta detectada
        ok: !!d.ok,
      }),
    }).catch(() => {});
  }
  window.addEventListener("message", onMessage);
  return () => window.removeEventListener("message", onMessage);
}, [shop, activePath]);

  // Descubre rutas candidatas al montar y hace 1ª comprobación (publicado)
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/schema/targets?shop=${encodeURIComponent(shop)}`);
        const j = await r.json();
        const ps = Array.isArray(j.paths) && j.paths.length ? j.paths : ["/"];
        setPaths(ps);
        const pick =
          ps.find((p) => p.startsWith("/products/")) ||
          ps.find((p) => p.startsWith("/collections/")) ||
          ps.find((p) => p.startsWith("/blogs/")) ||
          ps.find((p) => p.startsWith("/pages/")) ||
          "/";
        setActivePath(pick);
        await checkPublished(pick);
      } catch {
        setPaths(["/"]);
        setActivePath("/");
        await checkPublished("/");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shop]);

  async function loadStatus(mode = "fetch", path = activePath) {
    // Si ya tenemos ping satisfactorio para esta sesión, no pisar
    if (verifyRef.current.done && mode !== "ping") {
      log("Ignoro fetch porque ya llegó ping");
      return;
    }

    setLoading(true);
    try {
      const r = await fetch(
        `/api/schema/status?shop=${encodeURIComponent(shop)}&mode=${mode}&path=${encodeURIComponent(path)}`
      );
      const j = await r.json();

      // Heurística password/redirects (opcional si tu API lo devuelve)
      if (j?.blocked === "password" || j?.htmlIncludesPassword) {
        setDetected(null);
        setMethod("fetch/password");
        toast("La tienda parece protegida con contraseña o redirigida. Usa preview o quita la password.");
        return;
      }

      // Solo aplica si no hubo ping
      if (!verifyRef.current.done) {
        setDetected(!!j.detected);
        setLastPingAt(j.lastPingAt ? new Date(j.lastPingAt) : null);
        setMethod(j.method || mode);
      }
    } finally {
      setLoading(false);
    }
  }

  async function checkPublished(path = activePath) {
    await loadStatus("fetch", path); // lee HTML publicado
    toast("Comprobado (publicado)");
  }

  function verifyNow() {
    setLoading(true);
    setDetected(null);

    const id = (verifyRef.current.id || 0) + 1;
    verifyRef.current = { id, done: false };

    toast("Verificando en el escaparate…");
    const url = `https://${shop}${activePath}?sae_ping=1`;

    // 1) Intento principal: abrir pestaña (SIN noopener para tener window.opener)
    const win = window.open(url, "_blank");
    log("Abrí ventana:", !!win);

    // 2) Fallback si el navegador bloquea el popup → iframe oculto (usará window.parent)
    if (!win) {
      const iframe = document.createElement("iframe");
      iframe.src = url;
      Object.assign(iframe.style, {
        position: "fixed",
        width: "1px",
        height: "1px",
        opacity: "0",
        pointerEvents: "none",
        inset: "0 auto auto 0",
      });
      document.body.appendChild(iframe);
      setTimeout(() => { try { iframe.remove(); } catch {} }, 25000);
      log("Usando fallback iframe");
    }

    // 3) Fallback visual: si en 12s no llegó ping, consultamos HTML publicado
    setTimeout(() => {
      if (verifyRef.current.id === id && !verifyRef.current.done) {
        log("No llegó ping a tiempo; lanzo fetch fallback");
        loadStatus("fetch", activePath);
      }
    }, 12000);
  }

  const badge = useMemo(() => {
    if (loading) return { label: "Comprobando…", dot: "#f59e0b", bg: "#fff7ed", bd: "#f59e0b", tx: "#92400e" };
    if (detected === true) return { label: "Detectado", dot: "#10b981", bg: "#ecfdf5", bd: "#10b981", tx: "#065f46" };
    if (detected === false) return { label: "No detectado", dot: "#ef4444", bg: "#fef2f2", bd: "#ef4444", tx: "#991b1b" };
    return { label: "Sin verificar", dot: "#9ca3af", bg: "#f3f4f6", bd: "#9ca3af", tx: "#374151" };
  }, [loading, detected]);

  const chipLabel = (p) =>
    p === "/"
      ? "Home"
      : p.startsWith("/products/") ? "Producto"
      : p.startsWith("/collections/") ? "Colección"
      : p.startsWith("/blogs/") ? "Artículo"
      : p.startsWith("/pages/") ? "Página"
      : p;

  return (
    <section
      style={{
        background: "#fff",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "#e5e7eb",
        borderRadius: 10,
        padding: 16,
        marginTop: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Estado del schema</h2>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 8px",
            borderRadius: 999,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: badge.bd,
            background: badge.bg,
            color: badge.tx,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 999, background: badge.dot }} />
          {badge.label}
        </span>
      </div>

      {/* Rutas candidatas (sin escribir nada) */}
      <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
        {paths.map((p) => {
          const isActive = p === activePath;
          return (
            <button
              key={p}
              onClick={() => { setActivePath(p); checkPublished(p); }}
              type="button"
              title={p}
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: isActive ? "#111827" : "#d1d5db",
                background: isActive ? "#111827" : "#fff",
                color: isActive ? "#fff" : "#111827",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {chipLabel(p)}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 10, color: "#374151", fontSize: 13 }}>
        Ruta: <code>{activePath}</code> · Método: <code>{method}</code> · Último visto:{" "}
        {lastPingAt ? lastPingAt.toLocaleString() : "—"}
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={verifyNow}
          type="button"
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: "#111827",
            background: "#111827",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Verificar ahora (ping)
        </button>

        <button
          onClick={() => checkPublished()}
          type="button"
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: "#e5e7eb",
            background: "#fff",
            color: "#111827",
            cursor: "pointer",
          }}
        >
          Recomprobar publicado (fetch)
        </button>
      </div>

      <p style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
        Busco estrictamente <code>&lt;script type="application/ld+json" data-sae="1"&gt;</code> en el HTML publicado. Si tu tienda no es pública, usa el botón de ping.
      </p>
    </section>
  );
}

const TEXT = {
  es: {
    title: "Schema Advanced — Overview",
    intro:
      "Onboarding y guía en una sola vista. Las pestañas de la izquierda (Productos, Colecciones, Ajustes) son informativas: no cambian nada en tu tienda; explican qué emite la app y cómo validarlo.",
    onboardingTitle: "Inicio rápido",
    onboardingHtml: `
      <ol>
        <li><strong>Activa el App embed</strong> en <em>Tienda online → Temas → Personalizar → App embeds</em>.</li>
        <li><strong>Publica/valida</strong> el marcado (Product, CollectionPage, WebSite, FAQPage, HowTo, BreadcrumbList).</li>
        <li>Valida con la <em>Prueba de resultados enriquecidos</em> o el <em>Validador de Schema.org</em>.</li>
      </ol>
      <p>Si el tema ya emite JSON-LD, activa el <em>supresor</em> para evitar duplicados.</p>
    `,
    guideTitle: "Guía rápida",
    guideHtml: `
      <ul>
        <li><strong>Organization</strong> en todas las páginas</li>
        <li><strong>WebSite</strong> con <code>SearchAction</code> (home opcional)</li>
        <li><strong>BreadcrumbList</strong> (toggle)</li>
        <li><strong>CollectionPage</strong> + <strong>FAQPage</strong> (metafields/metaobjects)</li>
        <li><strong>Product</strong> con <strong>AggregateOffer/Offer</strong>, <code>OfferShippingDetails</code>, <code>MerchantReturnPolicy</code></li>
        <li><strong>BlogPosting</strong> y <strong>HowTo</strong> (auto desde H2)</li>
        <li><strong>ContactPage</strong> y <strong>AboutPage</strong></li>
      </ul>
    `,
    ctas: { openEditor: "Abrir editor de temas", openRRT: "Abrir Rich Results Test" },
    badgeActive: (planName) => `Plan activo${planName ? ` — ${planName}` : ""}`,
    badgeInactive: "Sin suscripción",
  },
  en: {
    title: "Schema Advanced — Overview",
    intro:
      "Onboarding and guide in one view. Left tabs (Products, Collections, Settings) are informational only: they don’t change your store; they document outputs and validation.",
    onboardingTitle: "Quick start",
    onboardingHtml: `
      <ol>
        <li><strong>Enable the App embed</strong> in <em>Online Store → Themes → Customize → App embeds</em>.</li>
        <li><strong>Publish/validate</strong> the markup (Product, CollectionPage, WebSite, FAQPage, HowTo, BreadcrumbList).</li>
        <li>Validate with the <em>Rich Results Test</em> or <em>Schema.org Validator</em>.</li>
      </ol>
      <p>If your theme already emits JSON-LD, enable the <em>suppressor</em> to avoid duplicates.</p>
    `,
    guideTitle: "Quick guide",
    guideHtml: `
      <ul>
        <li><strong>Organization</strong> on all pages</li>
        <li><strong>WebSite</strong> with <code>SearchAction</code> (optional on home)</li>
        <li><strong>BreadcrumbList</strong> (toggle)</li>
        <li><strong>CollectionPage</strong> + <strong>FAQPage</strong> (metafields/metaobjects)</li>
        <li><strong>Product</strong> with <strong>AggregateOffer/Offer</strong>, <code>OfferShippingDetails</code>, <code>MerchantReturnPolicy</code></li>
        <li><strong>BlogPosting</strong> and <strong>HowTo</strong> (auto from H2)</li>
        <li><strong>ContactPage</strong> and <strong>AboutPage</strong></li>
      </ul>
    `,
    ctas: { openEditor: "Open Theme Editor", openRRT: "Open Rich Results Test" },
    badgeActive: (planName) => `Active plan${planName ? ` — ${planName}` : ""}`,
    badgeInactive: "No subscription",
  },
  pt: {
    title: "Schema Advanced — Visão geral",
    intro:
      "Onboarding e guia em uma única vista. As abas à esquerda (Produtos, Coleções, Definições) são informativas: não alteram sua loja; documentam saídas e validação.",
    onboardingTitle: "Início rápido",
    onboardingHtml: `
      <ol>
        <li><strong>Ative o App embed</strong> em <em>Online Store → Themes → Customize → App embeds</em>.</li>
        <li><strong>Publique/valide</strong> o markup (Product, CollectionPage, WebSite, FAQPage, HowTo, BreadcrumbList).</li>
        <li>Valide com o <em>Rich Results Test</em> ou <em>Schema.org Validator</em>.</li>
      </ol>
      <p>Se o tema já emite JSON-LD, ative o <em>supressor</em> para evitar duplicados.</p>
    `,
    guideTitle: "Guia rápido",
    guideHtml: `
      <ul>
        <li><strong>Organization</strong> em todas as páginas</li>
        <li><strong>WebSite</strong> com <code>SearchAction</code> (home opcional)</li>
        <li><strong>BreadcrumbList</strong> (toggle)</li>
        <li><strong>CollectionPage</strong> + <strong>FAQPage</strong> (metafields/metaobjects)</li>
        <li><strong>Product</strong> com <strong>AggregateOffer/Offer</strong>, <code>OfferShippingDetails</code>, <code>MerchantReturnPolicy</code></li>
        <li><strong>BlogPosting</strong> e <strong>HowTo</strong> (auto desde H2)</li>
        <li><strong>ContactPage</strong> e <strong>AboutPage</strong></li>
      </ul>
    `,
    ctas: { openEditor: "Abrir editor de temas", openRRT: "Abrir Rich Results Test" },
    badgeActive: (planName) => `Plano ativo${planName ? ` — ${planName}` : ""}`,
    badgeInactive: "Sem assinatura",
  },
};

// Helper: abrir editor de temas (mismo patrón que usas en el layout)
function openThemeEditorFromQS() {
  if (typeof window === "undefined") return;
  const qs = new URLSearchParams(window.location.search);
  const shop = qs.get("shop") || "";
  const store = shop.replace(".myshopify.com", "");
  const href = store
    ? `https://admin.shopify.com/store/${store}/themes/current/editor?context=apps`
    : `https://${shop || window.location.hostname}/admin/themes/current/editor?context=apps`;
  window.top.location.href = href;
}

export default function Overview() {
  const { lang } = useOutletContext() || { lang: "es" };
  const t = TEXT[lang] || TEXT.es;

  const { subscriptionStatus, planName, shop } = useLoaderData();
  const isActive = subscriptionStatus === "ACTIVE";

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: 1.5 }}>
      {/* Badge de suscripción */}
      <div style={{ marginBottom: 8 }}>
        <span
          style={{
            padding: "4px 8px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: isActive ? "#10b981" : "#d1d5db",
            color: isActive ? "#065f46" : "#374151",
            background: isActive ? "#ecfdf5" : "#f9fafb",
          }}
        >
          {isActive ? (planName ? `Plan activo — ${planName}` : "Plan activo") : "Sin suscripción"}
        </span>
      </div>

      <h1 style={{ fontSize: 22, marginBottom: 6 }}>{t.title}</h1>
      <p style={{ marginTop: 0, color: "#374151" }}>{t.intro}</p>

      {/* Onboarding */}
      <section
        style={{
          background: "#fff",
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: "#e5e7eb",
          borderRadius: 10,
          padding: 16,
          marginTop: 12,
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: 18 }}>{t.onboardingTitle}</h2>
        <div dangerouslySetInnerHTML={{ __html: t.onboardingHtml }} />

        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          <button
            onClick={openThemeEditorFromQS}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: "#111827",
              background: "#111827",
              color: "#fff",
              cursor: "pointer",
            }}
            type="button"
          >
            {t.ctas.openEditor}
          </button>

          {/* ÚNICO CTA a Rich Results (sin duplicar link) */}
          <a
            href="https://search.google.com/test/rich-results"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: "#e5e7eb",
              background: "#fff",
              color: "#111827",
              textDecoration: "none",
            }}
          >
            {t.ctas.openRRT}
          </a>
        </div>
      </section>

      {/* Estado del schema (sin input) */}
      <SchemaStatusCardNoInput shop={shop} />

      {/* Guía rápida */}
      <section
        style={{
          background: "#fff",
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: "#e5e7eb",
          borderRadius: 10,
          padding: 16,
          marginTop: 12,
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: 18 }}>{t.guideTitle}</h2>
        <div dangerouslySetInnerHTML={{ __html: t.guideHtml }} />
      </section>
    </div>
  );
}




