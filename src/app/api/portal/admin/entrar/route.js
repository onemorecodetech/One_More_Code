import { NextResponse } from "next/server";
import { credenciaisAdminConferem, iniciarSessao, faltaConfiguracao } from "@/lib/portal/auth";

export async function POST(request) {
  const falta = faltaConfiguracao({ admin: true });
  if (falta) {
    console.error(falta);
    return NextResponse.json({ erro: falta }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  if (!credenciaisAdminConferem(String(body.usuario || ""), String(body.senha || ""))) {
    return NextResponse.json({ erro: "Usuário ou senha incorretos." }, { status: 401 });
  }
  iniciarSessao({ tipo: "admin" });
  return NextResponse.json({ ok: true });
}
