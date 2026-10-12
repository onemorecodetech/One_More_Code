// Central de notificações: um único lugar para avisar admin e clientes.
// 1) cria o aviso no site (sino), 2) coloca o e-mail numa fila (outbox),
// 3) a fila é processada depois da resposta, com novas tentativas em caso de falha.
// Uma falha no e-mail nunca desfaz a operação principal (cadastro, assinatura etc.).
import crypto from "crypto";
import * as kv from "@/lib/kv";
import { EVENTOS, CATEGORIAS } from "./eventos";
import { montar } from "@/lib/email/modelos";
import { enviarEmail, EMAIL_ADMIN } from "@/lib/email/enviar";
import { lerDB } from "@/lib/portal/storage";

const MAX_NOTIF = 200;
const ESPERAS_MIN = [1, 5, 30, 120, 720]; // novas tentativas: 1 min, 5 min, 30 min, 2 h, 12 h
const LIMITE_DIA = Number(process.env.EMAIL_LIMITE_DIA || 90); // Resend grátis: 100/dia

const chaveNotif = (dest) => `omc:notif:${dest}`;
export const destinoCliente = (id) => `cliente:${id}`;

const PREF_PADRAO = { propostas: true, projetos: true, manutencao: true, reunioes: true, orcamentos: true };

export async function lerPreferencias(dest) {
  return { ...PREF_PADRAO, ...((await kv.get(`omc:pref:${dest}`)) || {}) };
}
export async function salvarPreferencias(dest, prefs) {
  const limpo = {};
  for (const [k, v] of Object.entries(prefs || {})) if (CATEGORIAS[k] && !CATEGORIAS[k].essencial) limpo[k] = !!v;
  await kv.set(`omc:pref:${dest}`, { ...(await lerPreferencias(dest)), ...limpo });
}

async function querEmail(dest, categoria) {
  if (CATEGORIAS[categoria]?.essencial) return true; // contratos, cadastro etc. sempre vão
  return (await lerPreferencias(dest))[categoria] !== false;
}

async function criarNotificacao(dest, n) {
  const chave = chaveNotif(dest);
  await kv.hset(chave, n.id, n);
  const todas = await kv.hgetall(chave);
  const ids = Object.values(todas).sort((a, b) => b.criadaEm.localeCompare(a.criadaEm)).slice(MAX_NOTIF).map((x) => x.id);
  if (ids.length) await kv.hdel(chave, ...ids);
}

export async function enfileirarEmail({ para, conteudo, idempotencia, responderPara }) {
  const id = crypto.randomUUID();
  await kv.hset("omc:outbox", id, {
    id, para, ...conteudo, responderPara: responderPara || null,
    idempotencia: idempotencia || id, tentativas: 0, status: "pendente",
    proxima: Date.now(), criadoEm: new Date().toISOString(), erro: null,
  });
  return id;
}

// Publica um evento. chave = identificador único (evita avisos repetidos).
export async function publicar(tipo, { chave, clienteId, dados = {} } = {}) {
  const ev = EVENTOS[tipo];
  if (!ev || ev.modulo !== "ativo") throw new Error(`Evento desconhecido ou inativo: ${tipo}`);

  if (chave && !(await kv.setNX(`omc:evento:${chave}`, tipo, 60 * 60 * 24 * 180))) return { duplicado: true };

  const categoria = ev.categoriaPor ? ev.categoriaPor(dados) : ev.categoria;
  const agora = new Date().toISOString();
  let cliente = null;
  if (clienteId) cliente = (await lerDB()).clientes.find((c) => c.id === clienteId) || null;
  const d = { ...dados, primeiroNome: (dados.nomeCliente || cliente?.nome || dados.nome || "").split(" ")[0] };

  const lados = [];
  if (ev.admin) lados.push(["admin", ev.admin, EMAIL_ADMIN]);
  if (ev.cliente && cliente) lados.push([destinoCliente(cliente.id), ev.cliente, cliente.email]);

  for (const [dest, cfg, email] of lados) {
    await criarNotificacao(dest, {
      id: crypto.randomUUID(), tipo, categoria, titulo: cfg.titulo(d), mensagem: cfg.mensagem(d),
      link: cfg.link(d), criadaEm: agora, lida: false,
    });
    if (cfg.email && email && (await querEmail(dest, categoria))) {
      const t = cfg.emailTexto ? cfg.emailTexto(d) : { assunto: cfg.titulo(d), titulo: cfg.titulo(d), paragrafos: [cfg.mensagem(d)], botao: { texto: "Abrir", link: cfg.link(d) } };
      await enfileirarEmail({ para: email, conteudo: montar(t), idempotencia: `${chave || crypto.randomUUID()}:${dest}`, responderPara: dest === "admin" ? null : EMAIL_ADMIN });
    }
  }
  return { ok: true };
}

