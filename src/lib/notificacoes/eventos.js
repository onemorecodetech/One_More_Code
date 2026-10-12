// Catálogo de eventos da plataforma.
// Cada evento diz quem é avisado (admin e/ou cliente), o texto do aviso no site
// e se também vai por e-mail. Para um módulo novo, basta acrescentar eventos aqui.
//
// modulo: "ativo"  → já disparado pelo site hoje
//         "futuro" → pronto para quando o módulo existir (projetos, hospedagem etc.)

export const CATEGORIAS = {
  cadastro: { nome: "Cadastro", essencial: true },
  contato: { nome: "Contato", essencial: true },
  propostas: { nome: "Propostas", essencial: false },
  contratos: { nome: "Contratos", essencial: true },
  projetos: { nome: "Projetos", essencial: false },
  hospedagem: { nome: "Hospedagem e mensalidades", essencial: true },
  manutencao: { nome: "Manutenção", essencial: false },
  dominios: { nome: "Domínios", essencial: true },
  reunioes: { nome: "Reuniões", essencial: false },
  orcamentos: { nome: "Orçamentos", essencial: false },
};

const doc = (d) => `${d.tipoDoc === "contrato" ? "o contrato" : "a proposta"} ${d.codigo}`;
const Doc = (d) => `${d.tipoDoc === "contrato" ? "Contrato" : "Proposta"} ${d.codigo}`;
const linkDocCliente = (d) => `/cliente/propostas/${d.id}`;

