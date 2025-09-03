// app/routes/terms.jsx
export default function Terms() {
  const COMPANY = "Schema Advanced (VicHome)";
  const CONTACT_EMAIL = "soporte@vichome.es";
  const LAST_UPDATED = "2025-09-03";

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", lineHeight: 1.6, padding: "2rem", maxWidth: 860, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Terms of Service</h1>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>Last updated: {LAST_UPDATED}</p>

      <p style={{ marginBottom: 16 }}>
        These Terms govern your use of the Schema Advanced Shopify app (“the App”). By installing or using the App,
        you agree to these Terms.
      </p>

      <h2 style={{ fontSize: 20, marginTop: 24 }}>1) Service</h2>
      <p>
        The App injects JSON-LD schema into your storefront via a Theme App Extension and provides an embedded admin panel for
        configuration.
      </p>

      <h2 style={{ fontSize: 20, marginTop: 24 }}>2) Installation & access</h2>
      <p>
        You authorize the App to access necessary Shopify scopes to operate. You may remove the App at any time from your
        Shopify Admin which revokes tokens and stops processing.
      </p>

      <h2 style={{ fontSize: 20, marginTop: 24 }}>3) Fees</h2>
      <p>
        If a subscription or one-time fee applies, it will be shown in the Shopify billing screen during installation or
        upgrade. Shopify processes all charges under its Billing API.
      </p>

      <h2 style={{ fontSize: 20, marginTop: 24 }}>4) Acceptable use</h2>
      <p>
        You must not misuse the App, interfere with its operation, or attempt to access non-public areas. You are responsible
        for your theme and content compliance with applicable laws.
      </p>

      <h2 style={{ fontSize: 20, marginTop: 24 }}>5) Intellectual property</h2>
      <p>
        {COMPANY} retains all rights to the App’s code, design, and documentation. You receive a limited, revocable, non-exclusive
        license to use the App within your Shopify store.
      </p>

      <h2 style={{ fontSize: 20, marginTop: 24 }}>6) Data & privacy</h2>
      <p>
        Our processing of personal data is described in the{" "}
        <a href="/privacy">Privacy Policy</a>. By using the App you acknowledge that policy.
      </p>

      <h2 style={{ fontSize: 20, marginTop: 24 }}>7) Warranty disclaimer</h2>
      <p>
        The App is provided “as is” without warranties of any kind. We do not warrant that the App will be uninterrupted or
        error-free, or that search engines will display rich results.
      </p>

      <h2 style={{ fontSize: 20, marginTop: 24 }}>8) Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, {COMPANY} is not liable for indirect, incidental, or consequential damages,
        loss of profits, or business interruption arising from the use of the App.
      </p>

      <h2 style={{ fontSize: 20, marginTop: 24 }}>9) Termination</h2>
      <p>
        You may uninstall the App at any time. We may suspend or terminate access if you materially breach these Terms. Upon
        termination, your access ceases and tokens are revoked.
      </p>

      <h2 style={{ fontSize: 20, marginTop: 24 }}>10) Changes</h2>
      <p>
        We may update these Terms; continued use after changes constitutes acceptance. We will update the “Last updated” date.
      </p>

      <h2 style={{ fontSize: 20, marginTop: 24 }}>11) Governing law</h2>
      <p>
        These Terms are governed by the laws of Spain and applicable EU regulations. Disputes will be handled by competent
        courts in Spain.
      </p>

      <h2 style={{ fontSize: 20, marginTop: 24 }}>12) Contact</h2>
      <p>
        Questions? Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </main>
  );
}
