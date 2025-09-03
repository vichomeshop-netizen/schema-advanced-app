// app/routes/api.sae-admin-detect.js
import { json } from "@remix-run/node";
// Si usas la plantilla oficial de Shopify Remix:
import { authenticate } from "~/shopify.server";

// Ajusta estos handles a tu App Embed real (extension handle)
const EMBED_KEYS = ["schema-advanced-embed", "schema-advanced"];

export async function loader({ request }) {
  try {
    // Autenticación Admin (usa sesión offline de tu app)
    const { admin, session } = await authenticate.admin(request);
    const shop = session.shop;

    // 1) Obtener el tema principal
    const themesRes = await admin.rest.get({ path: "themes" });
    const themes = themesRes?.body?.themes || [];
    const main = themes.find((t) => t.role === "main");
    if (!main) return json({ ok: false, active: false, error: "no_main_theme" }, { status: 200 });

    // 2) Leer config/settings_data.json
    const assetRes = await admin.rest.get({
      path: `themes/${main.id}/assets`,
      query: { "asset[key]": "config/settings_data.json" },
    });

    const val =
      assetRes?.body?.asset?.value ||
      assetRes?.body?.asset?.attachment && Buffer.from(assetRes.body.asset.attachment, "base64").toString("utf8") ||
      "";

    if (!val) return json({ ok: true, active: false, themeId: main.id, note: "no_settings_data" });

    let settings;
    try { settings = JSON.parse(val); } catch { return json({ ok: false, active: false, error: "bad_settings_json" }, { status: 200 }); }

    const current = settings.current || {};

    // Buscamos App Embeds activados en varias formas comunes
    // A) app_embeds como objeto { handle: true }
    let active = false;
    if (current.app_embeds && typeof current.app_embeds === "object") {
      active = EMBED_KEYS.some((k) => current.app_embeds[k] === true);
    }

    // B) enabled_app_embeds como array ["handle1","handle2"]
    if (!active && Array.isArray(current.enabled_app_embeds)) {
      active = EMBED_KEYS.some((k) => current.enabled_app_embeds.includes(k));
    }

    // C) Algunos temas guardan flags en otras claves; barrido de claves/valores
    if (!active) {
      const str = JSON.stringify(current).toLowerCase();
      active = EMBED_KEYS.some((k) => str.includes(`"${k.toLowerCase()}"`));
    }

    return json({
      ok: true,
      active: !!active,
      shop,
      themeId: main.id,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return json({ ok: false, active: false, error: e?.message || "auth_or_api_error" }, { status: 200 });
  }
}
