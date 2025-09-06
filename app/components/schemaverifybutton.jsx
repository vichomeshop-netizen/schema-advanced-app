// app/components/SchemaVerifyButton.jsx
import { useMemo, useState } from "react";
import { useLocation, useSearchParams } from "@remix-run/react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect, Toast } from "@shopify/app-bridge/actions";

export default function SchemaVerifyButton({ defaultPath = "/" }) {
  const [params] = useSearchParams();
  const shop = params.get("shop");                 // mantiene ?shop
  const location = useLocation();
  const app = useAppBridge();
  const redirect = useMemo(() => Redirect.create(app), [app]);

  const [path, setPath] = useState(defaultPath);

  async function refreshStatus() {
    // Si tienes el endpoint opcional de estado:
    try {
      const r = await fetch(`/api/schema/status?shop=${encodeURIComponent(shop)}`);
      const j = await r.json();
      const ok = j?.detected === true;
      Toast.create(app, { message: ok ? "Schema detectado" : "No detectado", duration: 2500 })
        .dispatch(Toast.Action.SHOW);
    } catch (_) {}
  }

  function verifyNow() {
    // Abre el storefront FUERA del iframe con el ping
    const url = `https://${shop}${path}?sae_ping=1`;
    redirect.dispatch(Redirect.Action.REMOTE, url);

    // Da tiempo al beacon de la tienda y luego refresca estado
    setTimeout(refreshStatus, 3500);
    Toast.create(app, { message: "Verificando en el escaparate…", duration: 2000 })
      .dispatch(Toast.Action.SHOW);
  }

  return (
    <div className="p-4 border rounded-2xl">
      <div className="mb-2 text-sm text-gray-600">
        Ruta a verificar:{" "}
        <input className="border rounded px-2 py-1 w-64"
               value={path}
               onChange={(e) => setPath(e.target.value || "/")} />
      </div>
      <button onClick={verifyNow} className="px-3 py-1.5 rounded bg-black text-white">
        Verificar schema (ping)
      </button>
    </div>
  );
}
