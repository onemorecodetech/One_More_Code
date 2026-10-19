// Filtros compartilhados entre a tela de relatórios e a exportação CSV
export function filtrarLeads(leads, q = {}) {
  return leads.filter((l) =>
    (!q.etapa || l.etapa === q.etapa) &&
    (!q.servico || l.servico === q.servico) &&
    (!q.origem || (l.origem || "").toLowerCase() === q.origem.toLowerCase()) &&
    (!q.cidade || (l.cidade || "").toLowerCase().includes(q.cidade.toLowerCase())) &&
    (!q.prioridade || l.prioridade === q.prioridade) &&
    (!q.responsavel || (l.responsavelComercial || "").toLowerCase().includes(q.responsavel.toLowerCase())) &&
    (q.arquivados === "sim" ? l.arquivado : q.arquivados === "todos" ? true : !l.arquivado) &&
    (!q.de || l.criadoEm.slice(0, 10) >= q.de) &&
    (!q.ate || l.criadoEm.slice(0, 10) <= q.ate) &&
    (!q.busca || (l.nome || "").toLowerCase().includes(q.busca.toLowerCase()))
  );
}
