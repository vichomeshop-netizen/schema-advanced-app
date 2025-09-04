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
} from "@remix-run/react";

export const meta = () => [
  { charSet: "utf-8" },
  { title: "Schema Advanced" },
  { name: "viewport", content: "width=device-width, initial-scale=1" },
];

export function links() {
  return []; // añade CSS global si tienes
}

// Patrón recomendado Remix v2: Layout + App
export function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
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

