const projects = [
  {
    title: "Site Institucional Empresarial",
    description:
      "Projeto modelo de site moderno para empresas com foco em autoridade e captação de clientes.",
  },
  {
    title: "Sistema de Gestão Personalizado",
    description:
      "Exemplo de dashboard e sistema interno para organização de processos e produtividade.",
  },
  {
    title: "Automação de Atendimento",
    description:
      "Solução de automação para agilizar comunicação, tarefas e fluxos operacionais.",
  },
];

export default function Portfolio() {
  return (
    <section id="portfolio" className="py-16 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-blue-400 text-sm uppercase tracking-widest mb-4">
          Portfólio
        </p>

        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-balance">
          Projetos e soluções em destaque
        </h2>

        <p className="text-white/70 max-w-2xl mb-10 md:mb-14">
          Mesmo no início da marca, você já pode apresentar projetos modelo para
          demonstrar capacidade técnica, visão de design e qualidade de entrega.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 overflow-hidden bg-white/5 hover:border-blue-400/50 transition"
            >
              <div className="h-40 md:h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">{project.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}