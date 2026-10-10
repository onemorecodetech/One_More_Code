// Admin cadastra uma nova proposta ou contrato para um cliente
import crypto from "crypto";
import { NextResponse } from "next/server";
import { lerDB, salvarDB, salvarArquivo } from "@/lib/portal/storage";
import { lerSessao } from "@/lib/portal/auth";
import { ehPdf, LIMITE_PDF, texto, TIPOS, statusAtual } from "@/lib/portal/util";

export async function POST(request) {
  try {
    return await criarProposta(request);
  } catch (e) {
    console.error("Erro ao criar documento:", e);
    return NextResponse.json({ erro: e.message || "Erro interno ao criar o documento." }, { status: 500 });
  }
}

async function criarProposta(request) {
  if ((await lerSessao())?.tipo !== "admin") return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });

  const form = await request.formData();
  const db = await lerDB();

  const clienteId = texto(form.get("clienteId"), 60);
  if (!db.clientes.some((c) => c.id === clienteId)) return NextResponse.json({ erro: "Selecione o cliente." }, { status: 400 });

  const tipo = form.get("tipo") === "contrato" ? "contrato" : "proposta";
  const T = TIPOS[tipo];

  const titulo = texto(form.get("titulo"), 140);
  if (!titulo) return NextResponse.json({ erro: `Informe o título d${T.artigo} ${T.nome.toLowerCase()}.` }, { status: 400 });

  // Na proposta o valor é obrigatório; no contrato é opcional
  const valorTexto = String(form.get("valor") || "").trim();
  const valor = valorTexto ? Number(valorTexto.replace(/\./g, "").replace(",", ".")) : 0;
  if (!Number.isFinite(valor) || valor < 0 || (tipo === "proposta" && valor <= 0)) {
    return NextResponse.json({ erro: "Informe um valor válido." }, { status: 400 });
  }

  // Regra: contrato só pode ser criado a partir de uma proposta do mesmo cliente
  // que já foi assinada pelo cliente E teve a assinatura confirmada no admin.
  let relacionada = null;
  if (tipo === "contrato") {
    const relacionadaId = texto(form.get("propostaRelacionada"), 60);
    relacionada = db.propostas.find(
      (p) => p.id === relacionadaId && p.clienteId === clienteId && (p.tipo || "proposta") === "proposta"
    );
    if (!relacionada) {
      return NextResponse.json({ erro: "Escolha a proposta deste cliente que originou o contrato." }, { status: 400 });
    }
    if (statusAtual(relacionada) !== "aprovada") {
      return NextResponse.json(
        { erro: `A proposta ${relacionada.codigo} ainda não tem assinatura confirmada. Confira e confirme a assinatura antes de gerar o contrato.` },
        { status: 400 }
      );
    }
    const contratoAtivo = db.propostas.find(
      (p) => p.tipo === "contrato" && p.propostaRelacionada?.id === relacionada.id && statusAtual(p) !== "cancelada"
    );
    if (contratoAtivo) {
      return NextResponse.json(
        { erro: `Já existe o contrato ${contratoAtivo.codigo} para a proposta ${relacionada.codigo}. Cancele-o antes de gerar outro.` },
        { status: 400 }
      );
    }
  }

  const arquivo = form.get("arquivo");
  if (!arquivo || typeof arquivo === "string") return NextResponse.json({ erro: `Anexe o PDF d${T.artigo} ${T.nome.toLowerCase()}.` }, { status: 400 });
  if (arquivo.size > LIMITE_PDF) return NextResponse.json({ erro: "O PDF deve ter no máximo 4 MB." }, { status: 400 });
  const buffer = Buffer.from(await arquivo.arrayBuffer());
  if (!ehPdf(buffer)) return NextResponse.json({ erro: "O arquivo precisa ser um PDF." }, { status: 400 });

  // Numeração separada: OMC-2026-001 (propostas) e CTR-2026-001 (contratos)
  db.sequencias = db.sequencias || { proposta: db.sequencia || 0, contrato: 0 };
  db.sequencias[tipo] = (db.sequencias[tipo] || 0) + 1;
  if (tipo === "proposta") db.sequencia = db.sequencias.proposta;
  const numero = db.sequencias[tipo];
  const ano = new Date().getFullYear();
  const id = crypto.randomUUID();
  const agora = new Date().toISOString();

  const proposta = {
    id,
    tipo,
    codigo: `${T.prefixo}-${ano}-${String(numero).padStart(3, "0")}`,
    clienteId,
    propostaRelacionada: relacionada ? { id: relacionada.id, codigo: relacionada.codigo } : null,
    titulo,
    resumo: texto(form.get("resumo"), 2000),
    valor,
    condicoes: texto(form.get("condicoes"), 300),
    prazo: texto(form.get("prazo"), 120),
    validade: /^\d{4}-\d{2}-\d{2}$/.test(String(form.get("validade"))) ? String(form.get("validade")) : "",
    status: "aguardando",
    arquivoOriginal: await salvarArquivo(`${id}-original.pdf`, buffer),
    arquivoAssinado: null,
    assinadaEm: null,
    criadaEm: agora,
    historico: [{ em: agora, texto: `${T.nome} enviad${T.artigo} ao cliente` }],
  };

  db.propostas.push(proposta);
  await salvarDB(db);
  return NextResponse.json({ ok: true, proposta: { id, codigo: proposta.codigo } });
}
