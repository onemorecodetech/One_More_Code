// Envio de e-mails pelo Resend (SDK oficial).
// No computador, sem RESEND_API_KEY, os e-mails são "simulados": ficam salvos em
// data/emails-simulados.json para conferência, sem enviar nada de verdade.
import fs from "fs";
import path from "path";

export const REMETENTE = process.env.EMAIL_REMETENTE || "OneMoreCode <contato@onemorecode.tech>";
export const EMAIL_ADMIN = process.env.CONTACT_NOTIFICATION_EMAIL || "onemorecode233@gmail.com";
export const SITE_URL = (process.env.SITE_URL || "https://onemorecode.tech").replace(/\/$/, "");

export async function enviarEmail({ para, assunto, html, texto, idempotencia, responderPara }) {
  const local = !process.env.VERCEL;
  if (local && process.env.EMAIL_SIMULAR_FALHA === "1") throw new Error("Falha simulada do Resend (teste)");

  if (!process.env.RESEND_API_KEY) {
    if (!local) throw new Error("RESEND_API_KEY não configurada na Vercel.");
    const arq = path.join(process.cwd(), "data", "emails-simulados.json");
    let lista = [];
    try { lista = JSON.parse(fs.readFileSync(arq, "utf-8")); } catch {}
    const id = `simulado-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    if (idempotencia && lista.some((e) => e.idempotencia === idempotencia)) return { id: "duplicado-ignorado", simulado: true };
    lista.unshift({ id, para, assunto, texto, idempotencia, em: new Date().toISOString() });
    fs.mkdirSync(path.dirname(arq), { recursive: true });
    fs.writeFileSync(arq, JSON.stringify(lista.slice(0, 200), null, 2));
    return { id, simulado: true };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send(
    { from: REMETENTE, to: [para], subject: assunto, html, text: texto, ...(responderPara && { replyTo: responderPara }) },
    idempotencia ? { idempotencyKey: idempotencia.slice(0, 256) } : undefined
  );
  if (error) throw new Error(`Resend: ${error.name || ""} ${error.message || ""}`.trim());
  return { id: data?.id };
}
