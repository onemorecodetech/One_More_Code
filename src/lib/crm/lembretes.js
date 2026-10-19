// Gera os avisos do CRM na central de notificações (sem duplicar: cada aviso tem chave única).
// Roda quando o admin abre o CRM e no cron diário.
import { publicarSeguro } from "@/lib/notificacoes/central";
import { lerDB } from "@/lib/portal/storage";
import { listarLeads, listarAtividades, listarReunioes } from "./dados";
import { ETAPAS_ABERTAS, DIAS_SEM_CONTATO, agoraBR, hojeBR, diasDesde, dataBR } from "./config";

export async function verificarLembretes() {
  const [leads, atividades, reunioes, db] = await Promise.all([listarLeads(), listarAtividades(), listarReunioes(), lerDB()]);
  const nome = Object.fromEntries(leads.map((l) => [l.id, l.nome]));
  const agora = agoraBR(); const hoje = hojeBR();
  // daqui a 24 h, no mesmo formato de texto (Brasília)
  const amanha = new Date(Date.now() + 864e5).toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo" }).slice(0, 16).replace(" ", "T");
  let n = 0;

  for (const a of atividades.filter((x) => x.status === "pendente")) {
    const d = { titulo: a.titulo, leadId: a.leadId, empresa: nome[a.leadId], hora: a.quando.slice(11, 16), quando: dataBR(a.quando) };
    if (a.quando.slice(0, 10) < hoje) n += +!(await publicarSeguro("crm.atividade_atrasada", { chave: `crm:atrasada:${a.id}:${a.quando}`, dados: d })).duplicado;
    else if (a.quando.slice(0, 10) === hoje) n += +!(await publicarSeguro("crm.atividade_hoje", { chave: `crm:hoje:${a.id}:${a.quando}`, dados: d })).duplicado;
  }
  for (const r of reunioes.filter((x) => ["agendada", "reagendada"].includes(x.status) && x.quando >= agora && x.quando <= amanha)) {
    n += +!(await publicarSeguro("crm.reuniao_proxima", { chave: `crm:reuniao:${r.id}:${r.quando}`, dados: { titulo: r.titulo, leadId: r.leadId, empresa: nome[r.leadId], quando: dataBR(r.quando) } })).duplicado;
  }
  for (const l of leads.filter((x) => !x.arquivado && ETAPAS_ABERTAS.includes(x.etapa) && x.etapa !== "prospectado")) {
    const dias = diasDesde(l.ultimoContato || l.criadoEm);
    if (dias >= DIAS_SEM_CONTATO) n += +!(await publicarSeguro("crm.lead_parado", { chave: `crm:parado:${l.id}:${l.ultimoContato || l.criadoEm}`, dados: { leadId: l.id, empresa: l.nome, dias } })).duplicado;
    if (l.clienteId) {
      for (const p of db.propostas.filter((x) => x.clienteId === l.clienteId && x.status === "aguardando" && (x.tipo || "proposta") === "proposta")) {
        const diasDoc = diasDesde(p.criadaEm.slice(0, 10));
        if (diasDoc >= 5) n += +!(await publicarSeguro("crm.proposta_aguardando", { chave: `crm:proposta:${p.id}`, dados: { leadId: l.id, empresa: l.nome, codigo: p.codigo, dias: diasDoc } })).duplicado;
      }
    }
  }
  return n;
}
