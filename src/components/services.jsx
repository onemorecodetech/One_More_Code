import ServicosAdicionais from "./servicos-adicionais";

const services = [
  {
    title: "Sites",
    description:
      "Sites institucionais e landing pages modernos, rápidos e preparados para serem encontrados no Google, com ótima experiência em qualquer dispositivo, especialmente no celular.",
  },
  {
    title: "Sistemas sob medida",
    description:
      "Sistemas desenvolvidos para a rotina da sua empresa, como agendamentos, pedidos, cadastro de clientes e painéis para você atualizar o conteúdo com autonomia.",
  },
  {
    title: "Automações",
    description:
      "Automatizamos tarefas repetitivas e integramos ferramentas, para que você e sua equipe ganhem tempo e possam se concentrar no que realmente importa.",
  },
  {
    title: "Aplicativos",
    description:
      "Aplicativos intuitivos que aproximam o seu serviço dos clientes, com uma experiência simples e agradável de usar.",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-blue-400 text-sm uppercase tracking-widest mb-4">
          Serviços
        </p>
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          O que fazemos
        </h2>
        <p className="text-white/70 max-w-2xl mb-14">
          Cada projeto começa com uma conversa. Primeiro entendemos como o seu
          negócio funciona e quais são as suas necessidades; só então definimos a
          melhor solução para você.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-8 hover:border-blue-400/50 transition"
            >
              <h3 className="text-2xl font-semibold mb-4">{service.title}</h3>
              <p className="text-white/70 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        <ServicosAdicionais />
      </div>
    </section>
  );
}
