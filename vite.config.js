import { defineConfig } from "vite";
import { remix } from "@remix-run/dev";
import path from "node:path";

export default defineConfig({
  plugins: [remix()],
  resolve: {
    alias: {
      "~": path.resolve(process.cwd(), "app"),
    },
  },
});
