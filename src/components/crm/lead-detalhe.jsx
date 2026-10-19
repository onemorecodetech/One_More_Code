"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Mail, Globe, Pencil, Plus, Archive, Trash2, Link2, FileText, Check, Copy } from "lucide-react";
import { ETAPA, TIPOS_CONTATO, STATUS_REUNIAO, STATUS_APRESENTACAO, moeda, dataBR } from "@/lib/crm/config";
import { api, btnAzul, btnLinha, card, inp, Modal, Prioridade, Erro } from "./ui";
import BotaoSair from "@/components/portal/botao-sair";
import { LeadForm, MudarEtapa, SeletorEtapa, InteracaoForm, AtividadeForm, ReuniaoForm } from "./formularios";

const STATUS_DOC = { aguardando: "Aguardando assinatura", conferencia: "Assinatura em conferência", aprovada: "Assinatura confirmada", cancelada: "Cancelado(a)" };
const SITE = typeof window !== "undefined" ? window.location.origin : "";

export default function LeadDetalhe({ id }) {
  const [d, setD] = useState(null); const [erro, setErro] = useState(""); const [modal, setModal] = useState(null); const [servicos, setServicos] = useState([]);
  const carregar = useCallback(async () => {
    try { setD(await api(`/api/portal/admin/crm/${id}`)); } catch (e) { setErro(e.message); }
  }, [id]);
  useEffect(() => { carregar(); api("/api/portal/admin/crm?visao=servicos").then((r) => setServicos(r.servicos)).catch(() => {}); }, [carregar]);

  if (erro) return <p role="alert" className="text-red-400">{erro} <Link href="/admin/crm" className="underline">Voltar ao CRM</Link></p>;
  if (!d) return <p className="text-white/50">Carregando...</p>;
  const l = d.lead; const fechar = () => setModal(null); const salvo = () => { setModal(null); carregar(); };

  async function patch(body) { try { await api(`/api/portal/admin/crm/${id}`, { method: "PATCH", body }); carregar(); } catch (e) { setErro(e.message); } }
  async function mover(etapa) { if (etapa === "fechado" || etapa === "perdido") setModal({ tipo: "etapa", etapa }); else patch({ etapa }); }
  async function excluir() {
    if (!confirm(`Excluir "${l.nome}" de vez? O histórico, as atividades e as reuniões dela também serão apagados.`)) return;
    try { await api(`/api/portal/admin/crm/${id}`, { method: "DELETE" }); window.location.href = "/admin/crm"; } catch (e) { setErro(e.message); }
  }
  async function concluirAtividade(a) { await api("/api/portal/admin/crm/itens", { method: "POST", body: { tipo: "atividade", dados: { id: a.id, status: "concluida" } } }); carregar(); }

  const whats = l.telefone ? `https://wa.me/${l.telefone.replace(/\D/g, "").replace(/^(?!55)/, "55")}` : null;
  const proposta = new URLSearchParams({ novo: "proposta", cliente: l.clienteId || "", titulo: l.servico || "", valor: l.valorEstimado ?? "" }).toString();
  const contrato = new URLSearchParams({ novo: "contrato", cliente: l.clienteId || "" }).toString();
  const linhaDoTempo = [
    ...(l.historico || []).map((h) => ({ em: h.em, texto: h.texto, tipo: "Sistema" })),
    ...d.interacoes.map((i) => ({ em: i.em, texto: `${TIPOS_CONTATO[i.tipo]}: ${i.resumo}`, tipo: "Contato (manual)" })),
    ...d.reunioes.map((r) => ({ em: r.quando, texto: `Reunião: ${r.titulo} (${STATUS_REUNIAO[r.status]})`, tipo: "Reunião" })),
  ].sort((a, b) => String(b.em).localeCompare(String(a.em)));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-5">
          <Link href="/admin/crm" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"><ArrowLeft size={16} />CRM Comercial</Link>
          <Link href="/admin" className="text-sm text-white/60 hover:text-white">Painel principal</Link>
        </div>
        <BotaoSair destino="/admin/entrar" />
      </div>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">{l.nome}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/60"><span>Etapa: <strong className="text-white">{ETAPA[l.etapa].nome}</strong></span><Prioridade valor={l.prioridade} />{l.arquivado && <span className="text-amber-300">Arquivada</span>}{l.clienteId && <span className="text-emerald-300">Cliente</span>}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {whats && <a href={whats} target="_blank" rel="noopener noreferrer" className={btnLinha}><MessageCircle size={16} />WhatsApp</a>}
          {l.instagram && <a href={`https://instagram.com/${l.instagram}`} target="_blank" rel="noopener noreferrer" className={btnLinha}>Instagram</a>}
          {l.email && <a href={`mailto:${l.email}`} className={btnLinha}><Mail size={16} />E-mail</a>}
          {l.site && <a href={l.site} target="_blank" rel="noopener noreferrer" className={btnLinha}><Globe size={16} />Site</a>}
        </div>
      </header>
      {d.duplicados.length > 0 && <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">Possível duplicidade com: {d.duplicados.map((x, i) => <span key={x.id}>{i ? ", " : ""}<Link className="underline" href={`/admin/crm/${x.id}`}>{x.nome}</Link></span>)}</p>}
      <Erro msg={erro} />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px] items-start">
        <div className="space-y-6">
          <Secao titulo="Informações gerais" acao={<button onClick={() => setModal({ tipo: "editar" })} className={btnLinha}><Pencil size={16} />Editar</button>}>
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {[["Responsável", l.responsavel], ["Segmento", l.segmento], ["Cidade", [l.cidade, l.uf].filter(Boolean).join("/")], ["Telefone", l.telefone], ["E-mail", l.email], ["Instagram", l.instagram && `@${l.instagram}`], ["Site", l.site], ["Origem", l.origem], ["Responsável comercial", l.responsavelComercial], ["Primeiro contato", l.primeiroContato && dataBR(l.primeiroContato)]].map(([k, x]) => <div key={k}><dt className="text-white/40">{k}</dt><dd className="break-words">{x || "—"}</dd></div>)}
            </dl>
            {l.observacoes && <p className="mt-4 whitespace-pre-line rounded-xl bg-white/5 p-3 text-sm text-white/70"><span className="block text-xs text-white/40 mb-1">Observações internas</span>{l.observacoes}</p>}
          </Secao>

          <Secao titulo="Histórico de contatos" acao={<button onClick={() => setModal({ tipo: "interacao" })} className={btnLinha}><Plus size={16} />Registrar contato</button>}>
            {d.interacoes.length === 0 ? <p className="text-sm text-white/40">Nenhum contato registrado.</p> : (
              <ul className="space-y-3">{d.interacoes.map((i) => (
                <li key={i.id} className="rounded-xl border border-white/10 p-3 text-sm">
                  <div className="flex items-start justify-between gap-3"><p><strong>{TIPOS_CONTATO[i.tipo]}</strong> · {dataBR(i.em)} <span className="text-xs text-white/40">· registro manual</span></p><button onClick={() => setModal({ tipo: "interacao", item: i })} className="text-xs text-blue-400 hover:underline">Editar</button></div>
                  <p className="mt-1 text-white/80 whitespace-pre-line">{i.resumo}</p>
                  {i.resultado && <p className="mt-1 text-white/60">Resultado: {i.resultado}</p>}
                  {i.proximaAcao && <p className="mt-1 text-white/60">Próxima ação: {i.proximaAcao}</p>}
                </li>))}
              </ul>
            )}
          </Secao>

          <Secao titulo="Atividades" acao={<button onClick={() => setModal({ tipo: "atividade" })} className={btnLinha}><Plus size={16} />Nova</button>}>
            {d.atividades.length === 0 ? <p className="text-sm text-white/40">Nenhuma atividade.</p> : (
              <ul className="space-y-2">{d.atividades.sort((a, b) => a.quando.localeCompare(b.quando)).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className={a.status !== "pendente" ? "text-white/40 line-through" : ""}>{dataBR(a.quando)} · {a.titulo}</span>
                  <span className="flex gap-2">{a.status === "pendente" && <button onClick={() => concluirAtividade(a)} aria-label="Concluir" className="text-emerald-300"><Check size={16} /></button>}<button onClick={() => setModal({ tipo: "atividade", item: a })} className="text-xs text-blue-400">Editar</button></span>
                </li>))}
              </ul>
            )}
          </Secao>

          <Secao titulo="Reuniões" acao={<button onClick={() => setModal({ tipo: "reuniao" })} className={btnLinha}><Plus size={16} />Agendar</button>}>
            {d.reunioes.length === 0 ? <p className="text-sm text-white/40">Nenhuma reunião.</p> : (
              <ul className="space-y-2">{d.reunioes.sort((a, b) => b.quando.localeCompare(a.quando)).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 text-sm"><span>{dataBR(r.quando)} · {r.titulo} <span className="text-white/40">({STATUS_REUNIAO[r.status]})</span></span><button onClick={() => setModal({ tipo: "reuniao", item: r })} className="text-xs text-blue-400">Editar</button></li>))}
              </ul>
            )}
          </Secao>

          <Secao titulo="Linha do tempo">
            <ol className="space-y-3 border-l border-white/10 pl-4">{linhaDoTempo.map((e, i) => <li key={i} className="text-sm"><p className="text-white/80">{e.texto}</p><p className="text-xs text-white/40">{dataBR(String(e.em).slice(0, 16).replace(" ", "T"))} · {e.tipo}</p></li>)}</ol>
          </Secao>
        </div>

        <aside className="space-y-6">
          <Secao titulo="Negociação">
            <SeletorEtapa valor={l.etapa} onChange={mover} />
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-white/50">Serviço</dt><dd>{l.servico || "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-white/50">Valor estimado</dt><dd>{moeda(l.valorEstimado)}</dd></div>
              <div className="flex justify-between"><dt className="text-white/50">Mensalidade estimada</dt><dd>{moeda(l.mensalidadeEstimada)}</dd></div>
              {l.probabilidade != null && <div className="flex justify-between"><dt className="text-white/50">Probabilidade</dt><dd>{l.probabilidade}%</dd></div>}
              <div className="flex justify-between"><dt className="text-white/50">Último contato</dt><dd>{dataBR(l.ultimoContato)}</dd></div>
              <div className="flex justify-between"><dt className="text-white/50">Próximo acompanhamento</dt><dd>{dataBR(l.proximoAcompanhamento)}</dd></div>
              {l.etapa === "fechado" && <><div className="flex justify-between text-emerald-300"><dt>Valor combinado</dt><dd>{moeda(l.valorFechado)}</dd></div><div className="flex justify-between text-emerald-300"><dt>Mensalidade combinada</dt><dd>{moeda(l.mensalidadeFechada)}</dd></div></>}
              {l.etapa === "perdido" && <p className="text-red-300">Motivo: {l.motivoPerda}</p>}
            </dl>
          </Secao>

          <Secao titulo="Projeto demonstrativo">
            {l.prototipo?.nome || l.prototipo?.link ? (
              <div className="space-y-1 text-sm">
                <p className="font-medium">{l.prototipo.nome || "Protótipo"}</p>
                {l.prototipo.link && <a href={l.prototipo.link} target="_blank" rel="noopener noreferrer" className="break-all text-blue-400 hover:underline">{l.prototipo.link}</a>}
                <p className="text-white/50">{STATUS_APRESENTACAO[l.prototipo.apresentacao]}{l.prototipo.criadoEm ? ` · criado em ${dataBR(l.prototipo.criadoEm)}` : ""}</p>
                {l.prototipo.observacoes && <p className="text-white/60 whitespace-pre-line">{l.prototipo.observacoes}</p>}
              </div>
            ) : <p className="text-sm text-white/40">Nenhum protótipo. Use "Editar" para adicionar.</p>}
          </Secao>

          <Secao titulo="Propostas e contratos">
            {!l.clienteId ? <p className="text-sm text-white/50">Para criar propostas e contratos, primeiro vincule esta empresa a uma conta da área do cliente (abaixo).</p> : (
              <>
                {d.documentos.length === 0 ? <p className="mb-3 text-sm text-white/40">Nenhum documento ainda.</p> : (
                  <ul className="mb-4 space-y-2 text-sm">{d.documentos.map((doc) => (
                    <li key={doc.id} className="flex items-start justify-between gap-2"><span><FileText size={14} className="mr-1 inline" />{doc.codigo} · {doc.titulo}<br /><span className="text-xs text-white/50">{STATUS_DOC[doc.status] || doc.status}{doc.valor ? ` · ${moeda(doc.valor)}` : ""}</span></span><a href={`/api/portal/arquivos/${doc.id}/original`} target="_blank" rel="noopener" className="shrink-0 text-xs text-blue-400">Ver PDF</a></li>))}
                  </ul>
                )}
                <div className="flex flex-wrap gap-2">
                  <a href={`/admin?${proposta}`} className={btnLinha}>Criar proposta</a>
                  <a href={`/admin?${contrato}`} className={btnLinha}>Criar contrato</a>
                </div>
                <p className="mt-2 text-xs text-white/40">Abre o fluxo existente com os dados preenchidos. O contrato só é liberado com proposta assinada e confirmada.</p>
              </>
            )}
          </Secao>

          <Secao titulo="Conversão em cliente">
            {l.clienteId ? (
              <div className="text-sm"><p className="text-emerald-300">Vinculada à conta de {d.cliente?.nome} ({d.cliente?.email}).</p><button onClick={() => confirm("Remover o vínculo com a área do cliente? O histórico é mantido.") && patch({ desvincularCliente: true })} className="mt-2 text-xs text-white/50 underline">Remover vínculo</button></div>
            ) : <Conversao d={d} onVincular={(cid) => patch({ vincularCliente: cid })} />}
          </Secao>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => patch({ arquivado: !l.arquivado })} className={btnLinha}><Archive size={16} />{l.arquivado ? "Reativar" : "Arquivar"}</button>
            <button onClick={excluir} className={`${btnLinha} hover:!border-red-400 hover:!text-red-300`}><Trash2 size={16} />Excluir</button>
          </div>
        </aside>
      </div>

      <Modal titulo="Editar empresa" aberto={modal?.tipo === "editar"} onFechar={fechar} largo>{modal?.tipo === "editar" && <LeadForm lead={l} servicos={servicos} onSalvo={salvo} onCancelar={fechar} />}</Modal>
      <Modal titulo={modal?.etapa === "fechado" ? "Fechar negociação" : "Negociação perdida"} aberto={modal?.tipo === "etapa"} onFechar={fechar}>{modal?.tipo === "etapa" && <MudarEtapa lead={l} etapa={modal.etapa} onFeito={salvo} onCancelar={fechar} />}</Modal>
      <Modal titulo="Contato" aberto={modal?.tipo === "interacao"} onFechar={fechar}>{modal?.tipo === "interacao" && <InteracaoForm leadId={id} item={modal.item} onSalvo={salvo} onCancelar={fechar} />}</Modal>
      <Modal titulo="Atividade" aberto={modal?.tipo === "atividade"} onFechar={fechar}>{modal?.tipo === "atividade" && <AtividadeForm item={modal.item} leadFixo={id} onSalvo={salvo} onCancelar={fechar} />}</Modal>
      <Modal titulo="Reunião" aberto={modal?.tipo === "reuniao"} onFechar={fechar} largo>{modal?.tipo === "reuniao" && <ReuniaoForm item={modal.item} leadFixo={id} onSalvo={salvo} onCancelar={fechar} />}</Modal>
    </div>
  );
}

