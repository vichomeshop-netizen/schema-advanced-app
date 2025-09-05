// app/routes/terms.jsx
import { useOutletContext } from "@remix-run/react";

const COMPANY = "Schema Advanced (VicHome)";
const CONTACT_EMAIL = "contacto@vichomeshop.com"; // email actualizado
const LAST_UPDATED = "2025-09-03";

const UPDATED_LABEL = {
  es: "Última actualización",
  en: "Last updated",
  pt: "Última atualização",
};

const TEXT = {
  es: {
    title: "Términos del servicio",
    html: `
      <p style="margin-bottom: 16px">
        Estos Términos regulan el uso de la app de Shopify <strong>Schema Advanced</strong> (“la App”). Al instalar o usar la App,
        aceptas estos Términos.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">1) Servicio</h2>
      <p>
        La App inyecta marcado JSON-LD en tu escaparate mediante una Theme App Extension y ofrece un panel embebido para su configuración.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">2) Instalación y acceso</h2>
      <p>
        Autorizas a la App a acceder a los permisos de Shopify necesarios para su funcionamiento. Puedes desinstalar la App en cualquier
        momento desde tu Admin de Shopify, lo que revoca los tokens y detiene el procesamiento.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">3) Tarifas</h2>
      <p>
        Si aplica suscripción o pago único, se mostrará en la pantalla de facturación de Shopify durante la instalación o actualización.
        Shopify procesa todos los cargos bajo su Billing API.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">4) Uso aceptable</h2>
      <p>
        No debes usar indebidamente la App, interferir en su operación ni intentar acceder a áreas no públicas. Eres responsable de que tu
        tema y contenidos cumplan la normativa aplicable.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">5) Propiedad intelectual</h2>
      <p>
        ${COMPANY} conserva todos los derechos sobre el código, diseño y documentación de la App. Recibes una licencia limitada, revocable y
        no exclusiva para usar la App en tu tienda de Shopify.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">6) Datos y privacidad</h2>
      <p>
        Nuestro tratamiento de datos personales se describe en la <a href="/privacy">Política de privacidad</a>. El uso de la App implica la aceptación de dicha política.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">7) Exención de garantías</h2>
      <p>
        La App se proporciona “tal cual”, sin garantías de ningún tipo. No garantizamos que la App esté libre de errores o interrupciones,
        ni que los motores de búsqueda muestren resultados enriquecidos.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">8) Limitación de responsabilidad</h2>
      <p>
        En la máxima medida permitida por la ley, ${COMPANY} no será responsable de daños indirectos, incidentales o consecuentes, pérdida de
        beneficios o interrupción del negocio derivados del uso de la App.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">9) Terminación</h2>
      <p>
        Puedes desinstalar la App en cualquier momento. Podemos suspender o terminar el acceso si incumples materialmente estos Términos.
        Tras la terminación, cesa tu acceso y se revocan los tokens.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">10) Cambios</h2>
      <p>
        Podemos actualizar estos Términos; el uso continuado tras los cambios implica su aceptación. Actualizaremos la fecha de “Última actualización”.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">11) Ley aplicable</h2>
      <p>
        Estos Términos se rigen por las leyes de España y la normativa de la UE aplicable. Las disputas se resolverán en los juzgados competentes en España.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">12) Contacto</h2>
      <p>
        ¿Dudas? Escríbenos a <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>
      </p>
    `,
  },
  en: {
    title: "Terms of Service",
    html: `
      <p style="margin-bottom: 16px">
        These Terms govern your use of the <strong>Schema Advanced</strong> Shopify app (“the App”). By installing or using the App,
        you agree to these Terms.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">1) Service</h2>
      <p>
        The App injects JSON-LD schema into your storefront via a Theme App Extension and provides an embedded admin panel for configuration.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">2) Installation & access</h2>
      <p>
        You authorize the App to access the necessary Shopify scopes to operate. You may remove the App at any time from your Shopify Admin,
        which revokes tokens and stops processing.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">3) Fees</h2>
      <p>
        If a subscription or one-time fee applies, it will be shown in the Shopify billing screen during installation or upgrade.
        Shopify processes all charges under its Billing API.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">4) Acceptable use</h2>
      <p>
        You must not misuse the App, interfere with its operation, or attempt to access non-public areas. You are responsible for ensuring
        your theme and content comply with applicable laws.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">5) Intellectual property</h2>
      <p>
        ${COMPANY} retains all rights to the App’s code, design, and documentation. You receive a limited, revocable, non-exclusive
        license to use the App within your Shopify store.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">6) Data & privacy</h2>
      <p>
        Our processing of personal data is described in the <a href="/privacy">Privacy Policy</a>. By using the App you acknowledge that policy.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">7) Warranty disclaimer</h2>
      <p>
        The App is provided “as is” without warranties of any kind. We do not warrant that the App will be uninterrupted or error-free,
        or that search engines will display rich results.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">8) Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, ${COMPANY} is not liable for indirect, incidental, or consequential damages, loss of profits,
        or business interruption arising from the use of the App.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">9) Termination</h2>
      <p>
        You may uninstall the App at any time. We may suspend or terminate access if you materially breach these Terms. Upon termination,
        your access ceases and tokens are revoked.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">10) Changes</h2>
      <p>
        We may update these Terms; continued use after changes constitutes acceptance. We will update the “Last updated” date.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">11) Governing law</h2>
      <p>
        These Terms are governed by the laws of Spain and applicable EU regulations. Disputes will be handled by competent courts in Spain.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">12) Contact</h2>
      <p>
        Questions? Email <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>
      </p>
    `,
  },
  pt: {
    title: "Termos de Serviço",
    html: `
      <p style="margin-bottom: 16px">
        Estes Termos regem o uso do app Shopify <strong>Schema Advanced</strong> (“o App”). Ao instalar ou usar o App,
        você concorda com estes Termos.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">1) Serviço</h2>
      <p>
        O App injeta schema JSON-LD na sua loja por meio de uma Theme App Extension e oferece um painel embutido para configuração.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">2) Instalação e acesso</h2>
      <p>
        Você autoriza o App a acessar os escopos necessários da Shopify para funcionar. Você pode remover o App a qualquer momento no Admin
        da Shopify, o que revoga os tokens e interrompe o processamento.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">3) Taxas</h2>
      <p>
        Se houver assinatura ou taxa única, ela será exibida na tela de cobrança da Shopify durante a instalação ou upgrade.
        A Shopify processa todas as cobranças por meio da sua Billing API.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">4) Uso aceitável</h2>
      <p>
        Você não deve usar o App de forma indevida, interferir na sua operação ou tentar acessar áreas não públicas. Você é responsável por
        garantir que seu tema e conteúdo estejam em conformidade com a legislação aplicável.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">5) Propriedade intelectual</h2>
      <p>
        ${COMPANY} mantém todos os direitos sobre o código, design e documentação do App. Você recebe uma licença limitada, revogável e
        não exclusiva para usar o App na sua loja Shopify.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">6) Dados e privacidade</h2>
      <p>
        Nosso tratamento de dados pessoais é descrito na <a href="/privacy">Política de Privacidade</a>. Ao usar o App, você reconhece essa política.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">7) Isenção de garantias</h2>
      <p>
        O App é fornecido “no estado em que se encontra”, sem garantias de qualquer tipo. Não garantimos que o App será ininterrupto ou livre de erros,
        nem que mecanismos de pesquisa exibirão rich results.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">8) Limitação de responsabilidade</h2>
      <p>
        Na máxima extensão permitida por lei, ${COMPANY} não será responsável por danos indiretos, incidentais ou consequentes, perda de lucros
        ou interrupção de negócios decorrentes do uso do App.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">9) Rescisão</h2>
      <p>
        Você pode desinstalar o App a qualquer momento. Podemos suspender ou encerrar o acesso se você violar materialmente estes Termos.
        Após a rescisão, o acesso cessa e os tokens são revogados.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">10) Alterações</h2>
      <p>
        Podemos atualizar estes Termos; o uso continuado após alterações constitui aceitação. A data de “Última atualização” será revista.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">11) Legislação aplicável</h2>
      <p>
        Estes Termos são regidos pelas leis da Espanha e pelos regulamentos aplicáveis da UE. Disputas serão tratadas pelos tribunais competentes na Espanha.
      </p>

      <h2 style="font-size: 20px; margin-top: 24px">12) Contato</h2>
      <p>
        Dúvidas? Escreva para <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>
      </p>
    `,
  },
};

export default function Terms() {
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
