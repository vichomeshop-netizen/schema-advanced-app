// app/routes/app.settings.jsx
import { useEffect, useState } from "react";

export default function Settings() {
  const [enableHint, setEnableHint] = useState(true);
  const [docsUrl, setDocsUrl] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const s = window.localStorage.getItem("schema-advanced-settings");
      if (s) {
        const j = JSON.parse(s);
        if (typeof j.enableHint === "boolean") setEnableHint(j.enableHint);
        if (typeof j.docsUrl === "string") setDocsUrl(j.docsUrl);
      }
    } catch {}
  }, []);

  function save() {
    try {
      window.localStorage.setItem(
        "schema-advanced-settings",
        JSON.stringify({ enableHint, docsUrl })
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch {}
  }

  return (
    <div>
      <h1 style={{ marginBottom: 10 }}>Ajustes</h1>

      {saved && (
        <div style={{ marginBottom: 12, padding: 10, border: "1px solid #bbf7d0", background: "#ecfdf5", borderRadius: 8 }}>
          Ajustes guardados.
        </div>
      )}

      <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={enableHint}
            onChange={(e) => setEnableHint(e.target.checked)}
          />
          Mostrar aviso para activar App embed
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>URL de documentación</span>
          <input
            type="url"
            value={docsUrl}
            onChange={(e) => setDocsUrl(e.target.value)}
            placeholder="https://tusitio.com/docs"
            style={{ padding: 8, border: "1px solid #e5e7eb", borderRadius: 8 }}
          />
        </label>

        <button
          onClick={save}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", cursor: "pointer", width: 120 }}
        >
          Guardar
        </button>
      </div>
    </div>
  );
}
