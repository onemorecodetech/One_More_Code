export default function Hero() {
  return (
    <section
      id="hero"
      className="min-h-[90vh] flex items-center justify-center px-6"
    >
      <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-blue-400 text-sm uppercase tracking-widest mb-4">
            Tecnologia corporativa
          </p>

          <h2 className="text-4xl md:text-6xl font-bold leading-tight">
            Ideias transformadas em tecnologia para impulsionar negócios.
          </h2>

          <p className="text-white/70 text-lg mt-6 max-w-xl">
            Criamos sites, sistemas personalizados, aplicativos e automações
            para empresas que querem crescer com inovação, performance e presença digital.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#contact"
              className="bg-blue-500 hover:bg-blue-600 transition px-6 py-3 rounded-lg font-medium"
            >
              Solicitar orçamento
            </a>

            <a
              href="#services"
              className="border border-white/20 hover:border-blue-400 hover:text-blue-400 transition px-6 py-3 rounded-lg font-medium"
            >
              Ver serviços
            </a>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md h-[350px] rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 shadow-2xl flex items-center justify-center">
            <div className="text-center px-6">
              <h3 className="text-3xl font-bold">
                <span className="text-white">OneMore</span>
                <span className="text-blue-400">Code</span>
              </h3>
              <p className="text-white/60 mt-3">
                Soluções digitais modernas para empresas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}