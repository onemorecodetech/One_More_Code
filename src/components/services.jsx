const services = [
  {
    title: "Desenvolvimento de Sites",
    description:
      "Sites institucionais, landing pages e páginas profissionais com design moderno e foco em conversão.",
  },
  {
    title: "Sistemas Personalizados",
    description:
      "Soluções sob medida para automatizar operações, organizar processos e melhorar a produtividade.",
  },
  {
    title: "Automações",
    description:
      "Integrações e automações para reduzir tarefas repetitivas e aumentar a eficiência da empresa.",
  },
  {
    title: "Aplicativos",
    description:
      "Desenvolvimento de aplicativos e soluções mobile para levar sua empresa a outro nível.",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-blue-400 text-sm uppercase tracking-widest mb-4">
          Nossos serviços
        </p>

        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          Soluções que conectam tecnologia e resultado
        </h2>

        <p className="text-white/70 max-w-2xl mb-14">
          A OneMoreCode oferece serviços digitais pensados para empresas que
          desejam modernizar sua presença online, automatizar processos e crescer
          com tecnologia.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-white/5 p-8 hover:border-blue-400/50 transition"
            >
              <h3 className="text-2xl font-semibold mb-4">{service.title}</h3>
              <p className="text-white/70 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
       </div>
       
    </section>
    
  );
}