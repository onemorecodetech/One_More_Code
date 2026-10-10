import { NextResponse } from "next/server";
import { lerDB } from "@/lib/portal/storage";
import { conferirSenha, iniciarSessao, faltaConfiguracao, hashSenha } from "@/lib/portal/auth";
import { ipDe, registrarTentativa, limparTentativas } from "@/lib/portal/limite";

// Hash de mentira: faz o login demorar o mesmo tempo quando o email não existe,
// para ninguém descobrir quais emails estão cadastrados pelo tempo de resposta
const HASH_FALSO = hashSenha("senha-que-nao-existe");

export async function POST(request) {
  if (faltaConfiguracao()) {
    console.error(faltaConfiguracao());
    return NextResponse.json({ erro: "A área do cliente está em manutenção. Tente novamente mais tarde." }, { status: 503 });
  }
  const chave = `cliente:${ipDe(request)}`;
  const limite = await registrarTentativa(chave, { maximo: 10, minutos: 15 });
  if (limite.bloqueado) {
    return NextResponse.json(
      { erro: `Muitas tentativas. Aguarde ${limite.restante} minuto(s) e tente de novo.` },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const db = await lerDB();
  const cliente = db.clientes.find((c) => c.email === email);

  const senhaOk = conferirSenha(String(body.senha || ""), cliente ? cliente.senha : HASH_FALSO);
  if (!cliente || !senhaOk) {
    return NextResponse.json({ erro: "Email ou senha incorretos." }, { status: 401 });
  }
  await limparTentativas(chave);
  await iniciarSessao({ tipo: "cliente", id: cliente.id });
  return NextResponse.json({ ok: true });
}
