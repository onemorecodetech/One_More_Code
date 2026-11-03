// Cobranças Pix vinculadas a contratos (pagamento confirmado manualmente pelo admin)
import crypto from "crypto";

export const STATUS_COBRANCA = {
  pendente: "Aguardando pagamento",
  informado: "Pagamento informado, em conferência",
  confirmado: "Pagamento confirmado",
  cancelado: "Cancelada",
};

export function novaCobranca(doc, { descricao, valor }) {
  const v = Math.round(Number(String(valor ?? "").replace(/\./g, "").replace(",", ".")) * 100) / 100;
  if (!Number.isFinite(v) || v < 1 || v > 1_000_000) throw new Error("Informe um valor entre R$ 1,00 e R$ 1.000.000,00.");
  const d = String(descricao || "").replace(/[\u0000-\u001F]/g, " ").trim().slice(0, 60);
  if (d.length < 3) throw new Error("Descreva a cobrança (ex.: Entrada 50%).");
  const n = (doc.cobrancas?.length || 0) + 1;
  return {
    id: crypto.randomUUID(), descricao: d, valor: v, status: "pendente",
    // identificador que aparece no extrato do banco (só letras e números, até 25)
    txid: `${String(doc.codigo || "OMC").replace(/[^A-Za-z0-9]/g, "")}C${n}`.slice(0, 25),
    criadaEm: new Date().toISOString(), informadoEm: null, confirmadoEm: null,
  };
}

// Cliente só vê cobranças de contrato com assinatura confirmada
export const cobrancasVisiveis = (doc, status) => ((doc.tipo === "contrato" && status === "aprovada") ? (doc.cobrancas || []).filter((c) => c.status !== "cancelado") : []);
