// Formulário de contato (parte do servidor).
// O navegador envia primeiro ao Web3Forms (no plano grátis ele só aceita envio pelo navegador)
// e depois chama esta rota, que: valida, registra o contato, avisa o admin no painel,
// manda a resposta automática pelo Resend e, se o Web3Forms falhou, envia a mensagem
// ao e-mail da OneMoreCode pelo Resend, para nenhum contato se perder.
import crypto from "crypto";
import { NextResponse } from "next/server";
import * as kv from "@/lib/kv";
import { ipDe, registrarTentativa } from "@/lib/portal/limite";
import { publicarSeguro, enfileirarEmail, processarDepois } from "@/lib/notificacoes/central";
import { respostaContato, montar } from "@/lib/email/modelos";
import { EMAIL_ADMIN } from "@/lib/email/enviar";

const CAMPOS = new Set(["nome", "email", "mensagem", "botcheck", "web3forms", "idEnvio"]);
const RESPOSTAS_DIA = Number(process.env.CONTATO_RESPOSTAS_DIA || 40); // protege a cota diária do Resend
const ok = () => NextResponse.json({ ok: true });

export async function POST(request) {
  try {
    const bruto = await request.text();
    if (bruto.length > 12000) return NextResponse.json({ erro: "Mensagem grande demais." }, { status: 413 });
    let body;
    try { body = JSON.parse(bruto); } catch { return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 }); }
    if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).some((k) => !CAMPOS.has(k))) {
      return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
    }

    // Campo invisível preenchido = robô. Responde "ok" sem fazer nada.
    if (body.botcheck) return ok();

    const nome = String(body.nome || "").replace(/[\r\n\t]+/g, " ").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const mensagem = String(body.mensagem || "").trim();
    const idEnvio = String(body.idEnvio || "");
    const web3forms = ["ok", "falhou", "incerto"].includes(body.web3forms) ? body.web3forms : "incerto";

    if (nome.length < 2 || nome.length > 100) return NextResponse.json({ erro: "Informe seu nome." }, { status: 400 });
    if (email.length > 160 || !/^[^\s@<>"]+@[^\s@<>"]+\.[a-z]{2,}$/i.test(email)) return NextResponse.json({ erro: "Informe um e-mail válido." }, { status: 400 });
    if (mensagem.length < 10 || mensagem.length > 4000) return NextResponse.json({ erro: "A mensagem precisa ter entre 10 e 4.000 caracteres." }, { status: 400 });
    if (!/^[0-9a-f-]{36}$/i.test(idEnvio)) return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });

    const ip = ipDe(request);
    if ((await registrarTentativa(`contato:${ip}`, { maximo: 5, minutos: 60 })).bloqueado) {
      return NextResponse.json({ erro: "Muitas mensagens seguidas. Tente de novo mais tarde ou chame no WhatsApp." }, { status: 429 });
    }

    // Mesmo envio repetido (clique duplo, nova tentativa após erro de rede): processa uma vez só
    if (!(await kv.setNX(`omc:contato:envio:${idEnvio}`, 1, 60 * 60 * 24))) return ok();

    const registro = { id: idEnvio, nome, email, mensagem, web3forms, em: new Date().toISOString() };
    await kv.lpushTrim("omc:contatos", registro, 300);

    await publicarSeguro("contato.recebido", { chave: `contato:${idEnvio}`, dados: { nome, email } });

    // Web3Forms falhou (ou não deu para saber): garante que a mensagem chegue pelo Resend
    if (web3forms !== "ok") {
      await enfileirarEmail({
        para: EMAIL_ADMIN,
        responderPara: email,
        idempotencia: `contato-admin:${idEnvio}`,
        conteudo: montar({
          assunto: `Novo contato pelo site: ${nome}${web3forms === "incerto" ? " (pode ter chegado também pelo Web3Forms)" : ""}`,
          titulo: "Nova mensagem pelo formulário do site",
          paragrafos: [`Nome: ${nome}`, `E-mail: ${email}`, `Mensagem:\n${mensagem}`],
          nota: "Enviado pelo Resend porque o Web3Forms não confirmou o recebimento. Responda este e-mail para falar com a pessoa.",
        }),
      });
    }

    // Resposta automática: no máximo 1 por e-mail a cada 24 h e um teto diário geral
    const hashEmail = crypto.createHash("sha256").update(email).digest("hex").slice(0, 32);
    const hoje = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
    if (await kv.setNX(`omc:contato:resposta:${hashEmail}`, 1, 60 * 60 * 24)) {
      if ((await kv.incr(`omc:contato:respostas:${hoje}`, 60 * 60 * 26)) <= RESPOSTAS_DIA) {
        await enfileirarEmail({ para: email, conteudo: respostaContato({ nome }), idempotencia: `contato-resposta:${idEnvio}`, responderPara: EMAIL_ADMIN });
      }
    }

    await processarDepois();
    return ok();
  } catch (e) {
    console.error("[contato] erro:", e.message);
    return NextResponse.json({ erro: "Não foi possível registrar agora." }, { status: 500 });
  }
}