export const EVENTOS = {
  // ── Ativos ─────────────────────────────────────────────
  "contato.recebido": {
    modulo: "ativo", categoria: "contato",
    admin: { titulo: (d) => `Nova mensagem de ${d.nome}`, mensagem: (d) => `${d.email} enviou uma mensagem pelo formulário do site.`, link: () => "/admin/notificacoes", email: false },
  },
  "cliente.cadastrado": {
    modulo: "ativo", categoria: "cadastro",
    admin: { titulo: (d) => `Novo cadastro: ${d.nome}`, mensagem: (d) => `${d.nome} (${d.email}) criou uma conta na área do cliente.`, link: () => "/admin", email: true },
    cliente: {
      titulo: () => "Boas-vindas à área do cliente",
      mensagem: () => "Sua conta foi criada. Aqui você vai ver, assinar e acompanhar as propostas e contratos da OneMoreCode.",
      link: () => "/cliente", email: true,
      emailTexto: (d) => ({
        assunto: "Sua conta na OneMoreCode foi criada",
        titulo: `Boas-vindas, ${d.primeiroNome}!`,
        paragrafos: [
          "Sua conta na área do cliente da OneMoreCode foi criada com sucesso.",
          "É por lá que você vai receber, ler e assinar as propostas e os contratos do seu projeto, e acompanhar cada etapa.",
          "Assim que tivermos um documento para você, avisamos por aqui e no site.",
        ],
        botao: { texto: "Acessar a área do cliente", link: "/cliente" },
      }),
    },
  },
  "documento.disponivel": {
    modulo: "ativo", categoria: "propostas", categoriaPor: (d) => (d.tipoDoc === "contrato" ? "contratos" : "propostas"),
    cliente: {
      titulo: (d) => `${Doc(d)} disponível`,
      mensagem: (d) => `${d.titulo}. Abra para ler e assinar pelo gov.br.`,
      link: linkDocCliente, email: true,
      emailTexto: (d) => ({
        assunto: `${Doc(d)} disponível para você | OneMoreCode`,
        titulo: `${Doc(d)} disponível`,
        paragrafos: [
          `Olá, ${d.primeiroNome}!`,
          `Disponibilizamos ${doc(d)} (${d.titulo}) na sua área do cliente.`,
          "Por lá você lê o documento completo e faz a assinatura gratuita pelo gov.br.",
        ],
        botao: { texto: "Ver documento", link: linkDocCliente(d) },
      }),
    },
  },
  "documento.visualizado": {
    modulo: "ativo", categoriaPor: (d) => (d.tipoDoc === "contrato" ? "contratos" : "propostas"),
    admin: { titulo: (d) => `${Doc(d)} visualizad${d.tipoDoc === "contrato" ? "o" : "a"}`, mensagem: (d) => `${d.nomeCliente} abriu ${doc(d)} pela primeira vez.`, link: () => "/admin", email: false },
  },
  "documento.assinatura_enviada": {
    modulo: "ativo", categoriaPor: (d) => (d.tipoDoc === "contrato" ? "contratos" : "propostas"),
    admin: {
      titulo: (d) => `${Doc(d)} assinad${d.tipoDoc === "contrato" ? "o" : "a"} pelo cliente`,
      mensagem: (d) => `${d.nomeCliente} enviou ${doc(d)} assinad${d.tipoDoc === "contrato" ? "o" : "a"}. Confira a assinatura no ITI e confirme no painel.`,
      link: () => "/admin", email: true,
      emailTexto: (d) => ({
        assunto: `${Doc(d)} assinad${d.tipoDoc === "contrato" ? "o" : "a"} por ${d.nomeCliente}`,
        titulo: "Documento assinado aguardando conferência",
        paragrafos: [`${d.nomeCliente} enviou ${doc(d)} (${d.titulo}) assinad${d.tipoDoc === "contrato" ? "o" : "a"} pelo gov.br.`, "Baixe o PDF no painel, valide no ITI e confirme a assinatura."],
        botao: { texto: "Abrir painel", link: "/admin" },
      }),
    },
    cliente: { titulo: (d) => `Recebemos ${doc(d)} assinad${d.tipoDoc === "contrato" ? "o" : "a"}`, mensagem: () => "Estamos conferindo a assinatura. Avisamos assim que for confirmada.", link: linkDocCliente, email: false },
  },
  "documento.assinatura_confirmada": {
    modulo: "ativo", categoriaPor: (d) => (d.tipoDoc === "contrato" ? "contratos" : "propostas"),
    cliente: {
      titulo: (d) => `Assinatura confirmada: ${Doc(d)}`,
      mensagem: () => "A assinatura foi conferida e confirmada pela OneMoreCode.",
      link: linkDocCliente, email: true,
      emailTexto: (d) => ({
        assunto: `Assinatura confirmada: ${Doc(d)} | OneMoreCode`,
        titulo: "Assinatura confirmada",
        paragrafos: [`Olá, ${d.primeiroNome}!`, `Conferimos e confirmamos a assinatura ${d.tipoDoc === "contrato" ? "do contrato" : "da proposta"} ${d.codigo} (${d.titulo}).`, "Obrigado pela confiança. Os próximos passos seguem pela área do cliente e pelo WhatsApp."],
        botao: { texto: "Ver na área do cliente", link: linkDocCliente(d) },
      }),
    },
    admin: { titulo: (d) => `${Doc(d)} confirmad${d.tipoDoc === "contrato" ? "o" : "a"}`, mensagem: (d) => `Você confirmou a assinatura de ${d.nomeCliente}.`, link: () => "/admin", email: false },
  },
  "documento.novo_envio_solicitado": {
    modulo: "ativo", categoriaPor: (d) => (d.tipoDoc === "contrato" ? "contratos" : "propostas"),
    cliente: {
      titulo: (d) => `Precisamos de um novo envio: ${Doc(d)}`,
      mensagem: () => "Houve um problema na conferência da assinatura. Envie novamente o PDF assinado.",
      link: linkDocCliente, email: true,
      emailTexto: (d) => ({
        assunto: `Novo envio necessário: ${Doc(d)} | OneMoreCode`,
        titulo: "Precisamos de um novo envio",
        paragrafos: [`Olá, ${d.primeiroNome}!`, `Na conferência de ${doc(d)}, não conseguimos validar a assinatura.`, "Por favor, assine novamente pelo gov.br e envie o PDF pela área do cliente. Se tiver dúvidas, fale com a gente pelo WhatsApp."],
        botao: { texto: "Enviar novamente", link: linkDocCliente(d) },
      }),
    },
  },
  "documento.cancelado": {
    modulo: "ativo", categoriaPor: (d) => (d.tipoDoc === "contrato" ? "contratos" : "propostas"),
    cliente: { titulo: (d) => `${Doc(d)} cancelad${d.tipoDoc === "contrato" ? "o" : "a"}`, mensagem: () => "Este documento foi cancelado e não precisa mais ser assinado.", link: linkDocCliente, email: false },
  },
  "documento.reaberto": {
    modulo: "ativo", categoriaPor: (d) => (d.tipoDoc === "contrato" ? "contratos" : "propostas"),
    cliente: { titulo: (d) => `${Doc(d)} reabert${d.tipoDoc === "contrato" ? "o" : "a"}`, mensagem: () => "O documento está disponível novamente para assinatura.", link: linkDocCliente, email: true,
      emailTexto: (d) => ({ assunto: `${Doc(d)} disponível novamente | OneMoreCode`, titulo: `${Doc(d)} disponível novamente`, paragrafos: [`Olá, ${d.primeiroNome}!`, `${Doc(d)} (${d.titulo}) foi reaberto para assinatura.`], botao: { texto: "Ver documento", link: linkDocCliente(d) } }) },
  },

  // ── Futuros (prontos para os próximos módulos; nada dispara hoje) ──
  "projeto.criado": { modulo: "futuro", categoria: "projetos" },
  "projeto.etapa_atualizada": { modulo: "futuro", categoria: "projetos" },
  "projeto.aprovacao_solicitada": { modulo: "futuro", categoria: "projetos" },
  "projeto.ajustes_solicitados": { modulo: "futuro", categoria: "projetos" },
  "projeto.concluido": { modulo: "futuro", categoria: "projetos" },
  "projeto.publicado": { modulo: "futuro", categoria: "projetos" },
  "hospedagem.ativada": { modulo: "futuro", categoria: "hospedagem" },
  "hospedagem.fim_gratuidade_proximo": { modulo: "futuro", categoria: "hospedagem" },
  "mensalidade.vencendo": { modulo: "futuro", categoria: "hospedagem" },
  "mensalidade.vencida": { modulo: "futuro", categoria: "hospedagem" },
  "mensalidade.paga": { modulo: "futuro", categoria: "hospedagem" },
  "plano.valor_alterado": { modulo: "futuro", categoria: "hospedagem" }, // só Plano Completo
  "manutencao.solicitada": { modulo: "futuro", categoria: "manutencao" },
  "manutencao.orcamento_disponivel": { modulo: "futuro", categoria: "manutencao" },
  "manutencao.concluida": { modulo: "futuro", categoria: "manutencao" },
  "dominio.vinculado": { modulo: "futuro", categoria: "dominios" },
  "dominio.expirando": { modulo: "futuro", categoria: "dominios" }, // lembretes 60, 30 e 7 dias
  "dominio.renovado": { modulo: "futuro", categoria: "dominios" },
  "orcamento.recebido": { modulo: "futuro", categoria: "orcamentos" },
  "orcamento.informacoes_solicitadas": { modulo: "futuro", categoria: "orcamentos" },
  "reuniao.solicitada": { modulo: "futuro", categoria: "reunioes" },
  "reuniao.confirmada": { modulo: "futuro", categoria: "reunioes" },
  "reuniao.lembrete": { modulo: "futuro", categoria: "reunioes" }, // 24h e 1h antes (America/Sao_Paulo)
  "reuniao.cancelada": { modulo: "futuro", categoria: "reunioes" },
};
