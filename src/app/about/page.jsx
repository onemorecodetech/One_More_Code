import Navbar from "../../components/navbar";
import About from "../../components/about";
import Footer from "../../components/footer";

export const metadata = {
  title: "Sobre | OneMoreCode",
  description: "Conheça a OneMoreCode, de Erechim/RS, e a forma como trabalhamos com cada cliente.",
};

export default function Pagina() {
  return (
    <main className="text-white min-h-screen flex flex-col">
      <Navbar />
      {/* O conteúdo ocupa o espaço livre: o rodapé fica sempre no fim da tela */}
      <div className="flex flex-1 items-center">
        <div className="w-full">
          <About />
        </div>
      </div>
      <Footer />
    </main>
  );
}