function Secao({ titulo, acao, children }) {
  return <section className={`${card} p-5`}><div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-semibold">{titulo}</h2>{acao}</div>{children}</section>;
}

// Vincula a uma conta existente da área do cliente. Nunca cria conta nem senha automaticamente.
function Conversao({ d, onVincular }) {
  const [escolhido, setEscolhido] = useState(""); const [copiado, setCopiado] = useState(false);
  const link = `${SITE}/cliente/cadastro`;
  const msg = `Olá${d.lead.responsavel ? `, ${d.lead.responsavel.split(" ")[0]}` : ""}! Para acessar suas propostas e contratos da OneMoreCode, crie sua conta na área do cliente: ${link}`;
  const whats = d.lead.telefone ? `https://wa.me/${d.lead.telefone.replace(/\D/g, "").replace(/^(?!55)/, "55")}?text=${encodeURIComponent(msg)}` : null;
  function vincular(id) { const c = d.clientes.find((x) => x.id === id) || d.sugestoesCliente.find((x) => x.id === id); if (c && confirm(`Vincular "${d.lead.nome}" à conta de ${c.nome} (${c.email})? O histórico da negociação é mantido.`)) onVincular(id); }
  return (
    <div className="space-y-4 text-sm">
      {d.sugestoesCliente.length > 0 && (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3">
          <p className="mb-2">Encontramos uma conta com o mesmo e-mail ou telefone:</p>
          {d.sugestoesCliente.map((c) => <button key={c.id} onClick={() => vincular(c.id)} className={`${btnAzul} w-full`}><Link2 size={16} />Vincular a {c.nome}</button>)}
        </div>
      )}
      {d.clientes.length > 0 && (
        <div className="flex gap-2">
          <select value={escolhido} onChange={(e) => setEscolhido(e.target.value)} aria-label="Conta da área do cliente" className={`${inp} !py-2 text-sm`}><option value="">Escolher conta existente...</option>{d.clientes.map((c) => <option key={c.id} value={c.id}>{c.nome} ({c.email})</option>)}</select>
          <button disabled={!escolhido} onClick={() => vincular(escolhido)} className={btnLinha}>Vincular</button>
        </div>
      )}
      <div className="rounded-xl bg-white/5 p-3">
        <p className="mb-2 text-white/60">Ainda não tem conta? Envie o link de cadastro (a pessoa cria a própria senha):</p>
        <div className="flex flex-wrap gap-2">
          {whats && <a href={whats} target="_blank" rel="noopener noreferrer" className={btnLinha}><MessageCircle size={16} />Enviar pelo WhatsApp</a>}
          <button onClick={() => navigator.clipboard?.writeText(msg).then(() => setCopiado(true))} className={btnLinha}><Copy size={16} />{copiado ? "Copiado!" : "Copiar mensagem"}</button>
        </div>
        <p className="mt-2 text-xs text-white/40">Depois que a pessoa se cadastrar com o mesmo e-mail ou telefone, a conta aparece aqui para vincular.</p>
      </div>
    </div>
  );
}
