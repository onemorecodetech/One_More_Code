import Navbar from "../components/navbar";
import Hero from "../components/hero";
import Services from "../components/services";
import About from "../components/about";
import Portifolio from "../components/portifolio";
import Contact from "../components/contact";
import Footer from "../components/footer";
import Image from "next/image";

export default function Home() {
  return (
    <main className="bg-[#0B0F1A] text-white min-h-screen">

      <Navbar />

      <section className="flex flex-col items-center justify-center px-6 py-10 md:py-12">
        <Image
          src="/images/Logo_onemorecode.jpeg"
          alt="Logo OneMoreCode"
          width={200}
          height={200}
           priority
          className="w-40 h-auto md:w-[200px]"
        />
        <p className="text-base md:text-lg mt-4 text-center max-w-xl">
          Ideias transformadas em tecnologia para impulsionar negócios.
        </p>
      </section>

      <Hero />
      <Services />
      <About />
      <Portifolio />
      <Contact />
      <Footer />

    </main>
  );
}