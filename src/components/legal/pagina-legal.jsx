import Link from "next/link";
import Navbar from "../navbar";
import Footer from "../footer";
import { ATUALIZACAO_LEGAL } from "../../lib/empresa";

const LINKS = [
  ["/privacidade", "Política de Privacidade"], ["/termos", "Termos de Serviço"],
  ["/cookies", "Aviso de Cookies"], ["/reembolso", "Política de Reembolso"],
];

// Modelo das páginas legais: leitura confortável e navegação entre os documentos
export default function PaginaLegal({ titulo, resumo, atual, children }) {
  return (
    <main className="text-white min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 px-6 py-16">
        <article className="mx-auto max-w-3xl">
          <p className="text-blue-400 text-sm uppercase tracking-widest mb-4">Documentos legais</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{titulo}</h1>
          <p className="text-white/60 text-sm mb-6">Última atualização: {ATUALIZACAO_LEGAL}</p>
          {resumo && <p className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/80 leading-relaxed mb-10">{resumo}</p>}
          <div className="legal space-y-4 text-white/80 leading-relaxed">{children}</div>
          <nav aria-label="Outros documentos legais" className="mt-14 border-t border-white/10 pt-6">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {LINKS.filter(([h]) => h !== atual).map(([h, n]) => <li key={h}><Link href={h} className="text-blue-300 underline underline-offset-4 hover:text-white">{n}</Link></li>)}
            </ul>
          </nav>
        </article>
      </div>
      <Footer />
    </main>
  );
}
