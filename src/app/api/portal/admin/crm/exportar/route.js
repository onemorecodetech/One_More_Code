// Exportação CSV (somente admin). Filtros iguais aos da tela de relatórios.
import { rotaAdmin } from "@/lib/crm/rota";
import { listarLeads, csv } from "@/lib/crm/dados";
import { ETAPA, PRIORIDADES } from "@/lib/crm/config";
import { filtrarLeads } from "@/lib/crm/filtros";

export const GET = rotaAdmin(async (request) => {
  const q = Object.fromEntries(new URL(request.url).searchParams);
  const leads = filtrarLeads(await listarLeads(), q);
  const corpoCsv = csv(leads, [
    ["nome", "Empresa"], ["responsavel", "Contato"], ["segmento", "Segmento"], ["cidade", "Cidade"], ["uf", "UF"],
    ["telefone", "Telefone"], ["email", "E-mail"], ["instagram", "Instagram"], ["origem", "Origem"], ["servico", "Serviço"],
    [(l) => ETAPA[l.etapa]?.nome, "Etapa"], [(l) => PRIORIDADES[l.prioridade], "Prioridade"],
    ["valorEstimado", "Valor estimado (R$)"], ["mensalidadeEstimada", "Mensalidade estimada (R$)"],
    ["valorFechado", "Valor fechado (R$)"], ["mensalidadeFechada", "Mensalidade fechada (R$)"],
    ["primeiroContato", "Primeiro contato"], ["ultimoContato", "Último contato"], ["motivoPerda", "Motivo da perda"],
    [(l) => (l.arquivado ? "Sim" : "Não"), "Arquivado"], [(l) => l.criadoEm.slice(0, 10), "Cadastrado em"],
  ]);
  return new Response(corpoCsv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="crm-onemorecode-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
});
