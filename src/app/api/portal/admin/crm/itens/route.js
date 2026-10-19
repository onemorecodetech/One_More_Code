// Interações (histórico de contatos), atividades e reuniões: criar, editar e excluir
import { rotaAdmin, corpo } from "@/lib/crm/rota";
import { salvarInteracao, salvarAtividade, salvarReuniao, excluirItem, ErroCRM } from "@/lib/crm/dados";

export const POST = rotaAdmin(async (request) => {
  const b = await corpo(request);
  if (b.tipo === "interacao") return { interacao: await salvarInteracao(String(b.leadId || ""), b.dados || {}) };
  if (b.tipo === "atividade") return { atividade: await salvarAtividade(b.dados || {}) };
  if (b.tipo === "reuniao") return { reuniao: await salvarReuniao(b.dados || {}) };
  throw new ErroCRM("Tipo inválido.");
});

export const DELETE = rotaAdmin(async (request) => {
  const b = await corpo(request);
  await excluirItem(b.tipo, String(b.id || ""), String(b.leadId || ""));
  return { ok: true };
});
