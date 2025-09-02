// Related: https://github.com/remix-run/remix/issues/2835#issuecomment-1144102176
if (
  process.env.HOST &&
  (!process.env.SHOPIFY_APP_URL ||
    process.env.SHOPIFY_APP_URL === process.env.HOST)
) {
  process.env.SHOPIFY_APP_URL = process.env.HOST;
  delete process.env.HOST;
}

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  appDirectory: "app",
  serverBuildTarget: "vercel",   // 👈 NECESARIO para Vercel
  serverModuleFormat: "esm",     // 👈 deja "cjs" si tu package.json NO tiene "type":"module"
  dev: { port: process.env.HMR_SERVER_PORT || 8002 },
  future: {},
};