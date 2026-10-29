import Link from "next/link";
import Image from "next/image";
import { PRODUTOS } from "../../lib/produtos";
import MarcaProduto from "./marca";
import SeloStatus from "./selo";

// Seção "Produtos" da página inicial
export default function SecaoProdutos() {
  return (
    <section id="produtos" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-blue-400 text-sm uppercase tracking-widest mb-4">Produtos</p>
        <h2 className="text-3xl md:text-5xl font-bold mb-6">Sistemas da OneMoreCode</h2>
        <p className="text-white/70 max-w-2xl mb-14">
          Além de projetos sob medida, desenvolvemos sistemas próprios para a rotina de pequenas empresas.
        </p>
        <div className="grid gap-6">
          {PRODUTOS.map((p) => (
            <article key={p.slug} className={`grid items-center gap-8 overflow-hidden rounded-3xl border ${p.cor.borda} bg-linear-to-br ${p.cor.de} ${p.cor.para} p-6 md:p-10 lg:grid-cols-[1fr_1.15fr]`}>
              <div>
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <SeloStatus status={p.status} />
                  {p.previsao && <span className="text-sm text-white/80">Previsão de lançamento: <strong className="text-white">{p.previsao}</strong></span>}
                </div>
                <MarcaProduto produto={p} />
                <p className="mt-2 mb-4 text-sm uppercase tracking-widest text-white/70">{p.categoria}</p>
                <p className="text-white/80 leading-relaxed mb-8">{p.resumo}</p>
                <Link href={`/produtos/${p.slug}`} className="inline-flex min-h-12 items-center rounded-xl bg-blue-600 px-6 font-semibold text-white transition hover:bg-blue-700">
                  Conhecer o {p.nome}
                </Link>
              </div>
              {p.imagem && (
                <Link href={`/produtos/${p.slug}`} className="block overflow-hidden rounded-2xl border border-white/10" tabIndex={-1} aria-hidden="true">
                  <Image src={p.imagem.src} alt="" width={1200} height={750} className="h-auto w-full" sizes="(max-width: 1024px) 100vw, 600px" />
                </Link>
              )}
            </article>
          ))}
        </div>
        <p className="mt-6 text-xs text-white/60">Imagens com dados fictícios. Funções e condições podem mudar até o lançamento.</p>
      </div>
    </section>
  );
}
