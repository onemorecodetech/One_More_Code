import { NextResponse } from "next/server";
import { lerSessao } from "@/lib/portal/auth";
import { lerDB } from "@/lib/portal/storage";
import { lerPreferencias, salvarPreferencias, destinoCliente } from "@/lib/notificacoes/central";

async function destino() {
  const s = await lerSessao();
  if (s?.tipo === "admin") return "admin";
  if (s?.tipo === "cliente" && (await lerDB()).clientes.some((c) => c.id === s.id && !c.encerrada)) return destinoCliente(s.id);
  return null;
}

export async function GET() {
  const dest = await destino();
  if (!dest) return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  return NextResponse.json({ preferencias: await lerPreferencias(dest) });
}

export async function PUT(request) {
  const dest = await destino();
  if (!dest) return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  await salvarPreferencias(dest, body.preferencias);
  return NextResponse.json({ ok: true, preferencias: await lerPreferencias(dest) });
}
