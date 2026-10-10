// Roda antes das rotas da API da área do cliente.
// Bloqueia pedidos que alteram dados vindos de outro site (proteção CSRF):
// um site malicioso não consegue usar a sessão de quem está logado para
// criar, apagar ou enviar documentos.
import { NextResponse } from "next/server";

const SEGUROS = new Set(["GET", "HEAD", "OPTIONS"]);

export function proxy(request) {
  if (SEGUROS.has(request.method)) return NextResponse.next();

  const origem = request.headers.get("origin");
  if (origem) {
    let hostOrigem = "";
    try { hostOrigem = new URL(origem).host; } catch {}
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    if (hostOrigem !== host) {
      return NextResponse.json({ erro: "Origem não permitida." }, { status: 403 });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/portal/:path*",
};
