import Link from "next/link";
import { notFound } from "next/navigation";
import PortalShell from "@/components/portal/shell";
import StatusBadge from "@/components/portal/status";
import EnvioAssinatura from "@/components/portal/envio-assinatura";
import { exigirCliente } from "@/lib/portal/auth";
import { statusAtual, moeda, data, dataHora, linkWhatsApp } from "@/lib/portal/util";
import { card, btnPrimario, btnSecundario, btnWhats } from "@/components/portal/ui";

export const dynamic = "force-dynamic";

const PASSOS = [
  "Baixe o PDF da proposta pelo botão ao lado.",
  "Acesse o Assinador gov.br e entre com sua conta gov.br (nível prata ou ouro).",
  "Envie o PDF, posicione a assinatura e confirme com o código do app gov.br.",
  "Baixe o arquivo assinado e envie aqui embaixo.",
];

export default async function PropostaPage({ params }) {
  const { cliente, db } = await exigirCliente();
  const p = db.propostas.find((x) => x.id === params.id && x.clienteId === cliente.id);
  if (!p) notFound();

  const status = statusAtual(p);
  const podeEnviar = status === "aguardando" || status === "conferencia";
  const pdf = `/api/portal/arquivos/${p.id}/original`;
  const msgPagamento = `Olá! Assinei a proposta ${p.codigo} (${p.titulo}) e gostaria de combinar o pagamento.`;
  const msgDuvida = `Olá! Tenho uma dúvida sobre a proposta ${p.codigo} (${p.titulo}).`;

  return (
    <PortalShell>
      <Link href="/cliente" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8">
        ← Minhas propostas
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-white/50 mb-2">{p.codigo}</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{p.titulo}</h1>
          <StatusBadge status={status} />
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        <div className="space-y-6">
          {p.resumo && (
            <section className={card}>
              <h2 className="text-lg font-bold mb-3">Resumo</h2>
              <p className="text-white/75 whitespace-pre-line leading-relaxed">{p.resumo}</p>
            </section>
          )}

          <section className={`${card} !p-0 overflow-hidden`}>
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-white/10">
              <h2 className="font-bold">Proposta completa</h2>
              <div className="flex gap-2">
                <a href={pdf} target="_blank" rel="noopener" className="hidden md:inline text-sm text-blue-400 hover:underline">Abrir em nova aba</a>
              </div>
            </div>
            {/* Celulares não exibem PDF dentro da página: lá aparece um botão */}
            <iframe src={pdf} title={`Proposta ${p.codigo}`} className="hidden md:block w-full h-[70vh] bg-white" />
            <div className="md:hidden p-6">
              <a href={pdf} target="_blank" rel="noopener" className={`${btnSecundario} w-full`}>Abrir proposta (PDF)</a>
            </div>
          </section>

          {podeEnviar && (
            <section className={card}>
              <h2 className="text-lg font-bold mb-2">Assinar com gov.br</h2>
              <p className="text-white/70 mb-6">A assinatura é gratuita e feita no site oficial do governo.</p>
              <ol className="space-y-3 mb-6">
                {PASSOS.map((passo, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-sm font-bold text-blue-300">{i + 1}</span>
                    <span className="text-white/80 pt-0.5">{passo}</span>
                  </li>
                ))}
              </ol>
              <a href="https://assinador.iti.br" target="_blank" rel="noopener noreferrer" className={`${btnSecundario} mb-8`}>
                Abrir Assinador gov.br ↗
              </a>

              {status === "conferencia" && (
                <p className="mb-4 rounded-xl border border-blue-400/30 bg-blue-400/10 p-4 text-sm text-blue-200">
                  Recebemos sua proposta assinada em {dataHora(p.assinadaEm)}. Estamos conferindo a assinatura.
                  Se precisar, você pode enviar uma nova versão.
                </p>
              )}
              <EnvioAssinatura propostaId={p.id} jaEnviada={status === "conferencia"} />
            </section>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28">
          <section className={card}>
            <p className="text-sm text-white/50 mb-1">Investimento</p>
            <p className="text-3xl font-bold mb-4">{moeda(p.valor)}</p>
            <dl className="space-y-3 text-sm">
              {p.condicoes && (
                <div><dt className="text-white/50">Condições</dt><dd>{p.condicoes}</dd></div>
              )}
              {p.prazo && (
                <div><dt className="text-white/50">Prazo de entrega</dt><dd>{p.prazo}</dd></div>
              )}
              {p.validade && (
                <div><dt className="text-white/50">Válida até</dt><dd>{data(p.validade)}</dd></div>
              )}
            </dl>
            <a href={`${pdf}?baixar`} className={`${btnPrimario} w-full mt-6`}>Baixar PDF</a>
          </section>

          {(status === "conferencia" || status === "aprovada") && (
            <section className={card}>
              <h2 className="font-bold mb-2">Pagamento</h2>
              <p className="text-sm text-white/70 mb-5">
                O pagamento é combinado diretamente pelo WhatsApp, com a forma que for melhor para você.
              </p>
              <a href={linkWhatsApp(msgPagamento)} target="_blank" rel="noopener noreferrer" className={`${btnWhats} w-full`}>
                Combinar pagamento
              </a>
            </section>
          )}

          <section className={card}>
            <h2 className="font-bold mb-4">Histórico</h2>
            <ol className="space-y-3 text-sm">
              {[...p.historico].reverse().map((h, i) => (
                <li key={i} className="border-l-2 border-white/10 pl-4">
                  <p className="text-white/80">{h.texto}</p>
                  <p className="text-white/40">{dataHora(h.em)}</p>
                </li>
              ))}
            </ol>
            <a href={linkWhatsApp(msgDuvida)} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block text-sm text-blue-400 hover:underline">
              Dúvidas? Fale no WhatsApp
            </a>
          </section>
        </aside>
      </div>
    </PortalShell>
  );
}
