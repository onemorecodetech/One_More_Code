import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import SecaoProdutos from "../../components/produtos/secao-produtos";

export const metadata = {
  title: "Produtos | OneMoreCode",
  description: "Sistemas próprios da OneMoreCode: OneMoreFlow, gestão empresarial para pequenas empresas.",
  alternates: { canonical: "/produtos" },
};

export default function ProdutosPage() {
  return (
    <main className="text-white min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-center"><div className="w-full"><SecaoProdutos /></div></div>
      <Footer />
    </main>
  );
}
