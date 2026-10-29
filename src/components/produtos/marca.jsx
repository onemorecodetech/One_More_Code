// Marca em texto do produto (troque por <Image> com a logo oficial quando ela estiver em /public/images/produtos/)
export default function MarcaProduto({ produto, grande = false }) {
  const meio = produto.nome.replace(/^OneMore/, "");
  return (
    <span className={`font-bold tracking-tight ${grande ? "text-4xl md:text-6xl" : "text-2xl"}`}>
      <span className="text-white">OneMore</span><span className={produto.cor.destaque}>{meio}</span>
    </span>
  );
}
