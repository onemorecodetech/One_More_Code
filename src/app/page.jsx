import Navbar from "../components/navbar";
import Hero from "../components/hero";
import Services from "../components/services";
import About from "../components/about";
import Portifolio from "../components/portifolio";
import GoogleReviews from "../components/google-reviews";
import Contact from "../components/contact";
import Footer from "../components/footer";

export default function Home() {
  return (
    <main className="text-white min-h-screen">
      <Navbar />
      <Hero />
      <Services />
      <About />
      <Portifolio />
      <GoogleReviews />
      <Contact />
      <Footer />
    </main>
  );
}
