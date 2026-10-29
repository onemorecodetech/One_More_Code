// Produtos da OneMoreCode.
// Nomes, textos, imagens e funções ficam SÓ aqui: menu, páginas e sitemap acompanham.
//
// status: "desenvolvimento" | "acesso-antecipado" | "disponivel"
// "desenvolvidas" = funções já feitas e em testes finais; "previstas" = planejadas.
// Mova itens de "previstas" para "desenvolvidas" só quando estiverem prontos de verdade.
// Para adicionar o OneMoreFit no futuro, copie o bloco do OneMoreFlow e ajuste.
export const PRODUTOS = [
  {
    slug: "onemoreflow",
    nome: "OneMoreFlow",
    categoria: "Gestão empresarial",
    status: "desenvolvimento",
    previsao: "janeiro de 2027", // previsão, não prazo garantido
    resumo: "Sistema de gestão para pequenas empresas: vendas, financeiro, estoque e notas fiscais de serviço em um só lugar, no computador e no celular.",
    descricao:
      "O OneMoreFlow reúne a rotina da empresa em um só sistema: cadastros, orçamentos e pedidos, frente de caixa, compras, financeiro, estoque e emissão de nota fiscal de serviço pelo padrão nacional. Funciona no computador e no celular, para você emitir uma nota ou consultar o caixa de onde estiver.",
    paraQuem: "Pequenas empresas, prestadores de serviço e comércios que querem sair das planilhas e ter tudo organizado em um só lugar.",
    desenvolvidas: [
      "Cadastro de clientes, fornecedores e produtos",
      "Orçamentos e pedidos de venda",
      "Frente de caixa (PDV) com abertura e fechamento de caixa",
      "Pedidos de compra e entrada de notas, com importação de XML",
      "Contas a pagar e a receber, caixa e extrato",
      "Contratos recorrentes com faturamento mensal",
      "Controle de estoque",
      "Emissão de NFS-e pelo Emissor Nacional",
      "Relatórios gerenciais e financeiros",
      "Uso no celular",
    ],
    previstas: [
      "Nota fiscal de produtos (NF-e)",
      "Nota fiscal do consumidor (NFC-e) no caixa",
      "Ordens de serviço",
      "Manifesto e conhecimento de transporte (MDF-e e CT-e)",
    ],
    imagem: { src: "/images/produtos/onemoreflow.jpg", alt: "Painel do OneMoreFlow no computador e no celular, com vendas, recebimentos e contas em aberto" },
    galeria: [
      { src: "/images/produtos/onemoreflow-pedidos.jpg", alt: "Tela de pedidos de venda do OneMoreFlow" },
      { src: "/images/produtos/onemoreflow-receber.jpg", alt: "Tela de contas a receber do OneMoreFlow" },
    ],
    cor: { de: "from-blue-500/25", para: "to-cyan-400/10", destaque: "text-cyan-300", borda: "border-cyan-400/30" },
    mensagemWhats: "Olá! Quero saber mais sobre o OneMoreFlow.",
    mensagemDemo: "Olá! Quero agendar uma demonstração do OneMoreFlow.",
  },
];

export const STATUS = {
  desenvolvimento: { rotulo: "Em desenvolvimento", classe: "bg-amber-400/15 text-amber-200 border-amber-300/30" },
  "acesso-antecipado": { rotulo: "Acesso antecipado", classe: "bg-blue-400/15 text-blue-200 border-blue-300/30" },
  disponivel: { rotulo: "Disponível", classe: "bg-emerald-400/15 text-emerald-200 border-emerald-300/30" },
};

export const produtoPorSlug = (slug) => PRODUTOS.find((p) => p.slug === slug) || null;
