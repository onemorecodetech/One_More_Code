export default function About() {
  return (
    <section id="about" className="py-16 md:py-24 px-6 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 sm:p-10 md:gap-12 items-center">
        <div>
          <p className="text-blue-400 text-sm uppercase tracking-widest mb-4">
            Sobre a empresa
          </p>

         <h2 className="text-3xl md:text-5xl font-bold mb-6 text-balance">
            Tecnologia com visão corporativa
          </h2>

          <p className="text-white/70 leading-relaxed mb-4">
            A OneMoreCode nasceu com o propósito de transformar ideias em soluções
            digitais modernas, funcionais e escaláveis.
          </p>

          <p className="text-white/70 leading-relaxed mb-4">
            Trabalhamos com foco em performance, identidade visual, experiência do usuário
            e resultados reais para empresas que desejam crescer através da tecnologia.
          </p>

          <p className="text-white/70 leading-relaxed">
            Nosso objetivo é criar projetos que não sejam apenas bonitos, mas que
            realmente ajudem negócios a vender mais, organizar melhor seus processos
            e fortalecer sua presença digital.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 sm:p-10">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Missão</h3>
              <p className="text-white/70">
                Desenvolver soluções digitais que impulsionem empresas com inovação e eficiência.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Visão</h3>
              <p className="text-white/70">
                Ser referência em tecnologia corporativa moderna e acessível.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Valores</h3>
              <p className="text-white/70">
                Inovação, qualidade, clareza, compromisso e evolução constante.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}