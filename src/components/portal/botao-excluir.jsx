"use client";

import { useRouter } from "next/navigation";
import { useEnvio } from "./use-envio";

// Botão de excluir com confirmação (usado para clientes e documentos)
export default function BotaoExcluir({ url, confirmacao, texto = "Excluir" }) {
  const router = useRouter();
  const { enviando, erro, enviar } = useEnvio();

  async function excluir() {
    if (!confirm(confirmacao)) return;
    const ok = await enviar(url, { method: "DELETE" });
    if (ok) router.refresh();
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={excluir}
        disabled={enviando}
        className="min-h-10 rounded-lg px-3 text-sm font-semibold text-red-300/80 transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-60"
      >
        {enviando ? "Excluindo..." : texto}
      </button>
      {erro && <span className="text-sm text-red-400">{erro}</span>}
    </span>
  );
}
