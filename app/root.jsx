// app/root.jsx
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
// Importa estilos globales que necesites (opcional)
import "@shopify/polaris/build/esm/styles.css";

export const links = () => [
  { rel: "preconnect", href: "https://cdn.shopify.com" },
];

export async function loader() {
  // devuelve lo que necesites, sin tipos TS
  return { theme: "light" };
}

export default function App() {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <Links />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
