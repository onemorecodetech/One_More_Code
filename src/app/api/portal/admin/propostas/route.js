// Admin cadastra uma nova proposta para um cliente
import crypto from "crypto";
import { NextResponse } from "next/server";
import { lerDB, salvarDB, salvarArquivo } from "@/lib/portal/storage";
import { lerSessao } from "@/lib/portal/auth";
import { ehPdf, LIMITE_PDF, texto } from "@/lib/portal/util";

export async function POST(request) {
  if (lerSessao()?.tipo !== "admin") return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });

  const form = await request.formData();
  const db = await lerDB();

  const clienteId = texto(form.get("clienteId"), 60);
  if (!db.clientes.some((c) => c.id === clienteId)) return NextResponse.json({ erro: "Selecione o cliente." }, { status: 400 });

  const titulo = texto(form.get("titulo"), 140);
  if (!titulo) return NextResponse.json({ erro: "Informe o título da proposta." }, { status: 400 });

  const valor = Number(String(form.get("valor") || "").replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(valor) || valor <= 0) return NextResponse.json({ erro: "Informe um valor válido." }, { status: 400 });

  const arquivo = form.get("arquivo");
  if (!arquivo || typeof arquivo === "string") return NextResponse.json({ erro: "Anexe o PDF da proposta." }, { status: 400 });
  if (arquivo.size > LIMITE_PDF) return NextResponse.json({ erro: "O PDF deve ter no máximo 4 MB." }, { status: 400 });
  const buffer = Buffer.from(await arquivo.arrayBuffer());
  if (!ehPdf(buffer)) return NextResponse.json({ erro: "O arquivo precisa ser um PDF." }, { status: 400 });

  db.sequencia = (db.sequencia || 0) + 1;
  const ano = new Date().getFullYear();
  const id = crypto.randomUUID();
  const agora = new Date().toISOString();

  const proposta = {
    id,
    codigo: `OMC-${ano}-${String(db.sequencia).padStart(3, "0")}`,
    clienteId,
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
    historico: [{ em: agora, texto: "Proposta enviada ao cliente" }],
  };

  db.propostas.push(proposta);
  await salvarDB(db);
  return NextResponse.json({ ok: true, proposta: { id, codigo: proposta.codigo } });
}
