"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export const inp = "w-full rounded-xl bg-[#0B0F1A] border border-white/10 px-3.5 py-2.5 text-white placeholder:text-white/30 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20";
export const btn = "inline-flex items-center justify-center gap-2 min-h-10 px-4 rounded-xl font-semibold transition disabled:opacity-50";
export const btnAzul = `${btn} bg-blue-600 hover:bg-blue-700 text-white`;
export const btnLinha = `${btn} border border-white/15 hover:border-blue-400 hover:text-blue-300`;
export const card = "rounded-2xl border border-white/10 bg-white/5";

// Chamada à API do CRM com erro amigável
export async function api(url, { method = "GET", body } = {}) {
  const r = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined, cache: "no-store" });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(d.erro || "Não foi possível concluir."); e.status = r.status; e.dados = d; throw e; }
  return d;
}

export function Campo({ label, children, className = "" }) {
  return <label className={`block text-sm ${className}`}><span className="mb-1.5 block text-white/60">{label}</span>{children}</label>;
}

export function Modal({ titulo, aberto, onFechar, children, largo = false }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!aberto) return;
    const esc = (e) => e.key === "Escape" && onFechar();
    document.addEventListener("keydown", esc);
    ref.current?.querySelector("input,select,textarea,button")?.focus();
    return () => document.removeEventListener("keydown", esc);
  }, [aberto, onFechar]);
  if (!aberto) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onFechar()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={titulo} className={`w-full ${largo ? "sm:max-w-3xl" : "sm:max-w-lg"} max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-white/10 bg-[#0f1422] p-6`}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold">{titulo}</h2>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const COR_PRIO = { alta: "bg-red-400/15 text-red-300 border-red-400/30", media: "bg-amber-400/15 text-amber-300 border-amber-400/30", baixa: "bg-slate-400/15 text-slate-300 border-slate-400/30" };
export function Prioridade({ valor }) {
  const nome = { alta: "Alta", media: "Média", baixa: "Baixa" }[valor] || "Média";
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${COR_PRIO[valor] || COR_PRIO.media}`}>{nome}</span>;
}

export function Erro({ msg }) { return msg ? <p role="alert" className="text-sm text-red-400">{msg}</p> : null; }
