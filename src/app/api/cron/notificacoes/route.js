// Chamada pelo Cron da Vercel (vercel.json) para enviar e-mails que ficaram na fila.
// A Vercel envia "Authorization: Bearer <CRON_SECRET>" automaticamente.
import { NextResponse } from "next/server";
import crypto from "crypto";
import { processarFila } from "@/lib/notificacoes/central";
import { verificarLembretes } from "@/lib/crm/lembretes";
import * as kv from "@/lib/kv";

// LGPD: mensagens do formulário de contato são guardadas por no máximo 12 meses
async function limparContatosAntigos() {
  const limite = new Date(Date.now() - 365 * 864e5).toISOString();
  const lista = await kv.lrange("omc:contatos", 300);
  const manter = lista.filter((c) => c && c.em && c.em >= limite);
  if (manter.length !== lista.length) await kv.substituirLista("omc:contatos", manter);
  return lista.length - manter.length;
}

export async function GET(request) {
  const segredo = process.env.CRON_SECRET;
  const recebido = request.headers.get("authorization") || "";
  const esperado = `Bearer ${segredo}`;
  const valido = segredo && recebido.length === esperado.length && crypto.timingSafeEqual(Buffer.from(recebido), Buffer.from(esperado));
  if (!valido) return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  const lembretesCrm = await verificarLembretes().catch(() => 0);
  const contatosApagados = await limparContatosAntigos().catch(() => 0);
  return NextResponse.json({ ok: true, lembretesCrm, contatosApagados, resultado: await processarFila(50) });
}
