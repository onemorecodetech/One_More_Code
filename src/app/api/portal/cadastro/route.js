import crypto from "crypto";
import { NextResponse } from "next/server";
import { lerDB, salvarDB } from "@/lib/portal/storage";
import { hashSenha, iniciarSessao, faltaConfiguracao } from "@/lib/portal/auth";
import { texto } from "@/lib/portal/util";
import { ipDe, registrarTentativa } from "@/lib/portal/limite";

export async function POST(request) {
  if (faltaConfiguracao()) {
    console.error(faltaConfiguracao());
    return NextResponse.json({ erro: "A área do cliente está em manutenção. Tente novamente mais tarde." }, { status: 503 });
  }
  const limite = await registrarTentativa(`cadastro:${ipDe(request)}`, { maximo: 5, minutos: 60 });
  if (limite.bloqueado) {
    return NextResponse.json({ erro: "Muitos cadastros seguidos. Tente de novo mais tarde." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const nome = texto(body.nome, 120);
  const email = texto(body.email, 160).toLowerCase();
  const whatsapp = texto(body.whatsapp, 20).replace(/\D/g, "");
  const empresa = texto(body.empresa, 120);
  const senha = String(body.senha || "");

  if (nome.length < 2) return NextResponse.json({ erro: "Informe seu nome." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ erro: "Informe um email válido." }, { status: 400 });
  if (whatsapp.length < 10) return NextResponse.json({ erro: "Informe o WhatsApp com DDD." }, { status: 400 });
  if (senha.length < 8) return NextResponse.json({ erro: "A senha precisa ter pelo menos 8 caracteres." }, { status: 400 });
  if (!body.aceite) return NextResponse.json({ erro: "É preciso aceitar o uso dos dados para continuar." }, { status: 400 });

  const db = await lerDB();
  if (db.clientes.some((c) => c.email === email)) {
    return NextResponse.json({ erro: "Já existe uma conta com este email. Faça login." }, { status: 409 });
  }

  const cliente = {
    id: crypto.randomUUID(),
    nome,
    email,
    whatsapp,
    empresa,
    senha: hashSenha(senha),
    criadoEm: new Date().toISOString(),
  };
  db.clientes.push(cliente);
  await salvarDB(db);

  await iniciarSessao({ tipo: "cliente", id: cliente.id });
  return NextResponse.json({ ok: true });
}
