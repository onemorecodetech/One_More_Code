import Navbar from "../../components/navbar";
import Contact from "../../components/contact";
import Footer from "../../components/footer";

export default function ContactPage() {
  return (
    <main className="text-white min-h-screen flex flex-col">
      <Navbar />
      {/* O conteúdo ocupa o espaço livre: o rodapé fica sempre no fim da tela */}
      <div className="flex flex-1 items-center">
        <div className="w-full">
          <Contact />
        </div>
      </div>
      <Footer />
    </main>
  );
}
