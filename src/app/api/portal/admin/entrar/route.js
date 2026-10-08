import { NextResponse } from "next/server";
import { credenciaisAdminConferem, iniciarSessao } from "@/lib/portal/auth";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  if (!credenciaisAdminConferem(String(body.usuario || ""), String(body.senha || ""))) {
    return NextResponse.json({ erro: "Usuário ou senha incorretos." }, { status: 401 });
  }
  iniciarSessao({ tipo: "admin" });
  return NextResponse.json({ ok: true });
}
