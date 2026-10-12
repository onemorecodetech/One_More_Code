"use client";

import { useEffect, useState } from "react";
import { estaOnline, msAteProximaTroca } from "@/lib/atendimento";

// "Atendimento: Online/Offline" pelo horário de Brasília, trocando sozinho às 00h e às 08h.
// Usa a hora do servidor (corrige relógio errado no aparelho).
export default function StatusAtendimento() {
  const [online, setOnline] = useState(null); // null até calcular (evita diferença entre servidor e navegador)

  useEffect(() => {
    let diferenca = 0; // hora do servidor - hora do aparelho
    let timer;
    const agora = () => Date.now() + diferenca;

    function atualizar() {
      clearTimeout(timer);
      setOnline(estaOnline(agora()));
      // agenda a próxima troca, com folga de 1 s; no máximo 1 h por vez (aparelho em suspensão)
      timer = setTimeout(atualizar, Math.min(msAteProximaTroca(agora()) + 1000, 3600000));
    }

    fetch("/api/hora", { cache: "no-store" })
      .then((r) => r.json())
      .then(({ agora: servidor }) => { if (Number.isFinite(servidor)) diferenca = servidor - Date.now(); })
      .catch(() => {})
      .finally(atualizar);
    atualizar();

    const aoVoltar = () => document.visibilityState === "visible" && atualizar();
    document.addEventListener("visibilitychange", aoVoltar);
    window.addEventListener("focus", aoVoltar);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", aoVoltar);
      window.removeEventListener("focus", aoVoltar);
    };
  }, []);

  return (
    <p aria-live="polite">
      <strong>Atendimento:</strong>{" "}
      {online === null ? (
        <span className="text-white/40">…</span>
      ) : online ? (
        <span className="inline-flex items-center gap-1.5 text-emerald-400"><span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />Online</span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-red-300/80"><span className="h-2 w-2 rounded-full bg-red-300/80" aria-hidden="true" />Offline</span>
      )}
    </p>
  );
}
