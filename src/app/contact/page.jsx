import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

export default function ContactPage() {
  return (
    <main className="bg-[#0B0F1A] text-white min-h-screen">
      <Navbar />

      <section className="px-8 py-20">
        <h1 className="text-4xl font-bold">Contato</h1>
        <p className="mt-4 text-lg text-white/80 max-w-2xl">
          Entre em contato com a OneMoreCode para criar seu site,
          sistema ou automação.
        </p>

        <div className="mt-8 space-y-3 text-white/80">
          <p>Email: contato@onemorecode.tech</p>
          <p>Instagram: @onemorecode.tech</p>
        </div>
      </section>

      <Footer />
    </main>
  );
}