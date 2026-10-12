// Notificações de quem está logado: o cliente só vê as dele; o admin, as do admin.
import { NextResponse } from "next/server";
import { lerSessao } from "@/lib/portal/auth";
import { lerDB } from "@/lib/portal/storage";
import { listarNotificacoes, marcarLidas, destinoCliente } from "@/lib/notificacoes/central";
import { CATEGORIAS } from "@/lib/notificacoes/eventos";

async function destino() {
  const s = await lerSessao();
  if (s?.tipo === "admin") return "admin";
  if (s?.tipo === "cliente" && (await lerDB()).clientes.some((c) => c.id === s.id)) return destinoCliente(s.id);
  return null;
}

export async function GET(request) {
  const dest = await destino();
  if (!dest) return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  const q = new URL(request.url).searchParams;
  const categoria = CATEGORIAS[q.get("categoria")] ? q.get("categoria") : undefined;
  const lidas = ["sim", "nao"].includes(q.get("lidas")) ? q.get("lidas") : undefined;
  const { lista, naoLidas } = await listarNotificacoes(dest, { categoria, lidas });
  const limite = q.has("resumo") ? 6 : 200;
  return NextResponse.json({ naoLidas, lista: lista.slice(0, limite) }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request) {
  const dest = await destino();
  if (!dest) return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const ids = Array.isArray(body.ids) ? body.ids.filter((x) => typeof x === "string").slice(0, 200) : [];
  await marcarLidas(dest, ids, body.todas === true);
  return NextResponse.json({ ok: true });
}
