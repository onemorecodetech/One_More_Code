import { rotaAdmin, corpo } from "@/lib/crm/rota";
import { lerLead, atualizarLead, excluirLead, listarInteracoes, listarAtividades, listarReunioes, documentosDoLead, clientesSugeridos, duplicados, listarLeads } from "@/lib/crm/dados";
import { lerDB } from "@/lib/portal/storage";
import { publicarSeguro } from "@/lib/notificacoes/central";

export const GET = rotaAdmin(async (request, { params }) => {
  const { id } = await params;
  const [lead, db] = await Promise.all([lerLead(id), lerDB()]);
  const cliente = lead.clienteId ? db.clientes.find((c) => c.id === lead.clienteId) : null;
  return {
    lead,
    interacoes: await listarInteracoes(id),
    atividades: (await listarAtividades()).filter((a) => a.leadId === id),
    reunioes: (await listarReunioes()).filter((r) => r.leadId === id),
    documentos: await documentosDoLead(lead, db),
    cliente: cliente ? { id: cliente.id, nome: cliente.nome, email: cliente.email } : null,
    sugestoesCliente: lead.clienteId ? [] : await clientesSugeridos(lead, db),
    clientes: lead.clienteId ? [] : db.clientes.map(({ id, nome, email }) => ({ id, nome, email })),
    duplicados: duplicados(lead, await listarLeads()),
  };
});

// PATCH { dados?, etapa?, confirmar?, motivoPerda?, valorFechado?, mensalidadeFechada?, arquivado?, vincularCliente?, desvincularCliente? }
export const PATCH = rotaAdmin(async (request, { params }) => {
  const { id } = await params;
  const b = await corpo(request);
  const antes = await lerLead(id);
  const lead = await atualizarLead(id, b);
  if (b.vincularCliente && !antes.clienteId && lead.clienteId) {
    const db = await lerDB();
    const c = db.clientes.find((x) => x.id === lead.clienteId);
    await publicarSeguro("crm.lead_convertido", { chave: `crm:convertido:${id}:${lead.clienteId}`, dados: { leadId: id, empresa: lead.nome, cliente: c?.nome || "cliente" } });
  }
  return { lead };
});

export const DELETE = rotaAdmin(async (request, { params }) => {
  const { id } = await params;
  return { ok: true, removidos: await excluirLead(id) };
});
