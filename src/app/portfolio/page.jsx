import Navbar from "../../components/navbar";
import Portfolio from "../../components/portifolio";
import Footer from "../../components/footer";

export const metadata = {
  title: "Portfólio | OneMoreCode",
  description: "Projetos de sites, sistemas e painéis administrativos desenvolvidos pela OneMoreCode.",
};

export default function PortfolioPage() {
  return (
    <main className="text-white min-h-screen">
      <Navbar />
      <Portfolio />
      <Footer />
    </main>
  );
}
