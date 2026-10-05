import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

export default function ServicesPage() {
  return (
    <main className="bg-[#0B0F1A] text-white min-h-screen">
      <Navbar />

      <section className="px-8 py-20">
        <h1 className="text-4xl font-bold">Serviços</h1>
        <p className="mt-4 text-lg text-white/80 max-w-2xl">
          A OneMoreCode desenvolve sites, sistemas personalizados,
          automações, aplicativos e soluções digitais para empresas.
        </p>
      </section>
    
      <Footer />
    </main>
  );
}