export default function About() {
  return (
    <section id="about" className="py-24 px-6 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-blue-400 text-sm uppercase tracking-widest mb-4">
            Sobre
          </p>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Conheça a OneMoreCode
          </h2>
          <p className="text-white/70 leading-relaxed mb-4">
            A OneMoreCode nasceu em Erechim com um propósito claro: ajudar empresas
            a terem uma presença digital à altura do trabalho que realizam.
          </p>
          <p className="text-white/70 leading-relaxed mb-4">
            Acreditamos que uma boa solução digital não precisa ser complicada. Ela
            precisa funcionar bem, ter um visual cuidadoso e gerar resultados reais
            para quem a contrata.
          </p>
          <p className="text-white/70 leading-relaxed">
            Por isso, trabalhamos próximos de cada cliente: explicamos cada etapa com
            clareza, compartilhamos o andamento do projeto e só entregamos quando
            tudo está como deve ser.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-linear-to-br from-blue-500/10 to-purple-500/10 p-10">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Missão</h3>
              <p className="text-white/70">
                Ajudar empresas a crescer com tecnologia que funciona no dia a dia.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Visão</h3>
              <p className="text-white/70">
                Ser referência em desenvolvimento de sites e sistemas na região.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Valores</h3>
              <p className="text-white/70">
                Transparência, comprometimento, qualidade e melhoria contínua.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
