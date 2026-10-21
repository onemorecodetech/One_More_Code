import Link from "next/link";
import PaginaLegal from "../../components/legal/pagina-legal";
import { EMPRESA } from "../../lib/empresa";

export const metadata = { title: "Termos de Serviço | OneMoreCode", description: "Condições de uso do site e da área do cliente da OneMoreCode.", alternates: { canonical: "/termos" } };

export default function Termos() {
  const e = EMPRESA;
  return (
    <PaginaLegal atual="/termos" titulo="Termos de Serviço"
      resumo="Estes termos explicam as regras de uso do site e da área do cliente. A contratação de cada serviço é feita por proposta e contrato próprios, que prevalecem sobre as informações gerais do site.">
      <h2>1. Quem somos</h2>
      <p>Este site pertence à <strong>{e.razaoSocial}</strong> (“{e.nomeFantasia}”){e.cnpj ? `, CNPJ ${e.cnpj}` : ""}, com sede em {e.endereco || e.cidade}. Contato: <a href={`mailto:${e.email}`}>{e.email}</a> e WhatsApp {e.whatsapp}.</p>

      <h2>2. Aceitação</h2>
      <p>Ao usar o site ou criar uma conta na área do cliente, você concorda com estes termos e com a <Link href="/privacidade">Política de Privacidade</Link>. Se não concordar, não utilize o site.</p>

      <h2>3. Informações sobre os serviços</h2>
      <p>As descrições de serviços no site são gerais e servem para apresentar o nosso trabalho. Prazos, valores, escopo e condições de pagamento são definidos em cada proposta comercial e no contrato assinado entre as partes.</p>

      <h2>4. Área do cliente</h2>
      <ul>
        <li>A conta é pessoal e destinada a maiores de 18 anos ou a representantes de empresas.</li>
        <li>Você deve informar dados verdadeiros e manter a senha em sigilo. Avise-nos imediatamente se suspeitar de uso indevido da sua conta.</li>
        <li>Podemos suspender contas usadas de forma indevida ou contrária a estes termos.</li>
        <li>Você pode pedir a exclusão da sua conta a qualquer momento, respeitados os prazos legais de guarda descritos na Política de Privacidade.</li>
      </ul>

      <h2>5. Propostas, contratos e assinatura</h2>
      <p>Propostas e contratos ficam disponíveis na área do cliente. A assinatura é feita pelo próprio cliente no portal gov.br, que emite assinatura eletrônica avançada, nos termos da Lei nº 14.063/2020. A contratação só se forma com o contrato assinado e com a confirmação da assinatura pela {e.nomeFantasia}.</p>

      <h2>6. Uso permitido</h2>
      <p>É proibido: tentar acessar áreas restritas ou dados de outras pessoas; enviar programas maliciosos; sobrecarregar ou atacar o site; coletar dados do site de forma automatizada; ou usar o site para fins ilícitos.</p>

      <h2>7. Propriedade intelectual</h2>
      <p>Textos, marca, layout e código do site pertencem à {e.nomeFantasia} ou a seus licenciantes e não podem ser copiados sem autorização. Os projetos do portfólio são exibidos com autorização dos respectivos clientes, e as marcas citadas pertencem aos seus titulares. A titularidade dos projetos desenvolvidos para clientes segue o que estiver previsto em cada contrato.</p>

      <h2>8. Links externos</h2>
      <p>O site tem links para serviços de terceiros (como WhatsApp, Instagram, Google e gov.br), que seguem as próprias regras e políticas.</p>

      <h2>9. Disponibilidade</h2>
      <p>Trabalhamos para manter o site disponível e seguro, mas ele pode passar por manutenções ou ficar indisponível por falhas de fornecedores. Isso não afasta os direitos previstos no Código de Defesa do Consumidor, quando aplicável.</p>

      <h2>10. Reembolsos</h2>
      <p>As regras de cancelamento e reembolso estão na <Link href="/reembolso">Política de Reembolso</Link> e no contrato de cada serviço.</p>

      <h2>11. Alterações</h2>
      <p>Estes termos podem ser atualizados. A versão em vigor é sempre a publicada nesta página, com a data da última atualização no topo.</p>

      <h2>12. Lei aplicável e foro</h2>
      <p>Aplica-se a lei brasileira. Fica eleito o foro da comarca de Erechim/RS, ressalvado o direito do consumidor de propor ação no foro do seu domicílio (art. 101, I, do Código de Defesa do Consumidor).</p>
    </PaginaLegal>
  );
}
