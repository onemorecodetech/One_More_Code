// Situação da fila de e-mails (admin): pendentes, falhas e últimos enviados
import { NextResponse } from "next/server";
import { lerSessao } from "@/lib/portal/auth";
import { statusFila, processarFila, reenviarFalhas } from "@/lib/notificacoes/central";
import * as kv from "@/lib/kv";

export async function GET() {
  if ((await lerSessao())?.tipo !== "admin") return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  return NextResponse.json({ ...(await statusFila()), contatos: await kv.lrange("omc:contatos", 30) }, { headers: { "Cache-Control": "no-store" } });
}

// Processa agora (e opcionalmente recoloca as falhas na fila)
export async function POST(request) {
  if ((await lerSessao())?.tipo !== "admin") return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (body.reenviarFalhas === true) await reenviarFalhas();
  return NextResponse.json({ ok: true, resultado: await processarFila(20) });
}
