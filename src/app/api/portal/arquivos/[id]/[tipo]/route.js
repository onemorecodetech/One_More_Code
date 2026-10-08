// Entrega os PDFs só para quem tem permissão (o dono da proposta ou o admin)
import { lerDB, lerArquivo } from "@/lib/portal/storage";
import { lerSessao } from "@/lib/portal/auth";

export async function GET(request, { params }) {
  const sessao = lerSessao();
  if (!sessao) return new Response("Não autorizado", { status: 401 });

  const db = await lerDB();
  const proposta = db.propostas.find((p) => p.id === params.id);
  const permitido = proposta && (sessao.tipo === "admin" || proposta.clienteId === sessao.id);
  if (!permitido) return new Response("Não encontrado", { status: 404 });

  const nome = params.tipo === "assinada" ? proposta.arquivoAssinado : proposta.arquivoOriginal;
  const buffer = nome && (await lerArquivo(nome));
  if (!buffer) return new Response("Arquivo não encontrado", { status: 404 });

  const sufixo = params.tipo === "assinada" ? "-assinada" : "";
  const download = new URL(request.url).searchParams.has("baixar");
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${proposta.codigo}${sufixo}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
