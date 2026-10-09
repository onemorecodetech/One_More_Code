"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEnvio } from "./use-envio";
import { input, label, btnPrimario } from "./ui";

export default function FormCadastro() {
  const router = useRouter();
  const { enviando, erro, enviar } = useEnvio();

  async function onSubmit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const ok = await enviar("/api/portal/cadastro", {
      json: {
        nome: f.get("nome"),
        empresa: f.get("empresa"),
        email: f.get("email"),
        whatsapp: f.get("whatsapp"),
        senha: f.get("senha"),
        aceite: f.get("aceite") === "on",
      },
    });
    if (ok) {
      router.push("/cliente");
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="nome" className={label}>Nome</label>
          <input id="nome" name="nome" required minLength={2} autoComplete="name" className={input} />
        </div>
        <div>
          <label htmlFor="empresa" className={label}>Empresa <span className="text-white/40">(opcional)</span></label>
          <input id="empresa" name="empresa" autoComplete="organization" className={input} />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="email" className={label}>Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className={input} />
        </div>
        <div>
          <label htmlFor="whatsapp" className={label}>WhatsApp com DDD</label>
          <input id="whatsapp" name="whatsapp" type="tel" required autoComplete="tel" placeholder="(54) 99999-9999" className={input} />
        </div>
      </div>
      <div>
        <label htmlFor="senha" className={label}>Senha <span className="text-white/40">(mínimo 8 caracteres)</span></label>
        <input id="senha" name="senha" type="password" required minLength={8} autoComplete="new-password" className={input} />
      </div>

      <label className="flex items-start gap-3 text-sm text-white/70 cursor-pointer">
        <input name="aceite" type="checkbox" required className="mt-1 h-4 w-4 accent-blue-500" />
        <span>Autorizo a OneMoreCode a usar estes dados para contato e envio de propostas comerciais e contratos.</span>
      </label>

      {erro && <p role="alert" className="text-sm text-red-400">{erro}</p>}

      <button type="submit" disabled={enviando} className={`${btnPrimario} w-full`}>
        {enviando ? "Criando conta..." : "Criar conta"}
      </button>

      <p className="text-center text-sm text-white/60">
        Já tem conta? <Link href="/cliente/entrar" className="text-blue-400 hover:underline">Entrar</Link>
      </p>
    </form>
  );
}
