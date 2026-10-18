"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

// ─────────────────────────────────────────────────────────────
// Para adicionar um novo case: copie um objeto desta lista,
// preencha e coloque a imagem em public/images/portfolio/.
// O primeiro da lista é o que aparece primeiro no carrossel.
// ─────────────────────────────────────────────────────────────
const projects = [
  {
    title: "Studio Alessandra",
    category: "Site + painel administrativo",
    description:
      "Site para uma nail designer apresentar seus serviços, valores e horários. A própria profissional atualiza o conteúdo por um painel administrativo simples, e as clientes agendam diretamente pelo aplicativo de agendamento. O site também indica, em tempo real, se o studio está aberto.",
    image: "/images/portfolio/studio-alessandra.jpg",
    url: "https://www.studioalenails.com.br",
    tags: ["Node.js", "Express", "Vercel", "Redis", "Painel admin", "SEO"],
  },
];

function BrowserFrame({ src, alt, url, priority }) {
  const host = url.replace(/^https?:\/\//, "");
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0B0F1A] shadow-2xl shadow-black/40">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-white/15" />
        <span className="h-3 w-3 rounded-full bg-white/15" />
        <span className="h-3 w-3 rounded-full bg-white/15" />
        <span className="ml-3 truncate rounded-md bg-white/5 px-3 py-1 text-xs text-white/50">
          {host}
        </span>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 560px, 100vw"
          className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </div>
    </div>
  );
}

function Arrow({ direction, onClick }) {
  const isNext = direction === "next";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isNext ? "Próximo projeto" : "Projeto anterior"}
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#0B0F1A]/80 text-white backdrop-blur transition hover:border-blue-400 hover:bg-blue-500 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
        {isNext ? <path d="M9 5l7 7-7 7" /> : <path d="M15 5l-7 7 7 7" />}
      </svg>
    </button>
  );
}

export default function Portfolio() {
  const total = projects.length;
  const hasMany = total > 1;
  const [current, setCurrent] = useState(0);
  const touchStart = useRef(null);

  const goTo = useCallback((i) => setCurrent((i + total) % total), [total]);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Setas do teclado quando o carrossel está em foco
  function onKeyDown(e) {
    if (!hasMany) return;
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  }

  // Arrastar com o dedo no celular
  function onTouchStart(e) {
    touchStart.current = e.touches[0].clientX;
  }
  function onTouchEnd(e) {
    if (!hasMany || touchStart.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(diff) > 50) (diff < 0 ? next : prev)();
    touchStart.current = null;
  }

  useEffect(() => {
    if (current >= total) setCurrent(0);
  }, [current, total]);

  return (
    <section id="portfolio" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <p className="text-blue-400 text-sm uppercase tracking-widest mb-4">
              Portfólio
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Projetos entregues
            </h2>
            <p className="text-white/70 max-w-2xl">
              Cada negócio tem necessidades próprias, e cada projeto é desenvolvido
              para atendê-las. Estes já estão no ar e fazem parte da rotina dos
              nossos clientes.
            </p>
          </div>

          {hasMany && (
            <div className="hidden md:flex items-center gap-3">
              <Arrow direction="prev" onClick={prev} />
              <Arrow direction="next" onClick={next} />
            </div>
          )}
        </div>

        <div
          role="region"
          aria-roledescription="carrossel"
          aria-label="Projetos do portfólio"
          tabIndex={hasMany ? 0 : -1}
          onKeyDown={onKeyDown}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="overflow-hidden rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
        >
          <div
            className="flex transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {projects.map((project, i) => (
              <article
                key={project.title}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} de ${total}: ${project.title}`}
                aria-hidden={i !== current}
                inert={i !== current ? "" : undefined}
                className="group w-full shrink-0 grid lg:grid-cols-2 gap-10 items-center rounded-3xl border border-white/10 bg-white/5 p-6 md:p-10"
              >
                <BrowserFrame
                  src={project.image}
                  alt={`Página inicial do site ${project.title}`}
                  url={project.url}
                  priority={i === 0}
                />

                <div>
                  <p className="text-sm text-blue-400 mb-3">{project.category}</p>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    {project.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed mb-6">
                    {project.description}
                  </p>

                  <ul className="flex flex-wrap gap-2 mb-8">
                    {project.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/70"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center min-h-14 px-8 rounded-xl bg-blue-500 hover:bg-blue-600 text-base font-semibold shadow-lg shadow-blue-500/20 transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
                  >
                    Ver site no ar ↗
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>

        {hasMany && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="md:hidden">
              <Arrow direction="prev" onClick={prev} />
            </div>

            <div className="flex items-center gap-2">
              {projects.map((project, i) => (
                <button
                  key={project.title}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Ver projeto ${i + 1}: ${project.title}`}
                  aria-current={i === current}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === current ? "w-8 bg-blue-500" : "w-2.5 bg-white/25 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>

            <div className="md:hidden">
              <Arrow direction="next" onClick={next} />
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-3xl border border-dashed border-white/15 p-6 md:p-10">
          <div>
            <h3 className="text-xl md:text-2xl font-bold mb-2">
              Seu projeto pode ser o próximo
            </h3>
            <p className="text-white/70">
              Conte sua ideia e prepararemos um orçamento sob medida.
            </p>
          </div>
          <a
            href="/#contact"
            className="inline-flex shrink-0 items-center justify-center min-h-14 px-8 rounded-xl border border-white/20 hover:border-blue-400 hover:text-blue-400 text-base font-semibold transition"
          >
            Solicitar orçamento
          </a>
        </div>
      </div>
    </section>
  );
}
