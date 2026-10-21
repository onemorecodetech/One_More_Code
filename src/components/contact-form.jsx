"use client";

import { useRef, useState } from "react";
import Link from "next/link";

const inputClass =
  "w-full rounded-xl bg-[#0B0F1A] border border-white/10 px-4 py-3.5 text-white placeholder:text-white/30 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 disabled:opacity-60";

// Faz uma requisição com limite de tempo
async function comTempo(url, opcoes, ms = 12000) {
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), ms);
  try {
    return await fetch(url, { ...opcoes, signal: controle.signal });
  } finally {
    clearTimeout(timer);
  }
}

export default function ContactForm() {
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [feedback, setFeedback] = useState("");
  // Identificador do envio: o mesmo em novas tentativas da mesma mensagem (evita duplicidade)
  const idEnvio = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const nome = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const mensagem = String(data.get("message") || "").trim();
    const botcheck = data.get("botcheck") ? "on" : "";
    if (!idEnvio.current) idEnvio.current = crypto.randomUUID();

    const accessKey =
      process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "e3920951-c234-4390-b36c-25ffe82a2f6b";

    setStatus("sending");
    setFeedback("");

    // 1) Web3Forms (pelo navegador, como exige o plano gratuito)
    let web3forms = "incerto";
    try {
      const response = await comTempo("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `Novo contato pelo site: ${nome}`,
          from_name: "Site OneMoreCode",
          name: nome,
          email,
          message: mensagem,
          botcheck,
        }),
      });
      const result = await response.json().catch(() => ({}));
      web3forms = response.ok && result.success ? "ok" : "falhou";
    } catch {
      web3forms = "incerto"; // sem resposta: não dá para saber se chegou
    }

    // 2) Nosso servidor: resposta automática, aviso no painel e reserva pelo Resend
    let servidorOk = false;
    let erroServidor = "";
    try {
      const r = await comTempo("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, mensagem, botcheck, web3forms, idEnvio: idEnvio.current }),
      });
      servidorOk = r.ok;
      if (!r.ok) erroServidor = (await r.json().catch(() => ({}))).erro || "";
    } catch {}

    if (web3forms === "ok" || servidorOk) {
      form.reset();
      idEnvio.current = null;
      setStatus("success");
      setFeedback("Mensagem enviada! Em breve entraremos em contato.");
    } else {
      setStatus("error");
      setFeedback(
        erroServidor ||
          "Não foi possível enviar agora. Tente de novo em instantes ou chame no WhatsApp."
      );
    }
  }

  const sending = status === "sending";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 md:p-10 space-y-6 [&>div:last-child:empty]:hidden"
    >
      {/* Campo invisível contra spam (bots preenchem, pessoas não) */}
      <input
        type="checkbox"
        name="botcheck"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div>
        <label htmlFor="name" className="block mb-2 text-sm font-medium text-white/70">
          Nome
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={100}
          autoComplete="name"
          placeholder="Seu nome"
          disabled={sending}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="email" className="block mb-2 text-sm font-medium text-white/70">
          Email
        </label>
        <input
          id="email"
          name="email"
          maxLength={160}
          type="email"
          required
          autoComplete="email"
          placeholder="seuemail@exemplo.com"
          disabled={sending}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="message" className="block mb-2 text-sm font-medium text-white/70">
          Mensagem
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          minLength={10}
          maxLength={4000}
          placeholder="Conte um pouco sobre o seu projeto..."
          disabled={sending}
          className={`${inputClass} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={sending}
        className="inline-flex w-full items-center justify-center min-h-14 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-base md:text-lg font-semibold shadow-lg shadow-blue-500/20 transition disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
      >
        {sending ? "Enviando..." : "Enviar mensagem"}
      </button>

      <div role="status" aria-live="polite">
        {feedback && (
          <p
            className={`text-sm ${
              status === "success" ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {feedback}
          </p>
        )}
      </div>
          <p className="text-xs text-white/60">
        Usamos seus dados apenas para responder a este contato, conforme a{" "}
        <Link href="/privacidade" className="text-blue-300 underline underline-offset-2">Política de Privacidade</Link>.
        Não envie documentos ou dados sensíveis por aqui.
      </p>
    </form>
  );
}
