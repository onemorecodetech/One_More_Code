"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CATEGORIAS } from "@/lib/notificacoes/eventos";
import { input, btnSecundario, card } from "./ui";

const formatar = (iso) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

// Página "Minhas notificações" (cliente) e central do admin
export default function CentralNotificacoes({ categorias }) {
  const [filtro, setFiltro] = useState({ categoria: "", lidas: "" });
  const [dados, setDados] = useState({ naoLidas: 0, lista: [] });
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    const q = new URLSearchParams(Object.entries(filtro).filter(([, v]) => v));
    try {
      const r = await fetch(`/api/portal/notificacoes?${q}`, { cache: "no-store" });
      if (r.ok) setDados(await r.json());
    } finally { setCarregando(false); }
  }, [filtro]);

  useEffect(() => {
    carregar();
    const t = setInterval(() => document.visibilityState === "visible" && carregar(), 60000);
    return () => clearInterval(t);
  }, [carregar]);

  async function marcar(corpo) {
    await fetch("/api/portal/notificacoes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
    carregar();
  }

  return (
    <section className={card}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <label className="text-sm text-white/60">
            Categoria
            <select value={filtro.categoria} onChange={(e) => setFiltro((f) => ({ ...f, categoria: e.target.value }))} className={`${input} mt-1 !py-2.5`}>
              <option value="">Todas</option>
              {categorias.map((c) => <option key={c} value={c}>{CATEGORIAS[c].nome}</option>)}
            </select>
          </label>
          <label className="text-sm text-white/60">
            Situação
            <select value={filtro.lidas} onChange={(e) => setFiltro((f) => ({ ...f, lidas: e.target.value }))} className={`${input} mt-1 !py-2.5`}>
              <option value="">Todas</option>
              <option value="nao">Não lidas</option>
              <option value="sim">Lidas</option>
            </select>
          </label>
        </div>
        <button onClick={() => marcar({ todas: true })} disabled={!dados.naoLidas} className={`${btnSecundario} !min-h-11`}>
          Marcar todas como lidas {dados.naoLidas ? `(${dados.naoLidas})` : ""}
        </button>
      </div>

      {carregando ? (
        <p className="text-white/50">Carregando...</p>
      ) : dados.lista.length === 0 ? (
        <p className="py-10 text-center text-white/50">Nenhuma notificação encontrada.</p>
      ) : (
        <ul className="divide-y divide-white/10">
          {dados.lista.map((n) => (
            <li key={n.id} className={`flex flex-wrap items-start justify-between gap-3 py-4 ${n.lida ? "opacity-60" : ""}`}>
              <div className="flex gap-3">
                <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${n.lida ? "bg-white/20" : "bg-blue-500"}`} aria-hidden="true" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/40">{CATEGORIAS[n.categoria]?.nome} · {formatar(n.criadaEm)}</p>
                  <p className="font-semibold">{n.titulo}</p>
                  <p className="text-sm text-white/65">{n.mensagem}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                {!n.lida && <button onClick={() => marcar({ ids: [n.id] })} className="text-white/60 hover:text-white">Marcar como lida</button>}
                {n.link && <Link href={n.link} onClick={() => !n.lida && marcar({ ids: [n.id] })} className="text-blue-400 hover:underline">Abrir</Link>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// Preferências de e-mail (avisos no site são sempre mantidos)
export function Preferencias({ categorias }) {
  const [prefs, setPrefs] = useState(null);
  const [salvo, setSalvo] = useState("");
  useEffect(() => { fetch("/api/portal/notificacoes/preferencias").then((r) => r.json()).then((d) => setPrefs(d.preferencias)).catch(() => {}); }, []);

  async function alternar(cat) {
    const novo = { ...prefs, [cat]: !prefs[cat] };
    setPrefs(novo);
    const r = await fetch("/api/portal/notificacoes/preferencias", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ preferencias: { [cat]: novo[cat] } }) });
    setSalvo(r.ok ? "Preferência salva." : "Não foi possível salvar.");
  }

  if (!prefs) return null;
  return (
    <section className={card}>
      <h2 className="text-lg font-bold mb-1">Preferências de e-mail</h2>
      <p className="text-sm text-white/60 mb-5">
        Avisos sobre contratos, cadastro e cobranças são sempre enviados. Os demais você escolhe. As notificações no site continuam aparecendo.
      </p>
      <ul className="space-y-3">
        {categorias.map((c) => {
          const essencial = CATEGORIAS[c].essencial;
          const ligado = essencial || prefs[c] !== false;
          return (
            <li key={c} className="flex items-center justify-between gap-4">
              <span>{CATEGORIAS[c].nome}{essencial && <span className="text-xs text-white/40"> · sempre enviado</span>}</span>
              <button
                type="button" role="switch" aria-checked={ligado} disabled={essencial} onClick={() => alternar(c)}
                className={`relative h-6 w-11 rounded-full transition ${ligado ? "bg-blue-500" : "bg-white/20"} disabled:opacity-50`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${ligado ? "left-[22px]" : "left-0.5"}`} />
                <span className="sr-only">{CATEGORIAS[c].nome}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {salvo && <p role="status" className="mt-4 text-sm text-emerald-400">{salvo}</p>}
    </section>
  );
}
