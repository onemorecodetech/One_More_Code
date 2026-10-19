"use client";
import { useState } from "react";
import { ETAPAS, PRIORIDADES, TIPOS_CONTATO, STATUS_APRESENTACAO, STATUS_ATIVIDADE, STATUS_REUNIAO, agoraBR } from "@/lib/crm/config";
import { api, inp, btnAzul, btnLinha, Campo, Erro } from "./ui";

const v = (x) => (x == null ? "" : x);
const num = (x) => (x == null || x === "" ? "" : String(x).replace(".", ","));

// Cadastro e edição de empresa (só o nome é obrigatório)
export function LeadForm({ lead, servicos, onSalvo, onCancelar }) {
  const [erro, setErro] = useState(""); const [dup, setDup] = useState(null); const [salvando, setSalvando] = useState(false);
  const [completo, setCompleto] = useState(!!lead);

  async function enviar(e, ignorarDuplicados = false) {
    e?.preventDefault();
    const f = new FormData(document.getElementById("form-lead"));
    const dados = Object.fromEntries([...f.entries()].filter(([k]) => !k.startsWith("prototipo.")));
    dados.prototipo = { nome: f.get("prototipo.nome"), link: f.get("prototipo.link"), criadoEm: f.get("prototipo.criadoEm"), apresentacao: f.get("prototipo.apresentacao"), observacoes: f.get("prototipo.observacoes") };
    if (!completo && !lead) delete dados.prototipo;
    setSalvando(true); setErro("");
    try {
      const r = lead ? await api(`/api/portal/admin/crm/${lead.id}`, { method: "PATCH", body: { dados } })
                     : await api("/api/portal/admin/crm", { method: "POST", body: { tipo: "lead", dados: { ...dados, ignorarDuplicados } } });
      onSalvo(r.lead);
    } catch (err) {
      if (err.status === 409 && err.dados?.duplicados) setDup(err.dados.duplicados); else setErro(err.message);
    } finally { setSalvando(false); }
  }

  const p = lead?.prototipo || {};
  return (
    <form id="form-lead" onSubmit={enviar} className="space-y-4">
      <Campo label="Empresa ou profissional *"><input name="nome" required maxLength={120} defaultValue={v(lead?.nome)} className={inp} /></Campo>
      {!completo ? (
        <button type="button" onClick={() => setCompleto(true)} className="text-sm text-blue-400 hover:underline">+ Preencher mais dados agora (opcional)</button>
      ) : (
        <>
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-400">Identificação</legend>
            <Campo label="Responsável / contato"><input name="responsavel" maxLength={120} defaultValue={v(lead?.responsavel)} className={inp} /></Campo>
            <Campo label="Segmento"><input name="segmento" maxLength={80} defaultValue={v(lead?.segmento)} placeholder="Ex.: estética, academia" className={inp} /></Campo>
            <Campo label="Cidade"><input name="cidade" maxLength={80} defaultValue={v(lead?.cidade)} className={inp} /></Campo>
            <Campo label="UF"><input name="uf" maxLength={2} defaultValue={v(lead?.uf)} className={inp} /></Campo>
            <Campo label="Telefone / WhatsApp"><input name="telefone" inputMode="tel" maxLength={30} defaultValue={v(lead?.telefone)} className={inp} /></Campo>
            <Campo label="E-mail"><input name="email" type="email" maxLength={160} defaultValue={v(lead?.email)} className={inp} /></Campo>
            <Campo label="Instagram"><input name="instagram" maxLength={80} defaultValue={lead?.instagram ? `@${lead.instagram}` : ""} placeholder="@perfil" className={inp} /></Campo>
            <Campo label="Site atual"><input name="site" maxLength={300} defaultValue={v(lead?.site)} className={inp} /></Campo>
            <Campo label="Origem do contato"><input name="origem" maxLength={80} defaultValue={v(lead?.origem)} placeholder="Ex.: Instagram, indicação" className={inp} /></Campo>
          </fieldset>
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-400">Oportunidade</legend>
            <Campo label="Serviço de interesse">
              <select name="servico" defaultValue={v(lead?.servico)} className={inp}><option value="">—</option>{servicos.map((s) => <option key={s}>{s}</option>)}</select>
            </Campo>
            <Campo label="Prioridade">
              <select name="prioridade" defaultValue={lead?.prioridade || "media"} className={inp}>{Object.entries(PRIORIDADES).map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select>
            </Campo>
            <Campo label="Valor estimado (R$)"><input name="valorEstimado" inputMode="decimal" defaultValue={num(lead?.valorEstimado)} placeholder="Você define" className={inp} /></Campo>
            <Campo label="Mensalidade estimada (R$)"><input name="mensalidadeEstimada" inputMode="decimal" defaultValue={num(lead?.mensalidadeEstimada)} placeholder="Você define" className={inp} /></Campo>
            <Campo label="Probabilidade de fechar (%)"><input name="probabilidade" type="number" min={0} max={100} defaultValue={v(lead?.probabilidade)} className={inp} /></Campo>
            <Campo label="Responsável comercial"><input name="responsavelComercial" maxLength={80} defaultValue={v(lead?.responsavelComercial)} className={inp} /></Campo>
            <Campo label="Primeiro contato"><input name="primeiroContato" type="date" defaultValue={v(lead?.primeiroContato)} className={inp} /></Campo>
            <Campo label="Próximo acompanhamento"><input name="proximoAcompanhamento" type="date" defaultValue={v(lead?.proximoAcompanhamento)} className={inp} /></Campo>
            <Campo label="Observações internas" className="sm:col-span-2"><textarea name="observacoes" rows={3} maxLength={4000} defaultValue={v(lead?.observacoes)} className={inp} /></Campo>
          </fieldset>
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-400">Projeto demonstrativo</legend>
            <Campo label="Nome do projeto"><input name="prototipo.nome" maxLength={120} defaultValue={v(p.nome)} className={inp} /></Campo>
            <Campo label="Link do protótipo"><input name="prototipo.link" maxLength={300} defaultValue={v(p.link)} className={inp} /></Campo>
            <Campo label="Criado em"><input name="prototipo.criadoEm" type="date" defaultValue={v(p.criadoEm)} className={inp} /></Campo>
            <Campo label="Apresentação">
              <select name="prototipo.apresentacao" defaultValue={p.apresentacao || "nao_apresentado"} className={inp}>{Object.entries(STATUS_APRESENTACAO).map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select>
            </Campo>
            <Campo label="Personalizações solicitadas" className="sm:col-span-2"><textarea name="prototipo.observacoes" rows={2} maxLength={4000} defaultValue={v(p.observacoes)} className={inp} /></Campo>
          </fieldset>
        </>
      )}
      {dup && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
          <p className="mb-2 font-semibold">Possível empresa já cadastrada:</p>
          <ul className="mb-3 list-disc pl-5">{dup.map((d) => <li key={d.id}><a href={`/admin/crm/${d.id}`} className="underline">{d.nome}</a>{d.arquivado ? " (arquivada)" : ""}</li>)}</ul>
          <button type="button" onClick={() => enviar(null, true)} className={btnLinha}>Cadastrar mesmo assim</button>
        </div>
      )}
      <Erro msg={erro} />
      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" disabled={salvando} className={btnAzul}>{salvando ? "Salvando..." : lead ? "Salvar alterações" : "Cadastrar empresa"}</button>
        <button type="button" onClick={onCancelar} className={btnLinha}>Cancelar</button>
      </div>
    </form>
  );
}

// Troca de etapa: fechamento pede confirmação; perda pede motivo
export function MudarEtapa({ lead, etapa, onFeito, onCancelar }) {
  const [erro, setErro] = useState(""); const [salvando, setSalvando] = useState(false);
  const fechando = etapa === "fechado"; const perdendo = etapa === "perdido";
  async function confirmar(e) {
    e.preventDefault(); const f = new FormData(e.currentTarget); setSalvando(true); setErro("");
    try {
      const r = await api(`/api/portal/admin/crm/${lead.id}`, { method: "PATCH", body: { etapa, confirmar: fechando, motivoPerda: f.get("motivoPerda"), valorFechado: f.get("valorFechado"), mensalidadeFechada: f.get("mensalidadeFechada") } });
      onFeito(r.lead);
    } catch (err) { setErro(err.message); } finally { setSalvando(false); }
  }
  return (
    <form onSubmit={confirmar} className="space-y-4">
      {fechando && (
        <>
          <p className="text-white/70">Confirma que <strong className="text-white">{lead.nome}</strong> fechou? Isso <strong>não</strong> cria contrato nem registra pagamento: depois você pode criar a proposta ou o contrato pelos módulos existentes.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Valor combinado (R$)"><input name="valorFechado" inputMode="decimal" defaultValue={num(lead.valorEstimado)} className={inp} /></Campo>
            <Campo label="Mensalidade combinada (R$)"><input name="mensalidadeFechada" inputMode="decimal" defaultValue={num(lead.mensalidadeEstimada)} className={inp} /></Campo>
          </div>
        </>
      )}
      {perdendo && <Campo label="Motivo da perda *"><input name="motivoPerda" required maxLength={300} placeholder="Ex.: preço, sem resposta, escolheu outro" className={inp} /></Campo>}
      <Erro msg={erro} />
      <div className="flex gap-3"><button type="submit" disabled={salvando} className={btnAzul}>{fechando ? "Confirmar fechamento" : "Marcar como perdido"}</button><button type="button" onClick={onCancelar} className={btnLinha}>Cancelar</button></div>
    </form>
  );
}

export function SeletorEtapa({ valor, onChange, className = "" }) {
  return (
    <select value={valor} onChange={(e) => onChange(e.target.value)} aria-label="Etapa do funil" className={`${inp} !py-1.5 text-sm ${className}`}>
      {ETAPAS.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
    </select>
  );
}

export function InteracaoForm({ leadId, item, onSalvo, onCancelar }) {
  const [erro, setErro] = useState(""); const [salvando, setSalvando] = useState(false);
  async function enviar(e) {
    e.preventDefault(); if (salvando) return; setSalvando(true); const dados = Object.fromEntries(new FormData(e.currentTarget));
    try { const r = await api("/api/portal/admin/crm/itens", { method: "POST", body: { tipo: "interacao", leadId, dados: { ...dados, id: item?.id } } }); onSalvo(r.interacao); } catch (err) { setErro(err.message); setSalvando(false); }
  }
  return (
    <form onSubmit={enviar} className="space-y-4">
      <p className="text-xs text-white/50">Registro manual: este histórico não envia mensagens, só anota o que você fez.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Tipo"><select name="tipo" defaultValue={item?.tipo || "whatsapp"} className={inp}>{Object.entries(TIPOS_CONTATO).map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></Campo>
        <Campo label="Data e horário"><input name="em" type="datetime-local" required defaultValue={item?.em || agoraBR()} className={inp} /></Campo>
      </div>
      <Campo label="Resumo *"><textarea name="resumo" required rows={3} maxLength={1000} defaultValue={v(item?.resumo)} className={inp} /></Campo>
      <Campo label="Resultado"><input name="resultado" maxLength={500} defaultValue={v(item?.resultado)} className={inp} /></Campo>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Próxima ação"><input name="proximaAcao" maxLength={300} defaultValue={v(item?.proximaAcao)} className={inp} /></Campo>
        <Campo label="Responsável"><input name="responsavel" maxLength={80} defaultValue={v(item?.responsavel)} className={inp} /></Campo>
      </div>
      <Erro msg={erro} />
      <div className="flex gap-3"><button type="submit" disabled={salvando} className={btnAzul}>{salvando ? "Salvando..." : "Salvar registro"}</button><button type="button" onClick={onCancelar} className={btnLinha}>Cancelar</button></div>
    </form>
  );
}

export function AtividadeForm({ item, leads, leadFixo, onSalvo, onCancelar }) {
  const [erro, setErro] = useState(""); const [salvando, setSalvando] = useState(false);
  async function enviar(e) {
    e.preventDefault(); if (salvando) return; setSalvando(true); const dados = Object.fromEntries(new FormData(e.currentTarget));
    if (leadFixo) dados.leadId = leadFixo;
    try { const r = await api("/api/portal/admin/crm/itens", { method: "POST", body: { tipo: "atividade", dados: { ...dados, id: item?.id } } }); onSalvo(r.atividade); } catch (err) { setErro(err.message); setSalvando(false); }
  }
  return (
    <form onSubmit={enviar} className="space-y-4">
      <Campo label="Título *"><input name="titulo" required maxLength={150} defaultValue={v(item?.titulo)} placeholder="Ex.: Retornar contato, preparar proposta" className={inp} /></Campo>
      {!leadFixo && <Campo label="Empresa"><select name="leadId" defaultValue={v(item?.leadId)} className={inp}><option value="">Sem empresa</option>{leads.map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}</select></Campo>}
      <div className="grid gap-4 sm:grid-cols-3">
        <Campo label="Data e horário *"><input name="quando" type="datetime-local" required defaultValue={v(item?.quando)} className={inp} /></Campo>
        <Campo label="Prioridade"><select name="prioridade" defaultValue={item?.prioridade || "media"} className={inp}>{Object.entries(PRIORIDADES).map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></Campo>
        <Campo label="Status"><select name="status" defaultValue={item?.status || "pendente"} className={inp}>{Object.entries(STATUS_ATIVIDADE).map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></Campo>
      </div>
      <Campo label="Responsável"><input name="responsavel" maxLength={80} defaultValue={v(item?.responsavel)} className={inp} /></Campo>
      <Campo label="Descrição"><textarea name="descricao" rows={2} maxLength={1000} defaultValue={v(item?.descricao)} className={inp} /></Campo>
      <Erro msg={erro} />
      <div className="flex gap-3"><button type="submit" disabled={salvando} className={btnAzul}>{salvando ? "Salvando..." : "Salvar atividade"}</button><button type="button" onClick={onCancelar} className={btnLinha}>Cancelar</button></div>
    </form>
  );
}

export function ReuniaoForm({ item, leads, leadFixo, onSalvo, onCancelar }) {
  const [erro, setErro] = useState(""); const [salvando, setSalvando] = useState(false);
  async function enviar(e) {
    e.preventDefault(); if (salvando) return; setSalvando(true); const dados = Object.fromEntries(new FormData(e.currentTarget));
    if (leadFixo) dados.leadId = leadFixo;
    try { const r = await api("/api/portal/admin/crm/itens", { method: "POST", body: { tipo: "reuniao", dados: { ...dados, id: item?.id } } }); onSalvo(r.reuniao); } catch (err) { setErro(err.message); setSalvando(false); }
  }
  return (
    <form onSubmit={enviar} className="space-y-4">
      <Campo label="Título *"><input name="titulo" required maxLength={150} defaultValue={v(item?.titulo)} placeholder="Ex.: Apresentação do protótipo" className={inp} /></Campo>
      {!leadFixo && <Campo label="Empresa"><select name="leadId" defaultValue={v(item?.leadId)} className={inp}><option value="">Sem empresa</option>{leads.map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}</select></Campo>}
      <div className="grid gap-4 sm:grid-cols-3">
        <Campo label="Data e horário *"><input name="quando" type="datetime-local" required defaultValue={v(item?.quando)} className={inp} /></Campo>
        <Campo label="Duração (min)"><input name="duracao" type="number" min={5} max={600} defaultValue={item?.duracao || 60} className={inp} /></Campo>
        <Campo label="Modalidade"><select name="modalidade" defaultValue={item?.modalidade || "online"} className={inp}><option value="online">Online</option><option value="presencial">Presencial</option></select></Campo>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Local ou link"><input name="local" maxLength={300} defaultValue={v(item?.local)} className={inp} /></Campo>
        <Campo label="Participantes"><input name="participantes" maxLength={300} defaultValue={v(item?.participantes)} className={inp} /></Campo>
      </div>
      {item && <Campo label="Status"><select name="status" defaultValue={item.status} className={inp}>{Object.entries(STATUS_REUNIAO).map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></Campo>}
      <Campo label="Observações"><textarea name="observacoes" rows={2} maxLength={4000} defaultValue={v(item?.observacoes)} className={inp} /></Campo>
      {item && <Campo label="Resumo da reunião (depois de realizada)"><textarea name="resumo" rows={3} maxLength={4000} defaultValue={v(item?.resumo)} className={inp} /></Campo>}
      <p className="text-xs text-white/40">Nenhum convite é enviado automaticamente.</p>
      <Erro msg={erro} />
      <div className="flex gap-3"><button type="submit" disabled={salvando} className={btnAzul}>{salvando ? "Salvando..." : "Salvar reunião"}</button><button type="button" onClick={onCancelar} className={btnLinha}>Cancelar</button></div>
    </form>
  );
}
