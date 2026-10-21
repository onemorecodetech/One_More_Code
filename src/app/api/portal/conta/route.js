// Configurações da conta do cliente: editar dados, e-mail e senha, baixar os dados (LGPD) e excluir a conta.
import { NextResponse } from "next/server";
import { lerDB, salvarDB, apagarArquivos } from "@/lib/portal/storage";
import { lerSessao, conferirSenha, hashSenha, encerrarSessao } from "@/lib/portal/auth";
import { registrarTentativa, limparTentativas } from "@/lib/portal/limite";
import { listarNotificacoes, publicarSeguro } from "@/lib/notificacoes/central";
import * as kv from "@/lib/kv";

const json = (d, status = 200) => NextResponse.json(d, { status, headers: { "Cache-Control": "no-store" } });
const texto = (v, max) => String(v ?? "").replace(/[\u0000-\u001F]/g, " ").trim().slice(0, max);
// Documentos assinados ou em conferência precisam ser guardados pelo prazo legal
const GUARDAR = new Set(["aprovada", "conferencia"]);

async function contexto() {
  const s = await lerSessao();
  if (s?.tipo !== "cliente") return null;
  const db = await lerDB();
  const cliente = db.clientes.find((c) => c.id === s.id && !c.encerrada);
  return cliente ? { db, cliente } : null;
}

// Confere a senha atual com limite de tentativas (5 a cada 15 minutos)
async function senhaConfere(cliente, senha) {
  const chave = `conta:${cliente.id}`;
  if ((await registrarTentativa(chave, { maximo: 5, minutos: 15 })).bloqueado) return "bloqueado";
  if (!conferirSenha(String(senha || "").slice(0, 200), cliente.senha)) return false;
  await limparTentativas(chave);
  return true;
}
const erroSenha = (r) => (r === "bloqueado" ? json({ erro: "Muitas tentativas. Aguarde 15 minutos." }, 429) : json({ erro: "Senha atual incorreta." }, 401));

export async function GET(request) {
  const ctx = await contexto(); if (!ctx) return json({ erro: "Não autorizado." }, 401);
  const { cliente, db } = ctx;
  const dados = { nome: cliente.nome, email: cliente.email, whatsapp: cliente.whatsapp, criadoEm: cliente.criadoEm };
  if (new URL(request.url).searchParams.get("exportar") !== "1") return json({ conta: dados });
  // Portabilidade (art. 18, V, da LGPD): tudo o que a OneMoreCode guarda sobre o cliente
  const documentos = db.propostas.filter((p) => p.clienteId === cliente.id).map(({ codigo, tipo, titulo, valor, status, criadaEm, assinadaEm, validade }) => ({ codigo, tipo: tipo || "proposta", titulo, valor, status, criadaEm, assinadaEm, validade }));
  const { lista } = await listarNotificacoes(`cliente:${cliente.id}`);
  const arquivo = {
    geradoEm: new Date().toISOString(), controlador: "ONEMORECODE DESENVOLVIMENTO DE SOFTWARE LTDA.",
    conta: dados, documentos,
    notificacoes: lista.map(({ titulo, mensagem, criadaEm, lida }) => ({ titulo, mensagem, criadaEm, lida })),
    preferencias: (await kv.get(`omc:pref:cliente:${cliente.id}`)) || {},
    observacao: "A senha não é exportada porque é guardada apenas como código irreversível.",
  };
  return new Response(JSON.stringify(arquivo, null, 2), { headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="meus-dados-onemorecode.json"`, "Cache-Control": "no-store" } });
}

export async function PATCH(request) {
  const ctx = await contexto(); if (!ctx) return json({ erro: "Não autorizado." }, 401);
  const { db, cliente } = ctx;
  const b = await request.json().catch(() => ({}));

  if (b.acao === "dados") {
    const nome = texto(b.nome, 120); const whatsapp = texto(b.whatsapp, 20).replace(/\D/g, "");
    if (nome.length < 2) return json({ erro: "Informe seu nome." }, 400);
    if (whatsapp.length < 10 || whatsapp.length > 13) return json({ erro: "Informe o WhatsApp com DDD." }, 400);
    cliente.nome = nome; cliente.whatsapp = whatsapp;
  } else if (b.acao === "email") {
    const email = texto(b.email, 160).toLowerCase();
    if (!/^[^\s@<>"]+@[^\s@<>"]+\.[a-z]{2,}$/i.test(email)) return json({ erro: "Informe um e-mail válido." }, 400);
    const r = await senhaConfere(cliente, b.senhaAtual); if (r !== true) return erroSenha(r);
    if (email === cliente.email) return json({ erro: "Este já é o seu e-mail." }, 400);
    if (db.clientes.some((c) => c.email === email && c.id !== cliente.id)) return json({ erro: "Este e-mail já está em uso em outra conta." }, 409);
    cliente.email = email;
  } else if (b.acao === "senha") {
    const nova = String(b.novaSenha || "");
    if (nova.length < 8 || nova.length > 200) return json({ erro: "A nova senha precisa ter pelo menos 8 caracteres." }, 400);
    const r = await senhaConfere(cliente, b.senhaAtual); if (r !== true) return erroSenha(r);
    if (conferirSenha(nova, cliente.senha)) return json({ erro: "A nova senha precisa ser diferente da atual." }, 400);
    cliente.senha = hashSenha(nova);
  } else return json({ erro: "Ação inválida." }, 400);

  cliente.atualizadoEm = new Date().toISOString();
  await salvarDB(db);
  return json({ ok: true, conta: { nome: cliente.nome, email: cliente.email, whatsapp: cliente.whatsapp } });
}

// Exclusão da conta. Documentos assinados ficam guardados pelo prazo legal (art. 16 da LGPD).
export async function DELETE(request) {
  const ctx = await contexto(); if (!ctx) return json({ erro: "Não autorizado." }, 401);
  const { db, cliente } = ctx;
  const b = await request.json().catch(() => ({}));
  if (String(b.confirmacao || "").trim().toUpperCase() !== "EXCLUIR") return json({ erro: "Digite EXCLUIR para confirmar." }, 400);
  const r = await senhaConfere(cliente, b.senha); if (r !== true) return erroSenha(r);

  const docs = db.propostas.filter((p) => p.clienteId === cliente.id);
  const guardar = docs.filter((d) => GUARDAR.has(d.status));
  const apagar = docs.filter((d) => !GUARDAR.has(d.status));
  const nome = cliente.nome;

  db.propostas = db.propostas.filter((p) => !apagar.includes(p));
  if (guardar.length) {
    // Conta encerrada: sem acesso e sem dados de contato; fica só o necessário para identificar os documentos
    Object.assign(cliente, { encerrada: true, encerradaEm: new Date().toISOString(), senha: null, whatsapp: "", email: `conta-encerrada-${cliente.id}@invalido.local` });
  } else {
    db.clientes = db.clientes.filter((c) => c.id !== cliente.id);
  }
  await salvarDB(db);
  await apagarArquivos(apagar.flatMap((d) => [d.arquivoOriginal, d.arquivoAssinado])).catch(() => {});
  await kv.del(`omc:notif:cliente:${cliente.id}`).catch(() => {});
  await kv.del(`omc:pref:cliente:${cliente.id}`).catch(() => {});
  await publicarSeguro("cliente.conta_excluida", { chave: `conta-excluida:${cliente.id}`, dados: { nome, documentosGuardados: guardar.length } });
  await encerrarSessao();
  return json({ ok: true, documentosGuardados: guardar.length });
}
