// Admin cria, confirma, cancela ou reabre cobranças Pix de um contrato
import { NextResponse } from "next/server";
import { lerSessao } from "@/lib/portal/auth";
import { lerDB, salvarDB } from "@/lib/portal/storage";
import { statusAtual, moeda } from "@/lib/portal/util";
import { novaCobranca, STATUS_COBRANCA } from "@/lib/portal/cobrancas";
import { publicarSeguro, processarDepois } from "@/lib/notificacoes/central";

const json = (d, status = 200) => NextResponse.json(d, { status, headers: { "Cache-Control": "no-store" } });

async function carregar(contexto) {
  if ((await lerSessao())?.tipo !== "admin") return { erro: json({ erro: "Não autorizado." }, 401) };
  const { id } = await contexto.params;
  const db = await lerDB();
  const doc = db.propostas.find((p) => p.id === id);
  if (!doc) return { erro: json({ erro: "Documento não encontrado." }, 404) };
  return { db, doc };
}

export async function POST(request, contexto) {
  const { db, doc, erro } = await carregar(contexto); if (erro) return erro;
  if (doc.tipo !== "contrato") return json({ erro: "Cobranças só podem ser criadas em contratos." }, 400);
  if (statusAtual(doc) !== "aprovada") return json({ erro: "Confirme a assinatura do contrato antes de criar cobranças." }, 400);
  let c;
  try { c = novaCobranca(doc, await request.json().catch(() => ({}))); } catch (e) { return json({ erro: e.message }, 400); }
  doc.cobrancas = [...(doc.cobrancas || []), c];
  doc.historico.push({ em: c.criadaEm, texto: `Cobrança Pix criada: ${c.descricao} (${moeda(c.valor)})` });
  await salvarDB(db);
  await publicarSeguro("cobranca.disponivel", { chave: `cobranca:${c.id}`, clienteId: doc.clienteId, dados: { id: doc.id, codigo: doc.codigo, descricao: c.descricao, valorTexto: moeda(c.valor) } });
  await processarDepois();
  return json({ ok: true, cobranca: c });
}

const ACOES = {
  confirmar: { de: ["pendente", "informado"], para: "confirmado" },
  cancelar: { de: ["pendente", "informado"], para: "cancelado" },
  reabrir: { de: ["informado", "cancelado"], para: "pendente" },
};

export async function PATCH(request, contexto) {
  const { db, doc, erro } = await carregar(contexto); if (erro) return erro;
  const b = await request.json().catch(() => ({}));
  const regra = ACOES[b.acao];
  const c = (doc.cobrancas || []).find((x) => x.id === b.cobrancaId);
  if (!regra || !c) return json({ erro: "Cobrança ou ação inválida." }, 400);
  if (!regra.de.includes(c.status)) return json({ erro: `Não é possível ${b.acao} uma cobrança "${STATUS_COBRANCA[c.status]}".` }, 409);
  c.status = regra.para;
  if (regra.para === "confirmado") c.confirmadoEm = new Date().toISOString();
  if (regra.para === "pendente") c.informadoEm = null;
  doc.historico.push({ em: new Date().toISOString(), texto: `Cobrança "${c.descricao}": ${STATUS_COBRANCA[c.status].toLowerCase()}` });
  await salvarDB(db);
  if (regra.para === "confirmado") {
    await publicarSeguro("pagamento.confirmado", { chave: `pagamento-confirmado:${c.id}`, clienteId: doc.clienteId, dados: { id: doc.id, codigo: doc.codigo, descricao: c.descricao, valorTexto: moeda(c.valor) } });
    await processarDepois();
  }
  return json({ ok: true, cobranca: c });
}
