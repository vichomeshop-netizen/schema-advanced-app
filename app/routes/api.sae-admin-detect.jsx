
// app/routes/api.sae-admin-detect.jsx
import { json } from "@remix-run/node";

// Ajusta estos handles al nombre real de tu App Embed en el tema
const EMBED_KEYS = ["schema-advanced-embed", "schema-advanced"];

// ------- Opción A: usar la plantilla Shopify (authenticate.admin) con import relativo -------
// Nota: cambiamos "~" por import relativo para evitar el error de Vite.
async function detectWithShopifyLib(request) {
  try {
    // intenta importar ../shopify.server (JS/TS)
    let mod = null;
    try {
      mod = await import("../shopify.server");            // app/shopify.server.(js|ts)
    } catch {
      try {
        mod = await import("../../shopify.server");       // por si tu estructura es distinta
      } catch {
        // no existe el módulo → seguimos con fallback por token
        return null;
      }
    }

    // La plantilla oficial exporta "authenticate"
    const authenticate = mod.authenticate || mod.default?.authenticate;
    if (!authenticate?.admin) return null;

    const { admin, session } = await authenticate.admin(request);

    // 1) Tema principal
    const themesRes = await admin.rest.get({ path: "themes" });
    const themes = themesRes?.body?.themes || [];
    const main = themes.find((t) => t.role === "main");
    if (!main) return { ok: false, active: false, reason: "no_main_theme" };

    // 2) settings_data.json
    const assetRes = await admin.rest.get({
      path: `themes/${main.id}/assets`,
      query: { "asset[key]": "config/settings_data.json" },
    });

    const asset = assetRes?.body?.asset || {};
    const val =
      asset.value ||
      (asset.attachment
        ? Buffer.from(asset.attachment, "base64").toString("utf8")
        : "");

    if (!val) return { ok: true, active: false, themeId: main.id, note: "no_settings_data" };

    let settings;
    try {
      settings = JSON.parse(val);
    } catch {
      return { ok: false, active: false, reason: "bad_settings_json" };
    }

    const current = settings.current || {};
    let active = false;

    // a) objeto app_embeds: { handle: true }
    if (current.app_embeds && typeof current.app_embeds === "object") {
      active = EMBED_KEYS.some((k) => current.app_embeds[k] === true);
    }

    // b) array enabled_app_embeds: ["handle1","handle2"]
    if (!active && Array.isArray(current.enabled_app_embeds)) {
      active = EMBED_KEYS.some((k) => current.enabled_app_embeds.includes(k));
    }

    // c) barrido de texto por si el tema guarda flags en otro sitio
    if (!active) {
      const str = JSON.stringify(current).toLowerCase();
      active = EMBED_KEYS.some((k) => str.includes(`"${k.toLowerCase()}"`));
    }

    return { ok: true, active: !!active, shop: session.shop, themeId: main.id };
  } catch (e) {
    return { ok: false, active: false, reason: "shopify_lib_error", error: String(e?.message || e) };
  }
}

// ------- Opción B (fallback): token Admin (single-tenant o para test) -------
// Requiere env:
//   SHOPIFY_ADMIN_TOKEN   = token offline del Admin de esa tienda
//   SHOPIFY_API_VERSION   = ej. "2024-07" (opcional; por defecto 2024-07)
//   SHOPIFY_SHOP          = xxxxx.myshopify.com (si no se pasa ?shop=...)
async function detectWithAdminToken(shopFromQuery) {
  const token = process.env.SHOPIFY_ADMIN_TOKEN;
  const apiVersion = process.env.SHOPIFY_API_VERSION || "2024-07";
  const envShop = process.env.SHOPIFY_SHOP;
  const shop = (shopFromQuery || envShop || "").trim().toLowerCase();

  if (!token || !shop || !/^[a-z0-9-]+\.myshopify\.com$/.test(shop)) {
    return {
      ok: false,
      active: false,
      reason: "missing_env_or_shop",
      hint: "Set SHOPIFY_ADMIN_TOKEN and SHOPIFY_SHOP, or pass ?shop=xxxx.myshopify.com",
    };
    // No tiramos 4xx para no romper el panel
  }

  const base = `https://${shop}/admin/api/${apiVersion}`;

  // 1) Tema principal
  const themesRes = await fetch(`${base}/themes.json`, {
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  const themesJson = await themesRes.json().catch(() => ({}));
  const themes = themesJson?.themes || [];
  const main = themes.find((t) => t.role === "main");
  if (!main) return { ok: false, active: false, reason: "no_main_theme" };

  // 2) settings_data.json
  const assetRes = await fetch(
    `${base}/themes/${main.id}/assets.json?asset[key]=config/settings_data.json`,
    { headers: { "X-Shopify-Access-Token": token }, cache: "no-store" }
  );
  const assetJson = await assetRes.json().catch(() => ({}));
  const asset = assetJson?.asset || {};
  const val =
    asset.value ||
    (asset.attachment
      ? Buffer.from(asset.attachment, "base64").toString("utf8")
      : "");

  if (!val) return { ok: true, active: false, themeId: main.id, note: "no_settings_data" };

  let settings;
  try {
    settings = JSON.parse(val);
  } catch {
    return { ok: false, active: false, reason: "bad_settings_json" };
  }

  const current = settings.current || {};
  let active = false;

  if (current.app_embeds && typeof current.app_embeds === "object") {
    active = EMBED_KEYS.some((k) => current.app_embeds[k] === true);
  }
  if (!active && Array.isArray(current.enabled_app_embeds)) {
    active = EMBED_KEYS.some((k) => current.enabled_app_embeds.includes(k));
  }
  if (!active) {
    const str = JSON.stringify(current).toLowerCase();
    active = EMBED_KEYS.some((k) => str.includes(`"${k.toLowerCase()}"`));
  }

  return { ok: true, active: !!active, shop, themeId: main.id };
}

export async function loader({ request }) {
  const url = new URL(request.url);
  const shopParam = url.searchParams.get("shop") || "";

  // 1) Intentar con la librería oficial (si existe app/shopify.server.*)
  const libResult = await detectWithShopifyLib(request);
  if (libResult && libResult.ok !== false) {
    return json(libResult, { headers: { "Cache-Control": "no-store" } });
  }

  // 2) Fallback con token Admin (single-tenant o pruebas locales/producción)
  const tokenResult = await detectWithAdminToken(shopParam);
  return json(tokenResult, { headers: { "Cache-Control": "no-store" } });
}
