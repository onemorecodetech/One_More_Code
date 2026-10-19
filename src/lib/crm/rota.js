// Envolve as rotas do CRM: exige admin logado e trata erros sem expor detalhes internos
import { NextResponse } from "next/server";
import { lerSessao } from "@/lib/portal/auth";
import { ErroCRM } from "./dados";

export function rotaAdmin(fn) {
  return async (request, contexto) => {
    if ((await lerSessao())?.tipo !== "admin") return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
    try {
      const r = await fn(request, contexto);
      return r instanceof Response ? r : NextResponse.json(r ?? { ok: true }, { headers: { "Cache-Control": "no-store" } });
    } catch (e) {
      if (e instanceof ErroCRM) return NextResponse.json({ erro: e.message, ...(e.extra || {}) }, { status: e.status });
      console.error("[crm] erro:", e.message);
      return NextResponse.json({ erro: "Não foi possível concluir. Tente de novo." }, { status: 500 });
    }
  };
}

export async function corpo(request) {
  const t = await request.text();
  if (t.length > 50000) throw new ErroCRM("Dados grandes demais.", 413);
  try { return t ? JSON.parse(t) : {}; } catch { throw new ErroCRM("Dados inválidos."); }
}
