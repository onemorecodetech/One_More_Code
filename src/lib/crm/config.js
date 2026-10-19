// Configurações do CRM usadas no servidor e na tela
export const ETAPAS = [
  { id: "prospectado", nome: "Prospectado", cor: "bg-slate-400" },
  { id: "primeiro_contato", nome: "Primeiro contato", cor: "bg-sky-400" },
  { id: "interessado", nome: "Interessado", cor: "bg-cyan-400" },
  { id: "prototipo", nome: "Protótipo criado", cor: "bg-violet-400" },
  { id: "reuniao", nome: "Reunião agendada", cor: "bg-indigo-400" },
  { id: "proposta", nome: "Proposta enviada", cor: "bg-blue-400" },
  { id: "negociacao", nome: "Em negociação", cor: "bg-amber-400" },
  { id: "fechado", nome: "Fechado", cor: "bg-emerald-400" },
  { id: "perdido", nome: "Perdido", cor: "bg-red-400" },
];
export const ETAPA = Object.fromEntries(ETAPAS.map((e) => [e.id, e]));
export const ETAPAS_ABERTAS = ETAPAS.filter((e) => !["fechado", "perdido"].includes(e.id)).map((e) => e.id);

export const PRIORIDADES = { baixa: "Baixa", media: "Média", alta: "Alta" };
export const TIPOS_CONTATO = { whatsapp: "WhatsApp", instagram: "Instagram", ligacao: "Ligação", email: "E-mail", reuniao: "Reunião", outro: "Outro" };
export const STATUS_ATIVIDADE = { pendente: "Pendente", concluida: "Concluída", cancelada: "Cancelada" };
export const STATUS_REUNIAO = { agendada: "Agendada", realizada: "Realizada", cancelada: "Cancelada", reagendada: "Reagendada" };
export const STATUS_APRESENTACAO = { nao_apresentado: "Não apresentado", agendado: "Apresentação agendada", apresentado: "Apresentado", aprovado: "Aprovado", ajustes: "Ajustes solicitados" };

// Catálogo inicial (só nomes; o valor é definido em cada negociação). Editável no CRM.
export const SERVICOS_PADRAO = ["Landing page", "Site institucional", "Site + painel administrativo", "Loja virtual / E-commerce", "Cardápio digital", "Sistema web personalizado", "Aplicativo", "Automação", "Logotipo / Design"];

export const DIAS_SEM_CONTATO = 7; // negociação "parada" depois de 7 dias sem contato

export const moeda = (v) => (v == null || v === "" ? "—" : Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));

// Data/hora atual em Brasília no formato "AAAA-MM-DDTHH:mm" (o mesmo dos campos de data)
export function agoraBR() {
  return new Date().toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo" }).slice(0, 16).replace(" ", "T");
}
export const hojeBR = () => agoraBR().slice(0, 10);

export function dataBR(v) {
  if (!v) return "—";
  const [d, h] = String(v).split("T");
  const [a, m, dia] = d.split("-");
  return `${dia}/${m}/${a}${h ? ` ${h.slice(0, 5)}` : ""}`;
}

export function diasDesde(data) {
  if (!data) return null;
  return Math.floor((new Date(hojeBR()) - new Date(String(data).slice(0, 10))) / 86400000);
}
