// app/lib/shopify.server.js
// Cliente Shopify + utilidades que usan tus rutas.
// Mínimo viable para OAuth/Webhooks/SSR en Vercel (Node 20).

import "@shopify/shopify-api/adapters/node";
import { shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api";

const {
  SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET,
  SCOPES,
  APP_URL, // p.ej. https://schema-advanced-app.vercel.app
} = process.env;

if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET || !APP_URL) {
  console.warn(
    "[shopify.server] Faltan variables de entorno: SHOPIFY_API_KEY / SHOPIFY_API_SECRET / APP_URL"
  );
}

export const shopify = shopifyApi({
  apiKey: SHOPIFY_API_KEY,
  apiSecretKey: SHOPIFY_API_SECRET,
  scopes: (SCOPES || "read_products").split(",").map((s) => s.trim()).filter(Boolean),
  hostName: (APP_URL || "http://localhost:3000")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, ""),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
});

/**
 * Añade cabeceras para que la app embebida cargue en iframe del Admin.
 * Llama a esto desde entry.server antes de devolver la Response final.
 *
 * Uso esperado:
 *   headers = addDocumentResponseHeaders(request, headers)
 */
export function addDocumentResponseHeaders(requestOrHeaders, maybeHeaders) {
  // Soporta ambas firmas: (request, headers) o (headers) por compat.
  let request = null;
  let headers = null;

  if (maybeHeaders) {
    request = requestOrHeaders;
    headers = maybeHeaders;
  } else {
    headers = requestOrHeaders;
  }

  // Permite embeber en Admin y en cualquier tienda *.myshopify.com
  const shopParam =
    request ? new URL(request.url).searchParams.get("shop") : null;

  const frameAncestors = shopParam
    ? `https://${shopParam} https://admin.shopify.com`
    : `https://*.myshopify.com https://admin.shopify.com`;

  headers.set(
    "Content-Security-Policy",
    `frame-ancestors ${frameAncestors};`
  );
  headers.set("Referrer-Policy", "origin-when-cross-origin");
  // No pongas DENY/SAMEORIGIN; en apps embebidas rompemos el iframe:
  headers.set("X-Frame-Options", "ALLOWALL");

  return headers;
}

/**
 * Placeholder simple para autenticación en rutas protegidas / webhooks.
 * Si quieres validación real de webhooks, sustituye por:
 *   const verified = await shopify.webhooks.verifyRequest({ rawBody, rawRequest });
 * y maneja el resultado.
 */
export async function authenticate(/* request */) {
  return { ok: true };
}

/**
 * Helper de login usado por tu ruta /auth.login/route.jsx (si la usas):
 * devuelve la URL de autorización (begin) y tú haces redirect ahí.
 */
export async function login(request) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  if (!shop || !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(shop)) {
    throw new Response(
      "Parámetro ?shop inválido. Ej: ?shop=tu-tienda.myshopify.com",
      { status: 400 }
    );
  }
  return shopify.auth.begin({
    shop,
    callbackPath: "/auth/callback",
    isOnline: false, // offline para billing
  });
}
