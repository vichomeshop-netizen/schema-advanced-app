// app/routes/app.products.jsx
export default function Products() {
  // Placeholder sencillo sin Polaris
  const rows = []; // Conecta API si quieres más adelante

  return (
    <div>
      <h1 style={{ marginBottom: 10 }}>Productos</h1>

      {rows.length === 0 ? (
        <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
          <p>No hay productos que mostrar en el panel.</p>
          <p style={{ color: "#6b7280" }}>
            El valor principal vive en el App embed del tema; esta vista es informativa.
          </p>
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", padding: 8 }}>ID</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", padding: 8 }}>Título</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb", padding: 8 }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: 8, borderBottom: "1px solid #f3f4f6" }}>{r.id}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #f3f4f6" }}>{r.title}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #f3f4f6" }}>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
