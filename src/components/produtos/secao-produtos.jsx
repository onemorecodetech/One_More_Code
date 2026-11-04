"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PRODUTOS } from "../../lib/produtos";
import MarcaProduto from "./marca";
import SeloStatus from "./selo";

const INTERVALO = 6000; // mesmo tempo do carrossel do portfólio

function Seta({ direcao, onClick }) {
  const prox = direcao === "next";
  return (
    <button type="button" onClick={onClick} aria-label={prox ? "Próximo produto" : "Produto anterior"}
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#0B0F1A]/80 text-white backdrop-blur transition hover:border-blue-400 hover:bg-blue-600 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
        {prox ? <path d="M9 5l7 7-7 7" /> : <path d="M15 5l-7 7 7 7" />}
      </svg>
    </button>
  );
}

// Seção "Produtos" da página inicial: carrossel com passagem automática, igual ao portfólio
export default function SecaoProdutos() {
  const total = PRODUTOS.length; const varios = total > 1;
  const [atual, setAtual] = useState(0);
  const [pausadoUsuario, setPausadoUsuario] = useState(false);
  const [interagindo, setInteragindo] = useState(false);
  const [visivel, setVisivel] = useState(false);
  const [reduzMovimento, setReduzMovimento] = useState(false);
  const secao = useRef(null); const toque = useRef(null);

  useEffect(() => {
    setReduzMovimento(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = secao.current; if (!el || !("IntersectionObserver" in window)) return;
    const o = new IntersectionObserver(([e]) => setVisivel(e.isIntersecting), { threshold: 0.35 });
    o.observe(el); return () => o.disconnect();
  }, []);

  const rodando = varios && visivel && !pausadoUsuario && !interagindo && !reduzMovimento;
  useEffect(() => {
    if (!rodando) return;
    const t = setTimeout(() => { if (document.visibilityState === "visible") setAtual((c) => (c + 1) % total); }, INTERVALO);
    return () => clearTimeout(t);
  }, [rodando, atual, total]);

  const ir = (i) => setAtual((i + total) % total);
  const teclado = (e) => { if (e.key === "ArrowRight") ir(atual + 1); if (e.key === "ArrowLeft") ir(atual - 1); };

  return (
    <>
      <style>{`@keyframes progresso-produtos { from { width: 0% } to { width: 100% } }`}</style>
      <section id="produtos" ref={secao} className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-blue-400 text-sm uppercase tracking-widest mb-4">Produtos</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Sistemas da OneMoreCode</h2>
          <p className="text-white/70 max-w-2xl mb-14">Além de projetos sob medida, desenvolvemos sistemas próprios para a rotina de pequenas empresas.</p>

          <div className="relative flex items-center gap-4">
            {varios && <div className="hidden md:block"><Seta direcao="prev" onClick={() => ir(atual - 1)} /></div>}
            <div
              className="min-w-0 flex-1 overflow-hidden rounded-3xl"
              role="region" aria-roledescription="carrossel" aria-label="Produtos da OneMoreCode" tabIndex={0}
              onKeyDown={teclado}
              onMouseEnter={() => setInteragindo(true)} onMouseLeave={() => setInteragindo(false)}
              onFocus={() => setInteragindo(true)} onBlur={() => setInteragindo(false)}
              onTouchStart={(e) => { setInteragindo(true); toque.current = e.touches[0].clientX; }}
              onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - (toque.current ?? 0); if (Math.abs(dx) > 50) ir(atual + (dx < 0 ? 1 : -1)); setTimeout(() => setInteragindo(false), 4000); }}
            >
              <div className="flex transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none" style={{ transform: `translateX(-${atual * 100}%)` }}>
                {PRODUTOS.map((p, i) => (
                  <article key={p.slug} aria-roledescription="slide" aria-label={`${i + 1} de ${total}: ${p.nome}`} aria-hidden={i !== atual}
                    className={`grid w-full shrink-0 items-center gap-8 rounded-3xl border ${p.cor.borda} bg-linear-to-br ${p.cor.de} ${p.cor.para} p-6 md:p-10 lg:grid-cols-[1fr_1.15fr]`}>
                    <div>
                      <div className="mb-5 flex flex-wrap items-center gap-3">
                        <SeloStatus status={p.status} />
                        {p.previsao && <span className="text-sm text-white/80">Previsão de lançamento: <strong className="text-white">{p.previsao}</strong></span>}
                      </div>
                      <MarcaProduto produto={p} />
                      <p className="mt-2 mb-4 text-sm uppercase tracking-widest text-white/70">{p.categoria}</p>
                      <p className="text-white/80 leading-relaxed mb-8">{p.resumo}</p>
                      <Link href={`/produtos/${p.slug}`} tabIndex={i === atual ? 0 : -1} className="inline-flex min-h-12 items-center rounded-xl bg-blue-600 px-6 font-semibold text-white transition hover:bg-blue-700">Conhecer o {p.nome}</Link>
                    </div>
                    {p.imagem && (
                      <Link href={`/produtos/${p.slug}`} className="block overflow-hidden rounded-2xl border border-white/10" tabIndex={-1} aria-hidden="true">
                        <Image src={p.imagem.src} alt="" width={1200} height={750} className="h-auto w-full" sizes="(max-width: 1024px) 100vw, 600px" priority={i === 0} />
                      </Link>
                    )}
                  </article>
                ))}
              </div>
            </div>
            {varios && <div className="hidden md:block"><Seta direcao="next" onClick={() => ir(atual + 1)} /></div>}
          </div>

          {varios && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="md:hidden"><Seta direcao="prev" onClick={() => ir(atual - 1)} /></div>
              <div className="flex items-center gap-2">
                {PRODUTOS.map((p, i) => (
                  <button key={p.slug} type="button" onClick={() => ir(i)} aria-label={`Ver produto ${i + 1}: ${p.nome}`} aria-current={i === atual ? "true" : undefined}
                    className={`relative h-2.5 overflow-hidden rounded-full transition-all duration-300 ${i === atual ? "w-10 bg-white/25" : "w-2.5 bg-white/25 hover:bg-white/50"}`}>
                    {i === atual && <span key={`${atual}-${rodando}`} className="absolute inset-y-0 left-0 rounded-full bg-blue-500" style={{ width: rodando ? undefined : "100%", animation: rodando ? `progresso-produtos ${INTERVALO}ms linear forwards` : "none" }} />}
                  </button>
                ))}
              </div>
              <div className="md:hidden"><Seta direcao="next" onClick={() => ir(atual + 1)} /></div>
              <button type="button" onClick={() => setPausadoUsuario((v) => !v)} aria-label={pausadoUsuario ? "Retomar passagem automática" : "Pausar passagem automática"}
                className="ml-2 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-blue-400 hover:text-white">
                {pausadoUsuario
                  ? <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                  : <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>}
              </button>
            </div>
          )}
          <p className="mt-6 text-xs text-white/60">Imagens com dados fictícios. Funções e condições podem mudar até o lançamento.</p>
        </div>
      </section>
    </>
  );
}
