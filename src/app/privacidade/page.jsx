import Link from "next/link";
import PaginaLegal from "../../components/legal/pagina-legal";
import { EMPRESA } from "../../lib/empresa";

export const metadata = { title: "Política de Privacidade | OneMoreCode", description: "Como a OneMoreCode trata dados pessoais, conforme a Lei Geral de Proteção de Dados (LGPD).", alternates: { canonical: "/privacidade" } };

export default function Privacidade() {
  const e = EMPRESA;
  return (
    <PaginaLegal atual="/privacidade" titulo="Política de Privacidade"
      resumo="Em resumo: coletamos só o necessário para responder contatos, preparar propostas e prestar nossos serviços. Não vendemos dados, não usamos rastreamento de publicidade e você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento.">
      <h2>1. Quem é o responsável pelos seus dados</h2>
      <p>O controlador dos dados é a <strong>{e.razaoSocial}</strong> (“{e.nomeFantasia}”){e.cnpj ? `, CNPJ ${e.cnpj}` : ""}, com sede em {e.endereco || e.cidade}. Esta política segue a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados, “LGPD”).</p>

      <h2>2. Quais dados tratamos, para quê e por quanto tempo</h2>
      <div className="overflow-x-auto"><table>
        <thead><tr><th>Situação</th><th>Dados</th><th>Finalidade</th><th>Base legal (LGPD)</th><th>Guarda</th></tr></thead>
        <tbody>
          <tr><td>Formulário de contato</td><td>Nome, e-mail e mensagem</td><td>Responder ao contato e preparar orçamento</td><td>Art. 7º, V (procedimentos preliminares a contrato, a seu pedido)</td><td>Até 12 meses após o envio, salvo se houver contratação</td></tr>
          <tr><td>Cadastro na área do cliente</td><td>Nome, e-mail, WhatsApp e senha (guardada apenas como código irreversível)</td><td>Criar e proteger seu acesso, disponibilizar propostas e contratos e avisar sobre eles</td><td>Art. 7º, V (execução de contrato e procedimentos preliminares)</td><td>Enquanto a conta existir; depois, pelo prazo do item 2.1</td></tr>
          <tr><td>Propostas e contratos</td><td>Documentos, arquivos assinados no gov.br e histórico das etapas</td><td>Formalizar e comprovar a contratação</td><td>Art. 7º, II, V e VI (obrigação legal, contrato e exercício de direitos)</td><td>Pelo prazo do item 2.1</td></tr>
          <tr><td>Contatos comerciais com empresas</td><td>Nome da empresa e do responsável, contatos profissionais e anotações das conversas</td><td>Organizar a prospecção e o atendimento comercial</td><td>Art. 7º, IX (legítimo interesse), com direito de oposição a qualquer momento</td><td>Até o fim da negociação ou até o pedido de exclusão</td></tr>
          <tr><td>Segurança do site</td><td>Endereço IP e data e hora de tentativas de login e de envios de formulário</td><td>Evitar fraudes, ataques e abusos</td><td>Art. 7º, IX (legítimo interesse)</td><td>Registros temporários, apagados automaticamente em até 24 horas</td></tr>
        </tbody>
      </table></div>
      <h3>2.1 Prazos legais de guarda</h3>
      <p>Depois de encerrada a relação, alguns dados são mantidos apenas pelo tempo necessário para cumprir obrigações legais (por exemplo, fiscais) e para o exercício regular de direitos em eventuais processos, conforme o art. 16 da LGPD. Encerrados esses prazos, os dados são eliminados.</p>
      <p>Não pedimos dados sensíveis (como saúde, religião ou biometria) e pedimos que você não os envie pelos nossos formulários.</p>

      <h2>3. O que não fazemos</h2>
      <ul>
        <li>Não vendemos nem alugamos dados pessoais.</li>
        <li>Não usamos ferramentas de rastreamento de publicidade nem de análise de comportamento (como pixels de redes sociais ou Google Analytics).</li>
        <li>Não enviamos mensagens promocionais sem a sua autorização.</li>
      </ul>

      <h2>4. Com quem os dados são compartilhados</h2>
      <p>Usamos fornecedores que tratam dados em nosso nome (operadores), somente para as finalidades acima:</p>
      <ul>
        <li><strong>Vercel</strong>: hospedagem do site e armazenamento de arquivos (propostas e contratos).</li>
        <li><strong>Upstash</strong>: banco de dados.</li>
        <li><strong>Web3Forms</strong>: recebimento das mensagens do formulário de contato.</li>
        <li><strong>Resend</strong>: envio de e-mails automáticos (resposta ao contato e avisos sobre documentos).</li>
        <li><strong>Google (Gmail)</strong>: caixa de e-mail da empresa.</li>
      </ul>
      <p>A assinatura de documentos é feita por você diretamente no portal gov.br, do Governo Federal; nós recebemos apenas o arquivo assinado que você envia. Ao nos chamar pelo WhatsApp ou Instagram, valem também as políticas dessas plataformas. Dados também podem ser fornecidos a autoridades quando houver obrigação legal ou ordem judicial.</p>

      <h2>5. Transferência internacional</h2>
      <p>Alguns desses fornecedores armazenam dados em servidores fora do Brasil, principalmente nos Estados Unidos. Essa transferência ocorre nos termos do art. 33 da LGPD, com fornecedores que adotam medidas de segurança e proteção de dados.</p>

      <h2>6. Cookies</h2>
      <p>O site usa apenas um cookie essencial, para manter o login na área do cliente. Detalhes no <Link href="/cookies">Aviso de Cookies</Link>.</p>

      <h2>7. Segurança</h2>
      <p>Adotamos conexão criptografada (HTTPS), senhas guardadas apenas como código irreversível, acesso restrito aos dados, limite de tentativas de login e proteções contra ataques comuns. Nenhum sistema é totalmente imune a falhas; se ocorrer um incidente de segurança que possa causar risco relevante, avisaremos os titulares afetados e a Autoridade Nacional de Proteção de Dados (ANPD), conforme o art. 48 da LGPD.</p>

      <h2>8. Seus direitos</h2>
      <p>Pelo art. 18 da LGPD, você pode solicitar: confirmação de que tratamos seus dados; acesso aos dados; correção de dados incompletos ou desatualizados; anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade; portabilidade; informação sobre com quem compartilhamos; eliminação dos dados tratados com consentimento e revogação do consentimento; e oposição a tratamentos baseados em legítimo interesse.</p>
      <p>Para exercer seus direitos, escreva para <a href={`mailto:${e.email}`}>{e.email}</a>. Poderemos pedir informações para confirmar a sua identidade. Respondemos de forma simplificada imediatamente ou, quando você pedir a declaração completa, em até 15 dias (art. 19 da LGPD). Você também pode apresentar reclamação à ANPD (<a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer">gov.br/anpd</a>).</p>

      <h2>9. Canal de privacidade</h2>
      <p>Assuntos sobre proteção de dados: <a href={`mailto:${e.email}`}>{e.email}</a> ou WhatsApp {e.whatsapp}.</p>

      <h2>10. Crianças e adolescentes</h2>
      <p>O site e a área do cliente são destinados a maiores de 18 anos e a empresas. Não coletamos intencionalmente dados de menores de idade.</p>

      <h2>11. Alterações</h2>
      <p>Esta política pode ser atualizada. A data da última atualização aparece no topo da página; mudanças relevantes serão informadas na área do cliente.</p>
    </PaginaLegal>
  );
}
