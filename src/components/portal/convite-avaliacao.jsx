import { GOOGLE_AVALIACOES } from "@/lib/links";
import { GoogleIcon, Estrelas } from "../google-reviews";

// Aparece para o cliente depois que um contrato tem a assinatura confirmada
export default function ConviteAvaliacao({ compacto = false }) {
  return (
    <section className="rounded-3xl border border-amber-400/25 bg-gradient-to-br from-amber-400/10 to-transparent p-6 md:p-8">
      <div className={`flex ${compacto ? "flex-col" : "flex-col md:flex-row md:items-center"} gap-6 justify-between`}>
        <div className="flex gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white">
            <GoogleIcon className="h-7 w-7" />
          </span>
          <div>
            <Estrelas className="h-4 w-4" />
            <h2 className="font-bold text-lg mt-1">Contrato confirmado. Obrigado pela confiança!</h2>
            <p className="text-sm text-white/70 mt-1">
              Se puder, deixe uma avaliação da OneMoreCode no Google. Leva menos de um minuto e
              ajuda muito outras empresas a nos conhecerem.
            </p>
          </div>
        </div>
        <a
          href={GOOGLE_AVALIACOES}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center min-h-12 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#0B0F1A] font-semibold transition"
        >
          Avaliar no Google ↗
        </a>
      </div>
    </section>
  );
}
