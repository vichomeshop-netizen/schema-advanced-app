// app/routes/_index/route.jsx
export default function Landing() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: 1.5, padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, margin: 0 }}>Schema Advanced</h1>
        <p style={{ fontSize: 18, color: "#374151", marginTop: 8 }}>
          JSON-LD para Shopify: rich results, mejor SEO y visibilidad de productos (ES/EN/PT).
        </p>
      </header>

      <form method="get" action="/auth/login" style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        <input
          type="text"
          name="shop"
          placeholder="your-shop.myshopify.com"
          required
          style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, minWidth: 280 }}
        />
        <button type="submit" style={{ padding: "10px 16px", borderRadius: 8, background: "#111827", color: "#fff", border: 0 }}>
          Log in with Shopify
        </button>
      </form>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>¿Qué hace?</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li>✔ Inserta <strong>Organization</strong>, <strong>WebSite</strong>, <strong>BreadcrumbList</strong></li>
          <li>✔ <strong>Product</strong> con GTIN/MPN/SKU, variantes (<strong>AggregateOffer</strong>), envíos y devoluciones</li>
          <li>✔ <strong>CollectionPage</strong>, <strong>FAQPage</strong>, <strong>BlogPosting</strong>, <strong>HowTo</strong>, <strong>ContactPage</strong>, <strong>AboutPage</strong></li>
          <li>✔ <strong>Supresor</strong> de JSON-LD duplicado del tema</li>
          <li>✔ Idioma automático (ES/PT/EN)</li>
        </ul>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>¿Cómo se usa?</h2>
        <ol style={{ paddingLeft: 20 }}>
          <li>Admin → Online Store → Themes → <strong>Customize</strong></li>
          <li>Pestaña <strong>App embeds</strong> → activa <strong>Schema Advanced</strong> → Guardar</li>
          <li>Valida con <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer">Rich Results Test</a></li>
        </ol>
      </section>

      <footer style={{ marginTop: 32, color: "#6b7280" }}>
        <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="mailto:soporte@vichome.es">Support</a>
      </footer>
    </div>
  );
}
