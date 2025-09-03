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

export const links = () => [
  { rel: "preconnect", href: "https://cdn.shopify.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
];

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

export function ErrorBoundary() {
  const error = useRouteError();

  let title = "Unexpected Server Error";
  let details = "";
  let dump = "";

  if (isRouteErrorResponse(error)) {
    title = `Error ${error.status} — ${error.statusText}`;
    try { details = typeof error.data === "string" ? error.data : JSON.stringify(error.data, null, 2); }
    catch { details = String(error.data ?? ""); }
  } else if (error instanceof Error) {
    title = error.name || title;
    details = (error.stack || error.message || "").toString();
    try {
      const plain = {};
      Object.getOwnPropertyNames(error).forEach((k) => (plain[k] = error[k]));
      dump = JSON.stringify(plain, null, 2);
    } catch {}
  } else if (error) {
    details = String(error);
    try { dump = JSON.stringify(error, null, 2); } catch {}
  }

  // Además, log en consola del navegador
  if (typeof console !== "undefined") console.error("[Remix ErrorBoundary]", error);

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

        {details ? (
          <pre style={{ whiteSpace: "pre-wrap", background: "#0f172a", color: "#e2e8f0", padding: 12, borderRadius: 8, overflow: "auto", fontSize: 13 }}>
            {details}
          </pre>
        ) : (
          <p>Intenta volver a la <a href="/">página principal</a> o repetir la acción.</p>
        )}

        {dump ? (
          <>
            <h2 style={{ marginTop: 16, fontSize: 16 }}>Error object</h2>
            <pre style={{ whiteSpace: "pre-wrap", background: "#111827", color: "#e5e7eb", padding: 12, borderRadius: 8, overflow: "auto", fontSize: 13 }}>
              {dump}
            </pre>
          </>
        ) : null}

        <Scripts />
      </body>
    </html>
  );
}
