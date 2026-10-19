import { rotaAdmin, corpo } from "@/lib/crm/rota";
import { listarLeads, criarLead, listarAtividades, listarReunioes, salvarAtividade, salvarReuniao, lerServicos, salvarServicos, resumo, ErroCRM } from "@/lib/crm/dados";
import { verificarLembretes } from "@/lib/crm/lembretes";
import { processarDepois } from "@/lib/notificacoes/central";

// GET ?visao=resumo|leads|atividades|reunioes|servicos
export const GET = rotaAdmin(async (request) => {
  const visao = new URL(request.url).searchParams.get("visao") || "leads";
  if (visao === "resumo") { await verificarLembretes().catch(() => {}); return resumo(); }
  if (visao === "leads") return { leads: (await listarLeads()).map(({ historico, observacoes, ...l }) => l), servicos: await lerServicos() };
  if (visao === "atividades") return { atividades: await listarAtividades(), leads: (await listarLeads()).map(({ id, nome }) => ({ id, nome })) };
  if (visao === "reunioes") return { reunioes: await listarReunioes(), leads: (await listarLeads()).map(({ id, nome }) => ({ id, nome })) };
  if (visao === "servicos") return { servicos: await lerServicos() };
  throw new ErroCRM("Visão inválida.");
});

// POST { tipo: "lead" | "atividade" | "reuniao" | "servicos", ... }
export const POST = rotaAdmin(async (request) => {
  const b = await corpo(request);
  if (b.tipo === "lead") return { lead: await criarLead(b.dados || {}) };
  if (b.tipo === "atividade") { const a = await salvarAtividade(b.dados || {}); return { atividade: a }; }
  if (b.tipo === "reuniao") {
    const r = await salvarReuniao(b.dados || {});
    await processarDepois();
    return { reuniao: r };
  }
  if (b.tipo === "servicos") return { servicos: await salvarServicos(b.lista) };
  throw new ErroCRM("Tipo inválido.");
});
