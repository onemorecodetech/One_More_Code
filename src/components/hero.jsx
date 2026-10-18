export default function Hero() {
  return (
    <section
      id="hero"
      className="min-h-[90vh] flex items-center justify-center px-6 py-16"
    >
      <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-blue-400 text-sm uppercase tracking-widest mb-4">
            OneMoreCode · Erechim/RS
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Sua ideia, transformada em uma solução digital que funciona.
          </h1>
          <p className="text-white/70 text-lg mt-6 max-w-xl">
            Desenvolvemos sites, sistemas, aplicativos e automações sob medida
            para o seu negócio. Você nos conta o que precisa, e nós cuidamos de
            toda a parte técnica, do planejamento à publicação.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href="#contact"
              className="inline-flex items-center justify-center min-h-14 px-8 rounded-xl bg-blue-500 hover:bg-blue-600 text-base md:text-lg font-semibold shadow-lg shadow-blue-500/20 transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
            >
              Solicitar orçamento
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center min-h-14 px-8 rounded-xl border border-white/20 hover:border-blue-400 hover:text-blue-400 text-base md:text-lg font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
            >
              Conhecer os serviços
            </a>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md h-[350px] rounded-3xl bg-linear-to-br from-blue-500/20 to-purple-500/20 border border-white/10 shadow-2xl flex items-center justify-center">
            <div className="text-center px-6">
              <p className="text-3xl font-bold">
                <span className="text-white">OneMore</span>
                <span className="text-blue-400">Code</span>
              </p>
              <p className="text-white/60 mt-3">
                Do primeiro esboço ao site no ar, com atenção a cada detalhe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
