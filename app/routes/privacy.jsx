// app/routes/privacy.jsx
import { useOutletContext } from "@remix-run/react";

const COMPANY = "Schema Advanced (VicHome)";
const CONTACT_EMAIL = "vichomeshop@gmail.com"; // email corregido
const LAST_UPDATED = "2025-09-03";

const UPDATED_LABEL = {
  es: "Última actualización",
  en: "Last updated",
  pt: "Última atualização",
};

const TEXT = {
  es: {
    title: "Política de privacidad",
    html: `
      <p style="margin-bottom: 16px">
        ${COMPANY} (“nosotros”) ofrece una app de Shopify que inyecta datos estructurados JSON-LD en tu tienda para mejorar los resultados enriquecidos de SEO.
        Esta política explica qué datos tratamos, por qué y cómo los protegemos.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">1) Datos que tratamos</h2>
      <ul style="padding-left: 20px">
        <li><strong>Metadatos de la tienda</strong> (dominio, nombre de tienda, idioma del escaparate).</li>
        <li><strong>Ajustes de la app</strong> que configuras en la Theme App Extension (p. ej., días de devolución, días de envío).</li>
        <li><strong>OAuth</strong> y credenciales mínimas requeridas por Shopify para instalar/operar la app.</li>
        <li><strong>Sin datos personales de clientes finales</strong> (no recogemos nombres, emails, direcciones ni pedidos de compradores).</li>
      </ul>

      <h2 style="font-size: 20px; margin-top: 24px">2) Finalidad y base jurídica</h2>
      <ul style="padding-left: 20px">
        <li><strong>Prestar el servicio</strong> (emitir JSON-LD): ejecución de contrato (RGPD art. 6(1)(b)).</li>
        <li><strong>Seguridad y diagnóstico</strong> (logs/errores): interés legítimo (art. 6(1)(f)).</li>
      </ul>

      <h2 style="font-size: 20px; margin-top: 24px">3) Fuentes de datos</h2>
      <p>Recibimos datos directamente de las APIs de Shopify Admin y de los ajustes que guardas en la extensión del tema.</p>

      <h2 style="font-size: 20px; margin-top: 24px">4) Encargados y compartición</h2>
      <ul style="padding-left: 20px">
        <li><strong>Shopify</strong> (plataforma y APIs).</li>
        <li><strong>Vercel</strong> (hosting del backend/frontend de la app).</li>
        <li><strong>Base de datos</strong> (si procede, p. ej. Neon/Postgres) para almacenar configuración mínima.</li>
      </ul>
      <p>No vendemos tus datos ni los compartimos con fines publicitarios.</p>

      <h2 style="font-size: 20px; margin-top: 24px">5) Transferencias internacionales</h2>
      <p>Los proveedores pueden operar dentro/fuera de la UE. Cuando aplique, usamos Cláusulas Contractuales Tipo (SCCs) u otras garantías equivalentes.</p>

      <h2 style="font-size: 20px; margin-top: 24px">6) Conservación</h2>
      <p>Mantenemos la configuración mientras la app esté instalada. Los logs se conservan por poco tiempo y luego se eliminan.</p>

      <h2 style="font-size: 20px; margin-top: 24px">7) Seguridad</h2>
      <p>Aplicamos buenas prácticas (HTTPS, tokens con alcance, principio de mínimo privilegio). No procesamos datos de tarjetas.</p>

      <h2 style="font-size: 20px; margin-top: 24px">8) Tus derechos (RGPD)</h2>
      <p>Puedes solicitar acceso, rectificación, supresión, limitación u obtener la portabilidad de tus datos. Escríbenos a
        <a href="mailto:${CONTACT_EMAIL}"> ${CONTACT_EMAIL}</a>.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">9) Contacto</h2>
      <p>Email: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>

      <h2 style="font-size: 20px; margin-top: 24px">10) Cambios</h2>
      <p>Podemos actualizar esta política. Revisaremos la fecha de “Última actualización”.</p>
    `,
  },
  en: {
    title: "Privacy Policy",
    html: `
      <p style="margin-bottom: 16px">
        ${COMPANY} (“we”, “our”, “us”) provides a Shopify app that injects JSON-LD structured data into your storefront to improve SEO rich results.
        This policy explains what data we collect, why, and how we protect it.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">1) Data we process</h2>
      <ul style="padding-left: 20px">
        <li><strong>Shop metadata</strong> (shop domain, shop name, storefront locale).</li>
        <li><strong>App settings</strong> you configure in the Theme App Extension (e.g., returns window, shipping days).</li>
        <li><strong>OAuth</strong> basic auth required by Shopify to install and operate the app.</li>
        <li><strong>No customer PII</strong> (we do not collect buyer names, emails, addresses, or orders).</li>
      </ul>

      <h2 style="font-size: 20px; margin-top: 24px">2) Purpose & legal basis</h2>
      <ul style="padding-left: 20px">
        <li><strong>Provide the service</strong> (emit JSON-LD): performance of a contract (GDPR Art. 6(1)(b)).</li>
        <li><strong>Security & diagnostics</strong> (logs/error traces): legitimate interests (Art. 6(1)(f)).</li>
      </ul>

      <h2 style="font-size: 20px; margin-top: 24px">3) Data sources</h2>
      <p>We receive data directly from Shopify Admin APIs and the theme extension settings you save.</p>

      <h2 style="font-size: 20px; margin-top: 24px">4) Sharing & processors</h2>
      <ul style="padding-left: 20px">
        <li><strong>Shopify</strong> (platform & APIs).</li>
        <li><strong>Vercel</strong> (hosting the app backend/frontend).</li>
        <li><strong>Database</strong> (if enabled, e.g., Neon/Postgres) to store minimal app configuration.</li>
      </ul>
      <p>We do not sell your data or share it for advertising.</p>

      <h2 style="font-size: 20px; margin-top: 24px">5) International transfers</h2>
      <p>Hosting and processors may operate inside/outside the EU. Where applicable, we rely on Standard Contractual Clauses (SCCs) or equivalent safeguards.</p>

      <h2 style="font-size: 20px; margin-top: 24px">6) Retention</h2>
      <p>We keep app configuration while the app is installed. Logs are kept briefly for diagnostics and then deleted.</p>

      <h2 style="font-size: 20px; margin-top: 24px">7) Security</h2>
      <p>We apply industry practices (HTTPS, scoped tokens, least-privilege access). No card data is processed.</p>

      <h2 style="font-size: 20px; margin-top: 24px">8) Your rights (GDPR)</h2>
      <p>
        You can request access, rectification, deletion, restriction, or portability of your data. Contact us at
        <a href="mailto:${CONTACT_EMAIL}"> ${CONTACT_EMAIL}</a>.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">9) Contact</h2>
      <p>Email: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>

      <h2 style="font-size: 20px; margin-top: 24px">10) Changes</h2>
      <p>We may update this policy. We’ll revise the “Last updated” date above.</p>
    `,
  },
  pt: {
    title: "Política de Privacidade",
    html: `
      <p style="margin-bottom: 16px">
        ${COMPANY} (“nós”) oferece um app Shopify que injeta dados estruturados JSON-LD na sua loja para melhorar resultados enriquecidos de SEO.
        Esta política explica quais dados coletamos, por que e como os protegemos.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">1) Dados que processamos</h2>
      <ul style="padding-left: 20px">
        <li><strong>Metadados da loja</strong> (domínio, nome da loja, idioma do storefront).</li>
        <li><strong>Configurações do app</strong> salvas na Theme App Extension (ex.: janela de devolução, dias de envio).</li>
        <li><strong>OAuth</strong> e credenciais mínimas exigidas pela Shopify para instalar/operar o app.</li>
        <li><strong>Sem PII de clientes finais</strong> (não coletamos nomes, e-mails, endereços ou pedidos de compradores).</li>
      </ul>

      <h2 style="font-size: 20px; margin-top: 24px">2) Finalidade e base legal</h2>
      <ul style="padding-left: 20px">
        <li><strong>Fornecer o serviço</strong> (emitir JSON-LD): execução de contrato (RGPD art. 6(1)(b)).</li>
        <li><strong>Segurança e diagnóstico</strong> (logs/erros): interesse legítimo (art. 6(1)(f)).</li>
      </ul>

      <h2 style="font-size: 20px; margin-top: 24px">3) Fontes de dados</h2>
      <p>Recebemos dados diretamente das APIs Shopify Admin e das configurações salvas na extensão do tema.</p>

      <h2 style="font-size: 20px; margin-top: 24px">4) Compartilhamento e operadores</h2>
      <ul style="padding-left: 20px">
        <li><strong>Shopify</strong> (plataforma e APIs).</li>
        <li><strong>Vercel</strong> (hospedagem do backend/frontend do app).</li>
        <li><strong>Banco de dados</strong> (se aplicável, ex.: Neon/Postgres) para armazenar configuração mínima.</li>
      </ul>
      <p>Não vendemos seus dados nem os compartilhamos para publicidade.</p>

      <h2 style="font-size: 20px; margin-top: 24px">5) Transferências internacionais</h2>
      <p>Provedores podem operar dentro/fora da UE. Quando aplicável, usamos Standard Contractual Clauses (SCCs) ou salvaguardas equivalentes.</p>

      <h2 style="font-size: 20px; margin-top: 24px">6) Retenção</h2>
      <p>Mantemos a configuração enquanto o app estiver instalado. Logs são mantidos por curto período e depois excluídos.</p>

      <h2 style="font-size: 20px; margin-top: 24px">7) Segurança</h2>
      <p>Aplicamos boas práticas (HTTPS, tokens com escopo, mínimo privilégio). Não processamos dados de cartão.</p>

      <h2 style="font-size: 20px; margin-top: 24px">8) Seus direitos (RGPD)</h2>
      <p>Você pode solicitar acesso, retificação, exclusão, limitação ou portabilidade dos seus dados. Contate-nos em
        <a href="mailto:${CONTACT_EMAIL}"> ${CONTACT_EMAIL}</a>.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">9) Contato</h2>
      <p>E-mail: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>

      <h2 style="font-size: 20px; margin-top: 24px">10) Alterações</h2>
      <p>Podemos atualizar esta política. A data de “Última atualização” será revisada.</p>
    `,
  },
};

export default function Privacy() {
  const { lang } = useOutletContext() || { lang: "es" };
  const t = TEXT[lang] || TEXT.es;

  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        lineHeight: 1.6,
        padding: "2rem",
        maxWidth: 860,
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>{t.title}</h1>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>
        {UPDATED_LABEL[lang] || UPDATED_LABEL.es}: {LAST_UPDATED}
      </p>

      <section
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          padding: 16,
        }}
        dangerouslySetInnerHTML={{ __html: t.html }}
      />
    </main>
  );
}

