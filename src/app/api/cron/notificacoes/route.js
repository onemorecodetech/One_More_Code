// Chamada pelo Cron da Vercel (vercel.json) para enviar e-mails que ficaram na fila.
// A Vercel envia "Authorization: Bearer <CRON_SECRET>" automaticamente.
import { NextResponse } from "next/server";
import crypto from "crypto";
import { processarFila } from "@/lib/notificacoes/central";

export async function GET(request) {
  const segredo = process.env.CRON_SECRET;
  const recebido = request.headers.get("authorization") || "";
  const esperado = `Bearer ${segredo}`;
  const valido = segredo && recebido.length === esperado.length && crypto.timingSafeEqual(Buffer.from(recebido), Buffer.from(esperado));
  if (!valido) return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  return NextResponse.json({ ok: true, resultado: await processarFila(50) });
}
