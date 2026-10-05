export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
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
              <strong>Email:</strong> contato@onemorecode.tech
            </p>
            <p>
              <strong>Instagram:</strong> @onemorecode.tech
            </p>
            <p>
              <strong>Atendimento:</strong> Online
            </p>
          </div>
        </div>

        <form className="rounded-2xl border border-white/10 bg-white/5 p-8 space-y-5">
          <div>
            <label className="block mb-2 text-sm text-white/70">Nome</label>
            <input
              type="text"
              placeholder="Seu nome"
              className="w-full rounded-lg bg-[#111827] border border-white/10 px-4 py-3 outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-white/70">Email</label>
            <input
              type="email"
              placeholder="seuemail@exemplo.com"
              className="w-full rounded-lg bg-[#111827] border border-white/10 px-4 py-3 outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-white/70">Mensagem</label>
            <textarea
              rows={5}
              placeholder="Conte um pouco sobre o seu projeto..."
              className="w-full rounded-lg bg-[#111827] border border-white/10 px-4 py-3 outline-none focus:border-blue-400 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 transition px-6 py-3 rounded-lg font-medium"
          >
            Enviar mensagem
          </button>
        </form>
      </div>
    </section>
  );
}