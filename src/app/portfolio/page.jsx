import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

export default function PortfolioPage() {
  return (
    <main className="bg-[#0B0F1A] text-white min-h-screen">
      <Navbar />

       <section className="max-w-6xl mx-auto px-6 py-14 md:py-20">
        <h1 className="text-3xl md:text-4xl font-bold">Portfólio</h1>
        <p className="mt-4 text-base md:text-lg text-white/80 max-w-2xl">
          Aqui ficarão os projetos, sites, sistemas e soluções desenvolvidas
          pela OneMoreCode.
        </p>
      </section>

      <Footer />
    </main>
  );
}