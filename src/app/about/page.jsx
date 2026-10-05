import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
 

export default function AboutPage() {
  return (
    <main className="text-white min-h-screen">
      <Navbar />

      <section className="px-8 py-20">
        <h1 className="text-4xl font-bold">Sobre a OneMoreCode</h1>
        <p className="mt-4 text-lg text-white/80 max-w-2xl">
          A OneMoreCode é uma empresa de tecnologia focada em transformar
          ideias em soluções digitais para impulsionar negócios.
        </p>
      </section>
        
      <Footer />
    </main>
  );
}