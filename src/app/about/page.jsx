import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
 

export default function AboutPage() {
  return (
    <main className="bg-[#0B0F1A] text-white min-h-screen">
      <Navbar />

      <section className="max-w-6xl mx-auto px-6 py-14 md:py-20">
        <h1 className="text-3xl md:text-4xl font-bold">Sobre a OneMoreCode</h1>
        <p className="mt-4 text-base md:text-lg text-white/80 max-w-2xl">
          A OneMoreCode é uma empresa de tecnologia focada em transformar
          ideias em soluções digitais para impulsionar negócios.
        </p>
      </section>
        
      <Footer />
    </main>
  );
}