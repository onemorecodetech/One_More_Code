"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

const formatar = (iso) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

// Sino com contador. Atualiza sozinho a cada 60 s enquanto a aba está visível.
export default function Sino({ pagina }) {
  const [aberto, setAberto] = useState(false);
  const [dados, setDados] = useState({ naoLidas: 0, lista: [] });
  const caixa = useRef(null);

  const carregar = useCallback(async () => {
    try {
      const r = await fetch("/api/portal/notificacoes?resumo=1", { cache: "no-store" });
      if (r.ok) setDados(await r.json());
    } catch {}
  }, []);

  useEffect(() => {
    carregar();
    let timer = setInterval(() => document.visibilityState === "visible" && carregar(), 60000);
    const aoVoltar = () => document.visibilityState === "visible" && carregar();
    document.addEventListener("visibilitychange", aoVoltar);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", aoVoltar); };
  }, [carregar]);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e) => caixa.current && !caixa.current.contains(e.target) && setAberto(false);
    const esc = (e) => e.key === "Escape" && setAberto(false);
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", fora); document.removeEventListener("keydown", esc); };
  }, [aberto]);

  async function abrirItem(n) {
    if (!n.lida) await fetch("/api/portal/notificacoes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: [n.id] }) }).catch(() => {});
  }

  return (
    <div className="relative" ref={caixa}>
      <button
        type="button"
        onClick={() => { setAberto((v) => !v); if (!aberto) carregar(); }}
        aria-label={`Notificações${dados.naoLidas ? `, ${dados.naoLidas} não lidas` : ""}`}
        aria-expanded={aberto}
        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-white/80 transition hover:border-blue-400 hover:text-white"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {dados.naoLidas > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-bold text-white">
            {dados.naoLidas > 9 ? "9+" : dados.naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#0f1422] shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="font-semibold">Notificações</span>
            <Link href={pagina} className="text-sm text-blue-400 hover:underline">Ver todas</Link>
          </div>
          {dados.lista.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-white/50">Nenhuma notificação por enquanto.</p>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {dados.lista.map((n) => (
                <li key={n.id}>
                  <Link href={n.link || pagina} onClick={() => abrirItem(n)} className={`block border-b border-white/5 px-4 py-3 transition hover:bg-white/5 ${n.lida ? "opacity-60" : ""}`}>
                    <div className="flex items-start gap-2">
                      {!n.lida && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" aria-label="Não lida" />}
                      <div>
                        <p className="text-sm font-semibold">{n.titulo}</p>
                        <p className="text-sm text-white/60">{n.mensagem}</p>
                        <p className="mt-1 text-xs text-white/40">{formatar(n.criadaEm)}</p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
