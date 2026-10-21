import crypto from "crypto";
import { NextResponse } from "next/server";
import { lerDB } from "@/lib/portal/storage";
import { conferirSenha, iniciarSessao, faltaConfiguracao, hashSenha } from "@/lib/portal/auth";
import { ipDe, registrarTentativa, limparTentativas, lerTentativas } from "@/lib/portal/limite";

// Hash de mentira: faz o login demorar o mesmo tempo quando o email não existe,
// para ninguém descobrir quais emails estão cadastrados pelo tempo de resposta
const HASH_FALSO = hashSenha("senha-que-nao-existe");

// Limite por conta (qualquer IP): conta só as senhas erradas daquele e-mail.
// Vale também para e-mails que não existem, para não revelar quem é cliente.
const CONTA = { maximo: 8, minutos: 30 };
const chaveConta = (email) => `conta-login:${crypto.createHash("sha256").update(email).digest("hex").slice(0, 32)}`;
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

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
  const email = String(body.email || "").trim().toLowerCase().slice(0, 160);
  const contaK = chaveConta(email);
  const falhas = await lerTentativas(contaK);
  if (falhas.total >= CONTA.maximo) {
    return NextResponse.json(
      { erro: `Muitas tentativas para esta conta. Aguarde ${falhas.restante} minuto(s) ou fale com a OneMoreCode pelo WhatsApp.` },
      { status: 429 }
    );
  }
  // A partir da 3ª senha errada, cada tentativa demora um pouco mais (até 3 s)
  if (falhas.total >= 2) await esperar(Math.min(3000, (falhas.total - 1) * 500));
  const db = await lerDB();
  const cliente = db.clientes.find((c) => c.email === email);

  const senhaOk = conferirSenha(String(body.senha || ""), cliente ? cliente.senha : HASH_FALSO);
  if (!cliente || !senhaOk) {
    await registrarTentativa(contaK, { maximo: CONTA.maximo, minutos: CONTA.minutos });
    return NextResponse.json({ erro: "Email ou senha incorretos." }, { status: 401 });
  }
  await limparTentativas(chave);
  await limparTentativas(contaK);
  await iniciarSessao({ tipo: "cliente", id: cliente.id });
  return NextResponse.json({ ok: true });
}
