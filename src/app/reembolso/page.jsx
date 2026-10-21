import Link from "next/link";
import PaginaLegal from "../../components/legal/pagina-legal";
import { EMPRESA } from "../../lib/empresa";

export const metadata = { title: "Política de Reembolso | OneMoreCode", description: "Regras de cancelamento, arrependimento e reembolso dos serviços da OneMoreCode.", alternates: { canonical: "/reembolso" } };

export default function Reembolso() {
  const e = EMPRESA;
  return (
    <PaginaLegal atual="/reembolso" titulo="Política de Reembolso"
      resumo="Você tem 7 dias para desistir de uma contratação feita a distância, com devolução integral do que pagou. Depois disso, cancelamentos seguem o contrato assinado. Seus direitos como consumidor são sempre preservados.">
      <h2>1. Pagamentos</h2>
      <p>Valores, parcelas e prazos de cada serviço são definidos na proposta e no contrato. Como regra, o pagamento é dividido em uma parte no início e outra na entrega, conforme a proposta aceita.</p>

      <h2>2. Direito de arrependimento (7 dias)</h2>
      <p>Quando a contratação é feita fora de um estabelecimento físico (pelo site, WhatsApp, e-mail ou telefone), o cliente consumidor pode desistir em até <strong>7 dias</strong> contados da assinatura do contrato, sem precisar justificar. Nesse caso, os valores pagos são devolvidos de imediato e integralmente, com atualização monetária, conforme o art. 49 do Código de Defesa do Consumidor.</p>

      <h2>3. Cancelamento depois de 7 dias</h2>
      <p>Após esse prazo, o cancelamento segue as regras do contrato assinado, que define, por exemplo, como são tratados os valores das etapas já realizadas.</p>

      <h2>4. Hospedagem e manutenção mensais</h2>
      <p>Planos mensais podem ser cancelados conforme as condições previstas no contrato do serviço.</p>

      <h2>5. Serviços de terceiros</h2>
      <p>Itens contratados com terceiros em nome do cliente (como registro de domínio) seguem as regras do respectivo fornecedor, informadas no contrato.</p>

      <h2>6. Problemas na entrega</h2>
      <p>Se o serviço entregue apresentar falhas ou não corresponder ao contratado, você pode pedir a correção sem custo, um abatimento proporcional do preço ou a devolução dos valores, conforme o art. 20 do Código de Defesa do Consumidor.</p>

      <h2>7. Como solicitar</h2>
      <p>Envie seu pedido para <a href={`mailto:${e.email}`}>{e.email}</a> ou pelo WhatsApp {e.whatsapp}, informando seu nome e o serviço contratado. Confirmamos o recebimento e, quando houver reembolso, ele é feito pelo mesmo meio de pagamento utilizado, salvo acordo diferente com você.</p>

      <p>Veja também os <Link href="/termos">Termos de Serviço</Link>.</p>
    </PaginaLegal>
  );
}
