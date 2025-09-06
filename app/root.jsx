// app/root.jsx
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  LiveReload,
  isRouteErrorResponse,
  useRouteError,
  useLoaderData,
} from "@remix-run/react";
import { json } from "@remix-run/node";

// ⬇️ Pasamos la API key al root (no es secreta)
export async function loader() {
  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
}

// ⬇️ Usa la API key del loader para emitir la meta de App Bridge v4
export const meta = ({ data }) => {
  const tags = [
    { charSet: "utf-8" },
    { title: "Schema Advanced" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ];
  if (data?.apiKey) {
    tags.push({ name: "shopify-api-key", content: data.apiKey });
  }
  return tags;
};

// Patrón recomendado Remix v2: Layout + App
export function Layout({ children }) {
  const { apiKey } = useLoaderData(); // <- para decidir si renderizamos el script
  return (
    <html lang="en">
      <head>
        {/* App Bridge v4: meta + script (el <Meta /> inyecta la meta arriba) */}
        <Meta />
        <Links />
        {apiKey ? (
          <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
        ) : null}
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

// Muestra errores en pantalla (no en blanco)
export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return (
      <div style={{ padding: 24 }}>
        <h1>{error.status} {error.statusText}</h1>
        <pre>{JSON.stringify(error.data, null, 2)}</pre>
      </div>
    );
  }
  return (
    <div style={{ padding: 24 }}>
      <h1>App error</h1>
      <pre>{String(error?.message || error)}</pre>
    </div>
  );
}


