// app/routes/app.jsx
import { Outlet, useLocation } from "@remix-run/react";
import { AppProvider, Frame, Navigation, TopBar } from "@shopify/polaris";
import { Provider as AppBridgeProvider } from "@shopify/app-bridge-react";

/** Carga host/shop del query para que App Bridge funcione embebido */
export async function loader({ request }) {
  const url = new URL(request.url);
  return {
    host: url.searchParams.get("host") || "",
    shop: url.searchParams.get("shop") || "",
    apiKey: process.env.SHOPIFY_API_KEY || "",
  };
}

export default function AppLayout() {
  const location = useLocation();

  const items = [
    { label: "Panel", url: "/app" },
    { label: "Productos", url: "/app/products" },
    { label: "Ajustes", url: "/app/settings" },
  ];

  // Nota: Polaris Navigation usa <a href="..."> — Remix seguirá manejando naveg.
  return (
    <AppBridgeProvider
      config={{
        apiKey: (typeof window !== "undefined" && window.__SHOPIFY_API_KEY__) || "", // de fallback, App Bridge tomará del loader en server-side si lo inyectas
        host: new URLSearchParams(location.search).get("host") || "",
        forceRedirect: true,
      }}
    >
      <AppProvider i18n={{}}>
        <Frame
          topBar={<TopBar />}
          navigation={
            <Navigation location={location.pathname}>
              <Navigation.Section title="Schema Advanced" items={items} />
            </Navigation>
          }
        >
          <Outlet />
        </Frame>
      </AppProvider>
    </AppBridgeProvider>
  );
}
