// app/root.jsx
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";

// Enlaces globales (CDNs/optimizaciones)
export const links = () => [
  { rel: "preconnect", href: "https://cdn.shopify.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  // Si usas alguna hoja de estilos propia, añádela aquí:
  // { rel: "stylesheet", href: stylesHref },
];

// Loader básico (sin tipos TS)
export async function loader() {
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
      <body style={{ margin: 0, background: "#fff", color: "#111827" }}>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

// Muestra los errores de SSR/cliente dentro de la app (evita el “Application Error” opaco)
export function ErrorBoundary() {
  const error = useRouteError();

  let title = "Ha ocurrido un error";
  let message = "Revisa los logs o el stack para más detalles.";
  let details = "";

  if (isRouteErrorResponse(error)) {
    title = `Error ${error.status} — ${error.statusText}`;
    try {
      // Algunos responses tienen JSON; intentamos renderizarlo
      details = JSON.stringify(error.data, null, 2);
    } catch (_) {
      details = String(error.data ?? "");
    }
  } else if (error instanceof Error) {
    title = error.name || "Error";
    message = error.message || message;
    details = error.stack || "";
  } else {
    details = String(error);
  }

  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <title>{title}</title>
        <Meta />
        <Links />
      </head>
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 16, lineHeight: 1.5 }}>
        <h1 style={{ marginBottom: 8 }}>{title}</h1>
        <p style={{ color: "#6b7280", marginBottom: 16 }}>{message}</p>

        {details ? (
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#0f172a",
              color: "#e2e8f0",
              padding: 12,
              borderRadius: 8,
              overflow: "auto",
              fontSize: 13,
            }}
          >
            {details}
          </pre>
        ) : null}

        <p style={{ marginTop: 16 }}>
          Intenta volver a la <a href="/">página principal</a> o repetir la acción. Si persiste,
          revisa los <strong>logs de Vercel</strong> / consola local.
        </p>

        <Scripts />
      </body>
    </html>
  );
}
