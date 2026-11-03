// Configuração da chave Pix da OneMoreCode (somente admin)
import { NextResponse } from "next/server";
import { lerSessao } from "@/lib/portal/auth";
import { lerConfigPix, salvarConfigPix, gerarBRCode } from "@/lib/pix";

const json = (d, status = 200) => NextResponse.json(d, { status, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  if ((await lerSessao())?.tipo !== "admin") return json({ erro: "Não autorizado." }, 401);
  return json({ config: await lerConfigPix() });
}

export async function PUT(request) {
  if ((await lerSessao())?.tipo !== "admin") return json({ erro: "Não autorizado." }, 401);
  try {
    const config = await salvarConfigPix(await request.json().catch(() => ({})));
    // Pix de teste de R$ 0,01 para conferir no app do banco
    const teste = gerarBRCode({ ...config, valor: 0.01, txid: "TESTEOMC" });
    return json({ ok: true, config, teste });
  } catch (e) { return json({ erro: e.message }, 400); }
}
