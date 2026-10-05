import ContactForm from "./contact-form";

export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        <div>
          <p className="text-blue-400 text-sm uppercase tracking-widest mb-4">
            Contato
          </p>

          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Vamos tirar sua ideia do papel?
          </h2>

          <p className="text-white/70 leading-relaxed mb-8">
            Entre em contato com a OneMoreCode para desenvolver seu site, sistema,
            aplicativo ou automação. Vamos construir algo moderno e estratégico
            para o seu negócio.
          </p>

          <div className="space-y-4 text-white/80">
            <p>
              <strong>Email:</strong>{" "}
              <a
                href="mailto:contato@onemorecode.tech"
                className="hover:text-blue-400 transition"
              >
                contato@onemorecode.tech
              </a>
            </p>
            <p>
              <strong>Instagram:</strong>{" "}
              <a
                href="https://instagram.com/onemorecode.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition"
              >
                @onemorecode.tech
              </a>
            </p>
            <p>
              <strong>Atendimento:</strong> Online
            </p>
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
