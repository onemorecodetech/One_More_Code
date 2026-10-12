// Modelos de e-mail com a identidade da OneMoreCode (fundo escuro, azul e roxo).
// Todo texto vindo de usuários passa por esc() para não virar HTML.
import { SITE_URL } from "./enviar";

export const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Só aceita links do próprio site (evita usar o e-mail para mandar a pessoa a outro lugar)
function linkSeguro(caminho) {
  const u = String(caminho || "/");
  return u.startsWith("/") ? SITE_URL + u : SITE_URL + "/";
}

function layout({ titulo, paragrafos, botao, nota }) {
  const ps = paragrafos.map((p) => `<p style="margin:0 0 16px;color:#cbd5e1;font-size:16px;line-height:1.6">${p}</p>`).join("");
  const btn = botao
    ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0 8px"><tr><td style="border-radius:12px;background:#3b82f6;background-image:linear-gradient(90deg,#3b82f6,#8b5cf6)">
         <a href="${esc(linkSeguro(botao.link))}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-weight:600;font-size:16px;text-decoration:none;font-family:Arial,sans-serif">${esc(botao.texto)}</a>
       </td></tr></table>`
    : "";
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(titulo)}</title></head>
<body style="margin:0;padding:0;background:#05070d">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#05070d;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#0b0f1a;border:1px solid #1e2533;border-radius:20px;overflow:hidden;font-family:Arial,Helvetica,sans-serif">
  <tr><td style="height:4px;background:#3b82f6;background-image:linear-gradient(90deg,#22d3ee,#3b82f6,#a855f7)"></td></tr>
  <tr><td style="padding:28px 32px 8px">
    <img src="${SITE_URL}/images/logo.png" width="44" height="34" alt="" style="vertical-align:middle;border:0">
    <span style="vertical-align:middle;margin-left:10px;color:#ffffff;font-size:20px;font-weight:700">OneMore<span style="color:#60a5fa">Code</span></span>
  </td></tr>
  <tr><td style="padding:16px 32px 28px">
    <h1 style="margin:0 0 20px;color:#ffffff;font-size:24px;line-height:1.3">${esc(titulo)}</h1>
    ${ps}${btn}
    ${nota ? `<p style="margin:20px 0 0;color:#64748b;font-size:13px;line-height:1.5">${nota}</p>` : ""}
  </td></tr>
  <tr><td style="padding:20px 32px;border-top:1px solid #1e2533;color:#64748b;font-size:13px;line-height:1.6">
    <strong style="color:#cbd5e1">OneMoreCode</strong> · Desenvolvimento Digital<br>
    Tecnologia pensada para o seu negócio.<br>
    <a href="${SITE_URL}" style="color:#60a5fa;text-decoration:none">onemorecode.tech</a> · Erechim/RS
  </td></tr>
</table></td></tr></table></body></html>`;
}

function textoSimples({ titulo, paragrafosTexto, botao }) {
  return [titulo, "", ...paragrafosTexto, botao ? `\n${botao.texto}: ${linkSeguro(botao.link)}` : "", "",
    "OneMoreCode · Desenvolvimento Digital", "Tecnologia pensada para o seu negócio.", SITE_URL].join("\n");
}

// Monta HTML + texto a partir de parágrafos em texto puro (já escapados aqui)
export function montar({ assunto, titulo, paragrafos, botao, nota }) {
  return {
    assunto,
    html: layout({ titulo, paragrafos: paragrafos.map((p) => esc(p).replace(/\n/g, "<br>")), botao, nota: nota && esc(nota) }),
    texto: textoSimples({ titulo, paragrafosTexto: paragrafos, botao }),
  };
}

// ── Resposta automática do formulário de contato ──
export function respostaContato({ nome }) {
  const primeiro = String(nome || "").trim().split(/\s+/)[0] || "";
  return montar({
    assunto: "Recebemos seu contato | OneMoreCode",
    titulo: primeiro ? `Olá, ${primeiro}!` : "Olá!",
    paragrafos: [
      "Obrigado por entrar em contato com a OneMoreCode!",
      "Recebemos sua mensagem com sucesso e vamos analisá-la com atenção.",
      "Em breve, entraremos em contato para conversar sobre sua ideia, esclarecer suas dúvidas e encontrar a melhor solução digital para o seu projeto.",
      "Enquanto isso, fique à vontade para conhecer nossos serviços e soluções.",
      "Atenciosamente,\nOneMoreCode\nVictor Pavoni - Desenvolvedor Web",
    ],
    botao: { texto: "Conhecer a OneMoreCode", link: "/" },
    nota: "Você recebeu este e-mail porque enviou uma mensagem pelo formulário de contato do site onemorecode.tech.",
  });
}
