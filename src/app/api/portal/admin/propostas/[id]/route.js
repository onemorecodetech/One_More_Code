// Admin muda o status: confirmar assinatura, pedir novo envio, cancelar ou reabrir
import { NextResponse } from "next/server";
import { lerDB, salvarDB, apagarArquivos } from "@/lib/portal/storage";
import { lerSessao } from "@/lib/portal/auth";
import { tipoDe } from "@/lib/portal/util";

const ACOES = {
  confirmar: { status: "aprovada", texto: () => "Assinatura conferida e confirmada pela OneMoreCode" },
  reenviar: { status: "aguardando", texto: (T) => `OneMoreCode pediu um novo envio d${T.artigo} ${T.nome.toLowerCase()} assinad${T.artigo}` },
  cancelar: { status: "cancelada", texto: (T) => `${T.nome} cancelad${T.artigo}` },
  reabrir: { status: "aguardando", texto: (T) => `${T.nome} reabert${T.artigo} para assinatura` },
};

export async function PATCH(request, { params }) {
  if (lerSessao()?.tipo !== "admin") return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });

  const { acao } = await request.json().catch(() => ({}));
  const regra = ACOES[acao];
  if (!regra) return NextResponse.json({ erro: "Ação inválida." }, { status: 400 });

  const db = await lerDB();
  const doc = db.propostas.find((p) => p.id === params.id);
  if (!doc) return NextResponse.json({ erro: "Documento não encontrado." }, { status: 404 });

  doc.status = regra.status;
  doc.historico.push({ em: new Date().toISOString(), texto: regra.texto(tipoDe(doc)) });
  await salvarDB(db);
  return NextResponse.json({ ok: true });
}

// Exclui um documento e os PDFs dele
export async function DELETE(request, { params }) {
  if (lerSessao()?.tipo !== "admin") return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });

  const db = await lerDB();
  const doc = db.propostas.find((p) => p.id === params.id);
  if (!doc) return NextResponse.json({ erro: "Documento não encontrado." }, { status: 404 });

  // Proposta com contrato ligado: exclua o contrato primeiro
  const contrato = db.propostas.find((p) => p.tipo === "contrato" && p.propostaRelacionada?.id === doc.id);
  if (contrato) {
    return NextResponse.json(
      { erro: `Esta proposta tem o contrato ${contrato.codigo} ligado a ela. Exclua o contrato primeiro.` },
      { status: 400 }
    );
  }

  db.propostas = db.propostas.filter((p) => p.id !== doc.id);
  await salvarDB(db);
  await apagarArquivos([doc.arquivoOriginal, doc.arquivoAssinado]);
  return NextResponse.json({ ok: true });
}
