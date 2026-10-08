// Admin muda o status: confirmar assinatura, pedir novo envio ou cancelar
import { NextResponse } from "next/server";
import { lerDB, salvarDB } from "@/lib/portal/storage";
import { lerSessao } from "@/lib/portal/auth";

const ACOES = {
  confirmar: { status: "aprovada", texto: "Assinatura conferida e confirmada pela OneMoreCode" },
  reenviar: { status: "aguardando", texto: "OneMoreCode pediu um novo envio da proposta assinada" },
  cancelar: { status: "cancelada", texto: "Proposta cancelada" },
  reabrir: { status: "aguardando", texto: "Proposta reaberta para assinatura" },
};

export async function PATCH(request, { params }) {
  if (lerSessao()?.tipo !== "admin") return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });

  const { acao } = await request.json().catch(() => ({}));
  const regra = ACOES[acao];
  if (!regra) return NextResponse.json({ erro: "Ação inválida." }, { status: 400 });

  const db = await lerDB();
  const proposta = db.propostas.find((p) => p.id === params.id);
  if (!proposta) return NextResponse.json({ erro: "Proposta não encontrada." }, { status: 404 });

  proposta.status = regra.status;
  proposta.historico.push({ em: new Date().toISOString(), texto: regra.texto });
  await salvarDB(db);
  return NextResponse.json({ ok: true });
}
