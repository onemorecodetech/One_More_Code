"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Columns3, Building2, ListChecks, CalendarDays, BarChart3, Plus, Search, AlertTriangle, Check, Download, ArrowLeft } from "lucide-react";
import BotaoSair from "@/components/portal/botao-sair";
import { ETAPAS, ETAPA, PRIORIDADES, STATUS_ATIVIDADE, STATUS_REUNIAO, DIAS_SEM_CONTATO, moeda, dataBR, diasDesde, agoraBR, hojeBR } from "@/lib/crm/config";
import { filtrarLeads } from "@/lib/crm/filtros";
import { api, inp, btnAzul, btnLinha, card, Modal, Prioridade } from "./ui";
import { LeadForm, MudarEtapa, SeletorEtapa, AtividadeForm, ReuniaoForm } from "./formularios";

const ABAS = [
  ["geral", "Visão geral", LayoutDashboard], ["funil", "Funil de vendas", Columns3], ["empresas", "Empresas e contatos", Building2],
  ["atividades", "Atividades", ListChecks], ["reunioes", "Reuniões", CalendarDays], ["relatorios", "Relatórios", BarChart3],
];

export default function PainelCRM() {
  const [aba, setAba] = useState("geral");
  const [leads, setLeads] = useState(null); const [servicos, setServicos] = useState([]);
  const [modal, setModal] = useState(null); // { tipo, ... }
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    try { const d = await api("/api/portal/admin/crm?visao=leads"); setLeads(d.leads); setServicos(d.servicos); } catch (e) { setErro(e.message); }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  async function moverEtapa(lead, etapa) {
    if (etapa === lead.etapa) return;
    if (etapa === "fechado" || etapa === "perdido") return setModal({ tipo: "etapa", lead, etapa });
    setLeads((ls) => ls.map((l) => (l.id === lead.id ? { ...l, etapa } : l)));
    try { await api(`/api/portal/admin/crm/${lead.id}`, { method: "PATCH", body: { etapa } }); } catch (e) { setErro(e.message); }
    carregar();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"><ArrowLeft size={16} aria-hidden="true" />Voltar ao painel</Link>
        <BotaoSair destino="/admin/entrar" />
      </div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-bold">CRM Comercial</h1>
        <button onClick={() => setModal({ tipo: "lead" })} className={btnAzul}><Plus size={18} />Nova empresa</button>
      </div>
      <nav className="mb-8 flex gap-2 overflow-x-auto pb-2" aria-label="Seções do CRM">
        {ABAS.map(([id, nome, Icone]) => (
          <button key={id} onClick={() => setAba(id)} aria-current={aba === id ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${aba === id ? "border-blue-400 bg-blue-500/15 text-white" : "border-white/10 text-white/60 hover:text-white"}`}>
            <Icone size={16} aria-hidden="true" />{nome}
          </button>
        ))}
      </nav>
      {erro && <p role="alert" className="mb-4 text-sm text-red-400">{erro}</p>}
      {!leads ? <p className="text-white/50">Carregando...</p> : (
        <>
          {aba === "geral" && <VisaoGeral />}
          {aba === "funil" && <Funil leads={leads} servicos={servicos} onMover={moverEtapa} />}
          {aba === "empresas" && <Empresas leads={leads} servicos={servicos} onMover={moverEtapa} />}
          {aba === "atividades" && <Atividades />}
          {aba === "reunioes" && <Reunioes />}
          {aba === "relatorios" && <Relatorios leads={leads} servicos={servicos} />}
        </>
      )}
      <Modal titulo="Nova empresa" aberto={modal?.tipo === "lead"} onFechar={() => setModal(null)} largo>
        <LeadForm servicos={servicos} onSalvo={(l) => { setModal(null); window.location.href = `/admin/crm/${l.id}`; }} onCancelar={() => setModal(null)} />
      </Modal>
      <Modal titulo={modal?.etapa === "fechado" ? "Fechar negociação" : "Negociação perdida"} aberto={modal?.tipo === "etapa"} onFechar={() => setModal(null)}>
        {modal?.tipo === "etapa" && <MudarEtapa lead={modal.lead} etapa={modal.etapa} onFeito={() => { setModal(null); carregar(); }} onCancelar={() => setModal(null)} />}
      </Modal>
    </div>
  );
}

// ── Visão geral ───────────────────────────────────────────
function VisaoGeral() {
  const [d, setD] = useState(null); const [falha, setFalha] = useState("");
  const carregar = useCallback(() => api("/api/portal/admin/crm?visao=resumo").then((r) => { setD(r); setFalha(""); }).catch((e) => setFalha(e.message)), []);
  useEffect(() => { carregar(); }, [carregar]);
  async function concluir(a) { await api("/api/portal/admin/crm/itens", { method: "POST", body: { tipo: "atividade", dados: { id: a.id, status: "concluida" } } }); carregar(); }
  if (falha && !d) return <p role="alert" className="text-red-400">Não foi possível carregar a visão geral: {falha} <button onClick={carregar} className="underline">Tentar de novo</button></p>;
  if (!d) return <p className="text-white/50">Carregando...</p>;
  const t = d.totais, v = d.valores, g = d.graficos;
  const ind = [["Leads", t.leads], ["Ativos", t.ativos], ["Novos no mês", t.novosNoMes], ["Em andamento", t.emAndamento], ["Reuniões agendadas", t.reunioesAgendadas], ["Propostas enviadas", t.propostasEnviadas], ["Fechados", t.contratosFechados], ["Perdidos", t.perdidos], ["Conversão", t.taxaConversao == null ? "—" : `${t.taxaConversao}%`], ["Tempo médio até fechar", t.tempoMedioDias == null ? "—" : `${t.tempoMedioDias} dias`]];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{ind.map(([n, x]) => <div key={n} className={`${card} p-4`}><p className="text-2xl font-bold">{x}</p><p className="text-xs text-white/50">{n}</p></div>)}</div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className={`${card} p-5`}><p className="text-xs uppercase tracking-widest text-white/40 mb-3">Estimado (oportunidades em aberto)</p><p className="text-sm text-white/60">Implantação: <strong className="text-white text-lg">{moeda(v.estimadoAberto)}</strong></p><p className="text-sm text-white/60">Mensalidades: <strong className="text-white text-lg">{moeda(v.mensalidadeEstimadaAberta)}</strong>/mês</p><p className="mt-2 text-xs text-white/40">Previsão, não é faturamento.</p></div>
        <div className={`${card} p-5 border-emerald-400/20`}><p className="text-xs uppercase tracking-widest text-emerald-300/70 mb-3">Combinado nos fechamentos</p><p className="text-sm text-white/60">Implantação: <strong className="text-white text-lg">{moeda(v.combinadoFechado)}</strong></p><p className="text-sm text-white/60">Mensalidades: <strong className="text-white text-lg">{moeda(v.mensalidadeCombinadaFechada)}</strong>/mês</p><p className="mt-2 text-xs text-white/40">Valores informados ao fechar. O sistema não registra pagamentos recebidos.</p></div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Lista titulo="Atividades atrasadas" vazio="Nenhuma atividade atrasada." itens={d.atrasadas} alerta render={(a) => <ItemAtividade a={a} nome={d.nomes[a.leadId]} onConcluir={() => concluir(a)} />} />
        <Lista titulo="Atividades de hoje" vazio="Nada para hoje." itens={d.hoje} render={(a) => <ItemAtividade a={a} nome={d.nomes[a.leadId]} onConcluir={() => concluir(a)} />} />
        <Lista titulo="Próximas reuniões" vazio="Nenhuma reunião agendada." itens={d.proximasReunioes} render={(r) => <div><p className="font-medium">{r.titulo}</p><p className="text-sm text-white/50">{dataBR(r.quando)}{r.leadId ? <> · <Link className="text-blue-400" href={`/admin/crm/${r.leadId}`}>{d.nomes[r.leadId]}</Link></> : null}</p></div>} />
      </div>
      {d.parados.length > 0 && <Lista titulo={`Sem contato há ${DIAS_SEM_CONTATO}+ dias`} itens={d.parados} alerta render={(l) => <Link href={`/admin/crm/${l.id}`} className="hover:text-blue-300">{l.nome} <span className="text-sm text-white/50">· último contato {dataBR(l.ultimoContato)}</span></Link>} />}
      <div className="grid gap-6 lg:grid-cols-2">
        <Barras titulo="Leads por etapa" dados={ETAPAS.map((e) => [e.nome, g.porEtapa[e.id] || 0])} />
        <Barras titulo="Serviços mais procurados" dados={Object.entries(g.servicos).sort((a, b) => b[1] - a[1])} />
        <Barras titulo="Novos leads por mês" dados={g.meses.map((m) => [m.split("-").reverse().join("/"), g.novosPorMes[m] || 0])} />
        <Barras titulo="Fechamentos por mês" dados={g.meses.map((m) => [m.split("-").reverse().join("/"), g.fechadosPorMes[m] || 0])} />
        <Barras titulo="Motivos de perda" dados={Object.entries(g.motivosPerda).sort((a, b) => b[1] - a[1])} />
      </div>
    </div>
  );
}

function Lista({ titulo, itens, render, vazio = "Nada por aqui.", alerta }) {
  return (
    <section className={`${card} p-5`}>
      <h2 className={`mb-4 flex items-center gap-2 font-semibold ${alerta && itens.length ? "text-amber-300" : ""}`}>{alerta && itens.length > 0 && <AlertTriangle size={16} />}{titulo}</h2>
      {itens.length ? <ul className="space-y-3">{itens.map((x) => <li key={x.id}>{render(x)}</li>)}</ul> : <p className="text-sm text-white/40">{vazio}</p>}
    </section>
  );
}

function ItemAtividade({ a, nome, onConcluir }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div><p className="font-medium">{a.titulo}</p><p className="text-sm text-white/50">{dataBR(a.quando)}{nome && a.leadId ? <> · <Link className="text-blue-400" href={`/admin/crm/${a.leadId}`}>{nome}</Link></> : null}</p></div>
      <button onClick={onConcluir} aria-label={`Concluir ${a.titulo}`} title="Concluir" className="shrink-0 rounded-lg border border-white/15 p-2 text-emerald-300 hover:border-emerald-400"><Check size={16} /></button>
    </div>
  );
}

function Barras({ titulo, dados }) {
  const max = Math.max(1, ...dados.map((d) => d[1]));
  return (
    <section className={`${card} p-5`}>
      <h2 className="mb-4 font-semibold">{titulo}</h2>
      {dados.length === 0 || dados.every((d) => !d[1]) ? <p className="text-sm text-white/40">Ainda não há dados.</p> : (
        <ul className="space-y-2.5">{dados.map(([n, x]) => (
          <li key={n} className="grid grid-cols-[9rem_1fr_2rem] items-center gap-3 text-sm">
            <span className="truncate text-white/60" title={n}>{n}</span>
            <span className="h-2.5 rounded-full bg-white/5"><span className="block h-full rounded-full bg-blue-600" style={{ width: `${(x / max) * 100}%` }} /></span>
            <span className="text-right text-white/80">{x}</span>
          </li>))}
        </ul>
      )}
    </section>
  );
}

// ── Funil (Kanban) ────────────────────────────────────────
function Filtros({ f, setF, servicos, extra }) {
  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className="relative"><Search size={16} className="absolute left-3 top-3 text-white/40" aria-hidden="true" /><input value={f.busca || ""} onChange={(e) => setF({ ...f, busca: e.target.value })} placeholder="Buscar empresa" aria-label="Buscar empresa" className={`${inp} pl-9`} /></label>
      <select value={f.servico || ""} onChange={(e) => setF({ ...f, servico: e.target.value })} aria-label="Serviço" className={inp}><option value="">Todos os serviços</option>{servicos.map((s) => <option key={s}>{s}</option>)}</select>
      <select value={f.prioridade || ""} onChange={(e) => setF({ ...f, prioridade: e.target.value })} aria-label="Prioridade" className={inp}><option value="">Toda prioridade</option>{Object.entries(PRIORIDADES).map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select>
      <input value={f.responsavel || ""} onChange={(e) => setF({ ...f, responsavel: e.target.value })} placeholder="Responsável" aria-label="Responsável" className={inp} />
      {extra}
    </div>
  );
}

function CardLead({ l, onMover, arrastavel }) {
  const parado = !["prospectado", "fechado", "perdido"].includes(l.etapa) && (diasDesde(l.ultimoContato || l.criadoEm) ?? 0) >= DIAS_SEM_CONTATO;
  return (
    <article draggable={arrastavel} onDragStart={(e) => e.dataTransfer.setData("text/plain", l.id)}
      className={`rounded-xl border bg-[#0f1422] p-3.5 text-sm ${parado ? "border-amber-400/40" : "border-white/10"} ${arrastavel ? "cursor-grab active:cursor-grabbing" : ""}`}>
      <div className="mb-1 flex items-start justify-between gap-2">
        <Link href={`/admin/crm/${l.id}`} className="font-semibold leading-snug hover:text-blue-300">{l.nome}</Link>
        <Prioridade valor={l.prioridade} />
      </div>
      {l.responsavel && <p className="text-white/50">{l.responsavel}</p>}
      {l.servico && <p className="mt-1 text-white/70">{l.servico}</p>}
      {(l.valorEstimado != null || l.mensalidadeEstimada != null) && <p className="mt-1 text-white/70">{moeda(l.valorEstimado)}{l.mensalidadeEstimada != null && ` + ${moeda(l.mensalidadeEstimada)}/mês`}</p>}
      <p className="mt-2 text-xs text-white/40">Último contato: {dataBR(l.ultimoContato)}{l.proximoAcompanhamento && <><br />Próximo: {dataBR(l.proximoAcompanhamento)}</>}{l.responsavelComercial && <><br />Resp.: {l.responsavelComercial}</>}</p>
      {parado && <p className="mt-2 flex items-center gap-1 text-xs text-amber-300"><AlertTriangle size={12} />Sem movimentação há {diasDesde(l.ultimoContato || l.criadoEm)} dias</p>}
      <SeletorEtapa valor={l.etapa} onChange={(e) => onMover(l, e)} className="mt-3" />
    </article>
  );
}

function Funil({ leads, servicos, onMover }) {
  const [f, setF] = useState({});
  const [sobre, setSobre] = useState(null);
  const lista = useMemo(() => filtrarLeads(leads, f), [leads, f]);
  return (
    <div>
      <Filtros f={f} setF={setF} servicos={servicos} />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {ETAPAS.map((e) => {
          const col = lista.filter((l) => l.etapa === e.id);
          const total = col.reduce((t, l) => t + (Number(l.valorEstimado) || 0), 0);
          return (
            <section key={e.id} aria-label={e.nome}
              onDragOver={(ev) => { ev.preventDefault(); setSobre(e.id); }} onDragLeave={() => setSobre(null)}
              onDrop={(ev) => { ev.preventDefault(); setSobre(null); const l = leads.find((x) => x.id === ev.dataTransfer.getData("text/plain")); if (l) onMover(l, e.id); }}
              className={`w-72 shrink-0 rounded-2xl border p-3 transition ${sobre === e.id ? "border-blue-400 bg-blue-500/10" : "border-white/10 bg-white/[0.03]"}`}>
              <header className="mb-3 flex items-center justify-between px-1">
                <h2 className="flex items-center gap-2 text-sm font-semibold"><span className={`h-2.5 w-2.5 rounded-full ${e.cor}`} />{e.nome}</h2>
                <span className="text-xs text-white/40">{col.length}{total ? ` · ${moeda(total)}` : ""}</span>
              </header>
              <div className="min-h-24 space-y-3">{col.map((l) => <CardLead key={l.id} l={l} onMover={onMover} arrastavel />)}</div>
            </section>
          );
        })}
      </div>
      <p className="text-xs text-white/40">Arraste os cards entre as colunas ou use o seletor de etapa em cada card. Arquivados não aparecem no funil.</p>
    </div>
  );
}

// ── Empresas ──────────────────────────────────────────────
function Empresas({ leads, servicos, onMover }) {
  const [f, setF] = useState({ arquivados: "nao" });
  const [ordem, setOrdem] = useState("atualizadoEm");
  const lista = useMemo(() => filtrarLeads(leads, f).sort((a, b) => ordem === "nome" ? a.nome.localeCompare(b.nome) : String(b[ordem] || "").localeCompare(String(a[ordem] || ""))), [leads, f, ordem]);
  return (
    <div>
      <Filtros f={f} setF={setF} servicos={servicos} extra={<>
        <select value={f.etapa || ""} onChange={(e) => setF({ ...f, etapa: e.target.value })} aria-label="Etapa" className={inp}><option value="">Todas as etapas</option>{ETAPAS.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}</select>
        <select value={f.arquivados} onChange={(e) => setF({ ...f, arquivados: e.target.value })} aria-label="Arquivadas" className={inp}><option value="nao">Ativas</option><option value="sim">Arquivadas</option><option value="todos">Todas</option></select>
        <select value={ordem} onChange={(e) => setOrdem(e.target.value)} aria-label="Ordenar" className={inp}><option value="atualizadoEm">Atualizadas recentemente</option><option value="criadoEm">Cadastradas recentemente</option><option value="ultimoContato">Último contato</option><option value="nome">Nome (A-Z)</option></select>
      </>} />
      {lista.length === 0 ? <p className={`${card} p-10 text-center text-white/50`}>Nenhuma empresa encontrada. Use "Nova empresa" para cadastrar a primeira.</p> : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-white/50"><tr>{["Empresa", "Contato", "Cidade", "Serviço", "Etapa", "Prioridade", "Valor estimado", "Último contato"].map((h) => <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody>{lista.map((l) => (
              <tr key={l.id} className="border-t border-white/10">
                <td className="px-4 py-3"><Link href={`/admin/crm/${l.id}`} className="font-medium hover:text-blue-300">{l.nome}</Link>{l.arquivado && <span className="ml-2 text-xs text-white/40">(arquivada)</span>}</td>
                <td className="px-4 py-3 text-white/70">{l.responsavel || "—"}</td>
                <td className="px-4 py-3 text-white/70">{[l.cidade, l.uf].filter(Boolean).join("/") || "—"}</td>
                <td className="px-4 py-3 text-white/70">{l.servico || "—"}</td>
                <td className="px-4 py-3"><SeletorEtapa valor={l.etapa} onChange={(e) => onMover(l, e)} className="min-w-40" /></td>
                <td className="px-4 py-3"><Prioridade valor={l.prioridade} /></td>
                <td className="px-4 py-3 text-white/70 whitespace-nowrap">{moeda(l.valorEstimado)}</td>
                <td className="px-4 py-3 text-white/70 whitespace-nowrap">{dataBR(l.ultimoContato)}</td>
              </tr>))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Atividades ────────────────────────────────────────────
function Atividades() {
  const [d, setD] = useState(null); const [modal, setModal] = useState(null); const [status, setStatus] = useState("pendente");
  const carregar = useCallback(() => api("/api/portal/admin/crm?visao=atividades").then(setD).catch((e) => setD({ erro: e.message, atividades: [], reunioes: [], leads: [] })), []);
  useEffect(() => { carregar(); }, [carregar]);
  if (!d) return <p className="text-white/50">Carregando...</p>;
  const nome = Object.fromEntries(d.leads.map((l) => [l.id, l.nome]));
  const agora = agoraBR();
  const lista = d.atividades.filter((a) => !status || a.status === status).sort((a, b) => a.quando.localeCompare(b.quando));
  async function mudar(a, s) { await api("/api/portal/admin/crm/itens", { method: "POST", body: { tipo: "atividade", dados: { id: a.id, status: s } } }); carregar(); }
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status" className={inp}><option value="">Todas</option>{Object.entries(STATUS_ATIVIDADE).map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select>
        <button onClick={() => setModal({})} className={btnAzul}><Plus size={16} />Nova atividade</button>
      </div>
      {lista.length === 0 ? <p className={`${card} p-10 text-center text-white/50`}>Nenhuma atividade.</p> : (
        <ul className="space-y-3">{lista.map((a) => {
          const atrasada = a.status === "pendente" && a.quando < agora && a.quando.slice(0, 10) < hojeBR();
          return (
            <li key={a.id} className={`${card} flex flex-wrap items-center justify-between gap-3 p-4 ${atrasada ? "border-amber-400/40" : ""}`}>
              <div>
                <p className="font-medium">{a.titulo} <Prioridade valor={a.prioridade} /></p>
                <p className="text-sm text-white/50">{dataBR(a.quando)}{atrasada && <span className="text-amber-300"> · atrasada</span>}{a.leadId && nome[a.leadId] ? <> · <Link className="text-blue-400" href={`/admin/crm/${a.leadId}`}>{nome[a.leadId]}</Link></> : null}{a.responsavel ? ` · ${a.responsavel}` : ""}</p>
              </div>
              <div className="flex gap-2">
                {a.status === "pendente" && <button onClick={() => mudar(a, "concluida")} className={btnLinha}><Check size={16} />Concluir</button>}
                <button onClick={() => setModal(a)} className={btnLinha}>Editar</button>
              </div>
            </li>);
        })}</ul>
      )}
      <Modal titulo={modal?.id ? "Editar atividade" : "Nova atividade"} aberto={!!modal} onFechar={() => setModal(null)}>
        {modal && <AtividadeForm item={modal.id ? modal : null} leads={d.leads} onSalvo={() => { setModal(null); carregar(); }} onCancelar={() => setModal(null)} />}
      </Modal>
    </div>
  );
}

// ── Reuniões ──────────────────────────────────────────────
function Reunioes() {
  const [d, setD] = useState(null); const [modal, setModal] = useState(null);
  const carregar = useCallback(() => api("/api/portal/admin/crm?visao=reunioes").then(setD).catch((e) => setD({ erro: e.message, atividades: [], reunioes: [], leads: [] })), []);
  useEffect(() => { carregar(); }, [carregar]);
  if (!d) return <p className="text-white/50">Carregando...</p>;
  const nome = Object.fromEntries(d.leads.map((l) => [l.id, l.nome]));
  const lista = [...d.reunioes].sort((a, b) => b.quando.localeCompare(a.quando));
  async function excluir(r) {
    if (!confirm(`Excluir a reunião "${r.titulo}" de ${dataBR(r.quando)}? Isso não pode ser desfeito.`)) return;
    try { await api("/api/portal/admin/crm/itens", { method: "DELETE", body: { tipo: "reuniao", id: r.id } }); } catch (e) { alert(e.message); }
    carregar();
  }
  async function followUp(r) {
    await api("/api/portal/admin/crm/itens", { method: "POST", body: { tipo: "atividade", dados: { titulo: `Acompanhar após reunião: ${r.titulo}`, leadId: r.leadId || "", quando: `${hojeBR()}T09:00`, prioridade: "alta" } } });
    alert("Atividade de acompanhamento criada para hoje às 09:00.");
  }
  return (
    <div>
      <div className="mb-5 flex justify-end"><button onClick={() => setModal({})} className={btnAzul}><Plus size={16} />Agendar reunião</button></div>
      {lista.length === 0 ? <p className={`${card} p-10 text-center text-white/50`}>Nenhuma reunião registrada.</p> : (
        <ul className="space-y-3">{lista.map((r) => (
          <li key={r.id} className={`${card} flex flex-wrap items-center justify-between gap-3 p-4`}>
            <div>
              <p className="font-medium">{r.titulo} <span className="ml-1 rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/60">{STATUS_REUNIAO[r.status]}</span></p>
              <p className="text-sm text-white/50">{dataBR(r.quando)} · {r.duracao} min · {r.modalidade === "presencial" ? "Presencial" : "Online"}{r.leadId && nome[r.leadId] ? <> · <Link className="text-blue-400" href={`/admin/crm/${r.leadId}`}>{nome[r.leadId]}</Link></> : null}</p>
            </div>
            <div className="flex gap-2">
              {r.status === "realizada" && <button onClick={() => followUp(r)} className={btnLinha}>Criar acompanhamento</button>}
              <button onClick={() => setModal(r)} className={btnLinha}>Editar</button>
              <button onClick={() => excluir(r)} aria-label={`Excluir reunião ${r.titulo}`} className={`${btnLinha} hover:!border-red-400 hover:!text-red-300`}>Excluir</button>
            </div>
          </li>))}
        </ul>
      )}
      <Modal titulo={modal?.id ? "Editar reunião" : "Agendar reunião"} aberto={!!modal} onFechar={() => setModal(null)} largo>
        {modal && <ReuniaoForm item={modal.id ? modal : null} leads={d.leads} onSalvo={() => { setModal(null); carregar(); }} onCancelar={() => setModal(null)} />}
      </Modal>
    </div>
  );
}

// ── Relatórios ────────────────────────────────────────────
function Relatorios({ leads, servicos }) {
  const [f, setF] = useState({ arquivados: "todos" });
  const lista = useMemo(() => filtrarLeads(leads, f), [leads, f]);
  const fechados = lista.filter((l) => l.etapa === "fechado"), perdidos = lista.filter((l) => l.etapa === "perdido");
  const origens = [...new Set(leads.map((l) => l.origem).filter(Boolean))];
  const q = new URLSearchParams(Object.entries(f).filter(([, x]) => x)).toString();
  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-3">
        <label className="text-sm text-white/60">De<input type="date" value={f.de || ""} onChange={(e) => setF({ ...f, de: e.target.value })} className={`${inp} mt-1`} /></label>
        <label className="text-sm text-white/60">Até<input type="date" value={f.ate || ""} onChange={(e) => setF({ ...f, ate: e.target.value })} className={`${inp} mt-1`} /></label>
        <label className="text-sm text-white/60">Etapa<select value={f.etapa || ""} onChange={(e) => setF({ ...f, etapa: e.target.value })} className={`${inp} mt-1`}><option value="">Todas</option>{ETAPAS.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}</select></label>
        <label className="text-sm text-white/60">Serviço<select value={f.servico || ""} onChange={(e) => setF({ ...f, servico: e.target.value })} className={`${inp} mt-1`}><option value="">Todos</option>{servicos.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="text-sm text-white/60">Origem<select value={f.origem || ""} onChange={(e) => setF({ ...f, origem: e.target.value })} className={`${inp} mt-1`}><option value="">Todas</option>{origens.map((o) => <option key={o}>{o}</option>)}</select></label>
        <label className="text-sm text-white/60">Cidade<input value={f.cidade || ""} onChange={(e) => setF({ ...f, cidade: e.target.value })} className={`${inp} mt-1 w-36`} /></label>
        <label className="text-sm text-white/60">Prioridade<select value={f.prioridade || ""} onChange={(e) => setF({ ...f, prioridade: e.target.value })} className={`${inp} mt-1`}><option value="">Todas</option>{Object.entries(PRIORIDADES).map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></label>
        <label className="text-sm text-white/60">Responsável<input value={f.responsavel || ""} onChange={(e) => setF({ ...f, responsavel: e.target.value })} className={`${inp} mt-1 w-36`} /></label>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        {[["Empresas no filtro", lista.length], ["Fechados", fechados.length], ["Perdidos", perdidos.length], ["Estimado em aberto", moeda(lista.filter((l) => !["fechado", "perdido"].includes(l.etapa)).reduce((t, l) => t + (Number(l.valorEstimado) || 0), 0))], ["Combinado nos fechamentos", moeda(fechados.reduce((t, l) => t + (Number(l.valorFechado) || 0), 0))]].map(([n, x]) => <div key={n} className={`${card} p-4`}><p className="text-xl font-bold">{x}</p><p className="text-xs text-white/50">{n}</p></div>)}
      </div>
      <a href={`/api/portal/admin/crm/exportar?${q}`} className={btnLinha}><Download size={16} />Exportar CSV</a>
      <p className="mt-3 text-xs text-white/40">O arquivo contém dados de contato: guarde em local seguro e não compartilhe.</p>
    </div>
  );
}
