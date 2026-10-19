// Camada de dados do CRM (somente servidor).
// Cada empresa, interação, atividade e reunião fica em um registro próprio no Redis,
// com trava por registro: duas edições ao mesmo tempo não se sobrescrevem.
import crypto from "crypto";
import * as kv from "@/lib/kv";
import { lerDB } from "@/lib/portal/storage";
import {
  ETAPA, ETAPAS_ABERTAS, PRIORIDADES, TIPOS_CONTATO, STATUS_ATIVIDADE, STATUS_REUNIAO,
  STATUS_APRESENTACAO, SERVICOS_PADRAO, DIAS_SEM_CONTATO, agoraBR, hojeBR, diasDesde,
} from "./config";

const K = { leads: "omc:crm:leads", ativ: "omc:crm:atividades", reun: "omc:crm:reunioes", inter: (id) => `omc:crm:interacoes:${id}`, servicos: "omc:crm:servicos" };
export class ErroCRM extends Error { constructor(msg, status = 400, extra) { super(msg); this.status = status; this.extra = extra; } }

// ── Validação ─────────────────────────────────────────────
const txt = (v, max = 200) => String(v ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);
const txtLongo = (v) => txt(v, 4000);
const opc = (v, lista, padrao = "") => (Object.prototype.hasOwnProperty.call(lista, v) ? v : padrao);
const data = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v || "")) ? v : "");
const dataHora = (v) => (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(String(v || "")) ? v : "");
const dinheiro = (v) => {
  if (v === "" || v == null) return null;
  const n = Number(String(v).replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 && n < 1e9 ? Math.round(n * 100) / 100 : null;
};
const inteiro = (v, min, max) => { const n = parseInt(v, 10); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : null; };
const link = (v) => { const s = txt(v, 300); if (!s) return ""; try { const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`); return ["http:", "https:"].includes(u.protocol) ? u.href : ""; } catch { return ""; } };
const email = (v) => { const s = txt(v, 160).toLowerCase(); return !s || /^[^\s@<>"]+@[^\s@<>"]+\.[a-z]{2,}$/i.test(s) ? s : ""; };
const telefone = (v) => txt(v, 30).replace(/[^\d+]/g, "").slice(0, 16);
const instagram = (v) => txt(v, 80).replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/[/?].*$/, "").replace(/^@/, "").replace(/[^\w.]/g, "");

function limparLead(b, atual = {}) {
  const l = { ...atual };
  const set = (campo, valor) => { if (b[campo] !== undefined) l[campo] = valor; };
  set("nome", txt(b.nome, 120)); set("responsavel", txt(b.responsavel, 120)); set("segmento", txt(b.segmento, 80));
  set("cidade", txt(b.cidade, 80)); set("uf", txt(b.uf, 2).toUpperCase()); set("site", link(b.site)); set("instagram", instagram(b.instagram));
  set("telefone", telefone(b.telefone)); set("email", email(b.email)); set("origem", txt(b.origem, 80));
  set("servico", txt(b.servico, 80)); set("valorEstimado", dinheiro(b.valorEstimado)); set("mensalidadeEstimada", dinheiro(b.mensalidadeEstimada));
  set("probabilidade", b.probabilidade === "" ? null : inteiro(b.probabilidade, 0, 100)); set("prioridade", opc(b.prioridade, PRIORIDADES, "media"));
  set("responsavelComercial", txt(b.responsavelComercial, 80)); set("primeiroContato", data(b.primeiroContato)); set("ultimoContato", data(b.ultimoContato));
  set("proximoAcompanhamento", data(b.proximoAcompanhamento)); set("observacoes", txtLongo(b.observacoes));
  if (b.prototipo !== undefined) {
    const p = b.prototipo || {};
    l.prototipo = { nome: txt(p.nome, 120), link: link(p.link), criadoEm: data(p.criadoEm), apresentacao: opc(p.apresentacao, STATUS_APRESENTACAO, "nao_apresentado"), observacoes: txtLongo(p.observacoes) };
  }
  return l;
}

// ── Trava por registro (evita sobrescrita em edições simultâneas) ──
async function comTrava(chave, fn) {
  const trava = `omc:crm:trava:${chave}`;
  for (let i = 0; i < 40; i++) {
    if (await kv.setNX(trava, 1, 10)) {
      try { return await fn(); } finally { await kv.del(trava); }
    }
    await new Promise((r) => setTimeout(r, 75 + Math.random() * 50));
  }
  throw new ErroCRM("Registro ocupado por outra edição. Tente de novo.", 409);
}

// ── Duplicidades ──────────────────────────────────────────
const normNome = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const dominio = (s) => { try { return new URL(s).hostname.replace(/^www\./, ""); } catch { return ""; } };
const digitos = (s) => String(s || "").replace(/\D/g, "").slice(-10);

export function duplicados(lead, todos) {
  return todos.filter((o) => o.id !== lead.id).filter((o) =>
    (lead.nome && normNome(o.nome) === normNome(lead.nome)) ||
    (lead.email && o.email === lead.email) ||
    (digitos(lead.telefone).length >= 8 && digitos(o.telefone) === digitos(lead.telefone)) ||
    (lead.site && dominio(o.site) && dominio(o.site) === dominio(lead.site)) ||
    (lead.instagram && o.instagram && o.instagram.toLowerCase() === lead.instagram.toLowerCase())
  ).map(({ id, nome, etapa, arquivado }) => ({ id, nome, etapa, arquivado }));
}

// ── Leads ─────────────────────────────────────────────────
const valido = (x) => x && typeof x === "object" && typeof x.id === "string";

export async function listarLeads() {
  return Object.values(await kv.hgetall(K.leads)).filter((l) => valido(l) && typeof l.nome === "string" && typeof l.criadoEm === "string");
}

export async function lerLead(id) {
  const l = (await kv.hgetall(K.leads))[id];
  if (!valido(l)) throw new ErroCRM("Empresa não encontrada.", 404);
  return l;
}

export async function criarLead(body) {
  const lead = limparLead({ prioridade: "media", ...body });
  if (!lead.nome) throw new ErroCRM("Informe o nome da empresa ou do profissional.");
  const todos = await listarLeads();
  const dup = duplicados(lead, todos);
  if (dup.length && body.ignorarDuplicados !== true) throw new ErroCRM("Possível empresa já cadastrada.", 409, { duplicados: dup });
  const agora = new Date().toISOString();
  const novo = {
    ...lead, id: crypto.randomUUID(), etapa: ETAPA[body.etapa] ? body.etapa : "prospectado",
    arquivado: false, clienteId: null, convertidoEm: null, motivoPerda: "", valorFechado: null, mensalidadeFechada: null,
    criadoEm: agora, atualizadoEm: agora, etapaDesde: agora,
    historico: [{ em: agora, texto: "Empresa cadastrada no CRM" }],
  };
  await kv.hset(K.leads, novo.id, novo);
  return novo;
}

const ROTULO = { nome: "nome", servico: "serviço", valorEstimado: "valor estimado", mensalidadeEstimada: "mensalidade estimada", prioridade: "prioridade", proximoAcompanhamento: "próximo acompanhamento", prototipo: "protótipo", responsavelComercial: "responsável comercial" };

export async function atualizarLead(id, body) {
  return comTrava(`lead:${id}`, async () => {
    const atual = await lerLead(id);
    const agora = new Date().toISOString();
    let l = { ...atual };
    const hist = [];

    if (body.dados) {
      const novo = limparLead(body.dados, atual);
      if (!novo.nome) throw new ErroCRM("O nome não pode ficar vazio.");
      const alterados = Object.keys(ROTULO).filter((c) => JSON.stringify(novo[c]) !== JSON.stringify(atual[c]));
      if (alterados.length) hist.push(`Dados atualizados: ${alterados.map((c) => ROTULO[c]).join(", ")}`);
      else if (JSON.stringify(novo) !== JSON.stringify(atual)) hist.push("Dados de contato atualizados");
      l = novo;
    }

    if (body.etapa && body.etapa !== atual.etapa) {
      if (!ETAPA[body.etapa]) throw new ErroCRM("Etapa inválida.");
      if (body.etapa === "fechado" && body.confirmar !== true) throw new ErroCRM("Confirme o fechamento.", 400, { precisaConfirmar: true });
      if (body.etapa === "perdido" && !txt(body.motivoPerda, 300)) throw new ErroCRM("Informe o motivo da perda.", 400, { precisaMotivo: true });
      if (body.etapa === "fechado") { l.valorFechado = dinheiro(body.valorFechado); l.mensalidadeFechada = dinheiro(body.mensalidadeFechada); l.fechadoEm = agora; }
      if (body.etapa === "perdido") l.motivoPerda = txt(body.motivoPerda, 300);
      if (atual.etapa === "perdido") l.motivoPerda = "";
      hist.push(`Etapa: ${ETAPA[atual.etapa].nome} → ${ETAPA[body.etapa].nome}${body.etapa === "perdido" ? ` (motivo: ${l.motivoPerda})` : ""}`);
      l.etapa = body.etapa; l.etapaDesde = agora;
    }

    if (body.arquivado !== undefined && !!body.arquivado !== !!atual.arquivado) {
      l.arquivado = !!body.arquivado; hist.push(l.arquivado ? "Empresa arquivada" : "Empresa reativada");
    }

    if (body.vincularCliente !== undefined) {
      const db = await lerDB();
      const cliente = db.clientes.find((c) => c.id === body.vincularCliente);
      if (!cliente) throw new ErroCRM("Cliente não encontrado na área do cliente.", 404);
      const outro = (await listarLeads()).find((o) => o.clienteId === cliente.id && o.id !== id);
      if (outro) throw new ErroCRM(`Este cliente já está vinculado à empresa "${outro.nome}".`, 409);
      l.clienteId = cliente.id; l.convertidoEm = l.convertidoEm || agora;
      if (!l.email) l.email = cliente.email;
      hist.push(`Vinculado ao cliente ${cliente.nome} (${cliente.email}) da área do cliente`);
    }
    if (body.desvincularCliente === true && atual.clienteId) { l.clienteId = null; hist.push("Vínculo com a área do cliente removido"); }

    if (!hist.length) return atual;
    l.atualizadoEm = agora;
    l.historico = [...hist.map((texto) => ({ em: agora, texto })).reverse(), ...(atual.historico || [])].slice(0, 200);
    await kv.hset(K.leads, id, l);
    return l;
  });
}

export async function excluirLead(id) {
  return comTrava(`lead:${id}`, async () => {
    const lead = await lerLead(id);
    if (lead.clienteId) {
      const db = await lerDB();
      const docs = db.propostas.filter((p) => p.clienteId === lead.clienteId);
      if (docs.length) throw new ErroCRM(`Esta empresa tem ${docs.length} proposta(s)/contrato(s) vinculados. Arquive em vez de excluir.`, 409);
    }
    const ativ = Object.values(await kv.hgetall(K.ativ)).filter((a) => a.leadId === id).map((a) => a.id);
    const reun = Object.values(await kv.hgetall(K.reun)).filter((r) => r.leadId === id).map((r) => r.id);
    if (ativ.length) await kv.hdel(K.ativ, ...ativ);
    if (reun.length) await kv.hdel(K.reun, ...reun);
    await kv.del(K.inter(id));
    await kv.hdel(K.leads, id);
    return { atividades: ativ.length, reunioes: reun.length };
  });
}

// ── Interações (histórico de contatos, sempre registros manuais) ──
export async function salvarInteracao(leadId, b) {
  await lerLead(leadId);
  const i = {
    tipo: opc(b.tipo, TIPOS_CONTATO, "outro"), em: dataHora(b.em) || agoraBR(), resumo: txt(b.resumo, 1000),
    resultado: txt(b.resultado, 500), proximaAcao: txt(b.proximaAcao, 300), responsavel: txt(b.responsavel, 80),
  };
  if (!i.resumo) throw new ErroCRM("Escreva um resumo do contato.");
  const atual = b.id ? (await kv.hgetall(K.inter(leadId)))[b.id] : null;
  if (b.id && !atual) throw new ErroCRM("Registro não encontrado.", 404);
  const reg = { ...(atual || { id: crypto.randomUUID(), criadoEm: new Date().toISOString(), manual: true }), ...i, editadoEm: atual ? new Date().toISOString() : null };
  await kv.hset(K.inter(leadId), reg.id, reg);
  // Atualiza "último contato" se este for mais recente
  await comTrava(`lead:${leadId}`, async () => {
    const l = await lerLead(leadId);
    const dia = reg.em.slice(0, 10);
    if (!l.ultimoContato || dia > l.ultimoContato || !l.primeiroContato) {
      await kv.hset(K.leads, leadId, { ...l, ultimoContato: !l.ultimoContato || dia > l.ultimoContato ? dia : l.ultimoContato, primeiroContato: l.primeiroContato || dia, atualizadoEm: new Date().toISOString() });
    }
  });
  return reg;
}
export async function listarInteracoes(leadId) {
  return Object.values(await kv.hgetall(K.inter(leadId))).filter((i) => valido(i) && typeof i.em === "string").sort((a, b) => b.em.localeCompare(a.em));
}

// ── Atividades ────────────────────────────────────────────
export async function listarAtividades() { return Object.values(await kv.hgetall(K.ativ)).filter((a) => valido(a) && typeof a.quando === "string"); }
export async function salvarAtividade(b) {
  return comTrava(`ativ:${b.id || "nova"}`, async () => {
    const atual = b.id ? (await kv.hgetall(K.ativ))[b.id] : null;
    if (b.id && !atual) throw new ErroCRM("Atividade não encontrada.", 404);
    const a = { ...(atual || { id: crypto.randomUUID(), criadaEm: new Date().toISOString(), status: "pendente" }) };
    if (b.titulo !== undefined) a.titulo = txt(b.titulo, 150);
    if (b.leadId !== undefined) { if (b.leadId) await lerLead(b.leadId); a.leadId = b.leadId || null; }
    if (b.descricao !== undefined) a.descricao = txt(b.descricao, 1000);
    if (b.quando !== undefined) a.quando = dataHora(b.quando);
    if (b.prioridade !== undefined) a.prioridade = opc(b.prioridade, PRIORIDADES, "media");
    if (b.responsavel !== undefined) a.responsavel = txt(b.responsavel, 80);
    if (b.status !== undefined) { a.status = opc(b.status, STATUS_ATIVIDADE, a.status); a.concluidaEm = a.status === "concluida" ? new Date().toISOString() : null; }
    if (!a.titulo) throw new ErroCRM("Informe o título da atividade.");
    if (!a.quando) throw new ErroCRM("Informe a data e o horário.");
    a.prioridade = a.prioridade || "media";
    await kv.hset(K.ativ, a.id, a);
    return a;
  });
}

// ── Reuniões ──────────────────────────────────────────────
export async function listarReunioes() { return Object.values(await kv.hgetall(K.reun)).filter((r) => valido(r) && typeof r.quando === "string"); }
export async function salvarReuniao(b) {
  return comTrava(`reun:${b.id || "nova"}`, async () => {
    const atual = b.id ? (await kv.hgetall(K.reun))[b.id] : null;
    if (b.id && !atual) throw new ErroCRM("Reunião não encontrada.", 404);
    const r = { ...(atual || { id: crypto.randomUUID(), criadaEm: new Date().toISOString(), status: "agendada" }) };
    if (b.leadId !== undefined) { if (b.leadId) await lerLead(b.leadId); r.leadId = b.leadId || null; }
    if (b.titulo !== undefined) r.titulo = txt(b.titulo, 150);
    if (b.quando !== undefined) {
      const q = dataHora(b.quando);
      if (atual && q && q !== atual.quando && atual.status === "agendada") r.status = "reagendada";
      r.quando = q;
    }
    if (b.duracao !== undefined) r.duracao = inteiro(b.duracao, 5, 600) || 60;
    if (b.modalidade !== undefined) r.modalidade = b.modalidade === "presencial" ? "presencial" : "online";
    if (b.local !== undefined) r.local = txt(b.local, 300);
    if (b.participantes !== undefined) r.participantes = txt(b.participantes, 300);
    if (b.status !== undefined) r.status = opc(b.status, STATUS_REUNIAO, r.status);
    if (b.observacoes !== undefined) r.observacoes = txtLongo(b.observacoes);
    if (b.resumo !== undefined) r.resumo = txtLongo(b.resumo);
    if (!r.titulo) throw new ErroCRM("Informe o título da reunião.");
    if (!r.quando) throw new ErroCRM("Informe a data e o horário.");
    r.duracao = r.duracao || 60; r.modalidade = r.modalidade || "online";
    await kv.hset(K.reun, r.id, r);
    return r;
  });
}

export async function excluirItem(tipo, id, leadId) {
  const chave = tipo === "atividade" ? K.ativ : tipo === "reuniao" ? K.reun : tipo === "interacao" && leadId ? K.inter(leadId) : null;
  if (!chave) throw new ErroCRM("Tipo inválido.");
  await kv.hdel(chave, id);
}

// ── Catálogo de serviços (só nomes, editável) ─────────────
export async function lerServicos() { return (await kv.get(K.servicos)) || SERVICOS_PADRAO; }
export async function salvarServicos(lista) {
  const limpa = [...new Set((Array.isArray(lista) ? lista : []).map((s) => txt(s, 80)).filter(Boolean))].slice(0, 40);
  if (!limpa.length) throw new ErroCRM("Mantenha pelo menos um serviço.");
  await kv.set(K.servicos, limpa);
  return limpa;
}

// ── Vínculo com a área do cliente (propostas e contratos existentes) ──
export async function documentosDoLead(lead, db) {
  if (!lead.clienteId) return [];
  return db.propostas.filter((p) => p.clienteId === lead.clienteId)
    .map(({ id, codigo, titulo, tipo, status, validade, valor, criadaEm }) => ({ id, codigo, titulo, tipo: tipo || "proposta", status, validade, valor, criadaEm }));
}

export async function clientesSugeridos(lead, db) {
  return db.clientes.filter((c) => (lead.email && c.email === lead.email) || (digitos(lead.telefone).length >= 8 && digitos(c.whatsapp) === digitos(lead.telefone)))
    .map(({ id, nome, email }) => ({ id, nome, email }));
}

// ── Indicadores (estimado x fechado sempre separados) ─────
export async function resumo() {
  const [leads, atividades, reunioes, db] = await Promise.all([listarLeads(), listarAtividades(), listarReunioes(), lerDB()]);
  const ativos = leads.filter((l) => !l.arquivado);
  const abertos = ativos.filter((l) => ETAPAS_ABERTAS.includes(l.etapa));
  const fechados = leads.filter((l) => l.etapa === "fechado");
  const perdidos = leads.filter((l) => l.etapa === "perdido");
  const mes = hojeBR().slice(0, 7);
  const agora = agoraBR();
  const soma = (arr, c) => arr.reduce((t, l) => t + (Number(l[c]) || 0), 0);
  const porMes = (arr, campo) => arr.reduce((m, l) => { const k = String(l[campo] || "").slice(0, 7); if (k) m[k] = (m[k] || 0) + 1; return m; }, {});
  const contar = (arr, f) => arr.reduce((m, l) => { const k = f(l); if (k) m[k] = (m[k] || 0) + 1; return m; }, {});
  const ultimos6 = [...Array(6)].map((_, i) => { const d = new Date(`${mes}-01T12:00:00`); d.setMonth(d.getMonth() - (5 - i)); return d.toISOString().slice(0, 7); });
  const docsPorCliente = new Set(leads.filter((l) => l.clienteId).map((l) => l.clienteId));
  const docs = db.propostas.filter((p) => docsPorCliente.has(p.clienteId));
  const tempos = fechados.filter((l) => l.fechadoEm).map((l) => (new Date(l.fechadoEm) - new Date(l.criadoEm)) / 86400000);

  return {
    totais: {
      leads: leads.length, ativos: ativos.length, novosNoMes: leads.filter((l) => l.criadoEm.slice(0, 7) === mes).length,
      emAndamento: abertos.filter((l) => l.etapa !== "prospectado").length,
      reunioesAgendadas: reunioes.filter((r) => ["agendada", "reagendada"].includes(r.status) && r.quando >= agora).length,
      propostasEnviadas: docs.filter((d) => (d.tipo || "proposta") === "proposta").length,
      contratosFechados: fechados.length, perdidos: perdidos.length,
      taxaConversao: fechados.length + perdidos.length ? Math.round((fechados.length / (fechados.length + perdidos.length)) * 100) : null,
      tempoMedioDias: tempos.length ? Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length) : null,
    },
    valores: {
      estimadoAberto: soma(abertos, "valorEstimado"), mensalidadeEstimadaAberta: soma(abertos, "mensalidadeEstimada"),
      combinadoFechado: soma(fechados, "valorFechado"), mensalidadeCombinadaFechada: soma(fechados, "mensalidadeFechada"),
    },
    graficos: {
      porEtapa: Object.fromEntries(Object.keys(ETAPA).map((e) => [e, ativos.filter((l) => l.etapa === e).length])),
      meses: ultimos6,
      novosPorMes: porMes(leads, "criadoEm"), fechadosPorMes: porMes(fechados, "fechadoEm"),
      servicos: contar(leads, (l) => l.servico), motivosPerda: contar(perdidos, (l) => l.motivoPerda),
    },
    hoje: atividades.filter((a) => a.status === "pendente" && a.quando.slice(0, 10) === hojeBR()).sort((a, b) => a.quando.localeCompare(b.quando)),
    atrasadas: atividades.filter((a) => a.status === "pendente" && a.quando < agora && a.quando.slice(0, 10) < hojeBR()).sort((a, b) => a.quando.localeCompare(b.quando)),
    proximasReunioes: reunioes.filter((r) => ["agendada", "reagendada"].includes(r.status) && r.quando >= agora).sort((a, b) => a.quando.localeCompare(b.quando)).slice(0, 5),
    parados: abertos.filter((l) => l.etapa !== "prospectado" && (diasDesde(l.ultimoContato || l.criadoEm) ?? 0) >= DIAS_SEM_CONTATO).map(({ id, nome, ultimoContato, etapa }) => ({ id, nome, ultimoContato, etapa })),
    nomes: Object.fromEntries(leads.map((l) => [l.id, l.nome])),
  };
}

// ── Exportação CSV (com proteção contra fórmulas maliciosas no Excel) ──
export function csv(linhas, colunas) {
  const cel = (v) => { let s = v == null ? "" : String(v); if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; return `"${s.replace(/"/g, '""')}"`; };
  return "\uFEFF" + [colunas.map((c) => cel(c[1])).join(";"), ...linhas.map((l) => colunas.map((c) => cel(typeof c[0] === "function" ? c[0](l) : l[c[0]])).join(";"))].join("\r\n");
}
