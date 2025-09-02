// app/routes/app._index.jsx
import { useCallback } from "react";

export default function Dashboard() {
  const openThemeEditor = useCallback(() => {
    // abrirá el editor dentro del admin (embedded)
    window.top.location.href = "/admin/themes/current/editor?context=apps";
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: 10 }}>Schema Advanced — Panel</h1>
      <p style={{ marginBottom: 16 }}>
        Activa el <strong>App embed</strong> en tu tema para empezar. Luego visita el storefront para verificar los JSON-LD.
      </p>
      <button onClick={openThemeEditor} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", cursor: "pointer" }}>
        Abrir editor de temas
      </button>

      <div style={{ marginTop: 24, padding: 12, border: "1px solid #e5e7eb", borderRadius: 8, background: "#fcfcff" }}>
        <strong>Estado rápido</strong>
        <p id="state" style={{ marginTop: 8 }}>Abre tu tienda pública y verifica que ves <code>data-sae="1"</code> en los JSON-LD.</p>
      </div>
    </div>
  );
}
