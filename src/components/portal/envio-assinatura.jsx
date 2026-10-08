"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useEnvio } from "./use-envio";
import { btnPrimario } from "./ui";

export default function EnvioAssinatura({ propostaId, jaEnviada }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [arquivo, setArquivo] = useState(null);
  const [arrastando, setArrastando] = useState(false);
  const { enviando, erro, setErro, enviar } = useEnvio();

  function escolher(file) {
    setErro("");
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErro("Selecione um arquivo PDF.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setErro("O PDF deve ter no máximo 4 MB.");
      return;
    }
    setArquivo(file);
  }

  async function onEnviar() {
    if (!arquivo) return;
    const formData = new FormData();
    formData.append("arquivo", arquivo);
    const ok = await enviar(`/api/portal/propostas/${propostaId}/assinada`, { formData });
    if (ok) {
      setArquivo(null);
      router.refresh();
    }
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => { e.preventDefault(); setArrastando(false); escolher(e.dataTransfer.files[0]); }}
        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center cursor-pointer transition ${
          arrastando ? "border-blue-400 bg-blue-500/10" : "border-white/15 hover:border-blue-400/60 hover:bg-white/5"
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-9 w-9 text-blue-400" aria-hidden="true">
          <path d="M12 16V4M7 9l5-5 5 5" />
          <path d="M20 16v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3" />
        </svg>
        {arquivo ? (
          <p className="font-medium">{arquivo.name}</p>
        ) : (
          <>
            <p className="font-medium">{jaEnviada ? "Enviar outra versão assinada" : "Arraste o PDF assinado aqui"}</p>
            <p className="text-sm text-white/50">ou clique para escolher o arquivo (PDF até 4 MB)</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => escolher(e.target.files[0])}
        />
      </div>

      {erro && <p role="alert" className="mt-3 text-sm text-red-400">{erro}</p>}

      {arquivo && (
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={onEnviar} disabled={enviando} className={btnPrimario}>
            {enviando ? "Enviando..." : "Enviar proposta assinada"}
          </button>
          <button onClick={() => setArquivo(null)} disabled={enviando} className="px-4 text-sm text-white/60 hover:text-white">
            Trocar arquivo
          </button>
        </div>
      )}
    </div>
  );
}
