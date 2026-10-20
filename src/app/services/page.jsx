import Navbar from "../../components/navbar";
import Services from "../../components/services";
import Footer from "../../components/footer";

export const metadata = {
  title: "Serviços | OneMoreCode",
  description: "Sites, sistemas, aplicativos, automações e serviços de design feitos sob medida pela OneMoreCode.",
};

export default function Pagina() {
  return (
    <main className="text-white min-h-screen flex flex-col">
      <Navbar />
      {/* O conteúdo ocupa o espaço livre: o rodapé fica sempre no fim da tela */}
      <div className="flex flex-1 items-center">
        <div className="w-full">
          <Services />
        </div>
      </div>
      <Footer />
    </main>
  );
}
