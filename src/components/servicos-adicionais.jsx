"use client";

import { useState } from "react";

const adicionais = [
  {
    title: "Criação de logotipo",
    description:
      "Ainda não tem uma marca? A gente cria um logotipo com a cara do seu negócio, pronto pra usar no site, nas redes e onde mais você precisar.",
  },
  {
    title: "Design em geral",
    description:
      "Identidade visual, artes pras redes sociais e outras peças que o seu negócio precisar, tudo combinando com o seu site.",
  },
];

// Caixinha que abre com a setinha e mostra os serviços adicionais
export default function ServicosAdicionais() {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-controls="servicos-adicionais"
        className="flex w-full items-center justify-between gap-4 rounded-2xl p-6 md:p-8 text-left transition hover:bg-white/[0.03]"
      >
        <span>
          <span className="block text-2xl font-semibold">Serviços adicionais</span>
          <span className="block mt-1 text-white/60">Logotipo, design e outras ajudas pra sua marca.</span>
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`h-7 w-7 shrink-0 text-blue-400 transition-transform duration-300 ${aberto ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div
        id="servicos-adicionais"
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${aberto ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden" inert={aberto ? undefined : ""}>
          <div className="px-6 pb-6 md:px-8 md:pb-8">
            <div className="grid gap-4 md:grid-cols-2">
              {adicionais.map((s) => (
                <div key={s.title} className="rounded-xl border border-white/10 bg-[#0B0F1A]/60 p-6">
                  <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                  <p className="text-white/70 leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 rounded-xl border border-blue-400/30 bg-blue-500/10 p-5 text-white/80 leading-relaxed">
              <strong className="text-white">Não sabe por onde começar?</strong> Tranquilo. Se você ainda não tem
              ideias prontas, a gente parte do que você já tem, como cores, fotos ou algum material antigo, e cria
              a partir disso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
