import { NextResponse } from "next/server";
import { ipDe, registrarTentativa, limparTentativas } from "@/lib/portal/limite";
import { credenciaisAdminConferem, iniciarSessao, faltaConfiguracao } from "@/lib/portal/auth";

export async function POST(request) {
  const falta = faltaConfiguracao({ admin: true });
  if (falta) {
    console.error(falta);
    return NextResponse.json({ erro: falta }, { status: 503 });
  }

  const chave = `admin:${ipDe(request)}`;
  const limite = await registrarTentativa(chave, { maximo: 5, minutos: 15 });
  if (limite.bloqueado) {
    return NextResponse.json(
      { erro: `Muitas tentativas. Aguarde ${limite.restante} minuto(s) e tente de novo.` },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => ({}));
  if (!credenciaisAdminConferem(String(body.usuario || ""), String(body.senha || ""))) {
    return NextResponse.json({ erro: "Usuário ou senha incorretos." }, { status: 401 });
  }
  await limparTentativas(chave);
  await iniciarSessao({ tipo: "admin" });
  return NextResponse.json({ ok: true });
}
