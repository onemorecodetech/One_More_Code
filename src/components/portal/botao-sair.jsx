"use client";

import { useRouter } from "next/navigation";

export default function BotaoSair({ destino = "/cliente/entrar" }) {
  const router = useRouter();
  async function sair() {
    await fetch("/api/portal/sair", { method: "POST" });
    router.push(destino);
    router.refresh();
  }
  return (
    <button onClick={sair} className="text-sm text-white/60 hover:text-white underline-offset-4 hover:underline">
      Sair
    </button>
  );
}
