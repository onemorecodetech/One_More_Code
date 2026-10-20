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
  {
    title: "Top Training Academia",
    category: "Site + painel administrativo",
    description:
      "Site para uma academia de Erechim apresentar modalidades, planos e atletas, com identidade visual forte e painel administrativo para a equipe atualizar o conteúdo sem depender de ninguém.",
    image: "/images/portfolio/top-training-academia.jpg",
    url: null, // preencher com "https://..." quando o site estiver no ar
    dominio: "toptrainingacad.com.br",
    tags: ["Node.js", "Express", "Vercel", "Painel admin", "SEO local"],
  },
  {
    title: "Sistema de Comandas",
    category: "Sistema web + app mobile · Projeto acadêmico",
    description:
      "Sistema completo para restaurantes: o garçom lança os pedidos pelo aplicativo, a cozinha acompanha e atualiza o preparo em tempo real pela versão web, e a gerência controla salão, comandas e cardápio. API própria com autenticação e permissões por perfil.",
    image: "/images/portfolio/sistema-comandas.jpg",
    url: null,
    dominio: "sistema de comandas",
    tags: ["NestJS", "PostgreSQL", "Prisma", "Next.js", "Flutter", "API REST"],
  },
];

const INTERVALO = 6000; // tempo de cada projeto na tela (ms)

function BrowserFrame({ src, alt, url, dominio, priority }) {
  const host = url ? url.replace(/^https?:\/\//, "") : dominio || "prévia do projeto";
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
  const [pausadoPeloUsuario, setPausadoPeloUsuario] = useState(false);
  const [interagindo, setInteragindo] = useState(false);
  const [visivel, setVisivel] = useState(false);
  const touchStart = useRef(null);
  const secao = useRef(null);
  const reduzMovimento = useRef(false);

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

  // Só passa sozinho quando a seção está na tela
  useEffect(() => {
    reduzMovimento.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = secao.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const o = new IntersectionObserver(([e]) => setVisivel(e.isIntersecting), { threshold: 0.35 });
    o.observe(el);
    return () => o.disconnect();
  }, []);

  const rodando = hasMany && visivel && !pausadoPeloUsuario && !interagindo && !reduzMovimento.current;

  useEffect(() => {
    if (!rodando) return;
    const t = setTimeout(() => { if (document.visibilityState === "visible") setCurrent((c) => (c + 1) % total); }, INTERVALO);
    return () => clearTimeout(t);
  }, [rodando, current, total]);

  return (
    <>
    <style>{`@keyframes progresso-portfolio { from { width: 0% } to { width: 100% } }`}</style>
    <section id="portfolio" ref={secao} className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <p className="text-blue-400 text-sm uppercase tracking-widest mb-4">
              Portfólio
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Nossos projetos
            </h2>
            <p className="text-white/70 max-w-2xl">
              Cada negócio tem necessidades próprias, e cada projeto é desenvolvido
              para atendê-las. Conheça alguns dos trabalhos da OneMoreCode.
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
          onTouchStart={(e) => { setInteragindo(true); onTouchStart(e); }}
          onTouchEnd={(e) => { onTouchEnd(e); setTimeout(() => setInteragindo(false), 4000); }}
          onMouseEnter={() => setInteragindo(true)}
          onMouseLeave={() => setInteragindo(false)}
          onFocus={() => setInteragindo(true)}
          onBlur={() => setInteragindo(false)}
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
                  dominio={project.dominio}
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

                  {project.url && <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center min-h-14 px-8 rounded-xl bg-blue-500 hover:bg-blue-600 text-base font-semibold shadow-lg shadow-blue-500/20 transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
                  >
                    Ver site no ar ↗
                  </a>}
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
                  className={`relative h-2.5 overflow-hidden rounded-full transition-all duration-300 ${
                    i === current ? "w-10 bg-white/25" : "w-2.5 bg-white/25 hover:bg-white/50"
                  }`}
                >
                  {i === current && (
                    <span
                      key={`${current}-${rodando}`}
                      className="absolute inset-y-0 left-0 rounded-full bg-blue-500"
                      style={{ width: rodando ? undefined : "100%", animation: rodando ? `progresso-portfolio ${INTERVALO}ms linear forwards` : "none" }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="md:hidden">
              <Arrow direction="next" onClick={next} />
            </div>

            <button
              type="button"
              onClick={() => setPausadoPeloUsuario((v) => !v)}
              aria-label={pausadoPeloUsuario ? "Retomar passagem automática" : "Pausar passagem automática"}
              className="ml-2 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-blue-400 hover:text-white"
            >
              {pausadoPeloUsuario ? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>
              )}
            </button>
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
    </>
  );
}
