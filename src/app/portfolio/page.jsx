import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

export default function PortfolioPage() {
  return (
    <main className="text-white min-h-screen">
      <Navbar />

      <section className="px-8 py-20">
        <h1 className="text-4xl font-bold">Portfólio</h1>
        <p className="mt-4 text-lg text-white/80 max-w-2xl">
          Aqui ficarão os projetos, sites, sistemas e soluções desenvolvidas
          pela OneMoreCode.
        </p>
      </section>

      <Footer />
    </main>
  );
}