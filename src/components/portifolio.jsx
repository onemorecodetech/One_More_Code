import Image from "next/image";

// Para adicionar um novo case, copie um objeto desta lista e preencha.
const projects = [
  {
    title: "Studio Alessandra",
    category: "Site + painel administrativo",
    description:
      "Site para uma nail designer com serviços, valores e horários que a própria cliente atualiza por um painel administrativo. Inclui agendamento direto pelo WhatsApp, indicador de aberto ou fechado em tempo real e SEO para buscas locais.",
    image: "/images/portfolio/studio-alessandra.jpg",
    url: "https://www.studioalenails.com.br",
    tags: ["Node.js", "Express", "Vercel", "Redis", "Painel admin", "SEO"],
  },
];

function BrowserFrame({ src, alt, url }) {
  const host = url.replace(/^https?:\/\//, "");
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0B0F1A] shadow-2xl shadow-black/40">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-white/15" />
        <span className="h-3 w-3 rounded-full bg-white/15" />
        <span className="h-3 w-3 rounded-full bg-white/15" />
        <span className="ml-3 truncate rounded-md bg-white/5 px-3 py-1 text-xs text-white/50">
          {host}
        </span>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 560px, 100vw"
          className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </div>
    </div>
  );
}

export default function Portfolio() {
  return (
    <section id="portfolio" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-blue-400 text-sm uppercase tracking-widest mb-4">
          Portfólio
        </p>

        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          Projetos entregues
        </h2>

        <p className="text-white/70 max-w-2xl mb-14">
          Cada projeto é pensado para o negócio do cliente: visual com
          identidade própria, autonomia para atualizar o conteúdo e estrutura
          para ser encontrado no Google.
        </p>

        <div className="space-y-8">
          {projects.map((project) => (
            <article
              key={project.title}
              className="group grid lg:grid-cols-2 gap-10 items-center rounded-3xl border border-white/10 bg-white/5 p-6 md:p-10 transition hover:border-blue-400/40"
            >
              <BrowserFrame
                src={project.image}
                alt={`Página inicial do site ${project.title}`}
                url={project.url}
              />

              <div>
                <p className="text-sm text-blue-400 mb-3">{project.category}</p>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  {project.title}
                </h3>
                <p className="text-white/70 leading-relaxed mb-6">
                  {project.description}
                </p>

                <ul className="flex flex-wrap gap-2 mb-8">
                  {project.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/70"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>

                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center min-h-14 px-8 rounded-xl bg-blue-500 hover:bg-blue-600 text-base font-semibold shadow-lg shadow-blue-500/20 transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
                >
                  Ver site no ar ↗
                </a>
              </div>
            </article>
          ))}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-3xl border border-dashed border-white/15 p-6 md:p-10">
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">
                Seu projeto pode ser o próximo
              </h3>
              <p className="text-white/70">
                Sites, sistemas, aplicativos e automações sob medida.
              </p>
            </div>
            <a
              href="/#contact"
              className="inline-flex shrink-0 items-center justify-center min-h-14 px-8 rounded-xl border border-white/20 hover:border-blue-400 hover:text-blue-400 text-base font-semibold transition"
            >
              Solicitar orçamento
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
