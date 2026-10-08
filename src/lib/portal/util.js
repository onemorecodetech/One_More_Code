export const STATUS = {
  aguardando: { label: "Aguardando assinatura", cor: "text-amber-300 bg-amber-400/10 border-amber-400/30" },
  conferencia: { label: "Assinada, em conferência", cor: "text-blue-300 bg-blue-400/10 border-blue-400/30" },
  aprovada: { label: "Assinatura confirmada", cor: "text-emerald-300 bg-emerald-400/10 border-emerald-400/30" },
  cancelada: { label: "Cancelada", cor: "text-white/50 bg-white/5 border-white/15" },
  expirada: { label: "Expirada", cor: "text-red-300 bg-red-400/10 border-red-400/30" },
};

// "aguardando" vira "expirada" depois da data de validade
export function statusAtual(proposta) {
  if (proposta.status === "aguardando" && proposta.validade) {
    const fim = new Date(proposta.validade + "T23:59:59-03:00");
    if (Date.now() > fim.getTime()) return "expirada";
  }
  return proposta.status;
}

export function moeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function data(iso) {
  if (!iso) return "";
  const d = iso.length === 10 ? new Date(iso + "T12:00:00") : new Date(iso);
  return d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

export function dataHora(iso) {
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  });
}

export const WHATSAPP = "5554991336638";

export function linkWhatsApp(mensagem) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
}

export const texto = (v, max = 500) => String(v ?? "").trim().slice(0, max);

// Confere se o arquivo enviado é mesmo um PDF (pelos primeiros bytes)
export function ehPdf(buffer) {
  return buffer.length > 4 && buffer.subarray(0, 4).toString() === "%PDF";
}

export const LIMITE_PDF = 4 * 1024 * 1024; // 4 MB (limite seguro da Vercel)
