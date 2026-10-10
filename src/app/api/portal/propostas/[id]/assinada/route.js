// O cliente envia o PDF assinado pelo gov.br
import { NextResponse } from "next/server";
import { lerDB, salvarDB, salvarArquivo } from "@/lib/portal/storage";
import { lerSessao } from "@/lib/portal/auth";
import { ehPdf, LIMITE_PDF, statusAtual, tipoDe } from "@/lib/portal/util";

export async function POST(request, contexto) {
  try {
    return await enviarAssinada(request, contexto);
  } catch (e) {
    console.error("Erro ao receber proposta assinada:", e);
    return NextResponse.json(
      { erro: "Não foi possível salvar o arquivo agora. Tente de novo em alguns minutos ou fale com a gente no WhatsApp." },
      { status: 500 }
    );
  }
}

async function enviarAssinada(request, contexto) {
  const params = await contexto.params;
  const sessao = await lerSessao();
  if (sessao?.tipo !== "cliente") return NextResponse.json({ erro: "Faça login novamente." }, { status: 401 });

  const db = await lerDB();
  const proposta = db.propostas.find((p) => p.id === params.id && p.clienteId === sessao.id);
  if (!proposta) return NextResponse.json({ erro: "Documento não encontrado." }, { status: 404 });

  const status = statusAtual(proposta);
  if (!["aguardando", "conferencia"].includes(status)) {
    return NextResponse.json({ erro: "Este documento não aceita mais envio de assinatura." }, { status: 400 });
  }

  const form = await request.formData();
  const arquivo = form.get("arquivo");
  if (!arquivo || typeof arquivo === "string") return NextResponse.json({ erro: "Selecione o PDF assinado." }, { status: 400 });
  if (arquivo.size > LIMITE_PDF) return NextResponse.json({ erro: "O PDF deve ter no máximo 4 MB." }, { status: 400 });

  const buffer = Buffer.from(await arquivo.arrayBuffer());
  if (!ehPdf(buffer)) return NextResponse.json({ erro: "O arquivo precisa ser um PDF." }, { status: 400 });

  proposta.arquivoAssinado = await salvarArquivo(`${proposta.id}-assinada-${Date.now()}.pdf`, buffer);
  proposta.assinadaEm = new Date().toISOString();
  proposta.status = "conferencia";
  const T = tipoDe(proposta);
  proposta.historico.push({ em: proposta.assinadaEm, texto: `Cliente enviou ${T.artigo} ${T.nome.toLowerCase()} assinad${T.artigo}` });
  await salvarDB(db);

  return NextResponse.json({ ok: true });
}
