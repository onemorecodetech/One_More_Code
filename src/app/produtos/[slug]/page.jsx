import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, Clock } from "lucide-react";
import Navbar from "../../../components/navbar";
import Footer from "../../../components/footer";
import MarcaProduto from "../../../components/produtos/marca";
import SeloStatus from "../../../components/produtos/selo";
import { PRODUTOS, produtoPorSlug } from "../../../lib/produtos";
import { EMPRESA } from "../../../lib/empresa";

export function generateStaticParams() {
  return PRODUTOS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const p = produtoPorSlug((await params).slug);
  if (!p) return { title: "Produto não encontrado | OneMoreCode" };
  return { title: `${p.nome} · ${p.categoria} | OneMoreCode`, description: p.resumo, alternates: { canonical: `/produtos/${p.slug}` } };
}

export default async function ProdutoPage({ params }) {
  const p = produtoPorSlug((await params).slug);
  if (!p) notFound();
  const whats = `${EMPRESA.whatsappLink}?text=${encodeURIComponent(p.mensagemWhats)}`;
  const demo = `${EMPRESA.whatsappLink}?text=${encodeURIComponent(p.mensagemDemo || p.mensagemWhats)}`;
  return (
    <main className="text-white min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <Link href="/produtos" className="text-sm text-white/70 hover:text-white">← Todos os produtos</Link>
          <section className={`mt-8 rounded-3xl border ${p.cor.borda} bg-linear-to-br ${p.cor.de} ${p.cor.para} p-8 md:p-12`}>
            <div className="mb-6 flex flex-wrap items-center gap-4"><SeloStatus status={p.status} />{p.previsao && <span className="text-sm text-white/85">Previsão de lançamento: <strong className="text-white">{p.previsao}</strong></span>}<span className="text-sm text-white/70">Uma solução OneMoreCode</span></div>
            <h1><MarcaProduto produto={p} grande /><span className="sr-only"> · {p.categoria}</span></h1>
            <p className="mt-3 text-lg uppercase tracking-widest text-white/70">{p.categoria}</p>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/80">{p.descricao}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a href={demo} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-14 items-center justify-center rounded-xl bg-blue-600 px-8 font-semibold text-white transition hover:bg-blue-700">Agendar uma demonstração</a>
              <a href={whats} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-14 items-center justify-center rounded-xl border border-white/20 px-8 font-semibold transition hover:border-blue-400 hover:text-blue-300">Tirar dúvidas no WhatsApp</a>
            </div>
          </section>

          {p.imagem && (
            <figure className="mt-10 overflow-hidden rounded-3xl border border-white/10">
              <Image src={p.imagem.src} alt={p.imagem.alt} width={1200} height={750} priority className="h-auto w-full" sizes="(max-width: 1024px) 100vw, 1024px" />
            </figure>
          )}

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h2 className="text-xl font-bold mb-3">Para quem é</h2>
              <p className="text-white/80 leading-relaxed">{p.paraQuem}</p>
            </section>
            <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h2 className="text-xl font-bold mb-4">Funções</h2>
              {p.desenvolvidas?.length > 0 && (
                <>
                  <h3 className="mb-2 text-sm uppercase tracking-widest text-emerald-300">Já desenvolvidas · em testes finais</h3>
                  <ul className="mb-6 space-y-2">{p.desenvolvidas.map((f) => <li key={f} className="flex gap-3 text-white/85"><Check size={18} className="mt-0.5 shrink-0 text-emerald-300" aria-hidden="true" />{f}</li>)}</ul>
                </>
              )}
              <h3 className="mb-2 text-sm uppercase tracking-widest text-amber-200">Previstas</h3>
              <ul className="space-y-2">{p.previstas.map((f) => <li key={f} className="flex gap-3 text-white/80"><Clock size={18} className="mt-0.5 shrink-0 text-amber-200" aria-hidden="true" />{f}</li>)}</ul>
              <p className="mt-6 text-xs text-white/60">Funções previstas podem mudar até o lançamento.</p>
            </section>
          </div>

          {p.galeria?.length > 0 && (
            <section className="mt-10">
              <h2 className="text-2xl font-bold mb-6">Algumas telas</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {p.galeria.map((g) => (
                  <figure key={g.src} className="overflow-hidden rounded-2xl border border-white/10">
                    <Image src={g.src} alt={g.alt} width={1200} height={750} className="h-auto w-full" sizes="(max-width: 768px) 100vw, 500px" />
                    <figcaption className="bg-white/5 px-4 py-3 text-sm text-white/70">{g.alt.replace(" do OneMoreFlow", "")}</figcaption>
                  </figure>
                ))}
              </div>
              <p className="mt-4 text-xs text-white/60">Imagens com dados fictícios de demonstração.</p>
            </section>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
