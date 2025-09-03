export default function Landing() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: 1.5, padding: "2rem" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Schema Advanced</h1>
      <p style={{ fontSize: 18, marginBottom: 20 }}>
        JSON-LD structured data for Shopify. Boost SEO, rich results and product visibility.
      </p>

      <form method="get" action="/auth/login" style={{ marginBottom: 30 }}>
        <input
          type="text"
          name="shop"
          placeholder="your-shop.myshopify.com"
          style={{ padding: "8px", width: "260px", marginRight: "10px" }}
        />
        <button
          type="submit"
          style={{ padding: "8px 16px", borderRadius: 6, background: "#111827", color: "white" }}
        >
          Log in with Shopify
        </button>
      </form>

      <h2 style={{ fontSize: 20, marginBottom: 12 }}>Why Schema Advanced?</h2>
      <ul style={{ paddingLeft: 20 }}>
        <li>✔ Organization, Product, Collection, FAQ, BlogPosting schemas</li>
        <li>✔ Removes duplicate JSON-LD from your theme</li>
        <li>✔ Multi-language support (EN, ES, PT)</li>
        <li>✔ Includes shipping, returns and reviews info</li>
      </ul>

      <footer style={{ marginTop: 40, fontSize: 14, color: "#6b7280" }}>
        <p>
          <a href="/privacy">Privacy Policy</a> · <a href="/terms">Terms of Service</a> ·{" "}
          <a href="mailto:contacto@vichomeshop.com">Support</a>
        </p>
      </footer>
    </div>
  );
}