// Versão segura: nunca lança erro (a operação principal não pode falhar por causa do aviso)
export async function publicarSeguro(tipo, opcoes) {
  try {
    return await publicar(tipo, opcoes);
  } catch (e) {
    console.error(`[notificacoes] falha ao publicar ${tipo}:`, e.message);
    return { erro: true };
  }
}

// Envia os e-mails pendentes. Chamado depois da resposta (after), pelo cron e pelo painel.
export async function processarFila(limite = 10) {
  const itens = Object.values(await kv.hgetall("omc:outbox"))
    .filter((e) => e.status === "pendente" && e.proxima <= Date.now())
    .sort((a, b) => a.proxima - b.proxima)
    .slice(0, limite);
  const resultado = { enviados: 0, falhas: 0, adiados: 0 };

  for (const e of itens) {
    if (!(await kv.setNX(`omc:outbox:trava:${e.id}`, 1, 120))) continue; // outro servidor já está enviando
    const hoje = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
    if ((await kv.incr(`omc:email:dia:${hoje}`, 60 * 60 * 26)) > LIMITE_DIA) {
      await kv.hset("omc:outbox", e.id, { ...e, proxima: Date.now() + 60 * 60 * 1000, erro: "Limite diário de e-mails atingido; nova tentativa em 1 hora" });
      resultado.adiados++;
      continue;
    }
    try {
      const r = await enviarEmail({ para: e.para, assunto: e.assunto, html: e.html, texto: e.texto, idempotencia: e.idempotencia, responderPara: e.responderPara });
      await kv.hdel("omc:outbox", e.id);
      await kv.lpushTrim("omc:email:historico", { para: e.para, assunto: e.assunto, em: new Date().toISOString(), id: r.id, tentativas: e.tentativas + 1 }, 200);
      resultado.enviados++;
    } catch (err) {
      const tentativas = e.tentativas + 1;
      const falhou = tentativas >= ESPERAS_MIN.length;
      await kv.hset("omc:outbox", e.id, {
        ...e, tentativas, status: falhou ? "falhou" : "pendente",
        proxima: Date.now() + (ESPERAS_MIN[tentativas - 1] || 720) * 60000, erro: String(err.message).slice(0, 300),
      });
      console.error(`[email] falha ao enviar para ${e.para.replace(/(.).+@/, "$1***@")}:`, err.message);
      resultado.falhas++;
    } finally {
      await kv.del(`omc:outbox:trava:${e.id}`);
    }
  }
  return resultado;
}

// Agenda o processamento para depois da resposta ao usuário
export async function processarDepois() {
  try {
    const { after } = await import("next/server");
    after(() => processarFila().catch((e) => console.error("[email] fila:", e.message)));
  } catch {
    processarFila().catch(() => {});
  }
}

export async function listarNotificacoes(dest, { categoria, lidas } = {}) {
  let lista = Object.values(await kv.hgetall(chaveNotif(dest))).sort((a, b) => b.criadaEm.localeCompare(a.criadaEm));
  const naoLidas = lista.filter((n) => !n.lida).length;
  if (categoria) lista = lista.filter((n) => n.categoria === categoria);
  if (lidas === "sim") lista = lista.filter((n) => n.lida);
  if (lidas === "nao") lista = lista.filter((n) => !n.lida);
  return { lista, naoLidas };
}

export async function marcarLidas(dest, ids, todas = false) {
  const chave = chaveNotif(dest);
  const atuais = await kv.hgetall(chave);
  for (const n of Object.values(atuais)) {
    if (!n.lida && (todas || ids.includes(n.id))) await kv.hset(chave, n.id, { ...n, lida: true });
  }
}

export async function statusFila() {
  const itens = Object.values(await kv.hgetall("omc:outbox"));
  return {
    pendentes: itens.filter((e) => e.status === "pendente").length,
    falhas: itens.filter((e) => e.status === "falhou").map(({ id, para, assunto, erro, tentativas }) => ({ id, para, assunto, erro, tentativas })),
    historico: (await kv.lrange("omc:email:historico", 15)),
  };
}

export async function reenviarFalhas() {
  for (const e of Object.values(await kv.hgetall("omc:outbox"))) {
    if (e.status === "falhou") await kv.hset("omc:outbox", e.id, { ...e, status: "pendente", tentativas: 0, proxima: Date.now(), erro: null });
  }
}
