"use client";
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";

const CHAVE = "omc_aviso_cookies";
const jaViu = () => { try { return localStorage.getItem(CHAVE) === "1"; } catch { return true; } };

// Aviso informativo: o site usa apenas o cookie essencial de login (não exige consentimento)
export default function AvisoCookies() {
  const salvo = useSyncExternalStore(() => () => {}, jaViu, () => true);
  const [fechado, setFechado] = useState(false);
  if (salvo || fechado) return null;
  const ok = () => { try { localStorage.setItem(CHAVE, "1"); } catch {} setFechado(true); };
  return (
    <div role="region" aria-label="Aviso de cookies" className="fixed inset-x-3 bottom-3 z-[60] mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-white/15 bg-[#0f1422]/95 p-4 text-sm text-white/80 shadow-2xl backdrop-blur sm:flex-row sm:items-center">
      <p className="flex-1">Usamos apenas o cookie essencial para o login da área do cliente. Nenhum rastreamento de publicidade. <Link href="/cookies" className="text-blue-300 underline underline-offset-2">Saiba mais</Link></p>
      <button type="button" onClick={ok} className="shrink-0 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700">Entendi</button>
    </div>
  );
}
