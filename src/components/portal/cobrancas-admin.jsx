"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const COR = { pendente: "text-amber-200", informado: "text-blue-200", confirmado: "text-emerald-300", cancelado: "text-white/50 line-through" };
const NOME = { pendente: "Aguardando pagamento", informado: "Cliente informou o pagamento", confirmado: "Pagamento confirmado", cancelado: "Cancelada" };
const moeda = (v) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Admin: cobranças Pix de um contrato (criar, confirmar, cancelar, reabrir)
export default function CobrancasAdmin({ docId, cobrancas = [], podeCriar }) {
  const router = useRouter(); const [erro, setErro] = useState(""); const [ocupado, setOcupado] = useState(false);
  async function chamar(method, body, confirmar) {
    if (confirmar && !confirm(confirmar)) return;
    setOcupado(true); setErro("");
    const r = await fetch(`/api/portal/admin/propostas/${docId}/cobrancas`, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({})); setOcupado(false);
    if (!r.ok) return setErro(d.erro || "Não foi possível concluir.");
    router.refresh();
  }
  async function criar(e) {
    e.preventDefault(); const f = e.currentTarget;
    await chamar("POST", Object.fromEntries(new FormData(f))); f.reset();
  }
  if (!podeCriar && cobrancas.length === 0) return null;
  return (
    <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-3 text-sm font-semibold">Cobranças Pix</p>
      {cobrancas.length > 0 && (
        <ul className="mb-3 space-y-2 text-sm">
          {cobrancas.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2">
              <span><strong>{c.descricao}</strong> · {moeda(c.valor)} · <span className={COR[c.status]}>{NOME[c.status]}</span> <span className="text-white/40">· id {c.txid}</span></span>
              <span className="flex gap-3">
                {(c.status === "pendente" || c.status === "informado") && <button disabled={ocupado} onClick={() => chamar("PATCH", { acao: "confirmar", cobrancaId: c.id }, `Confirmar o recebimento de ${moeda(c.valor)}? Confira antes no extrato do banco (identificador ${c.txid}).`)} className="font-semibold text-emerald-300 hover:underline">Confirmar pagamento</button>}
                {c.status === "informado" && <button disabled={ocupado} onClick={() => chamar("PATCH", { acao: "reabrir", cobrancaId: c.id }, "O Pix não caiu? A cobrança volta a ficar pendente para o cliente.")} className="text-white/70 hover:underline">Não recebi</button>}
                {(c.status === "pendente" || c.status === "informado") && <button disabled={ocupado} onClick={() => chamar("PATCH", { acao: "cancelar", cobrancaId: c.id }, `Cancelar a cobrança "${c.descricao}"?`)} className="text-red-300 hover:underline">Cancelar</button>}
                {c.status === "cancelado" && <button disabled={ocupado} onClick={() => chamar("PATCH", { acao: "reabrir", cobrancaId: c.id })} className="text-white/70 hover:underline">Reabrir</button>}
              </span>
            </li>
          ))}
        </ul>
      )}
      {podeCriar && (
        <form onSubmit={criar} className="flex flex-wrap items-end gap-2">
          <label className="text-xs text-white/60">Descrição<input name="descricao" required minLength={3} maxLength={60} placeholder="Entrada 50%" className="mt-1 block w-44 rounded-lg border border-white/15 bg-[#0B0F1A] px-3 py-2 text-sm text-white" /></label>
          <label className="text-xs text-white/60">Valor (R$)<input name="valor" required inputMode="decimal" placeholder="500,00" className="mt-1 block w-28 rounded-lg border border-white/15 bg-[#0B0F1A] px-3 py-2 text-sm text-white" /></label>
          <button type="submit" disabled={ocupado} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">Criar cobrança</button>
        </form>
      )}
      {erro && <p role="alert" className="mt-2 text-sm text-red-300">{erro}</p>}
    </div>
  );
}
