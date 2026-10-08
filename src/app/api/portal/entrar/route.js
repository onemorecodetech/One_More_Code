import { NextResponse } from "next/server";
import { lerDB } from "@/lib/portal/storage";
import { conferirSenha, iniciarSessao } from "@/lib/portal/auth";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const db = await lerDB();
  const cliente = db.clientes.find((c) => c.email === email);

  if (!cliente || !conferirSenha(String(body.senha || ""), cliente.senha)) {
    return NextResponse.json({ erro: "Email ou senha incorretos." }, { status: 401 });
  }
  iniciarSessao({ tipo: "cliente", id: cliente.id });
  return NextResponse.json({ ok: true });
}
