// vite.config.mjs
import { defineConfig } from "vite";
import path from "node:path";

// ⚠️ Import interop que funciona aunque @remix-run/dev sea CJS
import remixPkg from "@remix-run/dev";
const remix = remixPkg?.vitePlugin ?? remixPkg?.remix ?? remixPkg.default?.vitePlugin;

// Si por alguna razón remix queda undefined, fallamos explícitamente
if (!remix) {
  throw new Error(
    "No se pudo cargar el Vite plugin de Remix. Revisa la versión de @remix-run/dev."
  );
}

export default defineConfig({
  plugins: [remix()],
  resolve: {
    alias: {
      "~": path.resolve(process.cwd(), "app"),
    },
  },
});
