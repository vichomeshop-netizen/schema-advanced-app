// app/root.tsx
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration,
} from "@remix-run/react";
import "@shopify/polaris/build/esm/styles.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://cdn.shopify.com" },
];

export async function loader(_args: LoaderFunctionArgs) {
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
