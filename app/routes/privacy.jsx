// app/routes/privacy.jsx
export default function Privacy() {
  const COMPANY = "Schema Advanced (VicHome)";
  const CONTACT_EMAIL = "soporte@vichome.es";
  const LAST_UPDATED = "2025-09-03";

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", lineHeight: 1.6, padding: "2rem", maxWidth: 860, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>Last updated: {LAST_UPDATED}</p>

      <p style={{ marginBottom: 16 }}>
        {COMPANY} (“we”, “our”, “us”) provides a Shopify app that injects JSON-LD structured data into your
        storefront to improve SEO rich results. This policy explains what data we collect, why, and how we protect it.
      </p>

      <h2 style={{ fontSize: 20, marginTop: 24 }}>1) Data we process</h2>
      <ul style={{ paddingLeft: 20 }}>
        <li><strong>Shop metadata</strong> (shop domain, shop name, storefront locale).</li>
        <li><strong>App settings</strong> that you configure in the Theme App Extension (e.g., returns window, shipping days).</li>
        <li><strong>OAuth</strong> basic auth info required by Shopify to install and operate the app.</li>
        <li><strong>No customer PII</strong> (we do not collect buyer names, emails, addresses, or orders).</li>
      </ul>

      <h2 style={{ fontSize: 20, marginTop: 24 }}>2) Purpose & legal basis</h2>
      <ul style={{ paddingLeft: 20 }}>
        <li><strong>Provide the service</strong> (emit JSON-LD): performance of a contract (GDPR Art. 6(1)(b)).</li>
        <li><strong>Security & diagnostics</strong> (logs/error traces): legitimate interests (Art. 6(1)(f)).</li>
      </ul>

      <h2 style={{ fontSize: 20, marginTop: 24 }}>3) Data sources</h2>
      <p>We receive data directly from Shopify Admin APIs and the theme extension settings you save.</p>

      <h2 style={{ fontSize: 20, marginTop: 24 }}>4) Sharing & processors</h2>
      <ul style={{ paddingLeft: 20 }}>
        <li><strong>Shopify</strong> (platform & APIs).</li>
        <li><strong>Vercel</strong> (hosting the app backend/frontend).</li>
        <li><strong>Database</strong> (if enabled, e.g., Neon/Postgres) to store minimal app configuration.</li>
      </ul>
      <p>We do not sell your data or share it for advertising.</p>

      <h2 style={{ fontSize: 20, marginTop: 24 }}>5) International transfers</h2>
      <p>
        Hosting and processors may operate inside/outside the EU. When applicable, we rely on Standard Contractual
        Clauses (SCCs) or equivalent safeguards.
      </p>

      <h2 style={{ fontSize: 20, marginTop: 24 }}>6) Retention</h2>
      <p>We keep app configuration while the app is installed. Logs are kept briefly for diagnostics and then deleted.</p>

      <h2 style={{ fontSize: 20, marginTop: 24 }}>7) Security</h2>
      <p>We apply industry practices (HTTPS, scoped tokens, least-privilege access). No card data is processed.</p>

      <h2 style={{ fontSize: 20, marginTop: 24 }}>8) Your rights (GDPR)</h2>
      <p>
        You can request access, rectification, deletion, restriction, or portability of your data. Contact us at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2 style={{ fontSize: 20, marginTop: 24 }}>9) Contact</h2>
      <p>
        Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>

      <h2 style={{ fontSize: 20, marginTop: 24 }}>10) Changes</h2>
      <p>We may update this policy. We’ll revise the “Last updated” date above.</p>
    </main>
  );
}
