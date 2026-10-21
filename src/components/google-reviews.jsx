import { GOOGLE_AVALIACOES } from "@/lib/links";

export function GoogleIcon({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export function Estrelas({ className = "h-5 w-5" }) {
  return (
    <span className="flex gap-1 text-amber-400" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
        </svg>
      ))}
    </span>
  );
}

// Seção da página inicial: leva ao perfil da OneMoreCode no Google
export default function GoogleReviews() {
  return (
    <section id="avaliacoes" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 md:p-12">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative grid md:grid-cols-[1fr_auto] gap-10 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white">
                  <GoogleIcon className="h-7 w-7" />
                </span>
                <div>
                  <p className="font-semibold">Google</p>
                  <p className="text-sm text-white/60">Perfil da empresa e avaliações</p>
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Avaliações dos nossos clientes
              </h2>
              <p className="text-white/70 max-w-2xl leading-relaxed">
                Confira no Google as avaliações de quem já desenvolveu um projeto conosco.
                Se você já é cliente, sua avaliação nos ajuda a chegar a mais empresas.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3">
              <a
                href={GOOGLE_AVALIACOES}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-14 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold shadow-lg shadow-blue-500/20 transition"
              >
                Ver avaliações no Google ↗
              </a>
              <a
                href={GOOGLE_AVALIACOES}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-14 px-8 rounded-xl border border-white/15 hover:border-amber-400 hover:text-amber-300 font-semibold transition"
              >
                Deixar uma avaliação
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
