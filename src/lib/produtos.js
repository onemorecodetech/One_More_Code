// Produtos da OneMoreCode.
// Nomes, textos, imagens e funções ficam SÓ aqui: menu, páginas e sitemap acompanham.
//
// status: "desenvolvimento" | "acesso-antecipado" | "disponivel"
// "desenvolvidas" = funções já feitas e em testes finais; "previstas" = planejadas.
// Mova itens de "previstas" para "desenvolvidas" só quando estiverem prontos de verdade.
// Para adicionar um produto, copie um bloco e ajuste.
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
  {
    slug: "onemorefit",
    nome: "OneMoreFit",
    categoria: "Gestão para academias e estúdios",
    status: "desenvolvimento",
    previsao: "fevereiro de 2027", // previsão, não prazo garantido
    resumo: "Sistema para academias e estúdios: alunos, planos, matrículas, mensalidades, presenças e financeiro em um só lugar, no computador e no celular.",
    descricao:
      "O OneMoreFit organiza a rotina da academia: cadastro de alunos, planos e matrículas, controle de mensalidades e inadimplência, registro de presenças e o financeiro do negócio, com indicadores em tempo real e relatórios prontos.",
    paraQuem: "Academias, estúdios de pilates, funcional, dança e lutas que querem controlar alunos e mensalidades sem planilhas.",
    desenvolvidas: [
      "Painel com indicadores em tempo real",
      "Cadastro de alunos",
      "Planos e matrículas, com aviso de término",
      "Mensalidades, cobranças vencidas e inadimplência",
      "Receitas, despesas e saldo do período",
      "Registro de presenças",
      "Relatórios de alunos, inadimplência, recebimentos, fluxo de caixa e frequência",
      "Equipe com acessos por convite",
      "Uso no celular",
    ],
    previstas: [
      "Integração com catraca",
      "Fichas de treino",
    ],
    imagem: { src: "/images/produtos/onemorefit.jpg", alt: "Painel do OneMoreFit no computador e no celular, com alunos ativos, cobranças vencidas e inadimplência" },
    galeria: [
      { src: "/images/produtos/onemorefit-alunos.jpg", alt: "Tela de alunos do OneMoreFit" },
      { src: "/images/produtos/onemorefit-mensalidades.jpg", alt: "Tela de mensalidades do OneMoreFit" },
      { src: "/images/produtos/onemorefit-relatorios.jpg", alt: "Tela de relatórios do OneMoreFit" },
    ],
    cor: { de: "from-rose-900/40", para: "to-red-950/20", destaque: "text-rose-300", borda: "border-rose-400/30" },
    mensagemWhats: "Olá! Quero saber mais sobre o OneMoreFit.",
    mensagemDemo: "Olá! Quero agendar uma demonstração do OneMoreFit.",
  },
  {
    slug: "onemoreclinic",
    nome: "OneMoreClinic",
    categoria: "Gestão para clínicas e consultórios",
    status: "desenvolvimento",
    previsao: "janeiro de 2027", // previsão, não prazo garantido
    resumo: "Sistema para clínicas e consultórios: agenda por profissional e sala, pacientes, equipe e financeiro, com módulos próprios para cada especialidade.",
    descricao:
      "O OneMoreClinic organiza a rotina da clínica: agenda por profissional e sala, confirmação e chegada dos pacientes, cadastro de pacientes e o financeiro, com painéis próprios para cada especialidade — estética, odontologia, nutrição e mais.",
    paraQuem: "Clínicas de estética, consultórios odontológicos, nutricionistas e clínicas médicas que querem agenda e atendimento organizados em um só lugar.",
    desenvolvidas: [
      "Agenda por profissional e sala, com visão do dia e da semana",
      "Confirmação, chegada, faltas e conclusão dos atendimentos",
      "Bloqueio de horários em conflito",
      "Cadastro de pacientes, com exportação",
      "Equipe e acessos por função",
      "Financeiro e relatórios",
      "Módulo de Estética, com pacotes e sessões",
      "Módulo de Odontologia, com cadeiras e retornos",
      "Módulo de Nutrição",
      "Uso no celular",
    ],
    previstas: [
      "Módulo de Clínica Médica (em finalização)",
      "Módulo de Fisioterapia",
      "Módulo de Psicologia",
    ],
    imagem: { src: "/images/produtos/onemoreclinic.jpg", alt: "Painel do OneMoreClinic no computador e no celular, com a agenda do dia e o próximo atendimento" },
    galeria: [
      { src: "/images/produtos/onemoreclinic-agenda.jpg", alt: "Agenda do OneMoreClinic" },
      { src: "/images/produtos/onemoreclinic-estetica.jpg", alt: "Painel de Estética do OneMoreClinic" },
      { src: "/images/produtos/onemoreclinic-odonto.jpg", alt: "Painel de Odontologia do OneMoreClinic" },
    ],
    cor: { de: "from-teal-800/40", para: "to-cyan-900/20", destaque: "text-teal-300", borda: "border-teal-400/30" },
    mensagemWhats: "Olá! Quero saber mais sobre o OneMoreClinic.",
    mensagemDemo: "Olá! Quero agendar uma demonstração do OneMoreClinic.",
  },
];

export const STATUS = {
  desenvolvimento: { rotulo: "Em desenvolvimento", classe: "bg-amber-400/15 text-amber-200 border-amber-300/30" },
  "acesso-antecipado": { rotulo: "Acesso antecipado", classe: "bg-blue-400/15 text-blue-200 border-blue-300/30" },
  disponivel: { rotulo: "Disponível", classe: "bg-emerald-400/15 text-emerald-200 border-emerald-300/30" },
};

export const produtoPorSlug = (slug) => PRODUTOS.find((p) => p.slug === slug) || null;
