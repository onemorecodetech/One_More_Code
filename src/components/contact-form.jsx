"use client";

import { useState } from "react";

const inputClass =
  "w-full rounded-xl bg-[#0B0F1A] border border-white/10 px-4 py-3.5 text-white placeholder:text-white/30 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 disabled:opacity-60";

export default function ContactForm() {
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "e3920951-c234-4390-b36c-25ffe82a2f6b";
    if (!accessKey) {
      setStatus("error");
      setFeedback(
        "O formulário ainda não está configurado. Escreva para contato@onemorecode.tech."
      );
      return;
    }

    setStatus("sending");
    setFeedback("");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `Novo contato pelo site: ${data.get("name")}`,
          from_name: "Site OneMoreCode",
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
          botcheck: data.get("botcheck"),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Falha no envio");
      }

      form.reset();
      setStatus("success");
      setFeedback("Mensagem enviada. Respondemos em até 1 dia útil.");
    } catch {
      setStatus("error");
      setFeedback(
        "Não foi possível enviar agora. Tente de novo ou escreva para contato@onemorecode.tech."
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
          placeholder="Conte um pouco sobre o seu projeto..."
          disabled={sending}
          className={`${inputClass} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={sending}
        className="inline-flex w-full items-center justify-center min-h-14 px-8 rounded-xl bg-blue-500 hover:bg-blue-600 text-base md:text-lg font-semibold shadow-lg shadow-blue-500/20 transition disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
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
    </form>
  );
}
