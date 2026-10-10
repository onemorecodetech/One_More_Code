// Admin exclui um cliente, junto com todas as propostas, contratos e PDFs dele
import { NextResponse } from "next/server";
import { lerDB, salvarDB, apagarArquivos } from "@/lib/portal/storage";
import { lerSessao } from "@/lib/portal/auth";

export async function DELETE(request, contexto) {
  const params = await contexto.params;
  if ((await lerSessao())?.tipo !== "admin") return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });

  const db = await lerDB();
  const cliente = db.clientes.find((c) => c.id === params.id);
  if (!cliente) return NextResponse.json({ erro: "Cliente não encontrado." }, { status: 404 });

  const docs = db.propostas.filter((p) => p.clienteId === cliente.id);
  db.clientes = db.clientes.filter((c) => c.id !== cliente.id);
  db.propostas = db.propostas.filter((p) => p.clienteId !== cliente.id);
  await salvarDB(db);
  await apagarArquivos(docs.flatMap((d) => [d.arquivoOriginal, d.arquivoAssinado]));

  return NextResponse.json({ ok: true, documentos: docs.length });
}
