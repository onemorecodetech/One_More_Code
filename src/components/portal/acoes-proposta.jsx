"use client";

import { useRouter } from "next/navigation";
import { useEnvio } from "./use-envio";

const BOTOES = {
  conferencia: [
    { acao: "confirmar", texto: "Confirmar assinatura", estilo: "bg-emerald-500 hover:bg-emerald-600 text-white" },
    { acao: "reenviar", texto: "Pedir novo envio", estilo: "border border-white/15 hover:border-amber-400 hover:text-amber-300" },
  ],
  aguardando: [{ acao: "cancelar", texto: "Cancelar proposta", estilo: "border border-white/15 hover:border-red-400 hover:text-red-300" }],
  expirada: [{ acao: "reabrir", texto: "Reabrir", estilo: "border border-white/15 hover:border-blue-400 hover:text-blue-300" }],
  cancelada: [{ acao: "reabrir", texto: "Reabrir", estilo: "border border-white/15 hover:border-blue-400 hover:text-blue-300" }],
};

export default function AcoesProposta({ id, status }) {
  const router = useRouter();
  const { enviando, erro, enviar } = useEnvio();
  const botoes = BOTOES[status] || [];

  async function executar(acao) {
    if (acao === "cancelar" && !confirm("Cancelar esta proposta?")) return;
    const ok = await enviar(`/api/portal/admin/propostas/${id}`, { method: "PATCH", json: { acao } });
    if (ok) router.refresh();
  }

  if (!botoes.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {botoes.map((b) => (
        <button
          key={b.acao}
          onClick={() => executar(b.acao)}
          disabled={enviando}
          className={`min-h-10 rounded-lg px-4 text-sm font-semibold transition disabled:opacity-60 ${b.estilo}`}
        >
          {b.texto}
        </button>
      ))}
      {erro && <span className="text-sm text-red-400">{erro}</span>}
    </div>
  );
}
