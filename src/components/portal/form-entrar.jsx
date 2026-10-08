"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEnvio } from "./use-envio";
import { input, label, btnPrimario } from "./ui";

export default function FormEntrar({ admin = false }) {
  const router = useRouter();
  const { enviando, erro, enviar } = useEnvio();

  async function onSubmit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const json = admin
      ? { usuario: f.get("usuario"), senha: f.get("senha") }
      : { email: f.get("email"), senha: f.get("senha") };
    const ok = await enviar(admin ? "/api/portal/admin/entrar" : "/api/portal/entrar", { json });
    if (ok) {
      router.push(admin ? "/admin" : "/cliente");
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {admin ? (
        <div>
          <label htmlFor="usuario" className={label}>Usuário</label>
          <input id="usuario" name="usuario" required autoComplete="username" autoCapitalize="none" className={input} />
        </div>
      ) : (
        <div>
          <label htmlFor="email" className={label}>Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" placeholder="seuemail@empresa.com" className={input} />
        </div>
      )}
      <div>
        <label htmlFor="senha" className={label}>Senha</label>
        <input id="senha" name="senha" type="password" required autoComplete="current-password" className={input} />
      </div>

      {erro && <p role="alert" className="text-sm text-red-400">{erro}</p>}

      <button type="submit" disabled={enviando} className={`${btnPrimario} w-full`}>
        {enviando ? "Entrando..." : "Entrar"}
      </button>

      {!admin && (
        <p className="text-center text-sm text-white/60">
          Ainda não tem acesso?{" "}
          <Link href="/cliente/cadastro" className="text-blue-400 hover:underline">Criar conta</Link>
        </p>
      )}
    </form>
  );
}
