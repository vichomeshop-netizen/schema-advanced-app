// app/lib/shopify.server.js
// 1) Este import REGISTRA el adaptador Node para la librería de Shopify.
//    No es un paquete aparte: no se instala. Solo se importa aquí una vez.
import "@shopify/shopify-api/adapters/node";

// 2) Importa la función para crear el cliente y la versión de API.
import { shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api";

// 3) Valida que existan las variables de entorno mínimas.
if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET || !process.env.APP_URL) {
  throw new Error("Faltan SHOPIFY_API_KEY / SHOPIFY_API_SECRET / APP_URL en variables de entorno");
}

// 4) Crea y exporta el cliente 'shopify' que usarán tus rutas (/auth, /auth/callback, etc.)
export const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  apiVersion: LATEST_API_VERSION,
  scopes: (process.env.SCOPES || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  hostName: new URL(process.env.APP_URL).host,
  isEmbeddedApp: true,
});
