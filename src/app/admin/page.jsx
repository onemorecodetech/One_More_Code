import PortalShell from "@/components/portal/shell";
import StatusBadge, { TipoBadge } from "@/components/portal/status";
import BotaoSair from "@/components/portal/botao-sair";
import NovaProposta from "@/components/portal/nova-proposta";
import AcoesProposta from "@/components/portal/acoes-proposta";
import BotaoExcluir from "@/components/portal/botao-excluir";
import { exigirAdmin } from "@/lib/portal/auth";
import { statusAtual, moeda, data, dataHora, tipoDe } from "@/lib/portal/util";
import { card } from "@/components/portal/ui";

export const dynamic = "force-dynamic";

const ORDEM = { conferencia: 0, aguardando: 1, expirada: 2, aprovada: 3, cancelada: 4 };

export default async function AdminPage() {
  const { db } = await exigirAdmin();
  const clientes = [...db.clientes].sort((a, b) => a.nome.localeCompare(b.nome));
  const porId = Object.fromEntries(db.clientes.map((c) => [c.id, c]));

  const propostas = db.propostas
    .map((p) => ({ ...p, atual: statusAtual(p) }))
    .sort((a, b) => ORDEM[a.atual] - ORDEM[b.atual] || b.criadaEm.localeCompare(a.criadaEm));

  const contagem = (s) => propostas.filter((p) => p.atual === s).length;
  const resumo = [
    { label: "Para conferir", valor: contagem("conferencia"), destaque: contagem("conferencia") > 0 },
    { label: "Aguardando cliente", valor: contagem("aguardando") },
    { label: "Confirmadas", valor: contagem("aprovada") },
    { label: "Clientes", valor: clientes.length },
  ];

  return (
    <PortalShell>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Propostas e contratos</h1>
        <BotaoSair destino="/admin/entrar" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {resumo.map((r) => (
          <div key={r.label} className={`rounded-2xl border p-5 ${r.destaque ? "border-blue-400/50 bg-blue-500/10" : "border-white/10 bg-white/5"}`}>
            <p className="text-3xl font-bold">{r.valor}</p>
            <p className="text-sm text-white/60">{r.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-10">
        <NovaProposta
          clientes={clientes.map(({ id, nome, empresa, email }) => ({ id, nome, empresa, email }))}
          propostas={propostas
            .filter((p) => (p.tipo || "proposta") === "proposta")
            .map((p) => ({
              id: p.id,
              codigo: p.codigo,
              titulo: p.titulo,
              clienteId: p.clienteId,
              status: p.atual,
              // contrato que ainda vale (não cancelado) para esta proposta
              contrato: propostas.find((c) => c.tipo === "contrato" && c.propostaRelacionada?.id === p.id && c.atual !== "cancelada")?.codigo || null,
            }))}
        />
      </div>

      <section className="mb-14">
        {propostas.length === 0 ? (
          <p className={`${card} text-white/60`}>Nenhum documento enviado ainda.</p>
        ) : (
          <ul className="grid gap-4">
            {propostas.map((p) => {
              const c = porId[p.clienteId];
              return (
                <li key={p.id} className={`${card} !p-6`}>
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <TipoBadge doc={p} />
                        <p className="text-sm text-white/50">{p.codigo} · enviado em {data(p.criadaEm)}</p>
                      </div>
                      <h2 className="text-lg font-bold">{p.titulo}</h2>
                      <p className="text-sm text-white/70">
                        {c ? `${c.nome}${c.empresa ? ` · ${c.empresa}` : ""}` : "Cliente removido"}
                      </p>
                    </div>
                    <div className="text-right">
                      {p.valor > 0 && <p className="font-bold mb-2">{moeda(p.valor)}</p>}
                      <StatusBadge status={p.atual} doc={p} />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm mb-4">
                    <a href={`/api/portal/arquivos/${p.id}/original`} target="_blank" rel="noopener" className="text-blue-400 hover:underline">PDF enviado</a>
                    {p.propostaRelacionada && (
                      <span className="text-white/50">Referente à proposta {p.propostaRelacionada.codigo}</span>
                    )}
                    {p.arquivoAssinado && (
                      <>
                        <a href={`/api/portal/arquivos/${p.id}/assinada?baixar`} className="text-emerald-400 hover:underline">
                          Baixar PDF assinado ({dataHora(p.assinadaEm)})
                        </a>
                        <a href="https://validar.iti.gov.br" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white hover:underline">
                          Validar assinatura no ITI ↗
                        </a>
                      </>
                    )}
                    {c && (
                      <a
                        href={`https://wa.me/55${c.whatsapp.replace(/^55/, "")}?text=${encodeURIComponent(`Olá, ${c.nome.split(" ")[0]}! ${tipoDe(p).artigo === "o" ? "Seu contrato" : "Sua proposta"} ${p.codigo} está disponível para assinatura na área do cliente: https://onemorecode.tech/cliente`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/60 hover:text-white hover:underline"
                      >
                        Avisar cliente no WhatsApp ↗
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <AcoesProposta id={p.id} status={p.atual} />
                    <BotaoExcluir
                      url={`/api/portal/admin/propostas/${p.id}`}
                      confirmacao={`Excluir ${tipoDe(p).artigo} ${tipoDe(p).nome.toLowerCase()} ${p.codigo} de vez? Os PDFs também serão apagados. Isso não pode ser desfeito.`}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Clientes cadastrados</h2>
        {clientes.length === 0 ? (
          <p className="text-white/60">Nenhum cliente ainda. Envie o link onemorecode.tech/cliente/cadastro para o cliente criar a conta.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left text-white/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Empresa</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">WhatsApp</th>
                  <th className="px-4 py-3 font-medium">Desde</th>
                  <th className="px-4 py-3 font-medium"><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.id} className="border-t border-white/10">
                    <td className="px-4 py-3">{c.nome}</td>
                    <td className="px-4 py-3 text-white/70">{c.empresa || "—"}</td>
                    <td className="px-4 py-3 text-white/70">{c.email}</td>
                    <td className="px-4 py-3 text-white/70">{c.whatsapp}</td>
                    <td className="px-4 py-3 text-white/70">{data(c.criadoEm)}</td>
                    <td className="px-4 py-2 text-right">
                      <BotaoExcluir
                        url={`/api/portal/admin/clientes/${c.id}`}
                        confirmacao={`Excluir o cliente ${c.nome} de vez? Todas as propostas, contratos e PDFs dele também serão apagados. Isso não pode ser desfeito.`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PortalShell>
  );
}
